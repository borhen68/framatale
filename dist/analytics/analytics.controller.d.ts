import { AnalyticsService, TrackEventRequest, AnalyticsMetrics } from './analytics.service';
import { AnalyticsEvent, EventType, EventCategory } from './schemas/analytics-event.schema';
export declare class AnalyticsController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    trackEvent(request: TrackEventRequest): Promise<AnalyticsEvent>;
    getMetrics(startDate: string, endDate: string, userId?: string, eventType?: EventType, category?: EventCategory): Promise<AnalyticsMetrics>;
    getFunnelAnalysis(steps: string, startDate: string, endDate: string): Promise<Array<{
        step: string;
        users: number;
        conversionRate: number;
    }>>;
    getCohortAnalysis(startDate: string, endDate: string): Promise<any>;
    getRetentionAnalysis(days?: number): Promise<any>;
}
