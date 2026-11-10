'use strict';
// AUTO-LINKER
// Wraps ingredient names, condition terms, and
// nutrition acronyms in decoder output HTML
// with links to ingredient pages and glossary.
// Runs once on rendered output — safe to call
// on any HTML string.
// ─────────────────────────────────────────────
(function () {
  'use strict';

  // ── Link map: term → { href, title }
  // Longer / more specific terms MUST come first
  // so "Soybean Meal" matches before "Soybean"
  const LINK_MAP = [
    // ── Ingredient pages
    { terms: ['Beet Pulp', 'Dried Beet Pulp', 'Dried Plain Beet Pulp'],
      href: '/ingredients/beet-pulp', title: 'Beet Pulp — ingredient detail' },
    { terms: ['Soybean Hulls', 'Soybean Hull'],
      href: '/ingredients/soybean-hulls', title: 'Soybean Hulls — ingredient detail' },
    { terms: ['Soybean Meal', 'Dehulled Soybean Meal'],
      href: '/ingredients/soybean-meal', title: 'Soybean Meal — ingredient detail' },
    { terms: ['Alfalfa Meal', 'Dehydrated Alfalfa Meal', 'Dehydrated Alfalfa'],
      href: '/ingredients/alfalfa-meal', title: 'Alfalfa Meal — ingredient detail' },
    { terms: ['Rice Bran', 'Stabilized Rice Bran'],
      href: '/ingredients/rice-bran', title: 'Rice Bran — ingredient detail' },
    { terms: ['Ground Flaxseed', 'Stabilized Milled Flaxseed', 'Flaxseed', 'Linseed', 'Ground Flax'],
      href: '/ingredients/flaxseed', title: 'Flaxseed — ingredient detail' },
    { terms: ['Cane Molasses', 'Molasses'],
      href: '/ingredients/molasses', title: 'Molasses — ingredient detail' },
    { terms: ['Vegetable Oil', 'Soybean Oil'],
      href: '/ingredients/vegetable-oil', title: 'Vegetable Oil — ingredient detail' },
    { terms: ['Yeast Culture', 'Saccharomyces cerevisiae', 'Active Dried Yeast', 'Brewers Dried Yeast'],
      href: '/ingredients/yeast-culture', title: 'Yeast Culture — ingredient detail' },
    { terms: ['Dicalcium Phosphate', 'Monocalcium Phosphate', 'Calcium Phosphate'],
      href: '/ingredients/dicalcium-phosphate', title: 'Dicalcium Phosphate — ingredient detail' },
    { terms: ['Limestone', 'Calcium Carbonate'],
      href: '/ingredients/limestone', title: 'Limestone / Calcium Carbonate — ingredient detail' },
    { terms: ['Ground Oats', 'Steam Crimped Oats', 'Steam Rolled Oats', 'Whole Oats'],
      href: '/ingredients/oats', title: 'Oats — ingredient detail' },
    { terms: ['Ground Corn', 'Steam-Flaked Corn', 'Flaked Corn'],
      href: '/ingredients/corn', title: 'Corn — ingredient detail' },
    { terms: ['Steam Rolled Barley', 'Ground Barley', 'Rolled Barley'],
      href: '/ingredients/barley', title: 'Barley — ingredient detail' },
    { terms: ['Biotin'],
      href: '/ingredients/biotin', title: 'Biotin — ingredient detail' },
    { terms: ['Probiotics', 'Lactobacillus', 'Enterococcus', 'Bifidobacterium'],
      href: '/ingredients/probiotics', title: 'Probiotics — ingredient detail' },

    // ── Glossary: health conditions
    { terms: ['Equine Metabolic Syndrome', 'EMS'],
      href: '/glossary#conditions', title: 'EMS — see glossary' },
    { terms: ['Insulin Resistance', 'insulin-resistant'],
      href: '/glossary#conditions', title: 'Insulin Resistance — see glossary' },
    { terms: ['PPID', "Cushing's disease", "Cushing's"],
      href: '/glossary#conditions', title: "Cushing's / PPID — see glossary" },
    { terms: ['Laminitis', 'laminitic'],
      href: '/glossary#conditions', title: 'Laminitis — see glossary' },
    { terms: ['PSSM', 'Polysaccharide Storage Myopathy'],
      href: '/glossary#conditions', title: 'PSSM — see glossary' },
    { terms: ['RER', 'Recurrent Exertional Rhabdomyolysis', 'tying-up', 'tying up'],
      href: '/glossary#conditions', title: 'RER / Tying-Up — see glossary' },
    { terms: ['EMND', 'Equine Motor Neuron Disease'],
      href: '/glossary#conditions', title: 'EMND — see glossary' },
    { terms: ['Hindgut Acidosis'],
      href: '/glossary#conditions', title: 'Hindgut Acidosis — see glossary' },

    // ── Glossary: label terms
    { terms: ['NSC', 'Non-Structural Carbohydrates'],
      href: '/glossary#label-terms', title: 'NSC — see glossary' },
    { terms: ['WSC', 'Water-Soluble Carbohydrates'],
      href: '/glossary#label-terms', title: 'WSC — see glossary' },
    { terms: ['ADF', 'Acid Detergent Fiber'],
      href: '/glossary#label-terms', title: 'ADF — see glossary' },
    { terms: ['NDF', 'Neutral Detergent Fiber'],
      href: '/glossary#label-terms', title: 'NDF — see glossary' },
    { terms: ['Ration Balancer'],
      href: '/glossary#label-terms', title: 'Ration Balancer — see glossary' },
    { terms: ['Complete Feed'],
      href: '/glossary#label-terms', title: 'Complete Feed — see glossary' },

    // ── Glossary: nutrients
    { terms: ['Vitamin E', 'd-alpha-tocopherol', 'dl-alpha-tocopherol'],
      href: '/glossary#nutrients', title: 'Vitamin E — see glossary' },
    { terms: ['Vitamin A'],
      href: '/glossary#nutrients', title: 'Vitamin A — see glossary' },
    { terms: ['Selenium', 'Selenium Yeast', 'Sodium Selenite'],
      href: '/glossary#nutrients', title: 'Selenium — see glossary' },
    { terms: ['Chelated', 'Proteinate', 'chelate'],
      href: '/glossary#nutrients', title: 'Chelated Minerals — see glossary' },
    { terms: ['Lysine', 'L-Lysine'],
      href: '/glossary#amino-acids', title: 'Lysine — see glossary' },
    { terms: ['Methionine', 'DL-Methionine'],
      href: '/glossary#amino-acids', title: 'Methionine — see glossary' },

    // ── Glossary: digestion
    { terms: ['hindgut', 'Hindgut'],
      href: '/glossary#digestion', title: 'Hindgut — see glossary' },
    { terms: ['Volatile Fatty Acids', 'VFAs', 'VFA'],
      href: '/glossary#digestion', title: 'Volatile Fatty Acids — see glossary' },
    { terms: ['Prebiotic', 'Prebiotics'],
      href: '/glossary#digestion', title: 'Prebiotic — see glossary' },
    { terms: ['Probiotic', 'Probiotics'],
      href: '/glossary#digestion', title: 'Probiotic — see glossary' },
    { terms: ['Yeast Culture'],
      href: '/glossary#digestion', title: 'Yeast Culture — see glossary' },
  ];

  // ── Build flat sorted list: longest term first to avoid partial matches
  const FLAT_LINKS = [];
  LINK_MAP.forEach(function (entry) {
    entry.terms.forEach(function (term) {
      FLAT_LINKS.push({ term, href: entry.href, title: entry.title });
    });
  });
  FLAT_LINKS.sort(function (a, b) { return b.term.length - a.term.length; });

  // ── Apply links to a plain-text or HTML string
  // Single pass over each text chunk so inserted anchors (and their title attributes)
  // are never matched again. Existing tags and anchor contents are left alone.
  const LINK_RE = (function () {
    const alt = FLAT_LINKS.map(function (e) {
      return e.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('|');
    return new RegExp('(?<![\\w/])(' + alt + ')(?![\\w])', 'gi');
  })();
  const LINK_BY_TERM = {};
  FLAT_LINKS.forEach(function (e) {
    const k = e.term.toLowerCase();
    if (!LINK_BY_TERM[k]) LINK_BY_TERM[k] = e;     // longest-first order: first entry wins
  });
  function isAcronym(term) { return term === term.toUpperCase() && term.length <= 5; }

  function autoLink(html) {
    if (!html) return html;
    const chunks = html.split(/(<[^>]+>)/);
    let insideAnchor = false;

    return chunks.map(function (chunk) {
      if (chunk.startsWith('<')) {
        if (/^<a[\s>]/i.test(chunk))  insideAnchor = true;
        if (/^<\/a>/i.test(chunk))    insideAnchor = false;
        return chunk;
      }
      if (insideAnchor) return chunk;

      const used = {};   // first occurrence per term per chunk only
      return chunk.replace(LINK_RE, function (match) {
        const entry = LINK_BY_TERM[match.toLowerCase()];
        if (!entry) return match;
        if (isAcronym(entry.term) && match !== entry.term) return match;
        const key = entry.term.toLowerCase();
        if (used[key]) return match;
        used[key] = true;
        return '<a href="' + entry.href + '" class="auto-link" title="' + entry.title + '" target="_blank">' + match + '</a>';
      });
    }).join('');
  }

  // ── Run after decode output renders
  function linkifyOutput() {
    const ids = [
      'oc-intro', 'oc-feedtype', 'oc-energy', 'oc-protein',
      'oc-fiber', 'oc-fat', 'oc-sugar', 'oc-vitamins',
      'oc-digestive', 'oc-hoof', 'oc-analysis', 'oc-missing',
      'oc-summary', 'oc-horse-summary',
    ];
    ids.forEach(function (id) {
      const el = document.getElementById(id);
      if (el && el.innerHTML) {
        el.innerHTML = autoLink(el.innerHTML);
      }
    });
  }

  // ── Hook into decodeBtn click — run after output renders
  document.addEventListener('DOMContentLoaded', function () {
    const decodeBtn = document.getElementById('decodeBtn');
    if (decodeBtn) {
      decodeBtn.addEventListener('click', function () {
        // Output renders after a short delay — run linker after it's done
        setTimeout(linkifyOutput, 900);
      });
    }
  });

  window.autoLink      = autoLink;
  window.linkifyOutput = linkifyOutput;

})();
