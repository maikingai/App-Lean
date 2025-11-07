import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./teacher-home.css";

export default function ClassroomAssignments() {
  const navigate = useNavigate();

  // โปรไฟล์ / Logout (เหมือนหน้าอื่น ๆ)
  const [showProfile, setShowProfile] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("role");
    setShowProfile(false);
    navigate("/login");
  };

  const IconBtn = ({ title, onClick, children }) => (
    <button className="th-iconbtn" title={title} aria-label={title} onClick={onClick}>
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  );

  // ตัวอย่างข้อมูล Assignment
  const items = [
    {
      id: 42,
      title: "Matrix",
      subtitle: "Math - Due 10 Oct. 2025, 23:59",
      stats: { turnedIn: 0, assigned: 0, graded: 0 },
    },
    {
      id: 41,
      title: "Matrix",
      subtitle: "Math - Reviewed",
      stats: { turnedIn: 2, assigned: 2, graded: 2 },
    },
  ];

  const Row = ({ item }) => (
    <div
      className="th-card"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        borderRadius: 16,
        cursor: "pointer",
      }}
      onClick={() => navigate(`/assignment/${item.id}`)}
    >
      {/* ซ้าย: ไอคอน + ชื่อ + subtitle */}
      <div style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 10, alignItems: "center" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "#E9F0FF",
            display: "grid",
            placeItems: "center",
          }}
        >
          📄
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#0f172a" }}>{item.title}</div>
          <div style={{ fontSize: 12, color: "#6b7c93", marginTop: 2 }}>{item.subtitle}</div>
        </div>
      </div>

      {/* ขวา: คอลัมน์ตัวเลข + เมนู */}
      <div
        style={{
          display: "grid",
          gridAutoFlow: "column",
          gap: 28,
          alignItems: "center",
          justifyItems: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <StatBlock label="Turned in" value={item.stats.turnedIn} />
        <StatBlock label="Assigned" value={item.stats.assigned} />
        <StatBlock label="Graded" value={item.stats.graded} />

        <button
          title="more"
          style={{ border: 0, background: "transparent", fontSize: 18, cursor: "pointer" }}
          onClick={() => console.log("menu for", item.id)}
        >
          ⋯
        </button>
      </div>
    </div>
  );

  const StatBlock = ({ value, label }) => (
    <div style={{ textAlign: "center", minWidth: 40 }}>
      <div style={{ color: "#0f172a", fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#6b7c93" }}>{label}</div>
    </div>
  );

  return (
    <div className="th-root">
      {/* ===== Sidebar ===== */}
      <aside className="th-sidebar">
        <div className="th-sidebar-top">
          <IconBtn title="Home" onClick={() => navigate("/teacher")} />
          <IconBtn title="Calendar" onClick={() => console.log("calendar")} />
          <IconBtn title="Library" onClick={() => console.log("library")} />
          <IconBtn title="Add" onClick={() => console.log("add")}>
            <span className="th-plus">＋</span>
          </IconBtn>
        </div>
        <div className="th-sidebar-bottom">
          <IconBtn title="Settings" onClick={() => console.log("settings")} />
        </div>
      </aside>

      {/* ===== Main ===== */}
      <main className="th-main th-main-rel">
        {/* Topbar: ใช้โปรไฟล์ขวาบน */}
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

        {/* Tabs */}
        <div style={{ display: "flex", gap: 18, margin: "6px 0 16px" }}>
          {[
            ["classroom", "Classroom"],
            ["assignments", "Assignments"],
            ["members", "Members"],
            ["grades", "Grades"],
            ["dashboard", "Dashboard"],
          ].map(([key, label]) => {
            const active = key === "assignments";
            return (
              <button
                key={key}
                style={{
                  background: "transparent",
                  border: 0,
                  padding: "8px 4px",
                  fontWeight: 600,
                  color: active ? "#ffffff" : "#e7eefc",
                  borderBottom: `3px solid ${active ? "#ffffff" : "transparent"}`,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ปุ่ม + Create */}
        <div style={{ marginBottom: 14 }}>
          <button
            className="th-btn-save"
            style={{
              background: "#ffffff",
              color: "#1f2937",
              border: "0",
              padding: "8px 16px",
              borderRadius: 999,
              boxShadow: "0 6px 14px rgba(0,0,0,.08)",
            }}
            onClick={() => console.log("create assignment")}
          >
            + Create
          </button>
        </div>

        {/* รายการ Assignments */}
        <div style={{ display: "grid", gap: 10, width: "96%" }}>
          {items.map((it) => (
            <Row key={it.id} item={it} />
          ))}
        </div>
      </main>
    </div>
  );
}
