/**
 * tests/functional/contact.spec.ts
 *
 * Hivemetric has no contact form — visitors reach the company via the
 * "Contact Us" button (Intercom chat widget) or the footer's email/phone
 * links. This suite exercises those real mechanisms without ever depending
 * on third-party Intercom UI actually loading (no network calls to Intercom
 * are triggered beyond the click itself).
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Contact Mechanism @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.waitForLoad();
  });

  test('"Contact Us" button is clickable and does not navigate away @functional', async ({ homePage, page }) => {
    const urlBefore = page.url();

    await homePage.clickContactUs();
    await page.waitForTimeout(300);

    expect(page.url(), 'Clicking "Contact Us" should not navigate to a new page').toBe(urlBefore);
  });

  test('footer exposes a working email and phone contact point @functional', async ({ navigationPage }) => {
    await navigationPage.navigate();
    await navigationPage.waitForLoad();

    await expect(navigationPage.emailLink).toHaveAttribute('href', 'mailto:info@hivemetric.com');
    await expect(navigationPage.phoneLink).toHaveAttribute('href', 'tel:+5203707474');
  });
});
