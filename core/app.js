/* ══════════════════════════════════════════
   core/app.js
   ChurnAI — Application Router
   Handles navigation & industry switching.
   Each module manages its own rendering.
   ══════════════════════════════════════════ */

const App = (() => {

  let industry = 'telecom';
  let page     = 'dashboard';

  const PAGE_TITLES = {
    dashboard:    'Analytics Dashboard',
    prediction:   'Churn Prediction',
    segmentation: 'Customer Segmentation',
    retention:    'Retention Engine',
  };

  // Module registry — each module registers itself
  const modules = {};

  function register(name, mod) {
    modules[name] = mod;
  }

  /* ── Boot ── */
  function init() {
    // Nav clicks
    document.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(el.dataset.page);
      });
    });

    // Industry switcher
    document.getElementById('industrySelect').addEventListener('change', e => {
      industry = e.target.value;
      onIndustryChange();
    });

    // Mobile sidebar toggle
    document.getElementById('menuBtn').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    // Initial render
    renderPage('dashboard');
  }

  /* ── Navigation ── */
  function navigateTo(target) {
    if (target === page) return;
    page = target;

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(el =>
      el.classList.toggle('active', el.dataset.page === target)
    );

    // Update page sections
    document.querySelectorAll('.page').forEach(el =>
      el.classList.toggle('active', el.id === `page-${target}`)
    );

    // Update topbar title
    document.getElementById('pageTitle').textContent = PAGE_TITLES[target] || target;

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');

    // Render the target module
    setTimeout(() => renderPage(target), 50);
  }

  /* ── Render a page's module ── */
  function renderPage(target) {
    const mod = modules[target];
    if (mod && typeof mod.render === 'function') {
      mod.render(industry);
    }
  }

  /* ── Industry change → re-render active page ── */
  function onIndustryChange() {
    renderPage(page);
  }

  /* ── Public API for modules to call each other ── */
  function goTo(target) { navigateTo(target); }
  function getIndustry() { return industry; }

  document.addEventListener('DOMContentLoaded', init);

  return { register, goTo, getIndustry };
})();
