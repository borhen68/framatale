import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnalyticsService } from '../analytics.service';

export interface BIExportConfig {
  provider: 'tableau' | 'powerbi' | 'looker' | 'metabase' | 'grafana';
  endpoint: string;
  apiKey: string;
  refreshInterval: number; // minutes
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
    timeRange?: { start: Date; end: Date };
  };
  position: { x: number; y: number; width: number; height: number };
}

@Injectable()
export class BIIntegrationService {
  private biConfigs: Map<string, BIExportConfig> = new Map();
  private dashboards: Map<string, DashboardConfig> = new Map();

  constructor(
    private analyticsService: AnalyticsService,
    private configService: ConfigService,
  ) {
    this.initializeBIConfigs();
    this.initializeDefaultDashboards();
  }

  // BI Tool Integration Methods
  async exportToTableau(datasetName: string, data: any[]): Promise<void> {
    const config = this.biConfigs.get('tableau');
    if (!config) return;

    try {
      // Tableau REST API integration
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
    } catch (error) {
      console.error('Tableau export error:', error);
    }
  }

  async exportToPowerBI(datasetName: string, data: any[]): Promise<void> {
    const config = this.biConfigs.get('powerbi');
    if (!config) return;

    try {
      // Power BI REST API integration
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
    } catch (error) {
      console.error('Power BI export error:', error);
    }
  }

  async exportToGrafana(datasetName: string, data: any[]): Promise<void> {
    const config = this.biConfigs.get('grafana');
    if (!config) return;

    try {
      // Grafana API integration (via InfluxDB or Prometheus)
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
    } catch (error) {
      console.error('Grafana export error:', error);
    }
  }

  // Custom Dashboard Methods
  async createDashboard(config: DashboardConfig): Promise<string> {
    this.dashboards.set(config.id, config);
    return config.id;
  }

  async getDashboard(dashboardId: string): Promise<DashboardConfig | null> {
    return this.dashboards.get(dashboardId) || null;
  }

  async getDashboardData(dashboardId: string, userId?: string): Promise<any> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    const widgetData = await Promise.all(
      dashboard.widgets.map(async (widget) => {
        const data = await this.getWidgetData(widget, userId);
        return { widgetId: widget.id, data };
      })
    );

    return {
      dashboard: dashboard,
      data: widgetData.reduce((acc, item) => {
        acc[item.widgetId] = item.data;
        return acc;
      }, {} as Record<string, any>),
      lastUpdated: new Date(),
    };
  }

  async updateDashboard(dashboardId: string, updates: Partial<DashboardConfig>): Promise<void> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    this.dashboards.set(dashboardId, { ...dashboard, ...updates });
  }

  // Real-time Dashboard Updates
  async getRealtimeMetrics(): Promise<any> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [
      activeUsers,
      recentOrders,
      systemHealth,
      revenueToday
    ] = await Promise.all([
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

  // Data Export for BI Tools
  async exportAnalyticsData(
    startDate: Date,
    endDate: Date,
    format: 'csv' | 'json' | 'parquet' = 'json'
  ): Promise<string> {
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

  // Automated BI Sync
  async scheduleBISync(): Promise<void> {
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
      } catch (error) {
        console.error(`BI sync failed for ${config.provider}:`, error);
      }
    }
  }

  // Private helper methods
  private initializeBIConfigs(): void {
    // Load BI configurations from environment or database
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

  private initializeDefaultDashboards(): void {
    // Executive Dashboard
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

    // Operations Dashboard
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

  private async getWidgetData(widget: DashboardWidget, userId?: string): Promise<any> {
    // Implementation would depend on the widget type and data source
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

  private async getAnalyticsWidgetData(widget: DashboardWidget): Promise<any> {
    const { timeRange } = widget.config;
    if (timeRange) {
      return this.analyticsService.getMetrics(timeRange.start, timeRange.end);
    }
    return {};
  }

  private async getOrdersWidgetData(widget: DashboardWidget): Promise<any> {
    // Implementation for order-related widgets
    return {};
  }

  private async getSystemWidgetData(widget: DashboardWidget): Promise<any> {
    return {
      cpu_usage: Math.random() * 100,
      memory_usage: Math.random() * 100,
      response_time: Math.random() * 1000,
    };
  }

  private async getActiveUsersCount(): Promise<number> {
    // Implementation to get active users in the last hour
    return Math.floor(Math.random() * 1000);
  }

  private async getRecentOrdersCount(since: Date): Promise<number> {
    // Implementation to get recent orders
    return Math.floor(Math.random() * 100);
  }

  private async getSystemHealthMetrics(): Promise<any> {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  private async getTodayRevenue(): Promise<number> {
    // Implementation to get today's revenue
    return Math.random() * 10000;
  }

  private async getDataForBI(datasets: string[]): Promise<any[]> {
    // Implementation to get data for BI tools
    return [];
  }

  private convertToCSV(data: any): string {
    // CSV conversion implementation
    return '';
  }

  private convertToParquet(data: any): string {
    // Parquet conversion implementation
    return '';
  }

  private convertToGrafanaMetrics(data: any[]): string {
    // Convert data to Grafana/Prometheus format
    return '';
  }
}
