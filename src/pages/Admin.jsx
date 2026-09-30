import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase";

function Admin({ claims = [], setClaims }) {
  const [adminClaims, setAdminClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // REAL-TIME FIRESTORE LISTENER
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "claims"),
      (snapshot) => {
        const savedClaims = snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          })
        );

        setAdminClaims(savedClaims);

        // Also update App state
        if (setClaims) {
          setClaims(savedClaims);
        }

        setLoading(false);
      },
      (error) => {
        console.error(
          "Error loading claims:",
          error
        );

        setLoading(false);
      }
    );

    // Stop listener when leaving Admin page
    return () => unsubscribe();
  }, [setClaims]);

  // APPROVE HANDOVER
  const approveClaim = async (index) => {
    const claim = adminClaims[index];

    if (!claim) return;

    if (claim.status !== "Verified") {
      alert(
        "⚠️ Ownership must be verified before approving the handover."
      );
      return;
    }

    try {
      // Update Firestore
      await updateDoc(
        doc(db, "claims", claim.id),
        {
          status: "Reunited",
        }
      );

      /*
        No need to manually update adminClaims here.

        Firestore onSnapshot() will automatically
        detect the change and update the screen.
      */

      alert(
        "🎉 Handover approved! Item marked as reunited."
      );
    } catch (error) {
      console.error(
        "Error approving handover:",
        error
      );

      alert(
        "❌ Failed to approve handover. Please try again."
      );
    }
  };

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
        <h2>
          🔄 Loading Admin Dashboard...
        </h2>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f8ff",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "auto",
        }}
      >
        <h1 style={{ color: "#315efb" }}>
          🏫 Campus Admin Dashboard
        </h1>

        <p style={{ color: "#667085" }}>
          Review verified claims and complete item
          handovers.
        </p>

        {/* STATISTICS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          {/* TOTAL CLAIMS */}

          <div style={cardStyle}>
            <h3>📦 Total Claims</h3>

            <h1>{adminClaims.length}</h1>
          </div>

          {/* PENDING */}

          <div style={cardStyle}>
            <h3>
              ⏳ Pending Verification
            </h3>

            <h1>
              {
                adminClaims.filter(
                  (claim) =>
                    claim.status ===
                    "Pending Verification"
                ).length
              }
            </h1>
          </div>

          {/* REUNITED */}

          <div style={cardStyle}>
            <h3>🎉 Reunited</h3>

            <h1>
              {
                adminClaims.filter(
                  (claim) =>
                    claim.status ===
                    "Reunited"
                ).length
              }
            </h1>
          </div>
        </div>

        {/* CLAIM LIST */}

        <h2 style={{ marginTop: "40px" }}>
          Claim Requests
        </h2>

        {adminClaims.length === 0 ? (
          <div style={emptyStyle}>
            <h3>No claims yet</h3>

            <p>
              Claims submitted through AI Matches
              will appear here.
            </p>
          </div>
        ) : (
          adminClaims.map((claim, index) => (
            <div
              key={claim.id || index}
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "16px",
                marginTop: "20px",
                boxShadow:
                  "0 4px 15px rgba(0,0,0,0.08)",
              }}
            >
              {/* HEADER */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                }}
              >
                <h2>{claim.item}</h2>

                <span
                  style={{
                    padding: "8px 12px",
                    borderRadius: "20px",
                    fontWeight: "bold",

                    background:
                      claim.status ===
                      "Reunited"
                        ? "#dcfae6"
                        : claim.status ===
                          "Verified"
                        ? "#eaf2ff"
                        : "#fff3cd",

                    color:
                      claim.status ===
                      "Reunited"
                        ? "#067647"
                        : claim.status ===
                          "Verified"
                        ? "#315efb"
                        : "#946200",
                  }}
                >
                  {claim.status}
                </span>
              </div>

              {/* MATCH */}

              <p>
                🤖 AI Match:
                <b> {claim.match}</b>
              </p>

              {/* LOCATION */}

              <p>
                📍 Found at:
                <b> {claim.location}</b>
              </p>

              {/* PENDING */}

              {claim.status ===
                "Pending Verification" && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    background: "#fff8e1",
                    borderRadius: "10px",
                    color: "#946200",
                  }}
                >
                  ⏳ Waiting for student
                  ownership verification.
                </div>
              )}

              {/* VERIFIED */}

              {claim.status === "Verified" && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    background: "#eef4ff",
                    borderRadius: "10px",
                  }}
                >
                  <p
                    style={{
                      color: "#315efb",
                      fontWeight: "bold",
                    }}
                  >
                    ✅ Ownership verified
                  </p>

                  <button
                    onClick={() =>
                      approveClaim(index)
                    }
                    style={{
                      marginTop: "10px",
                      padding: "12px 20px",
                      background: "#067647",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    🤝 Approve Handover
                  </button>
                </div>
              )}

              {/* REUNITED */}

              {claim.status === "Reunited" && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "15px",
                    background: "#eefbf3",
                    borderRadius: "10px",
                    color: "#067647",
                    fontWeight: "bold",
                  }}
                >
                  🎉 Item successfully reunited
                  with the owner!
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "16px",
  boxShadow:
    "0 4px 15px rgba(0,0,0,0.08)",
};

const emptyStyle = {
  background: "white",
  padding: "30px",
  marginTop: "20px",
  borderRadius: "16px",
  textAlign: "center",
};

export default Admin;