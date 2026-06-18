// ─────────────────────────────────────────────
// RATION BUILDER — Multi-feed combination analysis
// Up to 4 feeds, combined nutrient totals,
// compatibility verdict per horse type
// ─────────────────────────────────────────────
'use strict';

// ── Extract key GA numbers from label text
function parseGAFromText(text) {
  if (!text) return {};
  const ga = {};
  const patterns = [
    ['protein',   /crude\s*protein[^0-9]{0,30}(\d+\.?\d*)\s*%/i],
    ['fat',       /crude\s*fat[^0-9]{0,30}(\d+\.?\d*)\s*%/i],
    ['fiber',     /crude\s*fiber[^0-9]{0,30}(\d+\.?\d*)\s*%/i],
    ['nsc',       /\bnsc\b[^0-9]{0,30}(\d+\.?\d*)/i],
    ['starch',    /\bstarch\b[^0-9]{0,30}(\d+\.?\d*)\s*%/i],
    ['sugar',     /(?:sugar|wsc)[^0-9]{0,30}(\d+\.?\d*)\s*%/i],
    ['calcium',   /calcium[^0-9]{0,30}(\d+\.?\d*)\s*%/i],
    ['phosphorus',/phosphorus[^0-9]{0,30}(\d+\.?\d*)\s*%/i],
    ['selenium',  /selenium[^0-9]{0,20}(\d+\.?\d*)\s*(?:ppm|mg)/i],
    ['vitE',      /vitamin\s*e[^0-9]{0,20}(\d+\.?\d*)\s*iu/i],
    ['vitA',      /vitamin\s*a[^0-9]{0,20}(\d+\.?\d*)\s*iu/i],
    ['copper',    /\bcopper\b[^0-9]{0,20}(\d+\.?\d*)\s*ppm/i],
    ['zinc',      /\bzinc\b[^0-9]{0,20}(\d+\.?\d*)\s*ppm/i],
    ['lysine',    /\blysine\b[^0-9]{0,20}(\d+\.?\d*)\s*%/i],
  ];
  for (const [key, pat] of patterns) {
    const m = text.match(pat);
    if (m) ga[key] = parseFloat(m[1]);
  }
  return ga;
}

// ── Detect feed category from label text
function classifyFeedRole(text) {
  const t = text.toLowerCase();
  if (/ration balancer|balancer/i.test(t)) return 'balancer';
  if (/complete feed|hay replace/i.test(t)) return 'complete';
  if (/forage|pellets?\s*$|alfalfa pellet|timothy pellet|beet pulp shred/i.test(t)) return 'forage';
  if (/supplement|boost|finish|bloom/i.test(t)) return 'supplement';
  if (/senior|equine senior/i.test(t)) return 'senior';
  if (/performance|competition|ultium|proforce fuel/i.test(t)) return 'performance';
  return 'concentrate';
}

// ── Check for selenium in ingredient list (any form)
function hasSeleniumSource(text) {
  return /selenium\s*yeast|sodium\s*selenite|selenium\s*proteinate/i.test(text);
}

function hasMolasses(text) {
  return /molasses/i.test(text);
}

function hasGrainLead(text) {
  const firstThree = text.split(',').slice(0, 3).join(',').toLowerCase();
  return /corn|oats|barley|wheat(?!\s*middlings)|maize/i.test(firstThree);
}

// ── MAIN: Analyze a ration of up to 4 feeds
function analyzeRation(feeds, horseProfile) {
  // feeds = array of { name, labelText, lbsPerDay }
  // horseProfile = { use, health[], condition, forage }

  const active = feeds.filter(f => f.labelText && f.lbsPerDay > 0);
  if (active.length === 0) return null;

  // Parse each feed
  const parsed = active.map(f => ({
    name:       f.name || 'Feed',
    lbs:        f.lbsPerDay,
    kg:         f.lbsPerDay * 0.4536,
    ga:         parseGAFromText(f.labelText),
    role:       classifyFeedRole(f.labelText),
    hasMolasses: hasMolasses(f.labelText),
    hasGrainLead: hasGrainLead(f.labelText),
    hasSelenium:  hasSeleniumSource(f.labelText),
    text:       f.labelText,
  }));

  const profile = horseProfile || {};
  const health  = profile.health || [];
  const use     = profile.use || 'pleasure';
  const hasIR   = health.includes('ir') || health.includes('laminitis') || health.includes('cushings');
  const hasPSSM = health.includes('pssm');

  // ── Combined nutrient totals at feeding rates
  const totals = {};
  const nutrientKeys = ['protein','fat','fiber','starch','sugar','nsc','selenium','vitE','vitA','copper','zinc','lysine'];

  for (const f of parsed) {
    for (const key of nutrientKeys) {
      if (f.ga[key] === undefined) continue;
      const val = f.ga[key];

      if (!totals[key]) totals[key] = 0;

      if (key === 'selenium') {
        // ppm × kg = mg
        totals[key] += val * f.kg;
      } else if (key === 'vitE' || key === 'vitA') {
        // IU/lb × lbs = total IU
        totals[key] += val * f.lbs;
      } else if (key === 'copper' || key === 'zinc') {
        // ppm - just note the highest value (can't simply add ppm across feeds)
        totals[key] = Math.max(totals[key], val);
      } else {
        // % — weighted average by weight fed (approximate)
        totals[key] += val; // will be averaged below
      }
    }
  }

  // Weighted average for % values
  const totalLbs = parsed.reduce((s, f) => s + f.lbs, 0);
  const pctKeys = ['protein','fat','fiber','starch','sugar','nsc','calcium','phosphorus','lysine'];
  for (const key of pctKeys) {
    if (totals[key] !== undefined) {
      // Re-calculate as weighted average
      let weighted = 0;
      let hasAny = false;
      for (const f of parsed) {
        if (f.ga[key] !== undefined) {
          weighted += f.ga[key] * f.lbs;
          hasAny = true;
        }
      }
      if (hasAny) totals[key + '_wavg'] = weighted / totalLbs;
    }
  }

  // ── Combined NSC
  const nscValues = parsed.filter(f => f.ga.nsc !== undefined || (f.ga.starch !== undefined && f.ga.sugar !== undefined));
  const effectiveNSC = totals.nsc_wavg ||
    (totals.starch_wavg && totals.sugar_wavg ? totals.starch_wavg + totals.sugar_wavg : null);

  // ── Build flags and verdicts
  const flags = [];
  const good  = [];

  // 1. Selenium stacking
  const seCount = parsed.filter(f => f.hasSelenium).length;
  if (seCount >= 2) {
    const totalSe = totals.selenium || 0;
    flags.push({
      level: 'caution',
      title: 'Selenium from multiple sources',
      detail: `${seCount} feeds in this ration contain selenium. Combined delivery is approximately ${totalSe.toFixed(2)} mg/day. The commonly cited safe upper limit from all sources is 2 mg/day. ${totalSe > 2 ? '⚠ This combination may exceed the safe limit — review with your vet before feeding together.' : 'Currently within the safe range, but monitor if adding any supplements.'}`
    });
  }

  // 2. Molasses stacking with metabolic horse
  const molassesCount = parsed.filter(f => f.hasMolasses).length;
  if (molassesCount >= 2 && hasIR) {
    flags.push({
      level: 'critical',
      title: 'Multiple molasses sources for a metabolic horse',
      detail: `${molassesCount} feeds in this ration contain molasses. For a horse with insulin resistance, EMS, Cushing\'s, or laminitis history, stacking multiple sugar sources significantly increases the glycemic load. Review this combination with your vet.`
    });
  } else if (molassesCount >= 1 && hasIR) {
    flags.push({
      level: 'caution',
      title: 'Molasses present — metabolic horse caution',
      detail: 'At least one feed in this ration contains molasses. For a metabolic horse, verify the total NSC of the combined ration is below 10–12%.'
    });
  }

  // 3. NSC evaluation for metabolic horses
  if (effectiveNSC !== null && hasIR) {
    if (effectiveNSC > 12) {
      flags.push({
        level: 'critical',
        title: `High combined NSC (${effectiveNSC.toFixed(1)}%) — not appropriate for metabolic horse`,
        detail: `The weighted average NSC of this ration is approximately ${effectiveNSC.toFixed(1)}%. For a horse with insulin resistance, EMS, Cushing\'s, or laminitis, the total diet NSC should be below 10–12%. This combination as fed is not appropriate without veterinary guidance.`
      });
    } else if (effectiveNSC <= 10) {
      good.push(`Combined NSC is approximately ${effectiveNSC.toFixed(1)}% — within the recommended range for a metabolic horse.`);
    }
  }

  // 4. PSSM / grain stacking
  const grainLeadCount = parsed.filter(f => f.hasGrainLead).length;
  if (grainLeadCount >= 2 && hasPSSM) {
    flags.push({
      level: 'critical',
      title: 'Multiple grain-forward feeds for a PSSM / tying-up horse',
      detail: `${grainLeadCount} feeds lead with grain ingredients. Horses with PSSM, RER, or recurrent tying-up require very low starch and sugar. This combination is likely to trigger muscle problems.`
    });
  }

  // 5. Balancer + complete feed redundancy
  const hasBalancer  = parsed.some(f => f.role === 'balancer');
  const hasComplete  = parsed.some(f => f.role === 'complete');
  const concentrates = parsed.filter(f => ['concentrate','senior','performance'].includes(f.role));

  if (hasBalancer && concentrates.length > 0) {
    flags.push({
      level: 'caution',
      title: 'Ration balancer combined with fortified concentrate',
      detail: 'Feeding a ration balancer alongside a fully fortified concentrate can result in excessive vitamin and mineral intake — especially Vitamin A, copper, zinc, and selenium. Ration balancers are designed to be used with hay or a low-fortification feed, not stacked on top of another complete concentrate. Confirm total daily vitamin and mineral intake before feeding this combination.'
    });
  }

  // 6. Good combinations
  if (parsed.some(f => f.role === 'forage') && parsed.some(f => f.role === 'concentrate')) {
    good.push('Forage pellet/supplement combined with a concentrate — a good foundation. Forage provides fermentable fiber, concentrate provides fortified nutrition.');
  }

  if (parsed.some(f => f.role === 'supplement') && !hasBalancer) {
    const supps = parsed.filter(f => f.role === 'supplement');
    if (supps.every(f => !f.hasGrainLead)) {
      good.push(`Fat/fiber supplement (${supps.map(f=>f.name).join(', ')}) added to ration — adds calories without starch. Appropriate for hard keepers or performance horses.`);
    }
  }

  // 7. Vitamin E from combined ration
  const totalVitE = totals.vitE || 0;
  const hasNoPassure = profile.forage === 'hay_only' || profile.forage === 'limited';
  if (totalVitE > 0 && hasNoPassure) {
    const need = 1000; // approx maintenance for 1000lb horse
    if (totalVitE < need) {
      flags.push({
        level: 'note',
        title: `Combined Vitamin E may be low (${Math.round(totalVitE)} IU/day)`,
        detail: `This ration provides approximately ${Math.round(totalVitE)} IU of Vitamin E per day. For a horse without pasture access, most nutritionists recommend at least 1,000–2,000 IU/day. Consider whether additional Vitamin E supplementation is needed.`
      });
    } else {
      good.push(`Combined Vitamin E: ~${Math.round(totalVitE)} IU/day — adequate for a horse without pasture access.`);
    }
  }

  // 8. Feed role balance check
  const roles = parsed.map(f => f.role);
  if (roles.every(r => r === 'forage')) {
    flags.push({
      level: 'note',
      title: 'Forage-only ration — may be under-fortified',
      detail: 'All selected feeds are forage products (pellets, cubes, beet pulp). This provides fiber and some energy but may not supply adequate vitamins, minerals, and trace nutrients. Consider adding a ration balancer or well-fortified concentrate unless feeding alongside full hay rations and verified mineral supplementation.'
    });
  }

  // ── Build combined summary table
  const summaryRows = [];
  if (totals.protein_wavg) summaryRows.push(['Combined Crude Protein', `~${totals.protein_wavg.toFixed(1)}%`]);
  if (totals.fat_wavg) summaryRows.push(['Combined Crude Fat', `~${totals.fat_wavg.toFixed(1)}%`]);
  if (effectiveNSC) summaryRows.push(['Combined NSC (est.)', `~${effectiveNSC.toFixed(1)}%`]);
  if (totals.selenium) summaryRows.push(['Daily Selenium', `~${totals.selenium.toFixed(2)} mg/day`]);
  if (totals.vitE) summaryRows.push(['Daily Vitamin E', `~${Math.round(totals.vitE)} IU/day`]);
  if (totals.vitA) summaryRows.push(['Daily Vitamin A', `~${Math.round(totals.vitA).toLocaleString()} IU/day`]);
  summaryRows.push(['Total Feed Weight', `${totalLbs.toFixed(1)} lbs/day`]);

  // ── Overall verdict
  const criticalCount = flags.filter(f => f.level === 'critical').length;
  const cautionCount  = flags.filter(f => f.level === 'caution').length;

  let verdict, verdictLevel;
  if (criticalCount > 0) {
    verdict = 'Concerns found — review before feeding this combination';
    verdictLevel = 'critical';
  } else if (cautionCount > 0) {
    verdict = 'Mostly compatible — verify the cautions below';
    verdictLevel = 'caution';
  } else if (good.length > 0) {
    verdict = 'This appears to be a compatible ration for your horse';
    verdictLevel = 'ok';
  } else {
    verdict = 'No major conflicts detected — verify with your vet or nutritionist';
    verdictLevel = 'ok';
  }

  return { flags, good, summaryRows, verdict, verdictLevel, totalLbs, parsed };
}

// ── Render ration analysis to HTML
function renderRationAnalysis(result) {
  if (!result) return '';

  const levelStyles = {
    critical: { bg: '#FDF0EE', border: 'rgba(139,46,0,0.35)', color: '#8B2E00', icon: '🚨' },
    caution:  { bg: '#FDF3EE', border: 'rgba(200,130,26,0.3)', color: '#8B4A00', icon: '⚠️' },
    note:     { bg: '#F8F4EE', border: 'rgba(200,182,154,0.35)', color: '#5C3A1A', icon: '◆' },
    ok:       { bg: '#F0F9F4', border: 'rgba(61,122,94,0.25)', color: '#1C3A2F', icon: '✓' },
  };

  const vs = levelStyles[result.verdictLevel] || levelStyles.ok;
  let html = `
    <div style="background:${vs.bg};border:2px solid ${vs.border};border-radius:10px;padding:16px 18px;margin-bottom:16px;">
      <div style="font-weight:700;font-size:1rem;color:${vs.color};margin-bottom:4px;">${vs.icon} ${result.verdict}</div>
      <div style="font-size:0.83rem;color:#5C5C54;">Based on ${result.parsed.length} feed${result.parsed.length > 1 ? 's' : ''}, total ${result.totalLbs.toFixed(1)} lbs/day</div>
    </div>`;

  // Combined nutrient table
  if (result.summaryRows.length > 0) {
    html += `<div style="background:#F8F4EE;border-radius:8px;padding:14px 16px;margin-bottom:14px;">
      <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#2D5C47;margin-bottom:10px;">Combined Ration Estimates</div>`;
    for (const [label, val] of result.summaryRows) {
      html += `<div style="display:flex;justify-content:space-between;font-size:0.85rem;padding:4px 0;border-bottom:1px solid rgba(0,0,0,0.06);">
        <span style="color:#5C5C54;">${label}</span>
        <strong style="color:#1C3A2F;">${val}</strong>
      </div>`;
    }
    html += `</div>`;
  }

  // Flags
  for (const flag of result.flags) {
    const s = levelStyles[flag.level] || levelStyles.note;
    html += `<div style="background:${s.bg};border:1.5px solid ${s.border};border-radius:8px;padding:12px 15px;margin-bottom:10px;">
      <div style="font-weight:700;color:${s.color};margin-bottom:5px;font-size:0.88rem;">${s.icon} ${flag.title}</div>
      <div style="font-size:0.83rem;color:#3D3D38;line-height:1.55;">${flag.detail}</div>
    </div>`;
  }

  // Good notes
  for (const g of result.good) {
    html += `<div style="background:#F0F9F4;border:1px solid rgba(61,122,94,0.2);border-radius:8px;padding:10px 14px;margin-bottom:8px;font-size:0.83rem;color:#1C3A2F;">
      ✓ ${g}
    </div>`;
  }

  html += `<p style="font-size:0.78rem;color:#888;margin-top:12px;line-height:1.5;">Ration analysis is approximate — based on guaranteed analysis values at stated feeding rates. Hay and pasture contributions are not included. Consult a veterinarian or equine nutritionist for horses with medical conditions.</p>`;

  return html;
}

window.analyzeRation    = analyzeRation;
window.renderRationAnalysis = renderRationAnalysis;
window.parseGAFromText  = parseGAFromText;
