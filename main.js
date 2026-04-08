const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

async function createWindow() {
    // Iniciar el backend Express localmente antes de abrir la ventana
    let port = 3000;
    try {
        const { startServer } = require('./src/backend/server');
        await startServer();
        port = process.env.APP_PORT || 3000;
    } catch (err) {
        console.error("No se pudo iniciar el servidor local backend:", err);
    }

    // Guardar el puerto en la variable de entorno para que preload.js lo lea
    process.env.APP_PORT = port;

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // Cargar el HTML principal del frontend
    mainWindow.loadFile(path.join(__dirname, 'src', 'frontend', 'login.html'));
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
