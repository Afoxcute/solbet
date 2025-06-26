// "server-only";
import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { createTwitterClient } from '@/lib/twitter-api-browser';
import { getServerSession } from 'next-auth';

export const twitterRouter = createTRPCRouter({
  // Get user information from Twitter API
  getUserInfo: baseProcedure
    .input(z.object({
      userId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const session = await getServerSession();
        
        if (!session?.accessToken) {
          throw new Error('Not authenticated');
        }
        
        const twitterClient =await createTwitterClient(session.accessToken);
        
        // Get user details from Twitter API
        let userDetails;
        
        if (input.userId) {
          // Get specific user
          userDetails = await twitterClient.v2.user(input.userId, {
            "user.fields": ["profile_image_url", "description", "public_metrics", "verified", "username"],
          });
        } else if (session.user.twitterId) {
          // Get authenticated user
          userDetails = await twitterClient.v2.user(session.user.twitterId, {
            "user.fields": ["profile_image_url", "description", "public_metrics", "verified", "username"],
          });
        } else {
          // Use me endpoint if no specific user is requested
          userDetails = await twitterClient.v2.me({
            "user.fields": ["profile_image_url", "description", "public_metrics", "verified", "username"],
          });
        }
        
        return userDetails.data;
      } catch (error) {
        console.error('Error fetching Twitter user info:', error);
        throw error;
      }
    }),
  
  // Tweet functionality
  tweet: baseProcedure
    .input(z.object({
      text: z.string().max(280),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const session = await getServerSession();
        
        if (!session?.accessToken) {
          throw new Error('Not authenticated');
        }
        
        const twitterClient = await createTwitterClient(session.accessToken);
        
        // Create the tweet
        const response = await twitterClient.v2.tweet(input.text);
        
        return response.data;
      } catch (error) {
        console.error('Error posting tweet:', error);
        throw error;
      }
    }),
}); 