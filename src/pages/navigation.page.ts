/**
 * src/pages/navigation.page.ts
 *
 * NavigationPage models the site's primary navigation.
 * Uses semantic role-based selectors and avoids site-specific class names.
 */

import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export interface NavLinkInfo {
  text: string;
  href: string;
}

export interface LinkCheckResult {
  url: string;
  status: number;
  ok: boolean;
}

/** Maps a footer "Quick Links" label to the section id it scrolls to. */
const QUICK_LINK_SECTION_IDS: Record<string, string> = {
  Home: 'home',
  'Our Approach': 'vision',
  'Case Studies': 'case-studies',
  History: 'history',
};

export class NavigationPage extends BasePage {
  // ── Footer "Quick Links" (this site has no <nav> element) ──────────────────
  //
  // Hivemetric is a single scrolling page: the footer's "Quick Links" column
  // is a set of plain <button> elements (no href) that scroll to an in-page
  // section. They are hidden below the md breakpoint (footer column is
  // `hidden md:block`), so only assert on them at tablet/desktop viewports.

  readonly footer: Locator = this.page.locator('footer');
  readonly quickLinksHeading: Locator = this.footer.getByRole('heading', { name: 'Quick Links' });
  readonly quickLinkButtons: Locator = this.footer.locator('ul li button');
  readonly privacyPolicyLink: Locator = this.footer.getByRole('link', { name: 'Privacy Policy' });
  readonly emailLink: Locator = this.footer.locator('a[href^="mailto:"]');
  readonly phoneLink: Locator = this.footer.locator('a[href^="tel:"]');

  /** Return the visible text of each footer "Quick Links" button, in order. */
  async getQuickLinkNames(): Promise<string[]> {
    const count = await this.quickLinkButtons.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      names.push(((await this.quickLinkButtons.nth(i).textContent()) ?? '').trim());
    }
    return names;
  }

  /** Click a footer "Quick Links" button by label and wait for its target section to scroll into view. */
  async clickQuickLink(label: string): Promise<void> {
    await this.quickLinkButtons.filter({ hasText: label }).first().click();
    const sectionId = QUICK_LINK_SECTION_IDS[label];
    if (sectionId) {
      await this.page.locator(`#${sectionId}`).scrollIntoViewIfNeeded();
    }
  }

  // ── Nav detection (generic fallback for multi-page sites) ──────────────────

  /**
   * Return the primary navigation locator.
   * Tries role="navigation" first, then <nav>, then header-scoped links.
   */
  private getNavLocator(): Locator {
    return this.page.locator('nav, [role="navigation"]').first();
  }

  /** Return true if a navigation element is visible on the page. */
  async isNavVisible(): Promise<boolean> {
    const nav = this.getNavLocator();
    if (await nav.count() === 0) return false;
    return nav.isVisible();
  }

  // ── Nav links ────────────────────────────────────────────────────────────────

  /**
   * Return all links inside the primary navigation with their text and href.
   * Filters out empty hrefs and anchor-only links (#).
   */
  async getNavLinks(): Promise<NavLinkInfo[]> {
    const nav = this.getNavLocator();
    if (await nav.count() === 0) return [];

    const links = nav.locator('a[href]');
    const count = await links.count();
    const results: NavLinkInfo[] = [];

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = ((await link.textContent()) ?? '').trim();
      const href = (await link.getAttribute('href')) ?? '';

      // Skip empty, anchor-only, or javascript: links
      if (!href || href === '#' || href.startsWith('javascript:')) continue;

      results.push({ text, href });
    }

    return results;
  }

  /**
   * Click a navigation item by its visible text.
   * Uses a case-insensitive partial match.
   */
  async clickNavItem(text: string): Promise<void> {
    const nav = this.getNavLocator();
    const link = nav.getByRole('link', { name: text });
    await link.first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Mobile menu ──────────────────────────────────────────────────────────────

  /**
   * Return the mobile hamburger / menu toggle locator, or null if not found.
   * Searches for common patterns: button with aria-label containing "menu",
   * elements with class containing "hamburger", "menu-toggle", "nav-toggle".
   */
  async getMobileMenuToggle(): Promise<Locator | null> {
    const candidates = [
      this.page.getByRole('button', { name: /menu|navigation|toggle|hamburger/i }),
      this.page.locator('[class*="hamburger"], [class*="menu-toggle"], [class*="nav-toggle"]'),
      this.page.locator('[aria-label*="menu" i], [aria-label*="navigation" i]').filter({ hasNotText: /^\s*$/ }),
      this.page.locator('button[aria-expanded]').first(),
    ];

    for (const candidate of candidates) {
      if (await candidate.count() > 0 && await candidate.first().isVisible()) {
        return candidate.first();
      }
    }

    return null;
  }

  /**
   * Open the mobile navigation menu if a toggle exists and the menu is currently closed.
   * No-op if no toggle is found (desktop layout).
   */
  async openMobileMenu(): Promise<void> {
    const toggle = await this.getMobileMenuToggle();
    if (!toggle) return;

    const isExpanded = await toggle.getAttribute('aria-expanded');
    if (isExpanded === 'true') return; // Already open

    await toggle.click();

    // Wait briefly for animation
    await this.page.waitForTimeout(400);
  }

  // ── Link reachability ────────────────────────────────────────────────────────

  /**
   * Check all nav links are reachable by issuing HEAD requests.
   * Returns an array of results with URL, HTTP status, and ok flag.
   * Relative URLs are resolved against config.url.
   */
  async checkAllNavLinksReachable(): Promise<LinkCheckResult[]> {
    const navLinks = await this.getNavLinks();
    const baseUrl = new URL(this.config.url);
    const results: LinkCheckResult[] = [];

    for (const link of navLinks) {
      let absoluteUrl: string;
      try {
        absoluteUrl = new URL(link.href, baseUrl).toString();
      } catch {
        results.push({ url: link.href, status: 0, ok: false });
        continue;
      }

      try {
        const response = await this.page.request.head(absoluteUrl, {
          timeout: 10_000,
        });
        results.push({
          url: absoluteUrl,
          status: response.status(),
          ok: response.ok(),
        });
      } catch {
        results.push({ url: absoluteUrl, status: 0, ok: false });
      }
    }

    return results;
  }
}
