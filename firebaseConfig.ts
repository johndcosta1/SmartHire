import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Configuration for the public SmartHire Firebase Realtime Database.
// This connects the application to the live data source provided by the user.
const firebaseConfig = {
  databaseURL: "https://smarthire-72866-default-rtdb.firebaseio.com/",
  projectId: "smarthire-72866", // Derived from the databaseURL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const db = getDatabase(app);
