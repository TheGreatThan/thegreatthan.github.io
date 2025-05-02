// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, updateDoc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOHzXTjtzP8vwcyFqGRaF0aeULatnZ2GI",
  authDomain: "coffee-shop-340.firebaseapp.com",
  projectId: "coffee-shop-340",
  storageBucket: "coffee-shop-340.firebasestorage.app",
  messagingSenderId: "278780128070",
  appId: "1:278780128070:web:f4772813501a2f8d779347",
  measurementId: "G-BWX4S0FSPZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Cloud Storage utility
const cloudStorage = {
  // Save menu items to Firestore
  saveMenu: async function(menuItems) {
    try {
      await setDoc(doc(db, "settings", "menu"), {
        items: menuItems,
        lastUpdated: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error saving menu: ", error);
      return false;
    }
  },

  // Load menu items from Firestore
  loadMenu: async function() {
    try {
      const menuDoc = await getDoc(doc(db, "settings", "menu"));
      if (menuDoc.exists()) {
        return menuDoc.data().items;
      } else {
        // Return default menu if no menu exists in the database
        return [
          { id: 1, name: 'Espresso', price: 3.50, category: 'coffee', available: true },
          { id: 2, name: 'Cappuccino', price: 4.50, category: 'coffee', available: true },
          { id: 3, name: 'Latte', price: 4.75, category: 'coffee', available: true },
          { id: 4, name: 'Green Tea', price: 3.25, category: 'tea', available: true },
          { id: 5, name: 'Black Tea', price: 3.25, category: 'tea', available: true },
          { id: 6, name: 'Croissant', price: 2.75, category: 'pastry', available: true },
          { id: 7, name: 'Chocolate Muffin', price: 3.00, category: 'pastry', available: true }
        ];
      }
    } catch (error) {
      console.error("Error loading menu: ", error);
      return null;
    }
  },

  // Listen for menu changes
  listenForMenuChanges: function(callback) {
    return onSnapshot(doc(db, "settings", "menu"), (doc) => {
      if (doc.exists()) {
        callback(doc.data().items);
      }
    });
  },

  // Save an order to Firestore
  saveOrder: async function(order) {
    try {
      const result = await addDoc(collection(db, "orders"), {
        ...order,
        timestamp: serverTimestamp()
      });
      return result.id; // Returns the Firestore document ID
    } catch (error) {
      console.error("Error saving order: ", error);
      return null;
    }
  },

  // Load all orders from Firestore
  loadOrders: async function() {
    try {
      const ordersQuery = query(collection(db, "orders"), orderBy("timestamp", "desc"));
      const snapshot = await onSnapshot(ordersQuery, () => {});
      
      return snapshot.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data()
        };
      });
    } catch (error) {
      console.error("Error loading orders: ", error);
      return [];
    }
  },

  // Listen for new orders in real-time
  listenForOrders: function(callback) {
    const ordersQuery = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    
    return onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data()
        };
      });
      callback(orders);
    });
  },

  // Update an order (e.g., mark as completed)
  updateOrder: async function(orderId, updates) {
    try {
      await updateDoc(doc(db, "orders", orderId), updates);
      return true;
    } catch (error) {
      console.error("Error updating order: ", error);
      return false;
    }
  }
};

export { cloudStorage }; 