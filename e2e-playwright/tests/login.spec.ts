import { Page, test, expect } from '@playwright/test';
import { LoginPage } from '../models/login';
import { getTestData } from '../utils/helper';
import { HomePage } from '../models/homePage';
import { EnvironmentManager } from '../utils/environmentManager';

test.describe('Login Tests', () => {
    let loginPage: LoginPage;
    let homePage: HomePage;
    let data: any;
    let loginCreds: any;
    let envManager: EnvironmentManager;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        homePage = new HomePage(page);
        envManager = EnvironmentManager.getInstance();
        loginCreds = envManager.getLoginCredentials();
        data = getTestData();
    });

    test('Successful login with valid credentials', async () => {
        await loginPage.login(loginCreds.username, loginCreds.password, loginCreds.businessAccount);
        await homePage.logout();
    });

    test('Unsuccessful login with invalid credentials', async () => {
        await loginPage.login(data.invalidlogin.username, data.invalidlogin.password,data.invalidlogin.businessAccount);
        // Add assertions to verify error message is displayed
        await expect(loginPage.unauthorisedMessage).toHaveCount(1);
    });
});