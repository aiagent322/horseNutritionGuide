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
    url:  'ingredients/beet-pulp.html',
    category: 'Fiber / Energy',
    desc: 'A byproduct of sugar beet processing. The sugar has been extracted, leaving highly digestible fiber. A good "safe" energy source for horses that don\'t tolerate grain well. Typically low in sugar and starch when plain (not molasses-coated).'
  },
  {
    name: 'Soybean Hulls',
    url:  'ingredients/soybean-hulls.html',
    category: 'Fiber',
    desc: 'The outer shell of soybeans. Highly digestible fiber with a low sugar and starch content. Often used in senior or low-starch feeds as a gut-friendly filler and fiber source.'
  },
  {
    name: 'Alfalfa Meal / Dehydrated Alfalfa',
    url:  'ingredients/alfalfa-meal.html',
    category: 'Fiber / Protein',
    desc: 'Dried and ground alfalfa. Provides fiber, protein, and calcium. Highly palatable. Adds digestible energy. Horses with calcium-sensitive conditions should have calcium:phosphorus ratios reviewed.'
  },
  {
    name: 'Soybean Meal',
    url:  'ingredients/soybean-meal.html',
    category: 'Protein',
    desc: 'The high-protein residue left after oil is extracted from soybeans. A very common protein source in horse feeds. Rich in lysine, an essential amino acid horses cannot make on their own.'
  },
  {
    name: 'Rice Bran',
    url:  'ingredients/rice-bran.html',
    category: 'Fat / Energy',
    desc: 'The outer layer of the rice grain, high in fat (typically 18–22%). Often stabilized to prevent rancidity. Adds calories and supports coat condition. Contains phytate, which may bind phosphorus — calcium:phosphorus balance matters when feeding large amounts.'
  },
  {
    name: 'Flaxseed / Linseed',
    url:  'ingredients/flaxseed.html',
    category: 'Fat / Omega-3',
    desc: 'Seeds high in omega-3 fatty acids (alpha-linolenic acid). Supports skin, coat, and has anti-inflammatory properties. Should be ground or heat-treated for maximum absorption. Often seen in feeds targeting coat and hoof quality.'
  },
  {
    name: 'Oats',
    url:  'ingredients/oats.html',
    category: 'Grain / Starch Energy',
    desc: 'One of the most traditional horse grains. Moderate starch content compared to corn or barley, with a fibrous hull that makes them more digestible. Still a starch source — relevant for horses with insulin issues or laminitis.'
  },
  {
    name: 'Corn',
    url:  'ingredients/corn.html',
    category: 'Grain / Starch Energy',
    desc: 'High energy, high starch grain. Calorie-dense and highly palatable. More starch per pound than oats or barley. May be listed as ground corn, flaked corn, or steam-flaked corn. Not ideal for horses with metabolic conditions.'
  },
  {
    name: 'Barley',
    url:  'ingredients/barley.html',
    category: 'Grain / Starch Energy',
    desc: 'A grain commonly used in horse feeds. Higher starch than oats but lower than corn. Often processed (rolled, flaked, or steam-flaked) to improve digestibility. A starch source relevant for metabolic horses.'
  },
  {
    name: 'Molasses',
    url:  'ingredients/molasses.html',
    category: 'Sugar / Palatability',
    desc: 'A byproduct of sugar refining. Used in horse feeds primarily for palatability (horses like the taste) and to reduce dust. Adds sugar — relevant for horses with insulin resistance, PPID, or laminitis risk. Feeds with molasses listed early in the ingredient list contain more of it.'
  },
  {
    name: 'Vegetable Oil',
    url:  'ingredients/vegetable-oil.html',
    category: 'Fat / Energy',
    desc: 'A concentrated source of fat calories. Adds energy without increasing starch. Supports coat quality. Often added to performance feeds or weight-gain formulas. Source varies (soy, canola, sunflower) but is not always specified.'
  },
  {
    name: 'Salt',
    url:  'ingredients/salt.html',
    category: 'Mineral / Electrolyte',
    desc: 'Sodium chloride — an essential electrolyte for muscle and nerve function. Horses need salt daily. Its presence in feed does not eliminate the need for free-choice salt access, as individual requirements vary.'
  },
  {
    name: 'Limestone',
    url:  'ingredients/limestone.html',
    category: 'Mineral / Calcium',
    desc: 'A source of calcium (calcium carbonate). Calcium is essential for bone, muscle, and nerve function. Balancing calcium to phosphorus in the overall diet is important — the ideal ratio is approximately 1.5–2:1 (calcium:phosphorus).'
  },
  {
    name: 'Dicalcium Phosphate',
    url:  'ingredients/dicalcium-phosphate.html',
    category: 'Mineral / Phosphorus & Calcium',
    desc: 'Provides both calcium and phosphorus. Often used to balance the calcium:phosphorus ratio in a feed, especially when high-calcium ingredients like alfalfa are present.'
  },
  {
    name: 'Yeast Culture',
    url:  'ingredients/yeast-culture.html',
    category: 'Digestive Support',
    desc: 'A fermentation product (often Saccharomyces cerevisiae). Supports the hindgut microbial environment. May improve fiber digestion. A common ingredient in feeds marketed as digestively supportive.'
  },
  {
    name: 'Probiotics / Lactobacillus',
    url:  'ingredients/probiotics.html',
    category: 'Digestive Support',
    desc: 'Live beneficial microorganisms. Intended to support a healthy hindgut bacterial population. Stability and viability in pelleted feeds can vary — a veterinarian or nutritionist can advise on whether a standalone probiotic supplement may be more effective.'
  },
  {
    name: 'Biotin',
    url:  'ingredients/biotin.html',
    category: 'Hoof / Coat Support (Vitamin B7)',
    desc: 'A B vitamin frequently linked to hoof wall integrity and quality. Often added to feeds marketed for hoof support. Research supports its role in hoof horn synthesis. Also supports skin and coat.'
  },
  {
    name: 'Copper',
    url:  'ingredients/copper.html',
    category: 'Mineral / Trace',
    desc: 'Essential for connective tissue synthesis, pigmentation, and immune function. Horses on high-iron diets (including many hay sources) may require extra copper. Also plays a role in hoof quality and coat color.'
  },
  {
    name: 'Zinc',
    url:  'ingredients/zinc.html',
    category: 'Mineral / Trace',
    desc: 'Important for skin, hoof, and coat health, as well as immune function and enzyme activity. Often paired with copper on the label. The zinc:copper ratio in the diet matters — typically a 3–4:1 ratio is recommended.'
  },
  {
    name: 'Selenium',
    url:  'ingredients/selenium.html',
    category: 'Mineral / Trace (Critical)',
    desc: 'An essential antioxidant mineral with a narrow safe range. Deficiency causes muscle problems (white muscle disease); excess causes toxicity (selenosis). Selenium content on labels is expressed in mg/kg or ppm. Soil selenium levels vary widely by region, making this a key item to discuss with your vet or nutritionist.'
  },
  {
    name: 'Vitamin E',
    url:  'ingredients/vitamin-e.html',
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
  // Fiber-based energy sources — matches categorizeIngredient 'fiber'
  fiberEnergy: [
    'beet pulp', 'soybean hulls', 'soybean hull', 'alfalfa meal', 'dehydrated alfalfa',
    'dehydrated alfalfa meal', 'hay meal', 'timothy meal', 'grass meal',
    'oat hulls', 'oat hull', 'oat fiber', 'oat straw', 'cottonseed hull',
    'alfalfa', 'wheat bran', 'wheat middlings', 'wheat germ'
  ],
  // Grain/starch primary sources — matches categorizeIngredient 'starch'
  // NOTE: wheat middlings removed (now fiber), oat groats moved here as starch
  grainStarch: [
    'corn', 'ground corn', 'flaked corn', 'steam-flaked corn', 'cracked corn',
    'oats', 'ground oats', 'rolled oats', 'whole oats', 'oat groats',
    'barley', 'rolled barley', 'wheat', 'milo', 'sorghum',
    'grain products', 'cereal grain', 'maize'
  ],
  // Fat sources — matches categorizeIngredient 'fat'
  fat: [
    'rice bran', 'stabilized rice bran', 'vegetable oil', 'soybean oil',
    'canola oil', 'sunflower oil', 'fish oil', 'flaxseed', 'linseed',
    'stabilized flaxseed', 'flax', 'animal fat', 'stabilized fat'
  ],
  // Protein meal sources — matches categorizeIngredient 'protein'
  // Amino acids (lysine, methionine, threonine) kept here — they are protein-quality signals
  protein: [
    'soybean meal', 'canola meal', 'linseed meal', 'cottonseed meal', 'sunflower meal',
    'corn gluten', 'brewers grain', 'distillers', 'ddgs',
    'lysine', 'l-lysine', 'dl-methionine', 'methionine', 'threonine', 'l-threonine'
  ],
  // Sugar and palatability sources
  sugar: [
    'molasses', 'cane molasses', 'beet molasses', 'sugar', 'corn syrup',
    'dextrose', 'sucrose', 'fructose'
  ],
  // Macro and trace minerals
  minerals: [
    'salt', 'sodium chloride', 'limestone', 'calcium carbonate',
    'dicalcium phosphate', 'monocalcium phosphate', 'defluorinated phosphate',
    'zinc sulfate', 'zinc proteinate', 'zinc amino acid chelate', 'zinc oxide',
    'copper sulfate', 'copper proteinate', 'copper amino acid chelate',
    'manganese sulfate', 'manganese amino acid chelate',
    'selenium yeast', 'selenium proteinate', 'sodium selenite',
    'magnesium oxide', 'magnesium sulfate',
    'potassium chloride', 'ethylenediamine dihydriodide', 'cobalt sulfate',
    'ferrous sulfate', 'iron amino acid chelate'
  ],
  // Vitamins and B-complex
  vitamins: [
    'vitamin a supplement', 'vitamin a',
    'vitamin d3 supplement', 'vitamin d3', 'vitamin d',
    'vitamin e supplement', 'vitamin e',
    'menadione', 'vitamin k',
    'thiamine mononitrate', 'thiamine', 'riboflavin supplement', 'riboflavin',
    'niacin supplement', 'niacin', 'folic acid', 'pyridoxine hydrochloride',
    'cyanocobalamin', 'vitamin b12', 'choline chloride', 'choline',
    'calcium pantothenate', 'biotin', 'd-biotin',
    'dl-alpha tocopherol', 'd-alpha tocopherol'
  ],
  // Digestive support — probiotics, prebiotics, yeast
  digestive: [
    'yeast culture', 'dried yeast', 'active dry yeast',
    'saccharomyces cerevisiae', 'saccharomyces',
    'lactobacillus acidophilus', 'lactobacillus brevis', 'lactobacillus plantarum',
    'lactobacillus', 'enterococcus faecium', 'enterococcus',
    'pediococcus acidilactici', 'pediococcus',
    'bifidobacterium', 'bacillus subtilis',
    'aspergillus oryzae', 'aspergillus niger', 'aspergillus',
    'mannan oligosaccharides', 'fructooligosaccharides', 'inulin',
    'dried fermentation product', 'fermentation product'
  ],
  // Hoof, skin, coat support — ingredient-list only, not analysis panel
  // zinc/copper removed — picked up from analysis numbers causing false positives
  hoofCoat: [
    'biotin', 'd-biotin',
    'flaxseed', 'stabilized flaxseed', 'linseed', 'flax',
    'fish oil', 'omega',
    'dl-methionine', 'methionine',
    'zinc amino acid chelate', 'zinc proteinate',
    'copper amino acid chelate', 'copper proteinate'
  ]
};

// ─────────────────────────────────────────────
// ANALYSIS DETECTION PATTERNS
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// ANALYSIS PATTERNS
// Handles two common label formats:
//   Standard:  "Crude Protein (min.) 14.0%"
//   Dot-fill:  "Crude Protein...Minimum...14.00%"
// The separator group [^0-9\n]{0,40} matches both.
// ─────────────────────────────────────────────
const ANALYSIS_PATTERNS = [
  { key: 'protein',    label: 'Crude Protein',   regex: /crude\s*protein[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'fat',        label: 'Crude Fat',        regex: /crude\s*fat[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'fiber',      label: 'Crude Fiber',      regex: /crude\s*fiber[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'calcium',    label: 'Calcium (min)',     regex: /calcium[^0-9\n]{0,40}(?:min[^0-9\n]{0,20})?([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'phosphorus', label: 'Phosphorus',        regex: /phosphorus[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'magnesium',  label: 'Magnesium',         regex: /magnesium[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'potassium',  label: 'Potassium',         regex: /potassium[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'nsc',        label: 'NSC',               regex: /\bnsc\b[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'sugar',      label: 'Sugar',             regex: /(?:water\s*soluble\s*carb|\bwsc\b|\bsugar\b)[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'starch',     label: 'Starch',            regex: /\bstarch\b[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'adf',        label: 'ADF',               regex: /\badf\b[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'ndf',        label: 'NDF',               regex: /\bndf\b[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'lysine',     label: 'Lysine',            regex: /\blysine\b[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*%/i },
  { key: 'vitA',       label: 'Vitamin A',         regex: /vitamin\s*a[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*iu/i },
  { key: 'vitD',       label: 'Vitamin D',         regex: /vitamin\s*d[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*iu/i },
  { key: 'vitE',       label: 'Vitamin E',         regex: /vitamin\s*e[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*iu/i },
  { key: 'selenium',   label: 'Selenium',          regex: /selenium[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*(?:mg|ppm)/i },
  { key: 'zinc',       label: 'Zinc',              regex: /\bzinc\b[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*(?:mg|ppm)/i },
  { key: 'copper',     label: 'Copper',            regex: /\bcopper\b[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*(?:mg|ppm)/i },
  { key: 'manganese',  label: 'Manganese',         regex: /manganese[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*(?:mg|ppm)/i },
  { key: 'iron',       label: 'Iron',              regex: /\biron\b[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*(?:mg|ppm)/i },
  { key: 'biotin',     label: 'Biotin',            regex: /biotin[^0-9\n]{0,40}([0-9]+\.?[0-9]*)\s*mg/i }
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
// ─────────────────────────────────────────────
// FEEDING DIRECTIONS PARSER
// Extracts feeding rate and calculates daily
// nutrient delivery from analysis values
// ─────────────────────────────────────────────
function parseFeedingDirections(text, analysis) {
  // Find feeding directions section
  const dirIdx = text.search(/feeding\s*directions?/i);
  if (dirIdx < 0) return null;
  const dirRaw = text.slice(dirIdx + text.slice(dirIdx).match(/feeding\s*directions?[^\n]*/i)[0].length);
  const dirText = dirRaw.split(/\n\n\n|important:/i)[0].trim();
  if (dirText.length < 10) return null;

  // ── Format 1: "X–Y lbs per 100 lbs body weight" — normalize first
  const per100Match = dirText.match(/(\d+(?:\.\d+)?)\s*(?:to|-)?\s*(\d+(?:\.\d+)?)\s*(?:lbs?|oz)\s*per\s*100\s*(?:lbs?|pounds?)/i);
  const ozPer100Match = dirText.match(/(\d+(?:\.\d+)?)\s*(?:to|-)?\s*(\d+(?:\.\d+)?)\s*oz(?:s)?\s*per\s*100/i);

  let minLbs = null, maxLbs = null, midLbs = null, refWeightLbs = 1000;
  let rateFormat = 'total'; // 'total' = total lbs/day, 'per100' = per 100 lbs BW

  if (per100Match) {
    // Rate expressed as lbs per 100 lbs body weight — normalize to 1000-lb horse
    const minPer100 = parseFloat(per100Match[1]);
    const maxPer100 = parseFloat(per100Match[2] || per100Match[1]);
    refWeightLbs = 1000;
    minLbs = (minPer100 / 100) * refWeightLbs;
    maxLbs = (maxPer100 / 100) * refWeightLbs;
    midLbs = (minLbs + maxLbs) / 2;
    rateFormat = 'per100';
  } else if (ozPer100Match) {
    // Rate in oz per 100 lbs — convert oz to lbs (16 oz = 1 lb)
    const minOzPer100 = parseFloat(ozPer100Match[1]);
    const maxOzPer100 = parseFloat(ozPer100Match[2] || ozPer100Match[1]);
    refWeightLbs = 1000;
    minLbs = (minOzPer100 / 16 / 100) * refWeightLbs;
    maxLbs = (maxOzPer100 / 16 / 100) * refWeightLbs;
    midLbs = (minLbs + maxLbs) / 2;
    rateFormat = 'per100oz';
  } else {
    // ── Format 2: "X–Y lbs daily for a 1,000 lb horse" — standard total/day
    const lbRangeMatch  = dirText.match(/(\d+(?:\.\d+)?)\s*(?:to|–|-)\s*(\d+(?:\.\d+)?)\s*lbs?/i);
    const lbSingleMatch = dirText.match(/(\d+(?:\.\d+)?)\s*lbs?\s*(?:per\s*day|daily|\/day)/i);
    const kgRangeMatch  = dirText.match(/(\d+(?:\.\d+)?)\s*(?:to|–|-)\s*(\d+(?:\.\d+)?)\s*kg/i);

    if (lbRangeMatch) {
      minLbs = parseFloat(lbRangeMatch[1]);
      maxLbs = parseFloat(lbRangeMatch[2]);
      midLbs = (minLbs + maxLbs) / 2;
    } else if (lbSingleMatch) {
      minLbs = maxLbs = midLbs = parseFloat(lbSingleMatch[1]);
    } else if (kgRangeMatch) {
      minLbs = parseFloat(kgRangeMatch[1]) * 2.205;
      maxLbs = parseFloat(kgRangeMatch[2]) * 2.205;
      midLbs = (minLbs + maxLbs) / 2;
    }

    // Extract reference horse weight from directions text
    const weightMatch = dirText.match(/(\d+(?:,\d+)?)\s*(?:lb|pound|kg|kilogram)/i);
    if (weightMatch) {
      refWeightLbs = weightMatch[0].toLowerCase().includes('kg')
        ? parseFloat(weightMatch[1]) * 2.205
        : parseFloat(weightMatch[1].replace(',', ''));
    }
  }

  if (midLbs === null) return { dirText, rate: null, nutrients: null };

  // ── Normalize rate label
  const rateLabel = (() => {
    if (rateFormat === 'per100') {
      const minP = ((minLbs / refWeightLbs) * 100).toFixed(1);
      const maxP = ((maxLbs / refWeightLbs) * 100).toFixed(1);
      return `${minP === maxP ? minP : minP + '–' + maxP} lbs per 100 lbs body weight (~${minLbs.toFixed(1)}–${maxLbs.toFixed(1)} lbs/day for a ${refWeightLbs}-lb horse)`;
    }
    if (rateFormat === 'per100oz') {
      const minOz = ((minLbs * 16 / refWeightLbs) * 100).toFixed(0);
      const maxOz = ((maxLbs * 16 / refWeightLbs) * 100).toFixed(0);
      return `${minOz === maxOz ? minOz : minOz + '–' + maxOz} oz per 100 lbs body weight (~${minLbs.toFixed(1)}–${maxLbs.toFixed(1)} lbs/day for a ${refWeightLbs}-lb horse)`;
    }
    if (minLbs === maxLbs) return `${minLbs} lbs/day`;
    return `${minLbs}–${maxLbs} lbs/day`;
  })();

  // ── Normalized per-100-lbs rate for comparison (regardless of input format)
  const lbsPer100 = (midLbs / refWeightLbs) * 100;
  const ozPer100  = lbsPer100 * 16;

  // ── Daily nutrient delivery at mid feeding rate
  const nutrients = {};

  if (analysis.protein) {
    const grams = midLbs * 453.6 * (analysis.protein.value / 100);
    nutrients.protein = `~${Math.round(grams)}g crude protein/day`;
  }

  if (analysis.selenium) {
    const kgFed = midLbs * 0.4536;
    const mgSe  = kgFed * analysis.selenium.value;
    const pct   = Math.round((mgSe / 2.0) * 100);
    nutrients.selenium = `~${mgSe.toFixed(2)}mg selenium/day (${pct}% of the commonly cited 2mg/day safe upper limit from all sources)`;
  }

  if (analysis.vitE) {
    const iuDay       = Math.round(midLbs * analysis.vitE.value);
    const needEstimate = Math.round(refWeightLbs * 1.5);
    nutrients.vitE = `~${iuDay} IU Vitamin E/day (a ${refWeightLbs}-lb horse at maintenance may need ~${needEstimate} IU/day from all sources)`;
  }

  if (analysis.vitA) {
    const iuADay = Math.round(midLbs * analysis.vitA.value);
    nutrients.vitA = `~${iuADay.toLocaleString()} IU Vitamin A/day`;
  }

  return {
    dirText,
    rate:       rateLabel,
    rateFormat,
    lbsPer100:  Math.round(lbsPer100 * 10) / 10,
    ozPer100:   Math.round(ozPer100 * 10) / 10,
    midLbs,
    refWeightLbs,
    nutrients
  };
}

// ─────────────────────────────────────────────
// RED FLAG INGREDIENT COMBINATIONS
// Detects known problematic pairings or patterns
// that a horse owner should be aware of
// ─────────────────────────────────────────────
function detectRedFlags(text, ingText, analysis) {
  const full    = textLower(text);
  const ing     = textLower(ingText || text);
  const flags   = [];

  // ── 1. High iron + low/absent copper and zinc
  const hasIron       = /iron|ferrous/i.test(ing);
  const ironPpmMatch  = text.match(/iron[^0-9]*([0-9]+\.?[0-9]*)\s*ppm/i);
  const ironPpm       = ironPpmMatch ? parseFloat(ironPpmMatch[1]) : null;
  const copperPpmMatch= text.match(/copper[^0-9]*([0-9]+\.?[0-9]*)\s*ppm/i);
  const zincPpmMatch  = text.match(/zinc[^0-9]*([0-9]+\.?[0-9]*)\s*ppm/i);
  const copperPpm     = copperPpmMatch ? parseFloat(copperPpmMatch[1]) : null;
  const zincPpm       = zincPpmMatch   ? parseFloat(zincPpmMatch[1])   : null;

  if (ironPpm !== null && ironPpm >= 150) {
    if (copperPpm !== null && copperPpm < 40) {
      flags.push({
        level: 'critical',
        title: 'High Iron + Low Copper',
        detail: `Iron is listed at ${ironPpm} ppm and copper at only ${copperPpm} ppm. Iron competes with copper for absorption — high iron can significantly reduce how much copper your horse actually absorbs, even if the listed copper value looks adequate. This combination warrants a diet review with an equine nutritionist, especially if your hay source is also high in iron.`
      });
    } else if (zincPpm !== null && zincPpm < 100) {
      flags.push({
        level: 'caution',
        title: 'High Iron + Low Zinc',
        detail: `Iron is listed at ${ironPpm} ppm and zinc at ${zincPpm} ppm. Excess iron can interfere with zinc absorption. Combined with potentially high iron in hay (common in many regions), total iron load may be a concern. Ask your vet or nutritionist about your hay's iron levels.`
      });
    } else if (copperPpm === null && zincPpm === null) {
      flags.push({
        level: 'caution',
        title: 'High Iron — Copper and Zinc Values Not Found',
        detail: `Iron is listed at ${ironPpm} ppm. High iron antagonizes copper and zinc absorption, but copper and zinc values were not found in the pasted text. Ask the manufacturer for the full mineral panel to evaluate the iron-copper-zinc balance.`
      });
    }
  }

  // ── 2. Dual selenium sources
  const hasSelYeast    = /selenium\s*yeast/i.test(ing);
  const hasSodSelenite = /sodium\s*selenite/i.test(ing);
  const hasSelProtein  = /selenium\s*proteinate/i.test(ing);
  if ((hasSelYeast || hasSelProtein) && hasSodSelenite) {
    const seVal = analysis && analysis.selenium ? analysis.selenium.value : null;
    flags.push({
      level: 'caution',
      title: 'Dual Selenium Sources Detected',
      detail: `Both organic selenium (${hasSelYeast ? 'selenium yeast' : ''}${hasSelProtein ? ' selenium proteinate' : ''}) and inorganic selenium (sodium selenite) are present in the ingredient list. Dual sources are common in commercial feeds, but total daily selenium from all sources — feed, hay, and supplements — must stay below approximately 2 mg/day for most horses. ${seVal ? `This feed lists selenium at ${seVal} ppm.` : 'The ppm value was not detected in the pasted text — ask the manufacturer.'} Selenium toxicity is serious and cumulative.`
    });
  }

  // ── 3. Molasses + high NSC + performance claim
  const hasMolasses  = /molasses/i.test(ing);
  const nscVal       = analysis && analysis.nsc    ? analysis.nsc.value    : null;
  const sugarVal     = analysis && analysis.sugar  ? analysis.sugar.value  : null;
  const starchVal    = analysis && analysis.starch ? analysis.starch.value : null;
  const calcNSC      = (sugarVal !== null && starchVal !== null) ? sugarVal + starchVal : null;
  const effectiveNSC = nscVal || calcNSC;
  if (hasMolasses && effectiveNSC !== null && effectiveNSC > 20) {
    flags.push({
      level: 'critical',
      title: 'Molasses + High NSC',
      detail: `Molasses is present in the ingredient list and NSC appears to be approximately ${effectiveNSC}%. This combination is not appropriate for horses with insulin resistance, EMS, PPID/Cushing's, or laminitis history. Do not feed this to metabolic horses without explicit veterinary approval.`
    });
  }

  // ── 4. Sodium selenite as only selenium source at high ppm
  if (hasSodSelenite && !hasSelYeast && !hasSelProtein) {
    const seVal = analysis && analysis.selenium ? analysis.selenium.value : null;
    if (seVal !== null && seVal > 0.5) {
      flags.push({
        level: 'caution',
        title: 'Inorganic Selenium at Elevated Level',
        detail: `Sodium selenite is the only selenium source detected, listed at ${seVal} ppm. Inorganic selenium has a narrower margin between adequate and toxic levels than organic forms. Total daily selenium from all sources (feed + hay + supplements) should be reviewed with your vet.`
      });
    }
  }

  // ── 5. Urea / non-protein nitrogen in horse feed
  if (/\burea\b|non-protein nitrogen|npn/i.test(ing)) {
    flags.push({
      level: 'critical',
      title: 'Urea / Non-Protein Nitrogen Detected',
      detail: 'Urea or non-protein nitrogen (NPN) is present in the ingredient list. Unlike ruminants (cattle, sheep), horses cannot efficiently utilize NPN as a protein source — their digestive system is not designed for it. Urea in horse feed provides no usable protein and at high levels can be harmful. Consult your vet or nutritionist before feeding this to horses.'
    });
  }

  // ── 6. Calcium carbonate + high alfalfa (excess calcium)
  const hasLimestone = /limestone|calcium carbonate/i.test(ing);
  const hasAlfalfa   = /alfalfa/i.test(ing);
  const caMin        = analysis && analysis.calcium ? analysis.calcium.value : null;
  if (hasLimestone && hasAlfalfa && caMin !== null && caMin > 1.5) {
    flags.push({
      level: 'caution',
      title: 'High Calcium — Alfalfa + Limestone Both Present',
      detail: `Both alfalfa (a high-calcium ingredient) and limestone (added calcium) are present, and calcium is listed at ${caMin}% (min). This is a high-calcium feed. When fed alongside alfalfa hay, total dietary calcium can become excessive and may interfere with phosphorus and magnesium balance. Discuss total diet calcium with your vet or nutritionist.`
    });
  }

  // ── 7. Copper sulfate + high zinc without copper ppm to verify ratio
  if (/copper sulfate|copper proteinate/i.test(ing) && zincPpm !== null && copperPpm !== null) {
    const znCuRatio = (zincPpm / copperPpm).toFixed(1);
    if (parseFloat(znCuRatio) > 6) {
      flags.push({
        level: 'caution',
        title: 'Zinc:Copper Ratio May Be High',
        detail: `Zinc is listed at ${zincPpm} ppm and copper at ${copperPpm} ppm — a Zn:Cu ratio of approximately ${znCuRatio}:1. The commonly recommended range is 3–4:1. A ratio above 6:1 may indicate excess zinc relative to copper, which can suppress copper absorption. This is worth reviewing if your horse is on this feed long-term.`
      });
    }
  }

  // ── 8. Propionic acid / mold inhibitor at top of list
  if (/propionic acid|calcium propionate|mold inhibitor/i.test(ing)) {
    const ingList = ing.split(',').map(s => s.trim());
    const propPos = ingList.findIndex(i => /propionic|propionate|mold inhibitor/.test(i));
    if (propPos >= 0 && propPos <= 4) {
      flags.push({
        level: 'note',
        title: 'Mold Inhibitor Near Top of Ingredient List',
        detail: `A mold inhibitor (propionic acid or calcium propionate) appears near position #${propPos + 1} in the ingredient list. These are generally safe and used to preserve feed quality, but their presence near the top suggests a higher moisture or grain content that requires preservation. Store this feed carefully and follow the manufacturer's storage guidelines.`
      });
    }
  }

  // ── 9. PSSM / tying-up / RER — grain-forward feed flag
  // Horses with PSSM1, PSSM2, RER, or recurrent tying-up
  // need very low starch AND low sugar — grain-forward feeds are problematic
  const grainIngredients = ingText ? [
    'corn','maize','oats','barley','wheat','milo','sorghum','grain'
  ].filter(g => textLower(ingText).includes(g)) : [];

  const nscForPSSM  = analysis.nsc    ? analysis.nsc.value    : null;
  const calcNSCPSSM = (analysis.sugar && analysis.starch) ? (analysis.sugar.value + analysis.starch.value) : null;
  const effectiveNSCPSSM = nscForPSSM || calcNSCPSSM;

  // Flag if: 2+ grain ingredients in top 5, OR NSC/calculated NSC > 15%
  const top5Ingredients = (ingText ? ingText.split(',').slice(0,5).join(',') : '');
  const grainInTop5 = grainIngredients.filter(g => textLower(top5Ingredients).includes(g));

  if (grainInTop5.length >= 2 || (effectiveNSCPSSM !== null && effectiveNSCPSSM > 15)) {
    flags.push({
      level: 'critical',
      title: 'Not Appropriate for PSSM / Tying-Up / RER',
      detail: `This feed appears to be grain-forward${grainInTop5.length ? ` (${grainInTop5.slice(0,3).join(', ')} detected near the top of the ingredient list)` : ''}${effectiveNSCPSSM ? ` with an NSC of approximately ${effectiveNSCPSSM}%` : ''}. Horses with Polysaccharide Storage Myopathy (PSSM type 1 or 2), Recurrent Exertional Rhabdomyolysis (RER), or recurring tying-up require a diet with very low starch and sugar — typically below 10–12% NSC total. High-grain feeds can trigger acute episodes. If your horse has any history of muscle stiffness, reluctance to move, or "tying-up," do not feed this without explicit veterinary approval and a confirmed diagnosis.`
    });
  }

  // ── 10. EMS/IR horse — high NSC flag independent of molasses
  if (effectiveNSCPSSM !== null && effectiveNSCPSSM > 20 && !flags.some(f => f.title.includes('Molasses'))) {
    flags.push({
      level: 'critical',
      title: 'High NSC — Not for Metabolic Horses',
      detail: `NSC appears to be approximately ${effectiveNSCPSSM}%. This exceeds the commonly recommended threshold of 10–12% NSC for horses with insulin resistance (IR), Equine Metabolic Syndrome (EMS), or laminitis history. Do not feed to metabolic horses without veterinary guidance.`
    });
  }

  return flags;
}

// Render red flags as HTML block
function renderRedFlagsHTML(flags) {
  if (!flags.length) return '';

  const styleMap = {
    critical: { bg: '#FDF0EE', border: 'rgba(139,46,0,0.35)', titleColor: '#8B2E00', icon: '🚨' },
    caution:  { bg: '#FDF3EE', border: 'rgba(200,130,26,0.3)', titleColor: '#8B4A00', icon: '⚠️' },
    note:     { bg: '#F8F4EE', border: 'rgba(200,182,154,0.35)', titleColor: '#5C3A1A', icon: '◆' }
  };

  const html = flags.map(f => {
    const s = styleMap[f.level] || styleMap.note;
    return `<div style="background:${s.bg};border:1.5px solid ${s.border};border-radius:8px;padding:12px 15px;margin-bottom:10px;">
      <div style="font-weight:700;color:${s.titleColor};margin-bottom:5px;font-size:0.9rem;">${s.icon} ${f.title}</div>
      <div style="font-size:0.85rem;color:#3D3D38;line-height:1.55;">${f.detail}</div>
    </div>`;
  }).join('');

  return `<div style="margin-top:6px;">
    <div style="font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8B2E00;margin-bottom:8px;">⚑ Red Flag Combinations</div>
    ${html}
  </div>`;
}

// ─────────────────────────────────────────────
// FEED FORM DETECTION
// Detects textured, pelleted, extruded, cube,
// or mixed form from label text and ingredients
// ─────────────────────────────────────────────
function detectFeedForm(text, ingText) {
  const lower    = textLower(text);
  const ingLower = textLower(ingText || '');

  const signals = {
    textured:  false,
    pelleted:  false,
    extruded:  false,
    cube:      false,
    crumble:   false,
    loose:     false
  };

  // ── Explicit label keywords (product name / packaging text)
  if (/textur/i.test(text))                                          signals.textured  = true;
  if (/pellet/i.test(text))                                          signals.pelleted  = true;
  if (/extrud/i.test(text))                                          signals.extruded  = true;
  if (/\bcube\b|\bcubes\b/i.test(text))                            signals.cube      = true;
  if (/crumble/i.test(text))                                         signals.crumble   = true;
  if (/loose|mash|meal mix|grain mix|sweet feed/i.test(text))        signals.loose     = true;

  // ── Infer textured from ingredient list patterns
  // Whole, cracked, rolled, flaked, steam-flaked = textured
  if (!signals.textured && !signals.pelleted && !signals.extruded) {
    const texturedIngredients = /(whole oats|cracked corn|rolled oat|rolled barley|flaked corn|steam.flaked|crimped|kibbled|whole grain|coarsely)/i;
    if (texturedIngredients.test(ingLower || text)) signals.textured = true;
  }

  // ── Infer pelleted if ingredients are ground/meal form with no textured signals
  if (!signals.textured && !signals.extruded && !signals.cube) {
    const groundIngredients = /(ground corn|ground oat|ground barley|wheat middling|dehydrated alfalfa meal|soybean meal|canola meal)/i;
    const hasGround = groundIngredients.test(ingLower || text);
    const noTexture = !/(whole oats|cracked corn|rolled|flaked|steam.flaked)/i.test(ingLower || text);
    if (hasGround && noTexture) signals.pelleted = true;
  }

  // ── Build result
  const detected = Object.entries(signals).filter(([,v]) => v).map(([k]) => k);

  if (!detected.length) return null;

  // ── Descriptions and implications for each form
  const formInfo = {
    textured: {
      label: 'Textured (Sweet Feed)',
      desc: 'Contains whole, cracked, rolled, or flaked grains mixed with other ingredients. Horses can sort textured feeds — picking out preferred pieces and leaving others. Nutrient intake may be uneven if a horse sorts. Higher palatability but more variable consumption.',
      digestion: 'Whole or minimally processed grains digest more slowly than extruded forms. Large grain meals can overwhelm small intestine capacity — small frequent meals are important.',
      caution: signals.textured ? 'Horses with choke risk, dental problems, or rapid eating habits should be evaluated before feeding a textured feed.' : ''
    },
    pelleted: {
      label: 'Pelleted',
      desc: 'Ingredients are ground, mixed, and compressed into uniform pellets. Horses cannot sort pelleted feeds — they consume the full formulation as intended. More consistent nutrient delivery than textured.',
      digestion: 'Pellets dissolve quickly when wet. Horses that eat pellets very fast may benefit from a slow feeder or soaking. Probiotic viability can be reduced by the heat of pelleting.',
      caution: 'Fast eaters and horses with choke history should be monitored. Soaking pellets adds moisture and slows consumption.'
    },
    extruded: {
      label: 'Extruded',
      desc: 'Cooked under high heat and pressure, then formed into expanded shapes. Starch is gelatinized during extrusion, which significantly improves digestibility in the small intestine — less undigested starch reaches the hindgut.',
      digestion: 'Extruded feeds have the highest starch digestibility of any processing method. This reduces hindgut fermentation of starch, which lowers risk of hindgut acidosis and related issues. A meaningful advantage for starch-sensitive horses.',
      caution: 'Heat from extrusion can reduce viability of added probiotics and some vitamins. Check whether the manufacturer adds heat-stable or post-extrusion forms of sensitive nutrients.'
    },
    cube: {
      label: 'Cubes / Hay Cubes',
      desc: 'Compressed forage or forage-concentrate mix formed into large cubes. Often used as a hay replacement or supplement. Cubes must be chewed adequately — soaking is recommended for horses with dental problems or choke history.',
      digestion: 'Cubes slow intake compared to loose hay. Soaking improves hydration and safety for horses that bolt their feed.',
      caution: 'Horses with poor dentition, choke history, or rapid eating should have cubes soaked before feeding.'
    },
    crumble: {
      label: 'Crumble',
      desc: 'A pelleted feed that has been broken into smaller pieces. Similar to pellets in nutrient consistency — horses cannot sort. Often used for young horses or horses that resist pellets.',
      digestion: 'Similar digestibility to pellets. Smaller particle size may be preferred by some horses.',
      caution: ''
    },
    loose: {
      label: 'Loose / Grain Mix / Mash',
      desc: 'A loose blend of grain and other ingredients. Similar sorting potential to textured feeds. Mash forms are often mixed with water before feeding, which improves hydration and slows consumption.',
      digestion: 'Digestibility depends on individual ingredient processing. Adding water to loose or mash feeds can improve intake and reduce choke risk.',
      caution: 'Wet mashes should be fed fresh — do not leave wet feed out for more than a few hours, especially in warm weather.'
    }
  };

  const primary = detected[0];
  const info    = formInfo[primary] || {};

  return {
    detected,
    primary,
    label:     info.label     || primary,
    desc:      info.desc      || '',
    digestion: info.digestion || '',
    caution:   info.caution   || ''
  };
}

function classifyFeedType(text) {
  const lower = textLower(text);
  const types = [];

  // ── Extract ingredient text for pattern detection
  const ingSection = (() => {
    const m = text.match(/ingredients\s*:([\s\S]*?)(?=guaranteed\s*analysis|feeding\s*directions|important:|$)/i);
    return m ? m[1].toLowerCase() : lower;
  })();

  // ── Extract crude fiber value if present
  const fiberMatch = text.match(/crude\s*fiber[^0-9]*([0-9]+\.?[0-9]*)\s*%/i);
  const crudeFiberPct = fiberMatch ? parseFloat(fiberMatch[1]) : null;

  // ── Extract ADF/NDF values if present (high ADF/NDF = forage-replacing)
  const adfMatch = text.match(/\badf\b[^0-9]*([0-9]+\.?[0-9]*)\s*%/i);
  const ndfMatch = text.match(/\bndf\b[^0-9]*([0-9]+\.?[0-9]*)\s*%/i);
  const adfVal = adfMatch ? parseFloat(adfMatch[1]) : null;
  const ndfVal = ndfMatch ? parseFloat(ndfMatch[1]) : null;

  // ── Count fiber-forward ingredients in ingredient section
  const completeFeedFiberIngredients = [
    'beet pulp','soybean hull','alfalfa meal','dehydrated alfalfa','hay meal',
    'oat hull','oat fiber','wheat straw','oat straw','timothy meal','grass meal'
  ];
  const fiberIngCount = completeFeedFiberIngredients.filter(t => ingSection.includes(t)).length;

  // ── Check feeding directions for hay-replacement language
  const hayReplaceLanguage = /(replace\s*hay|hay\s*replace|without\s*hay|no\s*hay|forage\s*replace|can\s*be\s*fed\s*without|replace\s*forage|hay\s*free|dentition|poor\s*teeth|chew)/i.test(text);

  // ── KEYWORD-BASED: highest confidence — explicit label claims
  if (/\bcomplete\s*feed\b/i.test(text)) {
    types.push({
      label: 'Complete Feed',
      confidence: 'high',
      reason: '"Complete feed" appears on the label. These are formulated to partially or fully replace hay and are often used for horses with poor dentition, limited hay access, or senior horses.'
    });
  }

  if (/\bsenior\b/i.test(text)) {
    types.push({
      label: 'Senior Feed',
      confidence: 'high',
      reason: '"Senior" appears on the label, suggesting this feed is formulated for older horses with reduced digestive efficiency, dental limitations, or both. Senior feeds are often higher in fiber and easier to chew.'
    });
  }

  if (/ration\s*balancer/i.test(text)) {
    types.push({
      label: 'Ration Balancer',
      confidence: 'high',
      reason: '"Ration balancer" appears on the label. These are low-feeding-rate concentrates (typically 1–2 lbs/day) designed to supply vitamins, minerals, and protein when fed alongside quality forage. Not a calorie feed.'
    });
  }

  // ── PATTERN-BASED: infer complete feed without keyword
  if (!types.some(t => t.label === 'Complete Feed')) {
    const completeFeedSignals = [];
    if (crudeFiberPct !== null && crudeFiberPct >= 18) completeFeedSignals.push(`crude fiber ${crudeFiberPct}% (≥18% is a strong complete feed indicator)`);
    if (fiberIngCount >= 2) completeFeedSignals.push(`${fiberIngCount} forage-type fiber ingredients detected (${completeFeedFiberIngredients.filter(t => ingSection.includes(t)).join(', ')})`);
    if (hayReplaceLanguage) completeFeedSignals.push('feeding directions reference hay replacement or dental limitations');
    if (adfVal !== null && adfVal >= 10) completeFeedSignals.push(`ADF ${adfVal}% suggests meaningful forage fiber content`);
    if (ndfVal !== null && ndfVal >= 20) completeFeedSignals.push(`NDF ${ndfVal}% suggests forage-level fiber`);

    if (completeFeedSignals.length >= 2) {
      types.push({
        label: 'Likely Complete or High-Fiber Feed',
        confidence: 'medium',
        reason: `"Complete feed" does not appear explicitly on this label, but multiple signals suggest it may be designed as a hay replacer or high-fiber feed: ${completeFeedSignals.join('; ')}.`
      });
    } else if (completeFeedSignals.length === 1 && (crudeFiberPct >= 18 || hayReplaceLanguage)) {
      types.push({
        label: 'Possibly Complete or High-Fiber Feed',
        confidence: 'low',
        reason: `One signal suggests this may be a complete or forage-replacing feed: ${completeFeedSignals[0]}. Confirm with the manufacturer whether this feed is intended to replace hay.`
      });
    }
  }

  if (!types.length) {
    // ── Low-starch / metabolic
    const lsc = /(low[\s\-]starch|low[\s\-]sugar|low[\s\-]nsc|controlled[\s\-]starch|controlled[\s\-]carb|metabolic|founder|laminitis)/i.test(text);
    const perf = /(performance|high[\s\-]fat|high[\s\-]calorie|show|endurance|sport|racing|eventing)/i.test(text);

    // Run signals only against ingredient section to avoid false positives
    const ingForCount = completeFeedFiberIngredients.filter(t => ingSection.includes(t)).length;
    const fiberCount  = detectSignals(ingSection, 'fiberEnergy').length;
    const grainCount  = detectSignals(ingSection, 'grainStarch').length;
    const vitCount    = detectSignals(text, 'vitamins').length;

    if (lsc) types.push({
      label: 'Low-Starch / Controlled-Carbohydrate Feed',
      confidence: 'high',
      reason: 'Language like "low starch," "low sugar," "controlled starch," or metabolic condition keywords appear on the label, indicating this feed was formulated with insulin-resistant or laminitis-risk horses in mind.'
    });

    if (perf) types.push({
      label: 'Performance / Weight-Gain Feed',
      confidence: 'medium',
      reason: 'Language associated with performance horses, high fat, or calorie density appears on the label. These feeds are typically higher in energy for horses in heavy work.'
    });

    if (!types.length) {
      if (fiberCount >= 3 && grainCount <= 1) {
        types.push({
          label: 'Fiber-Forward Feed',
          confidence: 'medium',
          reason: `Multiple fiber-based ingredients detected (${fiberCount} signals). This feed appears to derive most of its energy from digestible fiber rather than grain starch — generally a safer choice for metabolic horses.`
        });
      } else if (grainCount >= 3) {
        types.push({
          label: 'Grain/Starch-Forward Feed',
          confidence: 'medium',
          reason: `Multiple grain or starch ingredients detected (${grainCount} signals). This feed uses grain as a primary energy source. Not typically recommended for horses with insulin resistance, EMS, or laminitis history.`
        });
      } else if (vitCount >= 4 && fiberCount <= 1 && grainCount <= 1) {
        types.push({
          label: 'Vitamin/Mineral Balancing Feed',
          confidence: 'medium',
          reason: 'Several vitamin and mineral sources detected but few calorie-dense ingredients. This may be a supplement or balancer designed to complement forage rather than provide significant calories.'
        });
      } else {
        types.push({
          label: 'General Purpose Feed',
          confidence: 'low',
          reason: 'Insufficient label keywords to narrow the classification further. A mix of ingredients is present but no dominant pattern was detected. Review the full label and consult the manufacturer for feeding guidance.'
        });
      }
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
// INGREDIENT ORDER ANALYSIS
// Parses the ingredient list into an ordered
// array and evaluates position-based signals.
// Feed labels list by weight — position matters.
// ─────────────────────────────────────────────

// Parse ingredient list into ordered array
function parseIngredientOrder(text) {
  let ingSection = '';

  // Try to find INGREDIENTS: header and take only what follows it
  const headerMatch = text.match(/ingredients\s*:([\s\S]*?)(?=guaranteed\s*analysis|feeding\s*directions|important:|$)/i);
  if (headerMatch) {
    ingSection = headerMatch[1];
  } else {
    // No header — use the stripped ingredient text
    ingSection = extractIngredientText(text);
    // Additional safety: strip lines that look like product names or headers
    // (all-caps lines, lines with no comma, lines shorter than 5 chars)
    ingSection = ingSection
      .split('\n')
      .filter(line => {
        const t = line.trim();
        if (!t) return false;
        if (t.length < 4) return false;
        // Skip lines that are all uppercase (product name / section header)
        if (t === t.toUpperCase() && /[A-Z]/.test(t)) return false;
        // Skip lines with numbers followed by % (analysis rows that slipped through)
        if (/\d+\.?\d*\s*%/.test(t)) return false;
        return true;
      })
      .join(' ');
  }

  // Split on commas, clean each entry, filter out non-ingredient noise
  return ingSection
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(s => {
      if (s.length < 3) return false;
      // Skip entries that look like product names, headers, or numbers
      if (/^\d/.test(s)) return false;                        // starts with number
      if (/guaranteed|analysis|feeding|direction|important/i.test(s)) return false;
      if (/crude|minimum|maximum|\bmin\b|\bmax\b/i.test(s)) return false;
      // Skip entries that are suspiciously long (probably grabbed a sentence)
      if (s.split(' ').length > 8) return false;
      return true;
    });
}

// Categorize a single ingredient string
// ORDER MATTERS — more specific rules must come before broader ones
function categorizeIngredient(ing) {
  const i = ing.toLowerCase();

  // ── Sugar sources — check first before grain rules
  if (/molasses|cane molasses|corn syrup|dextrose|sucrose/.test(i)) return 'sugar';

  // ── Byproducts that LOOK like grains but are NOT starch-primary
  // Must be checked before the broad grain/starch rule
  if (/distiller|ddgs|dried grain solubles/.test(i))               return 'protein'; // high protein/fat byproduct
  if (/wheat middling|wheat bran|wheat germ|wheat flour/.test(i))  return 'fiber';   // fiber/protein, low starch
  if (/corn gluten|corn bran|hominy/.test(i))                       return 'protein'; // protein/fiber byproduct
  if (/brewers grain|brewers dried grain/.test(i))                  return 'protein'; // fermentation byproduct
  if (/brewers dried yeast|brewers yeast/.test(i))                  return 'probiotic';
  if (/rice bran|rice hull|rice polish/.test(i))                    return 'fat';     // fat source not starch
  if (/soybean hull|soy hull/.test(i))                              return 'fiber';
  if (/cottonseed hull/.test(i))                                    return 'fiber';
  if (/oat hull|oat fiber|oat straw/.test(i))                       return 'fiber';
  if (/beet pulp/.test(i))                                          return 'fiber';
  if (/alfalfa|dehydrated alfalfa|hay meal|timothy meal|grass meal/.test(i)) return 'fiber';
  if (/hay/.test(i))                                                return 'fiber';

  // ── Primary grain/starch sources — whole or minimally processed grains
  // Only after all byproduct exceptions have been handled
  if (/wheat/.test(i) && !/middling|bran|germ|flour/.test(i))           return 'starch';
  if (/(corn|maize)/.test(i) && !/gluten|bran|hominy/.test(i))          return 'starch';
  if (/oat/.test(i) && !/hull|fiber|straw/.test(i))                     return 'starch';
  if (/barley/.test(i))                                                    return 'starch';
  if (/milo|sorghum|rye/.test(i))                      return 'starch';
  if (/cereal grain|grain product/.test(i))                         return 'starch';

  // ── Protein meals
  if (/soybean meal|canola meal|linseed meal|cottonseed meal|sunflower meal/.test(i)) return 'protein';

  // ── Fat sources
  if (/oil|vegetable fat|animal fat|tallow|flaxseed|linseed|stabilized fat/.test(i)) return 'fat';

  // ── Minerals macro
  if (/salt|sodium chloride/.test(i))                               return 'salt';
  if (/limestone|calcium carbonate|dicalcium|monocalcium|phosphate|magnesium oxide|magnesium sulfate/.test(i)) return 'mineral';

  // ── Vitamins and supplements
  if (/vitamin|supplement|niacin|biotin|riboflavin|thiamine|choline|folic|pyridoxine|pantothenate|menadione|cyanocobalamin/.test(i)) return 'vitamin';

  // ── Probiotics / digestive
  if (/lactobacillus|enterococcus|pediococcus|bifidobacterium|saccharomyces|yeast culture|fermentation product/.test(i)) return 'probiotic';
  if (/yeast/.test(i))                                              return 'probiotic';

  // ── Trace minerals
  if (/zinc|copper|manganese|selenium|ferrous|cobalt|iodine|ethylenediamine/.test(i)) return 'trace-mineral';
  if (/iron/.test(i))                                           return 'trace-mineral';

  // ── Amino acids
  if (/lysine|methionine|threonine|tryptophan|amino acid/.test(i)) return 'amino-acid';

  // ── Flavoring / palatability
  if (/flavor|palatab/.test(i))                                     return 'flavoring';

  // ── Mold inhibitors / preservatives
  if (/propionic|propionate|mold inhibitor|preservative|antioxidant/.test(i)) return 'preservative';

  return 'other';
}

// Main ingredient order analysis — returns flags array
function analyzeIngredientOrder(text) {
  if (!hasIngredientList(text)) return [];

  const ingredients = parseIngredientOrder(text);
  if (!ingredients.length) return [];

  const flags = [];
  const top3  = ingredients.slice(0, 3);
  const top5  = ingredients.slice(0, 5);

  // ── Flag: starch/grain in top 3
  const top3Starch = top3.filter(i => categorizeIngredient(i) === 'starch');
  if (top3Starch.length >= 2) {
    flags.push({
      level: 'caution',
      text: `<strong>High-starch ingredients lead the list.</strong> "${top3Starch.join('", "')}" appear among the first three ingredients — meaning they make up the largest portion of this feed by weight. This is a grain-forward formula. Horses with insulin resistance, laminitis, EMS, or PPID/Cushing's should not be on high-starch feeds without veterinary guidance.`
    });
  } else if (top3Starch.length === 1) {
    flags.push({
      level: 'note',
      text: `<strong>Grain ingredient near the top.</strong> "${top3Starch[0]}" appears in the first three ingredients, indicating it's one of the larger components of this feed by weight.`
    });
  }

  // ── Flag: molasses/sugar position — precise 4-tier system
  const allSugar  = ingredients.filter(i => categorizeIngredient(i) === 'sugar');
  const sugarPos  = allSugar.length ? ingredients.indexOf(allSugar[0]) + 1 : 0;
  const sugarName = allSugar.length ? allSugar[0] : null;

  if (sugarPos === 1 || sugarPos === 2) {
    // Top 2 — sugar is a primary ingredient by weight
    flags.push({
      level: 'caution',
      text: `<strong>⚠ "${sugarName}" is ingredient #${sugarPos} — one of the largest components by weight.</strong> Sugar this high in the ingredient list is unusual and indicates a high-sugar formula. Not appropriate for horses with insulin resistance, laminitis, EMS, or PPID/Cushing's.`
    });
  } else if (sugarPos >= 3 && sugarPos <= 5) {
    // Positions 3–5 — meaningful contributor
    flags.push({
      level: 'caution',
      text: `<strong>"${sugarName}" appears at position #${sugarPos}</strong> in the ingredient list — a meaningful sugar contributor, not just a trace amount. This feed has a notable sugar content from ${sugarName}. Relevant for horses with metabolic conditions, insulin resistance, or laminitis history.`
    });
  } else if (sugarPos >= 6 && sugarPos <= 9) {
    // Positions 6–9 — moderate, likely palatability
    flags.push({
      level: 'note',
      text: `<strong>"${sugarName}" appears at position #${sugarPos}</strong> — mid-list, suggesting a moderate amount likely used for palatability and dust control rather than as a primary energy source. Still relevant for sensitive horses — ask the manufacturer for the sugar % value.`
    });
  } else if (sugarPos >= 10) {
    // Position 10+ — minor trace amount
    flags.push({
      level: 'info',
      text: `<strong>"${sugarName}" appears at position #${sugarPos}</strong> — near the end of the ingredient list, indicating a small trace amount, likely for palatability only. Minimal sugar contribution expected at this position.`
    });
  }

  // ── Flag: fiber sources leading (positive signal)
  const top3Fiber = top3.filter(i => categorizeIngredient(i) === 'fiber');
  if (top3Fiber.length >= 2) {
    flags.push({
      level: 'positive',
      text: `<strong>Fiber sources lead the ingredient list.</strong> "${top3Fiber.join('", "')}" appear among the first three ingredients — a positive signal. This feed appears to derive most of its energy from digestible fiber rather than grain starch, which is easier on the hindgut and more appropriate for metabolic horses.`
    });
  }

  // ── Flag: first ingredient
  if (ingredients[0]) {
    const cat = categorizeIngredient(ingredients[0]);
    const firstIng = ingredients[0];
    if (cat === 'starch') {
      flags.push({
        level: 'caution',
        text: `<strong>"${firstIng}" is the first ingredient</strong> — meaning it's present in the largest amount by weight. This is a starch/grain-primary feed.`
      });
    } else if (cat === 'fiber') {
      flags.push({
        level: 'positive',
        text: `<strong>"${firstIng}" is the first ingredient</strong> — the largest component by weight is a fiber source, which is a favorable characteristic for hindgut health.`
      });
    } else if (cat === 'sugar') {
      flags.push({
        level: 'caution',
        text: `<strong>"${firstIng}" is the first ingredient</strong> — sugar is the largest component by weight. This is unusual and worth questioning.`
      });
    }
  }

  // ── Flag: protein source position
  const proteinIng = ingredients.findIndex(i => categorizeIngredient(i) === 'protein');
  if (proteinIng >= 0 && proteinIng <= 2) {
    flags.push({
      level: 'note',
      text: `<strong>Protein source "${ingredients[proteinIng]}" is near the top</strong> (position ${proteinIng + 1}) — indicating meaningful protein contribution from this ingredient.`
    });
  }

  // ── Summary: total ingredient count
  if (ingredients.length >= 5) {
    const cats = ingredients.map(categorizeIngredient);
    const starchCount  = cats.filter(c => c === 'starch').length;
    const fiberCount   = cats.filter(c => c === 'fiber').length;
    const vitCount     = cats.filter(c => c === 'vitamin' || c === 'trace-mineral' || c === 'amino-acid').length;
    flags.push({
      level: 'info',
      text: `<strong>Label contains approximately ${ingredients.length} ingredients.</strong> Breakdown by category: ${fiberCount} fiber source${fiberCount !== 1 ? 's' : ''}, ${starchCount} grain/starch source${starchCount !== 1 ? 's' : ''}, ${vitCount} vitamin/mineral/amino acid addition${vitCount !== 1 ? 's' : ''}.`
    });
  }

  return flags;
}

// Render ingredient order flags as HTML
function renderIngredientOrderHTML(flags) {
  if (!flags.length) return '';

  const colorMap = {
    caution:  { bg: '#FDF3EE', border: 'rgba(139,46,0,0.25)', icon: '⚠', color: '#8B2E00' },
    note:     { bg: '#F8F4EE', border: 'rgba(200,182,154,0.4)', icon: '◆', color: '#5C3A1A' },
    positive: { bg: '#E8F2ED', border: 'rgba(61,122,94,0.3)', icon: '✓', color: '#1C3A2F' },
    info:     { bg: '#F8F4EE', border: 'rgba(200,182,154,0.3)', icon: '●', color: '#6B6B64' }
  };

  return flags.map(f => {
    const s = colorMap[f.level] || colorMap.info;
    return `<div style="background:${s.bg};border:1px solid ${s.border};border-radius:6px;padding:10px 13px;margin-bottom:8px;font-size:0.85rem;color:${s.color};">
      <span style="margin-right:6px">${s.icon}</span>${f.text}
    </div>`;
  }).join('');
}

// ─────────────────────────────────────────────
// MAIN DECODE FUNCTION
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// INTRODUCTORY SUMMARY
// First paragraph the consumer reads — narrative,
// not a list. Tells them what this feed does to a horse.
// ─────────────────────────────────────────────
function buildIntroSummary(text, analysis, feedTypes, feedForm, fiberFound, grainFound, fatFound, proteinFound, sugarFound, profile) {
  const sentences = [];
  const t = text || '';
  const tl = t.toLowerCase();

  // ── What kind of feed is this
  const primaryType = feedTypes && feedTypes[0] ? feedTypes[0].label : 'horse feed';
  const formDesc = feedForm ? feedForm.label.toLowerCase() : '';
  const formNote = formDesc ? ` in ${formDesc} form` : '';

  // ── Primary energy character — the most important thing
  const fiberLead  = fiberFound && fiberFound.length >= 2 && (!grainFound || grainFound.length <= 1);
  const grainLead  = grainFound && grainFound.length >= 2 && (!fiberFound || fiberFound.length <= 1);
  const mixedEnergy = grainFound && fiberFound && grainFound.length >= 1 && fiberFound.length >= 1;

  const hasMolasses = /molasses/i.test(t);
  const hasBeetPulp = /beet pulp/i.test(t);
  const hasAlfalfa  = /alfalfa/i.test(t);
  const hasSoyHulls = /soybean hull/i.test(t);
  const hasRiceBran = /rice bran/i.test(t);
  const hasFlax     = /flax|linseed/i.test(t);
  const hasCorn     = /corn/i.test(t);
  const hasOats     = /oats/i.test(t);

  // NSC
  const nscM  = t.match(/nsc[^0-9]{0,20}(\d+\.?\d*)/i);
  const stM   = t.match(/starch[^0-9]{0,20}(\d+\.?\d*)\s*%/i);
  const suM   = t.match(/sugar[^0-9]{0,20}(\d+\.?\d*)\s*%/i);
  const nscVal = nscM ? parseFloat(nscM[1]) :
                 (stM && suM ? parseFloat(stM[1]) + parseFloat(suM[1]) : null);

  const cpVal  = analysis && analysis.protein ? analysis.protein.value : null;
  const fatVal = analysis && analysis.fat ? analysis.fat.value : null;
  const seVal  = analysis && analysis.selenium ? analysis.selenium.value : null;
  const vitEVal = analysis && analysis.vitE ? analysis.vitE.value : null;

  // ── Opening — lead with horse profile if provided
  const useLabels = {
    pleasure: 'trail or pleasure horse', performance: 'performance horse',
    senior: 'senior horse', breeding: 'breeding horse', growing: 'young or growing horse', idle: 'retired horse'
  };
  const health = profile && profile.health ? profile.health : [];
  const use    = profile && profile.use    ? profile.use    : null;

  const healthLabels = {
    ir: 'insulin resistance', laminitis: 'laminitis history', cushings: "Cushing's disease",
    pssm: 'PSSM / tying-up', ulcers: 'ulcers', hoof: 'hoof quality issues', weight_loss: 'hard keeper'
  };
  const healthDesc = health.filter(h => h !== 'none').map(h => healthLabels[h] || h);

  let opener = '';
  if (use || healthDesc.length) {
    opener += 'For your <strong>' + (use ? useLabels[use] || use : 'horse') + '</strong>';
    if (healthDesc.length) {
      opener += ' with <strong>' + healthDesc.join(', ') + '</strong>';
    }
    opener += ', this is a <strong>' + primaryType + '</strong>' + formNote + '.';
  } else {
    opener = 'This is a <strong>' + primaryType + '</strong>' + formNote + '.';
  }

  if (feedForm && feedForm.primary === 'pelleted') {
    opener += ' Pellets are consistent, dust-free, and resist sorting — what you feed is what gets eaten.';
  } else if (feedForm && feedForm.primary === 'textured') {
    opener += ' The textured form allows horses to sort ingredients — monitor that the whole ration is being consumed.';
  } else if (feedForm && feedForm.primary === 'extruded') {
    opener += ' Extruded feeds are cooked under heat and pressure, improving starch digestibility.';
  }
  sentences.push(opener);

  // ── What it does — energy story
  if (fiberLead) {
    const fiberNames = (fiberFound || []).slice(0, 2).join(' and ');
    let fiberSentence = `The energy in this feed comes primarily from <strong>digestible fiber</strong>`;
    if (fiberNames) fiberSentence += ` — specifically ${fiberNames}`;
    fiberSentence += `. This means the horse's hindgut microbes do the work of fermenting the feed into usable energy, rather than a rapid glucose spike from grain digestion.`;
    if (hasBeetPulp) fiberSentence += ' Beet pulp is one of the safest energy sources for horses with metabolic concerns — low glycemic impact, highly digestible, and gut-friendly.';
    sentences.push(fiberSentence);
  } else if (grainLead) {
    const grainNames = (grainFound || []).slice(0, 2).join(' and ');
    let grainSentence = `The primary energy source is <strong>grain starch</strong>`;
    if (grainNames) grainSentence += ` (${grainNames})`;
    grainSentence += `. Grain starch digests quickly in the small intestine and causes a blood glucose and insulin rise. For a horse in active work, this provides fast-burning fuel. For a horse with insulin resistance, EMS, Cushing's, PSSM, or laminitis history, grain-forward feeds require veterinary guidance before use.`;
    sentences.push(grainSentence);
  } else if (mixedEnergy) {
    sentences.push(`This feed draws energy from both <strong>grain starch</strong> and <strong>digestible fiber</strong> — a common approach in performance feeds that balances quick-burning grain energy with slower, hindgut-fermented fiber calories. The fiber component buffers some of the starch's glycemic impact.`);
  }

  // ── Fat story if meaningful
  if (fatVal !== null && fatVal >= 8) {
    let fatSent = `With <strong>${fatVal}% crude fat</strong>, this is a high-fat formula.`;
    if (hasRiceBran)  fatSent += ' Rice bran is a primary fat source — calorie-dense without adding starch.';
    if (hasFlax)      fatSent += ' Flaxseed provides omega-3 fatty acids, which support coat quality and have anti-inflammatory effects.';
    fatSent += ` Fat provides 2.25× more energy per gram than carbohydrates, making this feed calorie-efficient for hard keepers, performance horses, or horses that need extra condition without extra grain.`;
    sentences.push(fatSent);
  } else if (fatVal !== null && fatVal < 4) {
    sentences.push(`Crude fat is <strong>${fatVal}%</strong> — low. Despite any performance marketing on the packaging, this is not a fat-based energy feed.`);
  }

  // ── Protein
  if (cpVal !== null) {
    const isSenior    = /senior/i.test(t);
    const isBalancer  = /ration balancer/i.test(t);
    const isGrowing   = /foal|growing|weanling|yearling/i.test(t);
    let protSent = `Crude protein is <strong>${cpVal}%</strong>.`;
    if (isBalancer) {
      protSent += ` High crude protein % is expected in ration balancers — they're fed in small amounts (1–2 lbs/day), so actual daily protein delivery is moderate. This is a concentrated vitamin, mineral, and amino acid supplement, not a high-protein bulk feed.`;
    } else if (isGrowing) {
      protSent += cpVal >= 14 ? ` Appropriate for a growing horse, which needs more protein per pound of body weight than a mature horse.` : ` On the lower end for a growing horse — most nutritionists recommend 14–16% for foals and yearlings.`;
    } else if (isSenior) {
      protSent += cpVal >= 12 ? ` Good for a senior horse — older horses are less efficient at digesting and utilizing protein, so slightly higher crude protein helps maintain muscle mass.` : ` Below the 12–14% most equine nutritionists recommend for senior horses, who absorb protein less efficiently as they age.`;
    } else {
      protSent += cpVal > 16 ? ` High for a general purpose feed. Excess protein is excreted as ammonia, not stored as muscle. Fine for healthy horses with functional kidneys, but more than a mature horse at maintenance needs.` : cpVal >= 12 ? ` A moderate, appropriate level for a formulated concentrate.` : ` On the lower end for a concentrate — verify this meets your horse's needs given their workload.`;
    }
    sentences.push(protSent);
  }

  // ── NSC / metabolic impact sentence
  if (nscVal !== null) {
    const nscSource = nscM ? 'listed on the label' : 'calculated from the listed sugar and starch values';
    let nscSent = `The NSC (non-structural carbohydrates — sugar + starch combined) is <strong>approximately ${nscVal}%</strong> (${nscSource}).`;
    if (nscVal <= 10) {
      nscSent += ` This is low-NSC — potentially suitable for horses with insulin resistance, EMS, laminitis, Cushing's, or PSSM, though always confirm with your vet.`;
    } else if (nscVal <= 15) {
      nscSent += ` This is moderate. Use caution with insulin-sensitive horses and verify this fits within their total daily NSC budget.`;
    } else {
      nscSent += ` This is elevated. This feed is not appropriate for horses with insulin resistance, EMS, laminitis history, Cushing's disease, or PSSM without explicit veterinary guidance.`;
    }
    sentences.push(nscSent);
  } else if (hasMolasses && (grainLead || mixedEnergy)) {
    sentences.push(`NSC is not listed on this label, but the combination of grain ingredients and molasses suggests a meaningful starch and sugar load. Ask the manufacturer for the tested NSC value before feeding to any horse with metabolic concerns.`);
  }

  // ── Selenium note if notable
  if (seVal !== null && seVal > 0.3) {
    sentences.push(`Selenium is <strong>${seVal} ppm</strong> — above the commonly cited 0.3 mg/kg safe upper limit for feed selenium. This is not necessarily dangerous at normal feeding rates, but total daily selenium from all sources (feed + hay + supplements) must be evaluated together.`);
  }

  // ── Effect on the horse — closing paragraph
  const effects = [];
  if (hasAlfalfa) effects.push("alfalfa's calcium and protein buffering the gastric environment");
  if (hasBeetPulp || hasSoyHulls) effects.push('fermentable fiber supporting a stable hindgut microbiome');
  if (hasRiceBran || hasFlax || (fatVal !== null && fatVal >= 8)) effects.push('fat sources promoting coat shine and sustained energy without starch spikes');
  if (/yeast culture|lactobacillus|saccharomyces/i.test(t)) effects.push('digestive support ingredients to maintain hindgut health under stress or dietary change');
  if (/biotin/i.test(t)) effects.push('biotin to support hoof horn synthesis over the coming months');
  if (vitEVal !== null && vitEVal >= 200) effects.push(`${vitEVal} IU/lb of Vitamin E — important for muscle and immune health, especially for horses without daily pasture access`);

  if (effects.length >= 2) {
    sentences.push(`<div class="intro-effect">What this feed is designed to do for your horse: ${effects.slice(0,3).join('; ')}. The cards below break down each section in detail.</div>`);
  } else {
    sentences.push(`<div class="intro-effect">The detail cards below explain each ingredient category and guaranteed analysis value. Use the horse profile panel to get a personalized assessment for your specific horse.</div>`);
  }

  return sentences.join(' ');
}

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

  const feedTypes          = classifyFeedType(text);
  const analysis           = extractAnalysis(text);
  const ingredientOrderFlags = hasIngList ? analyzeIngredientOrder(text) : [];
  const ingredientOrderHTML  = renderIngredientOrderHTML(ingredientOrderFlags);
  const feedForm             = detectFeedForm(text, ingText);
  const redFlags             = detectRedFlags(text, ingText, analysis);
  const redFlagsHTML         = renderRedFlagsHTML(redFlags);
  const feedingDir           = parseFeedingDirections(text, analysis);

  // ── No-ingredient-list warning banner
  const noIngBanner = !hasIngList
    ? `<div style="background:#FBF0DC;border:1px solid rgba(200,130,26,0.3);border-radius:6px;padding:10px 14px;margin-bottom:12px;font-size:0.85rem;color:#5C3A1A;">
        <strong>&#9888; Guaranteed analysis only detected — no ingredient list found.</strong><br>
        Energy source, fiber, fat, and protein sections below require the ingredient list to populate accurately.
        For a complete breakdown, paste the full label including the INGREDIENTS section.
       </div>`
    : '';

  // ── Feed Type
  const feedFormHTML = feedForm ? (() => {
    const cautionBlock = feedForm.caution
      ? `<div style="background:#FBF0DC;border:1px solid rgba(200,130,26,0.2);border-radius:5px;padding:7px 11px;margin-top:6px;font-size:0.82rem;color:#5C3A1A;">&#9888; ${feedForm.caution}</div>`
      : '';
    return `<div style="background:#F8F4EE;border:1px solid rgba(200,182,154,0.35);border-radius:6px;padding:12px 14px;margin-top:14px;">
      <div style="font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#C8821A;margin-bottom:4px;">Feed Form</div>
      <strong style="color:#1C3A2F">${feedForm.label}</strong><br>
      <span style="font-size:0.85rem;color:#3D3D38">${feedForm.desc}</span><br><br>
      <span style="font-size:0.85rem;color:#3D3D38"><strong>Digestion note:</strong> ${feedForm.digestion}</span>
      ${cautionBlock}
    </div>`;
  })() : '';

  // ── Ingredient list completeness signal
  let ingCompletenessHTML = '';
  if (hasIngList) {
    const ingList       = parseIngredientOrder(text);
    const ingCount      = ingList.length;
    const feedTypeLbl   = feedTypes[0]?.label || '';
    const isComplexFeed = /performance|senior|complete|balancer|sport|endurance/i.test(feedTypeLbl + text);

    if (ingCount < 5 && isComplexFeed) {
      ingCompletenessHTML = `<div style="background:#FBF0DC;border:1px solid rgba(200,130,26,0.25);border-radius:6px;padding:9px 13px;margin-top:12px;font-size:0.83rem;color:#5C3A1A;">
        <strong>&#9888; Short ingredient list for a ${feedTypeLbl}.</strong> Only ${ingCount} ingredient${ingCount !== 1 ? 's' : ''} detected. A formulated feed of this type typically contains 15–40+ ingredients. This may mean the full ingredient list was not included — paste the complete label for the best analysis.
      </div>`;
    } else if (ingCount < 8 && isComplexFeed) {
      ingCompletenessHTML = `<div style="background:#F8F4EE;border:1px solid rgba(200,182,154,0.3);border-radius:6px;padding:9px 13px;margin-top:12px;font-size:0.83rem;color:#5C3A1A;">
        <strong>Note:</strong> ${ingCount} ingredients detected. If this is a fully formulated commercial feed, the complete ingredient list typically contains more. Confirm the full list was included.
      </div>`;
    } else if (ingCount >= 15) {
      ingCompletenessHTML = `<div style="background:#F2F7F4;border:1px solid rgba(61,122,94,0.2);border-radius:6px;padding:8px 12px;margin-top:12px;font-size:0.81rem;color:#2D5C47;">
        <strong>&#10003;</strong> ${ingCount} ingredients detected — appears to be a complete ingredient list.
      </div>`;
    }
  }

  const feedTypeHTML = noIngBanner + feedTypes.map(ft =>
    `<strong>${ft.label}</strong> <em>(${ft.confidence} confidence)</em><br><span style="font-size:0.88rem">${ft.reason}</span>`
  ).join('<br><br>') + feedFormHTML + ingCompletenessHTML;

  // ── Energy Sources
  const noIngMsg = '<em style="color:#888;font-size:0.88rem">Ingredient list not detected — paste the full label including the INGREDIENTS section to see energy sources.</em>';
  const energyParts = [];
  if (fiberFound.length) energyParts.push(`<strong>Fiber energy:</strong> ${fiberFound.map(f => pill(f)).join(' ')}`);
  if (grainFound.length) energyParts.push(`<strong>Grain/starch energy:</strong> ${grainFound.map(f => pill(f)).join(' ')}`);
  if (fatFound.length)   energyParts.push(`<strong>Fat energy:</strong> ${fatFound.map(f => pill(f)).join(' ')}`);

  const energyBase = !hasIngList ? noIngMsg
    : energyParts.length ? energyParts.join('<br>')
    : 'No clear energy source ingredients detected. Check that the ingredient list was included.';

  const energyHTML = energyBase + (hasIngList && ingredientOrderHTML
    ? '<br><br><strong style="font-size:0.8rem;text-transform:uppercase;letter-spacing:0.07em;color:var(--text-light)">Ingredient Order Analysis</strong><br>' + ingredientOrderHTML
    : '');

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

  // ── Sugar/Starch / NSC
  const nscVal    = analysis.nsc    ? analysis.nsc.value    : null;
  const sugarVal  = analysis.sugar  ? analysis.sugar.value  : null;
  const starchVal = analysis.starch ? analysis.starch.value : null;

  // ── NSC helper: render a value with color-coded risk language
  function nscRiskNote(val, source) {
    const risk = val <= 10
      ? { label: 'Low', color: '#1C3A2F', bg: '#E8F2ED', note: 'Generally considered safe for most horses including those with insulin resistance or laminitis history. Always verify with your vet.' }
      : val <= 15
      ? { label: 'Moderate-Low', color: '#5C3A1A', bg: '#FBF0DC', note: 'May be appropriate for horses in light to moderate work without metabolic concerns. Use caution with insulin-resistant or laminitis-risk horses.' }
      : val <= 20
      ? { label: 'Moderate', color: '#8B4A00', bg: '#FDF3EE', note: 'Not recommended for horses with insulin resistance, EMS, PPID/Cushing\'s, or laminitis history without veterinary guidance.' }
      : { label: 'High', color: '#8B2E00', bg: '#FDF0EE', note: 'This level of NSC is not appropriate for horses with metabolic conditions. Consult your vet before feeding.' };
    return `<div style="background:${risk.bg};border-radius:6px;padding:10px 13px;margin:6px 0;font-size:0.88rem;">
      <strong style="color:${risk.color}">NSC ${source}: ~${val}% — ${risk.label}</strong><br>
      <span style="color:#5C3A1A">${risk.note}</span>
    </div>`;
  }

  const sugarWarnings = [];

  // ── Sugar ingredient signals from ingredient list
  if (hasIngList && sugarFound.length) {
    // Build position-aware molasses note
    const ingList       = parseIngredientOrder(text);
    const sugarIngreds  = ingList.filter(i => categorizeIngredient(i) === 'sugar');
    const sugarPosition = sugarIngreds.length ? ingList.indexOf(sugarIngreds[0]) + 1 : 0;
    const sugarIngName  = sugarIngreds.length ? sugarIngreds[0] : sugarFound[0];

    let posNote = '';
    if (sugarPosition >= 1 && sugarPosition <= 2) {
      posNote = `<strong style="color:#8B2E00"> — listed at position #${sugarPosition} (one of the largest ingredients by weight). High sugar contribution.</strong>`;
    } else if (sugarPosition >= 3 && sugarPosition <= 5) {
      posNote = `<strong style="color:#8B4A00"> — listed at position #${sugarPosition} (meaningful sugar contributor).</strong>`;
    } else if (sugarPosition >= 6 && sugarPosition <= 9) {
      posNote = ` — listed at position #${sugarPosition} (moderate amount, likely for palatability).`;
    } else if (sugarPosition >= 10) {
      posNote = ` — listed at position #${sugarPosition} (trace amount near end of list, minimal sugar contribution expected).`;
    }

    sugarWarnings.push(`Sugar/palatability ingredients detected: ${sugarFound.map(s => pill(s, true)).join(' ')}${posNote}`);
  }

  // ── NSC: listed directly
  if (nscVal !== null) {
    sugarWarnings.push(nscRiskNote(nscVal, '(listed on label)'));
    if (sugarVal !== null) sugarWarnings.push(`Sugar: ${sugarVal}% (max) as listed.`);
    if (starchVal !== null) sugarWarnings.push(`Starch: ${starchVal}% (max) as listed.`);

  // ── NSC: calculate from sugar + starch if both listed
  } else if (sugarVal !== null && starchVal !== null) {
    const calcNSC = Math.round((sugarVal + starchVal) * 10) / 10;
    sugarWarnings.push(`<strong>NSC not listed — calculated from label values:</strong> Sugar (${sugarVal}%) + Starch (${starchVal}%) = <strong>~${calcNSC}% NSC</strong>`);
    sugarWarnings.push(nscRiskNote(calcNSC, '(calculated: sugar + starch)'));
    sugarWarnings.push(`<em style="font-size:0.82rem;color:#888">Note: Calculated NSC may differ slightly from a laboratory-tested value. Some feeds test lower due to processing. Ask the manufacturer for the actual tested NSC value to confirm.</em>`);

  // ── NSC: only sugar listed
  } else if (sugarVal !== null && starchVal === null) {
    sugarWarnings.push(`Sugar listed at ${sugarVal}% (max). Starch value not found — NSC cannot be calculated. Ask the manufacturer for the starch and NSC values.`);
    sugarWarnings.push(`<em style="font-size:0.82rem;color:#888">For metabolic horses, the target is typically total NSC below 10–12%. Sugar alone does not give the full picture.</em>`);

  // ── NSC: only starch listed
  } else if (starchVal !== null && sugarVal === null) {
    sugarWarnings.push(`Starch listed at ${starchVal}% (max). Sugar (WSC) value not found — NSC cannot be calculated. Ask the manufacturer for the sugar and NSC values.`);

  // ── NSC: nothing listed — use ingredient order signals to give qualitative estimate
  } else {
    const ingFlags = hasIngList ? ingredientOrderFlags : [];
    const hasGrainLead  = ingFlags.some(f => f.level === 'caution' && f.text.includes('starch'));
    const hasFiberLead  = ingFlags.some(f => f.level === 'positive');
    const hasSugarIngredient = hasIngList && sugarFound.length > 0;

    if (hasGrainLead && hasSugarIngredient) {
      sugarWarnings.push(`<div style="background:#FDF3EE;border:1px solid rgba(139,46,0,0.2);border-radius:6px;padding:10px 13px;font-size:0.88rem;color:#8B2E00;">
        <strong>⚠ NSC not listed — ingredient signals suggest this may be a higher-NSC feed.</strong><br>
        Grain ingredients lead the list and sugar ingredients are present. For horses with metabolic conditions, ask the manufacturer for tested NSC, sugar, and starch values before feeding.
      </div>`);
    } else if (hasFiberLead && !hasSugarIngredient) {
      sugarWarnings.push(`<div style="background:#E8F2ED;border:1px solid rgba(61,122,94,0.25);border-radius:6px;padding:10px 13px;font-size:0.88rem;color:#1C3A2F;">
        <strong>NSC not listed — ingredient signals suggest this may be a lower-NSC feed.</strong><br>
        Fiber sources lead the ingredient list and no sugar ingredients were detected. However, NSC should always be confirmed with the manufacturer for horses with insulin resistance, EMS, laminitis, or PPID/Cushing\'s.
      </div>`);
    } else {
      sugarWarnings.push(`NSC, sugar, and starch values not detected on this label. Ask the manufacturer directly — these numbers are critical for horses with metabolic conditions, insulin resistance, laminitis, or PPID/Cushing\'s.`);
      sugarWarnings.push(`<em style="font-size:0.82rem;color:#888">Ask: "What is the tested NSC value for this feed?" and "Can you provide the sugar (WSC) and starch values separately?"</em>`);
    }
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
    // ── Vitamin A evaluation
    if (analysis.vitA) {
      const vitAVal = analysis.vitA.value;
      const vitANote = vitAVal > 15000
        ? `Vitamin A listed at <strong>${vitAVal.toLocaleString()} IU/lb</strong> — high level. Vitamin A toxicity is a real concern when horses receive high amounts from multiple sources (feed + hay + supplements). Symptoms include bone fragility, skin problems, and reproductive issues. If feeding multiple fortified feeds or supplements, total Vitamin A from all sources should be reviewed.`
        : vitAVal >= 5000
        ? `Vitamin A listed at <strong>${vitAVal.toLocaleString()} IU/lb</strong> — a typical fortification level for commercial feeds. Horses on green pasture or high-quality hay have additional Vitamin A from beta-carotene. Avoid stacking multiple Vitamin A-fortified products.`
        : `Vitamin A listed at <strong>${vitAVal.toLocaleString()} IU/lb</strong> — lower fortification level. Horses without access to green forage may need additional Vitamin A.`;
      notes.push(vitANote);
    }

    // ── Vitamin D evaluation
    if (analysis.vitD) {
      const vitDVal = analysis.vitD.value;
      const vitDNote = vitDVal > 3000
        ? `Vitamin D listed at <strong>${vitDVal.toLocaleString()} IU/lb</strong> — elevated level. Vitamin D is the most toxic of the fat-soluble vitamins when oversupplemented. It causes calcium to be deposited in soft tissues (calcification of arteries, lungs, kidneys). Horses that spend time outdoors synthesize Vitamin D from sunlight — if your horse has significant outdoor access, total Vitamin D from all sources should be reviewed with your vet.`
        : vitDVal >= 500
        ? `Vitamin D listed at <strong>${vitDVal.toLocaleString()} IU/lb</strong> — a standard fortification level. Horses with regular outdoor access synthesize Vitamin D from sunlight, so supplementation from feed alone at this level is generally not a concern.`
        : `Vitamin D listed at <strong>${vitDVal.toLocaleString()} IU/lb</strong> — low fortification. Horses kept primarily indoors or in limited sunlight may need additional Vitamin D.`;
      notes.push(vitDNote);
    }

    if (analysis.vitE) {
      const vitEVal = analysis.vitE.value;

      // ── Detect Vitamin E form from ingredient list
      const hasNatural   = /d-alpha.tocopherol|natural.vitamin.e|d-alpha.tocopheryl acetate(?!.*dl-)/i.test(ingText || text);
      const hasSynthetic = /dl-alpha.tocopherol|dl-alpha.tocopheryl/i.test(ingText || text);
      const hasGeneric   = /vitamin\s*e\s*supplement|mixed\s*tocopherol/i.test(ingText || text);

      let vitEFormNote = '';
      if (hasNatural && !hasSynthetic) {
        vitEFormNote = `<div style="background:#E8F2ED;border:1px solid rgba(61,122,94,0.25);border-radius:6px;padding:8px 12px;margin-top:6px;font-size:0.85rem;color:#1C3A2F;">
          <strong>Vitamin E form: Natural (d-alpha-tocopherol).</strong><br>
          Natural vitamin E is 2–3× more bioavailable than synthetic forms. The horse's body absorbs and retains it more efficiently. This is the preferred form for horses with neurological conditions, muscle issues, or high Vitamin E requirements.
        </div>`;
      } else if (hasSynthetic && !hasNatural) {
        vitEFormNote = `<div style="background:#FBF0DC;border:1px solid rgba(200,130,26,0.2);border-radius:6px;padding:8px 12px;margin-top:6px;font-size:0.85rem;color:#5C3A1A;">
          <strong>Vitamin E form: Synthetic (dl-alpha-tocopherol).</strong><br>
          Synthetic Vitamin E is less bioavailable than natural forms — the horse must consume more IU to achieve the same tissue levels. If your horse has specific Vitamin E needs (EMND, EPM recovery, muscle issues), discuss the form with your vet. Some horses on synthetic forms may not achieve adequate tissue levels despite label IU values.
        </div>`;
      } else if (hasNatural && hasSynthetic) {
        vitEFormNote = `<div style="background:#F8F4EE;border:1px solid rgba(200,182,154,0.35);border-radius:6px;padding:8px 12px;margin-top:6px;font-size:0.85rem;color:#5C3A1A;">
          <strong>Vitamin E form: Mixed (both natural and synthetic detected).</strong><br>
          Both d-alpha-tocopherol (natural) and dl-alpha-tocopherol (synthetic) appear to be present. The natural portion is significantly more bioavailable. Ask the manufacturer what percentage of the IU value comes from each form.
        </div>`;
      } else if (hasIngList) {
        vitEFormNote = `<div style="background:#F8F4EE;border:1px solid rgba(200,182,154,0.3);border-radius:6px;padding:8px 12px;margin-top:6px;font-size:0.85rem;color:#6B6B64;">
          <em>Vitamin E form not specified on the label. Ask the manufacturer whether the source is natural (d-alpha-tocopherol) or synthetic (dl-alpha-tocopherol) — the form significantly affects bioavailability.</em>
        </div>`;
      }

      // ── IU level context
      // ── If feeding rate is known, calculate actual daily IU delivery
      let vitEContext = '';
      if (feedingDir && feedingDir.midLbs && feedingDir.refWeightLbs) {
        const iuPerDay    = Math.round(feedingDir.midLbs * vitEVal);
        const refWeight   = feedingDir.refWeightLbs;
        const needLow     = Math.round(refWeight * 1.0);  // 1 IU/lb body weight minimum
        const needHigh    = Math.round(refWeight * 2.0);  // 2 IU/lb body weight adequate
        const iuSuffix    = iuPerDay >= needHigh
          ? `<strong style="color:#1C3A2F">✓ likely meets maintenance needs</strong> for a ${refWeight}-lb horse`
          : iuPerDay >= needLow
          ? `may be adequate for a ${refWeight}-lb horse at maintenance — verify with total diet`
          : `<strong style="color:#8B4A00">may fall short</strong> for a ${refWeight}-lb horse (needs ~${needLow}–${needHigh} IU/day from all sources)`;
        vitEContext = `Vitamin E listed at <strong>${vitEVal} IU/lb</strong>. At the detected feeding rate (~${feedingDir.rate}), this provides approximately <strong>${iuPerDay} IU/day</strong> — ${iuSuffix}.`;
      } else {
        // No feeding rate — use IU/lb tiers with guidance
        vitEContext = vitEVal >= 500
          ? `Vitamin E listed at <strong>${vitEVal} IU/lb</strong> — a high level. At typical feeding rates (4–6 lbs/day) this likely meets or exceeds maintenance needs for most horses without pasture access.`
          : vitEVal >= 200
          ? `Vitamin E listed at <strong>${vitEVal} IU/lb</strong> — a moderate level. At 4 lbs/day this provides ~${Math.round(4 * vitEVal)} IU; at 6 lbs/day ~${Math.round(6 * vitEVal)} IU. A 1,000-lb horse at maintenance typically needs 1,000–2,000 IU/day from all sources. Paste the feeding directions for a more precise calculation.`
          : `Vitamin E listed at <strong>${vitEVal} IU/lb</strong> — relatively low. Even at 6 lbs/day this provides only ~${Math.round(6 * vitEVal)} IU. Horses without regular pasture access, or those with muscle or neurological conditions, may need additional Vitamin E supplementation.`;
      }

      notes.push(vitEContext + vitEFormNote);
    }
    if (analysis.selenium) {
      const seVal = analysis.selenium.value;

      // ── Detect selenium source from ingredient list
      const hasSelYeast     = /selenium\s*yeast/i.test(ingText || text);
      const hasSodSelenite  = /sodium\s*selenite/i.test(ingText || text);
      const hasSelProteinate= /selenium\s*proteinate/i.test(ingText || text);
      const hasSelMethionine= /selenomethionine/i.test(ingText || text);

      const isOrganic   = hasSelYeast || hasSelProteinate || hasSelMethionine;
      const isInorganic = hasSodSelenite;
      const isBoth      = isOrganic && isInorganic;

      let seSource = '';
      if (isBoth) {
        seSource = `<div style="background:#FBF0DC;border:1px solid rgba(200,130,26,0.25);border-radius:6px;padding:8px 12px;margin-top:6px;font-size:0.85rem;">
          <strong>Selenium source: Both organic and inorganic detected.</strong><br>
          ${hasSelYeast ? 'Selenium yeast' : ''}${hasSelProteinate ? ', selenium proteinate' : ''}${hasSelMethionine ? ', selenomethionine' : ''} (organic) <em>and</em> sodium selenite (inorganic) are both present.
          Using dual selenium sources is common in commercial feeds. Organic forms are more bioavailable.
          Monitor total selenium intake from all sources (feed + hay + supplements).
        </div>`;
      } else if (isOrganic) {
        const orgNames = [hasSelYeast ? 'selenium yeast' : '', hasSelProteinate ? 'selenium proteinate' : '', hasSelMethionine ? 'selenomethionine' : ''].filter(Boolean).join(', ');
        seSource = `<div style="background:#E8F2ED;border:1px solid rgba(61,122,94,0.25);border-radius:6px;padding:8px 12px;margin-top:6px;font-size:0.85rem;color:#1C3A2F;">
          <strong>Selenium source: Organic (${orgNames}).</strong><br>
          Organic selenium is generally considered more bioavailable than inorganic sodium selenite — meaning the horse may absorb and utilize it more efficiently at the same listed ppm.
          Still monitor total daily selenium from all sources.
        </div>`;
      } else if (isInorganic) {
        seSource = `<div style="background:#F8F4EE;border:1px solid rgba(200,182,154,0.4);border-radius:6px;padding:8px 12px;margin-top:6px;font-size:0.85rem;color:#5C3A1A;">
          <strong>Selenium source: Inorganic (sodium selenite).</strong><br>
          Sodium selenite is the most common form in commercial horse feeds and is effective, but generally considered less bioavailable than organic forms like selenium yeast.
          Some owners and nutritionists prefer organic selenium for horses with higher selenium needs or poor absorption.
        </div>`;
      } else if (hasIngList) {
        seSource = `<div style="background:#F8F4EE;border:1px solid rgba(200,182,154,0.3);border-radius:6px;padding:8px 12px;margin-top:6px;font-size:0.85rem;color:#6B6B64;">
          <em>Selenium source not identified in the ingredient list. Ask the manufacturer whether selenium is from sodium selenite (inorganic) or selenium yeast/proteinate (organic).</em>
        </div>`;
      }

      // ── Selenium level note
      const seLevelNote = seVal > 0.5
        ? `Selenium listed at <strong>${seVal} ppm</strong> — notably above the commonly cited NRC safe upper limit of 0.3 mg/kg in feed. This is not necessarily dangerous at normal feeding rates, but total daily selenium from all sources (feed + hay + supplements) <strong>must</strong> be reviewed with your vet. Selenium toxicity is a real and serious risk.`
        : seVal > 0.3
        ? `Selenium listed at <strong>${seVal} ppm</strong> — above the commonly cited NRC safe upper limit of 0.3 mg/kg in feed. Total daily selenium from all sources (feed + hay + supplements) should be reviewed with your vet.`
        : `Selenium listed at <strong>${seVal} ppm</strong> — within the commonly cited safe range for feed selenium. Total daily selenium from all sources should stay below approximately 2 mg/day for most horses.`;

      notes.push(seLevelNote + seSource);
    } else if (hasIngList) {
      // Selenium not in analysis panel — check if it appears in ingredient list
      const hasSelYeast     = /selenium\s*yeast/i.test(ingText);
      const hasSodSelenite  = /sodium\s*selenite/i.test(ingText);
      const hasSelProteinate= /selenium\s*proteinate/i.test(ingText);
      if (hasSelYeast || hasSodSelenite || hasSelProteinate) {
        const srcNames = [hasSelYeast ? 'selenium yeast' : '', hasSodSelenite ? 'sodium selenite' : '', hasSelProteinate ? 'selenium proteinate' : ''].filter(Boolean).join(', ');
        const srcType  = (hasSelYeast || hasSelProteinate) && !hasSodSelenite ? 'organic' : hasSodSelenite && !hasSelYeast && !hasSelProteinate ? 'inorganic' : 'mixed organic/inorganic';
        notes.push(`Selenium ingredient detected in the list (${srcNames} — ${srcType}) but no ppm value found in the guaranteed analysis. Ask the manufacturer for the selenium level in mg/kg or ppm.`);
      }
    }
    // Iron note — now handled in the Guaranteed Analysis section
    // Amino acid quality note — moved to protein card; keep short reference here
    if (analysis.lysine || /methionine|threonine/i.test(text)) {
      notes.push(`Individual amino acids are guaranteed in the analysis panel — a sign of a feed focused on protein quality, not just crude protein percentage.`);
    }
    vitHTML = vparts.join('<br>') + (notes.length ? '<br><br>' + notes.join('<br><br>') : '') + (redFlagsHTML ? '<br><br>' + redFlagsHTML : '');
  } else {
    vitHTML = 'No specific vitamin or mineral ingredients detected.';
  }

  // ── Digestive Support — differentiated by type
  const digestHTML = (() => {
    if (!digestFound.length) {
      return 'No digestive support ingredients (yeast culture, probiotics, prebiotics) detected in this label.';
    }

    const ing = textLower(ingText || text);

    // Classify detected digestive ingredients by type
    const probioticBacteria = [];
    const yeastIngredients  = [];
    const prebioticIngredients = [];

    const bacteriaNames = ['lactobacillus','enterococcus','pediococcus','bifidobacterium','bacillus'];
    const yeastNames    = ['saccharomyces','yeast culture','dried yeast','brewer'];
    const prebioticNames= ['mannan','fructooligosaccharide','fos','mos','inulin','prebiotic'];

    digestFound.forEach(d => {
      const dl = d.toLowerCase();
      if (bacteriaNames.some(b => dl.includes(b)))  probioticBacteria.push(d);
      else if (yeastNames.some(y => dl.includes(y))) yeastIngredients.push(d);
      else if (prebioticNames.some(p => dl.includes(p))) prebioticIngredients.push(d);
      else yeastIngredients.push(d); // default to yeast category
    });

    // Check if this is a pelleted or extruded feed (affects probiotic viability)
    const isPelleted = feedForm && (feedForm.primary === 'pelleted' || feedForm.primary === 'extruded');
    const isExtruded = feedForm && feedForm.primary === 'extruded';

    let html = `Digestive support ingredients detected: ${digestFound.map(d => pill(d)).join(' ')}<br><br>`;
    const sections = [];

    if (probioticBacteria.length) {
      let bacteriaNote = `<strong>Live bacteria (probiotics):</strong> ${probioticBacteria.join(', ')}. `;
      bacteriaNote += 'These are live microorganisms intended to support the hindgut bacterial population. ';
      if (isExtruded) {
        bacteriaNote += '<strong style="color:#8B4A00">⚠ Caution: Extrusion uses high heat and pressure which typically kills live bacteria. Ask the manufacturer whether probiotics are added post-extrusion to ensure viability.</strong>';
      } else if (isPelleted) {
        bacteriaNote += '<strong style="color:#8B4A00">⚠ Note: Pelleting heat can reduce live bacteria counts. Some manufacturers add probiotics after pelleting (post-pellet application) to preserve viability — ask the manufacturer.</strong>';
      } else {
        bacteriaNote += 'Efficacy depends on strain, CFU count, and storage conditions. Keep feed in a cool, dry place and use before expiration.';
      }
      sections.push(bacteriaNote);
    }

    if (yeastIngredients.length) {
      let yeastNote = `<strong>Yeast / fermentation products:</strong> ${yeastIngredients.join(', ')}. `;
      if (ing.includes('saccharomyces cerevisiae') || ing.includes('yeast culture')) {
        yeastNote += 'Saccharomyces cerevisiae yeast culture is a well-researched digestive support ingredient. It acts as a prebiotic — supporting existing hindgut bacteria and fiber fermentation efficiency — rather than introducing live organisms. ';
        yeastNote += 'Dried yeast culture (not live yeast) survives pelleting and extrusion better than live bacteria.';
      } else {
        yeastNote += 'Yeast-based ingredients support hindgut fermentation and fiber digestion. More heat-stable than live bacteria.';
      }
      sections.push(yeastNote);
    }

    if (prebioticIngredients.length) {
      sections.push(`<strong>Prebiotics:</strong> ${prebioticIngredients.join(', ')}. Prebiotic compounds (such as mannan oligosaccharides or FOS) feed beneficial hindgut bacteria rather than introducing live organisms. They are not affected by feed processing heat.`);
    }

    html += sections.join('<br><br>');

    // Count distinct strains/species if multiple bacteria found
    const strainCount = probioticBacteria.length;
    if (strainCount >= 3) {
      html += `<br><br><em style="font-size:0.82rem;color:#6B6B64">This feed contains ${strainCount} distinct bacterial strains — a multi-strain probiotic approach. Research on multi-strain vs single-strain efficacy in horses is limited; discuss with your vet if gut health is a primary concern.</em>`;
    }

    return html;
  })();

  // ── Hoof / Skin / Coat — specific to what is actually detected
  const uniqueHoof = [...new Set(hoofFound)];
  const hoofHTML = (() => {
    if (!uniqueHoof.length) {
      return 'No specific hoof, skin, or coat support ingredients detected in this label.';
    }

    const ing = textLower(ingText || text);
    const detected = uniqueHoof.map(h => pill(h)).join(' ');
    const sections = [];

    // Biotin — the most research-supported hoof ingredient
    const hasBiotin = uniqueHoof.some(h => /biotin/.test(h.toLowerCase()));
    if (hasBiotin) {
      const biotinVal = analysis.biotin ? analysis.biotin.value : null;
      const biotinNote = biotinVal
        ? `<strong>Biotin:</strong> ${biotinVal} mg/lb detected. Biotin is the most research-supported ingredient for hoof wall quality. Studies suggest horses with poor hoof quality may benefit from 15–20 mg/day total — at this level${biotinVal * 4 >= 15 ? ', a typical 4-lb feeding provides approximately ' + Math.round(biotinVal * 4) + ' mg/day' : ', a 4-lb feeding provides approximately ' + Math.round(biotinVal * 4) + ' mg/day which may be below the research threshold of 15–20 mg/day'}. Results typically take 6–12 months to appear in new hoof growth.`
        : '<strong>Biotin</strong> detected in the ingredient list — the most research-supported ingredient for hoof wall quality. Paste the guaranteed analysis for mg/lb value. Results typically take 6–12 months to appear in new hoof growth.';
      sections.push(biotinNote);
    }

    // Omega-3s / flaxseed — coat and anti-inflammatory
    const hasOmega = uniqueHoof.some(h => /flax|linseed|omega|fish oil/.test(h.toLowerCase()));
    if (hasOmega) {
      const omegaIngreds = uniqueHoof.filter(h => /flax|linseed|omega|fish oil/.test(h.toLowerCase()));
      sections.push(`<strong>Omega-3 sources</strong> (${omegaIngreds.join(', ')}): support coat shine, skin health, and have anti-inflammatory properties. Flaxseed provides alpha-linolenic acid (ALA); fish oil provides EPA and DHA which are more directly usable. Effects on coat quality typically visible within 6–10 weeks.`);
    }

    // Methionine — sulfur amino acid for hoof and coat
    const hasMethionine = uniqueHoof.some(h => /methionine/.test(h.toLowerCase()));
    if (hasMethionine) {
      sections.push('<strong>Methionine</strong> detected — a sulfur-containing amino acid important for hoof horn synthesis, coat quality, and connective tissue. Often added to feeds targeting hoof health alongside biotin.');
    }

    // Zinc/copper chelates — absorption-optimized forms
    const hasChelate = uniqueHoof.some(h => /chelate|proteinate/.test(h.toLowerCase()));
    if (hasChelate) {
      const chelateIngreds = uniqueHoof.filter(h => /chelate|proteinate/.test(h.toLowerCase()));
      sections.push(`<strong>Chelated minerals</strong> (${chelateIngreds.join(', ')}): amino acid chelated or proteinates forms are generally more bioavailable than inorganic sulfates. These forms are preferred for horses with absorption concerns or on high-iron diets that compete with mineral uptake.`);
    }

    // Overall strength assessment
    const supportScore = (hasBiotin ? 2 : 0) + (hasOmega ? 2 : 0) + (hasMethionine ? 1 : 0) + (hasChelate ? 1 : 0);
    let strengthNote = '';
    if (supportScore >= 4) {
      strengthNote = '<br><em style="font-size:0.82rem;color:#2D5C47">This feed has a strong hoof and coat support profile — biotin, omega-3s, and/or methionine are all present. Horses with active hoof or coat concerns may not need additional targeted supplementation, but verify with your vet.</em>';
    } else if (supportScore >= 2) {
      strengthNote = '<br><em style="font-size:0.82rem;color:#6B6B64">Moderate hoof and coat support detected. Horses with active hoof wall issues or coat problems may benefit from additional targeted supplementation.</em>';
    } else {
      strengthNote = '<br><em style="font-size:0.82rem;color:#6B6B64">Limited hoof and coat support ingredients detected. Horses with active hoof wall issues or coat problems may need a targeted supplement.</em>';
    }

    return `Hoof, skin, and coat support detected: ${detected}<br><br>` +
      sections.join('<br><br>') + strengthNote;
  })();

  // ── Guaranteed Analysis Notes — expanded
  const anNotes = [];
  if (analysis.protein) {
    const cpVal = analysis.protein.value;
    // Evaluate protein % against use-case context signals
    const isSenior      = /senior/i.test(text);
    const isPerformance = /performance|racing|endurance|sport|eventing/i.test(text);
    const isGrowing     = /foal|young horse|weanling|yearling|growing/i.test(text);
    const isLactating   = /lactating|broodmare|nursing|mare and foal/i.test(text);
    const isBalancer    = /ration balancer/i.test(text);

    let cpContext = '';
    if (isBalancer) {
      cpContext = ` — ration balancers typically have high crude protein % because they are fed in small amounts (1–2 lbs/day). The actual daily protein delivered is modest.`;
    } else if (isGrowing || isLactating) {
      cpContext = cpVal >= 14
        ? ` — appropriate range for growing horses or lactating mares, which have higher protein requirements than mature horses at maintenance.`
        : ` — on the lower end for growing horses or lactating mares. These horses typically need 14–16% crude protein. Review with your vet or nutritionist.`;
    } else if (isPerformance) {
      cpContext = cpVal >= 12 && cpVal <= 16
        ? ` — within typical range for performance horses. Energy (calories) is usually the primary concern for performance horses, not protein.`
        : cpVal > 16
        ? ` — high protein for a performance feed. Excess protein is not converted to muscle — it is excreted as ammonia, which increases water requirements and stall ammonia levels.`
        : ` — lower protein for a performance feed. Verify the amino acid profile (lysine in particular) meets your horse's needs.`;
    } else if (isSenior) {
      cpContext = cpVal >= 12
        ? ` — appropriate for a senior horse feed. Older horses are less efficient at digesting and utilizing protein, so slightly higher crude protein helps maintain muscle mass.`
        : ` — lower than ideal for a senior feed. Most equine nutritionists recommend senior horses receive at least 12–14% crude protein to compensate for reduced digestive efficiency.`;
    } else {
      // Mature horse at maintenance
      cpContext = cpVal < 8
        ? ` — below the typical minimum requirement for a mature horse at maintenance (approximately 8–10%). This feed should not be the sole protein source.`
        : cpVal <= 12
        ? ` — within the typical range for a mature horse at light to moderate work. Most adult horses at maintenance need approximately 8–10% crude protein in their total diet.`
        : cpVal <= 16
        ? ` — moderate-to-high protein for a general purpose feed. Not harmful for healthy adult horses, but excess protein is excreted rather than stored. Horses with kidney disease should avoid high-protein feeds.`
        : ` — high crude protein. Appropriate for breeding stock, growing horses, or ration balancers. For mature horses at maintenance or light work, this is more protein than needed. Excess protein increases water intake and ammonia excretion.`;
    }
    anNotes.push(`Crude Protein: <strong>${cpVal}%</strong> (min)${cpContext}`);
  }
  if (analysis.fat) {
    const fatVal = analysis.fat.value;
    const fatNote = fatVal < 4
      ? `Crude Fat: ${fatVal}% (min) — low fat. Despite any "performance" positioning on the label, this feed is not a fat-based energy feed.`
      : fatVal >= 12
      ? `Crude Fat: ${fatVal}% (min) — high fat formula. Provides concentrated energy without raising starch or sugar. Appropriate for hard keepers, performance horses, or horses needing calories without grain.`
      : fatVal >= 8
      ? `Crude Fat: ${fatVal}% (min) — moderate to higher fat. Adds caloric density but if the ingredient list includes significant grain (corn, oats, barley), energy is coming from both starch and fat. Not the same as a dedicated fat-supplement feed.`
      : `Crude Fat: ${fatVal}% (min) — moderate fat level, typical of a mixed grain feed.`;
    anNotes.push(fatNote);
  }
  if (analysis.fiber)      anNotes.push(`Crude Fiber: ${analysis.fiber.value}% (max).`);
  if (analysis.calcium)    anNotes.push(`Calcium: ${analysis.calcium.value}% (min).`);
  if (analysis.phosphorus) anNotes.push(`Phosphorus: ${analysis.phosphorus.value}% (min).`);

  if (analysis.calcium && analysis.phosphorus) {
    const ratio = (analysis.calcium.value / analysis.phosphorus.value).toFixed(1);
    const ratioFloat = parseFloat(ratio);
    const ratioNote = ratioFloat < 1.5
      ? `Ca:P ratio is approximately ${ratio}:1 — below the recommended 1.5–2:1 range. This should be reviewed in the context of the horse's total diet including hay.`
      : ratioFloat <= 1.6
      ? `Ca:P ratio is approximately ${ratio}:1 — at the low end of the recommended 1.5–2:1 range. Acceptable, but worth monitoring in the total diet context including hay.`
      : ratioFloat <= 2.0
      ? `Ca:P ratio is approximately ${ratio}:1 — within the recommended 1.5–2:1 range. Note: this reflects the feed only, not your horse's total diet including hay.`
      : `Ca:P ratio is approximately ${ratio}:1 — above the recommended 1.5–2:1 range. High calcium relative to phosphorus is common in alfalfa-heavy feeds and is generally safe but worth noting.`;
    anNotes.push(ratioNote);
  }

  // Extra analysis values
  // ── Extra analysis values — now all pulled from the ANALYSIS_PATTERNS results
  // where available, falling back to direct regex only for fields not in patterns
  const extraAnalysis = [];

  // Amino acids
  if (analysis.lysine)    extraAnalysis.push(`Lysine: <strong>${analysis.lysine.value}%</strong> (min) — an essential amino acid horses cannot synthesize. Listed individually in the guaranteed analysis, which is a quality indicator.`);

  // Macrominerals
  if (analysis.magnesium) extraAnalysis.push(`Magnesium: <strong>${analysis.magnesium.value}%</strong> (min) — important for muscle function, nerve signaling, and insulin sensitivity.`);
  if (analysis.potassium) extraAnalysis.push(`Potassium: <strong>${analysis.potassium.value}%</strong> (min) — an electrolyte critical for sweating horses. Heavy work or hot climates increase potassium needs.`);

  // Fiber fractions — ADF and NDF
  if (analysis.adf) {
    const adfVal = analysis.adf.value;
    const adfNote = adfVal >= 10
      ? `ADF: <strong>${adfVal}%</strong> (max) — acid detergent fiber, a measure of less-digestible fiber (cellulose + lignin). Values above 10% suggest meaningful forage fiber content, which supports hindgut health.`
      : `ADF: <strong>${adfVal}%</strong> (max) — relatively low, indicating this feed is not primarily a forage-based or high-fiber product.`;
    extraAnalysis.push(adfNote);
  }
  if (analysis.ndf) {
    const ndfVal = analysis.ndf.value;
    extraAnalysis.push(`NDF: <strong>${ndfVal}%</strong> (max) — neutral detergent fiber, the total fiber fraction including ADF plus hemicellulose. Higher NDF indicates more forage character. Values above 20% suggest the feed has meaningful hay-like fiber content.`);
  }

  // Trace minerals — pull from analysis patterns where available
  if (analysis.manganese) extraAnalysis.push(`Manganese: <strong>${analysis.manganese.value} ppm</strong> (min) — supports bone development, cartilage, and enzyme function.`);
  if (analysis.iron) {
    const ironVal = analysis.iron.value;
    const ironNote = ironVal >= 150
      ? `Iron: <strong>${ironVal} ppm</strong> (min) — elevated. High iron interferes with copper and zinc absorption. Combined with potentially high iron in hay (common in many regions), total iron load may be a concern.`
      : `Iron: <strong>${ironVal} ppm</strong> (min).`;
    extraAnalysis.push(ironNote);
  }
  if (analysis.zinc)   extraAnalysis.push(`Zinc: <strong>${analysis.zinc.value} ppm</strong> (min).`);
  if (analysis.copper) extraAnalysis.push(`Copper: <strong>${analysis.copper.value} ppm</strong> (min).`);

  // Vitamin C — still direct regex (not in ANALYSIS_PATTERNS, rarely on labels)
  const vitCMatch = text.match(/vitamin\s*c[^0-9\n]{0,30}([0-9]+\.?[0-9]*)\s*mg/i);
  if (vitCMatch) extraAnalysis.push(`Vitamin C: <strong>${vitCMatch[1]} mg/lb</strong> (min) — horses synthesize their own vitamin C, but supplemental amounts may support horses under stress or immune challenge.`);

  // Biotin
  if (analysis.biotin) extraAnalysis.push(`Biotin: <strong>${analysis.biotin.value} mg/lb</strong> (min) — supports hoof wall integrity and coat quality. Research-supported for hoof horn synthesis.`);

  // ── Feeding directions block
  let feedingDirHTML = '';
  if (feedingDir && feedingDir.rate) {
    const nutLines = Object.values(feedingDir.nutrients || {});
    const normalizedNote = feedingDir.lbsPer100
      ? `<br><span style="font-size:0.81rem;color:#2D5C47">Normalized: <strong>${feedingDir.lbsPer100} lbs</strong> (${feedingDir.ozPer100} oz) per 100 lbs body weight</span>`
      : '';
    feedingDirHTML = `<div style="background:#F2F7F4;border:1px solid rgba(61,122,94,0.2);border-radius:6px;padding:12px 14px;margin-top:14px;">
      <div style="font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#2D5C47;margin-bottom:6px;">Feeding Rate Detected</div>
      <strong style="color:#1C3A2F">${feedingDir.rate}</strong>${normalizedNote}<br>
      ${nutLines.length ? '<br><strong style="font-size:0.82rem;color:#1C3A2F">Estimated daily nutrient delivery at mid rate:</strong><br>' + nutLines.map(n => `<span style="font-size:0.83rem;color:#3D3D38">• ${n}</span>`).join('<br>') : ''}
      <br><br><em style="font-size:0.79rem;color:#888">Estimates based on label values at mid feeding rate. Actual delivery varies by exact rate, horse size, and feed density. Always reference the original label and consult your vet for horses with specific health needs.</em>
    </div>`;
  } else if (feedingDir && feedingDir.dirText) {
    feedingDirHTML = `<div style="background:#F2F7F4;border:1px solid rgba(61,122,94,0.2);border-radius:6px;padding:10px 14px;margin-top:14px;font-size:0.85rem;color:#3D3D38;">
      <strong style="color:#1C3A2F">Feeding directions found</strong> but feeding rate could not be parsed automatically. See original label for directions.
    </div>`;
  }

  const analysisHTML = (anNotes.length || extraAnalysis.length)
    ? ul([...anNotes, ...extraAnalysis]) + '<br><small style="color:#888">Values based on text matching — always reference the original label for accuracy.</small>' + feedingDirHTML
    : 'No guaranteed analysis values detected. Paste the full guaranteed analysis panel for this section to populate.' + feedingDirHTML;

  // ── Questions to Ask
  const missing = [];
  // Prepend red flag questions
  if (redFlags.length) {
    redFlags.forEach(f => {
      if (f.level === 'critical') {
        missing.push(`<strong style="color:#8B2E00">⚠ ${f.title} — review this with your vet before feeding.</strong>`);
      }
    });
  }
  // ── Dynamic questions — only shown when relevant to what was detected

  // Missing ingredient list
  if (!hasIngList) {
    missing.push('Paste the full ingredient list for a complete analysis — energy sources, fiber, fat, and protein sections cannot be evaluated from the guaranteed analysis alone.');
  }

  // NSC — only ask if not already detected/calculated
  const nscAlreadyKnown = analysis.nsc || (analysis.sugar && analysis.starch);
  if (!nscAlreadyKnown) {
    missing.push(`NSC, sugar, and starch values were not listed. Ask the manufacturer: <em>"What is the tested NSC value?" and "Can you provide sugar (WSC) and starch values separately?"</em> — critical for horses with insulin resistance, laminitis, EMS, or PPID/Cushing's.`);
  } else if (analysis.sugar && analysis.starch && !analysis.nsc) {
    missing.push('NSC was calculated from listed sugar + starch values. Ask the manufacturer for the <em>laboratory-tested</em> NSC value to confirm — calculated and tested values sometimes differ.');
  }

  // Vitamin E — only ask if IU not found
  if (!analysis.vitE) {
    missing.push('Vitamin E IU per pound was not found in the pasted text. Ask the manufacturer for this value — important for horses without regular pasture access.');
  } else {
    // If found but form not detected
    const hasVitEForm = /d-alpha|dl-alpha|tocopherol/i.test(text);
    if (!hasVitEForm) {
      missing.push('Ask the manufacturer: <em>"Is the Vitamin E in this feed natural (d-alpha-tocopherol) or synthetic (dl-alpha-tocopherol)?"</em> — natural Vitamin E is 2–3× more bioavailable.');
    }
  }

  // Selenium — ask about source if not identified, or ask about ppm if not found
  if (!analysis.selenium) {
    missing.push('Selenium level (ppm) was not found in the pasted text. Ask the manufacturer — selenium has a narrow safe range and total daily intake from all sources matters.');
  }
  const seSourceKnown = /selenium yeast|sodium selenite|selenium proteinate|selenomethionine/i.test(ingText || text);
  if (!seSourceKnown) {
    missing.push('Ask the manufacturer: <em>"Is the selenium in this feed organic (selenium yeast/proteinate) or inorganic (sodium selenite)?"</em> — organic forms are more bioavailable.');
  }

  // Digestive support — only ask if not detected
  if (!digestFound.length) {
    missing.push("No digestive support ingredients (yeast culture, probiotics) detected. Ask whether the feed contains any if hindgut health is a concern for your horse.");
  }

  // Calcium/Phosphorus — only ask if missing
  if (!analysis.calcium && !analysis.phosphorus) {
    missing.push("Calcium and phosphorus values were not found. Ask the manufacturer for the Ca:P ratio — important for evaluating total diet mineral balance.");
  }

  // Feeding rate — only ask if directions not already pasted
  if (!feedingDir || !feedingDir.rate) {
    missing.push('Ask: <em>"What is the recommended daily feeding rate per 100 lbs of body weight?"</em>');
  }

  // High selenium — always ask about total load if elevated
  if (analysis.selenium && analysis.selenium.value > 0.3) {
    missing.push(`Selenium is listed above 0.3 ppm. Ask your vet: <em>"What is my horse's total daily selenium intake from feed, hay, and supplements combined?"</em>`);
  }

  // High iron — ask about hay iron
  const ironPpmVal = text.match(/iron[^0-9]*([0-9]+\.?[0-9]*)\s*ppm/i);
  if (ironPpmVal && parseFloat(ironPpmVal[1]) >= 150) {
    missing.push('Iron is listed at ' + ironPpmVal[1] + ' ppm. Ask your hay supplier or test your hay: <em>"What is the iron level in my hay?"</em> High feed iron combined with high hay iron can suppress copper and zinc absorption.');
  }

  // Textured feed — ask about meal size
  if (feedForm && feedForm.primary === 'textured') {
    missing.push('This appears to be a textured feed. Ask: <em>"What is the maximum safe single meal size?"</em> Large grain meals can overwhelm the small intestine and increase colic risk.');
  }

  // No ingredient list and no analysis — very little to work with
  if (!hasIngList && !Object.keys(analysis).length) {
    missing.push('Very little label information was detected. For the best analysis, paste the full label including the INGREDIENTS section and GUARANTEED ANALYSIS panel.');
  }

  const missingHTML = missing.length ? ul(missing) : '<em style="color:#888">No specific questions generated — paste the full label for a more complete analysis.</em>';

  // ── Plain-English Summary — feed-specific, not template-based
  const feedTypeLabel = feedTypes[0]?.label || 'commercial horse feed';

  const summaryHTML = (() => {
    const sentences = [];

    // ── Opening: what type of feed and what form
    const formLabel = feedForm ? ` (${feedForm.label})` : '';
    sentences.push(`This appears to be a <strong>${feedTypeLabel}${formLabel}</strong>.`);

    if (!hasIngList) {
      // Analysis-only path — build from numbers
      sentences.push('Only the guaranteed analysis panel was detected — the summary below is based on numbers only, not ingredients.');

      if (analysis.protein) {
        const cp = analysis.protein.value;
        const cpDesc = cp >= 16 ? ', which is high — appropriate for breeding stock, growing horses, or ration balancers, but more than a mature horse at maintenance needs' : cp >= 12 ? ', a moderate level typical of a formulated concentrate' : ", on the lower end — verify this meets your horse's needs";
        sentences.push(`Crude protein is <strong>${cp}%</strong>${cpDesc}.`);
      }
      if (analysis.fat) {
        const f = analysis.fat.value;
        sentences.push(`Crude fat is <strong>${f}%</strong>${f >= 10 ? ' — meaningful fat content that adds caloric density' : f < 4 ? ' — low fat; this is not a fat-based energy feed' : ''}.`);
      }
      if (analysis.selenium && analysis.selenium.value > 0.3) {
        sentences.push(`Selenium is listed at <strong>${analysis.selenium.value} ppm</strong> — above the commonly cited 0.3 mg/kg safe upper limit for feed. Total selenium from all sources should be reviewed with your vet.`);
      }
      if (allVitamins.length >= 4 || allMinerals.length >= 4) {
        sentences.push('The analysis shows a broad vitamin and mineral profile — consistent with a fully formulated commercial feed rather than a raw grain.');
      }
      if (digestFound.length) {
        sentences.push(`Digestive support ingredients (${digestFound.slice(0,2).join(', ')}) are listed, indicating attention to hindgut health.`);
      }
      if (/lysine|methionine|threonine/i.test(text)) {
        sentences.push('Individual amino acids are guaranteed in the analysis — a sign of a feed focused on protein quality, not just crude protein quantity.');
      }
      sentences.push('<br>For a full ingredient-by-ingredient breakdown, paste the complete label including the INGREDIENTS section.');

    } else {
      // Full label path — build from ingredient signals + analysis

      // Energy character
      if (fiberFound.length >= 2 && grainFound.length <= 1) {
        sentences.push(`Energy comes primarily from <strong>digestible fiber</strong> (${fiberFound.slice(0,2).join(', ')}) — a hindgut-friendly approach that produces less risk of starch overload compared to grain-forward feeds.`);
      } else if (grainFound.length >= 2 && fiberFound.length <= 1) {
        sentences.push(`Energy comes primarily from <strong>grain and starch</strong> (${grainFound.slice(0,2).join(', ')}) — quick-burning energy appropriate for working horses but not ideal for horses with metabolic conditions.`);
      } else if (grainFound.length >= 1 && fiberFound.length >= 1) {
        sentences.push(`Energy comes from a <strong>mix of grain and fiber</strong> — grain provides quick energy while fiber sources support hindgut health and provide slower-burning calories.`);
      }

      // Protein sources
      const ingProtein = proteinFound.filter(p => !['lysine','methionine','threonine'].includes(p.toLowerCase()));
      if (ingProtein.length) {
        sentences.push(`Primary protein source${ingProtein.length > 1 ? 's' : ''}: <strong>${ingProtein.slice(0,2).join(', ')}</strong>.`);
      }

      // Molasses position — specific
      const ingList = parseIngredientOrder(text);
      const molassesIdx = ingList.findIndex(i => /molasses|cane molasses/.test(i));
      if (molassesIdx >= 0 && molassesIdx <= 4) {
        sentences.push(`<strong>Molasses appears at position #${molassesIdx + 1}</strong> in the ingredient list — a meaningful sugar contributor. Horses with metabolic conditions should not be fed this without veterinary guidance.`);
      } else if (molassesIdx >= 5) {
        sentences.push(`Molasses is present but at position #${molassesIdx + 1} — likely a small amount for palatability.`);
      }

      // NSC situation
      const calcNSCVal = (sugarVal !== null && starchVal !== null) ? sugarVal + starchVal : null;
      const effectiveNSC = nscVal || calcNSCVal;
      if (effectiveNSC !== null) {
        const nscSrc = nscVal ? 'listed' : 'calculated from sugar + starch';
        const nscDesc = effectiveNSC <= 10 ? 'low — potentially suitable for metabolic horses (always verify with your vet)' : effectiveNSC <= 15 ? 'moderate — use caution with insulin-sensitive horses' : "elevated — not appropriate for horses with insulin resistance, EMS, laminitis, or PPID/Cushing's without veterinary guidance";
        sentences.push(`NSC is <strong>~${effectiveNSC}%</strong> (${nscSrc}) — ${nscDesc}.`);
      } else if (grainFound.length >= 2 || molassesIdx >= 0 && molassesIdx <= 4) {
        sentences.push('NSC was not listed or calculable from this label. Given the ingredient profile, ask the manufacturer for tested NSC, sugar, and starch values before feeding to metabolic horses.');
      }

      // Selenium flag
      if (analysis.selenium && analysis.selenium.value > 0.3) {
        sentences.push(`Selenium is <strong>${analysis.selenium.value} ppm</strong> — above the commonly cited safe limit for feed. Total selenium from all sources must be reviewed with your vet.`);
      }

      // Digestive support
      if (digestFound.length) {
        const isProbiotic = digestFound.some(d => /lactobacillus|enterococcus|pediococcus/.test(d.toLowerCase()));
        const isYeast = digestFound.some(d => /saccharomyces|yeast/.test(d.toLowerCase()));
        if (isProbiotic && isYeast) {
          sentences.push(`Contains both <strong>live probiotic bacteria</strong> and <strong>yeast culture</strong> for digestive support.${feedForm && (feedForm.primary === 'pelleted' || feedForm.primary === 'extruded') ? ' Note: live bacteria viability may be reduced by processing heat — ask the manufacturer.' : ''}`);
        } else if (isProbiotic) {
          sentences.push(`Contains <strong>live probiotic bacteria</strong> (${digestFound.filter(d => /lactobacillus|enterococcus|pediococcus/.test(d.toLowerCase())).slice(0,2).join(', ')}) for digestive support.`);
        } else if (isYeast) {
          sentences.push('Contains <strong>yeast culture</strong> for hindgut fermentation support.');
        }
      }

      // Red flags callout
      const criticalFlags = redFlags.filter(f => f.level === 'critical');
      if (criticalFlags.length) {
        sentences.push(`<strong style="color:#8B2E00">⚠ ${criticalFlags.length} critical concern${criticalFlags.length > 1 ? 's' : ''} detected</strong> — see the Vitamins & Minerals section for details.`);
      }

      // Closing
      sentences.push('<br>Ingredient order on labels indicates relative quantity by weight — the first ingredient is present in the largest amount. For any horse with a known health condition, share this label with a veterinarian or equine nutritionist before feeding.');
    }

    return sentences.filter(Boolean).join(' ');
  })();

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

  const introHTML = buildIntroSummary(
    text, analysis, feedTypes, feedForm,
    fiberFound, grainFound, fatFound, proteinFound, sugarFound,
    typeof window !== 'undefined' && window.getProfile ? window.getProfile() : {}
  );

  return {
    intro:     introHTML,
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
  grid.innerHTML = INGREDIENT_LIBRARY.map(ing => {
    const inner = `
      <div class="ingredient-name">${ing.name}</div>
      <div class="ingredient-category">${ing.category}</div>
      <p class="ingredient-desc">${ing.desc}</p>
      ${ing.url ? '<div class="ingredient-link-hint">Read more &#8594;</div>' : ''}
    `;
    return ing.url
      ? `<a href="${ing.url}" class="ingredient-card ingredient-card-link">${inner}</a>`
      : `<div class="ingredient-card">${inner}</div>`;
  }).join('');
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
  // Intro summary
  const introEl = document.getElementById('oc-intro');
  const introBlock = document.getElementById('introSummaryBlock');
  if (introEl && result.intro) {
    introEl.innerHTML = result.intro;
    if (introBlock) introBlock.style.display = 'block';
  }

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

    if (ocrScanBtn) { ocrScanBtn.disabled = true; ocrScanBtn.textContent = 'Reading…'; }
    hide(ocrResultMsg);
    hide(ocrErrorMsg);
    show(ocrStatus);
    hide(ocrProgressWrap);
    setStatus('Reading your label… this takes about 10 seconds.');

    try {
      // Convert image to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = e => resolve(e.target.result.split(',')[1]);
        reader.onerror = () => reject(new Error('Could not read image file.'));
        reader.readAsDataURL(selectedFile);
      });

      const mediaType = selectedFile.type || 'image/jpeg';

      // Call Claude API with vision
      const response = await fetch('https://horse-nutrition-ocr.bridleandbit.workers.dev/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mediaType: mediaType })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error((errData && errData.error && errData.error.message) || 'API error ' + response.status);
      }

      const data = await response.json();
      const rawText = (data.content && data.content[0] && data.content[0].text)
        ? data.content[0].text.trim()
        : '';

      hide(ocrStatus);
      isScanning = false;
      if (ocrScanBtn) { ocrScanBtn.disabled = false; ocrScanBtn.textContent = 'Read This Label'; }

      if (!rawText || rawText === 'UNREADABLE' || rawText.length < 15) {
        showError('The label could not be read from this photo. Make sure the label is flat, well-lit, and in focus. Try cropping close to the ingredient list and guaranteed analysis panel, then try again.');
        return;
      }

      feedInputEl.value = rawText;
      show(ocrResultMsg);

      setTimeout(function () {
        const decodeBtn = document.getElementById('decodeBtn');
        if (decodeBtn) decodeBtn.click();
      }, 600);

    } catch (err) {
      console.error('Claude Vision OCR error:', err);
      hide(ocrStatus);
      isScanning = false;
      if (ocrScanBtn) { ocrScanBtn.disabled = false; ocrScanBtn.textContent = 'Read This Label'; }
      let msg = '';
      if (err.message && err.message.includes('401')) {
        msg = 'Authentication error. The API key may need to be configured.';
      } else if (err.message && (err.message.includes('network') || err.message.includes('fetch') || err.message.includes('Failed to fetch'))) {
        msg = 'Network error — check your internet connection and try again.';
      } else if (err.message && err.message.includes('rate_limit')) {
        msg = 'Too many requests — please wait a moment and try again.';
      } else {
        msg = 'Could not read the label. ' + (err.message || 'Please try again or type the label text manually below.');
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

// ─────────────────────────────────────────────
// HORSE PROFILE — selection UI + personalized summary
// ─────────────────────────────────────────────
(function () {
  'use strict';

  // ── Collect current profile selections (global for other modules)
  window.getProfile = function getProfile() {
    const profile = {};
    document.querySelectorAll('.profile-options[data-group]').forEach(function (group) {
      const key      = group.getAttribute('data-group');
      const isMulti  = group.getAttribute('data-multi') === 'true';
      const selected = Array.from(group.querySelectorAll('.profile-btn.selected, .profile-btn.selected-caution'))
                            .map(function (b) { return b.getAttribute('data-value'); });
      profile[key] = isMulti ? selected : (selected[0] || null);
    });
    return profile;
  }

  // ── Generate personalized "For Your Horse" summary
  function buildHorseSummary(profile, decoderResult, rawText) {
    // Pull key values from the decoder result text content
    const use       = profile.use       || 'pleasure';
    const health    = profile.health    || [];
    const condition = profile.condition || 'ideal';
    const forage    = profile.forage    || 'hay_only';

    // Detect what we know about the feed from the raw label
    const lower = rawText ? rawText.toLowerCase() : '';

    // NSC situation
    const nscMatch     = rawText ? rawText.match(/nsc[^0-9]{0,30}([0-9]+\.?[0-9]*)\s*%/i) : null;
    const sugarMatch   = rawText ? rawText.match(/(?:sugar|wsc)[^0-9]{0,30}([0-9]+\.?[0-9]*)\s*%/i) : null;
    const starchMatch  = rawText ? rawText.match(/starch[^0-9]{0,30}([0-9]+\.?[0-9]*)\s*%/i) : null;
    const nscVal       = nscMatch ? parseFloat(nscMatch[1]) : null;
    const calcNSC      = (sugarMatch && starchMatch) ? parseFloat(sugarMatch[1]) + parseFloat(starchMatch[1]) : null;
    const effectiveNSC = nscVal || calcNSC;

    const hasMolasses  = /molasses/i.test(lower);
    const hasGrainLead = /corn|oats|barley|maize/.test((lower.split(',').slice(0,3).join(',')));
    const hasFiberLead = /beet pulp|soybean hull|alfalfa/.test((lower.split(',').slice(0,3).join(',')));
    const hasProbiotic = /lactobacillus|saccharomyces|yeast culture/i.test(lower);
    const hasBiotin    = /biotin/i.test(lower);
    const isHighFiber  = /crude fiber[^0-9]{0,30}([0-9]+)/.test(rawText || '') && 
                         parseFloat((rawText||'').match(/crude fiber[^0-9]{0,30}([0-9]+\.?[0-9]*)/i)?.[1]||0) >= 15;
    const isSeniorFeed = /senior/i.test(lower);
    const isCompleteFeed = /complete feed/i.test(lower);

    const hasIR        = health.includes('ir') || health.includes('laminitis') || health.includes('cushings');
    const hasPSSM      = health.includes('pssm');
    const hasUlcers    = health.includes('ulcers');
    const hasHoofIssue = health.includes('hoof');
    const isHardKeeper = condition === 'thin' || health.includes('weight_loss');
    const isEasyKeeper = condition === 'overweight';
    const hasPasture   = forage === 'pasture' || forage === 'hay_pasture';
    const isLimitedForage = forage === 'limited';

    const flags = [];
    const lines = [];

    // ── Opening line — address the horse directly
    const useLabels = {
      pleasure:    'trail or pleasure horse',
      performance: 'performance horse',
      senior:      'senior horse',
      breeding:    'broodmare or breeding horse',
      growing:     'young or growing horse',
      idle:        'retired or idle horse'
    };
    const useLabel = useLabels[use] || 'horse';

    lines.push(`Here is what this feed means for your <strong>${useLabel}</strong>:`);

    // ── METABOLIC / IR / LAMINITIS / CUSHINGS
    if (hasIR) {
      if (effectiveNSC !== null) {
        if (effectiveNSC > 12) {
          flags.push({ type: 'caution', text: `NSC is approximately ${effectiveNSC}% — above the recommended 10–12% threshold for insulin-resistant and laminitis-risk horses. <strong>This feed is likely not appropriate for your horse without veterinary approval.</strong>` });
        } else if (effectiveNSC <= 10) {
          flags.push({ type: 'ok', text: `NSC appears to be ${effectiveNSC}% — within the commonly recommended range for metabolic horses. Still verify with your vet and confirm the tested (not calculated) NSC value before feeding.` });
        } else {
          flags.push({ type: 'warn', text: `NSC appears to be ${effectiveNSC}% — borderline for a horse with insulin resistance or laminitis history. Discuss with your vet before feeding.` });
        }
      } else if (hasGrainLead) {
        flags.push({ type: 'caution', text: `Grain ingredients appear near the top of the ingredient list, and NSC is not listed. For a horse with insulin resistance, Cushing\'s, or laminitis history, <strong>do not feed this without getting the NSC value from the manufacturer first.</strong>` });
      } else if (hasFiberLead) {
        flags.push({ type: 'warn', text: `Fiber ingredients lead the list, which is a positive sign for a metabolic horse — but NSC is not listed. Ask the manufacturer for the tested NSC, sugar, and starch values before feeding.` });
      } else {
        flags.push({ type: 'caution', text: `Your horse has metabolic concerns but NSC, sugar, and starch values are not on this label. <strong>Do not feed without getting these numbers from the manufacturer.</strong>` });
      }
      if (hasMolasses) {
        flags.push({ type: 'caution', text: `Molasses is present in the ingredient list — an added sugar that is generally not recommended for horses with insulin resistance, EMS, Cushing\'s, or laminitis history.` });
      }
    }

    // ── PSSM / TYING-UP
    if (hasPSSM) {
      if (hasGrainLead) {
        flags.push({ type: 'caution', text: `Horses with PSSM or recurring tying-up require very low starch and sugar. Grain ingredients appear near the top of this label. <strong>This feed is likely not appropriate for your horse</strong> — discuss with your vet before feeding.` });
      } else if (effectiveNSC !== null && effectiveNSC > 10) {
        flags.push({ type: 'caution', text: `PSSM and tying-up horses typically need NSC below 10%. This feed appears to be approximately ${effectiveNSC}% NSC. Discuss with your vet or equine nutritionist.` });
      } else if (hasFiberLead && (effectiveNSC === null || effectiveNSC <= 10)) {
        flags.push({ type: 'ok', text: `Fiber ingredients lead the list${effectiveNSC ? ` and NSC appears to be ${effectiveNSC}%` : ''} — a potentially suitable profile for a PSSM or tying-up horse. Confirm NSC with the manufacturer and discuss with your vet.` });
      }
    }

    // ── SENIOR HORSE
    if (use === 'senior' || isSeniorFeed) {
      const cpMatch = rawText ? rawText.match(/crude protein[^0-9]{0,30}([0-9]+\.?[0-9]*)\s*%/i) : null;
      const cpVal   = cpMatch ? parseFloat(cpMatch[1]) : null;
      if (isCompleteFeed || isHighFiber) {
        flags.push({ type: 'ok', text: `This appears to be a complete or high-fiber feed — appropriate for a senior horse with reduced ability to chew long-stem hay. Make sure it is introduced gradually and fed in multiple small meals.` });
      }
      if (cpVal !== null && cpVal < 12) {
        flags.push({ type: 'warn', text: `Crude protein is ${cpVal}% — on the lower end for a senior horse. Older horses are less efficient at digesting protein, and most equine nutritionists recommend at least 12–14% crude protein for senior horses to maintain muscle mass.` });
      }
      if (cpVal !== null && cpVal >= 14) {
        flags.push({ type: 'ok', text: `Crude protein is ${cpVal}% — a good level for a senior horse. Higher protein helps compensate for reduced digestive efficiency as horses age.` });
      }
    }

    // ── PERFORMANCE HORSE
    if (use === 'performance') {
      const fatMatch = rawText ? rawText.match(/crude fat[^0-9]{0,30}([0-9]+\.?[0-9]*)\s*%/i) : null;
      const fatVal   = fatMatch ? parseFloat(fatMatch[1]) : null;
      if (fatVal !== null && fatVal >= 8) {
        flags.push({ type: 'ok', text: `Crude fat is ${fatVal}% — a good energy source for a performance horse. Fat provides sustained energy without the starch spike that grain-heavy feeds can cause.` });
      } else if (fatVal !== null && fatVal < 5) {
        flags.push({ type: 'warn', text: `Crude fat is only ${fatVal}%. For a horse in heavy work, consider whether this feed provides enough caloric density, or whether fat supplementation (rice bran, oil) is needed.` });
      }
      if (hasProbiotic) {
        flags.push({ type: 'ok', text: `Digestive support ingredients are present — beneficial for a performance horse under the stress of heavy training and travel.` });
      }
    }

    // ── HARD KEEPER / UNDERWEIGHT
    if (isHardKeeper) {
      const fatMatch = rawText ? rawText.match(/crude fat[^0-9]{0,30}([0-9]+\.?[0-9]*)\s*%/i) : null;
      const fatVal   = fatMatch ? parseFloat(fatMatch[1]) : null;
      if (fatVal !== null && fatVal >= 8) {
        flags.push({ type: 'ok', text: `With ${fatVal}% crude fat, this feed has meaningful caloric density — good for a horse that needs to gain weight. Fat adds calories without increasing starch.` });
      } else if (fatVal !== null && fatVal < 5) {
        flags.push({ type: 'warn', text: `Crude fat is ${fatVal}% — relatively low for a hard keeper. For weight gain, look for feeds with 8%+ fat, or consider adding a fat supplement such as stabilized rice bran or vegetable oil.` });
      }
    }

    // ── EASY KEEPER / OVERWEIGHT
    if (isEasyKeeper) {
      if (effectiveNSC !== null && effectiveNSC > 15) {
        flags.push({ type: 'caution', text: `Your horse is an easy keeper and this feed appears to be ${effectiveNSC}% NSC. High-calorie feeds are generally not appropriate for overweight horses — consider a ration balancer paired with quality hay instead.` });
      } else if (hasFiberLead) {
        flags.push({ type: 'ok', text: `Fiber-based energy is more appropriate for an easy keeper than grain starch. However, even fiber-based feeds add calories — monitor body condition and adjust feeding rate accordingly.` });
      }
    }

    // ── ULCERS / DIGESTIVE ISSUES
    if (hasUlcers) {
      if (hasProbiotic) {
        flags.push({ type: 'ok', text: `Digestive support ingredients (yeast culture, probiotics) are present — beneficial for a horse with ulcer or digestive history.` });
      } else {
        flags.push({ type: 'warn', text: `No digestive support ingredients detected. For a horse with ulcer or digestive history, feeds with added yeast culture, probiotics, or prebiotics are generally preferred. Ask the manufacturer or discuss with your vet.` });
      }
      if (hasGrainLead) {
        flags.push({ type: 'warn', text: `Grain-forward feeds can contribute to hindgut acidosis and may aggravate ulcer-prone horses. Consider whether a fiber-forward or lower-starch option would be more suitable.` });
      }
    }

    // ── HOOF ISSUES
    if (hasHoofIssue) {
      if (hasBiotin) {
        flags.push({ type: 'ok', text: `Biotin is present — research supports biotin supplementation for horses with poor hoof quality. Visible improvement in new hoof growth typically takes 6–12 months.` });
      } else {
        flags.push({ type: 'warn', text: `No biotin detected in this feed. For a horse with hoof quality issues, biotin supplementation (15–20 mg/day) is well-supported by research. Ask whether this feed contains biotin or consider a targeted supplement.` });
      }
    }

    // ── VITAMIN E — pasture vs no pasture
    const vitEMatch = rawText ? rawText.match(/vitamin\s*e[^0-9]{0,30}([0-9]+\.?[0-9]*)\s*iu/i) : null;
    const vitEVal   = vitEMatch ? parseFloat(vitEMatch[1]) : null;
    if (!hasPasture && vitEVal !== null && vitEVal < 200) {
      flags.push({ type: 'warn', text: `Your horse has limited pasture access and Vitamin E is listed at only ${vitEVal} IU/lb. Without fresh grass, horses frequently become Vitamin E deficient. Consider additional supplementation — especially important for horses with muscle or neurological conditions.` });
    } else if (!hasPasture && vitEVal !== null && vitEVal >= 200) {
      flags.push({ type: 'ok', text: `Vitamin E is listed at ${vitEVal} IU/lb. For a horse without regular pasture access, this is a meaningful amount — but verify total daily intake against your horse\'s body weight and health needs.` });
    } else if (hasPasture && vitEVal !== null) {
      flags.push({ type: 'ok', text: `Your horse has pasture access, which is the best natural source of Vitamin E. The ${vitEVal} IU/lb in this feed provides additional support.` });
    }

    // ── GROWING HORSE
    if (use === 'growing') {
      const cpMatch = rawText ? rawText.match(/crude protein[^0-9]{0,30}([0-9]+\.?[0-9]*)\s*%/i) : null;
      const cpVal   = cpMatch ? parseFloat(cpMatch[1]) : null;
      if (cpVal !== null && cpVal >= 14) {
        flags.push({ type: 'ok', text: `Crude protein is ${cpVal}% — appropriate for a growing horse. Young horses need more protein per pound of body weight than mature horses to support muscle and skeletal development.` });
      } else if (cpVal !== null && cpVal < 14) {
        flags.push({ type: 'warn', text: `Crude protein is ${cpVal}%. Growing horses typically need 14–16% crude protein. Ask whether this feed is formulated specifically for young horses, or whether a growth-specific feed would be more appropriate.` });
      }
    }

    // ── BREEDING / PREGNANT
    if (use === 'breeding') {
      flags.push({ type: 'warn', text: `Pregnant and lactating mares have significantly elevated protein, energy, vitamin, and mineral requirements — especially in the last trimester and during lactation. Confirm this feed is appropriate for your mare\'s specific stage with your vet or equine nutritionist.` });
    }

    // ── LIMITED FORAGE
    if (isLimitedForage) {
      if (isCompleteFeed || isHighFiber) {
        flags.push({ type: 'ok', text: `This appears to be a complete or high-fiber feed — designed to partially or fully replace hay. This may be appropriate for a horse with limited forage access, but confirm feeding rate with the manufacturer to ensure total fiber needs are met.` });
      } else {
        flags.push({ type: 'warn', text: `Your horse has limited forage access. If this feed is not a complete feed, make sure total fiber intake is being met through other sources. Horses need a minimum of 1–1.5% of their body weight in forage daily for gut health.` });
      }
    }

    // ── If no specific flags generated
    if (!flags.length) {
      flags.push({ type: 'ok', text: `No major concerns detected for a ${useLabel} based on the information provided. Review the full breakdown below and share this label with your vet or equine nutritionist if you have any questions.` });
    }

    // ── Build HTML
    const flagsHTML = flags.map(function (f) {
      return `<div class="hs-flag hs-${f.type}">${f.text}</div>`;
    }).join('');

    return lines.join(' ') + flagsHTML;
  }

  // ── Wire profile buttons
  document.addEventListener('DOMContentLoaded', function () {

    // Single-select groups
    document.querySelectorAll('.profile-options:not([data-multi]) .profile-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const group = this.closest('.profile-options');
        group.querySelectorAll('.profile-btn').forEach(function (b) {
          b.classList.remove('selected', 'selected-caution');
        });
        this.classList.add('selected');
      });
    });

    // Multi-select groups (health concerns)
    document.querySelectorAll('.profile-options[data-multi] .profile-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const isNone = this.getAttribute('data-value') === 'none';
        const group  = this.closest('.profile-options');

        if (isNone) {
          // Deselect all others
          group.querySelectorAll('.profile-btn').forEach(function (b) {
            b.classList.remove('selected', 'selected-caution');
          });
          this.classList.add('selected');
        } else {
          // Deselect "none"
          group.querySelectorAll('[data-value="none"]').forEach(function (b) {
            b.classList.remove('selected');
          });
          // Toggle this button — caution style for health concerns
          if (this.classList.contains('selected-caution')) {
            this.classList.remove('selected-caution');
          } else {
            this.classList.add('selected-caution');
          }
        }
      });
    });

    // Hook into decode button — generate horse summary after decode
    const decodeBtn = document.getElementById('decodeBtn');
    if (decodeBtn) {
      decodeBtn.addEventListener('click', function () {
        // Small delay to let main decoder render first
        setTimeout(function () {
          const profile  = getProfile();
          const rawText  = (document.getElementById('feedInput') || {}).value || '';
          const hasAnySelection = Object.values(profile).some(function (v) {
            return v && (Array.isArray(v) ? v.length > 0 : true);
          });

          const block = document.getElementById('horseSummaryBlock');
          const el    = document.getElementById('oc-horse-summary');
          if (!block || !el) return;

          if (hasAnySelection && rawText.trim().length > 20) {
            el.innerHTML = buildHorseSummary(profile, null, rawText);
            block.style.display = 'block';
            // Scroll to it
            setTimeout(function () {
              block.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
          } else {
            block.style.display = 'none';
          }
        }, 200);
      }, true); // capture phase so we run after main decode
    }

    // Clear also resets horse summary
    const origClear = document.getElementById('clearBtn');
    if (origClear) {
      origClear.addEventListener('click', function () {
        const block = document.getElementById('horseSummaryBlock');
        if (block) block.style.display = 'none';
        // Deselect all profile buttons
        document.querySelectorAll('.profile-btn').forEach(function (b) {
          b.classList.remove('selected', 'selected-caution');
        });
      });
    }

  });

})();

// ─────────────────────────────────────────────
// LIBRARY DROPDOWN + RATION BUILDER + SHARE
// ─────────────────────────────────────────────
(function () {
  'use strict';

  const PROFILE_STORAGE_KEY = 'hng_horse_profile';
  const MAX_RATION_SLOTS = 4;

  // ── Ration state
  let rationFeeds = [{ name: '', labelText: '', lbsPerDay: 0 }];

  // ── DOM refs
  let dropdown, loadBtn, statusMsg, rationWrap, rationSlots, rationSlotsEl, rationAddBtn,
      rationAnalyzeBtn, rationOutput, feedInput, decodeBtn,
      shareBlock, shareLinkBtn, shareCardBtn, shareLinkMsg, shareCard,
      shareCardTitle, shareCardBody, profileSaveOpt, profileSaveCheck;

  document.addEventListener('DOMContentLoaded', function () {
    dropdown         = document.getElementById('libraryDropdown');
    loadBtn          = document.getElementById('libraryLoadBtn');
    statusMsg        = document.getElementById('libraryStatusMsg');
    rationWrap       = document.getElementById('rationBuilderWrap');
    rationSlots    = document.getElementById('rationSlots');
    rationSlotsEl  = rationSlots;
    rationAddBtn     = document.getElementById('rationAddBtn');
    rationAnalyzeBtn = document.getElementById('rationAnalyzeBtn');
    rationOutput     = document.getElementById('rationOutput');
    feedInput        = document.getElementById('feedInput');
    decodeBtn        = document.getElementById('decodeBtn');
    shareBlock       = document.getElementById('shareBlock');
    shareLinkBtn     = document.getElementById('shareLinkBtn');
    shareCardBtn     = document.getElementById('shareCardBtn');
    shareLinkMsg     = document.getElementById('shareLinkMsg');
    shareCard        = document.getElementById('shareCard');
    shareCardTitle   = document.getElementById('shareCardTitle');
    shareCardBody    = document.getElementById('shareCardBody');
    profileSaveOpt   = document.getElementById('profileSaveOpt');
    profileSaveCheck = document.getElementById('profileSaveCheck');

    // ── Populate dropdown
    if (dropdown && typeof FEED_LABEL_LIBRARY !== 'undefined') {
      const names = Object.keys(FEED_LABEL_LIBRARY).sort();
      // Group by brand
      const brands = {};
      names.forEach(function (n) {
        const brand = n.split(' ')[0] === 'Triple' ? 'Triple Crown' :
                      n.split(' ')[0] === 'Nutrena' ? 'Nutrena' :
                      n.split(' ')[0] === 'Purina' ? 'Purina' :
                      n.split(' ')[0] === 'Standlee' ? 'Standlee' :
                      n.split(' ')[0] === 'Buckeye' ? 'Buckeye' :
                      n.split(' ')[0] === 'Seminole' ? 'Seminole' :
                      n.split(' ')[0] === 'Tribute' ? 'Tribute' : 'Other';
        if (!brands[brand]) brands[brand] = [];
        brands[brand].push(n);
      });
      Object.keys(brands).sort().forEach(function (brand) {
        const og = document.createElement('optgroup');
        og.label = brand;
        brands[brand].forEach(function (name) {
          const opt = document.createElement('option');
          opt.value = name;
          opt.textContent = name;
          og.appendChild(opt);
        });
        dropdown.appendChild(og);
      });
    }

    // ── Load button
    if (loadBtn) {
      loadBtn.addEventListener('click', function () {
        const name = dropdown ? dropdown.value : '';
        if (!name) return;
        loadFeedFromLibrary(name, true);
      });
    }

    // ── Dropdown change — auto-show ration builder option
    if (dropdown) {
      dropdown.addEventListener('change', function () {
        if (dropdown.value && rationWrap) {
          rationWrap.style.display = 'block';
          updateRationSlot(0, dropdown.value);
          refreshRationUI();
        }
      });
    }

    // ── Ration Builder: add slot
    if (rationAddBtn) {
      rationAddBtn.addEventListener('click', function () {
        if (rationFeeds.length >= MAX_RATION_SLOTS) return;
        rationFeeds.push({ name: '', labelText: '', lbsPerDay: 0 });
        refreshRationUI();
      });
    }

    // ── Ration analyze
    if (rationAnalyzeBtn) {
      rationAnalyzeBtn.addEventListener('click', function () {
        const profile = window.getProfile();
        const result  = window.analyzeRation(rationFeeds, profile);
        if (result && rationOutput) {
          rationOutput.innerHTML = window.renderRationAnalysis(result);
          rationOutput.style.display = 'block';
          rationOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // ── Profile save opt-in — show after first selection
    document.querySelectorAll('.profile-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (profileSaveOpt) profileSaveOpt.style.display = 'flex';
      }, { once: true });
    });

    // ── Load saved profile
    loadSavedProfile();

    // ── Save profile on decode
    if (decodeBtn) {
      decodeBtn.addEventListener('click', function () {
        if (profileSaveCheck && profileSaveCheck.checked) saveProfile();
        // Show share block after decode
        setTimeout(function () {
          const output = document.getElementById('decoderOutput');
          if (output && output.style.display !== 'none') {
            if (shareBlock) shareBlock.style.display = 'block';
          }
        }, 800);
      }, true);
    }

    // ── Share: copy link
    if (shareLinkBtn) {
      shareLinkBtn.addEventListener('click', function () {
        const url = buildShareURL();
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () {
            showShareMsg('Link copied! Share it via text or email.');
          });
        } else {
          showShareMsg(url);
        }
      });
    }

    // ── Share: screenshot card
    if (shareCardBtn) {
      shareCardBtn.addEventListener('click', function () {
        buildShareCard();
        if (shareCard) {
          shareCard.style.display = 'block';
          shareCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
          showShareMsg('Screenshot card shown below — take a screenshot to share.');
        }
      });
    }

    // ── Check for shared URL on load
    loadFromShareURL();

    // ── Render initial ration slot
    refreshRationUI();
  });

  // ── Load feed from library into textarea
  function loadFeedFromLibrary(name, autoDecode) {
    if (typeof FEED_LABEL_LIBRARY === 'undefined' || !FEED_LABEL_LIBRARY[name]) return;
    const text = FEED_LABEL_LIBRARY[name];
    if (feedInput) feedInput.value = text;
    if (statusMsg) {
      statusMsg.textContent = '✓ ' + name + ' loaded — scroll down to decode.';
      statusMsg.style.display = 'block';
    }
    updateRationSlot(0, name);
    if (autoDecode) {
      setTimeout(function () {
        const profile = document.getElementById('horseProfile');
        if (profile) profile.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(function () { if (decodeBtn) decodeBtn.click(); }, 600);
      }, 200);
    }
  }

  // ── Ration slot management
  function updateRationSlot(idx, name) {
    if (!rationFeeds[idx]) return;
    rationFeeds[idx].name = name;
    rationFeeds[idx].labelText = (typeof FEED_LABEL_LIBRARY !== 'undefined' && FEED_LABEL_LIBRARY[name]) ? FEED_LABEL_LIBRARY[name] : '';
  }

  function refreshRationUI() {
    if (!rationSlotsEl) return;
    rationSlotsEl.innerHTML = '';

    rationFeeds.forEach(function (feed, idx) {
      const slot = document.createElement('div');
      slot.className = 'ration-slot';

      const numEl = document.createElement('div');
      numEl.className = 'ration-slot-num';
      numEl.textContent = 'Feed ' + (idx + 1);

      const sel = document.createElement('select');
      sel.className = 'ration-slot-select';
      sel.innerHTML = '<option value="">— Select feed —</option>';
      if (typeof FEED_LABEL_LIBRARY !== 'undefined') {
        Object.keys(FEED_LABEL_LIBRARY).sort().forEach(function (n) {
          const opt = document.createElement('option');
          opt.value = n;
          opt.textContent = n;
          if (n === feed.name) opt.selected = true;
          sel.appendChild(opt);
        });
      }
      sel.addEventListener('change', function () {
        updateRationSlot(idx, sel.value);
        // First slot also loads main textarea
        if (idx === 0 && sel.value) loadFeedFromLibrary(sel.value, false);
        checkRationAnalyzeBtn();
      });

      const lbsInput = document.createElement('input');
      lbsInput.type = 'number';
      lbsInput.className = 'ration-slot-lbs';
      lbsInput.placeholder = 'lbs';
      lbsInput.min = '0';
      lbsInput.step = '0.5';
      lbsInput.value = feed.lbsPerDay || '';
      lbsInput.addEventListener('change', function () {
        rationFeeds[idx].lbsPerDay = parseFloat(lbsInput.value) || 0;
        checkRationAnalyzeBtn();
      });

      const lbsLabel = document.createElement('span');
      lbsLabel.className = 'ration-slot-label';
      lbsLabel.textContent = 'lbs/day';

      slot.appendChild(numEl);
      slot.appendChild(sel);
      slot.appendChild(lbsInput);
      slot.appendChild(lbsLabel);

      // Remove button (not for first slot)
      if (idx > 0) {
        const rmBtn = document.createElement('button');
        rmBtn.className = 'ration-slot-remove';
        rmBtn.innerHTML = '&#10005;';
        rmBtn.addEventListener('click', function () {
          rationFeeds.splice(idx, 1);
          refreshRationUI();
        });
        slot.appendChild(rmBtn);
      }

      rationSlotsEl.appendChild(slot);
    });

    // Add button visibility
    if (rationAddBtn) {
      rationAddBtn.style.display = rationFeeds.length >= MAX_RATION_SLOTS ? 'none' : 'block';
    }

    checkRationAnalyzeBtn();
  }

  function checkRationAnalyzeBtn() {
    if (!rationAnalyzeBtn) return;
    const hasTwo = rationFeeds.filter(function (f) {
      return f.name && f.lbsPerDay > 0;
    }).length >= 2;
    rationAnalyzeBtn.style.display = hasTwo ? 'block' : 'none';
  }

  // window.getProfile() is defined globally in horse profile module

  // ── Save / load profile
  function saveProfile() {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(window.getProfile()));
    } catch (e) {}
  }

  function loadSavedProfile() {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!saved) return;
      const profile = JSON.parse(saved);
      Object.keys(profile).forEach(function (key) {
        const vals = Array.isArray(profile[key]) ? profile[key] : [profile[key]];
        vals.forEach(function (val) {
          const btn = document.querySelector('.profile-options[data-group="' + key + '"] [data-value="' + val + '"]');
          if (btn) {
            const isMulti = btn.closest('[data-multi]');
            btn.classList.add(isMulti ? 'selected-caution' : 'selected');
          }
        });
      });
      if (profileSaveCheck) profileSaveCheck.checked = true;
      if (profileSaveOpt) profileSaveOpt.style.display = 'flex';
    } catch (e) {}
  }

  // ── Share URL — encode feed name + profile into URL params
  function buildShareURL() {
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    const dropdown = document.getElementById('libraryDropdown');
    const feedName = dropdown ? dropdown.value : '';
    if (feedName) params.set('feed', feedName);

    const profile = window.getProfile();
    if (profile.use)       params.set('use', profile.use);
    if (profile.health && profile.health.length) params.set('health', profile.health.join(','));
    if (profile.condition) params.set('cond', profile.condition);
    if (profile.forage)    params.set('forage', profile.forage);

    // Include key GA numbers in URL for sharing without needing to decode again
    const text = feedInput ? feedInput.value : '';
    if (text && window.parseGAFromText) {
      const ga = window.parseGAFromText(text);
      if (ga.protein)  params.set('cp', ga.protein);
      if (ga.fat)      params.set('fat', ga.fat);
      if (ga.nsc || (ga.starch && ga.sugar)) params.set('nsc', ga.nsc || (ga.starch + ga.sugar));
    }

    return base + '?' + params.toString();
  }

  function loadFromShareURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      const feedName = params.get('feed');
      if (feedName && typeof FEED_LABEL_LIBRARY !== 'undefined' && FEED_LABEL_LIBRARY[feedName]) {
        setTimeout(function () {
          if (dropdown) dropdown.value = feedName;
          loadFeedFromLibrary(feedName, false);

          // Restore profile
          const use = params.get('use');
          if (use) {
            const btn = document.querySelector('.profile-options[data-group="use"] [data-value="' + use + '"]');
            if (btn) btn.classList.add('selected');
          }
          const health = params.get('health');
          if (health) {
            health.split(',').forEach(function (val) {
              const btn = document.querySelector('.profile-options[data-group="health"] [data-value="' + val + '"]');
              if (btn) btn.classList.add('selected-caution');
            });
          }
          ['condition:cond','forage:forage'].forEach(function (pair) {
            const [grp, param] = pair.split(':');
            const val = params.get(param);
            if (val) {
              const btn = document.querySelector('.profile-options[data-group="' + grp + '"] [data-value="' + val + '"]');
              if (btn) btn.classList.add('selected');
            }
          });

          // Auto-decode
          setTimeout(function () { if (decodeBtn) decodeBtn.click(); }, 500);
        }, 300);
      }
    } catch (e) {}
  }

  // ── Share card content
  function buildShareCard() {
    if (!shareCardTitle || !shareCardBody) return;
    const dropdown = document.getElementById('libraryDropdown');
    const feedName = dropdown ? dropdown.value : 'Feed';
    const profile  = window.getProfile();

    const useLabels = {
      pleasure: 'trail/pleasure', performance: 'performance',
      senior: 'senior', breeding: 'breeding', growing: 'growing', idle: 'retired'
    };

    const title = feedName || 'My Feed Breakdown';
    shareCardTitle.textContent = title;

    // Pull key numbers from visible output
    const analysisEl = document.getElementById('oc-analysis');
    const summaryEl  = document.getElementById('oc-summary');

    let body = '';
    if (profile.use) body += '🐴 Horse: ' + (useLabels[profile.use] || profile.use) + '\n';
    if (analysisEl) {
      const txt = analysisEl.innerText || '';
      const cpM   = txt.match(/Crude Protein[^\d]*(\d+\.?\d*)/i);
      const fatM  = txt.match(/Crude Fat[^\d]*(\d+\.?\d*)/i);
      const nscM  = txt.match(/NSC[^\d]*(\d+\.?\d*)/i);
      const seM   = txt.match(/Selenium[^\d]*(\d+\.?\d*)/i);
      if (cpM)  body += '📊 Crude Protein: ' + cpM[1] + '%\n';
      if (fatM) body += '📊 Crude Fat: ' + fatM[1] + '%\n';
      if (nscM) body += '📊 NSC: ' + nscM[1] + '%\n';
      if (seM)  body += '📊 Selenium: ' + seM[1] + ' ppm\n';
    }

    if (summaryEl) {
      const summary = (summaryEl.innerText || '').substring(0, 280);
      if (summary) body += '\n' + summary + (summary.length >= 280 ? '…' : '');
    }

    shareCardBody.innerHTML = body.replace(/\n/g, '<br>');
  }

  function showShareMsg(msg) {
    if (shareLinkMsg) {
      shareLinkMsg.textContent = msg;
      shareLinkMsg.style.display = 'block';
    }
  }

})();
