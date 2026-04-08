const express = require('express');
const router = express.Router();
const https = require('https');

// GET /api/bcv
router.get('/', (req, res) => {
    // Usamos una API gratuita confiable de dolar en Venezuela
    https.get('https://ve.dolarapi.com/v1/dolares/oficial', (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                if (parsed && parsed.promedio) {
                    return res.json({ tasa: parsed.promedio });
                }
                res.status(500).json({ error: "Formato de respuesta desconocido." });
            } catch (e) {
                res.status(500).json({ error: "Error al parsear el BCV." });
            }
        });
    }).on('error', (e) => {
        console.error("Error fetching BCV:", e);
        res.status(500).json({ error: "Error de red al consultar el BCV." });
    });
});

module.exports = router;
