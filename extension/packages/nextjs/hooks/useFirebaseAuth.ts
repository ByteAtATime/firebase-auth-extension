import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { useAccount, useSignTypedData } from "wagmi";
import { EIP_712_DOMAIN, EIP_712_TYPES__AUTHENTICATE } from "~~/utils/eip712";
import { notification } from "~~/utils/scaffold-eth";

type AccessToken = {
  token: string;
  expires: number;
};

export const useFirebaseAuth = () => {
  const { address } = useAccount();
  const [accessToken, setAccessToken] = useLocalStorage<AccessToken | null>("access-token", null);
  const { signTypedDataAsync } = useSignTypedData();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticate = async () => {
    if (accessToken) {
      if (Date.now() < accessToken.expires) {
        return accessToken;
      } else {
        notification.warning("Access token expired, please re-authenticate!");
      }

      setAccessToken(null);
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

    const {
      data: { accessToken: token },
    } = await response.json();
    const value = { token: token, expires: Date.now() + 3600 * 1000 };
    setAccessToken(value);
    notification.remove(loadingNotif);
    notification.success("Authenticated successfully!");

    return value;
  };

  return {
    authenticate: async () => {
      setIsAuthenticating(true);
      await authenticate();
      setIsAuthenticating(false);
    },
    isAuthenticating,
  };
};
