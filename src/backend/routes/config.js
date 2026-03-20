const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/config
router.get('/', (req, res) => {
    db.get("SELECT * FROM settings WHERE id = 1", [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Error database" });
        }
        res.json(row || {});
    });
});

// POST /api/config
router.post('/', (req, res) => {
    const { logo_base64, theme_dark_mode, primary_color, secondary_color } = req.body;
    
    const query = `
        UPDATE settings 
        SET logo_base64 = ?, theme_dark_mode = ?, primary_color = ?, secondary_color = ?
        WHERE id = 1
    `;
    
    db.run(query, [logo_base64, theme_dark_mode ? 1 : 0, primary_color, secondary_color], function(err) {
        if (err) {
            return res.status(500).json({ error: "Error al actualizar la configuración" });
        }
        res.json({ success: true });
    });
});

module.exports = router;
