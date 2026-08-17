const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Logger middleware to show SQL queries in server console
app.use((req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.path}`);
    next();
});

// Middleware for authentication simulation
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Accès non autorisé. Token manquant.' });
    }
    const token = authHeader.split(' ')[1];
    // For demo, token is email
    const user = db.findUserByEmail(token);
    if (!user) {
        return res.status(401).json({ error: 'Session expirée ou invalide.' });
    }
    req.user = user;
    next();
}

// --------------------------------------------------------------------------
// AUTH API
// --------------------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.findUserByEmail(email);
    if (!user || user.password !== password) {
        return res.status(400).json({ error: 'Identifiants incorrects.' });
    }
    // Return mock token (which is the email itself) and user info
    res.json({
        token: user.email,
        user: { id: user.id, email: user.email, name: user.name }
    });
});

app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;
    const existing = db.findUserByEmail(email);
    if (existing) {
        return res.status(400).json({ error: 'Cet e-mail est déjà utilisé.' });
    }
    const newUser = db.createUser(email, password, name);
    res.json({
        token: newUser.email,
        user: { id: newUser.id, email: newUser.email, name: newUser.name }
    });
});

// --------------------------------------------------------------------------
// CLIENTS API
// --------------------------------------------------------------------------
app.get('/api/clients', authenticate, (req, res) => {
    const clients = db.getClients(req.user.id);
    res.json(clients);
});

app.post('/api/clients', authenticate, (req, res) => {
    const { name, email, phone, company, status } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Le nom et l\'e-mail sont requis.' });
    }
    const client = db.createClient(req.user.id, { name, email, phone, company, status });
    res.json(client);
});

app.put('/api/clients/:id', authenticate, (req, res) => {
    const clientId = parseInt(req.params.id);
    const client = db.updateClient(req.user.id, clientId, req.body);
    if (!client) {
        return res.status(404).json({ error: 'Client non trouvé.' });
    }
    res.json(client);
});

app.delete('/api/clients/:id', authenticate, (req, res) => {
    const clientId = parseInt(req.params.id);
    db.deleteClient(req.user.id, clientId);
    res.json({ success: true, message: 'Client supprimé.' });
});

// --------------------------------------------------------------------------
// INVOICES API
// --------------------------------------------------------------------------
app.get('/api/invoices', authenticate, (req, res) => {
    const invoices = db.getInvoices(req.user.id);
    res.json(invoices);
});

app.post('/api/invoices', authenticate, (req, res) => {
    const { clientId, number, amount, status, date, dueDate } = req.body;
    if (!clientId || !number || !amount || !date) {
        return res.status(400).json({ error: 'Champs requis manquants.' });
    }
    const invoice = db.createInvoice(req.user.id, { clientId, number, amount, status, date, dueDate });
    res.json(invoice);
});

app.put('/api/invoices/:id', authenticate, (req, res) => {
    const invoiceId = parseInt(req.params.id);
    const invoice = db.updateInvoice(req.user.id, invoiceId, req.body);
    if (!invoice) {
        return res.status(404).json({ error: 'Facture non trouvée.' });
    }
    res.json(invoice);
});

app.delete('/api/invoices/:id', authenticate, (req, res) => {
    const invoiceId = parseInt(req.params.id);
    db.deleteInvoice(req.user.id, invoiceId);
    res.json({ success: true, message: 'Facture supprimée.' });
});

// --------------------------------------------------------------------------
// STATS API
// --------------------------------------------------------------------------
app.get('/api/stats', authenticate, (req, res) => {
    const userId = req.user.id;
    const clients = db.getClients(userId);
    const invoices = db.getInvoices(userId);

    // Calculate metrics
    const totalClients = clients.length;
    const totalInvoices = invoices.length;
    
    let totalRevenue = 0;
    let pendingInvoicesCount = 0;
    
    invoices.forEach(i => {
        if (i.status === 'paye') {
            totalRevenue += i.amount;
        } else if (i.status === 'envoye') {
            pendingInvoicesCount += 1;
        }
    });

    // Group sales by month or recent activity
    // For demo, list of payments
    const recentActivity = invoices.slice(-5).map(i => {
        const client = clients.find(c => c.id === i.clientId);
        return {
            id: i.id,
            type: 'facture',
            title: `Facture ${i.number} - ${client ? client.company : 'Client Inconnu'}`,
            amount: i.amount,
            status: i.status,
            date: i.date
        };
    });

    res.json({
        totalClients,
        totalInvoices,
        totalRevenue,
        pendingInvoicesCount,
        recentActivity
    });
});

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`  Mini CRM Backend Running on Port ${PORT} `);
    console.log(`  SQL Database initialized: database.json  `);
    console.log(`=========================================`);
});
