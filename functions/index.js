const { setGlobalOptions } = require("firebase-functions");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

setGlobalOptions({
  maxInstances: 10,
});

// Send a push notification when a new lost/found notification
// is created in Firestore.
exports.sendAreaNotification = onDocumentCreated(
  "notifications/{notificationId}",
  async (event) => {
    const notification = event.data?.data();

    if (!notification) {
      console.log("No notification data found.");
      return;
    }

    const location = notification.location;
    const title = notification.title || "ReuniteAI Notification";
    const body =
      notification.message ||
      "You have a new lost & found notification.";

    if (!location) {
      console.log("Notification has no location.");
      return;
    }

    console.log(`New notification for area: ${location}`);

    // Get users who selected this campus area.
    const usersSnapshot = await db
      .collection("users")
      .where("notificationAreas", "array-contains", location)
      .get();

    if (usersSnapshot.empty) {
      console.log(`No users subscribed to ${location}.`);
      return;
    }

    const tokens = [];

    usersSnapshot.forEach((userDoc) => {
      const userData = userDoc.data();

      if (
        userData.notificationEnabled === true &&
        userData.fcmToken
      ) {
        tokens.push(userData.fcmToken);
      }
    });

    if (tokens.length === 0) {
      console.log(`No active FCM tokens for ${location}.`);
      return;
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        location: String(location),
        type: String(notification.type || "general"),
        itemName: String(notification.itemName || ""),
      },
      tokens: tokens,
    };

    const response = await messaging.sendEachForMulticast(message);

    console.log(
      `Push notifications sent: ${response.successCount}`
    );

    console.log(
      `Push notifications failed: ${response.failureCount}`
    );

    // Remove invalid tokens so they aren't used again.
    const invalidTokens = [];

    response.responses.forEach((result, index) => {
      if (!result.success) {
        const errorCode = result.error?.code;

        if (
          errorCode === "messaging/registration-token-not-registered" ||
          errorCode === "messaging/invalid-registration-token"
        ) {
          invalidTokens.push(tokens[index]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      const cleanupPromises = [];

      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();

        if (invalidTokens.includes(userData.fcmToken)) {
          cleanupPromises.push(
            db.collection("users").doc(userDoc.id).update({
              fcmToken: admin.firestore.FieldValue.delete(),
              notificationEnabled: false,
            })
          );
        }
      });

      await Promise.all(cleanupPromises);
    }
  }
);