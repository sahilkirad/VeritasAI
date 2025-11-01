'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CustomerReferences from "./CustomerReferences";
import { Users, Building, Cpu, Database, Cloud, Zap, TrendingUp, DollarSign, BarChart3, ExternalLink, FileText, CheckCircle, AlertTriangle, Target, RefreshCw, User } from "lucide-react";
import { db } from '@/lib/firebase-new';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';

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

interface Memo2TabProps {
  diligenceData: DiligenceData | null;
  interviewData?: any;
  memo1?: any; // pooled fallback from ingestion result
  memoId?: string; // Memo ID to fetch diligence data
  onDiligenceDataUpdate?: (data: DiligenceData | null) => void; // Callback to update parent state
}

export default function Memo2Tab({ diligenceData, interviewData, memo1, memoId, onDiligenceDataUpdate }: Memo2TabProps) {
  const { toast } = useToast();
  const [isFetching, setIsFetching] = useState(false);

  const handleFetchDiligenceData = async () => {
    if (!memoId) {
      toast({
        title: "Error",
        description: "Memo ID is required to fetch diligence data",
        variant: "destructive"
      });
      return;
    }

    setIsFetching(true);
    try {
      console.log('🔄 Fetching diligence data from diligenceReports');
      console.log('Memo ID:', memoId);
      console.log('Memo1 data:', memo1);
      console.log('Company ID:', memo1?.company_id);
      
      // Get company_id from memo1 or try using memoId as company_id
      const companyId = memo1?.company_id || memoId;
      
      // Try multiple queries to find the diligence report
      let diligenceDoc = null;
      let snapshot = null;
      
      // Query 1: By company_id (most likely field based on data structure)
      try {
        console.log('📋 Query 1: Trying by company_id:', companyId);
        let diligenceQuery = query(
          collection(db, 'diligenceReports'),
          where('company_id', '==', companyId),
          limit(10)
        );
        snapshot = await getDocs(diligenceQuery);
        console.log('Query 1 results:', snapshot.empty ? 'No results' : `${snapshot.docs.length} documents found`);
        
        if (!snapshot.empty) {
          const docs = snapshot.docs.sort((a, b) => {
            const aTime = a.data().created_at?.toMillis?.() || a.data().created_at?.seconds * 1000 || a.data().last_updated?.toMillis?.() || a.data().last_updated?.seconds * 1000 || 0;
            const bTime = b.data().created_at?.toMillis?.() || b.data().created_at?.seconds * 1000 || b.data().last_updated?.toMillis?.() || b.data().last_updated?.seconds * 1000 || 0;
            return bTime - aTime; // Descending order (newest first)
          });
          diligenceDoc = { id: docs[0].id, data: docs[0].data() };
          console.log('✅ Found diligence report by company_id:', diligenceDoc.id);
        }
      } catch (queryError: any) {
        console.warn('Query 1 failed:', queryError?.message || queryError);
      }
      
      // Query 2: By memo_1_id (if Query 1 didn't find anything)
      if (!diligenceDoc) {
        try {
          console.log('📋 Query 2: Trying by memo_1_id:', memoId);
          let diligenceQuery = query(
            collection(db, 'diligenceReports'),
            where('memo_1_id', '==', memoId),
            limit(10)
          );
          snapshot = await getDocs(diligenceQuery);
          console.log('Query 2 results:', snapshot.empty ? 'No results' : `${snapshot.docs.length} documents found`);
          
          if (!snapshot.empty) {
            const docs = snapshot.docs.sort((a, b) => {
              const aTime = a.data().created_at?.toMillis?.() || a.data().created_at?.seconds * 1000 || a.data().last_updated?.toMillis?.() || a.data().last_updated?.seconds * 1000 || 0;
              const bTime = b.data().created_at?.toMillis?.() || b.data().created_at?.seconds * 1000 || b.data().last_updated?.toMillis?.() || b.data().last_updated?.seconds * 1000 || 0;
              return bTime - aTime;
            });
            diligenceDoc = { id: docs[0].id, data: docs[0].data() };
            console.log('✅ Found diligence report by memo_1_id:', diligenceDoc.id);
          }
        } catch (queryError: any) {
          console.warn('Query 2 failed:', queryError?.message || queryError);
        }
      }
      
      // Query 3: Get all recent reports and search through them (fallback)
      if (!diligenceDoc) {
        console.log('📋 Query 3: Fetching all reports and searching...');
        try {
          const allReportsQuery = query(
            collection(db, 'diligenceReports'),
            limit(100) // Get more documents to search through
          );
          const allSnapshot = await getDocs(allReportsQuery);
          console.log(`Found ${allSnapshot.docs.length} total diligence reports`);
          
          // Log first few document IDs and their company_id/memo_1_id for debugging
          if (allSnapshot.docs.length > 0) {
            console.log('Sample documents:');
            allSnapshot.docs.slice(0, 5).forEach((doc, idx) => {
              const data = doc.data();
              console.log(`  Doc ${idx + 1} (${doc.id}):`, {
                company_id: data.company_id,
                memo_1_id: data.memo_1_id,
                has_results: !!data.results
              });
            });
          }
          
          // Find report that matches company_id or memo_1_id
          const matchingDocs = [];
          for (const doc of allSnapshot.docs) {
            const data = doc.data();
            const matchesCompanyId = data.company_id === companyId;
            const matchesMemoId = data.memo_1_id === memoId;
            const matchesMemoIdAsCompanyId = data.company_id === memoId;
            
            if (matchesCompanyId || matchesMemoId || matchesMemoIdAsCompanyId) {
              console.log(`✅ Match found: Doc ${doc.id}`, { matchesCompanyId, matchesMemoId, matchesMemoIdAsCompanyId });
              matchingDocs.push({ id: doc.id, data: data });
            }
          }
          
          if (matchingDocs.length > 0) {
            // Sort by timestamp (newest first)
            matchingDocs.sort((a, b) => {
              const aTime = a.data.created_at?.toMillis?.() || a.data.created_at?.seconds * 1000 || a.data.last_updated?.toMillis?.() || a.data.last_updated?.seconds * 1000 || 0;
              const bTime = b.data.created_at?.toMillis?.() || b.data.created_at?.seconds * 1000 || b.data.last_updated?.toMillis?.() || b.data.last_updated?.seconds * 1000 || 0;
              return bTime - aTime;
            });
            diligenceDoc = matchingDocs[0];
            console.log('✅ Selected most recent matching report:', diligenceDoc.id);
          } else {
            console.warn('❌ No matching documents found. Searched for:', {
              companyId,
              memoId,
              totalDocs: allSnapshot.docs.length
            });
          }
        } catch (fallbackError: any) {
          console.error('Query 3 (fallback) failed:', fallbackError?.message || fallbackError);
        }
      }

      if (!diligenceDoc) {
        console.error('❌ No diligence report found');
        toast({
          title: "No Data Found",
          description: `No diligence report found for company_id: ${companyId} or memo_1_id: ${memoId}. Please run diligence analysis first in the Diligence Hub.`,
          variant: "destructive"
        });
        setIsFetching(false);
        return;
      }

      console.log('✅ Found diligence report:', diligenceDoc.id);
      console.log('Report data keys:', Object.keys(diligenceDoc.data));
      console.log('Has results?', !!diligenceDoc.data.results);

      // Map the data structure correctly
      const resultsBlock = diligenceDoc.data.results || {};
      const agentValidations = resultsBlock.agent_validations || {};
      const validationResults = resultsBlock.validation_results || {};

      const founderProfile = agentValidations.founder_profile || validationResults.founder_profile || {};
      const memo1Accuracy = agentValidations.memo1_accuracy || validationResults.memo1_accuracy || {};
      const pitchConsistency = agentValidations.pitch_consistency || validationResults.pitch_consistency || {};
      const marketBenchmarking = resultsBlock.market_benchmarking || agentValidations.market_benchmarking || validationResults.market_benchmarking || {};

      // Extract key findings properly
      const keyFindings = resultsBlock.key_findings || {};
      const redFlagsArray = keyFindings.red_flags || [];
      
      // Map to the expected structure
      const mappedData: DiligenceData = {
        // Metadata from document root
        investor_email: diligenceDoc.data.investor_email,
        company_id: diligenceDoc.data.company_id,
        created_at: diligenceDoc.data.created_at,
        completed_at: diligenceDoc.data.completed_at,
        last_updated: diligenceDoc.data.last_updated,
        progress: diligenceDoc.data.progress,
        status: diligenceDoc.data.status || resultsBlock.status || 'completed',
        validation_timestamp: resultsBlock.validation_results?.memo1_accuracy?.validation_timestamp || 
                             resultsBlock.validation_results?.founder_profile?.validation_timestamp ||
                             resultsBlock.validation_results?.pitch_consistency?.validation_timestamp || null,
        
        overall_score: resultsBlock.overall_score || diligenceDoc.data.overall_score || 0,
        executive_summary: {
          overall_dd_score: resultsBlock.overall_score || diligenceDoc.data.overall_score || 0,
          overall_dd_status: resultsBlock.risk_assessment || 'N/A',
          recommendation: resultsBlock.recommendations?.[0] || 'N/A',
          key_findings: keyFindings,
          validation_gaps: keyFindings.unsubstantiated_claims?.length || 0,
          company_name: memo1?.title || 'Company Analysis'
        },
        founder_credibility_assessment: {
          overall_score: founderProfile.credibility_score || founderProfile.overall_score || 0,
          credibility_rating: founderProfile.recommendation || (founderProfile.credibility_score >= 70 ? 'High' : founderProfile.credibility_score >= 50 ? 'Medium' : 'Low'),
          detailed_analysis: founderProfile.detailed_analysis || '',
          missing_information: founderProfile.missing_information || [],
          recommendation: founderProfile.recommendation || '',
          red_flags: founderProfile.red_flags || [],
          validation_status: founderProfile.validation_status || '',
          verified_claims: founderProfile.verified_claims || []
        },
        memo1_accuracy_data: {
          accuracy_score: memo1Accuracy.accuracy_score || 0,
          detailed_analysis: memo1Accuracy.detailed_analysis || '',
          discrepancies: memo1Accuracy.discrepancies || [],
          exaggerations: memo1Accuracy.exaggerations || [],
          omissions: memo1Accuracy.omissions || [],
          risk_level: memo1Accuracy.risk_level || '',
          verified_facts: memo1Accuracy.verified_facts || []
        },
        pitch_consistency_check: {
          consistency_score: pitchConsistency.consistency_score || 0,
          match_percentage: pitchConsistency.match_percentage || pitchConsistency.consistency_score || 0,
          data_gaps: pitchConsistency.data_gaps || [],
          detailed_analysis: pitchConsistency.detailed_analysis || '',
          internal_contradictions: pitchConsistency.internal_contradictions || [],
          risk_level: pitchConsistency.risk_level || '',
          unrealistic_claims: pitchConsistency.unrealistic_claims || []
        },
        red_flags_concerns: {
          total_flags: redFlagsArray.length,
          critical_blockers: redFlagsArray.filter((f: any) => typeof f === 'string' ? f.toLowerCase().includes('critical') || f.toLowerCase().includes('blocker') : (f.severity === 'critical' || f.flag_type === 'critical')).length,
          flags: redFlagsArray.map((f: any) => {
            if (typeof f === 'string') {
              return { flag_type: 'Risk', description: f, severity: 'Medium' };
            }
            return f;
          }),
          mitigation_level: resultsBlock.risk_assessment === 'high' ? 'High Risk' : resultsBlock.risk_assessment === 'medium' ? 'Medium Risk' : 'Low Risk'
        },
        market_benchmarking: marketBenchmarking.data || marketBenchmarking,
        key_findings: {
          red_flags: redFlagsArray,
          unsubstantiated_claims: keyFindings.unsubstantiated_claims || [],
          external_discrepancies: keyFindings.external_discrepancies || [],
          internal_contradictions: keyFindings.internal_contradictions || []
        },
        recommendations: resultsBlock.recommendations || [],
        priority_actions: resultsBlock.priority_actions || [],
        risk_assessment: resultsBlock.risk_assessment || 'N/A',
        confidence_level: resultsBlock.confidence_level || 'N/A',
        executive_summary_text: resultsBlock.executive_summary || resultsBlock.detailed_analysis || '',
        overall_dd_score_recommendation: {
          overall_dd_score: resultsBlock.overall_score || 0,
          confidence_level: resultsBlock.confidence_level || 'N/A',
          investment_recommendation: resultsBlock.recommendations?.[0] || 'N/A',
          component_scores: {
            founder_credibility: founderProfile.credibility_score || 0,
            memo1_accuracy: memo1Accuracy.accuracy_score || 0,
            pitch_consistency: pitchConsistency.consistency_score || 0,
            overall_score: resultsBlock.overall_score || 0
          }
        }
      };

      console.log('✅ Mapped diligence data:', {
        overall_score: mappedData.overall_score,
        founder_credibility: mappedData.founder_credibility_assessment?.overall_score,
        memo1_accuracy: mappedData.memo1_accuracy_data?.accuracy_score,
        pitch_consistency: mappedData.pitch_consistency_check?.consistency_score,
        red_flags_count: mappedData.red_flags_concerns?.total_flags,
        has_executive_summary: !!mappedData.executive_summary,
        has_market_benchmarking: !!mappedData.market_benchmarking
      });

      // Update parent component state
      if (onDiligenceDataUpdate) {
        console.log('🔄 Calling onDiligenceDataUpdate callback...');
        onDiligenceDataUpdate(mappedData);
      }

      toast({
        title: "Data Fetched",
        description: "Diligence report data has been loaded successfully.",
      });

    } catch (error) {
      console.error('Error fetching diligence data:', error);
      toast({
        title: "Error",
        description: `Failed to fetch diligence data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsFetching(false);
    }
  };

  const safeDate = (d: any) => {
    if (!d) return null;
    try {
      const date = typeof d === 'string' ? new Date(d) : (d?.seconds ? new Date(d.seconds * 1000) : new Date(d));
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  // Helper function to safely render values (convert objects/arrays to strings)
  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      // If array of objects, try to extract meaningful text
      if (typeof value[0] === 'object') {
        return value.map((item, idx) => {
          if (typeof item === 'object' && item !== null) {
            // Try to find a text property
            return item.text || item.message || item.description || item.name || JSON.stringify(item);
          }
          return String(item);
        }).join(', ');
      }
      return value.join(', ');
    }
    if (typeof value === 'object') {
      // If it has a description or text property, use that
      if (value.description) return value.description;
      if (value.text) return value.text;
      if (value.summary) return value.summary;
      // If it's an empty object, return a default
      if (Object.keys(value).length === 0) return '—';
      // Try to convert to readable string
      try {
        return JSON.stringify(value);
      } catch {
        return '—';
      }
    }
    return String(value);
  };
  
  const overallScore = diligenceData?.executive_summary?.overall_dd_score ?? diligenceData?.overall_score ?? diligenceData?.memo1_accuracy_data?.accuracy_score;
  const recommendation = diligenceData?.executive_summary?.recommendation || diligenceData?.investment_recommendation || '—';
  const credibilityScore = diligenceData?.founder_credibility_assessment?.overall_score;
  const credibilityRating = diligenceData?.founder_credibility_assessment?.credibility_rating;
  const consistencyScore = diligenceData?.pitch_consistency_check?.overall_consistency_score;
  const matchPct = diligenceData?.pitch_consistency_check?.match_percentage;
  const totalFlags = diligenceData?.red_flags_concerns?.total_flags ?? (Array.isArray(diligenceData?.key_risks) ? diligenceData?.key_risks.length : (Array.isArray(memo1?.initial_flags) ? memo1.initial_flags.length : 0));
  const validationGaps = diligenceData?.executive_summary?.validation_gaps;

  // Format date helper
  const formatDate = (dateValue: any): string => {
    const d = safeDate(dateValue);
    if (!d) return 'Not Available';
    return d.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  // Get red flags count
  const redFlagsCount = diligenceData?.red_flags_concerns?.total_flags || 
                        (diligenceData?.key_findings?.red_flags?.length || 0);
  
  // Get validation gaps count
  const validationGapsCount = diligenceData?.executive_summary?.validation_gaps || 
                              (diligenceData?.key_findings?.unsubstantiated_claims?.length || 0);

  if (!diligenceData) {
  return (
    <div className="space-y-2">
        {/* Fetch Data Button */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Diligence Report Data</h3>
                <p className="text-xs text-gray-600">
                  No data loaded. Click to fetch from diligenceReports.
                </p>
              </div>
              <Button
                onClick={handleFetchDiligenceData}
                disabled={isFetching || !memoId}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Fetching...' : 'Fetch Diligence Data'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2">
      {/* Header Section */}
      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 pb-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold text-blue-900">Company: {diligenceData?.executive_summary?.company_name || memo1?.title || 'Company Analysis'}</div>
              <div className="text-xs text-blue-700 mt-1">Company ID: {memo1?.company_id || memoId || 'N/A'}</div>
              <div className="text-xs text-blue-700">Investor Email: {diligenceData?.investor_email || interviewData?.investorEmail || 'N/A'}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-700">Date Completed: {formatDate(diligenceData?.completed_at || diligenceData?.created_at)}</div>
              <div className="text-xs text-blue-700">Validation Timestamp: {diligenceData?.validation_timestamp || 'N/A'}</div>
              <div className="mt-2 flex gap-2 justify-end">
                <Badge variant={diligenceData?.status === 'completed' ? 'default' : 'secondary'} className="rounded-full">
                  {diligenceData?.status === 'completed' ? '✅ Completed' : 'In Progress'}
                </Badge>
                <Badge variant={diligenceData?.confidence_level === 'low' ? 'destructive' : 'default'} className="rounded-full">
                  Confidence: {safeRender(diligenceData?.confidence_level)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs">
            <div><strong>Overall Risk Level:</strong> <span className="text-red-600 font-semibold">{safeRender(diligenceData?.risk_assessment || diligenceData?.memo1_accuracy_data?.risk_level)}</span></div>
            <div><strong>Validation Status:</strong> <span className="text-green-600">{safeRender(diligenceData?.founder_credibility_assessment?.validation_status)}</span></div>
          </div>
        </CardHeader>
      </Card>

      {/* Fetch Data Button */}
      <Card className="border-blue-100 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-blue-900">Diligence Report Data</h3>
              <p className="text-xs text-blue-700">
                Data loaded from diligenceReports collection
              </p>
            </div>
            <Button
              onClick={handleFetchDiligenceData}
              disabled={isFetching || !memoId}
              size="sm"
              variant="outline"
              className="border-blue-200 hover:bg-blue-50"
            >
              <RefreshCw className={`h-3 w-3 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ⚡ QUICK ASSESSMENT */}
      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-4 w-4 text-blue-600" />
            QUICK ASSESSMENT
          </CardTitle>
          <CardDescription className="text-sm">Snapshot of DD Status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden border border-blue-200 rounded-lg">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-sky-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Metric</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Score / Value</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Status / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Overall DD Score</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{overallScore ?? 'N/A'}{overallScore ? ' / 100' : ''}</td>
                  <td className="px-4 py-3 text-sm text-red-600 font-medium">{safeRender(diligenceData?.risk_assessment || diligenceData?.executive_summary?.overall_dd_status || 'High risk')}</td>
                </tr>
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Founder Credibility</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{credibilityScore ?? 'N/A'}{credibilityScore ? ' / 100' : ''}</td>
                  <td className="px-4 py-3 text-sm">{safeRender(diligenceData?.founder_credibility_assessment?.recommendation || credibilityRating || '—')}</td>
                </tr>
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Claim Consistency</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{matchPct ? `${matchPct}%` : (consistencyScore ? `${consistencyScore}%` : '—')}</td>
                  <td className="px-4 py-3 text-sm">{matchPct ? `${matchPct}% consistency verified` : '—'}</td>
                </tr>
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Red Flags Detected</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">{redFlagsCount}</td>
                  <td className="px-4 py-3 text-sm text-red-600 font-medium">{safeRender(diligenceData?.risk_assessment || 'High Risk')}</td>
                </tr>
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Validation Gaps</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">{validationGapsCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Multiple missing data points and unverifiable claims (see below)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 🧭 EXECUTIVE SUMMARY */}
      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-4 w-4 text-blue-600" />
            EXECUTIVE SUMMARY
          </CardTitle>
          <CardDescription className="text-sm">Due Diligence Validation Report – Complete Structure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden border border-blue-200 rounded-lg">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-sky-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Parameter</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Company</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{diligenceData?.executive_summary?.company_name || memo1?.title || 'Company Analysis'}</td>
                </tr>
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Interview Date</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{(() => { const d = safeDate(interviewData?.createdAt) || safeDate(memo1?.timestamp); return d ? d.toLocaleDateString('en-GB') : 'Not Available'; })()}</td>
                </tr>
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Interview Duration</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{interviewData?.questions?.length ? `${interviewData.questions.length * 5} minutes` : 'Not Available'}</td>
                </tr>
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Founder Interviewed</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{interviewData?.founderEmail || memo1?.founder_email || memo1?.founder_name || 'Not Available'}</td>
                </tr>
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">DD Agent</td>
                  <td className="px-4 py-3 text-sm text-gray-700">AI Diligence Validator (Memo 2 Agent)</td>
                </tr>
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Validation Method</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Founder Interview + LinkedIn Verification</td>
                </tr>
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Overall DD Score</td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-600">{overallScore ?? 'N/A'}{overallScore ? ' / 100' : ''}</td>
                </tr>
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Recommendation</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{safeRender(recommendation)}</td>
                </tr>
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Key Findings</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{redFlagsCount} Red Flags identified; {validationGapsCount} Validation Gaps recorded</td>
                </tr>
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Overall Confidence Level</td>
                  <td className="px-4 py-3 text-sm font-semibold text-orange-600">{safeRender(diligenceData?.confidence_level || 'Low')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 👥 FOUNDER CREDIBILITY ASSESSMENT */}
      <Card className="border-green-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-4 w-4 text-green-600" />
            FOUNDER CREDIBILITY ASSESSMENT
          </CardTitle>
          <CardDescription className="text-sm">Comprehensive founder background and credibility evaluation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="mb-2">
              <span className="text-sm font-semibold text-green-800">Overall Credibility Score: </span>
              <span className="text-lg font-bold text-green-600">
                {credibilityScore ?? 'N/A'}{credibilityScore ? ' / 100' : ''}
                </span>
              </div>
            <div className="text-xs text-gray-700 mb-3">
              <strong>Detailed Analysis:</strong>
              <div className="mt-1 whitespace-pre-wrap">{safeRender(diligenceData?.founder_credibility_assessment?.detailed_analysis || '')}</div>
            </div>
            {diligenceData?.founder_credibility_assessment?.recommendation && (
              <div className="text-xs text-gray-700">
                <strong>Recommendation:</strong> {safeRender(diligenceData.founder_credibility_assessment.recommendation)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>



      {/* 🚨 RED FLAGS & CONCERNS */}
      {diligenceData?.red_flags_concerns && redFlagsCount > 0 && (
        <Card className="border-orange-100 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-orange-900">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              RED FLAGS & CONCERNS
            </CardTitle>
            <CardDescription className="text-sm">
              Risk Assessment & Mitigation Analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden border border-orange-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-50 to-amber-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-orange-900">Severity</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-orange-900">Risk Description</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-orange-900">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100">
                  {(diligenceData?.red_flags_concerns?.flags || diligenceData?.key_findings?.red_flags || []).slice(0, 5).map((f: any, i: number) => {
                    const flagText = typeof f === 'string' ? f : safeRender(f.description || f.flag_type || f);
                    const severity = typeof f === 'object' && f !== null ? (f.severity || 'Medium') : 'Medium';
                    return (
                      <tr key={i} className="hover:bg-orange-50/50">
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="rounded-full bg-orange-50 text-orange-700 border-orange-200">
                            🟡 {severity}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{flagText}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="rounded-full bg-red-50 text-red-700 border-red-200">
                            High
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-red-800 mb-2">Summary:</div>
              <div className="text-sm text-red-700 space-y-1">
                <div>Total Red Flags: <strong>{redFlagsCount}</strong></div>
                <div>Critical Blockers: <strong>{diligenceData?.red_flags_concerns?.critical_blockers ?? 0}</strong></div>
                <div>Overall Risk: <strong className="text-red-800">{safeRender(diligenceData?.risk_assessment || 'High')}</strong></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Validation */}
      {diligenceData?.financial_validation ? (
      <Card className="border-green-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-4 w-4 text-green-600" />
            Financial Validation
          </CardTitle>
          <CardDescription className="text-sm">
            Unit Economics & Burn Rate Verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            {diligenceData?.financial_validation?.unit_economics && (
              <div className="p-2 bg-green-50 border border-green-200 rounded">
                <div className="font-semibold text-green-800 mb-1">Unit Economics</div>
                <div className="text-green-700">CAC: {diligenceData.financial_validation.unit_economics.cac_current || '—'}</div>
                <div className="text-green-700">LTV: {diligenceData.financial_validation.unit_economics.ltv_range || '—'}</div>
                <div className="text-green-700">Gross Margin: {diligenceData.financial_validation.unit_economics.gross_margin || '—'}</div>
              </div>
            )}
            {diligenceData?.financial_validation?.burn_rate_analysis && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                <div className="font-semibold text-yellow-800 mb-1">Burn & Runway</div>
                <div className="text-yellow-700">Burn: {diligenceData.financial_validation.burn_rate_analysis.monthly_burn || '—'}</div>
                <div className="text-yellow-700">Runway: {diligenceData.financial_validation.burn_rate_analysis.runway_months ?? '—'} months</div>
                <div className="text-yellow-600 text-xs mt-1">{diligenceData.financial_validation.burn_rate_analysis.runway_assessment || '—'}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      ) : null}

      {/* 📈 MARKET & CLAIM VALIDATION */}
      <Card className="border-purple-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-4 w-4 text-purple-600" />
            MARKET & CLAIM VALIDATION
          </CardTitle>
          <CardDescription className="text-sm">Public data cross-checks for market size and key claims</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Market Benchmarking Header (if available) */}
          {diligenceData?.market_benchmarking && (
            <div className="mb-1">
              <div className="text-sm font-semibold">Market Benchmarking</div>
              <div className="text-xs text-gray-600">Industry comparison and competitive positioning analysis</div>
            </div>
          )}
          {diligenceData?.market_validation?.summary && (
            <div className="text-sm text-gray-700">{safeRender(diligenceData.market_validation.summary)}</div>
          )}

          {/* Benchmarking: industry averages */}
          <div className="border border-purple-200 rounded-lg p-4">
            <div className="text-sm font-semibold mb-2">Metric</div>
            <div className="overflow-hidden border border-purple-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Metric</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Value / Finding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {(diligenceData?.market_benchmarking?.industry_averages?.metrics || []).map((m: any, i: number) => (
                    <tr key={i} className="hover:bg-purple-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{safeRender(m.label) || 'Metric'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{safeRender(m.value)}</td>
                    </tr>
                  ))}
                  {(!diligenceData?.market_benchmarking?.industry_averages?.metrics || diligenceData.market_benchmarking.industry_averages.metrics.length === 0) && (
                    <tr className="hover:bg-purple-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Market Size</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Not Available</td>
                    </tr>
                  )}
                  <tr className="hover:bg-purple-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Status</td>
                    <td className="px-4 py-3 text-sm text-orange-600">{safeRender(diligenceData?.market_benchmarking?.status || 'Default Data Used')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Competitive Landscape */}
          <div className="mb-3">
            <div className="text-sm font-semibold mb-2">Competitive Landscape</div>
            <div className="overflow-hidden border border-purple-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Company</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">{safeRender(diligenceData.market_benchmarking?.metric_labels?.metric1) || 'Failure Rate'}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">{safeRender(diligenceData.market_benchmarking?.metric_labels?.metric2) || 'Processing Fees'}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">AI Powered</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {(diligenceData?.market_benchmarking?.competitive_landscape || []).map((row: any, i: number) => (
                    <tr key={i} className={`hover:bg-purple-50/50 ${row.is_target ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {safeRender(row.company_name)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{safeRender(row.metric1_value)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{safeRender(row.metric2_value)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{safeRender(row.ai_powered)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{safeRender(row.notes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Market Opportunity */}
          <div className="border border-purple-200 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="text-sm font-semibold mb-1">Market Opportunity:</div>
            <div className="text-sm text-gray-700">
              {safeRender(diligenceData?.market_benchmarking?.market_opportunity?.description || 'Market opportunity analysis unavailable. However, AI-powered workforce readiness solutions show growing adoption, with achievable market share potential of 5–10% given strong execution.')}
            </div>
          </div>

          {/* Benchmarking: sources */}
          {Array.isArray(diligenceData?.market_benchmarking?.sources) && diligenceData.market_benchmarking.sources.length > 0 && (
            <div className="text-[11px] text-gray-500">
              <div className="font-semibold mb-1">Sources</div>
              <ul className="list-disc pl-4 space-y-0.5">
                {diligenceData.market_benchmarking.sources.map((s: any, i: number) => (
                  <li key={i}>
                    {typeof s === 'string' ? (
                      <a href={s} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{s}</a>
                    ) : (
                      <span>{JSON.stringify(s)}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Reference Validation */}
      {diligenceData?.customer_references ? (
        <CustomerReferences
          references={diligenceData?.customer_references?.items}
          composite={diligenceData?.customer_references?.composite}
        />
      ) : null}

      {/* 🧮 COMPONENT SCORES */}
      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            COMPONENT SCORES
          </CardTitle>
          <CardDescription className="text-sm">Detailed component-level scoring breakdown</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden border border-blue-200 rounded-lg">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-sky-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Component</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Score (/100)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Status / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Founder Credibility</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-700">{credibilityScore ?? 'N/A'}{credibilityScore ? ' / 100' : ''}</td>
                  <td className="px-4 py-3 text-sm">{safeRender(diligenceData?.founder_credibility_assessment?.validation_status || 'Verified')}</td>
                </tr>
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Memo1 Accuracy</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-700">{diligenceData?.memo1_accuracy_data?.accuracy_score ?? 'N/A'}{diligenceData?.memo1_accuracy_data?.accuracy_score ? ' / 100' : ''}</td>
                  <td className="px-4 py-3 text-sm">Limited verification due to incomplete source document</td>
                </tr>
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Pitch Consistency</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-700">{consistencyScore ?? 'N/A'}{consistencyScore ? ' / 100' : ''}</td>
                  <td className="px-4 py-3 text-sm">Partially validated ({matchPct || consistencyScore || 0}% match in overlapping fields)</td>
                </tr>
                <tr className="hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Overall DD Score</td>
                  <td className="px-4 py-3 text-sm font-bold text-red-600">{overallScore ?? 'N/A'}{overallScore ? ' / 100' : ''}</td>
                  <td className="px-4 py-3 text-sm text-red-600 font-medium">High Risk, {safeRender(diligenceData?.confidence_level || 'Low')} Confidence</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 💡 KEY VALIDATION GAPS */}
      <Card className="border-orange-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-orange-900">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            KEY VALIDATION GAPS
          </CardTitle>
          <CardDescription className="text-sm">Areas requiring additional verification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-2">
            <span className="text-sm font-semibold">Total Gaps Identified: </span>
            <span className="text-lg font-bold text-red-600">{validationGapsCount}</span>
          </div>
          <div className="text-xs text-gray-700 space-y-1">
            <div className="font-semibold mb-2">Major missing or unverifiable items include:</div>
            <ul className="list-disc pl-5 space-y-1">
              {(diligenceData?.founder_credibility_assessment?.missing_information || []).slice(0, 5).map((item: string, i: number) => (
                <li key={i}>{safeRender(item)}</li>
              ))}
              {(diligenceData?.key_findings?.unsubstantiated_claims || []).slice(0, 5).map((item: string, i: number) => (
                <li key={`unsub-${i}`}>{safeRender(item)}</li>
              ))}
              {(diligenceData?.pitch_consistency_check?.data_gaps || []).slice(0, 3).map((item: string, i: number) => (
                <li key={`gap-${i}`}>{safeRender(item)}</li>
              ))}
              {validationGapsCount === 0 && (
                <li>No validation gaps identified</li>
              )}
            </ul>
                </div>
        </CardContent>
      </Card>

      {/* 🔒 FINAL ASSESSMENT & INVESTMENT RECOMMENDATION */}
      <Card className="border-green-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-4 w-4 text-green-600" />
            FINAL ASSESSMENT & INVESTMENT RECOMMENDATION
          </CardTitle>
          <CardDescription className="text-sm">Comprehensive investment evaluation and recommendation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden border border-green-200 rounded-lg">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-green-900">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-green-900">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100">
                <tr className="hover:bg-green-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Overall DD Score</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-700">{overallScore ?? 'N/A'}{overallScore ? ' / 100' : ''}</td>
                </tr>
                <tr className="hover:bg-green-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Confidence Level</td>
                  <td className="px-4 py-3 text-sm font-semibold text-orange-600">{safeRender(diligenceData?.confidence_level || 'Low')}</td>
                </tr>
                <tr className="hover:bg-green-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Risk Level</td>
                  <td className="px-4 py-3 text-sm font-semibold text-red-600">{safeRender(diligenceData?.risk_assessment || 'High')}</td>
                </tr>
                <tr className="hover:bg-green-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Investment Stance</td>
                  <td className="px-4 py-3 text-sm font-bold text-yellow-600">⚠ Proceed with Caution</td>
                </tr>
                <tr className="hover:bg-green-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Primary Recommendation</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{safeRender(recommendation || diligenceData?.executive_summary_text || 'Conduct full, independent background verification of all founders and advisors. Request verified financials, technical whitepaper, and a complete market study before proceeding with investment.')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ✅ PRIORITY ACTIONS */}
      {diligenceData?.priority_actions && diligenceData.priority_actions.length > 0 && (
        <Card className="border-green-100 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              PRIORITY ACTIONS
            </CardTitle>
            <CardDescription className="text-sm">Recommended next steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              {diligenceData.priority_actions.map((action: string, i: number) => (
                <li key={i} className="text-gray-700">{safeRender(action)}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* 📌 FINAL SUMMARY */}
      <Card className="border-blue-100 shadow-sm bg-gradient-to-r from-blue-50 to-sky-50">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-4 w-4 text-blue-600" />
            FINAL SUMMARY
          </CardTitle>
          <CardDescription className="text-sm">Comprehensive due diligence summary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-700 leading-relaxed">
            {safeRender(diligenceData?.executive_summary_text || diligenceData?.executive_summary?.detailed_analysis || 
              `${diligenceData?.executive_summary?.company_name || memo1?.title || 'The company'} addresses a relevant and growing problem. The founding team appears credible, but the diligence reveals significant information gaps, aggressive financial projections, and high execution risk. Without verified data on founder backgrounds, financials, and technical architecture, this opportunity remains high-risk and requires complete revalidation before any investment decision.`)}
          </div>
        </CardContent>
      </Card>

      {/* Interview Transcript Display - Enhanced Section */}
      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-4 w-4 text-blue-600" />
            Interview Transcript & Analysis
          </CardTitle>
          <CardDescription className="text-sm">
            Complete AI-led founder interview transcript, responses, and comprehensive analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {interviewData && interviewData.transcript && interviewData.transcript.length > 0 ? (
            <>
              {/* Interview Metadata */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-gray-700">Interview Status:</span>
                    <Badge variant={interviewData.status === 'completed' ? 'default' : 'secondary'} className="ml-2">
                      {interviewData.status || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Confidence Score:</span>
                    <span className="ml-2 font-bold text-blue-600">
                      {interviewData.summary?.confidenceScore || 'N/A'}/10
                    </span>
                  </div>
                  {interviewData.startedAt && (
                    <div>
                      <span className="font-semibold text-gray-700">Started:</span>
                      <span className="ml-2">
                        {new Date(interviewData.startedAt).toLocaleString('en-GB')}
                      </span>
                    </div>
                  )}
                  {interviewData.completedAt && (
                    <div>
                      <span className="font-semibold text-gray-700">Completed:</span>
                      <span className="ml-2">
                        {new Date(interviewData.completedAt).toLocaleString('en-GB')}
                      </span>
                    </div>
                  )}
                  {interviewData.duration && (
                    <div>
                      <span className="font-semibold text-gray-700">Duration:</span>
                      <span className="ml-2">{Math.round(interviewData.duration / 60)} minutes</span>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-gray-700">Total Questions:</span>
                    <span className="ml-2">
                      {interviewData.questions?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              {interviewData.summary?.executiveSummary && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold text-sm text-gray-800">Executive Summary</h3>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {interviewData.summary.executiveSummary}
                  </p>
                </div>
              )}

              {/* Full Transcript */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Complete Transcript
                </h3>
                <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
                  {interviewData.transcript.map((entry: any, index: number) => {
                    const isFounder = entry.speaker === 'founder';
                    const isAI = entry.speaker === 'ai' || entry.speaker === 'interviewer';
                    
                    return (
                      <div 
                        key={index} 
                        className={`rounded-lg p-3 ${
                          isFounder 
                            ? 'bg-white border-l-4 border-blue-500 shadow-sm' 
                            : 'bg-blue-50 border-l-4 border-indigo-500'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {isFounder ? (
                              <User className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Cpu className="h-4 w-4 text-indigo-600" />
                            )}
                            <span className={`font-semibold text-xs ${
                              isFounder ? 'text-blue-700' : 'text-indigo-700'
                            }`}>
                              {isFounder ? 'Founder Response' : 'AI Interviewer'}
                              {entry.questionNumber !== undefined && ` - Question ${entry.questionNumber}`}
                            </span>
                          </div>
                          {entry.timestamp && (
                            <span className="text-xs text-gray-500">
                              {new Date(entry.timestamp).toLocaleTimeString('en-GB', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                        {/* Display question text if available */}
                        {entry.questionNumber !== undefined && 
                         interviewData.questions?.[entry.questionNumber]?.question && (
                          <div className="mb-2 pb-2 border-b border-gray-200">
                            <p className="font-semibold text-indigo-700 text-sm leading-relaxed">
                              Question {interviewData.questions[entry.questionNumber].questionNumber}: {interviewData.questions[entry.questionNumber].question}
                            </p>
                          </div>
                        )}
                        <div className={`text-sm leading-relaxed ${
                          isFounder ? 'text-gray-800' : 'text-gray-700'
                        }`}>
                          {entry.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key Insights */}
              {interviewData.summary?.keyInsights && interviewData.summary.keyInsights.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <h3 className="font-semibold text-sm text-gray-800">Key Insights</h3>
                  </div>
                  <ul className="space-y-2">
                    {interviewData.summary.keyInsights.map((insight: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Validation Points */}
              {interviewData.summary?.validationPoints && interviewData.summary.validationPoints.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-4 w-4 text-amber-600" />
                    <h3 className="font-semibold text-sm text-gray-800">Validation Points</h3>
                  </div>
                  <ul className="space-y-2">
                    {interviewData.summary.validationPoints.map((point: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-xs">
                        <span className="text-amber-600 mt-0.5">✓</span>
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Red Flags */}
              {interviewData.summary?.redFlags && interviewData.summary.redFlags.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <h3 className="font-semibold text-sm text-gray-800">Red Flags Identified</h3>
                  </div>
                  <ul className="space-y-2">
                    {interviewData.summary.redFlags.map((flag: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-xs">
                        <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {interviewData.summary?.recommendations && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-purple-600" />
                    <h3 className="font-semibold text-sm text-gray-800">Recommendations</h3>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {interviewData.summary.recommendations}
                  </p>
                </div>
              )}
            </>
          ) : interviewData ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-gray-700 font-medium">
                Interview is in progress or transcript is not yet available
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Status: {interviewData.status || 'Unknown'}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <FileText className="h-5 w-5 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No interview data available. Schedule an interview to begin the due diligence process.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}