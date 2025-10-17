#!/usr/bin/env python3
"""
Get a fresh OAuth2 access token for Google Calendar API
"""

import json
import requests
from google_auth_oauthlib.flow import InstalledAppFlow

# Your OAuth2 credentials
CLIENT_CONFIG = {
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

def get_fresh_token():
    """Get a fresh access token"""
    print("🔐 Getting fresh OAuth2 token...")
    print("📧 This will use your Gmail account: kiradsahil882@gmail.com")
    
    try:
        # Create OAuth2 flow
        flow = InstalledAppFlow.from_client_config(CLIENT_CONFIG, SCOPES)
        
        # Run the OAuth2 flow
        print("\n🌐 Opening browser for OAuth2 authorization...")
        print("👤 Please log in with your Gmail account: kiradsahil882@gmail.com")
        print("✅ Grant permission to access Google Calendar")
        
        credentials = flow.run_local_server(port=8080, prompt='consent')
        
        # Extract token information
        token_info = {
            'access_token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
        
        print("\n✅ Fresh token obtained!")
        print(f"Access Token: {credentials.token}")
        print(f"Refresh Token: {credentials.refresh_token}")
        
        # Save to file
        with open('fresh_oauth_tokens.json', 'w') as f:
            json.dump(token_info, f, indent=2)
        
        print("\n💾 Tokens saved to 'fresh_oauth_tokens.json'")
        return token_info
        
    except Exception as e:
        print(f"❌ Error getting fresh token: {e}")
        return None

if __name__ == '__main__':
    get_fresh_token()
