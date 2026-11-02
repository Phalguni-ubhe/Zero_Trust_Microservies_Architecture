const express = require('express');
// Reusing the same Zero Trust Guard
const verifyInternalIdentity = require('../middleware/zeroTrust'); 
const app = express();
const PORT = 4002; // Distinct port

app.use(express.json());

// Apply the Guard: No Token = No Data
app.get('/products/:id', verifyInternalIdentity('product-service'), (req, res) => {
    // IDENTITY RECOVERY:
    // The middleware has already verified the JWT and attached the user to req.user
    const { sub, role } = req.user; 
    const productId = req.params.id;

    console.log(`[Product Service] Secure Access Granted. User: ${sub} (${role})`);

    const mockProduct = {
        id: productId,
        name: "Zero Trust Handbook",
        price: 45.00,
        accessLog: `Accessed by ${sub} with role ${role}` // Identity Preserved!
    };

    res.json({
        status: "Secure (Zero Trust)",
        data: mockProduct
    });
});

app.listen(PORT, () => console.log(`Secure Product Service running on port ${PORT}`));