import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function Analytics() {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // REAL-TIME FIRESTORE DATA
  useEffect(() => {
    const unsubscribeLost = onSnapshot(
      collection(db, "lostItems"),
      (snapshot) => {
        setLostItems(
          snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          }))
        );
        setLoading(false);
      },
      (error) => {
        console.error("Error loading lost items:", error);
        setLoading(false);
      }
    );

    const unsubscribeFound = onSnapshot(
      collection(db, "foundItems"),
      (snapshot) => {
        setFoundItems(
          snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          }))
        );
      },
      (error) => {
        console.error("Error loading found items:", error);
      }
    );

    const unsubscribeClaims = onSnapshot(
      collection(db, "claims"),
      (snapshot) => {
        setClaims(
          snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          }))
        );
      },
      (error) => {
        console.error("Error loading claims:", error);
      }
    );

    return () => {
      unsubscribeLost();
      unsubscribeFound();
      unsubscribeClaims();
    };
  }, []);

  // AI MATCHES
  let activeMatches = 0;

  lostItems.forEach((lost) => {
    foundItems.forEach((found) => {
      let score = 0;

      if (
        lost.category &&
        found.category &&
        lost.category.toLowerCase() ===
          found.category.toLowerCase()
      ) {
        score += 40;
      }

      if (
        lost.colour &&
        found.colour &&
        lost.colour.toLowerCase() ===
          found.colour.toLowerCase()
      ) {
        score += 20;
      }

      if (
        lost.brand &&
        found.brand &&
        lost.brand.toLowerCase() ===
          found.brand.toLowerCase()
      ) {
        score += 20;
      }

      if (score >= 50) {
        activeMatches++;
      }
    });
  });

  // REUNITED ITEMS
  const reunitedItems = claims.filter(
    (claim) => claim.status === "Reunited"
  ).length;

  // RECOVERY RATE
  const recoveryRate =
    lostItems.length > 0
      ? Math.min(
          Math.round((reunitedItems / lostItems.length) * 100),
          100
        )
      : 0;

  // CATEGORY BREAKDOWN
  const categoryCounts = {};

  [...lostItems, ...foundItems].forEach((item) => {
    const category = item.category || "Other";

    categoryCounts[category] =
      (categoryCounts[category] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]);

  // CHART SCALE
  const maxChartValue = Math.max(
    lostItems.length,
    foundItems.length,
    1
  );

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f6f8ff",
          padding: "40px",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2>🔄 Loading Analytics...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f6f8ff, #eef2ff)",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "auto",
        }}
      >
        {/* HEADER */}

        <div style={{ marginBottom: "30px" }}>
          <p
            style={{
              color: "#6366f1",
              fontWeight: "700",
              marginBottom: "5px",
            }}
          >
            REUNITEAI DASHBOARD
          </p>

          <h1
            style={{
              color: "#111827",
              margin: 0,
              fontSize: "36px",
            }}
          >
            📊 Campus Analytics
          </h1>

          <p
            style={{
              color: "#667085",
              marginTop: "8px",
            }}
          >
            Live statistics and recovery insights from ReuniteAI.
          </p>
        </div>

        {/* STATISTICS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "18px",
          }}
        >
          <StatCard
            icon="📦"
            title="Lost Items"
            value={lostItems.length}
            iconBg="#fee2e2"
          />

          <StatCard
            icon="🔎"
            title="Found Items"
            value={foundItems.length}
            iconBg="#dcfce7"
          />

          <StatCard
            icon="🤖"
            title="AI Matches"
            value={activeMatches}
            iconBg="#ede9fe"
          />

          <StatCard
            icon="🛡️"
            title="Total Claims"
            value={claims.length}
            iconBg="#dbeafe"
          />

          <StatCard
            icon="🎉"
            title="Reunited"
            value={reunitedItems}
            iconBg="#fef3c7"
          />

          <StatCard
            icon="📈"
            title="Recovery Rate"
            value={`${recoveryRate}%`}
            iconBg="#e0e7ff"
          />
        </div>

        {/* LOST VS FOUND CHART */}

        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "20px",
            marginTop: "25px",
            boxShadow:
              "0 8px 25px rgba(31,41,55,0.08)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            📊 Lost vs Found Items
          </h2>

          <p
            style={{
              color: "#667085",
              marginBottom: "25px",
            }}
          >
            Current campus item activity
          </p>

          <div
            style={{
              display: "grid",
              gap: "22px",
            }}
          >
            <ChartBar
              label="🔴 Lost Items"
              value={lostItems.length}
              maxValue={maxChartValue}
              background="#ef4444"
            />

            <ChartBar
              label="🟢 Found Items"
              value={foundItems.length}
              maxValue={maxChartValue}
              background="#22c55e"
            />

            <ChartBar
              label="🎉 Reunited Items"
              value={reunitedItems}
              maxValue={maxChartValue}
              background="#8b5cf6"
            />
          </div>
        </div>

        {/* TWO COLUMN SECTION */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "25px",
            marginTop: "25px",
          }}
        >
          {/* RECOVERY RATE */}

          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              boxShadow:
                "0 8px 25px rgba(31,41,55,0.08)",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              🎯 Recovery Rate
            </h2>

            <div
              style={{
                width: "170px",
                height: "170px",
                borderRadius: "50%",
                background: `conic-gradient(
                  #6366f1 ${recoveryRate * 3.6}deg,
                  #e5e7eb ${recoveryRate * 3.6}deg
                )`,
                margin: "25px auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "125px",
                  height: "125px",
                  borderRadius: "50%",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <strong
                  style={{
                    fontSize: "30px",
                    color: "#315efb",
                  }}
                >
                  {recoveryRate}%
                </strong>

                <span
                  style={{
                    color: "#667085",
                    fontSize: "13px",
                  }}
                >
                  Recovered
                </span>
              </div>
            </div>

            <p style={{ color: "#667085" }}>
              {reunitedItems} of {lostItems.length} lost items
              have been reunited.
            </p>
          </div>

          {/* CATEGORY BREAKDOWN */}

          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              boxShadow:
                "0 8px 25px rgba(31,41,55,0.08)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              📦 Item Categories
            </h2>

            {categoryData.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 10px",
                  color: "#667085",
                }}
              >
                No category data yet.
              </div>
            ) : (
              <div style={{ marginTop: "20px" }}>
                {categoryData.map(
                  ([category, count]) => {
                    const total =
                      lostItems.length +
                      foundItems.length;

                    const percentage =
                      total > 0
                        ? Math.round(
                            (count / total) * 100
                          )
                        : 0;

                    return (
                      <div
                        key={category}
                        style={{
                          marginBottom: "18px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            marginBottom: "7px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "600",
                            }}
                          >
                            {category}
                          </span>

                          <span
                            style={{
                              color: "#667085",
                            }}
                          >
                            {count} ({percentage}%)
                          </span>
                        </div>

                        <div
                          style={{
                            height: "8px",
                            background: "#eef2f7",
                            borderRadius: "10px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: "100%",
                              background:
                                "linear-gradient(90deg, #6366f1, #a855f7)",
                              borderRadius: "10px",
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>

        {/* RECOVERY PIPELINE */}

        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "20px",
            marginTop: "25px",
            boxShadow:
              "0 8px 25px rgba(31,41,55,0.08)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            🔄 Recovery Pipeline
          </h2>

          <p
            style={{
              color: "#667085",
              marginBottom: "25px",
            }}
          >
            Track items through the recovery process.
          </p>

          <Progress
            label="📦 Lost Items"
            value={lostItems.length}
            maxValue={Math.max(lostItems.length, 1)}
          />

          <Progress
            label="🔎 Found Items"
            value={foundItems.length}
            maxValue={Math.max(lostItems.length, 1)}
          />

          <Progress
            label="🤖 AI Matches"
            value={activeMatches}
            maxValue={Math.max(lostItems.length, 1)}
          />

          <Progress
            label="🎉 Reunited"
            value={reunitedItems}
            maxValue={Math.max(lostItems.length, 1)}
          />
        </div>

        {/* QUICK SUMMARY */}

        <div
          style={{
            background:
              "linear-gradient(135deg, #312e81, #6366f1)",
            color: "white",
            padding: "30px",
            borderRadius: "20px",
            marginTop: "25px",
            boxShadow:
              "0 8px 25px rgba(49,46,129,0.25)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            📌 Platform Summary
          </h2>

          <p>
            The system currently has{" "}
            <b>{lostItems.length}</b> lost items and{" "}
            <b>{foundItems.length}</b> found items.
          </p>

          <p>
            🤖 AI identified{" "}
            <b>{activeMatches}</b> potential matches.
          </p>

          <p>
            🎉 <b>{reunitedItems}</b> item
            {reunitedItems !== 1 ? "s have" : " has"}{" "}
            successfully been reunited with the owner.
          </p>

          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "rgba(255,255,255,0.12)",
              borderRadius: "12px",
            }}
          >
            💡 ReuniteAI is using real-time campus data
            to improve lost-and-found recovery.
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  iconBg,
}) {
  return (
    <div
      style={{
        background: "white",
        padding: "22px",
        borderRadius: "18px",
        boxShadow:
          "0 8px 20px rgba(31,41,55,0.07)",
        border: "1px solid #eef2f7",
      }}
    >
      <div
        style={{
          width: "45px",
          height: "45px",
          borderRadius: "12px",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
        }}
      >
        {icon}
      </div>

      <p
        style={{
          color: "#667085",
          marginBottom: "5px",
          marginTop: "15px",
        }}
      >
        {title}
      </p>

      <h1
        style={{
          color: "#111827",
          fontSize: "32px",
          margin: 0,
        }}
      >
        {value}
      </h1>
    </div>
  );
}

function ChartBar({
  label,
  value,
  maxValue,
  background,
}) {
  const width =
    maxValue > 0
      ? Math.max((value / maxValue) * 100, value > 0 ? 5 : 0)
      : 0;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <span style={{ fontWeight: "600" }}>
          {label}
        </span>

        <b>{value}</b>
      </div>

      <div
        style={{
          height: "16px",
          background: "#eef2f7",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${width}%`,
            height: "100%",
            background,
            borderRadius: "20px",
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

function Progress({
  label,
  value,
  maxValue,
}) {
  const width =
    maxValue > 0
      ? Math.min((value / maxValue) * 100, 100)
      : 0;

  return (
    <div style={{ marginBottom: "22px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <p style={{ margin: 0 }}>
          {label}
        </p>

        <b>{value}</b>
      </div>

      <div
        style={{
          height: "10px",
          background: "#e5e7eb",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${width}%`,
            height: "100%",
            background:
              "linear-gradient(90deg, #315efb, #8b5cf6)",
            borderRadius: "10px",
            transition: "width 0.5s",
          }}
        />
      </div>
    </div>
  );
}

export default Analytics;