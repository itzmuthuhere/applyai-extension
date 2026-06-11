// E7: Lever ATS content script
// Works on jobs.lever.co — consistent UI across Lever-powered companies

(function applyaiLever() {
  if (document.querySelector('[data-applyai]')) return;
  document.documentElement.setAttribute('data-applyai', 'lever');
  console.log('[ApplyAI] Lever script active');
  // E7: detect job page, inject button, fill Lever application form
})();
