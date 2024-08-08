# Firebase Auth Extension

This is a simple extension that adds authentication functionality through Firebase for Scaffold-ETH 2.

## Installation

```
npx create-eth@latest -e ByteAtATime/firebase-auth-extension:main
```

## Configuration

Copy `packages/nextjs/.env.example` to `packages/nextjs/.env` and fill in the required Firebase configuration values. (You need to create a Firebase project if you haven't already.) Remember to make sure Firebase Auth is enabled in the Firebase console for your project.

You first need to set up Firebase. In your project, create a new web app and copy the configuration file. In `packages/nextjs/services/firebase.ts`, update the `firebaseConfig` object with your Firebase configuration.

### Endpoints

Whenever you need to perform any actions as the user, you can create a new endpoint in `packages/nextjs/pages/api`. To make your life easier, you can use the `withFirebaseAuth` helper function to authenticate the user.

Here is an example of an endpoint that requires the user to be authenticated:

```typescript
import { withFirebaseAuth } from "~~/utils/endpoint-auth";

export const POST = withFirebaseAuth(async (req, { userCredential }) => {
  return new Response(`You are authenticated as ${userCredential.user.uid}.`, { status: 200 });
});
```

This function is implemented in `packages/nextjs/utils/endpoint-auth.ts`. It will return a 401 error if the user is not authenticated, or if the token is invalid/expired.

### Invoking Endpoints

In order to POST to an endpoint, you can use the `useFirebaseAuth` hook. This hook will automatically handle the authentication for you.

Here is an example of how you can use the hook:

```typescript
import { useFirebaseAuth } from "~~/hooks/useFirebaseAuth";

export default function MyComponent() {
  const { authenticate, isAuthenticating } = useFirebaseAuth();

  const handleClick = async () => {
    const accessToken = await authenticate();

    if (!accessToken) {
      // The user cancelled the signature, wallet isn't connected, etc.
      // An error should be displayed to the user, so we ignore it here
      return;
    }

    const response = await fetch("/api/my-endpoint", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
      },
      body: JSON.stringify({
        // ...
      }),
    });
  };

  return (
    <button onClick={handleClick} disabled={isAuthenticating}>
      {isAuthenticating ? "Authenticating..." : "Authenticate"}
    </button>
  );
}
```

A few things to note here:
1. If the `authenticate` function fails, it will create a toast explaining why; you can ignore the error in this case.
2. For endpoints created using the `withFirebaseAuth` helper, you need to pass the token in the `Authorization` header.
3. The `authenticate()` function returns a promise of `{ token: string; expires: number }`. If you only need the authentication, remember to use the `.token`!
