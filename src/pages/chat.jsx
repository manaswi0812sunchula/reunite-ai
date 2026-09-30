import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

function Chat({ chatId, otherUserName = "User", setPage }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(
      db,
      "chats",
      chatId,
      "messages"
    );

    const messagesQuery = query(
      messagesRef,
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const loadedMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMessages(loadedMessages);
      },
      (error) => {
        console.error("Error loading messages:", error);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    const text = message.trim();

    if (!text) return;

    const user = auth.currentUser;

    if (!user) {
      alert("Please login first.");
      return;
    }

    if (!chatId) {
      alert("Chat could not be opened.");
      return;
    }

    try {
      await addDoc(
        collection(db, "chats", chatId, "messages"),
        {
          text,
          senderId: user.uid,
          senderEmail: user.email || "",
          timestamp: serverTimestamp(),
        }
      );

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Message could not be sent. Please try again.");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f5f7ff, #faf5ff)",
        padding: "30px 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "white",
          borderRadius: "22px",
          overflow: "hidden",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            background:
              "linear-gradient(135deg, #4f46e5, #7c3aed)",
            color: "white",
            padding: "22px 25px",
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <button
            onClick={() => setPage("aiMatches")}
            style={{
              background: "rgba(255,255,255,0.18)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "9px 13px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ←
          </button>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
              }}
            >
              💬 ReuniteAI Chat
            </h2>

            <p
              style={{
                margin: "4px 0 0",
                opacity: 0.9,
                fontSize: "13px",
              }}
            >
              Chat with {otherUserName}
            </p>
          </div>
        </div>

        {/* MESSAGES */}

        <div
          style={{
            height: "55vh",
            minHeight: "400px",
            overflowY: "auto",
            padding: "25px",
            background: "#f8faff",
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "#667085",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "45px",
                    marginBottom: "10px",
                  }}
                >
                  💬
                </div>

                <h3
                  style={{
                    margin: 0,
                    color: "#344054",
                  }}
                >
                  Start the conversation
                </h3>

                <p>
                  Send a message to discuss the
                  matched item.
                </p>
              </div>
            </div>
          ) : (
            messages.map((item) => {
              const isMine =
                item.senderId === auth.currentUser?.uid;

              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: isMine
                      ? "flex-end"
                      : "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "11px 15px",
                      borderRadius: isMine
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                      background: isMine
                        ? "#6366f1"
                        : "white",
                      color: isMine
                        ? "white"
                        : "#344054",
                      boxShadow:
                        "0 3px 10px rgba(0,0,0,0.06)",
                      wordBreak: "break-word",
                    }}
                  >
                    {!isMine && (
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          marginBottom: "4px",
                          color: "#6366f1",
                        }}
                      >
                        {item.senderEmail || "User"}
                      </div>
                    )}

                    <div>{item.text}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MESSAGE INPUT */}

        <div
          style={{
            padding: "18px",
            borderTop: "1px solid #eaecf0",
            display: "flex",
            gap: "10px",
            background: "white",
          }}
        >
          <textarea
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows="1"
            style={{
              flex: 1,
              resize: "none",
              padding: "12px 14px",
              border: "1px solid #d0d5dd",
              borderRadius: "12px",
              outline: "none",
              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
            }}
          />

          <button
            onClick={sendMessage}
            style={{
              padding: "0 20px",
              border: "none",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: "white",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;