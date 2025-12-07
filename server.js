const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'journal_entries.json');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}));
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

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
