import { collection, doc, getDocs, orderBy, query, setDoc, where, deleteDoc } from 'firebase/firestore';
import { db, requireAuth, getCurrentUser } from './firebase';
import { Review } from './types';
import { updateUserStats } from './user-store';

export async function saveReview(review: Review): Promise<void> {
  const user = await requireAuth();
  const reviewsCol = collection(db, 'reviews');
  const data = {
    ...review,
    userId: user.uid,
    createdAt: review.date || new Date().toISOString(),
  };
  await setDoc(doc(reviewsCol, review.id), data);
  
  // Update user stats
  await updateUserStats(review);
}

export async function loadReviews(): Promise<Review[]> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  const reviewsCol = collection(db, 'reviews');
  const q = query(reviewsCol, where('userId', '==', user.uid), orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  const reviews: Review[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as Review & { createdAt?: string; userId?: string };
    reviews.push({
      ...data,
      date: data.date || data.createdAt || new Date().toISOString(),
    });
  });
  return reviews;
}

export async function deleteReview(reviewId: string): Promise<void> {
  const user = await requireAuth();
  const reviewRef = doc(db, 'reviews', reviewId);
  await deleteDoc(reviewRef);
}

export async function deleteReviewsOlderThan(cutoffDate: Date): Promise<number> {
  const user = await requireAuth();
  const reviewsCol = collection(db, 'reviews');
  const q = query(reviewsCol, where('userId', '==', user.uid), orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  
  let deletedCount = 0;
  const batch = [];
  
  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as Review & { createdAt?: string };
    const reviewDate = new Date(data.date || data.createdAt || '');
    
    if (reviewDate < cutoffDate) {
      batch.push(deleteDoc(docSnap.ref));
      deletedCount++;
    }
  });
  
  // Execute all deletions
  await Promise.all(batch);
  return deletedCount;
}
