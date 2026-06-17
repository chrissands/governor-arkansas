/**
 * hero block
 * Based on USWDS usa-hero component
 *
 * @see https://designsystem.digital.gov/components/hero/
 */

/**
 * Decorates the hero block into USWDS hero component
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  // Extract authored video URL: a standalone paragraph whose only content is a
  // path/URL to a video file (.mp4, .webm, .mov).  Remove it from the block
  // before any other extraction so it doesn't get picked up as the quote text.
  let authoredVideoSrc = null;
  for (const p of block.querySelectorAll('p')) {
    const text = p.textContent.trim();
    if (/\.(mp4|webm|mov)(\?|#|$)/i.test(text) && !text.includes(' ')) {
      authoredVideoSrc = text;
      // Walk up to the direct child of block and remove the whole row
      let row = p;
      while (row.parentElement && row.parentElement !== block) row = row.parentElement;
      row.remove();
      break;
    }
  }

  // Get the remaining content elements from the block
  const heading = block.querySelector('h1, h2, h3');
  const paragraph = block.querySelector('p');
  const link = block.querySelector('a');
  const picture = block.querySelector('picture');

  // Clear the block
  block.textContent = '';

  // Add USWDS class directly to the block
  block.classList.add('usa-hero');

  // Keep the background image as a real <img> so the browser's preload scanner
  // can discover and fetch it early (CSS background-image set by JS is invisible
  // to the scanner, causing late LCP). fetchpriority="high" + loading="eager"
  // ensures it's fetched at the highest priority on both mobile and desktop.
  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      img.className = 'usa-hero__bg-image';
      img.setAttribute('fetchpriority', 'high');
      img.setAttribute('loading', 'eager');
      img.setAttribute('decoding', 'async');
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      picture.className = 'usa-hero__bg-picture';
      block.appendChild(picture);
    }
  }

  // Create grid container
  const gridContainer = document.createElement('div');
  gridContainer.className = 'grid-container';

  // Create callout box
  const callout = document.createElement('div');
  callout.className = 'usa-hero__callout';

  // Process heading with optional "callout" prefix
  if (heading) {
    const newHeading = document.createElement('h1');
    newHeading.className = 'usa-hero__heading';

    // Check if heading text has a colon (e.g., "Hero callout:Rest of heading")
    const headingText = heading.textContent.trim();
    const colonIndex = headingText.indexOf(':');

    if (colonIndex > 0) {
      // Split into callout prefix and main heading
      const calloutText = headingText.substring(0, colonIndex + 1);
      const mainText = headingText.substring(colonIndex + 1).trim();

      const altSpan = document.createElement('span');
      altSpan.className = 'usa-hero__heading--alt';
      altSpan.textContent = calloutText;

      newHeading.appendChild(altSpan);
      newHeading.appendChild(document.createTextNode(mainText));
    } else {
      // No colon, use entire text as heading
      newHeading.textContent = headingText;
    }

    callout.appendChild(newHeading);
  }

  // Add paragraph
  if (paragraph) {
    const newParagraph = document.createElement('p');
    newParagraph.textContent = paragraph.textContent;
    callout.appendChild(newParagraph);
  }

  // Add call-to-action button
  if (link) {
    const button = document.createElement('a');
    button.className = 'usa-button';
    button.href = link.href;
    button.textContent = link.textContent;
    callout.appendChild(button);
  }

  // Assemble structure
  gridContainer.appendChild(callout);
  block.appendChild(gridContainer);

  // Decorative background video. Skipped on mobile (< 900px) to match the live
  // site and on reduced-motion. Authored video URL takes precedence over the
  // default; block.dataset.bgVideo (block option) takes precedence over both.
  const videoSrc = block.dataset.bgVideo || authoredVideoSrc || '/videos/ar-gov-hero.mp4';
  const prefersReducedMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia && window.matchMedia('(max-width: 899px)').matches;
  if (videoSrc && !prefersReducedMotion && !isMobile) {
    const video = document.createElement('video');
    video.className = 'usa-hero__video';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('tabindex', '-1');
    const source = document.createElement('source');
    source.src = `${videoSrc}#t=1`;
    source.type = 'video/mp4';
    video.appendChild(source);
    block.insertBefore(video, block.firstChild);
  }
}
