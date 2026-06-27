import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/main.css';
import './skin-renderer.js';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  initPreloaderTattoo();
  initMobileMenu();
  initSmoothScroll();
  initHeaderScroll();
  initFaqAccordion();
  initScrollAnimations();
  initTattooAnimation();
  initCardsAutoSlide();
  initTestimonialStack();
});

/**
 * Lenis Smooth Scroll Engine
 */
function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 2,
  });

  // Update ScrollTrigger on Lenis scroll
  lenis.on('scroll', ScrollTrigger.update);

  // Sync GSAP ticker with Lenis raf loop
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Store globally to lock during loading
  window.lenis = lenis;
  if (document.documentElement.classList.contains('loading')) {
    lenis.stop();
  }

  // Bind links to smooth scroll destination
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      // Always close mobile menu drawer immediately when a link is clicked
      const drawer = document.getElementById('mobile-drawer');
      const toggle = document.getElementById('mobile-toggle');
      const backdrop = document.getElementById('mobile-drawer-backdrop');
      if (drawer) drawer.classList.remove('active');
      if (toggle) toggle.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');

      const target = document.querySelector(targetId);
      if (target) {
        lenis.scrollTo(target, {
          offset: -80, // Offset for navbar heights
          duration: 1.5,
        });
      }
    });
  });
}

/**
 * Header size reduction and blur on scroll
 */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Run immediately on init
}

/**
 * Mobile Drawer Menu
 */
function initMobileMenu() {
  const toggle = document.getElementById('mobile-toggle');
  const desktopMenu = document.getElementById('nav-menu');
  if (!toggle || !desktopMenu) return;

  // Create mobile drawer element if it doesn't exist
  let drawer = document.getElementById('mobile-drawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'mobile-drawer';
    drawer.className = 'mobile-drawer';

    // Clone the nav menu list
    const mobileMenu = desktopMenu.cloneNode(true);
    mobileMenu.id = 'mobile-nav-menu';
    mobileMenu.className = 'mobile-nav-menu';

    drawer.appendChild(mobileMenu);

    // Add Book Consultation button to mobile drawer
    const mobileCta = document.createElement('a');
    mobileCta.href = '#booking';
    mobileCta.className = 'btn btn-primary mobile-drawer-cta';
    mobileCta.textContent = 'Book Consultation';
    drawer.appendChild(mobileCta);

    document.body.appendChild(drawer);

    // All link clicks are handled globally in the smooth scroll click listener
  }

  // Create backdrop element
  let backdrop = document.getElementById('mobile-drawer-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'mobile-drawer-backdrop';
    backdrop.className = 'mobile-drawer-backdrop';
    document.body.appendChild(backdrop);

    // Close drawer when clicking backdrop
    backdrop.addEventListener('click', () => {
      drawer.classList.remove('active');
      toggle.classList.remove('active');
      backdrop.classList.remove('active');
    });
  }

  // Toggle drawer visibility
  toggle.addEventListener('click', () => {
    drawer.classList.toggle('active');
    toggle.classList.toggle('active');
    backdrop.classList.toggle('active');
  });
}

/**
 * FAQ Expanding Accordions
 */
function initFaqAccordion() {
  const triggers = document.querySelectorAll('.faq-trigger');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const parent = trigger.parentElement;
      const content = parent.querySelector('.faq-content');
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Close other opened FAQs
      document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== parent && item.classList.contains('active')) {
          item.classList.remove('active');
          item.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
          item.querySelector('.faq-content').style.maxHeight = '0';
        }
      });

      // Toggle current FAQ
      parent.classList.toggle('active');
      trigger.setAttribute('aria-expanded', !isExpanded);

      if (!isExpanded) {
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = '0';
      }
    });
  });
}


/**
 * Scroll triggered reveals (Word slide reveals, SVG drawing, Stats Count-up)
 */
function initScrollAnimations() {
  // 1. Text slide reveal trigger
  const revealWrappers = document.querySelectorAll('.reveal-wrapper');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealWrappers.forEach(wrap => revealObserver.observe(wrap));

  // 2. SVG Scribbles draw trigger
  const scribbles = document.querySelectorAll('.scribble-svg');
  const scribbleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('drawn');
        scribbleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  scribbles.forEach(sc => scribbleObserver.observe(sc));

  // 3. Philosophy card reveal animations
  const animateCards = document.querySelectorAll('.animate-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.getAttribute('data-delay')) || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay * 200);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  animateCards.forEach(card => cardObserver.observe(card));

}

/**
 * Tattoo Typing Animation
 */
function initTattooAnimation() {
  const textTarget = document.getElementById('tattoo-text-target');
  const container = document.getElementById('tattoo-text-container');
  if (!textTarget || !container) return;

  const phrase = "Transforming regrets into masterpieces.";
  let currentIndex = 0;
  let isTattooing = false;

  // Particle Splatter Generator
  function createSplat(x, y) {
    for (let i = 0; i < 4; i++) {
      const splat = document.createElement('span');
      splat.className = 'ink-splatter';
      splat.style.position = 'absolute';
      splat.style.left = `${x}px`;
      splat.style.top = `${y}px`;
      splat.style.width = `${Math.random() * 3 + 1}px`;
      splat.style.height = `${Math.random() * 3 + 1}px`;
      splat.style.background = '#ffffff';
      splat.style.borderRadius = '50%';
      splat.style.pointerEvents = 'none';
      splat.style.opacity = '0.8';
      splat.style.zIndex = '4';

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 15 + 5;
      const tx = Math.cos(angle) * speed;
      const ty = Math.sin(angle) * speed;

      container.appendChild(splat);

      gsap.to(splat, {
        x: tx,
        y: ty,
        opacity: 0,
        scale: 0.2,
        duration: 0.6 + Math.random() * 0.4,
        ease: 'power2.out',
        onComplete: () => splat.remove()
      });
    }
  }

  // Main typing function
  function tattooStep() {
    if (currentIndex >= phrase.length) {
      textTarget.classList.add('tattoo-complete');
      textTarget.style.textShadow = 'none';
      isTattooing = false;
      return;
    }

    isTattooing = true;

    // Append character
    const char = phrase[currentIndex];
    textTarget.innerHTML += char;
    currentIndex++;

    // Add temporary red skin irritation shadow
    textTarget.style.textShadow = '0 0 3px rgba(224, 93, 93, 0.9)';

    // Update coordinates for splatters
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.whiteSpace = 'pre';
    tempSpan.style.fontFamily = getComputedStyle(textTarget).fontFamily;
    tempSpan.style.fontSize = getComputedStyle(textTarget).fontSize;
    tempSpan.textContent = textTarget.textContent;
    container.appendChild(tempSpan);
    const width = tempSpan.offsetWidth;
    tempSpan.remove();

    // Create splatters at the writing point
    createSplat(width, 16);

    // Random timing interval representing the hand precision
    const interval = Math.random() * 80 + 90; // 90ms - 170ms per char
    setTimeout(tattooStep, interval);
  }

  // Click target to re-trigger
  container.addEventListener('click', () => {
    if (isTattooing) return;
    textTarget.innerHTML = "";
    textTarget.classList.remove('tattoo-complete');
    currentIndex = 0;
    tattooStep();
  });

  // Trigger writing animation after a short delay
  setTimeout(() => {
    tattooStep();
  }, 1200);
}

/**
 * Auto-sliding specs cards (Infinite Marquee) for mobile viewports
 */
function initCardsAutoSlide() {
  const container = document.querySelector('.philosophy-cards-grid');
  if (!container) return;

  const originalCards = Array.from(container.querySelectorAll('.philosophy-card'));
  if (originalCards.length <= 1) return;

  // Clone all cards twice to create a double seamless wrapping tail
  // This guarantees we never hit the browser scroll limit on any viewport
  for (let i = 0; i < 2; i++) {
    originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.classList.add('clone-card');
      clone.classList.add('revealed'); // Ensure clones are visible immediately
      container.appendChild(clone);
    });
  }

  let animationFrameId = null;
  const speed = window.innerWidth <= 768 ? 1.0 : 0.65; // speed parameter (pixels scrolled per frame, slightly faster on mobile)
  let isPressed = false;

  // Track pointer/touch presses to prevent fighting user drag/scroll
  container.addEventListener('mousedown', () => isPressed = true);
  container.addEventListener('touchstart', () => isPressed = true, { passive: true });

  const handleRelease = () => isPressed = false;
  window.addEventListener('mouseup', handleRelease);
  window.addEventListener('touchend', handleRelease);

  function step() {
    if (container.scrollWidth <= container.clientWidth) {
      animationFrameId = requestAnimationFrame(step);
      return;
    }

    // Scroll forward if the user is not actively pressing/swiping
    if (!isPressed) {
      container.scrollLeft += speed;
    }

    // Seamless loop check:
    // When the scrollLeft reaches/passes the offset of the first cloned card, loop back
    const firstClone = container.querySelector('.clone-card');
    const firstCard = originalCards[0];
    if (firstClone && firstCard) {
      const loopWidth = firstClone.offsetLeft - firstCard.offsetLeft;
      if (container.scrollLeft >= loopWidth) {
        container.scrollLeft -= loopWidth;
      } else if (container.scrollLeft < 0) {
        // If the user manually swiped backward past the start, loop forward
        container.scrollLeft += loopWidth;
      }
    }

    animationFrameId = requestAnimationFrame(step);
  }

  // Start marquee loop
  animationFrameId = requestAnimationFrame(step);
}

// Before/After comparison slider logic moved entirely to portfolio.js modal handler.

// Tattoo pen typing animation and preloader logic removed.

/**
 * Stacked Testimonials Scroll Animation (Apple/Linear-style Card Deck)
 */
function initTestimonialStack() {
  const section = document.querySelector('.testimonial-section');
  const cards = gsap.utils.toArray('.client-testimonial-card');
  const stackWrap = document.querySelector('.client-testimonials-stack-wrap');

  if (!section || cards.length < 3 || !stackWrap) return;

  const isMobile = window.innerWidth <= 768;

  // Let's set initial properties through GSAP to avoid any jumps
  // Card 1 starts active, Card 2 & 3 start layered behind
  gsap.set(cards[0], {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    opacity: 1,
    zIndex: 30
  });

  gsap.set(cards[1], {
    x: 0,
    y: isMobile ? 12 : 20,
    scale: 0.96,
    rotation: 2.5,
    opacity: 0.95,
    zIndex: 20
  });

  gsap.set(cards[2], {
    x: 0,
    y: isMobile ? 24 : 40,
    scale: 0.92,
    rotation: -2.5,
    opacity: 0.9,
    zIndex: 10
  });

  let tl;

  if (isMobile) {
    // MOBILE VERSION: Touch Drag & Swipe deck (Tinder-style stack loop)
    // This allows manual sliding with real-time finger tracking and spring snapbacks
    let deck = [...cards];
    const cardStates = [
      { y: 0, scale: 1, rotation: 0, opacity: 1, zIndex: 30 },
      { y: 15, scale: 0.96, rotation: 2.5, opacity: 0.95, zIndex: 20 },
      { y: 30, scale: 0.92, rotation: -2.5, opacity: 0.9, zIndex: 10 }
    ];

    function updateDeckPositions() {
      deck.forEach((card, idx) => {
        const state = cardStates[Math.min(idx, 2)];
        gsap.to(card, {
          x: 0,
          y: state.y,
          scale: state.scale,
          rotation: state.rotation,
          opacity: state.opacity,
          zIndex: state.zIndex,
          duration: 0.6,
          ease: "power3.out",
          force3D: true
        });
      });
    }

    deck.forEach((card) => {
      let startX = 0;
      let currentX = 0;
      let isDragging = false;

      card.addEventListener('touchstart', (e) => {
        if (deck[0] !== card) return; // Drag top card only
        startX = e.touches[0].clientX;
        isDragging = true;
        gsap.killTweensOf(card);
      }, { passive: true });

      card.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX - startX;

        // Drag top card with finger coordinates
        gsap.set(card, {
          x: currentX,
          rotation: (currentX / window.innerWidth) * 15,
          opacity: Math.max(0.5, 1 - Math.abs(currentX) / 250)
        });
      }, { passive: true });

      card.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;

        const threshold = 70; // Swipe threshold
        if (Math.abs(currentX) > threshold) {
          const direction = currentX > 0 ? 1 : -1;

          // Slide completely off screen, then move to bottom of stack
          gsap.to(card, {
            x: direction * window.innerWidth * 0.9,
            rotation: direction * 10,
            opacity: 0,
            duration: 0.45,
            ease: "power3.in",
            force3D: true,
            onComplete: () => {
              deck = deck.filter(c => c !== card);
              deck.push(card);

              // Instantly lower z-index and stack to back
              gsap.set(card, { zIndex: 10 });
              updateDeckPositions();
            }
          });
        } else {
          // Spring back to top active position
          gsap.to(card, {
            x: 0,
            rotation: 0,
            opacity: 1,
            duration: 0.5,
            ease: "elastic.out(1, 0.5)",
            force3D: true
          });
        }
        currentX = 0;
      });
    });

    // Initialize mobile card stack
    updateDeckPositions();

    // Premium entrance wiggle animation to indicate draggable cards
    gsap.timeline({
      scrollTrigger: {
        trigger: stackWrap,
        start: "top 85%",
        once: true
      }
    })
      .to(cards[0], { x: -28, rotation: -3, duration: 0.35, ease: "power2.out" })
      .to(cards[0], { x: 22, rotation: 2.5, duration: 0.45, ease: "power2.inOut" })
      .to(cards[0], { x: 0, rotation: 0, duration: 0.35, ease: "back.out(1.5)" });

    return;
  } else {
    // DESKTOP VERSION: Precise locked scroll pinning for detailed spring card deck swaps
    const scrollDistance = 900;
    tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: `+=${scrollDistance}`,
        scrub: 0.5,
        pin: true,
        anticipatePin: 1
      }
    });

    const slideInY = 380;
    const slideInRotation = 8;
    const stackBgY = -28;

    // --- TRANSITION 1: Card 1 goes to back, Card 2 slides over Card 1 to front ---
    tl.to(cards[0], {
      y: stackBgY,
      scale: 0.96,
      rotation: -2,
      opacity: 0.8,
      ease: "power2.inOut",
      duration: 1
    }, 0);

    tl.fromTo(cards[1],
      {
        y: slideInY,
        scale: 0.9,
        rotation: slideInRotation,
        opacity: 0
      },
      {
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        ease: "power2.inOut",
        duration: 1
      },
      0
    );

    tl.set(cards[1], { zIndex: 35 }, 0.5);
    tl.set(cards[0], { zIndex: 15 }, 0.5);

    // --- TRANSITION 2: Card 2 goes to back, Card 3 slides over Card 2 to front ---
    tl.to(cards[1], {
      y: stackBgY,
      scale: 0.96,
      rotation: 2,
      opacity: 0.8,
      ease: "power2.inOut",
      duration: 1
    }, 1);

    tl.to(cards[0], {
      y: stackBgY * 2,
      scale: 0.92,
      rotation: -4,
      opacity: 0.6,
      ease: "power2.inOut",
      duration: 1
    }, 1);

    tl.fromTo(cards[2],
      {
        y: slideInY,
        scale: 0.9,
        rotation: -slideInRotation,
        opacity: 0
      },
      {
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        ease: "power2.inOut",
        duration: 1
      },
      1
    );

    tl.set(cards[2], { zIndex: 40 }, 1.5);
    tl.set(cards[1], { zIndex: 25 }, 1.5);
  }
}

/**
 * Preloader Animation (Logo Only)
 */
function initPreloaderTattoo() {
  const loader = document.getElementById('screen-loader');
  const logo = document.getElementById('preloader-logo');
  const progress = document.getElementById('loader-progress');
  
  if (!loader || !logo) return;

  // Lock scrolling immediately
  document.documentElement.classList.add('loading');
  document.body.classList.add('loading');
  if (window.lenis) window.lenis.stop();

  // Set initial state (start visible, no jarring pop-in)
  gsap.set(logo, { opacity: 1, scale: 1 });

  // Create timeline
  const tl = gsap.timeline();

  // 1. Progress bar fills fast
  tl.to(progress, {
    width: '100%',
    duration: 1.8,
    ease: 'power1.inOut'
  });

  // 2. Glow pulse on logo
  tl.to(logo, {
    filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.45))',
    duration: 0.35,
    yoyo: true,
    repeat: 1,
    ease: 'power2.inOut'
  }, '-=0.5');

  // 3. Fade out loader fast
  tl.to(loader, {
    opacity: 0,
    duration: 0.4,
    ease: 'power2.out',
    onComplete: () => {
      loader.style.display = 'none';
      document.documentElement.classList.remove('loading');
      document.body.classList.remove('loading');
      if (window.lenis) window.lenis.start();
    }
  });
}
