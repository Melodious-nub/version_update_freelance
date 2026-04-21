import { PageObjectModel } from "./pageObjectModel";

export class HomePage extends PageObjectModel {

    brButton = this.page.getByRole('button', { name: 'BR' });
    createBusinessAccountLink = this.page.getByText('Create new Business Account');
    logoutButton = this.page.locator('div').filter({ hasText: /^Log Out$/ });

    async logout() {
        await this.brButton.click();
        await this.logoutButton.click();
    }
}