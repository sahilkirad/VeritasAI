"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface ValidationFinding {
  category: string;
  finding: string;
  confidence: number;
  evidence: string[];
  recommendation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ValidationReportData {
  founder_profile_validation: {
    findings: ValidationFinding[];
    overall_score: number;
    summary: string;
  };
  pitch_consistency_validation: {
    findings: ValidationFinding[];
    overall_score: number;
    summary: string;
  };
  memo1_accuracy_validation: {
    findings: ValidationFinding[];
    overall_score: number;
    summary: string;
  };
  synthesis: {
    overall_risk_score: number;
    key_concerns: string[];
    strengths: string[];
    recommendations: string[];
    final_assessment: string;
  };
}

interface ValidationReportProps {
  data: ValidationReportData;
  companyName: string;
  isLoading?: boolean;
}

const ValidationReport: React.FC<ValidationReportProps> = ({ 
  data, 
  companyName, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Loading Validation Report...</CardTitle>
          <CardDescription>Analyzing diligence data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderFindings = (findings: ValidationFinding[]) => {
    if (!findings || findings.length === 0) {
      return (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            No significant issues found in this validation category.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {findings.map((finding, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(finding.severity)}
                  <span className="font-medium">{finding.category}</span>
                </div>
                <Badge className={getSeverityColor(finding.severity)}>
                  {finding.severity.toUpperCase()}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">{finding.finding}</p>
              
              {finding.evidence && finding.evidence.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Evidence:</h4>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    {finding.evidence.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {finding.recommendation && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Recommendation:</h4>
                  <p className="text-sm text-blue-700">{finding.recommendation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Overall Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Overall Diligence Assessment
          </CardTitle>
          <CardDescription>
            Comprehensive analysis for {companyName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(data.synthesis.overall_risk_score)}`}>
                {data.synthesis.overall_risk_score}%
              </div>
              <div className="text-sm text-gray-600">Risk Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.synthesis.strengths.length}
              </div>
              <div className="text-sm text-gray-600">Strengths</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {data.synthesis.key_concerns.length}
              </div>
              <div className="text-sm text-gray-600">Concerns</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Final Assessment</h3>
              <p className="text-gray-700">{data.synthesis.final_assessment}</p>
            </div>
            
            {data.synthesis.strengths.length > 0 && (
              <div>
                <h3 className="font-medium text-green-800 mb-2">Key Strengths</h3>
                <ul className="list-disc list-inside text-green-700 space-y-1">
                  {data.synthesis.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {data.synthesis.key_concerns.length > 0 && (
              <div>
                <h3 className="font-medium text-red-800 mb-2">Key Concerns</h3>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  {data.synthesis.key_concerns.map((concern, index) => (
                    <li key={index}>{concern}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Validation Tabs */}
      <Tabs defaultValue="founder" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="founder">Founder Profile</TabsTrigger>
          <TabsTrigger value="pitch">Pitch Consistency</TabsTrigger>
          <TabsTrigger value="memo">Memo1 Accuracy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="founder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Founder Profile Validation
                <span className={`text-lg font-bold ${getScoreColor(data.founder_profile_validation.overall_score)}`}>
                  {data.founder_profile_validation.overall_score}%
                </span>
              </CardTitle>
              <CardDescription>
                {data.founder_profile_validation.summary}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderFindings(data.founder_profile_validation.findings)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pitch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Pitch Consistency Validation
                <span className={`text-lg font-bold ${getScoreColor(data.pitch_consistency_validation.overall_score)}`}>
                  {data.pitch_consistency_validation.overall_score}%
                </span>
              </CardTitle>
              <CardDescription>
                {data.pitch_consistency_validation.summary}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderFindings(data.pitch_consistency_validation.findings)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="memo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Memo1 Accuracy Validation
                <span className={`text-lg font-bold ${getScoreColor(data.memo1_accuracy_validation.overall_score)}`}>
                  {data.memo1_accuracy_validation.overall_score}%
                </span>
              </CardTitle>
              <CardDescription>
                {data.memo1_accuracy_validation.summary}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderFindings(data.memo1_accuracy_validation.findings)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      {data.synthesis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Actionable next steps based on the diligence analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.synthesis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-md">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-blue-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ValidationReport;
