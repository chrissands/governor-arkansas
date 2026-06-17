/**
 * article-layout block
 * Two-column interior page layout: sidebar (nav + back link) + article content.
 * Automatically built by buildInteriorLayout in scripts.js.
 */
export default function decorate(block) {
  const [row] = block.children;
  if (!row) return;
  const [sidebarCell, contentCell] = row.children;
  if (!sidebarCell || !contentCell) return;

  sidebarCell.className = 'article-layout__sidebar';
  contentCell.className = 'article-layout__content';

  // Extract date from the first paragraph if it contains "FOR IMMEDIATE RELEASE"
  // e.g. "FOR IMMEDIATE RELEASE — June 3, 2026" → display just the date
  const firstP = contentCell.querySelector('p');
  if (firstP) {
    const text = firstP.textContent.trim();
    const dateMatch = text.match(
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/i,
    );
    if (dateMatch) {
      const dateEl = document.createElement('p');
      dateEl.className = 'article-layout__date';
      dateEl.textContent = dateMatch[0].toUpperCase();
      contentCell.insertBefore(dateEl, contentCell.firstChild);

      // Clean or remove the original "FOR IMMEDIATE RELEASE" paragraph
      const cleaned = text
        .replace(/FOR IMMEDIATE RELEASE\s*[—–-]\s*/i, '')
        .replace(dateMatch[0], '')
        .trim();
      if (cleaned) {
        firstP.textContent = cleaned;
      } else {
        firstP.remove();
      }
    }
  }
}
