// src/AssignmentTeacher.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./teacher-home.css";

export default function AssignmentTeacher() {
  const navigate = useNavigate();

  // ---------- profile ----------
  const [showProfile, setShowProfile] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("role");
    setShowProfile(false);
    navigate("/login");
  };

  // ---------- data (demo) ----------
  const [items] = useState([
    {
      id: "a1",
      title: "Matrix",
      subtitle: "Math • Due 10 Oct. 2025, 23:59",
      turnedIn: 12,
      assigned: 25,
      graded: 6,
      status: "assigned",
    },
    {
      id: "a2",
      title: "Matrix (Quiz)",
      subtitle: "Math • Reviewed",
      turnedIn: 25,
      assigned: 25,
      graded: 25,
      status: "reviewed",
    },
  ]);

  // ---------- ui helpers ----------
  const IconBtn = ({ title, onClick, children }) => (
    <button className="th-iconbtn" title={title} aria-label={title} onClick={onClick}>
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  );

  const Stat = ({ value, label }) => (
    <div style={{ textAlign: "center", minWidth: 56 }}>
      <div style={{ color: "#0f172a", fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#6b7c93" }}>{label}</div>
    </div>
  );

  // แท็บ Assignments ให้ไปที่หน้า Assignmentpost ของ Classroom
  const goAssignments = () => navigate("/classroom/assignments");

  // ลิ้งแท็บอื่นไปที่หน้า Classroom พร้อม hash (ปลอดภัยแม้ยังไม่มี route แยก)
  const goClassroom = () => navigate("/classroom");
  const goMembers   = () => navigate("/classroom#members");
  const goGrades    = () => navigate("/classroom#grades");
  const goDashboard = () => navigate("/classroom#dashboard");

  const Row = ({ a }) => {
    const [openMenu, setOpenMenu] = useState(false);
    return (
      <div
        className="th-card"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          padding: "12px 16px",
          borderRadius: 16,
          width: "100%",
          cursor: "pointer",
          minHeight: 72,
        }}
        onClick={() => navigate(`/assignment/${a.id}`)}
      >
        {/* left: icon + text */}
        <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 12, alignItems: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "#E9F0FF",
              display: "grid",
              placeItems: "center",
              color: "#6b7c93",
              fontSize: 16,
            }}
          >
            📄
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>{a.title}</div>
            <div style={{ fontSize: 12, color: "#6b7c93", marginTop: 4 }}>{a.subtitle}</div>
          </div>
        </div>

        {/* right: stats + kebab */}
        <div
          style={{
            display: "grid",
            gridAutoFlow: "column",
            alignItems: "center",
            gap: 28,
            justifyItems: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Stat value={a.turnedIn} label="Turned in" />
          <Stat value={a.assigned} label="Assigned" />
          <Stat value={a.graded} label="Graded" />
          <div style={{ position: "relative" }}>
            <button
              title="more"
              onClick={() => setOpenMenu((v) => !v)}
              style={{ border: 0, background: "transparent", fontSize: 18, cursor: "pointer", lineHeight: 1 }}
            >
              ⋮
            </button>
            {openMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 22,
                  background: "#fff",
                  borderRadius: 10,
                  boxShadow: "0 10px 26px rgba(15,23,42,.18)",
                  overflow: "hidden",
                  minWidth: 140,
                  zIndex: 10,
                }}
              >
                <button className="th-add-item" style={{ width: "100%", textAlign: "left" }}>
                  Edit
                </button>
                <button className="th-add-item" style={{ width: "100%", textAlign: "left", color: "#b91c1c" }}>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="th-root">
      {/* ===== Sidebar (ลิ้ง 4 ปุ่มตามที่กำหนด) ===== */}
      <aside className="th-sidebar">
        <div className="th-sidebar-top">
          <IconBtn title="Home" onClick={() => navigate("/teacher")} />
          <IconBtn title="Calendar" onClick={() => navigate("/calendar")} />
          <IconBtn title="Quiz" onClick={() => navigate("/quiz")} />
          <IconBtn title="Assignment Review" onClick={() => navigate("/assignments/review")} />
        </div>
      </aside>

      {/* ===== Main (กำหนด maxWidth ให้ยาวพอดีแนวโปรไฟล์) ===== */}
      <main className="th-main" style={{ width: "100%", maxWidth: "1120px", paddingRight: 24 }}>
        {/* Topbar (avatar right) */}
        <div className="th-topbar" style={{ justifyContent: "flex-end" }}>
          <button className="th-avatar" title="profile" onClick={() => setShowProfile((v) => !v)}>
            🙂
          </button>
        </div>

        {showProfile && (
          <>
            <div className="th-profile-backdrop" onClick={() => setShowProfile(false)} />
            <div className="th-profile-pop">
              <div className="th-profile-title">Profile</div>
              <div className="th-profile-row">Role: Teacher</div>
              <button className="th-btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}

        {/* Tabs (Assignments active + underline) */}
        <div
          style={{
            display: "flex",
            gap: 22,
            alignItems: "center",
            marginBottom: 14,
            width: "100%",
            maxWidth: "980px",
          }}
        >
          {[
            ["Classroom", goClassroom],
            ["Assignments", goAssignments], // หน้านี้
            ["Members", goMembers],
            ["Grades", goGrades],
            ["Dashboard", goDashboard],
          ].map(([label, onClick]) => {
            const active = label === "Assignments";
            return (
              <button
                key={label}
                onClick={onClick}
                style={{
                  background: "transparent",
                  border: 0,
                  padding: "8px 6px",
                  fontWeight: 700,
                  color: active ? "#1f2937" : "#2c3e50",
                  borderBottom: `3px solid ${active ? "#1f2937" : "transparent"}`,
                  cursor: "pointer",
                }}
                title={label}
              >
                {label}
              </button>
            );
          })}

          {/* + Create */}
          <button
            style={{
              marginLeft: "auto",
              height: 36,
              padding: "0 14px",
              borderRadius: 999,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#1f2937",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => console.log("Create clicked")}
            title="Create"
          >
            + Create
          </button>
        </div>

        {/* List container ให้ยาวพอดีกับแนวโปรไฟล์ */}
        <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: "980px" }}>
          {items.map((a) => (
            <Row key={a.id} a={a} />
          ))}
        </div>
      </main>
    </div>
  );
}
