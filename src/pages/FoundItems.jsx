function FoundItems({ foundItems }) {
  const demoItems = [
    {
      name: "Black Wireless Earphones",
      category: "Earphones",
      location: "College Cafeteria",
      date: "27 Sep 2026, 12:15 PM",
      finder: "Rahul",
      status: "Unclaimed",
    },
    {
      name: "Blue Student ID Card",
      category: "ID Card",
      location: "EEE Block",
      date: "27 Sep 2026, 9:40 AM",
      finder: "Ananya",
      status: "Claim Pending",
    },
    {
      name: "Grey Laptop Charger",
      category: "Charger",
      location: "Library",
      date: "26 Sep 2026, 4:20 PM",
      finder: "Kiran",
      status: "Unclaimed",
    },
  ];

  const allItems = [...demoItems, ...(foundItems || [])];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f8ff",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "auto" }}>
        <h1 style={{ color: "#315efb" }}>Found Items</h1>

        <p style={{ color: "#667085" }}>
          Items found and reported by students on campus.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          {allItems.map((item, index) => (
            <div
              key={index}
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "16px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  height: "130px",
                  background: "#eef2ff",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  overflow: "hidden",
                }}
              >
                {item.photo ? (
                  <img
                    src={item.photo}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "50px" }}>📦</span>
                )}
              </div>

              <h2>{item.name}</h2>

              <p>📂 Category: {item.category}</p>

              <p>📍 Found at: {item.location}</p>

              <p>🕐 {item.date || "Date not provided"}</p>

              <p>👤 Found by: {item.finder || "Not provided"}</p>

              {item.colour && (
                <p>🎨 Colour: {item.colour}</p>
              )}

              {item.brand && (
                <p>🏷️ Brand: {item.brand}</p>
              )}

              {item.details && (
                <p>📝 {item.details}</p>
              )}

              <span
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "7px 12px",
                  borderRadius: "20px",
                  background:
                    item.status === "Claim Pending"
                      ? "#fff3cd"
                      : "#dcfae6",
                  color:
                    item.status === "Claim Pending"
                      ? "#946200"
                      : "#067647",
                  fontWeight: "bold",
                }}
              >
                {item.status || "Unclaimed"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FoundItems;