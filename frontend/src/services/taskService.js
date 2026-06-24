import api from "./api";

export const getTasks = async () => {
  const response = await api.get("/tasks");
  return response.data.tasks;
};

export const createTask = async ({ title, description, priority, due_date, tags }) => {
  const response = await api.post("/tasks", { title, description, priority, due_date, tags });
  return response.data.task;
};

export const updateTask = async (id, { title, description, is_completed, priority, due_date, tags }) => {
  const response = await api.put(`/tasks/${id}`, { title, description, is_completed, priority, due_date, tags });
  return response.data.task;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};