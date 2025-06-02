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
    topEvents: Array<{
        eventType: string;
        count: number;
    }>;
    userGrowth: Array<{
        date: string;
        newUsers: number;
        totalUsers: number;
    }>;
    revenueGrowth: Array<{
        date: string;
        revenue: number;
    }>;
}
export declare class AnalyticsService {
    private eventModel;
    constructor(eventModel: Model<AnalyticsEventDocument>);
    trackEvent(request: TrackEventRequest): Promise<AnalyticsEvent>;
    getMetrics(startDate: Date, endDate: Date, filters?: {
        userId?: string;
        eventType?: EventType;
        category?: EventCategory;
    }): Promise<AnalyticsMetrics>;
    getFunnelAnalysis(funnelSteps: EventType[], startDate: Date, endDate: Date): Promise<Array<{
        step: string;
        users: number;
        conversionRate: number;
    }>>;
    getCohortAnalysis(startDate: Date, endDate: Date): Promise<any>;
    getRetentionAnalysis(days?: number): Promise<any>;
    private getEventCategory;
    private parseUserAgent;
    private getLocationFromIP;
    private getUserGrowth;
    private getRevenueGrowth;
}
