import { useState, useEffect } from "react";
import StatsCard from "../../components/StatsCard/StatsCard";
import TaskCard from "../../components/TaskCard/TaskCard";
import AddTaskModal from "../../components/AddTaskModal/AddTaskModal";
import EditTaskModal from "../../components/EditTaskModal/EditTaskModal";
import UserMenu from "../../components/UserMenu/UserMenu";
import Logout from "../../components/Logout/Logout";
import { getTasks, createTask, updateTask, deleteTask } from "../../services/taskService";
import { getProfile } from "../../services/authService";
import "./DashboardPage.css";

function getGreeting(hour) {
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardPage() {
  const [now, setNow] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Update jam setiap menit
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Load user profile & tasks dari database
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, tasksData] = await Promise.all([
          getProfile(),
          getTasks(),
        ]);
        setUser(profileData.user);
        setTasks(tasksData);
      } catch (error) {
        console.error("Gagal load data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddTask = async ({ title, description, priority, date, tags }) => {
    try {
      const newTask = await createTask({
        title,
        priority,
        due_date: date || null,
        tags: tags || [],
        description: description || null,
      });
      setTasks((prev) => [newTask, ...prev]);
    } catch (error) {
      console.error("Gagal tambah task:", error);
    }
  };

  const handleToggle = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    try {
      const updated = await updateTask(id, {
        title: task.title,
        description: task.description,
        is_completed: !task.is_completed,
        priority: task.priority,
        due_date: task.due_date,
        tags: task.tags,
      });
      setTasks((prev) => prev.map((t) => t.id === id ? updated : t));
    } catch (error) {
      console.error("Gagal toggle task:", error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedTask) => {
    try {
      const saved = await updateTask(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        is_completed: updatedTask.is_completed,
        priority: updatedTask.priority,
        due_date: updatedTask.date || updatedTask.due_date,
        tags: updatedTask.tags,
      });
      setTasks((prev) => prev.map((t) => t.id === saved.id ? saved : t));
    } catch (error) {
      console.error("Gagal edit task:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Gagal hapus task:", error);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchTab =
      activeTab === "Active" ? !t.is_completed :
      activeTab === "Completed" ? t.is_completed : true;

    const matchSearch = searchQuery.trim() === "" ? true :
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.priority || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchTab && matchSearch;
  });

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const pendingCount = tasks.filter((t) => !t.is_completed).length;
  const productivity = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const displayName = user?.username || user?.name || "User";

  if (loading) {
    return (
      <div className="dp-root" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#6b7280" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dp-root">
      <main className="dp-main">

        {/* Topbar */}
        <div className="dp-topbar">
          <div className="dp-search">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={16} height={16} style={{ color: "#9ca3af", flexShrink: 0 }}>
              <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="Search tasks, priority or tags..."
              className="dp-search__input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="dp-topbar__right">
            <button className="dp-icon-btn">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={18} height={18} style={{ color: "#374151" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
              </svg>
            </button>
            <div
              className="dp-user"
              onClick={() => setShowUserMenu((v) => !v)}
              style={{ position: "relative" }}
            >
              <div className="dp-user__avatar">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="dp-user__name">{displayName}</span>
              <span className="dp-user__chevron">v</span>
              {showUserMenu && (
                <UserMenu
                  user={user}
                  onLogout={() => {
                    setShowUserMenu(false);
                    setShowLogoutModal(true);
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div className="dp-greeting">
          <h1 className="dp-greeting__title">{getGreeting(now.getHours())}, {displayName}</h1>
          <p className="dp-greeting__sub">Here's what you have planned for today</p>
        </div>

        {/* Stats */}
        <div className="dp-stats">
          <StatsCard
            label="Completed Today"
            value={completedCount}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={16} height={16}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            }
            iconColor="green"
          />
          <StatsCard
            label="Pending Tasks"
            value={pendingCount}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={16} height={16}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
            iconColor="orange"
          />
          <StatsCard
            label="Productivity"
            value={`${productivity}%`}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={16} height={16}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
            }
            iconColor="purple"
            extra={
              <div className="dp-progress">
                <div className="dp-progress__bar" style={{ width: `${productivity}%` }} />
              </div>
            }
          />
        </div>

        {/* Add Task */}
        <div className="dp-add-task">
          <input
            type="text"
            placeholder="Add a new task..."
            className="dp-add-task__input"
            readOnly
            onClick={() => setShowAddModal(true)}
          />
          <button className="dp-add-task__btn" onClick={() => setShowAddModal(true)}>
            + Add Task
          </button>
        </div>

        {/* Task List */}
        <div className="dp-tasklist">
          <div className="dp-tabs">
            {["All", "Active", "Completed"].map((tab) => (
              <button
                key={tab}
                className={`dp-tab ${activeTab === tab ? "dp-tab--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="dp-tasks">
            {filteredTasks.length === 0 ? (
              <div className="dp-tasks__empty">No tasks yet, add your first task!</div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={{
                    ...task,
                    completed: task.is_completed,
                    date: task.due_date,
                  }}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>

      </main>

      <AddTaskModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTask}
      />

      <EditTaskModal
        show={showEditModal}
        task={editingTask ? {
          ...editingTask,
          completed: editingTask.is_completed,
          date: editingTask.due_date,
        } : null}
        onClose={() => {
          setShowEditModal(false);
          setEditingTask(null);
        }}
        onSave={handleSaveEdit}
      />

      <Logout
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
}