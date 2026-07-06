/**
 * tests/functional/case-studies.spec.ts
 *
 * "Case Studies" ("#case-studies") section — impact metrics, the featured
 * case-study card, and the carousel of case-study titles.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

const EXPECTED_CASE_STUDY_TITLES = [
  'CDC - Disease Surveillance',
  'NYC Health - Covid19 Emergency Response',
  'Non-Profit - CRM and Data Aggregation',
  'Dishful - Consumer Mobile Application',
];

test.describe('Case Studies Section @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.waitForLoad();
    await homePage.scrollToSection('case-studies');
  });

  test('section heading renders @functional', async ({ homePage }) => {
    await expect(homePage.caseStudiesHeading).toHaveText('Case Studies');
  });

  test('impact metrics render with a numeric-looking value and a label @functional', async ({ homePage }) => {
    const stats = await homePage.getCaseStudyStats();

    expect(stats.length, 'Expected multiple impact metrics in the Case Studies section').toBeGreaterThanOrEqual(8);

    for (const stat of stats) {
      expect(stat.value.length, `Stat "${stat.value}" should be non-empty`).toBeGreaterThan(0);
      expect(stat.label.length, `Stat "${stat.value}" should have a descriptive label`).toBeGreaterThan(3);
    }
  });

  test('featured case-study card links out and lists every project @functional', async ({ homePage }) => {
    await expect(homePage.caseStudyFeatureLink).toBeVisible();
    await expect(homePage.caseStudyFeatureLink).toHaveAttribute('target', '_blank');

    const href = await homePage.caseStudyFeatureLink.getAttribute('href');
    expect(href, 'Featured case-study card should have an href').toBeTruthy();

    // The 4 project panels are laid out in a wide flex track and only one is
    // in view at a time, so assert on DOM content rather than visibility.
    const cardText = (await homePage.caseStudyFeatureLink.textContent()) ?? '';
    for (const title of EXPECTED_CASE_STUDY_TITLES) {
      expect(cardText, `Expected case-study card to include "${title}"`).toContain(title);
    }
  });

  test('carousel lists a title for every case study @functional', async ({ homePage, page }) => {
    // Desktop tab labels are hidden below md; the mobile carousel uses dot buttons instead.
    test.skip(page.viewportSize()!.width < 768, 'Case-study tab labels are hidden below the md breakpoint');

    const titles = await homePage.getCaseStudyTitles();
    for (const expected of EXPECTED_CASE_STUDY_TITLES) {
      expect(titles, `Expected the case-study carousel to list "${expected}"`).toContain(expected);
    }
  });
});
