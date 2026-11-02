const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// RESEARCH NOTE: We load the heavy RSA Private Key to force CPU overhead
const PRIVATE_KEY = fs.readFileSync('private.key');

const app = express();
const PORT = 4000;

app.use(express.json());

// --- ROUTE 1: CHECKOUT ---
app.post('/api/v1/checkout', async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // ZERO TRUST: Sign with RSA Private Key (Slows down Event Loop)
    const internalToken = jwt.sign(
        { 
            sub: userId, 
            role: 'customer', 
            aud: 'cart-service', // Target Audience
            iss: 'api-gateway' 
        }, 
        PRIVATE_KEY,
        { algorithm: 'RS256', expiresIn: '10s' }
    );

    try {
        const response = await axios.post('http://localhost:4001/internal/cart/checkout', req.body, {
            headers: { 'Authorization': `Bearer ${internalToken}` }
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(403).json({ error: "Security Verification Failed in Backend" });
    }
});

// --- ROUTE 2: PRODUCTS ---
app.get('/api/v1/products/:id', async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // ZERO TRUST: Also use RS256 here for consistency
    const internalToken = jwt.sign(
        { 
            sub: userId, 
            role: 'customer', 
            aud: 'product-service', // Target Audience
            iss: 'api-gateway' 
        }, 
        PRIVATE_KEY,
        { algorithm: 'RS256', expiresIn: '10s' }
    );

    try {
        console.log(req.params.id)
        const response = await axios.get(`http://localhost:4002/products/${req.params.id}`, {
            headers: { 'Authorization': `Bearer ${internalToken}` }
        });
        res.status(200).json(response.data);
    } catch (e) {
        res.status(403).json({ error: "Zero Trust Verification Failed" });
    }
});

app.listen(PORT, () => console.log(`Secure Gateway (RS256 Zero Trust) active on port ${PORT}`));