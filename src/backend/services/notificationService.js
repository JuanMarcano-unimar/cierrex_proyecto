const nodemailer = require('nodemailer');
const https = require('https');

class NotificationService {
    constructor() {
        this.transporter = null;
    }

    _initTransporter(user, pass) {
        if (!user || !pass) return null;
        return nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass }
        });
    }

    async sendEmail(config, subject, bodyText, pdfBase64, filename) {
        if (!config.email_user || !config.email_pass || !config.emails_to) {
            console.log("Servicio de correo no configurado.");
            return { success: false, error: 'Correo no configurado' };
        }

        try {
            const transporter = this._initTransporter(config.email_user, config.email_pass);
            
            const attachments = [];
            if (pdfBase64) {
                // Eliminar prefijo data:image/...;base64,
                const base64Data = pdfBase64.split(';base64,').pop();
                attachments.push({
                    filename: filename || 'Reporte_Cierrex.pdf',
                    content: base64Data,
                    encoding: 'base64'
                });
            }

            const mailOptions = {
                from: `"CIERREX Sistema" <${config.email_user}>`,
                to: config.emails_to, // Puede ser una lista separada por comas
                subject: subject,
                text: bodyText,
                attachments: attachments
            };

            const info = await transporter.sendMail(mailOptions);
            console.log("Correo enviado: " + info.messageId);
            return { success: true };
        } catch (error) {
            console.error("Error al enviar correo:", error);
            return { success: false, error: error.message };
        }
    }

    async sendWhatsApp(config, text) {
        if (!config.whatsapp_phone || !config.whatsapp_apikey) {
            console.log("Servicio de WhatsApp no configurado.");
            return { success: false, error: 'WhatsApp no configurado' };
        }

        return new Promise((resolve) => {
            const encodedText = encodeURIComponent(text);
            const url = `https://api.callmebot.com/whatsapp.php?phone=${config.whatsapp_phone}&text=${encodedText}&apikey=${config.whatsapp_apikey}`;

            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        console.log("WhatsApp enviado correctamente.");
                        resolve({ success: true });
                    } else {
                        console.error("Error enviando WhatsApp (CallMeBot):", data);
                        resolve({ success: false, error: `Error ${res.statusCode}: ${data}` });
                    }
                });
            }).on('error', (err) => {
                console.error("Error de conexión WhatsApp:", err.message);
                resolve({ success: false, error: err.message });
            });
        });
    }
}

module.exports = new NotificationService();
