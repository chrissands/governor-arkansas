/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: columns
 * Base block: columns
 * Source URL: https://governor.arkansas.gov/ (.elementor-element-1919351 — Governor bio section)
 * Generated: 2026-06-16
 *
 * Layout: one row, two cells (text + media), per local blocks/columns.
 * Two-column layout (one row, two cells):
 *   - Text cell:  eyebrow paragraph ("Meet the 47th Governor") + <h2> name +
 *                 biography paragraphs + CTA link.
 *   - Image cell: portrait photo of the governor.
 *
 * Accessibility (WCAG 2.1 AA / Section 508):
 *   - The eyebrow stays a PARAGRAPH (not a heading) to preserve logical heading
 *     order (h1 hero -> h2 here).
 *   - "Sarah Huckabee Sanders" stays the section <h2>.
 *   - The source portrait has empty alt (alt=""); we emit meaningful alt text.
 *   - CTA stays a normal descriptive link.
 */
export default function parse(element, { document }) {
  // --- Text column ---------------------------------------------------------
  const textCell = [];

  // Eyebrow / label — keep as a styled paragraph (NOT a heading).
  // Source: <p class="elementor-divider__text"> inside the divider widget.
  const eyebrowSource = element.querySelector('.elementor-divider__text, .elementor-divider__element');
  if (eyebrowSource) {
    const eyebrowText = eyebrowSource.textContent.trim().replace(/\s+/g, ' ');
    if (eyebrowText) {
      const eyebrow = document.createElement('p');
      eyebrow.textContent = eyebrowText;
      textCell.push(eyebrow);
    }
  }

  // Section heading — must remain an <h2>.
  const heading = element.querySelector('.elementor-widget-heading h2, h2');
  if (heading) textCell.push(heading);

  // Biography paragraphs (from the text-editor widget).
  const bioParagraphs = element.querySelectorAll(
    '.elementor-widget-text-editor .elementor-widget-container p',
  );
  bioParagraphs.forEach((p) => {
    if (p.textContent.trim()) textCell.push(p);
  });

  // CTA link — keep as a normal descriptive link with clean text + href.
  const ctaSource = element.querySelector(
    '.elementor-widget-button a.elementor-button, .elementor-button-wrapper a, a.elementor-button',
  );
  if (ctaSource) {
    const cta = document.createElement('a');
    cta.href = ctaSource.getAttribute('href');
    cta.textContent = ctaSource.textContent.trim().replace(/\s+/g, ' ');
    if (cta.textContent) textCell.push(cta);
  }

  // --- Image column --------------------------------------------------------
  const imageCell = [];
  const img = element.querySelector('.elementor-widget-image img, img');
  if (img) {
    // Source alt is empty; provide meaningful alt text for accessibility.
    if (!img.getAttribute('alt') || !img.getAttribute('alt').trim()) {
      img.setAttribute('alt', 'Governor Sarah Huckabee Sanders');
    }
    imageCell.push(img);
  }

  // Empty-block guard: bail gracefully if essential content is missing.
  if (textCell.length === 0 && imageCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One row, two cells: text + image (matches local blocks/columns convention).
  const cells = [[textCell, imageCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
