/**
 * tests/functional/hero.spec.ts
 *
 * Hero ("#home") section — headline, subtext, and the two primary CTAs.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Hero Section @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.waitForLoad();
  });

  test('hero heading and subtext render @functional', async ({ homePage }) => {
    await expect(homePage.heroHeading).toBeVisible();
    const heading = await homePage.getMainHeading();
    expect(heading).toContain('Innovative software solutions crafted for scale');

    await expect(homePage.heroSubtext).toBeVisible();
    const subtext = (await homePage.heroSubtext.textContent()) ?? '';
    expect(subtext.toLowerCase()).toContain('boutique solution design');
  });

  test('"Contact Us" button is present and wired to the chat widget @functional', async ({ homePage }) => {
    await expect(homePage.contactUsButton).toBeVisible();
    await expect(homePage.contactUsButton).toHaveText('Contact Us');
    await expect(homePage.contactUsButton).toHaveClass(/launch-intercom/);
  });

  test('"Case Studies" CTA links to the case studies section @functional', async ({ homePage }) => {
    await expect(homePage.caseStudiesCta).toBeVisible();
    await expect(homePage.caseStudiesCta).toHaveAttribute('href', '#case-studies');
  });
});
