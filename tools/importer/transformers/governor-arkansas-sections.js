/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: governor-arkansas section breaks + section metadata.
 *
 * The homepage template defines 4 sections (page-templates.json):
 *   1. hero             .elementor-element-1766795   style: null
 *   2. quick-link-tiles .elementor-element-2a743ae   style: null
 *   3. governor-bio     .elementor-element-1919351   style: null
 *   4. latest-news      .elementor-element-190566a   style: "dark"
 *
 * For each section (processed in reverse document order so earlier inserts do
 * not shift later ones):
 *   - Insert an <hr> before the section element when it is not the first
 *     section (expected: sections.length - 1 = 3 breaks).
 *   - When the section has a `style`, append a Section Metadata block after the
 *     section element (expected: 1 block, for latest-news -> "dark").
 *
 * Section selectors are sourced from payload.template.sections and were all
 * verified present in migration-work/cleaned.html.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const template = payload && payload.template;
    const sections = (template && template.sections) || [];
    if (sections.length < 2) return;

    const doc = element.ownerDocument;

    // Process in reverse so inserts before/after a section do not disturb the
    // positions of sections we have not handled yet.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section || !section.selector) continue;

      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;

      // Section Metadata block for sections that declare a style.
      if (section.style) {
        const block = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        if (sectionEl.nextSibling) {
          sectionEl.parentNode.insertBefore(block, sectionEl.nextSibling);
        } else {
          sectionEl.parentNode.appendChild(block);
        }
      }

      // Section break before every section except the first.
      if (i > 0) {
        const hr = doc.createElement('hr');
        sectionEl.parentNode.insertBefore(hr, sectionEl);
      }
    }
  }
}
