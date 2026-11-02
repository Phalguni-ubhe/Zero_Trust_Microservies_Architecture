const express = require('express');
const app = express();
const PORT = 3002; // Distinct port

app.use(express.json());

app.get('/products/:id', (req, res) => {
    // RESEARCH GAP DEMO: 
    // We try to read the User ID, but the Gateway likely dropped it.
    const userId = req.headers['x-user-id'] || "Unknown User";
    const productId = req.params.id;

    console.log(`[Product Service] Fetching Product ${productId} for: ${userId}`);

    // Simulating a database lookup
    const mockProduct = {
        id: productId,
        name: "Zero Trust Handbook",
        price: 45.00,
        viewedBy: userId // This will likely be "Unknown User"
    };

    res.json({
        status: "Success (Implicit Trust)",
        data: mockProduct
    });
});

app.listen(PORT, () => console.log(`Baseline Product Service running on port ${PORT}`));