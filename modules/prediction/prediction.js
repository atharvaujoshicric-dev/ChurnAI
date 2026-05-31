/* ══════════════════════════════════════════
   modules/prediction/prediction.js
   MODULE 2 — Churn Prediction
   Owns: dynamic form, probability ring,
         risk factors, feature importance chart
   ══════════════════════════════════════════ */

const PredictionModule = (() => {

  let _industry = 'telecom';

  function render(industry) {
    _industry = industry;
    const section = document.getElementById('page-prediction');
    section.innerHTML = buildHTML(industry);
    ChurnCharts.renderFeatureImportance(industry);
  }

  /* ── HTML Template ── */
  function buildHTML(industry) {
    const fields = ChurnData.industries[industry]?.formFields || [];
    const formHTML = fields.map(f => {
      if (f.type === 'select') {
        return `
          <div class="form-group">
            <label>${f.label}</label>
            <select id="field_${f.id}">
              ${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}
            </select>
          </div>`;
      }
      return `
        <div class="form-group">
          <label>${f.label}</label>
          <input type="number" id="field_${f.id}" value="${f.default}" min="${f.min}" max="${f.max}" />
        </div>`;
    }).join('');

    return `
      <div class="prediction-layout">

        <!-- Input Form -->
        <div class="prediction-form-card">
          <h2 class="section-title">Customer Churn Predictor</h2>
          <p class="section-sub">Enter a customer profile to get an instant AI-powered churn probability score.</p>
          <div class="form-grid">${formHTML}</div>
          <button class="btn-primary" onclick="PredictionModule.runPrediction()" style="width:100%;justify-content:center;">
            <span>Analyze Customer</span>
            <span>→</span>
          </button>
        </div>

        <!-- Result Panel -->
        <div class="prediction-result-card" id="predictionResult">
          <div class="result-idle">
            <div class="result-icon">◎</div>
            <p>Fill in the form and click Analyze</p>
          </div>
        </div>

      </div>

      <!-- Feature Importance -->
      <div class="feature-importance-card">
        <h3>Feature Importance — Model Explainability</h3>
        <canvas id="featureChart" height="80"></canvas>
      </div>
    `;
  }

  /* ── Run Prediction ── */
  function runPrediction() {
    const fields = ChurnData.industries[_industry]?.formFields || [];
    const values = {};
    fields.forEach(f => {
      const el = document.getElementById(`field_${f.id}`);
      if (el) values[f.id] = el.value;
    });

    const result = ChurnData.predictChurn(values, _industry);
    renderResult(result);
  }

  /* ── Render Result Panel ── */
  function renderResult(result) {
    const container = document.getElementById('predictionResult');
    if (!container) return;

    const r        = 40;
    const circ     = 2 * Math.PI * r;
    const offset   = circ - (result.probability / 100) * circ;

    container.innerHTML = `
      <div class="result-active">

        <!-- Score Ring -->
        <div class="result-score-ring">
          <div class="ring-container">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle class="ring-bg"   cx="50" cy="50" r="${r}" />
              <circle class="ring-fill" cx="50" cy="50" r="${r}"
                stroke="${result.levelColor}"
                stroke-dasharray="${circ}"
                stroke-dashoffset="${circ}"
                id="animRing"
              />
            </svg>
            <div class="ring-text">
              <span class="ring-pct"  style="color:${result.levelColor};">${result.probability}%</span>
              <span class="ring-label">Churn Risk</span>
            </div>
          </div>
          <div class="score-details">
            <div class="score-level" style="color:${result.levelColor};">${result.level}</div>
            <div class="score-desc">${result.recommendation}</div>
          </div>
        </div>

        <!-- Top Risk Factors -->
        <div class="result-factors">
          <div class="factors-label">Top Risk Factors</div>
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

        <!-- CTA -->
        <button class="btn-primary" onclick="App.goTo('retention')" style="width:100%;justify-content:center;margin-top:4px;">
          View Retention Plans →
        </button>

      </div>
    `;

    // Animate ring after paint
    requestAnimationFrame(() => {
      setTimeout(() => {
        const ring = document.getElementById('animRing');
        if (ring) ring.style.strokeDashoffset = offset;
      }, 80);
    });
  }

  // Register with router
  document.addEventListener('DOMContentLoaded', () => App.register('prediction', { render }));

  return { render, runPrediction };
})();
