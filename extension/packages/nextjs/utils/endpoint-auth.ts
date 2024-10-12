import { NextRequest } from "next/server";
import { UserCredential } from "@firebase/auth";
import { cookies } from "next/headers";
import { adminAuth } from "~~/services/admin";
import { DecodedIdToken } from "firebase-admin/auth";

export function withFirebaseAuth<Params>(handler: (request: NextRequest, context: { params: Params; decodedToken: DecodedIdToken }) => Promise<Response>) {
  return async (req: NextRequest, context: { params: Params }): Promise<Response> => {
    const token = cookies().get("__session")?.value;

    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    let decodedToken: DecodedIdToken | undefined = undefined;
    try {
      decodedToken = await adminAuth.verifySessionCookie(token);
    } catch {
      return new Response("Unauthorized", { status: 401 });
    }

    console.log(decodedToken);

    return handler(req, { ...context, decodedToken });
  };
}
