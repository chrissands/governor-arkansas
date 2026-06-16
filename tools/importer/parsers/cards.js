/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards. Base block: cards (USWDS usa-card grid).
 * Source: https://governor.arkansas.gov/
 * Generated: 2026-06-16
 *
 * Handles TWO distinct source structures that both map to the cards block:
 *
 *  1. Quick-link tiles (.elementor-element-2a743ae)
 *     A row of linked image tiles. Each tile is a full-area <a> with a CSS
 *     background image (data-dce-background-image-url) and a single title <p>.
 *     -> Emits one card per tile: [ image, [ <h4><a>title</a></h4> ] ].
 *        The title is the descriptive link text (WCAG 2.4.4); the background
 *        image becomes an <img> with alt text derived from the title.
 *
 *  2. News post cards (.elementor-element-3513c3b)
 *     A grid of <article> items, each wrapping a link to a news post that
 *     contains a date (<time>), an article title, a short excerpt, and a
 *     redundant "read more >" anchor.
 *     -> Emits one card per article: [ [ <h4><a>title</a></h4>, <time>, excerpt ] ].
 *        The title carries the destination link (descriptive accessible name);
 *        the generic "read more >" text is dropped. The <time> element is
 *        preserved with any machine-readable datetime attribute.
 *
 * Accessibility (primary migration goal, WCAG 2.1 AA / Section 508):
 *  - Card titles are real link text, never generic "read more".
 *  - <time> elements preserved for machine-readable dates.
 *  - Tile images receive meaningful alt text derived from the tile title.
 *  - Card titles rendered as <h4> to keep logical heading order
 *    (page h1 = hero, bio = h2, news section = h3, card titles = h4).
 */
export default function parse(element, { document }) {
  const cells = [];

  // Helper: build a heading-wrapped link as the card's accessible title.
  const buildTitleHeading = (titleText, href) => {
    const h = document.createElement('h4');
    if (href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = titleText;
      h.appendChild(a);
    } else {
      h.textContent = titleText;
    }
    return h;
  };

  // ---- Instance detection ------------------------------------------------
  // News posts instance: contains <article> post items.
  const articles = Array.from(element.querySelectorAll('article.dce-post-item, article[class*="news_post"], article'));

  if (articles.length) {
    // ---- News post cards -------------------------------------------------
    articles.forEach((article) => {
      // Destination link wrapping the whole card.
      const link = article.querySelector('a[href]');
      const href = link ? link.getAttribute('href') : null;

      // Title: the heading that is NOT the redundant "read more" link text.
      // The article title heading uses class elementor-element-2a4c3033;
      // the "read more >" heading uses class elementor-element-2c15d838.
      let titleEl = article.querySelector('.elementor-element-2a4c3033 .elementor-heading-title');
      if (!titleEl) {
        // Fallback: first heading-title that is not the read-more text.
        const headings = Array.from(article.querySelectorAll('.elementor-heading-title'));
        titleEl = headings.find((h) => !/^\s*read more/i.test(h.textContent || '')) || null;
      }
      const titleText = titleEl ? (titleEl.textContent || '').trim() : '';

      // Date: preserve the <time> element (machine-readable where present).
      const timeEl = article.querySelector('time');

      // Excerpt text.
      const excerptEl = article.querySelector('.dce-content-wrapper, .dce-content');
      const excerptText = excerptEl ? (excerptEl.textContent || '').trim() : '';

      // Skip cards with no usable content.
      if (!titleText && !excerptText) return;

      const content = [];
      content.push(buildTitleHeading(titleText, href));
      if (timeEl) {
        // Reference the source <time> element to keep datetime attributes.
        content.push(timeEl);
      }
      if (excerptText) {
        const p = document.createElement('p');
        p.textContent = excerptText;
        content.push(p);
      }

      // News cards have no image; single content cell per row.
      cells.push([content]);
    });
  } else {
    // ---- Quick-link tiles ------------------------------------------------
    // Each tile is a direct anchor child with a background-image URL + title.
    const tiles = Array.from(element.querySelectorAll('a[data-dce-background-image-url], a[href][role="button"], :scope a[href]'));

    tiles.forEach((tile) => {
      const href = tile.getAttribute('href');
      const titleEl = tile.querySelector('.elementor-heading-title, p, h1, h2, h3, h4, h5, h6');
      const titleText = titleEl ? (titleEl.textContent || '').trim() : '';
      if (!href && !titleText) return;

      const bgUrl = tile.getAttribute('data-dce-background-image-url');

      // Content cell: title as descriptive link text inside a heading.
      const contentCell = [buildTitleHeading(titleText, href)];

      if (bgUrl) {
        // Image cell: derive alt text from the tile title for accessibility.
        const img = document.createElement('img');
        img.setAttribute('src', bgUrl);
        img.setAttribute('alt', titleText || '');
        // One row per tile: [ image cell, content cell ].
        cells.push([[img], contentCell]);
      } else {
        // No background image: single content cell per row.
        cells.push([contentCell]);
      }
    });
  }

  // Empty-block guard: nothing extracted, unwrap rather than emit empty block.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
