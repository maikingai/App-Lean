import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./teacher-home.css";

/* ===== LS helpers (เหมือนแนว quiz) ===== */
const EVENTS_KEY = "calendar_events";
const POSTS_KEY  = "classroom_posts";

function loadEvents() {
  try {
    const arr = JSON.parse(localStorage.getItem(EVENTS_KEY) || "null");
    if (Array.isArray(arr)) return arr;
  } catch {}
  // seed ครั้งแรก
  return [
    { id: "e1", title: "Math • Matrix (Due 23:59)", start: "2025-10-10T23:59:00", color: "#bfa7ff" },
  ];
}
function saveEvents(list) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(list));
}
function upsertEvent(list, row) {
  const i = list.findIndex(e => e.id === row.id);
  if (i >= 0) {
    const copy = list.slice();
    copy[i] = { ...copy[i], ...row };
    return copy;
  }
  return [...list, row];
}

export default function CalendarTeacher() {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  // ===== modal state for create/edit =====
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", date: "", time: "23:59" });

  // ===== events (Single source = localStorage) =====
  const [events, setEvents] = useState(loadEvents);
  useEffect(() => saveEvents(events), [events]);

  // snackbar หลังสร้างโพสต์สำเร็จ
  const [toast, setToast] = useState(null); // {msg, postId}

  const handleLogout = () => {
    localStorage.removeItem("role");
    setShowProfile(false);
    navigate("/login");
  };

  // --- create or update ---
  const saveEvent = async (e) => {
    e?.preventDefault?.();
    const startISO = `${form.date}T${form.time}:00`;

    if (editingId) {
      setEvents(prev => upsertEvent(prev, { id: editingId, title: form.title, start: startISO }));
      try {
        await fetch(`/api/events/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: form.title, start: startISO }),
        });
      } catch {}
    } else {
      const id = (crypto?.randomUUID?.() || `e_${Date.now()}`);
      const newEv = { id, title: form.title, start: startISO, color: "#bfa7ff" };
      setEvents(prev => upsertEvent(prev, newEv));
      try {
        await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEv),
        });
      } catch {}

      // ✅ สร้าง Material post ลงฟีด Classroom + เก็บถาวร
      const dateLabel = new Date(form.date).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short"
      });
      const post = {
        id: "cal_" + (crypto?.randomUUID?.() || Date.now()),
        type: "material",
        title: `Thanchanok Konsuag : New Material - ${form.title}`,
        dateLabel,
        detail: `${form.title} • ${form.date} ${form.time}`,
        section: "M4/1",
        youtubeUrl: "",
        otherLink: "",
        files: []
      };
      try {
        const old = JSON.parse(localStorage.getItem(POSTS_KEY) || "[]");
        localStorage.setItem(POSTS_KEY, JSON.stringify([post, ...old]));
        setToast({ msg: "Added to Classroom feed", postId: post.id });
      } catch {}
    }

    setModalOpen(false);
    setEditingId(null);
    setForm({ title: "", date: "", time: "23:59" });
  };

  const deleteEvent = async () => {
    if (!editingId) return;
    setEvents(v => v.filter(e => e.id !== editingId));
    try { await fetch(`/api/events/${editingId}`, { method: "DELETE" }); } catch {}
    setModalOpen(false);
    setEditingId(null);
  };

  // ===== small event renderer =====
  const renderEvent = (info) => {
    const [left, right] = info.event.title.split("•");
    return (
      <div style={{ fontSize: 11, lineHeight: 1.1 }}>
        <div style={{ fontWeight: 600 }}>{left?.trim()}</div>
        <div>{right?.trim() || ""}</div>
      </div>
    );
  };

  // ===== Icon button =====
  const IconBtn = ({ title, onClick, children }) => (
    <button className="th-iconbtn" title={title} aria-label={title} onClick={onClick}>
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  );

  return (
    <div className="th-root">
      {/* Sidebar */}
      <aside className="th-sidebar">
        <div className="th-sidebar-top">
          <IconBtn title="Home" onClick={() => navigate("/teacher")}>🏠</IconBtn>
          <IconBtn title="Calendar" onClick={() => navigate("/calendar")}>🗓️</IconBtn>
          <IconBtn title="Quiz" onClick={() => navigate("/quiz")}>❓</IconBtn>
          <IconBtn title="Assignment Review" onClick={() => navigate("/assignments/review")}>📝</IconBtn>
        </div>
      </aside>

      {/* Main */}
      <main className="th-main th-main-rel">
        {/* Topbar */}
        <div className="th-topbar" style={{ justifyContent: "flex-end" }}>
          <button className="th-avatar" title="profile" onClick={() => setShowProfile(v=>!v)}>🙂</button>
        </div>
        {showProfile && (
          <>
            <div className="th-profile-backdrop" onClick={() => setShowProfile(false)} />
            <div className="th-profile-pop">
              <div className="th-profile-title">Profile</div>
              <div className="th-profile-row">Role: Teacher</div>
              <button className="th-btn-logout" onClick={handleLogout}>Logout</button>
            </div>
          </>
        )}

        {/* Calendar card */}
        <section className="th-card" style={{ width: "97%", overflow: "hidden", borderRadius: 16 }}>
          <div
            style={{
              background: "#9966ff",
              color: "#fff",
              padding: "14px 18px",
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              fontWeight: 700
            }}
          >
            <div>Calendar</div>
            <div style={{ textAlign: "center" }} />
            <div style={{ textAlign: "right" }} />
          </div>

          <div style={{ padding: 12 }}>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
              fixedWeekCount={false}
              dayMaxEventRows={3}
              selectable
              selectMirror
              events={events}
              eventContent={renderEvent}
              dateClick={(arg) => {
                setEditingId(null);
                setForm({ title: "", date: arg.dateStr, time: "23:59" });
                setModalOpen(true);
              }}
              eventClick={(info) => {
                setEditingId(info.event.id);
                const dt = new Date(info.event.start);
                const date = dt.toISOString().slice(0, 10);
                const time = dt.toTimeString().slice(0, 5);
                setForm({ title: info.event.title, date, time });
                setModalOpen(true);
              }}
              height="auto"
            />
          </div>
        </section>

        {/* Snackbar หลังสร้างโพสต์ + ลิงก์ไป Classroom */}
        {toast && (
          <div
            role="status"
            style={{
              position: "fixed",
              right: 20,
              bottom: 20,
              background: "#111827",
              color: "#fff",
              borderRadius: 12,
              padding: "10px 12px",
              boxShadow: "0 14px 36px rgba(15,23,42,.35)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              zIndex: 60
            }}
          >
            <span>{toast.msg}</span>
            <button
              onClick={() => navigate("/classroom")}
              style={{
                border: 0, cursor: "pointer",
                background: "#60a5fa", color: "#fff",
                padding: "6px 10px", borderRadius: 8, fontWeight: 700
              }}
            >
              View in Classroom
            </button>
            <button
              onClick={() => setToast(null)}
              style={{ border: 0, background: "transparent", color: "#fff", opacity: .7, cursor: "pointer" }}
              title="close"
            >
              ✕
            </button>
          </div>
        )}
      </main>

      {/* Modal create/edit (floating) */}
      {modalOpen && (
        <div className="th-modal-backdrop" onClick={() => setModalOpen(false)}>
          <form
            className="th-modal"
            onClick={(e)=>e.stopPropagation()}
            onSubmit={saveEvent}
            style={{
              width: 380,
              maxWidth: "90%",
              borderRadius: 20,
              background: "#fff",
              boxShadow: "0 20px 40px rgba(0,0,0,.25)",
              padding: 16
            }}
          >
            <div className="th-modal-title" style={{ fontWeight: 700, textAlign: "center" }}>
              {editingId ? "Edit Event" : "Add Event"}
            </div>
            <div className="th-modal-body" style={{ display: "grid", gap: 12 }}>
              <input
                className="th-input"
                type="text"
                placeholder="Event title (e.g., Math • Matrix (Due 23:59))"
                value={form.title}
                onChange={(e)=>setForm(v=>({ ...v, title: e.target.value }))}
                required
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input
                  className="th-input"
                  type="date"
                  value={form.date}
                  onChange={(e)=>setForm(v=>({ ...v, date: e.target.value }))}
                  required
                />
                <input
                  className="th-input"
                  type="time"
                  value={form.time}
                  onChange={(e)=>setForm(v=>({ ...v, time: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="th-modal-actions" style={{ justifyContent: editingId ? "space-between" : "flex-end" }}>
              {editingId && (
                <button type="button" className="th-btn-cancel" style={{ color: "#E11D48" }} onClick={deleteEvent}>
                  delete
                </button>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="th-btn-cancel" onClick={()=>setModalOpen(false)}>cancel</button>
                <button type="submit" className="th-btn-save">{editingId ? "save" : "add"}</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
