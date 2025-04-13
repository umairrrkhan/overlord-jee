// Premium Header scroll effect with advanced animations
const header = document.querySelector('.site-header');
const scrollThreshold = 30; // Lower threshold for faster effect
let lastScroll = 0;
let scrollTimer = null;

// Add premium glow effect to brand logo
const brandLogo = document.querySelector('.brand-logo');
if (brandLogo) {
    // Add subtle pulse animation to brand logo
    setInterval(() => {
        brandLogo.classList.add('pulse-glow');
        setTimeout(() => {
            brandLogo.classList.remove('pulse-glow');
        }, 1000);
    }, 5000);
}

function handleScroll() {
    const currentScroll = window.scrollY;
    
    // Add scrolled class for shrinking effect with smoother transition
    if (currentScroll > scrollThreshold) {
        header.classList.add('scrolled');
        document.body.classList.add('header-scrolled');
    } else {
        header.classList.remove('scrolled');
        document.body.classList.remove('header-scrolled');
    }
    
    // Add direction-based classes for slide effects
    if (currentScroll > lastScroll && currentScroll > scrollThreshold * 2) {
        header.classList.add('scroll-down');
    } else {
        header.classList.remove('scroll-down');
    }
    
    lastScroll = currentScroll;
    
    // Debounce scroll events for better performance
    if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
    }
    scrollTimer = setTimeout(() => {
        header.classList.remove('scroll-down');
    }, 150);
}

// Add scroll event listener with passive option for better performance
window.addEventListener('scroll', handleScroll, { passive: true });

// Check scroll position on page load
handleScroll();

// Add resize event listener to handle viewport changes
window.addEventListener('resize', handleScroll, { passive: true });