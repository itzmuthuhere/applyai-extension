// E4: LinkedIn Easy Apply content script
// Injects ApplyAI button on LinkedIn job pages and handles Easy Apply form filling

(function applyaiLinkedIn() {
  if (document.querySelector('[data-applyai]')) return;
  document.documentElement.setAttribute('data-applyai', 'linkedin');
  console.log('[ApplyAI] LinkedIn script active');
  // E4: detect job page, inject sidebar button, fill Easy Apply modal
})();
