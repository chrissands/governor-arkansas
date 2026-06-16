/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: governor-arkansas site-wide cleanup.
 *
 * Source is a WordPress/Elementor page (governor.arkansas.gov). This removes
 * the global site shell and Elementor scaffolding so the import contains only
 * page-level authorable content. Accessibility is the primary migration goal,
 * so meaningful semantics (single <h1>, <blockquote>/<cite>, <time>, lists,
 * headings) are deliberately preserved.
 *
 * ALL selectors below were verified against migration-work/cleaned.html.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Decorative background <video> and its container (cleaned.html:235-237).
    // Decorative only; not authorable and not the carrier of meaning.
    WebImporter.DOMUtils.remove(element, [
      '.elementor-background-video-container',
      'video.elementor-background-video-hosted',
    ]);

    // Elementor curved/angled shape-divider SVGs at section edges (cleaned.html:238-239).
    // Purely decorative chrome; would otherwise leave stray base64 data-URI <img>.
    WebImporter.DOMUtils.remove(element, ['.elementor-shape']);

    // reCAPTCHA badge, its iframe and hidden response textarea (cleaned.html:749-757).
    WebImporter.DOMUtils.remove(element, [
      '.grecaptcha-badge',
      'textarea.g-recaptcha-response',
      'iframe[title="reCAPTCHA"]',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // --- Non-authorable global chrome (handled separately by orchestrators) ---
    // Site header (cleaned.html:9) -> navigation-orchestrator.
    // Site footer (cleaned.html:470) -> footer-orchestrator.
    WebImporter.DOMUtils.remove(element, [
      'header.elementor-location-header',
      'footer.elementor-location-footer',
    ]);

    // Redundant/duplicate skip links (cleaned.html:4-8). Two skip-link blocks
    // exist in source; both are removed here (a single skip link is provided by
    // the EDS template), avoiding duplicate-link a11y noise.
    WebImporter.DOMUtils.remove(element, ['.skip-link.screen-reader-text']);

    // Empty Elementor menu-anchor markers used as skip targets (#mainnav,
    // #content) (cleaned.html:45,304). They carry no content; the EDS landmark
    // structure provides real skip targets.
    WebImporter.DOMUtils.remove(element, ['.elementor-menu-anchor']);

    // Elementor runtime/scaffolding leftovers (cleaned.html:740-747):
    // device-mode marker, font-icon SVG symbol stubs, the search-filter SVG
    // template, and stray <link>/<iframe>/<noscript> elements.
    WebImporter.DOMUtils.remove(element, [
      '#elementor-device-mode',
      '#search-filter-svg-template',
      'img[src^="data:image/svg+xml"]',
      'link',
      'iframe',
      'noscript',
      'script',
    ]);

    // Strip Elementor's verbose presentational attributes while leaving the
    // element (and its authorable content) intact. Removes inline styles and
    // data-settings so the imported markup is clean. Does NOT touch href/src/alt
    // or any content-bearing attribute.
    element.querySelectorAll('[style], [data-settings], [data-element_type], [data-id], [data-widget_type]').forEach((el) => {
      el.removeAttribute('style');
      el.removeAttribute('data-settings');
      el.removeAttribute('data-element_type');
      el.removeAttribute('data-id');
      el.removeAttribute('data-widget_type');
    });
  }
}
