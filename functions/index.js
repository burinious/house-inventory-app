const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
admin.initializeApp();
sgMail.setApiKey("YOUR_SENDGRID_API_KEY");

exports.dailyLowStockNotification = functions.pubsub.schedule("every 24 hours").onRun(async () => {
  const usersSnap = await admin.firestore().collection("users").get();

  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const userEmail = userDoc.data().email;
    const inventorySnap = await admin.firestore().collection(`users/${userId}/items`).get();

    const lowStockItems = inventorySnap.docs
      .map(doc => doc.data())
      .filter(item => item.quantity <= (item.lowStockLimit ?? 1));

    if (lowStockItems.length > 0 && userEmail) {
      const itemList = lowStockItems.map(item => `${item.name} (Qty: ${item.quantity})`).join("\n");

      const msg = {
        to: userEmail,
        from: "yourapp@yourdomain.com",
        subject: "🚨 Low Stock Alert",
        text: `The following items are low in stock:\n\n${itemList}`,
      };

      try {
        await sgMail.send(msg);
        console.log(`Low stock email sent to ${userEmail}`);
      } catch (error) {
        console.error("Failed to send email", error);
      }
    }
  }

  return null;
});
