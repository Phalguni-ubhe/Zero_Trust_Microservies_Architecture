const express = require('express');
const verifyInternalIdentity = require('../middleware/zeroTrust');
const app = express();
const PORT = 4001;

app.use(express.json());

// UPDATE: Pass 'cart-service' so the middleware checks the 'aud' claim
app.post('/internal/cart/checkout', verifyInternalIdentity('cart-service'), (req, res) => {
    
    const { sub, role } = req.user;
    const { item, price } = req.body;

    const databaseEntry = {
        transactionId: Math.floor(Math.random() * 100000),
        purchasedBy: sub,
        userRole: role,
        product: item,
        status: "SECURE_TRANSACTION",
        timestamp: new Date().toISOString()
    };

    console.log("--- SECURE DATABASE LOG ---");
    console.log(databaseEntry);

    res.json({ message: "Order Securely Processed", dbRecord: databaseEntry });
});

app.listen(PORT, () => console.log(`Secure Cart Service active on port ${PORT}`));