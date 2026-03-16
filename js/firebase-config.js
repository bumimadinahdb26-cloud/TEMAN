// Firebase Configuration
// Ganti dengan konfigurasi Firebase Anda

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Auth functions
const auth = firebase.auth();
const db = firebase.firestore();

// Google Sign In
async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        return result.user;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Save user to Firestore
async function saveUserToCloud(userData) {
    try {
        await db.collection('users').doc(userData.id).set(userData);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

// Load user from Firestore
async function loadUserFromCloud(userId) {
    try {
        const doc = await db.collection('users').doc(userId).get();
        return doc.exists ? doc.data() : null;
    } catch (error) {
        console.error(error);
        return null;
    }
}