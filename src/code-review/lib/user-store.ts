import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp, FieldValue, collection, query, where, getDocs } from 'firebase/firestore';
import { db, getCurrentUser } from './firebase';
import { Review } from './types';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  githubUsername?: string;
  githubToken?: string;
  webhookUrl?: string;
  apiKey?: string;
  apiKeys?: {
    key: string;
    name: string;
    createdAt: Timestamp;
    lastUsed?: Timestamp;
    usageCount?: number;
  }[];
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    defaultCategories: Record<string, boolean>;
  };
  stats: {
    totalReviews: number;
    totalIssues: number;
    averageScore: number;
    lastActive: Timestamp | FieldValue;
  };
}

export async function ensureUserProfile(): Promise<UserProfile> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // Create new user profile
    const defaultProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      preferences: {
        theme: 'system',
        notifications: true,
        defaultCategories: {
          architecture: true,
          'code-quality': true,
          performance: true,
          'state-management': true,
          security: true,
          'error-handling': true,
          scalability: true,
        },
      },
      stats: {
        totalReviews: 0,
        totalIssues: 0,
        averageScore: 0,
        lastActive: serverTimestamp(),
      },
    };

    await setDoc(userRef, defaultProfile);
    return defaultProfile;
  }

  return userDoc.data() as UserProfile;
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp() as Timestamp,
  });
}

export async function updateUserStats(review: Review): Promise<void> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    const currentStats = (userDoc.data() as UserProfile).stats;
    const newTotalReviews = currentStats.totalReviews + 1;
    const newTotalIssues = currentStats.totalIssues + review.totalIssues;
    const newAverageScore = ((currentStats.averageScore * currentStats.totalReviews) + review.score) / newTotalReviews;

    await updateDoc(userRef, {
      'stats.totalReviews': newTotalReviews,
      'stats.totalIssues': newTotalIssues,
      'stats.averageScore': Math.round(newAverageScore),
      'stats.lastActive': serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    });
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const user = getCurrentUser();
  if (!user) {
    return null;
  }

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
}

export async function storeGitHubToken(token: string, username?: string): Promise<void> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    githubToken: token,
    githubUsername: username,
    updatedAt: serverTimestamp() as Timestamp,
  });
}

export async function getGitHubToken(): Promise<string | null> {
  const profile = await getUserProfile();
  return profile?.githubToken || null;
}

export async function generateApiKey(name: string = 'Default API Key'): Promise<string> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const apiKey = crypto.randomUUID();
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const profile = userDoc.data() as UserProfile;
    const apiKeys = profile.apiKeys || [];
    
    // Add new API key
    const newApiKey = {
      key: apiKey,
      name,
      createdAt: serverTimestamp() as Timestamp,
      usageCount: 0
    };

    await updateDoc(userRef, {
      apiKeys: [...apiKeys, newApiKey],
      updatedAt: serverTimestamp() as Timestamp,
    });
  }

  return apiKey;
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) return false;

  // Query all users to find the API key
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('apiKeys', 'array-contains-any', [
    { key: apiKey }
  ]));

  try {
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
}

export async function updateApiKeyUsage(apiKey: string): Promise<void> {
  if (!apiKey) return;

  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('apiKeys', 'array-contains-any', [
    { key: apiKey }
  ]));

  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;
    const profile = userDoc.data() as UserProfile;
    
    const apiKeys = profile.apiKeys || [];
    const updatedKeys = apiKeys.map(k => 
      k.key === apiKey 
        ? { ...k, lastUsed: serverTimestamp() as Timestamp, usageCount: (k.usageCount || 0) + 1 }
        : k
    );

    await updateDoc(doc(db, 'users', userId), {
      apiKeys: updatedKeys,
      updatedAt: serverTimestamp() as Timestamp,
    });
  }
}

export async function getUserApiKeys(): Promise<{ key: string; name: string; createdAt: Timestamp; lastUsed?: Timestamp; usageCount?: number }[]> {
  const profile = await getUserProfile();
  return profile?.apiKeys || [];
}

export async function deleteApiKey(apiKeyToDelete: string): Promise<void> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const profile = userDoc.data() as UserProfile;
    const apiKeys = profile.apiKeys || [];
    
    const updatedKeys = apiKeys.filter(k => k.key !== apiKeyToDelete);

    await updateDoc(userRef, {
      apiKeys: updatedKeys,
      updatedAt: serverTimestamp() as Timestamp,
    });
  }
}

export async function generateWebhookUrl(): Promise<string> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }
  
  // Generate a unique webhook ID based on user ID and timestamp
  const webhookId = `wh_${user.uid}_${Date.now()}`;
  const webhookUrl = `https://api.codereview.ai/webhook/${webhookId}`;
  
  // Store webhook URL in user profile
  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    webhookUrl: webhookUrl,
    updatedAt: serverTimestamp(),
  });
  
  return webhookUrl;
}

export async function getUserWebhookUrl(): Promise<string | null> {
  const user = getCurrentUser();
  if (!user) return null;
  
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();
  
  return userData.webhookUrl || null;
}
