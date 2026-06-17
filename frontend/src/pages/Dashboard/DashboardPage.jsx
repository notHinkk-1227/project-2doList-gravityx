import { useEffect, useState } from "react";
import { getProfile } from "../../services/authService";

import { 
    getTasks,
    createTask,
    updateTask,
    deleteTask,
} from "../../services/taskService";

import TaskForm from "../../components/TaskForm/TaskForm";
import TaskList from "../../components/TaskList/TaskList";

import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [editingTaskId, setEditingTaskId] =
    useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();

        setUser(data.user);

        const taskData = await getTasks();

        setTasks(taskData.tasks);

      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/login");
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      const response = await createTask({
        title,
        description,
      });

      setTasks([
        response.task,
        ...tasks,
      ]);

      setTitle("");
      setDescription("");

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Gagal membuat task"
      );
    }
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);

    setTitle(task.title);

    setDescription(
      task.description || ""
    );
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();

    try {
      const response = await updateTask(
        editingTaskId,
        {
          title,
          description,
          is_completed: false,
        }
      );

      setTasks(
        tasks.map((task) =>
          task.id === editingTaskId
            ? response.task
            : task
        )
      );

      setEditingTaskId(null);

      setTitle("");
      setDescription("");

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Gagal update task"
      );
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus task ini?"
    );

    if (!confirmDelete) return;

    try {
      await deleteTask(taskId);

      setTasks(
        tasks.filter(
          (task) => task.id !== taskId
        )
      );

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Gagal menghapus task"
      );
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>

      {user ? (
        <>
          <h2>
            Selamat Datang,
            {user.username}
          </h2>

          <p>
            Email:
            {user.email}
          </p>

          <button
            onClick={handleLogout}
          >
            Logout
          </button>

          <hr />

          <TaskForm
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            editingTaskId={editingTaskId}
            onSubmit={
              editingTaskId
                ? handleUpdateTask
                : handleCreateTask
            }
          />

          <hr />

          <h3>My Tasks</h3>

          <TaskList
            tasks={tasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
          
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default DashboardPage;