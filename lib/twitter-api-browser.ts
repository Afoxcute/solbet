
// This file provides browser-compatible Twitter API implementations
// that avoid using Node.js specific modules like 'fs'

// import { TwitterApi } from ;

// Create a Twitter API client with browser-safe configuration
export async function createTwitterClient(token: string) {
  const twitterApi = await import("twitter-api-v2");
  // Create instance with token but avoid using features that require fs module
  const client = new twitterApi.TwitterApi(token);

  return {
    // Safe wrapper around v2 client
    v2: {
      // Tweet methods
      tweet: (text: string) => client.v2.tweet(text),
      me: (options?: any) => client.v2.me(options),
      user: (userId: string, options?: any) => client.v2.user(userId, options),
      // Add other v2 methods as needed, avoiding methods that use fs
    },
    // Add other API version methods as needed
  };
}

// Re-export Twitter API types for convenience
export { TwitterApi } from "twitter-api-v2";
