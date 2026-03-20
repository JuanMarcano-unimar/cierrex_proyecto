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
        preview.src = "";
        preview.classList.add('d-none');
        document.getElementById('logoUpload').value = "";
    });
});

function handleLogoUpload(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('logoPreview');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentLogoBase64 = e.target.result;
            preview.src = currentLogoBase64;
            preview.classList.remove('d-none');
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
                preview.src = currentLogoBase64;
                preview.classList.remove('d-none');
            }

            if (config.theme_dark_mode) {
                document.getElementById('themeDarkMode').checked = true;
            }

            if (config.primary_color) {
                document.getElementById('primaryColor').value = config.primary_color;
            }

            if (config.secondary_color) {
                document.getElementById('secondaryColor').value = config.secondary_color;
            }
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
            alertBox.className = 'alert alert-success mt-3';
            alertBox.textContent = 'Configuración guardada exitosamente. Actualizando página...';
            alertBox.style.display = 'block';

            // Actualizar la vista global instantáneamente y recargar tras un segundo para ver efecto en navbar
            setTimeout(() => {
                window.location.reload();
            }, 1000);
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
