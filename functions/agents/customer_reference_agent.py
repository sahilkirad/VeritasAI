"""
Customer Reference Generator Agent
Generates realistic customer reference call summaries using Gemini AI
"""

import logging
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import random

# Vertex AI imports
try:
    import vertexai
    from vertexai.generative_models import GenerativeModel
    VERTEX_AI_AVAILABLE = True
except ImportError:
    VERTEX_AI_AVAILABLE = False

class CustomerReferenceAgent:
    """
    Agent for generating realistic customer reference call summaries
    """
    
    def __init__(self, project: str = "veritas-472301", location: str = "us-central1"):
        self.project = project
        self.location = location
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Initialize Vertex AI
        if VERTEX_AI_AVAILABLE:
            try:
                vertexai.init(project=self.project, location=self.location)
                self.vertex_model = GenerativeModel("gemini-2.5-flash")
                self.logger.info("Vertex AI initialized for customer reference generation")
            except Exception as e:
                self.logger.error(f"Vertex AI initialization failed: {e}")
                self.vertex_model = None
        else:
            self.logger.warning("Vertex AI not available - using fallback generation")
            self.vertex_model = None
    
    async def generate_customer_references(self, memo_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate customer reference call summaries based on memo data
        
        Args:
            memo_data: Memo 1 data containing company and customer information
            
        Returns:
            List of customer reference call summaries
        """
        try:
            # Extract company information
            company_name = memo_data.get("title", memo_data.get("company_name", "the company"))
            product_description = memo_data.get("solution", memo_data.get("product_description", ""))
            value_proposition = memo_data.get("key_thesis", memo_data.get("value_proposition", ""))
            industry = memo_data.get("industry_category", memo_data.get("industry", ""))
            
            # Handle industry if it's a list
            if isinstance(industry, list):
                industry = ", ".join(industry)
            
            # Get customer list
            customers = memo_data.get("target_customers", [])
            if not customers:
                # Generate some sample customers based on industry
                customers = self._generate_sample_customers(industry)
            
            # Generate reference calls
            if self.vertex_model:
                reference_calls = await self._generate_with_gemini(
                    company_name, product_description, value_proposition, 
                    industry, customers
                )
            else:
                reference_calls = self._generate_fallback_references(
                    company_name, product_description, industry, customers
                )
            
            return reference_calls
            
        except Exception as e:
            self.logger.error(f"Error generating customer references: {str(e)}", exc_info=True)
            return []
    
    async def _generate_with_gemini(self, company_name: str, product_description: str, 
                                  value_proposition: str, industry: str, 
                                  customers: List[str]) -> List[Dict[str, Any]]:
        """Generate customer references using Gemini AI"""
        try:
            # Select 3 customers for reference calls
            selected_customers = customers[:3] if len(customers) >= 3 else customers
            
            prompt = f"""
            Generate realistic customer reference call summaries for {company_name}, a company in {industry}.
            
            Company Details:
            - Product: {product_description}
            - Value Proposition: {value_proposition}
            - Industry: {industry}
            
            Generate reference calls for these customers: {', '.join(selected_customers)}
            
            For each customer, create a realistic reference call summary with:
            1. Customer company name and industry
            2. Reference contact person (realistic name and title)
            3. Interview date (recent, within last 3 months)
            4. Duration (20-45 minutes)
            5. 4-5 realistic Q&A pairs covering:
               - How the product solved their problem
               - Cost impact and ROI
               - Recommendation likelihood
               - Any issues or complaints
               - Renewal likelihood
            6. NPS score (7-10 for good customers)
            7. Overall assessment and credibility rating
            
            Make the responses realistic and specific to the industry. Include some minor issues 
            but overall positive sentiment. Use realistic business language and metrics.
            
            Return as JSON array with this structure:
            [
                {{
                    "customer_name": "Customer Company Name",
                    "industry": "Industry",
                    "reference_contact": {{
                        "name": "Dr. John Smith",
                        "title": "Chief Medical Officer",
                        "department": "Healthcare"
                    }},
                    "interview_date": "2025-01-15",
                    "duration_minutes": 35,
                    "questions_answers": [
                        {{
                            "question": "How did {company_name} solve your problem?",
                            "answer": "Before {company_name}, getting patient analytics took 2-3 days...",
                            "assessment": "Confirms value prop"
                        }},
                        {{
                            "question": "What's the cost impact?",
                            "answer": "We spent $500K/year on BI tools...",
                            "assessment": "Confirms 4x cost reduction claim"
                        }}
                    ],
                    "nps_score": 9,
                    "renewal_likelihood": "100%",
                    "overall_assessment": "Very satisfied with the solution",
                    "testimonial_authority": "HIGH",
                    "credibility": "VERY_HIGH",
                    "key_benefits": ["Faster insights", "Cost reduction", "Easy to use"],
                    "minor_issues": ["Integration took longer than expected"],
                    "recommendation": "Would recommend to other companies"
                }}
            ]
            """
            
            response = await self.vertex_model.generate_content_async(prompt)
            reference_text = response.text.strip()
            
            # Extract JSON from response
            import re
            json_match = re.search(r'\[.*\]', reference_text, re.DOTALL)
            if json_match:
                reference_calls = json.loads(json_match.group())
                return reference_calls
            else:
                self.logger.warning("Could not extract JSON from customer reference response")
                return self._generate_fallback_references(company_name, product_description, industry, customers)
                
        except Exception as e:
            self.logger.error(f"Error generating customer references with Gemini: {str(e)}")
            return self._generate_fallback_references(company_name, product_description, industry, customers)
    
    def _generate_fallback_references(self, company_name: str, product_description: str, 
                                    industry: str, customers: List[str]) -> List[Dict[str, Any]]:
        """Generate fallback customer references without AI"""
        try:
            # Select up to 3 customers
            selected_customers = customers[:3] if len(customers) >= 3 else customers
            
            if not selected_customers:
                selected_customers = ["Sample Customer 1", "Sample Customer 2", "Sample Customer 3"]
            
            reference_calls = []
            
            for i, customer in enumerate(selected_customers):
                # Generate realistic reference data
                reference_call = {
                    "customer_name": customer,
                    "industry": industry or "Technology",
                    "reference_contact": {
                        "name": f"Dr. {self._generate_name()}",
                        "title": random.choice(["Chief Technology Officer", "VP of Operations", "Head of Analytics"]),
                        "department": "Technology"
                    },
                    "interview_date": (datetime.now() - timedelta(days=random.randint(30, 90))).strftime("%Y-%m-%d"),
                    "duration_minutes": random.randint(25, 45),
                    "questions_answers": [
                        {
                            "question": f"How did {company_name} solve your problem?",
                            "answer": f"Before {company_name}, our analytics process was manual and time-consuming. Now we get insights in minutes instead of days.",
                            "assessment": "Confirms value prop"
                        },
                        {
                            "question": "What's the cost impact?",
                            "answer": f"We've seen significant cost savings and improved efficiency since implementing {company_name}.",
                            "assessment": "Confirms cost benefits"
                        },
                        {
                            "question": "Would you recommend this to other companies?",
                            "answer": "Yes, we've already recommended it to 2 other companies in our network.",
                            "assessment": "High recommendation likelihood"
                        },
                        {
                            "question": "Any issues or complaints?",
                            "answer": "Minor integration challenges initially, but the support team was very helpful.",
                            "assessment": "Minor issues, well resolved"
                        },
                        {
                            "question": "Renewal likelihood?",
                            "answer": "100% - it's become essential to our operations.",
                            "assessment": "Strong renewal intent"
                        }
                    ],
                    "nps_score": random.randint(7, 10),
                    "renewal_likelihood": "95%+",
                    "overall_assessment": "Very satisfied with the solution and support",
                    "testimonial_authority": "HIGH",
                    "credibility": "VERY_HIGH",
                    "key_benefits": ["Improved efficiency", "Cost savings", "Better insights"],
                    "minor_issues": ["Initial learning curve"],
                    "recommendation": "Would recommend to other companies"
                }
                
                reference_calls.append(reference_call)
            
            return reference_calls
            
        except Exception as e:
            self.logger.error(f"Error in fallback reference generation: {str(e)}")
            return []
    
    def _generate_sample_customers(self, industry: str) -> List[str]:
        """Generate sample customers based on industry"""
        industry_customers = {
            "healthcare": ["Abha Hospitals", "Apollo Healthcare", "Fortis Healthcare"],
            "technology": ["TechCorp Inc", "DataFlow Systems", "CloudTech Solutions"],
            "finance": ["IDBI Bank", "HDFC Bank", "ICICI Bank"],
            "manufacturing": ["Bosch India", "Tata Motors", "Reliance Industries"],
            "education": ["Ashoka University", "IIT Delhi", "IIM Bangalore"],
            "retail": ["Amazon", "Flipkart", "Myntra"],
            "default": ["Enterprise Corp", "Global Systems", "Innovation Labs"]
        }
        
        return industry_customers.get(industry.lower(), industry_customers["default"])
    
    def _generate_name(self) -> str:
        """Generate a realistic name"""
        first_names = ["John", "Sarah", "Michael", "Priya", "Raj", "Lisa", "David", "Anita"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
        return f"{random.choice(first_names)} {random.choice(last_names)}"
