// E7: Workday ATS content script
// Works on *.myworkdayjobs.com — consistent UI across all Workday-powered companies

(function applyaiWorkday() {
  if (document.querySelector('[data-applyai]')) return;
  document.documentElement.setAttribute('data-applyai', 'workday');
  console.log('[ApplyAI] Workday script active');
  // E7: detect job apply page, inject button, fill multi-step Workday form
})();
