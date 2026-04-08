/**
 * sidebar.js — Sidebar colapsable compartido para CIERREX
 * Se auto-inyecta en el DOM y gestiona roles + logo dinámico.
 */
(function () {
    // Detectar página activa
    const currentPage = window.location.pathname.split('/').pop() || 'cierrex.html';

    function isActive(page) {
        return currentPage === page ? 'active' : '';
    }

    // Obtener usuario actual
    const user = (function () {
        try { return JSON.parse(localStorage.getItem('currentUser')); }
        catch { return null; }
    })();

    const roleLevel = user ? user.role_level : 0;

    // Construir sidebar HTML
    const sidebarHTML = `
    <aside class="sidebar" id="appSidebar">
        <div class="sidebar-brand">
            <div class="brand-icon" id="sidebarBrandIcon">CX</div>
            <img id="sidebarLogoImg" class="sidebar-brand-img" src="" alt="Logo">
            <span class="brand-text">CIERREX</span>
        </div>
        <nav class="sidebar-nav">
            <a href="cierrex.html" class="${isActive('cierrex.html')}" title="Cierres">
                <span class="nav-icon">💰</span>
                <span class="nav-label">Cierres</span>
            </a>
            ${roleLevel >= 2 ? `
            <a href="historial.html" class="${isActive('historial.html')}" title="Historial">
                <span class="nav-icon">📋</span>
                <span class="nav-label">Historial</span>
            </a>
            <a href="dashboard.html" class="${isActive('dashboard.html')}" title="Dashboard">
                <span class="nav-icon">📊</span>
                <span class="nav-label">Dashboard</span>
            </a>
            ` : ''}
            ${roleLevel >= 3 ? `
            <a href="usuarios.html" class="${isActive('usuarios.html')}" title="Usuarios">
                <span class="nav-icon">👥</span>
                <span class="nav-label">Usuarios</span>
            </a>
            <a href="configuracion.html" class="${isActive('configuracion.html')}" title="Configuración">
                <span class="nav-icon">⚙️</span>
                <span class="nav-label">Configuración</span>
            </a>
            ` : ''}
        </nav>
        <div class="sidebar-footer">
            <a href="#" onclick="logout(); return false;" title="Cerrar Sesión">
                <span class="nav-icon">🚪</span>
                <span class="nav-label">Cerrar Sesión</span>
            </a>
        </div>
    </aside>`;

    // Inyectar sidebar al inicio del body
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

    // Cargar logo si hay configuración guardada
    const globalConfig = (function () {
        try { return JSON.parse(localStorage.getItem('globalConfig')); }
        catch { return null; }
    })();

    if (globalConfig && globalConfig.logo_base64) {
        const logoImg = document.getElementById('sidebarLogoImg');
        const brandIcon = document.getElementById('sidebarBrandIcon');
        if (logoImg && brandIcon) {
            logoImg.src = globalConfig.logo_base64;
            logoImg.style.display = 'block';
            brandIcon.style.display = 'none';
        }
    }
})();
