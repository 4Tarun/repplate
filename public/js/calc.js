import { ING, MEALS, SLOTS, mealIdFor } from './data-diet.js';

// ---------- dates ----------
const pad = n => String(n).padStart(2, '0');
export const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const weekdayIdx = d => (d.getDay() + 6) % 7; // Mon = 0
export const mondayOf = d => { const x = addDays(d, -weekdayIdx(d)); x.setHours(0, 0, 0, 0); return x; };
export const todayKey = () => dkey(new Date());
export const fmtDate = (d, opts = { weekday: 'short', day: 'numeric', month: 'short' }) => d.toLocaleDateString('en-IN', opts);

// ---------- body + targets ----------
export const ACTIVITY = {
  sedentary: { f: 1.2, label: 'Mostly sitting', hint: 'Desk job, little walking, no exercise' },
  light: { f: 1.375, label: 'Lightly active', hint: 'Desk job + gym 5 days a week' },
  moderate: { f: 1.55, label: 'Moderately active', hint: 'On your feet a lot, or gym 4–5 days' },
  active: { f: 1.725, label: 'Very active', hint: 'Physical job or hard training most days' }
};

export const GOALS = {
  loss: { name: 'Fat loss', blurb: 'Eat a bit less than you burn. Lose fat steadily while keeping muscle.' },
  recomp: { name: 'Recomposition', blurb: 'Eat close to maintenance with high protein. Lose some fat and build muscle together. Works very well for beginners.' },
  gain: { name: 'Muscle gain', blurb: 'Eat a little more than you burn to build muscle faster. Some fat gain is normal.' }
};

export function bmiInfo(heightCm, weightKg) {
  const m = heightCm / 100;
  const bmi = weightKg / (m * m);
  // Asian / Indian cut-offs
  let cat = 'Healthy range';
  if (bmi < 18.5) cat = 'Underweight';
  else if (bmi >= 25) cat = 'Obese range (Asian cut-off)';
  else if (bmi >= 23) cat = 'Overweight range (Asian cut-off)';
  return { bmi: Math.round(bmi * 10) / 10, cat };
}

export function maintenance(p) {
  const s = p.sex === 'female' ? -161 : 5;
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + s;
  return Math.round(bmr * (ACTIVITY[p.activity]?.f || 1.375) / 10) * 10;
}

export function suggestGoal(p) {
  const { bmi } = bmiInfo(p.heightCm, p.weightKg);
  if (bmi >= 25) return { goal: 'loss', why: `Your BMI is ${bmi.toFixed(1)}. Losing some fat first will make the biggest difference to health and looks.` };
  if (bmi >= 23) return { goal: 'recomp', why: `Your BMI is ${bmi.toFixed(1)}, just above the Indian healthy range. As a beginner you can lose fat and build muscle at the same time. If your waist is over ${p.sex === 'female' ? 80 : 90} cm, pick Fat loss instead.` };
  if (bmi >= 20) return { goal: 'recomp', why: `Your BMI is ${bmi.toFixed(1)}, in the healthy range. Recomposition will tone you up without a big diet change.` };
  return { goal: 'gain', why: `Your BMI is ${bmi.toFixed(1)}, on the lean side. Eating a little extra will help you build muscle.` };
}

export function targetsFor(p, goal) {
  const m = maintenance(p);
  const floor = p.sex === 'female' ? 1200 : 1500;
  let cal = m;
  if (goal === 'loss') cal = Math.max(floor, Math.round((m - Math.min(500, m * 0.22)) / 10) * 10);
  if (goal === 'recomp') cal = m - 200;
  if (goal === 'gain') cal = m + 250;
  // ICMR-NIN 2024: needs rise with resistance training but plateau beyond ~1.6 g/kg
  const protein = Math.round((p.weightKg * 1.6) / 5) * 5;
  const water = Math.round((p.weightKg * 35 + 500) / 250) * 250;
  return { cal, protein, water, maintenance: m };
}

// ---------- meal scaling ----------
function roundQty(q, u) {
  if (u === 'pc' || u === 'slice') return Math.max(1, Math.round(q));
  if (q < 20) return Math.max(1, Math.round(q));
  return Math.round(q / 5) * 5;
}

function sums(items, factor = () => 1) {
  let k = 0, p = 0;
  for (const [id, q] of items) { const f = factor(ING[id].g); k += ING[id].k * q * f; p += ING[id].p * q * f; }
  return { k, p };
}

// Returns the day's meals with portions scaled so the day lands near the calorie and protein targets.
export function planForDay(date, profile) {
  const wd = weekdayIdx(date);
  const meals = SLOTS.map(s => ({ slot: s.id, slotName: s.name, id: mealIdFor(profile.diet || 'veg', s.id, wd) }));
  const all = meals.flatMap(m => MEALS[m.id].i);
  const grp = { p: { k: 0, p: 0 }, o: { k: 0, p: 0 }, f: { k: 0, p: 0 } };
  for (const [id, q] of all) { const g = grp[ING[id].g]; g.k += ING[id].k * q; g.p += ING[id].p * q; }
  const Kt = (profile.calTarget || 2000) - grp.f.k;
  const Pt = (profile.proteinTarget || 110) - grp.f.p;
  const det = grp.p.p * grp.o.k - grp.o.p * grp.p.k;
  let fp = det ? (Pt * grp.o.k - grp.o.p * Kt) / det : 1;
  fp = Math.min(1.6, Math.max(0.7, fp));
  let fo = (Kt - fp * grp.p.k) / grp.o.k;
  fo = Math.min(1.6, Math.max(0.5, fo));
  const fac = g => (g === 'p' ? fp : g === 'o' ? fo : 1);
  let K = 0, P = 0;
  const out = meals.map(m => {
    const items = MEALS[m.id].i.map(([id, q]) => [id, roundQty(q * fac(ING[id].g), ING[id].u)]);
    const t = sums(items);
    K += t.k; P += t.p;
    return { ...m, name: MEALS[m.id].n, desc: MEALS[m.id].d || '', items, kcal: Math.round(t.k), protein: Math.round(t.p) };
  });
  return { meals: out, kcal: Math.round(K), protein: Math.round(P) };
}

export function fmtQty(q, u) {
  if (u === 'g') return q >= 1000 ? `${(q / 1000).toFixed(q % 1000 ? 1 : 0)} kg` : `${q} g`;
  if (u === 'ml') return q >= 1000 ? `${(q / 1000).toFixed(q % 1000 ? 1 : 0)} L` : `${q} ml`;
  if (u === 'slice') return `${q} slice${q > 1 ? 's' : ''}`;
  return `${q} pc${q > 1 ? 's' : ''}`;
}

export function groceryForWeek(monday, profile) {
  const tot = {};
  for (let i = 0; i < 7; i++) {
    for (const m of planForDay(addDays(monday, i), profile).meals) {
      for (const [id, q] of m.items) {
        const b = ING[id].buy;
        const key = b ? b[0] : id;
        tot[key] = (tot[key] || 0) + (b ? q * b[1] : q);
      }
    }
  }
  return Object.entries(tot).map(([id, q]) => {
    const u = ING[id].u;
    const nice = u === 'g' || u === 'ml' ? Math.ceil(q / 50) * 50 : Math.ceil(q);
    return { id, name: ING[id].n, cat: ING[id].c, qty: nice, unit: u, text: fmtQty(nice, u) };
  });
}

// Healthy weekly weight-change ranges (% of body weight per week) for each goal
export const RATE = {
  loss: { min: -1.0, max: -0.5, label: 'lose 0.5–1% of body weight a week' },
  recomp: { min: -0.5, max: 0.1, label: 'stay roughly steady (0 to −0.5% a week)' },
  gain: { min: 0.1, max: 0.5, label: 'gain 0.1–0.5% of body weight a week' }
};
