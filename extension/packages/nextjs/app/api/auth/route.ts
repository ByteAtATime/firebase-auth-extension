import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { Address, Hex, recoverTypedDataAddress } from "viem";
import { adminAuth } from "~~/services/admin";
import { EIP_712_DOMAIN, EIP_712_TYPES__AUTHENTICATE } from "~~/utils/eip712";
import { auth } from "~~/services/firebase";
import { signInWithCustomToken } from "firebase/auth";

type AuthenticateBody = {
  signer?: Address;
  timestamp?: number;
  signature?: Hex;
};

export const POST = async (req: NextRequest) => {
  const { signer, timestamp, signature } = (await req.json()) as AuthenticateBody;

  if (!signer || !timestamp || !signature) {
    return new Response("Missing required fields", { status: 400 });
  }

  const recoveredAddress = await recoverTypedDataAddress({
    domain: EIP_712_DOMAIN,
    types: EIP_712_TYPES__AUTHENTICATE,
    primaryType: "Message",
    message: { user: signer, timestamp },
    signature,
  });
  if (recoveredAddress !== signer) {
    return new Response("Invalid signature", { status: 401 });
  }

  try {
    const accessToken = await adminAuth.createCustomToken(signer);

    const userCredential = await signInWithCustomToken(auth, accessToken);

    const fiveDays = 60 * 60 * 24 * 5 * 1000;
    const expiresAt = Date.now() + fiveDays - 1000 * 60; // just to be safe
    const sessionCookie = await adminAuth.createSessionCookie(await userCredential.user.getIdToken(), {
      expiresIn: fiveDays,
    });
  
    cookies().set("__session", sessionCookie);

    return Response.json({ success: true, expiresAt }, { status: 200 });
  } catch (e) {
    console.error(e);
    return Response.json({ success: false }, { status: 500 });
  }
};
