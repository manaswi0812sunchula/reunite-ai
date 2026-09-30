function LostItems({ lostItems }) {
  const demoItems = [
    {
      name: "Black Dell Laptop",
      category: "Laptop",
      location: "College Library",
      date: "27 Sep 2026, 10:30 AM",
      status: "Searching",
    },
    {
      name: "Blue Water Bottle",
      category: "Water Bottle",
      location: "EEE Block",
      date: "26 Sep 2026, 2:15 PM",
      status: "Match Found",
    },
    {
      name: "Black Wallet",
      category: "Wallet",
      location: "College Canteen",
      date: "25 Sep 2026, 1:00 PM",
      status: "Searching",
    },
  ];

  const allItems = [...demoItems, ...(lostItems || [])];

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
        <h1 style={{ color: "#315efb" }}>Lost Items</h1>

        <p style={{ color: "#667085" }}>
          Items reported lost by students on campus.
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

              <h2 style={{ marginBottom: "8px" }}>
                {item.name}
              </h2>

              <p>📂 Category: {item.category}</p>

              <p>📍 Lost at: {item.location}</p>

              <p>🕐 {item.date || "Date not provided"}</p>

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
                  background: "#fff3cd",
                  color: "#946200",
                  fontWeight: "bold",
                }}
              >
                {item.status || "Searching"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LostItems;