import * as fs from 'fs';
import * as path from 'path';

export interface EnvironmentConfig {
    URL: string;
    login: {
        username: string;
        password: string;
        businessAccount: string;
    };
    invalidlogin: {
        username: string;
        password: string;
        businessAccount: string;
    };
}

export class EnvironmentManager {
    private static instance: EnvironmentManager;
    private config: EnvironmentConfig;
    private environment: string;

    private constructor() {
        this.environment = this.getEnvironment();
        this.config = this.loadConfiguration();
    }

    public static getInstance(): EnvironmentManager {
        if (!EnvironmentManager.instance) {
            EnvironmentManager.instance = new EnvironmentManager();
        }
        return EnvironmentManager.instance;
    }

    private getEnvironment(): string {
        // Priority: Command line argument > Environment variable > Default
        const envFromArgs = process.argv.find(arg => arg.startsWith('--env='))?.split('=')[1];
        const envFromEnvVar = process.env.ENV || process.env.ENVIRONMENT;
        
        return envFromArgs || envFromEnvVar || 'dev';
    }

    private loadConfiguration(): EnvironmentConfig {
        const configPath = path.join(__dirname, '..', 'testData', this.environment, `${this.environment}.json`);
        
        if (!fs.existsSync(configPath)) {
            throw new Error(`Configuration file not found: ${configPath}`);
        }

        try {
            const configData = fs.readFileSync(configPath, 'utf-8');
            return JSON.parse(configData);
        } catch (error) {
            throw new Error(`Failed to parse configuration file: ${configPath}. Error: ${error}`);
        }
    }

    public getConfig(): EnvironmentConfig {
        return this.config;
    }

    public getBaseUrl(): string {
        return this.config.URL;
    }

    // Get the base URL without hash fragment for Playwright baseURL configuration
    public getBaseUrlWithoutHash(): string {
        const url = this.config.URL;
        const hashIndex = url.indexOf('#');
        return hashIndex !== -1 ? url.substring(0, hashIndex) : url;
    }

    public getEnvironmentName(): string {
        return this.environment;
    }

    public getLoginCredentials() {
        return this.config.login;
    }

    public getInvalidLoginCredentials() {
        return this.config.invalidlogin;
    }

    // Method to switch environment at runtime (useful for testing)
    public switchEnvironment(newEnv: string) {
        this.environment = newEnv;
        this.config = this.loadConfiguration();
    }
}

// Export convenience functions for backward compatibility
export function getEnvironmentConfig(): EnvironmentConfig {
    return EnvironmentManager.getInstance().getConfig();
}

export function getBaseUrl(): string {
    return EnvironmentManager.getInstance().getBaseUrl();
}

export function getBaseUrlWithoutHash(): string {
    return EnvironmentManager.getInstance().getBaseUrlWithoutHash();
}

export function getEnvironmentName(): string {
    return EnvironmentManager.getInstance().getEnvironmentName();
}
