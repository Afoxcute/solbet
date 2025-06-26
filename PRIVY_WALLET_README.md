# Privy Wallet Authentication for Solana

This guide provides instructions for integrating Privy wallet authentication for Solana in the 90+ application.

## Overview

Privy provides a simple authentication solution that allows users to:
- Connect with existing Solana wallets (Phantom, Solflare, etc.)
- Create new embedded Solana wallets for users without wallets
- Authenticate with various methods (email, social, etc.)

## Setup Instructions

### 1. Register with Privy

1. Visit [Privy Dashboard](https://console.privy.io/) and create an account
2. Create a new application and take note of your App ID
3. Configure your application settings:
   - Set allowed domains (including localhost for development)
   - Configure appearance settings
   - Set up login methods

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id-here
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

### 3. Privy Provider Configuration

In your application, set up the PrivyProvider with Solana-only support:

```tsx
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

<PrivyProvider
  appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
  config={{
    loginMethods: ['email', 'wallet'],
    embeddedWallets: {
      solana: {
        createOnLogin: 'users-without-wallets'
      }
    },
    appearance: {
      theme: 'light',
      accentColor: '#3182CE',
      logo: '/logo.png',
      showWalletLoginFirst: true,
      walletChainType: 'solana-only'
    },
    externalWallets: {
      solana: {
        connectors: toSolanaWalletConnectors()
      }
    },
    solanaClusters: [
      { name: 'devnet', rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com' }
    ]
  }}
>
  {children}
</PrivyProvider>
```

### 4. Testing Privy Authentication

1. Navigate to `/wallet/solana` in your application
2. You should see a login button that allows you to connect using Privy
3. After connecting, you'll be able to view your Solana wallet address and balance
4. You can test sending transactions and requesting airdrops (on devnet)

## Usage

### Checking Authentication Status

```typescript
import { usePrivy } from '@privy-io/react-auth';

function YourComponent() {
  const { ready, authenticated, user } = usePrivy();
  
  if (!ready) return <div>Loading...</div>;
  
  if (!authenticated) {
    return <button onClick={login}>Connect Solana Wallet</button>;
  }
  
  return <div>Wallet connected!</div>;
}
```

### Using with Solana

We provide a custom hook `usePrivySolana()` to simplify working with Solana:

```typescript
import { usePrivySolana } from '@/hooks/usePrivySolana';

function YourComponent() {
  const { 
    solanaPublicKey, 
    connection, 
    signTransaction, 
    signMessage,
    sendTransaction,
    isReady 
  } = usePrivySolana();
  
  // Now you can use these methods to interact with Solana
  // solanaPublicKey is the user's Solana public key
  // connection is a Solana Connection instance
  // signTransaction can be used to sign Solana transactions
  // signMessage can be used to sign messages
  // sendTransaction is a helper to sign and send transactions
}
```

### Sending a Transaction Example

```typescript
import { SystemProgram, Transaction } from "@solana/web3.js";

async function sendSol() {
  if (!isReady || !solanaPublicKey || !connection) return;
  
  try {
    // Create a transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: solanaPublicKey,
        toPubkey: recipientPublicKey,
        lamports: amountInLamports,
      })
    );
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = solanaPublicKey;
    
    // Sign and send transaction
    const signature = await sendTransaction(transaction);
    console.log("Transaction sent:", signature);
  } catch (error) {
    console.error("Transaction error:", error);
  }
}
```

## Troubleshooting

- If you encounter issues with authentication, make sure your App ID is correctly set in `.env.local`
- For network issues, check that you're using the correct Solana network (mainnet, devnet, or testnet)
- If embedded wallets aren't working, verify that they're properly configured in your Privy dashboard
- Make sure you have installed the necessary dependencies:
  ```
  npm install @privy-io/react-auth @solana/web3.js @solana/spl-token
  ```

For more information, visit the [Privy Documentation](https://docs.privy.io/)