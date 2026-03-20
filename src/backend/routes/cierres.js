const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/cierres
router.get('/', (req, res) => {
     // Join para obtener el nombre del usuario
    const query = `
        SELECT c.*, u.name as user_name 
        FROM cierres c
        JOIN users u ON c.user_id = u.id
        ORDER BY date DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(rows);
    });
});

// GET /api/cierres/user/:userId
router.get('/user/:userId', (req, res) => {
    const { userId } = req.params;
    db.all("SELECT * FROM cierres WHERE user_id = ? ORDER BY date DESC", [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(rows);
    });
});

// GET /api/cierres/:id
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM cierres WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!row) return res.status(404).json({ error: "Cierre not found" });
        res.json(row);
    });
});

// POST /api/cierres
router.post('/', (req, res) => {
    const { 
        user_id, efectivo, debito, credito, pagoMovil, transferencias, 
        divisas, zelle, tasa, totalUsd, totalVes, date, description, image 
    } = req.body;

    const query = `
        INSERT INTO cierres (
            user_id, efectivo, debito, credito, pagoMovil, transferencias, 
            divisas, zelle, tasa, totalUsd, totalVes, date, description, image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        user_id, efectivo || 0, debito || 0, credito || 0, pagoMovil || 0, transferencias || 0, 
        divisas || 0, zelle || 0, tasa || 0, totalUsd || 0, totalVes || 0, date, description, image
    ];

    db.run(query, params, function(err) {
        if (err) return res.status(500).json({ error: "Database error", details: err.message });
        res.status(201).json({ id: this.lastID });
    });
});

// PUT /api/cierres/:id
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { 
        efectivo, debito, credito, pagoMovil, transferencias, 
        divisas, zelle, tasa, totalUsd, totalVes, date, description, image 
    } = req.body;

    const query = `
        UPDATE cierres SET 
            efectivo = ?, debito = ?, credito = ?, pagoMovil = ?, transferencias = ?, 
            divisas = ?, zelle = ?, tasa = ?, totalUsd = ?, totalVes = ?, 
            date = ?, description = ?, image = ?
        WHERE id = ?
    `;

    const params = [
        efectivo || 0, debito || 0, credito || 0, pagoMovil || 0, transferencias || 0, 
        divisas || 0, zelle || 0, tasa || 0, totalUsd || 0, totalVes || 0, 
        date, description, image, id
    ];

    db.run(query, params, function(err) {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Cierre updated" });
    });
});

// DELETE /api/cierres/:id
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM cierres WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Cierre deleted" });
    });
});

module.exports = router;
