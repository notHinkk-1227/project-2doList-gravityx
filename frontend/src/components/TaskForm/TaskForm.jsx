function TaskForm({
  title,
  setTitle,
  description,
  setDescription,
  editingTaskId,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit}>
      <div>
        <input
          type="text"
          placeholder="Judul Task"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />
      </div>

      <br />

      <div>
        <textarea
          placeholder="Deskripsi"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />
      </div>

      <br />

      <button type="submit">
        {editingTaskId
          ? "Update Task"
          : "Tambah Task"}
      </button>
    </form>
  );
}

export default TaskForm;