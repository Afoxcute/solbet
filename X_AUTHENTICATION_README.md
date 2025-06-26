# X (Twitter) Authentication Setup

This project includes X (formerly Twitter) authentication for user login and social features. Follow these steps to set up the X authentication in your local development environment.

## Prerequisites

1. You need to have a Twitter Developer Account
2. You need to create a project and app in the Twitter Developer Portal

## Setting Up Twitter Developer Account

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Sign in with your Twitter account
3. Create a new Project and App
4. Set the App permissions to:
   - Read and Write
   - Request email from users (if needed)
5. Configure the callback URL to be `http://localhost:3000/api/auth/callback/twitter`
6. Note down your Client ID and Client Secret

## Environment Variables Setup

1. Copy the `env.template` file to `.env.local`:
   ```bash
   cp env.template .env.local
   ```

2. Fill in your Twitter API credentials and generate a secure NextAuth secret:
   ```
   # NextAuth configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-random-secure-string-here
   
   # Twitter/X API credentials
   TWITTER_CLIENT_ID=your-twitter-client-id
   TWITTER_CLIENT_SECRET=your-twitter-client-secret
   ```

## Running the Application

After setting up the environment variables, start the development server:

```bash
pnpm dev
```

The X authentication should now be working. You can test it by clicking the "Register/Sign in with X" button in the navigation bar.

## Features Implemented

- X OAuth 2.0 authentication
- User profile management
- Tweet posting from the app
- User profile information fetching

## Troubleshooting

If you encounter any issues:

1. Check that your environment variables are set correctly
2. Ensure your app in the Twitter Developer Portal has the correct permissions and callback URL
3. Check browser console for any errors
4. Verify that your Twitter Developer App is approved for the required permissions 