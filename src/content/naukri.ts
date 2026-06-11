// E5: Naukri.com content script
// Injects ApplyAI button on Naukri job pages and handles apply form filling

(function applyaiNaukri() {
  if (document.querySelector('[data-applyai]')) return;
  document.documentElement.setAttribute('data-applyai', 'naukri');
  console.log('[ApplyAI] Naukri script active');
  // E5: detect job detail page, inject button, fill application form
})();
