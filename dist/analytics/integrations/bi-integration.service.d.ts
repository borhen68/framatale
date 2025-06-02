import { ConfigService } from '@nestjs/config';
import { AnalyticsService } from '../analytics.service';
export interface BIExportConfig {
    provider: 'tableau' | 'powerbi' | 'looker' | 'metabase' | 'grafana';
    endpoint: string;
    apiKey: string;
    refreshInterval: number;
    datasets: string[];
}
export interface DashboardConfig {
    id: string;
    name: string;
    description: string;
    widgets: DashboardWidget[];
    refreshInterval: number;
    permissions: {
        roles: string[];
        users: string[];
    };
}
export interface DashboardWidget {
    id: string;
    type: 'chart' | 'metric' | 'table' | 'map' | 'funnel';
    title: string;
    dataSource: string;
    config: {
        chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
        metrics: string[];
        dimensions: string[];
        filters?: Record<string, any>;
        timeRange?: {
            start: Date;
            end: Date;
        };
    };
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
export declare class BIIntegrationService {
    private analyticsService;
    private configService;
    private biConfigs;
    private dashboards;
    constructor(analyticsService: AnalyticsService, configService: ConfigService);
    exportToTableau(datasetName: string, data: any[]): Promise<void>;
    exportToPowerBI(datasetName: string, data: any[]): Promise<void>;
    exportToGrafana(datasetName: string, data: any[]): Promise<void>;
    createDashboard(config: DashboardConfig): Promise<string>;
    getDashboard(dashboardId: string): Promise<DashboardConfig | null>;
    getDashboardData(dashboardId: string, userId?: string): Promise<any>;
    updateDashboard(dashboardId: string, updates: Partial<DashboardConfig>): Promise<void>;
    getRealtimeMetrics(): Promise<any>;
    exportAnalyticsData(startDate: Date, endDate: Date, format?: 'csv' | 'json' | 'parquet'): Promise<string>;
    scheduleBISync(): Promise<void>;
    private initializeBIConfigs;
    private initializeDefaultDashboards;
    private getWidgetData;
    private getAnalyticsWidgetData;
    private getOrdersWidgetData;
    private getSystemWidgetData;
    private getActiveUsersCount;
    private getRecentOrdersCount;
    private getSystemHealthMetrics;
    private getTodayRevenue;
    private getDataForBI;
    private convertToCSV;
    private convertToParquet;
    private convertToGrafanaMetrics;
}
