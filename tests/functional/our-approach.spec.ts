/**
 * tests/functional/our-approach.spec.ts
 *
 * "Our Approach" ("#vision") section — six methodology principles.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

const EXPECTED_PRINCIPLES = [
  'Discovery',
  'Design',
  'Implementation',
  'Measurement',
  'Quality',
  'Defence-in-Depth',
];

test.describe('Our Approach Section @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.waitForLoad();
    await homePage.scrollToSection('vision');
  });

  test('section heading and intro copy render @functional', async ({ homePage }) => {
    await expect(homePage.approachHeading).toHaveText('Our Approach');
    await expect(homePage.approachIntro).not.toBeEmpty();
  });

  test('all six approach principles are present with titles and descriptions @functional', async ({
    homePage,
  }) => {
    const principles = await homePage.getApproachPrinciples();

    expect(principles).toHaveLength(EXPECTED_PRINCIPLES.length);

    const titles = principles.map((p) => p.title);
    for (const expected of EXPECTED_PRINCIPLES) {
      expect(titles, `Expected an "Our Approach" principle titled "${expected}"`).toContain(expected);
    }

    for (const principle of principles) {
      expect(
        principle.description.length,
        `Principle "${principle.title}" should have a non-trivial description`
      ).toBeGreaterThan(20);
    }
  });
});
