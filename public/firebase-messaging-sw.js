importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "BGtmfEXb8VCrLfnipfZ3vyhJp06NSH0vq_yj5e5B5tg0CUbYpYJGSMi5vk_mVReQ7TVQ8N_oMT57z3FTgL0AM7M",
  authDomain: "reuniteai-def13.firebaseapp.com",
  projectId: "reuniteai-def13",
  storageBucket: "reuniteai-def13.firebasestorage.app",
  messagingSenderId: "216196915411",
  appId: "1:216196915411:web:7caced9d9b219129117426",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background notification received:", payload);

  const notificationTitle =
    payload.notification?.title || "ReuniteAI Notification";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      "You have a new lost & found notification.",
    icon: "/favicon.ico",
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});