// js/app.js

// ========== CONFIGURATION ==========
const API_URL = 'https://script.google.com/macros/s/AKfycbzu_WfyID_ggPD9TFbbdQFysAvcQyO5w7W22cD1udUF6ZHx5xG313ejhGwDmAXrJT4C/exec';
const PASSWORD = "1111";

// ========== STATE ==========
let currentUser = null;
let selectedAccessType = "CVC";
let selectedAvatarData = null;
let uploadedAvatarData = null;

// ========== AVATAR SVG TEMPLATES ==========
const avatarSVGs = {
    'man-adult': `<svg viewBox="0 0 100 100"><circle cx="50" cy="35" r="25" fill="#6d28d9"/><path d="M50 65 C25 65 15 85 15 100 L85 100 C85 85 75 65 50 65" fill="#1e3a5f"/><circle cx="50" cy="32" r="18" fill="#fcd5b8"/><ellipse cx="50" cy="25" rx="20" ry="12" fill="#2d2013"/></svg>`,
    'man-teen': `<svg viewBox="0 0 100 100"><circle cx="50" cy="35" r="25" fill="#14b8a6"/><path d="M50 65 C25 65 15 85 15 100 L85 100 C85 85 75 65 50 65" fill="#0f766e"/><circle cx="50" cy="32" r="18" fill="#fcd5b8"/><ellipse cx="50" cy="22" rx="18" ry="10" fill="#2d2013"/></svg>`,
    'boy': `<svg viewBox="0 0 100 100"><circle cx="50" cy="35" r="25" fill="#f97316"/><path d="M50 65 C25 65 15 85 15 100 L85 100 C85 85 75 65 50 65" fill="#ea580c"/><circle cx="50" cy="35" r="18" fill="#fcd5b8"/><ellipse cx="50" cy="28" rx="16" ry="8" fill="#2d2013"/></svg>`,
    'woman-adult': `<svg viewBox="0 0 100 100"><circle cx="50" cy="35" r="25" fill="#ec4899"/><path d="M50 65 C25 65 15 85 15 100 L85 100 C85 85 75 65 50 65" fill="#6d28d9"/><circle cx="50" cy="32" r="18" fill="#fcd5b8"/><path d="M32 30 Q35 15 50 15 Q65 15 68 30 L68 40 Q65 50 50 50 Q35 50 32 40 Z" fill="#2d2013"/></svg>`,
    'woman-teen': `<svg viewBox="0 0 100 100"><circle cx="50" cy="35" r="25" fill="#a78bfa"/><path d="M50 65 C25 65 15 85 15 100 L85 100 C85 85 75 65 50 65" fill="#6d28d9"/><circle cx="50" cy="32" r="18" fill="#fcd5b8"/><path d="M35 25 Q40 12 50 12 Q60 12 65 25 L65 38 Q60 48 50 48 Q40 48 35 38 Z" fill="#2d2013"/></svg>`,
    'girl': `<svg viewBox="0 0 100 100"><circle cx="50" cy="35" r="25" fill="#fb7185"/><path d="M50 65 C25 65 15 85 15 100 L85 100 C85 85 75 65 50 65" fill="#f472b6"/><circle cx="50" cy="35" r="18" fill="#fcd5b8"/><path d="M35 30 Q38 18 50 18 Q62 18 65 30 L65 40 Q62 50 50 50 Q38 50 35 40 Z" fill="#2d2013"/></svg>`
};

// ========== UI FUNCTIONS ==========
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// Fungsi untuk menutup modal saat klik di luar area
function closeModalOnOverlay(event, id) {
    if (event.target.id === id) {
        closeModal(id);
    }
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelector('.auth-tab:first-child').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelector('.auth-tab:last-child').classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}

// ========== AVATAR FUNCTIONS ==========
function selectAvatar(element) {
    document.querySelectorAll('.avatar-option, .avatar-upload').forEach(a => a.classList.remove('selected'));
    element.classList.add('selected');
    selectedAvatarData = element.dataset.avatar;
    uploadedAvatarData = null;
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedAvatarData = e.target.result;
            selectedAvatarData = 'custom';
            
            const uploadBtn = document.querySelector('.avatar-upload');
            uploadBtn.classList.add('selected', 'has-image');
            uploadBtn.innerHTML = `<img src="${uploadedAvatarData}" alt="Custom Avatar">`;
            document.querySelectorAll('.avatar-option').forEach(a => a.classList.remove('selected'));
        };
        reader.readAsDataURL(file);
    }
}

function handleProfileAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedAvatarData = e.target.result;
            selectedAvatarData = 'custom';
            updateAvatarDisplay();
            saveProfile();
        };
        reader.readAsDataURL(file);
    }
}

function getAvatarHTML(avatarData) {
    if (avatarData === 'custom' && uploadedAvatarData) {
        return `<img src="${uploadedAvatarData}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;">`;
    } else if (avatarSVGs[avatarData]) {
        return avatarSVGs[avatarData];
    }
    return avatarSVGs['man-adult'];
}

function updateAvatarDisplay() {
    if (!currentUser) return;
    
    const avatarHTML = getAvatarHTML(currentUser.avatar);
    
    document.getElementById('mainAvatar').innerHTML = avatarHTML;
    const headerAvatar = document.querySelector('.user-avatar-small');
    if (headerAvatar) {
        headerAvatar.innerHTML = avatarHTML;
    }
    document.getElementById('profileAvatarBig').innerHTML = avatarHTML;
}

// ========== AUTH FUNCTIONS ==========
function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;

    if (!name || !email || !password) { alert('Mohon lengkapi semua field!'); return; }
    if (password.length < 6) { alert('Password minimal 6 karakter!'); return; }
    if (password !== passwordConfirm) { alert('Konfirmasi password tidak cocok!'); return; }
    if (!selectedAvatarData) { alert('Pilih avatar terlebih dahulu!'); return; }

    currentUser = {
        id: 'user_' + Date.now(),
        name: name, email: email, password: password,
        avatar: selectedAvatarData, customAvatar: uploadedAvatarData,
        accessType: 'CVC', createdAt: new Date().toISOString(),
        stats: { totalChecks: 0, lastCheck: null, healthScore: 100 }
    };

    saveUserToStorage();
    updateUIForLoggedInUser();
    closeModal('authModal');
    setTimeout(() => openModal('onboardingModal'), 500);
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) { alert('Mohon isi email dan password!'); return; }

    const storedUser = localStorage.getItem('teman_user_' + email);
    if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.password === password) {
            currentUser = user;
            if (user.customAvatar) { uploadedAvatarData = user.customAvatar; }
            saveUserToStorage();
            updateUIForLoggedInUser();
            closeModal('authModal');
            return;
        }
    }
    alert('Email atau password salah!');
}

function handleGoogleLogin() {
    currentUser = {
        id: 'google_' + Date.now(), name: 'Google User', email: 'user.google@example.com',
        avatar: 'man-adult', provider: 'google', accessType: 'CVC',
        createdAt: new Date().toISOString(), stats: { totalChecks: 0, lastCheck: null, healthScore: 100 }
    };
    saveUserToStorage();
    updateUIForLoggedInUser();
    closeModal('authModal');
    setTimeout(() => openModal('onboardingModal'), 500);
}

function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        localStorage.removeItem('teman_current_user');
        currentUser = null; uploadedAvatarData = null;
        
        document.getElementById('userArea').innerHTML = `
            <button class="user-profile-btn" onclick="openModal('authModal')">
                <div class="user-avatar-small"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
                <span style="font-weight:600; color:var(--dark-blue);">Masuk</span>
            </button>`;
        
        document.getElementById('userName').innerText = 'Tamu';
        document.getElementById('userStatus').innerText = 'Belum Login';
        document.getElementById('mainAvatar').innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
        document.getElementById('tipeAkses').innerText = '-';
        document.getElementById('lastCheck').innerText = '-';
        document.getElementById('totalCheck').innerText = '0';
        document.getElementById('healthScore').innerText = '-';
        
        closeModal('profileModal');
    }
}

function saveUserToStorage() {
    if (currentUser) {
        localStorage.setItem('teman_current_user', JSON.stringify(currentUser));
        localStorage.setItem('teman_user_' + currentUser.email, JSON.stringify(currentUser));
    }
}

function loadUserFromStorage() {
    const stored = localStorage.getItem('teman_current_user');
    if (stored) {
        currentUser = JSON.parse(stored);
        if (currentUser.customAvatar) { uploadedAvatarData = currentUser.customAvatar; }
        updateUIForLoggedInUser();
        return true;
    }
    return false;
}

function updateUIForLoggedInUser() {
    if (!currentUser) return;
    const avatarHTML = getAvatarHTML(currentUser.avatar);
    
    document.getElementById('userArea').innerHTML = `
        <div class="user-profile-btn" onclick="openModal('profileModal')">
            <div class="user-avatar-small">${avatarHTML}</div>
            <div class="user-info-text">
                <div class="user-name-display">${currentUser.name}</div>
                <div class="user-email-display">${currentUser.email}</div>
            </div>
        </div>`;

    document.getElementById('userName').innerText = currentUser.name;
    document.getElementById('userStatus').innerText = 'Aktif';
    document.getElementById('mainAvatar').innerHTML = avatarHTML;
    document.getElementById('tipeAkses').innerText = currentUser.accessType || '-';
    
    if (currentUser.stats) {
        document.getElementById('totalCheck').innerText = currentUser.stats.totalChecks || 0;
        document.getElementById('healthScore').innerText = currentUser.stats.healthScore || '-';
        if (currentUser.stats.lastCheck) { document.getElementById('lastCheck').innerText = currentUser.stats.lastCheck; }
    }

    document.getElementById('profileName').value = currentUser.name;
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profileAvatarBig').innerHTML = avatarHTML;
    
    if (currentUser.accessType === 'CVC') { document.querySelector('input[name="profileAccessType"][value="CVC"]').checked = true; } 
    else if (currentUser.accessType === 'AV Shunt') { document.querySelector('input[name="profileAccessType"][value="AV Shunt"]').checked = true; }

    document.getElementById('syncDot').classList.remove('offline');
    document.getElementById('syncText').innerText = 'Tersinkronisasi dengan lokal';
}

// ========== PROFILE FUNCTIONS ==========
function setProfileAccessType(type) {
    document.querySelectorAll('input[name="profileAccessType"]').forEach(r => r.checked = false);
    document.querySelector(`input[name="profileAccessType"][value="${type}"]`).checked = true;
}

function saveProfile() {
    if (!currentUser) return;
    currentUser.name = document.getElementById('profileName').value;
    currentUser.avatar = selectedAvatarData || currentUser.avatar;
    if (uploadedAvatarData) { currentUser.customAvatar = uploadedAvatarData; }
    
    const accessTypeRadio = document.querySelector('input[name="profileAccessType"]:checked');
    if (accessTypeRadio) {
        currentUser.accessType = accessTypeRadio.value;
        document.getElementById('tipeAkses').innerText = currentUser.accessType;
    }

    saveUserToStorage();
    updateUIForLoggedInUser();
    closeModal('profileModal');
    
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = 'Tersimpan!';
    btn.style.background = 'var(--color-success)';
    setTimeout(() => { btn.innerText = originalText; btn.style.background = ''; }, 1500);
}

function setAccessType(type) {
    selectedAccessType = type;
    document.querySelectorAll('input[name="accessType"]').forEach(r => r.checked = false);
    document.querySelector(`input[name="accessType"][value="${type}"]`).checked = true;
}

function saveAccessType() {
    if (currentUser) {
        currentUser.accessType = selectedAccessType;
        saveUserToStorage();
        document.getElementById('tipeAkses').innerText = selectedAccessType;
    }
    closeModal('onboardingModal');
}

// ========== EVENTS API ==========
function loadEvents() {
    fetch(API_URL).then(response => response.json()).then(data => {
        renderEvents(data, 'eventListDashboard', true);
        renderEvents(data, 'eventListFull', false);
    }).catch(err => { console.error(err); document.getElementById('eventListDashboard').innerHTML = "<p style='padding:10px; font-size:12px; color:red;'>Gagal memuat agenda.</p>"; });
}

function renderEvents(data, elementId, truncate) {
    if (!data.length) { document.getElementById(elementId).innerHTML = "<p style='padding:10px; font-size:12px; color:#64748b;'>Belum ada agenda.</p>"; return; }
    const limit = truncate ? 2 : data.length;
    const html = data.slice(0, limit).map(ev => `
        <div class="event-card">
            <div class="event-banner" style="background: linear-gradient(135deg, #14b8a6, #0d9488); height: 60px;"></div>
            <div class="event-info">
                <h4 style="font-size: 14px;">${ev.title}</h4>
                <p>🗓 ${ev.date}</p>
                ${ev.link ? `<a href="${ev.link}" target="_blank" style="font-size:11px; color:var(--primary-teal); font-weight:700;">Buka Link &rarr;</a>` : ''}
            </div>
        </div>`).join('');
    document.getElementById(elementId).innerHTML = html;
}

function checkPassword() {
    if (document.getElementById('passwordInput').value === PASSWORD) {
        closeModal('passwordModal'); openModal('addEventModal'); document.getElementById('passwordInput').value = "";
    } else { alert("Kode salah!"); }
}

function saveEvent() {
    const data = {
        password: PASSWORD,
        title: document.getElementById('evTitle').value,
        date: document.getElementById('evDate').value,
        img: document.getElementById('evImg').value,
        link: document.getElementById('evLink').value,
        desc: document.getElementById('evDesc').value
    };
    if (!data.title || !data.date) { alert("Judul & Tanggal wajib!"); return; }
    fetch(API_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(() => {
        closeModal('addEventModal'); alert("Acara berhasil ditambahkan!"); loadEvents();
        ['evTitle', 'evDate', 'evImg', 'evLink', 'evDesc'].forEach(id => document.getElementById(id).value = '');
    }).catch(() => alert("Gagal menyimpan."));
}

// ========== CALCULATIONS ==========
function calculateCVC() {
    let symptomCount = 0; let hasCriticalSign = false;
    if (document.getElementById('q1')?.checked) symptomCount++;
    if (document.getElementById('q2')?.checked) symptomCount++;
    if (document.getElementById('q3')?.checked) symptomCount++;
    if (document.getElementById('q4')?.checked) { symptomCount++; hasCriticalSign = true; }
    if (document.getElementById('q5')?.checked) { symptomCount++; hasCriticalSign = true; }

    let level = "", msg = "";
    const scoreCircle = document.getElementById('cvc-score-circle');
    scoreCircle.className = "score-circle";
    
    if (hasCriticalSign || symptomCount >= 4) { level = "Tinggi"; msg = "🚨 DARURAT! Segera ke RS."; scoreCircle.classList.add('risk-high'); }
    else if (symptomCount >= 2) { level = "Sedang"; msg = "⚠️ SEGERA LAPOR."; scoreCircle.classList.add('risk-medium'); }
    else if (symptomCount === 1) { level = "Rendah"; msg = "⚠️ Perlu Perhatian."; scoreCircle.classList.add('risk-low'); }
    else { level = "Aman"; msg = "✔️ Kondisi Aman."; scoreCircle.classList.add('risk-low'); }

    document.getElementById('cvc-form').style.display = 'none';
    document.getElementById('cvc-result').style.display = 'block';
    document.getElementById('score-val').innerText = symptomCount;
    document.getElementById('risk-msg').innerText = msg;
    document.getElementById('risk-badge').innerText = level;
    document.getElementById('risk-badge').className = `badge ${level === 'Tinggi' ? 'badge-red' : level === 'Sedang' ? 'badge-orange' : 'badge-teal'}`;
    
    const patientId = document.getElementById('cvc_id').value || 'Pasien';
    const actionDiv = document.getElementById('cvc-critical-action');
    
    let actionsHTML = '';
    if (level === "Tinggi") { actionsHTML += `<a href="tel:119" class="report-btn-specific" style="background:var(--color-danger); color:white;">🚨 Hubungi 119 (Darurat)</a>`; }
    
    actionsHTML += `
        <p style="font-size:12px; margin-top:10px; color:var(--text-muted);">Laporkan kondisi ini ke Admin:</p>
        <a href="https://wa.me/6282227707573?text=${encodeURIComponent(`Laporan CVC%0AID: ${patientId}%0AStatus: ${level}%0AGejala: ${symptomCount}`)}" target="_blank" class="report-btn-specific whatsapp">📞 Kak Ginjal</a>
        <a href="https://wa.me/6283831217784?text=${encodeURIComponent(`Laporan CVC%0AID: ${patientId}%0AStatus: ${level}%0AGejala: ${symptomCount}`)}" target="_blank" class="report-btn-specific whatsapp">📞 Kak Vena</a>`;
    
    actionDiv.innerHTML = actionsHTML;

    if (currentUser) {
        currentUser.stats.totalChecks = (currentUser.stats.totalChecks || 0) + 1;
        currentUser.stats.lastCheck = 'Hari Ini';
        saveUserToStorage(); updateUIForLoggedInUser();
    }
}

function resetCVC() {
    document.getElementById('cvc-form').style.display = 'block';
    document.getElementById('cvc-result').style.display = 'none';
    document.querySelectorAll('#cvc-form input[type="checkbox"]').forEach(c => c.checked = false);
}

function calculateAV() {
    const c_vis_red = document.getElementById('av_vis_red').checked;
    const c_vis_pus = document.getElementById('av_vis_pus').checked;
    const thrillVal = document.querySelector('input[name="av_thrill"]:checked')?.value;
    const patientId = document.getElementById('av_id').value || 'Pasien';
    
    let status = "BAIK", msg = "Kondisi fistula baik.", color = "badge-teal";
    if (c_vis_pus || thrillVal === 'gone') { status = "DARURAT"; msg = "🚨 Segera ke IGD!"; color = "badge-red"; }
    else if (c_vis_red) { status = "PERHATIAN"; msg = "⚠️ Konsultasi admin."; color = "badge-orange"; }

    document.getElementById('av-form').style.display = 'none';
    document.getElementById('av-result').style.display = 'block';
    document.getElementById('av-badge').innerText = status;
    document.getElementById('av-badge').className = `badge ${color}`;
    document.getElementById('av-msg').innerText = msg;

    const actionDiv = document.getElementById('av-critical-action');
    let actionsHTML = '';
    if (status === "DARURAT") { actionsHTML += `<a href="tel:119" class="report-btn-specific" style="background:var(--color-danger); color:white;">🚨 Hubungi 119 (Darurat)</a>`; }

    actionsHTML += `
        <p style="font-size:12px; margin-top:10px; color:var(--text-muted);">Laporkan kondisi ini ke Admin:</p>
        <a href="https://wa.me/6282227707573?text=${encodeURIComponent(`Laporan AV Shunt%0AID: ${patientId}%0AStatus: ${status}`)}" target="_blank" class="report-btn-specific whatsapp">📞 Kak Ginjal</a>
        <a href="https://wa.me/6283831217784?text=${encodeURIComponent(`Laporan AV Shunt%0AID: ${patientId}%0AStatus: ${status}`)}" target="_blank" class="report-btn-specific whatsapp">📞 Kak Vena</a>`;

    actionDiv.innerHTML = actionsHTML;

    if (currentUser) {
        currentUser.stats.totalChecks = (currentUser.stats.totalChecks || 0) + 1;
        currentUser.stats.lastCheck = 'Hari Ini';
        saveUserToStorage(); updateUIForLoggedInUser();
    }
}

function resetAV() {
    document.getElementById('av-form').style.display = 'block';
    document.getElementById('av-result').style.display = 'none';
    document.querySelector('input[name="av_thrill"][value="normal"]').checked = true;
    document.querySelectorAll('#av-form input[type="checkbox"]').forEach(c => c.checked = false);
}

// ========== INIT ==========
window.addEventListener('load', () => {
    loadEvents();
    if (!loadUserFromStorage()) { setTimeout(() => openModal('authModal'), 1000); }
});
