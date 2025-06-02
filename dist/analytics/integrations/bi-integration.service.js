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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BIIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const analytics_service_1 = require("../analytics.service");
let BIIntegrationService = class BIIntegrationService {
    analyticsService;
    configService;
    biConfigs = new Map();
    dashboards = new Map();
    constructor(analyticsService, configService) {
        this.analyticsService = analyticsService;
        this.configService = configService;
        this.initializeBIConfigs();
        this.initializeDefaultDashboards();
    }
    async exportToTableau(datasetName, data) {
        const config = this.biConfigs.get('tableau');
        if (!config)
            return;
        try {
            const response = await fetch(`${config.endpoint}/api/3.0/sites/default/datasources`, {
                method: 'POST',
                headers: {
                    'X-Tableau-Auth': config.apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    datasource: {
                        name: datasetName,
                        data: data,
                        refreshSchedule: {
                            frequency: 'hourly',
                            interval: config.refreshInterval,
                        },
                    },
                }),
            });
            if (!response.ok) {
                throw new Error(`Tableau export failed: ${response.statusText}`);
            }
        }
        catch (error) {
            console.error('Tableau export error:', error);
        }
    }
    async exportToPowerBI(datasetName, data) {
        const config = this.biConfigs.get('powerbi');
        if (!config)
            return;
        try {
            const response = await fetch(`${config.endpoint}/v1.0/myorg/datasets/${datasetName}/rows`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rows: data }),
            });
            if (!response.ok) {
                throw new Error(`Power BI export failed: ${response.statusText}`);
            }
        }
        catch (error) {
            console.error('Power BI export error:', error);
        }
    }
    async exportToGrafana(datasetName, data) {
        const config = this.biConfigs.get('grafana');
        if (!config)
            return;
        try {
            const metrics = this.convertToGrafanaMetrics(data);
            const response = await fetch(`${config.endpoint}/api/datasources/proxy/1/write`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/x-protobuf',
                },
                body: metrics,
            });
            if (!response.ok) {
                throw new Error(`Grafana export failed: ${response.statusText}`);
            }
        }
        catch (error) {
            console.error('Grafana export error:', error);
        }
    }
    async createDashboard(config) {
        this.dashboards.set(config.id, config);
        return config.id;
    }
    async getDashboard(dashboardId) {
        return this.dashboards.get(dashboardId) || null;
    }
    async getDashboardData(dashboardId, userId) {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard) {
            throw new Error('Dashboard not found');
        }
        const widgetData = await Promise.all(dashboard.widgets.map(async (widget) => {
            const data = await this.getWidgetData(widget, userId);
            return { widgetId: widget.id, data };
        }));
        return {
            dashboard: dashboard,
            data: widgetData.reduce((acc, item) => {
                acc[item.widgetId] = item.data;
                return acc;
            }, {}),
            lastUpdated: new Date(),
        };
    }
    async updateDashboard(dashboardId, updates) {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard) {
            throw new Error('Dashboard not found');
        }
        this.dashboards.set(dashboardId, { ...dashboard, ...updates });
    }
    async getRealtimeMetrics() {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const [activeUsers, recentOrders, systemHealth, revenueToday] = await Promise.all([
            this.getActiveUsersCount(),
            this.getRecentOrdersCount(oneHourAgo),
            this.getSystemHealthMetrics(),
            this.getTodayRevenue(),
        ]);
        return {
            timestamp: now,
            metrics: {
                activeUsers,
                recentOrders,
                systemHealth,
                revenueToday,
            },
        };
    }
    async exportAnalyticsData(startDate, endDate, format = 'json') {
        const metrics = await this.analyticsService.getMetrics(startDate, endDate);
        switch (format) {
            case 'csv':
                return this.convertToCSV(metrics);
            case 'json':
                return JSON.stringify(metrics, null, 2);
            case 'parquet':
                return this.convertToParquet(metrics);
            default:
                return JSON.stringify(metrics);
        }
    }
    async scheduleBISync() {
        const configs = Array.from(this.biConfigs.values());
        for (const config of configs) {
            try {
                const data = await this.getDataForBI(config.datasets);
                switch (config.provider) {
                    case 'tableau':
                        await this.exportToTableau('frametale_analytics', data);
                        break;
                    case 'powerbi':
                        await this.exportToPowerBI('frametale_analytics', data);
                        break;
                    case 'grafana':
                        await this.exportToGrafana('frametale_analytics', data);
                        break;
                }
            }
            catch (error) {
                console.error(`BI sync failed for ${config.provider}:`, error);
            }
        }
    }
    initializeBIConfigs() {
        const tableauConfig = this.configService.get('TABLEAU_CONFIG');
        if (tableauConfig) {
            this.biConfigs.set('tableau', JSON.parse(tableauConfig));
        }
        const powerbiConfig = this.configService.get('POWERBI_CONFIG');
        if (powerbiConfig) {
            this.biConfigs.set('powerbi', JSON.parse(powerbiConfig));
        }
        const grafanaConfig = this.configService.get('GRAFANA_CONFIG');
        if (grafanaConfig) {
            this.biConfigs.set('grafana', JSON.parse(grafanaConfig));
        }
    }
    initializeDefaultDashboards() {
        this.dashboards.set('executive', {
            id: 'executive',
            name: 'Executive Dashboard',
            description: 'High-level business metrics',
            refreshInterval: 15,
            permissions: { roles: ['admin', 'executive'], users: [] },
            widgets: [
                {
                    id: 'revenue-chart',
                    type: 'chart',
                    title: 'Revenue Trend',
                    dataSource: 'analytics',
                    config: {
                        chartType: 'line',
                        metrics: ['revenue'],
                        dimensions: ['date'],
                        timeRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
                    },
                    position: { x: 0, y: 0, width: 6, height: 4 },
                },
                {
                    id: 'user-growth',
                    type: 'metric',
                    title: 'User Growth',
                    dataSource: 'analytics',
                    config: {
                        metrics: ['new_users', 'total_users'],
                        dimensions: [],
                    },
                    position: { x: 6, y: 0, width: 3, height: 2 },
                },
            ],
        });
        this.dashboards.set('operations', {
            id: 'operations',
            name: 'Operations Dashboard',
            description: 'Operational metrics and system health',
            refreshInterval: 5,
            permissions: { roles: ['admin', 'operations'], users: [] },
            widgets: [
                {
                    id: 'order-status',
                    type: 'table',
                    title: 'Order Status',
                    dataSource: 'orders',
                    config: {
                        metrics: ['count'],
                        dimensions: ['status'],
                    },
                    position: { x: 0, y: 0, width: 4, height: 3 },
                },
                {
                    id: 'system-health',
                    type: 'metric',
                    title: 'System Health',
                    dataSource: 'system',
                    config: {
                        metrics: ['cpu_usage', 'memory_usage', 'response_time'],
                        dimensions: [],
                    },
                    position: { x: 4, y: 0, width: 4, height: 3 },
                },
            ],
        });
    }
    async getWidgetData(widget, userId) {
        switch (widget.dataSource) {
            case 'analytics':
                return this.getAnalyticsWidgetData(widget);
            case 'orders':
                return this.getOrdersWidgetData(widget);
            case 'system':
                return this.getSystemWidgetData(widget);
            default:
                return {};
        }
    }
    async getAnalyticsWidgetData(widget) {
        const { timeRange } = widget.config;
        if (timeRange) {
            return this.analyticsService.getMetrics(timeRange.start, timeRange.end);
        }
        return {};
    }
    async getOrdersWidgetData(widget) {
        return {};
    }
    async getSystemWidgetData(widget) {
        return {
            cpu_usage: Math.random() * 100,
            memory_usage: Math.random() * 100,
            response_time: Math.random() * 1000,
        };
    }
    async getActiveUsersCount() {
        return Math.floor(Math.random() * 1000);
    }
    async getRecentOrdersCount(since) {
        return Math.floor(Math.random() * 100);
    }
    async getSystemHealthMetrics() {
        return {
            status: 'healthy',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        };
    }
    async getTodayRevenue() {
        return Math.random() * 10000;
    }
    async getDataForBI(datasets) {
        return [];
    }
    convertToCSV(data) {
        return '';
    }
    convertToParquet(data) {
        return '';
    }
    convertToGrafanaMetrics(data) {
        return '';
    }
};
exports.BIIntegrationService = BIIntegrationService;
exports.BIIntegrationService = BIIntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService,
        config_1.ConfigService])
], BIIntegrationService);
//# sourceMappingURL=bi-integration.service.js.map