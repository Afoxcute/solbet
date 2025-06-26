# Solana Wallet Integration

This project includes Solana wallet integration for authentication and wallet functionality. Follow these steps to set up the Solana wallet integration in your local development environment.

## Features

- Solana wallet connection and management
- Save wallet data to local database
- Token balances and account information
- Solana transaction functionality
- Drizzle database schema for storing wallet data
- Multiple wallet providers support

## Technical Implementation

The Solana wallet integration consists of:

1. **Backend Components**:
   - Database schema for storing wallet data
   - Authentication API endpoint for verifying wallet signatures
   - Integration with NextAuth.js to link wallets to user accounts

2. **Frontend Components**:
   - Solana Wallet Adapter integration with multiple wallet providers
   - Wallet connection UI
   - Wallet details page with balance and token information
   - Profile page integration for connecting wallets to accounts

## Database Schema

The database includes the following wallet-related tables:

- `Wallet`: Stores wallet information including public key, balances, and connection status
- `Token`: Stores token information for each wallet
- `User`: Links wallets to user accounts (can have multiple wallets)

## Setup Instructions

1. Clone the repository and install dependencies:

```bash
npm install
# or
pnpm install
```

2. Create a `.env` file with required environment variables:

```
DATABASE_URL=file:./dev.db
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

3. Run Drizzle migrations to set up the database:

```bash
pnpm db:generate
pnpm db:migrate
```

4. Install a Solana wallet browser extension like [Phantom](https://phantom.app/) or [Solflare](https://solflare.com/)

5. Start the development server:

```bash
pnpm dev
```

## Usage

1. Navigate to the `/profile` page
2. Click the "Connect" button in the Solana wallet section
3. Select your wallet provider and approve the connection
4. Sign the authentication message when prompted
5. Your wallet will now be linked to your account
6. Visit the `/wallet` page to view detailed wallet information

## Security Considerations

- All signatures are verified on the server-side
- We use message signing instead of requesting private keys
- Wallet public keys are stored securely in the database
- Connections can be revoked at any time

## Supported Wallet Providers

Currently, the application supports the following wallet adapters:
- Phantom
- Solflare

Additional wallet adapters can be added by updating the `SolanaWalletProvider.tsx` file.

## Troubleshooting

If you encounter issues with wallet connection:

1. Make sure your wallet is connected to the Solana devnet
2. Check that your browser extension is up to date
3. Clear your browser cache and reload the page
4. Verify that you're using a supported browser (Chrome, Firefox, Brave) 