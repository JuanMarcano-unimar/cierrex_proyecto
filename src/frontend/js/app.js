// api.js

// Al arrancar la aplicación, guardamos el puerto del backend pasádo desde main.js por electron
// Al arrancar la aplicación, guardamos el puerto del backend pasádo desde main.js por electron
let BACKEND_PORT = localStorage.getItem('PORT') || 3000;
let BASE_URL = `http://localhost:${BACKEND_PORT}/api`;

// Funciones globales
async function loadGlobalConfig() {
    try {
        const response = await fetch(`${BASE_URL}/config`);
        if (response.ok) {
            const config = await response.json();
            
            // Aplicar tema oscuro
            if (config.theme_dark_mode) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }

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
