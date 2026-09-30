import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  requestNotificationPermission,
  listenForMessages,
} from "../firebaseMessaging";

function Home({ setPage }) {
  const [lostCount, setLostCount] = useState(0);
  const [foundCount, setFoundCount] = useState(0);
  const [activeMatches, setActiveMatches] = useState(0);
  const [reunitedCount, setReunitedCount] = useState(0);

  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);

  // 🔔 Firebase Push Notification Setup
  useEffect(() => {
    requestNotificationPermission();
    listenForMessages();
  }, []);

  // 📊 REAL-TIME FIREBASE DATA
  useEffect(() => {
    const unsubscribeLost = onSnapshot(
      collection(db, "lostItems"),
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setLostItems(items);
        setLostCount(items.length);
      },
      (error) => {
        console.error("Lost items error:", error);
      }
    );

    const unsubscribeFound = onSnapshot(
      collection(db, "foundItems"),
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFoundItems(items);
        setFoundCount(items.length);
      },
      (error) => {
        console.error("Found items error:", error);
      }
    );

    const unsubscribeClaims = onSnapshot(
      collection(db, "claims"),
      (snapshot) => {
        const reunited = snapshot.docs.filter(
          (doc) => doc.data().status === "Reunited"
        );

        setReunitedCount(reunited.length);
      },
      (error) => {
        console.error("Claims error:", error);
      }
    );

    return () => {
      unsubscribeLost();
      unsubscribeFound();
      unsubscribeClaims();
    };
  }, []);

  // 🤖 Calculate AI matches
  useEffect(() => {
    calculateMatches(lostItems, foundItems);
  }, [lostItems, foundItems]);

  const clean = (value) =>
    String(value || "")
      .toLowerCase()
      .trim();

  const getField = (item, fields) => {
    for (const field of fields) {
      if (item?.[field]) {
        return clean(item[field]);
      }
    }

    return "";
  };

  const hasCommonWord = (a, b) => {
    if (!a || !b) return false;

    const wordsA = a.split(/\s+/).filter(Boolean);
    const wordsB = b.split(/\s+/).filter(Boolean);

    return wordsA.some((word) => wordsB.includes(word));
  };

  const calculateScore = (lost, found) => {
    let score = 0;

    const lostName = getField(lost, ["name", "itemName"]);
    const foundName = getField(found, ["name", "itemName"]);

    const lostCategory = getField(lost, ["category"]);
    const foundCategory = getField(found, ["category"]);

    const lostColour = getField(lost, ["colour", "color"]);
    const foundColour = getField(found, ["colour", "color"]);

    const lostBrand = getField(lost, ["brand"]);
    const foundBrand = getField(found, ["brand"]);

    const lostLocation = getField(lost, ["location"]);
    const foundLocation = getField(found, ["location"]);

    const lostDate = getField(lost, ["date"]);
    const foundDate = getField(found, ["date"]);

    const lostDetails = getField(lost, [
      "details",
      "description",
    ]);

    const foundDetails = getField(found, [
      "details",
      "description",
    ]);

    // Item name - 25%
    if (
      lostName &&
      foundName &&
      (lostName === foundName ||
        hasCommonWord(lostName, foundName))
    ) {
      score += 25;
    }

    // Category - 25%
    if (
      lostCategory &&
      foundCategory &&
      lostCategory === foundCategory
    ) {
      score += 25;
    }

    // Colour - 15%
    if (
      lostColour &&
      foundColour &&
      lostColour === foundColour
    ) {
      score += 15;
    }

    // Brand - 15%
    if (
      lostBrand &&
      foundBrand &&
      lostBrand === foundBrand
    ) {
      score += 15;
    }

    // Location - 10%
    if (
      lostLocation &&
      foundLocation &&
      lostLocation === foundLocation
    ) {
      score += 10;
    }

    // Date - 5%
    if (
      lostDate &&
      foundDate &&
      lostDate === foundDate
    ) {
      score += 5;
    }

    // Description - 5%
    if (
      lostDetails &&
      foundDetails &&
      hasCommonWord(lostDetails, foundDetails)
    ) {
      score += 5;
    }

    return score;
  };

  const calculateMatches = (lostItems, foundItems) => {
    if (!lostItems || !foundItems) return;

    let matches = 0;

    lostItems.forEach((lost) => {
      foundItems.forEach((found) => {
        const score = calculateScore(lost, found);

        if (score >= 50) {
          matches++;
        }
      });
    });

    setActiveMatches(matches);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)",
        fontFamily: "Arial, sans-serif",
        color: "#172033",
      }}
    >
      {/* ================= NAVBAR ================= */}

<nav
  style={{
    background: "rgba(255,255,255,0.98)",
    boxShadow: "0 3px 15px rgba(0,0,0,0.07)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    padding: "18px 20px 14px",
  }}
>
  {/* BRAND - CENTER */}

  <div
    onClick={() => setPage("home")}
    style={{
      textAlign: "center",
      cursor: "pointer",
      marginBottom: "18px",
    }}
  >
    <h1
      style={{
        margin: 0,
        fontSize: "30px",
        fontWeight: "800",
        color: "#315efb",
        letterSpacing: "-0.5px",
      }}
    >
      🔵 ReuniteAI
    </h1>

    <p
      style={{
        margin: "4px 0 0",
        color: "#667085",
        fontSize: "14px",
        fontWeight: "500",
      }}
    >
      Smart Campus Lost & Found
    </p>
  </div>

  {/* NAVIGATION */}

  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      flexWrap: "wrap",
      fontSize: "14px",
    }}
  >
    <NavItem
      text="🏠 Home"
      onClick={() => setPage("home")}
      active
    />

    <NavItem
      text="📦 Lost Items"
      onClick={() => setPage("lostItems")}
    />

    <NavItem
      text="🔎 Found Items"
      onClick={() => setPage("foundItems")}
    />

    <NavItem
      text="🤖 AI Matches"
      onClick={() => setPage("aiMatches")}
    />

    <NavItem
      text="🛡️ Claims"
      onClick={() => setPage("claims")}
    />

    <NavItem
      text="📊 Analytics"
      onClick={() => setPage("analytics")}
    />

    <NavItem
      text="🔔 Notifications"
      onClick={() => setPage("notifications")}
    />

    <button
      onClick={() => setPage("profile")}
      style={{
        border: "none",
        background: "#eef2ff",
        color: "#4f46e5",
        padding: "10px 15px",
        borderRadius: "10px",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      👤 Profile
    </button>

    <button
      onClick={async () => {
        try {
          await signOut(auth);
          setPage("login");
        } catch (error) {
          console.error("Logout error:", error);
        }
      }}
      style={{
        border: "none",
        background: "#fee2e2",
        color: "#dc2626",
        padding: "10px 15px",
        borderRadius: "10px",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      🚪 Logout
    </button>
  </div>
</nav>
      <section
        style={{
          maxWidth: "1150px",
          margin: "auto",
          padding: "75px 25px 55px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "9px 17px",
            background: "#e8edff",
            color: "#4f46e5",
            borderRadius: "30px",
            fontSize: "13px",
            fontWeight: "bold",
            letterSpacing: "0.5px",
          }}
        >
          ✨ AI-POWERED CAMPUS RECOVERY
        </div>

        <h1
          style={{
            fontSize: "clamp(40px, 6vw, 68px)",
            margin: "25px 0 18px",
            lineHeight: "1.05",
            letterSpacing: "-2px",
          }}
        >
          Lost something?
          <br />

          <span
            style={{
              background:
                "linear-gradient(90deg, #315efb, #7c3aed, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Let AI find it.
          </span>
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#667085",
            maxWidth: "700px",
            margin: "auto",
            lineHeight: "1.7",
          }}
        >
          ReuniteAI connects lost reports, found items and
          intelligent matching to help students recover their
          belongings faster and more safely.
        </p>

        {/* HERO BUTTONS */}

        <div
          style={{
            marginTop: "32px",
            display: "flex",
            justifyContent: "center",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setPage("lost")}
            style={{
              padding: "15px 28px",
              background:
                "linear-gradient(135deg, #315efb, #7c3aed)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow:
                "0 8px 20px rgba(79,70,229,0.25)",
            }}
          >
            🔴 Report Lost Item
          </button>

          <button
            onClick={() => setPage("found")}
            style={{
              padding: "15px 28px",
              background: "white",
              color: "#315efb",
              border: "2px solid #315efb",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🟢 Report Found Item
          </button>

          <button
            onClick={() => setPage("admin")}
            style={{
              padding: "15px 22px",
              background: "#111827",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🏫 Admin Dashboard
          </button>
        </div>

        {/* TRUST LINE */}

        <div
          style={{
            marginTop: "28px",
            color: "#667085",
            fontSize: "13px",
          }}
        >
          🔐 Privacy-aware &nbsp; • &nbsp; ⚡ Real-time updates
          &nbsp; • &nbsp; 🤖 Smart matching
        </div>
      </section>

      {/* ================= LIVE STATS ================= */}

      <section
        style={{
          maxWidth: "1100px",
          margin: "10px auto 0",
          padding: "0 25px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "28px",
            borderRadius: "22px",
            boxShadow:
              "0 10px 30px rgba(31,41,55,0.08)",
            border: "1px solid #eef2f7",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#6366f1",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                LIVE CAMPUS DATA
              </p>

              <h2
                style={{
                  margin: "5px 0 0",
                }}
              >
                📊 Recovery Overview
              </h2>
            </div>

            <div
              style={{
                background: "#ecfdf3",
                color: "#15803d",
                padding: "8px 13px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              ● Live
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "18px",
              marginTop: "25px",
            }}
          >
            <StatCard
              icon="📦"
              title="Total Lost Items"
              value={lostCount}
              background="#fff1f2"
            />

            <StatCard
              icon="🔎"
              title="Total Found Items"
              value={foundCount}
              background="#ecfdf3"
            />

            <StatCard
              icon="🤖"
              title="Active Matches"
              value={activeMatches}
              background="#f5f3ff"
            />

            <StatCard
              icon="🎉"
              title="Reunited Items"
              value={reunitedCount}
              background="#fffbeb"
            />
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section
        style={{
          maxWidth: "1100px",
          margin: "65px auto",
          padding: "0 25px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              color: "#6366f1",
              fontWeight: "bold",
              fontSize: "13px",
            }}
          >
            SIMPLE • SMART • SECURE
          </p>

          <h2
            style={{
              fontSize: "32px",
              margin: "5px 0 10px",
            }}
          >
            How ReuniteAI Helps
          </h2>

          <p
            style={{
              color: "#667085",
              maxWidth: "600px",
              margin: "auto",
            }}
          >
            From reporting a lost item to safely reuniting it
            with its owner.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "22px",
            marginTop: "30px",
          }}
        >
          <Feature
            number="01"
            icon="🤖"
            title="AI Matching"
            text="Compares item names, categories, colours, brands, locations, dates and descriptions to identify possible matches."
          />

          <Feature
            number="02"
            icon="🔐"
            title="Privacy Protected"
            text="Ownership information remains protected while claims are verified through the platform."
          />

          <Feature
            number="03"
            icon="⚡"
            title="Fast Recovery"
            text="Real-time reports and notifications help students discover relevant lost and found items quickly."
          />
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}

      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto 60px",
          padding: "0 25px",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, #312e81, #6366f1, #7c3aed)",
            color: "white",
            borderRadius: "24px",
            padding: "45px 30px",
            textAlign: "center",
            boxShadow:
              "0 15px 35px rgba(79,70,229,0.25)",
          }}
        >
          <div style={{ fontSize: "40px" }}>
            🔎
          </div>

          <h2
            style={{
              fontSize: "30px",
              margin: "12px 0",
            }}
          >
            Lost something on campus?
          </h2>

          <p
            style={{
              opacity: 0.9,
              maxWidth: "550px",
              margin: "auto",
              lineHeight: "1.6",
            }}
          >
            Report it now and let ReuniteAI help you find a
            possible match.
          </p>

          <button
            onClick={() => setPage("lost")}
            style={{
              marginTop: "22px",
              padding: "13px 25px",
              background: "white",
              color: "#4f46e5",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Report Lost Item →
          </button>
        </div>
      </section>

      {/* FOOTER */}

      <footer
        style={{
          textAlign: "center",
          padding: "25px",
          color: "#667085",
          fontSize: "13px",
        }}
      >
        <b style={{ color: "#315efb" }}>
          ReuniteAI
        </b>{" "}
        • Smart Campus Lost & Found
        <br />
        Built for smarter and safer campus recovery.
      </footer>
    </div>
  );
}

/* ================= NAV ITEM ================= */

function NavItem({
  text,
  onClick,
  active = false,
}) {
  return (
    <span
      onClick={onClick}
      style={{
        cursor: "pointer",
        color: active ? "#315efb" : "#475467",
        fontWeight: active ? "700" : "500",
        padding: "8px 3px",
      }}
    >
      {text}
    </span>
  );
}

/* ================= STAT CARD ================= */

function StatCard({
  icon,
  title,
  value,
  background,
}) {
  return (
    <div
      style={{
        background: "#fafbff",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid #eef2f7",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "21px",
        }}
      >
        {icon}
      </div>

      <p
        style={{
          color: "#667085",
          margin: "13px 0 4px",
          fontSize: "14px",
        }}
      >
        {title}
      </p>

      <h2
        style={{
          color: "#111827",
          fontSize: "30px",
          margin: 0,
        }}
      >
        {value}
      </h2>
    </div>
  );
}

/* ================= FEATURE ================= */

function Feature({
  number,
  icon,
  title,
  text,
}) {
  return (
    <div
      style={{
        background: "white",
        padding: "28px",
        borderRadius: "20px",
        boxShadow:
          "0 8px 25px rgba(31,41,55,0.07)",
        border: "1px solid #eef2f7",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "18px",
          right: "20px",
          color: "#d0d5dd",
          fontWeight: "bold",
          fontSize: "13px",
        }}
      >
        {number}
      </div>

      <div
        style={{
          width: "55px",
          height: "55px",
          borderRadius: "15px",
          background: "#eef2ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "27px",
        }}
      >
        {icon}
      </div>

      <h3 style={{ marginBottom: "8px" }}>
        {title}
      </h3>

      <p
        style={{
          color: "#667085",
          lineHeight: "1.65",
          marginBottom: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}

export default Home;