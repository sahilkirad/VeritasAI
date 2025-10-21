# Dynamic Memo Data Mapping

This document outlines how pitch deck data is mapped to dynamic fields in Memo 1 and Memo 3 components.

## Company Snapshot Fields

| Pitch Deck Field | Memo 1 Field | Memo 3 Field | Description |
|------------------|---------------|---------------|-------------|
| Company Name | `title` | `company_name` | Company name from pitch deck |
| Stage | `company_stage` | `company_stage` | Current funding stage (Seed, Series A, etc.) |
| HQ Location | `headquarters` | `headquarters` | Company headquarters location |
| Founded Date | `founded_date` | `founded_date` | When the company was founded |
| Amount Raising | `amount_raising` | `amount_raising` | Amount being raised in current round |
| Post-Money Valuation | `post_money_valuation` | `post_money_valuation` | Post-money valuation |
| Investment Sought | `investment_sought` | `investment_sought` | Specific investment amount sought |
| Ownership Target | `ownership_target` | `ownership_target` | Percentage of ownership being offered |
| Key Thesis | `key_thesis` | `key_thesis` | Main investment thesis |
| Key Metric | `key_metric` | `key_metric` | Most important business metric |

## Financial & Deal Details

| Pitch Deck Field | Memo 1 Field | Memo 3 Field | Description |
|------------------|---------------|---------------|-------------|
| Current Revenue | `current_revenue` | `current_revenue` | Current revenue numbers |
| Revenue Growth Rate | `revenue_growth_rate` | `revenue_growth_rate` | Revenue growth percentage |
| CAC | `customer_acquisition_cost` | `customer_acquisition_cost` | Customer acquisition cost |
| LTV | `lifetime_value` | `lifetime_value` | Lifetime value |
| Gross Margin | `gross_margin` | `gross_margin` | Gross margin percentage |
| Burn Rate | `burn_rate` | `burn_rate` | Monthly burn rate |
| Runway | `runway` | `runway` | Months of runway remaining |
| Pre-Money Valuation | `pre_money_valuation` | `pre_money_valuation` | Pre-money valuation |
| Lead Investor | `lead_investor` | `lead_investor` | Name of lead investor |
| Committed Funding | `committed_funding` | `committed_funding` | Amount of committed funding |
| Round Stage | `round_stage` | `round_stage` | Stage of current funding round |
| Use of Funds | `use_of_funds` | `use_of_funds` | How funding will be used |

## Product & Technology

| Pitch Deck Field | Memo 1 Field | Memo 3 Field | Description |
|------------------|---------------|---------------|-------------|
| Product Features | `product_features[]` | `product_features[]` | List of key product features |
| Technology Stack | `technology_stack` | `technology_stack` | Technology stack description |
| Technology Advantages | `technology_advantages` | `technology_advantages` | Key technological advantages |
| Innovation Level | `innovation_level` | `innovation_level` | Level of innovation |
| Scalability Plan | `scalability_plan` | `scalability_plan` | Plans for scaling |

## Market & Competition

| Pitch Deck Field | Memo 1 Field | Memo 3 Field | Description |
|------------------|---------------|---------------|-------------|
| Industry Category | `industry_category` | `industry_category` | Primary industry category |
| Target Market | `target_market` | `target_market` | Specific target market |
| Target Customers | `target_customers` | `target_customers` | Target customer segments |
| Market Size | `market_size` | `market_size` | Total addressable market |
| Market Timing | `market_timing` | `market_timing` | Why now is the right time |
| Competitive Advantages | `competitive_advantages` | `competitive_advantages` | Key competitive advantages |
| Market Penetration | `market_penetration` | `market_penetration` | Current market penetration |

## Team & Execution

| Pitch Deck Field | Memo 1 Field | Memo 3 Field | Description |
|------------------|---------------|---------------|-------------|
| Team Size | `team_size` | `team_size` | Current team size |
| Key Team Members | `key_team_members[]` | `key_team_members[]` | Names and roles of key team members |
| Advisory Board | `advisory_board[]` | `advisory_board[]` | Advisory board members |
| Execution Track Record | `execution_track_record` | `execution_track_record` | Previous execution experience |

## Growth & Traction

| Pitch Deck Field | Memo 1 Field | Memo 3 Field | Description |
|------------------|---------------|---------------|-------------|
| User Growth | `user_growth` | `user_growth` | User growth metrics |
| Revenue Growth | `revenue_growth` | `revenue_growth` | Revenue growth metrics |
| Customer Growth | `customer_growth` | `customer_growth` | Customer growth metrics |
| Key Milestones | `key_milestones[]` | `key_milestones[]` | Key business milestones achieved |
| Upcoming Milestones | `upcoming_milestones[]` | `upcoming_milestones[]` | Upcoming milestones or goals |

## Risk & Mitigation

| Pitch Deck Field | Memo 1 Field | Memo 3 Field | Description |
|------------------|---------------|---------------|-------------|
| Key Risks | `key_risks[]` | `key_risks[]` | Main business risks identified |
| Risk Mitigation | `risk_mitigation` | `risk_mitigation` | How risks are being mitigated |
| Regulatory Risks | `regulatory_risks` | `regulatory_risks` | Regulatory or compliance risks |

## Exit Strategy

| Pitch Deck Field | Memo 1 Field | Memo 3 Field | Description |
|------------------|---------------|---------------|-------------|
| Exit Strategy | `exit_strategy` | `exit_strategy` | Overall exit strategy |
| Potential Acquirers | `potential_acquirers[]` | `potential_acquirers[]` | Potential acquisition targets |
| IPO Timeline | `ipo_timeline` | `ipo_timeline` | IPO timeline or plans |
| Exit Valuation | `exit_valuation` | `exit_valuation` | Expected exit valuation |

## Additional Fields

| Pitch Deck Field | Memo 1 Field | Memo 3 Field | Description |
|------------------|---------------|---------------|-------------|
| Revenue Model | `revenue_model` | `revenue_model` | Detailed revenue model |
| Pricing Strategy | `pricing_strategy` | `pricing_strategy` | Pricing tiers and strategies |
| Go-to-Market | `go_to_market` | `go_to_market` | Go-to-market strategy |
| Funding Ask | `funding_ask` | `funding_ask` | Amount of funding being sought |
| Timeline | `timeline` | `timeline` | Key milestones and timeline |
| Partnerships | `partnerships[]` | `partnerships[]` | Key partnerships mentioned |
| Regulatory Considerations | `regulatory_considerations` | `regulatory_considerations` | Regulatory considerations |
| Scalability | `scalability` | `scalability` | Scalability information |
| Intellectual Property | `intellectual_property` | `intellectual_property` | IP considerations |

## Implementation Notes

1. **Data Extraction**: The intake agent now extracts all these fields from pitch deck PDFs and text content.

2. **Dynamic Display**: Both Memo 1 and Memo 3 components now display dynamic data instead of hardcoded content.

3. **Fallback Values**: When data is not available, components show "Not specified" or "Not specified in pitch deck".

4. **Data Validation**: The system can validate extracted data against Google search results and industry benchmarks.

5. **References**: Google data validation and references are added for dynamic content validation.

## Benefits

- **Personalized Memos**: Each memo is now unique to the specific startup's pitch deck
- **Comprehensive Data**: All relevant information from pitch decks is captured and displayed
- **Real-time Updates**: Memos reflect the actual content from uploaded pitch decks
- **Better Analysis**: Investors get accurate, company-specific information for decision making
