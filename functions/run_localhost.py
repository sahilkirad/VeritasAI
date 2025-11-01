#!/usr/bin/env python3
"""
Localhost server for testing Veritas Validation Framework
Runs a simple HTTP server to test validation endpoints locally
"""

import os
import sys
import json
import asyncio
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from typing import Dict, Any

# Setup path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ValidationHandler(BaseHTTPRequestHandler):
    """HTTP Request Handler for validation endpoints"""
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_cors_headers(self):
        """Send CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Type', 'application/json')
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/':
            self.send_response(200)
            self.send_cors_headers()
            self.end_headers()
            response = {
                "status": "running",
                "service": "Veritas Validation Framework - Localhost",
                "endpoints": {
                    "/": "This endpoint (status)",
                    "/validate_memo_data": "POST - Validate memo data",
                    "/health": "GET - Health check"
                }
            }
            self.wfile.write(json.dumps(response, indent=2).encode())
        
        elif parsed_path.path == '/health':
            self.send_response(200)
            self.send_cors_headers()
            self.end_headers()
            response = {"status": "healthy", "service": "validation-framework"}
            self.wfile.write(json.dumps(response).encode())
        
        else:
            self.send_response(404)
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Not found"}).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/validate_memo_data':
            try:
                # Read request body
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                
                # Parse JSON
                try:
                    data = json.loads(body.decode('utf-8'))
                except json.JSONDecodeError:
                    self.send_error_response(400, "Invalid JSON in request body")
                    return
                
                # Validate required fields
                memo_data = data.get("memo_data")
                memo_id = data.get("memo_id", "local-test")
                memo_type = data.get("memo_type", "memo_1")
                
                if not memo_data:
                    self.send_error_response(400, "Missing required parameter: memo_data")
                    return
                
                # Process validation asynchronously
                result = asyncio.run(self.process_validation(memo_data, memo_id, memo_type))
                
                # Send response
                self.send_response(200)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(result, indent=2, default=str).encode())
                
            except Exception as e:
                logger.error(f"Error processing validation: {e}", exc_info=True)
                self.send_error_response(500, f"Internal server error: {str(e)}")
        
        else:
            self.send_response(404)
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())
    
    def send_error_response(self, status_code: int, message: str):
        """Send error response"""
        self.send_response(status_code)
        self.send_cors_headers()
        self.end_headers()
        error_response = {"error": message, "status_code": status_code}
        self.wfile.write(json.dumps(error_response).encode())
    
    async def process_validation(self, memo_data: Dict[str, Any], memo_id: str, memo_type: str) -> Dict[str, Any]:
        """Process validation request"""
        logger.info(f"Processing validation for memo_id: {memo_id}")
        
        try:
            from agents.memo_enrichment_agent import MemoEnrichmentAgent
            
            # Initialize agent
            agent = MemoEnrichmentAgent(project="veritas-472301", location="asia-south1")
            
            # Try to set up (may fail without GCP credentials - that's OK)
            try:
                agent.set_up()
            except Exception as e:
                logger.warning(f"Firestore initialization failed (continuing with validation only): {e}")
            
            # Run enrichment and validation
            logger.info("Running enrichment + validation...")
            
            # If we have a memo_id, try to fetch from Firestore
            if memo_id and memo_id != "local-test":
                try:
                    result = await agent.enrich_memo(memo_id, memo_type)
                except Exception as e:
                    logger.warning(f"Could not fetch from Firestore, using provided memo_data: {e}")
                    # Fallback: validate provided memo_data directly
                    company_name = memo_data.get("title", "Unknown Company")
                    founder_name = memo_data.get("founder_name", "")
                    if isinstance(founder_name, list):
                        founder_name = founder_name[0] if founder_name else ""
                    industry = memo_data.get("industry_category", "")
                    
                    validation_results = await agent.validate_memo_claims(
                        memo_data, company_name, founder_name, industry
                    )
                    
                    result = {
                        "status": "success",
                        "memo_id": memo_id,
                        "validation_results": validation_results,
                        "fields_enriched_count": 0,
                        "note": "Validated provided memo_data directly (no Firestore access)"
                    }
            else:
                # Validate provided memo_data directly
                company_name = memo_data.get("title", "Unknown Company")
                founder_name = memo_data.get("founder_name", "")
                if isinstance(founder_name, list):
                    founder_name = founder_name[0] if founder_name else ""
                industry = memo_data.get("industry_category", "")
                
                logger.info(f"Validating: {company_name} (Founder: {founder_name}, Industry: {industry})")
                
                validation_results = await agent.validate_memo_claims(
                    memo_data, company_name, founder_name, industry
                )
                
                result = {
                    "status": "success",
                    "memo_id": memo_id,
                    "validation_results": validation_results,
                    "fields_enriched_count": 0,
                    "note": "Validated provided memo_data (local test mode)"
                }
            
            return result
            
        except Exception as e:
            logger.error(f"Error in process_validation: {e}", exc_info=True)
            return {
                "status": "error",
                "error": str(e),
                "memo_id": memo_id
            }
    
    def log_message(self, format, *args):
        """Custom log format"""
        logger.info(f"{self.address_string()} - {format % args}")

def run_server(port: int = 8080, host: str = 'localhost'):
    """Run the localhost server"""
    server_address = (host, port)
    httpd = HTTPServer(server_address, ValidationHandler)
    
    print("="*70)
    print("🚀 Veritas Validation Framework - Localhost Server")
    print("="*70)
    print(f"\n✅ Server running on http://{host}:{port}")
    print(f"\n📋 Available endpoints:")
    print(f"   GET  http://{host}:{port}/              - Server status")
    print(f"   GET  http://{host}:{port}/health         - Health check")
    print(f"   POST http://{host}:{port}/validate_memo_data - Validate memo data")
    print(f"\n📝 Example POST request:")
    print(f"   curl -X POST http://{host}:{port}/validate_memo_data \\")
    print(f"     -H 'Content-Type: application/json' \\")
    example_data = {
        "memo_id": "test-123",
        "memo_data": {"title": "we360.ai", "founder_name": ["Arnav Gupta"]},
        "memo_type": "memo_1"
    }
    print(f"     -d '{json.dumps(example_data, indent=2)}'")
    print(f"\n⚠️  Note: For full validation with Perplexity API, set:")
    print(f"   export PERPLEXITY_API_KEY='pplx-your-key-here'")
    print(f"\n⚠️  Note: For Firestore access, set up GCP credentials:")
    print(f"   gcloud auth application-default login")
    print(f"\n🛑 Press Ctrl+C to stop the server\n")
    print("="*70 + "\n")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down server...")
        httpd.shutdown()
        print("✅ Server stopped")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Run Veritas Validation Framework on localhost')
    parser.add_argument('--port', type=int, default=8080, help='Port to run server on (default: 8080)')
    parser.add_argument('--host', type=str, default='localhost', help='Host to bind to (default: localhost)')
    
    args = parser.parse_args()
    
    run_server(port=args.port, host=args.host)

