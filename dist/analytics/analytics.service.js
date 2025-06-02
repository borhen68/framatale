"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const analytics_event_schema_1 = require("./schemas/analytics-event.schema");
let AnalyticsService = class AnalyticsService {
    eventModel;
    constructor(eventModel) {
        this.eventModel = eventModel;
    }
    async trackEvent(request) {
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
    async getMetrics(startDate, endDate, filters) {
        const query = {
            timestamp: { $gte: startDate, $lte: endDate },
        };
        if (filters?.userId)
            query.userId = filters.userId;
        if (filters?.eventType)
            query.eventType = filters.eventType;
        if (filters?.category)
            query.category = filters.category;
        const totalEvents = await this.eventModel.countDocuments(query);
        const uniqueUsers = await this.eventModel.distinct('userId', query).then(users => users.filter(id => id != null).length);
        const revenueAgg = await this.eventModel.aggregate([
            { $match: { ...query, value: { $exists: true } } },
            { $group: { _id: null, totalRevenue: { $sum: '$value' } } },
        ]);
        const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
        const registrations = await this.eventModel.countDocuments({
            ...query,
            eventType: analytics_event_schema_1.EventType.USER_REGISTERED,
        });
        const orders = await this.eventModel.countDocuments({
            ...query,
            eventType: analytics_event_schema_1.EventType.ORDER_CREATED,
        });
        const conversionRate = registrations > 0 ? (orders / registrations) * 100 : 0;
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
        const userGrowth = await this.getUserGrowth(startDate, endDate);
        const revenueGrowth = await this.getRevenueGrowth(startDate, endDate);
        return {
            totalEvents,
            uniqueUsers,
            totalRevenue,
            conversionRate: Math.round(conversionRate * 100) / 100,
            averageSessionDuration: 0,
            topEvents,
            userGrowth,
            revenueGrowth,
        };
    }
    async getFunnelAnalysis(funnelSteps, startDate, endDate) {
        const results = [];
        let previousUsers = 0;
        for (let i = 0; i < funnelSteps.length; i++) {
            const step = funnelSteps[i];
            const users = await this.eventModel.distinct('userId', {
                eventType: step,
                timestamp: { $gte: startDate, $lte: endDate },
            }).then(userIds => userIds.filter(id => id != null).length);
            const conversionRate = i === 0 ? 100 : previousUsers > 0 ? (users / previousUsers) * 100 : 0;
            results.push({
                step: step,
                users,
                conversionRate: Math.round(conversionRate * 100) / 100,
            });
            previousUsers = users;
        }
        return results;
    }
    async getCohortAnalysis(startDate, endDate) {
        const cohorts = await this.eventModel.aggregate([
            {
                $match: {
                    eventType: analytics_event_schema_1.EventType.USER_REGISTERED,
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
    async getRetentionAnalysis(days = 30) {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
        const newUsers = await this.eventModel.distinct('userId', {
            eventType: analytics_event_schema_1.EventType.USER_REGISTERED,
            timestamp: { $gte: startDate, $lte: endDate },
        });
        const returningUsers = await this.eventModel.distinct('userId', {
            userId: { $in: newUsers },
            eventType: { $ne: analytics_event_schema_1.EventType.USER_REGISTERED },
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
    getEventCategory(eventType) {
        if (eventType.startsWith('USER_'))
            return analytics_event_schema_1.EventCategory.USER;
        if (eventType.startsWith('PROJECT_'))
            return analytics_event_schema_1.EventCategory.PROJECT;
        if (eventType.startsWith('IMAGE_'))
            return analytics_event_schema_1.EventCategory.MEDIA;
        if (eventType.startsWith('TEMPLATE_'))
            return analytics_event_schema_1.EventCategory.TEMPLATE;
        if (eventType.startsWith('EXPORT_'))
            return analytics_event_schema_1.EventCategory.EXPORT;
        if (eventType.startsWith('ORDER_'))
            return analytics_event_schema_1.EventCategory.ORDER;
        return analytics_event_schema_1.EventCategory.ENGAGEMENT;
    }
    parseUserAgent(userAgent) {
        if (!userAgent)
            return null;
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
            screenResolution: 'unknown',
        };
    }
    async getLocationFromIP(ipAddress) {
        return {
            country: 'Unknown',
            region: 'Unknown',
            city: 'Unknown',
            timezone: 'UTC',
        };
    }
    async getUserGrowth(startDate, endDate) {
        const dailyRegistrations = await this.eventModel.aggregate([
            {
                $match: {
                    eventType: analytics_event_schema_1.EventType.USER_REGISTERED,
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
    async getRevenueGrowth(startDate, endDate) {
        return this.eventModel.aggregate([
            {
                $match: {
                    eventType: analytics_event_schema_1.EventType.ORDER_PAID,
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
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(analytics_event_schema_1.AnalyticsEvent.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map