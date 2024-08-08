import { NextRequest } from "next/server";
import { UserCredential, signInWithCustomToken } from "@firebase/auth";
import { auth } from "~~/services/firebase";

export const withFirebaseAuth =
  <Params>(
    handler: (request: NextRequest, context: { params: Params; userCredential: UserCredential }) => Promise<Response>,
  ) =>
  async (req: NextRequest, context: { params: Params }): Promise<Response> => {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    let userCredential: UserCredential | undefined = undefined;
    try {
      userCredential = await signInWithCustomToken(auth, token);
    } catch {
      return new Response("Invalid token", { status: 401 });
    }

    return handler(req, { ...context, userCredential });
  };
