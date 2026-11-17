
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

let win;

const WINDOW_WIDTH = 300;
const WINDOW_HEIGHT = 350;

// Arquivo onde as tarefas serão armazenadas
const tasksFile = path.join(app.getPath("userData"), "tasks.json");

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

    return JSON.parse(fs.readFileSync(tasksFile, "utf-8"));
  } catch (error) {
    console.error("Erro ao ler tarefas:", error);
    return [];
  }
}

// Salvar tarefas
function saveTasks(tasks) {
  fs.writeFileSync(
    tasksFile,
    JSON.stringify(tasks, null, 2)
  );
}

// Criar janela do Zinho
function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { bounds } = display;

  const positionX = bounds.x + bounds.width - WINDOW_WIDTH + 70;
  const positionY = bounds.y + bounds.height - WINDOW_HEIGHT - 15;

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

    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadURL("http://127.0.0.1:5173");

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
