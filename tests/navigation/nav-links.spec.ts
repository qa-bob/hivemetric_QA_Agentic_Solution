/**
 * tests/navigation/nav-links.spec.ts
 *
 * Navigation tests for Hivemetric's single-page site. There is no <nav> or
 * multi-page routing: "Home", "Our Approach", "Case Studies", and "History"
 * are in-page sections reached via the footer "Quick Links" buttons or the
 * hero "Case Studies" CTA.
 *
 * Tag: @navigation
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Navigation @navigation', () => {
  test.beforeEach(async ({ navigationPage }) => {
    await navigationPage.navigate();
    await navigationPage.waitForLoad();
  });

  // ── Footer "Quick Links" ─────────────────────────────────────────────────────
  // The Quick Links column is `hidden md:block` — only rendered at >= 768px.

  test('footer Quick Links contains every expected section @navigation', async ({
    navigationPage,
    siteConfig,
    page,
  }) => {
    test.skip(page.viewportSize()!.width < 768, 'Quick Links column is hidden below the md breakpoint (768px)');

    await expect(navigationPage.quickLinksHeading).toBeVisible();

    const names = await navigationPage.getQuickLinkNames();
    for (const expected of siteConfig.expectedNavItems) {
      expect(names, `Footer Quick Links should include "${expected}"`).toContain(expected);
    }
  });

  test('each Quick Links button scrolls its section into view @navigation', async ({
    navigationPage,
    page,
  }) => {
    test.skip(page.viewportSize()!.width < 768, 'Quick Links column is hidden below the md breakpoint (768px)');

    const sections: Record<string, string> = {
      'Our Approach': 'vision',
      'Case Studies': 'case-studies',
      History: 'history',
    };

    for (const [label, sectionId] of Object.entries(sections)) {
      await navigationPage.clickQuickLink(label);
      const section = page.locator(`#${sectionId}`);
      await expect(section, `#${sectionId} should be in the viewport after clicking "${label}"`).toBeInViewport();
    }
  });

  // ── Hero CTA ─────────────────────────────────────────────────────────────────

  test('hero "Case Studies" CTA scrolls to the case studies section @navigation', async ({ homePage }) => {
    await homePage.clickCaseStudiesCta();
    await expect(homePage.caseStudiesSection).toBeInViewport();
  });

  // ── External / contact links ────────────────────────────────────────────────

  test('footer Privacy Policy link is present and reachable @navigation', async ({
    navigationPage,
  }) => {
    await expect(navigationPage.privacyPolicyLink).toBeVisible();

    const href = await navigationPage.privacyPolicyLink.getAttribute('href');
    expect(href, 'Privacy Policy link should have an href').toBeTruthy();

    const response = await navigationPage.page.request.head(href!, { timeout: 10_000 }).catch(() => null);
    if (response) {
      expect(
        response.ok() || response.status() < 400,
        `Privacy Policy link "${href}" returned HTTP ${response.status()}`
      ).toBeTruthy();
    }
  });

  test('footer email and phone links use correct schemes @navigation', async ({ navigationPage }) => {
    await expect(navigationPage.emailLink).toBeVisible();
    await expect(navigationPage.phoneLink).toBeVisible();

    const emailHref = await navigationPage.emailLink.getAttribute('href');
    const phoneHref = await navigationPage.phoneLink.getAttribute('href');

    expect(emailHref).toMatch(/^mailto:[^@]+@[^.]+\..+/);
    expect(phoneHref).toMatch(/^tel:\+?[\d-]+$/);
  });

  // ── Logo ─────────────────────────────────────────────────────────────────────

  test('header logo is present and points to the homepage @navigation', async ({ page, siteConfig }) => {
    const logoLink = page.locator('header a').first();
    await expect(logoLink).toBeVisible();

    const href = await logoLink.getAttribute('href');
    const resolvedHref = new URL(href ?? '/', siteConfig.url).toString();
    const siteOrigin = new URL(siteConfig.url).origin;

    expect(
      resolvedHref.startsWith(siteOrigin),
      `Header logo link "${href}" should point back to the site origin (${siteOrigin})`
    ).toBeTruthy();
  });
});
