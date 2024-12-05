# Figma Plugin with Supabase and Python Backend

## Overview

This project integrates a Figma plugin with a Python FastAPI backend to provide seamless interaction with Supabase services for authentication and data management. The plugin leverages Supabase for user authentication and database access while using a Python server as a secure intermediary.

## Project Structure

### **Figma Plugin Project**

- **Framework:** Built using the [Create Figma Plugin](https://yuanqing.github.io/create-figma-plugin/) framework.
- **Purpose:** To allow Figma users to interact with a Supabase database and create short URLs for Figma frames.

#### **Directory Structure**

```
src/
| - components/
|    | - LoggedIn.tsx
|    | - LoggedOut.tsx
| - hooks/
|    | - copyToClipboard.ts
|    | - useAuthToken.ts
constants.ts
main.ts
types.ts
ui.tsx
```

- **`main.ts`**: Main entry point for the plugin's backend logic.
- **`ui.tsx`**: Manages the plugin UI, rendering login/logout states based on authentication.
- **`components/LoggedIn.tsx`**: Handles functionality available to authenticated users (e.g., short URL generation).
- **`components/LoggedOut.tsx`**: Handles user login.
- **`hooks/useAuthToken.ts`**: Custom hook to manage authentication tokens.

#### **Key Features**

1. **Login:** Authenticates users with their email and password via Supabase.
2. **Token Management:** Saves, loads, and deletes authentication tokens using Figma's client storage.
3. **Short URL Generation:** Allows users to generate short URLs for selected Figma frames.

---

### **Python FastAPI Backend**

- **Framework:** Built with FastAPI.
- **Purpose:** Acts as an intermediary to securely communicate with Supabase services and other external APIs.

#### **Directory Structure**

```
api/
| - service/
|    | - figma/
|    |    | - share.py
|    | - auth.py
|    | - vision.py
| - index.py
```

- **`index.py`**: Main entry point for the FastAPI server.
- **`service/auth.py`**: Manages Supabase authentication.
- **`service/figma/share.py`**: Handles URL shortening and Supabase database interactions.
- **`service/vision.py`**: (Placeholder) Implements Google Vision API integration for app screen analysis.

#### **Key Features**

1. **Authentication Proxy:** Facilitates secure login requests from the plugin to Supabase.
2. **Short URL Creation:** Generates short URLs using Supabase.
3. **CORS Management:** Configures CORS policies for local and production environments.

---

## Workflow

1. **User Login:**

   - The user enters their email and password in the plugin.
   - The plugin sends the credentials to the Python backend (`/supabase-login`).
   - The backend authenticates the user via Supabase and returns an access token.

2. **Token Management:**

   - The plugin saves the access token locally using `figma.clientStorage`.
   - The token is used for subsequent authenticated requests.

3. **Short URL Generation:**

   - The user selects a frame in Figma and clicks "Generate Short URL."
   - The plugin generates a Figma URL for the selected frame and sends it to the Python backend (`/create-short-url`).
   - The backend creates a short URL using Supabase and returns it to the plugin.

---

## Environment Variables

The following environment variables are required for the Python backend:

- **`SUPABASE_URL`**: The base URL of your Supabase project.
- **`SUPABASE_KEY`**: The API key for your Supabase project.
- **`SERVICE_ACCOUNT_FILE_BASE64`**: A Base64-encoded string of your Google Cloud service account JSON.
- **`ENVIRONMENT`**: `local` or `production` (determines CORS policies).

Create a `.env` file in the `api/` directory and add these variables.

---

## Deployment

### **Figma Plugin**

1. Build the plugin using the `create-figma-plugin` CLI.
2. Publish the plugin through the Figma developer console.

### **Python Backend**

1. Deploy the backend to a cloud provider (e.g., Vercel).
2. Configure the `vercel.json` file for deployment:

   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api/index.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "api/index.py"
       }
     ]
   }
   ```

3. Set environment variables in the Vercel dashboard.

---

## Troubleshooting

### **Common Issues**

1. **Login Fails with `HTTP error! status: 500`:**

   - Verify that Supabase credentials are correctly set in the backend.
   - Check the backend logs for detailed error messages.

2. **Plugin Not Switching to Logged-In State:**

   - Ensure `TOKEN_SAVED` is properly handled in the plugin's event listeners.

3. **CORS Errors:**

   - Confirm that the CORS policies in `index.py` match the expected environment (local or production).

---

## Future Enhancements

1. **Enable Deployed Backend Integration:**

   - Update the plugin's API endpoints to use the deployed server URL instead of `localhost`.

2. **Improved Error Handling:**

   - Implement more robust error messages in both the plugin and backend.

3. **Expanded Features:**

   - Add analytics for user actions.
   - Implement additional integrations using Supabase database capabilities.

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

# Preact Resizable

## Development guide

_This plugin is built with [Create Figma Plugin](https://yuanqing.github.io/create-figma-plugin/)._

### Pre-requisites

- [Node.js](https://nodejs.org) – v20
- [Figma desktop app](https://figma.com/downloads/)

### Build the plugin

To build the plugin:

```
$ npm run build
```

This will generate a [`manifest.json`](https://figma.com/plugin-docs/manifest/) file and a `build/` directory containing the JavaScript bundle(s) for the plugin.

To watch for code changes and rebuild the plugin automatically:

```
$ npm run watch
```

### Install the plugin

1. In the Figma desktop app, open a Figma document.
2. Search for and run `Import plugin from manifest…` via the Quick Actions search bar.
3. Select the `manifest.json` file that was generated by the `build` script.

### Debugging

Use `console.log` statements to inspect values in your code.

To open the developer console, search for and run `Show/Hide Console` via the Quick Actions search bar.

## See also

- [Create Figma Plugin docs](https://yuanqing.github.io/create-figma-plugin/)
- [`yuanqing/figma-plugins`](https://github.com/yuanqing/figma-plugins#readme)

Official docs and code samples from Figma:

- [Plugin API docs](https://figma.com/plugin-docs/)
- [`figma/plugin-samples`](https://github.com/figma/plugin-samples#readme)
