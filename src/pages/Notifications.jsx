import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";

function Notifications() {
  const areas = [
    "Admin Block",
    "EEE Block",
    "Library",
    "Canteen",
    "Laboratories",
    "Sports Ground",
    "Parking Area",
    "Hostel",
    "Other",
  ];

  const [notifications, setNotifications] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState(areas);
  const [loadingPreferences, setLoadingPreferences] = useState(true);

  // Load notifications in real time
  useEffect(() => {
    const notificationsQuery = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotifications(data);
      },
      (error) => {
        console.error("Notification error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Load user's notification preferences from Firebase
  useEffect(() => {
    const loadPreferences = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoadingPreferences(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();

          if (
            userData.notificationAreas &&
            userData.notificationAreas.length > 0
          ) {
            setSelectedAreas(userData.notificationAreas);
          } else {
            await setDoc(
              userRef,
              {
                email: user.email,
                notificationAreas: areas,
                updatedAt: new Date(),
              },
              { merge: true }
            );
          }
        } else {
          await setDoc(
            userRef,
            {
              email: user.email,
              notificationAreas: areas,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            { merge: true }
          );
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }

      setLoadingPreferences(false);
    };

    loadPreferences();
  }, []);

  // Change selected area
  const toggleArea = async (area) => {
  const user = auth.currentUser;

  if (!user) {
    alert("Please login first.");
    return;
  }

  let updatedAreas;

  if (selectedAreas.includes(area)) {
    updatedAreas = selectedAreas.filter(
      (selectedArea) => selectedArea !== area
    );
  } else {
    updatedAreas = [...selectedAreas, area];
  }

  try {
    const userRef = doc(db, "users", user.uid);

    await setDoc(
      userRef,
      {
        notificationAreas: updatedAreas,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    setSelectedAreas(updatedAreas);

    alert(`${area} notification preference saved!`);
  } catch (error) {
    console.error("Firebase save error:", error);
    alert("Could not save preference. Check Firebase permissions.");
  }
};

  const filteredNotifications = notifications.filter((notification) =>
    selectedAreas.includes(notification.location)
  );

  if (loadingPreferences) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Arial",
        }}
      >
        <h3>Loading notifications...</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px 20px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          🔔 Notifications
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginBottom: "30px",
          }}
        >
          Choose the campus areas you want to receive notifications from.
        </p>

        {/* Area Preferences */}
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            marginBottom: "30px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            📍 Notification Areas
          </h3>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {areas.map((area) => {
              const selected = selectedAreas.includes(area);

              return (
                <button
                  key={area}
                  onClick={() => toggleArea(area)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "20px",
                    border: "1px solid #6366f1",
                    background: selected ? "#6366f1" : "white",
                    color: selected ? "white" : "#6366f1",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  {selected ? "✓ " : ""}
                  {area}
                </button>
              );
            })}
          </div>

          <p
            style={{
              marginTop: "15px",
              marginBottom: 0,
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Your preferences are saved to your Firebase account.
          </p>
        </div>

        {/* Notifications */}
        {filteredNotifications.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "16px",
              textAlign: "center",
              boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: "45px" }}>🔕</div>

            <h3>No notifications</h3>

            <p style={{ color: "#6b7280" }}>
              No lost or found item alerts are available for your selected
              areas.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "16px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                  borderLeft:
                    notification.type === "lost"
                      ? "5px solid #ef4444"
                      : "5px solid #22c55e",
                }}
              >
                <h3 style={{ marginTop: 0 }}>
                  {notification.title}
                </h3>

                <p style={{ color: "#374151" }}>
                  {notification.message}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    flexWrap: "wrap",
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  <span>📍 {notification.location}</span>

                  <span>📦 {notification.itemName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;