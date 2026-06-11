// E7: Greenhouse ATS content script
// Works on boards.greenhouse.io — consistent UI across Greenhouse-powered companies

(function applyaiGreenhouse() {
  if (document.querySelector('[data-applyai]')) return;
  document.documentElement.setAttribute('data-applyai', 'greenhouse');
  console.log('[ApplyAI] Greenhouse script active');
  // E7: detect job page, inject button, fill Greenhouse application form
})();
