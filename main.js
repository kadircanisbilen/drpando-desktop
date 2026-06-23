const { app, BrowserWindow, shell, Menu } = require("electron");

// The web panel the desktop app wraps. A thin shell: it just loads the live
// site, so the app is always up to date and there is no duplicated code.
const APP_URL = "https://drpando.com";
const APP_ORIGIN = new URL(APP_URL).origin;

let mainWindow = null;

function isInternal(targetUrl) {
  try {
    return new URL(targetUrl).origin === APP_ORIGIN;
  } catch {
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 680,
    title: "DrPando",
    backgroundColor: "#ffffff",
    autoHideMenuBar: true, // Windows/Linux: hide the menu bar by default
    webPreferences: {
      // Loading a remote site → keep the renderer fully sandboxed.
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadURL(APP_URL);

  // Open external links (anything outside drpando.com) in the user's real
  // browser instead of inside the app window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!isInternal(url)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!isInternal(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Friendly offline screen with a retry button if the site can't be reached.
  mainWindow.webContents.on("did-fail-load", (_e, errorCode, _desc, validatedURL, isMainFrame) => {
    // -3 == ERR_ABORTED (e.g. a redirect) — ignore.
    if (!isMainFrame || errorCode === -3) return;
    mainWindow.loadURL(
      "data:text/html;charset=utf-8," +
        encodeURIComponent(`
        <html><head><meta charset="utf-8"><title>DrPando</title></head>
        <body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;display:flex;
        height:100vh;margin:0;align-items:center;justify-content:center;background:#f7f8fa;color:#1f2937">
          <div style="text-align:center;max-width:360px">
            <h2 style="margin:0 0 8px">Bağlantı kurulamadı</h2>
            <p style="color:#6b7280;margin:0 0 20px">İnternet bağlantını kontrol edip tekrar dene.</p>
            <button onclick="location.href='${APP_URL}'"
              style="background:#2563eb;color:#fff;border:0;border-radius:8px;
              padding:10px 20px;font-size:14px;cursor:pointer">Yeniden dene</button>
          </div>
        </body></html>`),
    );
  });
}

app.whenReady().then(() => {
  // Minimal native menu (keeps standard shortcuts: copy/paste, quit, reload, zoom).
  const isMac = process.platform === "darwin";
  const template = [
    ...(isMac ? [{ role: "appMenu" }] : []),
    { role: "editMenu" },
    {
      label: "Görünüm",
      submenu: [
        { role: "reload", label: "Yenile" },
        { role: "resetZoom", label: "Yakınlaştırmayı sıfırla" },
        { role: "zoomIn", label: "Yakınlaştır" },
        { role: "zoomOut", label: "Uzaklaştır" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Tam ekran" },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
