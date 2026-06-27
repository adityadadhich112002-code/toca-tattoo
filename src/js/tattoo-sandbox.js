import { gsap } from 'gsap';

/**
 * Initialize Simplified Spotlight CTA
 */
export function initTattooSandbox() {
  const section = document.getElementById('final-cta');

  if (!section) return;

  // Initialize variables at center
  gsap.set(section, {
    '--mouse-x': '50%',
    '--mouse-y': '50%'
  });

  // Track mouse coordinates and smoothly animate CSS variables
  section.addEventListener('mousemove', (e) => {
    const rect = section.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    gsap.to(section, {
      '--mouse-x': `${x}px`,
      '--mouse-y': `${y}px`,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  });

  // Smoothly center the spotlight when mouse leaves the section
  section.addEventListener('mouseleave', () => {
    gsap.to(section, {
      '--mouse-x': '50%',
      '--mouse-y': '50%',
      duration: 1.0,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  });
}

