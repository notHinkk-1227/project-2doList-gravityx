import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./AddTaskModal.css";

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

function Calendar({ value, onChange, onClose, anchorRef }) {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(value ? value.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value ? value.getMonth()    : today.getMonth());
  const [pos, setPos] = useState({ top: 0, left: 0, width: 260 });
  const calRef = useRef(null);

  /* Position kalender tepat di bawah/atas tombol anchor */
  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const calH = 300;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const top = spaceBelow >= calH
      ? rect.bottom + 8
      : rect.top - calH - 8;
    setPos({ top, left: rect.left, width: Math.max(rect.width, 260) });
  }, [anchorRef]);

  /* Tutup kalender bila klik di luar */
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
      className="atm-calendar"
      style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
    >
      <div className="atm-calendar__header">
        <button type="button" className="atm-calendar__nav" onClick={prevMonth} aria-label="Previous month">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="atm-calendar__month-label">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button type="button" className="atm-calendar__nav" onClick={nextMonth} aria-label="Next month">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="atm-calendar__grid">
        {DAY_NAMES.map(d => (
          <div key={d} className="atm-calendar__day-name">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div key={i} className="atm-calendar__cell">
            {day !== null && (
              <button
                type="button"
                className={[
                  "atm-calendar__day",
                  isSelected(day) ? "atm-calendar__day--selected" : "",
                  isToday(day) && !isSelected(day) ? "atm-calendar__day--today" : "",
                  isPast(day) ? "atm-calendar__day--past" : "",
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

      <div className="atm-calendar__footer">
        <button type="button" className="atm-calendar__clear"
          onClick={() => { onChange(null); onClose(); }}>
          Clear date
        </button>
      </div>
    </div>,
    document.body
  );
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

export default function AddTaskModal({ show, onClose, onAdd }) {
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority]     = useState("Medium");
  const [date, setDate]             = useState(null);
  const [tags, setTags]         = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showCal, setShowCal]   = useState(false);
  const dateInputRef = useRef(null);
  const tagInputRef  = useRef(null);

  useEffect(() => {
    if (!show) {
      setTitle(""); setDescription(""); setPriority("Medium");
      setDate(null); setTags([]); setTagInput(""); setShowCal(false);
    }
  }, [show]);

  const addTag = (val) => {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  const removeTag = (idx) => setTags(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!title.trim()) return;
    const finalTags = tagInput.trim() && !tags.includes(tagInput.trim())
      ? [...tags, tagInput.trim()]
      : tags;
    onAdd({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      date: toDateOnlyString(date),
      tags: finalTags,
    });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="atm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="atm-modal" role="dialog" aria-modal="true" aria-label="Add new task">

        {/* Header */}
        <div className="atm-modal__header">
          <h2 className="atm-modal__title">New Task</h2>
          <button type="button" className="atm-modal__close" onClick={onClose} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="atm-modal__body">

          {/* Title */}
          <div className="atm-field">
            <label className="atm-field__label" htmlFor="atm-title">
              Task title <span className="atm-required">*</span>
            </label>
            <input
              id="atm-title"
              type="text"
              className="atm-field__input"
              placeholder="What do you need to do?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="atm-field">
            <label className="atm-field__label" htmlFor="atm-desc">Description</label>
            <textarea
              id="atm-desc"
              className="atm-field__textarea"
              placeholder="Add more details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Priority */}
          <div className="atm-field">
            <label className="atm-field__label">Priority</label>
            <div className="atm-priority-group">
              {PRIORITY_OPTIONS.map((p) => (
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

          {/* Due date */}
          <div className="atm-field">
            <label className="atm-field__label">Due date</label>
            <div className="atm-date-group">
              <button
                ref={dateInputRef}
                type="button"
                className={`atm-date-btn ${date ? "atm-date-btn--has-value" : ""}`}
                onClick={() => setShowCal(v => !v)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={15} height={15}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                <span>{date ? formatDate(date) : "Pick a date"}</span>
              </button>
            </div>
            {showCal && (
              <Calendar
                value={date}
                onChange={setDate}
                onClose={() => setShowCal(false)}
                anchorRef={dateInputRef}
              />
            )}
          </div>

          {/* Tags chip input */}
          <div className="atm-field">
            <label className="atm-field__label">Tags</label>
            <div
              className="atm-tag-box"
              onClick={() => tagInputRef.current?.focus()}
            >
              {tags.map((tag, idx) => (
                <span key={idx} className="atm-chip">
                  {tag}
                  <button
                    type="button"
                    className="atm-chip__remove"
                    onClick={(e) => { e.stopPropagation(); removeTag(idx); }}
                    aria-label={`Remove ${tag}`}
                  >×</button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                type="text"
                className="atm-tag-input"
                placeholder={tags.length === 0 ? "Ketik lalu tekan Enter atau Spasi..." : ""}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => addTag(tagInput)}
              />
            </div>
            <span className="atm-hint" style={{ marginTop: "4px" }}>Tekan Enter, Spasi, atau koma untuk menambah tag</span>
          </div>
        </div>

        {/* Footer */}
        <div className="atm-modal__footer">
          <button type="button" className="atm-btn atm-btn--ghost" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="atm-btn atm-btn--primary"
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}