/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero
 * Base block: hero (USWDS usa-hero)
 * Source: https://governor.arkansas.gov/ (.elementor-element-1766795)
 * Generated: 2026-06-16
 *
 *
 * Source structure (validated against migration-work/block-context/hero/source.html
 * and migration-work/cleaned.html):
 *   - Direct-child <img> = video background fallback (whitaker-point). Decorative
 *     background imagery -> emitted as the hero background picture/image with empty alt.
 *   - <svg>/<img> inside .elementor-shape = decorative tilt divider -> EXCLUDED.
 *   - <h1 class="elementor-heading-title"> "Empowering Arkansans" -> single hero heading (preserve exactly one h1).
 *   - <blockquote class="elementor-blockquote"> with <p> tagline + <cite> attribution
 *     -> preserved as a real <blockquote>/<cite> so quote semantics survive (WCAG / Section 508).
 *
 * Target table (USWDS hero, per library-example.md + library-description.txt):
 *   Row 1: block name "hero"
 *   Row 2 (optional): background image/picture
 *   Row 3: content cell -> heading (h1) + tagline blockquote (+ optional CTA)
 */
export default function parse(element, { document }) {
  // --- Heading (exactly one h1) ---
  const heading = element.querySelector('h1.elementor-heading-title, h1, .elementor-widget-heading h1');

  // --- Tagline blockquote with attribution (preserve quote semantics) ---
  const blockquote = element.querySelector('blockquote.elementor-blockquote, blockquote');

  // --- Optional CTA (none in current source, but support variation) ---
  // Scope to content widgets so we never pick up links from decorative areas.
  const link = element.querySelector(
    '.elementor-widget-button a, a.elementor-button, a.usa-button',
  );

  // --- Background image: video fallback / decorative background ---
  // Only consider direct-child images of the hero container. Explicitly exclude the
  // decorative shape-divider SVG (rendered as an <img> inside .elementor-shape) and
  // any data: URI SVGs.
  let bgImage = null;
  const directImgs = Array.from(element.querySelectorAll(':scope > img, :scope > .e-con-inner > img'));
  bgImage = directImgs.find((img) => {
    if (img.closest('.elementor-shape')) return false; // decorative divider
    const src = img.getAttribute('src') || '';
    if (src.startsWith('data:')) return false; // inline decorative SVG
    return true;
  }) || null;

  // Empty-block guard: nothing meaningful to import.
  if (!heading && !blockquote) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Optional background-image row. Decorative background imagery -> empty alt.
  if (bgImage) {
    if (!bgImage.getAttribute('alt')) {
      bgImage.setAttribute('alt', ''); // decorative background -> empty alt for AT
    }
    cells.push([bgImage]);
  }

  // Content row: heading first (single h1), then the tagline blockquote, then optional CTA.
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (blockquote) contentCell.push(blockquote);
  if (link) contentCell.push(link);
  cells.push(contentCell);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
