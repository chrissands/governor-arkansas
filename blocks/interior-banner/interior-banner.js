/**
 * interior-banner block
 * Automatically built by buildAutoBlocks for pages without a hero.
 * Displays the page h1 in a full-width navy banner strip.
 */
export default function decorate(block) {
  // buildBlock wraps content in extra divs — unwrap to get a flat h1 directly
  // in the block so CSS can target it simply.
  const h1 = block.querySelector('h1');
  if (h1) block.replaceChildren(h1);
}
