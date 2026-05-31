/* ══════════════════════════════════════════
   modules/alerts/alerts.js
   MODULE 6 — Live Alerts Feed
   Owns: alert cards, severity filter,
         dismiss, auto-generate, nav badge
   ══════════════════════════════════════════ */

const AlertsModule = (() => {

  let _alerts      = [];
  let _filter      = 'all';
  let _searchQuery = '';
  let _ticker      = null;
  let _industry    = 'telecom';

  /* ── Alert Templates per Industry ── */
  const ALERT_TEMPLATES = {
    telecom: [
      { severity: 'critical', icon: '🔴', title: 'Mass Contract Expiry Detected',       desc: 'Cluster of 47 month-to-month customers approaching billing cycle. Predicted churn probability: 82%.',       segment: 'Contract Endings',     prob: 82, customer: null,       type: 'Cluster Alert'   },
      { severity: 'critical', icon: '⚠️',  title: 'High-Value Customer At Risk',         desc: 'Customer Sarah K. ($89/mo, 23 months) filed 3rd complaint this week. Immediate intervention recommended.',    segment: 'Service Dissatisfied', prob: 87, customer: 'Sarah K.', type: 'Individual Alert' },
      { severity: 'warning',  icon: '📉',  title: 'Data Usage Drop — Possible Churn',   desc: '312 customers showed >60% drop in data usage over the past 2 billing cycles. Typically precedes cancel.',     segment: 'Price Sensitives',     prob: 61, customer: null,       type: 'Trend Alert'     },
      { severity: 'warning',  icon: '💳',  title: 'Payment Failure Spike',               desc: '28 customers had auto-pay failures in the last 48 hours. 14 have not updated payment details.',               segment: 'At Risk',              prob: 68, customer: null,       type: 'Payment Alert'   },
      { severity: 'warning',  icon: '📞',  title: 'Support Queue Surge',                 desc: 'Service calls up 34% this week. Top complaint: billing confusion. Correlates with 19% churn uplift.',          segment: 'Service Dissatisfied', prob: 55, customer: null,       type: 'Ops Alert'       },
      { severity: 'info',     icon: '✅',  title: 'Retention Campaign Success',          desc: '63 customers from the Contract Upgrade campaign confirmed renewal. $4,221 MRR saved this week.',               segment: 'Contract Endings',     prob: 12, customer: null,       type: 'Success'         },
      { severity: 'info',     icon: '📊',  title: 'Churn Rate Improved — West Region',  desc: 'Monthly churn in the West region dropped from 14.2% to 11.8% following support team expansion.',              segment: 'All',                  prob: 18, customer: null,       type: 'Insight'         },
      { severity: 'critical', icon: '🚨',  title: 'Morgan B. — Cancellation Intent',    desc: 'Customer Morgan B. ($71/mo) visited cancellation page 4 times today. Zero engagement for 19 days.',             segment: 'Service Dissatisfied', prob: 93, customer: 'Morgan B.',type: 'Individual Alert' },
    ],
    saas: [
      { severity: 'critical', icon: '🔴', title: 'Enterprise Account Login Drop',        desc: 'RetailPlus account: logins fell from 42/week to 3/week over the past 21 days. Renewal due in 30 days.',       segment: 'Churning Soon',        prob: 89, customer: 'RetailPlus',   type: 'Account Alert'   },
      { severity: 'critical', icon: '⚠️',  title: 'Payment Failure — Pro Plan',          desc: '3 Pro plan customers had payment failures. Auto-retry scheduled. If unresolved, access suspended in 72h.',     segment: 'Churning Soon',        prob: 76, customer: null,            type: 'Payment Alert'   },
      { severity: 'warning',  icon: '📉',  title: 'Feature Adoption Below Threshold',   desc: '89 accounts using fewer than 2 features after 30 days. Correlated with 3× higher churn in this cohort.',       segment: 'At-Risk Free',         prob: 58, customer: null,            type: 'Adoption Alert'  },
      { severity: 'warning',  icon: '🎫',  title: 'Support Ticket Volume Spike',         desc: 'Acme Corp opened 7 tickets this week (avg: 1.2). Frustration pattern precedes churn in 67% of cases.',         segment: 'At-Risk Free',         prob: 63, customer: 'Acme Corp',     type: 'Support Alert'   },
      { severity: 'info',     icon: '🚀',  title: 'Free-to-Pro Conversion Opportunity', desc: '24 free-tier users hit usage limits 3 times this week. Optimal window to trigger upgrade offer.',              segment: 'At-Risk Free',         prob: 8,  customer: null,            type: 'Opportunity'     },
      { severity: 'info',     icon: '✅',  title: 'Onboarding Campaign Result',          desc: 'Feature discovery email sequence lifted weekly logins by 28% among Engaged Starter segment.',                  segment: 'Engaged Starters',     prob: 9,  customer: null,            type: 'Success'         },
      { severity: 'critical', icon: '🚨',  title: 'TechStart Inc — Trial Ending',        desc: 'TechStart Inc\'s Pro trial expires in 48 hours. No upgrade intent signals detected. Last login: 6 days ago.',  segment: 'Churning Soon',        prob: 81, customer: 'TechStart Inc',type: 'Account Alert'   },
      { severity: 'warning',  icon: '🔕',  title: 'API Usage Near Zero',                desc: 'EduPlatform API calls dropped to 4 this month (prior avg: 890). Likely migrating to competitor.',              segment: 'Churning Soon',        prob: 71, customer: 'EduPlatform',   type: 'Usage Alert'     },
    ],
    gym: [
      { severity: 'critical', icon: '👻', title: 'Ghost Member Wave Detected',           desc: '41 members have not checked in for 30+ days and hold active memberships. Total at-risk MRR: $1,599.',         segment: 'Ghost Members',        prob: 88, customer: null,       type: 'Cluster Alert'   },
      { severity: 'critical', icon: '⚠️',  title: 'January Cohort Attrition Peak',       desc: 'New Year sign-ups from January are hitting the 90-day drop-off cliff. Historical churn here is 58%.',         segment: 'New Members',          prob: 72, customer: null,       type: 'Seasonal Alert'  },
      { severity: 'warning',  icon: '⏸️',  title: 'Pause Requests Up 40% This Week',    desc: '18 members requested membership pause vs 13 weekly average. Pause-to-cancel conversion is 34%.',              segment: 'Occasional Goers',     prob: 55, customer: null,       type: 'Ops Alert'       },
      { severity: 'warning',  icon: '📱',  title: 'App Engagement Decline',              desc: 'Drew M. and 6 others opened the app 0 times in the past 14 days. App disengagement precedes cancellation.',    segment: 'Ghost Members',        prob: 67, customer: 'Drew M.',  type: 'Engagement Alert'},
      { severity: 'critical', icon: '🚨',  title: 'Chris D. — Cancellation Form Viewed',desc: 'Chris D. (4 months, Basic plan) visited the cancellation page twice today. Last check-in: 31 days ago.',       segment: 'Ghost Members',        prob: 91, customer: 'Chris D.', type: 'Individual Alert' },
      { severity: 'info',     icon: '✅',  title: 'Class Challenge — 73% Completion',   desc: '30-day class challenge reached 73% completion rate among participants. Engaged members show 4% churn rate.',     segment: 'Fitness Fanatics',     prob: 4,  customer: null,       type: 'Success'         },
      { severity: 'info',     icon: '🌱',  title: 'February New Member Onboarding',      desc: '37 new members joined last week. Early engagement check-in scheduled for day 14 of membership.',              segment: 'New Members',          prob: 22, customer: null,       type: 'Insight'         },
      { severity: 'warning',  icon: '💳',  title: 'Direct Debit Failures',               desc: '9 member direct debits failed on the 1st. 5 have not responded to payment reminder.',                          segment: 'At Risk',              prob: 61, customer: null,       type: 'Payment Alert'   },
    ],
    subscription: [
      { severity: 'critical', icon: '🏃', title: 'Trial Abandonment Spike',              desc: '143 trial users installed the app this week; 91 have not opened it once. Triggered re-engagement flow.',      segment: 'Trial Abandoners',     prob: 91, customer: null,           type: 'Cluster Alert'   },
      { severity: 'critical', icon: '🔴', title: 'Payment Retry Exhausted — 12 Users',  desc: '12 monthly subscribers have exhausted all payment retries. Accounts will downgrade to free tier tonight.',     segment: 'Disengaged Users',     prob: 95, customer: null,           type: 'Payment Alert'   },
      { severity: 'warning',  icon: '🔕',  title: 'Notification Permission Revoked',     desc: '234 users revoked notification permissions this week. Push-disabled users churn 2.7× faster on average.',     segment: 'Passive Consumers',    prob: 52, customer: null,           type: 'Engagement Alert'},
      { severity: 'warning',  icon: '⭐',  title: 'Low Rating Submitted',                desc: 'User #2034 gave a 1-star rating with comment: "Too many bugs". Escalation to product team recommended.',       segment: 'Disengaged Users',     prob: 73, customer: 'User #2034', type: 'Feedback Alert'  },
      { severity: 'critical', icon: '🚨',  title: 'User #4821 — Unsubscribe Initiated', desc: 'User #4821 clicked "Cancel Subscription" but did not confirm. Cancellation save flow triggered.',              segment: 'Trial Abandoners',     prob: 94, customer: 'User #4821', type: 'Individual Alert' },
      { severity: 'info',     icon: '✅',  title: 'Annual Plan Migration Success',       desc: '67 monthly users converted to annual plans following discount offer. Saved $2,403 MRR from projected churn.',  segment: 'Passive Consumers',    prob: 6,  customer: null,           type: 'Success'         },
      { severity: 'info',     icon: '📊',  title: 'Referral Program Gaining Traction',  desc: 'Brand Advocates referred 89 new users this month. Referred users show 3.1× better 90-day retention.',         segment: 'Brand Advocates',      prob: 3,  customer: null,           type: 'Insight'         },
      { severity: 'warning',  icon: '📉',  title: 'Content Engagement Drop',            desc: 'Avg content saved per user fell 22% week-over-week. Correlates with subscription cancellation intent.',         segment: 'Disengaged Users',     prob: 62, customer: null,           type: 'Usage Alert'     },
    ],
  };

  /* ── Generate alerts for industry ── */
  function generateAlerts(industry) {
    const templates = ALERT_TEMPLATES[industry] || ALERT_TEMPLATES.telecom;
    const now = Date.now();
    _alerts = templates.map((t, i) => ({
      id:       `alert_${industry}_${i}`,
      ...t,
      age:      formatAge(now - (i * 7 + Math.random() * 12) * 60000),
      isNew:    i < 2,
      dismissed: false,
    }));
    updateNavBadge();
  }

  function formatAge(ms) {
    const m = Math.round(ms / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.round(h / 24)}d ago`;
  }

  /* ── Render Page ── */
  function render(industry) {
    _industry = industry;
    generateAlerts(industry);
    _filter = 'all';
    _searchQuery = '';

    const section = document.getElementById('page-alerts');
    if (!section) return;

    section.innerHTML = buildHTML();
    renderFeed();
    startAutoRefresh();
  }

  /* ── HTML Shell ── */
  function buildHTML() {
    const total    = _alerts.length;
    const critical = _alerts.filter(a => a.severity === 'critical').length;
    const warning  = _alerts.filter(a => a.severity === 'warning').length;
    const resolved = _alerts.filter(a => a.severity === 'info').length;

    return `
      <!-- Page Header -->
      <div class="alerts-page-header">
        <div>
          <h2 class="section-title">Live Alert Feed</h2>
          <p class="section-sub" style="margin-bottom:0;">Real-time churn risk events, ranked by severity and urgency.</p>
        </div>
        <div class="alerts-header-right">
          <div class="live-ticker">
            <span class="status-dot"></span>
            Live · Auto-refresh 30s
          </div>
          <button class="btn-outline" onclick="AlertsModule.simulateNewAlert()">+ Simulate Alert</button>
        </div>
      </div>

      <!-- Summary Bar -->
      <div class="alerts-summary">
        <div class="alert-summary-card">
          <div class="alert-summary-icon" style="background:rgba(0,229,255,0.1);">📋</div>
          <div>
            <div class="alert-summary-val">${total}</div>
            <div class="alert-summary-label">Total Alerts</div>
          </div>
        </div>
        <div class="alert-summary-card">
          <div class="alert-summary-icon" style="background:rgba(255,71,87,0.1);">🚨</div>
          <div>
            <div class="alert-summary-val" style="color:var(--red);">${critical}</div>
            <div class="alert-summary-label">Critical</div>
          </div>
        </div>
        <div class="alert-summary-card">
          <div class="alert-summary-icon" style="background:rgba(255,140,66,0.1);">⚠️</div>
          <div>
            <div class="alert-summary-val" style="color:var(--orange);">${warning}</div>
            <div class="alert-summary-label">Warnings</div>
          </div>
        </div>
        <div class="alert-summary-card">
          <div class="alert-summary-icon" style="background:rgba(0,214,143,0.1);">✅</div>
          <div>
            <div class="alert-summary-val" style="color:var(--green);">${resolved}</div>
            <div class="alert-summary-label">Positive</div>
          </div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="alerts-filter-bar">
        <button class="filter-chip active"           id="chip_all"      onclick="AlertsModule.setFilter('all')">All (${total})</button>
        <button class="filter-chip chip-critical"    id="chip_critical" onclick="AlertsModule.setFilter('critical')">🔴 Critical (${critical})</button>
        <button class="filter-chip chip-warning"     id="chip_warning"  onclick="AlertsModule.setFilter('warning')">⚠️ Warning (${warning})</button>
        <button class="filter-chip chip-info"        id="chip_info"     onclick="AlertsModule.setFilter('info')">✅ Positive (${resolved})</button>
        <div class="alerts-spacer"></div>
        <input class="alerts-search" id="alertSearch" placeholder="Search alerts…"
          oninput="AlertsModule.setSearch(this.value)" />
      </div>

      <!-- Feed -->
      <div class="alerts-feed" id="alertsFeed"></div>
    `;
  }

  /* ── Render Feed (filtered) ── */
  function renderFeed() {
    const feed = document.getElementById('alertsFeed');
    if (!feed) return;

    const visible = _alerts.filter(a => {
      if (a.dismissed) return false;
      if (_filter !== 'all' && a.severity !== _filter) return false;
      if (_searchQuery) {
        const q = _searchQuery.toLowerCase();
        return a.title.toLowerCase().includes(q) ||
               a.desc.toLowerCase().includes(q)  ||
               a.segment.toLowerCase().includes(q);
      }
      return true;
    });

    if (visible.length === 0) {
      feed.innerHTML = `
        <div class="alerts-empty">
          <div class="alerts-empty-icon">◎</div>
          <p>No alerts match your filter</p>
        </div>`;
      return;
    }

    feed.innerHTML = visible.map(a => buildAlertCard(a)).join('');
  }

  /* ── Build single alert card HTML ── */
  function buildAlertCard(a) {
    const probColor = a.prob >= 70 ? 'var(--red)' : a.prob >= 45 ? 'var(--orange)' : 'var(--green)';
    return `
      <div class="alert-card ${a.severity}" id="alertCard_${a.id}">
        <div class="alert-sev-icon">${a.icon}</div>
        <div class="alert-body">
          <div class="alert-top">
            <span class="alert-title">${a.title}</span>
            <span class="alert-sev-badge">${a.severity.toUpperCase()}</span>
            <span style="font-size:11px;font-family:var(--font-mono);color:var(--text3);">${a.type}</span>
            ${a.isNew ? '<span class="alert-new-dot"></span>' : ''}
          </div>
          <div class="alert-desc">${a.desc}</div>
          <div class="alert-meta">
            <span class="alert-meta-item">⏱ ${a.age}</span>
            <span class="alert-meta-item">◈ ${a.segment}</span>
            ${a.customer ? `<span class="alert-meta-item">👤 ${a.customer}</span>` : ''}
            <span class="alert-meta-item" style="color:${probColor};">◉ ${a.prob}% churn prob</span>
          </div>
        </div>
        <div class="alert-actions">
          <button class="alert-action-btn primary" onclick="AlertsModule.takeAction('${a.id}')">
            ${a.severity === 'critical' ? 'Intervene →' : a.severity === 'warning' ? 'Review →' : 'View →'}
          </button>
          <button class="alert-action-btn dismiss" onclick="AlertsModule.dismiss('${a.id}')">
            Dismiss
          </button>
        </div>
      </div>
    `;
  }

  /* ── Dismiss alert ── */
  function dismiss(id) {
    const card = document.getElementById(`alertCard_${id}`);
    if (card) {
      card.classList.add('dismissed');
      setTimeout(() => {
        const a = _alerts.find(a => a.id === id);
        if (a) a.dismissed = true;
        renderFeed();
        updateNavBadge();
      }, 320);
    }
  }

  /* ── Take action (navigate to appropriate module) ── */
  function takeAction(id) {
    const a = _alerts.find(a => a.id === id);
    if (!a) return;
    if (a.customer || a.severity === 'critical') {
      App.goTo('prediction');
    } else if (a.severity === 'warning') {
      App.goTo('retention');
    } else {
      App.goTo('dashboard');
    }
  }

  /* ── Filter ── */
  function setFilter(f) {
    _filter = f;
    document.querySelectorAll('.filter-chip').forEach(el => el.classList.remove('active'));
    const chip = document.getElementById(`chip_${f}`);
    if (chip) chip.classList.add('active');
    renderFeed();
  }

  /* ── Search ── */
  function setSearch(q) {
    _searchQuery = q;
    renderFeed();
  }

  /* ── Simulate a new incoming alert ── */
  function simulateNewAlert() {
    const templates = ALERT_TEMPLATES[_industry] || ALERT_TEMPLATES.telecom;
    const t = templates[Math.floor(Math.random() * templates.length)];
    const newAlert = {
      id:        `alert_live_${Date.now()}`,
      ...t,
      age:       'Just now',
      isNew:     true,
      dismissed: false,
      title:     '⚡ LIVE: ' + t.title,
    };
    _alerts.unshift(newAlert);
    updateNavBadge();
    renderFeed();
  }

  /* ── Nav badge count ── */
  function updateNavBadge() {
    const active = _alerts.filter(a => !a.dismissed && a.severity === 'critical').length;
    const navItem = document.querySelector('[data-page="alerts"]');
    if (!navItem) return;
    let badge = navItem.querySelector('.nav-alert-count');
    if (active > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'nav-alert-count';
        navItem.appendChild(badge);
      }
      badge.textContent = active;
    } else if (badge) {
      badge.remove();
    }
  }

  /* ── Auto-refresh ticker ── */
  function startAutoRefresh() {
    if (_ticker) clearInterval(_ticker);
    _ticker = setInterval(() => {
      // Age all alerts by ~30s in display
      _alerts.forEach(a => {
        if (a.age === 'Just now') a.age = '1m ago';
        else if (a.age.endsWith('m ago')) {
          const m = parseInt(a.age) + 1;
          a.age = m < 60 ? `${m}m ago` : '1h ago';
        }
      });
      renderFeed();
    }, 30000);
  }

  // Register with router
  document.addEventListener('DOMContentLoaded', () => App.register('alerts', { render }));

  return { render, dismiss, takeAction, setFilter, setSearch, simulateNewAlert };
})();
