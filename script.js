/* ── CURSOR ── */
(function() {
  const cur = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!cur || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.transform = `translate(${mx-5}px,${my-5}px)`;
  });
  (function loop() {
    rx += (mx-rx)*0.11; ry += (my-ry)*0.11;
    ring.style.left = rx+'px'; ring.style.top = ry+'px';
    ring.style.transform = 'translate(-50%,-50%)';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('.cta-btn,.admin-block,.info-link,.btn-send,.btn-cancel,.expand-btn,.role-card,.support-row,.dock-btn').forEach(el => {
    el.addEventListener('mouseenter', () => { ring.style.width='52px'; ring.style.height='52px'; ring.style.borderColor='rgba(59,130,246,0.65)'; });
    el.addEventListener('mouseleave', () => { ring.style.width='34px'; ring.style.height='34px'; ring.style.borderColor='rgba(59,130,246,0.4)'; });
  });
})();

/* ── DOCK ── */
const dock = document.getElementById('mobileDock');
const dockTrack = dock.querySelector('.dock-track');
const dockPill = dock.querySelector('.dock-pill');
const dockBtns = dock.querySelectorAll('.dock-btn');

function movePill(btn) {
  if (window.innerWidth <= 768) return; // <--- Блокируем на мобилках
  const r = btn.getBoundingClientRect();
  dockPill.style.left = r.left + 'px';
  dockPill.style.width = r.width + 'px';
}

window.addEventListener('load', () => {
  const a = dock.querySelector('.dock-btn.active');
  if (a) setPillPosition(a);
});

function switchTab(tabId) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.getElementById(tabId)?.classList.add('active');

  let activeBtn = null;
  dockBtns.forEach(b => {
    const on = b.dataset.tab === tabId;
    b.classList.toggle('active', on);
    if (on) activeBtn = b;
  });

  dockPill.style.opacity = '0';
  setTimeout(() => {
    if (activeBtn) setPillPosition(activeBtn);
    requestAnimationFrame(() => { dockPill.style.opacity = '1'; });
  }, 180);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

dockBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

window.addEventListener('load', () => requestAnimationFrame(() => {
  const a = dock.querySelector('.dock-btn.active');
  if (a) movePill(a);
}));
window.addEventListener('resize', () => {
  const a = dock.querySelector('.dock-btn.active');
  if (a) movePill(a);
});

/* ── ROLES EXPAND ── */
function toggleRoles() {
  const extra = document.getElementById('rolesExtra');
  const btn = document.getElementById('expandBtn');
  const txt = document.getElementById('expandBtnText');
  const open = extra.classList.toggle('visible');
  btn.classList.toggle('open', open);
  txt.textContent = open ? 'Свернуть' : 'Показать все 25';
}

/* ── MODAL ── */
function openModal() {
  const m = document.getElementById('applyModal');
  m.style.display = 'flex';
  const inner = m.querySelector('.modal-inner');
  inner.style.animation = 'none'; void inner.offsetWidth; inner.style.animation = '';
  document.getElementById('role').value = '';
  document.getElementById('fandom').value = '';
  setTimeout(() => document.getElementById('role').focus(), 150);
}
function closeModal() { document.getElementById('applyModal').style.display = 'none'; }
document.getElementById('applyModal').addEventListener('click', function(e) { if (e.target===this) closeModal(); });
document.addEventListener('keydown', e => { if (e.key==='Escape') closeModal(); });

/* ── SEND TO BOT ── */
function sendToBot() {
  const role = document.getElementById('role').value.trim();
  const fandom = document.getElementById('fandom').value.trim();
  if (!role || !fandom) {
    document.querySelectorAll('.input-field').forEach(f => {
      if (!f.value.trim()) { f.classList.add('input-error'); setTimeout(() => f.classList.remove('input-error'), 2000); }
    });
    return alert('Заполните все поля');
  }
  const b64 = btoa(unescape(encodeURIComponent(`r:${role}|f:${fandom}`))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  window.location.href = `https://t.me/multifandomFlood_bot?start=${b64}`;
  const btn = document.querySelector('.btn-send');
  const orig = btn.innerHTML;
  btn.innerHTML = '<span>Отправлено!</span><i class="fas fa-check"></i>';
  btn.style.background = '#16a34a'; btn.style.boxShadow = '0 0 40px rgba(22,163,74,0.5)';
  setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.style.boxShadow = ''; closeModal(); }, 1200);
}

const tabs = ['home','staff','roles','rests','features','support','rules'];
let currentIndex = 0;

document.getElementById('prevTab')?.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  updateTab();
});
document.getElementById('nextTab')?.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % tabs.length;
  updateTab();
});

const tabMeta = {
  home:    { label: 'Главная', icon: 'fa-house' },
  staff:   { label: 'Команда', icon: 'fa-users' },
  roles:   { label: 'Роли', icon: 'fa-mask' },
  rests:   { label: 'Ресты', icon: 'fa-moon' },
  features:{ label: 'Особенности', icon: 'fa-star' },
  support: { label: 'Поддержка', icon: 'fa-circle-question' },
  rules:   { label: 'Инфо', icon: 'fa-circle-info' }
};

const mini = document.getElementById('tabMini');
tabs.forEach((t, i) => {
  const el = document.createElement('span');
  // el.textContent = i + 1; <--- ЭТУ СТРОКУ НУЖНО УДАЛИТЬ ИЛИ ЗАКОММЕНТИРОВАТЬ
  mini.appendChild(el);
});

function updateTab() {
  switchTab(tabs[currentIndex]);
  const label = document.getElementById('currentTabLabel');
  if (!label) return;

  const { label: text, icon } = tabMeta[tabs[currentIndex]];
  
  const iconEl = label.querySelector('i');
  // ИСПРАВЛЕНИЕ: Ищем только прямой дочерний span (саму надпись), игнорируя точки в tab-mini
  const textEl = label.querySelector(':scope > span'); 

  label.classList.add('change');
  setTimeout(() => {
    if (iconEl) iconEl.className = `fas ${icon}`;
    if (textEl) textEl.textContent = text; // Теперь текст попадет куда нужно
    label.classList.remove('change');
  }, 180);

  document.querySelectorAll('#tabMini span').forEach((el, i) => {
    el.classList.toggle('active', i === currentIndex);
  });
}

function setPillPosition(btn) {
  if (window.innerWidth <= 768) return; // <--- Блокируем на мобилках
  const r = btn.getBoundingClientRect();
  dockPill.style.left = r.left + 'px';
  dockPill.style.width = r.width + 'px';
}