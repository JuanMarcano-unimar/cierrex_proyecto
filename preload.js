const { contextBridge } = require('electron');

// Expose the backend PORT from the environment variable to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    getPort: () => process.env.APP_PORT || '3000'
});
