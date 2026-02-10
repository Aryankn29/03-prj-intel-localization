// ============================================
// RTL Auto-Detection and Form Handling
// ============================================

(function() {
  'use strict';

  // RTL Language Detection
  // Detects when page language changes (e.g., via Google Translate) and applies RTL
  const RTL_LANGUAGES = [
    'ar', 'he', 'fa', 'ur', 'yi', 'ji', 'iw', 'ku', 'ps', 'sd'
  ];

  /**
   * Detects if current language is RTL
   * Checks both HTML lang attribute and computed text direction
   */
  function isRTL() {
    const html = document.documentElement;
    const lang = html.getAttribute('lang') || '';
    const langCode = lang.split('-')[0].toLowerCase();
    
    // Check if language code is in RTL list
    if (RTL_LANGUAGES.includes(langCode)) {
      return true;
    }
    
    // Check computed direction of body text (works with Google Translate)
    const body = document.body;
    const computedStyle = window.getComputedStyle(body);
    const direction = computedStyle.direction;
    
    return direction === 'rtl';
  }

  /**
   * Applies RTL layout to the page
   */
  function applyRTL() {
    const html = document.documentElement;
    html.setAttribute('dir', 'rtl');
    html.classList.add('rtl-mode');
    document.body.classList.add('rtl-mode');
  }

  /**
   * Applies LTR layout to the page
   */
  function applyLTR() {
    const html = document.documentElement;
    html.setAttribute('dir', 'ltr');
    html.classList.remove('rtl-mode');
    document.body.classList.remove('rtl-mode');
  }

  /**
   * Updates layout based on detected direction
   */
  function updateLayoutDirection() {
    if (isRTL()) {
      applyRTL();
    } else {
      applyLTR();
    }
  }

  // Initial check on page load
  updateLayoutDirection();

  // Monitor for language changes (Google Translate, manual lang changes, etc.)
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
        updateLayoutDirection();
      }
    });
  });

  // Observe changes to HTML lang attribute
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang']
  });

  // Also check periodically for direction changes (for Google Translate)
  // Google Translate adds a class to body, check for that too
  setInterval(function() {
    const currentDir = document.documentElement.getAttribute('dir');
    const shouldBeRTL = isRTL();
    
    // Also check if body has RTL direction set by Google Translate
    const bodyStyle = window.getComputedStyle(document.body);
    const bodyDir = bodyStyle.direction;
    
    if ((shouldBeRTL || bodyDir === 'rtl') && currentDir !== 'rtl') {
      applyRTL();
      if (!document.documentElement.getAttribute('lang') || 
          !RTL_LANGUAGES.includes(document.documentElement.getAttribute('lang').split('-')[0].toLowerCase())) {
        document.documentElement.setAttribute('lang', 'ar');
      }
    } else if (!shouldBeRTL && bodyDir !== 'rtl' && currentDir !== 'ltr') {
      applyLTR();
      if (RTL_LANGUAGES.includes(document.documentElement.getAttribute('lang')?.split('-')[0].toLowerCase())) {
        document.documentElement.setAttribute('lang', 'en');
      }
    }
  }, 1000);

  // Monitor body direction changes (Google Translate modifies this)
  const bodyObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      // Check if direction changed
      if (mutation.type === 'attributes') {
        const bodyStyle = window.getComputedStyle(document.body);
        const bodyDir = bodyStyle.direction;
        const htmlDir = document.documentElement.getAttribute('dir');
        
        if (bodyDir === 'rtl' && htmlDir !== 'rtl') {
          applyRTL();
        } else if (bodyDir === 'ltr' && htmlDir !== 'ltr') {
          applyLTR();
        }
      }
    });
  });

  bodyObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['style', 'class'],
    attributeOldValue: true,
    subtree: false
  });
  
  // Also observe documentElement for lang changes from Google Translate
  const langObserver = new MutationObserver(function() {
    setTimeout(updateLayoutDirection, 100); // Small delay to let Google Translate finish
  });
  
  langObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang', 'dir'],
    subtree: false
  });

  // ============================================
  // Form Validation and Submission
  // ============================================

  // Bootstrap form validation
  const form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      event.stopPropagation();

      if (form.checkValidity()) {
        // Show success modal
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        
        // Reset form
        form.reset();
        form.classList.remove('was-validated');
      } else {
        form.classList.add('was-validated');
      }
    }, false);
  }

  // Console log for debugging RTL detection
  console.log('RTL Detection initialized. Current direction:', document.documentElement.getAttribute('dir'));
  
  // Expose function for manual testing
  window.testRTL = function() {
    applyRTL();
    console.log('RTL mode activated manually');
  };
  
  window.testLTR = function() {
    applyLTR();
    console.log('LTR mode activated manually');
  };

  // ============================================
  // Simple Language Buttons
  // ============================================
  const btnEnglish = document.getElementById('btnEnglish');
  const btnArabic = document.getElementById('btnArabic');
  const btnHebrew = document.getElementById('btnHebrew');
  
  function setActiveButton(activeBtn) {
    [btnEnglish, btnArabic, btnHebrew].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });
    if (activeBtn) activeBtn.classList.add('active');
  }
  
  function showLayoutChange(direction) {
    // Add visual indicator that layout changed
    const indicator = document.createElement('div');
    indicator.id = 'layoutIndicator';
    indicator.style.cssText = 'position:fixed;top:60px;right:20px;z-index:1001;background:#4CAF50;color:white;padding:10px 20px;border-radius:4px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.3);';
    indicator.textContent = direction === 'rtl' ? 'RTL Layout Active' : 'LTR Layout Active';
    document.body.appendChild(indicator);
    
    setTimeout(function() {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 2000);
  }
  
  if (btnEnglish) {
    btnEnglish.addEventListener('click', function() {
      applyLTR();
      document.documentElement.setAttribute('lang', 'en');
      setActiveButton(btnEnglish);
      showLayoutChange('ltr');
      console.log('Switched to English (LTR)');
    });
  }
  
  if (btnArabic) {
    btnArabic.addEventListener('click', function() {
      applyRTL();
      document.documentElement.setAttribute('lang', 'ar');
      setActiveButton(btnArabic);
      showLayoutChange('rtl');
      console.log('Switched to Arabic (RTL) - Layout direction changed. Use Google Translate to see Arabic text.');
    });
  }
  
  if (btnHebrew) {
    btnHebrew.addEventListener('click', function() {
      applyRTL();
      document.documentElement.setAttribute('lang', 'he');
      setActiveButton(btnHebrew);
      showLayoutChange('rtl');
      console.log('Switched to Hebrew (RTL) - Layout direction changed. Use Google Translate to see Hebrew text.');
    });
  }
  
  // Set initial active button
  const currentLang = document.documentElement.getAttribute('lang') || 'en';
  if (currentLang.startsWith('ar') && btnArabic) {
    setActiveButton(btnArabic);
  } else if (currentLang.startsWith('he') && btnHebrew) {
    setActiveButton(btnHebrew);
  } else if (btnEnglish) {
    setActiveButton(btnEnglish);
  }
})();
