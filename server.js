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

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.get('/api/entries', (req, res) => {
    try {
        const entries = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(entries);
    } catch (error) {
        console.error('Error reading entries:', error);
        res.status(500).json({ error: 'Failed to load entries' });
    }
});

// Get entry by date
app.get('/api/entries/:date', (req, res) => {
    try {
        const entries = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const entry = entries[req.params.date] || null;
        res.json(entry);
    } catch (error) {
        console.error('Error reading entry:', error);
        res.status(500).json({ error: 'Failed to load entry' });
    }
});

// Save entry
app.post('/api/entries', (req, res) => {
    try {
        const entries = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const { date, data } = req.body;
        
        entries[date] = data;
        fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), 'utf8');
        
        res.json({ success: true, message: 'Entry saved successfully' });
    } catch (error) {
        console.error('Error saving entry:', error);
        res.status(500).json({ error: 'Failed to save entry' });
    }
});

// Get all dates with entries
app.get('/api/dates', (req, res) => {
    try {
        const entries = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const dates = Object.keys(entries).sort((a, b) => new Date(b) - new Date(a));
        res.json(dates);
    } catch (error) {
        console.error('Error reading entry dates:', error);
        res.status(500).json({ error: 'Failed to load entry dates' });
    }
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle SPA routing - serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// All your routes are now at the top of the file, no need for duplicates here

// Get all dates with entries
app.get('/api/dates', (req, res) => {
    const entries = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(Object.keys(entries).sort().reverse());
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
