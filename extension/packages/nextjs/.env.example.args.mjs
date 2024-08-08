export const additionalVars = `

### Variables for Firebase ###

# The following variables are required for Firebase. The project ID is REQUIRED:
FIREBASE_PROJECT_ID=

# And one of the following groups is required:
# -- GROUP 1 --
# If you want to connect to a live Firebase project, you can download the service account key JSON
# and add the path here;
# GOOGLE_APPLICATION_CREDENTIALS="/<your>/<path>/<to>/firebaseServiceAccountKey.json"

# -- GROUP 2 --
# OR copy/paste these values from the JSON file (easier for production environments):
# FIREBASE_CLIENT_EMAIL="your_firebase_admin_sdk_email@your_project_id.iam.gserviceaccount.com"
# FIREBASE_PRIVATE_KEY="-----BEGIN...END PRIVATE"

# -- GROUP 3 --
# If you want to connect to the Firebase emulator
# FIRESTORE_EMULATOR_HOST=localhost:8080
# FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
`;
