#!/usr/bin/env python3
"""
Simple OAuth2 Setup for Google Calendar
This script will generate a URL for you to visit manually.
"""

import json
import urllib.parse

# OAuth2 credentials
CLIENT_ID = "533015987350-tgvenvt5olcfp1gc745p5p5ib0fqg7i20.apps.googleusercontent.com"
CLIENT_SECRET = "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"
REDIRECT_URI = "http://localhost:8080"
SCOPE = "https://www.googleapis.com/auth/calendar"

def generate_oauth_url():
    """Generate OAuth2 authorization URL."""
    print("🔐 OAuth2 Setup for Google Calendar")
    print("=" * 50)
    print()
    
    # Build the authorization URL
    params = {
        'response_type': 'code',
        'client_id': CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'scope': SCOPE,
        'access_type': 'offline',
        'prompt': 'consent'
    }
    
    auth_url = f"https://accounts.google.com/o/oauth2/auth?{urllib.parse.urlencode(params)}"
    
    print("📋 STEP 1: Visit this URL in your browser:")
    print("-" * 50)
    print(auth_url)
    print("-" * 50)
    print()
    
    print("📋 STEP 2: After visiting the URL:")
    print("1. Log in with your Gmail account: kiradsahil882@gmail.com")
    print("2. Grant permission to access Google Calendar")
    print("3. You'll be redirected to a localhost page (this is normal)")
    print("4. Copy the 'code' parameter from the URL")
    print()
    
    print("📋 STEP 3: Get the authorization code:")
    print("The redirected URL will look like:")
    print("http://localhost:8080/?code=4/0AVGzR1AU4i3NqCrPGHCzLScv9eWKwbOxCvx5SBRXG_pfMvlIxPJ-sZitTcNSHwADXQNIXw&scope=https://www.googleapis.com/auth/calendar")
    print()
    print("Copy the 'code' part (everything after 'code=' and before '&')")
    print()
    
    return auth_url

if __name__ == "__main__":
    generate_oauth_url()
