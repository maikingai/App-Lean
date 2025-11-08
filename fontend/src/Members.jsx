// src/Members.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Members() {
  const navigate = useNavigate();

  // ----- demo data -----
  const [teachers, setTeachers] = useState([
    { id: "t1", name: "Thanchanok Konsuay", color: "#9CF19C", emoji: "🙂" },
  ]);
  const [students, setStudents] = useState([
    { id: "s1", name: "Keroro Sashimi", color: "#FFD166", emoji: "🟡" },
    { id: "s2", name: "Mami Poko", color: "#9BE1FF", emoji: "😊" },
  ]);

  // ----- pending list (เข้ามาใหม่จะมาอยู่ที่นี่ก่อน) -----
  // item: { id, role: 'teacher'|'student', name(email), color, emoji }
  const [pending, setPending] = useState([]);

  // ----- add / remove / approve -----
  const [showAdd, setShowAdd] = useState(false);
  const [roleAdd, setRoleAdd] = useState("student"); // 'teacher' | 'student'
  const [formEmail, setFormEmail] = useState("");

  const openAdd = (role) => {
    setRoleAdd(role);
    setFormEmail("");
    setShowAdd(true);
  };

  const submitAdd = (e) => {
    e?.preventDefault?.();
    const email = formEmail.trim();
    if (!email) return;
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) {
      alert("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }
    const obj = {
      id: "p" + cryptoRandom(),
      role: roleAdd,
      name: email,
      color: randomPastel(),
      emoji: "🙂",
    };
    setPending((v) => [obj, ...v]);   // -> ไปคิว Pending
    setShowAdd(false);
  };

  const approveItem = (id) => {
    setPending((curr) => {
      const it = curr.find((x) => x.id === id);
      if (!it) return curr;
      if (it.role === "teacher") setTeachers((v) => [...v, it]);
      else setStudents((v) => [...v, it]);
      return curr.filter((x) => x.id !== id);
    });
  };

  const rejectItem = (id) => {
    if (!confirm("Reject this request?")) return;
    setPending((v) => v.filter((x) => x.id !== id));
  };

  const removeItem = (role, id) => {
    if (!confirm("Delete this member?")) return;
    if (role === "teacher") setTeachers((v) => v.filter((x) => x.id !== id));
    else setStudents((v) => v.filter((x) => x.id !== id));
  };

  const studentCountLabel = useMemo(
    () => `${students.length} Student${students.length > 1 ? "s" : ""}`,
    [students.length]
  );

  return (
    <div className="wrap">
      <Style />

      <div className="container">
        {/* Top bar: Back + Title (title ตรงกลางคอนเทนเนอร์) */}
        <div className="topbar">
          <button className="backBtn" onClick={() => navigate(-1)} title="Back">
            ← Back
          </button>
          <div className="pageTitle">Members</div>
        </div>

        {/* Pending Section (ถ้ามีรายการ) */}
        {pending.length > 0 && (
          <Section
            title="Pending"
            right={<span className="muted">{pending.length} Request(s)</span>}
          >
            {pending.map((p) => (
              <Row key={p.id}>
                <Avatar color={p.color} emoji={p.emoji} />
                <span className="name">{p.name}</span>
                <span className="chip">{p.role === "teacher" ? "Teacher" : "Student"}</span>
                <div className="spacer" />
                <button className="btn small soft" onClick={() => rejectItem(p.id)}>
                  Reject
                </button>
                <button className="btn small primary" onClick={() => approveItem(p.id)}>
                  Approve
                </button>
              </Row>
            ))}
          </Section>
        )}

        {/* Teacher */}
        <Section
          title="Teacher"
          actionText="+ Add teacher"
          onAction={() => openAdd("teacher")}
        >
          {teachers.map((t) => (
            <Row key={t.id}>
              <Avatar color={t.color} emoji={t.emoji} />
              <span className="name">{t.name}</span>
              <div className="spacer" />
              <button
                className="link danger"
                onClick={() => removeItem("teacher", t.id)}
              >
                Remove
              </button>
            </Row>
          ))}
        </Section>

        {/* Student */}
        <Section
          title="Student"
          right={<span className="muted">{studentCountLabel}</span>}
          actionText="+ Add student"
          onAction={() => openAdd("student")}
        >
          {students.map((s) => (
            <Row key={s.id}>
              <Avatar color={s.color} emoji={s.emoji} />
              <span className="name">{s.name}</span>
              <div className="spacer" />
              <button
                className="link danger"
                onClick={() => removeItem("student", s.id)}
              >
                Remove
              </button>
            </Row>
          ))}
        </Section>
      </div>

      {/* Add modal */}
      {showAdd && (
        <>
          <div className="backdrop" onClick={() => setShowAdd(false)} />
          <form
            className="modal"
            onSubmit={submitAdd}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modalTitle">
              Add {roleAdd === "teacher" ? "Teacher" : "Student"}
            </div>
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              autoFocus
            />
            <div className="actions">
              <button
                type="button"
                className="btn soft"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn primary">
                Add to Pending
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

/* ---------- small components ---------- */
function Section({ title, right, children, actionText, onAction }) {
  return (
    <section className="section">
      <div className="sectionHead">
        <div className="title">{title}</div>
        <div className="right">
          {right}
          {onAction && (
            <button className="link" onClick={onAction} style={{ marginLeft: 12 }}>
              {actionText}
            </button>
          )}
        </div>
      </div>
      <div className="divider" />
      <div className="list">{children}</div>
    </section>
  );
}

function Row({ children }) {
  return <div className="row">{children}</div>;
}

function Avatar({ color = "#A3E887", emoji = "🙂" }) {
  return (
    <div className="avatar" style={{ background: color }}>
      <span style={{ fontSize: 18 }}>{emoji}</span>
    </div>
  );
}

/* ---------- utils ---------- */
function cryptoRandom() {
  try {
    return crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(0, 6);
  } catch {
    return Math.random().toString(36).slice(2, 8);
  }
}
function randomPastel() {
  const hues = [200, 230, 160, 280, 20, 120, 340];
  const h = hues[Math.floor(Math.random() * hues.length)];
  return `hsl(${h} 80% 80%)`;
}

/* ---------- styles ---------- */
function Style() {
  return (
    <style>{`
      :root{
        --bg:#97B5F5;
        --ink:#0f172a;
        --muted:#cbd5e1;
      }
      *{box-sizing:border-box}
      .wrap{
        min-height:100dvh;
        background:var(--bg);
        padding:24px 28px 60px;
        font-family:Inter,system-ui,Segoe UI,Arial,Helvetica,sans-serif;
        color:#fff
      }
      /* container กึ่งกลาง */
      .container{
        width:100%;
        max-width:860px;
        margin:0 auto;
      }

      /* Top bar */
      .topbar{
        display:flex;align-items:center;gap:12px;margin-bottom:14px
      }
      .backBtn{
        background:linear-gradient(180deg,#ffffff,#f7faff);
        border:1px solid #e5e7eb;border-radius:10px;padding:8px 12px;
        color:#0f172a;font-weight:800;cursor:pointer;
        box-shadow:0 8px 24px rgba(15,23,42,.08)
      }
      .pageTitle{
        margin-left:8px;
        font-size:22px;font-weight:800;color:#eaf2ff
      }

      /* Section headers */
      .section{margin-top:16px}
      .sectionHead{display:flex;align-items:center;justify-content:space-between}
      .title{font-weight:700;color:#eaf2ff}
      .right{display:flex;align-items:center;color:#eaf2ff}
      .muted{color:#eaf2ffcc;font-size:14px}
      .divider{height:1px;background:#c7d6ff3a;margin:8px 0 6px}

      /* List rows */
      .list{display:grid;gap:6px}
      .row{
        display:flex;align-items:center;gap:12px;padding:10px 0;color:#eaf2ff
      }
      .name{font-weight:600}
      .spacer{flex:1}
      .avatar{width:36px;height:36px;border-radius:999px;display:grid;place-items:center}
      .chip{
        font-size:12px;font-weight:800;padding:4px 10px;border-radius:999px;background:#e9f0ff;color:#1e293b
      }

      .link{background:transparent;border:0;color:#fff;text-decoration:underline;cursor:pointer;font-weight:700}
      .link.danger{color:#ffe2e2}
      .link:hover{opacity:.9}

      /* Buttons */
      .btn{height:36px;padding:0 14px;border-radius:10px;font-weight:800;border:0;cursor:pointer}
      .btn.small{height:30px;padding:0 10px;border-radius:8px}
      .btn.soft{background:#f7faff;border:1px solid #e5e7eb;color:#0f172a}
      .btn.primary{background:linear-gradient(180deg,#6366f1,#4f46e5);color:#fff;box-shadow:0 10px 26px rgba(79,70,229,.35)}

      /* Modal */
      .backdrop{position:fixed;inset:0;background:rgba(15,23,42,.35);backdrop-filter:blur(2px)}
      .modal{
        position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);
        width:420px;background:#fff;border-radius:16px;padding:18px;
        box-shadow:0 22px 60px rgba(15,23,42,.35)
      }
      .modalTitle{font-size:18px;font-weight:800;color:#111827;margin-bottom:10px}
      .input{width:100%;height:40px;border-radius:12px;border:1px solid #e5e7eb;padding:0 12px;outline:none}
      .actions{display:flex;gap:10px;justify-content:flex-end;margin-top:12px}

      @media (max-width:720px){
        .container{max-width:96%}
        .pageTitle{font-size:20px}
      }
    `}</style>
  );
}
