// E6: Indeed.com content script
// Injects ApplyAI button on Indeed job pages and handles apply form filling

(function applyaiIndeed() {
  if (document.querySelector('[data-applyai]')) return;
  document.documentElement.setAttribute('data-applyai', 'indeed');
  console.log('[ApplyAI] Indeed script active');
  // E6: detect job page, inject button, fill Indeed Easy Apply form
})();
