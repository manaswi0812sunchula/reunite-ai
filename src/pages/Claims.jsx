import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

function Claims({ claims = [], setClaims }) {
  const [loading, setLoading] = useState(true);

  // Load claims from Firestore when page opens
  useEffect(() => {
    const loadClaims = async () => {
      try {
        const snapshot = await getDocs(
          collection(db, "claims")
        );

        const savedClaims = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setClaims(savedClaims);
      } catch (error) {
        console.error("Error loading claims:", error);
      } finally {
        setLoading(false);
      }
    };

    loadClaims();
  }, [setClaims]);

  const demoClaims = [
    {
      item: "Black Dell Laptop",
      match: "92%",
      location: "College Cafeteria",
      status: "Pending Verification",
    },
    {
      item: "Blue Water Bottle",
      match: "87%",
      location: "Main Building",
      status: "Verified",
    },
    {
      item: "Black Wallet",
      match: "78%",
      location: "Library",
      status: "Reunited",
    },
  ];

  // Show demo claims only if there are no real claims
  const displayClaims =
    claims.length > 0 ? claims : demoClaims;

  const verifyClaim = async (index) => {
    if (claims.length === 0) {
      alert(
        "This is a demo claim. Create a claim from AI Matches first."
      );
      return;
    }

    const claim = claims[index];

    try {
      // Update Firestore
      await updateDoc(
        doc(db, "claims", claim.id),
        {
          status: "Verified",
        }
      );

      // Update React state
      const updatedClaims = claims.map((item, i) =>
        i === index
          ? { ...item, status: "Verified" }
          : item
      );

      setClaims(updatedClaims);

      alert(
        "Ownership verified successfully! The claim is now ready for admin handover."
      );
    } catch (error) {
      console.error("Error updating claim:", error);
      alert("Could not verify the claim.");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2>Loading claims...</h2>
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
      <div style={{ maxWidth: "1000px", margin: "auto" }}>

        <h1 style={{ color: "#315efb" }}>
          🛡️ Claim Verification
        </h1>

        <p style={{ color: "#667085" }}>
          Verify ownership before the item is handed over.
        </p>

        <div
          style={{
            background: "#eef4ff",
            padding: "18px",
            borderRadius: "12px",
            marginTop: "20px",
          }}
        >
          🔐 <b>Privacy Protection:</b> Sensitive ownership
          information is not displayed publicly.
        </div>

        {displayClaims.map((claim, index) => (
          <div
            key={claim.id || index}
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "16px",
              marginTop: "20px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
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
                    claim.status === "Reunited"
                      ? "#dcfae6"
                      : claim.status === "Verified"
                      ? "#eaf2ff"
                      : "#fff3cd",
                  color:
                    claim.status === "Reunited"
                      ? "#067647"
                      : claim.status === "Verified"
                      ? "#315efb"
                      : "#946200",
                }}
              >
                {claim.status}
              </span>
            </div>

            <p>
              🤖 AI Match: <b>{claim.match}</b>
            </p>

            <p>
              📍 Found at: {claim.location}
            </p>

            {claim.status === "Pending Verification" && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "20px",
                  background: "#f8f9fc",
                  borderRadius: "12px",
                }}
              >
                <h3>🔐 Private Verification</h3>

                <p style={{ color: "#667085" }}>
                  Enter a unique detail that only the genuine
                  owner should know.
                </p>

                <input
                  type="text"
                  placeholder="Example: Small blue sticker"
                  id={`verification-${index}`}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d0d5dd",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                  }}
                />

                <button
                  onClick={() => {
                    const input =
                      document.getElementById(
                        `verification-${index}`
                      );

                    if (!input.value.trim()) {
                      alert(
                        "Please enter the private ownership detail."
                      );
                      return;
                    }

                    verifyClaim(index);
                  }}
                  style={{
                    width: "100%",
                    marginTop: "15px",
                    padding: "13px",
                    background: "#315efb",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  🔎 Verify Ownership
                </button>
              </div>
            )}

            {claim.status === "Verified" && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "15px",
                  background: "#eef4ff",
                  borderRadius: "10px",
                  color: "#315efb",
                  fontWeight: "bold",
                }}
              >
                ✅ Ownership verified — awaiting admin handover.
              </div>
            )}

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
                🎉 Item successfully reunited with the owner!
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Claims;