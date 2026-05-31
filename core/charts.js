/* ══════════════════════════════════════════
   core/charts.js
   ChurnAI — Chart.js Rendering Utility
   Shared chart factory used by all modules
   ══════════════════════════════════════════ */

const ChurnCharts = (() => {

  // Apply global Chart.js defaults
  Chart.defaults.color        = '#8891a8';
  Chart.defaults.borderColor  = '#1e2433';
  Chart.defaults.font.family  = "'DM Mono', monospace";
  Chart.defaults.font.size    = 11;

  // Registry of active chart instances (prevents canvas re-use errors)
  const registry = {};

  function destroy(key) {
    if (registry[key]) {
      registry[key].destroy();
      delete registry[key];
    }
  }

  const tooltip = {
    backgroundColor: '#181c24',
    borderColor:     '#2a3044',
    borderWidth:     1,
    padding:         10,
  };

  /* ── Churn Trend (Dashboard) ────────────────── */
  function renderChurnTrend(industry) {
    destroy('churnTrend');
    const ctx = document.getElementById('churnTrendChart');
    if (!ctx) return;
    const { months, churned, retained } = ChurnData.getChurnTrend(industry);
    registry['churnTrend'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          { label: 'Churned %',  data: churned,  borderColor: '#ff4757', backgroundColor: 'rgba(255,71,87,0.08)',  borderWidth: 2, tension: 0.4, fill: true, pointBackgroundColor: '#ff4757', pointRadius: 4, pointHoverRadius: 6 },
          { label: 'Retained %', data: retained, borderColor: '#00d68f', backgroundColor: 'rgba(0,214,143,0.05)', borderWidth: 2, tension: 0.4, fill: true, pointBackgroundColor: '#00d68f', pointRadius: 4, pointHoverRadius: 6 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: c => ` ${c.dataset.label}: ${c.raw}%` } } },
        scales: {
          x: { grid: { color: '#1e2433' } },
          y: { grid: { color: '#1e2433' }, ticks: { callback: v => v + '%' } },
        },
      },
    });
  }

  /* ── Risk Donut (Dashboard) ─────────────────── */
  function renderRiskDonut() {
    destroy('riskDonut');
    const ctx = document.getElementById('riskDonutChart');
    if (!ctx) return;
    registry['riskDonut'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['High Risk', 'Medium Risk', 'Low Risk'],
        datasets: [{ data: [18, 31, 51], backgroundColor: ['rgba(255,71,87,0.85)', 'rgba(255,140,66,0.85)', 'rgba(0,214,143,0.85)'], borderColor: '#0a0b0e', borderWidth: 3, hoverOffset: 6 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '68%',
        plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: c => ` ${c.label}: ${c.raw}%` } } },
      },
    });
  }

  /* ── Feature Importance (Prediction) ────────── */
  function renderFeatureImportance(industry) {
    destroy('featureImp');
    const ctx = document.getElementById('featureChart');
    if (!ctx) return;
    const features = ChurnData.industries[industry]?.features || [];
    const values   = features.map(() => Math.round(30 + Math.random() * 65));
    // Sort descending
    const paired = features.map((f, i) => [f, values[i]]).sort((a, b) => b[1] - a[1]);
    registry['featureImp'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: paired.map(p => p[0]),
        datasets: [{ label: 'Importance', data: paired.map(p => p[1]), backgroundColor: paired.map((_, i) => `rgba(0,229,255,${0.9 - i * 0.08})`), borderColor: 'transparent', borderRadius: 4 }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false }, tooltip: { ...tooltip } },
        scales: {
          x: { grid: { color: '#1e2433' }, max: 100 },
          y: { grid: { display: false } },
        },
      },
    });
  }

  /* ── Segment Radar (Segmentation) ───────────── */
  function renderSegmentRadar(industry) {
    destroy('segRadar');
    const ctx = document.getElementById('segmentRadar');
    if (!ctx) return;
    const segs   = ChurnData.industries[industry]?.segments || [];
    const labels = ['Engagement', 'Spend', 'Loyalty', 'Support Burden', 'Growth Potential'];
    const colors = ['#ff4757', '#ff8c42', '#ffd166', '#00d68f'];
    registry['segRadar'] = new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: segs.map((seg, i) => ({
          label: seg.name,
          data:  labels.map(() => Math.round(20 + Math.random() * 75)),
          borderColor: colors[i],
          backgroundColor: colors[i] + '15',
          borderWidth: 2,
          pointBackgroundColor: colors[i],
          pointRadius: 3,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 14 } }, tooltip: { ...tooltip } },
        scales: { r: { grid: { color: '#1e2433' }, angleLines: { color: '#1e2433' }, ticks: { display: false }, pointLabels: { font: { size: 11 } } } },
      },
    });
  }

  /* ── Segment Pie (Segmentation) ─────────────── */
  function renderSegmentPie(industry) {
    destroy('segPie');
    const ctx = document.getElementById('segmentPie');
    if (!ctx) return;
    const segs = ChurnData.industries[industry]?.segments || [];
    registry['segPie'] = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: segs.map(s => s.name),
        datasets: [{ data: [28, 31, 22, 19], backgroundColor: ['rgba(0,214,143,0.8)', 'rgba(0,229,255,0.8)', 'rgba(255,209,102,0.8)', 'rgba(255,71,87,0.8)'], borderColor: '#0a0b0e', borderWidth: 3, hoverOffset: 8 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 10 } } }, tooltip: { ...tooltip, callbacks: { label: c => ` ${c.label}: ${c.raw}%` } } },
      },
    });
  }

  /* ── ROI Bar (Retention) ────────────────────── */
  function renderROIChart(industry) {
    destroy('roi');
    const ctx = document.getElementById('roiChart');
    if (!ctx) return;
    const { labels, invest, returns } = ChurnData.getRoiProjection(industry);
    registry['roi'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Investment ($K)',       data: invest,  backgroundColor: 'rgba(124,58,237,0.7)', borderRadius: 4 },
          { label: 'Projected Return ($K)', data: returns, backgroundColor: 'rgba(0,229,255,0.7)',  borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { position: 'top', labels: { boxWidth: 10, padding: 16 } }, tooltip: { ...tooltip, callbacks: { label: c => ` ${c.dataset.label}: $${c.raw}K` } } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: '#1e2433' }, ticks: { callback: v => '$' + v + 'K' } },
        },
      },
    });
  }

  return { renderChurnTrend, renderRiskDonut, renderFeatureImportance, renderSegmentRadar, renderSegmentPie, renderROIChart };
})();
