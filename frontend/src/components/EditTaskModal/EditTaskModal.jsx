import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./EditTaskModal.css";

const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"];

/* Setelah fix di backend (types.setTypeParser(1082, ...) di config/db.js),
   due_date SELALU dikirim sebagai string "YYYY-MM-DD" polos -- tidak pernah
   lagi berupa Date object / timestamp UTC. Parsing jadi simpel dan aman: */
function parseDateString(str) {
  if (!str) return null;
  const datePart = String(str).split("T")[0]; // jaga-jaga kalau masih ada format lama
  const [y, m, d] = datePart.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDate(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return "";
  const day   = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  const year  = d.getFullYear();
  return `${day} - ${month} - ${year}`;
}

/* Ubah Date lokal jadi string "YYYY-MM-DD" TANPA lewat UTC,
   supaya tidak geser hari akibat timezone (jangan pakai toISOString di sini) */
function toDateOnlyString(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function EditCalendar({ value, onChange, onClose, anchorRef }) {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(value ? value.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value ? value.getMonth()    : today.getMonth());
  const [pos, setPos] = useState({ top: 0, left: 0, width: 260 });
  const calRef = useRef(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const calH = 300;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const top = spaceBelow >= calH ? rect.bottom + 8 : rect.top - calH - 8;
    setPos({ top, left: rect.left, width: Math.max(rect.width, 260) });
  }, [anchorRef]);

  useEffect(() => {
    const handler = (e) => {
      if (
        calRef.current && !calRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDay = (day) => {
    onChange(new Date(viewYear, viewMonth, day));
    onClose();
  };

  const isSelected = (day) =>
    value && value.getFullYear() === viewYear &&
    value.getMonth() === viewMonth && value.getDate() === day;

  const isToday = (day) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth && today.getDate() === day;

  const isPast = (day) => {
    const d = new Date(viewYear, viewMonth, day); d.setHours(0,0,0,0);
    const t = new Date(); t.setHours(0,0,0,0);
    return d < t;
  };

  const cells = [];
  for (let i = 0; i < getFirstDayOfMonth(viewYear, viewMonth); i++) cells.push(null);
  for (let d = 1; d <= getDaysInMonth(viewYear, viewMonth); d++) cells.push(d);

  return createPortal(
    <div
      ref={calRef}
      className="etm-calendar"
      style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
    >
      <div className="etm-calendar__header">
        <button type="button" className="etm-calendar__nav" onClick={prevMonth} aria-label="Previous month">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="etm-calendar__month-label">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button type="button" className="etm-calendar__nav" onClick={nextMonth} aria-label="Next month">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="etm-calendar__grid">
        {DAY_NAMES.map(d => (
          <div key={d} className="etm-calendar__day-name">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div key={i} className="etm-calendar__cell">
            {day !== null && (
              <button
                type="button"
                className={[
                  "etm-calendar__day",
                  isSelected(day) ? "etm-calendar__day--selected" : "",
                  isToday(day) && !isSelected(day) ? "etm-calendar__day--today" : "",
                  isPast(day) ? "etm-calendar__day--past" : "",
                ].join(" ")}
                onClick={() => !isPast(day) && selectDay(day)}
                disabled={isPast(day)}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="etm-calendar__footer">
        <button type="button" className="etm-calendar__clear"
          onClick={() => { onChange(null); onClose(); }}>
          Clear date
        </button>
      </div>
    </div>,
    document.body
  );
}

export default function EditTaskModal({ show, task, onClose, onSave }) {
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority]       = useState("Medium");
  const [date, setDate]               = useState(null);
  const [tags, setTags]               = useState([]);
  const [tagInput, setTagInput]       = useState("");
  const [showCal, setShowCal]         = useState(false);
  const dateInputRef = useRef(null);
  const tagInputRef  = useRef(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "Medium");
      setDate(parseDateString(task.date || task.due_date));
      setTags(task.tags || []);
      setTagInput("");
      setShowCal(false);
    }
  }, [task]);

  if (!show) return null;

  const addTag = (val) => {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (idx) => setTags((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!title.trim()) return;
    const finalTags = tagInput.trim() && !tags.includes(tagInput.trim())
      ? [...tags, tagInput.trim()]
      : tags;
    onSave({
      ...task,
      title: title.trim(),
      description: description.trim() || null,
      priority,
      date: toDateOnlyString(date),
      tags: finalTags,
    });
    onClose();
  };

  return (
    <div className="etm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="etm-modal" role="dialog" aria-modal="true" aria-label="Edit task">

        {/* Header */}
        <div className="etm-header">
          <h2 className="etm-title">Edit Task</h2>
          <button type="button" className="etm-close" onClick={onClose} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="etm-body">

          {/* Title */}
          <div className="etm-field">
            <label className="etm-label" htmlFor="etm-title">
              Task title <span className="etm-required">*</span>
            </label>
            <input
              id="etm-title"
              type="text"
              className="etm-input"
              placeholder="What do you need to do?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="etm-field">
            <label className="etm-label" htmlFor="etm-desc">Description</label>
            <textarea
              id="etm-desc"
              className="etm-textarea"
              placeholder="Add more details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Priority */}
          <div className="etm-field">
            <label className="etm-label">Priority</label>
            <div className="etm-priority-group">
              {PRIORITY_OPTIONS.map((p) => (
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

          {/* Due date */}
          <div className="etm-field">
            <label className="etm-label">Due date</label>
            <div className="etm-date-group">
              <button
                ref={dateInputRef}
                type="button"
                className={`etm-date-btn ${date ? "etm-date-btn--has-value" : ""}`}
                onClick={() => setShowCal((v) => !v)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={15} height={15}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                <span>{date ? formatDate(date) : "Pick a date"}</span>
              </button>
            </div>
            {showCal && (
              <EditCalendar
                value={date}
                onChange={setDate}
                onClose={() => setShowCal(false)}
                anchorRef={dateInputRef}
              />
            )}
          </div>

          {/* Tags */}
          <div className="etm-field">
            <label className="etm-label">Tags</label>
            <div className="etm-tag-box" onClick={() => tagInputRef.current?.focus()}>
              {tags.map((tag, idx) => (
                <span key={idx} className="etm-chip">
                  {tag}
                  <button
                    type="button"
                    className="etm-chip__remove"
                    onClick={(e) => { e.stopPropagation(); removeTag(idx); }}
                    aria-label={`Remove ${tag}`}
                  >×</button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                type="text"
                className="etm-tag-input"
                placeholder={tags.length === 0 ? "Ketik lalu tekan Enter atau Spasi..." : ""}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => addTag(tagInput)}
              />
            </div>
            <span className="etm-hint" style={{ marginTop: "4px" }}>Tekan Enter, Spasi, atau koma untuk menambah tag</span>
          </div>
        </div>

        {/* Footer */}
        <div className="etm-footer">
          <button type="button" className="etm-btn etm-btn--ghost" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="etm-btn etm-btn--primary"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}