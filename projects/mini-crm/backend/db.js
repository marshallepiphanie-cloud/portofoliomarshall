const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
    const initialData = {
        users: [
            { id: 1, email: 'digitalvecteur@gmail.com', password: 'admin', name: 'Lucas Vessier' }
        ],
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
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
}

// Helper database reader and writer simulating SQL queries
function readData() {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeData(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// DB simulated query methods with SQL logger console output
const db = {
    // Users
    findUserByEmail: (email) => {
        console.log(`[SQL Query] SELECT * FROM users WHERE email = '${email}';`);
        const data = readData();
        return data.users.find(u => u.email === email);
    },
    createUser: (email, password, name) => {
        console.log(`[SQL Query] INSERT INTO users (email, password, name) VALUES ('${email}', '***', '${name}');`);
        const data = readData();
        const newUser = { id: data.users.length + 1, email, password, name };
        data.users.push(newUser);
        writeData(data);
        return newUser;
    },

    // Clients
    getClients: (userId) => {
        console.log(`[SQL Query] SELECT * FROM clients WHERE userId = ${userId};`);
        const data = readData();
        return data.clients.filter(c => c.userId === userId);
    },
    createClient: (userId, { name, email, phone, company, status }) => {
        console.log(`[SQL Query] INSERT INTO clients (userId, name, email, phone, company, status) VALUES (${userId}, '${name}', '${email}', '${phone}', '${company}', '${status}');`);
        const data = readData();
        const newClient = { id: Date.now(), userId, name, email, phone, company, status: status || 'actif' };
        data.clients.push(newClient);
        writeData(data);
        return newClient;
    },
    updateClient: (userId, id, updates) => {
        console.log(`[SQL Query] UPDATE clients SET name = '${updates.name}', email = '${updates.email}', ... WHERE id = ${id} AND userId = ${userId};`);
        const data = readData();
        const clientIndex = data.clients.findIndex(c => c.id === id && c.userId === userId);
        if (clientIndex === -1) return null;
        data.clients[clientIndex] = { ...data.clients[clientIndex], ...updates };
        writeData(data);
        return data.clients[clientIndex];
    },
    deleteClient: (userId, id) => {
        console.log(`[SQL Query] DELETE FROM clients WHERE id = ${id} AND userId = ${userId};`);
        const data = readData();
        data.clients = data.clients.filter(c => !(c.id === id && c.userId === userId));
        // Cascade delete invoices
        data.invoices = data.invoices.filter(i => !(i.clientId === id && i.userId === userId));
        writeData(data);
        return true;
    },

    // Invoices
    getInvoices: (userId) => {
        console.log(`[SQL Query] SELECT * FROM invoices WHERE userId = ${userId};`);
        const data = readData();
        return data.invoices.filter(i => i.userId === userId);
    },
    createInvoice: (userId, { clientId, number, amount, status, date, dueDate }) => {
        console.log(`[SQL Query] INSERT INTO invoices (userId, clientId, number, amount, status, date, dueDate) VALUES (${userId}, ${clientId}, '${number}', ${amount}, '${status}', '${date}', '${dueDate}');`);
        const data = readData();
        const newInvoice = {
            id: Date.now(),
            userId,
            clientId: parseInt(clientId),
            number,
            amount: parseFloat(amount),
            status: status || 'brouillon',
            date,
            dueDate
        };
        data.invoices.push(newInvoice);
        writeData(data);
        return newInvoice;
    },
    updateInvoice: (userId, id, updates) => {
        console.log(`[SQL Query] UPDATE invoices SET status = '${updates.status}', ... WHERE id = ${id} AND userId = ${userId};`);
        const data = readData();
        const invIndex = data.invoices.findIndex(i => i.id === id && i.userId === userId);
        if (invIndex === -1) return null;
        data.invoices[invIndex] = { 
            ...data.invoices[invIndex], 
            ...updates,
            clientId: updates.clientId ? parseInt(updates.clientId) : data.invoices[invIndex].clientId,
            amount: updates.amount ? parseFloat(updates.amount) : data.invoices[invIndex].amount
        };
        writeData(data);
        return data.invoices[invIndex];
    },
    deleteInvoice: (userId, id) => {
        console.log(`[SQL Query] DELETE FROM invoices WHERE id = ${id} AND userId = ${userId};`);
        const data = readData();
        data.invoices = data.invoices.filter(i => !(i.id === id && i.userId === userId));
        writeData(data);
        return true;
    }
};

module.exports = db;
