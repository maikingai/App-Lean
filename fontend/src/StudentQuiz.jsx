// src/StudentQuiz.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./teacher-home.css"; // ใช้ชุดสไตล์เดียวกัน
import StudentSidebar from './StudentSidebar'
import UserProfile from './UserProfile'

const COIN_KEY = "student_coins";
const CART_KEY = "student_cart_v1";

export default function StudentQuiz() {
  const navigate = useNavigate();

  const C = useMemo(() => ({
    ring: "0 0 0 3px rgba(15,176,160,.22)",
    pill: { borderRadius: 999, padding: "6px 10px", fontWeight: 800 },
  }), []);

  // profile handled by shared component

  // ===== Coins (เหมือน StudentHome) =====
  const [coins, setCoins] = useState(() => {
    const n = Number(localStorage.getItem(COIN_KEY));
    if (!Number.isFinite(n)) {
      localStorage.setItem(COIN_KEY, "5000");
      return 5000;
    }
    return n;
  });
  useEffect(() => localStorage.setItem(COIN_KEY, String(coins)), [coins]);

  // ===== Cart badge =====
  const [cartCount, setCartCount] = useState(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(arr) ? arr.length : 0;
    } catch { return 0; }
  });
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CART_KEY) {
        try {
          const arr = JSON.parse(e.newValue || "[]");
          setCartCount(Array.isArray(arr) ? arr.length : 0);
        } catch { setCartCount(0); }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ===== Quizzes (localStorage ถ้ามี) =====
  const [quizzes, setQuizzes] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("quizzes") || "null");
      if (Array.isArray(saved) && saved.length) return saved;
    } catch {}
    return [
      { id: "q1", title: "Exercise Review 1", color: "#F7F859" },
      { id: "q2", title: "Exercise Review 2", color: "#F28C28" },
      { id: "q3", title: "Exercise Review 3", color: "#9C7BFF" },
    ];
  });
  useEffect(() => localStorage.setItem("quizzes", JSON.stringify(quizzes)), [quizzes]);

  // ===== UI helpers =====
  const IconBtn = ({ title, onClick, children }) => (
    <button className="th-iconbtn" title={title} aria-label={title} onClick={onClick}>
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  );

  const Row = ({ item }) => (
    <div
      onClick={() => navigate(`/student/quiz/do/${item.id}`)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        background: item.color,
        borderRadius: 10,
        padding: "12px 14px",
        cursor: "pointer",
      }}
    >
      <div style={{ fontWeight: 600, color: "#0f172a" }}>{item.title}</div>
      <div
        style={{
          width: 42,
          height: 26,
          background: "#8BF79A",
          borderRadius: 8,
          display: "grid",
          placeItems: "center",
          color: "#fff",
          fontWeight: 900,
          pointerEvents: "none",
        }}
      >
        ▶
      </div>
    </div>
  );

  return (
    <div className="th-root th-root-rel" style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 16 }}>
      <StudentSidebar />

      {/* ===== Main ===== */}
      <main className="th-main th-main-rel" style={{ paddingRight: 24, position: "relative" }}>
        {/* Topbar (Coins + Profile เหมือน StudentHome) */}
        <div className="th-topbar" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
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
        

        {/* หัวข้อ */}
        <h2 style={{ margin: "6px 0 10px", color: "#fff", letterSpacing: 0.5 }}>QUIZ</h2>

        {/* รายการควิซ */}
        <div style={{ display: "grid", gap: 12 }}>
          {quizzes.map((q) => (
            <Row key={q.id} item={q} />
          ))}
        </div>
      </main>
    </div>
  );
}
