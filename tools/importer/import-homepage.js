/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsParser from './parsers/cards.js';
import columnsParser from './parsers/columns.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/governor-arkansas-cleanup.js';
import sectionsTransformer from './transformers/governor-arkansas-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Arkansas Governor homepage: header/nav, hero with video background and tagline, quick-link tiles, governor bio section, latest press releases grid, and footer.',
  urls: [
    'https://governor.arkansas.gov/',
  ],
  blocks: [
    {
      name: 'hero',
      instances: ['.elementor-element-1766795'],
    },
    {
      name: 'cards',
      instances: ['.elementor-element-2a743ae', '.elementor-element-3513c3b'],
    },
    {
      name: 'columns',
      instances: ['.elementor-element-1919351'],
    },
  ],
  sections: [
    {
      id: 'hero',
      name: 'Hero',
      selector: '.elementor-element-1766795',
      style: null,
      blocks: ['hero'],
      defaultContent: [],
    },
    {
      id: 'quick-link-tiles',
      name: 'Quick Link Tiles',
      selector: '.elementor-element-2a743ae',
      style: null,
      blocks: ['cards'],
      defaultContent: [],
    },
    {
      id: 'governor-bio',
      name: 'Governor Bio',
      selector: '.elementor-element-1919351',
      style: null,
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'latest-news',
      name: 'Latest News',
      selector: '.elementor-element-190566a',
      style: 'dark',
      blocks: ['cards'],
      defaultContent: ['.elementor-element-190566a .elementor-widget-divider'],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  hero: heroParser,
  cards: cardsParser,
  columns: columnsParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by a prior parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index',
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
