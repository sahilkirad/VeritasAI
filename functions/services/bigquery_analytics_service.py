#!/usr/bin/env python3
"""
BigQuery Analytics Service for Admin Dashboard
Provides analytics queries for platform metrics, diligence reports, and trends
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from google.cloud import bigquery
from google.cloud.exceptions import NotFound

logger = logging.getLogger(__name__)

class BigQueryAnalyticsService:
    """Service for querying BigQuery analytics data for admin dashboard"""
    
    def __init__(self, project: str = "veritas-472301"):
        self.project_id = project
        self.dataset_id = "veritas_pitch_data"
        self.client = bigquery.Client(project=project)
        
    def get_platform_metrics(self) -> Dict[str, Any]:
        """Get aggregated platform metrics from pitch_deck_data table"""
        try:
            query = f"""
            SELECT 
                COUNT(*) as total_submissions,
                AVG(processing_time_seconds) as avg_processing_time,
                COUNTIF(status = 'SUCCESS') / COUNT(*) as success_rate,
                COUNTIF(DATE(upload_timestamp) = CURRENT_DATE()) as today_submissions,
                COUNTIF(DATE(upload_timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)) as week_submissions,
                COUNTIF(DATE(upload_timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) as month_submissions
            FROM `{self.project_id}.{self.dataset_id}.pitch_deck_data`
            """
            
            query_job = self.client.query(query)
            results = query_job.result()
            
            for row in results:
                return {
                    "total_submissions": row.total_submissions or 0,
                    "avg_processing_time": round(row.avg_processing_time or 0, 2),
                    "success_rate": round((row.success_rate or 0) * 100, 1),
                    "today_submissions": row.today_submissions or 0,
                    "week_submissions": row.week_submissions or 0,
                    "month_submissions": row.month_submissions or 0
                }
                
        except NotFound:
            logger.warning("pitch_deck_data table not found in BigQuery")
            return self._get_default_platform_metrics()
        except Exception as e:
            logger.error(f"Error querying platform metrics: {e}")
            return self._get_default_platform_metrics()
            
        return self._get_default_platform_metrics()
    
    def get_diligence_analytics(self) -> Dict[str, Any]:
        """Get analytics from diligence_reports table"""
        try:
            query = f"""
            SELECT 
                COUNT(*) as total_reports,
                AVG(overall_score) as avg_score,
                AVG(contradictions_count) as avg_contradictions,
                AVG(discrepancies_count) as avg_discrepancies,
                COUNTIF(overall_score >= 7.0) / COUNT(*) as high_score_rate,
                COUNTIF(DATE(timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)) as week_reports
            FROM `{self.project_id}.{self.dataset_id}.diligence_reports`
            """
            
            query_job = self.client.query(query)
            results = query_job.result()
            
            for row in results:
                return {
                    "total_reports": row.total_reports or 0,
                    "avg_score": round(row.avg_score or 0, 2),
                    "avg_contradictions": round(row.avg_contradictions or 0, 1),
                    "avg_discrepancies": round(row.avg_discrepancies or 0, 1),
                    "high_score_rate": round((row.high_score_rate or 0) * 100, 1),
                    "week_reports": row.week_reports or 0
                }
                
        except NotFound:
            logger.warning("diligence_reports table not found in BigQuery")
            return self._get_default_diligence_analytics()
        except Exception as e:
            logger.error(f"Error querying diligence analytics: {e}")
            return self._get_default_diligence_analytics()
            
        return self._get_default_diligence_analytics()
    
    def get_time_series_data(self, days: int = 30) -> Dict[str, Any]:
        """Get time series data for trends and charts"""
        try:
            query = f"""
            SELECT 
                DATE(upload_timestamp) as date,
                COUNT(*) as submissions,
                COUNTIF(status = 'SUCCESS') as successful_submissions,
                AVG(processing_time_seconds) as avg_processing_time
            FROM `{self.project_id}.{self.dataset_id}.pitch_deck_data`
            WHERE DATE(upload_timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL {days} DAY)
            GROUP BY DATE(upload_timestamp)
            ORDER BY date ASC
            """
            
            query_job = self.client.query(query)
            results = query_job.result()
            
            time_series = []
            for row in results:
                time_series.append({
                    "date": row.date.isoformat() if row.date else None,
                    "submissions": row.submissions or 0,
                    "successful_submissions": row.successful_submissions or 0,
                    "avg_processing_time": round(row.avg_processing_time or 0, 2)
                })
            
            return {
                "daily_submissions": time_series,
                "total_days": len(time_series),
                "period_days": days
            }
            
        except NotFound:
            logger.warning("pitch_deck_data table not found for time series")
            return self._get_default_time_series()
        except Exception as e:
            logger.error(f"Error querying time series data: {e}")
            return self._get_default_time_series()
            
        return self._get_default_time_series()
    
    def get_investor_recommendation_stats(self) -> Dict[str, Any]:
        """Get investor recommendation statistics"""
        try:
            # For now, return default stats since we don't have a dedicated table yet
            # This would be populated when we create investor_recommendations_history table
            return {
                "total_generated": 0,
                "avg_match_score": 0.0,
                "week_generated": 0,
                "top_sectors": [],
                "avg_processing_time": 0.0
            }
            
        except Exception as e:
            logger.error(f"Error querying investor recommendation stats: {e}")
            return self._get_default_investor_stats()
    
    def get_network_analytics(self) -> Dict[str, Any]:
        """Get network connection analytics"""
        try:
            # Placeholder for network analytics
            # This would query investor connection patterns
            return {
                "total_connections": 0,
                "top_investors": [],
                "connection_types": {},
                "avg_connections_per_investor": 0.0
            }
            
        except Exception as e:
            logger.error(f"Error querying network analytics: {e}")
            return self._get_default_network_analytics()
    
    def _get_default_platform_metrics(self) -> Dict[str, Any]:
        """Return default values when BigQuery data is not available"""
        return {
            "total_submissions": 0,
            "avg_processing_time": 0.0,
            "success_rate": 0.0,
            "today_submissions": 0,
            "week_submissions": 0,
            "month_submissions": 0
        }
    
    def _get_default_diligence_analytics(self) -> Dict[str, Any]:
        """Return default values for diligence analytics"""
        return {
            "total_reports": 0,
            "avg_score": 0.0,
            "avg_contradictions": 0.0,
            "avg_discrepancies": 0.0,
            "high_score_rate": 0.0,
            "week_reports": 0
        }
    
    def _get_default_time_series(self) -> Dict[str, Any]:
        """Return default time series data"""
        return {
            "daily_submissions": [],
            "total_days": 0,
            "period_days": 30
        }
    
    def _get_default_investor_stats(self) -> Dict[str, Any]:
        """Return default investor recommendation stats"""
        return {
            "total_generated": 0,
            "avg_match_score": 0.0,
            "week_generated": 0,
            "top_sectors": [],
            "avg_processing_time": 0.0
        }
    
    def _get_default_network_analytics(self) -> Dict[str, Any]:
        """Return default network analytics"""
        return {
            "total_connections": 0,
            "top_investors": [],
            "connection_types": {},
            "avg_connections_per_investor": 0.0
        }
