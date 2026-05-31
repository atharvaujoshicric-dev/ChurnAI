/* ══════════════════════════════════════════
   core/app.js
   ChurnAI — Application Router
   Handles navigation & industry switching.
   Each module manages its own rendering.
   v2: Auth-aware — checks canAccess before
       rendering a protected page.
   ══════════════════════════════════════════ */

const App = (() => {

  let industry = 'telecom';
  let page     = 'dashboard';

  const PAGE_TITLES = {
    dashboard:    'Analytics Dashboard',
    prediction:   'Churn Prediction',
    segmentation: 'Customer Segmentation',
    retention:    'Retention Engine',
    alerts:       'Live Alerts',
  };

  const modules = {};

  function register(name, mod) {
    modules[name] = mod;
  }

  /* ── Boot ── */
  function init() {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(el.dataset.page);
      });
    });

    document.getElementById('industrySelect').addEventListener('change', e => {
      industry = e.target.value;
      renderPage(page);
    });

    document.getElementById('menuBtn').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    renderPage('dashboard');
  }

  /* ── Navigation ── */
  function navigateTo(target) {
    if (target === page) return;
    page = target;

    document.querySelectorAll('.nav-item').forEach(el =>
      el.classList.toggle('active', el.dataset.page === target)
    );
    document.querySelectorAll('.page').forEach(el =>
      el.classList.toggle('active', el.id === `page-${target}`)
    );
    document.getElementById('pageTitle').textContent = PAGE_TITLES[target] || target;
    document.getElementById('sidebar').classList.remove('open');

    setTimeout(() => renderPage(target), 50);
  }

  /* ── Render page — with auth gate ── */
  function renderPage(target) {
    // Auth guard: if AuthModule is loaded and user lacks access, show restricted notice
    if (typeof AuthModule !== 'undefined' && !AuthModule.canAccess(target)) {
      const section = document.getElementById(`page-${target}`);
      if (section) {
        section.innerHTML =
          AuthModule.getRestrictedBanner(PAGE_TITLES[target] || target) +
          `<div style="text-align:center;padding:60px 20px;color:var(--text3);font-family:var(--font-mono);font-size:13px;">
            Contact an Admin to unlock this module.
          </div>`;
      }
      return;
    }

    const mod = modules[target];
    if (mod && typeof mod.render === 'function') {
      mod.render(industry);
    }
  }

  function goTo(target)     { navigateTo(target); }
  function getIndustry()    { return industry; }

  document.addEventListener('DOMContentLoaded', init);

  return { register, goTo, getIndustry };
})();
