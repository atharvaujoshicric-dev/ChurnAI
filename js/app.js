// ============================================================
//  ChurnAI — Application Controller
// ============================================================

const App = (() => {

  let currentIndustry = 'telecom';
  let currentPage = 'dashboard';

  // ── Init ───────────────────────────────────────────────────
  function init() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const page = item.dataset.page;
        navigateTo(page);
      });
    });

    // Industry select
    const sel = document.getElementById('industrySelect');
    sel.addEventListener('change', () => {
      currentIndustry = sel.value;
      refreshAll();
    });

    // Mobile menu
    document.getElementById('menuBtn').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    // Initial render
    refreshAll();
  }

  // ── Navigation ─────────────────────────────────────────────
  function navigateTo(page) {
    currentPage = page;

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Update pages
    document.querySelectorAll('.page').forEach(p => {
      p.classList.toggle('active', p.id === `page-${page}`);
    });

    // Update title
    const titles = {
      dashboard:   'Analytics Dashboard',
      prediction:  'Churn Prediction',
      segmentation:'Customer Segmentation',
      retention:   'Retention Engine',
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;

    // Render page-specific charts
    setTimeout(() => renderPageCharts(page), 50);

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
  }

  // ── Refresh All ────────────────────────────────────────────
  function refreshAll() {
    updateKPIs();
    renderAtRiskTable();
    buildPredictionForm();

    if (currentPage === 'dashboard') {
      ChurnCharts.renderChurnTrend(currentIndustry);
      ChurnCharts.renderRiskDonut();
    }
    if (currentPage === 'prediction') {
      ChurnCharts.renderFeatureImportance(currentIndustry);
    }
    if (currentPage === 'segmentation') {
      renderSegments();
      ChurnCharts.renderSegmentRadar(currentIndustry);
      ChurnCharts.renderSegmentPie(currentIndustry);
    }
    if (currentPage === 'retention') {
      renderRetention();
      ChurnCharts.renderROIChart(currentIndustry);
    }
  }

  function renderPageCharts(page) {
    if (page === 'dashboard') {
      ChurnCharts.renderChurnTrend(currentIndustry);
      ChurnCharts.renderRiskDonut();
    } else if (page === 'prediction') {
      ChurnCharts.renderFeatureImportance(currentIndustry);
      resetPredictionResult();
    } else if (page === 'segmentation') {
      renderSegments();
      ChurnCharts.renderSegmentRadar(currentIndustry);
      ChurnCharts.renderSegmentPie(currentIndustry);
    } else if (page === 'retention') {
      renderRetention();
      ChurnCharts.renderROIChart(currentIndustry);
    }
  }

  // ── KPIs ──────────────────────────────────────────────────
  function updateKPIs() {
    const kpi = ChurnData.industries[currentIndustry]?.kpi;
    if (!kpi) return;
    animateValue('kpiChurnRate', kpi.churnRate);
    animateValue('kpiAtRisk', kpi.atRisk);
    animateValue('kpiRetention', kpi.retention);
    animateValue('kpiRevenue', kpi.revenue);
  }

  function animateValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(4px)';
    setTimeout(() => {
      el.textContent = value;
      el.style.transition = 'opacity 0.3s, transform 0.3s';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 80);
  }

  // ── At-Risk Table ─────────────────────────────────────────
  function renderAtRiskTable() {
    const tbody = document.getElementById('atRiskBody');
    if (!tbody) return;
    const customers = ChurnData.getAtRiskCustomers(currentIndustry);

    tbody.innerHTML = customers.map(c => {
      const barColor = c.prob >= 70 ? '#ff4757' : c.prob >= 45 ? '#ff8c42' : '#00d68f';
      return `
        <tr>
          <td style="font-weight:500;">${c.name}</td>
          <td style="color:var(--text2);">${c.segment}</td>
          <td style="font-family:var(--font-mono);color:var(--text3);">${c.tenure}</td>
          <td><span class="risk-badge ${c.risk}">${c.risk.toUpperCase()}</span></td>
          <td>
            <div class="prob-bar">
              <div class="prob-bar-track">
                <div class="prob-bar-fill" style="width:${c.prob}%;background:${barColor};"></div>
              </div>
              <span class="prob-val" style="color:${barColor};">${c.prob}%</span>
            </div>
          </td>
          <td><button class="btn-tiny" onclick="App.viewCustomer('${c.name}')">Analyze →</button></td>
        </tr>
      `;
    }).join('');
  }

  // ── Prediction Form ───────────────────────────────────────
  function buildPredictionForm() {
    const container = document.getElementById('predictionForm');
    if (!container) return;
    const fields = ChurnData.industries[currentIndustry]?.formFields || [];

    container.innerHTML = fields.map(f => {
      if (f.type === 'select') {
        return `
          <div class="form-group">
            <label>${f.label}</label>
            <select id="field_${f.id}">
              ${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}
            </select>
          </div>
        `;
      }
      return `
        <div class="form-group">
          <label>${f.label}</label>
          <input type="number" id="field_${f.id}" value="${f.default}" min="${f.min}" max="${f.max}" />
        </div>
      `;
    }).join('');
  }

  function resetPredictionResult() {
    const result = document.getElementById('predictionResult');
    if (result) {
      result.innerHTML = `
        <div class="result-idle">
          <div class="result-icon">◎</div>
          <p>Fill in the form to run prediction</p>
        </div>
      `;
    }
  }

  // ── Predict ───────────────────────────────────────────────
  function predict() {
    const fields = ChurnData.industries[currentIndustry]?.formFields || [];
    const values = {};
    fields.forEach(f => {
      const el = document.getElementById(`field_${f.id}`);
      if (el) values[f.id] = el.value;
    });

    const result = ChurnData.predictChurn(values, currentIndustry);
    renderPredictionResult(result);
  }

  function renderPredictionResult(result) {
    const container = document.getElementById('predictionResult');
    if (!container) return;

    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (result.probability / 100) * circumference;

    container.innerHTML = `
      <div class="result-active">
        <div class="result-score-ring">
          <div class="ring-container">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle class="ring-bg" cx="50" cy="50" r="40"/>
              <circle class="ring-fill"
                cx="50" cy="50" r="40"
                stroke="${result.levelColor}"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${circumference}"
                id="ringFill"
              />
            </svg>
            <div class="ring-text">
              <div class="ring-pct" style="color:${result.levelColor};">${result.probability}%</div>
              <div class="ring-label">Churn Risk</div>
            </div>
          </div>
          <div class="score-details">
            <div class="score-level" style="color:${result.levelColor};">${result.level}</div>
            <div class="score-desc">${result.recommendation}</div>
          </div>
        </div>

        <div class="result-factors">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--text3);font-family:var(--font-mono);margin-bottom:6px;">Top Risk Factors</div>
          ${result.factors.map(f => `
            <div class="factor-row">
              <span class="factor-name">${f.name}</span>
              <div class="factor-bar-wrap">
                <div class="factor-bar-track">
                  <div class="factor-bar-fill" style="width:${Math.min(f.impact * 3, 100)}%;background:${f.direction === 'risk' ? result.levelColor : '#00d68f'};"></div>
                </div>
                <span class="factor-impact" style="color:${f.direction === 'risk' ? result.levelColor : '#00d68f'};">${f.direction === 'risk' ? '↑' : '↓'}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <button class="btn-primary" onclick="App.navigateTo('retention')" style="margin-top:8px;width:100%;justify-content:center;">
          View Retention Plans →
        </button>
      </div>
    `;

    // Animate ring
    setTimeout(() => {
      const ring = document.getElementById('ringFill');
      if (ring) ring.style.strokeDashoffset = offset;
    }, 100);
  }

  // ── Segments ──────────────────────────────────────────────
  function renderSegments() {
    const grid = document.getElementById('segmentsGrid');
    if (!grid) return;
    const segs = ChurnData.industries[currentIndustry]?.segments || [];

    grid.innerHTML = segs.map(seg => `
      <div class="segment-card">
        <div class="seg-icon">${seg.icon}</div>
        <div class="seg-name">${seg.name}</div>
        <div class="seg-count">${seg.count} customers</div>
        <div class="seg-stats">
          <div class="seg-stat">
            <span class="seg-stat-label">Churn Risk</span>
            <span class="seg-stat-val" style="color:${parseFloat(seg.churnRisk) > 40 ? 'var(--red)' : parseFloat(seg.churnRisk) > 15 ? 'var(--orange)' : 'var(--green)'};">${seg.churnRisk}</span>
          </div>
          <div class="seg-stat">
            <span class="seg-stat-label">Avg Revenue</span>
            <span class="seg-stat-val">${seg.avgRevenue}</span>
          </div>
          <div class="seg-stat">
            <span class="seg-stat-label">Est. CLV</span>
            <span class="seg-stat-val" style="color:var(--accent);">${seg.clv}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ── Retention ─────────────────────────────────────────────
  function renderRetention() {
    const grid = document.getElementById('retentionGrid');
    if (!grid) return;
    const campaigns = ChurnData.getRetentionCampaigns(currentIndustry);

    grid.innerHTML = campaigns.map(c => `
      <div class="retention-card">
        <div class="ret-card-header">
          <div class="ret-icon" style="background:${c.iconBg};">${c.icon}</div>
          <span class="ret-tag ${c.tag}">${c.tagLabel}</span>
        </div>
        <div class="ret-title">${c.title}</div>
        <div class="ret-desc">${c.desc}</div>
        <div class="ret-metrics">
          <div class="ret-metric">
            <div class="ret-metric-val" style="color:var(--green);">${c.metrics.successRate}</div>
            <div class="ret-metric-label">Success Rate</div>
          </div>
          <div class="ret-metric">
            <div class="ret-metric-val" style="color:var(--accent);">${c.metrics.avgSave}</div>
            <div class="ret-metric-label">Avg Saved</div>
          </div>
          <div class="ret-metric">
            <div class="ret-metric-val" style="color:var(--yellow);">${c.metrics.roi}</div>
            <div class="ret-metric-label">ROI</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ── Helpers ───────────────────────────────────────────────
  function viewCustomer(name) {
    navigateTo('prediction');
  }

  function runSegmentation() {
    const grid = document.getElementById('segmentsGrid');
    if (grid) {
      grid.style.opacity = '0.4';
      grid.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        renderSegments();
        ChurnCharts.renderSegmentRadar(currentIndustry);
        ChurnCharts.renderSegmentPie(currentIndustry);
        grid.style.opacity = '1';
      }, 600);
    }
  }

  function generateRetention() {
    const grid = document.getElementById('retentionGrid');
    if (grid) {
      grid.style.opacity = '0.4';
      setTimeout(() => {
        renderRetention();
        ChurnCharts.renderROIChart(currentIndustry);
        grid.style.opacity = '1';
        grid.style.transition = 'opacity 0.3s';
      }, 500);
    }
  }

  // Expose navigation for page button links
  const pages = { retention: () => navigateTo('retention') };

  // ── Boot ──────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

  return { predict, viewCustomer, runSegmentation, generateRetention, navigateTo, pages };
})();
