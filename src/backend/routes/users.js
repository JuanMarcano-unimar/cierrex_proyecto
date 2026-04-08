const express = require('express');
const router = express.Router();
const db = require('../db/database');
const bcrypt = require('bcrypt');

// GET /api/users (Solo para role_level 3 - Corporativo)
router.get('/', (req, res) => {
    db.all("SELECT id, name, email, role_level FROM users", [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(rows);
    });
});

// POST /api/users
router.post('/', async (req, res) => {
    const { name, email, password, role_level } = req.body;
    
    if (!name || !email || !password || !role_level) {
         return res.status(400).json({ error: "Missing fields" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run("INSERT INTO users (name, email, password, role_level) VALUES (?, ?, ?, ?)", 
            [name, email, hashedPassword, role_level], 
            function(err) {
                if (err) {
                    if(err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: "Email already exists" });
                    }
                    return res.status(500).json({ error: "Database error" });
                }
                res.status(201).json({ id: this.lastID, name, email, role_level });
            });
    } catch(err) {
         res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, role_level, password } = req.body;

    if (!name || !email || !role_level) {
        return res.status(400).json({ error: "Missing fields" });
    }

    try {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            db.run("UPDATE users SET name = ?, email = ?, role_level = ?, password = ? WHERE id = ?",
                [name, email, role_level, hashedPassword, id],
                function(err) {
                    if (err) return res.status(500).json({ error: "Database error" });
                    res.json({ message: "User updated with new password" });
                }
            );
        } else {
            db.run("UPDATE users SET name = ?, email = ?, role_level = ? WHERE id = ?",
                [name, email, role_level, id],
                function(err) {
                    if (err) return res.status(500).json({ error: "Database error" });
                    res.json({ message: "User updated" });
                }
            );
        }
    } catch(err) {
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    // Proteger cuenta admin por defecto
    db.get("SELECT email FROM users WHERE id = ?", [id], (err, user) => {
        if(err) return res.status(500).json({ error: "Database error" });
        if(user && user.email === 'admin@cierrex.com') {
             return res.status(403).json({ error: "Cannot delete the default admin" });
        }

        db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json({ message: "User deleted" });
        });
    });
});

module.exports = router;
