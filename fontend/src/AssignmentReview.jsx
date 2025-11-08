// AssignmentReview.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./teacher-home.css";
import TeacherSidebar from './TeacherSidebar'
import UserProfile from './UserProfile'

/* ===== storage keys ===== */
const ASSIGN_KEY = "assignments_meta";     // [{id,classId,className,title,status,due,turnedIn,assigned,graded}]
const CLASS_KEY  = "teacher_classes";       // [{id,name}] — มาจากหน้า Home
const POSTS_KEY  = "classroom_posts";       // ใช้ fallback เฉพาะโพสต์ type: "assignment"

/* ----- loaders (no seed) ----- */
function loadClasses() {
  try {
    const arr = JSON.parse(localStorage.getItem(CLASS_KEY) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function coerceFromPosts() {
  // แปลงโพสต์ assignment -> meta สำหรับรีวิว (กรณียังไม่มี assignments_meta)
  try {
    const posts = JSON.parse(localStorage.getItem(POSTS_KEY) || "[]");
    if (!Array.isArray(posts)) return [];
    return posts
      .filter(p => p?.type === "assignment")
      .map(p => ({
        id: p.id,                                      // ใช้ id เดิมของโพสต์
        classId: p.classId ?? 0,
        className: p.className ?? "Unknown",
        title: p.title ?? "Assignment",
        status: p.status ?? "assigned",
        due: p.dueISO ?? "",                           // ควรเก็บรูปแบบ YYYY-MM-DDTHH:mm:ssZ
        turnedIn: p.turnedIn ?? 0,
        assigned: p.assigned ?? 0,
        graded: p.graded ?? 0,
      }));
  } catch { return []; }
}

function loadAssignments() {
  try {
    const arr = JSON.parse(localStorage.getItem(ASSIGN_KEY) || "null");
    if (Array.isArray(arr)) return arr;
  } catch {}
  return coerceFromPosts(); // fallback แบบไม่ seed
}

function saveAssignments(list) {
  localStorage.setItem(ASSIGN_KEY, JSON.stringify(list));
}

function upsertAssignment(list, row) {
  const i = list.findIndex(x => x.id === row.id);
  if (i >= 0) {
    const copy = list.slice();
    copy[i] = { ...copy[i], ...row };
    return copy;
  }
  return [row, ...list];
}

export default function AssignmentReview() {
  const navigate = useNavigate();

  // profile handled by shared component

  // single sources
  const [classes, setClasses]   = useState(loadClasses);
  const [assigns, setAssigns]   = useState(loadAssignments);

  // sync เมื่อ state เปลี่ยน
  useEffect(() => saveAssignments(assigns), [assigns]);

  // รับอัปเดตจากหน้าอื่นที่เขียน localStorage (ข้ามแท็บ/หน้า)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CLASS_KEY)  setClasses(loadClasses());
      if (e.key === ASSIGN_KEY || e.key === POSTS_KEY) setAssigns(loadAssignments());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const [tab, setTab] = useState("toReview");
  const [classFilter, setClassFilter] = useState("all");

  // ถ้าไม่พบคลาสเลย ให้ fallback สร้างจาก assignments เพื่อให้ filter ใช้ได้
  const classOptions = useMemo(() => {
    if (classes.length) return classes;
    const s = new Set(assigns.map(d => `${d.classId}|${d.className}`));
    return Array.from(s).map(v => {
      const [id, name] = v.split("|"); return { id: Number(id), name };
    });
  }, [classes, assigns]);

  // bucketing
  const now = new Date();
  const startOfWeek = (() => {
    const d = new Date(now);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff); d.setHours(0,0,0,0);
    return d;
  })();
  const endOfWeek = (() => { const d = new Date(startOfWeek); d.setDate(d.getDate() + 7); return d; })();
  const endOfNextWeek = (() => { const d = new Date(startOfWeek); d.setDate(d.getDate() + 14); return d; })();

  const pool = tab === "toReview"
    ? assigns.filter(it => it.status === "assigned" || it.status === "overdue")
    : assigns.filter(it => it.status === "completed");

  const byClass = classFilter === "all" ? pool : pool.filter(it => it.classId === Number(classFilter));

  const buckets = { noDue: [], thisWeek: [], nextWeek: [], later: [] };
  byClass.forEach(it => {
    if (!it.due) { buckets.noDue.push(it); return; }
    const due = new Date(it.due);
    if (due >= startOfWeek && due < endOfWeek) buckets.thisWeek.push(it);
    else if (due >= endOfWeek && due < endOfNextWeek) buckets.nextWeek.push(it);
    else buckets.later.push(it);
  });

  // UI helpers
  const IconBtn = ({ title, onClick, children }) => (
    <button className="th-iconbtn" title={title} aria-label={title} onClick={onClick}>
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  );

  const PillSelect = ({ value, onChange, options }) => (
    <div style={{ position: "relative", width: "min(420px, 100%)", minWidth: 220 }}>
      <select
        value={value}
        onChange={onChange}
        style={{
          appearance: "none",
          width: "100%", height: 44, borderRadius: 999,
          padding: "0 44px 0 16px",
          background: "rgba(255,255,255,0.7)",
          border: "1px solid #cbd5e1",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          fontWeight: 600, color: "#0f172a", outline: "none",
        }}
      >
        {options.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
      <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 16, color: "#334155" }}>▾</div>
    </div>
  );

  const Section = ({ title, items }) => {
    const [open, setOpen] = useState(true);
    return (
      <div className="th-card" style={{ borderRadius: 16, padding: 0, overflow: "hidden", width: "100%" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", padding: "12px 16px", cursor: "pointer" }}
          onClick={() => setOpen(v => !v)}
        >
          <div style={{ color: "#0f172a", fontWeight: 600 }}>{title}</div>
          <div style={{ color: "#0f172a", display: "flex", alignItems: "center", gap: 10 }}>
            <span>{items.length}</span>
            <span style={{ transform: `rotate(${open ? 0 : 90}deg)` }}>▾</span>
          </div>
        </div>
        {open && (
          <div style={{ display: "grid", gap: 8, padding: "8px 12px 14px" }}>
            {items.length === 0 && <div style={{ color: "#6b7c93", fontSize: 14, padding: "6px 4px" }}>No items</div>}
            {items.map(it => (
              <Row key={it.id} item={it} onOpen={() => navigate(`/assignment/${it.id}`)} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const Row = ({ item, onOpen }) => (
    <div
      className="th-card"
      style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", borderRadius: 14, cursor: "pointer", padding: "10px 12px", width: "100%" }}
      onClick={onOpen}
    >
      <div style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 10, alignItems: "center" }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "#E9F0FF", display: "grid", placeItems: "center" }}>📄</div>
        <div>
          <div style={{ fontWeight: 600, color: "#0f172a" }}>{item.title}</div>
          <div style={{ fontSize: 12, color: "#6b7c93", marginTop: 2 }}>
            {item.className}
            {item.due
              ? ` • Due ${new Date(item.due).toLocaleDateString()} ${new Date(item.due).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : " • No due date"}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridAutoFlow: "column", gap: 24, alignItems: "center", justifyItems: "center" }} onClick={(e) => e.stopPropagation()}>
        <Stat label="Turned in" value={item.turnedIn} />
        <Stat label="Assigned"  value={item.assigned} />
        <Stat label="Graded"    value={item.graded} />
        <button title="more" style={{ border: 0, background: "transparent", fontSize: 18, cursor: "pointer" }}>⋯</button>
      </div>
    </div>
  );

  const Stat = ({ value, label }) => (
    <div style={{ textAlign: "center", minWidth: 40 }}>
      <div style={{ color: "#0f172a", fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#6b7c93" }}>{label}</div>
    </div>
  );

  return (
    <div className="th-root">
      {/* Shared teacher sidebar */}
      <TeacherSidebar />

      <main className="th-main" style={{ width: "100%", maxWidth: "none", paddingRight: 24 }}>
        {/* Topbar */}
        <div className="th-topbar" style={{ justifyContent: "flex-end" }}>
          <UserProfile />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 18, marginBottom: 16, width: "100%" }}>
          {[
            { key: "toReview", label: "To review" },
            { key: "reviewed", label: "Reviewed" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: "transparent",
                border: 0,
                padding: "8px 4px",
                fontWeight: 600,
                color: tab === t.key ? "#1f2937" : "#2c3e50",
                borderBottom: `3px solid ${tab === t.key ? "#6366f1" : "transparent"}`,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", alignItems: "center", marginBottom: 10, width: "100%" }}>
          <PillSelect
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            options={[
              { value: "all", label: "All Classes" },
              ...classOptions.map(c => ({ value: String(c.id), label: c.name })),
            ]}
          />
        </div>

        {/* Buckets */}
        <div style={{ display: "grid", gap: 12, width: "100%" }}>
          <Section title="No due date" items={buckets.noDue} />
          <Section title="This week"   items={buckets.thisWeek} />
          <Section title="Next week"   items={buckets.nextWeek} />
          <Section title="Later"       items={buckets.later} />
        </div>

        {/* ถ้าไม่มีข้อมูล บอกทางไปสร้าง */}
        {(assigns.length === 0) && (
          <div style={{ marginTop: 18, color: "#475569" }}>
            ยังไม่มี assignment จาก Classroom — ไปที่{" "}
            <button onClick={() => navigate("/classroom")} style={{ color: "#2563eb", background: "transparent", border: 0, cursor: "pointer" }}>
              Classroom
            </button>{" "}
            เพื่อสร้าง แล้วหน้านี้จะดึงมาแสดงอัตโนมัติครับ
          </div>
        )}
      </main>
    </div>
  );
}
