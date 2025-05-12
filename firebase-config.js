// Import the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged as firebaseOnAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDy230uiSkjWuRdCmn1_0S-JyNmNg-XaMo",
  authDomain: "hopejee.shop",
  projectId: "awesome-9ddc4",
  storageBucket: "awesome-9ddc4.firebasestorage.app",
  messagingSenderId: "1057550111061",
  appId: "1:1057550111061:web:abd6f3ce8dff701a419fdc",
  measurementId: "G-ZV7MZNHSEG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);
const googleProvider = new GoogleAuthProvider();

// Simple helper to handle authentication responses
const handleAuthResponse = (user) => {
  if (user) {
    return { success: true, user: user };
  }
  return { success: false, error: "Authentication failed" };
};

// Google Sign In with enhanced error handling
export const signInWithGoogle = async () => {
  try {
    if (!auth || !googleProvider) throw new Error('Firebase not initialized');
    const result = await signInWithPopup(auth, googleProvider);
    return handleAuthResponse(result.user);
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return { 
      success: false, 
      error: error.code === 'auth/popup-closed-by-user' 
        ? 'Sign-in cancelled' 
        : 'Failed to sign in with Google'
    };
  }
};

// Email/Password Sign In with validation
export const signInWithEmail = async (email, password) => {
  try {
    if (!auth) throw new Error('Firebase not initialized');
    if (!email || !password) throw new Error('Email and password required');
    const result = await signInWithEmailAndPassword(auth, email, password);
    return handleAuthResponse(result.user);
  } catch (error) {
    console.error('Email Sign-In Error:', error);
    return { success: false, error: error.message };
  }
};

// Email/Password Sign Up with validation
export const signUpWithEmail = async (email, password) => {
  try {
    if (!auth) throw new Error('Firebase not initialized');
    if (!email || !password) throw new Error('Email and password required');
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return handleAuthResponse(userCredential.user);
  } catch (error) {
    console.error('Email Sign-Up Error:', error);
    if (error.code === 'auth/email-already-in-use') {
      return {
        success: false,
        error: 'This email address is already registered',
        code: error.code,
        existingAccount: true
      };
    }
    return { success: false, error: error.message, code: error.code };
  }
};

// Sign Out
export const signOutUser = async () => {
  try {
    if (!auth) throw new Error('Firebase not initialized');
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign Out Error:', error);
    return { success: false, error: error.message };
  }
};

// Auth State Observer
export const onAuthStateChanged = (callback) => {
  if (!auth) {
    console.error('Firebase not initialized');
    return;
  }
  return firebaseOnAuthStateChanged(auth, callback);
};

// Get Current User
export const getCurrentUser = () => {
  return auth ? auth.currentUser : null;
};

// Export Firebase services
export { app, auth, functions, httpsCallable, googleProvider };