// ============================================================
//  ChurnAI — Charts Module
//  All Chart.js visualizations
// ============================================================

const ChurnCharts = (() => {

  // Common defaults
  Chart.defaults.color = '#8891a8';
  Chart.defaults.borderColor = '#1e2433';
  Chart.defaults.font.family = "'DM Mono', monospace";
  Chart.defaults.font.size = 11;

  const instances = {};

  function destroy(id) {
    if (instances[id]) { instances[id].destroy(); delete instances[id]; }
  }

  // ── Churn Trend Line Chart ────────────────────────────────
  function renderChurnTrend(industry) {
    destroy('churnTrend');
    const { months, churned, retained } = ChurnData.getChurnTrend(industry);
    const ctx = document.getElementById('churnTrendChart');
    if (!ctx) return;

    instances['churnTrend'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Churned %',
            data: churned,
            borderColor: '#ff4757',
            backgroundColor: 'rgba(255,71,87,0.08)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#ff4757',
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Retained %',
            data: retained,
            borderColor: '#00d68f',
            backgroundColor: 'rgba(0,214,143,0.05)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#00d68f',
            pointRadius: 4,
            pointHoverRadius: 6,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#181c24',
            borderColor: '#2a3044',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}%`
            }
          }
        },
        scales: {
          x: { grid: { color: '#1e2433' } },
          y: {
            grid: { color: '#1e2433' },
            ticks: { callback: v => v + '%' }
          }
        }
      }
    });
  }

  // ── Risk Donut Chart ──────────────────────────────────────
  function renderRiskDonut() {
    destroy('riskDonut');
    const ctx = document.getElementById('riskDonutChart');
    if (!ctx) return;

    instances['riskDonut'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['High Risk', 'Medium Risk', 'Low Risk'],
        datasets: [{
          data: [18, 31, 51],
          backgroundColor: ['rgba(255,71,87,0.85)', 'rgba(255,140,66,0.85)', 'rgba(0,214,143,0.85)'],
          borderColor: '#0a0b0e',
          borderWidth: 3,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#181c24',
            borderColor: '#2a3044',
            borderWidth: 1,
            callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}%` }
          }
        }
      }
    });
  }

  // ── Feature Importance Bar Chart ─────────────────────────
  function renderFeatureImportance(industry) {
    destroy('featureImp');
    const features = ChurnData.industries[industry]?.features || [];
    const values = features.map(() => Math.round(30 + Math.random() * 65));
    values.sort((a, b) => b - a);

    const ctx = document.getElementById('featureChart');
    if (!ctx) return;

    instances['featureImp'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: features,
        datasets: [{
          label: 'Importance Score',
          data: values,
          backgroundColor: values.map((v, i) => {
            const alpha = 0.5 + (i / values.length) * 0.4;
            return `rgba(0,229,255,${0.9 - i * 0.08})`;
          }),
          borderColor: 'transparent',
          borderRadius: 4,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#181c24',
            borderColor: '#2a3044',
            borderWidth: 1,
          }
        },
        scales: {
          x: { grid: { color: '#1e2433' }, max: 100 },
          y: { grid: { display: false } }
        }
      }
    });
  }

  // ── Segment Radar Chart ───────────────────────────────────
  function renderSegmentRadar(industry) {
    destroy('segRadar');
    const ctx = document.getElementById('segmentRadar');
    if (!ctx) return;

    const segs = ChurnData.industries[industry]?.segments || [];
    const labels = ['Engagement', 'Spend', 'Loyalty', 'Support Burden', 'Growth Potential'];
    const colors = ['#ff4757', '#ff8c42', '#ffd166', '#00d68f'];

    instances['segRadar'] = new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: segs.map((seg, i) => ({
          label: seg.name,
          data: labels.map(() => Math.round(20 + Math.random() * 75)),
          borderColor: colors[i],
          backgroundColor: colors[i].replace(')', ',0.08)').replace('rgb', 'rgba'),
          borderWidth: 2,
          pointBackgroundColor: colors[i],
          pointRadius: 3,
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, padding: 14 }
          },
          tooltip: {
            backgroundColor: '#181c24',
            borderColor: '#2a3044',
            borderWidth: 1,
          }
        },
        scales: {
          r: {
            grid: { color: '#1e2433' },
            angleLines: { color: '#1e2433' },
            ticks: { display: false },
            pointLabels: { font: { size: 11 } }
          }
        }
      }
    });
  }

  // ── Segment Pie Chart ─────────────────────────────────────
  function renderSegmentPie(industry) {
    destroy('segPie');
    const ctx = document.getElementById('segmentPie');
    if (!ctx) return;

    const segs = ChurnData.industries[industry]?.segments || [];
    const sizes = [28, 31, 22, 19];

    instances['segPie'] = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: segs.map(s => s.name),
        datasets: [{
          data: sizes,
          backgroundColor: ['rgba(0,214,143,0.8)', 'rgba(0,229,255,0.8)', 'rgba(255,209,102,0.8)', 'rgba(255,71,87,0.8)'],
          borderColor: '#0a0b0e',
          borderWidth: 3,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, padding: 12, font: { size: 10 } }
          },
          tooltip: {
            backgroundColor: '#181c24',
            borderColor: '#2a3044',
            borderWidth: 1,
            callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}%` }
          }
        }
      }
    });
  }

  // ── ROI Bar Chart ─────────────────────────────────────────
  function renderROIChart(industry) {
    destroy('roi');
    const ctx = document.getElementById('roiChart');
    if (!ctx) return;

    const data = ChurnData.getRoiProjection();
    // Get campaign titles for this industry
    const campaigns = ChurnData.getRetentionCampaigns(industry);
    const labels = campaigns.slice(0, 6).map(c => c.title.split(' ').slice(0, 2).join(' '));
    const invest = [12, 8, 5, 3, 15, 4];
    const returns = [50, 41, 14, 6, 51, 7];

    instances['roi'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Investment ($K)',
            data: invest,
            backgroundColor: 'rgba(124,58,237,0.7)',
            borderRadius: 4,
          },
          {
            label: 'Projected Return ($K)',
            data: returns,
            backgroundColor: 'rgba(0,229,255,0.7)',
            borderRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 10, padding: 16 }
          },
          tooltip: {
            backgroundColor: '#181c24',
            borderColor: '#2a3044',
            borderWidth: 1,
            callbacks: { label: ctx => ` ${ctx.dataset.label}: $${ctx.raw}K` }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: '#1e2433' },
            ticks: { callback: v => '$' + v + 'K' }
          }
        }
      }
    });
  }

  return {
    renderChurnTrend,
    renderRiskDonut,
    renderFeatureImportance,
    renderSegmentRadar,
    renderSegmentPie,
    renderROIChart,
  };
})();
