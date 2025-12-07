const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// For Vercel, we'll use /tmp directory for file storage
const DATA_FILE = process.env.VERCEL 
    ? '/tmp/journal_entries.json' 
    : path.join(__dirname, 'data', 'journal_entries.json');

// Create data directory if it doesn't exist (for local development)
if (!process.env.VERCEL) {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}), 'utf8');
}

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main page for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all entries
app.get('/api/entries', (req, res) => {
    const entries = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(entries);
});

// Get entry by date
app.get('/api/entries/:date', (req, res) => {
    const entries = JSON.parse(fs.readFileSync(DATA_FILE));
    const entry = entries[req.params.date] || null;
    res.json(entry);
});

// Save entry
app.post('/api/entries', (req, res) => {
    const entries = JSON.parse(fs.readFileSync(DATA_FILE));
    const { date, data } = req.body;
    
    entries[date] = data;
    fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2));
    
    res.json({ success: true, message: 'Entry saved successfully' });
});

// Get all dates with entries
app.get('/api/dates', (req, res) => {
    const entries = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(Object.keys(entries).sort().reverse());
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
