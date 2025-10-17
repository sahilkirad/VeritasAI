#!/usr/bin/env python3
"""
OAuth2 Token Generator for Google Calendar
This script will help you get an access token for your Gmail account.
"""

import json
from google_auth_oauthlib.flow import InstalledAppFlow

# OAuth2 credentials
OAUTH2_CREDENTIALS = {
    "web": {
        "client_id": "533015987350-tgvenvt5olcfp1gc745p5p5ib0fqg7i20.apps.googleusercontent.com",
        "project_id": "veritas-472301",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": "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",
        "redirect_uris": ["http://localhost:3000", "https://veritas-472301.web.app/"],
        "javascript_origins": ["http://localhost:3000", "https://veritas-472301.web.app"]
    }
}

SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_oauth_token():
    """Get OAuth2 access token for Google Calendar."""
    print("🔐 Starting OAuth2 flow for Google Calendar...")
    print("📧 This will use your Gmail account: kiradsahil882@gmail.com")
    print()
    
    try:
        # Create OAuth2 flow
        flow = InstalledAppFlow.from_client_config(OAUTH2_CREDENTIALS, SCOPES)
        
        # Run the OAuth2 flow
        print("🌐 Opening browser for OAuth2 authorization...")
        print("👤 Please log in with your Gmail account: kiradsahil882@gmail.com")
        print("✅ Grant permission to access Google Calendar")
        print()
        
        credentials = flow.run_local_server(port=8080)
        
        # Extract the access token
        access_token = credentials.token
        refresh_token = credentials.refresh_token
        
        print("✅ OAuth2 authorization successful!")
        print(f"🔑 Access Token: {access_token}")
        print(f"🔄 Refresh Token: {refresh_token}")
        print()
        
        # Save tokens to file
        token_data = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_uri": "https://oauth2.googleapis.com/token",
            "client_id": OAUTH2_CREDENTIALS["web"]["client_id"],
            "client_secret": OAUTH2_CREDENTIALS["web"]["client_secret"]
        }
        
        with open("oauth_tokens.json", "w") as f:
            json.dump(token_data, f, indent=2)
        
        print("💾 Tokens saved to oauth_tokens.json")
        print("🚀 You can now use these tokens in your Cloud Function!")
        
        return access_token, refresh_token
        
    except Exception as e:
        print(f"❌ OAuth2 flow failed: {e}")
        return None, None

if __name__ == "__main__":
    get_oauth_token()
