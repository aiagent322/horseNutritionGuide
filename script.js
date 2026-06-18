/* ============================================
   HorseNutritionGuide.com — script.js
   Rule-based feed label decoder + content engine
   ============================================ */

'use strict';

// ─────────────────────────────────────────────
// INGREDIENT LIBRARY DATA
// ─────────────────────────────────────────────
const INGREDIENT_LIBRARY = [
  {
    name: 'Beet Pulp',
    category: 'Fiber / Energy',
    desc: 'A byproduct of sugar beet processing. The sugar has been extracted, leaving highly digestible fiber. A good "safe" energy source for horses that don\'t tolerate grain well. Typically low in sugar and starch when plain (not molasses-coated).'
  },
  {
    name: 'Soybean Hulls',
    category: 'Fiber',
    desc: 'The outer shell of soybeans. Highly digestible fiber with a low sugar and starch content. Often used in senior or low-starch feeds as a gut-friendly filler and fiber source.'
  },
  {
    name: 'Alfalfa Meal / Dehydrated Alfalfa',
    category: 'Fiber / Protein',
    desc: 'Dried and ground alfalfa. Provides fiber, protein, and calcium. Highly palatable. Adds digestible energy. Horses with calcium-sensitive conditions should have calcium:phosphorus ratios reviewed.'
  },
  {
    name: 'Soybean Meal',
    category: 'Protein',
    desc: 'The high-protein residue left after oil is extracted from soybeans. A very common protein source in horse feeds. Rich in lysine, an essential amino acid horses cannot make on their own.'
  },
  {
    name: 'Rice Bran',
    category: 'Fat / Energy',
    desc: 'The outer layer of the rice grain, high in fat (typically 18–22%). Often stabilized to prevent rancidity. Adds calories and supports coat condition. Contains phytate, which may bind phosphorus — calcium:phosphorus balance matters when feeding large amounts.'
  },
  {
    name: 'Flaxseed / Linseed',
    category: 'Fat / Omega-3',
    desc: 'Seeds high in omega-3 fatty acids (alpha-linolenic acid). Supports skin, coat, and has anti-inflammatory properties. Should be ground or heat-treated for maximum absorption. Often seen in feeds targeting coat and hoof quality.'
  },
  {
    name: 'Oats',
    category: 'Grain / Starch Energy',
    desc: 'One of the most traditional horse grains. Moderate starch content compared to corn or barley, with a fibrous hull that makes them more digestible. Still a starch source — relevant for horses with insulin issues or laminitis.'
  },
  {
    name: 'Corn',
    category: 'Grain / Starch Energy',
    desc: 'High energy, high starch grain. Calorie-dense and highly palatable. More starch per pound than oats or barley. May be listed as ground corn, flaked corn, or steam-flaked corn. Not ideal for horses with metabolic conditions.'
  },
  {
    name: 'Barley',
    category: 'Grain / Starch Energy',
    desc: 'A grain commonly used in horse feeds. Higher starch than oats but lower than corn. Often processed (rolled, flaked, or steam-flaked) to improve digestibility. A starch source relevant for metabolic horses.'
  },
  {
    name: 'Molasses',
    category: 'Sugar / Palatability',
    desc: 'A byproduct of sugar refining. Used in horse feeds primarily for palatability (horses like the taste) and to reduce dust. Adds sugar — relevant for horses with insulin resistance, PPID, or laminitis risk. Feeds with molasses listed early in the ingredient list contain more of it.'
  },
  {
    name: 'Vegetable Oil',
    category: 'Fat / Energy',
    desc: 'A concentrated source of fat calories. Adds energy without increasing starch. Supports coat quality. Often added to performance feeds or weight-gain formulas. Source varies (soy, canola, sunflower) but is not always specified.'
  },
  {
    name: 'Salt',
    category: 'Mineral / Electrolyte',
    desc: 'Sodium chloride — an essential electrolyte for muscle and nerve function. Horses need salt daily. Its presence in feed does not eliminate the need for free-choice salt access, as individual requirements vary.'
  },
  {
    name: 'Limestone',
    category: 'Mineral / Calcium',
    desc: 'A source of calcium (calcium carbonate). Calcium is essential for bone, muscle, and nerve function. Balancing calcium to phosphorus in the overall diet is important — the ideal ratio is approximately 1.5–2:1 (calcium:phosphorus).'
  },
  {
    name: 'Dicalcium Phosphate',
    category: 'Mineral / Phosphorus & Calcium',
    desc: 'Provides both calcium and phosphorus. Often used to balance the calcium:phosphorus ratio in a feed, especially when high-calcium ingredients like alfalfa are present.'
  },
  {
    name: 'Yeast Culture',
    category: 'Digestive Support',
    desc: 'A fermentation product (often Saccharomyces cerevisiae). Supports the hindgut microbial environment. May improve fiber digestion. A common ingredient in feeds marketed as digestively supportive.'
  },
  {
    name: 'Probiotics / Lactobacillus',
    category: 'Digestive Support',
    desc: 'Live beneficial microorganisms. Intended to support a healthy hindgut bacterial population. Stability and viability in pelleted feeds can vary — a veterinarian or nutritionist can advise on whether a standalone probiotic supplement may be more effective.'
  },
  {
    name: 'Biotin',
    category: 'Hoof / Coat Support (Vitamin B7)',
    desc: 'A B vitamin frequently linked to hoof wall integrity and quality. Often added to feeds marketed for hoof support. Research supports its role in hoof horn synthesis. Also supports skin and coat.'
  },
  {
    name: 'Copper',
    category: 'Mineral / Trace',
    desc: 'Essential for connective tissue synthesis, pigmentation, and immune function. Horses on high-iron diets (including many hay sources) may require extra copper. Also plays a role in hoof quality and coat color.'
  },
  {
    name: 'Zinc',
    category: 'Mineral / Trace',
    desc: 'Important for skin, hoof, and coat health, as well as immune function and enzyme activity. Often paired with copper on the label. The zinc:copper ratio in the diet matters — typically a 3–4:1 ratio is recommended.'
  },
  {
    name: 'Selenium',
    category: 'Mineral / Trace (Critical)',
    desc: 'An essential antioxidant mineral with a narrow safe range. Deficiency causes muscle problems (white muscle disease); excess causes toxicity (selenosis). Selenium content on labels is expressed in mg/kg or ppm. Soil selenium levels vary widely by region, making this a key item to discuss with your vet or nutritionist.'
  },
  {
    name: 'Vitamin E',
    category: 'Vitamin / Antioxidant',
    desc: 'A fat-soluble antioxidant critical for muscle health, immune function, and neurological health. Fresh pasture is the best natural source — horses without pasture access often need supplementation. Natural vitamin E (d-alpha-tocopherol) is more bioavailable than synthetic forms (dl-alpha-tocopherol).'
  }
];

// ─────────────────────────────────────────────
// GUARANTEED ANALYSIS GUIDE DATA
// ─────────────────────────────────────────────
const ANALYSIS_GUIDE = [
  {
    term: 'Crude Protein',
    unit: 'Minimum % (min)',
    desc: 'The minimum protein content guaranteed by the manufacturer. This is a legal minimum — actual protein may be higher. Adult horses at maintenance typically need 8–10% crude protein; performance horses or lactating mares may need more. The quality of the protein source matters as much as the percentage.'
  },
  {
    term: 'Crude Fat',
    unit: 'Minimum % (min)',
    desc: 'The minimum fat content. Fat is a concentrated energy source — about 2.25x the calories of carbohydrates per pound. Higher fat feeds (7%+) are often used for weight gain or performance. Fat is not harmful to horses and does not cause insulin spikes the way sugar and starch do.'
  },
  {
    term: 'Crude Fiber',
    unit: 'Maximum % (max)',
    desc: 'The maximum fiber content. In horse feeds, this is a ceiling — actual fiber may be lower. Higher crude fiber (15%+) often indicates a feed with significant forage ingredients like beet pulp, soybean hulls, or alfalfa. Crude fiber does not measure all digestible fiber — it underestimates beet pulp and soybean hulls specifically.'
  },
  {
    term: 'Calcium',
    unit: 'Min and Max % listed',
    desc: 'An essential mineral for bone, muscle contraction, and nerve signaling. The ratio of calcium to phosphorus in the overall diet should be approximately 1.5–2:1. High-calcium feeds (alfalfa-based) can disrupt this balance if fed alongside other high-calcium hays.'
  },
  {
    term: 'Phosphorus',
    unit: 'Minimum % (min)',
    desc: 'Works with calcium for bone health. Excess phosphorus relative to calcium ("inverted ratio") is a concern, particularly with grain-heavy diets. Rice bran, wheat bran, and grains are high in phosphorus.'
  },
  {
    term: 'Salt (NaCl)',
    unit: 'Min and Max % listed',
    desc: 'Sodium chloride. Listed as both a minimum and maximum because salt has a narrow ideal range. The presence of salt in feed doesn\'t replace free-choice salt access — sweating horses may need substantially more than what\'s in a concentrated feed.'
  },
  {
    term: 'Selenium',
    unit: 'mg/kg or ppm',
    desc: 'Typically listed as a minimum in mg/kg (or ppm). Safe upper limit for horses is approximately 2 mg/day total from all sources. If your hay or pasture comes from a high-selenium area, total selenium intake from all sources should be reviewed with a professional.'
  },
  {
    term: 'Copper',
    unit: 'mg/kg or ppm',
    desc: 'A trace mineral important for hoof, connective tissue, and pigmentation. Often listed alongside zinc. Typical adequate range is 50–75 mg/kg in the total diet. High iron in hay can interfere with copper absorption.'
  },
  {
    term: 'Zinc',
    unit: 'mg/kg or ppm',
    desc: 'Works closely with copper. Adequate zinc supports hoof quality, immune function, and skin health. Zinc and copper are often expressed together, and the ratio between them matters for absorption.'
  },
  {
    term: 'Vitamin E',
    unit: 'IU/lb or IU/kg',
    desc: 'Fat-soluble antioxidant. Horses without pasture access are frequently deficient. Look for the form listed — natural vitamin E (d-alpha-tocopherol) is significantly more bioavailable than synthetic (dl-alpha-tocopherol). Adult maintenance horses typically need 1–2 IU/lb body weight daily.'
  },
  {
    term: 'Sugar',
    unit: 'Maximum % (max)',
    desc: 'Water-soluble carbohydrates (WSC). Relevant for horses with insulin resistance, laminitis, EMS, or PPID. The maximum listed is a legal ceiling. Look for feeds with sugar below 10% for metabolic horses.'
  },
  {
    term: 'Starch',
    unit: 'Maximum % (max)',
    desc: 'A complex carbohydrate broken down into glucose during digestion. High starch can cause hindgut acidosis if not fully digested in the small intestine. Relevant for horses prone to colic, PSSM/EPSM, or laminitis. Feeds for these horses are typically formulated at <15% starch.'
  },
  {
    term: 'NSC (Non-Structural Carbohydrate)',
    unit: 'Maximum % (max)',
    desc: 'The sum of starch + sugar (WSC). The most commonly cited carbohydrate figure for metabolic horses. Many equine nutritionists recommend feeds with an NSC below 10–12% for horses with insulin resistance, PPID, or laminitis history. If NSC is not listed, ask the manufacturer.'
  }
];

// ─────────────────────────────────────────────
// EXAMPLE LABEL TEXT
// ─────────────────────────────────────────────
const EXAMPLE_LABEL = `PRODUCT: EquiBalance Senior Complete Feed

INGREDIENTS: Beet Pulp, Soybean Hulls, Dehydrated Alfalfa Meal, Soybean Meal, Ground Oats, Rice Bran, Stabilized Flaxseed, Cane Molasses, Vegetable Oil, Salt, Limestone, Dicalcium Phosphate, Yeast Culture, Lactobacillus Acidophilus, Biotin, Zinc Sulfate, Copper Sulfate, Selenium Yeast, Vitamin E Supplement, Vitamin A Supplement, Vitamin D3 Supplement, Thiamine Mononitrate

GUARANTEED ANALYSIS:
Crude Protein (min)          14.0%
Crude Fat (min)               7.5%
Crude Fiber (max)            18.0%
Calcium (min)                 0.80%
Calcium (max)                 1.30%
Phosphorus (min)              0.50%
Salt (min)                    0.30%
Salt (max)                    0.80%
Selenium (min)                0.3 mg/kg
Copper (min)                 50 mg/kg
Zinc (min)                  150 mg/kg
Vitamin E (min)             250 IU/lb
Sugar (max)                   8.0%
Starch (max)                 12.0%
NSC (max)                    20.0%

FEEDING DIRECTIONS: For a 1,000 lb (450 kg) horse at maintenance, feed 4–6 lbs daily as a complete or partial hay replacement. For horses with limited hay access or poor dentition, feed up to 12 lbs daily divided into 3 equal meals. Always provide fresh, clean water and free-choice salt.

This is a senior complete feed designed for horses with reduced ability to chew long-stem hay.`;

// ─────────────────────────────────────────────
// DECODER INGREDIENT SIGNALS
// ─────────────────────────────────────────────
const SIGNALS = {
  fiberEnergy: [
    'beet pulp', 'soybean hulls', 'alfalfa meal', 'dehydrated alfalfa', 'hay meal',
    'oat hulls', 'alfalfa', 'soybean hull'
  ],
  grainStarch: [
    'corn', 'ground corn', 'flaked corn', 'steam-flaked corn', 'oats', 'ground oats',
    'rolled oats', 'barley', 'wheat', 'wheat middlings', 'grain products',
    'cereal grain', 'oat groats'
  ],
  fat: [
    'rice bran', 'vegetable oil', 'soybean oil', 'flaxseed', 'linseed', 'stabilized fat',
    'stabilized flaxseed', 'flax', 'canola oil', 'fat', 'fish oil'
  ],
  protein: [
    'soybean meal', 'canola meal', 'alfalfa meal', 'linseed meal', 'lysine',
    'methionine', 'threonine', 'dehydrated alfalfa meal'
  ],
  sugar: [
    'molasses', 'cane molasses', 'sugar', 'corn syrup', 'dextrose', 'sucrose'
  ],
  minerals: [
    'salt', 'sodium chloride', 'limestone', 'calcium carbonate', 'dicalcium phosphate',
    'monocalcium phosphate', 'zinc', 'zinc sulfate', 'zinc proteinate',
    'copper', 'copper sulfate', 'copper proteinate', 'manganese', 'selenium',
    'selenium yeast', 'selenium proteinate', 'magnesium', 'magnesium oxide',
    'potassium chloride', 'iodine', 'cobalt', 'iron'
  ],
  vitamins: [
    'vitamin a', 'vitamin d', 'vitamin d3', 'vitamin e', 'vitamin e supplement',
    'biotin', 'thiamine', 'riboflavin', 'niacin', 'folic acid', 'vitamin b',
    'choline', 'pyridoxine', 'cyanocobalamin'
  ],
  digestive: [
    'yeast culture', 'probiotics', 'prebiotics', 'lactobacillus', 'saccharomyces',
    'enterococcus', 'bifidobacterium', 'aspergillus', 'dried fermentation',
    'yeast fermentation', 'mannan oligosaccharides', 'fructooligosaccharides'
  ],
  hoofCoat: [
    'biotin', 'flaxseed', 'linseed', 'omega', 'zinc', 'copper', 'methionine',
    'dl-methionine', 'vegetable oil', 'flax'
  ]
};

// ─────────────────────────────────────────────
// ANALYSIS DETECTION PATTERNS
// ─────────────────────────────────────────────
const ANALYSIS_PATTERNS = [
  { key: 'protein',    label: 'Crude Protein',   regex: /crude\s*protein[^0-9]*([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'fat',        label: 'Crude Fat',        regex: /crude\s*fat[^0-9]*([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'fiber',      label: 'Crude Fiber',      regex: /crude\s*fiber[^0-9]*([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'calcium',    label: 'Calcium (min)',     regex: /calcium[^0-9\n]*?min[^0-9]*([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'phosphorus', label: 'Phosphorus',        regex: /phosphorus[^0-9]*([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'nsc',        label: 'NSC',              regex: /nsc[^0-9]*([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'sugar',      label: 'Sugar',            regex: /sugar[^0-9]*([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'starch',     label: 'Starch',           regex: /starch[^0-9]*([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'vitE',       label: 'Vitamin E',        regex: /vitamin\s*e[^0-9]*([0-9]+\.?[0-9]*)\s*iu/i },
  { key: 'selenium',   label: 'Selenium',         regex: /selenium[^0-9]*([0-9]+\.?[0-9]*)\s*(mg|ppm)/i }
];

// ─────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────
function textLower(str) { return str.toLowerCase(); }

function detectSignals(text, group) {
  const lower = textLower(text);
  return SIGNALS[group].filter(term => lower.includes(textLower(term)));
}

function pill(text, caution = false) {
  return `<span class="tag-pill${caution ? ' caution-pill' : ''}">${text}</span>`;
}

function ul(items) {
  if (!items.length) return '';
  return '<ul>' + items.map(i => `<li>${i}</li>`).join('') + '</ul>';
}

// ─────────────────────────────────────────────
// FEED TYPE CLASSIFIER
// ─────────────────────────────────────────────
function classifyFeedType(text) {
  const lower = textLower(text);

  const types = [];

  if (/\bsenior\b/.test(lower)) types.push({ label: 'Senior Feed', confidence: 'high', reason: '"Senior" appears in the label text, suggesting this feed is formulated for older horses with reduced digestive efficiency or dental limitations.' });
  if (/ration\s*balancer/.test(lower)) types.push({ label: 'Ration Balancer', confidence: 'high', reason: '"Ration balancer" appears in the label. These are low-feeding-rate concentrates designed to provide vitamins, minerals, and protein when fed alongside quality forage.' });
  if (/complete\s*feed/.test(lower)) types.push({ label: 'Complete Feed', confidence: 'high', reason: '"Complete feed" appears in the label. These are designed to partially or fully replace hay and are common for horses with poor dentition.' });

  if (!types.length) {
    const lsc = /(low[\s\-]starch|low[\s\-]sugar|low[\s\-]nsc|controlled[\s\-]starch|controlled[\s\-]carb)/i.test(lower);
    const perf = /(performance|high[\s\-]fat|high[\s\-]calorie|show|endurance|sport)/i.test(lower);

    const fiberCount = detectSignals(text, 'fiberEnergy').length;
    const grainCount = detectSignals(text, 'grainStarch').length;
    const vitCount   = detectSignals(text, 'vitamins').length;
    const fatFound   = detectSignals(text, 'fat').length;

    if (lsc) types.push({ label: 'Low-Starch / Controlled-Carbohydrate Feed', confidence: 'high', reason: 'Language like "low starch," "low sugar," or "controlled starch" appears on the label, indicating this feed was formulated with metabolic or laminitis-risk horses in mind.' });
    if (perf) types.push({ label: 'Performance / Weight-Gain Feed', confidence: 'medium', reason: 'Language associated with performance horses, high fat, or calorie density appears on the label.' });

    if (!types.length) {
      if (fiberCount >= 3 && grainCount <= 1) types.push({ label: 'Fiber-Forward Feed', confidence: 'medium', reason: `Multiple fiber-based ingredients were detected (${fiberCount} signals). This suggests a feed designed around digestible fiber energy rather than grain starch.` });
      else if (grainCount >= 3) types.push({ label: 'Grain/Starch-Forward Feed', confidence: 'medium', reason: `Multiple grain or starch ingredients were detected (${grainCount} signals). This feed appears to use grain as a primary energy source.` });
      else if (vitCount >= 4 && fiberCount <= 1 && grainCount <= 1) types.push({ label: 'Vitamin/Mineral Balancing Feed', confidence: 'medium', reason: 'Several vitamin and mineral sources were detected but fewer calorie-dense ingredients. This may be a supplement or balancer rather than a primary calorie feed.' });
      else types.push({ label: 'General Purpose Feed', confidence: 'low', reason: 'Based on the pasted label text, this appears to be a mixed-use or general-purpose feed. Insufficient label keywords to narrow the classification further.' });
    }
  }

  return types;
}

// ─────────────────────────────────────────────
// EXTRACT GUARANTEED ANALYSIS VALUES
// ─────────────────────────────────────────────
function extractAnalysis(text) {
  const results = {};
  for (const pat of ANALYSIS_PATTERNS) {
    const m = text.match(pat.regex);
    if (m) results[pat.key] = { value: parseFloat(m[1]), label: pat.label };
  }
  return results;
}

// ─────────────────────────────────────────────
// DETECT WHETHER AN INGREDIENT LIST IS PRESENT
// Looks for "INGREDIENTS:" header or a comma-
// separated list of known feed ingredient terms
// that would only appear in an ingredient list,
// not in a guaranteed analysis panel.
// ─────────────────────────────────────────────
function hasIngredientList(text) {
  const lower = textLower(text);
  // Explicit header
  if (/ingredients\s*:/i.test(text)) return true;
  // At least 3 ingredient-list-style terms present
  // (terms that only appear in ingredient lists, not analysis panels)
  const ingredientOnlyTerms = [
    'beet pulp','soybean hull','alfalfa meal','dehydrated alfalfa','oat hull',
    'ground corn','flaked corn','steam-flaked','ground oat','rolled oat',
    'soybean meal','canola meal','linseed meal','rice bran','flaxseed','linseed',
    'vegetable oil','soybean oil','canola oil','molasses','cane molasses',
    'limestone','dicalcium phosphate','monocalcium phosphate','yeast culture',
    'lactobacillus','saccharomyces','aspergillus','wheat middling',
    'distillers','brewers','choline','dl-methionine','l-lysine','l-threonine'
  ];
  const hits = ingredientOnlyTerms.filter(t => lower.includes(t));
  return hits.length >= 2;
}

// ─────────────────────────────────────────────
// EXTRACT INGREDIENT-SECTION TEXT ONLY
// ─────────────────────────────────────────────
function extractIngredientText(text) {
  // Isolate ingredients section by header if present
  const ingMatch = text.match(/ingredients\s*:([\s\S]*?)(?=guaranteed analysis|feeding directions|\n\n\n|$)/i);
  if (ingMatch) return ingMatch[1];
  // No header — strip every line that is an analysis/numeric row
  const analysisTerms = /^\s*(crude|lysine|methionine|threonine|calcium|phosphorus|magnesium|potassium|iron|selenium|zinc|copper|manganese|vitamin|biotin|lactobacillus|saccharomyces|nsc|sugar|starch|salt|sodium|iodine|cobalt)/i;
  const numericLine   = /[\d]+\.?[\d]*\s*(%|ppm|iu\/|mg\/|cfu)/i;
  const lines = text.split('\n').filter(line => {
    if (analysisTerms.test(line)) return false;
    if (numericLine.test(line))   return false;
    return true;
  });
  return lines.join('\n');
}

// ─────────────────────────────────────────────
// MAIN DECODE FUNCTION
// ─────────────────────────────────────────────
function decodeLabel(text) {

  const hasIngList  = hasIngredientList(text);
  const ingText     = hasIngList ? extractIngredientText(text) : '';

  // Run ingredient signals ONLY against ingredient text, not full text
  // This prevents "crude fat", "crude fiber" from triggering fat/fiber signals
  const fiberFound   = hasIngList ? detectSignals(ingText, 'fiberEnergy') : [];
  const grainFound   = hasIngList ? detectSignals(ingText, 'grainStarch') : [];
  const fatFound     = hasIngList ? detectSignals(ingText, 'fat')         : [];
  const proteinFound = hasIngList ? detectSignals(ingText, 'protein')     : [];
  const sugarFound   = hasIngList ? detectSignals(ingText, 'sugar')       : [];

  // Vitamins, minerals, digestive support can legitimately appear in analysis panel
  // but still run against full text — we handle false positives in output logic
  const mineralFound = detectSignals(text, 'minerals');
  const vitaminFound = detectSignals(text, 'vitamins');
  const digestFound  = detectSignals(text, 'digestive');
  const hoofFound    = hasIngList ? detectSignals(ingText, 'hoofCoat') :
                       detectSignals(text, 'hoofCoat'); // biotin/zinc/copper show in analysis too

  const feedTypes = classifyFeedType(text);
  const analysis  = extractAnalysis(text);

  // ── No-ingredient-list warning banner
  const noIngBanner = !hasIngList
    ? `<div style="background:#FBF0DC;border:1px solid rgba(200,130,26,0.3);border-radius:6px;padding:10px 14px;margin-bottom:12px;font-size:0.85rem;color:#5C3A1A;">
        <strong>&#9888; Guaranteed analysis only detected — no ingredient list found.</strong><br>
        Energy source, fiber, fat, and protein sections below require the ingredient list to populate accurately.
        For a complete breakdown, paste the full label including the INGREDIENTS section.
       </div>`
    : '';

  // ── Feed Type
  const feedTypeHTML = noIngBanner + feedTypes.map(ft =>
    `<strong>${ft.label}</strong> <em>(${ft.confidence} confidence)</em><br><span style="font-size:0.88rem">${ft.reason}</span>`
  ).join('<br><br>');

  // ── Energy Sources
  const noIngMsg = '<em style="color:#888;font-size:0.88rem">Ingredient list not detected — paste the full label including the INGREDIENTS section to see energy sources.</em>';
  const energyParts = [];
  if (fiberFound.length) energyParts.push(`<strong>Fiber energy:</strong> ${fiberFound.map(f => pill(f)).join(' ')}`);
  if (grainFound.length) energyParts.push(`<strong>Grain/starch energy:</strong> ${grainFound.map(f => pill(f)).join(' ')}`);
  if (fatFound.length)   energyParts.push(`<strong>Fat energy:</strong> ${fatFound.map(f => pill(f)).join(' ')}`);

  const energyHTML = !hasIngList ? noIngMsg
    : energyParts.length ? energyParts.join('<br>')
    : 'No clear energy source ingredients detected. Check that the ingredient list was included.';

  // ── Protein
  const proteinHTML = !hasIngList
    ? noIngMsg
    : proteinFound.length
      ? (() => {
        const fromAnalysis = proteinFound.filter(p => ['lysine','methionine','threonine'].includes(p.toLowerCase()));
        const fromIng      = proteinFound.filter(p => !['lysine','methionine','threonine'].includes(p.toLowerCase()));
        let html = `Detected: ${proteinFound.map(p => pill(p)).join(' ')}<br><br>`;
        if (fromIng.length && fromAnalysis.length) {
          html += `Protein ingredients include <strong>${fromIng.join(', ')}</strong>. Individual amino acids (${fromAnalysis.join(', ')}) are also guaranteed — indicating a focus on protein quality, not just crude protein quantity.`;
        } else if (fromAnalysis.length && !fromIng.length) {
          html += `No protein ingredient list detected. Individual amino acids (${fromAnalysis.join(', ')}) appear in the guaranteed analysis — the manufacturer is guaranteeing specific amino acid levels, which is a quality indicator. To see actual protein ingredient sources, paste the full ingredient list.`;
        } else {
          html += `These appear to be the primary protein sources in this feed.`;
        }
        return html;
      })()
      : 'No recognized protein ingredients detected. Check that the ingredient list was included.';

  // ── Fiber
  const fiberHTML = !hasIngList
    ? noIngMsg
    : fiberFound.length
      ? `${fiberFound.map(f => pill(f)).join(' ')}<br><br>These fiber sources support hindgut health and provide digestible energy. Highly fermentable fibers like beet pulp and soybean hulls are considered safe energy sources for many horses including those with metabolic concerns.`
      : 'No specific fiber ingredients detected. Check that the ingredient list was included.';

  // ── Fat
  const fatHTML = !hasIngList
    ? noIngMsg
    : fatFound.length
      ? `${fatFound.map(f => pill(f)).join(' ')}<br><br>Fat-based ingredients provide concentrated energy without raising starch or sugar levels. Flaxseed and fish oil also contribute omega-3 fatty acids.`
      : 'No fat-specific ingredients detected.';

  // ── Sugar/Starch Cautions
  const nscVal    = analysis.nsc    ? analysis.nsc.value    : null;
  const sugarVal  = analysis.sugar  ? analysis.sugar.value  : null;
  const starchVal = analysis.starch ? analysis.starch.value : null;

  const sugarWarnings = [];
  if (hasIngList && sugarFound.length) {
    sugarWarnings.push(`Sugar/palatability ingredients detected: ${sugarFound.map(s => pill(s, true)).join(' ')}`);
  }
  if (nscVal !== null) {
    const nscNote = nscVal <= 12
      ? `NSC appears to be ${nscVal}% — relatively low, which may be appropriate for insulin-resistant or laminitis-risk horses. Always verify with your vet.`
      : nscVal <= 20
      ? `NSC appears to be ${nscVal}% — moderate range. May not be suitable for horses with insulin resistance, PPID, or laminitis history without veterinary guidance.`
      : `NSC appears to be ${nscVal}% — higher carbohydrate feed. Not typically recommended for horses with insulin resistance, EMS, PPID, or laminitis risk.`;
    sugarWarnings.push(nscNote);
  }
  if (sugarVal !== null) sugarWarnings.push(`Sugar listed at approximately ${sugarVal}% (max).`);
  if (starchVal !== null) sugarWarnings.push(`Starch listed at approximately ${starchVal}% (max).`);
  if (!sugarWarnings.length) {
    sugarWarnings.push('No NSC, sugar, or starch values detected. Ask the manufacturer for these — especially important for horses with metabolic conditions, insulin resistance, laminitis, or PPID/Cushing\'s.');
  }
  const sugarHTML = sugarWarnings.join('<br><br>');

  // ── Vitamins & Minerals — expanded detection
  // Additional minerals not in signal list that appear in analysis panels
  const extraMinerals = [];
  if (/magnesium/i.test(text)) extraMinerals.push('magnesium');
  if (/potassium/i.test(text)) extraMinerals.push('potassium');
  if (/manganese/i.test(text)) extraMinerals.push('manganese');
  if (/iron/i.test(text))      extraMinerals.push('iron');
  if (/iodine/i.test(text))    extraMinerals.push('iodine');
  if (/cobalt/i.test(text))    extraMinerals.push('cobalt');

  const extraVitamins = [];
  if (/vitamin\s*c/i.test(text))  extraVitamins.push('vitamin c');
  if (/vitamin\s*b/i.test(text))  extraVitamins.push('vitamin b complex');
  if (/lysine/i.test(text))       extraVitamins.push('lysine');
  if (/methionine/i.test(text))   extraVitamins.push('methionine');
  if (/threonine/i.test(text))    extraVitamins.push('threonine');

  const allVitamins  = [...new Set([...vitaminFound, ...extraVitamins])];
  const allMinerals  = [...new Set([...mineralFound, ...extraMinerals])];

  let vitHTML = '';
  if (allVitamins.length || allMinerals.length) {
    const vparts = [];
    if (allVitamins.length) vparts.push(`Vitamins &amp; amino acids detected: ${allVitamins.map(v => pill(v)).join(' ')}`);
    if (allMinerals.length) vparts.push(`Minerals detected: ${allMinerals.map(m => pill(m)).join(' ')}`);

    const notes = [];
    if (analysis.vitE) {
      notes.push(`Vitamin E listed at ${analysis.vitE.value} IU/lb. Horses without pasture access typically need 1–2 IU per pound of body weight daily from all sources.`);
    }
    if (analysis.selenium) {
      const seVal = analysis.selenium.value;
      const seNote = seVal > 0.3
        ? `Selenium listed at ${seVal} ppm — this is above the commonly cited NRC safe upper limit of 0.3 mg/kg in feed. This is not necessarily dangerous at normal feeding rates, but total daily selenium from all sources (feed + hay + supplements) should be reviewed with your vet. Selenium toxicity is a real risk.`
        : `Selenium listed at ${seVal} ppm. Total daily selenium from all sources should stay below approximately 2 mg/day for most horses.`;
      notes.push(seNote);
    }
    if (/iron/i.test(text)) {
      const ironMatch = text.match(/iron[^0-9]*([0-9]+\.?[0-9]*)\s*ppm/i);
      if (ironMatch) {
        notes.push(`Iron listed at ${ironMatch[1]} ppm. High iron in feed can interfere with copper and zinc absorption. If your hay is also high in iron (common in many regions), total iron load is worth discussing with your vet or nutritionist.`);
      }
    }
    if (/lysine|methionine|threonine/i.test(text)) {
      notes.push(`Individual amino acids (lysine, methionine, threonine) are listed in the guaranteed analysis. This indicates the manufacturer is guaranteeing specific amino acid levels — a sign of a more precisely formulated feed focused on protein quality, not just crude protein quantity.`);
    }
    vitHTML = vparts.join('<br>') + (notes.length ? '<br><br>' + notes.join('<br><br>') : '');
  } else {
    vitHTML = 'No specific vitamin or mineral ingredients detected.';
  }

  // ── Digestive Support
  const digestHTML = digestFound.length
    ? `Digestive support ingredients detected: ${digestFound.map(d => pill(d)).join(' ')}<br><br>These ingredients support hindgut microbial health and fiber fermentation. Their effectiveness in pelleted or extruded feeds can vary — if digestive health is a primary concern, discuss with your vet or nutritionist.`
    : 'No digestive support ingredients (yeast culture, probiotics, prebiotics) detected.';

  // ── Hoof / Skin / Coat
  const uniqueHoof = [...new Set(hoofFound)];
  const hoofHTML = uniqueHoof.length
    ? `Hoof, skin, and coat support detected: ${uniqueHoof.map(h => pill(h)).join(' ')}<br><br>Biotin, zinc, copper, and methionine all play roles in hoof wall integrity, skin condition, and coat quality. Results typically take 6–12 months to be visible in hoof growth.`
    : 'No specific hoof/skin/coat support ingredients detected.';

  // ── Guaranteed Analysis Notes — expanded
  const anNotes = [];
  if (analysis.protein)    anNotes.push(`Crude Protein: ${analysis.protein.value}% (min).`);
  if (analysis.fat) {
    const fatVal = analysis.fat.value;
    const fatNote = fatVal < 4
      ? `Crude Fat: ${fatVal}% (min) — this is relatively low fat. Despite any "performance" positioning on the label, a low fat value means this feed is not a high-calorie fat-based feed.`
      : fatVal >= 8
      ? `Crude Fat: ${fatVal}% (min) — higher fat content, which provides concentrated energy without starch. Good for weight gain or high-energy needs.`
      : `Crude Fat: ${fatVal}% (min).`;
    anNotes.push(fatNote);
  }
  if (analysis.fiber)      anNotes.push(`Crude Fiber: ${analysis.fiber.value}% (max).`);
  if (analysis.calcium)    anNotes.push(`Calcium: ${analysis.calcium.value}% (min).`);
  if (analysis.phosphorus) anNotes.push(`Phosphorus: ${analysis.phosphorus.value}% (min).`);

  if (analysis.calcium && analysis.phosphorus) {
    const ratio = (analysis.calcium.value / analysis.phosphorus.value).toFixed(1);
    const ratioNote = parseFloat(ratio) < 1.5
      ? `Ca:P ratio is approximately ${ratio}:1 — this is below the recommended 1.5–2:1 range. In the context of the horse's total diet (including hay), this should be reviewed.`
      : `Ca:P ratio is approximately ${ratio}:1 — within the generally recommended 1.5–2:1 range. Note: this reflects the feed only, not your horse's total diet including hay.`;
    anNotes.push(ratioNote);
  }

  // Extra analysis values
  const extraAnalysis = [];
  const lysinePct = text.match(/lysine[^0-9]*([0-9]+\.?[0-9]*)\s*%/i);
  if (lysinePct) extraAnalysis.push(`Lysine: ${lysinePct[1]}% (min) — an essential amino acid horses cannot synthesize. Listed individually, which is a quality indicator.`);
  const magMatch = text.match(/magnesium[^0-9]*([0-9]+\.?[0-9]*)\s*%/i);
  if (magMatch) extraAnalysis.push(`Magnesium: ${magMatch[1]}% (min) — important for muscle function and nerve signaling.`);
  const potMatch = text.match(/potassium[^0-9]*([0-9]+\.?[0-9]*)\s*%/i);
  if (potMatch) extraAnalysis.push(`Potassium: ${potMatch[1]}% (min) — an electrolyte important for sweating horses.`);
  const manMatch = text.match(/manganese[^0-9]*([0-9]+\.?[0-9]*)\s*ppm/i);
  if (manMatch) extraAnalysis.push(`Manganese: ${manMatch[1]} ppm (min) — supports bone development and enzyme function.`);
  const ironMatch = text.match(/iron[^0-9]*([0-9]+\.?[0-9]*)\s*ppm/i);
  if (ironMatch) extraAnalysis.push(`Iron: ${ironMatch[1]} ppm (min) — see note in Vitamins & Minerals regarding iron's effect on copper and zinc absorption.`);
  const zincMatch = text.match(/zinc[^0-9]*([0-9]+\.?[0-9]*)\s*ppm/i);
  if (zincMatch) extraAnalysis.push(`Zinc: ${zincMatch[1]} ppm (min).`);
  const copperMatch = text.match(/copper[^0-9]*([0-9]+\.?[0-9]*)\s*ppm/i);
  if (copperMatch) extraAnalysis.push(`Copper: ${copperMatch[1]} ppm (min).`);
  const vitCMatch = text.match(/vitamin\s*c[^0-9]*([0-9]+\.?[0-9]*)\s*mg/i);
  if (vitCMatch) extraAnalysis.push(`Vitamin C: ${vitCMatch[1]} mg/lb (min) — horses synthesize their own vitamin C, but supplemental amounts may support horses under stress or immune challenge.`);
  const biotinMatch = text.match(/biotin[^0-9]*([0-9]+\.?[0-9]*)\s*mg/i);
  if (biotinMatch) extraAnalysis.push(`Biotin: ${biotinMatch[1]} mg/lb (min) — supports hoof integrity and coat quality.`);

  const analysisHTML = (anNotes.length || extraAnalysis.length)
    ? ul([...anNotes, ...extraAnalysis]) + '<br><small style="color:#888">Values based on text matching — always reference the original label for accuracy.</small>'
    : 'No guaranteed analysis values detected. Paste the full guaranteed analysis panel for this section to populate.';

  // ── Questions to Ask
  const missing = [];
  if (!hasIngList) missing.push('Paste the full ingredient list for a complete analysis — energy sources, fiber, fat, and protein sections cannot be evaluated from the guaranteed analysis alone.');
  if (!analysis.nsc && !analysis.sugar && !analysis.starch) missing.push('NSC, sugar, and starch values were not detected. Ask the manufacturer — critical for horses with insulin resistance, laminitis, EMS, or PPID/Cushing\'s.');
  if (!analysis.vitE) missing.push('Vitamin E IU per pound not detected. Important for horses without regular pasture access.');
  if (!analysis.selenium) missing.push('Selenium level not detected. Ask the manufacturer — selenium has a narrow safe range.');
  if (!digestFound.length) missing.push('Ask whether the feed contains any digestive support ingredients (yeast culture, probiotics) if gut health is a concern.');
  if (!analysis.calcium || !analysis.phosphorus) missing.push('Calcium and/or phosphorus not detected — important for evaluating total diet mineral balance.');
  missing.push('Ask: "What is the recommended daily feeding rate per 100 lbs of body weight?"');
  missing.push('Ask: "Is this feed tested for actual NSC values, or are those calculated?"');
  missing.push('Ask: "Is the selenium from inorganic (sodium selenite) or organic (selenium yeast) sources?"');
  const missingHTML = ul(missing);

  // ── Plain-English Summary
  const feedTypeLabel = feedTypes[0]?.label || 'commercial horse feed';

  let summaryHTML = '';
  if (!hasIngList) {
    // Analysis-only summary
    const aLines = [];
    aLines.push(`Based on the guaranteed analysis panel, this appears to be a <strong>${feedTypeLabel}</strong>.`);
    if (analysis.protein) aLines.push(`Crude protein is listed at ${analysis.protein.value}% (min).`);
    if (analysis.fat) aLines.push(`Crude fat is ${analysis.fat.value}% (min)${analysis.fat.value < 4 ? ' — relatively low' : analysis.fat.value >= 8 ? ' — higher fat formula' : ''}.`);
    if (allVitamins.length || allMinerals.length) aLines.push(`The analysis panel shows a broad vitamin and mineral profile, suggesting a fully formulated feed rather than a straight grain.`);
    if (digestFound.length) aLines.push(`Digestive support microorganisms (${digestFound.slice(0,2).join(', ')}) are listed, indicating attention to gut health.`);
    if (/lysine|methionine|threonine/i.test(text)) aLines.push(`Individual amino acids are guaranteed, which indicates a focus on protein quality.`);
    aLines.push(`<br>To get a full ingredient-by-ingredient breakdown — including energy sources, fiber, fat, and protein ingredients — paste the complete label including the INGREDIENTS section.`);
    summaryHTML = aLines.join(' ');
  } else {
    const energyType = fiberFound.length >= 2 && grainFound.length <= 1
      ? 'fiber-based energy sources, which tend to be more hindgut-friendly than grain starches'
      : grainFound.length >= 2
        ? 'grain and starch as primary energy sources, which provide quick energy but may not be suitable for metabolic horses'
        : fiberFound.length && grainFound.length
          ? 'a mix of fiber and grain energy sources'
          : 'energy sources as listed above';

    const digestNote = digestFound.length
      ? `It includes digestive support ingredients (${digestFound.slice(0,2).join(', ')}), suggesting a focus on gut health.`
      : '';
    const sugarNote = nscVal !== null
      ? `The NSC value is ${nscVal}%, which${nscVal <= 15 ? ' may make it a candidate for' : ' suggests it may not be suitable for'} horses with insulin sensitivity — verify with your vet.`
      : '';

    summaryHTML = `Based on the full label text, this appears to be a <strong>${feedTypeLabel}</strong> that uses ${energyType}. 
${proteinFound.length ? `Protein appears to come primarily from ${proteinFound.slice(0,3).join(', ')}.` : ''}
${allVitamins.length || allMinerals.length ? 'It contains a broad vitamin and mineral profile, consistent with a fully formulated commercial feed.' : ''}
${digestNote} ${sugarNote}
<br><br>Ingredient order on horse feed labels indicates relative quantity — ingredients listed first are present in the largest amounts. For any horse with a known health condition, share this label with a veterinarian or equine nutritionist before feeding.`;
  }

  // ── Vet Conditions
  const vetHTML = 'Consult a licensed veterinarian or qualified equine nutritionist if:' + ul([
    'your horse has a history of laminitis or founder',
    'your horse has been diagnosed with insulin resistance (IR), EMS, or PPID/Cushing\'s disease',
    'you are seeing rapid or unexplained weight changes',
    'your horse has colic, choke, or digestive problems',
    'your horse has muscle problems (tying-up, PSSM, or EPSM)',
    'your horse is pregnant, lactating, or a growing foal',
    'you are feeding this to replace hay (as a complete feed) without professional guidance',
    'you notice signs of selenium toxicity (hair loss, hoof separation, neurological symptoms)'
  ]);

  return {
    feedtype:  feedTypeHTML,
    energy:    energyHTML,
    protein:   proteinHTML,
    fiber:     fiberHTML,
    fat:       fatHTML,
    sugar:     sugarHTML,
    vitamins:  vitHTML,
    digestive: digestHTML,
    hoof:      hoofHTML,
    analysis:  analysisHTML,
    missing:   missingHTML,
    summary:   summaryHTML,
    vet:       vetHTML
  };
}

// ─────────────────────────────────────────────
// DOM: POPULATE INGREDIENT LIBRARY
// ─────────────────────────────────────────────
function populateIngredientLibrary() {
  const grid = document.getElementById('ingredientGrid');
  if (!grid) return;
  grid.innerHTML = INGREDIENT_LIBRARY.map(ing => `
    <div class="ingredient-card">
      <div class="ingredient-name">${ing.name}</div>
      <div class="ingredient-category">${ing.category}</div>
      <p class="ingredient-desc">${ing.desc}</p>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────
// DOM: POPULATE ANALYSIS GUIDE
// ─────────────────────────────────────────────
function populateAnalysisGuide() {
  const grid = document.getElementById('analysisGrid');
  if (!grid) return;
  grid.innerHTML = ANALYSIS_GUIDE.map(a => `
    <div class="analysis-card">
      <div class="analysis-term">${a.term}</div>
      <div class="analysis-unit">${a.unit}</div>
      <p class="analysis-desc">${a.desc}</p>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────
// DOM: RENDER DECODER OUTPUT
// ─────────────────────────────────────────────
function renderOutput(result) {
  document.getElementById('oc-feedtype').innerHTML  = result.feedtype;
  document.getElementById('oc-energy').innerHTML    = result.energy;
  document.getElementById('oc-protein').innerHTML   = result.protein;
  document.getElementById('oc-fiber').innerHTML     = result.fiber;
  document.getElementById('oc-fat').innerHTML       = result.fat;
  document.getElementById('oc-sugar').innerHTML     = result.sugar;
  document.getElementById('oc-vitamins').innerHTML  = result.vitamins;
  document.getElementById('oc-digestive').innerHTML = result.digestive;
  document.getElementById('oc-hoof').innerHTML      = result.hoof;
  document.getElementById('oc-analysis').innerHTML  = result.analysis;
  document.getElementById('oc-missing').innerHTML   = result.missing;
  document.getElementById('oc-summary').innerHTML   = result.summary;
  document.getElementById('oc-vet').innerHTML       = result.vet;

  const out = document.getElementById('decoderOutput');
  out.style.display = 'block';
  out.classList.remove('visible');
  void out.offsetHeight; // reflow trigger
  out.classList.add('visible');

  out.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─────────────────────────────────────────────
// DOM: DECODER EVENT LISTENERS
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {

  populateIngredientLibrary();
  populateAnalysisGuide();

  const decodeBtn  = document.getElementById('decodeBtn');
  const clearBtn   = document.getElementById('clearBtn');
  const exampleBtn = document.getElementById('exampleBtn');
  const feedInput  = document.getElementById('feedInput');
  const output     = document.getElementById('decoderOutput');

  decodeBtn.addEventListener('click', function () {
    const text = (feedInput.value || '').trim();
    if (!text) {
      feedInput.focus();
      feedInput.style.borderColor = '#C8821A';
      feedInput.placeholder = 'Label text will appear here after scanning — or type it in manually.';
      setTimeout(() => { feedInput.style.borderColor = ''; }, 2000);
      return;
    }
    const result = decodeLabel(text);
    renderOutput(result);
  });

  exampleBtn.addEventListener('click', function () {
    feedInput.value = EXAMPLE_LABEL;
    feedInput.focus();
    feedInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  clearBtn.addEventListener('click', function () {
    feedInput.value = '';
    output.style.display = 'none';
    output.classList.remove('visible');
    window.resetOCR();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  feedInput.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      decodeBtn.click();
    }
  });

});

// ─────────────────────────────────────────────
// OCR: MOBILE-FIRST CAMERA SCAN FEATURE
// Uses Tesseract.js v5 loaded via CDN
// ─────────────────────────────────────────────
(function () {
  'use strict';

  let selectedFile = null;
  let isScanning   = false;

  // DOM refs
  let ocrFileInput, ocrFileInput2, ocrPreviewImg;
  let ocrRemoveBtn, ocrScanBtn;
  let ocrStatus, ocrStatusText;
  let ocrProgressWrap, ocrProgressFill, ocrProgressLabel;
  let ocrResultMsg, ocrErrorMsg, ocrErrorText;
  let scanSection, feedInputEl;

  window.resetOCR = function () {
    selectedFile = null;
    isScanning   = false;
    if (ocrFileInput)  ocrFileInput.value  = '';
    if (ocrFileInput2) ocrFileInput2.value = '';
    if (scanSection)   scanSection.style.display = 'none';
    if (ocrPreviewImg) ocrPreviewImg.src = '';
    if (ocrProgressFill) ocrProgressFill.style.width = '0%';
  };

  function show(el) { if (el) el.style.display = ''; }
  function hide(el) { if (el) el.style.display = 'none'; }
  function setStatus(msg) { if (ocrStatusText) ocrStatusText.textContent = msg; }

  function setProgress(pct) {
    const p = Math.round(pct * 100);
    if (ocrProgressFill) ocrProgressFill.style.width = p + '%';
    if (ocrProgressLabel) ocrProgressLabel.textContent = p + '%';
  }

  function showError(msg) {
    hide(ocrStatus);
    if (ocrErrorText) ocrErrorText.textContent = msg;
    show(ocrErrorMsg);
    hide(ocrResultMsg);
    isScanning = false;
    if (ocrScanBtn) { ocrScanBtn.disabled = false; ocrScanBtn.textContent = 'Read This Label'; }
  }

  function handleFileSelect(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a photo of the feed label.');
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      alert('That photo is too large (over 30 MB). Please try a smaller image.');
      return;
    }

    selectedFile = file;

    // Show scan section immediately with preview
    show(scanSection);
    hide(ocrStatus);
    hide(ocrResultMsg);
    hide(ocrErrorMsg);
    show(document.getElementById('ocrScanBtn'));

    const reader = new FileReader();
    reader.onload = function (e) {
      ocrPreviewImg.src = e.target.result;
      // Scroll to scan section
      scanSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    reader.readAsDataURL(file);

    // Auto-trigger OCR immediately — no extra tap needed
    setTimeout(runOCR, 400);
  }

  async function runOCR() {
    if (!selectedFile || isScanning) return;
    isScanning = true;

    if (ocrScanBtn) { ocrScanBtn.disabled = true; ocrScanBtn.textContent = 'Reading\u2026'; }
    hide(ocrResultMsg);
    hide(ocrErrorMsg);

    if (typeof Tesseract === 'undefined') {
      showError('Could not load the OCR engine. Check your internet connection and reload the page.');
      return;
    }

    show(ocrStatus);
    hide(ocrProgressWrap);
    setStatus('Reading your label\u2026');
    setProgress(0);

    try {
      const result = await Tesseract.recognize(
        selectedFile,
        'eng',
        {
          logger: function (m) {
            if (m.status === 'loading tesseract core' || m.status === 'initializing tesseract') {
              setStatus('Starting up\u2026');
            } else if (m.status === 'loading language traineddata') {
              setStatus('Loading language data\u2026');
              show(ocrProgressWrap);
              setProgress(m.progress || 0);
            } else if (m.status === 'recognizing text') {
              setStatus('Reading your label\u2026 almost there.');
              show(ocrProgressWrap);
              setProgress(m.progress || 0);
            }
          }
        }
      );

      const rawText = (result.data && result.data.text) ? result.data.text.trim() : '';

      hide(ocrStatus);
      isScanning = false;
      if (ocrScanBtn) { ocrScanBtn.disabled = false; ocrScanBtn.textContent = 'Read This Label'; }

      if (!rawText || rawText.length < 10) {
        showError('Couldn\u2019t read enough text from that photo. Make sure the label is flat, well-lit, and in focus. Try cropping close to the ingredient list.');
        return;
      }

      const cleaned = rawText
        .replace(/\f/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      feedInputEl.value = cleaned;
      show(ocrResultMsg);

      // Auto-decode immediately after scan
      setTimeout(function () {
        const decodeBtn = document.getElementById('decodeBtn');
        if (decodeBtn) decodeBtn.click();
      }, 600);

    } catch (err) {
      console.error('Tesseract error:', err);
      let msg = 'OCR failed. ';
      if (err && err.message && (err.message.includes('network') || err.message.includes('fetch'))) {
        msg += 'Check your internet connection and try again.';
      } else {
        msg += 'Try a different photo or type in the label text manually below.';
      }
      showError(msg);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    ocrFileInput    = document.getElementById('ocrFileInput');
    ocrFileInput2   = document.getElementById('ocrFileInput2');
    ocrPreviewImg   = document.getElementById('ocrPreviewImg');
    ocrRemoveBtn    = document.getElementById('ocrRemoveBtn');
    ocrScanBtn      = document.getElementById('ocrScanBtn');
    ocrStatus       = document.getElementById('ocrStatus');
    ocrStatusText   = document.getElementById('ocrStatusText');
    ocrProgressWrap = document.getElementById('ocrProgressWrap');
    ocrProgressFill = document.getElementById('ocrProgressFill');
    ocrProgressLabel= document.getElementById('ocrProgressLabel');
    ocrResultMsg    = document.getElementById('ocrResultMsg');
    ocrErrorMsg     = document.getElementById('ocrErrorMsg');
    ocrErrorText    = document.getElementById('ocrErrorText');
    scanSection     = document.getElementById('scanSection');
    feedInputEl     = document.getElementById('feedInput');

    if (!ocrFileInput) return;

    // Primary camera input (hero)
    ocrFileInput.addEventListener('change', function () {
      if (this.files && this.files[0]) handleFileSelect(this.files[0]);
    });

    // Secondary "Scan Another" input (post-results)
    if (ocrFileInput2) {
      ocrFileInput2.addEventListener('change', function () {
        if (this.files && this.files[0]) {
          // Clear previous results first
          const output = document.getElementById('decoderOutput');
          if (output) { output.style.display = 'none'; output.classList.remove('visible'); }
          feedInputEl.value = '';
          handleFileSelect(this.files[0]);
        }
      });
    }

    // Remove / retake
    if (ocrRemoveBtn) {
      ocrRemoveBtn.addEventListener('click', function () {
        window.resetOCR();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Manual scan button (if auto-scan failed)
    if (ocrScanBtn) {
      ocrScanBtn.addEventListener('click', function () {
        runOCR();
      });
    }
  });

})();
