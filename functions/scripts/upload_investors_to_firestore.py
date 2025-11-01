"""
Script to upload investor data from JSON file to Firestore.
Run this once to populate the investors collection.
"""

import json
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from google.cloud import firestore
from google.cloud.firestore import SERVER_TIMESTAMP
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def upload_investors_to_firestore(json_file_path: str, collection_name: str = "investors"):
    """
    Upload investor data from JSON file to Firestore.
    
    Args:
        json_file_path: Path to the investors_list.json file
        collection_name: Name of the Firestore collection (default: "investors")
    """
    try:
        # Initialize Firestore client
        db = firestore.Client()
        logger.info(f"Initialized Firestore client")
        
        # Read JSON file
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        investors = data.get('investors', [])
        logger.info(f"Found {len(investors)} investors in JSON file")
        
        collection_ref = db.collection(collection_name)
        
        uploaded_count = 0
        updated_count = 0
        
        for investor in investors:
            investor_id = investor.get('id')
            if not investor_id:
                logger.warning(f"Skipping investor without ID: {investor.get('name', 'Unknown')}")
                continue
            
            # Use investor ID as document ID
            doc_ref = collection_ref.document(investor_id)
            
            # Add metadata
            investor_data = {
                **investor,
                'uploaded_at': SERVER_TIMESTAMP,
                'last_updated': SERVER_TIMESTAMP
            }
            
            # Check if document exists
            doc = doc_ref.get()
            if doc.exists:
                # Update existing document
                doc_ref.update(investor_data)
                updated_count += 1
                logger.info(f"Updated investor: {investor.get('name')} (ID: {investor_id})")
            else:
                # Create new document
                doc_ref.set(investor_data)
                uploaded_count += 1
                logger.info(f"Uploaded investor: {investor.get('name')} (ID: {investor_id})")
        
        logger.info(f"\n✅ Upload complete!")
        logger.info(f"   - New investors: {uploaded_count}")
        logger.info(f"   - Updated investors: {updated_count}")
        logger.info(f"   - Total processed: {uploaded_count + updated_count}")
        
        return True
        
    except FileNotFoundError:
        logger.error(f"JSON file not found: {json_file_path}")
        return False
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing JSON file: {e}")
        return False
    except Exception as e:
        logger.error(f"Error uploading to Firestore: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    # Get the path to investors_list.json
    script_dir = Path(__file__).parent
    agents_dir = script_dir.parent / "agents"
    json_file = agents_dir / "investors_list.json"
    
    if not json_file.exists():
        logger.error(f"Investors JSON file not found at: {json_file}")
        logger.info("Please ensure investors_list.json exists in functions/agents/")
        sys.exit(1)
    
    logger.info(f"Uploading investors from: {json_file}")
    success = upload_investors_to_firestore(str(json_file))
    
    if success:
        logger.info("✅ Successfully uploaded all investors to Firestore!")
        sys.exit(0)
    else:
        logger.error("❌ Failed to upload investors")
        sys.exit(1)

