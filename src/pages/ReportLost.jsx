import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useState } from "react";


function ReportLost({ setPage, addLostItem }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    colour: "",
    brand: "",
    location: "",
    date: "",
    details: "",
    photo: "",
  });

  const handleChange = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.location) {
      alert("Please fill Item Name, Category and Location.");
      return;
    }

    try {
      // 1️⃣ Save lost item to Firestore
      const lostItemRef = await addDoc(
        collection(db, "lostItems"),
        {
          ...form,
          userId: auth.currentUser?.uid,
          createdAt: new Date(),
        }
      );

      // 2️⃣ Update the app immediately
      addLostItem({
        id: lostItemRef.id,
        ...form,
        createdAt: new Date(),
      });

      // 3️⃣ Create notification for this campus area
      await addDoc(
        collection(db, "notifications"),
        {
          type: "lost",
          title: "🔴 Lost Item Alert",
          message: `${form.name} was reported lost in ${form.location}.`,
          location: form.location,
          itemName: form.name,
          createdAt: new Date(),
        }
      );

      alert(
        `Lost item reported successfully!\n\n📍 Area: ${form.location}\n🔔 Area notification created!`
      );

      setPage("lostItems");

    } catch (error) {
      console.error("Error reporting lost item:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f8ff",
        fontFamily: "Arial, sans-serif",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "auto",
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 5px 25px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ color: "#315efb" }}>
          Report Lost Item
        </h1>

        <p style={{ color: "#667085" }}>
          Tell us about your lost item. ReuniteAI will use this
          information to find possible matches.
        </p>

        {/* ITEM NAME */}
        <label>Item Name</label>

        <input
          type="text"
          placeholder="Example: Black Laptop"
          value={form.name}
          onChange={(e) =>
            handleChange("name", e.target.value)
          }
          style={inputStyle}
        />

        {/* CATEGORY */}
        <label>Category</label>

        <select
          value={form.category}
          onChange={(e) =>
            handleChange("category", e.target.value)
          }
          style={inputStyle}
        >
          <option value="">Select category</option>
          <option>Laptop</option>
          <option>Mobile Phone</option>
          <option>Wallet</option>
          <option>Bag</option>
          <option>Books</option>
          <option>Water Bottle</option>
          <option>Charger</option>
          <option>ID Card</option>
          <option>Earphones</option>
          <option>Other</option>
        </select>

        {/* COLOUR */}
        <label>Colour</label>

        <input
          type="text"
          placeholder="Example: Black"
          value={form.colour}
          onChange={(e) =>
            handleChange("colour", e.target.value)
          }
          style={inputStyle}
        />

        {/* BRAND */}
        <label>Brand</label>

        <input
          type="text"
          placeholder="Example: Dell"
          value={form.brand}
          onChange={(e) =>
            handleChange("brand", e.target.value)
          }
          style={inputStyle}
        />

        {/* LOCATION */}
        <label>📍 Where did you lose it?</label>

        <select
          value={form.location}
          onChange={(e) =>
            handleChange("location", e.target.value)
          }
          style={inputStyle}
        >
          <option value="">
            Select campus area
          </option>

          <option>Admin Block</option>
          <option>EEE Block</option>
          <option>Library</option>
          <option>Canteen</option>
          <option>Laboratories</option>
          <option>Sports Ground</option>
          <option>Parking Area</option>
          <option>Hostel</option>
          <option>Other</option>
        </select>

        {/* DATE */}
        <label>Date & Time</label>

        <input
          type="datetime-local"
          value={form.date}
          onChange={(e) =>
            handleChange("date", e.target.value)
          }
          style={inputStyle}
        />

        {/* DETAILS */}
        <label>Additional Details</label>

        <textarea
          placeholder="Describe any unique feature..."
          rows="4"
          value={form.details}
          onChange={(e) =>
            handleChange("details", e.target.value)
          }
          style={inputStyle}
        />

        {/* PHOTO */}
        <label>Upload Item Photo</label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];

            if (!file) return;

            const reader = new FileReader();

            reader.onload = (event) => {
              const img = new Image();

              img.onload = () => {
                const canvas =
                  document.createElement("canvas");

                const maxWidth = 800;
                const maxHeight = 800;

                let width = img.width;
                let height = img.height;

                if (
                  width > maxWidth ||
                  height > maxHeight
                ) {
                  const ratio = Math.min(
                    maxWidth / width,
                    maxHeight / height
                  );

                  width = width * ratio;
                  height = height * ratio;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx =
                  canvas.getContext("2d");

                ctx.drawImage(
                  img,
                  0,
                  0,
                  width,
                  height
                );

                const compressedImage =
                  canvas.toDataURL(
                    "image/jpeg",
                    0.7
                  );

                handleChange(
                  "photo",
                  compressedImage
                );
              };

              img.src = event.target.result;
            };

            reader.readAsDataURL(file);
          }}
          style={inputStyle}
        />

        {/* PHOTO PREVIEW */}
        {form.photo && (
          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                color: "#667085",
                marginBottom: "8px",
              }}
            >
              Photo Preview:
            </p>

            <img
              src={form.photo}
              alt="Lost item"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "10px",
                border: "1px solid #ddd",
              }}
            />
          </div>
        )}

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "15px",
            marginTop: "15px",
            background:
              "linear-gradient(135deg, #315efb, #7c3aed)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          🔎 Find My Item
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  marginBottom: "20px",
  border: "1px solid #d0d5dd",
  borderRadius: "8px",
  boxSizing: "border-box",
};

export default ReportLost;