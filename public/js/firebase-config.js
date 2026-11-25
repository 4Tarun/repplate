// Paste the config from Firebase console > Project settings > Your apps > Web app.
// While apiKey starts with "PASTE", the app runs in local demo mode (data stays in this browser).
export const firebaseConfig = {
  apiKey: 'PASTE_YOUR_API_KEY',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:0000000000000000'
};

// Firebase JS SDK version loaded from the CDN
export const sdkVersion = '13.4.0';

// AI coach (Firebase AI Logic, Gemini Developer API, free Spark plan).
// App Check is required for AI Logic: paste your reCAPTCHA Enterprise site key from
// Firebase console > App Check > Apps > your web app.
export const appCheckSiteKey = 'PASTE_RECAPTCHA_ENTERPRISE_SITE_KEY';
// A stable model from https://firebase.google.com/docs/ai-logic/models (change it here if it gets retired)
export const aiModel = 'gemini-3.8-flash';
