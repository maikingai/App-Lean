import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./teacher-home.css";

export default function AssignmentReview() {
  const navigate = useNavigate();

  // ---------- demo data ----------
  // status: assigned | overdue | completed
  // due: ISO date or "" (no due)
  const demo = [
    { id: "a1", classId: 1, className: "Math M4/1", title: "Matrix P1", status: "assigned", due: "2025-10-10T23:59:00Z", turnedIn: 0, assigned: 25, graded: 0 },
    { id: "a2", classId: 1, className: "Math M4/1", title: "Quiz: Matrix", status: "completed", due: "2025-10-02T09:00:00Z", turnedIn: 25, assigned: 25, graded: 25 },
    { id: "a3", classId: 2, className: "Math M4/2", title: "Vector HW", status: "assigned", due: "", turnedIn: 0, assigned: 30, graded: 0 },
    { id: "a4", classId: 2, className: "Math M4/2", title: "Determinant Lab", status: "overdue", due: "2025-10-01T16:00:00Z", turnedIn: 10, assigned: 30, graded: 4 },
  ];

  // ---------- state ----------
  const [tab, setTab] = useState("assigned"); // assigned | overdue | completed
  const [classFilter, setClassFilter] = useState("all");

  const classes = useMemo(() => {
    const s = new Set(demo.map(d => `${d.classId}|${d.className}`));
    return Array.from(s).map(v => {
      const [id, name] = v.split("|");
      return { id: Number(id), name };
    });
  }, []);

  // ---------- utils ----------
  const now = new Date();
  const startOfWeek = (() => {
    const d = new Date(now);
    const day = d.getDay(); // 0 Sun - 6 Sat
    const diff = (day === 0 ? -6 : 1) - day; // make Monday as start
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  const endOfWeek = (() => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + 7);
    return d;
  })();
  const endOfNextWeek = (() => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + 14);
    return d;
  })();

  const byTab = demo.filter(it => it.status === tab);
  const byClass = classFilter === "all" ? byTab : byTab.filter(it => it.classId === Number(classFilter));

  const buckets = {
    noDue: [],
    thisWeek: [],
    nextWeek: [],
    later: [],
  };

  byClass.forEach(it => {
    if (!it.due) {
      buckets.noDue.push(it);
      return;
    }
    const due = new Date(it.due);
    if (due < startOfWeek) {
      // สำหรับ tab "overdue" เราก็ยังจัดกลุ่มให้โชว์อยู่ใน thisWeek เพื่อให้ง่ายต่อการมอง
    }
    if (due >= startOfWeek && due < endOfWeek) buckets.thisWeek.push(it);
    else if (due >= endOfWeek && due < endOfNextWeek) buckets.nextWeek.push(it);
    else buckets.later.push(it);
  });

  const IconBtn = ({ title, onClick, children }) => (
    <button className="th-iconbtn" title={title} aria-label={title} onClick={onClick}>
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  );

  const Section = ({ title, items }) => {
    const [open, setOpen] = useState(true);
    return (
      <div className="th-card" style={{ borderRadius: 16, padding: 0, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            padding: "12px 16px",
            cursor: "pointer",
            background: "transparent",
          }}
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
            {items.length === 0 && (
              <div style={{ color: "#6b7c93", fontSize: 14, padding: "6px 4px" }}>No items</div>
            )}
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
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        borderRadius: 14,
        cursor: "pointer",
        padding: "10px 12px",
      }}
      onClick={onOpen}
    >
      <div style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 10, alignItems: "center" }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "#E9F0FF", display: "grid", placeItems: "center" }}>📄</div>
        <div>
          <div style={{ fontWeight: 600, color: "#0f172a" }}>{item.title}</div>
          <div style={{ fontSize: 12, color: "#6b7c93", marginTop: 2 }}>
            {item.className}
            {item.due ? ` • Due ${new Date(item.due).toLocaleDateString()} ${new Date(item.due).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : " • No due date"}
          </div>
        </div>
      </div>

      <div
        style={{ display: "grid", gridAutoFlow: "column", gap: 24, alignItems: "center", justifyItems: "center" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Stat label="Turned in" value={item.turnedIn} />
        <Stat label="Assigned" value={item.assigned} />
        <Stat label="Graded" value={item.graded} />
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

  // ---------- UI ----------
  return (
    <div className="th-root">
      {/* Sidebar */}
      <aside className="th-sidebar">
        <div className="th-sidebar-top">
          <IconBtn title="Home" onClick={() => navigate("/teacher")} />
          <IconBtn title="Calendar" onClick={() => navigate("/calendar")} />
          {/* 🔁 เดิมเป็น Library → เปลี่ยนเป็น Assignment */}
          <IconBtn title="Assignment" onClick={() => navigate("/assignments")} />
          <IconBtn title="Add" onClick={() => console.log("add")}><span className="th-plus">＋</span></IconBtn>
        </div>
        <div className="th-sidebar-bottom">
          <IconBtn title="Settings" onClick={() => console.log("settings")} />
        </div>
      </aside>

      {/* Main */}
      <main className="th-main">
        {/* Topbar (เหรียญ/โปรไฟล์—ใช้สไตล์เดียวกับระบบเดิม) */}
        <div className="th-topbar" />

        {/* Tabs: Assigned / Overdue / Completed */}
        <div style={{ display: "flex", gap: 18, marginBottom: 16 }}>
          {["assigned", "overdue", "completed"].map(k => (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                background: "transparent",
                border: 0,
                padding: "8px 4px",
                fontWeight: 600,
                color: tab === k ? "#1f2937" : "#2c3e50",
                borderBottom: `3px solid ${tab === k ? "#ffffff" : "transparent"}`,
                cursor: "pointer",
              }}
            >
              {k === "assigned" ? "Assigned" : k === "overdue" ? "Overdue" : "Completed"}
            </button>
          ))}
        </div>

        {/* Filter + secondary tabs (Assignment / Review assignment) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", marginBottom: 10 }}>
          <select
            className="th-input"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            style={{ width: 240, height: 36, borderRadius: 999 }}
          >
            <option value="all">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div style={{ display: "flex", gap: 24 }}>
            <button style={{ background: "transparent", border: 0, color: "#111", textDecoration: "underline", cursor: "pointer" }}>
              Assignment
            </button>
            <button style={{ background: "transparent", border: 0, color: "#6b7c93", cursor: "pointer" }}>
              Review assignment
            </button>
          </div>
        </div>

        {/* Buckets */}
        <div style={{ display: "grid", gap: 12, width: "96%" }}>
          <Section title="No due date" items={buckets.noDue} />
          <Section title="This week"   items={buckets.thisWeek} />
          <Section title="Next week"   items={buckets.nextWeek} />
          <Section title="Later"       items={buckets.later} />
        </div>
      </main>
    </div>
  );
}
