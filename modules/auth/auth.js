/* ══════════════════════════════════════════
   modules/auth/auth.js
   MODULE 5 — Authentication
   Login / Register / Role-based access
   Roles: Admin | Analyst | Viewer
   ══════════════════════════════════════════ */

const AuthModule = (() => {

  /* ── Role Definitions ── */
  const ROLES = {
    admin: {
      label: 'Admin',
      icon: '👑',
      color: '#ffd166',
      dot: '#ffd166',
      canAccess: ['dashboard', 'prediction', 'segmentation', 'retention', 'alerts'],
      desc: 'Full access',
    },
    analyst: {
      label: 'Analyst',
      icon: '🔬',
      color: '#00e5ff',
      dot: '#00e5ff',
      canAccess: ['dashboard', 'prediction', 'segmentation', 'retention', 'alerts'],
      desc: 'Read + predict',
    },
    viewer: {
      label: 'Viewer',
      icon: '👁',
      color: '#8891a8',
      dot: '#8891a8',
      canAccess: ['dashboard', 'alerts'],
      desc: 'View only',
    },
  };

  /* ── Demo accounts (simulated — no real backend) ── */
  const DEMO_ACCOUNTS = [
    { email: 'admin@churnai.io',   password: 'admin123',   role: 'admin',   name: 'Alex D.' },
    { email: 'analyst@churnai.io', password: 'analyst123', role: 'analyst', name: 'Sam K.'  },
    { email: 'viewer@churnai.io',  password: 'view123',    role: 'viewer',  name: 'Jordan P.'},
  ];

  /* ── In-memory user store (persists via sessionStorage) ── */
  let _session = null;
  let _registeredUsers = [...DEMO_ACCOUNTS];

  /* ── Boot: inject overlay & check existing session ── */
  function init() {
    injectOverlay();
    injectTopbarItems();

    const saved = sessionStorage.getItem('churnai_session');
    if (saved) {
      try {
        _session = JSON.parse(saved);
        dismissOverlay();
        applyRoleUI();
      } catch {
        sessionStorage.removeItem('churnai_session');
        showOverlay();
      }
    } else {
      showOverlay();
    }
  }

  /* ── Build Login / Register HTML ── */
  function injectOverlay() {
    const el = document.createElement('div');
    el.id = 'authOverlay';
    el.innerHTML = `
      <div class="auth-card">

        <div class="auth-brand">
          <span class="auth-brand-icon">◈</span>
          <div>
            <span class="auth-brand-name">ChurnAI</span>
            <span class="auth-brand-tag">Predictive Customer Intelligence</span>
          </div>
        </div>

        <!-- Tabs -->
        <div class="auth-tabs">
          <button class="auth-tab active" id="tabLogin"    onclick="AuthModule.switchTab('login')">Sign In</button>
          <button class="auth-tab"        id="tabRegister" onclick="AuthModule.switchTab('register')">Register</button>
        </div>

        <!-- Message box -->
        <div class="auth-msg" id="authMsg"></div>

        <!-- ── LOGIN FORM ── -->
        <div id="loginForm">
          <div class="auth-form">
            <div class="auth-form-group">
              <label>Email</label>
              <input class="auth-input" id="loginEmail" type="email" placeholder="you@company.com" />
            </div>
            <div class="auth-form-group">
              <label>Password</label>
              <input class="auth-input" id="loginPassword" type="password" placeholder="••••••••"
                onkeydown="if(event.key==='Enter') AuthModule.login()" />
            </div>
            <button class="auth-submit" onclick="AuthModule.login()">Sign In →</button>
          </div>

          <!-- Demo credentials -->
          <div class="auth-demo-hint">
            <div class="auth-demo-hint-title">Demo Credentials — click to fill</div>
            ${DEMO_ACCOUNTS.map(a => `
              <div class="auth-demo-row" onclick="AuthModule.fillDemo('${a.email}','${a.password}')">
                <span>${ROLES[a.role].icon} ${a.role.charAt(0).toUpperCase()+a.role.slice(1)} — ${a.email}</span>
                <span>${a.password}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- ── REGISTER FORM ── -->
        <div id="registerForm" style="display:none;">
          <div class="auth-form">
            <div class="auth-form-group">
              <label>Full Name</label>
              <input class="auth-input" id="regName" type="text" placeholder="Your name" />
            </div>
            <div class="auth-form-group">
              <label>Email</label>
              <input class="auth-input" id="regEmail" type="email" placeholder="you@company.com" />
            </div>
            <div class="auth-form-group">
              <label>Password</label>
              <input class="auth-input" id="regPassword" type="password" placeholder="Min. 6 characters" />
            </div>
            <div class="auth-form-group">
              <label>Role</label>
              <div class="role-picker">
                ${Object.entries(ROLES).map(([key, r]) => `
                  <label class="role-option ${key === 'analyst' ? 'selected' : ''}" id="roleOpt_${key}">
                    <input type="radio" name="regRole" value="${key}" ${key === 'analyst' ? 'checked' : ''} />
                    <span class="role-icon">${r.icon}</span>
                    <span class="role-name">${r.label}</span>
                    <span class="role-desc">${r.desc}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            <button class="auth-submit" onclick="AuthModule.register()">Create Account →</button>
          </div>
        </div>

      </div>
    `;
    document.body.appendChild(el);

    // Role picker visual selection
    document.querySelectorAll('input[name="regRole"]').forEach(radio => {
      radio.addEventListener('change', () => {
        document.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
        radio.closest('.role-option').classList.add('selected');
      });
    });
  }

  /* ── Inject topbar role badge + logout button ── */
  function injectTopbarItems() {
    const right = document.querySelector('.topbar-right');
    if (!right) return;

    const badge = document.createElement('div');
    badge.id = 'topbarRoleBadge';
    badge.className = 'topbar-role-badge';
    badge.style.display = 'none';
    badge.onclick = () => logout();
    badge.title = 'Click to sign out';
    right.prepend(badge);
  }

  /* ── Tab switching ── */
  function switchTab(tab) {
    document.getElementById('loginForm').style.display    = tab === 'login'    ? 'block' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
    document.getElementById('tabLogin').classList.toggle('active',    tab === 'login');
    document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
    clearMsg();
  }

  /* ── Fill demo credentials ── */
  function fillDemo(email, password) {
    document.getElementById('loginEmail').value    = email;
    document.getElementById('loginPassword').value = password;
    clearMsg();
  }

  /* ── Login ── */
  function login() {
    const email    = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) { showMsg('Please fill in all fields.', 'error'); return; }

    const user = _registeredUsers.find(u => u.email.toLowerCase() === email && u.password === password);
    if (!user) { showMsg('Invalid email or password.', 'error'); return; }

    startSession(user);
  }

  /* ── Register ── */
  function register() {
    const name     = document.getElementById('regName').value.trim();
    const email    = document.getElementById('regEmail').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value;
    const role     = document.querySelector('input[name="regRole"]:checked')?.value || 'viewer';

    if (!name || !email || !password) { showMsg('Please fill in all fields.', 'error'); return; }
    if (password.length < 6)           { showMsg('Password must be at least 6 characters.', 'error'); return; }
    if (_registeredUsers.find(u => u.email.toLowerCase() === email)) {
      showMsg('An account with this email already exists.', 'error'); return;
    }

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const newUser  = { email, password, role, name, initials };
    _registeredUsers.push(newUser);

    showMsg(`Account created! Signing you in as ${ROLES[role].label}…`, 'success');
    setTimeout(() => startSession(newUser), 800);
  }

  /* ── Start session ── */
  function startSession(user) {
    const initials = user.initials || user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    _session = { email: user.email, name: user.name, role: user.role, initials };
    sessionStorage.setItem('churnai_session', JSON.stringify(_session));
    dismissOverlay();
    applyRoleUI();
  }

  /* ── Logout ── */
  function logout() {
    if (!confirm(`Sign out as ${_session?.name}?`)) return;
    sessionStorage.removeItem('churnai_session');
    _session = null;

    // Reset topbar
    const badge = document.getElementById('topbarRoleBadge');
    if (badge) badge.style.display = 'none';
    const avatar = document.querySelector('.topbar-avatar');
    if (avatar) avatar.textContent = 'JD';

    // Unlock all nav items
    document.querySelectorAll('.nav-item').forEach(el => {
      el.style.opacity = '';
      el.style.pointerEvents = '';
      el.title = '';
    });

    showOverlay();
    switchTab('login');
  }

  /* ── Apply role restrictions to UI ── */
  function applyRoleUI() {
    if (!_session) return;
    const role  = ROLES[_session.role];

    // Update avatar
    const avatar = document.querySelector('.topbar-avatar');
    if (avatar) avatar.textContent = _session.initials;

    // Update role badge
    const badge = document.getElementById('topbarRoleBadge');
    if (badge) {
      badge.style.display = 'flex';
      badge.innerHTML = `
        <span class="role-dot" style="background:${role.dot};box-shadow:0 0 5px ${role.dot};"></span>
        ${role.icon} ${role.label}
      `;
    }

    // Restrict nav items Viewer can't access
    document.querySelectorAll('.nav-item').forEach(el => {
      const page = el.dataset.page;
      if (!role.canAccess.includes(page)) {
        el.style.opacity = '0.35';
        el.style.pointerEvents = 'none';
        el.title = `${role.label}s cannot access this module`;
      } else {
        el.style.opacity = '';
        el.style.pointerEvents = '';
        el.title = '';
      }
    });
  }

  /* ── Show restricted banner inside a page ── */
  function getRestrictedBanner(pageName) {
    const role = ROLES[_session?.role] || ROLES.viewer;
    return `
      <div class="restricted-banner">
        <span class="r-icon">🔒</span>
        <span>
          <strong>${role.label} access</strong> — You don't have permission to view
          <strong>${pageName}</strong>. Contact an Admin to upgrade your role.
        </span>
      </div>
    `;
  }

  /* ── Check if current user can access a page ── */
  function canAccess(page) {
    if (!_session) return false;
    return ROLES[_session.role]?.canAccess.includes(page) ?? false;
  }

  function getSession()  { return _session; }
  function getRole()     { return _session ? ROLES[_session.role] : null; }

  /* ── Overlay helpers ── */
  function showOverlay() {
    const el = document.getElementById('authOverlay');
    if (el) { el.classList.remove('hidden'); el.style.display = 'flex'; }
  }

  function dismissOverlay() {
    const el = document.getElementById('authOverlay');
    if (!el) return;
    el.classList.add('hidden');
    setTimeout(() => { el.style.display = 'none'; }, 400);
  }

  function showMsg(msg, type) {
    const el = document.getElementById('authMsg');
    if (!el) return;
    el.textContent = msg;
    el.className = `auth-msg ${type}`;
  }

  function clearMsg() {
    const el = document.getElementById('authMsg');
    if (el) el.className = 'auth-msg';
  }

  document.addEventListener('DOMContentLoaded', init);

  return { switchTab, fillDemo, login, register, logout, canAccess, getSession, getRole, getRestrictedBanner };
})();
