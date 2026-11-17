
import { useState, useEffect } from "react";
import "./Robot.css";

export default function Robot() {
  const [message, setMessage] = useState("Olá! Eu sou seu robozinho! 💜");
  const [animation, setAnimation] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState("shortcuts");
  const [now, setNow] = useState(new Date());

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [tasksLoaded, setTasksLoaded] = useState(false);

  // Relógio
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Carregar tarefas salvas
  useEffect(() => {
    async function loadTasks() {
      try {
        const savedTasks = await window.robotAPI.getTasks();
        setTasks(savedTasks);
      } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
        setMessage("Não consegui carregar suas tarefas. 😢");
      } finally {
        setTasksLoaded(true);
      }
    }

    loadTasks();
  }, []);

  // Salvar tarefas automaticamente
  useEffect(() => {
    if (!tasksLoaded) return;

    async function persistTasks() {
      try {
        await window.robotAPI.saveTasks(tasks);
      } catch (error) {
        console.error("Erro ao salvar tarefas:", error);
        setMessage("Não consegui salvar suas tarefas. 😢");
      }
    }

    persistTasks();
  }, [tasks, tasksLoaded]);

  // Mensagens do Zinho
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [message]);

  const time = now.toLocaleTimeString("pt-BR");

  const date = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  // Abrir sites
  async function openSite(site, name) {
    try {
      await window.robotAPI.openSite(site);
      setMessage(`Abrindo ${name}! 💜`);
    } catch (error) {
      console.error(error);
      setMessage("Não consegui abrir esse site. 😢");
    }
  }

  // Abrir programas
  async function openProgram(program, name) {
    try {
      await window.robotAPI.openProgram(program);
      setMessage(`Abrindo ${name}! 💜`);
    } catch (error) {
      console.error(error);
      setMessage(`Não consegui abrir ${name}. 😢`);
    }
  }

  // Adicionar tarefa
  function addTask(event) {
    event.preventDefault();

    const title = newTask.trim();

    if (!title) return;

    const task = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title,
      completed: false
    };

    setTasks((current) => [...current, task]);
    setNewTask("");
    setMessage("Nova tarefa adicionada! 💜");
  }

  // Concluir ou reabrir tarefa
  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  // Excluir tarefa
  function deleteTask(id) {
    setTasks((current) =>
      current.filter((task) => task.id !== id)
    );

    setMessage("Tarefa removida! 🗑️");
  }

  const pendingTasks = tasks.filter((task) => !task.completed).length;
  const completedTasks = tasks.filter((task) => task.completed).length;

  // Interagir com o Zinho
  function interact() {
    if (animation === "sleeping") {
      setAnimation("");
      setMessage("Bom diaaa! Que bom te ver! 🥰");
      return;
    }

    setAnimation("happy");
    setMessage("Obaaa! Que bom que você clicou em mim! 🥰");

    setTimeout(() => {
      setAnimation((current) =>
        current === "happy" ? "" : current
      );
    }, 1800);
  }

  // Dormir e acordar
  function toggleSleep() {
    if (animation === "sleeping") {
      setAnimation("");
      setMessage("Bom diaaa! 💜");
    } else {
      setAnimation("sleeping");
      setMessage("Zzz... estou com soninho 😴");
    }
  }

  // Dançar
  function dance() {
    setAnimation("dancing");
    setMessage("Obaaa! Vamos dançar! 💃🎶");
  }

  // Acenar
  function waveHand() {
    setAnimation("waving");
    setMessage("Oiii! Que bom te ver! 👋💜");
  }

  // Abrir e fechar painel
  function togglePanel() {
    setShowPanel((current) => !current);

    setMessage(
      showPanel
        ? "Voltei para brincar! 💜"
        : "Olha só o que eu posso fazer! 🤖"
    );
  }

  return (
    <div className="robot-container">

      {showPanel && (
        <div className="assistant-panel">

          <div className="assistant-header">
            <span>💜 Meu cantinho</span>
            <button onClick={togglePanel}>✕</button>
          </div>

          <div className="assistant-clock">
            <span>Agora são</span>
            <strong>{time}</strong>
            <p>{date}</p>
          </div>

          <div className="assistant-status">
            <span className="status-dot"></span>
            Zinho está online!
          </div>

          {/* Navegação do painel */}
          <div className="assistant-tabs">
            <button
              className={activeTab === "shortcuts" ? "active" : ""}
              onClick={() => setActiveTab("shortcuts")}
            >
              🌐 Atalhos
            </button>

            <button
              className={activeTab === "tasks" ? "active" : ""}
              onClick={() => setActiveTab("tasks")}
            >
              📝 Tarefas
              {pendingTasks > 0 && (
                <span className="task-counter">{pendingTasks}</span>
              )}
            </button>
          </div>

          {/* Aba de atalhos */}
          {activeTab === "shortcuts" && (
            <div className="assistant-shortcuts">
              <h4>Meus atalhos</h4>

              <div className="shortcut-grid">

                <button onClick={() => openSite("google", "Google")}>
                  <span>🌐</span>
                  Google
                </button>

                <button onClick={() => openSite("youtube", "YouTube")}>
                  <span>▶️</span>
                  YouTube
                </button>

                <button onClick={() => openSite("github", "GitHub")}>
                  <span>💻</span>
                  GitHub
                </button>

                <button onClick={() => openProgram("calculator", "Calculadora")}>
                  <span>🧮</span>
                  Calculadora
                </button>

                <button onClick={() => openProgram("explorer", "Arquivos")}>
                  <span>📁</span>
                  Arquivos
                </button>

              </div>
            </div>
          )}

          {/* Aba de tarefas */}
          {activeTab === "tasks" && (
            <div className="assistant-tasks">

              <div className="tasks-summary">
                <div>
                  <strong>{pendingTasks}</strong>
                  <span>Pendentes</span>
                </div>

                <div>
                  <strong>{completedTasks}</strong>
                  <span>Concluídas</span>
                </div>
              </div>

              <form className="task-form" onSubmit={addTask}>
                <input
                  type="text"
                  placeholder="Digite uma tarefa..."
                  value={newTask}
                  onChange={(event) => setNewTask(event.target.value)}
                  maxLength={100}
                />

                <button type="submit" title="Adicionar tarefa">
                  +
                </button>
              </form>

              <div className="task-list">

                {!tasksLoaded && (
                  <p className="empty-tasks">
                    Carregando tarefas...
                  </p>
                )}

                {tasksLoaded && tasks.length === 0 && (
                  <p className="empty-tasks">
                    Nenhuma tarefa por aqui! 💜
                    <br />
                    Adicione sua primeira tarefa.
                  </p>
                )}

                {tasks.map((task) => (
                  <div
                    className={`task-item ${task.completed ? "completed" : ""}`}
                    key={task.id}
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                      />

                      <span>{task.title}</span>
                    </label>

                    <button
                      className="delete-task"
                      onClick={() => deleteTask(task.id)}
                      title="Excluir tarefa"
                    >
                      ✕
                    </button>
                  </div>
                ))}

              </div>

              {tasks.length > 0 && (
                <p className="tasks-footer">
                  💜 Suas tarefas são salvas automaticamente.
                </p>
              )}

            </div>
          )}

        </div>
      )}

      {/* Balão de mensagem */}
      <div className={`robot-speech ${message ? "visible" : ""}`}>
        {message}
      </div>

      {/* Robozinho */}
      <div
        className={`robot ${animation}`}
        onClick={interact}
        title="Clique em mim!"
      >
        <div className="robot-antenna">
          <span />
        </div>

        <div className="robot-head">
          <div className="robot-ear left" />
          <div className="robot-ear right" />

          <div className="robot-face">
            <div className="robot-eyes">
              <span />
              <span />
            </div>

            <div className="robot-mouth" />
          </div>
        </div>

        <div className="robot-neck" />

        <div className="robot-body">
          <div className="robot-core" />
        </div>

        <div className="robot-arm left">
          <div className="robot-hand" />
        </div>

        <div className="robot-arm right">
          <div className="robot-hand" />
        </div>

        <div className="robot-leg left">
          <div className="robot-foot" />
        </div>

        <div className="robot-leg right">
          <div className="robot-foot" />
        </div>
      </div>

      <div className="robot-shadow" />

      {/* Botões do Zinho */}
      <div className="robot-buttons">

        <button
          className="robot-sleep-button"
          onClick={toggleSleep}
          title="Dormir ou acordar"
        >
          {animation === "sleeping" ? "☀️" : "😴"}
        </button>

        <button
          className="robot-dance-button"
          onClick={dance}
          title="Dançar"
        >
          💃
        </button>

        <button
          className="robot-wave-button"
          onClick={waveHand}
          title="Acenar"
        >
          👋
        </button>

        <button
          className="robot-assistant-button"
          onClick={togglePanel}
          title="Assistente"
        >
          🕒
        </button>

      </div>

    </div>
  );
}
