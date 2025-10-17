'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle, ThumbsUp, ThumbsDown, MessageCircle, Users, TrendingUp, DollarSign, BarChart3, AlertTriangle, ExternalLink, Cpu, Database, Cloud, Zap, Shield, Building } from "lucide-react";
import { useRouter } from 'next/navigation';

interface DiligenceData {
  investment_recommendation?: string;
  problem_validation?: any;
  solution_product_market_fit?: any;
  team_execution_capability?: any;
  founder_market_fit?: any;
  market_opportunity_competition?: any;
  benchmarking_analysis?: any;
  traction_metrics_validation?: any;
  key_risks?: string[];
  mitigation_strategies?: string[];
  due_diligence_next_steps?: string[];
  investment_thesis?: string;
  synthesis_notes?: string;
  overall_score?: number;
  [key: string]: any;
}

interface Memo3TabProps {
  diligenceData: DiligenceData | null;
}

export default function Memo3Tab({ diligenceData }: Memo3TabProps) {
  const router = useRouter();

  const handleCreateRoom = () => {
    router.push('/dashboard/create-room');
  };

  return (
    <div className="space-y-6">
      {/* Technology Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Technology Reports
            </CardTitle>
            <CardDescription>
            Comprehensive technology analysis and workforce readiness assessment
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          {/* Technology Stack Overview */}
          <div>
            <h4 className="font-semibold mb-3">Technology Stack Overview</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-800 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Backend Framework
                </h5>
                <p className="text-xs text-blue-600 mt-1">
                  Python FastAPI for AI-Processing and NestJS/Node.js for Simulation APIs
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-medium text-green-800 flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Frontend Stack
                </h5>
                <p className="text-xs text-green-600 mt-1">
                  React and Next.js for dynamic dashboards and real-time feedback
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h5 className="font-medium text-purple-800 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  AI Engine
                </h5>
                <p className="text-xs text-purple-600 mt-1">
                  GPT-based LLM fine-tuned for coaching behavior and AI mentorship
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <h5 className="font-medium text-orange-800 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Infrastructure
                </h5>
                <p className="text-xs text-orange-600 mt-1">
                  GCP hosting with Docker containerization and automated CI/CD
                </p>
              </div>
            </div>
          </div>

          {/* Technology Advantages with Sources */}
          <div>
            <h4 className="font-semibold mb-2">Technology Advantages</h4>
            <div className="space-y-2">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                <h5 className="font-medium text-gray-800">AI-Powered Simulation + Cloud-Native SaaS</h5>
                <p className="text-xs text-gray-600 mt-1">
                  The only scalable, effective tech stack proven to solve workforce readiness at scale with 50% faster training times and 25-30% improved performance metrics.
                </p>
                <div className="mt-2 space-y-1">
                  <a href="https://www.quodeck.com/ai-simulations-workforce-readiness" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center">
                    [1] QuoDeck on AI simulations boosting workforce readiness (July 2025)
                    <ExternalLink className="ml-1 h-2 w-2" />
                  </a>
                  <a href="https://www.trainingmag.com/ai-driven-simulations-transforming-workforce-readiness" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center">
                    [2] Training Magazine: AI-driven simulations transforming workforce readiness (June 2025)
                    <ExternalLink className="ml-1 h-2 w-2" />
                  </a>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
                <h5 className="font-medium text-gray-800">Continuous MLOps & Model Governance</h5>
                <p className="text-xs text-gray-600 mt-1">
                  Real-time model retraining, bias auditing, and responsiveness to evolving skill demands, making the platform "future-proof".
                </p>
                <div className="mt-2 space-y-1">
                  <a href="https://www.smartdev.ai/ai-tech-stacks-2025" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-500 hover:underline flex items-center">
                    [3] SmartDev AI Tech Stacks 2025
                    <ExternalLink className="ml-1 h-2 w-2" />
                  </a>
                  <a href="https://www.aiim.org/2025-information-management-tech-stack" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-500 hover:underline flex items-center">
                    [4] AIIM The 2025 Information Management Tech Stack
                    <ExternalLink className="ml-1 h-2 w-2" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Workforce Readiness Crisis */}
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">The Workforce Readiness Crisis</h4>
            <div className="text-xs text-red-700 space-y-2">
              <p>• Over half of recent graduates feel unprepared for the workplace, with 52% doubting their education will secure a job within 12 months</p>
              <p>• By 2030, 39% of core workforce skills will change or become obsolete</p>
              <p>• Worldwide corporate training spend tops $400B annually, yet average ramp-up times linger around 3–6 months</p>
            </div>
            <div className="mt-2 space-y-1">
              <a href="https://www.wheebox.com/india-skills-report-2025" target="_blank" rel="noopener noreferrer" className="text-xs text-red-500 hover:underline flex items-center">
                [5] Wheebox India Skills Report 2025
                <ExternalLink className="ml-1 h-2 w-2" />
              </a>
              <a href="https://www.weforum.org/future-of-jobs-report-2025" target="_blank" rel="noopener noreferrer" className="text-xs text-red-500 hover:underline flex items-center">
                [6] World Economic Forum, Future of Jobs Report 2025
                <ExternalLink className="ml-1 h-2 w-2" />
              </a>
              <a href="https://www.linkedin.com/workplace-learning-report-2025" target="_blank" rel="noopener noreferrer" className="text-xs text-red-500 hover:underline flex items-center">
                [7] LinkedIn Workplace Learning Report 2025
                <ExternalLink className="ml-1 h-2 w-2" />
              </a>
            </div>
          </div>

          {/* Technology References */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-3">Technology References (Direct, clickable links):</h4>
            <div className="grid gap-2 text-xs">
              <div className="space-y-1">
                <a href="https://www.quodeck.com/ai-simulations-workforce-readiness" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [1] QuoDeck on AI simulations boosting workforce readiness (July 2025)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.trainingmag.com/ai-driven-simulations-transforming-workforce-readiness" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [2] Training Magazine: AI-driven simulations transforming workforce readiness (June 2025)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.wheebox.com/india-skills-report-2025" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [3] Wheebox India Skills Report 2025
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.weforum.org/future-of-jobs-report-2025" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [4] World Economic Forum Future of Jobs Report 2025
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.linkedin.com/workplace-learning-report-2025" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [5] LinkedIn Workplace Learning Report 2025
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.oecd.org/employment-outlook-2025" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [6] OECD Employment Outlook 2025
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://hbr.org/simulation-learning-case-study" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [7] Harvard Business Review The Case for Simulation Learning (May 2023)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.grandviewresearch.com/industry-analysis/artificial-intelligence-in-hr-market" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [8] Grand View Research AI in HR Market 2023
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.marketgrowthreports.com/simulation-learning-market-2024" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [9] MarketGrowthReports Simulation Learning Market 2024
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.infosys.com/ai-readiness-workforce-2025" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [10] Infosys – Building a Responsible AI-Ready Workforce (2025)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.coursebox.ai/case-studies-corporate-training" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [11] Coursebox AI Case Studies Corporate Training (June 2025)
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
                <a href="https://www.mckinsey.com/ai-workplace-report-january-2025" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  [12] McKinsey AI in the workplace report January 2025
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Revenue Streams from our Service Offering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Current Revenue Streams from our Service Offering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Revenue Stream 1 */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Solution Sales - Academic Institution (95% of revenue)</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>What is it?</strong> - A per student fixed fee (INR 3,000 to INR 15,000 per semester) for the design & delivery of our experiential learning programs, conducted for students of academic institutions every semester, with an aim to close the employability gap to make students industry-ready</p>
              <p><strong>How does it work?</strong> - We start by running a diagnostic assessment to understand the students' capabilities. We then design and conduct our experiential learning programs for the identified set of students. These programs are delivered in a hybrid mode, with both in-campus offline sessions and online live sessions.</p>
              <p><strong>Target Audience:</strong> B2B & B2B2C - we charge the fee to the academic institution. In most cases, the institution pays the fee, and in some cases, it is paid directly by the student.</p>
              <p><strong>Percentage Contribution:</strong> 95% of total revenue</p>
            </div>
          </div>

          {/* Revenue Stream 2 */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Solution Sales - Corporate (5% of revenue)</h4>
            <div className="text-sm text-green-700 space-y-2">
              <p><strong>What is it?</strong> - A fixed fee for the design & delivery of our experiential learning programs and e-learning courses, with an aim to upskill employees in product, process, policies and behavioural competencies</p>
              <p><strong>How does it work?</strong> - We start by understanding the training needs of the client, and if needed a diagnostic assessment is conducted. We then design and conduct our experiential learning programs or e-learning courses. The experiential learning programs are delivered in a hybrid mode, with both offline sessions and online live sessions. The e-learning courses are uploaded on the client's LMS.</p>
              <p><strong>Target Audience:</strong> B2B - we charge a fee for the design and delivery to the corporate.</p>
              <p><strong>Percentage Contribution:</strong> 5% of total revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Strategy for Syntra */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pricing Strategy for our newly launched product - Syntra
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Academic Institutions & Students */}
          <div>
            <h4 className="font-semibold mb-3">Tiered Pricing: Different packages based on features or usage levels - for Academic Institutions & Students</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-800">Aspire (Basic)</h5>
                <p className="text-xs text-blue-600 mt-1">INR 600 per student per semester</p>
                <p className="text-xs text-blue-600">Access to 1 interview simulation, student dashboard</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-800">Accelerate (Standard)</h5>
                <p className="text-xs text-green-600 mt-1">INR 1,500 per student per semester</p>
                <p className="text-xs text-green-600">Access to 2 interview simulations, 1 job simulation, 5 employer-specific assessments, mentor feedback, basic certification, student dashboard</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h5 className="font-medium text-purple-800">Achieve (Premium)</h5>
                <p className="text-xs text-purple-600 mt-1">INR 3,000 per student per semester</p>
                <p className="text-xs text-purple-600">Access to 3 interview simulations, 2 job simulations, 10 employer-specific assessments, advanced analytics, talent dashboard, mentor feedback, basic certification, student dashboard</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <h5 className="font-medium text-orange-800">Ascend (Premium Plus)</h5>
                <p className="text-xs text-orange-600 mt-1">INR 5,000 per student per semester</p>
                <p className="text-xs text-orange-600">Access to 5 interview simulations, 4 job simulations, unlimited employer-specific assessments, 1-on-1 mock interviews, advanced analytics, talent dashboard, mentor feedback, basic certification, student dashboard</p>
              </div>
            </div>
          </div>

          {/* Dynamic Pricing */}
          <div>
            <h4 className="font-semibold mb-3">Dynamic Pricing: Pricing varies based on demand or other factors</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-gray-50 rounded-lg border">
                <h5 className="font-medium text-gray-800">Pay per use - Interview Simulation</h5>
                <p className="text-xs text-gray-600 mt-1">INR 600 per interview simulation</p>
                <p className="text-xs text-gray-600">Access to 1 interview simulation, student dashboard, performance report</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <h5 className="font-medium text-gray-800">Pay per use - Job Simulation</h5>
                <p className="text-xs text-gray-600 mt-1">INR 1,000 per job simulation</p>
                <p className="text-xs text-gray-600">Access to 1 job simulation, student dashboard, performance report</p>
              </div>
            </div>
          </div>

          {/* Rationale behind pricing */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Rationale behind pricing (market research, competitor analysis)</h4>
            <div className="text-sm text-yellow-700 space-y-2">
              <p>• The approximate budget allotted for training and placement activities for every student in academic institutions in India ranges between INR 2,000 to INR 15,000 per student.</p>
              <p>• Industry-focused Training competitors like SixPhrase, Faceprep, and Imarticus charge about INR 3,000 to INR 5,000 per student per hybrid program.</p>
              <p>• Placement-focused competitors like Unstop charge students about INR 1,000 per month or INR 6,000 per year for access to self-paced courses, placement preparation, and competition/hackathon preparation.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Corporate Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Pricing Strategy - for Corporates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-3">Tiered Pricing: Different packages based on features or usage levels</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-800">Starter (Startups & Small Teams)</h5>
                <p className="text-xs text-blue-600 mt-1">INR 30,000 per quarter</p>
                <p className="text-xs text-blue-600">Deploy up to 15 interview simulations; AI-based candidate reports; Self-serve portal for role configuration</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-800">Growth (Growing Companies, SMBs)</h5>
                <p className="text-xs text-green-600 mt-1">INR 70,000 per quarter</p>
                <p className="text-xs text-green-600">Deploy up to 30 interview simulations and 10 job simulations; AI-based candidate reports; Bulk import and ATS integrations; White-labeled experience; Basic hiring analytics dashboard</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h5 className="font-medium text-purple-800">Enterprise (Large Enterprises & Hiring Teams)</h5>
                <p className="text-xs text-purple-600 mt-1">INR 2,50,000 per quarter</p>
                <p className="text-xs text-purple-600">Deploy up to 60 interview simulations and 20 job simulations; Role-specific evaluation rubrics; AI-based shortlisting with hiring recommendations; Account manager + support</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <h5 className="font-medium text-orange-800">Strategic+ (L&D & Transformation Initiatives)</h5>
                <p className="text-xs text-orange-600 mt-1">Customised pricing</p>
                <p className="text-xs text-orange-600">Unlimited candidate assessments; Dedicated hiring pipelines (HTD, fresher, internal upskilling); Custom simulations co-created with client; Employer branding integration; Analytics APIs & hiring ROI dashboard; Dedicated implementation & advisory team</p>
              </div>
            </div>
              </div>

          {/* Corporate Rationale */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Rationale behind pricing (market research, competitor analysis)</h4>
            <div className="text-sm text-yellow-700 space-y-2">
              <p>• The approximate average budget allotted for evaluation during hiring for every candidate in corporations in India ranges between INR 2,000 to INR 5,000.</p>
              <p>• The approximate average budget allotted for fresher onboarding & training for every employee in corporations in India ranges between INR 20,000 to INR 50,000.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unit Economics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Unit Economics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Academic Institutions */}
          <div>
            <h4 className="font-semibold mb-2">Key metrics for revenue generation - for Academic Institutions</h4>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm space-y-1">
                <div><strong>Customer Acquisition Cost (CAC):</strong> How much it costs to acquire a customer. - INR 1,125 per student</div>
                <div><strong>Lifetime Value (LTV):</strong> Revenue generated from a customer during their relationship. - INR 21,000 per student</div>
                <div><strong>LTV: CAC Ratio:</strong> Indicator of profitability. = 21000/1125 = 18.6</div>
              </div>
            </div>
          </div>

          {/* Corporate Clients */}
          <div>
            <h4 className="font-semibold mb-2">Key metrics for revenue generation - for Corporates (potential)</h4>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm space-y-1">
                <div><strong>Customer Acquisition Cost (CAC):</strong> How much it costs to acquire a customer. - INR 6,000</div>
                <div><strong>Lifetime Value (LTV):</strong> Revenue generated from a customer during their relationship. - INR 3,60,000 (i.e. INR 30,000 every quarter for a 3 year period)</div>
                <div><strong>LTV: CAC Ratio:</strong> Indicator of profitability. = 360000/6000 = 60</div>
              </div>
            </div>
          </div>

          {/* Recurring vs One-Time Revenue */}
          <div>
            <h4 className="font-semibold mb-2">Recurring vs. One-Time Revenue</h4>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm space-y-2">
                <div><strong>Recurring Revenue:</strong> Subscription fees, memberships. - with our product Syntra, we plan to offer monthly / annual subscription licenses based on the pricing tiers mentioned above</div>
                <div><strong>One-Time Revenue:</strong> Single purchases, setup fees. - 70% of our revenue from the current service business is one-time revenue and 30% is recurring revenue through bi-annual purchases</div>
              </div>
            </div>
          </div>

          {/* Payment Flow and Terms */}
          <div>
            <h4 className="font-semibold mb-2">Payment Flow and Terms</h4>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-sm space-y-2">
                <div><strong>How payments are collected and processed:</strong> Direct payments, online gateways, invoicing. - Invoicing academic institutions and corporations</div>
                <div><strong>Payment frequency:</strong> (monthly, annual, one-time). - Payment frequency is One-time in the current format of our service-based offerings. However, with the product Syntra, taking the primary focus we will be transitioning to a monthly and annual subscription model with user licenses.</div>
                <div><strong>Refund and cancellation policies:</strong> (if applicable). - N/A</div>
              </div>
            </div>
              </div>

          {/* Scalability of Revenue Model */}
          <div>
            <h4 className="font-semibold mb-2">Scalability of Revenue Model</h4>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="text-sm space-y-2">
                <p><strong>How the revenue model will scale as the business grows:</strong></p>
                <p>The revenue model is highly scalable due to its hybrid B2B and B2B2C structure, coupled with subscription-based pricing via Syntra. As we onboard more academic institutions and corporates, CAC will reduce due to brand recognition and repeat purchases, while customer LTV will increase through multi-year engagements and product upsells.</p>
                <p><strong>Key scalability levers that we will focus on:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Low marginal cost per additional student or simulation, especially in the digital delivery model of Syntra.</li>
                  <li>Network effect in academia - once Syntra is adopted by an institution, surrounding institutions follow suit due to peer benchmarking and student migration.</li>
                  <li>Corporate repeatability - once used for one hiring cycle or role, Syntra's usage expands across roles, departments, and verticals.</li>
                  <li>Annual/semester-based licenses ensure predictable, recurring revenue.</li>
                </ul>
                <p>By moving the majority of offerings to productized formats, we will reduce dependency on manpower-heavy training services and transition toward a SaaS-like business model, enabling 10x growth with minimal linear increase in cost.</p>
              </div>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Competitor Analysis Framework */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Competitor Analysis Framework
            </CardTitle>
            <CardDescription>
            Cover 2-3 competitors operating in similar revenue model or advanced revenue model in comparison to your company
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Mercor AI */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Mercor AI</h4>
              <div className="space-y-2 text-xs">
                <div><strong>Funding:</strong> $136M USD</div>
                <div><strong>ARR:</strong> $100M USD</div>
                <div><strong>Model:</strong> Commission-based talent marketplace</div>
                <div><strong>Focus:</strong> AI-powered hiring platform</div>
                <div><strong>Revenue Model:</strong> Transaction fees from successful placements</div>
                <div><strong>Market Position:</strong> Global talent acquisition platform</div>
              </div>
              <div className="mt-2">
                <a href="https://www.mercor.ai" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center">
                  Company Website
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
              </div>
            </div>

            {/* Degreed */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Degreed</h4>
              <div className="space-y-2 text-xs">
                <div><strong>Funding:</strong> $450M USD</div>
                <div><strong>ARR:</strong> $120M USD</div>
                <div><strong>Model:</strong> Enterprise subscription</div>
                <div><strong>Focus:</strong> Learning experience platform</div>
                <div><strong>Revenue Model:</strong> SaaS subscriptions for enterprise clients</div>
                <div><strong>Market Position:</strong> Enterprise learning and development</div>
              </div>
              <div className="mt-2">
                <a href="https://www.degreed.com" target="_blank" rel="noopener noreferrer" className="text-xs text-green-500 hover:underline flex items-center">
                  Company Website
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
              </div>
            </div>

            {/* Skillfully */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Skillfully</h4>
              <div className="space-y-2 text-xs">
                <div><strong>Funding:</strong> $2.5M USD</div>
                <div><strong>ARR:</strong> $8M USD</div>
                <div><strong>Model:</strong> B2B SaaS subscriptions</div>
                <div><strong>Focus:</strong> Pre-hire simulations</div>
                <div><strong>Revenue Model:</strong> Subscription-based assessment platform</div>
                <div><strong>Market Position:</strong> Skills assessment and simulation platform</div>
              </div>
              <div className="mt-2">
                <a href="https://www.skillfully.com" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-500 hover:underline flex items-center">
                  Company Website
                  <ExternalLink className="ml-1 h-2 w-2" />
                </a>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">Competitive Positioning</h4>
            <p className="text-sm text-gray-700 mb-2">
              InLustro/Syntra differentiates through experiential, simulation-based learning combined with hiring integration, 
              serving the full education-to-employment pipeline with both campus and corporate solutions.
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Key Differentiators:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Only platform combining AI-powered job simulations with L&D tools</li>
                <li>Hands-on, contextual, and outcome-driven approach vs content-only competitors</li>
                <li>Full education-to-employment pipeline coverage</li>
                <li>High stickiness across stakeholders (students, institutions, employers)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financials & Fundraising */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financials & Fundraising
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Problem Solved */}
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">Key Problem Solved</h4>
            <p className="text-sm text-red-700">
              Hiring and training for early-career roles is broken. Manual interviews and generic assignments fail to assess or prepare candidates for the real job. Meanwhile, companies spend months and significant resources onboarding fresh talent who still struggle to perform.
            </p>
          </div>

          {/* Business Model */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Business Model</h4>
            <p className="text-sm text-blue-700">
              InLustro operates on a B2B and B2B2C model, delivering high-impact, simulation-based learning and hiring solutions to academic institutions and corporates. Our primary revenue comes from institutional contracts where we design and deliver experiential training programs to bridge the employability gap. With the launch of our product Syntra, our job simulation platform, we will be transitioning toward a scalable SaaS model offering tiered and pay-per-use pricing to institutions and corporates. Our business combines high-touch service delivery with high-scale product adoption to drive recurring, high-margin revenue.
            </p>
              </div>

          {/* Pipeline */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Pipeline</h4>
            <div className="text-sm text-green-700 space-y-2">
                  <div>
                <strong>Sales Pipeline Value:</strong> As of July 2025, InLustro's qualified sales pipeline stands at INR 4.8 Cr+, spanning ongoing conversations with over 30 new academic institutions and 10 new corporate clients across India. These prospects are in various stages of the conversion funnel - ranging from pilot discussions to proposal negotiations and MoU finalization.
                  </div>
                  <div>
                <strong>Projected Growth Opportunities:</strong> With the new NEP-aligned emphasis on employability and skill-based credits, colleges are actively seeking partners like InLustro to bridge the industry-readiness gap. We aim to expand from our current footprint of 45+ institutions to 100+ partner colleges over the next 12–15 months.
              </div>
            </div>
          </div>

          {/* Why Now */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">Why Now</h4>
            <div className="text-sm text-purple-700 space-y-2">
              <div>
                <strong>Market Trends:</strong> AI adoption in HR and EdTech is accelerating. Companies are actively replacing manual assessments and training with automation and AI-powered tools. The NEP 2020 and UGC guidelines now emphasize experiential learning and industry alignment.
                  </div>
                  <div>
                <strong>Competitive Edge:</strong> Syntra is the only experiential JobTech platform that combines AI-based job simulations, custom role evaluators, and L&D tools into a single platform.
                  </div>
                  <div>
                <strong>Urgency/Opportunity:</strong> Institutions need scalable, NEP-compliant skilling partners to retain relevance and boost placement outcomes, even more so when the employability gap is widening.
                  </div>
                </div>
              </div>

          {/* Financials */}
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2">Financials</h4>
            <div className="text-sm text-orange-700 space-y-2">
              <div><strong>Funding Ask:</strong> INR 2.5 Crores</div>
              <div><strong>Structure:</strong> We are raising our Seed round through a SAFE instrument, with a valuation cap and discount structure designed to align long-term interests with our early backers.</div>
              <div><strong>Valuation Cap and Floor:</strong> INR 20 Crores to 30 Crores</div>
              <div><strong>Current Commitments:</strong> INR 1 Crore from Soonicorn Ventures & Realtime Angel Fund</div>
            </div>
          </div>

          {/* Current Financials */}
          <div className="grid gap-2 md:grid-cols-3">
            <div className="p-2 bg-blue-50 rounded text-center">
              <div className="text-lg font-bold text-blue-800">INR 10.33L</div>
              <div className="text-xs text-blue-600">Monthly Recurring Revenue</div>
            </div>
            <div className="p-2 bg-green-50 rounded text-center">
              <div className="text-lg font-bold text-green-800">INR 1.24Cr</div>
              <div className="text-xs text-green-600">Annual Recurring Revenue</div>
            </div>
            <div className="p-2 bg-purple-50 rounded text-center">
              <div className="text-lg font-bold text-purple-800">70.25%</div>
              <div className="text-xs text-purple-600">Gross Margin</div>
            </div>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-700">
              <strong>Note:</strong> Mentioned are provisional pre audited numbers. The costs related to R&D, IP form part of the expenses and are yet to be capitalized.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Risks and Mitigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risks and Mitigation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Risks and Mitigation</h4>
            <div className="text-sm space-y-3">
              <div>
                <p className="font-medium text-yellow-800 mb-2">Identified Risks</p>
                <p className="text-yellow-700 mb-2">As with any early-stage venture, we have proactively identified 5 risks and developed mitigation strategies to ensure sustainable growth.</p>
              </div>
              
              <div className="space-y-2">
                <div className="p-2 bg-white rounded border">
                  <p className="font-medium text-gray-800">Adoption Resistance from Academic Institutions</p>
                  <p className="text-xs text-gray-600">Traditional institutions may resist adopting new AI-based training and evaluation models due to legacy mindsets, slow decision cycles, or budgetary concerns.</p>
                  <p className="text-xs text-green-600 mt-1"><strong>Mitigation:</strong> Offer freemium and pilot programs to demonstrate value and outcomes before upselling. Align Syntra's offerings with NEP 2020 and UGC guidelines to make it easier for institutions to adopt.</p>
                </div>
                
                <div className="p-2 bg-white rounded border">
                  <p className="font-medium text-gray-800">Delayed Payment Cycles from Academic Institutions</p>
                  <p className="text-xs text-gray-600">Payment delays from colleges can affect cash flow.</p>
                  <p className="text-xs text-green-600 mt-1"><strong>Mitigation:</strong> Structure contracts with advance payments, milestone-based billing, or co-payments from students. Target a balanced mix of private, self-financed institutions with faster payment cycles.</p>
                </div>
                
                <div className="p-2 bg-white rounded border">
                  <p className="font-medium text-gray-800">Competitive Market in Skilling & Hiring Tech</p>
                  <p className="text-xs text-gray-600">Presence of large players (e.g., Unstop, Naukri, HackerRank) in the skilling and assessment space could impact market share in India.</p>
                  <p className="text-xs text-green-600 mt-1"><strong>Mitigation:</strong> Differentiate through experiential, simulation-based learning, which few others offer. Focus on role-based job readiness + hiring integration, not just generic content or assessments.</p>
                </div>
                
                <div className="p-2 bg-white rounded border">
                  <p className="font-medium text-gray-800">Technology & Platform Scalability</p>
                  <p className="text-xs text-gray-600">As usage grows, the platform must scale reliably while maintaining quality, performance, and security.</p>
                  <p className="text-xs text-green-600 mt-1"><strong>Mitigation:</strong> Built on modular architecture that enables scaling in phases. Partnering with trusted cloud providers (e.g., AWS) for infrastructure. Planned roadmap for continuous QA, security audits, and feature upgrades.</p>
                </div>
                
                <div className="p-2 bg-white rounded border">
                  <p className="font-medium text-gray-800">Talent Acquisition & Retention in a Startup Environment</p>
                  <p className="text-xs text-gray-600">Difficulty in attracting and retaining top talent, especially in tech and operations.</p>
                  <p className="text-xs text-green-600 mt-1"><strong>Mitigation:</strong> Offer competitive ESOPs and flexible work culture to attract mission-aligned individuals. Build a culture of ownership and impact, especially for early hires.</p>
                </div>
              </div>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Investment Decision */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Investment Decision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">Investment Recommendation</h4>
            <p className="text-sm text-gray-700 mb-2">
              {diligenceData?.investment_decision?.recommendation || 
               "Based on comprehensive analysis of market opportunity, technology differentiation, team capabilities, and financial projections, this investment presents a compelling opportunity in the rapidly growing workforce readiness and EdTech space."}
            </p>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(diligenceData?.investment_decision?.score || 7) * 10}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-800">
                {diligenceData?.investment_decision?.score || 7}/10
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Investment score based on market opportunity, team strength, and execution capability
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Investment Thesis</h4>
            <p className="text-sm text-blue-700">
              {diligenceData?.investment_thesis?.summary || 
               "InLustro/Syntra addresses a critical market need in workforce readiness with a differentiated technology approach. The combination of AI-powered simulations, comprehensive market validation, and strong unit economics positions the company for significant growth in the expanding EdTech and HRTech markets."}
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">Next Steps</h4>
            <div className="text-sm text-purple-700 space-y-1">
              <p>• Finalize investment terms and documentation</p>
              <p>• Schedule follow-up meetings with key team members</p>
              <p>• Conduct technical due diligence on platform scalability</p>
              <p>• Review customer references and case studies</p>
              <p>• Prepare investment committee presentation</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                // Handle Accept action
                console.log('Investment Accepted');
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept Investment
            </Button>
            
            <Button 
              variant="destructive"
              onClick={() => {
                // Handle Decline action
                console.log('Investment Declined');
              }}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Decline Investment
            </Button>
            
            <Button 
              variant="outline"
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              onClick={() => {
                // Handle Hold action
                console.log('Investment on Hold');
              }}
            >
              <Target className="mr-2 h-4 w-4" />
              Hold Decision
            </Button>
            
            <Button 
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
              onClick={handleCreateRoom}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Create Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}