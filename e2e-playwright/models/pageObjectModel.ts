import { Browser, Page, expect, test } from '@playwright/test';
import { getTestData } from '../utils/helper';
export let primaryPage: Page;
export let data: any;

export class PageObjectModel {
    constructor(
        public readonly page: Page = primaryPage,
        protected readonly data: any = getTestData(),
    ) {}
}
  