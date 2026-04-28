# Fixing Gemini API Key Issues

## Problem Diagnosis
Your Gemini API keys are not working because:
1. `VITE_GEMINI_API_KEY`: "API key not valid" - The key format is incorrect or inactive
2. `VITE_GEMINIAPIKEY`: "Your API key was reported as leaked" - This key has been exposed and revoked by Google

## Solution Steps

### 1. Get a New Valid API Key
Go to [Google AI Studio](https://aistudio.google.com/) and:
- Sign in with your Google account
- Click "Get API key" or go to https://aistudio.google.com/app/apikey
- Create a new API key
- Copy the new key (it should look like: `AIzaSy...`)

### 2. Update Your .env File
Replace both keys in your `.env` file with the new valid key:

```env
# GEMINI_API_KEY: Required for Gemini AI API calls.
# AI Studio automatically injects this at runtime from user secrets.
# Users configure this via the Secrets panel in the AI Studio UI.
VITE_GEMINI_API_KEY="YOUR_NEW_API_KEY_HERE"
VITE_GEMINIAPIKEY="YOUR_NEW_API_KEY_HERE"

# APP_URL: The URL where this applet is hosted.
# AI Studio automatically injects this at runtime with the Cloud Run service URL.
# Used for self-referential links, OAuth callbacks, and API endpoints.
APP_URL="MY_APP_URL"
```

### 3. Important Notes
- Both environment variables should have the same value
- After updating the .env file, you MUST restart your development server:
  ```bash
  # Stop the current dev server (Ctrl+C)
  # Then restart it
  npm run dev
  ```
- Never commit your actual API key to version control
- The keys in your current .env file have been exposed and should not be used

### 4. Verify the Fix
After restarting your dev server, the AI service should work properly. You can test it by asking the AI Copilot in your application a question.

## Security Best Practices
- Use environment variables for API keys (as you're doing)
- Restrict API key usage in Google Cloud Console if possible
- Monitor usage and set up alerts
- Rotate keys periodically