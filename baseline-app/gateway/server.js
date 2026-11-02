const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/api/v1/checkout', async (req, res) => {
    // Front-door authentication (Checking if user exists)
    const userId = req.headers['x-user-id']; 
    const scenario = req.headers['x-scenario']; // 'loss' or 'risk'

    if (!userId) return res.status(401).json({ error: "Login required" });

    let internalHeaders = {};

    if (scenario === 'loss') {
        // Scenario 1: No identity passed to backend
        internalHeaders = {}; 
    } else if (scenario === 'risk') {
        // Scenario 2: Passing raw, unencrypted data
        internalHeaders = { 'x-user-id': userId, 'x-user-role': 'customer' }; 
    }

    try {
        const response = await axios.post('http://localhost:3001/internal/cart/checkout', req.body, {
            headers: internalHeaders
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Checkout service failed" });
    }
});
app.get('/api/v1/products/:id', async (req, res) => {
    // 1. Initial Authentication (e.g., checking x-user-id header)
    const userId = req.headers['x-user-id'] || "Guest";

    try {
        // 2. IMPLICIT TRUST ERROR:
        // We forward the request but fail to pass any Identity context.
        const response = await axios.get(`http://localhost:3002/products/${req.params.id}`);
        
        res.status(200).json({
            gateway_log: `User ${userId} requested product.`,
            backend_response: response.data
        });
    } catch (e) {
        res.status(500).json({ error: "Product Service Unreachable" });
    }
});
app.listen(PORT, () => console.log(`Gateway active on port ${PORT}`));