import { gsap } from 'gsap';

document.addEventListener('DOMContentLoaded', () => {
  initBookingWizard();
});

/**
 * Immersive Consultation Wizard Controller
 */
function initBookingWizard() {
  const wizard = document.getElementById('consultation-wizard');
  const prevBtn = document.getElementById('wizard-prev-btn');
  const nextBtn = document.getElementById('wizard-next-btn');
  const steps = document.querySelectorAll('.form-step');
  const dots = document.querySelectorAll('.step-dot');
  const progressBar = document.getElementById('step-progress-bar');
  
  if (!wizard || steps.length === 0 || !prevBtn || !nextBtn) return;

  let currentStep = 1;
  const totalSteps = steps.length;

  // Initialize Sub-elements
  initBodyMap();
  initSizeSlider();
  initDropzone();
  initCalendar();
  initTimeSlots();
  initMockStripe();
  initTestimonialSlider();

  // Navigation Click Bindings
  nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        currentStep++;
        updateStepVisibility();
      } else {
        submitBookingForm();
      }
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateStepVisibility();
    }
  });

  // Direct Click on completed steps
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      const stepTarget = index + 1;
      // Allow moving backward freely, or forward only if previous step was valid
      if (stepTarget < currentStep) {
        currentStep = stepTarget;
        updateStepVisibility();
      } else if (stepTarget > currentStep && validateStep(currentStep)) {
        // Can only jump forward 1 step at a time via dots for validation sanity
        if (stepTarget === currentStep + 1) {
          currentStep = stepTarget;
          updateStepVisibility();
        }
      }
    });
  });

  /**
   * Update step wizard visibility and navigation states
   */
  function updateStepVisibility() {
    // Toggle form panels
    steps.forEach(step => {
      step.classList.remove('active');
      if (parseInt(step.getAttribute('data-step')) === currentStep) {
        step.classList.add('active');
      }
    });

    // Update Dots indicator
    dots.forEach((dot, index) => {
      const dotStep = index + 1;
      dot.classList.remove('active', 'completed');
      
      if (dotStep === currentStep) {
        dot.classList.add('active');
      } else if (dotStep < currentStep) {
        dot.classList.add('completed');
      }
    });

    // Update Connecting Progress Line Width
    const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`;
    }

    // Toggle Back button
    if (currentStep === 1) {
      prevBtn.style.visibility = 'hidden';
    } else {
      prevBtn.style.visibility = 'visible';
    }

    // Toggle Next button text on final step
    if (currentStep === totalSteps) {
      nextBtn.textContent = 'Confirm Consultation';
    } else {
      nextBtn.textContent = 'Next Step';
    }

    // Scroll to booking form top on mobile viewports only if the top of the form is scrolled out of view
    const bookingSec = document.getElementById('booking');
    if (bookingSec && window.innerWidth < 768) {
      const rect = bookingSec.getBoundingClientRect();
      if (rect.top < 0) {
        bookingSec.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  /**
   * Field Validation per Step
   */
  function validateStep(step) {
    let isValid = true;
    clearErrors(step);

    if (step === 1) {
      const name = document.getElementById('client-name');
      const email = document.getElementById('client-email');
      const phone = document.getElementById('client-phone');
      const style = document.getElementById('tattoo-style');
      const desc = document.getElementById('project-desc');

      if (!name.value.trim()) { showError(name, "Name is required"); isValid = false; }
      if (!email.value.trim() || !validateEmail(email.value)) { showError(email, "Provide a valid email"); isValid = false; }
      if (!phone.value.trim()) { showError(phone, "Phone number is required"); isValid = false; }
      if (!style.value) { showError(style, "Please pick a style"); isValid = false; }
      if (!desc.value.trim() || desc.value.trim().length < 15) { showError(desc, "Please describe in at least 15 characters"); isValid = false; }
    }
    
    else if (step === 2) {
      const placement = document.getElementById('placement-input');
      const budget = document.getElementById('client-budget');
      if (!placement.value) {
        alert("Please select a target placement on the body silhouette outline.");
        isValid = false;
      }
      if (!budget.value) {
        showError(budget, "Please select an estimated budget range");
        isValid = false;
      }
    }
    
    else if (step === 3) {
      const date = document.getElementById('date-input');
      const time = document.getElementById('time-input');

      if (!date.value) {
        alert("Please select a consultation date from the calendar grid.");
        isValid = false;
      } else if (!time.value) {
        alert("Please pick a preferred slot timing.");
        isValid = false;
      }
    }
    
    else if (step === 4) {
      const cardNum = document.getElementById('stripe-card-number');
      const expiry = document.getElementById('stripe-card-expiry');
      const cvc = document.getElementById('stripe-card-cvc');

      if (!cardNum.value.trim() || cardNum.value.replace(/\s/g, '').length < 16) {
        showCardError(cardNum); isValid = false;
      }
      if (!expiry.value.trim() || !expiry.value.includes('/')) {
        showCardError(expiry); isValid = false;
      }
      if (!cvc.value.trim() || cvc.value.length < 3) {
        showCardError(cvc); isValid = false;
      }
    }

    return isValid;
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(inputEl, msg) {
    inputEl.style.borderColor = '#E05D5D';
    const errText = document.createElement('span');
    errText.className = 'err-msg';
    errText.style.color = '#E05D5D';
    errText.style.fontSize = '10px';
    errText.style.marginTop = '4px';
    errText.textContent = msg;
    inputEl.parentElement.appendChild(errText);
  }

  function showCardError(inputEl) {
    inputEl.style.color = '#E05D5D';
    inputEl.style.borderColor = '#E05D5D';
  }

  function clearErrors(step) {
    const stepContainer = steps[step - 1];
    const errors = stepContainer.querySelectorAll('.err-msg');
    errors.forEach(err => err.remove());
    
    const inputs = stepContainer.querySelectorAll('.form-input, .stripe-mock-input input');
    inputs.forEach(input => {
      input.removeAttribute('style');
    });
  }

  /**
   * Final Form Submit Handler (Redirection and feedback)
   */
  function submitBookingForm() {
    // Show premium charging animation
    nextBtn.disabled = true;
    nextBtn.textContent = 'Verifying Transaction...';
    
    gsap.to('.stripe-mock-input', {
      borderColor: 'var(--color-brass)',
      opacity: 0.7,
      duration: 0.5,
      yoyo: true,
      repeat: 3
    });

    setTimeout(() => {
      nextBtn.textContent = 'Processing Deposit...';
      
      setTimeout(() => {
        // Collect form data to generate WhatsApp prefill message
        const name = document.getElementById('client-name').value;
        const phone = document.getElementById('client-phone').value;
        const email = document.getElementById('client-email').value;
        const style = document.getElementById('tattoo-style').value;
        const desc = document.getElementById('project-desc').value;
        const placement = document.getElementById('placement-input').value;
        const size = document.getElementById('size-slider').value;
        const budget = document.getElementById('client-budget').value;
        const date = document.getElementById('date-input').value;
        const time = document.getElementById('time-input').value;
        
        // Generate prefilled text
        const waText = `Hello Felipe Santos! I've confirmed my consultation.
*Name:* ${name}
*Phone Number:* ${phone}
*Email:* ${email}
*Tattoo Placement:* ${placement}
*Tattoo Style:* ${style}
*Tell Us Your Story:* ${desc}
*Approx. Size:* ${size}cm
*Estimated Budget:* €${budget}
*Date:* ${date}
*Time Slot:* ${time}
I look forward to starting my transformation!`;

        const waUrl = `https://wa.me/353831757502?text=${encodeURIComponent(waText)}`;

        // Replace booking form card with gorgeous confirmation visual
        const formCard = document.querySelector('.booking-form-card');
        formCard.innerHTML = `
          <div class="booking-confirmation">
            <div class="confirmation-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" stroke-width="1.5">
                <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="serif-display confirmation-title">Consultation Confirmed</h3>
            <p class="rhett-bio confirmation-text">
              We'll review your idea and get back to you within 24 hours. Click below to connect with Felipe directly on WhatsApp to share any references and discuss your story.
            </p>
            <a href="${waUrl}" target="_blank" class="btn btn-primary confirmation-btn">Connect on WhatsApp</a>
          </div>
        `;
        
      }, 1500);
    }, 1500);
  }
}

/**
 * Step 2: Body silhouette outline nodes mapping
 */
function initBodyMap() {
  const nodes = document.querySelectorAll('.body-node');
  const placementInput = document.getElementById('placement-input');
  const label = document.getElementById('selected-placement-label');
  
  if (nodes.length === 0 || !placementInput) return;

  nodes.forEach(node => {
    node.addEventListener('click', () => {
      // Clear selected state
      nodes.forEach(n => n.classList.remove('selected'));
      
      // Select current node
      node.classList.add('selected');
      
      // Update hidden input and visual label
      const val = node.getAttribute('data-placement');
      placementInput.value = val;
      
      // Format label
      const formatted = val.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
      label.textContent = formatted;
    });
  });
}

/**
 * Step 2: Dynamic Size Slider update
 */
function initSizeSlider() {
  const slider = document.getElementById('size-slider');
  const valLabel = document.getElementById('size-val');
  if (!slider || !valLabel) return;

  slider.addEventListener('input', (e) => {
    valLabel.textContent = e.target.value;
  });
}

/**
 * Step 3: Drag & Drop File Upload Dropzone triggers
 */
function initDropzone() {
  const dropzone = document.getElementById('upload-dropzone');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  
  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--color-brass)';
    dropzone.style.background = 'rgba(242, 239, 234, 0.08)';
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.removeAttribute('style');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.removeAttribute('style');
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });

  function handleFiles(files) {
    fileList.innerHTML = '';
    const fileNames = Array.from(files).map(f => f.name);
    
    if (fileNames.length > 0) {
      fileList.innerHTML = `Selected References (${fileNames.length}): ${fileNames.join(', ')}`;
    }
  }
}

/**
 * Step 3: Dynamic Calendar Grid Rendering (July 2026)
 */
function initCalendar() {
  const calendar = document.getElementById('booking-calendar');
  const dateInput = document.getElementById('date-input');
  if (!calendar || !dateInput) return;

  // July 2026 constants
  const monthName = "July 2026";
  const totalDays = 31;
  const startDayOffset = 2; // Wednesday (Monday starts at 0, Wednesday starts at index 2 in Mo-Su header)
  
  // Render empty cells for start offset
  for (let i = 0; i < startDayOffset; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day empty';
    calendar.appendChild(emptyCell);
  }

  // Render month days
  for (let day = 1; day <= totalDays; day++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    dayCell.textContent = day;
    
    // Disable past days (say days before 21st, since current mock local date is 21st June, everything in July is future)
    // Wait, let's keep all active except Sundays (Sundays closed for booking)
    const dayOfWeek = (startDayOffset + day - 1) % 7;
    if (dayOfWeek === 6) { // Index 6 is Sunday in Mo-Su columns
      dayCell.classList.add('disabled');
      dayCell.title = "Studio Closed";
    }

    dayCell.addEventListener('click', () => {
      if (dayCell.classList.contains('disabled')) return;

      // Deselect other cells
      calendar.querySelectorAll('.calendar-day').forEach(cell => {
        cell.classList.remove('selected');
      });

      // Highlight selected
      dayCell.classList.add('selected');
      dateInput.value = `2026-07-${day < 10 ? '0' + day : day}`;
    });

    calendar.appendChild(dayCell);
  }
}

/**
 * Step 3: Time Slot Selector clicks
 */
function initTimeSlots() {
  const slots = document.querySelectorAll('.time-slot');
  const timeInput = document.getElementById('time-input');
  if (slots.length === 0 || !timeInput) return;

  slots.forEach(slot => {
    slot.addEventListener('click', () => {
      slots.forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      timeInput.value = slot.getAttribute('data-slot');
    });
  });
}

/**
 * Step 4: Credit card input spacing auto-formatting
 */
function initMockStripe() {
  const cardNum = document.getElementById('stripe-card-number');
  const expiry = document.getElementById('stripe-card-expiry');
  const cvc = document.getElementById('stripe-card-cvc');

  if (!cardNum || !expiry || !cvc) return;

  // Formatting Card Numbers (4 4 4 4)
  cardNum.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formatted = [];
    for (let i = 0; i < val.length; i += 4) {
      formatted.push(val.substring(i, i + 4));
    }
    e.target.value = formatted.join(' ');
  });

  // Formatting Expiry Date (MM/YY)
  expiry.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (val.length >= 2) {
      e.target.value = val.substring(0, 2) + '/' + val.substring(2, 4);
    } else {
      e.target.value = val;
    }
  });

  // Formatting CVC
  cvc.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').substring(0, 4);
  });
}

/**
 * Section 8: Testimonial fade-in slider
 */
function initTestimonialSlider() {
  const track = document.getElementById('testimonial-track');
  const prevBtn = document.getElementById('testimonial-prev-btn');
  const nextBtn = document.getElementById('testimonial-next-btn');
  const slides = document.querySelectorAll('.testimonial-slide');
  
  if (!track || slides.length === 0 || !prevBtn || !nextBtn) return;

  let currentIdx = 0;
  const totalSlides = slides.length;

  const updateSlider = () => {
    track.style.transform = `translateX(-${currentIdx * 100}%)`;
  };

  nextBtn.addEventListener('click', () => {
    currentIdx = (currentIdx + 1) % totalSlides;
    updateSlider();
  });

  prevBtn.addEventListener('click', () => {
    currentIdx = (currentIdx - 1 + totalSlides) % totalSlides;
    updateSlider();
  });

  // Auto rotate testimonials every 6s
  let interval = setInterval(() => {
    currentIdx = (currentIdx + 1) % totalSlides;
    updateSlider();
  }, 6500);

  // Pause rotate on button interact
  const resetInterval = () => {
    clearInterval(interval);
    interval = setInterval(() => {
      currentIdx = (currentIdx + 1) % totalSlides;
      updateSlider();
    }, 6500);
  };

  prevBtn.addEventListener('click', resetInterval);
  nextBtn.addEventListener('click', resetInterval);
}
