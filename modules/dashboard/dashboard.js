/* ══════════════════════════════════════════
   modules/dashboard/dashboard.js
   MODULE 1 — Analytics Dashboard
   Owns: KPI cards, trend chart, risk donut,
         at-risk customer table
   ══════════════════════════════════════════ */

const DashboardModule = (() => {

  function render(industry) {
    const section = document.getElementById('page-dashboard');
    section.innerHTML = buildHTML();
    populateKPIs(industry);
    populateTable(industry);
    ChurnCharts.renderChurnTrend(industry);
    ChurnCharts.renderRiskDonut();
  }

  /* ── HTML Template ── */
  function buildHTML() {
    return `
      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card danger">
          <div class="kpi-label">Churn Rate</div>
          <div class="kpi-value" id="kpiChurnRate">—</div>
          <div class="kpi-trend up">↑ 1.2% this month</div>
        </div>
        <div class="kpi-card warning">
          <div class="kpi-label">At-Risk Customers</div>
          <div class="kpi-value" id="kpiAtRisk">—</div>
          <div class="kpi-trend up">↑ 234 new alerts</div>
        </div>
        <div class="kpi-card success">
          <div class="kpi-label">Retention Rate</div>
          <div class="kpi-value" id="kpiRetention">—</div>
          <div class="kpi-trend down">↓ 0.8% vs last month</div>
        </div>
        <div class="kpi-card info">
          <div class="kpi-label">Revenue at Risk</div>
          <div class="kpi-value" id="kpiRevenue">—</div>
          <div class="kpi-trend up">↑ $42K forecast</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row" style="margin-bottom:24px;">
        <div class="chart-card">
          <div class="chart-header">
            <h3>Churn Trend — 12 Months</h3>
            <div class="chart-legend">
              <span class="leg-dot red"></span>Churned
              <span class="leg-dot green"></span>Retained
            </div>
          </div>
          <canvas id="churnTrendChart" height="100"></canvas>
        </div>
        <div class="chart-card">
          <div class="chart-header"><h3>Risk Distribution</h3></div>
          <canvas id="riskDonutChart" height="160"></canvas>
          <div class="donut-legend">
            <span><span class="leg-dot red"></span>High Risk (18%)</span>
            <span><span class="leg-dot orange"></span>Medium Risk (31%)</span>
            <span><span class="leg-dot green"></span>Low Risk (51%)</span>
          </div>
        </div>
      </div>

      <!-- At-Risk Table -->
      <div class="table-card">
        <div class="table-header">
          <h3>Top At-Risk Customers</h3>
          <button class="btn-outline" onclick="App.goTo('retention')">Run Retention →</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Segment</th>
              <th>Tenure</th>
              <th>Risk Level</th>
              <th>Churn Probability</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="dashTableBody"></tbody>
        </table>
      </div>
    `;
  }

  /* ── KPI Population ── */
  function populateKPIs(industry) {
    const kpi = ChurnData.industries[industry]?.kpi;
    if (!kpi) return;
    [['kpiChurnRate', kpi.churnRate], ['kpiAtRisk', kpi.atRisk], ['kpiRetention', kpi.retention], ['kpiRevenue', kpi.revenue]].forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(4px)';
      requestAnimationFrame(() => {
        el.textContent = val;
        el.style.transition = 'opacity 0.3s, transform 0.3s';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  }

  /* ── At-Risk Table ── */
  function populateTable(industry) {
    const tbody = document.getElementById('dashTableBody');
    if (!tbody) return;
    const customers = ChurnData.getAtRiskCustomers(industry);
    const barColor = p => p >= 70 ? '#ff4757' : p >= 45 ? '#ff8c42' : '#00d68f';

    tbody.innerHTML = customers.map(c => `
      <tr>
        <td style="font-weight:500;">${c.name}</td>
        <td style="color:var(--text2);">${c.segment}</td>
        <td style="font-family:var(--font-mono);color:var(--text3);">${c.tenure}</td>
        <td><span class="risk-badge ${c.risk}">${c.risk.toUpperCase()}</span></td>
        <td>
          <div class="prob-bar">
            <div class="prob-bar-track">
              <div class="prob-bar-fill" style="width:${c.prob}%;background:${barColor(c.prob)};"></div>
            </div>
            <span class="prob-val" style="color:${barColor(c.prob)};">${c.prob}%</span>
          </div>
        </td>
        <td><button class="btn-tiny" onclick="App.goTo('prediction')">Analyze →</button></td>
      </tr>
    `).join('');
  }

  // Register with router
  document.addEventListener('DOMContentLoaded', () => App.register('dashboard', { render }));

  return { render };
})();
