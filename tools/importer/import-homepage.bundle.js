/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const heading = element.querySelector("h1.elementor-heading-title, h1, .elementor-widget-heading h1");
    const blockquote = element.querySelector("blockquote.elementor-blockquote, blockquote");
    const link = element.querySelector(
      ".elementor-widget-button a, a.elementor-button, a.usa-button"
    );
    let bgImage = null;
    const directImgs = Array.from(element.querySelectorAll(":scope > img, :scope > .e-con-inner > img"));
    bgImage = directImgs.find((img) => {
      if (img.closest(".elementor-shape")) return false;
      const src = img.getAttribute("src") || "";
      if (src.startsWith("data:")) return false;
      return true;
    }) || null;
    if (!heading && !blockquote) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) {
      if (!bgImage.getAttribute("alt")) {
        bgImage.setAttribute("alt", "");
      }
      cells.push([bgImage]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (blockquote) contentCell.push(blockquote);
    if (link) contentCell.push(link);
    cells.push(contentCell);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document }) {
    const cells = [];
    const buildTitleHeading = (titleText, href) => {
      const h = document.createElement("h4");
      if (href) {
        const a = document.createElement("a");
        a.setAttribute("href", href);
        a.textContent = titleText;
        h.appendChild(a);
      } else {
        h.textContent = titleText;
      }
      return h;
    };
    const articles = Array.from(element.querySelectorAll('article.dce-post-item, article[class*="news_post"], article'));
    if (articles.length) {
      articles.forEach((article) => {
        const link = article.querySelector("a[href]");
        const href = link ? link.getAttribute("href") : null;
        let titleEl = article.querySelector(".elementor-element-2a4c3033 .elementor-heading-title");
        if (!titleEl) {
          const headings = Array.from(article.querySelectorAll(".elementor-heading-title"));
          titleEl = headings.find((h) => !/^\s*read more/i.test(h.textContent || "")) || null;
        }
        const titleText = titleEl ? (titleEl.textContent || "").trim() : "";
        const timeEl = article.querySelector("time");
        const excerptEl = article.querySelector(".dce-content-wrapper, .dce-content");
        const excerptText = excerptEl ? (excerptEl.textContent || "").trim() : "";
        if (!titleText && !excerptText) return;
        const content = [];
        content.push(buildTitleHeading(titleText, href));
        if (timeEl) {
          content.push(timeEl);
        }
        if (excerptText) {
          const p = document.createElement("p");
          p.textContent = excerptText;
          content.push(p);
        }
        cells.push([content]);
      });
    } else {
      const tiles = Array.from(element.querySelectorAll('a[data-dce-background-image-url], a[href][role="button"], :scope a[href]'));
      tiles.forEach((tile) => {
        const href = tile.getAttribute("href");
        const titleEl = tile.querySelector(".elementor-heading-title, p, h1, h2, h3, h4, h5, h6");
        const titleText = titleEl ? (titleEl.textContent || "").trim() : "";
        if (!href && !titleText) return;
        const bgUrl = tile.getAttribute("data-dce-background-image-url");
        const contentCell = [buildTitleHeading(titleText, href)];
        if (bgUrl) {
          const img = document.createElement("img");
          img.setAttribute("src", bgUrl);
          img.setAttribute("alt", titleText || "");
          cells.push([[img], contentCell]);
        } else {
          cells.push([contentCell]);
        }
      });
    }
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse3(element, { document }) {
    const textCell = [];
    const eyebrowSource = element.querySelector(".elementor-divider__text, .elementor-divider__element");
    if (eyebrowSource) {
      const eyebrowText = eyebrowSource.textContent.trim().replace(/\s+/g, " ");
      if (eyebrowText) {
        const eyebrow = document.createElement("p");
        eyebrow.textContent = eyebrowText;
        textCell.push(eyebrow);
      }
    }
    const heading = element.querySelector(".elementor-widget-heading h2, h2");
    if (heading) textCell.push(heading);
    const bioParagraphs = element.querySelectorAll(
      ".elementor-widget-text-editor .elementor-widget-container p"
    );
    bioParagraphs.forEach((p) => {
      if (p.textContent.trim()) textCell.push(p);
    });
    const ctaSource = element.querySelector(
      ".elementor-widget-button a.elementor-button, .elementor-button-wrapper a, a.elementor-button"
    );
    if (ctaSource) {
      const cta = document.createElement("a");
      cta.href = ctaSource.getAttribute("href");
      cta.textContent = ctaSource.textContent.trim().replace(/\s+/g, " ");
      if (cta.textContent) textCell.push(cta);
    }
    const imageCell = [];
    const img = element.querySelector(".elementor-widget-image img, img");
    if (img) {
      if (!img.getAttribute("alt") || !img.getAttribute("alt").trim()) {
        img.setAttribute("alt", "Governor Sarah Huckabee Sanders");
      }
      imageCell.push(img);
    }
    if (textCell.length === 0 && imageCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[textCell, imageCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/governor-arkansas-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".elementor-background-video-container",
        "video.elementor-background-video-hosted"
      ]);
      WebImporter.DOMUtils.remove(element, [".elementor-shape"]);
      WebImporter.DOMUtils.remove(element, [
        ".grecaptcha-badge",
        "textarea.g-recaptcha-response",
        'iframe[title="reCAPTCHA"]'
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.elementor-location-header",
        "footer.elementor-location-footer"
      ]);
      WebImporter.DOMUtils.remove(element, [".skip-link.screen-reader-text"]);
      WebImporter.DOMUtils.remove(element, [".elementor-menu-anchor"]);
      WebImporter.DOMUtils.remove(element, [
        "#elementor-device-mode",
        "#search-filter-svg-template",
        'img[src^="data:image/svg+xml"]',
        "link",
        "iframe",
        "noscript",
        "script"
      ]);
      element.querySelectorAll("[style], [data-settings], [data-element_type], [data-id], [data-widget_type]").forEach((el) => {
        el.removeAttribute("style");
        el.removeAttribute("data-settings");
        el.removeAttribute("data-element_type");
        el.removeAttribute("data-id");
        el.removeAttribute("data-widget_type");
      });
    }
  }

  // tools/importer/transformers/governor-arkansas-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const template = payload && payload.template;
      const sections = template && template.sections || [];
      if (sections.length < 2) return;
      const doc = element.ownerDocument;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section || !section.selector) continue;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        if (section.style) {
          const block = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          if (sectionEl.nextSibling) {
            sectionEl.parentNode.insertBefore(block, sectionEl.nextSibling);
          } else {
            sectionEl.parentNode.appendChild(block);
          }
        }
        if (i > 0) {
          const hr = doc.createElement("hr");
          sectionEl.parentNode.insertBefore(hr, sectionEl);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Arkansas Governor homepage: header/nav, hero with video background and tagline, quick-link tiles, governor bio section, latest press releases grid, and footer.",
    urls: [
      "https://governor.arkansas.gov/"
    ],
    blocks: [
      {
        name: "hero",
        instances: [".elementor-element-1766795"]
      },
      {
        name: "cards",
        instances: [".elementor-element-2a743ae", ".elementor-element-3513c3b"]
      },
      {
        name: "columns",
        instances: [".elementor-element-1919351"]
      }
    ],
    sections: [
      {
        id: "hero",
        name: "Hero",
        selector: ".elementor-element-1766795",
        style: null,
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "quick-link-tiles",
        name: "Quick Link Tiles",
        selector: ".elementor-element-2a743ae",
        style: null,
        blocks: ["cards"],
        defaultContent: []
      },
      {
        id: "governor-bio",
        name: "Governor Bio",
        selector: ".elementor-element-1919351",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "latest-news",
        name: "Latest News",
        selector: ".elementor-element-190566a",
        style: "dark",
        blocks: ["cards"],
        defaultContent: [".elementor-element-190566a .elementor-widget-divider"]
      }
    ]
  };
  var parsers = {
    hero: parse,
    cards: parse2,
    columns: parse3
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
