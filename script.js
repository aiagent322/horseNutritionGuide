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
// ─────────────────────────────────────────────
// FEEDING DIRECTIONS PARSER
// Extracts feeding rate and calculates daily
// nutrient delivery from analysis values
// ─────────────────────────────────────────────
function parseFeedingDirections(text, analysis) {
  // Try to isolate feeding directions section
  // Find feeding directions section
  const dirIdx = text.search(/feeding\s*directions?/i);
  if (dirIdx < 0) return null;
  const dirRaw = text.slice(dirIdx + text.slice(dirIdx).match(/feeding\s*directions?[^\n]*/i)[0].length);
  const dirText = dirRaw.split(/\n\n\n|important:/i)[0].trim();
  if (dirText.length < 10) return null;

  // Extract daily feeding rate — look for lbs/day patterns
  const lbMatch = dirText.match(/(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*lbs?/i);
  const singleLbMatch = dirText.match(/(\d+(?:\.\d+)?)\s*lbs?\s*(?:per\s*day|daily|\/day)/i);
  const kgMatch  = dirText.match(/(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*kg/i);

  let minLbs = null, maxLbs = null, midLbs = null;
  if (lbMatch) {
    minLbs = parseFloat(lbMatch[1]);
    maxLbs = parseFloat(lbMatch[2]);
    midLbs = (minLbs + maxLbs) / 2;
  } else if (singleLbMatch) {
    minLbs = maxLbs = midLbs = parseFloat(singleLbMatch[1]);
  } else if (kgMatch) {
    minLbs = parseFloat(kgMatch[1]) * 2.205;
    maxLbs = parseFloat(kgMatch[2]) * 2.205;
    midLbs = (minLbs + maxLbs) / 2;
  }

  if (midLbs === null) return { dirText, rate: null, nutrients: null };

  // Extract horse weight reference
  const weightMatch = dirText.match(/(\d+(?:,\d+)?)\s*(?:lb|pound|kg|kilogram)/i);
  const refWeightLbs = weightMatch
    ? (weightMatch[0].toLowerCase().includes('kg') ? parseFloat(weightMatch[1]) * 2.205 : parseFloat(weightMatch[1].replace(',','')))
    : 1000; // default 1000 lb horse

  // Calculate daily nutrient delivery at mid feeding rate
  const nutrients = {};

  if (analysis.protein) {
    // Convert % to grams: lbs * 453.6 g/lb * (% / 100)
    const grams = midLbs * 453.6 * (analysis.protein.value / 100);
    nutrients.protein = `~${Math.round(grams)}g crude protein/day`;
  }

  if (analysis.selenium) {
    // ppm = mg/kg; convert lbs to kg first
    const kgFed = midLbs * 0.4536;
    const mgSe  = kgFed * analysis.selenium.value;
    const safeLimit = 2.0;
    const pct = Math.round((mgSe / safeLimit) * 100);
    nutrients.selenium = `~${mgSe.toFixed(2)}mg selenium/day (${pct}% of the commonly cited 2mg/day safe upper limit)`;
  }

  if (analysis.vitE) {
    // IU/lb × lbs fed
    const iuDay = midLbs * analysis.vitE.value;
    const needEstimate = refWeightLbs * 1.5; // ~1.5 IU/lb body weight is common recommendation
    nutrients.vitE = `~${Math.round(iuDay)} IU Vitamin E/day (a ${refWeightLbs}-lb horse at maintenance may need ~${Math.round(needEstimate)} IU/day from all sources)`;
  }

  return {
    dirText,
    rate: minLbs === maxLbs
      ? `${minLbs} lbs/day`
      : `${minLbs}–${maxLbs} lbs/day`,
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
  // Extract just the ingredient section
  let ingSection = '';
  const headerMatch = text.match(/ingredients\s*:([\s\S]*?)(?=guaranteed\s*analysis|feeding\s*directions|important:|$)/i);
  if (headerMatch) {
    ingSection = headerMatch[1];
  } else {
    ingSection = extractIngredientText(text);
  }

  // Split on commas and clean up each entry
  return ingSection
    .replace(/\n/g, ' ')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 2);
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

  const feedTypeHTML = noIngBanner + feedTypes.map(ft =>
    `<strong>${ft.label}</strong> <em>(${ft.confidence} confidence)</em><br><span style="font-size:0.88rem">${ft.reason}</span>`
  ).join('<br><br>') + feedFormHTML;

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
      const vitEContext = vitEVal >= 500
        ? `Vitamin E listed at <strong>${vitEVal} IU/lb</strong> — a generous level. At typical feeding rates this likely meets or exceeds maintenance needs for most horses without pasture access.`
        : vitEVal >= 200
        ? `Vitamin E listed at <strong>${vitEVal} IU/lb</strong> — a reasonable level. Horses without pasture access typically need 1–2 IU per pound of body weight daily from all sources. Verify total intake based on your feeding rate.`
        : `Vitamin E listed at <strong>${vitEVal} IU/lb</strong> — relatively low. Horses without regular pasture access may need supplemental Vitamin E beyond what this feed provides, especially horses with muscle conditions or neurological concerns.`;

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
    if (/iron/i.test(text)) {
      const ironMatch = text.match(/iron[^0-9]*([0-9]+\.?[0-9]*)\s*ppm/i);
      if (ironMatch) {
        notes.push(`Iron listed at ${ironMatch[1]} ppm. High iron in feed can interfere with copper and zinc absorption. If your hay is also high in iron (common in many regions), total iron load is worth discussing with your vet or nutritionist.`);
      }
    }
    if (/lysine|methionine|threonine/i.test(text)) {
      notes.push(`Individual amino acids (lysine, methionine, threonine) are listed in the guaranteed analysis. This indicates the manufacturer is guaranteeing specific amino acid levels — a sign of a more precisely formulated feed focused on protein quality, not just crude protein quantity.`);
    }
    vitHTML = vparts.join('<br>') + (notes.length ? '<br><br>' + notes.join('<br><br>') : '') + (redFlagsHTML ? '<br><br>' + redFlagsHTML : '');
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

  // ── Feeding directions block
  let feedingDirHTML = '';
  if (feedingDir && feedingDir.rate) {
    const nutLines = Object.values(feedingDir.nutrients || {});
    feedingDirHTML = `<div style="background:#F2F7F4;border:1px solid rgba(61,122,94,0.2);border-radius:6px;padding:12px 14px;margin-top:14px;">
      <div style="font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#2D5C47;margin-bottom:6px;">Feeding Rate Detected</div>
      <strong style="color:#1C3A2F">${feedingDir.rate}</strong> (for a ${feedingDir.refWeightLbs}-lb horse)<br>
      ${nutLines.length ? '<br><strong style="font-size:0.82rem;color:#1C3A2F">Estimated daily nutrient delivery at mid feeding rate:</strong><br>' + nutLines.map(n => `<span style="font-size:0.83rem;color:#3D3D38">• ${n}</span>`).join('<br>') : ''}
      <br><br><em style="font-size:0.79rem;color:#888">Estimates based on label values — actual amounts vary by exact feeding rate, horse size, and feed density. Always reference the original label and consult your vet or nutritionist for horses with specific health needs.</em>
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
