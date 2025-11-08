import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./teacher-home.css";
import StudentSidebar from './StudentSidebar'

export default function AssignStudent() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("assigned");
  const [classFilter, setClassFilter] = useState("all");
  const [showTabPanel, setShowTabPanel] = useState(false);

  // demo tasks (replace with backend data later)
  const demo = useMemo(() => ([
    { id: 't1', title: 'Matrix P1', classId: 1, className: 'Math M4/1', due: '2025-11-09', status: 'assigned' },
    { id: 't2', title: 'Vector HW', classId: 2, className: 'Math M4/2', due: '', status: 'assigned' },
    { id: 't3', title: 'Quiz: Matrix', classId: 1, className: 'Math M4/1', due: '2025-11-15', status: 'assigned' },
    { id: 't4', title: 'Determinant Lab', classId: 2, className: 'Math M4/2', due: '2025-12-01', status: 'assigned' },
  ]), []);

  // compute buckets based on due date
  const buckets = useMemo(() => {
    const now = new Date();
    const startOfWeek = (() => {
      const d = new Date(now);
      const day = d.getDay();
      const diff = (day === 0 ? -6 : 1) - day; // Monday start
      d.setDate(d.getDate() + diff);
      d.setHours(0,0,0,0);
      return d;
    })();
    const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(endOfWeek.getDate()+7);
    const endOfNextWeek = new Date(startOfWeek); endOfNextWeek.setDate(endOfNextWeek.getDate()+14);

    const out = { noDue: [], thisWeek: [], nextWeek: [], later: [] };
    demo.filter(d => d.status === tab).forEach(it => {
      if (!it.due) { out.noDue.push(it); return }
      const due = new Date(it.due + 'T00:00:00');
      if (due >= startOfWeek && due < endOfWeek) out.thisWeek.push(it);
      else if (due >= endOfWeek && due < endOfNextWeek) out.nextWeek.push(it);
      else out.later.push(it);
    });
    return out;
  }, [demo, tab]);

  const IconBtn = ({ title, onClick, children }) => (
    <button className="th-iconbtn" title={title} aria-label={title} onClick={onClick}>
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  );

  const SectionRow = ({ title, items }) => {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ width: '100%' }}>
        <div className="th-card" style={{ borderRadius: 12, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ fontWeight: 700 }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize:12, color:'#64748b', background:'#fff', padding:'6px 10px', borderRadius:999, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.03)' }}>{items.length}</div>
              <button onClick={() => setOpen(v=>!v)} style={{ border:0, background:'transparent', cursor:'pointer', fontSize:14 }}>{open ? '▾' : '▸'}</button>
            </div>
          </div>
        </div>

        {open && (
          <div style={{ display:'grid', gap:6, marginTop:0 }}>
            {items.length === 0 ? (
              <div className="th-card" style={{ padding:16 }}>No items</div>
            ) : items.map(it => (
              <div key={it.id} className="th-card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', cursor:'pointer', width: '100%', marginRight:0, marginBottom:6, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }} onClick={() => navigate(`/assignment/${it.id}`)}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontWeight:700 }}>{it.title}</div>
                  <div style={{ fontSize:12, color:'#64748b' }}>{it.className}{it.due ? ` • Due ${new Date(it.due).toLocaleDateString()}` : ''}</div>
                </div>
                <div style={{ fontSize:12, color:'#6b7280', marginLeft:12 }}>{it.status === 'assigned' ? 'To turn in' : it.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="th-root th-root-rel" style={{ display:'grid', gridTemplateColumns: '72px 1fr', gap:16 }}>
      <StudentSidebar />

      <main className="th-main th-main-rel">
        <div className="th-topbar" style={{ justifyContent:'flex-end', gap:10 }}>
          <div style={{ fontWeight:800, background:'#ffe58a', padding:'6px 10px', borderRadius:999 }}>🪙 5000</div>
          <div style={{ fontWeight:700 }}>Student Name</div>
          <button className="th-avatar">🙂</button>
        </div>

        <div style={{ padding:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:8 }}>
            <div style={{ display:'flex', gap:12, width: '58%' }}>
              {['assigned','overdue','completed'].map(k => (
                <button key={k} onClick={() => { setTab(k); setShowTabPanel(false); }} style={{
                  background:'transparent', border:0, padding:'8px 12px', fontWeight:700, color: tab===k? '#0f172a' : '#5b6b82', cursor:'pointer', borderRadius:8
                }}>{k==='assigned'?'Assigned':k==='overdue'?'Overdue':'Completed'}</button>
              ))}
            </div>

            <div style={{ marginLeft:'auto' }}>
              <select className="th-input" value={classFilter} onChange={(e)=>setClassFilter(e.target.value)} style={{ height:46 }}>
                <option value="all">All Classes</option>
                <option value="1">Math M4/1</option>
                <option value="2">Math M4/2</option>
              </select>
            </div>
          </div>

          {/* Tab drop-down panel: appears as an extension below the tabs when a tab is opened */}
          {showTabPanel ? (
            <div style={{ marginBottom:12}}>
              <div className="th-card" style={{ padding:12, minWidth:420 }}>
                <div style={{ fontWeight:700, marginBottom:8, whiteSpace: 'normal' }}>{tab === 'assigned' ? 'Assigned' : tab === 'overdue' ? 'Overdue' : 'Completed'}</div>
                <div style={{ display:'grid', gap:8, gridTemplateColumns: '1fr 1fr' }}>
                  {['noDue','thisWeek','nextWeek','later'].map(bucketKey => (
                    <div key={bucketKey} style={{ minWidth: 0, paddingRight: 6 }}>
                      <div style={{ fontWeight:700, color:'#6b7280', marginBottom:6, whiteSpace: 'normal' }}>{bucketKey === 'noDue' ? 'No due date' : bucketKey === 'thisWeek' ? 'This week' : bucketKey === 'nextWeek' ? 'Next week' : 'Later'}</div>
                      {(buckets[bucketKey] || []).length === 0 ? (
                        <div className="th-card" style={{ padding:12 }}>No items</div>
                      ) : (
                        (buckets[bucketKey] || []).map(it => (
                          <div key={it.id} className="th-card" style={{ padding:14, cursor:'pointer', width: '100%', marginRight:0, marginBottom:8, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }} onClick={() => navigate(`/assignment/${it.id}`)}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight:700 }}>{it.title}</div>
                                <div style={{ fontSize:12, color:'#64748b' }}>{it.className}{it.due ? ` • Due ${new Date(it.due).toLocaleDateString()}` : ''}</div>
                              </div>
                              <div style={{ fontSize:12, color:'#6b7280', marginLeft:12 }}>{it.status === 'assigned' ? 'To turn in' : it.status}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display:'grid', gap:12 }}>
                <SectionRow title="No due date" items={buckets.noDue} />
                <SectionRow title="This week" items={buckets.thisWeek} />
                <SectionRow title="Next week" items={buckets.nextWeek} />
                <SectionRow title="Later" items={buckets.later} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
