/* ══════════════════════════════════════════
   modules/retention/retention.js
   MODULE 4 — Retention Engine
   Owns: campaign cards, ROI chart
   ══════════════════════════════════════════ */

const RetentionModule = (() => {

  function render(industry) {
    const section = document.getElementById('page-retention');
    section.innerHTML = buildHTML();
    populateCampaigns(industry);
    ChurnCharts.renderROIChart(industry);
  }

  /* ── HTML Template ── */
  function buildHTML() {
    return `
      <!-- Page Header -->
      <div class="retention-page-header">
        <div>
          <h2 class="section-title">Retention Recommendation Engine</h2>
          <p class="section-sub" style="margin-bottom:0;">AI-generated campaigns ranked by projected ROI and success rate.</p>
        </div>
        <div class="retention-filters">
          <select class="filter-select" id="retentionSegmentFilter">
            <option value="all">All Segments</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
          </select>
          <button class="btn-primary" onclick="RetentionModule.generateCampaigns()">
            ✦ Generate Campaigns
          </button>
        </div>
      </div>

      <!-- Campaign Cards -->
      <div class="retention-grid" id="retentionGrid"></div>

      <!-- ROI Chart -->
      <div class="roi-card">
        <h3>Projected Campaign ROI</h3>
        <canvas id="roiChart" height="80"></canvas>
      </div>
    `;
  }

  /* ── Populate Campaign Cards ── */
  function populateCampaigns(industry) {
    const grid = document.getElementById('retentionGrid');
    if (!grid) return;
    const campaigns = ChurnData.getRetentionCampaigns(industry);

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
            <div class="ret-metric-val" style="color:var(--green);">${c.successRate}</div>
            <div class="ret-metric-label">Success Rate</div>
          </div>
          <div class="ret-metric">
            <div class="ret-metric-val" style="color:var(--accent);">${c.avgSave}</div>
            <div class="ret-metric-label">Avg Saved</div>
          </div>
          <div class="ret-metric">
            <div class="ret-metric-val" style="color:var(--yellow);">${c.roi}</div>
            <div class="ret-metric-label">ROI</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  /* ── Regenerate (animated) ── */
  function generateCampaigns() {
    const grid = document.getElementById('retentionGrid');
    if (!grid) return;
    grid.style.opacity = '0.35';
    setTimeout(() => {
      const industry = App.getIndustry();
      populateCampaigns(industry);
      ChurnCharts.renderROIChart(industry);
      grid.style.opacity = '1';
    }, 500);
  }

  // Register with router
  document.addEventListener('DOMContentLoaded', () => App.register('retention', { render }));

  return { render, generateCampaigns };
})();
