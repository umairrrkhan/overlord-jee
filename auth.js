// Import Firebase auth functions
import { onAuthStateChanged, getCurrentUser, signOutUser } from './firebase-config.js';

// DOM Elements
const authButtons = document.querySelector('.auth-buttons');
const loginBtn = document.querySelector('.login-btn');
const signupBtn = document.querySelector('.signup-btn');

// Create profile button template
const createProfileButton = (user) => {
    return `
        <div class="user-profile-container">
            <a href="profile.html" class="nav-button profile-btn">
                <i class="fas fa-user-circle"></i>
                ${user.displayName || 'Profile'}
            </a>
            <button class="nav-button logout-btn" onclick="handleLogout()">
                <i class="fas fa-sign-out-alt"></i>
                Logout
            </button>
        </div>
    `;
};

// Handle logout
async function handleLogout() {
    try {
        const result = await signOutUser();
        if (result.success) {
            window.location.href = 'index.html';
        } else {
            console.error('Logout failed:', result.error);
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Update UI based on auth state
function updateAuthUI(user) {
    if (user) {
        // User is signed in
        authButtons.innerHTML = createProfileButton(user);
    } else {
        // User is signed out
        authButtons.innerHTML = `
            <a href="auth.html#login" class="nav-button login-btn">Login</a>
            <a href="auth.html#signup" class="nav-button signup-btn">Sign up</a>
        `;
    }
}

// Listen for auth state changes
onAuthStateChanged((user) => {
    updateAuthUI(user);
});

// Make handleLogout available globally
window.handleLogout = handleLogout;