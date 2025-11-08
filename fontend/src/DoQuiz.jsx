// src/DoQuiz.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/**
 * DoQuiz
 * - แสดงข้อควิซทีละข้อ
 * - เลือกคำตอบแล้วจะไฮไลท์: ผิด (กากบาท) / ถูก (เครื่องหมายถูก)
 * - ปุ่มลูกศร ">" ไปข้อถัดไป / ข้อสุดท้ายเปิด modal ยืนยันส่ง
 * - ส่งแล้วแสดงคะแนน และบันทึก localStorage: quizScores[{id}] = {score,total,at}
 */
export default function DoQuiz() {
  const navigate = useNavigate();
  const { id = "q1" } = useParams();

  // ===== Demo quiz (ปรับเป็นข้อมูลจริงได้) =====
  const quiz = useMemo(
    () => ({
      id,
      title: "Do a Quiz",
      total: 10,
      questions: [
        {
          id: "1",
          title: "Find det(A)",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Determinant_cross.svg/320px-Determinant_cross.svg.png",
          options: [
            { id: "a", label: "1" },
            { id: "b", label: "3" },
            { id: "c", label: "5" },
            { id: "d", label: "I don’t know" },
          ],
          answerId: "c",
        },
        // เติมข้ออื่นๆ ให้ครบ 10 ข้อ (ตัวอย่างจำลองซ้ำ ๆ)
        ...Array.from({ length: 9 }).map((_, i) => ({
          id: String(i + 2),
          title: `Find det(A) #${i + 2}`,
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Determinant_cross.svg/320px-Determinant_cross.svg.png",
          options: [
            { id: "a", label: "1" },
            { id: "b", label: "3" },
            { id: "c", label: "5" },
            { id: "d", label: "I don’t know" },
          ],
          answerId: "c",
        })),
      ],
    }),
    [id]
  );

  // ===== State =====
  const [index, setIndex] = useState(0); // zero-based
  const [selected, setSelected] = useState({}); // { [qid]: optionId }
  const [lock, setLock] = useState(false); // ล็อคเมื่อเลือกไปแล้วเพื่อแสดงถูก/ผิด
  const [showConfirm, setShowConfirm] = useState(false);
  const [finalScore, setFinalScore] = useState(null); // number | null

  const q = quiz.questions[index];
  const total = quiz.questions.length;

  // ===== Action =====
  const pick = (optId) => {
    if (lock) return;
    setSelected((v) => ({ ...v, [q.id]: optId }));
    setLock(true);
  };

  const goNext = () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setLock(false);
    } else {
      setShowConfirm(true);
    }
  };

  const submitQuiz = () => {
    const score = quiz.questions.reduce(
      (acc, it) => (selected[it.id] === it.answerId ? acc + 1 : acc),
      0
    );
    setFinalScore(score);
    setShowConfirm(false);

    // บันทึกคะแนนล่าสุดของควิซนี้
    try {
      const key = "quizScores";
      const dict = JSON.parse(localStorage.getItem(key) || "{}");
      dict[id] = { score, total, at: Date.now() };
      localStorage.setItem(key, JSON.stringify(dict));
    } catch {}
  };

  const closeResult = () => {
    // กลับไปหน้า list quiz
    navigate("/quiz");
  };

  // ===== UI helpers =====
  const Option = ({ opt }) => {
    const chosen = selected[q.id];
    const isChosen = chosen === opt.id;
    const isCorrect = q.answerId === opt.id;

    // สีพื้นฐาน
    let bg = "#ef4444"; // red
    if (opt.id === "b") bg = "#a78bfa"; // purple
    if (opt.id === "c") bg = "#4ade80"; // green
    if (opt.id === "d") bg = "#fde047"; // yellow

    // เสริมผลลัพธ์หลังเลือก
    let rightAdornment = null;
    if (lock && isChosen && !isCorrect) rightAdornment = "✗";
    if (lock && isCorrect) rightAdornment = "✓";

    return (
      <button
        disabled={lock && !isChosen && !isCorrect}
        onClick={() => pick(opt.id)}
        style={{
          height: 64,
          borderRadius: 10,
          border: 0,
          cursor: "pointer",
          fontSize: 20,
          fontWeight: 600,
          color: "#111827",
          background: bg,
          opacity: lock && !isChosen && !isCorrect ? 0.7 : 1,
          position: "relative",
        }}
      >
        {opt.label}
        {rightAdornment && (
          <span
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              fontWeight: 800,
            }}
          >
            {rightAdornment}
          </span>
        )}
      </button>
    );
  };

  return (
    <div style={S.screen}>
      <div style={S.header}>
        <button
          aria-label="back"
          onClick={() => navigate(-1)}
          style={{ ...S.navBtn, transform: "rotate(180deg)" }}
        >
          ❯
        </button>
        <button aria-label="next" onClick={goNext} style={S.navBtn}>
          ❯
        </button>
      </div>

      {/* ข้อคำถาม */}
      <div style={S.card}>
        <div style={S.qTop}>
          <div />
          <div style={S.progress}>
            {index + 1}/{total}
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: 22, fontWeight: 700 }}>
          {q.title}
        </div>

        {q.image && (
          <div style={{ display: "grid", placeItems: "center", padding: "18px 0 4px" }}>
            <img
              alt="question"
              src={q.image}
              style={{ maxWidth: 360, width: "80%", borderRadius: 6 }}
            />
          </div>
        )}
      </div>

      {/* ตัวเลือก 2x2 */}
      <div style={S.grid}>
        <Option opt={q.options[0]} />
        <Option opt={q.options[1]} />
        <Option opt={q.options[2]} />
        <Option opt={q.options[3]} />
      </div>

      {/* Modal: ยืนยันส่ง */}
      {showConfirm && (
        <>
          <div style={S.backdrop} onClick={() => setShowConfirm(false)} />
          <div style={S.center}>
            <div style={S.modalBox}>
              <div style={{ fontSize: 14, color: "#111827aa", marginBottom: 8 }}>
                Are you sure to send your quiz?
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button style={S.btnSoft} onClick={() => setShowConfirm(false)}>
                  No
                </button>
                <button style={S.btnPrimary} onClick={submitQuiz}>
                  Yes
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal: คะแนน */}
      {finalScore != null && (
        <>
          <div style={S.backdrop} />
          <div style={S.center}>
            <div style={S.scoreBox}>
              <div style={{ fontSize: 12, color: "#111827aa" }}>Congratulations</div>
              <div style={{ fontSize: 12, color: "#111827aa", marginBottom: 8 }}>
                You’ve got
              </div>
              <div style={{ fontSize: 40, fontWeight: 800 }}>{finalScore}/{total}</div>
              <button style={{ ...S.btnPrimary, marginTop: 14 }} onClick={closeResult}>
                OK
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ===== styles ===== */
const S = {
  screen: {
    minHeight: "100dvh",
    background: "#97B5F5",
    padding: 16,
    fontFamily: "Inter, system-ui, Segoe UI, Arial, Helvetica, sans-serif",
    color: "#111827",
    position: "relative",
  },
  header: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    display: "flex",
    justifyContent: "space-between",
    pointerEvents: "none",
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    border: 0,
    background: "transparent",
    color: "#111",
    fontSize: 28,
    lineHeight: 1,
    pointerEvents: "auto",
    cursor: "pointer",
  },
  card: {
    margin: "72px auto 18px",
    width: "min(920px, 92vw)",
    background: "#F4F6F8",
    borderRadius: 12,
    boxShadow: "0 2px 0 rgba(0,0,0,.05)",
    padding: "24px 18px",
  },
  qTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progress: {
    fontWeight: 800,
  },
  grid: {
    width: "min(920px, 92vw)",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.55)",
  },
  center: {
    position: "fixed",
    inset: 0,
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
  },
  modalBox: {
    width: 280,
    background: "#fff",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 14px 40px rgba(0,0,0,.25)",
    pointerEvents: "auto",
  },
  scoreBox: {
    width: 300,
    background:
      "linear-gradient(180deg, rgba(178,234,201,1) 0%, rgba(139,247,154,1) 22%, rgba(139,247,154,1) 45%, rgba(178,234,201,1) 100%)",
    borderRadius: 16,
    padding: 18,
    textAlign: "center",
    boxShadow: "0 14px 40px rgba(0,0,0,.25)",
    pointerEvents: "auto",
  },
  btnSoft: {
    height: 36,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  btnPrimary: {
    height: 36,
    borderRadius: 10,
    border: 0,
    background: "#8BF79A",
    fontWeight: 800,
    cursor: "pointer",
  },
};
