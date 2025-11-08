import React, { useMemo, useState } from "react";
// ถ้าใช้ react-router ให้เปลี่ยนเป็น useNavigate ได้
// import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  // const navigate = useNavigate();
  const [range, setRange] = useState("all");

  // === PDF ที่จะฝัง/ดาวน์โหลด ===
  const pdfUrl = "/reports/class-dashboard.pdf"; // เปลี่ยนพาธเป็นไฟล์จริงของโปรเจ็กต์คุณ

  // ---- demo data (replace with real data) ----
  const students = [
    { id: 1, name: "Keroro Sashimi", avatar: "🙂", attendance: 100, assignment: 100, quiz: 80, avg: 90 },
    { id: 2, name: "Mami Poko",     avatar: "🫧", attendance: 100, assignment: 100, quiz: 70, avg: 85 },
  ];

  const overview = useMemo(() => {
    const n = students.length || 1;
    const avgAssign = Math.round(students.reduce((a, s) => a + (s.assignment || 0), 0) / n);
    const avgQuiz = Math.round(students.reduce((a, s) => a + (s.quiz || 0), 0) / n);
    const avgAttendance = Math.round(students.reduce((a, s) => a + (s.attendance || 0), 0) / n);
    const submit = Math.round(students.reduce((a, s) => a + (s.assignment > 0 ? 100 : 0), 0) / n);
    return { students: n, avgAssign, avgQuiz, avgAttendance, submit };
  }, [students]);

  const goBack = () => {
    // ถ้าใช้ router: navigate(-1)
    window.history.back();
  };

  return (
    <div className="wrap">
      <Style />

      {/* Topbar: Back + Title + Download */}
      <div className="topbar">
        <button className="btnBack" onClick={goBack} aria-label="Back">← Back</button>
        <h2 className="title">Dashboard</h2>
        <a className="btnDownload" href={pdfUrl} download>
          ⬇️ Download PDF
        </a>
      </div>

      {/* Header Row: Overview + Range Filter */}
      <div className="headerRow">
        <h3>Overview</h3>
        <div className="range">
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="all">All time</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="cards">
        <StatCard title="Students" value={overview.students} big />
        <StatCard title="Average Score\nAssignment" value={overview.avgAssign + "%"} />
        <StatCard title="Average Score\nQuiz" value={overview.avgQuiz + "%"} />
        <StatCard title="Attendance" value={overview.avgAttendance + "%"} />
        <StatCard title={`Assignments\nSubmitted`} value={overview.submit + "%"} />
      </div>

      {/* Student Progress */}
      <h3 className="sectionTitle">Student Progress</h3>

      <div className="tableWrap">
        <table className="table">
          <colgroup>
            <col style={{ width: "34%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "16%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Name</th>
              <th>Attendance</th>
              <th><div className="th2"><span>Assignment</span><small>Matrix</small></div></th>
              <th><div className="th2"><span>Quiz</span><small>Matrix</small></div></th>
              <th>Avg %</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="nameCell">
                    <span className="avatar" aria-hidden>{s.avatar}</span>
                    <span className="name">{s.name}</span>
                  </div>
                </td>
                <td className="num">{fmtPct(s.attendance)}</td>
                <td className="num">{fmtPct(s.assignment)}</td>
                <td className="num">{fmtPct(s.quiz)}</td>
                <td className="num strong">{fmtPct(s.avg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PDF Preview (ฝังไฟล์) */}
      <h3 className="sectionTitle" style={{ marginTop: 20 }}>Report (PDF Preview)</h3>
      <div className="pdfBox">
        <iframe title="Dashboard PDF" src={pdfUrl} className="pdfView" />
        {/* ถ้าเบราว์เซอร์บล็อค สามารถแสดงลิงก์สำรองได้ */}
        <div className="pdfFallback">
          หากไม่เห็นไฟล์ <a href={pdfUrl} target="_blank" rel="noreferrer">เปิดในแท็บใหม่</a>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, big = false }) {
  return (
    <div className={"card" + (big ? " big" : "")}>
      <div className="cardTitle">
        {title.split("\n").map((t, i) => <span key={i}>{t}</span>)}
      </div>
      <div className="cardValue">{value}</div>
    </div>
  );
}

function fmtPct(n) { return (n ?? 0) + "%"; }

function Style() {
  return (
    <style>{`
      :root{
        --bg:#97B5F5;
        --panel:#A9C0FA;
        --card:#FFFFFF;
        --ink:#1c2540;
        --muted:#6e7aa6;
        --ring:#cfe0ff;
        --tableBorder:#a8bff8;
        --radius:18px;
      }
      *{box-sizing:border-box}
      .wrap{min-height:100dvh;background:var(--bg);padding:28px 30px 60px;font-family:Inter,system-ui,Segoe UI,Arial,Helvetica,sans-serif;color:#fff}

      /* Topbar */
      .topbar{display:grid;grid-template-columns:auto 1fr auto;align-items:center;margin-bottom:18px;gap:12px}
      .btnBack{background:#e2e8ff;border:0;color:#1f2a55;font-weight:700;padding:10px 14px;border-radius:12px;cursor:pointer;box-shadow:0 2px 0 rgba(0,0,0,.06)}
      .title{margin:0;text-align:center;color:#f7fbff}
      .btnDownload{background:#1f2a55;color:#fff;text-decoration:none;padding:10px 14px;border-radius:12px;font-weight:700;box-shadow:0 2px 0 rgba(0,0,0,.2)}
      .btnDownload:hover{opacity:.95}

      /* Header row */
      .headerRow{display:flex;align-items:center;justify-content:space-between;margin:12px 0 8px}
      h3{margin:0;color:#f7fbff}
      .range select{appearance:none;background:#cfe0ff;border:0;color:#27406d;padding:10px 14px;border-radius:14px;font-weight:600;min-width:150px}

      /* Cards */
      .cards{display:grid;grid-template-columns:repeat(5, minmax(0,1fr));gap:16px;margin:10px 0 28px}
      .card{background:var(--card);color:#27406d;border-radius:20px;padding:14px 18px;box-shadow:0 4px 0 rgba(0,0,0,.05)}
      .card.big{display:flex;flex-direction:column;align-items:center;justify-content:center}
      .cardTitle{font-size:12px;line-height:1.15;color:#6a7aa6;display:flex;gap:4px;flex-direction:column}
      .cardValue{font-size:28px;font-weight:800;margin-top:6px}
      .card.big .cardValue{font-size:34px}

      .sectionTitle{margin:6px 0 10px;font-size:16px;color:#f7fbff}

      /* Table */
      .tableWrap{background:#96b4f4;border-radius:22px;padding:14px;border:1.5px solid var(--tableBorder)}
      table{width:100%;border-collapse:separate;border-spacing:0 0}
      thead th{background:#b8ccfb;color:#27406d;text-align:left;font-size:14px;font-weight:700;padding:16px 18px;border-top-left-radius:14px;border-top-right-radius:14px}
      thead th + th{border-left:2px solid var(--tableBorder)}
      tbody tr{background:#e9f0ff}
      tbody td{padding:18px;border-top:2px solid var(--tableBorder);border-bottom:2px solid var(--tableBorder);color:#27406d}
      tbody td + td{border-left:2px solid var(--tableBorder)}
      tbody tr:first-child td{border-top-left-radius:16px;border-top-right-radius:16px}
      tbody tr:last-child td{border-bottom-left-radius:16px;border-bottom-right-radius:16px}
      .nameCell{display:flex;align-items:center;gap:12px}
      .avatar{width:36px;height:36px;display:grid;place-items:center;background:#ffdff0;border-radius:50%;font-size:18px}
      .name{font-weight:600}
      .num{font-weight:600;text-align:center}
      .strong{font-weight:800}

      /* PDF preview */
      .pdfBox{background:#96b4f4;border:1.5px solid var(--tableBorder);border-radius:18px;padding:10px}
      .pdfView{width:100%;height:70vh;border:0;border-radius:12px;background:#fff}
      .pdfFallback{margin-top:8px;color:#f0f3ff}

      /* Responsive */
      @media (max-width:1100px){
        .cards{grid-template-columns:repeat(2, minmax(0,1fr))}
      }
      @media (max-width:720px){
        .tableWrap{padding:8px}
        thead{display:none}
        table, tbody, tr, td{display:block;width:100%}
        tbody tr{margin-bottom:12px;border-radius:16px;overflow:hidden}
        tbody td{display:flex;justify-content:space-between;align-items:center;padding:12px 14px}
        tbody td::before{content:attr(data-label);font-weight:700;color:#5a6a99}
        .topbar{grid-template-columns:1fr auto;grid-auto-flow:row}
        .title{order:3;text-align:left;margin-top:6px}
      }
    `}</style>
  );
}
