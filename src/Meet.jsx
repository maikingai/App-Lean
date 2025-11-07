// src/Meet.jsx
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

export default function Meet() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const q = useMemo(() => new URLSearchParams(search), [search])
  const topic = q.get("topic") || "Class Meet"
  const time  = q.get("time")  || "Now"

  const videoRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [cams, setCams] = useState([])
  const [mics, setMics] = useState([])

  const [camId, setCamId] = useState("")
  const [micId, setMicId] = useState("")
  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [err, setErr] = useState("")

  // --- helpers ---
  const stopStream = (s) => s?.getTracks()?.forEach(t => t.stop())

  const applyTracksEnabled = (s, vOn, aOn) => {
    s?.getVideoTracks()?.forEach(t => (t.enabled = vOn))
    s?.getAudioTracks()?.forEach(t => (t.enabled = aOn))
  }

  const refreshDevices = async () => {
    const list = await navigator.mediaDevices.enumerateDevices()
    const cams_ = list.filter(d => d.kind === "videoinput")
    const mics_ = list.filter(d => d.kind === "audioinput")
    setCams(cams_)
    setMics(mics_)
    if (!camId && cams_[0]) setCamId(cams_[0].deviceId)
    if (!micId && mics_[0]) setMicId(mics_[0].deviceId)
  }

  const getStream = async (vId, aId) => {
    // ลองขอด้วยอุปกรณ์ที่เลือก ถ้า fail fallback เป็น true
    const constraints = {
      video: vId ? { deviceId: { exact: vId }, width: { ideal: 1280 }, height: { ideal: 720 } } : true,
      audio: aId ? { deviceId: { exact: aId }, echoCancellation: true, noiseSuppression: true } : true
    }
    return await navigator.mediaDevices.getUserMedia(constraints)
  }

  const start = async (first = false) => {
    try {
      setErr("")
      // ครั้งแรกขอสิทธิ์กว้าง ๆ เพื่อให้ enumerateDevices มี label
      const s = first ? await getStream(camId, micId) : await getStream(camId, micId)
      stopStream(stream)
      setStream(s)
      applyTracksEnabled(s, camOn, micOn)
      if (videoRef.current) videoRef.current.srcObject = s
      await refreshDevices()
    } catch (e) {
      console.error(e)
      setErr(e.message || "Cannot access camera/microphone")
    }
  }

  // --- lifecycle ---
  useEffect(() => { start(true) }, []) // ขอสิทธิ์ครั้งแรก
  useEffect(() => () => stopStream(stream), [stream]) // cleanup เมื่อออกหน้า

  // เปลี่ยนอุปกรณ์ -> ขอ stream ใหม่
  useEffect(() => { if (camId || micId) start() }, [camId, micId])

  // toggle ปิด/เปิด โดยไม่ขอ stream ใหม่
  const toggleCam = () => { 
    const nxt = !camOn; setCamOn(nxt); applyTracksEnabled(stream, nxt, micOn)
  }
  const toggleMic = () => { 
    const nxt = !micOn; setMicOn(nxt); applyTracksEnabled(stream, camOn, nxt)
  }

  const join = () => {
    // ตรงนี้ต่อ WebRTC/ห้องจริงได้ภายหลัง
    alert(`Join "${topic}" @ ${time}\nVideo: ${camOn ? 'on' : 'off'} | Audio: ${micOn ? 'on' : 'off'}`)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#111827", color: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, opacity:.9 }}>Meet</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{topic}</div>
            <div style={{ fontSize: 13, opacity:.7, marginTop: 2 }}>{time}</div>
          </div>
          <button
            onClick={() => navigate(-1)}
            style={{ border:0, borderRadius:12, padding:"8px 14px", background:"#374151", color:"#fff", cursor:"pointer" }}
          >Back</button>
        </div>

        {/* Video preview */}
        <div style={{
          background: "radial-gradient(1200px 500px at 50% 10%, #1f2937 0%, #0f172a 70%)",
          borderRadius: 18, padding: 18, boxShadow: "0 20px 60px rgba(0,0,0,.35)"
        }}>
          <div style={{ position:"relative", aspectRatio:"16/9", borderRadius: 14, overflow:"hidden", background:"#0f172a" }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted   // ป้องกัน echo ตอนพรีวิว
              style={{ width:"100%", height:"100%", objectFit:"cover", filter: camOn ? "none" : "brightness(.5)" }}
            />
            {!camOn && (
              <div style={{
                position:"absolute", inset:0, display:"grid", placeItems:"center",
                color:"#fff", fontSize: 22, fontWeight:800, opacity:.9
              }}>Camera is off</div>
            )}
          </div>

          {/* Controls */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16, marginTop: 16 }}>
            {/* Device selectors */}
            <div style={{ display:"grid", gap:8 }}>
              {cams.length > 0 && (
                <select
                  value={camId}
                  onChange={e => setCamId(e.target.value)}
                  style={{ padding:"10px 12px", borderRadius:12, border:"1px solid #374151", background:"#111827", color:"#fff" }}
                >
                  {cams.map(c => <option key={c.deviceId} value={c.deviceId}>{c.label || "Camera"}</option>)}
                </select>
              )}
              {mics.length > 0 && (
                <select
                  value={micId}
                  onChange={e => setMicId(e.target.value)}
                  style={{ padding:"10px 12px", borderRadius:12, border:"1px solid #374151", background:"#111827", color:"#fff" }}
                >
                  {mics.map(m => <option key={m.deviceId} value={m.deviceId}>{m.label || "Microphone"}</option>)}
                </select>
              )}
            </div>

            {/* Toggle + Join */}
            <div style={{ display:"grid", placeItems:"center", gap:12 }}>
              <div style={{ display:"flex", gap:16 }}>
                <button onClick={toggleMic}
                  title={micOn ? "Mute" : "Unmute"}
                  style={{
                    width:56, height:56, borderRadius:"999px", border:0, cursor:"pointer",
                    background: micOn ? "#10b981" : "#ef4444", color:"#fff", fontSize:22, fontWeight:800
                  }}>{micOn ? "🎙️" : "🔇"}</button>

                <button onClick={toggleCam}
                  title={camOn ? "Turn camera off" : "Turn camera on"}
                  style={{
                    width:56, height:56, borderRadius:"999px", border:0, cursor:"pointer",
                    background: camOn ? "#10b981" : "#ef4444", color:"#fff", fontSize:22, fontWeight:800
                  }}>{camOn ? "📷" : "🚫"}</button>
              </div>

              <button onClick={join}
                style={{
                  marginTop: 4, padding:"14px 32px", borderRadius: 999, border:0, cursor:"pointer",
                  background:"#60a5fa", color:"#0b1220", fontWeight:800, fontSize:18, boxShadow:"0 10px 30px rgba(59,130,246,.3)"
                }}>Join</button>
            </div>
          </div>

          {/* Error */}
          {!!err && (
            <div style={{ marginTop: 12, color:"#fecaca", fontSize:13 }}>
              {err} — ลองเช็คสิทธิ์กล้อง/ไมค์ในเบราว์เซอร์ หรือใช้ HTTPS/localhost
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
