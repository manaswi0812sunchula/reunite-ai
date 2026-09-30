import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

function ReportFound({ setPage, addFoundItem }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    colour: "",
    brand: "",
    location: "",
    date: "",
    finder: "",
    contact: "",
    details: "",
    photo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");

        const maxWidth = 800;
        const maxHeight = 800;

        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(
            maxWidth / width,
            maxHeight / height
          );

          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        const compressedImage = canvas.toDataURL(
          "image/jpeg",
          0.7
        );

        setForm((previousForm) => ({
          ...previousForm,
          photo: compressedImage,
        }));
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.location) {
      alert("Please fill Item Name, Category and Location.");
      return;
    }

    try {
      // 1️⃣ Save found item to Firestore
      const foundItemRef = await addDoc(
        collection(db, "foundItems"),
        {
          name: form.name,
          category: form.category,
          colour: form.colour,
          brand: form.brand,
          location: form.location,
          date: form.date,
          finder: form.finder,
          contact: form.contact,
          details: form.details,
          photo: form.photo,

          // 👤 Save the logged-in user's ID
          userId: auth.currentUser?.uid,

          createdAt: new Date(),
        }
      );

      // 2️⃣ Update app immediately
      addFoundItem({
        id: foundItemRef.id,
        ...form,
        userId: auth.currentUser?.uid,
        createdAt: new Date(),
      });

      // 3️⃣ Create notification for the campus area
      await addDoc(
        collection(db, "notifications"),
        {
          type: "found",
          title: "🟢 Found Item Alert",
          message: `${form.name} was found in ${form.location}.`,
          location: form.location,
          itemName: form.name,
          createdAt: new Date(),
        }
      );

      alert(
        `Found item reported successfully!\n\n📍 Area: ${form.location}\n🔔 Area notification created!`
      );

      setPage("foundItems");

    } catch (error) {
      console.error("Firebase error:", error);
      alert("Could not save the found item.");
    }
  };

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
          maxWidth: "700px",
          margin: "auto",
          background:
            "linear-gradient(135deg, #ecfdf5, #d1fae5)",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ color: "#315efb" }}>
          🔎 Report Found Item
        </h1>

        <p style={{ color: "#667085" }}>
          Help return a lost item to its owner.
        </p>

        {/* ITEM NAME */}
        <input
          name="name"
          placeholder="Item Name"
          value={form.name}
          onChange={handleChange}
          style={inputStyle}
        />

        {/* CATEGORY */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="">Select Category</option>
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
        <input
          name="colour"
          placeholder="Colour"
          value={form.colour}
          onChange={handleChange}
          style={inputStyle}
        />

        {/* BRAND */}
        <input
          name="brand"
          placeholder="Brand"
          value={form.brand}
          onChange={handleChange}
          style={inputStyle}
        />

        {/* LOCATION */}
        <label
          style={{
            display: "block",
            marginTop: "12px",
            fontWeight: "bold",
          }}
        >
          📍 Where did you find it?
        </label>

        <select
          name="location"
          value={form.location}
          onChange={handleChange}
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
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          style={inputStyle}
        />

        {/* FINDER */}
        <input
          name="finder"
          placeholder="Finder Name"
          value={form.finder}
          onChange={handleChange}
          style={inputStyle}
        />

        {/* CONTACT */}
        <input
          name="contact"
          placeholder="Contact"
          value={form.contact}
          onChange={handleChange}
          style={inputStyle}
        />

        {/* DETAILS */}
        <textarea
          name="details"
          placeholder="Additional Details"
          value={form.details}
          onChange={handleChange}
          rows="4"
          style={inputStyle}
        />

        {/* PHOTO */}
        <input
          type="file"
          name="photo"
          accept="image/*"
          onChange={handleImageChange}
          style={{
            marginTop: "10px",
            marginBottom: "20px",
          }}
        />

        {/* PHOTO PREVIEW */}
        {form.photo && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ color: "#667085" }}>
              Selected Photo:
            </p>

            <img
              src={form.photo}
              alt="Found item"
              style={{
                width: "200px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </div>
        )}

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "14px",
            background: "#315efb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          🔎 Report Found Item
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "12px",
  border: "1px solid #d0d5dd",
  borderRadius: "8px",
  boxSizing: "border-box",
};

export default ReportFound;