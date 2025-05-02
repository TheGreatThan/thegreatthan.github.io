# Firebase Setup Instructions for Quán Cà Phê

To make the coffee shop ordering system work across multiple devices, we've integrated Firebase as our cloud storage solution. Follow these steps to set up your own Firebase project:

## 1. Create a Firebase Account and Project

1. Go to [firebase.google.com](https://firebase.google.com/) and sign in with your Google account
2. Click "Get started" and then "Add project"
3. Enter a project name (e.g., "Quan Ca Phe") and click "Continue"
4. Decide whether to enable Google Analytics (optional) and click "Create project"

## 2. Set Up Firestore Database

1. In the Firebase console, select your project
2. Click on "Firestore Database" in the left menu
3. Click "Create database"
4. Start in "Test mode" for development (you can change this later)
5. Choose a location that's closest to your users
6. Click "Enable"

## 3. Register Your Web App

1. In the Firebase console, click on the gear icon next to "Project Overview" and select "Project settings"
2. Scroll down to "Your apps" and click the web icon (</>) to add a web app
3. Enter a nickname for your app (e.g., "Quan Ca Phe Web")
4. Click "Register app"
5. Firebase will display your configuration settings. Copy these values to update the `firebase-config.js` file:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

6. Replace the placeholder values in `firebase-config.js` with your actual Firebase configuration

## 4. Set Up Firestore Rules

For better security in production, update your Firestore rules:

1. In the Firebase console, go to "Firestore Database" and click on the "Rules" tab
2. Replace the existing rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read;
      allow write;
      // In a real production environment, you would want to add authentication
      // and more specific rules to control who can edit menu items, etc.
    }
  }
}
```

3. Click "Publish"

## 5. Testing the System

1. Open the customer site in one browser or device
2. Open the owner dashboard in another browser or device
3. Place an order from the customer site
4. Verify that the order appears immediately on the owner dashboard
5. Make menu changes from the owner dashboard
6. Verify that the menu updates immediately on the customer site

## Troubleshooting

- If orders aren't syncing, check the browser console for errors
- Ensure your Firebase project is properly set up with Firestore enabled
- Verify that your firebaseConfig values in firebase-config.js are correct
- Check your internet connection, as Firebase requires an internet connection to work

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore) 