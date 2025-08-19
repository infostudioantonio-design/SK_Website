import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export interface SocialMediaAnalytics {
  platform: string;
  postId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  timestamp: Date;
}

export interface PlatformStats {
  platform: string;
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  averageEngagementRate: number;
  topPerformingPosts: Array<{
    postId: string;
    views: number;
    likes: number;
    engagementRate: number;
  }>;
}

class AnalyticsService {
  // Fetch analytics from LinkedIn API
  async fetchLinkedInAnalytics(postId: string, accessToken?: string): Promise<Partial<SocialMediaAnalytics>> {
    if (!accessToken) {
      return { platform: 'linkedin', postId, views: 0, likes: 0, comments: 0, shares: 0, engagementRate: 0 };
    }

    try {
      // LinkedIn Analytics API endpoint
      const response = await fetch(`https://api.linkedin.com/v2/socialMetrics/${postId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          platform: 'linkedin',
          postId,
          views: data.totalShareStatistics?.impressionCount || 0,
          likes: data.totalShareStatistics?.likeCount || 0,
          comments: data.totalShareStatistics?.commentCount || 0,
          shares: data.totalShareStatistics?.shareCount || 0,
          engagementRate: this.calculateEngagementRate(
            data.totalShareStatistics?.likeCount || 0,
            data.totalShareStatistics?.commentCount || 0,
            data.totalShareStatistics?.shareCount || 0,
            data.totalShareStatistics?.impressionCount || 0
          )
        };
      }
    } catch (error) {
      console.error('Error fetching LinkedIn analytics:', error);
    }

    return { platform: 'linkedin', postId, views: 0, likes: 0, comments: 0, shares: 0, engagementRate: 0 };
  }

  // Fetch analytics from Twitter API
  async fetchTwitterAnalytics(tweetId: string, accessToken?: string): Promise<Partial<SocialMediaAnalytics>> {
    if (!accessToken) {
      return { platform: 'twitter', postId: tweetId, views: 0, likes: 0, comments: 0, shares: 0, engagementRate: 0 };
    }

    try {
      // Twitter API v2 endpoint for tweet metrics
      const response = await fetch(`https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const metrics = data.data?.public_metrics;
        
        if (metrics) {
          return {
            platform: 'twitter',
            postId: tweetId,
            views: metrics.impression_count || 0,
            likes: metrics.like_count || 0,
            comments: metrics.reply_count || 0,
            shares: metrics.retweet_count || 0,
            engagementRate: this.calculateEngagementRate(
              metrics.like_count || 0,
              metrics.reply_count || 0,
              metrics.retweet_count || 0,
              metrics.impression_count || 0
            )
          };
        }
      }
    } catch (error) {
      console.error('Error fetching Twitter analytics:', error);
    }

    return { platform: 'twitter', postId: tweetId, views: 0, likes: 0, comments: 0, shares: 0, engagementRate: 0 };
  }

  // Fetch analytics from Facebook API
  async fetchFacebookAnalytics(postId: string, accessToken?: string): Promise<Partial<SocialMediaAnalytics>> {
    if (!accessToken) {
      return { platform: 'facebook', postId, views: 0, likes: 0, comments: 0, shares: 0, engagementRate: 0 };
    }

    try {
      // Facebook Graph API endpoint
      const response = await fetch(`https://graph.facebook.com/v18.0/${postId}?fields=insights.metric(post_impressions,post_reactions_by_type,post_actions_by_type)`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const insights = data.insights?.data;
        
        if (insights) {
          const impressions = insights.find((i: any) => i.name === 'post_impressions')?.values?.[0]?.value || 0;
          const reactions = insights.find((i: any) => i.name === 'post_reactions_by_type')?.values?.[0]?.value || {};
          const actions = insights.find((i: any) => i.name === 'post_actions_by_type')?.values?.[0]?.value || {};

          const totalLikes = Object.values(reactions).reduce((sum: number, count: any) => sum + (count || 0), 0);
          const totalShares = actions.share || 0;

          return {
            platform: 'facebook',
            postId,
            views: impressions,
            likes: totalLikes,
            comments: 0, // Facebook doesn't provide comment count in basic insights
            shares: totalShares,
            engagementRate: this.calculateEngagementRate(totalLikes, 0, totalShares, impressions)
          };
        }
      }
    } catch (error) {
      console.error('Error fetching Facebook analytics:', error);
    }

    return { platform: 'facebook', postId, views: 0, likes: 0, comments: 0, shares: 0, engagementRate: 0 };
  }

  // Fetch analytics from Instagram API
  async fetchInstagramAnalytics(mediaId: string, accessToken?: string): Promise<Partial<SocialMediaAnalytics>> {
    if (!accessToken) {
      return { platform: 'instagram', postId: mediaId, views: 0, likes: 0, comments: 0, shares: 0, engagementRate: 0 };
    }

    try {
      // Instagram Basic Display API
      const response = await fetch(`https://graph.instagram.com/v18.0/${mediaId}?fields=like_count,comments_count,media_type`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        return {
          platform: 'instagram',
          postId: mediaId,
          views: 0, // Instagram doesn't provide view count in basic API
          likes: data.like_count || 0,
          comments: data.comments_count || 0,
          shares: 0, // Instagram doesn't provide share count in basic API
          engagementRate: this.calculateEngagementRate(data.like_count || 0, data.comments_count || 0, 0, 0)
        };
      }
    } catch (error) {
      console.error('Error fetching Instagram analytics:', error);
    }

    return { platform: 'instagram', postId: mediaId, views: 0, likes: 0, comments: 0, shares: 0, engagementRate: 0 };
  }

  // Update social share with analytics data
  async updateShareAnalytics(shareId: string, analytics: Partial<SocialMediaAnalytics>): Promise<void> {
    try {
      const shareRef = doc(db, 'socialShares', shareId);
      await updateDoc(shareRef, {
        views: analytics.views || 0,
        likes: analytics.likes || 0,
        comments: analytics.comments || 0,
        shares: analytics.shares || 0,
        engagementRate: analytics.engagementRate || 0,
        analyticsUpdatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating share analytics:', error);
    }
  }

  // Fetch and update analytics for all shares
  async updateAllSharesAnalytics(): Promise<void> {
    try {
      const sharesQuery = query(collection(db, 'socialShares'), where('status', '==', 'shared'));
      const sharesSnapshot = await getDocs(sharesQuery);
      
      for (const shareDoc of sharesSnapshot.docs) {
        const shareData = shareDoc.data();
        const shareId = shareDoc.id;
        
        // Get user's access token for the platform
        const userQuery = query(collection(db, 'userProfiles'), where('uid', '==', shareData.userId));
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          let analytics: Partial<SocialMediaAnalytics> = {};

          switch (shareData.platform) {
            case 'linkedin':
              analytics = await this.fetchLinkedInAnalytics(shareData.shareUrl || '', userData.linkedinAccessToken);
              break;
            case 'twitter':
              analytics = await this.fetchTwitterAnalytics(shareData.shareUrl || '', userData.twitterAccessToken);
              break;
            case 'facebook':
              analytics = await this.fetchFacebookAnalytics(shareData.shareUrl || '', userData.facebookAccessToken);
              break;
            case 'instagram':
              analytics = await this.fetchInstagramAnalytics(shareData.shareUrl || '', userData.instagramAccessToken);
              break;
          }

          if (analytics.views !== undefined || analytics.likes !== undefined) {
            await this.updateShareAnalytics(shareId, analytics);
          }
        }
      }
    } catch (error) {
      console.error('Error updating all shares analytics:', error);
    }
  }

  // Get platform statistics
  async getPlatformStats(): Promise<PlatformStats[]> {
    try {
      const sharesQuery = query(collection(db, 'socialShares'), where('status', '==', 'shared'));
      const sharesSnapshot = await getDocs(sharesQuery);
      
      const platformStats = new Map<string, PlatformStats>();
      
      sharesSnapshot.docs.forEach(doc => {
        const shareData = doc.data();
        const platform = shareData.platform;
        
        if (!platformStats.has(platform)) {
          platformStats.set(platform, {
            platform,
            totalPosts: 0,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            totalShares: 0,
            averageEngagementRate: 0,
            topPerformingPosts: []
          });
        }
        
        const stats = platformStats.get(platform)!;
        stats.totalPosts++;
        stats.totalViews += shareData.views || 0;
        stats.totalLikes += shareData.likes || 0;
        stats.totalComments += shareData.comments || 0;
        stats.totalShares += shareData.shares || 0;
        
        if (shareData.views > 0) {
          stats.topPerformingPosts.push({
            postId: doc.id,
            views: shareData.views || 0,
            likes: shareData.likes || 0,
            engagementRate: shareData.engagementRate || 0
          });
        }
      });
      
      // Calculate average engagement rates and sort top performing posts
      platformStats.forEach(stats => {
        stats.averageEngagementRate = stats.totalPosts > 0 
          ? (stats.totalLikes + stats.totalComments + stats.totalShares) / stats.totalViews * 100 
          : 0;
        
        stats.topPerformingPosts.sort((a, b) => b.views - a.views);
        stats.topPerformingPosts = stats.topPerformingPosts.slice(0, 5);
      });
      
      return Array.from(platformStats.values());
    } catch (error) {
      console.error('Error getting platform stats:', error);
      return [];
    }
  }

  // Calculate engagement rate
  private calculateEngagementRate(likes: number, comments: number, shares: number, views: number): number {
    if (views === 0) return 0;
    return ((likes + comments + shares) / views) * 100;
  }

  // Schedule analytics updates
  scheduleAnalyticsUpdates(): void {
    // Update analytics every 6 hours
    setInterval(() => {
      this.updateAllSharesAnalytics();
    }, 6 * 60 * 60 * 1000);
  }
}

export const analyticsService = new AnalyticsService();
