/**
 * interior-banner block
 * Automatically built by buildInteriorLayout for pages without a hero.
 * Displays the section name (e.g. "Newsroom") as a full-width hero banner.
 */
export default function decorate(block) {
  // buildBlock wraps content in extra divs — unwrap to get the <p> or <h1> directly.
  const content = block.querySelector('p, h1');
  if (content) block.replaceChildren(content);
}
