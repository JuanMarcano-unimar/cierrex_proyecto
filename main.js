const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

async function createWindow () {
  // Iniciar el backend Express localmente antes de abrir la ventana
  try {
      const { startServer } = require('./src/backend/server');
      await startServer();
  } catch (err) {
      console.error("No se pudo iniciar el servidor local backend:", err);
  }


  const port = process.env.APP_PORT || 3000; // Obtener el puerto que finalmente se usó

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Pasamos el puerto al frontend mediante localStorage para que sepa dónde llamar a la API
  mainWindow.webContents.executeJavaScript(`localStorage.setItem('PORT', '${port}');`);

  // Cargar el HTML principal, ahora desde la nueva ruta servido por electron
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
