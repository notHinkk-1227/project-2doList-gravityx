function TaskList({
  tasks,
  onEdit,
  onDelete,
}) {
  if (tasks.length === 0) {
    return (
      <p>Belum ada task</p>
    );
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <strong>
            {task.title}
          </strong>

          <br />

          {task.description}

          <br />

          <button
            onClick={() =>
              onEdit(task)
            }
          >
            Edit
          </button>

          {" "}

          <button
            onClick={() =>
              onDelete(task.id)
            }
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

export default TaskList;