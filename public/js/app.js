import * as store from './store.js';
import { EXERCISES, PLANS, BASICS, LOWER, COMPOUND, VIDEO_Q } from './data-gym.js';
import { ING, TOPUPS, CATEGORY_ORDER } from './data-diet.js';
import * as C from './calc.js';
import { lineChart, barChart } from './charts.js';

const view = document.getElementById('view');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => (v === '' || v == null || isNaN(+v) ? null : +v);
const fmtN = n => Math.round(n).toLocaleString('en-IN');
const SCHEDULE = { fb3: [0, 2, 4], ul4: [0, 1, 3, 4] };
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const now = new Date();
const S = {
  ready: false,
  tab: 'today',
  dietDate: C.todayKey(),
  dietView: 'meals',
  calMonth: new Date(now.getFullYear(), now.getMonth(), 1),
  progEx: null,
  setup: null,
  grocery: {},
  chat: null,
  videoOpen: null,
  videoEdit: null,
  chatBusy: false
};

// ---------- small UI helpers ----------
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200);
}
const ring = (val, target, label, unit, cls) => {
  const r = 34, c = 2 * Math.PI * r, pct = target ? Math.min(1, val / target) : 0;
  const over = target && val > target * 1.05;
  return `<div class="ring ${cls} ${over ? 'over' : ''}">
    <div class="ring-svg"><svg viewBox="0 0 80 80"><circle class="rt" cx="40" cy="40" r="${r}"/><circle class="rf" cx="40" cy="40" r="${r}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - pct)).toFixed(1)}"/></svg>
    <div class="rv"><b class="num">${fmtN(val)}</b><span>of ${fmtN(target)}</span></div></div>
    <div class="rl">${label} <span>${unit}</span></div>
  </div>`;
};

// ---------- gym helpers ----------
const planKey = () => store.profile()?.plan || 'fb3';
const plan = () => PLANS[planKey()];
const sortedKeys = () => Object.keys(store.allDays()).sort();
function doneSets(day) {
  const s = day.workout?.sets || {};
  let n = 0; for (const k in s) n += (s[k] || []).filter(x => x.d).length;
  return n;
}
const isGym = day => doneSets(day) > 0;

function lastSession(ex, beforeKey) {
  const keys = sortedKeys();
  for (let i = keys.length - 1; i >= 0; i--) {
    const k = keys[i]; if (k >= beforeKey) continue;
    const sets = store.getDay(k).workout?.sets?.[ex];
    if (sets && sets.some(s => s.d)) return { k, sets: sets.filter(s => s.d) };
  }
  return null;
}

function workoutDayFor(k) {
  const pk = planKey(), p = PLANS[pk];
  const w = store.getDay(k).workout;
  if (w?.plan === pk && p.days[w.day]) return w.day;
  const keys = sortedKeys().filter(x => x < k).reverse();
  for (const x of keys) {
    const d = store.getDay(x);
    if (isGym(d) && d.workout.plan === pk && p.days[d.workout.day]) {
      return p.order[(p.order.indexOf(d.workout.day) + 1) % p.order.length];
    }
  }
  return p.order[0];
}

function templateSets(k, ex, n) {
  const last = lastSession(ex, k);
  const item = PLANS[planKey()].days[workoutDayFor(k)]?.items.find(x => x[0] === ex);
  const sw = item && last ? suggest(ex, item[2], last, phase(), k).w : null;
  return Array.from({ length: n }, (_, i) => {
    const ls = last?.sets[Math.min(i, last.sets.length - 1)];
    return { w: sw ?? ls?.w ?? '', r: '', d: false };
  });
}
function setsFor(k, ex, n) { return store.getDay(k).workout?.sets?.[ex] || templateSets(k, ex, n); }
function editSets(k, ex, n, fn) {
  const day = workoutDayFor(k), tpl = templateSets(k, ex, n);
  store.editDay(k, d => {
    d.workout ||= { plan: planKey(), day, sets: {} };
    d.workout.sets ||= {};
    d.workout.sets[ex] ||= tpl;
    fn(d.workout.sets[ex]);
  });
}

// ---------- videos ----------
function ytId(url) {
  const m = String(url || '').trim().match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/);
  return m ? m[1] : null;
}
function videoBlock(ex) {
  const vid = store.profile()?.videos?.[ex];
  const search = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(VIDEO_Q[ex] || EXERCISES[ex].name + ' proper form');
  const open = S.videoOpen === ex;
  let player = '';
  if (vid && open) player = `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${vid}?rel=0&playsinline=1&autoplay=1" title="${esc(EXERCISES[ex].name)} video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
  const editing = S.videoEdit === ex;
  return `<div class="vid-row">
    ${vid ? `<button class="btn vid" data-a="vidtoggle" data-ex="${ex}">${open ? '■ Hide video' : '▶ Play my video'}</button>` : ''}
    <a class="btn vid ${vid ? '' : 'primary-vid'}" href="${search}" target="_blank" rel="noopener">▶ ${vid ? 'More videos' : 'Watch how'}</a>
    <button class="link small" data-a="videdit" data-ex="${ex}">${vid ? 'Change' : 'Save a video'}</button>
  </div>
  ${editing ? `<div class="add-row"><input id="vid-in" type="url" inputmode="url" placeholder="Paste YouTube link" value="${vid ? 'https://youtu.be/' + vid : ''}"><button class="btn primary" data-a="vidsave" data-ex="${ex}">Save</button>${vid ? `<button class="btn" data-a="vidremove" data-ex="${ex}">Remove</button>` : ''}</div><p class="muted small">Found a good one? Copy its link from YouTube (Share → Copy link) and paste it here. It will play inside this exercise.</p>` : ''}
  ${player}`;
}

function topReps(reps) { const m = String(reps).match(/(\d+)\D*$/); return m ? +m[1] : 12; }
const r25 = v => Math.round(v / 2.5) * 2.5;

// Training week since the first logged session on this plan (week 1 = first week)
function trainingWeek() {
  const pk = planKey();
  const first = sortedKeys().find(k => { const d = store.getDay(k); return isGym(d) && d.workout.plan === pk; });
  if (!first) return 1;
  return Math.floor((C.mondayOf(new Date()) - C.mondayOf(C.parseKey(first))) / (7 * 86400000)) + 1;
}
function phase() {
  const w = trainingWeek();
  if (w % 8 === 0) return { w, id: 'deload', label: `Week ${w} · Deload`, note: 'Lighter week: about 10% less weight, same sets. Lets joints and muscles recover so you come back stronger.' };
  if (w <= 4) return { w, id: 'learn', label: `Week ${w} · Learn the moves`, note: 'Focus on clean form and control. Weights should feel moderate.' };
  return { w, id: 'build', label: `Week ${w} · Build`, note: 'One extra set on each exercise to keep progressing (about 10+ hard sets per muscle a week).' };
}
const effSets = (n, ph) => (ph.id === 'build' ? Math.min(4, n + 1) : n);

function recentSessions(ex, beforeKey, count) {
  const out = [];
  const keys = sortedKeys();
  for (let i = keys.length - 1; i >= 0 && out.length < count; i--) {
    const k = keys[i]; if (k >= beforeKey) continue;
    const sets = store.getDay(k).workout?.sets?.[ex]?.filter(s => s.d);
    if (sets?.length) out.push({ k, sets });
  }
  return out;
}
// ACSM: add 2–10% once all sets reach the top of the range. Lower body +5%, upper +2.5%, min 2.5 kg.
function suggestion(ex, reps, last, ph, k) { return suggest(ex, reps, last, ph, k).t; }
function suggest(ex, reps, last, ph, k) {
  const R = (t, w = null) => ({ t, w });
  if (!last) return R('');
  const e = EXERCISES[ex], top = topReps(reps);
  const maxW = Math.max(...last.sets.map(s => +s.w || 0));
  if (ph.id === 'deload' && maxW > 0 && e.log === 'weight') return R(`Deload: use about ${r25(maxW * 0.9)} kg`, r25(maxW * 0.9));
  const hitTop = last.sets.every(s => +s.r >= top);
  if (!hitTop) {
    const hist = recentSessions(ex, k, 3);
    if (hist.length === 3 && e.log === 'weight' && maxW > 0) {
      const best = h => Math.max(...h.sets.map(s => (+s.w || 0) * 100 + (+s.r || 0)));
      if (best(hist[0]) <= best(hist[2])) return R(`Stuck 3 sessions: drop to ${r25(maxW * 0.9)} kg and build back up`, r25(maxW * 0.9));
    }
    return R('Same weight, aim for a rep or two more');
  }
  if (e.log === 'time') return R(`Try ${Math.max(...last.sets.map(s => +s.r)) + 5}s`);
  if (e.log === 'assist') return maxW > 0 ? R(`Try ${Math.max(0, maxW - 5)} kg assist`, Math.max(0, maxW - 5)) : R('Unassisted! Add a rep');
  if (e.log === 'reps' && !maxW) return R('Add 2 reps or hold light dumbbells');
  const inc = Math.max(2.5, Math.ceil((maxW * (LOWER.has(ex) ? 0.05 : 0.025)) / 2.5) * 2.5);
  return R(`Try ${maxW + inc} kg (+${inc})`, maxW + inc);
}
const fmtSet = (s, log) => (log === 'time' ? `${s.r}s` : (+s.w ? `${s.w}×${s.r}` : `${s.r} reps`));

function weekCount(mon) {
  let n = 0; for (let i = 0; i < 7; i++) if (isGym(store.getDay(C.dkey(C.addDays(mon, i))))) n++;
  return n;
}
function weekStreak() {
  const target = plan().perWeek;
  let wk = C.mondayOf(new Date()), streak = 0;
  if (weekCount(wk) >= target) streak++;
  wk = C.addDays(wk, -7);
  while (weekCount(wk) >= target && streak < 520) { streak++; wk = C.addDays(wk, -7); }
  return streak;
}

// ---------- weekly calorie check-in ----------
function avgWeight(endDate) {
  const vals = [];
  for (let i = 0; i < 7; i++) { const w = store.getDay(C.dkey(C.addDays(endDate, -i))).weight; if (w) vals.push(+w); }
  return vals.length >= 3 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}
function checkin() {
  const p = store.profile();
  const now = avgWeight(new Date()), prev = avgWeight(C.addDays(new Date(), -7));
  if (now == null || prev == null) return null;
  const pct = ((now - prev) / prev) * 100;
  const r = C.RATE[p.goal] || C.RATE.recomp;
  const adj = pct < r.min ? 150 : pct > r.max ? -150 : 0;
  const due = !p.lastCheckin || C.parseKey(p.lastCheckin) <= C.addDays(new Date(), -7);
  return { now, prev, pct, adj, r, due };
}
function checkinCard() {
  const c = checkin(), p = store.profile();
  if (!c || !c.due) return '';
  const dir = c.pct >= 0 ? '+' : '';
  const msg = c.adj === 0
    ? `Right on track. Goal: ${c.r.label}. Keep your ${fmtN(p.calTarget)} kcal target.`
    : c.adj > 0
      ? `Faster drop / slower gain than your goal (${c.r.label}). Eat a little more: ${fmtN(p.calTarget + c.adj)} kcal.`
      : `Weight is rising faster than your goal (${c.r.label}). Eat a little less: ${fmtN(p.calTarget + c.adj)} kcal.`;
  return `<section class="card checkin">
    <div class="eyebrow">Weekly check-in</div>
    <p class="big-line num">${c.prev.toFixed(1)} → ${c.now.toFixed(1)} kg <small>(${dir}${c.pct.toFixed(1)}% this week, 7-day averages)</small></p>
    <p>${msg}</p>
    <div class="row gap wrap">
      ${c.adj ? `<button class="btn primary" data-a="checkin" data-v="${c.adj}">Update to ${fmtN(p.calTarget + c.adj)} kcal</button>` : ''}
      <button class="btn" data-a="checkin" data-v="0">${c.adj ? 'Keep current' : 'Got it'}</button>
    </div>
  </section>`;
}

// ---------- diet helpers ----------
function dayTotals(k) {
  const d = store.getDay(k);
  let kc = 0, p = 0;
  for (const s of Object.values(d.meals || {})) if (s) { kc += s.k; p += s.p; }
  for (const e of d.extras || []) { kc += +e.k || 0; p += +e.p || 0; }
  return { k: Math.round(kc), p: Math.round(p) };
}
const waterTarget = () => store.profile()?.waterTarget || 3000;

// ================= RENDER =================
function render() {
  const u = store.user(), p = store.profile();
  document.body.classList.toggle('bare', !u || !p || !!S.setup);
  document.body.dataset.tab = S.tab;
  if (!S.ready) { view.innerHTML = '<div class="center muted">Loading…</div>'; return; }
  if (!u) return renderLogin();
  if (!p || S.setup) return renderSetup();
  renderTop();
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === S.tab));
  const fn = { today: renderToday, gym: renderGym, diet: renderDiet, progress: renderProgress, coach: renderCoach, me: renderMe }[S.tab];
  view.innerHTML = fn();
}

function renderTop() {
  const u = store.user();
  const av = document.getElementById('avatar');
  av.innerHTML = u.photo ? `<img src="${esc(u.photo)}" alt="" referrerpolicy="no-referrer">` : esc((u.name || 'U')[0]);
  av.classList.toggle('on', S.tab === 'me');
}

// ---------- login ----------
function renderLogin() {
  view.innerHTML = `
  <section class="login">
    <img class="logo" src="icons/icon-192.png" alt="">
    <h1>RepPlate</h1>
    <p class="lead">Train smart, eat right. Your personal gym and diet coach.</p>
    <ul class="ticks">
      <li>Beginner workouts with how-to notes for every machine</li>
      <li>Indian meal plan with rice bowls, protein and calories</li>
      <li>Weight chart, gym streak and weekly grocery list</li>
    </ul>
    <button class="btn primary big" data-a="signin">${store.isDemo ? 'Try the demo' : '<span class="g">G</span> Continue with Google'}</button>
    <p class="muted small">${store.isDemo ? 'Demo mode: Firebase is not set up yet, so data stays in this browser only.' : 'Your data is private. Only your Google account can read it.'}</p>
  </section>`;
}

// ---------- setup / goal chooser ----------
function newSetup() {
  const p = store.profile();
  return {
    step: 'form',
    v: p ? { heightCm: p.heightCm, weightKg: p.weightKg, age: p.age, sex: p.sex, activity: p.activity, diet: p.diet }
         : { heightCm: 175.3, weightKg: 74, age: '', sex: 'male', activity: 'light', diet: '' }
  };
}
function renderSetup() {
  if (!S.setup) S.setup = newSetup();
  const st = S.setup, v = st.v, editing = !!store.profile();
  if (st.step === 'form') {
    const totalIn = Math.round(v.heightCm / 2.54), ft = Math.floor(totalIn / 12), inch = totalIn % 12;
    const opt = (n, sel) => `<option ${n === sel ? 'selected' : ''}>${n}</option>`;
    view.innerHTML = `
    <section class="setup">
      <div class="eyebrow">Step 1 of 2</div>
      <h1>Let's find your goal</h1>
      <p class="muted">A few details to work out your calories and protein. You can change everything later.</p>
      <div class="card form">
        <label>Height</label>
        <div class="row gap">
          <select data-in="sv" data-f="ft">${[4, 5, 6, 7].map(n => opt(n, ft)).join('')}</select><span class="unit">ft</span>
          <select data-in="sv" data-f="inch">${[...Array(12).keys()].map(n => opt(n, inch)).join('')}</select><span class="unit">in</span>
        </div>
        <div class="row gap2">
          <div class="grow"><label>Weight (kg)</label><input type="number" inputmode="decimal" step="0.1" data-in="sv" data-f="weightKg" value="${esc(v.weightKg)}"></div>
          <div class="grow"><label>Age</label><input type="number" inputmode="numeric" data-in="sv" data-f="age" value="${esc(v.age)}" placeholder="e.g. 27"></div>
        </div>
        <label>Sex <span class="muted small">(used in the calorie formula)</span></label>
        <div class="seg">${['male', 'female'].map(s => `<button class="${v.sex === s ? 'on' : ''}" data-a="sv" data-f="sex" data-v="${s}">${s === 'male' ? 'Male' : 'Female'}</button>`).join('')}</div>
        <label>Activity level</label>
        <div class="choices">${Object.entries(C.ACTIVITY).map(([k, a]) => `
          <button class="choice ${v.activity === k ? 'on' : ''}" data-a="sv" data-f="activity" data-v="${k}"><b>${a.label}</b><span>${a.hint}</span></button>`).join('')}
        </div>
        <label>Food preference</label>
        <div class="seg">${[['veg', 'Veg'], ['egg', 'Veg + eggs'], ['nonveg', 'Non-veg']].map(([k, l]) => `<button class="${v.diet === k ? 'on' : ''}" data-a="sv" data-f="diet" data-v="${k}">${l}</button>`).join('')}</div>
      </div>
      <div class="row gap actions">
        ${editing ? '<button class="btn" data-a="cancelsetup">Cancel</button>' : ''}
        <button class="btn primary grow" data-a="suggest">Suggest my goal</button>
      </div>
    </section>`;
    return;
  }
  const p = { ...v };
  const b = C.bmiInfo(p.heightCm, p.weightKg);
  const sug = C.suggestGoal(p);
  st.goal ||= sug.goal;
  st.t ||= C.targetsFor(p, st.goal);
  view.innerHTML = `
  <section class="setup">
    <div class="eyebrow">Step 2 of 2</div>
    <h1>Pick your goal</h1>
    <div class="card stats3">
      <div><span class="muted small">BMI</span><b class="num">${b.bmi}</b><span class="small">${b.cat}</span></div>
      <div><span class="muted small">Maintenance</span><b class="num">${fmtN(C.maintenance(p))}</b><span class="small">kcal / day</span></div>
    </div>
    <div class="card note-card"><b>Suggested: ${C.GOALS[sug.goal].name}</b><p>${esc(sug.why)}</p></div>
    <div class="choices">${Object.entries(C.GOALS).map(([k, g]) => {
      const t = C.targetsFor(p, k);
      return `<button class="choice goal ${st.goal === k ? 'on' : ''}" data-a="pickgoal" data-v="${k}">
        <b>${g.name}${k === sug.goal ? ' <em class="badge">Suggested</em>' : ''}</b>
        <span>${g.blurb}</span>
        <span class="num small">${fmtN(t.cal)} kcal · ${t.protein} g protein</span>
      </button>`;
    }).join('')}</div>
    <div class="card form">
      <div class="eyebrow">Your daily targets (edit if you like)</div>
      <div class="row gap2">
        <div class="grow"><label>Calories</label><input type="number" inputmode="numeric" data-in="st" data-f="cal" value="${st.t.cal}"></div>
        <div class="grow"><label>Protein (g)</label><input type="number" inputmode="numeric" data-in="st" data-f="protein" value="${st.t.protein}"></div>
        <div class="grow"><label>Water (ml)</label><input type="number" inputmode="numeric" step="250" data-in="st" data-f="water" value="${st.t.water}"></div>
      </div>
    </div>
    <div class="row gap actions">
      <button class="btn" data-a="setupback">Back</button>
      <button class="btn primary grow" data-a="finishsetup">${editing ? 'Save' : 'Start'}</button>
    </div>
  </section>`;
}

// ---------- today ----------
function renderToday() {
  const k = C.todayKey(), d = store.getDay(k), p = store.profile(), pl = plan();
  const hr = new Date().getHours();
  const hi = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const first = (store.user().name || '').split(' ')[0];
  const wd = C.weekdayIdx(new Date());
  const dayId = workoutDayFor(k), wday = pl.days[dayId];
  const n = doneSets(d);
  const suggested = SCHEDULE[planKey()].includes(wd);
  let workout;
  if (n) workout = `<p class="big-line">✓ ${esc(wday.title)} logged · ${n} sets</p><button class="btn" data-a="tab" data-v="gym">View workout</button>`;
  else if (suggested) workout = `<p class="big-line">${esc(wday.title)} · ${wday.items.length} exercises</p><button class="btn primary" data-a="tab" data-v="gym">Start workout</button>`;
  else workout = `<p class="big-line">Rest day</p><p class="muted">A 20–30 minute walk helps recovery. Next up: ${esc(wday.title)}.</p><button class="btn" data-a="tab" data-v="gym">Train anyway</button>`;

  const plan4 = C.planForDay(new Date(), p);
  const next = plan4.meals.find(m => !d.meals?.[m.slot]);
  const tot = dayTotals(k);
  const water = d.water || 0;
  const mon = C.mondayOf(new Date());
  const week = DOW.map((l, i) => {
    const dk = C.dkey(C.addDays(mon, i));
    return `<span class="dow ${isGym(store.getDay(dk)) ? 'gym' : ''} ${dk === k ? 'today' : ''}">${l}</span>`;
  }).join('');
  return `
  <h1 class="page-title">${hi}${first ? ', ' + esc(first) : ''}</h1>
  <p class="muted sub">${C.fmtDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}</p>
  ${checkinCard()}
  <div class="grid2">
    <section class="card hero"><div class="eyebrow">Workout</div>${workout}</section>
    <section class="card">
      <div class="eyebrow diet-eb">Food today</div>
      <div class="rings">${ring(tot.k, p.calTarget, 'Calories', 'kcal', 'kcal')}${ring(tot.p, p.proteinTarget, 'Protein', 'g', 'pro')}</div>
      ${next ? `<div class="next-meal"><div><span class="muted small">${next.slotName}</span><b>${esc(next.name)}</b></div><button class="tick" data-a="tick" data-k="${k}" data-slot="${next.slot}" aria-label="Mark eaten">✓</button></div>` : '<p class="muted">All meals ticked today 🎉</p>'}
    </section>
    <section class="card">
      <div class="eyebrow water-eb">Water</div>
      <div class="water-row"><span class="num big-line">${(water / 1000).toFixed(2)} <small>/ ${(waterTarget() / 1000).toFixed(2)} L</small></span>
      <button class="btn primary" data-a="water" data-k="${k}" data-v="250">+ 250 ml</button></div>
      <div class="meter-track"><div class="meter-fill water" style="width:${Math.min(100, (water / waterTarget()) * 100)}%"></div></div>
    </section>
    <section class="card">
      <div class="eyebrow">This week</div>
      <div class="week">${week}</div>
      <p class="muted small">${weekCount(mon)} of ${pl.perWeek} gym days · ${weekStreak()}-week streak</p>
    </section>
  </div>`;
}

// ---------- gym ----------
function renderGym() {
  const k = C.todayKey(), pk = planKey(), pl = plan();
  const dayId = workoutDayFor(k), wd = pl.days[dayId];
  const ph = phase();
  const exCards = wd.items.map(([ex, n0, reps], idx) => {
    const e = EXERCISES[ex];
    const n = effSets(n0, ph);
    const sets = setsFor(k, ex, n);
    const last = lastSession(ex, k);
    const sug = suggestion(ex, reps, last, ph, k);
    const workW = +sets[0]?.w || 0;
    const warm = idx === 0 && COMPOUND.has(ex) && workW >= 10
      ? `<div class="warm">Warm-up first: 8 reps at ${r25(workW * 0.5)} kg, then 4 reps at ${r25(workW * 0.7)} kg. Don't log these.</div>` : '';
    const unitW = e.log === 'assist' ? 'assist kg' : 'kg';
    const unitR = e.log === 'time' ? 'sec' : 'reps';
    const showW = e.log !== 'time';
    const rows = sets.map((s, i) => `
      <div class="set-row ${s.d ? 'done' : ''}">
        <span class="set-no">${i + 1}</span>
        ${showW ? `<input type="number" inputmode="decimal" step="0.5" placeholder="${e.log === 'reps' ? '—' : '0'}" value="${esc(s.w)}" data-in="set" data-ex="${ex}" data-n="${n}" data-i="${i}" data-f="w">` : '<span class="muted center">—</span>'}
        <input type="number" inputmode="numeric" placeholder="${esc(last?.sets[i]?.r || topReps(reps))}" value="${esc(s.r)}" data-in="set" data-ex="${ex}" data-n="${n}" data-i="${i}" data-f="r">
        <button class="tick ${s.d ? 'on' : ''}" data-a="settick" data-ex="${ex}" data-n="${n}" data-i="${i}" aria-label="Set done">✓</button>
      </div>`).join('');
    return `
    <article class="card ex">
      <div class="ex-head">
        <div><h3>${esc(e.name)}</h3><div class="muted small">${esc(e.kind)} · ${esc(e.muscles)}</div></div>
        <div class="target num">${n} × ${esc(reps)}</div>
      </div>
      ${last ? `<div class="last"><span>Last (${C.fmtDate(C.parseKey(last.k), { day: 'numeric', month: 'short' })}): ${last.sets.map(s => fmtSet(s, e.log)).join(', ')}</span>${sug ? `<b>${esc(sug)}</b>` : ''}</div>` : ''}
      ${warm}
      ${videoBlock(ex)}
      <details class="how"><summary>How to do it</summary>
        <ol>${e.how.map(h => `<li>${esc(h)}</li>`).join('')}</ol>
        <p><b>Avoid:</b> ${esc(e.avoid)}</p><p><b>Start with:</b> ${esc(e.start)}</p>
      </details>
      <div class="sets">
        <div class="set-row head"><span>Set</span><span>${showW ? unitW : ''}</span><span>${unitR}</span><span></span></div>
        ${rows}
      </div>
      <div class="row between">
        <button class="link" data-a="addset" data-ex="${ex}" data-n="${n}">+ Add set</button>
        ${sets.length > 1 ? `<button class="link muted" data-a="delset" data-ex="${ex}" data-n="${n}">Remove last set</button>` : ''}
      </div>
    </article>`;
  }).join('');
  return `
  <section class="card hero">
    <div class="row between wrap">
      <div><div class="eyebrow">${esc(pl.short)} · ${esc(ph.label)}</div><h1 class="page-title">${esc(wd.title)}</h1></div>
      <div class="seg small-seg">${pl.order.map(id => `<button class="${id === dayId ? 'on' : ''}" data-a="gymday" data-v="${id}">${id}</button>`).join('')}</div>
    </div>
    <p class="phase-note">${esc(ph.note)}</p>
    <p class="muted small">Suggested days: ${pl.suggested}. Missed one? Just do the next workout in order. ${doneSets(store.getDay(k))} set${doneSets(store.getDay(k)) === 1 ? "" : "s"} done today.</p>
    <details class="how"><summary>Gym basics for beginners</summary><ul>${BASICS.map(b => `<li>${esc(b)}</li>`).join('')}</ul></details>
  </section>
  <div class="grid2">${exCards}</div>`;
}

// ---------- diet ----------
function renderDiet() {
  const seg = `<div class="seg">${[['meals', 'Meals'], ['grocery', 'Grocery list']].map(([v, l]) => `<button class="${S.dietView === v ? 'on' : ''}" data-a="dietview" data-v="${v}">${l}</button>`).join('')}</div>`;
  return seg + (S.dietView === 'meals' ? dietMeals() : dietGrocery());
}

function dietMeals() {
  const k = S.dietDate, date = C.parseKey(k), p = store.profile(), d = store.getDay(k);
  const pl = C.planForDay(date, p);
  const tot = dayTotals(k);
  const water = d.water || 0, wt = waterTarget();
  const glasses = Math.ceil(wt / 250);
  const isToday = k === C.todayKey();
  const meals = pl.meals.map(m => {
    const done = !!d.meals?.[m.slot];
    return `<article class="card meal ${done ? 'done' : ''}">
      <div class="meal-head"><span class="eyebrow">${m.slotName}</span>
        <button class="tick ${done ? 'on' : ''}" data-a="tick" data-k="${k}" data-slot="${m.slot}" aria-label="Mark eaten">✓</button></div>
      <h3>${esc(m.name)}</h3>
      ${m.desc ? `<p class="muted small">${esc(m.desc)}</p>` : ''}
      <ul class="items">${m.items.map(([id, q]) => `<li><span>${esc(ING[id].n)}</span><span class="num">${C.fmtQty(q, ING[id].u)}</span></li>`).join('')}</ul>
      <div class="macro num">${fmtN(m.kcal)} kcal · ${m.protein} g protein</div>
    </article>`;
  }).join('');
  const gap = p.proteinTarget - pl.protein;
  const tops = TOPUPS[p.diet || 'veg'];
  const extras = (d.extras || []).map((e, i) => `<li><span>${esc(e.n)}</span><span class="num">${fmtN(+e.k || 0)} kcal · ${+e.p || 0} g</span><button class="x" data-a="delextra" data-k="${k}" data-i="${i}" aria-label="Remove">×</button></li>`).join('');
  return `
  <div class="date-nav">
    <button class="icon-btn" data-a="dietday" data-v="-1" aria-label="Previous day">‹</button>
    <div><b>${C.fmtDate(date, { weekday: 'long', day: 'numeric', month: 'short' })}</b>${isToday ? '' : ' <button class="link" data-a="diettoday">Today</button>'}</div>
    <button class="icon-btn" data-a="dietday" data-v="1" aria-label="Next day">›</button>
  </div>
  <div class="grid2">
    <section class="card">
      <div class="eyebrow">Eaten so far</div>
      <div class="rings">${ring(tot.k, p.calTarget, 'Calories', 'kcal', 'kcal')}${ring(tot.p, p.proteinTarget, 'Protein', 'g', 'pro')}</div>
      <p class="muted small">Tick a meal when you eat it. Plan for the day: ${fmtN(pl.kcal)} kcal · ${pl.protein} g protein.</p>
    </section>
    <section class="card">
      <div class="eyebrow water-eb">Water</div>
      <div class="water-row">
        <button class="icon-btn" data-a="water" data-k="${k}" data-v="-250" aria-label="Less water">−</button>
        <span class="num big-line">${(water / 1000).toFixed(2)} <small>/ ${(wt / 1000).toFixed(2)} L</small></span>
        <button class="icon-btn primary" data-a="water" data-k="${k}" data-v="250" aria-label="More water">+</button>
      </div>
      <div class="glasses">${Array.from({ length: glasses }, (_, i) => `<span class="glass ${i < water / 250 ? 'on' : ''}"></span>`).join('')}</div>
      <p class="muted small center">1 glass = 250 ml</p>
    </section>
  </div>
  <div class="grid2">${meals}</div>
  ${gap >= 8 ? `<section class="card note-card">
    <b>Protein top-up: about ${gap} g short</b>
    <p class="small">The plan can't fully reach your protein target with regular food portions. Add one of these (tap to log it):</p>
    <div class="chips">${tops.map((t, i) => `<button class="chip" data-a="topup" data-k="${k}" data-i="${i}">${esc(t.n)} <span class="muted">+${t.p} g</span></button>`).join('')}</div>
  </section>` : ''}
  <section class="card">
    <div class="eyebrow">Other food eaten</div>
    ${extras ? `<ul class="items extras">${extras}</ul>` : '<p class="muted small">Ate something off-plan? Add it here so the totals stay honest.</p>'}
    <div class="add-row">
      <input id="ex-n" placeholder="Food (e.g. 2 samosas)">
      <input id="ex-k" type="number" inputmode="numeric" placeholder="kcal">
      <input id="ex-p" type="number" inputmode="numeric" placeholder="protein g">
      <button class="btn primary" data-a="addextra" data-k="${k}">Add</button>
    </div>
  </section>`;
}

function dietGrocery() {
  const mon = C.mondayOf(C.parseKey(S.dietDate)), mk = C.dkey(mon);
  const key = 'grocery-' + mk;
  if (!(key in S.grocery)) {
    S.grocery[key] = null;
    store.getMeta(key).then(m => { S.grocery[key] = m || {}; render(); }).catch(() => { S.grocery[key] = {}; render(); });
  }
  const checked = S.grocery[key]?.checked || {};
  const list = C.groceryForWeek(mon, store.profile());
  const groups = CATEGORY_ORDER.map(cat => {
    const items = list.filter(i => i.cat === cat);
    if (!items.length) return '';
    return `<section class="card"><div class="eyebrow">${cat}</div><ul class="grocery">${items.map(i => `
      <li class="${checked[i.id] ? 'got' : ''}"><label><input type="checkbox" data-in="groc" data-key="${key}" data-id="${i.id}" ${checked[i.id] ? 'checked' : ''}><span>${esc(i.name)}</span></label><span class="num">${i.text}</span></li>`).join('')}</ul></section>`;
  }).join('');
  const sun = C.addDays(mon, 6);
  return `
  <div class="date-nav">
    <button class="icon-btn" data-a="dietday" data-v="-7" aria-label="Previous week">‹</button>
    <div><b>Week of ${C.fmtDate(mon, { day: 'numeric', month: 'short' })} – ${C.fmtDate(sun, { day: 'numeric', month: 'short' })}</b></div>
    <button class="icon-btn" data-a="dietday" data-v="7" aria-label="Next week">›</button>
  </div>
  <p class="muted small">Everything for this week's meal plan at your calorie target. Salt, spices, ginger-garlic and tea/coffee not included. Tick items as you buy them.</p>
  <div class="row gap"><button class="btn" data-a="copygroc" data-key="${key}">Share / copy list</button></div>
  <div class="grid2">${groups}</div>`;
}

// ---------- progress ----------
function renderProgress() {
  const keys = sortedKeys();
  const p = store.profile();
  // body weight
  const cutoff = C.dkey(C.addDays(new Date(), -120));
  const wEntries = keys.filter(k => store.getDay(k).weight && k >= cutoff).map(k => [C.parseKey(k).getTime(), +store.getDay(k).weight]);
  const avg = wEntries.map(([x]) => {
    const win = wEntries.filter(([x2]) => x2 <= x && x2 > x - 7 * 86400000);
    return [x, win.reduce((a, b) => a + b[1], 0) / win.length];
  });
  const latest = wEntries.at(-1)?.[1];
  const firstW = wEntries[0]?.[1];
  const todayW = store.getDay(C.todayKey()).weight;
  const wChart = lineChart([{ pts: wEntries, cls: 'dots' }, { pts: avg, cls: 'avg' }], {
    yFmt: v => v.toFixed(1), xFmt: x => C.fmtDate(new Date(x), { day: 'numeric', month: 'short' }), empty: 'Log your weight to see the chart'
  });
  const drift = latest && Math.abs(latest - p.weightKg) >= 2;

  // calendar
  const m = S.calMonth, y = m.getFullYear(), mo = m.getMonth();
  const first = new Date(y, mo, 1), last = new Date(y, mo + 1, 0);
  const start = C.addDays(first, -C.weekdayIdx(first)), end = C.addDays(last, 6 - C.weekdayIdx(last));
  const tk = C.todayKey();
  let cells = '', monthGym = 0;
  for (let d = start; d <= end; d = C.addDays(d, 1)) {
    const k = C.dkey(d), inM = d.getMonth() === mo, g = isGym(store.getDay(k));
    if (g && inM) monthGym++;
    cells += `<span class="cal-cell ${inM ? '' : 'out'} ${g ? 'gym' : ''} ${k === tk ? 'today' : ''} ${k > tk ? 'future' : ''}">${d.getDate()}</span>`;
  }
  const totalSessions = keys.filter(k => isGym(store.getDay(k))).length;

  // exercise progress
  const logged = Object.keys(EXERCISES).filter(ex => keys.some(k => store.getDay(k).workout?.sets?.[ex]?.some(s => s.d)));
  if (!S.progEx || !logged.includes(S.progEx)) S.progEx = logged[0] || null;
  let exBlock = '<div class="chart-empty">Log a workout to see your lifts here</div>';
  if (S.progEx) {
    const e = EXERCISES[S.progEx];
    const metric = s => (e.log === 'time' ? +s.r : e.log === 'reps' && !+s.w ? +s.r : +s.w);
    const weekly = {};
    const sessions = [];
    for (const k of keys) {
      const sets = store.getDay(k).workout?.sets?.[S.progEx]?.filter(s => s.d);
      if (!sets?.length) continue;
      sessions.push([k, sets]);
      const wk = C.dkey(C.mondayOf(C.parseKey(k)));
      const best = Math.max(...sets.map(metric));
      weekly[wk] = e.log === 'assist' ? Math.min(weekly[wk] ?? Infinity, best) : Math.max(weekly[wk] ?? -Infinity, best);
    }
    const pts = Object.entries(weekly).map(([wk, v]) => [C.parseKey(wk).getTime(), v]);
    const unit = e.log === 'time' ? 's' : e.log === 'reps' && pts.every(pp => pp[1] > 5) && sessions.every(([, ss]) => ss.every(s => !+s.w)) ? ' reps' : ' kg';
    exBlock = `
      <select data-in="progex">${logged.map(ex => `<option value="${ex}" ${ex === S.progEx ? 'selected' : ''}>${esc(EXERCISES[ex].name)}</option>`).join('')}</select>
      <p class="muted small">${e.log === 'assist' ? 'Lowest assist weight per week (lower = stronger).' : 'Best set per week.'}</p>
      ${lineChart([{ pts, cls: 'line' }], { yFmt: v => Math.round(v) + unit, xFmt: x => C.fmtDate(new Date(x), { day: 'numeric', month: 'short' }) })}
      <ul class="items">${sessions.slice(-5).reverse().map(([k, ss]) => `<li><span>${C.fmtDate(C.parseKey(k))}</span><span class="num">${ss.map(s => fmtSet(s, e.log)).join(', ')}</span></li>`).join('')}</ul>`;
  }
  // weekly volume, last 8 weeks
  const mon = C.mondayOf(new Date());
  const vLabels = [], vVals = [];
  for (let i = 7; i >= 0; i--) {
    const wk = C.addDays(mon, -7 * i);
    let v = 0;
    for (let j = 0; j < 7; j++) {
      const sets = store.getDay(C.dkey(C.addDays(wk, j))).workout?.sets || {};
      for (const ex in sets) if (EXERCISES[ex]?.log === 'weight') for (const s of sets[ex]) if (s.d) v += (+s.w || 0) * (+s.r || 0);
    }
    vLabels.push(C.fmtDate(wk, { day: 'numeric', month: 'short' })); vVals.push(v);
  }

  return `
  <h1 class="page-title">Progress</h1>
  <div class="grid2">
    <section class="card">
      <div class="eyebrow">Body weight</div>
      <div class="stats3">
        <div><span class="muted small">Latest</span><b class="num">${latest ? latest.toFixed(1) : '–'}</b><span class="small">kg</span></div>
        <div><span class="muted small">Change</span><b class="num">${latest && firstW ? (latest - firstW > 0 ? '+' : '') + (latest - firstW).toFixed(1) : '–'}</b><span class="small">kg in chart</span></div>
      </div>
      ${wChart}
      <p class="muted small">Dots = daily weigh-ins, line = 7-day average. Weigh in the morning before eating. Log 3+ times a week to unlock the weekly calorie check-in on Today.</p>
      <div class="add-row">
        <input id="wt-in" type="number" inputmode="decimal" step="0.1" placeholder="kg" value="${esc(todayW || latest || p.weightKg)}">
        <button class="btn primary" data-a="saveweight">${todayW ? 'Update today' : 'Log today'}</button>
      </div>
      ${drift ? `<p class="note-inline">Your weight has moved 2+ kg since you set your targets. <button class="link" data-a="redo">Recalculate targets</button></p>` : ''}
    </section>
    <section class="card">
      <div class="row between"><div class="eyebrow">Gym days</div>
        <div class="row"><button class="icon-btn" data-a="cal" data-v="-1" aria-label="Previous month">‹</button><b class="cal-title">${C.fmtDate(m, { month: 'long', year: 'numeric' })}</b><button class="icon-btn" data-a="cal" data-v="1" aria-label="Next month">›</button></div></div>
      <div class="cal">${DOW.map(d => `<span class="cal-h">${d}</span>`).join('')}${cells}</div>
      <div class="stats3">
        <div><span class="muted small">This month</span><b class="num">${monthGym}</b><span class="small">gym days</span></div>
        <div><span class="muted small">Streak</span><b class="num">${weekStreak()}</b><span class="small">weeks at ${plan().perWeek}+ days</span></div>
        <div><span class="muted small">All time</span><b class="num">${totalSessions}</b><span class="small">sessions</span></div>
      </div>
    </section>
    <section class="card">
      <div class="eyebrow">Lifts</div>
      ${exBlock}
    </section>
    <section class="card">
      <div class="eyebrow">Weekly volume (kg × reps)</div>
      ${barChart(vLabels, vVals, { yFmt: v => (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : Math.round(v)), empty: 'Your weekly training volume will show here' })}
      <p class="muted small">Total weight moved each week. A slow rise means you're getting stronger.</p>
    </section>
  </div>`;
}

// ---------- me ----------
function renderMe() {
  const u = store.user(), p = store.profile();
  const theme = localStorage.getItem('rp-theme') || 'auto';
  const totalIn = Math.round(p.heightCm / 2.54);
  return `
  <h1 class="page-title">Me</h1>
  <div class="grid2">
    <section class="card">
      <div class="user-row">
        <div class="avatar lg">${u.photo ? `<img src="${esc(u.photo)}" alt="" referrerpolicy="no-referrer">` : esc((u.name || 'U')[0])}</div>
        <div><b>${esc(u.name)}</b><div class="muted small">${esc(u.email)}</div></div>
      </div>
      <p class="muted small">${store.isDemo ? 'Demo mode: data is saved in this browser only. Add your Firebase config to sync privately with your Google account.' : 'Your data is stored under your Google account and locked so only you can read or change it.'}</p>
      <div class="row gap wrap">
        <button class="btn" data-a="export">Download my data</button>
        <button class="btn" data-a="signout">Sign out</button>
      </div>
    </section>
    <section class="card form">
      <div class="eyebrow">Daily targets · ${esc(C.GOALS[p.goal]?.name || '')}</div>
      <div class="row gap2">
        <div class="grow"><label>Calories</label><input id="t-cal" type="number" inputmode="numeric" value="${p.calTarget}"></div>
        <div class="grow"><label>Protein (g)</label><input id="t-pro" type="number" inputmode="numeric" value="${p.proteinTarget}"></div>
        <div class="grow"><label>Water (ml)</label><input id="t-wat" type="number" inputmode="numeric" step="250" value="${p.waterTarget}"></div>
      </div>
      <div class="row gap wrap"><button class="btn primary" data-a="savetargets">Save targets</button><button class="btn" data-a="redo">Redo goal setup</button></div>
      <p class="muted small">${Math.floor(totalIn / 12)}'${totalIn % 12}" · ${p.weightKg} kg · ${p.age} yrs · ${esc(C.ACTIVITY[p.activity]?.label)} · ${{ veg: 'Veg', egg: 'Veg + eggs', nonveg: 'Non-veg' }[p.diet]}</p>
    </section>
    <section class="card">
      <div class="eyebrow">Workout plan</div>
      <div class="choices">${Object.entries(PLANS).map(([k, pl]) => `<button class="choice ${planKey() === k ? 'on' : ''}" data-a="setplan" data-v="${k}"><b>${esc(pl.name)}</b><span>${pl.order.map(o => pl.days[o].title).join(' · ')}</span></button>`).join('')}</div>
    </section>
    <section class="card">
      <div class="eyebrow">Appearance</div>
      <div class="seg">${['auto', 'light', 'dark'].map(t => `<button class="${theme === t ? 'on' : ''}" data-a="theme" data-v="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div>
      <p class="muted small">Food values are approximate. This app gives general guidance, not medical advice.</p>
    </section>
  </div>`;
}

// ---------- coach ----------
const QUICK = [
  "Explain today's workout simply",
  'Swap one meal today, same calories',
  'Am I on track this week?',
  'Leg press hurts my knee. What should I change?'
];
function md(t) {
  const inline = x => esc(x).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  let html = '', list = null;
  for (const line of String(t).split('\n')) {
    const m = line.match(/^\s*(?:[-*•]|(\d+)[.)])\s+(.*)$/);
    if (m) {
      const type = m[1] ? 'ol' : 'ul';
      if (list !== type) { if (list) html += `</${list}>`; html += `<${type}>`; list = type; }
      html += `<li>${inline(m[2])}</li>`;
    } else {
      if (list) { html += `</${list}>`; list = null; }
      if (line.trim()) html += `<p>${inline(line)}</p>`;
    }
  }
  return html + (list ? `</${list}>` : '');
}
function coachContext() {
  const p = store.profile(), k = C.todayKey(), pl = plan(), ph = phase();
  const dayId = workoutDayFor(k), wd = pl.days[dayId], d = store.getDay(k);
  const inch = Math.round(p.heightCm / 2.54);
  const lines = [];
  lines.push(`USER: ${inch / 12 | 0}'${inch % 12}" (${p.heightCm} cm), ${p.weightKg} kg at setup, age ${p.age}, ${p.sex}, activity: ${C.ACTIVITY[p.activity]?.hint}. Food: ${{ veg: 'vegetarian', egg: 'vegetarian + eggs', nonveg: 'non-vegetarian' }[p.diet]}. Likes rice-bowl style lunch and dinner. Beginner, new to gym machines.`);
  lines.push(`GOAL: ${C.GOALS[p.goal]?.name}. Targets: ${p.calTarget} kcal, ${p.proteinTarget} g protein, ${p.waterTarget} ml water per day.`);
  lines.push(`TODAY: ${C.fmtDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}. Plan: ${pl.name}, ${ph.label}. Next workout: ${wd.title}: ` +
    wd.items.map(([ex, n, reps]) => { const l = lastSession(ex, k); return `${EXERCISES[ex].name} ${effSets(n, ph)}x${reps}${l ? ` (last: ${l.sets.map(s => fmtSet(s, EXERCISES[ex].log)).join(', ')})` : ''}`; }).join('; ') + '.');
  lines.push(`Sets logged today: ${doneSets(d)}.`);
  const mp = C.planForDay(new Date(), p);
  lines.push(`TODAY'S MEALS: ` + mp.meals.map(m => `${m.slotName}: ${m.name} (${m.kcal} kcal, ${m.protein} g P)${d.meals?.[m.slot] ? ' [eaten]' : ''}`).join('; ') + '.');
  const t = dayTotals(k);
  lines.push(`Eaten so far: ${t.k} kcal, ${t.p} g protein. Water ${d.water || 0} ml.` + ((d.extras || []).length ? ` Extras: ${d.extras.map(e => `${e.n} ${e.k} kcal`).join(', ')}.` : ''));
  const ws = [];
  for (let i = 13; i >= 0; i--) { const dk = C.dkey(C.addDays(new Date(), -i)); const w = store.getDay(dk).weight; if (w) ws.push(`${dk.slice(5)}: ${w}`); }
  lines.push(`WEIGHT last 14 days (kg): ${ws.join(', ') || 'none logged'}.`);
  const c = checkin();
  if (c) lines.push(`Weekly trend: ${c.prev.toFixed(1)} -> ${c.now.toFixed(1)} kg (${c.pct.toFixed(2)}%/week). Goal range: ${c.r.label}.`);
  lines.push(`Gym days this week: ${weekCount(C.mondayOf(new Date()))} of ${pl.perWeek}. Week streak: ${weekStreak()}.`);
  return `You are RepPlate Coach: a friendly personal trainer and Indian nutrition coach for ONE user.
Rules:
- Base training advice on ACSM resistance-training guidance (novice: 2-3 days/week, 8-12 reps, controlled tempo, add 2-10% when all reps are done with good form).
- Base nutrition on ICMR-NIN Dietary Guidelines for Indians (2024): protein from food (dal, legumes, dairy, eggs, meat), do not push protein powders or supplements, keep oil, salt and sugar moderate, plenty of vegetables.
- Suggest Indian home foods that fit the user's food preference. When swapping a meal, give approximate kcal and protein and keep the day close to the targets.
- Be short and practical: under 150 words, numbered steps for instructions, units in kg, g, kcal.
- Use only the data below. If something is missing, say so. Don't invent past logs.
- You are not a doctor. For sharp or joint pain, chest pain, dizziness, injury, or any medical condition or medication, tell the user to stop that exercise and see a doctor or physiotherapist. Don't diagnose.

USER DATA
${lines.join('\n')}`;
}
function renderCoach() {
  if (S.chat === null) {
    S.chat = [];
    store.getMeta('coach').then(m => { S.chat = m?.msgs || []; if (S.tab === 'coach') render(); }).catch(() => {});
  }
  const ready = store.coachReady();
  const msgs = S.chat.map(m => `<div class="msg ${m.role}"><div class="bubble">${m.role === 'model' ? (m.text ? md(m.text) : '<span class="dots"><i></i><i></i><i></i></span>') : esc(m.text)}</div></div>`).join('');
  return `
  <h1 class="page-title">Coach</h1>
  <p class="muted sub small">Answers using your plan, targets and logs. AI can be wrong. For pain or medical questions, see a doctor or physio.</p>
  ${ready ? '' : `<section class="card note-card"><b>${store.isDemo ? 'Coach works after Firebase setup' : 'One more setup step'}</b><p class="small">${store.isDemo ? 'Add your Firebase config, turn on AI Logic and App Check (see README), then the coach can answer.' : 'Add your App Check reCAPTCHA Enterprise site key in firebase-config.js and turn on AI Logic in the Firebase console (see README).'}</p></section>`}
  <section class="chat" id="chat">${msgs || `<div class="chat-empty"><b>Ask me anything about your training or food.</b><span class="muted small">I can see today's workout, meals, your targets and the last 2 weeks of logs.</span></div>`}</section>
  <div class="composer">
    <div class="quick">${QUICK.map(q => `<button class="chip" data-a="coachq" ${S.chatBusy || !ready ? 'disabled' : ''}>${esc(q)}</button>`).join('')}</div>
    <div class="chat-input">
      <textarea id="coach-in" rows="1" placeholder="Ask your coach…" ${ready ? '' : 'disabled'}></textarea>
      <button class="btn primary" data-a="coachsend" ${S.chatBusy || !ready ? 'disabled' : ''} aria-label="Send">Send</button>
    </div>
  </div>
  ${S.chat.length ? '<button class="link muted small" data-a="coachclear">Clear chat</button>' : ''}`;
}
async function askCoach(text) {
  text = text.trim();
  if (!text || S.chatBusy) return;
  S.chatBusy = true;
  const history = S.chat.slice(-20).filter(m => m.text).map(m => ({ role: m.role, parts: [{ text: m.text }] }));
  S.chat.push({ role: 'user', text }, { role: 'model', text: '' });
  render();
  const scroll = () => { const c = document.getElementById('chat'); c?.lastElementChild?.scrollIntoView({ block: 'end', behavior: 'smooth' }); };
  scroll();
  const out = S.chat[S.chat.length - 1];
  try {
    const model = await store.coachModel(coachContext());
    const chat = model.startChat({ history });
    const res = await chat.sendMessageStream(text);
    for await (const chunk of res.stream) {
      out.text += chunk.text();
      const b = document.querySelector('#chat .msg:last-child .bubble');
      if (b) b.innerHTML = md(out.text);
    }
    if (!out.text) out.text = "Sorry, I couldn't answer that. Try asking another way.";
  } catch (e) {
    console.error(e);
    const m = String(e?.message || e);
    out.text = e?.code === 'demo' || e?.code === 'no-appcheck' ? 'The coach needs the Firebase AI Logic and App Check setup first (see README).'
      : /app.?check|attestation|403|permission/i.test(m) ? 'App Check blocked the request. Check the App Check setup in the README.'
      : /quota|429|rate/i.test(m) ? "I've hit today's free usage limit. Try again later."
      : !navigator.onLine ? "You're offline. The coach needs internet."
      : 'Something went wrong reaching the coach. Try again in a minute.';
  }
  S.chatBusy = false;
  store.setMeta('coach', { msgs: S.chat.slice(-40) }).catch(() => {});
  render(); scroll();
}

// ================= EVENTS =================
const actions = {
  async signin() {
    try { await store.signIn(); if (store.isDemo) render(); }
    catch (e) { if (e?.code !== 'auth/popup-closed-by-user') toast('Sign-in failed. Try again.'); console.error(e); }
  },
  signout: () => store.signOut(),
  tab: el => { S.tab = el.dataset.v; render(); window.scrollTo(0, 0); },
  sv: el => { S.setup.v[el.dataset.f] = el.dataset.v; render(); },
  suggest() {
    const v = S.setup.v;
    v.weightKg = num(v.weightKg); v.age = num(v.age);
    if (!v.weightKg || v.weightKg < 30 || v.weightKg > 250) return toast('Enter your weight in kg');
    if (!v.age || v.age < 14 || v.age > 90) return toast('Enter your age');
    if (!v.diet) return toast('Pick veg, veg + eggs or non-veg');
    S.setup.step = 'result'; S.setup.goal = null; S.setup.t = null; render(); window.scrollTo(0, 0);
  },
  pickgoal: el => { S.setup.goal = el.dataset.v; S.setup.t = C.targetsFor(S.setup.v, el.dataset.v); render(); },
  setupback: () => { S.setup.step = 'form'; render(); },
  cancelsetup: () => { S.setup = null; render(); },
  redo: () => { S.setup = newSetup(); render(); window.scrollTo(0, 0); },
  async finishsetup() {
    const st = S.setup, old = store.profile() || {};
    const t = { cal: num(st.t.cal), protein: num(st.t.protein), water: num(st.t.water) };
    if (!t.cal || t.cal < 1000 || !t.protein || !t.water) return toast('Check your targets');
    await store.saveProfile({
      ...old, ...st.v, heightCm: Math.round(st.v.heightCm * 10) / 10,
      goal: st.goal, calTarget: t.cal, proteinTarget: t.protein, waterTarget: t.water,
      plan: old.plan || 'fb3', createdAt: old.createdAt || Date.now()
    });
    S.setup = null; S.tab = old.goal ? 'me' : 'today'; render(); toast('Targets saved');
  },
  async savetargets() {
    const p = store.profile();
    const cal = num(document.getElementById('t-cal').value), pro = num(document.getElementById('t-pro').value), wat = num(document.getElementById('t-wat').value);
    if (!cal || !pro || !wat) return toast('Enter all three targets');
    await store.saveProfile({ ...p, calTarget: cal, proteinTarget: pro, waterTarget: wat });
    render(); toast('Targets saved');
  },
  async setplan(el) { await store.saveProfile({ ...store.profile(), plan: el.dataset.v }); render(); toast('Plan changed'); },
  theme: el => { localStorage.setItem('rp-theme', el.dataset.v); applyTheme(); render(); },
  export() {
    const blob = new Blob([JSON.stringify(store.exportAll(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `repplate-${C.todayKey()}.json`; a.click();
  },
  // gym
  gymday: el => {
    const k = C.todayKey();
    store.editDay(k, d => { d.workout ||= { sets: {} }; d.workout.plan = planKey(); d.workout.day = el.dataset.v; });
    render();
  },
  settick: el => {
    const { ex, n, i } = el.dataset, e = EXERCISES[ex];
    editSets(C.todayKey(), ex, +n, sets => {
      const s = sets[+i]; s.d = !s.d;
      if (s.d && (s.r === '' || s.r == null)) {
        const inp = el.parentElement.querySelector('[data-f="r"]');
        s.r = +inp.placeholder || topReps(PLANS[planKey()].days[workoutDayFor(C.todayKey())].items.find(x => x[0] === ex)?.[2] || 12);
      }
      if (s.d && e.log !== 'time' && s.w === '') s.w = 0;
    });
    store.editDay(C.todayKey(), d => { d.workout.plan ||= planKey(); d.workout.day ||= workoutDayFor(C.todayKey()); });
    render();
  },
  addset: el => {
    const { ex, n } = el.dataset;
    editSets(C.todayKey(), ex, +n, sets => { const l = sets.at(-1); sets.push({ w: l?.w ?? '', r: '', d: false }); });
    render();
  },
  delset: el => { editSets(C.todayKey(), el.dataset.ex, +el.dataset.n, sets => { if (sets.length > 1) sets.pop(); }); render(); },
  // diet
  dietview: el => { S.dietView = el.dataset.v; render(); },
  dietday: el => { S.dietDate = C.dkey(C.addDays(C.parseKey(S.dietDate), +el.dataset.v)); render(); },
  diettoday: () => { S.dietDate = C.todayKey(); render(); },
  tick: el => {
    const { k, slot } = el.dataset;
    const m = C.planForDay(C.parseKey(k), store.profile()).meals.find(x => x.slot === slot);
    store.editDay(k, d => { d.meals ||= {}; d.meals[slot] = d.meals[slot] ? null : { id: m.id, k: m.kcal, p: m.protein }; });
    render();
  },
  water: el => { store.editDay(el.dataset.k, d => { d.water = Math.max(0, (d.water || 0) + +el.dataset.v); }); render(); },
  topup: el => {
    const t = TOPUPS[store.profile().diet || 'veg'][+el.dataset.i];
    store.editDay(el.dataset.k, d => { (d.extras ||= []).push({ n: t.n, k: t.k, p: t.p }); });
    render(); toast('Added to today');
  },
  addextra: el => {
    const n = document.getElementById('ex-n').value.trim(), k = num(document.getElementById('ex-k').value), p = num(document.getElementById('ex-p').value) || 0;
    if (!n || k == null) return toast('Enter the food and its calories');
    store.editDay(el.dataset.k, d => { (d.extras ||= []).push({ n, k, p }); });
    render();
  },
  delextra: el => { store.editDay(el.dataset.k, d => { d.extras.splice(+el.dataset.i, 1); }); render(); },
  async copygroc(el) {
    const mon = C.mondayOf(C.parseKey(S.dietDate));
    const checked = S.grocery[el.dataset.key]?.checked || {};
    const list = C.groceryForWeek(mon, store.profile()).filter(i => !checked[i.id]);
    const text = `RepPlate grocery list (week of ${C.fmtDate(mon, { day: 'numeric', month: 'short' })})\n` +
      CATEGORY_ORDER.map(c => { const it = list.filter(i => i.cat === c); return it.length ? `\n${c}\n` + it.map(i => `- ${i.name}: ${i.text}`).join('\n') : ''; }).join('\n');
    try {
      if (navigator.share) await navigator.share({ title: 'Grocery list', text });
      else { await navigator.clipboard.writeText(text); toast('List copied'); }
    } catch { /* user cancelled */ }
  },
  // progress
  saveweight: () => {
    const v = num(document.getElementById('wt-in').value);
    if (!v || v < 30 || v > 250) return toast('Enter weight in kg');
    store.editDay(C.todayKey(), d => { d.weight = Math.round(v * 10) / 10; });
    render(); toast('Weight logged');
  },
  async checkin(el) {
    const p = store.profile(), adj = +el.dataset.v;
    await store.saveProfile({ ...p, calTarget: p.calTarget + adj, lastCheckin: C.todayKey() });
    render(); toast(adj ? 'Calorie target updated' : 'Check-in done');
  },
  vidtoggle: el => { S.videoOpen = S.videoOpen === el.dataset.ex ? null : el.dataset.ex; render(); },
  videdit: el => { S.videoEdit = S.videoEdit === el.dataset.ex ? null : el.dataset.ex; render(); document.getElementById('vid-in')?.focus(); },
  async vidsave(el) {
    const id = ytId(document.getElementById('vid-in').value);
    if (!id) return toast('That is not a YouTube link');
    const p = store.profile();
    await store.saveProfile({ ...p, videos: { ...(p.videos || {}), [el.dataset.ex]: id } });
    S.videoEdit = null; S.videoOpen = el.dataset.ex; render(); toast('Video saved');
  },
  async vidremove(el) {
    const p = store.profile(), v = { ...(p.videos || {}) }; delete v[el.dataset.ex];
    await store.saveProfile({ ...p, videos: v });
    S.videoEdit = null; S.videoOpen = null; render();
  },
  coachsend: () => { const t = document.getElementById('coach-in'); const v = t.value; t.value = ''; askCoach(v); },
  coachq: el => askCoach(el.textContent),
  coachclear: () => { S.chat = []; store.setMeta('coach', { msgs: [] }).catch(() => {}); render(); },
  cal: el => { const m = S.calMonth; S.calMonth = new Date(m.getFullYear(), m.getMonth() + +el.dataset.v, 1); render(); }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el) return;
  const fn = actions[el.dataset.a];
  if (fn) { e.preventDefault(); fn(el); }
});
document.querySelector('.tabs').addEventListener('click', e => {
  const b = e.target.closest('button[data-tab]'); if (!b) return;
  S.tab = b.dataset.tab; render(); window.scrollTo(0, 0);
});
document.getElementById('avatar').addEventListener('click', () => { S.tab = 'me'; render(); window.scrollTo(0, 0); });

document.addEventListener('change', e => {
  const el = e.target, t = el.dataset.in;
  if (!t) return;
  if (t === 'sv') {
    const v = S.setup.v;
    if (el.dataset.f === 'ft' || el.dataset.f === 'inch') {
      const ft = +view.querySelector('[data-f="ft"]').value, inch = +view.querySelector('[data-f="inch"]').value;
      v.heightCm = Math.round((ft * 12 + inch) * 2.54 * 10) / 10;
    } else v[el.dataset.f] = el.value;
  } else if (t === 'st') {
    S.setup.t[el.dataset.f] = el.value;
  } else if (t === 'set') {
    const { ex, n, i, f } = el.dataset;
    editSets(C.todayKey(), ex, +n, sets => { sets[+i][f] = el.value === '' ? '' : +el.value; });
  } else if (t === 'progex') {
    S.progEx = el.value; render();
  } else if (t === 'groc') {
    const key = el.dataset.key, m = S.grocery[key] ||= {};
    m.checked ||= {}; m.checked[el.dataset.id] = el.checked;
    store.setMeta(key, m).catch(() => toast('Could not save tick'));
    el.closest('li').classList.toggle('got', el.checked);
  }
});

// ---------- theme ----------
function applyTheme() {
  const t = localStorage.getItem('rp-theme') || 'auto';
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.dataset.theme = t;
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name="theme-color"]').content = dark ? '#0f0f12' : '#f2541b';
}
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);

// ---------- boot ----------
render();
store.init(() => { S.ready = true; render(); }).catch(e => {
  console.error(e); S.ready = true;
  view.innerHTML = '<div class="center"><p>Could not connect. Check your internet and reload.</p></div>';
});

document.addEventListener('keydown', e => {
  if (e.target.id === 'coach-in' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); actions.coachsend(); }
});
