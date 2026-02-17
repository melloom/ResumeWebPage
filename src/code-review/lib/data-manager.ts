import { Review } from './types';
import { loadReviews, saveReview, deleteReviewsOlderThan } from './review-store';
import { requireAuth } from './firebase';

export interface UserExportData {
  version: string;
  exportedAt: string;
  userId?: string;
  settings: Record<string, unknown>;
  reviews: Review[];
  metadata: {
    totalReviews: number;
    dateRange: {
      earliest: string;
      latest: string;
    };
    reviewSources: string[];
  };
}

export interface DataRetentionSettings {
  retentionPeriod: '7d' | '30d' | '90d' | 'forever';
  autoCleanup: boolean;
  lastCleanup?: string;
}

const DATA_MANAGEMENT_VERSION = '1.0.0';
const RETENTION_SETTINGS_KEY = 'codereview-data-retention';

export class DataManager {
  private static instance: DataManager;
  
  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  /**
   * Export all user data including settings and reviews
   */
  async exportUserData(): Promise<UserExportData> {
    try {
      // Get user info if authenticated
      let userId = undefined;
      try {
        const user = await requireAuth();
        userId = user.uid;
      } catch {
        // User not authenticated, continue without userId
      }

      // Load all reviews
      const reviews = await loadReviews();

      // Collect all settings from localStorage
      const settings: Record<string, unknown> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('codereview-')) {
          try {
            settings[key] = JSON.parse(localStorage.getItem(key)!);
          } catch {
            settings[key] = localStorage.getItem(key);
          }
        }
      }

      // Calculate metadata
      const dates = reviews.map(r => new Date(r.date)).filter(d => !isNaN(d.getTime()));
      const dateRange = dates.length > 0 ? {
        earliest: new Date(Math.min(...dates.map(d => d.getTime()))).toISOString(),
        latest: new Date(Math.max(...dates.map(d => d.getTime()))).toISOString()
      } : { earliest: '', latest: '' };

      const reviewSources = [...new Set(reviews.map(r => r.source))];

      const exportData: UserExportData = {
        version: DATA_MANAGEMENT_VERSION,
        exportedAt: new Date().toISOString(),
        userId,
        settings,
        reviews,
        metadata: {
          totalReviews: reviews.length,
          dateRange,
          reviewSources
        }
      };

      return exportData;
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw new Error('Failed to export data. Please try again.');
    }
  }

  /**
   * Import user data from export file
   */
  async importUserData(exportData: UserExportData): Promise<void> {
    try {
      // Validate export data format
      if (!exportData.version || !exportData.settings || !Array.isArray(exportData.reviews)) {
        throw new Error('Invalid export data format');
      }

      // Import settings
      for (const [key, value] of Object.entries(exportData.settings)) {
        if (key.startsWith('codereview-')) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }

      // Import reviews
      if (exportData.reviews.length > 0) {
        try {
          const user = await requireAuth();
          for (const review of exportData.reviews) {
            await saveReview(review);
          }
        } catch {
          // If not authenticated, store reviews in localStorage as fallback
          const importedReviews = JSON.parse(localStorage.getItem('codereview-imported-reviews') || '[]');
          importedReviews.push(...exportData.reviews);
          localStorage.setItem('codereview-imported-reviews', JSON.stringify(importedReviews));
        }
      }

      // Trigger a storage event to notify other components
      window.dispatchEvent(new Event('storage'));

    } catch (error) {
      console.error('Failed to import user data:', error);
      throw new Error('Failed to import data. Please check the file format and try again.');
    }
  }

  /**
   * Clear all user data
   */
  async clearAllData(): Promise<void> {
    try {
      // Clear localStorage settings
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('codereview-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear reviews from database if authenticated
      try {
        const user = await requireAuth();
        // Note: This would require a delete function in review-store
        // For now, we'll clear the local cache
        console.log('User authenticated - reviews should be cleared from database');
      } catch {
        // User not authenticated, just clear local data
      }

      // Clear any cached data
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.filter(name => name.includes('codereview')).map(name => caches.delete(name))
        );
      }

      // Trigger storage event
      window.dispatchEvent(new Event('storage'));

    } catch (error) {
      console.error('Failed to clear data:', error);
      throw new Error('Failed to clear data. Please try again.');
    }
  }

  /**
   * Clear only review data, keeping settings
   */
  async clearReviewData(): Promise<void> {
    try {
      // Clear reviews from database if authenticated
      try {
        const user = await requireAuth();
        // Note: This would require a delete function in review-store
        console.log('User authenticated - reviews should be cleared from database');
      } catch {
        // User not authenticated, clear local cache
        localStorage.removeItem('codereview-imported-reviews');
      }

      // Clear any review-related cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.filter(name => name.includes('review')).map(name => caches.delete(name))
        );
      }

    } catch (error) {
      console.error('Failed to clear review data:', error);
      throw new Error('Failed to clear review data. Please try again.');
    }
  }

  /**
   * Get data retention settings
   */
  getDataRetentionSettings(): DataRetentionSettings {
    try {
      const stored = localStorage.getItem(RETENTION_SETTINGS_KEY);
      return stored ? JSON.parse(stored) : {
        retentionPeriod: '30d',
        autoCleanup: true
      };
    } catch {
      return {
        retentionPeriod: '30d',
        autoCleanup: true
      };
    }
  }

  /**
   * Update data retention settings
   */
  updateDataRetentionSettings(settings: DataRetentionSettings): void {
    localStorage.setItem(RETENTION_SETTINGS_KEY, JSON.stringify(settings));
  }

  /**
   * Perform automatic cleanup based on retention settings
   */
  async performDataCleanup(): Promise<void> {
    const settings = this.getDataRetentionSettings();
    
    if (!settings.autoCleanup || settings.retentionPeriod === 'forever') {
      console.log('Auto cleanup disabled or retention set to forever');
      return;
    }

    try {
      const cutoffDate = this.getCutoffDate(settings.retentionPeriod);
      console.log(`Cleaning up reviews older than ${cutoffDate.toISOString()}`);
      
      // Try to delete from database first
      try {
        const deletedCount = await deleteReviewsOlderThan(cutoffDate);
        console.log(`Successfully deleted ${deletedCount} old reviews from database`);
        
        // Update last cleanup timestamp
        settings.lastCleanup = new Date().toISOString();
        this.updateDataRetentionSettings(settings);
        
        if (deletedCount > 0) {
          // Trigger storage event to refresh UI
          window.dispatchEvent(new Event('storage'));
        }
      } catch (error) {
        console.error('Failed to cleanup database reviews:', error);
        
        // Fallback to localStorage cleanup if not authenticated
        const reviews = await loadReviews();
        const oldReviews = reviews.filter(review => 
          new Date(review.date) < cutoffDate
        );

        if (oldReviews.length > 0) {
          console.log(`Found ${oldReviews.length} old reviews in localStorage to clean up`);
          // For localStorage, we'd need to implement separate cleanup logic
          // For now, just log what would be cleaned up
        }
      }

    } catch (error) {
      console.error('Failed to perform data cleanup:', error);
      throw error;
    }
  }

  /**
   * Get cutoff date for retention period
   */
  private getCutoffDate(period: '7d' | '30d' | '90d'): Date {
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    return new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  }

  /**
   * Download export data as JSON file
   */
  downloadExportData(data: UserExportData, filename?: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `codeguardian-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Parse uploaded file and validate format
   */
  async parseImportFile(file: File): Promise<UserExportData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          
          // Validate the data structure
          if (!data.version || !Array.isArray(data.reviews)) {
            throw new Error('Invalid file format');
          }
          
          resolve(data as UserExportData);
        } catch (error) {
          reject(new Error('Failed to parse file. Please ensure it is a valid CodeGuardian export file.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }
}

// Export singleton instance
export const dataManager = DataManager.getInstance();