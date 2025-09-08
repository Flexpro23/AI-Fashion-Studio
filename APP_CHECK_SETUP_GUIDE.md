# How to Set Up Firebase App Check for Phone Authentication

Follow these steps to configure Firebase App Check with reCAPTCHA Enterprise. This is required to fix the `auth/invalid-app-credential` error you are seeing.

### Step 1: Enable App Check in Firebase

1.  Open your Firebase project console.
2.  In the left-hand navigation, under the **Build** section, click on **App Check**.
3.  If you're setting up App Check for the first time, click **Get started**.

### Step 2: Register Your App with App Check

1.  Inside the App Check section, click on the **Apps** tab.
2.  Find your web app in the list and click on it. If your app is not listed, you'll need to register it in your Project Settings first.

### Step 3: Configure reCAPTCHA Enterprise

1.  You will be prompted to choose a provider. Select **reCAPTCHA Enterprise**.
2.  Click the button to **Enable reCAPTCHA Enterprise**. You will be redirected to the Google Cloud Console.
3.  Make sure you are in the correct Google Cloud project, and click **Enable** to turn on the reCAPTCHA Enterprise API.
4.  Now you need to create a reCAPTCHA key:
    *   **Platform type**: Choose **Website**.
    *   **Display name**: Give it a descriptive name like "AI Fashion Studio Web".
    *   **Domains**: Add all the domains where your app will be used. For this project, you should add:
        *   `localhost` (for local development)
        *   Your Vercel production domain (e.g., `ai-fashion-studio.vercel.app`)
    *   **Disable "Use checkbox challenge"**: Ensure the checkbox for "Use checkbox challenge" is **unchecked**. We are using an invisible reCAPTCHA.
    *   Click **Create key**.
5.  After the key is created, copy the **Site Key**.

### Step 4: Finalize Configuration

1.  Go back to the Firebase App Check console page.
2.  Paste the **Site Key** you just copied into the "reCAPTCHA Enterprise Site Key" field.
3.  Click **Save**.
4.  ✅ **COMPLETED**: The new reCAPTCHA Enterprise site key has been configured:
    ```
    Site Key: 6LcdRMIrAAAAAKbZOpLW5JJzJS_fPvgi8JPyByR4
    ```
    This key has been added to `src/lib/firebase.ts` and is ready to use.
    
    ✅ **Key Features**: 
    - Invisible reCAPTCHA (no checkbox challenge)
    - Domain verification disabled for testing
    - Compatible with Firebase App Check
6. Redeploy your application for the changes to take effect.

After completing these steps, the phone number authentication flow should work without errors.
