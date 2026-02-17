import { useEffect } from 'react';
import { dataManager } from '@code-review/lib/data-manager';
import { getCurrentUser } from '@code-review/lib/firebase';

export function DataCleanupManager() {
  useEffect(() => {
    // Only run cleanup if user is authenticated
    const user = getCurrentUser();
    if (!user) {
      return;
    }

    // Check if cleanup should run on app start
    const settings = dataManager.getDataRetentionSettings();
    
    if (!settings.autoCleanup || settings.retentionPeriod === 'forever') {
      return;
    }

    // Check if cleanup was run recently (within last 24 hours)
    const now = new Date();
    const lastCleanup = settings.lastCleanup ? new Date(settings.lastCleanup) : null;
    const hoursSinceLastCleanup = lastCleanup ? 
      (now.getTime() - lastCleanup.getTime()) / (1000 * 60 * 60) : 
      Infinity;

    // Run cleanup if it's been more than 24 hours since last cleanup
    if (hoursSinceLastCleanup > 24) {
      console.log('Running automatic data cleanup...');
      dataManager.performDataCleanup().catch(error => {
        console.error('Automatic cleanup failed:', error);
      });
    } else {
      console.log(`Skipping cleanup - last run ${Math.round(hoursSinceLastCleanup)} hours ago`);
    }
  }, []);

  return null; // This component doesn't render anything
}
