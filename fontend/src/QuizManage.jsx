// QuizManage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./teacher-home.css";

export default function QuizManage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  /* ===== storage helpers (พร้อมต่อ backend ภายหลัง) ===== */
  const STORE_KEY = "quizStore";
  const readStore = () => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); }
    catch { return {}; }
  };
  const writeStore = (obj) => localStorage.setItem(STORE_KEY, JSON.stringify(obj));

  /* ===== small utils ===== */
  const cryptoRandom = () => {
    try { return crypto.getRandomValues(new Uint32Array(1))[0].toString(36); }
    catch { return Math.random().toString(36).slice(2); }
  };

  /* ===== model ===== */
  const newAnswer = (i) => ({
    id: `a${cryptoRandom()}`,
    text: `Answer ${i}`,
    isCorrect: i === 1,
  });
  const newQuestion = (i) => ({
    id: `q${cryptoRandom()}`,
    title: `Quiz ${i}`,
    question: "",
    mediaUrl: "",
    answers: [1, 2, 3, 4].map((n) => newAnswer(n)),
  });

  const [headline, setHeadline] = useState("Enter your headline");
  const [pages, setPages] = useState([newQuestion(1), newQuestion(2)]);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = pages[activeIndex];

  const [dirty, setDirty] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [warn, setWarn] = useState("");

  /* ===== preload: ถ้ามีควิซเก่าให้โหลดมาแก้ได้ ===== */
  useEffect(() => {
    const store = readStore();
    const doc = store[quizId];
    if (doc) {
      setHeadline(doc.headline || "Enter your headline");
      setPages(Array.isArray(doc.pages) && doc.pages.length ? doc.pages : [newQuestion(1), newQuestion(2)]);
      setActiveIndex(0);
      setDirty(false);
    }
  }, [quizId]);

  /* ===== actions ===== */
  const setPage = (idx, patch) => {
    setPages((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
    setDirty(true);
  };

  const addPage = () => {
    setPages((prev) => [...prev, newQuestion(prev.length + 1)]);
    setActiveIndex(pages.length);
    setDirty(true);
  };

  const removePage = (idx) => {
    if (pages.length <= 1) return;
    const next = pages.filter((_, i) => i !== idx);
    setPages(next);
    setActiveIndex(Math.max(0, idx - 1));
    setDirty(true);
  };

  const setCorrect = (idx) => {
    setPage(activeIndex, {
      answers: active.answers.map((a, i) => ({ ...a, isCorrect: i === idx })),
    });
  };

  const changeAnswerText = (idx, text) => {
    setPage(activeIndex, {
      answers: active.answers.map((a, i) => (i === idx ? { ...a, text } : a)),
    });
  };

  /* ===== media upload ===== */
  const fileInputRef = useRef(null);
  const onPickMedia = () => fileInputRef.current?.click();
  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPage(activeIndex, { mediaUrl: url });
  };
  const clearMedia = () => setPage(activeIndex, { mediaUrl: "" });

  /* ===== validation ===== */
  const validate = () => {
    if (!headline.trim()) return "กรุณากรอกหัวข้อ (Headline)";
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      if (!p.question.trim()) return `ข้อที่ ${i + 1}: กรุณากรอกคำถาม`;
      if (!p.answers.some((a) => a.isCorrect)) return `ข้อที่ ${i + 1}: ต้องมีคำตอบที่ถูกอย่างน้อย 1 ตัวเลือก`;
      if (p.answers.some((a) => !a.text.trim())) return `ข้อที่ ${i + 1}: กรุณากรอกข้อความให้ครบทุกตัวเลือก`;
    }
    return "";
  };

  /* ===== save / close ===== */
  const handleSave = async () => {
    const msg = validate();
    if (msg) { setWarn(msg); return; }

    const now = Date.now();
    const store = readStore();
    const prev = store[quizId];

    const payload = {
      id: quizId,
      headline: headline.trim(),
      pages,
      totalQuestions: pages.length,
      createdAt: prev?.createdAt ?? now,
      updatedAt: now,
    };

    // --- (optional) ต่อ backend จริงภายหลัง ---
    // try {
    //   const res = await fetch(`/api/quizzes/${quizId}`, {
    //     method: prev ? "PUT" : "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(payload),
    //   });
    //   if (!res.ok) throw new Error("Failed");
    // } catch (e) {
    //   console.warn("API save failed, falling back to localStorage only:", e);
    // }

    store[quizId] = payload;
    writeStore(store);

    setDirty(false);

    // แจ้งหน้า QuizzTeacher ให้เพิ่ม/อัปเดตโพสต์ (เหลือง)
    navigate("/quiz", {
      replace: true,
      state: {
        justSaved: true,
        quizId,
        headline: payload.headline,
        totalQuestions: payload.totalQuestions,
        updatedAt: payload.updatedAt,
      },
    });
  };

  const handleClose = () => {
    if (dirty) setShowLeave(true);
    else navigate("/quiz");
  };
  const leaveAnyway = () => navigate("/quiz");

  /* ===== UI helpers ===== */
  const colorOf = (i) => ["#F55454", "#67E07A", "#9A73F8", "#FFF36A"][i];
  const answerButtonStyle = (i, isActive) => ({
    width: "100%",
    border: 0,
    borderRadius: 12,
    height: 54,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    background: colorOf(i),
    opacity: isActive ? 1 : 0.88,
  });

  /* ===== layout ===== */
  return (
    <div className="th-root" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 18, alignItems: "start" }}>
      {/* left rail */}
      <aside
        style={{
          background: "#ECF2FF",
          borderRadius: 14,
          padding: 12,
          display: "grid",
          gridTemplateRows: "auto auto 1fr auto",
          gap: 12,
          minHeight: 560,
        }}
      >
        {/* headline */}
        <div>
          <label style={{ fontSize: 12, color: "#475569" }}>Headline</label>
          <input
            className="th-input"
            value={headline}
            onChange={(e) => { setHeadline(e.target.value); setDirty(true); setWarn(""); }}
            style={{ height: 36, borderRadius: 10, marginTop: 6 }}
          />
        </div>

        {/* quick info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: "#334155" }}>
          <div style={pillBox}>Quiz ID</div>
          <div style={pillBox}>{quizId}</div>
        </div>

        {/* page list */}
        <div style={{ display: "grid", gap: 10, alignContent: "start", overflowY: "auto", paddingRight: 2 }}>
          {pages.map((p, i) => (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
              <button
                onClick={() => setActiveIndex(i)}
                title={p.title}
                style={{
                  border: "0",
                  textAlign: "left",
                  background: "white",
                  borderRadius: 16,
                  padding: 10,
                  display: "grid",
                  gap: 8,
                  cursor: "pointer",
                  boxShadow:
                    i === activeIndex
                      ? "0 0 0 3px rgba(120,156,255,0.9), 0 8px 20px rgba(2,8,23,0.08)"
                      : "0 2px 10px rgba(2,8,23,0.05)",
                  transition: "box-shadow .18s ease",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.title || `Question ${i + 1}`}</div>
                <div
                  style={{
                    width: "100%",
                    height: 60,
                    borderRadius: 14,
                    background: "#EFF3FA",
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                  }}
                >
                  {p.mediaUrl ? (
                    <img src={p.mediaUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ color: "#94a3b8", fontSize: 13 }}>preview</span>
                  )}
                </div>
              </button>
              <button
                title="Remove question"
                onClick={() => removePage(i)}
                style={{ border: 0, background: "#fee2e2", color: "#991b1b", borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addPage}
          style={{ height: 44, borderRadius: 12, border: 0, background: "white", fontSize: 20, fontWeight: 700, cursor: "pointer" }}
          title="Add question"
        >
          + Add Question
        </button>
      </aside>

      {/* canvas & controls */}
      <main className="th-main" style={{ paddingRight: 24, position: "relative" }}>
        {/* only Back button */}
        <div style={{ position: "absolute", right: 24, top: 18, display: "grid", gap: 8, gridAutoFlow: "column" }}>
          <button
            title="Back"
            onClick={handleClose}
            style={{ height: 34, borderRadius: 8, border: 0, background: "#ef4444", color: "white", fontWeight: 800, padding: "0 12px", cursor: "pointer" }}
          >
            Back
          </button>
        </div>

        {/* editor panel */}
        <div
          style={{
            background: "#e5e7eb",
            borderRadius: 12,
            padding: 20,
            minHeight: 460,
            maxWidth: 760,
            margin: "0 auto",
            boxShadow: "0 12px 26px rgba(2,8,23,.06)",
          }}
        >
          {/* question */}
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <input
              className="th-input"
              placeholder={`Type your Question ${activeIndex + 1}`}
              value={active.question}
              onChange={(e) => { setPage(activeIndex, { question: e.target.value }); setWarn(""); }}
              style={{ height: 44, borderRadius: 12, width: 640, maxWidth: "100%", margin: "0 auto", display: "block", textAlign: "center", fontWeight: 600 }}
            />
          </div>

          {/* media */}
          <div
            style={{
              width: 640,
              maxWidth: "100%",
              height: 280,
              margin: "0 auto 12px",
              background: "white",
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              position: "relative",
              border: "1px dashed #cbd5e1",
            }}
          >
            {active.mediaUrl ? (
              <>
                <img src={active.mediaUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                <button onClick={clearMedia} title="Remove media" style={chipBtn("#ef4444", "#fff", { position: "absolute", right: 8, top: 8 })}>
                  remove
                </button>
              </>
            ) : (
              <button
                onClick={onPickMedia}
                style={{ border: 0, background: "transparent", cursor: "pointer", fontSize: 14, color: "#334155" }}
                title="Add image/video"
              >
                + อัปโหลดสื่อ
              </button>
            )}
            <input ref={fileInputRef} onChange={onFile} type="file" accept="image/*,video/*" hidden />
          </div>

          {/* answers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start", width: 640, maxWidth: "100%", margin: "0 auto" }}>
            {active.answers.map((a, i) => (
              <div key={a.id} style={{ display: "grid", gap: 8 }}>
                <button onClick={() => setCorrect(i)} style={answerButtonStyle(i, a.isCorrect)} title="คลิกเพื่อกำหนดเป็นคำตอบที่ถูก">
                  {a.isCorrect ? "✓ " : ""}{a.text}
                </button>
                <input
                  className="th-input"
                  value={a.text}
                  onChange={(e) => { changeAnswerText(i, e.target.value); setWarn(""); }}
                  placeholder={`Answer ${i + 1}`}
                  style={{ height: 36, borderRadius: 10 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* summary & save */}
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", maxWidth: 760, marginInline: "auto" }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 12px", fontSize: 14, color: "#0f172a" }}>
            <strong>Summary:</strong> {pages.length} questions • Headline: <em>{headline || "(none)"}</em>
            {warn && <span style={{ color: "#b91c1c", marginLeft: 10 }}>• {warn}</span>}
          </div>
          <button onClick={handleSave} className="th-btn-save" style={{ borderRadius: 999, padding: "10px 16px" }} title="Save quiz & go back">
            Save all & back to Quiz
          </button>
        </div>
      </main>

      {/* leave confirm */}
      {showLeave && (
        <>
          <div onClick={() => setShowLeave(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.35)", zIndex: 40 }} />
          <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", zIndex: 50, pointerEvents: "none" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: 360, borderRadius: 20, background: "#98B7FF", boxShadow: "0 12px 40px rgba(15,23,42,.3)", overflow: "hidden", pointerEvents: "auto" }}>
              <div style={{ padding: 22, textAlign: "center", color: "#0f172a" }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Are you sure you want to leave this page without saving?</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <button onClick={() => setShowLeave(false)} style={modalBtn("white")}>cancel</button>
                <button onClick={leaveAnyway} style={modalBtn("#E46E6E", "#fff")}>Leave</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ===== tiny styles ===== */
function modalBtn(bg, color = "#111827") {
  return { background: bg, color, border: 0, padding: "12px 0", fontWeight: 700, cursor: "pointer" };
}
const pillBox = {
  background: "white",
  borderRadius: 10,
  padding: "6px 8px",
  textOverflow: "ellipsis",
  overflow: "hidden",
  whiteSpace: "nowrap",
  border: "1px solid #e2e8f0",
};
function chipBtn(bg, color, extra = {}) {
  return { background: bg, color, border: 0, borderRadius: 8, padding: "6px 10px", fontWeight: 700, cursor: "pointer", ...extra };
}
