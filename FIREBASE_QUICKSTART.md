# 🚀 Firebase Quick Start Guide

## What's Been Set Up

✅ **Firebase Configuration** (`firebase/firebaseConfig.ts`)
- Firebase initialized
- Auth, Firestore, Storage, Analytics ready

✅ **Authentication Service** (`services/auth.ts`)
- Sign up with email/password
- Sign in with email/password
- Sign in with Google
- Password reset
- Logout
- Auth state management

✅ **Firestore Database Service** (`services/firestore.ts`)
- CRUD operations for all collections
- Real-time subscriptions
- User-scoped data (secure)
- Batch operations

✅ **Data Migration Service** (`services/migrate.ts`)
- Migrate localStorage → Firestore
- Backup localStorage before migrating
- Progress tracking
- Error handling

✅ **React Auth Hook** (`hooks/useAuth.ts`)
- Easy authentication in components
- Loading states
- Auto-updates on auth changes

---

## Quick Setup (5 Minutes)

### 1. Create Firebase Project
```
1. Go to https://console.firebase.google.com/
2. Click "Add Project"
3. Name it "luxelife-planner"
4. Disable Analytics (optional)
5. Click "Create Project"
```

### 2. Enable Authentication
```
Firebase Console → Authentication → Get Started
→ Enable "Email/Password"
→ Enable "Google" (optional)
```

### 3. Create Firestore Database
```
Firebase Console → Firestore Database → Create Database
→ Production Mode
→ Location: us-central (or closest)
```

### 4. Enable Storage
```
Firebase Console → Storage → Get Started
→ Production Mode
```

### 5. Get Configuration
```
Firebase Console → Project Settings → Your apps
→ Click Web icon (</>)
→ Register app: "LuxeLife Planner Web"
→ Copy the config values
```

### 6. Update .env File
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 7. Update Firestore Rules
Copy rules from `FIREBASE_SETUP.md` Step 7

### 8. Test It!
```bash
npm run dev
```

---

## Usage Examples

### Example 1: Sign Up User

```typescript
import { signUp } from './services/auth';

const handleSignUp = async () => {
  try {
    await signUp('user@example.com', 'password123', 'John Doe');
    console.log('User created!');
  } catch (error) {
    console.error(error.message);
  }
};
```

### Example 2: Sign In User

```typescript
import { signIn } from './services/auth';

const handleSignIn = async () => {
  try {
    await signIn('user@example.com', 'password123');
    console.log('Signed in!');
  } catch (error) {
    console.error(error.message);
  }
};
```

### Example 3: Use Auth in Component

```typescript
import { useAuth } from './hooks/useAuth';
import { signOut } from './services/auth';

function App() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div>
      <h1>Welcome, {user?.displayName}!</h1>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  );
}
```

### Example 4: Save Data to Firestore

```typescript
import { saveDocument } from './services/firestore';

const handleSaveTask = async (task) => {
  try {
    await saveDocument('tasks', task.id, task);
    console.log('Task saved!');
  } catch (error) {
    console.error('Failed to save task:', error);
  }
};
```

### Example 5: Get All Tasks

```typescript
import { getAllTasks } from './services/firestore';

const loadTasks = async () => {
  try {
    const tasks = await getAllTasks();
    console.log('Tasks:', tasks);
  } catch (error) {
    console.error('Failed to load tasks:', error);
  }
};
```

### Example 6: Real-time Subscription

```typescript
import { subscribeToCollection } from './services/firestore';
import { useEffect } from 'react';

function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToCollection(
      'tasks',
      (updatedTasks) => {
        setTasks(updatedTasks);
      }
    );

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
}
```

### Example 7: Migrate localStorage to Firestore

```typescript
import { migrateWithProgress, downloadLocalStorageBackup } from './services/migrate';

const handleMigration = async () => {
  // 1. Download backup first (safety!)
  downloadLocalStorageBackup();

  // 2. Migrate data
  const result = await migrateWithProgress((current, total, collection) => {
    console.log(`Migrating ${collection}... (${current}/${total})`);
  });

  if (result.success) {
    console.log(`✅ Migrated ${result.totalMigrated} documents!`);
  } else {
    console.error('❌ Migration had errors:', result.results);
  }
};
```

---

## File Structure

```
luxelife-planner/
├── firebase/
│   └── firebaseConfig.ts          # Firebase initialization
├── services/
│   ├── auth.ts                    # Authentication service
│   ├── firestore.ts               # Database operations
│   └── migrate.ts                 # Data migration
├── hooks/
│   └── useAuth.ts                 # Auth React hook
├── .env                           # Firebase credentials (NOT in Git)
└── FIREBASE_SETUP.md              # Detailed setup guide
```

---

## Common Tasks

### Check if User is Signed In

```typescript
import { getCurrentUser } from './services/auth';

const user = getCurrentUser();
if (user) {
  console.log('User is signed in:', user.email);
} else {
  console.log('No user signed in');
}
```

### Sign Out

```typescript
import { logout } from './services/auth';

await logout();
console.log('Signed out');
```

### Delete a Document

```typescript
import { deleteDocument } from './services/firestore';

await deleteDocument('tasks', taskId);
console.log('Task deleted');
```

### Update a Document

```typescript
import { updateDocument } from './services/firestore';

await updateDocument('tasks', taskId, { completed: true });
console.log('Task updated');
```

---

## Next Steps

1. ✅ Complete Firebase setup (see FIREBASE_SETUP.md)
2. ✅ Add Firebase credentials to `.env`
3. ✅ Create login/signup UI components
4. ✅ Update hubs to use Firestore instead of localStorage
5. ✅ Migrate existing localStorage data
6. ✅ Test authentication flow
7. ✅ Test data sync across devices

---

## Security Best Practices

✅ **Always:**
- Keep `.env` in `.gitignore`
- Use Firestore security rules
- Validate user authentication before operations
- Test with Firebase emulators locally

❌ **Never:**
- Commit credentials to Git
- Allow public read/write in Firestore rules
- Skip authentication checks
- Use admin SDK in frontend

---

## Troubleshooting

### "User must be authenticated" error
→ Make sure user is signed in before calling Firestore functions

### Data not saving
→ Check Firestore security rules
→ Verify user is authenticated
→ Check browser console for errors

### "Missing or insufficient permissions"
→ Update Firestore rules (see FIREBASE_SETUP.md)
→ Make sure user ID matches document path

---

**Ready to go!** 🚀

Start building with Firebase authentication and cloud database!
