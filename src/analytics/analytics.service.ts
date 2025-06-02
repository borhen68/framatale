import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnalyticsEvent, AnalyticsEventDocument, EventType, EventCategory } from './schemas/analytics-event.schema';

export interface TrackEventRequest {
  eventType: EventType;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  url?: string;
  value?: number;
  currency?: string;
  abTestVariant?: string;
}

export interface AnalyticsMetrics {
  totalEvents: number;
  uniqueUsers: number;
  totalRevenue: number;
  conversionRate: number;
  averageSessionDuration: number;
  topEvents: Array<{ eventType: string; count: number }>;
  userGrowth: Array<{ date: string; newUsers: number; totalUsers: number }>;
  revenueGrowth: Array<{ date: string; revenue: number }>;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(AnalyticsEvent.name) private eventModel: Model<AnalyticsEventDocument>,
  ) {}

  async trackEvent(request: TrackEventRequest): Promise<AnalyticsEvent> {
    const category = this.getEventCategory(request.eventType);

    const event = new this.eventModel({
      ...request,
      category,
      device: this.parseUserAgent(request.userAgent),
      location: await this.getLocationFromIP(request.ipAddress),
      timestamp: new Date(),
    });

    return event.save();
  }

  async getMetrics(
    startDate: Date,
    endDate: Date,
    filters?: {
      userId?: string;
      eventType?: EventType;
      category?: EventCategory;
    },
  ): Promise<AnalyticsMetrics> {
    const query: any = {
      timestamp: { $gte: startDate, $lte: endDate },
    };

    if (filters?.userId) query.userId = filters.userId;
    if (filters?.eventType) query.eventType = filters.eventType;
    if (filters?.category) query.category = filters.category;

    // Total events
    const totalEvents = await this.eventModel.countDocuments(query);

    // Unique users
    const uniqueUsers = await this.eventModel.distinct('userId', query).then(users =>
      users.filter(id => id != null).length
    );

    // Total revenue
    const revenueAgg = await this.eventModel.aggregate([
      { $match: { ...query, value: { $exists: true } } },
      { $group: { _id: null, totalRevenue: { $sum: '$value' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // Conversion rate (orders / registrations)
    const registrations = await this.eventModel.countDocuments({
      ...query,
      eventType: EventType.USER_REGISTERED,
    });
    const orders = await this.eventModel.countDocuments({
      ...query,
      eventType: EventType.ORDER_CREATED,
    });
    const conversionRate = registrations > 0 ? (orders / registrations) * 100 : 0;

    // Top events
    const topEventsAgg = await this.eventModel.aggregate([
      { $match: query },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const topEvents = topEventsAgg.map(item => ({
      eventType: item._id,
      count: item.count,
    }));

    // User growth (daily)
    const userGrowth = await this.getUserGrowth(startDate, endDate);

    // Revenue growth (daily)
    const revenueGrowth = await this.getRevenueGrowth(startDate, endDate);

    return {
      totalEvents,
      uniqueUsers,
      totalRevenue,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageSessionDuration: 0, // TODO: Implement session duration calculation
      topEvents,
      userGrowth,
      revenueGrowth,
    };
  }

  async getFunnelAnalysis(
    funnelSteps: EventType[],
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ step: string; users: number; conversionRate: number }>> {
    const results: Array<{ step: string; users: number; conversionRate: number }> = [];
    let previousUsers = 0;

    for (let i = 0; i < funnelSteps.length; i++) {
      const step = funnelSteps[i];
      const users = await this.eventModel.distinct('userId', {
        eventType: step,
        timestamp: { $gte: startDate, $lte: endDate },
      }).then(userIds => userIds.filter(id => id != null).length);

      const conversionRate = i === 0 ? 100 : previousUsers > 0 ? (users / previousUsers) * 100 : 0;

      results.push({
        step: step as string,
        users,
        conversionRate: Math.round(conversionRate * 100) / 100,
      });

      previousUsers = users;
    }

    return results;
  }

  async getCohortAnalysis(startDate: Date, endDate: Date): Promise<any> {
    // Simplified cohort analysis - group users by registration week
    const cohorts = await this.eventModel.aggregate([
      {
        $match: {
          eventType: EventType.USER_REGISTERED,
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            week: { $week: '$timestamp' },
            year: { $year: '$timestamp' },
          },
          users: { $addToSet: '$userId' },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]);

    return cohorts.map(cohort => ({
      period: `${cohort._id.year}-W${cohort._id.week}`,
      users: cohort.users.length,
    }));
  }

  async getRetentionAnalysis(days: number = 30): Promise<any> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Get users who registered in the period
    const newUsers = await this.eventModel.distinct('userId', {
      eventType: EventType.USER_REGISTERED,
      timestamp: { $gte: startDate, $lte: endDate },
    });

    // Check how many returned
    const returningUsers = await this.eventModel.distinct('userId', {
      userId: { $in: newUsers },
      eventType: { $ne: EventType.USER_REGISTERED },
      timestamp: { $gte: startDate, $lte: endDate },
    });

    const retentionRate = newUsers.length > 0 ? (returningUsers.length / newUsers.length) * 100 : 0;

    return {
      period: `${days} days`,
      newUsers: newUsers.length,
      returningUsers: returningUsers.length,
      retentionRate: Math.round(retentionRate * 100) / 100,
    };
  }

  private getEventCategory(eventType: EventType): EventCategory {
    if (eventType.startsWith('USER_')) return EventCategory.USER;
    if (eventType.startsWith('PROJECT_')) return EventCategory.PROJECT;
    if (eventType.startsWith('IMAGE_')) return EventCategory.MEDIA;
    if (eventType.startsWith('TEMPLATE_')) return EventCategory.TEMPLATE;
    if (eventType.startsWith('EXPORT_')) return EventCategory.EXPORT;
    if (eventType.startsWith('ORDER_')) return EventCategory.ORDER;
    return EventCategory.ENGAGEMENT;
  }

  private parseUserAgent(userAgent?: string): any {
    if (!userAgent) return null;

    // Simplified user agent parsing
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const browser = userAgent.includes('Chrome') ? 'Chrome' :
                   userAgent.includes('Firefox') ? 'Firefox' :
                   userAgent.includes('Safari') ? 'Safari' : 'Unknown';

    const os = userAgent.includes('Windows') ? 'Windows' :
               userAgent.includes('Mac') ? 'macOS' :
               userAgent.includes('Linux') ? 'Linux' :
               userAgent.includes('Android') ? 'Android' :
               userAgent.includes('iOS') ? 'iOS' : 'Unknown';

    return {
      type: isMobile ? 'mobile' : 'desktop',
      os,
      browser,
      isMobile,
      screenResolution: 'unknown', // Would need client-side data
    };
  }

  private async getLocationFromIP(ipAddress?: string): Promise<any> {
    // Placeholder for IP geolocation
    // In production, integrate with MaxMind GeoIP or similar service
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      timezone: 'UTC',
    };
  }

  private async getUserGrowth(startDate: Date, endDate: Date): Promise<any[]> {
    const dailyRegistrations = await this.eventModel.aggregate([
      {
        $match: {
          eventType: EventType.USER_REGISTERED,
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    let totalUsers = 0;
    return dailyRegistrations.map(day => {
      totalUsers += day.newUsers;
      return {
        date: day._id,
        newUsers: day.newUsers,
        totalUsers,
      };
    });
  }

  private async getRevenueGrowth(startDate: Date, endDate: Date): Promise<any[]> {
    return this.eventModel.aggregate([
      {
        $match: {
          eventType: EventType.ORDER_PAID,
          timestamp: { $gte: startDate, $lte: endDate },
          value: { $exists: true },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          revenue: { $sum: '$value' },
        },
      },
      { $sort: { _id: 1 } },
    ]).then(results => results.map(day => ({
      date: day._id,
      revenue: day.revenue,
    })));
  }
}
