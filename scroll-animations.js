// Scroll-based animations using GSAP
document.addEventListener('DOMContentLoaded', () => {
  // Initialize GSAP with ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Animate sections in one by one
  gsap.utils.toArray('.content-section').forEach(section => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power2.out"
    });
  });

  // Pulse animation for CTA buttons on scroll pause
  const ctaButtons = document.querySelectorAll('.pulse-animation');
  ctaButtons.forEach(button => {
    ScrollTrigger.create({
      trigger: button,
      start: "top 80%",
      onEnter: () => {
        gsap.to(button, {
          scale: 1.05,
          duration: 0.5,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        });
      }
    });
  });

  // Animate metric counters
  const counters = document.querySelectorAll('.bar-chart .bar');
  counters.forEach(counter => {
    ScrollTrigger.create({
      trigger: counter,
      start: "top 80%",
      onEnter: () => {
        const targetHeight = counter.style.height;
        counter.style.height = '0%';
        gsap.to(counter, {
          height: targetHeight,
          duration: 1.5,
          ease: "power2.out"
        });
      }
    });
  });
});