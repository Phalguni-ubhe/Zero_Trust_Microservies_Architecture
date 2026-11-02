// secure-app/secrets.js
const crypto = require('crypto');

// In production, these would be in a Vault. 
// For this research, we load them from the environment.
module.exports = {
    INTERNAL_TOKEN_SECRET: process.env.INTERNAL_SECRET || 'research-paper-key-2026',
};