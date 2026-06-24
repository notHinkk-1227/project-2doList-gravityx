import { useState, useEffect } from "react";
import "./EditTaskModal.css";

function EditTaskModal({ show, task, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [date, setDate] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setPriority(task.priority);
      setDate(task.date);
      setTags(task.tags);
    }
  }, [task]);

  if (!show) return null;

  const handleAddTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags((prev) => [...prev, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ ...task, title, priority, date, tags });
    onClose();
  };

  return (
    <div className="etm-overlay" onClick={onClose}>
      <div className="etm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="etm-header">
          <h2 className="etm-title">Edit Task</h2>
          <button className="etm-close" onClick={onClose}>✕</button>
        </div>

        <div className="etm-field">
          <label className="etm-label">Task Name</label>
          <input
            type="text"
            className="etm-input"
            placeholder="Enter task name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div className="etm-field">
          <label className="etm-label">Priority</label>
          <div className="etm-priority-row">
            {["Low", "Medium", "High"].map((p) => (
              <button
                key={p}
                type="button"
                className={`etm-priority-btn etm-priority-btn--${p.toLowerCase()} ${priority === p ? "etm-priority-btn--active" : ""}`}
                onClick={() => setPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="etm-field">
          <label className="etm-label">Due Date</label>
          <input
            type="date"
            className="etm-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="etm-field">
          <label className="etm-label">
            Tags <span className="etm-hint">(tekan Enter untuk tambah)</span>
          </label>
          <div className="etm-tags-input">
            {tags.map((tag) => (
              <span key={tag} className="etm-tag-pill">
                {tag}
                <button onClick={() => removeTag(tag)} className="etm-tag-pill__remove">✕</button>
              </span>
            ))}
            <input
              type="text"
              className="etm-tags-input__field"
              placeholder="Tambah tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>
        </div>

        <div className="etm-footer">
          <button className="etm-cancel" onClick={onClose}>Cancel</button>
          <button className="etm-save" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default EditTaskModal;