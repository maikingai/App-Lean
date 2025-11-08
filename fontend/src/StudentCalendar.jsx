// CalendarTeacher.jsx (student-style shell)
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./teacher-home.css";
import StudentSidebar from "./StudentSidebar";
import UserProfile from './UserProfile'

/* ===== LocalStorage keys ===== */
const EVENTS_KEY     = "calendar_events";
const POSTS_KEY      = "classroom_posts";
const LS_CLASSES_KEY = "classes_v1";       // รายการคลาส (truth)
const LS_ACTIVE_KEY  = "activeClassId";    // จำคลาสที่เปิดอยู่
const COIN_KEY       = "student_coins";    // เหรียญนักเรียน (แสดงบน topbar)
const CART_KEY       = "student_cart_v1";  // รถเข็นนักเรียน (badge sidebar)

function loadEvents() {
  try {
    const arr = JSON.parse(localStorage.getItem(EVENTS_KEY) || "null");
    if (Array.isArray(arr)) return arr;
  } catch {}
  // seed ครั้งแรก
  return [
    { id: "e1", classId: null, title: "Math • Matrix (Due 23:59)", start: "2025-10-10T23:59:00", color: "#bfa7ff" },
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

  const C = useMemo(() => ({
    ring: "0 0 0 3px rgba(15,176,160,.22)",
    pill: { borderRadius: 999, padding: "6px 10px", fontWeight: 800 },
  }), []);

  /* ===== classes for select (ยังคงใช้กับ modal) ===== */
  const [classes, setClasses] = useState(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(LS_CLASSES_KEY) || "[]");
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  });
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LS_CLASSES_KEY) {
        try {
          const arr = JSON.parse(e.newValue || "[]");
          setClasses(Array.isArray(arr) ? arr : []);
        } catch { setClasses([]); }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const getActiveClassId = () => {
    const a = localStorage.getItem(LS_ACTIVE_KEY);
    if (a) return a;
    if (classes.length) return String(classes[0].id);
    return "";
  };

  /* ===== events ===== */
  const [events, setEvents] = useState(loadEvents);
  useEffect(() => saveEvents(events), [events]);

  /* ===== coins (topbar) & cart badge (sidebar) ===== */
  const [coins, setCoins] = useState(() => {
    const n = Number(localStorage.getItem(COIN_KEY));
    if (!Number.isFinite(n)) {
      localStorage.setItem(COIN_KEY, "5000");
      return 5000;
    }
    return n;
  });
  useEffect(() => localStorage.setItem(COIN_KEY, String(coins)), [coins]);

  // cart badge is handled inside the shared StudentSidebar component

  /* ===== profile handled by shared UserProfile ===== */

  /* ===== snackbar หลังสร้างโพสต์ ===== */
  const [toast, setToast] = useState(null); // {msg, postId}

  /* ===== modal state for create/edit ===== */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", date: "", time: "23:59", classId: "" });

  /* ===== create / update / delete (คง logic เดิม) ===== */
  const saveEvent = async (e) => {
    e?.preventDefault?.();
    const startISO = `${form.date}T${form.time}:00`;
    const payload = {
      title: form.title,
      start: startISO,
      classId: form.classId || null,
      color: "#bfa7ff",
    };

    if (editingId) {
      setEvents(prev => upsertEvent(prev, { id: editingId, ...payload }));
      try {
        await fetch(`/api/events/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {}
    } else {
      const id = (crypto?.randomUUID?.() || `e_${Date.now()}`);
      const newEv = { id, ...payload };
      setEvents(prev => upsertEvent(prev, newEv));
      try {
        await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEv),
        });
      } catch {}

      // สร้างโพสต์ไป Classroom (เดิม)
      const dateLabel = new Date(form.date).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short"
      });
      const cls = classes.find(c => String(c.id) === String(form.classId));
      const section = cls?.section || "—";
      const post = {
        id: "cal_" + (crypto?.randomUUID?.() || Date.now()),
        type: "material",
        title: `Thanchanok Konsuag : New Material - ${form.title}`,
        dateLabel,
        detail: `${form.title} • ${form.date} ${form.time}`,
        section,
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
    setForm({ title: "", date: "", time: "23:59", classId: "" });
  };

  const deleteEvent = async () => {
    if (!editingId) return;
    setEvents(v => v.filter(e => e.id !== editingId));
    try { await fetch(`/api/events/${editingId}`, { method: "DELETE" }); } catch {}
    setModalOpen(false);
    setEditingId(null);
  };

  /* ===== event renderer ===== */
  const renderEvent = (info) => {
    const [left, right] = info.event.title.split("•");
    let sub = right?.trim() || "";
    const cid = info.event.extendedProps?.classId ?? info.event._def?.extendedProps?.classId;
    if (cid && classes.length) {
      const cls = classes.find(c => String(c.id) === String(cid));
      if (cls?.section) sub = `${sub ? sub + " • " : ""}${cls.section}`;
    }
    return (
      <div style={{ fontSize: 11, lineHeight: 1.1 }}>
        <div style={{ fontWeight: 600 }}>{left?.trim()}</div>
        <div>{sub}</div>
      </div>
    );
  };

  /* Icon buttons for topbar remain inline; sidebar is shared */

  return (
    <div className="th-root">
      {/* ===== Shared Student Sidebar ===== */}
      <StudentSidebar />

      {/* ===== Main ===== */}
      <main className="th-main th-main-rel">
        {/* Topbar (เหมือน Student): Coins + Profile */}
        <div className="th-topbar" style={{ justifyContent: "flex-end", gap: 10 }}>
          <div
            title="Coins"
            style={{
              ...C.pill,
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#ffe58a",
              color: "#1f2937",
              boxShadow: "0 2px 0 rgba(0,0,0,.08)",
            }}
          >
            🪙 {coins}
          </div>
          <UserProfile />
        </div>

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
                const defaultClassId = getActiveClassId();
                setEditingId(null);
                setForm({ title: "", date: arg.dateStr, time: "23:59", classId: defaultClassId });
                setModalOpen(true);
              }}
              eventClick={(info) => {
                setEditingId(info.event.id);
                const dt = new Date(info.event.start);
                const date = dt.toISOString().slice(0, 10);
                const time = dt.toTimeString().slice(0, 5);
                const classId = info.event.extendedProps?.classId ?? "";
                setForm({ title: info.event.title, date, time, classId: String(classId || "") });
                setModalOpen(true);
              }}
              height="auto"
            />
          </div>
        </section>

        {/* Snackbar (คงเดิม) */}
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
              width: 420,
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
              {/* Classroom select */}
              <select
                className="th-input"
                value={form.classId}
                onChange={(e)=>setForm(v=>({ ...v, classId: e.target.value }))}
                required
              >
                <option value="" disabled>Choose classroom</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.section ? `• ${c.section}` : ""}
                  </option>
                ))}
              </select>

              {/* Title */}
              <input
                className="th-input"
                type="text"
                placeholder="Event title (e.g., Math • Matrix (Due 23:59))"
                value={form.title}
                onChange={(e)=>setForm(v=>({ ...v, title: e.target.value }))}
                required
                onFocus={(e)=>e.target.style.boxShadow=C.ring}
                onBlur={(e)=>e.target.style.boxShadow='none'}
              />

              {/* Date & Time */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input
                  className="th-input"
                  type="date"
                  value={form.date}
                  onChange={(e)=>setForm(v=>({ ...v, date: e.target.value }))}
                  required
                  onFocus={(e)=>e.target.style.boxShadow=C.ring}
                  onBlur={(e)=>e.target.style.boxShadow='none'}
                />
                <input
                  className="th-input"
                  type="time"
                  value={form.time}
                  onChange={(e)=>setForm(v=>({ ...v, time: e.target.value }))}
                  required
                  onFocus={(e)=>e.target.style.boxShadow=C.ring}
                  onBlur={(e)=>e.target.style.boxShadow='none'}
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
