import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { useAccount, useSignTypedData } from "wagmi";
import { EIP_712_DOMAIN, EIP_712_TYPES__AUTHENTICATE } from "~~/utils/eip712";
import { notification } from "~~/utils/scaffold-eth";

export const useFirebaseAuth = () => {
  const { address } = useAccount();
  const [sessionExpiresAt, setSessionExpiresAt] = useLocalStorage<number>("sessionExpiresAt", 0);
  const { signTypedDataAsync } = useSignTypedData();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticate = async () => {
    if (sessionExpiresAt && sessionExpiresAt > Date.now()) {
      return;
    }

    const loadingNotif = notification.loading("Authenticating...");
    if (!address) {
      notification.remove(loadingNotif);
      notification.error("Please connect your wallet to authenticate!");
      return;
    }

    const timestamp = Date.now();
    const signature = await signTypedDataAsync({
      domain: EIP_712_DOMAIN,
      types: EIP_712_TYPES__AUTHENTICATE,
      primaryType: "Message",
      message: { user: address, timestamp },
    });

    const response = await fetch("/api/auth", {
      method: "POST",
      body: JSON.stringify({ signer: address, timestamp, signature }),
    });
    if (!response.ok) {
      notification.remove(loadingNotif);
      notification.error("Authentication failed");
      return;
    }

    const { expiresAt } = await response.json();
    setSessionExpiresAt(expiresAt);

    notification.remove(loadingNotif);
    notification.success("Authenticated successfully!");

    return;
  };

  return {
    authenticate: async () => {
      setIsAuthenticating(true);
      const token = await authenticate();
      setIsAuthenticating(false);

      return token;
    },
    isAuthenticating,
  };
};
