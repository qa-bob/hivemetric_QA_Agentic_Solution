/**
 * tests/forms/contact-form.spec.ts
 *
 * Hivemetric has no traditional <form> anywhere on the site — "Contact Us"
 * launches an Intercom chat widget instead (see tests/functional/contact.spec.ts
 * for coverage of that mechanism). `site.config.json` reflects this with
 * `hasContactForm: false` / `skipForms: true`.
 *
 * This suite exists as a regression guard: if a real contact form is ever
 * added to the site, these tests fail and signal that site.config.json
 * (hasContactForm / skipForms) needs to be updated along with real form
 * field tests.
 *
 * IMPORTANT: These tests do NOT submit forms to avoid sending spam.
 *
 * Tag: @forms
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Contact Form @forms', () => {
  test('site config accurately reports no contact form is present @forms', ({ siteConfig }) => {
    expect(siteConfig.hasContactForm, 'site.config.json hasContactForm should be false').toBeFalsy();
    expect(siteConfig.skipForms, 'site.config.json skipForms should be true').toBeTruthy();
  });

  test('no <form> element exists on the homepage @forms', async ({ contactPage }) => {
    await contactPage.navigate();
    const form = await contactPage.findContactForm();

    expect(
      form,
      'A <form> was found on the homepage, but site.config.json says hasContactForm is false. ' +
        'Update site.config.json (hasContactForm/skipForms) and add real form-field tests for it.'
    ).toBeNull();
  });
});
