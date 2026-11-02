const jwt = require('jsonwebtoken');
const fs = require('fs');

// Load Public Key to verify the signature
const PUBLIC_KEY = fs.readFileSync('../middleware/public.key'); 

// We update the function to accept the 'targetService' name
const verifyInternalIdentity = (targetService) => (req, res, next) => {
    console.log(`[Zero Trust Guard] Incoming request for ${targetService}...`);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(`[Zero Trust Guard] Verifying token for ${targetService}...`);
    if (!token) return res.status(401).json({ error: "No Token" });

    // ZERO TRUST VERIFICATION (CPU Intensive)
    jwt.verify(token, PUBLIC_KEY, { 
        algorithms: ['RS256'], 
        audience: targetService,  // Ensure token is meant for US
        issuer: 'api-gateway'
    }, (err, payload) => {
        if (err) {
            console.log(`[Zero Trust Block] Token invalid for ${targetService}: ${err.message}`);
            return res.status(403).json({ error: "Access Denied: Invalid Token" });
        }
        console.log(`[Zero Trust Pass] Valid token for ${targetService}. User: ${payload.sub}`);
        req.user = payload; 
        next();
    });
};

module.exports = verifyInternalIdentity;