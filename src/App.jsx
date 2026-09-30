import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebase";

import Home from "./pages/Home";
import ReportLost from "./pages/ReportLost";
import ReportFound from "./pages/ReportFound";
import LostItems from "./pages/LostItems";
import FoundItems from "./pages/FoundItems";
import AIMatches from "./pages/AIMatches";
import Claims from "./pages/Claims";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Chat from "./pages/chat";

function App() {
  const [page, setPage] = useState("login");
  const [activeChatId, setActiveChatId] = useState(null);
const [chatUserName, setChatUserName] = useState("User");
  
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setPage("home");
    } else {
      setPage("login");
    }
  });

  return () => unsubscribe();
}, []);

  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [claims, setClaims] = useState([]);

  // Load saved data from Firebase when app starts
  useEffect(() => {
    const loadData = async () => {
      try {
        const lostSnapshot = await getDocs(
          collection(db, "lostItems")
        );

        const savedLostItems = lostSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setLostItems(savedLostItems);

        const foundSnapshot = await getDocs(
          collection(db, "foundItems")
        );

        const savedFoundItems = foundSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFoundItems(savedFoundItems);

      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  const addLostItem = (item) => {
    setLostItems((previousItems) => [
      ...previousItems,
      item,
    ]);
  };

  const addFoundItem = (item) => {
    setFoundItems((previousItems) => [
      ...previousItems,
      item,
    ]);
  };

  const addClaim = (claim) => {
    setClaims((previousClaims) => [
      ...previousClaims,
      claim,
    ]);
  };
if (page === "login") {
  return <Login setPage={setPage} />;
}
  if (page === "lost") {
    return (
      <div>
        <ReportLost
          setPage={setPage}
          addLostItem={addLostItem}
        />
        <BackButton setPage={setPage} />
      </div>
    );
  }

  if (page === "found") {
    return (
      <div>
        <ReportFound
          setPage={setPage}
          addFoundItem={addFoundItem}
        />
        <BackButton setPage={setPage} />
      </div>
    );
  }

  if (page === "lostItems") {
    return (
      <div>
        <LostItems lostItems={lostItems} />
        <BackButton setPage={setPage} />
      </div>
    );
  }

  if (page === "foundItems") {
    return (
      <div>
        <FoundItems foundItems={foundItems} />
        <BackButton setPage={setPage} />
      </div>
    );
  }
  if (page === "chat")
  return (
    <Chat
      chatId={activeChatId}
      otherUserName={chatUserName}
      setPage={setPage}
    />
  );

  if (page === "aiMatches") {
    return (
      <div>
        <AIMatches
  lostItems={lostItems}
  foundItems={foundItems}
  addClaim={addClaim}
  setPage={setPage}
  setActiveChatId={setActiveChatId}
  setChatUserName={setChatUserName}
/>
        <BackButton setPage={setPage} />
      </div>
    );
  }

  if (page === "claims") {
    return (
      <div>
        <Claims
          claims={claims}
          setClaims={setClaims}
        />
        <BackButton setPage={setPage} />
      </div>
    );
  }
  if (page === "notifications") {
  return (
    <div>
      <Notifications />
      <BackButton setPage={setPage} />
    </div>
  );
}
if (page === "profile") return (
  <div>
    <Profile setPage={setPage} />
    <BackButton setPage={setPage} />
  </div>
);

  if (page === "admin") {
    return (
      <div>
        <Admin
          claims={claims}
          setClaims={setClaims}
        />
        <BackButton setPage={setPage} />
      </div>
    );
  }

  if (page === "analytics") {
    return (
      <div>
        <Analytics
          lostItems={lostItems}
          foundItems={foundItems}
          claims={claims}
        />
        <BackButton setPage={setPage} />
      </div>
    );
  }

  return <Home setPage={setPage} />;
}

function BackButton({ setPage }) {
  return (
    <button
      onClick={() => setPage("home")}
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        padding: "10px 20px",
        background: "#315efb",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        zIndex: 9999,
      }}
    >
      ← Back
    </button>
  );
}

export default App;