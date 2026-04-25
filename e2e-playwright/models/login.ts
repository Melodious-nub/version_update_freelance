//import { type Locator, type Page ,type expect} from '@playwright/test';
import { EnvironmentManager } from "../utils/environmentManager";
import { PageObjectModel } from "./pageObjectModel";

export class LoginPage  extends PageObjectModel {
    emailInput = this.page.getByRole('textbox', { name: 'Email ID' });
    passwordInput = this.page.getByRole('textbox', { name: 'Password' });
    signInButton = this.page.getByRole('button', { name: 'Sign In' });
    continueButton = this.page.getByRole('button', { name: 'Continue' });
    unauthorisedMessage = this.page.locator('text=Unauthorized');
    envManager = EnvironmentManager.getInstance();
    
    async navigateTo(url?: string) {
        // If no URL is provided, use the base URL from the environment
        const targetUrl = url || this.data.URL;
        console.log(`Navigating to: ${targetUrl}`);
        await this.page.goto(targetUrl);
    }

    async navigateToSignin() {
        // Navigate to the full login URL with hash fragment
        await this.navigateTo(this.envManager.getBaseUrl());
    }

    async login(email, password, businessAccount) {
        // Navigate to login page using the full URL from environment config
        await this.navigateToSignin();
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.signInButton.click(); 
        await this.page.waitForTimeout(3000); // Wait for login to process
        
        // Wait for the account selection page to load
        await this.page.waitForLoadState('networkidle');
        
        // Wait for the card list to appear with a longer timeout
        const cardList = this.page.locator('div.card-list');
        await cardList.waitFor({ timeout: 30000 });
        await this.page.waitForTimeout(2000);
        
        // Get all business account cards
        const cards = cardList.locator('div.businessaccount-card');
        const count = await cards.count();
        console.log(`Found ${count} business account cards.`);
        
        let accountFound = false;
        for (let i = 0; i < count; i++) {
            const card = cards.nth(i);
            // The span containing the business account name is inside: div.font-size-14.mt-2 > span.text-dark 
            const accountSpan = card.locator('div.font-size-14.mt-2');
            const text = await accountSpan.textContent();
            console.log(`Found business account: "${text}"`);

            if (text && text.trim().includes(businessAccount)) {
                console.log(`Selecting business account: ${businessAccount}`);
                await card.scrollIntoViewIfNeeded();
                await card.click();
                accountFound = true;
                break;
            }
        }
        
        if (!accountFound) {
            console.log(`Business account "${businessAccount}" not found. Available accounts:`);
            for (let i = 0; i < count; i++) {
                const card = cards.nth(i);
                const accountSpan = card.locator('div.font-size-14.mt-2');
                const text = await accountSpan.textContent();
                console.log(`- ${text}`);
            }
            throw new Error(`Business account "${businessAccount}" not found`);
        }
        
        // Click continue button
        await this.continueButton.click();
        await this.page.waitForTimeout(3000);
        
        // Wait for navigation to complete
        await this.page.waitForLoadState('networkidle');
    }
}