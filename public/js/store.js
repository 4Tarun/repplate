// Data layer. Firebase (Google sign-in + Firestore) when configured,
// otherwise a local demo mode that keeps data in this browser only.
import { firebaseConfig, sdkVersion, appCheckSiteKey, aiModel } from './firebase-config.js';
import { dkey, addDays } from './calc.js';

const SDK = `https://www.gstatic.com/firebasejs/${sdkVersion}`;
const hasAppCheck = appCheckSiteKey && !appCheckSiteKey.startsWith('PASTE');
export const isDemo = !firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith('PASTE');

const cache = { uid: null, user: null, profile: null, days: {}, meta: {} };
const timers = {};
let fb = null; // { app, auth, db, A (auth module), F (firestore module) }

const LS_KEY = 'repplate-local';
const clone = o => JSON.parse(JSON.stringify(o ?? null));

// ---------- auth ----------
export async function init(onUser) {
  if (isDemo) {
    const signedIn = localStorage.getItem(LS_KEY + '-signed') === '1';
    if (signedIn) { loadLocal(); onUser(cache.user); } else onUser(null);
    return;
  }
  const [appM, A, F] = await Promise.all([
    import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-auth.js`), import(`${SDK}/firebase-firestore.js`)
  ]);
  const app = appM.initializeApp(firebaseConfig);
  if (hasAppCheck) {
    try {
      if (location.hostname === 'localhost') self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      const AC = await import(`${SDK}/firebase-app-check.js`);
      AC.initializeAppCheck(app, { provider: new AC.ReCaptchaEnterpriseProvider(appCheckSiteKey), isTokenAutoRefreshEnabled: true });
    } catch (e) { console.warn('App Check not started', e); }
  }
  const auth = A.getAuth(app);
  let db;
  try {
    db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) });
  } catch { db = F.getFirestore(app); }
  fb = { app, auth, db, A, F };
  A.getRedirectResult(auth).catch(() => {});
  A.onAuthStateChanged(auth, async u => {
    if (!u) { cache.uid = null; cache.user = null; onUser(null); return; }
    cache.uid = u.uid;
    cache.user = { uid: u.uid, name: u.displayName || 'You', photo: u.photoURL || '', email: u.email || '' };
    await loadRemote();
    onUser(cache.user);
  });
}

export async function signIn() {
  if (isDemo) {
    localStorage.setItem(LS_KEY + '-signed', '1');
    loadLocal();
    return cache.user;
  }
  const { auth, A } = fb;
  const provider = new A.GoogleAuthProvider();
  try { await A.signInWithPopup(auth, provider); }
  catch (e) {
    if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(e.code)) {
      if (e.code === 'auth/popup-closed-by-user') throw e;
      await A.signInWithRedirect(auth, provider);
    } else throw e;
  }
}

export async function signOut() {
  await flush();
  if (isDemo) { localStorage.removeItem(LS_KEY + '-signed'); location.reload(); return; }
  await fb.A.signOut(fb.auth);
  location.reload();
}

// ---------- loading ----------
function loadLocal() {
  const raw = clone(JSON.parse(localStorage.getItem(LS_KEY) || '{}')) || {};
  cache.uid = 'local';
  cache.user = { uid: 'local', name: 'Demo user', photo: '', email: 'Saved on this device only' };
  cache.profile = raw.profile || null;
  cache.days = raw.days || {};
  cache.meta = raw.meta || {};
}
function saveLocal() {
  localStorage.setItem(LS_KEY, JSON.stringify({ profile: cache.profile, days: cache.days, meta: cache.meta }));
}

async function loadRemote() {
  const { db, F } = fb;
  const uid = cache.uid;
  const p = await F.getDoc(F.doc(db, 'users', uid));
  cache.profile = p.exists() ? p.data() : null;
  const from = dkey(addDays(new Date(), -400));
  const snap = await F.getDocs(F.query(F.collection(db, 'users', uid, 'days'), F.where(F.documentId(), '>=', from)));
  cache.days = {};
  snap.forEach(d => { cache.days[d.id] = d.data(); });
}

// ---------- profile ----------
export const user = () => cache.user;
export const profile = () => cache.profile;
export async function saveProfile(p) {
  cache.profile = { ...clone(p), updatedAt: Date.now() };
  if (isDemo) return saveLocal();
  const { db, F } = fb;
  await F.setDoc(F.doc(db, 'users', cache.uid), clone(cache.profile));
}

// ---------- days ----------
export const allDays = () => cache.days;
export const getDay = k => cache.days[k] || {};
export function editDay(k, fn) {
  const d = cache.days[k] || (cache.days[k] = {});
  fn(d);
  if (isDemo) return saveLocal();
  clearTimeout(timers[k]);
  timers[k] = setTimeout(() => writeDay(k), 700);
}
function writeDay(k) {
  delete timers[k];
  const { db, F } = fb;
  return F.setDoc(F.doc(db, 'users', cache.uid, 'days', k), clone(cache.days[k])).catch(e => console.error('save failed', e));
}
export async function flush() {
  if (isDemo || !fb) return;
  await Promise.all(Object.keys(timers).map(k => { clearTimeout(timers[k]); return writeDay(k); }));
}

// ---------- meta (grocery ticks etc.) ----------
export async function getMeta(key) {
  if (key in cache.meta) return cache.meta[key];
  if (isDemo) return (cache.meta[key] = {});
  const { db, F } = fb;
  const s = await F.getDoc(F.doc(db, 'users', cache.uid, 'meta', key));
  return (cache.meta[key] = s.exists() ? s.data() : {});
}
export async function setMeta(key, val) {
  cache.meta[key] = clone(val);
  if (isDemo) return saveLocal();
  const { db, F } = fb;
  await F.setDoc(F.doc(db, 'users', cache.uid, 'meta', key), clone(val));
}

export function exportAll() {
  return { exportedAt: new Date().toISOString(), profile: cache.profile, days: cache.days };
}

document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });

// ---------- AI coach ----------
export const coachReady = () => !isDemo && hasAppCheck;
let AIM = null;
export async function coachModel(systemInstruction) {
  if (isDemo) throw Object.assign(new Error('demo'), { code: 'demo' });
  if (!hasAppCheck) throw Object.assign(new Error('no-appcheck'), { code: 'no-appcheck' });
  AIM ||= await import(`${SDK}/firebase-ai.js`);
  const ai = AIM.getAI(fb.app, { backend: new AIM.GoogleAIBackend() });
  return AIM.getGenerativeModel(ai, { model: aiModel, systemInstruction });
}
