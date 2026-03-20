const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Para permitir imágenes base64 grandes
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rutas API
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const cierresRoutes = require('./routes/cierres');
const configRoutes = require('./routes/config');
const bcvRoutes = require('./routes/bcv');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cierres', cierresRoutes);
app.use('/api/config', configRoutes);
app.use('/api/bcv', bcvRoutes);

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Puerto (Para uso standalone si se necesitara, aunque se usará dentro de Electron)
const PORT = process.env.PORT || 3000;

function startServer() {
    return new Promise((resolve, reject) => {
        const server = app.listen(PORT, () => {
             console.log(`Backend server running on http://localhost:${PORT}`);
             resolve(server);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${PORT} is busy.`);
                // Intentar puertos alternativos si el 3000 está ocupado
                const altServer = app.listen(0, () => {
                     const altPort = altServer.address().port;
                     console.log(`Backend server running on alternative port http://localhost:${altPort}`);
                     process.env.APP_PORT = altPort; // Guardar el puerto usado para que el frontend lo sepa
                     resolve(altServer);
                });
            } else {
                reject(err);
            }
        });
    });
}

module.exports = { app, startServer };

// Si se ejecuta directamente (no desde Electron)
if (require.main === module) {
    startServer();
}
