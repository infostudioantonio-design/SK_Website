import { db } from '../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { socialSharingService } from './socialSharingService';

interface ScheduledTask {
  id: string;
  userId: string;
  taskType: 'social_sharing' | 'reminder' | 'notification';
  scheduledTime: Date;
  frequency: 'daily' | 'weekly' | 'custom';
  status: 'pending' | 'completed' | 'failed';
  data?: any;
}

class SchedulerService {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;

  // Start the scheduler
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚀 Social sharing scheduler started');
    
    // Check for users with automatic sharing enabled every hour
    this.scheduleHourlyCheck();
    
    // Listen for new users with automatic sharing enabled
    this.listenForNewUsers();
  }

  // Stop the scheduler
  stop(): void {
    this.isRunning = false;
    
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    
    console.log('⏹️ Social sharing scheduler stopped');
  }

  // Schedule hourly check for automatic sharing
  private scheduleHourlyCheck(): void {
    const interval = setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        await this.processAutomaticSharing();
      } catch (error) {
        console.error('Error in hourly automatic sharing check:', error);
      }
    }, 60 * 60 * 1000); // Every hour

    this.intervals.set('hourly_check', interval);
  }

  // Listen for new users with automatic sharing enabled
  private listenForNewUsers(): void {
    const usersQuery = query(
      collection(db, 'userProfiles'),
      where('socialSharingEnabled', '==', true)
    );

    onSnapshot(usersQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const userData = change.doc.data();
          console.log(`👤 New user with automatic sharing: ${userData.displayName}`);
          this.scheduleUserSharing(userData.uid, userData.sharingFrequency);
        }
      });
    });
  }

  // Process automatic sharing for all eligible users
  private async processAutomaticSharing(): Promise<void> {
    try {
      const usersQuery = query(
        collection(db, 'userProfiles'),
        where('socialSharingEnabled', '==', true)
      );

      const usersSnapshot = await getDocs(usersQuery);
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const userId = userData.uid;
        
        // Check if it's time for this user to share
        if (this.shouldUserShare(userData)) {
          console.log(`📱 Processing automatic sharing for user: ${userData.displayName}`);
          await socialSharingService.processAutomaticSharing(userId);
        }
      }
    } catch (error) {
      console.error('Error processing automatic sharing:', error);
    }
  }

  // Check if a user should share based on their frequency and last share date
  private shouldUserShare(userData: any): boolean {
    const now = new Date();
    const lastShared = userData.lastSharedDate ? new Date(userData.lastSharedDate) : null;
    
    if (!lastShared) {
      return true; // First time sharing
    }

    const daysSinceLastShare = Math.floor((now.getTime() - lastShared.getTime()) / (1000 * 60 * 60 * 24));
    const sharesPerWeek = userData.sharingFrequency;
    const daysBetweenShares = 7 / sharesPerWeek;
    
    return daysSinceLastShare >= daysBetweenShares;
  }

  // Schedule sharing for a specific user
  private scheduleUserSharing(userId: string, frequency: 3 | 5 | 7): void {
    const intervalKey = `user_${userId}`;
    
    // Clear existing interval for this user
    if (this.intervals.has(intervalKey)) {
      clearInterval(this.intervals.get(intervalKey)!);
    }

    // Calculate interval based on frequency
    const sharesPerWeek = frequency;
    const daysBetweenShares = 7 / sharesPerWeek;
    const intervalMs = daysBetweenShares * 24 * 60 * 60 * 1000; // Convert to milliseconds

    const interval = setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        console.log(`📱 Scheduled sharing for user: ${userId}`);
        await socialSharingService.processAutomaticSharing(userId);
      } catch (error) {
        console.error(`Error in scheduled sharing for user ${userId}:`, error);
      }
    }, intervalMs);

    this.intervals.set(intervalKey, interval);
  }

  // Get scheduler status
  getStatus(): {
    isRunning: boolean;
    activeIntervals: number;
    nextCheck: Date;
  } {
    const nextCheck = new Date(Date.now() + 60 * 60 * 1000); // Next hourly check
    
    return {
      isRunning: this.isRunning,
      activeIntervals: this.intervals.size,
      nextCheck
    };
  }

  // Manually trigger sharing for a user (for testing)
  async triggerManualSharing(userId: string): Promise<void> {
    try {
      console.log(`🔧 Manually triggering sharing for user: ${userId}`);
      await socialSharingService.processAutomaticSharing(userId);
    } catch (error) {
      console.error(`Error in manual sharing trigger for user ${userId}:`, error);
    }
  }

  // Get sharing schedule for a user
  async getUserSchedule(userId: string): Promise<{
    nextShare: Date | null;
    sharesThisWeek: number;
    totalShares: number;
    frequency: 3 | 5 | 7;
  }> {
    try {
      const usersQuery = query(
        collection(db, 'userProfiles'),
        where('uid', '==', userId)
      );

      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        return {
          nextShare: null,
          sharesThisWeek: 0,
          totalShares: 0,
          frequency: 3
        };
      }

      const userData = usersSnapshot.docs[0].data();
      const lastShared = userData.lastSharedDate ? new Date(userData.lastSharedDate) : null;
      const frequency = userData.sharingFrequency;
      
      let nextShare: Date | null = null;
      if (lastShared && userData.socialSharingEnabled) {
        const daysBetweenShares = 7 / frequency;
        nextShare = new Date(lastShared.getTime() + daysBetweenShares * 24 * 60 * 60 * 1000);
      }

      // Get shares this week
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const sharesQuery = query(
        collection(db, 'socialShares'),
        where('userId', '==', userId),
        where('timestamp', '>=', weekAgo)
      );

      const sharesSnapshot = await getDocs(sharesQuery);
      const sharesThisWeek = sharesSnapshot.size;

      return {
        nextShare,
        sharesThisWeek,
        totalShares: userData.totalShares || 0,
        frequency
      };

    } catch (error) {
      console.error('Error getting user schedule:', error);
      return {
        nextShare: null,
        sharesThisWeek: 0,
        totalShares: 0,
        frequency: 3
      };
    }
  }

  // Update user sharing frequency
  async updateUserFrequency(userId: string, frequency: 3 | 5 | 7): Promise<void> {
    try {
      // Update the user's frequency in the database
      const { doc, updateDoc } = await import('firebase/firestore');
      const userQuery = query(
        collection(db, 'userProfiles'),
        where('uid', '==', userId)
      );

      const usersSnapshot = await getDocs(userQuery);
      
      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];
        await updateDoc(doc(db, 'userProfiles', userDoc.id), {
          sharingFrequency: frequency
        });

        // Reschedule the user's sharing
        this.scheduleUserSharing(userId, frequency);
        
        console.log(`📅 Updated sharing frequency for user ${userId} to ${frequency}x per week`);
      }
    } catch (error) {
      console.error('Error updating user frequency:', error);
    }
  }

  // Enable/disable automatic sharing for a user
  async toggleUserSharing(userId: string, enabled: boolean): Promise<void> {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const userQuery = query(
        collection(db, 'userProfiles'),
        where('uid', '==', userId)
      );

      const usersSnapshot = await getDocs(userQuery);
      
      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];
        const userData = userDoc.data();
        
        await updateDoc(doc(db, 'userProfiles', userDoc.id), {
          socialSharingEnabled: enabled
        });

        if (enabled) {
          // Schedule sharing for this user
          this.scheduleUserSharing(userId, userData.sharingFrequency);
          console.log(`✅ Enabled automatic sharing for user ${userId}`);
        } else {
          // Remove scheduling for this user
          const intervalKey = `user_${userId}`;
          if (this.intervals.has(intervalKey)) {
            clearInterval(this.intervals.get(intervalKey)!);
            this.intervals.delete(intervalKey);
          }
          console.log(`❌ Disabled automatic sharing for user ${userId}`);
        }
      }
    } catch (error) {
      console.error('Error toggling user sharing:', error);
    }
  }

  // Get all users with automatic sharing enabled
  async getActiveUsers(): Promise<Array<{
    uid: string;
    displayName: string;
    frequency: 3 | 5 | 7;
    lastShared: Date | null;
    totalShares: number;
  }>> {
    try {
      const usersQuery = query(
        collection(db, 'userProfiles'),
        where('socialSharingEnabled', '==', true)
      );

      const usersSnapshot = await getDocs(usersQuery);
      
      return usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: data.uid,
          displayName: data.displayName,
          frequency: data.sharingFrequency,
          lastShared: data.lastSharedDate ? new Date(data.lastSharedDate) : null,
          totalShares: data.totalShares || 0
        };
      });
    } catch (error) {
      console.error('Error getting active users:', error);
      return [];
    }
  }
}

export const schedulerService = new SchedulerService();

// Auto-start the scheduler when the service is imported
if (typeof window !== 'undefined') {
  // Only start in browser environment
  schedulerService.start();
}
