import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Storage schema
 */
const STUDENTS_KEY = "class_students";
const G_ASSIGN_KEY = "grade_assignments";
const G_QUIZ_KEY   = "grade_quizzes";

// ---------- helpers: load or seed ----------
function seedIfEmpty() {
  if (!localStorage.getItem(STUDENTS_KEY)) {
    const students = [
      { id: 1, name: "Keroro Sashimi", avatar: "🟣" },
      { id: 2, name: "Mami Poko",      avatar: "🟦" },
    ];
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  }
  if (!localStorage.getItem(G_ASSIGN_KEY)) {
    const assigns = [{ id: "a_matrix", title: "Matrix", max: 10, scores: { 1: 10, 2: 10 } }];
    localStorage.setItem(G_ASSIGN_KEY, JSON.stringify(assigns));
  }
  if (!localStorage.getItem(G_QUIZ_KEY)) {
    const quizzes = [{ id: "q_matrix", title: "Matrix", max: 10, scores: { 1: 8, 2: 7 } }];
    localStorage.setItem(G_QUIZ_KEY, JSON.stringify(quizzes));
  }
}
function lsParse(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key) || "null"); return v ?? fallback; }
  catch { return fallback; }
}

export default function Grades() {
  const navigate = useNavigate();
  seedIfEmpty();

  const students   = lsParse(STUDENTS_KEY, []);
  const assignSets = lsParse(G_ASSIGN_KEY, []);
  const quizSets   = lsParse(G_QUIZ_KEY,   []);

  const assignSubtitle = assignSets[0]?.title || "All";
  const quizSubtitle   = quizSets[0]?.title   || "All";

  const calcOutOf10 = (sets, sid) => {
    if (!sets.length) return 0;
    let sum = 0, cnt = 0;
    for (const s of sets) {
      const got = Number(s.scores?.[sid] ?? 0);
      const max = Number(s.max || 10);
      sum += max ? (got / max) * 10 : 0;
      cnt++;
    }
    return +(sum / cnt).toFixed(2);
  };

  const rows = useMemo(() => (
    students.map(st => ({
      id: st.id,
      name: st.name,
      avatar: st.avatar || "🙂",
      assign10: calcOutOf10(assignSets, st.id),
      quiz10:   calcOutOf10(quizSets,   st.id),
    }))
  // eslint-disable-next-line
  ), [JSON.stringify(students), JSON.stringify(assignSets), JSON.stringify(quizSets)]);

  const classAvg = useMemo(() => {
    if (!rows.length) return { assign10: 0, quiz10: 0 };
    const n = rows.length;
    return {
      assign10: +(rows.reduce((t, r) => t + r.assign10, 0) / n).toFixed(2),
      quiz10:   +(rows.reduce((t, r) => t + r.quiz10,   0) / n).toFixed(2),
    };
  }, [rows]);

  return (
    <div className="g-wrap">
      <Style />

      {/* Top bar: Back (left) + Grades centered */}
      <div className="g-topbar">
        <button className="g-back" onClick={() => navigate("/classroom")} aria-label="Back to Classroom">
          ← Back
        </button>
        <div className="g-title">Grades</div>
        <div className="g-spacer" />
      </div>

      <div className="g-tableCard">
        <table className="g-table">
          <colgroup>
            <col style={{ width: "45%" }} />
            <col style={{ width: "27.5%" }} />
            <col style={{ width: "27.5%" }} />
          </colgroup>

          <thead>
            <tr>
              <th></th>
              <th className="g-th">
                <div>Assignment</div>
                <div className="g-sub">{assignSubtitle}</div>
              </th>
              <th className="g-th">
                <div>Quiz</div>
                <div className="g-sub">{quizSubtitle}</div>
              </th>
            </tr>
            <tr className="g-subrow">
              <th></th>
              <th className="g-sub">Out of 10</th>
              <th className="g-sub">Out of 10</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="g-name g-avg">Class average</td>
              <td className="g-num">{fmt(classAvg.assign10)}</td>
              <td className="g-num">{fmt(classAvg.quiz10)}</td>
            </tr>

            {rows.map(r => (
              <tr key={r.id}>
                <td className="g-name">
                  <span className="g-avatar" aria-hidden>{r.avatar}</span>
                  {r.name}
                </td>
                <td className="g-num">{fmt(r.assign10)}</td>
                <td className="g-num">{fmt(r.quiz10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function fmt(n){ return (Number.isFinite(n) ? n : 0).toString().replace(/\.00$/, ""); }

function Style(){
  return (
    <style>{`
      :root{
        --bg:#95B5F5;
        --panel:#A6C0FA;
        --white:#ffffff;
        --ink:#27406d;
        --muted:#6b7aa6;
        --line:#b9ccfb;
        --radius:18px;
      }
      *{box-sizing:border-box}
      .g-wrap{min-height:100dvh;background:#98b6f6;padding:26px;font-family:Inter,system-ui,Segoe UI,Arial,Helvetica,sans-serif}

      /* Topbar (Back + centered title) */
      .g-topbar{
        display:grid;
        grid-template-columns:auto 1fr auto;
        align-items:center;
        margin:4px 0 18px;
      }
      .g-back{
        background:#cfe0ff;border:0;color:#27406d;
        padding:8px 12px;border-radius:12px;
        font-weight:700;cursor:pointer;
        box-shadow:0 2px 0 rgba(0,0,0,.06);
      }
      .g-title{
        justify-self:center;
        color:#ffffff;font-weight:800;font-size:18px;
        letter-spacing:.2px;
      }
      .g-spacer{width:80px} /* ให้ title อยู่กลางเป๊ะ */

      /* Card/Table */
      .g-tableCard{
        background:#9db9f7;border-radius:22px;padding:12px;
        border:1.5px solid var(--line);box-shadow:0 3px 0 rgba(0,0,0,.07);
      }
      table{width:100%;border-collapse:separate;border-spacing:0}
      thead th{
        background:#cfe0ff;color:var(--ink);text-align:center;
        padding:14px 10px;font-weight:800;border-top-left-radius:14px;border-top-right-radius:14px;
        border-bottom:2px solid var(--line);
      }
      .g-th{border-left:2px solid var(--line)}
      .g-sub{font-size:12px;color:#445e95}
      .g-subrow th{background:#e6efff;color:#435b92;font-weight:700;border-bottom:2px solid var(--line)}

      tbody tr{background:#ffffff}
      tbody td{
        padding:16px 14px;color:var(--ink);
        border-bottom:2px solid var(--line);border-left:2px solid var(--line);
      }
      tbody tr:first-child td:first-child{border-top-left-radius:16px}
      tbody tr:last-child td{border-bottom-left-radius:16px;border-bottom-right-radius:16px}
      tbody td:first-child{border-left:none}

      .g-name{display:flex;align-items:center;gap:10px}
      .g-name.g-avg{font-weight:700}
      .g-avatar{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#ffe4f1;font-size:16px}
      .g-num{text-align:center;font-weight:700}

      @media (max-width:720px){
        .g-title{font-size:16px}
        .g-back{padding:6px 10px}
      }
    `}</style>
  );
}
