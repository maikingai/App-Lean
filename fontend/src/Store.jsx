// src/Store.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./teacher-home.css"; // ใช้สไตล์หลักเดียวกับหน้าอื่น

export default function Store() {
  const navigate = useNavigate();

  // === เงินและข้อมูลไอเท็ม ===
  const [coins, setCoins] = useState(() => Number(localStorage.getItem("coins") || 5000));
  const [owned, setOwned] = useState(() => JSON.parse(localStorage.getItem("owned") || "[]"));

  useEffect(() => localStorage.setItem("coins", coins), [coins]);
  useEffect(() => localStorage.setItem("owned", JSON.stringify(owned)), [owned]);

  const categories = ["Hat", "Eye", "Mouth", "Skin", "B.G"];
  const [currentTab, setCurrentTab] = useState("Hat");

  // ตัวอย่างสินค้า (สามารถต่อ backend ได้)
  const allItems = {
    Hat: [
      { id: "hat1", name: "Hat1", price: 500, color: "#ff6666" },
      { id: "hat2", name: "Hat2", price: 500, color: "#ccc" },
      { id: "hat3", name: "Hat3", price: 500, color: "#ccc" },
      { id: "hat4", name: "Hat4", price: 500, color: "#ccc" },
      { id: "hat5", name: "Hat5", price: 500, color: "#ccc" },
    ],
    Eye: [],
    Mouth: [],
    Skin: [],
    "B.G": [],
  };

  const [selected, setSelected] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // เมื่อกดปุ่ม Buy
  const handleBuy = () => {
    if (!selected) return;
    if (owned.includes(selected.id)) return; // ซื้อแล้ว
    if (coins < selected.price) return alert("Not enough coins!");
    setShowConfirm(true);
  };

  // ยืนยันการซื้อ
  const confirmBuy = () => {
    if (!selected) return;
    setCoins(coins - selected.price);
    setOwned([...owned, selected.id]);
    setShowConfirm(false);
  };

  const isOwned = (id) => owned.includes(id);

  return (
    <div
      className="th-root th-root-rel"
      style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 16 }}
    >
      {/* ==== Sidebar ==== */}
      <aside className="th-sidebar">
        <div className="th-sidebar-top">
          <button className="th-iconbtn" title="Home" onClick={() => navigate("/student")}>🏠</button>
          <button className="th-iconbtn" title="Assignments" onClick={() => navigate("/assignments")}>📝</button>
          <button className="th-iconbtn" title="Quiz" onClick={() => navigate("/quiz")}>❓</button>
          <button className="th-iconbtn" title="Shop" onClick={() => navigate("/store")}>🛒</button>
          <button className="th-iconbtn" title="Settings" onClick={() => navigate("/settings")}>⚙️</button>
        </div>
      </aside>

      {/* ==== Main ==== */}
      <main
        className="th-main"
        style={{
          paddingRight: 24,
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20,
        }}
      >
        {/* ==== ส่วนซ้าย: Tabs + Items ==== */}
        <div>
          <div
            style={{
              display: "flex",
              background: "#FFED4A",
              borderRadius: 10,
              overflow: "hidden",
              marginBottom: 10,
            }}
          >
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCurrentTab(c);
                  setSelected(null);
                }}
                style={{
                  flex: 1,
                  background: c === currentTab ? "#FFF79A" : "transparent",
                  border: "none",
                  padding: "8px 0",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* ==== รายการสินค้า ==== */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
              gap: 12,
              background: "#ffffff55",
              padding: 12,
              borderRadius: 10,
            }}
          >
            {allItems[currentTab].map((item) => {
              const ownedFlag = isOwned(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelected(item)}
                  style={{
                    height: 80,
                    borderRadius: 10,
                    background:
                      selected?.id === item.id
                        ? "#888"
                        : ownedFlag
                        ? "#ddd"
                        : "#eee",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    border: "2px solid #bbb",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 24,
                      borderRadius: 20,
                      background: item.color,
                      marginBottom: 4,
                    }}
                  />
                  <div style={{ fontSize: 12 }}>{item.name}</div>
                  <div style={{ fontSize: 10 }}>{item.price}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==== ส่วนขวา: Preview + Buy ==== */}
        <div
          style={{
            background: "#f4f6f8cc",
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px 10px",
          }}
        >
          <div style={{ marginBottom: 10, display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 20 }}>🪙</span>
            <span style={{ fontWeight: 600, marginLeft: 6 }}>{coins}</span>
          </div>

          {/* Avatar */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "#a78bfa",
              display: "grid",
              placeItems: "center",
              position: "relative",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 80,
                height: 40,
                top: 10,
                borderRadius: "50%",
                background: selected?.color || "#facc15",
              }}
            />
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#111",
                position: "absolute",
                left: 40,
                top: 55,
              }}
            />
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#111",
                position: "absolute",
                right: 40,
                top: 55,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 40,
                width: 40,
                height: 20,
                borderRadius: "50%",
                background: "#111",
              }}
            />
          </div>

          {/* ปุ่มซื้อ */}
          {selected ? (
            <button
              onClick={handleBuy}
              disabled={isOwned(selected.id)}
              style={{
                width: 120,
                height: 36,
                borderRadius: 8,
                border: 0,
                background: isOwned(selected.id)
                  ? "#B9E5D9"
                  : "#8BF79A",
                color: "#000",
                fontWeight: 700,
                cursor: isOwned(selected.id) ? "default" : "pointer",
              }}
            >
              {isOwned(selected.id) ? "Owned" : "Buy"}
            </button>
          ) : (
            <button
              disabled
              style={{
                width: 120,
                height: 36,
                borderRadius: 8,
                background: "#ddd",
                color: "#888",
                border: 0,
                fontWeight: 700,
              }}
            >
              Buy
            </button>
          )}
        </div>
      </main>

      {/* ==== Modal ยืนยันซื้อ ==== */}
      {showConfirm && (
        <>
          <div
            onClick={() => setShowConfirm(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.4)",
              zIndex: 20,
            }}
          />
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "grid",
              placeItems: "center",
              zIndex: 30,
            }}
          >
            <div
              style={{
                width: 280,
                background: "#97B5F5",
                borderRadius: 20,
                padding: 16,
                textAlign: "center",
                boxShadow: "0 10px 40px rgba(0,0,0,.2)",
              }}
            >
              <div style={{ fontSize: 14, marginBottom: 16 }}>
                Are you sure you want to buy this?
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    background: "#fff",
                    border: 0,
                    borderRadius: 10,
                    padding: 8,
                    fontWeight: 700,
                  }}
                >
                  No
                </button>
                <button
                  onClick={confirmBuy}
                  style={{
                    background: "#8BF79A",
                    border: 0,
                    borderRadius: 10,
                    padding: 8,
                    fontWeight: 700,
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
