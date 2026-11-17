
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("robotAPI", {
  // Abrir sites
  openSite: (site) => {
    return ipcRenderer.invoke("robot:open-site", site);
  },

  // Abrir programas
  openProgram: (program) => {
    return ipcRenderer.invoke("robot:open-program", program);
  },

  // Buscar tarefas salvas
  getTasks: () => {
    return ipcRenderer.invoke("robot:get-tasks");
  },

  // Salvar tarefas
  saveTasks: (tasks) => {
    return ipcRenderer.invoke("robot:save-tasks", tasks);
  }
});
