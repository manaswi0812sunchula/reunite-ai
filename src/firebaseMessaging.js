import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import app, { db, auth } from "./firebase";

const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

   if (permission !== "granted") {
  console.log("Notification permission was not granted.");
  return null;
}

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    const token = await getToken(messaging, {
      vapidKey: "BGtmfEXb8VCrLfnipfZ3vyhJp06NSH0vq_yj5e5B5tg0CUbYpYJGSMi5vk_mVReQ7TVQ8N_oMT57z3FTgL0AM7M",
      serviceWorkerRegistration: registration,
    });

    if (token) {
      const user = auth.currentUser;

      if (user) {
        await setDoc(
          doc(db, "users", user.uid),
          {
            fcmToken: token,
            notificationEnabled: true,
            updatedAt: new Date(),
          },
          { merge: true }
        );

        alert("🔔 Push notifications enabled successfully!");
      }

      return token;
    }

    return null;
  } catch (error) {
    console.error("FCM setup error:", error);
    alert("Push notification setup failed. Check the browser console.");
    return null;
  }
};

export const listenForMessages = () => {
  onMessage(messaging, (payload) => {
    console.log("Foreground notification:", payload);
  });
};