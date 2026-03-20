const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// Conectar a SQLite
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar a SQLite:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        initializeDB();
    }
});

function initializeDB() {
    db.serialize(() => {
        // Crear tabla Usuarios
        // roles: 1 = Cajero (solo crea cierres), 2 = Administrativo (Cierres e Historial), 3 = Corporativo (Todo, gestiona usuarios y config)
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role_level INTEGER NOT NULL
        )`);

        // Crear tabla Cierres
        db.run(`CREATE TABLE IF NOT EXISTS cierres (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            efectivo REAL DEFAULT 0,
            debito REAL DEFAULT 0,
            credito REAL DEFAULT 0,
            pagoMovil REAL DEFAULT 0,
            transferencias REAL DEFAULT 0,
            divisas REAL DEFAULT 0,
            zelle REAL DEFAULT 0,
            tasa REAL DEFAULT 0,
            totalUsd REAL DEFAULT 0,
            totalVes REAL DEFAULT 0,
            date TEXT NOT NULL,
            description TEXT,
            image TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Crear tabla Settings
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            logo_base64 TEXT,
            theme_dark_mode INTEGER DEFAULT 0,
            primary_color TEXT DEFAULT '#1E3A8A',
            secondary_color TEXT DEFAULT '#FB923C'
        )`, () => {
            // Asegurar que exista la fila de configuración inicial
            db.run(`INSERT OR IGNORE INTO settings (id) VALUES (1)`);
        });

        // Insertar administrador por defecto (Nivel 3 Corporativo) si no existe
        db.get("SELECT id FROM users WHERE email = ?", ['admin@cierrex.com'], async (err, row) => {
            if (!row) {
                const hashedPassword = await bcrypt.hash('admin', 10);
                db.run("INSERT INTO users (name, email, password, role_level) VALUES (?, ?, ?, ?)", 
                    ['Admin', 'admin@cierrex.com', hashedPassword, 3], 
                    (err) => {
                        if (err) console.error("Error al insertar admin por defecto:", err.message);
                        else console.log("Usuario administrador creado por defecto.");
                    }
                );
            }
        });
    });
}

module.exports = db;
