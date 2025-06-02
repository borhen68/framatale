import { IntegrationTestService } from './integration-test.service';
export declare class TestController {
    private integrationTest;
    constructor(integrationTest: IntegrationTestService);
    runCompleteSystemTest(): Promise<{
        success: boolean;
        message: string;
        results: any[];
        errors: string[];
        summary: any;
        recommendations: string[];
    }>;
    getSystemStatus(): Promise<{
        status: 'healthy' | 'warning' | 'error';
        components: any[];
        readyForDemo: boolean;
        summary: string;
    }>;
    getDemoScenarios(): Promise<{
        scenarios: any[];
        keyPoints: string[];
        businessValue: any;
    }>;
}
