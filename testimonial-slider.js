/**
 * Testimonial Logic (Currently Empty)
 * Previous animation logic removed as scrolling is handled by CSS.
 * This file can be used for future JS-based testimonial interactions if needed.
 */

document.addEventListener('DOMContentLoaded', () => {
    const testimonials = document.querySelectorAll('.testimonial');
    const columns = document.querySelectorAll('.testimonial-column');
    
    // Calculate equal distribution
    const perColumn = Math.ceil(testimonials.length / columns.length);
    
    // Distribute testimonials evenly
    columns.forEach((col, i) => {
        col.innerHTML = '';
        const start = i * perColumn;
        const end = Math.min(start + perColumn, testimonials.length);
        
        for (let j = start; j < end; j++) {
            col.appendChild(testimonials[j]);
        }
    });
});

// function initTestimonialAnimation() { ... } // Removed old function