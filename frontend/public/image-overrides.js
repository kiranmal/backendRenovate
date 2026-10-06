/**
 * Image Overrides Runtime
 * Fetches override map from backend and applies it to the live website
 * by replacing <img> src and CSS background-image URLs via MutationObserver.
 * Loaded as a plain script in index.html (no module/bundler needed).
 */
(function () {
  var API_BASE = (window.__ADM_API__ || 'http://localhost:5000/api').replace(/\/api$/, '');
  var overrides = {};
  var extras = {};
  var applied = false;

  function resolveUrl(src) {
    if (!src) return src;
    // Check for override by exact path match
    if (overrides[src]) return overrides[src];
    return src;
  }

  function applyToImg(img) {
    var src = img.getAttribute('src') || '';
    var resolved = resolveUrl(src);
    if (resolved !== src) {
      img.setAttribute('src', resolved);
    }
  }

  function applyToBackground(el) {
    var bg = el.style.backgroundImage || '';
    if (!bg || bg === 'none') return;
    var match = bg.match(/url\(['"]?([^'")]+)['"]?\)/);
    if (!match) return;
    var original = match[1];
    var resolved = resolveUrl(original);
    if (resolved !== original) {
      el.style.backgroundImage = bg.replace(original, resolved);
    }
  }

  function applyAll() {
    injectExtras();
    document.querySelectorAll('img[src]').forEach(applyToImg);
    document.querySelectorAll('[style*="background-image"]').forEach(applyToBackground);
    // Also check elements with background-image set via CSS classes (harder — skip for now)
  }

  // Inject admin-added "extra" images into card grids. Each extra group is
  // anchored to a static image already on the page — we find that image's
  // card element, clone it, and append a new card with the new image.
  function injectExtras() {
    Object.keys(extras).forEach(function (key) {
      var ex = extras[key];
      if (!ex || !ex.anchor || !ex.items || !ex.items.length) return;
      var anchorResolved = resolveUrl(ex.anchor);
      var imgs = document.querySelectorAll('img');
      for (var i = 0; i < imgs.length; i++) {
        var src = imgs[i].getAttribute('src') || '';
        if (src !== ex.anchor && src !== anchorResolved) continue;
        var card = imgs[i].closest('article') || imgs[i].closest('.card') || imgs[i].parentElement;
        if (!card) return;
        var grid = card.parentElement;
        ex.items.forEach(function (item) {
          if (!item.src) return;
          // Skip if already injected
          var existing = grid.querySelectorAll('img');
          for (var j = 0; j < existing.length; j++) {
            if (existing[j].getAttribute('src') === item.src) return;
          }
          var clone = card.cloneNode(true);
          var cimg = clone.querySelector('img');
          if (cimg) { cimg.setAttribute('src', item.src); cimg.alt = item.label || ''; }
          var h = clone.querySelector('h3'); if (h && item.label) h.textContent = item.label;
          var p = clone.querySelector('p'); if (p) p.textContent = item.text || '';
          clone.setAttribute('data-extra-img', '1');
          grid.appendChild(clone);
        });
        return;
      }
    });
  }

  function observe() {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        var shouldInject = false;
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.tagName === 'IMG') applyToImg(node);
          else {
            node.querySelectorAll && node.querySelectorAll('img[src]').forEach(applyToImg);
            node.querySelectorAll && node.querySelectorAll('[style*="background-image"]').forEach(applyToBackground);
          }
          if (!node.hasAttribute || !node.hasAttribute('data-extra-img')) shouldInject = true;
        });
        // New content rendered (e.g. React async render) — retry extras injection
        if (shouldInject && Object.keys(extras).length) injectExtras();
        if (m.type === 'attributes' && m.attributeName === 'src' && m.target.tagName === 'IMG') {
          applyToImg(m.target);
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  }

  function init() {
    if (applied) return;
    applied = true;
    applyAll();
    observe();
  }

  // Fetch overrides + extras from backend
  Promise.all([
    fetch(API_BASE + '/api/content/image-overrides').then(function (r) { return r.json(); }).catch(function () { return null; }),
    fetch(API_BASE + '/api/content/image-extras').then(function (r) { return r.json(); }).catch(function () { return null; }),
  ]).then(function (results) {
    var ov = results[0], ex = results[1];
    if (ov && ov.success && ov.data) overrides = ov.data;
    if (ex && ex.success && ex.data) extras = ex.data;
    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init);
  }).catch(function () { /* backend may be down — use original images */ });
})();
