import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from 'firebase/firestore';

export interface SocialShare {
  id: string;
  userId: string;
  userName: string;
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram';
  content: string;
  timestamp: Date;
  pointsEarned: number;
  status: 'pending' | 'shared' | 'failed';
  shareUrl?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  company?: string;
  linkedin?: string;
  joinDate: Date;
  points: number;
  socialSharingEnabled: boolean;
  sharingFrequency: 3 | 5 | 7;
  lastSharedDate?: Date;
  totalShares: number;
  linkedinAccessToken?: string;
  twitterAccessToken?: string;
  facebookAccessToken?: string;
  instagramAccessToken?: string;
}

export interface PodcastSession {
  id: string;
  title: string;
  date: string;
  participants: string[];
  maxParticipants: number;
  description: string;
  host: string;
  category: string;
}

class SocialSharingService {
  // LinkedIn API Integration
  async shareToLinkedIn(content: string, accessToken?: string): Promise<{ success: boolean; shareUrl?: string; error?: string }> {
    if (!accessToken) {
      return { success: false, error: 'LinkedIn access token not available' };
    }

    try {
      // LinkedIn Share API endpoint
      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify({
          author: `urn:li:person:${accessToken}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: content
              },
              shareMediaCategory: 'NONE'
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, shareUrl: result.id };
      } else {
        return { success: false, error: 'LinkedIn API error' };
      }
    } catch (error) {
      console.error('LinkedIn sharing error:', error);
      return { success: false, error: 'LinkedIn sharing failed' };
    }
  }

  // Twitter API Integration
  async shareToTwitter(content: string, accessToken?: string): Promise<{ success: boolean; shareUrl?: string; error?: string }> {
    if (!accessToken) {
      return { success: false, error: 'Twitter access token not available' };
    }

    try {
      // Twitter API v2 endpoint
      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: content.substring(0, 280) // Twitter character limit
        })
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, shareUrl: `https://twitter.com/user/status/${result.data.id}` };
      } else {
        return { success: false, error: 'Twitter API error' };
      }
    } catch (error) {
      console.error('Twitter sharing error:', error);
      return { success: false, error: 'Twitter sharing failed' };
    }
  }

  // Facebook API Integration
  async shareToFacebook(content: string, accessToken?: string): Promise<{ success: boolean; shareUrl?: string; error?: string }> {
    if (!accessToken) {
      return { success: false, error: 'Facebook access token not available' };
    }

    try {
      // Facebook Graph API endpoint
      const response = await fetch(`https://graph.facebook.com/v18.0/me/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: content,
          access_token: accessToken
        })
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, shareUrl: `https://facebook.com/${result.id}` };
      } else {
        return { success: false, error: 'Facebook API error' };
      }
    } catch (error) {
      console.error('Facebook sharing error:', error);
      return { success: false, error: 'Facebook sharing failed' };
    }
  }

  // Instagram API Integration
  async shareToInstagram(content: string, accessToken?: string): Promise<{ success: boolean; shareUrl?: string; error?: string }> {
    if (!accessToken) {
      return { success: false, error: 'Instagram access token not available' };
    }

    try {
      // Instagram Basic Display API
      const response = await fetch(`https://graph.instagram.com/v18.0/me/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          caption: content,
          access_token: accessToken
        })
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, shareUrl: `https://instagram.com/p/${result.id}` };
      } else {
        return { success: false, error: 'Instagram API error' };
      }
    } catch (error) {
      console.error('Instagram sharing error:', error);
      return { success: false, error: 'Instagram sharing failed' };
    }
  }

  // Generate social media content
  generateSocialContent(session: PodcastSession, platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram'): string {
    const baseContent = `🎙️ Nieuwe podcast sessie: "${session.title}"`;
    const description = session.description;
    const date = new Date(session.date).toLocaleDateString('nl-NL');
    const host = session.host;
    const hashtags = '#SuperKonnected #Podcast #Networking #Business';
    const website = 'superkonnected.nl';

    switch (platform) {
      case 'linkedin':
        return `${baseContent}\n\n${description}\n\n📅 ${date}\n👥 Host: ${host}\n\n${hashtags}\n\nJoin de community: ${website}`;
      
      case 'twitter':
        return `${baseContent}\n\n📅 ${date}\n👥 ${host}\n\n${hashtags}`;
      
      case 'facebook':
        return `${baseContent}\n\n${description}\n\n📅 ${date}\n👥 Host: ${host}\n\nSuperKonnected - Van netwerken naar verbinden`;
      
      case 'instagram':
        return `${baseContent}\n\n📅 ${date}\n👥 Host: ${host}\n\n${hashtags}`;
      
      default:
        return baseContent;
    }
  }

  // Process automatic sharing for a user
  async processAutomaticSharing(userId: string): Promise<void> {
    try {
      // Get user profile
      const userQuery = query(collection(db, 'userProfiles'), where('uid', '==', userId));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) return;
      
      const userProfile = userSnapshot.docs[0].data() as UserProfile;
      
      if (!userProfile.socialSharingEnabled) return;

      // Check if it's time to share based on frequency
      const now = new Date();
      const lastShared = userProfile.lastSharedDate ? new Date(userProfile.lastSharedDate) : null;
      
      if (lastShared) {
        const daysSinceLastShare = Math.floor((now.getTime() - lastShared.getTime()) / (1000 * 60 * 60 * 24));
        const sharesPerWeek = userProfile.sharingFrequency;
        const daysBetweenShares = 7 / sharesPerWeek;
        
        if (daysSinceLastShare < daysBetweenShares) return;
      }

      // Get latest podcast sessions
      const sessionsQuery = query(collection(db, 'podcastSessions'), where('date', '>=', new Date().toISOString()));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      
      if (sessionsSnapshot.empty) return;

      const latestSession = sessionsSnapshot.docs[0].data() as PodcastSession;
      
      // Determine which platform to share to
      const platforms: Array<'linkedin' | 'twitter' | 'facebook' | 'instagram'> = ['linkedin', 'twitter', 'facebook'];
      const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
      
      const content = this.generateSocialContent(latestSession, randomPlatform);
      const pointsEarned = randomPlatform === 'linkedin' ? 10 : 5;

      // Create share record
      const shareData: Omit<SocialShare, 'id'> = {
        userId: userProfile.uid,
        userName: userProfile.displayName,
        platform: randomPlatform,
        content,
        timestamp: now,
        pointsEarned,
        status: 'pending'
      };

      const shareRef = await addDoc(collection(db, 'socialShares'), shareData);

      // Attempt to share
      let shareResult;
      switch (randomPlatform) {
        case 'linkedin':
          shareResult = await this.shareToLinkedIn(content, userProfile.linkedinAccessToken);
          break;
        case 'twitter':
          shareResult = await this.shareToTwitter(content, userProfile.twitterAccessToken);
          break;
        case 'facebook':
          shareResult = await this.shareToFacebook(content, userProfile.facebookAccessToken);
          break;
        default:
          shareResult = { success: false, error: 'Platform not supported' };
      }

      // Update share status
      await updateDoc(doc(db, 'socialShares', shareRef.id), {
        status: shareResult.success ? 'shared' : 'failed',
        shareUrl: shareResult.shareUrl
      });

      // Update user points if successful
      if (shareResult.success) {
        await updateDoc(doc(db, 'userProfiles', userProfile.uid), {
          points: userProfile.points + pointsEarned,
          totalShares: userProfile.totalShares + 1,
          lastSharedDate: now
        });
      }

    } catch (error) {
      console.error('Error processing automatic sharing:', error);
    }
  }

  // Manual sharing function
  async manualShare(
    userId: string, 
    platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram', 
    session: PodcastSession
  ): Promise<{ success: boolean; shareUrl?: string; error?: string }> {
    try {
      // Get user profile
      const userQuery = query(collection(db, 'userProfiles'), where('uid', '==', userId));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        return { success: false, error: 'User not found' };
      }
      
      const userProfile = userSnapshot.docs[0].data() as UserProfile;
      const content = this.generateSocialContent(session, platform);
      const pointsEarned = platform === 'linkedin' ? 10 : 5;

      // Create share record
      const shareData: Omit<SocialShare, 'id'> = {
        userId: userProfile.uid,
        userName: userProfile.displayName,
        platform,
        content,
        timestamp: new Date(),
        pointsEarned,
        status: 'pending'
      };

      const shareRef = await addDoc(collection(db, 'socialShares'), shareData);

      // Attempt to share
      let shareResult;
      switch (platform) {
        case 'linkedin':
          shareResult = await this.shareToLinkedIn(content, userProfile.linkedinAccessToken);
          break;
        case 'twitter':
          shareResult = await this.shareToTwitter(content, userProfile.twitterAccessToken);
          break;
        case 'facebook':
          shareResult = await this.shareToFacebook(content, userProfile.facebookAccessToken);
          break;
        case 'instagram':
          shareResult = await this.shareToInstagram(content, userProfile.instagramAccessToken);
          break;
        default:
          shareResult = { success: false, error: 'Platform not supported' };
      }

      // Update share status
      await updateDoc(doc(db, 'socialShares', shareRef.id), {
        status: shareResult.success ? 'shared' : 'failed',
        shareUrl: shareResult.shareUrl
      });

      // Update user points if successful
      if (shareResult.success) {
        await updateDoc(doc(db, 'userProfiles', userProfile.uid), {
          points: userProfile.points + pointsEarned,
          totalShares: userProfile.totalShares + 1,
          lastSharedDate: new Date()
        });
      }

      return shareResult;

    } catch (error) {
      console.error('Error in manual share:', error);
      return { success: false, error: 'Sharing failed' };
    }
  }

  // Get sharing statistics
  async getSharingStats(userId: string): Promise<{
    totalShares: number;
    totalPoints: number;
    sharesThisWeek: number;
    platformBreakdown: Record<string, number>;
  }> {
    try {
      const sharesQuery = query(collection(db, 'socialShares'), where('userId', '==', userId));
      const sharesSnapshot = await getDocs(sharesQuery);
      
      const shares = sharesSnapshot.docs.map(doc => doc.data() as SocialShare);
      
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const sharesThisWeek = shares.filter(share => 
        new Date(share.timestamp) >= weekAgo
      ).length;

      const platformBreakdown = shares.reduce((acc, share) => {
        acc[share.platform] = (acc[share.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalPoints = shares.reduce((sum, share) => sum + share.pointsEarned, 0);

      return {
        totalShares: shares.length,
        totalPoints,
        sharesThisWeek,
        platformBreakdown
      };

    } catch (error) {
      console.error('Error getting sharing stats:', error);
      return {
        totalShares: 0,
        totalPoints: 0,
        sharesThisWeek: 0,
        platformBreakdown: {}
      };
    }
  }
}

export const socialSharingService = new SocialSharingService();
