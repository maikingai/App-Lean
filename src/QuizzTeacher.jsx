// QuizzTeacher.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./teacher-home.css";

export default function QuizzTeacher() {
  const navigate = useNavigate();
  const location = useLocation();

  // ===== Profile / Logout =====
  const [showProfile, setShowProfile] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("role");
    setShowProfile(false);
    navigate("/login");
  };

  // ===== Data (โหลด/เซฟ localStorage) =====
  const [quizzes, setQuizzes] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("quizzes") || "null");
      if (Array.isArray(saved) && saved.length) return saved;
    } catch {}
    return [{ id: "q1", title: "Exercise Review 1" }];
  });

  useEffect(() => {
    localStorage.setItem("quizzes", JSON.stringify(quizzes));
  }, [quizzes]);

  // รับผลจาก QuizManage แล้วเติมรายการใหม่ (สีเหลือง)
  useEffect(() => {
    const s = location.state;
    if (s?.justSaved) {
      const title = (s.headline || "Untitled quiz").trim();
      setQuizzes((prev) => {
        const exists = prev.some((q) => q.id === s.quizId);
        return exists
          ? prev.map((q) => (q.id === s.quizId ? { ...q, title } : q))
          : [{ id: s.quizId, title }, ...prev];
      });
      navigate("/quiz", { replace: true, state: null });
    }
  }, [location.state, navigate]);

  // เมนู ⋮
  const [menuFor, setMenuFor] = useState(null);
  const menuRef = useRef(null);
  useEffect(() => {
    const onClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuFor(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // ไปหน้า manage
  const openManage = (id) => navigate(`/quiz/${id}`);

  // เพิ่มควิซ
  const handleAdd = () => {
    const newId = `q${Date.now()}`;
    openManage(newId);
  };

  // เปลี่ยนชื่อควิซ
  const handleEdit = (id) => {
    const q = quizzes.find((x) => x.id === id);
    const name = window.prompt("Quiz title", q?.title ?? "");
    if (name != null && name.trim() !== "") {
      setQuizzes((prev) =>
        prev.map((x) => (x.id === id ? { ...x, title: name.trim() } : x))
      );
    }
    setMenuFor(null);
  };

  // ลบควิซ
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const openDelete = (id) => {
    setConfirm({ open: true, id });
    setMenuFor(null);
  };
  const doDelete = () => {
    setQuizzes((prev) => prev.filter((x) => x.id !== confirm.id));
    setConfirm({ open: false, id: null });
  };

  // ปุ่มไอคอน (สไตล์เดียวกับ TeacherHome)
  const IconBtn = ({ title, onClick, children }) => (
    <button
      className="th-iconbtn"
      title={title}
      aria-label={title}
      onClick={onClick}
    >
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  );

  // แถวควิซ
  const Row = ({ item }) => (
    <div
      onClick={() => openManage(item.id)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        background: "#FFF36A",
        borderRadius: 10,
        padding: "10px 12px",
        cursor: "pointer",
      }}
    >
      <div style={{ fontWeight: 600, color: "#0f172a" }}>{item.title}</div>

      <div style={{ position: "relative" }}>
        <button
          title="more"
          onClick={(e) => {
            e.stopPropagation();
            setMenuFor((v) => (v === item.id ? null : item.id));
          }}
          style={{
            border: 0,
            background: "transparent",
            fontSize: 18,
            padding: "4px 6px",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ⋮
        </button>

        {menuFor === item.id && (
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 28,
              right: 0,
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 8px 24px rgba(15,23,42,.15)",
              overflow: "hidden",
              minWidth: 140,
              zIndex: 20,
            }}
          >
            <button onClick={() => handleEdit(item.id)} style={menuItemStyle}>
              ✏️ Edit
            </button>
            <button
              onClick={() => openDelete(item.id)}
              style={{ ...menuItemStyle, color: "#b91c1c" }}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="th-root th-root-rel"
      style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 16 }}
    >
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
      <main className="th-main" style={{ paddingRight: 24, position: "relative" }}>
        {/* Topbar */}
        <div
          className="th-topbar"
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <button
            className="th-avatar"
            title="profile"
            onClick={() => setShowProfile((v) => !v)}
          >
            🙂 
          </button>
        </div>

        {/* Profile popover */}
        {showProfile && (
          <>
            <div
              onClick={() => setShowProfile(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15,23,42,.35)",
                zIndex: 30,
              }}
            />
            <div
              style={{
                position: "fixed",
                right: 20,
                top: 56,
                background: "#fff",
                borderRadius: 10,
                boxShadow: "0 10px 30px rgba(15,23,42,.18)",
                padding: 12,
                zIndex: 40,
                minWidth: 180,
              }}
            >
              <div className="th-profile-title">Profile</div>
              <div className="th-profile-row">Role: Teacher</div>
              <button className="th-btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}

        <h2 style={{ margin: "6px 0 10px", color: "#0f172a" }}>QUIZ</h2>

        {/* ปุ่ม + แถบเทา */}
        <button
          onClick={handleAdd}
          title="Add new quiz"
          style={{
            width: "100%",
            height: 40,
            borderRadius: 10,
            background: "#D3D6DD",
            border: 0,
            cursor: "pointer",
            fontSize: 18,
            marginBottom: 12,
          }}
        >
          ➕
        </button>

        {/* รายการควิซ */}
        <div style={{ display: "grid", gap: 12 }}>
          {quizzes.map((q) => (
            <Row key={q.id} item={q} />
          ))}
        </div>
      </main>

      {/* Modal Delete */}
      {confirm.open && (
        <>
          <div
            onClick={() => setConfirm({ open: false, id: null })}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,.35)",
              zIndex: 45,
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              inset: 0,
              display: "grid",
              placeItems: "center",
              zIndex: 50,
              pointerEvents: "none",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 360,
                borderRadius: 20,
                background: "#98B7FF",
                boxShadow: "0 12px 40px rgba(15,23,42,.3)",
                overflow: "hidden",
                pointerEvents: "auto",
              }}
            >
              <div
                style={{
                  padding: 22,
                  textAlign: "center",
                  color: "#0f172a",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  Are you sure you want to delete this quiz?
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                }}
              >
                <button
                  onClick={() => setConfirm({ open: false, id: null })}
                  style={modalBtn("white")}
                >
                  Cancel
                </button>
                <button onClick={doDelete} style={modalBtn("#E46E6E", "#fff")}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ===== helpers ===== */
const menuItemStyle = {
  width: "100%",
  padding: "8px 10px",
  background: "transparent",
  border: 0,
  textAlign: "left",
  cursor: "pointer",
  fontSize: 14,
};

function modalBtn(bg, color = "#111827") {
  return {
    background: bg,
    color,
    border: 0,
    padding: "12px 0",
    fontWeight: 700,
    cursor: "pointer",
  };
}
