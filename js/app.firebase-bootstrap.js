import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getAnalytics,
  isSupported,
  logEvent
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
  getFirestore,
  doc,
  collection,
  addDoc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDcRIz1Uy1AZd-9JJdLF92SyqU6m8bdSXo",
  authDomain: "departmentwebsite-5aec1.firebaseapp.com",
  projectId: "departmentwebsite-5aec1",
  storageBucket: "departmentwebsite-5aec1.firebasestorage.app",
  messagingSenderId: "827589080688",
  appId: "1:827589080688:web:ad89c53218104f908926b5",
  measurementId: "G-BFW19TSYL0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.sgcuFirestore = {
  db,
  doc,
  collection,
  addDoc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp
};

window.sgcuAuth = {
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword
};

window.sgcuAnalytics = {
  trackPageView: () => {}
};
window.sgcuVisitorCounter = {
  syncDailyVisitorCount: async () => null
};

isSupported()
  .then((supported) => {
    if (!supported) return;
    const analytics = getAnalytics(app);
    window.sgcuAnalytics.trackPageView = (pageName) => {
      const safePage = (pageName || "home").toString();
      const pagePath = `${window.location.pathname}#${safePage}`;
      const pageLocation = `${window.location.origin}${pagePath}`;
      logEvent(analytics, "page_view", {
        page_title: `Treasurer SGCU - ${safePage}`,
        page_location: pageLocation,
        page_path: pagePath
      });
    };
  })
  .catch(() => {
    // ignore analytics init failures
  });

function getDateKeyInBangkok() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(new Date());
}

window.sgcuVisitorCounter.syncDailyVisitorCount = async () => {
  const dateKey = getDateKeyInBangkok();
  const dailyRef = doc(db, "site_daily_visitors", dateKey);
  const allTimeRef = doc(db, "site_stats", "visitors_all_time");

  return runTransaction(db, async (transaction) => {
    const dailySnap = await transaction.get(dailyRef);
    const allTimeSnap = await transaction.get(allTimeRef);

    const currentDaily = Number(dailySnap.data()?.total || 0);
    const currentAllTime = Number(allTimeSnap.data()?.total || 0);
    const nextDaily = Number.isFinite(currentDaily) ? currentDaily + 1 : 1;
    const nextAllTime = Number.isFinite(currentAllTime) ? currentAllTime + 1 : 1;

    transaction.set(
      dailyRef,
      {
        total: nextDaily,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    transaction.set(
      allTimeRef,
      {
        total: nextAllTime,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    return {
      dailyTotal: nextDaily,
      allTimeTotal: nextAllTime
    };
  });
};
