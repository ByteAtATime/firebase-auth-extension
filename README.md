# Firebase Auth Extension

This is a simple extension that adds authentication functionality through Firebase for Scaffold-ETH 2.

## Installation

```
npx create-eth@latest -e ByteAtATime/firebase-auth-extension:main
```

## Configuration

To get started, you need to get your Firebase credentials. Here is a video that explains how to do that:

https://github.com/user-attachments/assets/28260651-fb73-4a18-8b31-7a77f0ebf16b

By the end of the video, you should have downloaded a file and copied the configuration object. You will need to paste this configuration object in the `packages/nextjs/services/firebase.ts` file.

Then, you should set up your environment variables. You can do this by copying the `packages/nextjs/.env.example` file to `packages/nextjs/.env` and filling in the values.

There are two ways you can set them up:
1. Move the file you downloaded into your project, and point the `GOOGLE_APPLICATION_CREDENTIALS` to the file.
2. Copy the `private_key` and `client_email` fields from the file you downloaded into the `FIREBASE_PRIVATE_KEY` and `FIREBASE_CLIENT_EMAIL` fields respectively.

Either way, you also have to set up the `FIREBASE_PROJECT_ID` field with the project ID from the Firebase console.

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

The `userCredential.user` is the Firebase `User` object. However, because we're initializing the user through `createCustomToken`, **it is missing many fields**. Crucially:
* `displayName` is null
* `email` is null
* `emailVerified` is false
* `photoURL` is null
* `isAnonymous` is false
* `providerId` and `providerData` are null and blank respectively

The `uid` field is the user's address.

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
      // An error will be displayed to the user by the hook, so we ignore it here
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

## Complete Guide

This is a guide that explains how to set up Firebase Auth in Scaffold-ETH 2. By the end, you should have a working (albeit barebones) project!

### Step 1: Create a Firebase Project

1. Go to the Firebase console: https://console.firebase.google.com/
2. Click on "Add project"
3. Fill in the project name and click "Continue"
4. Click "Create project"

### Step 2: Get Firebase Credentials

1. Click on the gear icon and go to "Project settings"
2. Click on the "Service accounts" tab
3. Click on "Generate new private key"
4. Save the file that was downloaded. You will need it later.

### Step 3: Clone Scaffold-ETH 2

1. Set up the project using the following command:

```
npx create-eth@latest -e ByteAtATime/firebase-auth-extension:main
```

2. Rename `packages/nextjs/.env.example` to `packages/nextjs/.env`

### Step 4: Fill in the Environment Variables

1. Open the `packages/nextjs/.env`
2. Fill in the `FIREBASE_PROJECT_ID` field with the project ID from the Firebase console
3. Do one of the following:
  * Move the file you downloaded in Step 2 into your project, and set `GOOGLE_APPLICATION_CREDENTIALS` to the path of the file
  * Copy the `private_key` and `client_email` fields from the file you downloaded in Step 2 into the `FIREBASE_PRIVATE_KEY` and `FIREBASE_CLIENT_EMAIL` fields respectively

### Step 5: Set up Firebase

1. Open `packages/nextjs/services/firebase.ts`
2. Paste the configuration object from the file you downloaded in Step 2

### Step 6: Create an Endpoint

1. Create a new file named `test-endpoint/route.ts` in `packages/nextjs/app/api`
2. Add the following code:

```typescript
import { withFirebaseAuth } from "~~/utils/endpoint-auth";

export const POST = withFirebaseAuth(async (req, { userCredential }) => {
  return new Response(`You are authenticated as ${userCredential.user.uid}.`, { status: 200 });
});
```

### Step 7: Edit The Frontend

1. Open `packages/nextjs/app/index.tsx`
2. At the top of the component, add the following line (you may need to manually import it from `~~/hooks/useFirebaseAuth`):

```typescript
const { authenticate, isAuthenticating } = useFirebaseAuth();
```

3. Add a function that calls the endpoint:

```typescript
const handleClick = async () => {
  const accessToken = await authenticate();

  if (!accessToken) {
    return;
  }

  const response = await fetch("/api/test-endpoint", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
    },
  });

  const data = await response.text();
  console.log(data);
};
```

4. Add a button that calls the function:

```typescript
<button onClick={handleClick} disabled={isAuthenticating}>
  {isAuthenticating ? "Authenticating..." : "Authenticate"}
</button>
```

### Step 8: Run the project

1. Run the project using the following command:

```
yarn start
```

2. Open the project (usually located at [localhost:3000](http://localhost:3000)) in your browser
3. Click on the button and authenticate with your wallet
4. In the console, you should see the message `You are authenticated as <your address>`

And that's it! You now have a working Firebase Auth setup in Scaffold-ETH 2.

