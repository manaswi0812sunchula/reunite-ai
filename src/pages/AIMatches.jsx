import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";

/* ================= HELPER FUNCTION ================= */

const getField = (item, fields) => {
  for (const field of fields) {
    if (item?.[field]) {
      return item[field];
    }
  }
  return "";
};

const clean = (value) =>
  String(value || "").trim().toLowerCase();

const hasCommonWord = (value1, value2) => {
  const words1 = clean(value1)
    .split(/\s+/)
    .filter((word) => word.length > 2);

  const words2 = clean(value2)
    .split(/\s+/)
    .filter((word) => word.length > 2);

  return words1.some((word) => words2.includes(word));
};

/* ================= MATCH CARD ================= */

function MatchCard({ match, index, handleClaim }) {
  const lost = match.lost;
  const found = match.found;

  const lostName =
    getField(lost, ["name", "itemName"]) || "Not provided";

  const foundName =
    getField(found, ["name", "itemName"]) || "Not provided";

  const lostCategory =
    getField(lost, ["category"]) || "Not provided";

  const foundCategory =
    getField(found, ["category"]) || "Not provided";

  const lostColor =
    getField(lost, ["colour", "color"]) || "Not provided";

  const foundColor =
    getField(found, ["colour", "color"]) || "Not provided";

  const lostBrand =
    getField(lost, ["brand"]) || "Not provided";

  const foundBrand =
    getField(found, ["brand"]) || "Not provided";

  const lostLocation =
    getField(lost, ["location"]) || "Not provided";

  const foundLocation =
    getField(found, ["location"]) || "Not provided";

  const lostDate =
    getField(lost, ["date"]) || "Not provided";

  const foundDate =
    getField(found, ["date"]) || "Not provided";

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "22px",
        padding: "25px",
        marginTop: "22px",
        boxShadow: "0 10px 30px rgba(49,94,251,0.10)",
        border: "1px solid #e8ecff",
      }}
    >
      {/* HEADER */}

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
          <h3
            style={{
              margin: 0,
              color: "#1f2937",
              fontSize: "21px",
            }}
          >
            🎯 Potential Match #{index + 1}
          </h3>

          <p
            style={{
              margin: "7px 0 0",
              color: "#667085",
              fontSize: "14px",
            }}
          >
            AI detected similarities between these items
          </p>
        </div>

        <div
          style={{
            textAlign: "center",
            background: "#eef2ff",
            padding: "12px 20px",
            borderRadius: "16px",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#4f46e5",
            }}
          >
            {match.score}%
          </div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color:
                match.confidence === "Very High"
                  ? "#15803d"
                  : match.confidence === "High"
                  ? "#2563eb"
                  : "#b45309",
            }}
          >
            🧠 {match.confidence}
          </div>
        </div>
      </div>

      <hr
        style={{
          margin: "20px 0",
          border: "none",
          borderTop: "1px solid #edf0f7",
        }}
      />

      {/* LOST + FOUND */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {/* LOST */}

        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #fecaca",
            borderRadius: "18px",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "#fee2e2",
              color: "#dc2626",
              padding: "7px 12px",
              borderRadius: "20px",
              fontWeight: "700",
              fontSize: "13px",
              marginBottom: "15px",
            }}
          >
            🔴 LOST ITEM
          </div>

          <h3
            style={{
              margin: "0 0 15px",
              color: "#991b1b",
            }}
          >
            {lostName}
          </h3>

          <p>
            <strong>📂 Category:</strong> {lostCategory}
          </p>

          <p>
            <strong>🎨 Colour:</strong> {lostColor}
          </p>

          <p>
            <strong>🏷️ Brand:</strong> {lostBrand}
          </p>

          <p>
            <strong>📍 Location:</strong> {lostLocation}
          </p>

          <p>
            <strong>📅 Date:</strong> {lostDate}
          </p>
        </div>

        {/* FOUND */}

        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "18px",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "#dcfce7",
              color: "#15803d",
              padding: "7px 12px",
              borderRadius: "20px",
              fontWeight: "700",
              fontSize: "13px",
              marginBottom: "15px",
            }}
          >
            🟢 FOUND ITEM
          </div>

          <h3
            style={{
              margin: "0 0 15px",
              color: "#166534",
            }}
          >
            {foundName}
          </h3>

          <p>
            <strong>📂 Category:</strong> {foundCategory}
          </p>

          <p>
            <strong>🎨 Colour:</strong> {foundColor}
          </p>

          <p>
            <strong>🏷️ Brand:</strong> {foundBrand}
          </p>

          <p>
            <strong>📍 Location:</strong> {foundLocation}
          </p>

          <p>
            <strong>📅 Date:</strong> {foundDate}
          </p>
        </div>
      </div>

      {/* MATCH REASONS */}

      <div
        style={{
          marginTop: "20px",
          background: "#f8faff",
          borderRadius: "18px",
          padding: "20px",
          border: "1px solid #e0e7ff",
        }}
      >
        <h4
          style={{
            marginTop: 0,
            color: "#4338ca",
            fontSize: "16px",
          }}
        >
          🧠 Why AI thinks this is a match
        </h4>

        {match.reasons.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {match.reasons.map((reason, reasonIndex) => (
              <span
                key={reasonIndex}
                style={{
                  background: "#eef2ff",
                  color: "#4338ca",
                  padding: "8px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                ✓ {reason}
              </span>
            ))}
          </div>
        ) : (
          <p>No matching details available.</p>
        )}
      </div>

      {/* SCORE BAR */}

      <div
        style={{
          marginTop: "20px",
          background: "#f8fafc",
          padding: "18px",
          borderRadius: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
            fontWeight: "700",
          }}
        >
          <span>AI Match Confidence</span>
          <span style={{ color: "#4f46e5" }}>
            {match.score}/100
          </span>
        </div>

        <div
          style={{
            height: "12px",
            background: "#e5e7eb",
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${match.score}%`,
              height: "100%",
              background:
                "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)",
              borderRadius: "20px",
            }}
          />
        </div>
      </div>

      {/* CLAIM */}

      <button
        onClick={() => handleClaim(match)}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "15px",
          border: "none",
          borderRadius: "14px",
          background:
            "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "white",
          fontSize: "16px",
          fontWeight: "700",
          cursor: "pointer",
          boxShadow:
            "0 8px 20px rgba(99,102,241,0.25)",
        }}
      >
        🔐 Claim This Item
      </button>
    </div>
  );
}

/* ================= MAIN COMPONENT ================= */

function AIMatches({ addClaim }) {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const calculateMatch = (lost, found) => {
    let score = 0;
    const reasons = [];

    const lostName = getField(lost, [
      "name",
      "itemName",
    ]);

    const foundName = getField(found, [
      "name",
      "itemName",
    ]);

    const lostCategory = getField(lost, [
      "category",
    ]);

    const foundCategory = getField(found, [
      "category",
    ]);

    const lostColor = getField(lost, [
      "colour",
      "color",
    ]);

    const foundColor = getField(found, [
      "colour",
      "color",
    ]);

    const lostBrand = getField(lost, [
      "brand",
    ]);

    const foundBrand = getField(found, [
      "brand",
    ]);

    const lostLocation = getField(lost, [
      "location",
    ]);

    const foundLocation = getField(found, [
      "location",
    ]);

    const lostDate = getField(lost, [
      "date",
    ]);

    const foundDate = getField(found, [
      "date",
    ]);

    const lostDescription = getField(lost, [
      "description",
      "details",
    ]);

    const foundDescription = getField(found, [
      "description",
      "details",
    ]);

    /* ITEM NAME */

    if (
      clean(lostName) &&
      clean(foundName) &&
      clean(lostName) === clean(foundName)
    ) {
      score += 25;
      reasons.push("Item name matches");
    } else if (
      hasCommonWord(lostName, foundName)
    ) {
      score += 15;
      reasons.push("Item name is similar");
    }

    /* CATEGORY */

    if (
      clean(lostCategory) &&
      clean(lostCategory) === clean(foundCategory)
    ) {
      score += 25;
      reasons.push("Category matches");
    }

    /* COLOUR */

    if (
      clean(lostColor) &&
      clean(lostColor) === clean(foundColor)
    ) {
      score += 15;
      reasons.push("Colour matches");
    }

    /* BRAND */

    if (
      clean(lostBrand) &&
      clean(lostBrand) === clean(foundBrand)
    ) {
      score += 15;
      reasons.push("Brand matches");
    }

    /* LOCATION */

    if (
      clean(lostLocation) &&
      clean(lostLocation) === clean(foundLocation)
    ) {
      score += 10;
      reasons.push("Location matches");
    } else if (
      hasCommonWord(
        lostLocation,
        foundLocation
      )
    ) {
      score += 5;
      reasons.push("Location is similar");
    }

    /* DATE */

    if (
      clean(lostDate) &&
      clean(lostDate) === clean(foundDate)
    ) {
      score += 5;
      reasons.push("Date matches");
    }

    /* DESCRIPTION */

    if (
      hasCommonWord(
        lostDescription,
        foundDescription
      )
    ) {
      score += 5;
      reasons.push(
        "Description has similar details"
      );
    }

    let confidence = "Low";

    if (score >= 80) {
      confidence = "Very High";
    } else if (score >= 65) {
      confidence = "High";
    } else if (score >= 50) {
      confidence = "Medium";
    }

    return {
      score,
      confidence,
      reasons,
    };
  };

  /* ================= LOAD FIREBASE DATA ================= */

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const lostSnapshot = await getDocs(
          collection(db, "lostItems")
        );

        const foundSnapshot = await getDocs(
          collection(db, "foundItems")
        );

        const lost = lostSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

        const found = foundSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

        setLostItems(lost);
        setFoundItems(found);

        const generatedMatches = [];

        lost.forEach((lostItem) => {
          found.forEach((foundItem) => {
            const result = calculateMatch(
              lostItem,
              foundItem
            );

            if (result.score >= 50) {
              generatedMatches.push({
                lost: lostItem,
                found: foundItem,
                ...result,
              });
            }
          });
        });

        generatedMatches.sort(
          (a, b) => b.score - a.score
        );

        setMatches(generatedMatches);
      } catch (error) {
        console.error(
          "Error loading AI matches:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* ================= CLAIM ================= */

  const handleClaim = async (match) => {
    const claimData = {
      item:
        match.lost.name ||
        match.lost.itemName ||
        "Unknown Item",

      match: `${match.score}%`,

      location:
        match.found.location ||
        "Not provided",

      status: "Pending Verification",

      lostItemId: match.lost.id || "",
      foundItemId: match.found.id || "",

      createdAt: new Date(),
    };

    try {
      const claimRef = await addDoc(
        collection(db, "claims"),
        claimData
      );

      if (addClaim) {
        addClaim({
          id: claimRef.id,
          ...claimData,
        });
      }

      alert(
        "Claim submitted successfully! Go to Claims."
      );
    } catch (error) {
      console.error(
        "Error submitting claim:",
        error
      );

      alert(
        "Failed to submit claim. Please try again."
      );
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #eef2ff, #fdf4ff)",
          padding: "30px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "24px",
            textAlign: "center",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              fontSize: "45px",
              marginBottom: "10px",
            }}
          >
            🤖
          </div>

          <h2 style={{ color: "#4338ca" }}>
            AI is finding matches...
          </h2>

          <p style={{ color: "#667085" }}>
            Comparing lost and found items
          </p>
        </div>
      </div>
    );
  }

  /* ================= MAIN PAGE ================= */

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f5f7ff, #faf5ff)",
        padding: "30px 20px 50px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* PAGE HEADER */}

        <div
          style={{
            background:
              "linear-gradient(135deg, #4f46e5, #7c3aed)",
            color: "white",
            borderRadius: "24px",
            padding: "30px",
            marginBottom: "25px",
            boxShadow:
              "0 12px 30px rgba(79,70,229,0.25)",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              marginBottom: "5px",
            }}
          >
            🤖
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            AI-Powered Matches
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              opacity: 0.9,
              fontSize: "15px",
            }}
          >
            Smart matching between lost and found
            campus items
          </p>
        </div>

        {/* SUMMARY */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "18px",
              boxShadow:
                "0 5px 18px rgba(0,0,0,0.06)",
              borderLeft: "5px solid #ef4444",
            }}
          >
            <div style={{ fontSize: "25px" }}>
              🔴
            </div>

            <strong
              style={{
                display: "block",
                marginTop: "5px",
                color: "#667085",
              }}
            >
              Lost Items
            </strong>

            <span
              style={{
                fontSize: "28px",
                fontWeight: "800",
                color: "#dc2626",
              }}
            >
              {lostItems.length}
            </span>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "18px",
              boxShadow:
                "0 5px 18px rgba(0,0,0,0.06)",
              borderLeft: "5px solid #22c55e",
            }}
          >
            <div style={{ fontSize: "25px" }}>
              🟢
            </div>

            <strong
              style={{
                display: "block",
                marginTop: "5px",
                color: "#667085",
              }}
            >
              Found Items
            </strong>

            <span
              style={{
                fontSize: "28px",
                fontWeight: "800",
                color: "#16a34a",
              }}
            >
              {foundItems.length}
            </span>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "18px",
              boxShadow:
                "0 5px 18px rgba(0,0,0,0.06)",
              borderLeft: "5px solid #8b5cf6",
            }}
          >
            <div style={{ fontSize: "25px" }}>
              🎯
            </div>

            <strong
              style={{
                display: "block",
                marginTop: "5px",
                color: "#667085",
              }}
            >
              AI Matches
            </strong>

            <span
              style={{
                fontSize: "28px",
                fontWeight: "800",
                color: "#7c3aed",
              }}
            >
              {matches.length}
            </span>
          </div>
        </div>

        {/* NO MATCHES */}

        {matches.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "22px",
              padding: "50px 25px",
              textAlign: "center",
              boxShadow:
                "0 8px 25px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "55px",
                marginBottom: "10px",
              }}
            >
              🔍
            </div>

            <h2 style={{ color: "#344054" }}>
              No matches found yet
            </h2>

            <p style={{ color: "#667085" }}>
              We couldn't find any potential matches
              between the current lost and found items.
            </p>
          </div>
        ) : (
          <>
            {/* MATCH INTRO */}

            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "22px",
                boxShadow:
                  "0 6px 20px rgba(0,0,0,0.06)",
                marginBottom: "10px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "#4338ca",
                }}
              >
                🎯 {matches.length} Potential Match
                {matches.length !== 1 ? "es" : ""}
              </h2>

              <p
                style={{
                  marginBottom: 0,
                  color: "#667085",
                }}
              >
                AI compares item name, category,
                colour, brand, location, date and
                description.
              </p>
            </div>

            {/* MATCHES */}

            {matches.map((match, index) => (
              <MatchCard
                key={`${match.lost.id}-${match.found.id}-${index}`}
                match={match}
                index={index}
                handleClaim={handleClaim}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default AIMatches;