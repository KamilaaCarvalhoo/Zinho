
const {
  app,
  BrowserWindow,
  screen,
  ipcMain,
  shell
} = require("electron");

const path = require("path");
const { execFile } = require("child_process");
const fs = require("fs");

// Ajuste do cache da GPU
app.commandLine.appendSwitch("disable-gpu-shader-disk-cache");

let win;

const WINDOW_WIDTH = 300;
const WINDOW_HEIGHT = 350;

// Arquivo onde as tarefas serão armazenadas
const tasksFile = path.join(
  app.getPath("userData"),
  "tasks.json"
);

// Sites permitidos
const sites = {
  google: "https://www.google.com",
  youtube: "https://www.youtube.com",
  github: "https://github.com"
};

// Programas permitidos
const programs = {
  calculator: "calc.exe",
  explorer: "explorer.exe"
};

// Ler tarefas salvas
function readTasks() {
  try {
    if (!fs.existsSync(tasksFile)) {
      return [];
    }

    return JSON.parse(
      fs.readFileSync(tasksFile, "utf-8")
    );
  } catch (error) {
    console.error("Erro ao ler tarefas:", error);
    return [];
  }
}

// Salvar tarefas
function saveTasks(tasks) {
  try {
    fs.writeFileSync(
      tasksFile,
      JSON.stringify(tasks, null, 2)
    );
  } catch (error) {
    console.error("Erro ao salvar tarefas:", error);
    throw error;
  }
}

// Criar janela do Zinho
function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { bounds } = display;

  // Posicionamento dentro da tela
  const positionX = Math.max(
    bounds.x,
    bounds.x + bounds.width - WINDOW_WIDTH - 20
  );

  const positionY = Math.max(
    bounds.y,
    bounds.y + bounds.height - WINDOW_HEIGHT - 20
  );

  win = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    x: positionX,
    y: positionY,

    frame: false,
    transparent: true,
    backgroundColor: "#00000000",

    alwaysOnTop: true,
    resizable: false,
    movable: false,
    hasShadow: false,
    skipTaskbar: true,
    show: false,

    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Registrar erros de carregamento
  win.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      console.error(
        "Erro ao carregar o Zinho:",
        errorCode,
        errorDescription
      );
    }
  );

  // Exibir janela depois de carregar
  win.once("ready-to-show", () => {
    win.show();
    win.setAlwaysOnTop(true, "screen-saver");
  });

  win.webContents.on("did-finish-load", () => {
    console.log("Zinho carregado com sucesso!");
  });

  // Desenvolvimento e aplicativo instalado
  if (app.isPackaged) {
    const indexPath = path.join(
      __dirname,
      "../dist/index.html"
    );

    console.log("Carregando arquivo:", indexPath);

    win.loadFile(indexPath).catch((error) => {
      console.error("Erro ao abrir o arquivo:", error);
    });
  } else {
    win.loadURL("http://127.0.0.1:5173").catch((error) => {
      console.error("Erro ao abrir o Vite:", error);
    });
  }

  win.setAlwaysOnTop(true, "screen-saver");
}

// Abrir sites
ipcMain.handle("robot:open-site", async (event, site) => {
  const url = sites[site];

  if (!url) {
    throw new Error("Site não permitido.");
  }

  await shell.openExternal(url);

  return true;
});

// Abrir programas do Windows
ipcMain.handle("robot:open-program", async (event, program) => {
  const executable = programs[program];

  if (!executable) {
    throw new Error("Programa não permitido.");
  }

  return new Promise((resolve, reject) => {
    execFile(executable, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(true);
    });
  });
});

// Buscar tarefas
ipcMain.handle("robot:get-tasks", () => {
  return readTasks();
});

// Salvar tarefas
ipcMain.handle("robot:save-tasks", (event, tasks) => {
  if (!Array.isArray(tasks)) {
    throw new Error("Lista de tarefas inválida.");
  }

  saveTasks(tasks);

  return true;
});

// Inicialização
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});
