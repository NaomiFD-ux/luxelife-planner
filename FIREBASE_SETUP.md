# 🔥 Firebase Setup Guide for LuxeLife Planner

## Step 1: Create Firebase Project

1. **Go to Firebase Console:** https://console.firebase.google.com/
2. **Click "Add Project"**
3. **Enter Project Name:** `luxelife-planner` (or your preferred name)
4. **Disable Google Analytics** (optional - you can enable later)
5. **Click "Create Project"**

---

## Step 2: Set Up Firebase Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click **"Get Started"**
3. Enable **Email/Password** sign-in:
   - Click on "Email/Password"
   - Toggle **Enable**
   - Click **Save**
4. Enable **Google** sign-in (optional):
   - Click on "Google"
   - Toggle **Enable**
   - Select support email
   - Click **Save**

---

## Step 3: Set Up Firestore Database

1. In Firebase Console, go to **Build → Firestore Database**
2. Click **"Create Database"**
3. Select **Production Mode** (we'll update rules later)
4. Choose **Location:** `us-central` (or closest to you)
5. Click **Enable**

---

## Step 4: Set Up Firebase Storage

1. In Firebase Console, go to **Build → Storage**
2. Click **"Get Started"**
3. Select **Production Mode**
4. Use **default bucket**
5. Click **Done**

---

## Step 5: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (⚙️ icon)
2. Scroll down to **"Your apps"**
3. Click **Web icon** (`</>`)
4. **Register app:**
   - App nickname: `LuxeLife Planner Web`
   - ✅ Check "Also set up Firebase Hosting" (optional)
   - Click **Register App**
5. **Copy the config object** - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "luxelife-planner.firebaseapp.com",
  projectId: "luxelife-planner",
  storageBucket: "luxelife-planner.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXXXXX"
};
```

---

## Step 6: Add Credentials to .env File

1. Open `.env` file in the project root
2. Fill in the Firebase values from Step 5:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=luxelife-planner.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=luxelife-planner
VITE_FIREBASE_STORAGE_BUCKET=luxelife-planner.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

⚠️ **IMPORTANT:** Never commit the `.env` file to Git! It's already in `.gitignore`.

---

## Step 7: Update Firestore Security Rules

1. In Firebase Console, go to **Firestore Database → Rules**
2. Replace the default rules with:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if isOwner(userId);

      // User's finance data
      match /finance/{document=**} {
        allow read, write: if isOwner(userId);
      }

      // User's planner tasks
      match /tasks/{document=**} {
        allow read, write: if isOwner(userId);
      }

      // User's habits
      match /habits/{document=**} {
        allow read, write: if isOwner(userId);
      }

      // User's school data
      match /school/{document=**} {
        allow read, write: if isOwner(userId);
      }

      // User's job applications
      match /jobs/{document=**} {
        allow read, write: if isOwner(userId);
      }

      // User's fitness data
      match /fitness/{document=**} {
        allow read, write: if isOwner(userId);
      }

      // User's bible study data
      match /bible/{document=**} {
        allow read, write: if isOwner(userId);
      }

      // User's vision board
      match /vision/{document=**} {
        allow read, write: if isOwner(userId);
      }

      // User's meal planner
      match /meals/{document=**} {
        allow read, write: if isOwner(userId);
      }

      // User's calendar events
      match /events/{document=**} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

3. Click **Publish**

---

## Step 8: Update Storage Security Rules

1. In Firebase Console, go to **Storage → Rules**
2. Replace with:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Only authenticated users can upload
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024; // Max 5MB
    }
  }
}
```

3. Click **Publish**

---

## Step 9: Test Firebase Connection

Run the dev server and check console for Firebase initialization:

```bash
npm run dev
```

Open browser console - you should see no Firebase errors.

---

## Step 10: Firestore Database Structure

LuxeLife Planner uses the following Firestore structure:

```
/users/{userId}
  ├── /finance
  │   ├── /transactions/{transactionId}
  │   ├── /incomes/{incomeId}
  │   ├── /bills/{billId}
  │   ├── /subscriptions/{subscriptionId}
  │   ├── /recurringExpenses/{expenseId}
  │   └── /savingsGoals/{goalId}
  │
  ├── /tasks/{taskId}
  ├── /habits/{habitId}
  │
  ├── /school
  │   ├── /classes/{classId}
  │   ├── /assignments/{assignmentId}
  │   └── /terms/{termId}
  │
  ├── /jobs/{applicationId}
  │
  ├── /fitness
  │   ├── /routines/{routineId}
  │   ├── /workouts/{workoutId}
  │   └── /measurements/{measurementId}
  │
  ├── /bible
  │   ├── /highlights/{highlightId}
  │   ├── /favorites/{favoriteId}
  │   └── /readingPlans/{planId}
  │
  ├── /vision/{goalId}
  ├── /meals/{mealId}
  └── /events/{eventId}
```

---

## Step 11: Next Steps

After completing the setup above:

1. ✅ Firebase project created
2. ✅ Authentication enabled
3. ✅ Firestore database created
4. ✅ Storage enabled
5. ✅ Security rules configured
6. ✅ Credentials added to `.env`

**Now you can:**
- Implement user authentication (sign up, login, logout)
- Migrate localStorage data to Firestore
- Sync data across devices
- Enable real-time updates

---

## Troubleshooting

### Error: "Firebase: Error (auth/api-key-not-valid)"
- Check that your API key in `.env` is correct
- Make sure the `.env` file is in the project root
- Restart the dev server after changing `.env`

### Error: "Missing or insufficient permissions"
- Check Firestore security rules
- Make sure you're authenticated before accessing data
- Verify the user ID matches the document path

### Error: "Storage: Object 'users/xxx/file' does not exist"
- Check Storage security rules
- Verify file upload path matches the rules
- Ensure user is authenticated

---

## Security Best Practices

✅ **DO:**
- Use environment variables for Firebase config
- Keep `.env` in `.gitignore`
- Test security rules before deploying
- Use Firebase emulators for local development

❌ **DON'T:**
- Commit Firebase credentials to Git
- Use admin SDK in frontend code
- Allow public read/write access
- Skip authentication checks

---

**Setup Complete!** 🎉

Your Firebase backend is ready for LuxeLife Planner!
