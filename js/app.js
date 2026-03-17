// js/app.js

// ... (Kode konfigurasi dan state sebelumnya tetap sama) ...

// ========== UI FUNCTIONS ==========
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// Fungsi baru untuk menutup modal saat klik di luar area
function closeModalOnOverlay(event, id) {
    if (event.target.id === id) {
        closeModal(id);
    }
}

// ... (Kode avatar dan auth sebelumnya tetap sama) ...

// ========== CALCULATIONS (UPDATED) ==========

function calculateCVC() {
    let symptomCount = 0;
    let hasCriticalSign = false;
    
    if (document.getElementById('q1')?.checked) symptomCount++;
    if (document.getElementById('q2')?.checked) symptomCount++;
    if (document.getElementById('q3')?.checked) symptomCount++;
    if (document.getElementById('q4')?.checked) { symptomCount++; hasCriticalSign = true; }
    if (document.getElementById('q5')?.checked) { symptomCount++; hasCriticalSign = true; }

    let level = "", msg = "";
    const scoreCircle = document.getElementById('cvc-score-circle');
    scoreCircle.className = "score-circle";
    
    if (hasCriticalSign || symptomCount >= 4) {
        level = "Tinggi"; msg = "🚨 DARURAT! Segera ke RS."; scoreCircle.classList.add('risk-high');
    } else if (symptomCount >= 2) {
        level = "Sedang"; msg = "⚠️ SEGERA LAPOR."; scoreCircle.classList.add('risk-medium');
    } else if (symptomCount === 1) {
        level = "Rendah"; msg = "⚠️ Perlu Perhatian."; scoreCircle.classList.add('risk-low');
    } else {
        level = "Aman"; msg = "✔️ Kondisi Aman."; scoreCircle.classList.add('risk-low');
    }

    document.getElementById('cvc-form').style.display = 'none';
    document.getElementById('cvc-result').style.display = 'block';
    document.getElementById('score-val').innerText = symptomCount;
    document.getElementById('risk-msg').innerText = msg;
    document.getElementById('risk-badge').innerText = level;
    document.getElementById('risk-badge').className = `badge ${level === 'Tinggi' ? 'badge-red' : level === 'Sedang' ? 'badge-orange' : 'badge-teal'}`;
    
    // Updated Action Buttons with Specific Contacts
    const patientId = document.getElementById('cvc_id').value || 'Pasien';
    const actionDiv = document.getElementById('cvc-critical-action');
    
    let actionsHTML = '';
    
    if (level === "Tinggi") {
        actionsHTML += `<a href="tel:119" class="report-btn-specific" style="background:var(--color-danger); color:white;">🚨 Hubungi 119 (Darurat)</a>`;
    }
    
    actionsHTML += `
        <p style="font-size:12px; margin-top:10px; color:var(--text-muted);">Laporkan kondisi ini ke Admin:</p>
        <a href="https://wa.me/6282227707573?text=${encodeURIComponent(`Laporan CVC%0AID: ${patientId}%0AStatus: ${level}%0AGejala: ${symptomCount}`)}" target="_blank" class="report-btn-specific whatsapp">
            📞 Kak Ginjal
        </a>
        <a href="https://wa.me/6283831217784?text=${encodeURIComponent(`Laporan CVC%0AID: ${patientId}%0AStatus: ${level}%0AGejala: ${symptomCount}`)}" target="_blank" class="report-btn-specific whatsapp">
            📞 Kak Vena
        </a>
    `;
    
    actionDiv.innerHTML = actionsHTML;

    // Update user stats
    if (currentUser) {
        currentUser.stats.totalChecks = (currentUser.stats.totalChecks || 0) + 1;
        currentUser.stats.lastCheck = 'Hari Ini';
        saveUserToStorage();
        updateUIForLoggedInUser();
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
    
    if (c_vis_pus || thrillVal === 'gone') {
        status = "DARURAT"; msg = "🚨 Segera ke IGD!"; color = "badge-red";
    } else if (c_vis_red) {
        status = "PERHATIAN"; msg = "⚠️ Konsultasi admin."; color = "badge-orange";
    }

    document.getElementById('av-form').style.display = 'none';
    document.getElementById('av-result').style.display = 'block';
    document.getElementById('av-badge').innerText = status;
    document.getElementById('av-badge').className = `badge ${color}`;
    document.getElementById('av-msg').innerText = msg;

    // Updated Action Buttons
    const actionDiv = document.getElementById('av-critical-action');
    let actionsHTML = '';

    if (status === "DARURAT") {
        actionsHTML += `<a href="tel:119" class="report-btn-specific" style="background:var(--color-danger); color:white;">🚨 Hubungi 119 (Darurat)</a>`;
    }

    actionsHTML += `
        <p style="font-size:12px; margin-top:10px; color:var(--text-muted);">Laporkan kondisi ini ke Admin:</p>
        <a href="https://wa.me/6282227707573?text=${encodeURIComponent(`Laporan AV Shunt%0AID: ${patientId}%0AStatus: ${status}`)}" target="_blank" class="report-btn-specific whatsapp">
            📞 Kak Ginjal
        </a>
        <a href="https://wa.me/6283831217784?text=${encodeURIComponent(`Laporan AV Shunt%0AID: ${patientId}%0AStatus: ${status}`)}" target="_blank" class="report-btn-specific whatsapp">
            📞 Kak Vena
        </a>
    `;

    actionDiv.innerHTML = actionsHTML;

    if (currentUser) {
        currentUser.stats.totalChecks = (currentUser.stats.totalChecks || 0) + 1;
        currentUser.stats.lastCheck = 'Hari Ini';
        saveUserToStorage();
        updateUIForLoggedInUser();
    }
}

function resetAV() {
    document.getElementById('av-form').style.display = 'block';
    document.getElementById('av-result').style.display = 'none';
    document.querySelector('input[name="av_thrill"][value="normal"]').checked = true;
    document.querySelectorAll('#av-form input[type="checkbox"]').forEach(c => c.checked = false);
}

// ... (Kode init sebelumnya tetap sama) ...
