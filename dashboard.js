document.addEventListener('DOMContentLoaded', function() {
  let selectedCaption = null;
  let selectedImage = null;
  let selectedSchedule = null;

  // ===========================
  // ⏳ Display Current Time
  // ===========================
  function updateCurrentTime() {
    const nowPH = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila', hour12: false });
    const nowJP = new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo', hour12: false });

    const timePH = document.getElementById('timePH');
    const timeJP = document.getElementById('timeJP');

    if (timePH) timePH.textContent = nowPH;
    if (timeJP) timeJP.textContent = nowJP;
  }
  setInterval(updateCurrentTime, 1000);
  updateCurrentTime();

  // ===========================
  // 🟩 Utility Functions
  // ===========================
  function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.classList.add('active');
  }

  function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.classList.remove('active');
  }

  function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.classList.add('active');
      setTimeout(() => element.classList.remove('active'), 5000);
    }
  }

  function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.classList.add('active');
      setTimeout(() => element.classList.remove('active'), 3000);
    }
  }

  function showLoadingMessage(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
          <span>${message}</span>
        </div>
      `;
      element.classList.add('active');
    }
  }

  function hideLoadingMessage(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove('active');
      element.innerHTML = '';
    }
  }

  function updateCounters() {
    const captionCounter = document.getElementById('captionCounter');
    const imageCounter = document.getElementById('imageCounter');
    const timeCounter = document.getElementById('timeCounter');
    if (captionCounter) captionCounter.textContent = selectedCaption ? '1 selected' : '0 selected';
    if (imageCounter) imageCounter.textContent = selectedImage ? '1 selected' : '0 selected';
    if (timeCounter) timeCounter.textContent = selectedSchedule ? '1 selected' : '0 selected';
  }

  function checkSubmitEnabled() {
    const submitBtn = document.getElementById('submit');
    if (submitBtn) submitBtn.disabled = !(selectedCaption && selectedImage && selectedSchedule);
  }

  function resetContent() {
    const captions = document.getElementById('captions');
    const images = document.getElementById('images');
    const schedulePicker = document.getElementById('schedulePicker');
    const submitBtn = document.getElementById('submit');
    const captionsEmpty = document.getElementById('captionsEmpty');
    const imagesEmpty = document.getElementById('imagesEmpty');

    if (captions) captions.innerHTML = '';
    if (images) images.innerHTML = '';
    selectedCaption = null;
    selectedImage = null;
    selectedSchedule = null;
    if (schedulePicker) schedulePicker.value = '';
    if (submitBtn) submitBtn.disabled = true;
    updateCounters();

    if (captionsEmpty) captionsEmpty.style.display = 'block';
    if (imagesEmpty) imagesEmpty.style.display = 'block';
  }

  // Initialize time counter
  updateCounters();

  // ===========================
  // 📅 Schedule Picker Listener
  // ===========================
  const schedulePicker = document.getElementById('schedulePicker');
  if (schedulePicker) {
    schedulePicker.addEventListener('change', (e) => {
      selectedSchedule = e.target.value;
      checkSubmitEnabled();
      updateCounters();
    });
  }

  // ===========================
  // 🚀 Generate Button
  // ===========================
  const generateBtn = document.getElementById('generate');
  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      const topicInput = document.getElementById('topic');
      const topic = topicInput ? topicInput.value.trim() : '';
      
      if (!topic) {
        showError('generateError', 'Please enter a topic to generate content');
        return;
      }

      resetContent();

      const captionsEmpty = document.getElementById('captionsEmpty');
      const imagesEmpty = document.getElementById('imagesEmpty');
      if (captionsEmpty) captionsEmpty.style.display = 'none';
      if (imagesEmpty) imagesEmpty.style.display = 'none';
      showLoading('captionsLoading');
      showLoading('imagesLoading');

      try {
        const res = await fetch('https://n8nai.ai8mations.com/webhook-test/aoigenerate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic })
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();

        hideLoading('captionsLoading');
        hideLoading('imagesLoading');

        if (!data.captions || !data.images) throw new Error('Invalid response format from server');

        // Captions
        const captionsContainer = document.getElementById('captions');
        if (captionsContainer) {
          data.captions.forEach(caption => {
            const div = document.createElement('div');
            div.className = 'caption-item';
            div.textContent = caption;
            div.addEventListener('click', () => {
              document.querySelectorAll('.caption-item').forEach(el => el.classList.remove('selected'));
              div.classList.add('selected');
              selectedCaption = caption;
              updateCounters();
              checkSubmitEnabled();
            });
            captionsContainer.appendChild(div);
          });
        }

        // Images
        const imagesContainer = document.getElementById('images');
        if (imagesContainer) {
          data.images.forEach(imgUrl => {
            const div = document.createElement('div');
            div.className = 'image-item';
            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = 'Generated image';
            img.onerror = () => {
              img.style.display = 'none';
              div.innerHTML += '<p style="color: var(--error);">Image failed to load</p>';
            };
            div.appendChild(img);
            div.addEventListener('click', () => {
              document.querySelectorAll('.image-item').forEach(el => el.classList.remove('selected'));
              div.classList.add('selected');
              selectedImage = imgUrl;
              updateCounters();
              checkSubmitEnabled();
            });
            imagesContainer.appendChild(div);
          });
        }

        showSuccess('generateSuccess', 'Content generated successfully!');
        
      } catch (error) {
        console.error('Generation error:', error);
        hideLoading('captionsLoading');
        hideLoading('imagesLoading');
        showError('generateError', `Failed to generate content: ${error.message}`);
        if (captionsEmpty) captionsEmpty.style.display = 'block';
        if (imagesEmpty) imagesEmpty.style.display = 'block';
      }
    });
  }

  // ===========================
  // 📤 Submit Button
  // ===========================
  const submitBtn = document.getElementById('submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      if (!selectedCaption || !selectedImage || !selectedSchedule) {
        showError('submitError', 'Please select a caption, an image, and a schedule');
        return;
      }

      // Show loading state
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>⏳ Submitting...</span>';
      submitBtn.disabled = true;

      // Show loading message
      showLoadingMessage('submitSuccess', 'Submitting your Instagram post...');

      // Convert schedule to ISO 8601
      const scheduleISO = new Date(selectedSchedule).toISOString();

      const payload = {
        caption: selectedCaption,
        imageUrl: selectedImage,
        postTime: scheduleISO
      };

      console.log('Sending selection:', payload);

      try {
        const res = await fetch('https://n8nai.ai8mations.com/webhook/selection1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        // Clear loading state
        submitBtn.innerHTML = originalText;
        hideLoadingMessage('submitSuccess');

        if (res.ok) {
          showSuccess('submitSuccess', 'Caption and image submitted for posting! Refresh the page to generate new content.');
          disableInterfaceAfterSubmission();
        } else {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
      } catch (error) {
        console.error('Submission error:', error);

        // Clear loading state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        hideLoadingMessage('submitSuccess');

        showError('submitError', `Failed to submit selection: ${error.message}`);
      }
    });
  }

  // ===========================
  // 🚫 Disable Interface After Submission
  // ===========================
  function disableInterfaceAfterSubmission() {
    // Disable all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      section.classList.add('disabled');
    });

    // Hide submit section and show refresh section
    const submitSection = document.getElementById('submit');
    const refreshSection = document.getElementById('refreshSection');
    if (submitSection) submitSection.style.display = 'none';
    if (refreshSection) refreshSection.style.display = 'block';

    // Add disabled overlay to main sections
    const mainSections = document.querySelectorAll('.section:not(.pending-posts)');
    mainSections.forEach(section => {
      const overlay = document.createElement('div');
      overlay.className = 'disabled-overlay';
      overlay.innerHTML = `
        <div class="disabled-message">
          <div class="icon">✅</div>
          <h4>Content Submitted</h4>
          <p>Your Instagram post has been scheduled for automated publishing.</p>
        </div>
      `;
      section.appendChild(overlay);
    });
  }

  // Initialize empty states
  const captionsEmpty = document.getElementById('captionsEmpty');
  const imagesEmpty = document.getElementById('imagesEmpty');
  if (captionsEmpty) captionsEmpty.style.display = 'block';
  if (imagesEmpty) imagesEmpty.style.display = 'block';

  // ===========================
  // 🌙 Theme Toggle
  // ===========================
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const themeText = document.getElementById('themeText');
    const themeIcon = themeToggle.querySelector('i');

    const applyTheme = (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        if (themeIcon) themeIcon.className = 'fas fa-sun';
        if (themeText) themeText.textContent = 'Light';
      } else {
        if (themeIcon) themeIcon.className = 'fas fa-moon';
        if (themeText) themeText.textContent = 'Dark';
      }
    };

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
    });
  }
  
  // ===========================
  // 🚨 Browser Close/Refresh Warning
  // ===========================
  window.addEventListener('beforeunload', function(e) {
    // Check if there's any data that would be lost
    const topicInput = document.getElementById('topic');
    const hasTopic = topicInput ? topicInput.value.trim() : '';
    const hasSelections = selectedCaption || selectedImage || selectedSchedule;

    if (hasTopic || hasSelections) {
      // Cancel the event
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = '';

      // Show custom confirmation dialog
      const userChoice = confirm(
        '⚠️ WARNING: You are about to leave this page!\n\n' +
        'All current data including:\n' +
        '• Entered topic\n' +
        '• Generated captions and images\n' +
        '• Selected content\n' +
        '• Scheduled posting time\n\n' +
        'Will be permanently deleted and reset.\n\n' +
        'Click "OK" to continue and lose all data, or "Cancel" to stay on this page.'
      );

      // If user clicks Cancel, prevent the navigation
      if (!userChoice) {
        return false;
      }
    }
  });
});