const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    title: "GoalArchitect",
    backgroundColor: '#0a0a0a', // Matches body background
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // sometimes needed for local file loading issues
    }
  });

  // Load the built file
  const startUrl = `file://${path.join(__dirname, 'dist', 'index.html')}`;
  
  win.loadURL(startUrl).catch(err => {
    console.error('Failed to load index.html:', err);
  });

  // Remove menu bar
  win.setMenuBarVisibility(false);

  // OPEN DEV TOOLS: This helps you see if there are errors (like missing API Key)
  // You can comment this out once it works.
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});