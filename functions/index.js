const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const cors = require("cors")({origin: true});

admin.initializeApp();

// IMPORTANT: Set these in your Firebase environment configuration
// firebase functions:config:set razorpay.key_id="YOUR_KEY_ID" razorpay.key_secret="YOUR_KEY_SECRET" razorpay.webhook_secret="YOUR_WEBHOOK_SECRET"
const razorpayConfig = functions.config().razorpay;

if (!razorpayConfig || !razorpayConfig.key_id || !razorpayConfig.key_secret) {
  console.error("Razorpay API keys are not configured. Please set them in Firebase environment configuration.");
}

const razorpay = new Razorpay({
  key_id: razorpayConfig ? razorpayConfig.key_id : 'YOUR_KEY_ID', // Fallback for local testing, but env vars are preferred
  key_secret: razorpayConfig ? razorpayConfig.key_secret : 'YOUR_KEY_SECRET',
});

// TODO: IMPORTANT - Upload your 'hopeJee.pdf' to the root of your Firebase Storage bucket.
// The project ID is 'awesome-9ddc4', so the bucket is 'awesome-9ddc4.appspot.com'.
// The path in storage should be 'hopeJee.pdf'.
const PDF_FILE_PATH = 'hopeJee.pdf'; // Exact path within Firebase Storage (root of bucket, case-sensitive)
const PDF_FILE_NAME = 'hopeJee.pdf'; // The name the file will have when downloaded

exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated if needed, or implement other checks
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  // }

  // Validate input data structure
  if (!data || typeof data !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Request data must be an object containing amount and optional currency.');
  }

  const amount = data.amount; // Amount in paise (e.g., 50000 for INR 500.00)
  const currency = data.currency || "INR";

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'The "amount" argument must be a positive number (in paise).');
  }

  if (currency && typeof currency !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'The "currency" argument must be a string if provided.');
  }

  const options = {
    amount: amount,
    currency: currency,
    receipt: `receipt_order_${Date.now()}`,
    payment_capture: 1, // Auto capture payment
  };

  try {
    const order = await razorpay.orders.create(options);
    console.log("Razorpay Order Created:", order);
    return { orderId: order.id, amount: order.amount, currency: order.currency };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw new functions.https.HttpsError("internal", "Could not create Razorpay order.", error.message);
  }
});

exports.handleRazorpayWebhook = functions.https.onRequest(async (req, res) => {
  console.log("handleRazorpayWebhook: Function triggered.");
  console.log("handleRazorpayWebhook: Request headers:", JSON.stringify(req.headers));
  console.log("handleRazorpayWebhook: Request body (raw):", JSON.stringify(req.body));
  console.log("handleRazorpayWebhook: Request method:", req.method);
  
  // Immediately process webhook to minimize delay
  cors(req, res, async () => {
    console.log("handleRazorpayWebhook: After CORS processing. Request body:", JSON.stringify(req.body));
    console.log("Webhook received:", req.body);
    
    // Prioritize signature verification and payment processing
    const secret = razorpayConfig ? razorpayConfig.webhook_secret : 'YOUR_WEBHOOK_SECRET';
    if (!secret) {
        console.error("Razorpay webhook secret is not configured.");
        return res.status(500).send("Webhook secret not configured.");
    }

    try {
      const crypto = require("crypto");
      const shasum = crypto.createHmac("sha256", secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest("hex");

      if (digest === req.headers["x-razorpay-signature"]) {
        console.log("Webhook signature verified.");
        const event = req.body.event;
        const paymentEntity = req.body.payload.payment.entity;

        if (event === "payment.captured") {
          const paymentId = paymentEntity.id;
          const orderId = paymentEntity.order_id;
          const amount = paymentEntity.amount;
          const currency = paymentEntity.currency;
          const email = paymentEntity.email;
          const contact = paymentEntity.contact;

          // Store payment details in Firestore with additional validation
          const paymentRef = admin.firestore().collection("payments").doc(paymentId);
          await admin.firestore().runTransaction(async (transaction) => {
            const doc = await transaction.get(paymentRef);
            
            if (!doc.exists) {
              transaction.set(paymentRef, {
                orderId,
                paymentId,
                amount,
                currency,
                email,
                contact,
                status: "captured",
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                webhookVerified: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              });
              console.log(`Payment ${paymentId} for order ${orderId} successfully recorded.`);
              
              // Immediately notify client-side of successful payment
              await admin.firestore().collection('payment_status').doc(paymentId).set({
                status: 'processed',
                timestamp: admin.firestore.FieldValue.serverTimestamp()
              });
            } else {
              console.log(`Payment ${paymentId} already exists in Firestore, skipping duplicate record.`);
            }
          });
          console.log(`Payment ${paymentId} for order ${orderId} successfully recorded.`);
        }
        res.status(200).send("Webhook processed successfully.");
      } else {
        console.warn("Webhook signature mismatch.");
        console.log("Calculated digest:", digest);
        console.log("Received signature:", req.headers["x-razorpay-signature"]);
        res.status(400).send("Invalid signature.");
      }
    } catch (error) {
      console.error("Error processing Razorpay webhook:", error);
      res.status(500).send("Error processing webhook.");
    }
  });
});

exports.getSecurePdfLink = functions.https.onCall(async (data, context) => {
  console.log("getSecurePdfLink function invoked with data:", data, "and context:", context);
  // For guest checkout, authentication is not strictly required to get the PDF link.
  // We will verify the purchase using the paymentId.
  // const userId = context.auth ? context.auth.uid : null; // Optional: capture userId if user is logged in, but not used for guest PDF link retrieval
  const paymentId = data.paymentId; // Expect paymentId from the client

  if (!paymentId) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "paymentId" argument.');
  }

  try {
    // Verify payment status in Firestore
    const paymentDoc = await admin.firestore().collection("payments").doc(paymentId).get();

    if (!paymentDoc.exists) {
      console.log(`Payment record not found for paymentId: ${paymentId}`);
      throw new functions.https.HttpsError('not-found', 'Payment record not found.');
    }

    const paymentData = paymentDoc.data();

    // Check if payment was successful and webhook verified
    // Add additional checks, e.g., if the user making the request is the one who paid
    if (paymentData.status !== 'captured' || !paymentData.webhookVerified) {
      console.log(`Payment not confirmed or webhook not verified for paymentId: ${paymentId}`);
      throw new functions.https.HttpsError('failed-precondition', 'Payment not confirmed or verification failed.');
    }

    // Check if the user requesting the link is the one who made the payment (optional but recommended)
    // This requires storing userId or email with the payment record and comparing
    // For example, if you stored context.auth.uid during payment recording:
    // if (paymentData.userId !== userId) {
    //   throw new functions.https.HttpsError('permission-denied', 'You are not authorized to download this file.');
    // }

    const BUCKET_NAME = "awesome-9ddc4.firebasestorage.app"; // Explicitly set, matching firebase-config.js storageBucket
    console.log(`Using explicit bucket name for Firebase Storage: '${BUCKET_NAME}'`);
    const bucket = admin.storage().bucket(BUCKET_NAME);

    // Ensure PDF_FILE_PATH is just the filename/path within the bucket
    const resolvedPdfPath = PDF_FILE_PATH.startsWith('gs://') 
        ? PDF_FILE_PATH.substring(PDF_FILE_PATH.indexOf('/', 5) + 1) 
        : PDF_FILE_PATH;
    
    console.log(`Attempting to access file: '${resolvedPdfPath}' in bucket: '${bucket.name}'. (Using PDF_FILE_PATH constant: '${PDF_FILE_PATH}')`);
    const file = bucket.file(resolvedPdfPath); // resolvedPdfPath is the path of the file within the bucket

    // Check if file exists
    const fullFileObjectPathForLogging = `projects/_/buckets/${bucket.name}/objects/${file.name}`; // For clearer logging
    console.log(`Checking existence for Storage object: '${file.name}' in bucket '${bucket.name}'. SDK effectively checks a path like: ${fullFileObjectPathForLogging}`);
    const [exists] = await file.exists();
    console.log(`File '${resolvedPdfPath}' in bucket '${bucket.name}' actually exists (according to SDK): ${exists}`);
    if (!exists) {
        console.error(`PDF file NOT FOUND. Searched for: '${resolvedPdfPath}' in bucket '${bucket.name}'. The SDK checked for an object similar to '${fullFileObjectPathForLogging}'. Please meticulously verify the filename (it IS case-sensitive) and ensure it's located at the root of this specific bucket in your Firebase Storage console.`);
        throw new functions.https.HttpsError('not-found', 'The requested PDF file does not exist. Please verify the filename (case-sensitive) and its location in Firebase Storage.');
    }

    // Generate a signed URL for the PDF, valid for a short period (e.g., 5 minutes)
    const signedUrlConfig = {
      action: 'read',
      expires: Date.now() + 3 * 60 * 1000, // 5 minutes
      // Optional: Force download with a specific filename
      responseDisposition: `attachment; filename="${PDF_FILE_NAME}"`
    };

    const [url] = await file.getSignedUrl(signedUrlConfig);
    console.log(`Generated signed URL for ${PDF_FILE_PATH}: ${url}`);
    return { downloadUrl: url };

  } catch (error) {
    console.error("Error generating secure PDF link:", error);
    if (error instanceof functions.https.HttpsError) {
        throw error; // Re-throw HttpsError instances directly
    }
    throw new functions.https.HttpsError("internal", "Could not generate PDF link.", error.message);
  }
});