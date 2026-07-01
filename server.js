const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Shadow Router endpoint
app.post('/shadow-router', async (req, res) => {
  try {
    const { payload } = req.body;

    // Placeholder for modern processing logic
    const modernOutput = {
      processed: true,
      timestamp: new Date().toISOString(),
      payload: payload
    };

    // Placeholder for legacy processing logic
    const legacyOutput = {
      processed: true,
      timestamp: new Date().toISOString(),
      payload: payload,
      legacy_system: true
    };

    // Determine match status
    const matchStatus = JSON.stringify(legacyOutput) === JSON.stringify(modernOutput)
      ? 'MATCH' : 'MISMATCH';

    // Log to database
    const logQuery = `
      INSERT INTO shadow_traffic_logs (payload, legacy_output, new_output, match_status)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;

    const { rows } = await pool.query(logQuery, [
      JSON.stringify(payload),
      JSON.stringify(legacyOutput),
      JSON.stringify(modernOutput),
      matchStatus
    ]);

    res.json({
      status: 'success',
      log_id: rows[0].id,
      match_status: matchStatus,
      modern_output: modernOutput
    });
  } catch (error) {
    console.error('Shadow Router Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during shadow routing'
    });
  }
});

// Epistemic Logger endpoint
app.post('/epistemic-logger', async (req, res) => {
  try {
    const { rule_context, expected_behavior } = req.body;

    if (!rule_context || !expected_behavior) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: rule_context and expected_behavior'
      });
    }

    // Save to database
    const query = `
      INSERT INTO legacy_rules (rule_context, expected_behavior)
      VALUES ($1, $2)
      RETURNING id, created_at;
    `;

    const { rows } = await pool.query(query, [rule_context, expected_behavior]);

    res.json({
      status: 'success',
      rule_id: rows[0].id,
      created_at: rows[0].created_at,
      message: 'Business rule logged successfully'
    });
  } catch (error) {
    console.error('Epistemic Logger Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during rule logging'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Archivist Protocol API operational'
  });
});

// Serve static files
const path = require('path');
app.use(express.static(path.join(__dirname, '.')))

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Archivist Protocol server running on port ${port}`);
  console.log(`Database connected: ${process.env.DATABASE_URL}`);
});