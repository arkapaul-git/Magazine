require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Proxy routes to the respective microservices
app.use('/api/landing', createProxyMiddleware({ 
    target: process.env.LANDING_SERVICE_URL || 'http://localhost:3001', 
    changeOrigin: true,
    pathRewrite: {
        '^/api/landing': '', // remove /api/landing from the forwarded path
    },
}));

app.use('/api/auth', createProxyMiddleware({ 
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3002', 
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': '',
    },
}));

app.use('/api/user', createProxyMiddleware({ 
    target: process.env.USER_SERVICE_URL || 'http://localhost:3003', 
    changeOrigin: true,
    pathRewrite: {
        '^/api/user': '',
    },
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'API Gateway is running', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`🚀 API Gateway is running on http://localhost:${PORT}`);
});
