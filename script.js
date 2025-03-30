/**
 * script.js
 *
 * Contains general UI helper functions and non-authentication specific
 * DOM manipulation logic for the F*ck JEE site.
 *
 * Authentication state management and form submissions are handled
 * primarily within the inline <script type="module"> blocks in
 * index.html and auth.html, utilizing functions imported from
 * firebase-config.js.
 */

// --- Global Helper Functions ---

/**
 * Updates the main navigation bar UI (Login/Signup/Logout buttons, Questions link)
 * based on the user's authentication state.
 * This function should be called by the onAuthStateChanged observer.
 * @param {object|null} user - The Firebase user object, or null if logged out.
 */
function updateNavbarUI(user) {
    const loginBtn = document.querySelector('header .login-btn'); // Target header buttons specifically
    const signupBtn = document.querySelector('header .signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const questionsLink = document.getElementById('questions-link'); // Main nav link
    const profileContainer = document.querySelector('.profile-container');

    const isLoggedIn = !!user; // True if user object exists, false if null

    // console.log('[UI Update] Updating Navbar UI. User logged in:', isLoggedIn); // Debug log

    // Toggle visibility of Login/Sign Up vs Logout buttons in the main header
    if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
    if (signupBtn) signupBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
    if (logoutBtn) {
        logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
        // Add profile icon and link if logged in
        if (isLoggedIn) {
            // Create profile container if it doesn't exist
            if (!profileContainer) {
                const authButtons = logoutBtn.parentElement;
                const profileDiv = document.createElement('div');
                profileDiv.className = 'profile-container';
                profileDiv.style.display = 'inline-block';
                profileDiv.style.marginRight = '1rem';
                
                // Create profile link with icon
                const profileLink = document.createElement('a');
                profileLink.href = 'profile.html';
                profileLink.className = 'profile-link';
                profileLink.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                `;
                
                profileDiv.appendChild(profileLink);
                authButtons.insertBefore(profileDiv, logoutBtn);
            }
        }
    }

    // Toggle visibility of the main "Questions" link in the navbar
    if (questionsLink) questionsLink.style.display = isLoggedIn ? 'inline-block' : 'none';
}

/**
 * Switches tabs visibility (e.g., Login/Signup forms) on the auth page (auth.html).
 * @param {Event|null} event - The triggering event (can be null if called programmatically).
 * @param {string} tabName - The ID of the tab content element to show ('login' or 'signup').
 * @param {boolean} updateHash - Whether to update the URL hash (#login or #signup).
 */
function openTab(event, tabName, updateHash = false) {
    // Prevent default link behavior if triggered by a button/link acting as a button
    if (event && event.preventDefault && event.currentTarget && event.currentTarget.tagName !== 'A' || (event?.currentTarget?.tagName === 'A' && event.currentTarget.getAttribute('href').startsWith('#'))) {
       // Prevent default if it's not a real anchor link or if it's an anchor targeting the hash
       // This prevents page jumps for hash links used as buttons.
       // event.preventDefault(); // Careful: This might prevent hash updates if called on actual hash links. Test needed.
    }

    // Get all elements with class="tab-content" and hide them
    const tabContents = document.getElementsByClassName("tab-content");
    let foundTab = false;
    for (let i = 0; i < tabContents.length; i++) {
        if (tabContents[i]) {
            tabContents[i].style.display = "none";
            tabContents[i].classList.remove("active");
        }
    }

    // Get all elements with class="tab-link" (if you use them) and remove "active"
    const tabLinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tabLinks.length; i++) {
        if (tabLinks[i]) {
            tabLinks[i].classList.remove("active");
        }
    }

    // Show the specific tab content
    const currentTab = document.getElementById(tabName);
    if (currentTab) {
        currentTab.style.display = "block";
        currentTab.classList.add("active");
        foundTab = true;
    } else {
        console.error("[Tabs] Tab content element not found for ID:", tabName);
        // Attempt to show default tab if requested one fails?
        // const defaultTab = document.getElementById('login');
        // if (defaultTab) defaultTab.style.display = 'block';
        return; // Exit if tab content doesn't exist
    }

    // Add 'active' class to the corresponding tab link/button (if applicable)
    // Example: Find a tab link whose href matches the tabName hash
    let matchingLink = document.querySelector(`.tab-link[href="#${tabName}"]`);
    if (matchingLink) {
        matchingLink.classList.add("active");
    }


    // Optionally update the URL hash
    if (updateHash) {
        const newHash = '#' + tabName;
        if (window.location.hash !== newHash) {
            // Use history.pushState to update hash without page jump or adding to history like direct assignment
             try {
                history.pushState(null, '', newHash);
             } catch (e) {
                 console.warn("[Tabs] Could not push state for hash update:", e);
                 // Fallback for older browsers or specific environments
                 // window.location.hash = newHash; // This causes a jump and adds history entry
             }
        }
    }

     // Update header buttons specifically on the auth page (Login/Signup visibility)
     // Check if the function exists before calling (it should be defined below)
     if (typeof updateAuthHeaderButtons === 'function') {
         updateAuthHeaderButtons(tabName);
     }
}

/**
 * Updates the visibility of Login/Signup buttons *in the header of auth.html*
 * based on which tab (login or signup) is currently active.
 * @param {string} activeTab - The name ('login' or 'signup') of the currently active tab.
 */
function updateAuthHeaderButtons(activeTab) {
     // Only run this logic if we are detectably on the auth page
     // Checking for a unique element on that page is a good way
     if (!document.body.querySelector('.auth-page-container')) {
        // console.log("[UI Update] Not on auth page, skipping auth header button update.");
        return;
     }

     const loginNav = document.getElementById('auth-nav-login');
     const signupNav = document.getElementById('auth-nav-signup');

     if (!loginNav || !signupNav) {
        console.warn("[UI Update] Auth page header nav buttons not found.");
        return;
     }

     // console.log('[UI Update] Updating Auth Header Buttons visibility for active tab:', activeTab); // Debug log

     if (activeTab === 'login') {
         // If login tab is active, hide the "Login" button in header, show "Sign Up"
         loginNav.style.display = 'none';
         signupNav.style.display = 'inline-block';
     } else if (activeTab === 'signup') {
         // If signup tab is active, show "Login", hide "Sign Up"
         loginNav.style.display = 'inline-block';
         signupNav.style.display = 'none';
     } else {
         // Default/fallback: show both if tabName is unexpected (shouldn't happen)
         loginNav.style.display = 'inline-block';
         signupNav.style.display = 'inline-block';
         console.warn("[UI Update] Unexpected activeTab value in updateAuthHeaderButtons:", activeTab);
     }
 }


// --- DOMContentLoaded Event Listener ---
// Runs when the basic HTML structure is loaded.
document.addEventListener('DOMContentLoaded', () => {
    console.log("[Lifecycle] DOM Content Loaded");

    // --- Sticky Header Logic ---
    const header = document.getElementById('site-header'); // The main site header
    const stickyThreshold = 10; // Pixels scrolled before header becomes sticky
    let initialHeaderHeight = 0; // To store the header's original height

    if (header) {
        initialHeaderHeight = header.offsetHeight;
        // Apply initial padding to the body to prevent content jump ONLY if header has a measurable height
        if (initialHeaderHeight > 0) {
             try {
                document.body.style.paddingTop = `${initialHeaderHeight}px`;
             } catch (e) {
                 console.error("[Sticky Header] Error setting initial body padding:", e)
             }
        } else {
            console.warn("[Sticky Header] Initial header height is 0. Padding top not set.");
        }

        // Debounce function to limit scroll event frequency (optional but good practice)
        let scrollTimeout;
        function handleScroll() {
            if (scrollTimeout) {
                window.cancelAnimationFrame(scrollTimeout);
            }
            scrollTimeout = window.requestAnimationFrame(() => {
                 if (!header) return; // Double check header exists
                 try {
                    if (window.scrollY > stickyThreshold) {
                        if (!header.classList.contains('sticky')) {
                            header.classList.add('sticky');
                            // Optional: Adjust body padding *if* sticky header height differs
                            // document.body.style.paddingTop = `${header.offsetHeight}px`;
                        }
                    } else {
                        if (header.classList.contains('sticky')) {
                            header.classList.remove('sticky');
                            // Restore original body padding when unsticking
                             if (initialHeaderHeight > 0) {
                                document.body.style.paddingTop = `${initialHeaderHeight}px`;
                             }
                        }
                    }
                } catch (e) {
                    console.error("[Sticky Header] Error in scroll handler:", e);
                }
            });
        }

        window.addEventListener('scroll', handleScroll);

         // Adjust body padding if window is resized (header height might change)
         // Debounce resize events as well
        let resizeTimeout;
        function handleResize() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (header && !header.classList.contains('sticky')) {
                   initialHeaderHeight = header.offsetHeight; // Update initial height
                   if (initialHeaderHeight > 0) {
                       document.body.style.paddingTop = `${initialHeaderHeight}px`;
                   }
                }
                // If it IS sticky, the fixed position handles spacing, no padding change needed.
            }, 150); // Adjust debounce delay as needed
        }

         window.addEventListener('resize', handleResize);

    } else {
        console.log("[Initialization] Main site header (#site-header) not found. Sticky logic skipped.");
    }


    // --- Dynamic Date for Status Badge ---
    const statusBadge = document.getElementById('status-badge-date');
    if (statusBadge) {
        try {
            const today = new Date();
            // Format as MM/DD/YYYY (US locale) - adjust locale if needed
            const formattedDate = today.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
            statusBadge.textContent = `Didn't get banned as of ${formattedDate}`;
        } catch (e) {
            console.error("[UI Update] Error formatting or setting status badge date:", e);
            statusBadge.textContent = `Didn't get banned as of [Date Error]`; // Fallback text
        }
    }


    // --- Auth Page Specific Initialization ---
    // This runs only if the auth page container is present
    if (document.body.querySelector('.auth-page-container')) {
         const hash = window.location.hash; // e.g., #login or #signup
         const defaultTab = 'login';
         // Determine target tab: if hash is #signup, use 'signup', otherwise default to 'login'
         const targetTab = (hash === '#signup') ? 'signup' : defaultTab;

         console.log('[Initialization] Auth page detected. Initial hash:', hash, 'Target tab:', targetTab);

         // Use a small timeout to ensure elements (like tabs) are fully rendered before switching
         // This can sometimes help if CSS transitions or other rendering delays occur.
         setTimeout(() => {
            try {
                openTab(null, targetTab, false); // Open the correct tab (don't update hash again)
                // updateAuthHeaderButtons(targetTab); // updateAuthHeaderButtons is called inside openTab now
            } catch (e) {
                console.error("[Initialization] Error opening initial auth tab:", e);
            }
         }, 50); // 50ms delay, adjust if needed, or remove if tabs switch reliably without it.

        // Add listener for hash changes AFTER initial load, to allow switching tabs via back/forward or links
         window.addEventListener('hashchange', () => {
            const newHash = window.location.hash.slice(1); // Get 'login' or 'signup'
            if (newHash === 'login' || newHash === 'signup') {
                console.log('[Navigation] Hash changed to:', newHash, '- switching tab.');
                // Switch tab based on new hash, but DON'T set updateHash to true
                // as the hash change itself is the source of the event.
                openTab(null, newHash, false);
                // updateAuthHeaderButtons(newHash); // Called inside openTab
            }
        });
    }


    // --- Contact Page Form Simulation --- (Keep if contact.html uses this)
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('form-message');

    if (contactForm && formMessage) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent actual form submission for demo

            // Simulate basic processing
            formMessage.style.display = 'block'; // Show message area
            formMessage.classList.remove('success', 'error'); // Clear previous styles

            // Basic check if fields are filled (improve validation as needed)
            const name = document.getElementById('contactName')?.value;
            const email = document.getElementById('contactEmail')?.value;
            const message = document.getElementById('contactMessage')?.value;

            if (name && email && message) {
                formMessage.classList.add('success'); // Use CSS classes for styling
                formMessage.textContent = 'Thank you! Your message has been sent (Demo).';
                contactForm.reset(); // Clear the form on success
            } else {
                 formMessage.classList.add('error');
                 formMessage.textContent = 'Please fill in all required fields.';
            }

             // Hide the message after a few seconds
             setTimeout(() => {
                 formMessage.style.display = 'none';
             }, 6000); // 6 seconds
        });
    }


    // --- Initial UI State ---
    // Set the default UI state assuming the user is logged out.
    // The onAuthStateChanged listener (in index.html/auth.html modules)
    // will update this once Firebase initializes and checks the actual auth state.
    console.log("[Initialization] Setting initial Navbar UI to logged-out state.");
    updateNavbarUI(null); // null represents a logged-out user

}); // --- End DOMContentLoaded ---

// --- Question Bank Search and Filter Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-input');
    const tagSelect = document.querySelector('.tag-select');
    const difficultySelect = document.querySelector('.difficulty-select');
    const questionsTable = document.querySelector('.questions-table tbody');

    if (searchInput && tagSelect && difficultySelect && questionsTable) {
        console.log('Filter elements found. Attaching listeners.');
        // Store all questions for filtering
        const allQuestions = Array.from(questionsTable.querySelectorAll('tr'));

        // Function to filter questions based on search text and filters
        function filterQuestions() {
            console.log('filterQuestions() called.');
            const searchText = searchInput.value.toLowerCase();
            const selectedTopic = tagSelect.value.toLowerCase();
            const selectedDifficulty = difficultySelect.value.toLowerCase();

            console.log(`Current filters - Search: "${searchText}", Topic: "${selectedTopic}", Difficulty: "${selectedDifficulty}"`);

            let visibleCount = 0;
            allQuestions.forEach(row => {
                const questionText = row.children[1].textContent.toLowerCase();
                const topic = row.children[2].textContent.toLowerCase();
                const difficulty = row.children[3].textContent.toLowerCase();

                const matchesSearch = searchText === '' || questionText.includes(searchText);
                const matchesTopic = selectedTopic === '' || topic === selectedTopic;
                const matchesDifficulty = selectedDifficulty === '' || difficulty === selectedDifficulty;

                console.log(`Row Data - Topic: ${topic}, Difficulty: ${difficulty}`);
                console.log(`Matches - Search: ${matchesSearch}, Topic: ${matchesTopic}, Difficulty: ${matchesDifficulty}`);

                const isVisible = matchesSearch && matchesTopic && matchesDifficulty;
                row.style.display = isVisible ? '' : 'none';
                if (isVisible) visibleCount++;
            });

            console.log(`Visible rows: ${visibleCount}`);

            // Update the search input to reflect current filters
            if (selectedTopic || selectedDifficulty) {
                let filterText = [];
                if (selectedTopic) filterText.push(selectedTopic);
                if (selectedDifficulty) filterText.push(selectedDifficulty);
                if (!searchText) searchInput.value = filterText.join(' ');
            }
        }

        // Add event listeners for search and filters
        searchInput.addEventListener('input', filterQuestions);
        tagSelect.addEventListener('change', filterQuestions);
        difficultySelect.addEventListener('change', filterQuestions);
    }
});

// ===============================================================
// NO Authentication Logic (login, signup, logout handlers) HERE!
// NO Auth State Management (isLoggedIn, localStorage) HERE!
// ===============================================================
// Auth logic lives in the inline <script type="module"> blocks
// on index.html and auth.html, using firebase-config.js imports.
// ===============================================================