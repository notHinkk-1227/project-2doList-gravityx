import api from "./api";

export const getTasks = async () => {
  const token = localStorage.getItem("token");

  const response = await api.get(
    "/tasks",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const createTask = async (taskData) => {
  const token = localStorage.getItem("token");

  const response = await api.post(
    "/tasks",
    taskData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const updateTask = async (
  taskId,
  taskData
) => {
  const token = localStorage.getItem("token");

  const response = await api.put(
    `/tasks/${taskId}`,
    taskData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const deleteTask = async (taskId) => {
  const token = localStorage.getItem("token");

  const response = await api.delete(
    `/tasks/${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};