// ═══════════════════════════════════════════════════════
// FEED MATCHMAKER ENGINE
// NRC 2007 nutrient standards × horse profile × 
// hay contribution → scored feed recommendations
// ═══════════════════════════════════════════════════════
'use strict';

// ── NRC 2007 daily requirements (500kg/1100lb base horse)
// Scaled to actual weight in matchFeed()
const NRC_STANDARDS = {
  maintenance: {
    label: 'Maintenance / Idle',
    desc:  'Adult horse, not in regular work',
    DE_Mcal: 16.7, CP_g: 630,  Lys_g: 27, Ca_g: 20, P_g: 14,
    Mg_g: 7.5, K_g: 25, Se_mg: 1.0, VitE_IU: 500,
    VitA_IU: 15000, VitD_IU: 3300, Cu_mg: 100, Zn_mg: 400,
    NSC_max: null,
  },
  light: {
    label: 'Light Work',
    desc:  '1–3 hrs/wk — mostly walking, occasional trot',
    DE_Mcal: 20.0, CP_g: 699,  Lys_g: 30, Ca_g: 30, P_g: 20,
    Mg_g: 8.5, K_g: 28, Se_mg: 1.0, VitE_IU: 800,
    VitA_IU: 15000, VitD_IU: 3300, Cu_mg: 100, Zn_mg: 400,
    NSC_max: null,
  },
  moderate: {
    label: 'Moderate Work',
    desc:  '3–5 hrs/wk — regular walk/trot/canter, trail riding, ranch work',
    DE_Mcal: 23.3, CP_g: 767,  Lys_g: 33, Ca_g: 35, P_g: 24,
    Mg_g: 9.0, K_g: 31, Se_mg: 1.0, VitE_IU: 900,
    VitA_IU: 15000, VitD_IU: 3300, Cu_mg: 100, Zn_mg: 400,
    NSC_max: null,
  },
  heavy: {
    label: 'Heavy Work',
    desc:  '4–5 hrs/wk — cutting, reining, roping, dressage, jumping',
    DE_Mcal: 29.2, CP_g: 923,  Lys_g: 40, Ca_g: 40, P_g: 29,
    Mg_g: 10.0, K_g: 37, Se_mg: 1.0, VitE_IU: 1000,
    VitA_IU: 15000, VitD_IU: 3300, Cu_mg: 100, Zn_mg: 400,
    NSC_max: null,
  },
  very_heavy: {
    label: 'Very Heavy / Elite',
    desc:  'Racing, elite endurance, high-level competition',
    DE_Mcal: 36.3, CP_g: 1123, Lys_g: 48, Ca_g: 48, P_g: 35,
    Mg_g: 11.0, K_g: 46, Se_mg: 1.0, VitE_IU: 1000,
    VitA_IU: 15000, VitD_IU: 3300, Cu_mg: 100, Zn_mg: 400,
    NSC_max: null,
  },
  senior: {
    label: 'Senior (15+ years)',
    desc:  'Older horse with reduced digestive efficiency',
    DE_Mcal: 20.0, CP_g: 798,  Lys_g: 35, Ca_g: 30, P_g: 20,
    Mg_g: 8.5, K_g: 28, Se_mg: 1.0, VitE_IU: 1000,
    VitA_IU: 15000, VitD_IU: 3300, Cu_mg: 125, Zn_mg: 450,
    NSC_max: null,
  },
  pregnant: {
    label: 'Pregnant Mare (last trimester)',
    desc:  'Last 3 months of gestation — elevated protein, copper, Vitamin A',
    DE_Mcal: 20.3, CP_g: 799,  Lys_g: 34, Ca_g: 36, P_g: 25,
    Mg_g: 9.0, K_g: 30, Se_mg: 1.0, VitE_IU: 800,
    VitA_IU: 22500, VitD_IU: 3300, Cu_mg: 150, Zn_mg: 450,
    NSC_max: null,
  },
  lactating: {
    label: 'Lactating Mare (peak lactation)',
    desc:  'First 3 months after foaling — highest protein and calcium demands',
    DE_Mcal: 28.3, CP_g: 1386, Lys_g: 60, Ca_g: 57, P_g: 36,
    Mg_g: 11.0, K_g: 49, Se_mg: 1.25, VitE_IU: 1000,
    VitA_IU: 22500, VitD_IU: 3300, Cu_mg: 150, Zn_mg: 500,
    NSC_max: null,
  },
  growing: {
    label: 'Growing / Weanling',
    desc:  'Foal or young horse in active growth phase',
    DE_Mcal: 14.8, CP_g: 630,  Lys_g: 34, Ca_g: 32, P_g: 18,
    Mg_g: 4.0, K_g: 13, Se_mg: 0.5, VitE_IU: 400,
    VitA_IU: 8000, VitD_IU: 2200, Cu_mg: 75, Zn_mg: 300,
    NSC_max: null,
  },
  metabolic: {
    label: 'Easy Keeper / Metabolic',
    desc:  'EMS, IR, laminitis history, PPID/Cushing\'s, or overweight horse',
    DE_Mcal: 14.0, CP_g: 630,  Lys_g: 27, Ca_g: 20, P_g: 14,
    Mg_g: 7.5, K_g: 25, Se_mg: 1.0, VitE_IU: 1000,
    VitA_IU: 15000, VitD_IU: 3300, Cu_mg: 125, Zn_mg: 450,
    NSC_max: 10,
  },
};

// ── Average daily nutrient contributions from hay types
// Per lb of hay fed (rough averages — hay quality varies)
const HAY_CONTRIBUTION_PER_LB = {
  alfalfa: {
    DE_Mcal: 0.97, CP_g: 43,  Ca_g: 5.5, P_g: 1.0,
    Mg_g: 0.55, K_g: 8.0, VitE_IU: 10, Se_mg: 0.003,
    NSC_pct: 10,
  },
  grass: {
    DE_Mcal: 0.82, CP_g: 20,  Ca_g: 1.4, P_g: 1.0,
    Mg_g: 0.50, K_g: 5.5, VitE_IU: 8,  Se_mg: 0.003,
    NSC_pct: 15,
  },
  mixed: {
    DE_Mcal: 0.88, CP_g: 28,  Ca_g: 2.8, P_g: 1.0,
    Mg_g: 0.52, K_g: 6.5, VitE_IU: 9,  Se_mg: 0.003,
    NSC_pct: 12,
  },
  unknown: {
    DE_Mcal: 0.85, CP_g: 24,  Ca_g: 2.0, P_g: 0.9,
    Mg_g: 0.50, K_g: 6.0, VitE_IU: 8,  Se_mg: 0.003,
    NSC_pct: 13,
  },
};

// ── Parse GA values from library label text
function parseGAFull(text) {
  if (!text) return {};
  const ga = {};
  const pats = [
    ['cp',        /crude\s*protein[^0-9]{0,30}(\d+\.?\d*)\s*%/i],
    ['fat',       /crude\s*fat[^0-9]{0,30}(\d+\.?\d*)\s*%/i],
    ['fiber',     /crude\s*fiber[^0-9]{0,30}(\d+\.?\d*)\s*%/i],
    ['nsc',       /\bnsc\b[^0-9]{0,30}(\d+\.?\d*)/i],
    ['starch',    /\bstarch\b[^0-9]{0,30}(\d+\.?\d*)\s*%/i],
    ['sugar',     /(?:sugar|wsc)[^0-9]{0,30}(\d+\.?\d*)\s*%/i],
    ['ca',        /calcium[^(][^0-9]{0,20}(\d+\.?\d*)\s*%/i],
    ['p',         /phosphorus[^0-9]{0,20}(\d+\.?\d*)\s*%/i],
    ['mg',        /magnesium[^0-9]{0,20}(\d+\.?\d*)\s*%/i],
    ['k',         /potassium[^0-9]{0,20}(\d+\.?\d*)\s*%/i],
    ['se',        /selenium[^0-9]{0,20}(\d+\.?\d*)\s*(?:ppm|mg)/i],
    ['cu',        /\bcopper\b[^0-9]{0,20}(\d+\.?\d*)\s*ppm/i],
    ['zn',        /\bzinc\b[^0-9]{0,20}(\d+\.?\d*)\s*ppm/i],
    ['vitE',      /vitamin\s*e[^0-9]{0,20}(\d+\.?\d*)\s*iu/i],
    ['vitA',      /vitamin\s*a[^0-9]{0,20}(\d+\.?\d*)\s*iu/i],
    ['vitD',      /vitamin\s*d[^0-9]{0,20}(\d+\.?\d*)\s*iu/i],
    ['lysine',    /\blysine\b[^0-9]{0,20}(\d+\.?\d*)\s*%/i],
    ['biotin',    /\bbiotin\b[^0-9]{0,20}(\d+\.?\d*)\s*(?:mg|iu)/i],
  ];
  for (const [key, pat] of pats) {
    const m = text.match(pat);
    if (m) ga[key] = parseFloat(m[1]);
  }
  // Compute NSC if not listed
  if (!ga.nsc && ga.starch !== undefined && ga.sugar !== undefined) {
    ga.nsc = ga.starch + ga.sugar;
  }
  return ga;
}

// ── Detect feed characteristics
function detectFeedTraits(text) {
  const t = text.toLowerCase();
  return {
    hasMolasses:      /molasses/i.test(t),
    hasChelatedMins:  /proteinate|amino acid complex|chelat/i.test(t),
    hasOrganicSe:     /selenium yeast|selenomethionine/i.test(t),
    hasBeetPulp:      /beet pulp/i.test(t),
    hasSoyHulls:      /soybean hull/i.test(t),
    hasAlfalfa:       /alfalfa/i.test(t),
    hasFlax:          /flax|linseed/i.test(t),
    hasRiceBran:      /rice bran/i.test(t),
    hasYeast:         /yeast culture|saccharomyces/i.test(t),
    hasVitC:          /ascorbyl|vitamin c/i.test(t),
    isComplete:       /complete feed|hay replace/i.test(t),
    isBalancer:       /ration balancer|balancer/i.test(t),
    grainLead:        /^(ground corn|corn|oats|barley)/i.test((t.match(/ingredients[:\s]*([\s\S]{0,80})/i)||['',''])[1]),
    fiberLead:        /^(soybean hull|beet pulp|alfalfa|wheat middlings)/i.test((t.match(/ingredients[:\s]*([\s\S]{0,80})/i)||['',''])[1]),
  };
}

// ── Scale NRC requirements from 500kg base to actual weight
function scaleNRC(standard, weightLbs) {
  const weightKg = weightLbs * 0.4536;
  const scale    = weightKg / 500;
  const scaled   = {};
  for (const [k, v] of Object.entries(standard)) {
    if (typeof v === 'number') scaled[k] = v * scale;
    else scaled[k] = v;
  }
  return scaled;
}

// ── Calculate hay contribution
function calcHayContrib(hayType, hayLbs) {
  const ref = HAY_CONTRIBUTION_PER_LB[hayType] || HAY_CONTRIBUTION_PER_LB.unknown;
  const contrib = {};
  for (const [k, v] of Object.entries(ref)) {
    contrib[k] = v * hayLbs;
  }
  // Convert % values: Ca_g, P_g per lb hay
  return contrib;
}

// ── Score a feed against the nutrient gap
function scoreFeed(feedName, labelText, gap, profile) {
  const ga     = parseGAFull(labelText);
  const traits = detectFeedTraits(labelText);
  const health = profile.health || [];
  const isMetabolic = health.some(h => ['ir','laminitis','cushings','pssm'].includes(h));

  // ── Hard eliminators
  const nsc = ga.nsc || (ga.starch && ga.sugar ? ga.starch + ga.sugar : null);
  const nscLimit = profile.standard.NSC_max;
  if (nscLimit && nsc !== null && nsc > nscLimit) {
    return { score: -1, eliminated: true, reason: `NSC ${nsc}% exceeds ${nscLimit}% limit for this horse` };
  }
  if (isMetabolic && traits.hasMolasses && traits.grainLead) {
    return { score: -1, eliminated: true, reason: 'Grain-lead + molasses — not appropriate for metabolic horses' };
  }
  if (profile.stage === 'growing' && traits.isBalancer) {
    return { score: 0, eliminated: false, reason: 'Ration balancer — low energy for growing horse' };
  }

  // ── Score components (each 0–25 points)
  let score = 0;
  const notes = [];

  // 1. PROTEIN — does it meet the gap? (25 pts)
  if (ga.cp !== undefined) {
    const cpFromFeed = ga.cp / 100 * 3.0 * 453.6; // assume 3 lbs = ~1360g, at CP% = g protein
    // We'll calculate actual g at recommended feeding rate after
    score += Math.min(25, 25 * (ga.cp / (profile.standard.CP_g / 8)));
    if (ga.cp >= 14) notes.push(`${ga.cp}% crude protein ✓`);
  }

  // 2. VITAMIN E (25 pts)
  if (ga.vitE !== undefined) {
    const vitETarget = profile.standard.VitE_IU || 500;
    const vitEAt3lbs = ga.vitE * 3;
    const pct = Math.min(1, vitEAt3lbs / vitETarget);
    score += 25 * pct;
    if (ga.vitE >= 150) notes.push(`Vitamin E: ${ga.vitE} IU/lb ✓`);
  }

  // 3. SELENIUM QUALITY (15 pts)
  if (ga.se !== undefined) {
    const seScore = ga.se >= 0.2 ? 10 : 5;
    score += seScore + (traits.hasOrganicSe ? 5 : 0);
    if (traits.hasOrganicSe) notes.push('Organic selenium (selenium yeast) ✓');
  }

  // 4. MINERAL QUALITY (15 pts)
  if (traits.hasChelatedMins) { score += 10; notes.push('Chelated minerals ✓'); }
  if (traits.hasYeast)         { score += 5;  notes.push('Yeast culture ✓'); }

  // 5. PROFILE FIT (20 pts — bonus/penalty based on horse type)
  if (profile.stage === 'senior') {
    if (traits.isComplete || traits.hasBeetPulp) { score += 15; notes.push('Soakable fiber — good for senior'); }
    if (ga.cp >= 12) { score += 5; }
  }
  if (isMetabolic) {
    if (nsc !== null && nsc <= 10) { score += 20; notes.push(`Low NSC ${nsc}% ✓ — good for metabolic horse`); }
    else if (nsc !== null && nsc <= 14) { score += 10; notes.push(`Moderate NSC ${nsc}%`); }
    if (!traits.hasMolasses) { score += 5; notes.push('Molasses-free ✓'); }
  }
  if (profile.stage === 'heavy' || profile.stage === 'very_heavy') {
    if (ga.fat >= 8)  { score += 15; notes.push(`High fat ${ga.fat}% — sustained energy`); }
    if (ga.cp >= 14)  { score += 5; }
  }
  if (profile.stage === 'pregnant' || profile.stage === 'lactating') {
    if (ga.ca >= 1.0) { score += 10; notes.push(`Calcium ${ga.ca}% ✓`); }
    if (ga.cp >= 14)  { score += 10; }
  }
  if (profile.stage === 'growing') {
    if (ga.ca >= 0.8 && ga.p >= 0.4) { score += 15; notes.push('Ca:P adequate for growth'); }
    if (ga.cp >= 14) { score += 10; }
  }

  // Bonus: fiber-based for any horse
  if (traits.hasBeetPulp || traits.hasSoyHulls) { score += 5; }
  if (traits.hasFlax || traits.hasRiceBran) { score += 3; }

  return { score: Math.round(score), eliminated: false, notes, ga, traits, nsc };
}

// ── Estimate recommended feeding rate (lbs/day)
function recommendFeedingRate(feedName, ga, standard, hayContrib, weightLbs) {
  // Use protein gap to drive the base rate, then check energy
  const cpGap  = Math.max(0, standard.CP_g - (hayContrib.CP_g || 0));
  const deGap  = Math.max(0, standard.DE_Mcal - (hayContrib.DE_Mcal || 0));

  let lbsByCP = 3.0; // default
  if (ga.cp) {
    // g CP per lb = cp% / 100 * 453.6
    const cpPerLb = ga.cp / 100 * 453.6;
    lbsByCP = cpGap / cpPerLb;
  }

  let lbsByDE = 3.0;
  // Rough DE: fiber feed ~1.0 Mcal/lb, grain feed ~1.4 Mcal/lb, fat feed ~1.6 Mcal/lb
  const dePerLb = (ga.fat || 0) >= 8 ? 1.5 : (ga.fiber || 0) >= 18 ? 0.95 : 1.2;
  lbsByDE = deGap / dePerLb;

  // Take higher of the two; cap at reasonable max; round to 0.5
  const raw  = Math.max(lbsByCP, lbsByDE);
  const capped = Math.min(raw, weightLbs / 100); // max ~1% body weight in concentrate
  const rate = Math.round(capped * 2) / 2;
  return Math.max(1.0, rate);
}

// ── MAIN MATCHMAKER FUNCTION
function matchFeed(userProfile) {
  // userProfile = {
  //   weightLbs: 1100,
  //   stage: 'moderate',
  //   health: ['ir', 'laminitis'],
  //   hayType: 'grass',
  //   hayLbs: 20,
  //   hasPasture: false,
  //   budgetPerMonth: null,
  // }

  const standard = NRC_STANDARDS[userProfile.stage];
  if (!standard) return null;

  const weightLbs = userProfile.weightLbs || 1100;
  const scaled    = scaleNRC(standard, weightLbs);
  const hayContrib = calcHayContrib(userProfile.hayType || 'grass', userProfile.hayLbs || 20);
  const profile   = { ...userProfile, standard: scaled };

  // Score all library feeds
  const results = [];
  if (typeof FEED_LABEL_LIBRARY === 'undefined') return null;

  for (const [name, text] of Object.entries(FEED_LABEL_LIBRARY)) {
    const result = scoreFeed(name, text, null, profile);
    if (result.score < 0) continue; // hard eliminated
    const rate = recommendFeedingRate(name, result.ga, scaled, hayContrib, weightLbs);
    results.push({
      name,
      score:    result.score,
      notes:    result.notes || [],
      ga:       result.ga,
      traits:   result.traits,
      nsc:      result.nsc,
      eliminated: result.eliminated,
      elimReason: result.reason,
      feedRate: rate,
      feedRateLabel: `${rate} lbs/day`,
    });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  // Build nutrient gap summary (what hay doesn't cover)
  const gaps = {};
  const nutrients = { DE: 'Digestible Energy', CP: 'Crude Protein', VitE: 'Vitamin E', Se: 'Selenium' };
  const hayDE   = hayContrib.DE_Mcal || 0;
  const hayCPg  = hayContrib.CP_g    || 0;
  const deGap   = (scaled.DE_Mcal - hayDE).toFixed(1);
  const cpGap   = Math.round(scaled.CP_g - hayCPg);

  return {
    scaled,
    hayContrib,
    deGap:  parseFloat(deGap),
    cpGap:  Math.max(0, cpGap),
    top:    results.filter(r => !r.eliminated).slice(0, 5),
    eliminated: results.filter(r => r.eliminated),
    standard,
    profile: userProfile,
  };
}

window.matchFeed       = matchFeed;
window.NRC_STANDARDS   = NRC_STANDARDS;
window.parseGAFull     = parseGAFull;
