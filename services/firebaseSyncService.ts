import { StorageService } from './storageService';
import { FirestoreService } from './firestoreService';

export const FirebaseSyncService = {
  isSyncing: false,

  async processSyncQueue(): Promise<void> {
    if (this.isSyncing) return;
    if (!navigator.onLine) return; // Make sure we are online before syncing

    this.isSyncing = true;
    try {
      const queue = await StorageService.getSyncQueue();
      if (queue.length === 0) {
        this.isSyncing = false;
        return;
      }

      console.log(`[FirebaseSyncService] Processing queue of size ${queue.length}...`);

      for (const item of queue) {
        try {
          switch (item.type) {
            case 'message':
              await FirestoreService.saveMessage(item.payload.subject, item.payload.message, item.payload.track);
              break;
            case 'progress':
              // If there was a save progress in firestoreService
              break;
            case 'profile':
              if (item.payload.role === 'builder') {
                await FirestoreService.saveBuilderProfile(item.payload.profile);
              }
              break;
            case 'project':
              await FirestoreService.saveBuilderProject(item.payload.project);
              break;
            default:
              console.warn(`[FirebaseSyncService] Unknown sync type: ${item.type}`);
          }
          await StorageService.removeFromSyncQueue(item.id);
        } catch (err) {
          console.error(`[FirebaseSyncService] Failed to sync item ${item.id}`, err);
          // Optional: handle retries inside here or just leave it in the queue
        }
      }
    } finally {
      this.isSyncing = false;
    }
  },

  startAutoSync(): void {
    window.addEventListener('online', () => {
      console.log('[FirebaseSyncService] Back online. Processing sync queue...');
      this.processSyncQueue();
    });
  }
};
