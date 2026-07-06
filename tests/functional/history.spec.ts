/**
 * tests/functional/history.spec.ts
 *
 * "Our History" ("#history") section — company narrative and photo.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('History Section @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.waitForLoad();
    await homePage.scrollToSection('history');
  });

  test('section heading and narrative copy render @functional', async ({ homePage }) => {
    await expect(homePage.historyHeading).toHaveText('Our History');

    const text = (await homePage.historyText.textContent()) ?? '';
    expect(text).toContain('2016');
    expect(text.toLowerCase()).toContain('tucson');
    expect(text.length, 'History narrative should be substantial, not a stub').toBeGreaterThan(200);
  });

  test('history photo has a meaningful alt attribute and caption @functional', async ({ homePage }) => {
    // The history photo <figure> is `hidden md:block` — not rendered on narrower
    // viewports. Check actual rendered visibility rather than guessing a pixel
    // breakpoint, since emulated devices can round viewport width differently.
    const isVisible = await homePage.historyImage.isVisible();
    test.skip(!isVisible, 'History photo is not rendered at this viewport (hidden below the md breakpoint)');

    await expect(homePage.historyImage).toBeVisible();

    const alt = await homePage.historyImage.getAttribute('alt');
    expect(alt, 'History photo should have a non-empty alt attribute').toBeTruthy();

    const figcaption = homePage.historySection.locator('figcaption');
    await expect(figcaption).toContainText('Tucson');
  });
});
