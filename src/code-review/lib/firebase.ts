import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.warn('Firebase env vars are missing. Add them to enable DB features.');
}

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const githubProvider = new GithubAuthProvider();
githubProvider.addScope('repo');
githubProvider.addScope('read:org');
const googleProvider = new GoogleAuthProvider();

let currentUser: User | null = null;
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

export function getCurrentUser(): User | null {
  return auth.currentUser ?? currentUser;
}

export async function signInWithGithub() {
  try {
    console.log('Attempting GitHub sign-in...');
    console.log('Auth domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
    console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
    
    const result = await signInWithPopup(auth, githubProvider);
    currentUser = result.user;
    console.log('GitHub sign-in successful:', result.user);
    return result.user;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string; customData?: Record<string, unknown> };
    console.error('GitHub sign-in error details:', firebaseError);
    console.error('Error code:', firebaseError.code);
    console.error('Error message:', firebaseError.message);
    console.error('Custom data:', firebaseError.customData);
    throw error;
  }
}

export async function signInWithGoogle() {
  try {
    console.log('Attempting Google sign-in...');
    const result = await signInWithPopup(auth, googleProvider);
    currentUser = result.user;
    console.log('Google sign-in successful:', result.user);
    return result.user;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string; customData?: unknown };
    console.error('Google sign-in error details:', firebaseError);
    console.error('Error code:', firebaseError.code);
    console.error('Error message:', firebaseError.message);
    console.error('Custom data:', firebaseError.customData);
    throw error;
  }
}

export async function requireAuth(): Promise<User> {
  if (auth.currentUser) return auth.currentUser;
  if (currentUser) return currentUser;
  throw new Error('User not signed in');
}

export async function signOutUser() {
  await signOut(auth);
  currentUser = null;
}
