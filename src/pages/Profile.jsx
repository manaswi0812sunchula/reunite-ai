import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";

function Profile({ setPage }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [stats, setStats] = useState({
    lost: 0,
    found: 0,
    claims: 0,
  });

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    department: "",
    year: "",
    phone: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setPage("login");
        return;
      }

      setUser(currentUser);

      try {
        // Get user profile
        const userRef = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const data = userSnapshot.data();

          setProfile(data);

          setForm({
            name: data.name || "",
            department: data.department || "",
            year: data.year || "",
            phone: data.phone || "",
          });
        }

        // Get lost items
        const lostSnapshot = await getDocs(
          collection(db, "lostItems")
        );

        const userLostItems = lostSnapshot.docs.filter(
          (item) => item.data().userId === currentUser.uid
        );

        // Get found items
        const foundSnapshot = await getDocs(
          collection(db, "foundItems")
        );

        const userFoundItems = foundSnapshot.docs.filter(
          (item) => item.data().userId === currentUser.uid
        );

        // Get claims
        const claimsSnapshot = await getDocs(
          collection(db, "claims")
        );

        const userClaims = claimsSnapshot.docs.filter(
          (item) => item.data().userId === currentUser.uid
        );

        setStats({
          lost: userLostItems.length,
          found: userFoundItems.length,
          claims: userClaims.length,
        });
      } catch (error) {
        console.error("Error loading profile:", error);
      }

      setLoading(false);
    };

    loadProfile();
  }, [setPage]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const saveProfile = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please login first.");
      return;
    }

    setSaving(true);

    try {
      const userRef = doc(db, "users", currentUser.uid);

      const updatedProfile = {
        email: currentUser.email,
        name: form.name,
        department: form.department,
        year: form.year,
        phone: form.phone,
        updatedAt: new Date(),
      };

      await setDoc(
        userRef,
        updatedProfile,
        { merge: true }
      );

      setProfile((previousProfile) => ({
        ...previousProfile,
        ...updatedProfile,
      }));

      setEditing(false);

      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("Profile save error:", error);
      alert("Could not save profile. Please try again.");
    }

    setSaving(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setPage("login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Could not logout.");
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
          background: "#f8fafc",
          fontFamily: "Arial",
        }}
      >
        <h3>Loading profile...</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
        padding: "40px 20px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            color: "white",
            padding: "35px",
            borderRadius: "24px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(79,70,229,0.25)",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "white",
              color: "#4f46e5",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "40px",
              margin: "0 auto 15px",
            }}
          >
            👤
          </div>

          <h1 style={{ margin: "0 0 8px" }}>
            {profile.name || "ReuniteAI User"}
          </h1>

          <p style={{ margin: 0, opacity: 0.9 }}>
            {user?.email}
          </p>
        </div>

        {/* PROFILE INFORMATION */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "20px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0 }}>
              👤 Profile Information
            </h2>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#4f46e5",
                  color: "white",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <div style={{ display: "grid", gap: "16px" }}>
              <InputField
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />

              <InputField
                label="Department"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Example: EEE"
              />

              <InputField
                label="Year"
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="Example: 3rd Year"
              />

              <InputField
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                type="tel"
              />

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "5px",
                }}
              >
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  style={{
                    padding: "12px 22px",
                    border: "none",
                    borderRadius: "10px",
                    background: "#22c55e",
                    color: "white",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {saving ? "Saving..." : "💾 Save Changes"}
                </button>

                <button
                  onClick={() => {
                    setEditing(false);

                    setForm({
                      name: profile.name || "",
                      department: profile.department || "",
                      year: profile.year || "",
                      phone: profile.phone || "",
                    });
                  }}
                  style={{
                    padding: "12px 22px",
                    border: "1px solid #d1d5db",
                    borderRadius: "10px",
                    background: "white",
                    color: "#374151",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "15px",
              }}
            >
              <InfoRow
                label="Name"
                value={profile.name || "Not added"}
              />

              <InfoRow
                label="Email"
                value={user?.email || "Not available"}
              />

              <InfoRow
                label="Department"
                value={profile.department || "Not added"}
              />

              <InfoRow
                label="Year"
                value={profile.year || "Not added"}
              />

              <InfoRow
                label="Phone"
                value={profile.phone || "Not added"}
              />

              <InfoRow
                label="🔔 Notifications"
                value={
                  profile.notificationEnabled === false
                    ? "Disabled"
                    : "Enabled"
                }
                valueColor={
                  profile.notificationEnabled === false
                    ? "#ef4444"
                    : "#22c55e"
                }
              />
            </div>
          )}
        </div>

        {/* STATISTICS */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "20px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
            marginBottom: "25px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            📊 My Activity
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "15px",
            }}
          >
            <StatCard
              icon="🔴"
              title="Lost Reports"
              value={stats.lost}
            />

            <StatCard
              icon="🟢"
              title="Found Reports"
              value={stats.found}
            />

            <StatCard
              icon="🤝"
              title="Claims"
              value={stats.claims}
            />
          </div>
        </div>

        {/* NOTIFICATION AREAS */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "20px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
            marginBottom: "25px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            📍 Notification Areas
          </h2>

          {profile.notificationAreas?.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {profile.notificationAreas.map((area) => (
                <span
                  key={area}
                  style={{
                    padding: "8px 14px",
                    background: "#eef2ff",
                    color: "#4f46e5",
                    borderRadius: "20px",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  📍 {area}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: "#6b7280" }}>
              No notification areas selected.
            </p>
          )}
        </div>

        {/* BUTTONS */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setPage("notifications")}
            style={{
              padding: "13px 22px",
              border: "none",
              borderRadius: "12px",
              background: "#4f46e5",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🔔 Notification Settings
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: "13px 22px",
              border: "none",
              borderRadius: "12px",
              background: "#ef4444",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🚪 Logout
          </button>

          <button
            onClick={() => setPage("home")}
            style={{
              padding: "13px 22px",
              border: "1px solid #6366f1",
              borderRadius: "12px",
              background: "white",
              color: "#4f46e5",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ← Home
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "7px",
          fontWeight: "600",
          color: "#374151",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "12px 14px",
          border: "1px solid #d1d5db",
          borderRadius: "10px",
          fontSize: "15px",
          outline: "none",
        }}
      />
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueColor = "#6b7280",
}) {
  return (
    <div
      style={{
        padding: "15px",
        background: "#f8fafc",
        borderRadius: "12px",
      }}
    >
      <strong>{label}</strong>

      <div
        style={{
          marginTop: "5px",
          color: valueColor,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div
      style={{
        padding: "20px",
        background: "#f8fafc",
        borderRadius: "15px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "30px" }}>
        {icon}
      </div>

      <div
        style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "#4f46e5",
          marginTop: "5px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: "#6b7280",
          marginTop: "5px",
        }}
      >
        {title}
      </div>
    </div>
  );
}

export default Profile;