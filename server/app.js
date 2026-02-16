const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// API
app.use('/api', require('./api/routes'));

// Global Error 
app.use((err, req, res, next) => {
    console.error('Global error handler caught:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
