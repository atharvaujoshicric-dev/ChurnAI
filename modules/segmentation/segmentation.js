/* ══════════════════════════════════════════
   modules/segmentation/segmentation.js
   MODULE 3 — Customer Segmentation
   Owns: segment cards, radar chart, pie chart
   ══════════════════════════════════════════ */

const SegmentationModule = (() => {

  function render(industry) {
    const section = document.getElementById('page-segmentation');
    section.innerHTML = buildHTML();
    populateSegments(industry);
    ChurnCharts.renderSegmentRadar(industry);
    ChurnCharts.renderSegmentPie(industry);
  }

  /* ── HTML Template ── */
  function buildHTML() {
    return `
      <!-- Page Header -->
      <div class="seg-page-header">
        <div>
          <h2 class="section-title">Customer Segmentation</h2>
          <p class="section-sub" style="margin-bottom:0;">AI-clustered customer groups based on behavior, value, and churn risk.</p>
        </div>
        <button class="btn-primary" onclick="SegmentationModule.recluster()">
          ↺ Re-cluster Segments
        </button>
      </div>

      <!-- Segment Cards -->
      <div class="segments-grid" id="segmentsGrid"></div>

      <!-- Charts Row -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-header"><h3>Segment Behavior Matrix</h3></div>
          <canvas id="segmentRadar" height="120"></canvas>
        </div>
        <div class="chart-card">
          <div class="chart-header"><h3>Segment Size Distribution</h3></div>
          <canvas id="segmentPie" height="160"></canvas>
        </div>
      </div>
    `;
  }

  /* ── Populate Segment Cards ── */
  function populateSegments(industry) {
    const grid = document.getElementById('segmentsGrid');
    if (!grid) return;
    const segs = ChurnData.industries[industry]?.segments || [];

    const riskColor = r => {
      const pct = parseFloat(r);
      return pct > 50 ? 'var(--red)' : pct > 20 ? 'var(--orange)' : 'var(--green)';
    };

    grid.innerHTML = segs.map(seg => `
      <div class="segment-card">
        <div class="seg-icon">${seg.icon}</div>
        <div class="seg-name">${seg.name}</div>
        <div class="seg-count">${seg.count} customers</div>
        <div class="seg-stats">
          <div class="seg-stat">
            <span class="seg-stat-label">Churn Risk</span>
            <span class="seg-stat-val" style="color:${riskColor(seg.churnRisk)};">${seg.churnRisk}</span>
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

  /* ── Re-cluster (animated refresh) ── */
  function recluster() {
    const grid = document.getElementById('segmentsGrid');
    if (!grid) return;
    grid.style.opacity = '0.35';
    setTimeout(() => {
      const industry = App.getIndustry();
      populateSegments(industry);
      ChurnCharts.renderSegmentRadar(industry);
      ChurnCharts.renderSegmentPie(industry);
      grid.style.opacity = '1';
    }, 600);
  }

  // Register with router
  document.addEventListener('DOMContentLoaded', () => App.register('segmentation', { render }));

  return { render, recluster };
})();
