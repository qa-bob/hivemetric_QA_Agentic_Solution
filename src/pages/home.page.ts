/**
 * src/pages/home.page.ts
 *
 * HomePage models Hivemetric's single-page site (https://www.hivemetric.com).
 * The site has no multi-page routing: "Home", "Our Approach", "Case Studies",
 * and "History" are all `<section>` blocks on this one page, identified by
 * `id="home"`, `id="vision"`, `id="case-studies"`, and `id="history"`.
 */

import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export interface ApproachPrinciple {
  title: string;
  description: string;
}

export interface CaseStudyStat {
  value: string;
  label: string;
}

export class HomePage extends BasePage {
  // ── Hero ("#home") ───────────────────────────────────────────────────────────

  readonly heroHeading: Locator = this.page.locator('h1').first();
  readonly heroSubtext: Locator = this.heroHeading.locator('xpath=following-sibling::p[1]');
  /** "Contact Us" launches the Intercom chat widget — there is no <form> on this site. */
  readonly contactUsButton: Locator = this.page.locator('button.launch-intercom').first();
  readonly caseStudiesCta: Locator = this.page.locator('a[href="#case-studies"]').first();

  // ── "Our Approach" ("#vision") ──────────────────────────────────────────────

  readonly approachSection: Locator = this.page.locator('section#vision');
  readonly approachHeading: Locator = this.approachSection.locator('h1');
  readonly approachIntro: Locator = this.approachSection.locator('p').first();
  private readonly approachPrincipleItems: Locator = this.approachSection.locator('dl > dd');

  // ── "Case Studies" ("#case-studies") ────────────────────────────────────────

  readonly caseStudiesSection: Locator = this.page.locator('section#case-studies');
  readonly caseStudiesHeading: Locator = this.caseStudiesSection.locator('h1');
  private readonly caseStudyStatItems: Locator = this.caseStudiesSection.locator('data');
  private readonly caseStudyTabs: Locator = this.caseStudiesSection.locator(
    '.case-studies-grid_case_studies h3'
  );
  readonly caseStudyFeatureLink: Locator = this.caseStudiesSection.locator('a.case-studies-grid_image');
  readonly caseStudyScrollRightButton: Locator = this.caseStudiesSection.getByRole('button', {
    name: 'Scroll right',
  });

  // ── "History" ("#history") ──────────────────────────────────────────────────

  readonly historySection: Locator = this.page.locator('section#history');
  readonly historyHeading: Locator = this.historySection.locator('h1');
  readonly historyText: Locator = this.historySection.locator('p').first();
  readonly historyImage: Locator = this.historySection.locator('figure img');

  // ── Section navigation ───────────────────────────────────────────────────────

  /** Scroll a named section into view by its element id (home | vision | case-studies | history). */
  async scrollToSection(sectionId: string): Promise<void> {
    await this.page.locator(`#${sectionId}`).scrollIntoViewIfNeeded();
  }

  /** Click the hero "Case Studies" CTA and wait for the target section to be in view. */
  async clickCaseStudiesCta(): Promise<void> {
    await this.caseStudiesCta.click();
    await this.caseStudiesSection.scrollIntoViewIfNeeded();
  }

  /** Click "Contact Us", which launches the Intercom widget rather than navigating anywhere. */
  async clickContactUs(): Promise<void> {
    await this.contactUsButton.click();
  }

  // ── Structured content extraction ───────────────────────────────────────────

  /** Return each "Our Approach" principle as { title, description }. */
  async getApproachPrinciples(): Promise<ApproachPrinciple[]> {
    const count = await this.approachPrincipleItems.count();
    const principles: ApproachPrinciple[] = [];

    for (let i = 0; i < count; i++) {
      const item = this.approachPrincipleItems.nth(i);
      const title = ((await item.locator('strong').textContent()) ?? '').trim();
      const description = ((await item.locator('p').textContent()) ?? '').trim();
      principles.push({ title, description });
    }

    return principles;
  }

  /** Return every case-study statistic as { value, label } (e.g. "11,000+" / "healthcare facilities"). */
  async getCaseStudyStats(): Promise<CaseStudyStat[]> {
    const count = await this.caseStudyStatItems.count();
    const stats: CaseStudyStat[] = [];

    for (let i = 0; i < count; i++) {
      const item = this.caseStudyStatItems.nth(i);
      const value = ((await item.textContent()) ?? '').trim();
      const label = ((await item.locator('xpath=../following-sibling::p').first().textContent()) ?? '').trim();
      stats.push({ value, label });
    }

    return stats;
  }

  /** Return the visible titles in the case-study carousel (desktop tab labels). */
  async getCaseStudyTitles(): Promise<string[]> {
    const count = await this.caseStudyTabs.count();
    const titles: string[] = [];
    for (let i = 0; i < count; i++) {
      titles.push(((await this.caseStudyTabs.nth(i).textContent()) ?? '').trim());
    }
    return titles;
  }

  // ── Hero / above-the-fold (generic fallback) ────────────────────────────────

  /**
   * Return the text content of the hero section.
   * Tries common hero patterns: <section> with role="banner", first <h1>,
   * or elements with data-testid="hero".
   */
  async getHeroText(): Promise<string> {
    const candidates = [
      this.page.getByRole('banner').first(),
      this.page.locator('[data-testid="hero"]').first(),
      this.page.locator('section').first(),
      this.page.locator('header').first(),
    ];

    for (const candidate of candidates) {
      if (await candidate.count() > 0) {
        const text = await candidate.textContent();
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    }

    return '';
  }

  // ── CTAs (generic fallback) ──────────────────────────────────────────────────

  /**
   * Return all primary call-to-action buttons/links visible on the page.
   * Looks for <button> and <a> elements styled as buttons, or those
   * whose text contains common CTA phrases.
   */
  async getCTAButtons(): Promise<Locator[]> {
    const ctaLocator = this.page.locator(
      'a[class*="btn"], a[class*="button"], a[class*="cta"], ' +
      'button[class*="primary"], button[class*="cta"], ' +
      '[role="button"]'
    );

    const all = await ctaLocator.all();

    if (all.length === 0) {
      const textCta = this.page.locator(
        'a, button'
      ).filter({
        hasText: /get started|try free|sign up|contact us|learn more|request demo/i,
      });
      return textCta.all();
    }

    return all;
  }

  // ── Headings (generic fallback) ──────────────────────────────────────────────

  /**
   * Return the text of the first <h1> on the page.
   * Falls back to first <h2> if no <h1> exists (some SPAs render h2 first).
   */
  async getMainHeading(): Promise<string> {
    const h1 = this.page.locator('h1').first();
    if (await h1.count() > 0) {
      return ((await h1.textContent()) ?? '').replace(/\s+/g, ' ').trim();
    }

    const h2 = this.page.locator('h2').first();
    if (await h2.count() > 0) {
      return (await h2.textContent())?.trim() ?? '';
    }

    return '';
  }

  // ── Load verification ───────────────────────────────────────────────────────

  /**
   * Returns true when key homepage elements are present. This site has no
   * <nav>/role="navigation"> landmark, so presence is based on heading,
   * footer, and body content rather than navigation.
   */
  async isLoaded(): Promise<boolean> {
    try {
      const headingCount = await this.page.locator('h1, h2').count();
      if (headingCount === 0) return false;

      const footerCount = await this.page.locator('footer').count();
      if (footerCount === 0) return false;

      const bodyText = await this.page.evaluate<string>(() => document.body.innerText);
      if (bodyText.trim().length < 50) return false;

      return true;
    } catch {
      return false;
    }
  }
}
