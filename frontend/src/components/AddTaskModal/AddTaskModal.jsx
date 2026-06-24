import { useState } from "react";
import "./AddTaskModal.css";

function AddTaskModal({ show, onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);

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

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({ title, priority, date, tags });
    setTitle("");
    setPriority("Medium");
    setDate(new Date().toISOString().split("T")[0]);
    setTags([]);
    setTagInput("");
    onClose();
  };

  return (
    <div className="atm-overlay" onClick={onClose}>
      <div className="atm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="atm-header">
          <h2 className="atm-title">Add New Task</h2>
          <button className="atm-close" onClick={onClose}>✕</button>
        </div>

        <div className="atm-field">
          <label className="atm-label">Task Name</label>
          <input
            type="text"
            className="atm-input"
            placeholder="Enter task name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </div>

        <div className="atm-field">
          <label className="atm-label">Priority</label>
          <div className="atm-priority-row">
            {["Low", "Medium", "High"].map((p) => (
              <button
                key={p}
                type="button"
                className={`atm-priority-btn atm-priority-btn--${p.toLowerCase()} ${priority === p ? "atm-priority-btn--active" : ""}`}
                onClick={() => setPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="atm-field">
          <label className="atm-label">Due Date</label>
          <input
            type="date"
            className="atm-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="atm-field">
          <label className="atm-label">
            Tags <span className="atm-hint">(tekan Enter untuk tambah)</span>
          </label>
          <div className="atm-tags-input">
            {tags.map((tag) => (
              <span key={tag} className="atm-tag-pill">
                {tag}
                <button onClick={() => removeTag(tag)} className="atm-tag-pill__remove">✕</button>
              </span>
            ))}
            <input
              type="text"
              className="atm-tags-input__field"
              placeholder="Tambah tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>
        </div>

        <div className="atm-footer">
          <button className="atm-cancel" onClick={onClose}>Cancel</button>
          <button className="atm-submit" onClick={handleSubmit}>Add Task</button>
        </div>
      </div>
    </div>
  );
}

export default AddTaskModal;