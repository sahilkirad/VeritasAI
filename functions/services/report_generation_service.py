#!/usr/bin/env python3
"""
Report Generation Service
Creates comprehensive admin reports from ingestion results and diligence results
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from google.cloud import bigquery
from google.cloud.exceptions import NotFound

logger = logging.getLogger(__name__)

class ReportGenerationService:
    """Service for generating comprehensive admin reports from ingestion and diligence data"""
    
    def __init__(self, project_id: str = "veritas-472301"):
        self.project_id = project_id
        self.dataset_id = "veritas_pitch_data"
        self.client = bigquery.Client(project=project_id)
        
    def generate_comprehensive_report(self, start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict[str, Any]:
        """Generate a comprehensive admin report combining ingestion and diligence data"""
        try:
            # Set date range (default to last 30 days)
            if not start_date:
                start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            if not end_date:
                end_date = datetime.now().strftime('%Y-%m-%d')
            
            # Get ingestion results
            ingestion_data = self._get_ingestion_results(start_date, end_date)
            
            # Get diligence results
            diligence_data = self._get_diligence_results(start_date, end_date)
            
            # Generate combined analytics
            analytics = self._generate_analytics(ingestion_data, diligence_data)
            
            # Create executive summary
            executive_summary = self._create_executive_summary(analytics)
            
            # Generate insights and recommendations
            insights = self._generate_insights(analytics)
            
            return {
                "report_metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "date_range": {"start": start_date, "end": end_date},
                    "report_type": "comprehensive_admin_report"
                },
                "executive_summary": executive_summary,
                "ingestion_analytics": ingestion_data,
                "diligence_analytics": diligence_data,
                "combined_analytics": analytics,
                "insights_and_recommendations": insights
            }
            
        except Exception as e:
            logger.error(f"Error generating comprehensive report: {e}")
            return self._get_default_report()
    
    def _get_ingestion_results(self, start_date: str, end_date: str) -> Dict[str, Any]:
        """Get ingestion results from BigQuery"""
        try:
            query = f"""
            SELECT 
                COUNT(*) as total_submissions,
                COUNTIF(status = 'SUCCESS') as successful_submissions,
                COUNTIF(status = 'FAILED') as failed_submissions,
                AVG(processing_time_seconds) as avg_processing_time,
                COUNTIF(DATE(upload_timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)) as week_submissions,
                COUNTIF(DATE(upload_timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) as month_submissions,
                -- Sector breakdown
                COUNTIF(JSON_EXTRACT_SCALAR(extracted_data, '$.sector') = 'AI') as ai_submissions,
                COUNTIF(JSON_EXTRACT_SCALAR(extracted_data, '$.sector') = 'FinTech') as fintech_submissions,
                COUNTIF(JSON_EXTRACT_SCALAR(extracted_data, '$.sector') = 'HealthTech') as healthtech_submissions,
                -- Stage breakdown
                COUNTIF(JSON_EXTRACT_SCALAR(extracted_data, '$.stage') = 'Seed') as seed_stage,
                COUNTIF(JSON_EXTRACT_SCALAR(extracted_data, '$.stage') = 'Series A') as series_a_stage,
                COUNTIF(JSON_EXTRACT_SCALAR(extracted_data, '$.stage') = 'Series B') as series_b_stage
            FROM `{self.project_id}.{self.dataset_id}.pitch_deck_data`
            WHERE DATE(upload_timestamp) BETWEEN '{start_date}' AND '{end_date}'
            """
            
            query_job = self.client.query(query)
            results = query_job.result()
            
            for row in results:
                return {
                    "total_submissions": row.total_submissions or 0,
                    "successful_submissions": row.successful_submissions or 0,
                    "failed_submissions": row.failed_submissions or 0,
                    "success_rate": round((row.successful_submissions or 0) / max(row.total_submissions or 1, 1) * 100, 2),
                    "avg_processing_time": round(row.avg_processing_time or 0, 2),
                    "week_submissions": row.week_submissions or 0,
                    "month_submissions": row.month_submissions or 0,
                    "sector_breakdown": {
                        "AI": row.ai_submissions or 0,
                        "FinTech": row.fintech_submissions or 0,
                        "HealthTech": row.healthtech_submissions or 0
                    },
                    "stage_breakdown": {
                        "Seed": row.seed_stage or 0,
                        "Series A": row.series_a_stage or 0,
                        "Series B": row.series_b_stage or 0
                    }
                }
                
        except NotFound:
            logger.warning("pitch_deck_data table not found")
            return self._get_default_ingestion_data()
        except Exception as e:
            logger.error(f"Error querying ingestion results: {e}")
            return self._get_default_ingestion_data()
            
        return self._get_default_ingestion_data()
    
    def _get_diligence_results(self, start_date: str, end_date: str) -> Dict[str, Any]:
        """Get diligence results from BigQuery"""
        try:
            query = f"""
            SELECT 
                COUNT(*) as total_reports,
                AVG(overall_score) as avg_score,
                AVG(contradictions_count) as avg_contradictions,
                AVG(discrepancies_count) as avg_discrepancies,
                COUNTIF(overall_score >= 7.0) as high_score_reports,
                COUNTIF(overall_score < 4.0) as low_score_reports,
                COUNTIF(DATE(timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)) as week_reports,
                -- Risk analysis
                COUNTIF(JSON_EXTRACT_SCALAR(risk_flags, '$[0].type') = 'financial') as financial_risks,
                COUNTIF(JSON_EXTRACT_SCALAR(risk_flags, '$[0].type') = 'market') as market_risks,
                COUNTIF(JSON_EXTRACT_SCALAR(risk_flags, '$[0].type') = 'team') as team_risks
            FROM `{self.project_id}.{self.dataset_id}.diligence_reports`
            WHERE DATE(timestamp) BETWEEN '{start_date}' AND '{end_date}'
            """
            
            query_job = self.client.query(query)
            results = query_job.result()
            
            for row in results:
                return {
                    "total_reports": row.total_reports or 0,
                    "avg_score": round(row.avg_score or 0, 2),
                    "avg_contradictions": round(row.avg_contradictions or 0, 1),
                    "avg_discrepancies": round(row.avg_discrepancies or 0, 1),
                    "high_score_rate": round((row.high_score_reports or 0) / max(row.total_reports or 1, 1) * 100, 2),
                    "low_score_rate": round((row.low_score_reports or 0) / max(row.total_reports or 1, 1) * 100, 2),
                    "week_reports": row.week_reports or 0,
                    "risk_analysis": {
                        "financial_risks": row.financial_risks or 0,
                        "market_risks": row.market_risks or 0,
                        "team_risks": row.team_risks or 0
                    }
                }
                
        except NotFound:
            logger.warning("diligence_reports table not found")
            return self._get_default_diligence_data()
        except Exception as e:
            logger.error(f"Error querying diligence results: {e}")
            return self._get_default_diligence_data()
            
        return self._get_default_diligence_data()
    
    def _generate_analytics(self, ingestion_data: Dict[str, Any], diligence_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate combined analytics from ingestion and diligence data"""
        return {
            "conversion_metrics": {
                "submission_to_analysis_rate": round(
                    (diligence_data.get('total_reports', 0) / max(ingestion_data.get('successful_submissions', 1), 1)) * 100, 2
                ),
                "high_quality_rate": diligence_data.get('high_score_rate', 0),
                "processing_efficiency": ingestion_data.get('avg_processing_time', 0)
            },
            "quality_metrics": {
                "avg_diligence_score": diligence_data.get('avg_score', 0),
                "risk_identification_rate": round(
                    sum(diligence_data.get('risk_analysis', {}).values()) / max(diligence_data.get('total_reports', 1), 1) * 100, 2
                ),
                "contradiction_detection_rate": diligence_data.get('avg_contradictions', 0)
            },
            "trend_analysis": {
                "weekly_growth": self._calculate_growth_rate(ingestion_data.get('week_submissions', 0), ingestion_data.get('month_submissions', 0)),
                "sector_dominance": max(ingestion_data.get('sector_breakdown', {}).items(), key=lambda x: x[1])[0] if ingestion_data.get('sector_breakdown') else "Unknown",
                "stage_distribution": ingestion_data.get('stage_breakdown', {})
            }
        }
    
    def _create_executive_summary(self, analytics: Dict[str, Any]) -> Dict[str, Any]:
        """Create executive summary from analytics"""
        conversion_rate = analytics.get('conversion_metrics', {}).get('submission_to_analysis_rate', 0)
        quality_score = analytics.get('quality_metrics', {}).get('avg_diligence_score', 0)
        
        # Generate summary based on metrics
        if conversion_rate > 80 and quality_score > 7:
            status = "Excellent"
            summary = "Platform is performing exceptionally well with high conversion rates and quality scores."
        elif conversion_rate > 60 and quality_score > 5:
            status = "Good"
            summary = "Platform is performing well with room for optimization in conversion and quality."
        else:
            status = "Needs Attention"
            summary = "Platform requires immediate attention to improve conversion rates and quality scores."
        
        return {
            "overall_status": status,
            "summary": summary,
            "key_metrics": {
                "conversion_rate": conversion_rate,
                "quality_score": quality_score,
                "processing_efficiency": analytics.get('conversion_metrics', {}).get('processing_efficiency', 0)
            },
            "recommendations": self._generate_recommendations(analytics)
        }
    
    def _generate_insights(self, analytics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate insights and recommendations"""
        insights = []
        
        # Conversion insights
        conversion_rate = analytics.get('conversion_metrics', {}).get('submission_to_analysis_rate', 0)
        if conversion_rate < 50:
            insights.append({
                "type": "warning",
                "title": "Low Conversion Rate",
                "description": f"Only {conversion_rate}% of submissions are being analyzed. Consider improving the intake process.",
                "action": "Review intake criteria and streamline the submission process."
            })
        
        # Quality insights
        quality_score = analytics.get('quality_metrics', {}).get('avg_diligence_score', 0)
        if quality_score < 5:
            insights.append({
                "type": "critical",
                "title": "Low Quality Scores",
                "description": f"Average diligence score is {quality_score}/10. This indicates potential issues with data quality.",
                "action": "Implement stricter data validation and improve AI analysis accuracy."
            })
        
        # Processing efficiency insights
        processing_time = analytics.get('conversion_metrics', {}).get('processing_efficiency', 0)
        if processing_time > 60:
            insights.append({
                "type": "info",
                "title": "Processing Time Optimization",
                "description": f"Average processing time is {processing_time} seconds. Consider optimizing the analysis pipeline.",
                "action": "Review and optimize the AI processing pipeline for faster results."
            })
        
        return insights
    
    def _generate_recommendations(self, analytics: Dict[str, Any]) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        conversion_rate = analytics.get('conversion_metrics', {}).get('submission_to_analysis_rate', 0)
        if conversion_rate < 70:
            recommendations.append("Improve submission-to-analysis conversion rate by streamlining the intake process")
        
        quality_score = analytics.get('quality_metrics', {}).get('avg_diligence_score', 0)
        if quality_score < 6:
            recommendations.append("Enhance AI analysis accuracy to improve diligence scores")
        
        processing_time = analytics.get('conversion_metrics', {}).get('processing_efficiency', 0)
        if processing_time > 45:
            recommendations.append("Optimize processing pipeline to reduce analysis time")
        
        return recommendations
    
    def _calculate_growth_rate(self, weekly: int, monthly: int) -> float:
        """Calculate growth rate between weekly and monthly data"""
        if monthly == 0:
            return 0.0
        return round((weekly * 4) / monthly * 100, 2)
    
    def _get_default_report(self) -> Dict[str, Any]:
        """Return default report when data is unavailable"""
        return {
            "report_metadata": {
                "generated_at": datetime.now().isoformat(),
                "date_range": {"start": "N/A", "end": "N/A"},
                "report_type": "comprehensive_admin_report"
            },
            "executive_summary": {
                "overall_status": "Data Unavailable",
                "summary": "Unable to generate report due to data unavailability",
                "key_metrics": {},
                "recommendations": ["Check data sources and try again"]
            },
            "ingestion_analytics": self._get_default_ingestion_data(),
            "diligence_analytics": self._get_default_diligence_data(),
            "combined_analytics": {},
            "insights_and_recommendations": []
        }
    
    def _get_default_ingestion_data(self) -> Dict[str, Any]:
        """Default ingestion data"""
        return {
            "total_submissions": 0,
            "successful_submissions": 0,
            "failed_submissions": 0,
            "success_rate": 0.0,
            "avg_processing_time": 0.0,
            "week_submissions": 0,
            "month_submissions": 0,
            "sector_breakdown": {},
            "stage_breakdown": {}
        }
    
    def _get_default_diligence_data(self) -> Dict[str, Any]:
        """Default diligence data"""
        return {
            "total_reports": 0,
            "avg_score": 0.0,
            "avg_contradictions": 0.0,
            "avg_discrepancies": 0.0,
            "high_score_rate": 0.0,
            "low_score_rate": 0.0,
            "week_reports": 0,
            "risk_analysis": {}
        }
