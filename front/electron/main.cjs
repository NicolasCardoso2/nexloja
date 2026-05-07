const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');
const { spawn } = require('node:child_process');
const http = require('node:http');

let mainWindow = null;
let backendProcess = null;
let backendStartedByElectron = false;

// Evita abrir várias instâncias ao dar duplo clique no atalho/instalador.
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

app.on('second-instance', () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
});

// Caminho do backend (empacotado ou em dev)
function getBackendPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'backend', 'src', 'index.js');
  }
  return path.join(__dirname, '..', '..', 'backend', 'src', 'index.js');
}

// Em dev usa o 'node' do sistema; empacotado usa o node embutido no Electron
function getNodeBin() {
  if (app.isPackaged) {
    return process.execPath;
  }
  // Resolve o caminho completo do node para não precisar de shell: true
  const which = require('node:child_process').spawnSync(
    process.platform === 'win32' ? 'where.exe' : 'which',
    ['node'],
    { encoding: 'utf8' }
  );
  const nodePath = which.stdout?.split(/\r?\n/)[0]?.trim();
  return nodePath || 'node';
}

function getDataDir() {
  // Dados do usuário ficam em AppData/Roaming/NexLoja — sobrevivem a atualizações
  return app.getPath('userData');
}

// JWT secret aleatório gerado uma vez por sessão do app (produção)
// Em dev, o backend usa o .env normalmente
let _jwtSecret = null;
function getJwtSecret() {
  if (!app.isPackaged) return undefined; // dev usa .env
  if (!_jwtSecret) {
    _jwtSecret = require('node:crypto').randomBytes(48).toString('hex');
  }
  return _jwtSecret;
}

function startBackend() {
  backendStartedByElectron = true;
  const backendEntry = getBackendPath();
  const extraEnv = {
    PORT: '3001',
    NEXLOJA_DATA_DIR: getDataDir(),
    // Faz o executável Electron rodar como Node.js puro, sem abrir janela
    ELECTRON_RUN_AS_NODE: '1',
  };
  const jwtSecret = getJwtSecret();
  if (jwtSecret) extraEnv.JWT_SECRET = jwtSecret;

  backendProcess = spawn(getNodeBin(), [backendEntry], {
    env: { ...process.env, ...extraEnv },
    stdio: 'pipe',
    shell: false,
  });

  backendProcess.stdout.on('data', (d) => console.log('[backend]', d.toString().trim()));
  backendProcess.stderr.on('data', (d) => console.error('[backend err]', d.toString().trim()));
  backendProcess.on('exit', (code) => console.log('[backend] encerrado, código:', code));
}

function isBackendReachable() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3001/api/auth/login', () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function waitForBackend(retries = 30) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      http.get('http://localhost:3001/api/auth/login', () => resolve())
        .on('error', () => {
          if (retries-- <= 0) return reject(new Error('Backend não subiu'));
          setTimeout(attempt, 500);
        });
    };
    attempt();
  });
}

function createWindow() {
  const iconPath = process.platform === 'win32'
    ? path.join(__dirname, 'assets', 'icon.ico')
    : path.join(__dirname, 'assets', 'icon.png');
  const iconExists = require('node:fs').existsSync(iconPath);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'NexLoja',
    ...(iconExists ? { icon: iconPath } : {}),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  } else {
    const devUrl = process.env.VITE_DEV_URL || 'http://localhost:3000';
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools();
  }

  // Abrir links externos no browser padrão
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(async () => {
  const backendJaRodando = await isBackendReachable();
  if (!backendJaRodando) {
    startBackend();
  } else {
    console.log('[backend] já estava rodando em http://localhost:3001');
  }

  try {
    await waitForBackend();
  } catch (e) {
    console.error('Backend demorou demais para subir:', e.message);
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (backendProcess && backendStartedByElectron) {
    backendProcess.kill();
    backendProcess = null;
  }
});
