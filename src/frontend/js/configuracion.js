// configuracion.js

let currentLogoBase64 = "";

document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    // Validar en el frontend y redirigir si intenta entrar sin permisos Nivel 3
    if (!user || user.role_level < 3) {
        alert('Acceso denegado. Solo cuentas Corporativas pueden modificar la configuración.');
        window.location.href = 'cierrex.html'; 
    } else {
        loadConfiguration();
    }

    document.getElementById('logoUpload').addEventListener('change', handleLogoUpload);
    document.getElementById('clearLogoBtn').addEventListener('click', () => {
        currentLogoBase64 = "";
        const preview = document.getElementById('logoPreview');
        const placeholder = document.getElementById('logoPlaceholder');
        const dropZone = document.getElementById('logoDropZone');
        preview.src = "";
        preview.style.display = 'none';
        if (placeholder) placeholder.style.display = '';
        if (dropZone) dropZone.classList.remove('has-logo');
        document.getElementById('logoUpload').value = "";
    });
    
    // Theme Selector Logic
    const themeLight = document.getElementById('themeLightOption');
    const themeDark = document.getElementById('themeDarkOption');
    const themeInput = document.getElementById('themeDarkMode');

    if (themeLight && themeDark && themeInput) {
        themeLight.addEventListener('click', () => {
            themeInput.checked = false;
            updateThemeUI(false);
        });
        themeDark.addEventListener('click', () => {
            themeInput.checked = true;
            updateThemeUI(true);
        });
    }
});

function updateThemeUI(isDark) {
    const themeLight = document.getElementById('themeLightOption');
    const themeDark = document.getElementById('themeDarkOption');
    if (isDark) {
        themeDark.classList.add('active');
        themeLight.classList.remove('active');
    } else {
        themeLight.classList.add('active');
        themeDark.classList.remove('active');
    }
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('logoPreview');
    const placeholder = document.getElementById('logoPlaceholder');
    const dropZone = document.getElementById('logoDropZone');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentLogoBase64 = e.target.result;
            preview.src = currentLogoBase64;
            preview.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
            if (dropZone) dropZone.classList.add('has-logo');
        };
        reader.readAsDataURL(file);
    }
}

async function loadConfiguration() {
    try {
        const response = await fetch(`${BASE_URL}/config`);
        if (response.ok) {
            const config = await response.json();
            
            if (config.logo_base64) {
                currentLogoBase64 = config.logo_base64;
                const preview = document.getElementById('logoPreview');
                const placeholder = document.getElementById('logoPlaceholder');
                const dropZone = document.getElementById('logoDropZone');
                preview.src = currentLogoBase64;
                preview.style.display = 'block';
                if (placeholder) placeholder.style.display = 'none';
                if (dropZone) dropZone.classList.add('has-logo');
            }

            if (config.theme_dark_mode !== undefined) {
                const isDark = config.theme_dark_mode !== 0 && config.theme_dark_mode !== false;
                document.getElementById('themeDarkMode').checked = isDark;
                updateThemeUI(isDark);
            }

            if (config.primary_color) {
                document.getElementById('primaryColor').value = config.primary_color;
            }

            if (config.secondary_color) {
                document.getElementById('secondaryColor').value = config.secondary_color;
            }
        }

        // Cargar también notificaciones
        const notifResponse = await fetch(`${BASE_URL}/notifications`);
        if (notifResponse.ok) {
            const notif = await notifResponse.json();
            if (notif.whatsapp_phone) document.getElementById('whatsappPhone').value = notif.whatsapp_phone;
            if (notif.whatsapp_apikey) document.getElementById('whatsappApikey').value = notif.whatsapp_apikey;
            if (notif.email_user) document.getElementById('emailUser').value = notif.email_user;
            if (notif.email_pass) document.getElementById('emailPass').value = notif.email_pass;
            if (notif.emails_to) document.getElementById('emailsTo').value = notif.emails_to;
        }

    } catch (err) {
        console.error("Error al cargar configuración:", err);
    }
}

async function saveConfiguration() {
    const alertBox = document.getElementById('configAlert');
    alertBox.style.display = 'none';

    const theme_dark_mode = document.getElementById('themeDarkMode').checked;
    const primary_color = document.getElementById('primaryColor').value;
    const secondary_color = document.getElementById('secondaryColor').value;

    const payload = {
        logo_base64: currentLogoBase64,
        theme_dark_mode,
        primary_color,
        secondary_color
    };

    try {
        const response = await fetch(`${BASE_URL}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // Guardar configuración de notificaciones
            const notifPayload = {
                whatsapp_phone: document.getElementById('whatsappPhone').value.trim(),
                whatsapp_apikey: document.getElementById('whatsappApikey').value.trim(),
                email_user: document.getElementById('emailUser').value.trim(),
                email_pass: document.getElementById('emailPass').value.trim(),
                emails_to: document.getElementById('emailsTo').value.trim()
            };
            
            await fetch(`${BASE_URL}/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notifPayload)
            });

            // Guardar config en localStorage para sidebar.js
            try {
                const existingCfg = JSON.parse(localStorage.getItem('globalConfig') || '{}');
                existingCfg.logo_base64 = currentLogoBase64;
                existingCfg.theme_dark_mode = theme_dark_mode;
                existingCfg.primary_color = primary_color;
                existingCfg.secondary_color = secondary_color;
                localStorage.setItem('globalConfig', JSON.stringify(existingCfg));
            } catch(_) {}
            
            alertBox.className = 'alert alert-success mt-3';
            alertBox.textContent = 'Configuración guardada exitosamente. Actualizando...';
            alertBox.style.display = 'block';
            setTimeout(() => { window.location.reload(); }, 1200);
        } else {
            alertBox.className = 'alert alert-danger mt-3';
            alertBox.textContent = 'Error al guardar la configuración.';
            alertBox.style.display = 'block';
        }
    } catch (err) {
        alertBox.className = 'alert alert-danger mt-3';
        alertBox.textContent = 'Error de red.';
        alertBox.style.display = 'block';
    }
}
