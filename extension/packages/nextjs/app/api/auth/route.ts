import { NextRequest } from "next/server";
import { Address, Hex, recoverTypedDataAddress } from "viem";
import { adminAuth } from "~~/services/admin";
import { EIP_712_DOMAIN, EIP_712_TYPES__AUTHENTICATE } from "~~/utils/eip712";

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

    return Response.json({ data: { accessToken } }, { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("Authentication failed", { status: 500 });
  }
};
