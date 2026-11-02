const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

app.post('/internal/cart/checkout', (req, res) => {
    const userId = req.headers['x-user-id'] || "GUEST_ACCOUNT";
    const role = req.headers['x-user-role'] || "anonymous";
    const { item, price } = req.body;

    // REAL-LIFE LOGIC: Simulating a Database Entry
    const databaseEntry = {
        transactionId: Math.floor(Math.random() * 100000),
        purchasedBy: userId,
        userRole: role,
        product: item,
        amount: price,
        timestamp: new Date().toISOString()
    };

    console.log("--- DATABASE LOG ---");
    console.log(databaseEntry);
    console.log("--------------------");

    res.json({
        message: "Order Processed",
        dbRecord: databaseEntry
    });
});

app.listen(PORT, () => console.log(`Cart Service active on port ${PORT}`));