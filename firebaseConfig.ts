import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// =====================================================================================
// === CRITICAL SETUP REQUIRED =======================================================
// =====================================================================================
//
// To connect the application to your Google Cloud database (Firestore), you MUST
// replace the placeholder values below with your actual Firebase project configuration.
//
// HOW TO GET YOUR CONFIGURATION:
//
// 1. Go to the Firebase Console: https://console.firebase.google.com/
// 2. Select your project (or create a new one).
// 3. In the project overview, click the gear icon (⚙️) next to "Project Overview" and select "Project settings".
// 4. In the "General" tab, scroll down to the "Your apps" section.
// 5. If you haven't created a web app yet, click the web icon (</>) to create one.
// 6. In your web app's settings, find the "Firebase SDK snippet" section and select "Config".
// 7. You will see an object like the one below. Copy the values (apiKey, authDomain, etc.)
//    and paste them here, replacing the placeholder strings like "YOUR_API_KEY".
//
// =====================================================================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // <-- PASTE YOURS HERE
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // <-- PASTE YOURS HERE
  projectId: "YOUR_PROJECT_ID", // <-- PASTE YOURS HERE
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // <-- PASTE YOURS HERE
  messagingSenderId: "YOUR_SENDER_ID", // <-- PASTE YOURS HERE
  appId: "YOUR_APP_ID" // <-- PASTE YOURS HERE
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
