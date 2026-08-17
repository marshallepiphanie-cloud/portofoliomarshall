// Initial User list state
let users = [
    { id: 1, name: 'Lucas Vessier', email: 'digitalvecteur@gmail.com', role: 'Administrateur', status: 'Actif' },
    { id: 2, name: 'Sophie Martin', email: 's.martin@innov.fr', role: 'Éditeur', status: 'Actif' },
    { id: 3, name: 'Pierre Durand', email: 'durand.p@mail.com', role: 'Utilisateur', status: 'Actif' },
    { id: 4, name: 'Claire Dubois', email: 'c.dubois@corporation.com', role: 'Utilisateur', status: 'Suspendu' }
];

// Active Chart objects
let trafficChart = null;
let responseTimeChart = null;
let cpuChart = null;

// App init
document.addEventListener('DOMContentLoaded', () => {
    // Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Set up tabs and default data
    setupTabs();
    setupUsersList();
    setupSettings();
    loadOverviewTab();
});

// Setup tab buttons switching
function setupTabs() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetTab = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            document.getElementById(targetTab).classList.add('active');

            // Header title sync
            document.getElementById('tab-title').textContent = btn.querySelector('span').textContent;

            // Trigger specific chart draw/load
            if (targetTab === 'home-tab') loadOverviewTab();
            if (targetTab === 'users-tab') renderUsersTable();
            if (targetTab === 'charts-tab') loadPerformanceTab();
        });
    });
}

// --------------------------------------------------------------------------
// TAB 1: APERÇU SYSTÈME
// --------------------------------------------------------------------------
function loadOverviewTab() {
    generateSystemLogs();
    drawTrafficChart();
}

function generateSystemLogs() {
    const logList = document.getElementById('log-list');
    if (!logList) return;

    logList.innerHTML = '';
    const logs = [
        { time: '14:41:02', text: 'Connexion de digitalvecteur@gmail.com depuis 192.168.1.5', type: 'success' },
        { time: '14:38:15', text: 'Sauvegarde automatique de la DB effectuée avec succès.', type: 'info' },
        { time: '14:22:40', text: 'Alerte : Tentative de connexion échouée (IP: 95.84.120.3)', type: 'warning' },
        { time: '14:10:55', text: 'Requête API lente détectée : GET /api/stats (380ms)', type: 'warning' },
        { time: '13:58:12', text: 'Mise à jour du rôle utilisateur (ID: 3) à "Éditeur" par Admin.', type: 'info' },
        { time: '13:41:20', text: 'Serveur de production démarré sur le port 8080.', type: 'success' }
    ];

    logs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'log-item';
        item.innerHTML = `
            <span class="log-time">[${log.time}]</span>
            <span class="log-text ${log.type}">${log.text}</span>
        `;
        logList.appendChild(item);
    });
}

function drawTrafficChart() {
    const canvas = document.getElementById('traffic-chart');
    if (!canvas) return;

    if (trafficChart) trafficChart.destroy();

    // Past 7 hours mock values
    const labels = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
    const dataPoints = [120, 240, 310, 480, 520, 410, 495];

    trafficChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Requêtes / min',
                data: dataPoints,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.05)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#9ca3af' } },
                x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
            }
        }
    });
}

// --------------------------------------------------------------------------
// TAB 2: UTILISATEURS & RÔLES
// --------------------------------------------------------------------------
function setupUsersList() {
    // Search
    document.getElementById('user-search').addEventListener('input', () => {
        const query = document.getElementById('user-search').value.toLowerCase();
        const filtered = users.filter(u => 
            u.name.toLowerCase().includes(query) || 
            u.email.toLowerCase().includes(query) || 
            u.role.toLowerCase().includes(query)
        );
        renderUsersTable(filtered);
    });

    // Modals
    document.getElementById('btn-add-user').addEventListener('click', () => openUserModal());
    document.getElementById('user-modal-close').addEventListener('click', closeUserModal);
    document.getElementById('btn-cancel-user').addEventListener('click', closeUserModal);
    document.getElementById('user-form').addEventListener('submit', handleUserSubmit);
}

function renderUsersTable(list = users) {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    list.forEach(u => {
        const tr = document.createElement('tr');
        
        // Build role selector dropdown
        const roles = ['Administrateur', 'Éditeur', 'Utilisateur'];
        let roleOptions = '';
        roles.forEach(r => {
            roleOptions += `<option value="${r}" ${u.role === r ? 'selected' : ''}>${r}</option>`;
        });

        const initial = u.name.split(' ').map(n => n[0]).join('');

        tr.innerHTML = `
            <td>
                <div class="user-avatar-circle">${initial}</div>
            </td>
            <td><strong>${u.name}</strong></td>
            <td>${u.email}</td>
            <td>
                <select class="role-select" onchange="changeUserRole(${u.id}, this.value)">
                    ${roleOptions}
                </select>
            </td>
            <td><span class="status-pill ${u.status}">${u.status}</span></td>
            <td class="text-right">
                <button class="btn-action edit" onclick="editUser(${u.id})"><i data-lucide="edit-3"></i></button>
                <button class="btn-action delete" onclick="deleteUser(${u.id})"><i data-lucide="trash-2"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Simulated role change with instant DB update notification
window.changeUserRole = (userId, newRole) => {
    const user = users.find(u => u.id === userId);
    if (user) {
        user.role = newRole;
        showNotification(`[SQL Update] Rôle de "${user.name}" mis à jour en "${newRole}" dans la base de données SQL.`);
    }
};

// Open user modal
function openUserModal(user = null) {
    const modal = document.getElementById('user-modal');
    const title = document.getElementById('user-modal-title');
    const form = document.getElementById('user-form');
    
    form.reset();

    if (user) {
        title.textContent = 'Modifier l\'utilisateur';
        document.getElementById('user-id-field').value = user.id;
        document.getElementById('user-name').value = user.name;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-role').value = user.role;
        document.getElementById('user-status').value = user.status;
    } else {
        title.textContent = 'Créer un Utilisateur';
        document.getElementById('user-id-field').value = '';
    }

    modal.classList.add('open');
}

function closeUserModal() {
    document.getElementById('user-modal').classList.remove('open');
}

function handleUserSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('user-id-field').value;
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const role = document.getElementById('user-role').value;
    const status = document.getElementById('user-status').value;

    if (id) {
        // Edit mode
        const user = users.find(u => u.id === parseInt(id));
        if (user) {
            user.name = name;
            user.email = email;
            user.role = role;
            user.status = status;
            showNotification(`[SQL Update] Utilisateur "${name}" modifié dans la base de données.`);
        }
    } else {
        // Create mode
        const newUser = { id: Date.now(), name, email, role, status };
        users.push(newUser);
        showNotification(`[SQL Insert] Nouvel utilisateur "${name}" inséré avec succès dans la base de données.`);
    }

    closeUserModal();
    renderUsersTable();
}

window.editUser = (id) => {
    const user = users.find(u => u.id === id);
    if (user) openUserModal(user);
};

window.deleteUser = (id) => {
    const user = users.find(u => u.id === id);
    if (user && confirm(`Voulez-vous supprimer l'utilisateur "${user.name}" ?`)) {
        users = users.filter(u => u.id !== id);
        showNotification(`[SQL Delete] Utilisateur "${user.name}" supprimé de la base de données.`);
        renderUsersTable();
    }
};

// --------------------------------------------------------------------------
// TAB 3: SYSTEM PERFORMANCES
// --------------------------------------------------------------------------
function loadPerformanceTab() {
    drawResponseTimeChart();
    drawCpuChart();
}

function drawResponseTimeChart() {
    const canvas = document.getElementById('response-time-chart');
    if (!canvas) return;

    if (responseTimeChart) responseTimeChart.destroy();

    responseTimeChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['GET /api/users', 'GET /api/stats', 'POST /api/auth', 'PUT /api/roles', 'DELETE /api/logs'],
            datasets: [{
                label: 'Temps (ms)',
                data: [12, 45, 115, 24, 8],
                backgroundColor: 'rgba(6, 182, 212, 0.75)',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#9ca3af' } },
                x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
            }
        }
    });
}

function drawCpuChart() {
    const canvas = document.getElementById('cpu-chart');
    if (!canvas) return;

    if (cpuChart) cpuChart.destroy();

    cpuChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: ['14:00', '14:10', '14:20', '14:30', '14:40', '14:50'],
            datasets: [
                {
                    label: 'CPU (%)',
                    data: [8, 14, 25, 11, 7, 12],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'Mémoire (%)',
                    data: [42, 43, 48, 44, 42, 45],
                    borderColor: '#06b6d4',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans' } }
                }
            },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#9ca3af' } },
                x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
            }
        }
    });
}

// --------------------------------------------------------------------------
// TAB 4: CONFIGURATION SETTINGS
// --------------------------------------------------------------------------
function setupSettings() {
    const btnRegen = document.getElementById('btn-regen-api');
    const apiField = document.getElementById('api-key-field');
    
    if (btnRegen && apiField) {
        btnRegen.addEventListener('click', () => {
            const randomHex = Math.random().toString(16).substr(2, 18);
            apiField.value = `vt_live_${randomHex}`;
            showNotification('Nouvelle clé d\'API générée avec succès.');
        });
    }

    const form = document.getElementById('settings-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            btn.style.pointerEvents = 'none';
            btn.querySelector('span').textContent = 'Sauvegarde...';

            setTimeout(() => {
                btn.style.pointerEvents = 'auto';
                btn.querySelector('span').textContent = 'Enregistrer les paramètres';
                showNotification('Paramètres de configuration système sauvegardés.');
            }, 1000);
        });
    }
}

// Floating API/Database notification
function showNotification(text) {
    const notifyDiv = document.createElement('div');
    notifyDiv.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: rgba(12, 11, 18, 0.95);
        color: white; border: 1px solid rgba(6, 182, 212, 0.25);
        padding: 12px 20px; border-radius: 8px; z-index: 1000;
        font-size: 0.85rem; font-weight: 600; max-width: 380px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.4); backdrop-filter: blur(8px);
        display: flex; gap: 10px; align-items: center;
        transition: all 0.5s ease;
    `;
    notifyDiv.innerHTML = `<i data-lucide="database" style="width:16px;height:16px;color:#22d3ee;flex-shrink:0;"></i> <span>${text}</span>`;
    document.body.appendChild(notifyDiv);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(() => {
        notifyDiv.style.opacity = '0';
        notifyDiv.style.transform = 'translateY(20px)';
        setTimeout(() => notifyDiv.remove(), 500);
    }, 5000);
}