import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

// ===============================
// HELPER FUNCTIONS
// ===============================

const getField = (item, fields) => {
  for (const field of fields) {
    if (item?.[field]) {
      return item[field];
    }
  }

  return "";
};

const clean = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const hasCommonWord = (value1, value2) => {
  const words1 = clean(value1)
    .split(/\s+/)
    .filter((word) => word.length > 2);

  const words2 = clean(value2)
    .split(/\s+/)
    .filter((word) => word.length > 2);

  return words1.some((word) => words2.includes(word));
};

// ===============================
// MATCH CARD
// ===============================

function MatchCard({
  match,
  index,
  handleClaim,
  handleStartChat,
}) {
  const confidence =
    match.score >= 80
      ? "Very High"
      : match.score >= 65
      ? "High"
      : "Medium";

  return (
    <div
      style={{
        background: "white",
        padding: "25px",
        borderRadius: "20px",
        marginBottom: "25px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.07)",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0 }}>
          🎯 Potential Match #{index + 1}
        </h3>

        <div
          style={{
            background: "#eef2ff",
            color: "#4f46e5",
            padding: "8px 14px",
            borderRadius: "20px",
            fontWeight: "bold",
          }}
        >
          {match.score}% Match
        </div>
      </div>

      {/* ITEMS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {/* LOST ITEM */}

        <div
          style={{
            background: "#fff7f7",
            padding: "20px",
            borderRadius: "15px",
            border: "1px solid #fee2e2",
          }}
        >
          <h3>🔴 Lost Item</h3>

          <p>
            <strong>Item:</strong>{" "}
            {match.lost.name ||
              match.lost.itemName ||
              "Not provided"}
          </p>

          <p>
            <strong>Category:</strong>{" "}
            {match.lost.category || "Not provided"}
          </p>

          <p>
            <strong>Colour:</strong>{" "}
            {match.lost.colour ||
              match.lost.color ||
              "Not provided"}
          </p>

          <p>
            <strong>Brand:</strong>{" "}
            {match.lost.brand || "Not provided"}
          </p>

          <p>
            <strong>Location:</strong>{" "}
            {match.lost.location || "Not provided"}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {match.lost.date || "Not provided"}
          </p>
        </div>

        {/* FOUND ITEM */}

        <div
          style={{
            background: "#f7fff9",
            padding: "20px",
            borderRadius: "15px",
            border: "1px solid #dcfce7",
          }}
        >
          <h3>🟢 Found Item</h3>

          <p>
            <strong>Item:</strong>{" "}
            {match.found.name ||
              match.found.itemName ||
              "Not provided"}
          </p>

          <p>
            <strong>Category:</strong>{" "}
            {match.found.category || "Not provided"}
          </p>

          <p>
            <strong>Colour:</strong>{" "}
            {match.found.colour ||
              match.found.color ||
              "Not provided"}
          </p>

          <p>
            <strong>Brand:</strong>{" "}
            {match.found.brand || "Not provided"}
          </p>

          <p>
            <strong>Location:</strong>{" "}
            {match.found.location || "Not provided"}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {match.found.date || "Not provided"}
          </p>
        </div>
      </div>

      {/* MATCH INFORMATION */}

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "#f8faff",
          borderRadius: "12px",
        }}
      >
        <strong>🤖 AI Match Confidence:</strong>{" "}
        {confidence}

        <div
          style={{
            marginTop: "10px",
            height: "8px",
            background: "#e5e7eb",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${match.score}%`,
              height: "100%",
              background:
                "linear-gradient(90deg, #6366f1, #8b5cf6)",
            }}
          />
        </div>
      </div>

      {/* MATCH REASONS */}

      {match.reasons?.length > 0 && (
        <div
          style={{
            marginTop: "15px",
            color: "#475467",
          }}
        >
          <strong>🤖 Why AI thinks this is a match:</strong>

          <ul>
            {match.reasons.map((reason, i) => (
              <li key={i} style={{ marginTop: "6px" }}>
                ✓ {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CLAIM BUTTON */}

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

      {/* CHAT BUTTON */}

      <button
        onClick={() => handleStartChat(match)}
        style={{
          marginTop: "10px",
          width: "100%",
          padding: "15px",
          border: "2px solid #6366f1",
          borderRadius: "14px",
          background: "white",
          color: "#6366f1",
          fontSize: "16px",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        💬 Start Chat
      </button>
    </div>
  );
}

// ===============================
// MAIN AI MATCHES COMPONENT
// ===============================

function AIMatches({
  addClaim,
  setPage,
  setActiveChatId,
  setChatUserName,
}) {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // CALCULATE MATCH SCORE
  // ===============================

  const calculateScore = (lost, found) => {
    let score = 0;

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

    const lostColour = getField(lost, [
      "colour",
      "color",
    ]);

    const foundColour = getField(found, [
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

    const lostDetails = getField(lost, [
      "details",
      "description",
    ]);

    const foundDetails = getField(found, [
      "details",
      "description",
    ]);

    // NAME

    if (
      lostName &&
      foundName &&
      clean(lostName) === clean(foundName)
    ) {
      score += 25;
    } else if (
      lostName &&
      foundName &&
      hasCommonWord(lostName, foundName)
    ) {
      score += 15;
    }

    // CATEGORY

    if (
      lostCategory &&
      foundCategory &&
      clean(lostCategory) === clean(foundCategory)
    ) {
      score += 25;
    }

    // COLOUR

    if (
      lostColour &&
      foundColour &&
      clean(lostColour) === clean(foundColour)
    ) {
      score += 15;
    }

    // BRAND

    if (
      lostBrand &&
      foundBrand &&
      clean(lostBrand) === clean(foundBrand)
    ) {
      score += 15;
    }

    // LOCATION

    if (
      lostLocation &&
      foundLocation &&
      clean(lostLocation) === clean(foundLocation)
    ) {
      score += 10;
    } else if (
      lostLocation &&
      foundLocation &&
      hasCommonWord(
        lostLocation,
        foundLocation
      )
    ) {
      score += 5;
    }

    // DATE

    if (
      lostDate &&
      foundDate &&
      clean(lostDate) === clean(foundDate)
    ) {
      score += 5;
    }

    // DESCRIPTION

    if (
      lostDetails &&
      foundDetails &&
      hasCommonWord(
        lostDetails,
        foundDetails
      )
    ) {
      score += 5;
    }

    return score;
  };

  // ===============================
  // LOAD FIREBASE DATA
  // ===============================

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
          (itemDoc) => ({
            id: itemDoc.id,
            ...itemDoc.data(),
          })
        );

        const found = foundSnapshot.docs.map(
          (itemDoc) => ({
            id: itemDoc.id,
            ...itemDoc.data(),
          })
        );

        setLostItems(lost);
        setFoundItems(found);

        const result = [];

        lost.forEach((lostItem) => {
          found.forEach((foundItem) => {
            const score = calculateScore(
              lostItem,
              foundItem
            );

            if (score >= 50) {
              const reasons = [];

              const lostName = getField(
                lostItem,
                ["name", "itemName"]
              );

              const foundName = getField(
                foundItem,
                ["name", "itemName"]
              );

              const lostCategory = getField(
                lostItem,
                ["category"]
              );

              const foundCategory = getField(
                foundItem,
                ["category"]
              );

              const lostColour = getField(
                lostItem,
                ["colour", "color"]
              );

              const foundColour = getField(
                foundItem,
                ["colour", "color"]
              );

              const lostBrand = getField(
                lostItem,
                ["brand"]
              );

              const foundBrand = getField(
                foundItem,
                ["brand"]
              );

              const lostLocation = getField(
                lostItem,
                ["location"]
              );

              const foundLocation = getField(
                foundItem,
                ["location"]
              );

              const lostDate = getField(
                lostItem,
                ["date"]
              );

              const foundDate = getField(
                foundItem,
                ["date"]
              );

              const lostDetails = getField(
                lostItem,
                ["details", "description"]
              );

              const foundDetails = getField(
                foundItem,
                ["details", "description"]
              );

              // NAME
              if (
                lostName &&
                foundName &&
                (
                  clean(lostName) === clean(foundName) ||
                  hasCommonWord(
                    lostName,
                    foundName
                  )
                )
              ) {
                reasons.push(
                  "Item name matches"
                );
              }

              // CATEGORY
              if (
                lostCategory &&
                foundCategory &&
                clean(lostCategory) ===
                  clean(foundCategory)
              ) {
                reasons.push(
                  "Category matches"
                );
              }

              // COLOUR
              if (
                lostColour &&
                foundColour &&
                clean(lostColour) ===
                  clean(foundColour)
              ) {
                reasons.push(
                  "Colour matches"
                );
              }

              // BRAND
              if (
                lostBrand &&
                foundBrand &&
                clean(lostBrand) ===
                  clean(foundBrand)
              ) {
                reasons.push(
                  "Brand matches"
                );
              }

              // LOCATION
              if (
                lostLocation &&
                foundLocation &&
                (
                  clean(lostLocation) ===
                    clean(foundLocation) ||
                  hasCommonWord(
                    lostLocation,
                    foundLocation
                  )
                )
              ) {
                reasons.push(
                  "Location matches"
                );
              }

              // DATE
              if (
                lostDate &&
                foundDate &&
                clean(lostDate) ===
                  clean(foundDate)
              ) {
                reasons.push(
                  "Date matches"
                );
              }

              // DESCRIPTION
              if (
                lostDetails &&
                foundDetails &&
                hasCommonWord(
                  lostDetails,
                  foundDetails
                )
              ) {
                reasons.push(
                  "Description has similar details"
                );
              }

              result.push({
                lost: lostItem,
                found: foundItem,
                score,
                reasons,
              });
            }
          });
        });

        result.sort(
          (a, b) => b.score - a.score
        );

        setMatches(result);
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

  // ===============================
  // START CHAT
  // ===============================

  const handleStartChat = async (match) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please login first.");
      return;
    }

    const lostUserId = match.lost.userId;
    const foundUserId = match.found.userId;

    if (!lostUserId || !foundUserId) {
      alert(
        "User information is missing for this match."
      );
      return;
    }

    // Only users involved in the match can chat

    if (
      currentUser.uid !== lostUserId &&
      currentUser.uid !== foundUserId
    ) {
      alert(
        "You can only chat about a match involving your account."
      );
      return;
    }

    // Create a unique chat for this exact match

    const chatId = [
      lostUserId,
      foundUserId,
      match.lost.id,
      match.found.id,
    ].join("_");

    try {
      await setDoc(
        doc(db, "chats", chatId),
        {
          participants: [
            lostUserId,
            foundUserId,
          ],

          lostItemId: match.lost.id,
          foundItemId: match.found.id,

          createdAt: new Date(),
        },
        { merge: true }
      );

      const otherUserId =
        currentUser.uid === lostUserId
          ? foundUserId
          : lostUserId;

      setChatUserName(
        otherUserId === foundUserId
          ? "Found Item User"
          : "Lost Item User"
      );

      setActiveChatId(chatId);

      setPage("chat");
    } catch (error) {
      console.error(
        "Error starting chat:",
        error
      );

      alert(
        "Could not start chat. Please try again."
      );
    }
  };

  // ===============================
  // CLAIM
  // ===============================

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
      await addDoc(
        collection(db, "claims"),
        claimData
      );

      if (addClaim) {
        addClaim(claimData);
      }

      alert(
        "Claim submitted successfully!"
      );
    } catch (error) {
      console.error(
        "Error creating claim:",
        error
      );

      alert(
        "Could not submit claim."
      );
    }
  };

  // ===============================
  // LOADING
  // ===============================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7ff",
        }}
      >
        <h2>
          🤖 AI is finding matches...
        </h2>
      </div>
    );
  }

  // ===============================
  // PAGE
  // ===============================

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f5f7ff, #faf5ff)",
        padding: "50px 30px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 16px",
              background: "#e8edff",
              color: "#315efb",
              borderRadius: "20px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            🤖 AI-POWERED MATCHING
          </div>

          <h1
            style={{
              fontSize: "42px",
              margin: "20px 0 10px",
            }}
          >
            AI Matches
          </h1>

          <p
            style={{
              color: "#667085",
              fontSize: "17px",
            }}
          >
            ReuniteAI compares lost and found
            items automatically.
          </p>
        </div>

        {/* NO MATCHES */}

        {matches.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "50px",
              borderRadius: "20px",
              textAlign: "center",
              boxShadow:
                "0 8px 25px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "55px",
              }}
            >
              🔍
            </div>
            <h2>
              No Live Matches Yet
            </h2>

            <p
              style={{
                color: "#667085",
              }}
            >
              When a lost item matches a found
              item, it will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* MATCH COUNT */}

            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "20px",
                marginBottom: "20px",
                boxShadow:
                  "0 8px 25px rgba(0,0,0,0.05)",
              }}
            >
              <h2>
                🎯 {matches.length} Potential{" "}
                {matches.length !== 1
                  ? "Matches"
                  : "Match"}
              </h2>

              <p
                style={{
                  color: "#667085",
                }}
              >
                AI compares item name, category,
                colour, brand, location, date
                and description.
              </p>
            </div>

            {/* MATCH CARDS */}

            {matches.map(
              (match, index) => (
                <MatchCard
                  key={`${match.lost.id}-${match.found.id}-${index}`}
                  match={match}
                  index={index}
                  handleClaim={handleClaim}
                  handleStartChat={handleStartChat}
                />
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AIMatches;