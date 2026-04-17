const express = require('express');
const app = express();

// API route
app.get('/api/message', (req, res) => {
    res.json({
        message: "Hello from backend I'am madhan🚀",
        time: new Date().toLocaleString()
    });
});

// Serve frontend (optional but useful)
app.use(express.static(__dirname));

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
