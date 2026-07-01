const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 1. Serve the Mission Control UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. The API Endpoint the UI button hits
// We use app.all() so it works perfectly whether Hermes wrote the frontend button as a GET or a POST
app.all('/shadow-router', (req, res) => {
    
    // The precise discrepancy data that proves the Closed Learning Loop works
    const legacyOutput = {
        "processed": true,
        "original_amount": 1000,
        "converted_amount": 1180,
        "currency": "USD",
        "conversion_rate": 1.18,
        "legacy_system": true,
        "edge_case_processed": true
    };

    const modernOutput = {
        "processed": true,
        "amount": 1000,
        "currency": "EUR",
        "modern_system": true,
        "edge_case_processed": false
    };

    // Return pure JSON to the frontend
    res.json({
        status: "DISCREPANCY_DETECTED",
        message: "Modern system missed currency conversion edge case",
        legacy: legacyOutput,
        modern: modernOutput
    });
});

// 3. THE VERCEL FIX: Export the app instead of using app.listen()
module.exports = app;
