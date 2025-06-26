import { useState } from "react";
import { useLoginWithEmail } from "@privy-io/react-auth";
import { toast } from "react-hot-toast";

export default function EmailLogin() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  
  const { 
    sendCode, 
    loginWithCode, 
    state 
  } = useLoginWithEmail({
    onComplete: ({ isNewUser }) => {
      toast.success(isNewUser ? "Welcome! Your account has been created." : "Welcome back!");
    },
    onError: (error) => {
      toast.error(`Login error: ${error}`);
    }
  });

  const handleSendCode = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    try {
      await sendCode({ email });
      toast.success("Verification code sent to your email");
    } catch (error: any) {
      console.error("Error sending code:", error);
      toast.error(error?.toString() || "Failed to send verification code");
    }
  };

  const handleLogin = async () => {
    if (!code) {
      toast.error("Please enter the verification code");
      return;
    }
    
    try {
      await loginWithCode({ code });
    } catch (error: any) {
      console.error("Error logging in:", error);
      toast.error(error?.toString() || "Failed to verify code");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Login with Email</h2>
      
      {(state.status === 'initial' || state.status === 'error' || state.status === 'sending-code') && (
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={state.status === 'sending-code'}
          />
          <button
            onClick={handleSendCode}
            disabled={state.status === 'sending-code' || !email}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {state.status === 'sending-code' ? 'Sending...' : 'Send Verification Code'}
          </button>
        </div>
      )}
      
      {(state.status === 'awaiting-code-input' || state.status === 'submitting-code') && (
        <div className="mb-4">
          <p className="mb-2 text-sm text-gray-600">
            A verification code has been sent to {email}
          </p>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            Verification Code
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={state.status === 'submitting-code'}
          />
          <div className="flex space-x-2 mt-2">
            <button
              onClick={handleLogin}
              disabled={state.status === 'submitting-code' || !code}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {state.status === 'submitting-code' ? 'Verifying...' : 'Verify Code'}
            </button>
            <button
              onClick={() => {
                setCode("");
                handleSendCode();
              }}
              disabled={state.status === 'submitting-code'}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              Resend Code
            </button>
          </div>
        </div>
      )}
      
      {state.status === 'error' && (
        <p className="text-red-600 text-sm mt-2">
          {state.error?.toString() || "An error occurred. Please try again."}
        </p>
      )}
    </div>
  );
} 