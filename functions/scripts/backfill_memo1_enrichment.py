import os
import asyncio
import logging
from typing import Optional

try:
    from google.cloud import firestore
except ImportError:
    firestore = None

from services.perplexity_service import PerplexitySearchService


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backfill_memo1_enrichment")


async def backfill(project_id: Optional[str] = None, limit: int = 50, dry_run: bool = True):
    if firestore is None:
        logger.error("google-cloud-firestore not installed")
        return

    project_id = project_id or os.environ.get("GOOGLE_CLOUD_PROJECT") or os.environ.get("GCP_PROJECT")
    if not project_id:
        logger.error("Project ID not set. Set GOOGLE_CLOUD_PROJECT or pass as arg.")
        return

    db = firestore.Client(project=project_id)
    svc = PerplexitySearchService(project=project_id)
    if not svc.enabled:
        logger.error("PERPLEXITY_API_KEY not configured. Aborting.")
        return

    # Query recent ingestionResults
    docs = db.collection("ingestionResults").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit).stream()
    count = 0
    async for _ in _aiter(docs):
        pass  # drain generator to detect async; we handle sync below

    # Firestore stream is sync iterator; iterate normally
    count = 0
    for doc in db.collection("ingestionResults").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit).stream():
        data = doc.to_dict() or {}
        memo1 = data.get("memo_1", {})
        if not memo1:
            continue

        # Detect missing criticals
        missing = svc._identify_missing_fields(memo1)
        if not missing:
            continue

        logger.info(f"Enriching {doc.id} missing fields: {missing}")
        enriched = await svc.enrich_missing_fields(memo1)

        # Merge-only-on-empty
        merged = memo1.copy()
        for k, v in enriched.items():
            if k not in merged or merged.get(k) in (None, "", [], "Not specified"):
                merged[k] = v

        if dry_run:
            logger.info(f"[DRY RUN] Would update {doc.id} with {len(enriched)} fields")
        else:
            db.collection("ingestionResults").document(doc.id).update({"memo_1": merged})
            logger.info(f"Updated {doc.id}")
        count += 1

    logger.info(f"Processed {count} documents")


async def _aiter(iterable):
    for item in iterable:
        yield item


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Backfill Memo1 enrichment using Perplexity")
    parser.add_argument("--project", type=str, default=None)
    parser.add_argument("--limit", type=int, default=50)
    parser.add_argument("--apply", action="store_true", help="Apply updates (otherwise dry-run)")
    args = parser.parse_args()
    asyncio.run(backfill(project_id=args.project, limit=args.limit, dry_run=not args.apply))


