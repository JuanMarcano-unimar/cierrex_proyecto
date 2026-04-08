const express = require('express');
const router = express.Router();
const db = require('../db/database');
const notificationService = require('../services/notificationService');

// Obtener configuración de notificaciones
router.get('/', (req, res) => {
    db.get("SELECT * FROM notifications_config WHERE id = 1", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.json({});
        
        // No enviamos el password o apikey en texto plano por seguridad si quisiéramos ser estrictos, 
        // pero dado que es un panel local de Electron administrativo, lo enviamos para que lo vean en el input.
        res.json({
            whatsapp_phone: row.whatsapp_phone || '',
            whatsapp_apikey: row.whatsapp_apikey || '',
            email_user: row.email_user || '',
            email_pass: row.email_pass || '',
            emails_to: row.emails_to || ''
        });
    });
});

// Guardar configuración de notificaciones
router.post('/', (req, res) => {
    const { whatsapp_phone, whatsapp_apikey, email_user, email_pass, emails_to } = req.body;

    const query = `
        UPDATE notifications_config 
        SET whatsapp_phone = ?, whatsapp_apikey = ?, email_user = ?, email_pass = ?, emails_to = ?
        WHERE id = 1
    `;

    db.run(query, [whatsapp_phone, whatsapp_apikey, email_user, email_pass, emails_to], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Configuración guardada exitosamente' });
    });
});

// Activar envío de notificaciones (WhatsApp + Email)
router.post('/notify', (req, res) => {
    const { pdfBase64, cierreDetails } = req.body;

    // Obtener config
    db.get("SELECT * FROM notifications_config WHERE id = 1", async (err, config) => {
        if (err || !config) return res.status(500).json({ error: 'Configuración no encontrada' });

        const results = {};

        // 1. Enviar WhatsApp
        if (config.whatsapp_phone && config.whatsapp_apikey && cierreDetails) {
            const date = cierreDetails.date || new Date().toISOString().split('T')[0];
            const name = cierreDetails.user_name || 'Desconocido';
            const text = `✅ CIERREX ALERTA\n\nNUEVO CIERRE REGISTRADO:\n👤 Cajero: ${name}\n📅 Fecha: ${date}\n💵 Bs: ${cierreDetails.totalVes}\n🇺🇸 USD: ${cierreDetails.totalUsd}\n\n👉 El PDF detallado ha sido enviado por correo.`;
            
            results.whatsapp = await notificationService.sendWhatsApp(config, text);
        }

        // 2. Enviar Correo con PDF adjunto
        if (config.email_user && config.email_pass && config.emails_to && pdfBase64) {
            const dateStr = cierreDetails ? cierreDetails.date : new Date().toISOString().split('T')[0];
            const subject = `CIERREX - Reporte de Cierre (${dateStr})`;
            const body = `Adjunto encontrarás el PDF con los detalles del cierre de caja del día ${dateStr}.\n\nGenerado por CIERREX v2.0`;
            
            results.email = await notificationService.sendEmail(config, subject, body, pdfBase64, `Cierre_${dateStr}.pdf`);
        }

        res.json({ message: 'Proceso de notificación disparado', results });
    });
});

module.exports = router;
