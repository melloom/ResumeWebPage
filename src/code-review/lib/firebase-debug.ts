import { getAuth, signInWithPopup, GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import { app } from './firebase';

export async function debugFirebaseAuth() {
  console.log('Firebase App:', app);
  console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
  console.log('API Key exists:', !!import.meta.env.VITE_FIREBASE_API_KEY);
  console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
  
  const auth = getAuth(app);
  console.log('Auth instance:', auth);
  
  // Test GitHub provider
  const githubProvider = new GithubAuthProvider();
  githubProvider.addScope('repo');
  console.log('GitHub Provider:', githubProvider);
  
  // Test Google provider
  const googleProvider = new GoogleAuthProvider();
  console.log('Google Provider:', googleProvider);
  
  return { auth, githubProvider, googleProvider };
}
