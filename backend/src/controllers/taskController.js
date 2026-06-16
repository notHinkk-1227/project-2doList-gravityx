const pool = require("../config/db");

const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    const userId = req.user.id;

    // Validasi
    if (!title) {
      return res.status(400).json({
        message: "Title wajib diisi",
      });
    }

    const newTask = await pool.query(
      `
      INSERT INTO tasks
      (title, description, user_id)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [title, description, userId]
    );

    res.status(201).json({
      message: "Task berhasil dibuat",
      task: newTask.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await pool.query(
      `
      SELECT *
      FROM tasks
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    res.status(200).json({
      message: "Data task berhasil diambil",
      total: tasks.rows.length,
      tasks: tasks.rows,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;

    const userId = req.user.id;

    const task = await pool.query(
      `
      SELECT *
      FROM tasks
      WHERE id = $1
      AND user_id = $2
      `,
      [taskId, userId]
    );

    if (task.rows.length === 0) {
      return res.status(404).json({
        message: "Task tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Detail task berhasil diambil",
      task: task.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const userId = req.user.id;

    const {
      title,
      description,
      is_completed,
    } = req.body;

    // Cek task milik user
    const existingTask = await pool.query(
      `
      SELECT *
      FROM tasks
      WHERE id = $1
      AND user_id = $2
      `,
      [taskId, userId]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({
        message: "Task tidak ditemukan",
      });
    }

    const updatedTask = await pool.query(
      `
      UPDATE tasks
      SET
        title = $1,
        description = $2,
        is_completed = $3
      WHERE id = $4
      AND user_id = $5
      RETURNING *
      `,
      [
        title,
        description,
        is_completed,
        taskId,
        userId,
      ]
    );

    res.status(200).json({
      message: "Task berhasil diupdate",
      task: updatedTask.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const userId = req.user.id;

    // Cek task milik user
    const existingTask = await pool.query(
      `
      SELECT *
      FROM tasks
      WHERE id = $1
      AND user_id = $2
      `,
      [taskId, userId]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({
        message: "Task tidak ditemukan",
      });
    }

    await pool.query(
      `
      DELETE FROM tasks
      WHERE id = $1
      AND user_id = $2
      `,
      [taskId, userId]
    );

    res.status(200).json({
      message: "Task berhasil dihapus",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};