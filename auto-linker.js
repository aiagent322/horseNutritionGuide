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
      href: 'ingredients/beet-pulp.html', title: 'Beet Pulp — ingredient detail' },
    { terms: ['Soybean Hulls', 'Soybean Hull'],
      href: 'ingredients/soybean-hulls.html', title: 'Soybean Hulls — ingredient detail' },
    { terms: ['Soybean Meal', 'Dehulled Soybean Meal'],
      href: 'ingredients/soybean-meal.html', title: 'Soybean Meal — ingredient detail' },
    { terms: ['Alfalfa Meal', 'Dehydrated Alfalfa Meal', 'Dehydrated Alfalfa'],
      href: 'ingredients/alfalfa-meal.html', title: 'Alfalfa Meal — ingredient detail' },
    { terms: ['Rice Bran', 'Stabilized Rice Bran'],
      href: 'ingredients/rice-bran.html', title: 'Rice Bran — ingredient detail' },
    { terms: ['Ground Flaxseed', 'Stabilized Milled Flaxseed', 'Flaxseed', 'Linseed', 'Ground Flax'],
      href: 'ingredients/flaxseed.html', title: 'Flaxseed — ingredient detail' },
    { terms: ['Cane Molasses', 'Molasses'],
      href: 'ingredients/molasses.html', title: 'Molasses — ingredient detail' },
    { terms: ['Vegetable Oil', 'Soybean Oil'],
      href: 'ingredients/vegetable-oil.html', title: 'Vegetable Oil — ingredient detail' },
    { terms: ['Yeast Culture', 'Saccharomyces cerevisiae', 'Active Dried Yeast', 'Brewers Dried Yeast'],
      href: 'ingredients/yeast-culture.html', title: 'Yeast Culture — ingredient detail' },
    { terms: ['Dicalcium Phosphate', 'Monocalcium Phosphate', 'Calcium Phosphate'],
      href: 'ingredients/dicalcium-phosphate.html', title: 'Dicalcium Phosphate — ingredient detail' },
    { terms: ['Limestone', 'Calcium Carbonate'],
      href: 'ingredients/limestone.html', title: 'Limestone / Calcium Carbonate — ingredient detail' },
    { terms: ['Ground Oats', 'Steam Crimped Oats', 'Steam Rolled Oats', 'Whole Oats'],
      href: 'ingredients/oats.html', title: 'Oats — ingredient detail' },
    { terms: ['Ground Corn', 'Steam-Flaked Corn', 'Flaked Corn'],
      href: 'ingredients/corn.html', title: 'Corn — ingredient detail' },
    { terms: ['Steam Rolled Barley', 'Ground Barley', 'Rolled Barley'],
      href: 'ingredients/barley.html', title: 'Barley — ingredient detail' },
    { terms: ['Biotin'],
      href: 'ingredients/biotin.html', title: 'Biotin — ingredient detail' },
    { terms: ['Probiotics', 'Lactobacillus', 'Enterococcus', 'Bifidobacterium'],
      href: 'ingredients/probiotics.html', title: 'Probiotics — ingredient detail' },

    // ── Glossary: health conditions
    { terms: ['Equine Metabolic Syndrome', 'EMS'],
      href: 'glossary.html#conditions', title: 'EMS — see glossary' },
    { terms: ['Insulin Resistance', 'insulin-resistant'],
      href: 'glossary.html#conditions', title: 'Insulin Resistance — see glossary' },
    { terms: ['PPID', "Cushing's disease", "Cushing's"],
      href: 'glossary.html#conditions', title: "Cushing's / PPID — see glossary" },
    { terms: ['Laminitis', 'laminitic'],
      href: 'glossary.html#conditions', title: 'Laminitis — see glossary' },
    { terms: ['PSSM', 'Polysaccharide Storage Myopathy'],
      href: 'glossary.html#conditions', title: 'PSSM — see glossary' },
    { terms: ['RER', 'Recurrent Exertional Rhabdomyolysis', 'tying-up', 'tying up'],
      href: 'glossary.html#conditions', title: 'RER / Tying-Up — see glossary' },
    { terms: ['EMND', 'Equine Motor Neuron Disease'],
      href: 'glossary.html#conditions', title: 'EMND — see glossary' },
    { terms: ['Hindgut Acidosis'],
      href: 'glossary.html#conditions', title: 'Hindgut Acidosis — see glossary' },

    // ── Glossary: label terms
    { terms: ['NSC', 'Non-Structural Carbohydrates'],
      href: 'glossary.html#label-terms', title: 'NSC — see glossary' },
    { terms: ['WSC', 'Water-Soluble Carbohydrates'],
      href: 'glossary.html#label-terms', title: 'WSC — see glossary' },
    { terms: ['ADF', 'Acid Detergent Fiber'],
      href: 'glossary.html#label-terms', title: 'ADF — see glossary' },
    { terms: ['NDF', 'Neutral Detergent Fiber'],
      href: 'glossary.html#label-terms', title: 'NDF — see glossary' },
    { terms: ['Ration Balancer'],
      href: 'glossary.html#label-terms', title: 'Ration Balancer — see glossary' },
    { terms: ['Complete Feed'],
      href: 'glossary.html#label-terms', title: 'Complete Feed — see glossary' },

    // ── Glossary: nutrients
    { terms: ['Vitamin E', 'd-alpha-tocopherol', 'dl-alpha-tocopherol'],
      href: 'glossary.html#nutrients', title: 'Vitamin E — see glossary' },
    { terms: ['Vitamin A'],
      href: 'glossary.html#nutrients', title: 'Vitamin A — see glossary' },
    { terms: ['Selenium', 'Selenium Yeast', 'Sodium Selenite'],
      href: 'glossary.html#nutrients', title: 'Selenium — see glossary' },
    { terms: ['Chelated', 'Proteinate', 'chelate'],
      href: 'glossary.html#nutrients', title: 'Chelated Minerals — see glossary' },
    { terms: ['Lysine', 'L-Lysine'],
      href: 'glossary.html#amino-acids', title: 'Lysine — see glossary' },
    { terms: ['Methionine', 'DL-Methionine'],
      href: 'glossary.html#amino-acids', title: 'Methionine — see glossary' },

    // ── Glossary: digestion
    { terms: ['hindgut', 'Hindgut'],
      href: 'glossary.html#digestion', title: 'Hindgut — see glossary' },
    { terms: ['Volatile Fatty Acids', 'VFAs', 'VFA'],
      href: 'glossary.html#digestion', title: 'Volatile Fatty Acids — see glossary' },
    { terms: ['Prebiotic', 'Prebiotics'],
      href: 'glossary.html#digestion', title: 'Prebiotic — see glossary' },
    { terms: ['Probiotic', 'Probiotics'],
      href: 'glossary.html#digestion', title: 'Probiotic — see glossary' },
    { terms: ['Yeast Culture'],
      href: 'glossary.html#digestion', title: 'Yeast Culture — see glossary' },
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
  // Skips content already inside an <a> or <strong> or <code> tag
  function autoLink(html) {
    if (!html) return html;

    // Split on existing tags to avoid double-linking inside them
    // Strategy: split into [text, tag, text, tag...] chunks
    // Only process text chunks
    const chunks = html.split(/(<[^>]+>)/);
    let insideAnchor = false;

    return chunks.map(function (chunk) {
      // It's a tag
      if (chunk.startsWith('<')) {
        if (/^<a[\s>]/i.test(chunk))  insideAnchor = true;
        if (/^<\/a>/i.test(chunk))    insideAnchor = false;
        return chunk;
      }
      // It's text — skip if inside a link
      if (insideAnchor) return chunk;

      let result = chunk;
      FLAT_LINKS.forEach(function (entry) {
        // Word-boundary aware replacement, case-sensitive for acronyms
        const escaped = entry.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // For short uppercase acronyms (EMS, NSC etc.) require word boundary
        // For mixed-case terms, case-insensitive but preserve original
        const flags = entry.term === entry.term.toUpperCase() && entry.term.length <= 5
          ? 'g' : 'gi';
        const re = new RegExp('(?<![\\w/])(' + escaped + ')(?![\\w])', flags);
        // Only replace FIRST occurrence per term per chunk to avoid spamming links
        let replaced = false;
        result = result.replace(re, function (match) {
          if (replaced) return match;
          replaced = true;
          return '<a href="' + entry.href + '" class="auto-link" title="' + entry.title + '" target="_blank">' + match + '</a>';
        });
      });
      return result;
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
