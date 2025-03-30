// Import the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged as firebaseOnAuthStateChanged, // Renamed to avoid potential naming conflict
    updateProfile // Added for setting display name
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration (MAKE SURE THESE ARE CORRECT)
const firebaseConfig = {
  apiKey: "AIzaSyDy230uiSkjWuRdCmn1_0S-JyNmNg-XaMo",
  authDomain: "awesome-9ddc4.firebaseapp.com",
  projectId: "awesome-9ddc4",
  storageBucket: "awesome-9ddc4.firebasestorage.app",
  messagingSenderId: "1057550111061",
  appId: "1:1057550111061:web:abd6f3ce8dff701a419fdc",
  measurementId: "G-ZV7MZNHSEG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- Helper: Store or Update user data in Firestore ---
// Now also used after email signup
async function storeUserData(user, additionalData = {}) {
  if (!user) return { success: false, error: "No user provided" };
  const userRef = doc(db, 'users', user.uid);
  try {
    // Create user document with complete profile data
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || additionalData.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      // Ensure basic profile fields exist
      profile: {
        accountStatus: 'active',
        lastUpdated: serverTimestamp()
      },
      ...additionalData // Merge additional data like accountType
    };

    // Create new document for new users or update existing ones
    await setDoc(userRef, userData);
    console.log('User data stored/updated successfully in users collection for:', user.uid);
    return { success: true };

  } catch (error) {
    console.error('Error storing user data in Firestore:', error);
    return { success: false, error: `Firestore error: ${error.message}` };
  }
}

// --- Google Sign In ---
export const signInWithGoogle = async () => {
  try {
    // Configure Google provider settings
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    // Add required scopes
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    // Store user data after successful Google sign-in
    const storeResult = await storeUserData(user, { accountType: 'google' });
    if (!storeResult.success) {
        console.warn('Firestore update failed after Google sign-in:', storeResult.error);
    }
    return { success: true, user: user };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return { success: false, error: error.message, code: error.code };
  }
};

// --- Email/Password Sign In ---
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    // Update last login time in Firestore
    await storeUserData(result.user, {}); // Updates lastLogin via merge:true
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Email Sign-In Error:', error);
    return { success: false, error: error.message, code: error.code };
  }
};

// --- Email/Password Sign Up ---
export const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user data in Firestore
    const storeResult = await storeUserData(user, {
      accountType: 'email',
      verified: user.emailVerified
    });

    if (!storeResult.success) {
      // If Firestore fails, delete the Auth user to prevent inconsistent state
      console.error('Firestore failed after creating Auth user. Attempting cleanup...');
      try {
        await user.delete();
        console.log('Auth user deleted due to Firestore failure.');
        return { success: false, error: 'Failed to save user profile. Account creation rolled back. Please try again.', code: 'firestore-error' };
      } catch (deleteError) {
        console.error('CRITICAL: Failed to delete Auth user after Firestore failure. Inconsistent state:', deleteError);
        return { success: false, error: 'Critical error during signup. Please contact support.', code: 'cleanup-failed' };
      }
    }

    // Success! Both Auth user created and Firestore document saved.
    return { success: true, user: user };

  } catch (error) {
    console.error('Email Sign-Up Error:', error);
    if (error.code === 'auth/email-already-in-use') {
      return {
        success: false,
        error: 'This email address is already registered. Please try logging in.',
        code: error.code,
        existingAccount: true
      };
    }
    return { success: false, error: error.message, code: error.code };
  }
};

// --- Sign Out ---
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('User signed out successfully.');
    return { success: true };
  } catch (error) {
    console.error('Sign Out Error:', error);
    return { success: false, error: error.message };
  }
};

// --- Auth State Observer ---
// Export the observer function directly
export const onAuthStateChanged = (callback) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

// --- Optional: Get Current User ---
export const getCurrentUser = () => {
    return auth.currentUser;
}