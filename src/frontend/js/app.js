// app.js

// Leer el puerto del backend:
// 1. Desde electronAPI (preload.js, cuando se ejecuta dentro de Electron)
// 2. Desde localStorage (fallback)
// 3. Por defecto 3000
let BACKEND_PORT = (window.electronAPI && window.electronAPI.getPort())
    || localStorage.getItem('PORT')
    || '3000';
let BASE_URL = `http://localhost:${BACKEND_PORT}/api`;


// Aplicar tema inmediatamente desde localStorage para evitar parpadeos
function applySavedTheme() {
    try {
        const config = JSON.parse(localStorage.getItem('globalConfig'));
        if (config) {
            // El backend guarda 1/0 para booleanos. isDarkMode es true por defecto (1 o undefined)
            const isDarkMode = config.theme_dark_mode !== 0 && config.theme_dark_mode !== false;
            document.body.classList.toggle('dark-theme', isDarkMode);
            document.body.classList.toggle('light-theme', !isDarkMode);
            
            // Aplicar colores personalizados si existen
            if (config.primary_color) {
                document.documentElement.style.setProperty('--primary-color', config.primary_color);
            }
            if (config.secondary_color) {
                document.documentElement.style.setProperty('--secondary-color', config.secondary_color);
            }
        }
    } catch (_) {}
}
applySavedTheme();

// Funciones globales
async function loadGlobalConfig() {
    try {
        const response = await fetch(`${BASE_URL}/config`);
        if (response.ok) {
            const config = await response.json();
            
            // Persistir para persistencia inmediata en la próxima carga
            localStorage.setItem('globalConfig', JSON.stringify(config));

            // Re-aplicar tema desde la respuesta fresca
            const isDarkMode = config.theme_dark_mode !== 0 && config.theme_dark_mode !== false;
            document.body.classList.toggle('dark-theme', isDarkMode);
            document.body.classList.toggle('light-theme', !isDarkMode);

            // Aplicar variables de color
            if (config.primary_color) {
                document.documentElement.style.setProperty('--primary-color', config.primary_color);
            }
            if (config.secondary_color) {
                document.documentElement.style.setProperty('--secondary-color', config.secondary_color);
            }

            // Aplicar logo en la navbar si existe
            const logoImg = document.getElementById('navbarLogoImg');
            const logoText = document.getElementById('navbarLogoText');
            if (logoImg && logoText && config.logo_base64) {
                logoImg.src = config.logo_base64;
                logoImg.classList.remove('d-none');
                logoText.classList.add('d-none');
            }

            // Aplicar logo en el login si existe
            const loginLogo = document.getElementById('loginBrandLogo');
            if (loginLogo && config.logo_base64) {
                loginLogo.src = config.logo_base64;
                loginLogo.classList.remove('d-none');
                const loginText = document.getElementById('loginBrandText');
                if (loginText) loginText.classList.add('d-none');
            }

            // Guardar en sesión para usar en PDF sin volver a llamar
            localStorage.setItem('globalConfig', JSON.stringify(config));
        }
    } catch (err) {
        console.error("Error cargando configuración global:", err);
    }
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function handleNavigationVisibility() {
    const user = getCurrentUser();
    if (!user) return; // Si no hay usuario, están en login

    // level 1: Cajero
    // level 2: Administrativo
    // level 3: Corporativo

    const adminRoleItems = document.querySelectorAll('.nav-admin'); // Gestion de usuarios / Config
    const middleRoleItems = document.querySelectorAll('.nav-middle'); // Historial / Dashboard
    
    // Si es Cajero (1), ocultar todo lo que sea para niveles superiores a 1
    if (user.role_level === 1) {
        middleRoleItems.forEach(el => el.style.display = 'none');
        adminRoleItems.forEach(el => el.style.display = 'none');
    }
    
    // Si es Administrativo (2), ocultar lo que es solo para Corporativo (3)
    if (user.role_level === 2) {
        adminRoleItems.forEach(el => el.style.display = 'none');
    }
    
    // Si es 3 se muestra todo, así que no se oculta nada.
}

// Cargar configuración global y configurar navegación protegida por defecto
document.addEventListener('DOMContentLoaded', () => {
    loadGlobalConfig();
    
    // Redirigir si no hay usuario logueado en páginas protegidas
    if (!window.location.pathname.includes('login') && !getCurrentUser()) {
         window.location.href = 'login.html';
    } else {
        handleNavigationVisibility();
    }
});
