const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// 🚨 LOGGING INTERCEPTOR: This prints every single hit to Vercel Runtime Logs
app.use((req, res, next) => {
    console.log(`[NETWORK INCOMING] Method: ${req.method} | URL: ${req.url}`);
    next();
});

// 1. Serve the Mission Control UI
app.get('/', (req, res) => {
    console.log("[SERVER] Serving index.html UI");
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. The API Endpoint
app.all('/shadow-router', (req, res) => {
    console.log("[SERVER] /shadow-router endpoint successfully triggered!");
    
    try {
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

        res.json({
            status: "DISCREPANCY_DETECTED",
            message: "Modern system missed currency conversion edge case",
            legacy: legacyOutput,
            modern: modernOutput
        });
        console.log("[SERVER] JSON payload successfully dispatched to frontend.");
    } catch (error) {
        console.error("[SERVER ERROR]", error);
        res.status(500).json({ error: "Internal Server Crash", details: error.message });
    }
});

// 🚨 THE KILL SWITCH: If the frontend requests a wrong URL, return JSON instead of HTML
app.use((req, res) => {
    console.log(`[404 TRAP] Frontend requested a missing route: ${req.url}`);
    res.status(404).json({ 
        error: "ROUTE_NOT_FOUND", 
        message: `The server does not have a route for ${req.url}` 
    });
});

module.exports = app;
