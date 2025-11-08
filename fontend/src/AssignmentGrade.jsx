// AssignmentGrade.jsx
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./teacher-home.css";

export default function AssignmentGrade() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  // ===== Profile / Logout =====
  const [showProfile, setShowProfile] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("role");
    setShowProfile(false);
    navigate("/login");
  };

  // ===== Assignment meta =====
  const assignment = useMemo(
    () => ({
      id: assignmentId,
      title: "Matrix P1",
      className: "Math M4/1",
      maxPoints: 100,
      due: "2025-10-10T23:59:00Z",
      latePenaltyPctPerDay: 10,
    }),
    [assignmentId]
  );

  // ===== Students (ไฟล์มาจาก AssignmentStudent) =====
  const [students, setStudents] = useState([
    { id: "s1", name: "Somchai K.", submittedAt: "2025-10-10T20:00:00Z", score: 85, teacherNote: "", files: [{ name: "matrix_p1_somchai.pdf", size: 412_000, url: "#" }] },
    { id: "s2", name: "Aom P.",     submittedAt: "2025-10-11T09:30:00Z", score: 92, teacherNote: "", files: [{ name: "aom_matrix.zip", size: 1_204_112, url: "#" }] },
    { id: "s3", name: "Boss T.",    submittedAt: null,                    score: null, teacherNote: "", files: [] },
    { id: "s4", name: "Ploy A.",    submittedAt: "2025-10-13T12:00:00Z", score: 70, teacherNote: "", files: [{ name: "ploy_matrix.docx", size: 89_320, url: "#" }] },
  ]);

  // ===== Helpers =====
  const isLate = (submittedAt) =>
    submittedAt && new Date(submittedAt) > new Date(assignment.due);

  const lateDays = (submittedAt) => {
    if (!submittedAt) return 0;
    const ms = new Date(submittedAt) - new Date(assignment.due);
    return ms <= 0 ? 0 : Math.ceil(ms / (1000 * 60 * 60 * 24));
  };

  // Points cap: เพดานพ้อยตามเวลาส่ง (ถ้ายังไม่ส่ง = null)
  const pointsCap = (submittedAt) => {
    if (!submittedAt) return null;
    const days = lateDays(submittedAt);
    const penaltyPct = Math.min(days * assignment.latePenaltyPctPerDay, 100);
    const cap = assignment.maxPoints * (1 - penaltyPct / 100);
    return Math.max(0, Math.round(cap));
  };

  // Awarded = min(Score, Points cap) (ถ้ายังไม่ส่ง/ไม่มี score = null)
  const awarded = (score, submittedAt) => {
    const cap = pointsCap(submittedAt);
    if (score == null || cap == null) return null;
    return Math.min(score, cap);
  };

  const fmtSize = (n) =>
    n >= 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`;

  const turnedIn = students.filter((s) => !!s.submittedAt).length;
  const graded = students.filter((s) => s.score != null).length;
  const assigned = students.length;

  const updateStudent = (id, patch) =>
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  // Save
  const saveAll = () => {
    const payload = students.map((s) => ({
      id: s.id,
      score: s.score,
      submittedAt: s.submittedAt,
      pointsCap: pointsCap(s.submittedAt),
      awarded: awarded(s.score, s.submittedAt),
      teacherNote: s.teacherNote,
      files: s.files,
    }));
    console.log("SAVE_ASSIGNMENT_GRADE", { assignmentId, payload });
    alert("Saved!");
  };

  // ===== UI =====
  return (
    <div className="th-root">
      {/* main paddingRight เผื่อพื้นที่ใต้ปุ่มโปรไฟล์ */}
      <main className="th-main" style={{ width: "100%", maxWidth: "none", paddingRight: 32 }}>
        {/* Topbar + Avatar + Profile */}
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
              <button className="th-btn-logout" onClick={handleLogout}>Logout</button>
            </div>
          </>
        )}

        {/* ===== Header ===== */}
        <div className="th-card" style={{ width: "97%", marginBottom: 14, padding: "16px 20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) auto",
              alignItems: "center",
              gap: 16,
              minHeight: 64,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.15, marginBottom: 6 }}>
                {assignment.title}
              </div>
              <div style={{ color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {assignment.className} • Due {new Date(assignment.due).toLocaleDateString()}{" "}
                {new Date(assignment.due).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • Max{" "}
                {assignment.maxPoints} pts • Late −{assignment.latePenaltyPctPerDay}%/day
              </div>
            </div>

            <div style={{ display: "grid", gridAutoFlow: "column", gap: 28, alignItems: "center", justifyContent: "end" }}>
              <HeaderStat value={turnedIn} label="Turned in" />
              <HeaderStat value={assigned} label="Assigned" />
              <HeaderStat value={graded} label="Graded" />
            </div>
          </div>
        </div>

        {/* ตารางนักเรียน */}
        <div className="th-card" style={{ padding: 0, overflow: "hidden", width: "100%" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f1f5f9" }}>
              <tr>
                <Th style={{ width: 36 }}>#</Th>
                <Th>Student</Th>
                <Th>Submitted</Th>
                <Th>Files</Th>
                <Th style={{ width: 110 }}>Late?</Th>
                <Th style={{ width: 110 }}>Score</Th>
                <Th style={{ width: 110 }}>Points</Th>
                <Th style={{ width: 110 }}>Awarded</Th>
                <Th>Note</Th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const late = isLate(s.submittedAt);
                const cap = pointsCap(s.submittedAt);
                const awd = awarded(s.score, s.submittedAt);
                return (
                  <tr key={s.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                    <Td>{i + 1}</Td>
                    <Td style={{ fontWeight: 600 }}>{s.name}</Td>

                    <Td>
                      {s.submittedAt ? (
                        <>
                          {new Date(s.submittedAt).toLocaleDateString()}{" "}
                          {new Date(s.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </>
                      ) : (
                        <em style={{ color: "#94a3b8" }}>Not turned in</em>
                      )}
                    </Td>

                    <Td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                        {(s.files || []).length === 0 && (
                          <span style={{ color: "#94a3b8", fontSize: 12 }}>No files</span>
                        )}
                        {(s.files || []).map((fobj, idx) => (
                          <a
                            key={idx}
                            href={fobj.url || "#"}
                            target="_blank"
                            rel="noreferrer"
                            title={fobj.name}
                            style={{
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "4px 10px",
                              borderRadius: 999,
                              background: "#EEF2FF",
                              fontSize: 12,
                              color: "#1f2937",
                            }}
                          >
                            📎 {fobj.name}
                            <span style={{ color: "#6b7280" }}>({fmtSize(fobj.size)})</span>
                          </a>
                        ))}
                      </div>
                    </Td>

                    <Td>
                      {s.submittedAt ? (
                        late ? (
                          <span style={{ color: "#dc2626", fontWeight: 700 }}>
                            Late ({lateDays(s.submittedAt)}d)
                          </span>
                        ) : (
                          <span style={{ color: "#16a34a", fontWeight: 700 }}>On time</span>
                        )
                      ) : (
                        "-"
                      )}
                    </Td>

                    <Td>
                      <input
                        type="number"
                        className="th-input"
                        min={0}
                        max={assignment.maxPoints}
                        placeholder="score"
                        value={s.score ?? ""}
                        onChange={(e) =>
                          updateStudent(s.id, {
                            score: e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                        style={{ width: 90, textAlign: "right" }}
                      />
                    </Td>

                    <Td style={{ fontWeight: 700 }}>{cap == null ? "-" : cap}</Td>
                    <Td style={{ fontWeight: 800, color: "#0f172a" }}>{awd == null ? "-" : awd}</Td>

                    <Td>
                      <input
                        type="text"
                        className="th-input"
                        placeholder="note"
                        value={s.teacherNote}
                        onChange={(e) => updateStudent(s.id, { teacherNote: e.target.value })}
                        style={{ width: "100%" }}
                      />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action bar: ปุ่มมีพื้นหลังแบบ pill */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            alignItems: "center",
            gap: 10,
            marginTop: 12,
            paddingTop: 10,
            paddingBottom: 10,
            background: "transparent",
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <button
              onClick={() => navigate(-1)}
              title="Go back"
              style={{
                background: "#e5e7eb",           // เทาอ่อน
                color: "#111827",
                border: "1px solid #d1d5db",
                borderRadius: 999,
                padding: "10px 16px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 1px 1px rgba(0,0,0,0.04)",
              }}
            >
              Back
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={saveAll}
              title="Save all grades"
              style={{
                background: "#22c55e",           // เขียว
                color: "#ffffff",
                border: "1px solid #16a34a",
                borderRadius: 999,
                padding: "10px 18px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 1px 1px rgba(0,0,0,0.06)",
              }}
            >
              Save
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function HeaderStat({ value, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontWeight: 800, fontSize: 20, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
    </div>
  );
}

function Th({ children, style }) {
  return <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 13, color: "#334155", ...style }}>{children}</th>;
}
function Td({ children, style }) {
  return <td style={{ padding: "10px 12px", verticalAlign: "middle", ...style }}>{children}</td>;
}
