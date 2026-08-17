const API_URL = 'http://127.0.0.1:5000/api';

// App state
let state = {
    token: localStorage.getItem('crm_token') || null,
    user: JSON.parse(localStorage.getItem('crm_user')) || null,
    clients: [],
    invoices: [],
    stats: {},
    isMocked: false // True if backend is not responding and we fall back to localStorage mock
};

// Mock data for fallback simulation (local storage backup)
const MOCK_STORAGE_KEY = 'crm_mock_db';
function getMockDB() {
    let db = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!db) {
        db = {
            clients: [
                { id: 1, userId: 1, name: 'Jean Dupont', email: 'jean.dupont@entreprise.com', phone: '0612345678', company: 'BatiFrance', status: 'actif' },
                { id: 2, userId: 1, name: 'Sophie Martin', email: 's.martin@innov.fr', phone: '0789456123', company: 'InnovCorp', status: 'actif' },
                { id: 3, userId: 1, name: 'Pierre Durand', email: 'durand.pierre@mail.com', phone: '0654321098', company: 'Indépendant', status: 'inactif' }
            ],
            invoices: [
                { id: 1, userId: 1, clientId: 1, number: 'FAC-2026-001', amount: 1500.00, status: 'paye', date: '2026-07-10', dueDate: '2026-08-10' },
                { id: 2, userId: 1, clientId: 2, number: 'FAC-2026-002', amount: 3200.00, status: 'envoye', date: '2026-07-15', dueDate: '2026-08-15' },
                { id: 3, userId: 1, clientId: 3, number: 'FAC-2026-003', amount: 450.00, status: 'brouillon', date: '2026-07-20', dueDate: '2026-08-20' },
                { id: 4, userId: 1, clientId: 1, number: 'FAC-2026-004', amount: 2800.00, status: 'paye', date: '2026-07-22', dueDate: '2026-08-22' }
            ]
        };
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
    } else {
        db = JSON.parse(db);
    }
    return db;
}

function saveMockDB(db) {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
}

// Chart variables to destroy before redraws
let revenueChart = null;
let statusChart = null;
let salesChart = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Check server status
    checkBackendConnection().then(() => {
        setupEventListeners();
        if (state.token) {
            showDashboard();
        } else {
            showLogin();
        }
    });
});

// Test connection to backend Node.js server
async function checkBackendConnection() {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: true })
        }).catch(() => { throw new Error(); });
        state.isMocked = false;
        console.log("Connected to local Node.js server.");
    } catch (e) {
        state.isMocked = true;
        console.warn("Backend not running. Running in Frontend Simulated Mode.");
        showNotification("Mode Démo Activé : Le serveur Node.js sur le port 5000 ne tourne pas en ce moment. Les données sont stockées localement dans votre navigateur.");
    }
}

// Show a floating warning notification
function showNotification(text) {
    const notifyDiv = document.createElement('div');
    notifyDiv.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: rgba(245, 158, 11, 0.9);
        color: white; border: 1px solid rgba(255,255,255,0.15);
        padding: 14px 20px; border-radius: 8px; z-index: 1000;
        font-size: 0.8rem; font-weight: 600; max-width: 360px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3); backdrop-filter: blur(8px);
        display: flex; gap: 10px; align-items: center;
        transition: all 0.5s ease;
    `;
    notifyDiv.innerHTML = `<i data-lucide="alert-triangle" style="width:16px;height:16px;flex-shrink:0;"></i> <span>${text}</span>`;
    document.body.appendChild(notifyDiv);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(() => {
        notifyDiv.style.opacity = '0';
        notifyDiv.style.transform = 'translateY(20px)';
        setTimeout(() => notifyDiv.remove(), 500);
    }, 6000);
}

// Request wrapper with Auth Headers
async function request(path, options = {}) {
    if (state.isMocked) {
        return mockRequest(path, options);
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Une erreur est survenue.');
    }
    return res.json();
}

// Emulate backend routes client-side using localStorage
function mockRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getMockDB();

            // 1. Auth Login
            if (path === '/auth/login' && options.method === 'POST') {
                const { email, password } = JSON.parse(options.body);
                if (email === 'digitalvecteur@gmail.com' && password === 'admin') {
                    resolve({
                        token: 'mock_token_vecteur',
                        user: { id: 1, email: 'digitalvecteur@gmail.com', name: 'AGUETON EPIPHANIE' }
                    });
                } else {
                    reject(new Error('Identifiants de test incorrects. (digitalvecteur@gmail.com / admin)'));
                }
                return;
            }

            // 2. Clients
            if (path === '/clients') {
                if (options.method === 'GET' || !options.method) {
                    resolve(db.clients);
                } else if (options.method === 'POST') {
                    const body = JSON.parse(options.body);
                    const newClient = { id: Date.now(), userId: 1, ...body, status: body.status || 'actif' };
                    db.clients.push(newClient);
                    saveMockDB(db);
                    resolve(newClient);
                }
                return;
            }

            if (path.startsWith('/clients/')) {
                const id = parseInt(path.split('/').pop());
                if (options.method === 'PUT') {
                    const body = JSON.parse(options.body);
                    const idx = db.clients.findIndex(c => c.id === id);
                    if (idx !== -1) {
                        db.clients[idx] = { ...db.clients[idx], ...body };
                        saveMockDB(db);
                        resolve(db.clients[idx]);
                    } else {
                        reject(new Error('Client introuvable.'));
                    }
                } else if (options.method === 'DELETE') {
                    db.clients = db.clients.filter(c => c.id !== id);
                    db.invoices = db.invoices.filter(i => i.clientId !== id);
                    saveMockDB(db);
                    resolve({ success: true });
                }
                return;
            }

            // 3. Invoices
            if (path === '/invoices') {
                if (options.method === 'GET' || !options.method) {
                    resolve(db.invoices);
                } else if (options.method === 'POST') {
                    const body = JSON.parse(options.body);
                    const newInv = {
                        id: Date.now(),
                        userId: 1,
                        clientId: parseInt(body.clientId),
                        number: body.number,
                        amount: parseFloat(body.amount),
                        status: body.status || 'brouillon',
                        date: body.date,
                        dueDate: body.dueDate
                    };
                    db.invoices.push(newInv);
                    saveMockDB(db);
                    resolve(newInv);
                }
                return;
            }

            if (path.startsWith('/invoices/')) {
                const id = parseInt(path.split('/').pop());
                if (options.method === 'PUT') {
                    const body = JSON.parse(options.body);
                    const idx = db.invoices.findIndex(i => i.id === id);
                    if (idx !== -1) {
                        db.invoices[idx] = {
                            ...db.invoices[idx],
                            ...body,
                            clientId: body.clientId ? parseInt(body.clientId) : db.invoices[idx].clientId,
                            amount: body.amount ? parseFloat(body.amount) : db.invoices[idx].amount
                        };
                        saveMockDB(db);
                        resolve(db.invoices[idx]);
                    } else {
                        reject(new Error('Facture introuvable.'));
                    }
                } else if (options.method === 'DELETE') {
                    db.invoices = db.invoices.filter(i => i.id !== id);
                    saveMockDB(db);
                    resolve({ success: true });
                }
                return;
            }

            // 4. Stats
            if (path === '/stats') {
                const totalClients = db.clients.length;
                const totalInvoices = db.invoices.length;
                let totalRevenue = 0;
                let pendingInvoicesCount = 0;

                db.invoices.forEach(i => {
                    if (i.status === 'paye') totalRevenue += i.amount;
                    else if (i.status === 'envoye') pendingInvoicesCount++;
                });

                const recentActivity = db.invoices.slice(-4).map(i => {
                    const client = db.clients.find(c => c.id === i.clientId);
                    return {
                        id: i.id,
                        type: 'facture',
                        title: `Facture ${i.number} - ${client ? client.company : 'Client Inconnu'}`,
                        amount: i.amount,
                        status: i.status,
                        date: i.date
                    };
                });

                resolve({
                    totalClients,
                    totalInvoices,
                    totalRevenue,
                    pendingInvoicesCount,
                    recentActivity
                });
                return;
            }

            reject(new Error('URL non supportée en mode simulation.'));
        }, 300);
    });
}

// Auth workflow
function setupEventListeners() {
    // Login Form Submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const submitBtn = document.getElementById('login-btn');

            submitBtn.style.pointerEvents = 'none';
            submitBtn.querySelector('span').textContent = 'Connexion...';

            try {
                const res = await request('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });
                state.token = res.token;
                state.user = res.user;
                localStorage.setItem('crm_token', res.token);
                localStorage.setItem('crm_user', JSON.stringify(res.user));

                showDashboard();
            } catch (err) {
                alert(err.message);
            } finally {
                submitBtn.style.pointerEvents = 'auto';
                submitBtn.querySelector('span').textContent = 'Accéder au CRM';
            }
        });
    }

    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        state.token = null;
        state.user = null;
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_user');
        showLogin();
    });

    // Tab buttons switching
    const tabBtns = document.querySelectorAll('.nav-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetTab = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
            document.getElementById(targetTab).classList.add('active');

            // Set header title
            document.getElementById('tab-title').textContent = btn.querySelector('span').textContent;

            // Trigger tab loading
            if (targetTab === 'dashboard-tab') loadDashboardData();
            if (targetTab === 'clients-tab') loadClientsData();
            if (targetTab === 'invoices-tab') loadInvoicesData();
            if (targetTab === 'stats-tab') loadStatsData();
        });
    });

    // Client CRUD Modals
    document.getElementById('btn-add-client').addEventListener('click', () => openClientModal());
    document.getElementById('client-modal-close').addEventListener('click', closeClientModal);
    document.getElementById('btn-cancel-client').addEventListener('click', closeClientModal);
    document.getElementById('client-form').addEventListener('submit', handleClientSubmit);
    document.getElementById('client-search').addEventListener('input', filterClients);

    // Invoice CRUD Modals
    document.getElementById('btn-add-invoice').addEventListener('click', () => openInvoiceModal());
    document.getElementById('invoice-modal-close').addEventListener('click', closeInvoiceModal);
    document.getElementById('btn-cancel-invoice').addEventListener('click', closeInvoiceModal);
    document.getElementById('invoice-form').addEventListener('submit', handleInvoiceSubmit);
    document.getElementById('invoice-search').addEventListener('input', filterInvoices);
}

// Display configurations
function showLogin() {
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('crm-app').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('crm-app').style.display = 'flex';
    document.getElementById('user-display-name').textContent = state.user.name;
    loadDashboardData();
}

// --------------------------------------------------------------------------
// DATA FETCH & RENDER - DASHBOARD
// --------------------------------------------------------------------------
async function loadDashboardData() {
    try {
        const stats = await request('/stats');
        document.getElementById('kpi-clients').textContent = stats.totalClients;
        document.getElementById('kpi-invoices').textContent = stats.totalInvoices;
        document.getElementById('kpi-revenue').textContent = `${stats.totalRevenue.toLocaleString()} €`;
        document.getElementById('kpi-pending').textContent = stats.pendingInvoicesCount;

        // Render Recent Activity
        const activityList = document.getElementById('activity-list');
        activityList.innerHTML = '';
        if (stats.recentActivity.length === 0) {
            activityList.innerHTML = '<div class="loading-spinner">Aucune activité récente.</div>';
        } else {
            stats.recentActivity.forEach(act => {
                const item = document.createElement('div');
                item.className = 'activity-item';
                item.innerHTML = `
                    <div class="activity-details">
                        <span class="activity-title">${act.title}</span>
                        <span class="activity-date">${act.date}</span>
                    </div>
                    <span class="activity-amount ${act.status}">${act.amount.toLocaleString()} €</span>
                `;
                activityList.appendChild(item);
            });
        }

        // Draw basic revenue chart
        const invoices = await request('/invoices');
        drawRevenueChart(invoices);

    } catch (e) {
        console.error(e);
    }
}

function drawRevenueChart(invoices) {
    const canvas = document.getElementById('revenue-chart');
    if (!canvas) return;

    if (revenueChart) revenueChart.destroy();

    // Sort invoices by date
    const sorted = invoices.filter(i => i.status === 'paye').sort((a, b) => new Date(a.date) - new Date(b.date));

    // Group values by date
    const labels = sorted.map(i => i.date);
    let runningTotal = 0;
    const dataPoints = sorted.map(i => {
        runningTotal += i.amount;
        return runningTotal;
    });

    revenueChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels.length > 0 ? labels : ['Début'],
            datasets: [{
                label: 'Chiffre d\'Affaires cumulé (€)',
                data: dataPoints.length > 0 ? dataPoints : [0],
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

// --------------------------------------------------------------------------
// DATA FETCH & RENDER - CLIENTS
// --------------------------------------------------------------------------
async function loadClientsData() {
    try {
        state.clients = await request('/clients');
        renderClientsTable(state.clients);
    } catch (e) {
        console.error(e);
    }
}

function renderClientsTable(clients) {
    const tbody = document.getElementById('clients-table-body');
    tbody.innerHTML = '';

    clients.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${c.name}</strong></td>
            <td>${c.email}</td>
            <td>${c.phone || '-'}</td>
            <td>${c.company}</td>
            <td><span class="status-pill ${c.status}">${c.status}</span></td>
            <td class="text-right">
                <button class="btn-action edit" onclick="editClient(${c.id})"><i data-lucide="edit-2"></i></button>
                <button class="btn-action delete" onclick="deleteClient(${c.id})"><i data-lucide="trash-2"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function filterClients() {
    const query = document.getElementById('client-search').value.toLowerCase();
    const filtered = state.clients.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.company.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
    );
    renderClientsTable(filtered);
}

// Client Modal forms
function openClientModal(client = null) {
    const modal = document.getElementById('client-modal');
    const title = document.getElementById('client-modal-title');
    const form = document.getElementById('client-form');

    form.reset();

    if (client) {
        title.textContent = 'Modifier le Client';
        document.getElementById('client-id-field').value = client.id;
        document.getElementById('client-name').value = client.name;
        document.getElementById('client-email').value = client.email;
        document.getElementById('client-phone').value = client.phone || '';
        document.getElementById('client-company').value = client.company;
        document.getElementById('client-status').value = client.status;
    } else {
        title.textContent = 'Nouveau Client';
        document.getElementById('client-id-field').value = '';
    }

    modal.classList.add('open');
}

function closeClientModal() {
    document.getElementById('client-modal').classList.remove('open');
}

async function handleClientSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('client-id-field').value;
    const name = document.getElementById('client-name').value;
    const email = document.getElementById('client-email').value;
    const phone = document.getElementById('client-phone').value;
    const company = document.getElementById('client-company').value;
    const status = document.getElementById('client-status').value;

    const payload = { name, email, phone, company, status };

    try {
        if (id) {
            await request(`/clients/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            await request('/clients', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }
        closeClientModal();
        loadClientsData();
    } catch (err) {
        alert(err.message);
    }
}

// Global hooks for edit/delete triggered in inline HTML strings
window.editClient = (id) => {
    const client = state.clients.find(c => c.id === id);
    if (client) openClientModal(client);
};

window.deleteClient = async (id) => {
    if (confirm('Voulez-vous vraiment supprimer ce client ? Toutes ses factures seront supprimées en cascade.')) {
        try {
            await request(`/clients/${id}`, { method: 'DELETE' });
            loadClientsData();
        } catch (e) {
            alert(e.message);
        }
    }
};

// --------------------------------------------------------------------------
// DATA FETCH & RENDER - INVOICES
// --------------------------------------------------------------------------
async function loadInvoicesData() {
    try {
        state.invoices = await request('/invoices');
        state.clients = await request('/clients');
        renderInvoicesTable(state.invoices);
    } catch (e) {
        console.error(e);
    }
}

function renderInvoicesTable(invoices) {
    const tbody = document.getElementById('invoices-table-body');
    tbody.innerHTML = '';

    invoices.forEach(i => {
        const client = state.clients.find(c => c.id === i.clientId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${i.number}</strong></td>
            <td>${client ? client.name : 'Client Inconnu'} <span style="font-size:0.75rem;color:var(--color-text-muted)">(${client ? client.company : '-'})</span></td>
            <td>${i.date}</td>
            <td>${i.dueDate}</td>
            <td><strong>${i.amount.toLocaleString()} €</strong></td>
            <td><span class="status-pill ${i.status}">${i.status}</span></td>
            <td class="text-right">
                <button class="btn-action edit" onclick="editInvoice(${i.id})"><i data-lucide="edit-2"></i></button>
                <button class="btn-action delete" onclick="deleteInvoice(${i.id})"><i data-lucide="trash-2"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function filterInvoices() {
    const query = document.getElementById('invoice-search').value.toLowerCase();
    const filtered = state.invoices.filter(i => {
        const client = state.clients.find(c => c.id === i.clientId);
        return i.number.toLowerCase().includes(query) ||
            (client && client.name.toLowerCase().includes(query)) ||
            (client && client.company.toLowerCase().includes(query));
    });
    renderInvoicesTable(filtered);
}

// Invoice modals
async function openInvoiceModal(invoice = null) {
    const modal = document.getElementById('invoice-modal');
    const title = document.getElementById('invoice-modal-title');
    const form = document.getElementById('invoice-form');
    const clientSelect = document.getElementById('invoice-client');

    form.reset();

    // Fill client select list
    clientSelect.innerHTML = '<option value="" disabled selected hidden>Choisir un client...</option>';
    state.clients = await request('/clients');
    state.clients.forEach(c => {
        clientSelect.innerHTML += `<option value="${c.id}">${c.name} (${c.company})</option>`;
    });

    if (invoice) {
        title.textContent = 'Modifier la Facture';
        document.getElementById('invoice-id-field').value = invoice.id;
        document.getElementById('invoice-number').value = invoice.number;
        document.getElementById('invoice-client').value = invoice.clientId;
        document.getElementById('invoice-amount').value = invoice.amount;
        document.getElementById('invoice-date').value = invoice.date;
        document.getElementById('invoice-due-date').value = invoice.dueDate;
        document.getElementById('invoice-status').value = invoice.status;
    } else {
        title.textContent = 'Créer une Facture';
        document.getElementById('invoice-id-field').value = '';
        document.getElementById('invoice-number').value = `FAC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
        document.getElementById('invoice-date').value = new Date().toISOString().split('T')[0];
        // 30 days due date default
        const due = new Date();
        due.setDate(due.getDate() + 30);
        document.getElementById('invoice-due-date').value = due.toISOString().split('T')[0];
    }

    modal.classList.add('open');
}

function closeInvoiceModal() {
    document.getElementById('invoice-modal').classList.remove('open');
}

async function handleInvoiceSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('invoice-id-field').value;
    const number = document.getElementById('invoice-number').value;
    const clientId = document.getElementById('invoice-client').value;
    const amount = document.getElementById('invoice-amount').value;
    const date = document.getElementById('invoice-date').value;
    const dueDate = document.getElementById('invoice-due-date').value;
    const status = document.getElementById('invoice-status').value;

    const payload = { clientId, number, amount, status, date, dueDate };

    try {
        if (id) {
            await request(`/invoices/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            await request('/invoices', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }
        closeInvoiceModal();
        loadInvoicesData();
    } catch (err) {
        alert(err.message);
    }
}

window.editInvoice = async (id) => {
    const invoice = state.invoices.find(i => i.id === id);
    if (invoice) {
        state.clients = await request('/clients');
        openInvoiceModal(invoice);
    }
};

window.deleteInvoice = async (id) => {
    if (confirm('Voulez-vous vraiment supprimer cette facture ?')) {
        try {
            await request(`/invoices/${id}`, { method: 'DELETE' });
            loadInvoicesData();
        } catch (e) {
            alert(e.message);
        }
    }
};

// --------------------------------------------------------------------------
// DATA FETCH & RENDER - STATS PAGE
// --------------------------------------------------------------------------
async function loadStatsData() {
    try {
        const invoices = await request('/invoices');
        const clients = await request('/clients');

        drawStatusPieChart(invoices);
        drawClientSalesBarChart(invoices, clients);
    } catch (e) {
        console.error(e);
    }
}

function drawStatusPieChart(invoices) {
    const canvas = document.getElementById('invoice-status-chart');
    if (!canvas) return;

    if (statusChart) statusChart.destroy();

    const counts = { paye: 0, envoye: 0, brouillon: 0, retard: 0 };
    invoices.forEach(i => {
        if (counts[i.status] !== undefined) counts[i.status]++;
    });

    statusChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Payées', 'Envoyées', 'Brouillons', 'En Retard'],
            datasets: [{
                data: [counts.paye, counts.envoye, counts.brouillon, counts.retard],
                backgroundColor: ['#10b981', '#3b82f6', '#94a3b8', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } }
                }
            }
        }
    });
}

function drawClientSalesBarChart(invoices, clients) {
    const canvas = document.getElementById('client-sales-chart');
    if (!canvas) return;

    if (salesChart) salesChart.destroy();

    // Map sales by client id
    const clientSales = {};
    clients.forEach(c => { clientSales[c.id] = { name: c.company, total: 0 }; });

    invoices.forEach(i => {
        if (i.status === 'paye' && clientSales[i.clientId]) {
            clientSales[i.clientId].total += i.amount;
        }
    });

    const dataList = Object.values(clientSales).filter(c => c.total > 0);
    const labels = dataList.map(c => c.name);
    const dataPoints = dataList.map(c => c.total);

    salesChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels.length > 0 ? labels : ['Aucun client'],
            datasets: [{
                label: 'Volume payé (€)',
                data: dataPoints.length > 0 ? dataPoints : [0],
                backgroundColor: 'rgba(139, 92, 246, 0.75)',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}
