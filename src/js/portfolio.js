import { gsap } from 'gsap';

// Mock Case Study Database for Dynamic Modal Content
const CASE_STUDIES = {
  "1": {
    title: "The Guitar Metamorphosis",
    style: "Cover-Up / Realism",
    duration: "8 Hours",
    meta: "Anatomical Flow Rebuild",
    desc: "A complete reconstruction of a faded, low-detail forearm tattoo. Redesigned to map perfectly to the muscular structure of the arm, integrating deep shadows and organic realism curves to seamlessly blend the old pigment into a high-contrast dark realism guitar flow."
  },
  "2": {
    title: "The Lion Transition",
    style: "Cover-Up / Realism",
    duration: "10 Hours",
    meta: "Faded Ink Re-shaping",
    desc: "Taking low-contrast faded work and bringing it into high-fidelity black & grey realism. Rebuilding anatomical depth, using strategic shading and deep micro-textures to draw focus to the lion's piercing eyes, transforming a past regret into a powerful statement."
  },
  "3": {
    title: "Cinematic Realism Upgrade",
    style: "Black & Grey Realism",
    duration: "12 Hours",
    meta: "High-Contrast Portrait Sleeve",
    desc: "A large-scale project transforming older, blurred lines into a high-contrast cinematic portrait. Features dynamic depth and soft smooth shading, giving the entire arm a cohesive sleeve layout and structural balance."
  },
  "4": {
    title: "The Pride Reborn",
    style: "Cover-Up",
    duration: "7 Hours",
    meta: "Strategic Camouflage Shading",
    desc: "Utilizing custom shadow patterns to completely obscure older tribal branding. Formulated around the natural movement of the bicep to ensure no distortion, establishing a balanced composition of light and shadow."
  },
  "5": {
    title: "The Timeless Legacy",
    style: "Black & Grey Realism",
    duration: "9 Hours",
    meta: "Anatomical Flow Sleeve",
    desc: "A full sleeve integration leveraging the body's contours. Transitioning outlines and shapes into smooth gradients and high contrast to completely hide past ink, resulting in an intentional, beautiful artwork."
  },
  "6": {
    title: "Celtic Cross Revival",
    style: "Cover-Up / Realism",
    duration: "6 Hours",
    meta: "Outdated Linework Transformation",
    desc: "Converting hard, uneven lines of an outdated design into a smooth, realistic monument study. Utilizing high-density black ink and subtle highlights to create an authentic 3D texture."
  }
};


document.addEventListener('DOMContentLoaded', () => {
  initPortfolioFilters();
  initPortfolioDrag();
  initPortfolioModal();
});

/**
 * Filter Cards Category Selection
 */
function initPortfolioFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.portfolio-item');
  const carousel = document.getElementById('portfolio-carousel');
  if (filterButtons.length === 0 || items.length === 0) return;

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Set active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filterValue = button.getAttribute('data-filter');

      // GSAP animate items filtering out, then reorganizing
      gsap.to(items, {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          items.forEach(item => {
            const category = item.getAttribute('data-category');
            if (filterValue === 'all' || category === filterValue) {
              item.style.display = 'block';
            } else {
              item.style.display = 'none';
            }
          });

          // Reset carousel position to left on filter change
          if (carousel) {
            carousel.parentElement.scrollLeft = 0;
          }

          // Animate back in
          gsap.to(items, {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            delay: 0.1
          });
        }
      });
    });
  });
}

/**
 * Inertia Drag-to-Scroll for Carousel (Desktop Touch Emulation)
 */
function initPortfolioDrag() {
  const slider = document.getElementById('portfolio-carousel-wrapper');
  if (!slider) return;

  let isDown = false;
  let startX;
  let scrollLeft;
  let velX = 0;
  let momentumID;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    cancelAnimationFrame(momentumID);
  });

  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.classList.remove('active');
  });

  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.classList.remove('active');
    // Start inertia physics scroll on release
    applyInertia();
  });

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    
    const prevScrollLeft = slider.scrollLeft;
    slider.scrollLeft = scrollLeft - walk;
    
    // Calculate speed velocity
    velX = slider.scrollLeft - prevScrollLeft;
  });

  // Mobile native touch triggers velocity values as well
  slider.addEventListener('touchstart', () => {
    cancelAnimationFrame(momentumID);
  });

  function applyInertia() {
    if (Math.abs(velX) > 0.5) {
      slider.scrollLeft += velX;
      velX *= 0.92; // Friction dampening coefficient
      momentumID = requestAnimationFrame(applyInertia);
    }
  }
}

/**
 * Case Study Detail Modals
 */
function initPortfolioModal() {
  const modal = document.getElementById('portfolio-modal');
  const modalMeta = document.getElementById('modal-meta');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalDuration = document.getElementById('modal-duration');
  const modalStyle = document.getElementById('modal-style');
  const closeBtn = document.getElementById('modal-close');
  
  const items = document.querySelectorAll('.portfolio-item');
  if (!modal || items.length === 0) return;

  // Click card to open modal and bind database data
  items.forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      const data = CASE_STUDIES[id];
      if (!data) return;

      // Extract before/after image sources from the clicked card
      const beforeWrapper = item.querySelector('.before-wrapper img');
      const afterWrapper = item.querySelector('.after-wrapper img');
      const beforeSrc = beforeWrapper ? beforeWrapper.src : '';
      const afterSrc = afterWrapper ? afterWrapper.src : '';

      // Populate text nodes
      modalMeta.textContent = data.meta;
      modalTitle.textContent = data.title;
      modalDesc.innerHTML = `<p>${data.desc}</p>`;
      modalDuration.textContent = data.duration;
      modalStyle.textContent = data.style;

      // Build interactive modal before/after slider or single image fallback
      const mediaContainer = modal.querySelector('.modal-media');
      if (mediaContainer) {
        if (beforeSrc && afterSrc) {
          mediaContainer.innerHTML = `
            <div class="modal-slider-container">
              <div class="modal-slider-img before-img-wrap">
                <div class="ba-badge before">BEFORE</div>
                <img src="${beforeSrc}" alt="Before: ${data.title}">
              </div>
              <div class="modal-slider-img after-img-wrap">
                <div class="ba-badge after">AFTER</div>
                <img src="${afterSrc}" alt="After: ${data.title}">
              </div>
              <div class="ba-slider-line"></div>
              <div class="ba-slider-handle"></div>
            </div>
          `;

          // Set up dragging on the modal slider
          const modalSlider = mediaContainer.querySelector('.modal-slider-container');
          let isModalDragging = false;
          modalSlider.style.setProperty('--slide-pos', '50%');

          // Prevent native browser image drag and drop behavior
          modalSlider.addEventListener('dragstart', (e) => e.preventDefault());

          const updateModalSlider = (clientX) => {
            const rect = modalSlider.getBoundingClientRect();
            const x = clientX - rect.left;
            let percentage = (x / rect.width) * 100;
            if (percentage < 0) percentage = 0;
            if (percentage > 100) percentage = 100;
            modalSlider.style.setProperty('--slide-pos', `${percentage}%`);
          };

          modalSlider.addEventListener('pointerdown', (e) => {
            isModalDragging = true;
            modalSlider.setPointerCapture(e.pointerId);
            updateModalSlider(e.clientX);
          });

          modalSlider.addEventListener('pointermove', (e) => {
            if (!isModalDragging) return;
            updateModalSlider(e.clientX);
          });

          modalSlider.addEventListener('pointerup', (e) => {
            if (!isModalDragging) return;
            isModalDragging = false;
            modalSlider.releasePointerCapture(e.pointerId);
          });

          modalSlider.addEventListener('pointercancel', (e) => {
            isModalDragging = false;
          });
        } else {
          // Fallback to static image
          const defaultImg = item.querySelector('img') ? item.querySelector('img').src : '';
          mediaContainer.innerHTML = `<img id="modal-img" src="${defaultImg}" alt="${data.title}">`;
        }
      }

      // Open Modal via active class
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock main scroll
      
      // GSAP animate content reveals
      gsap.fromTo('.modal-container', 
        { scale: 0.95, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.6, ease: 'power4.out' }
      );
    });
  });

  // Prevent scroll propagation from modal to body
  const modalContainer = document.querySelector('.modal-container');
  if (modalContainer) {
    modalContainer.addEventListener('wheel', (e) => {
      e.stopPropagation();
    }, { passive: false });
    modalContainer.addEventListener('touchmove', (e) => {
      e.stopPropagation();
    }, { passive: false });
  }

  // Also prevent scroll on the modal backdrop from scrolling body
  modal.addEventListener('wheel', (e) => {
    if (e.target === modal) {
      e.preventDefault();
    }
  }, { passive: false });

  // Close triggers
  const closeModal = () => {
    gsap.to('.modal-container', {
      scale: 0.95,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.in',
      onComplete: () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Unlock main scroll
      }
    });
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  
  // Close on outer backdrop clicks
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape keyboard click
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}
