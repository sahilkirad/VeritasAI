'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface QAItem {
  question: string;
  answer: string;
}

interface ReferenceCall {
  customer_name: string;
  industry?: string;
  reference_contact?: { name?: string; title?: string; department?: string };
  interview_date?: string;
  duration_minutes?: number;
  questions_and_answers?: QAItem[];
  nps_score?: number;
  renewal_likelihood?: string;
  key_benefits?: string[];
  minor_issues?: string[];
  overall_assessment?: string;
}

interface CustomerReferencesProps {
  references?: ReferenceCall[];
  composite?: { average_nps?: number; churn_risk?: string; expansion_likelihood?: string; testimonial_quality?: string; overall?: string; };
}

export default function CustomerReferences({ references = [], composite }: CustomerReferencesProps) {
  const hasRefs = references && references.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Customer Reference Validation</CardTitle>
        <CardDescription className="text-xs">Summaries of customer calls and validation metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasRefs ? (
          <div className="space-y-3">
            {references.map((ref, idx) => (
              <div key={idx} className="border rounded p-2 bg-gray-50">
                <div className="text-sm font-semibold">Customer #{idx + 1}: {ref.customer_name}</div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                  <div><strong>Industry:</strong> {ref.industry || '-'}</div>
                  <div><strong>Date:</strong> {ref.interview_date || '-'}</div>
                  <div><strong>Duration:</strong> {ref.duration_minutes ? `${ref.duration_minutes} min` : '-'}</div>
                  <div><strong>Contact:</strong> {ref.reference_contact?.name ? `${ref.reference_contact.name}, ${ref.reference_contact.title || ''}` : '-'}</div>
                </div>
                {ref.questions_and_answers && ref.questions_and_answers.length > 0 && (
                  <div className="mt-2 text-xs">
                    <div className="font-medium mb-1">Key Q&A</div>
                    <ul className="space-y-1">
                      {ref.questions_and_answers.slice(0, 4).map((qa, qidx) => (
                        <li key={qidx}>
                          <div><strong>Q:</strong> {qa.question}</div>
                          <div className="text-gray-700"><strong>A:</strong> {qa.answer}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                  <div><strong>NPS:</strong> {ref.nps_score ?? '-'}</div>
                  <div><strong>Renewal:</strong> {ref.renewal_likelihood || '-'}</div>
                  <div><strong>Assessment:</strong> {ref.overall_assessment || '-'}</div>
                </div>
                {(ref.key_benefits || ref.minor_issues) && (
                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    <div>
                      <div className="font-medium">Key Benefits</div>
                      <ul className="list-disc list-inside">
                        {(ref.key_benefits || []).map((b, i) => (<li key={i}>{b}</li>))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium">Minor Issues</div>
                      <ul className="list-disc list-inside">
                        {(ref.minor_issues || []).map((m, i) => (<li key={i}>{m}</li>))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {composite && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                <div className="font-semibold mb-1">Reference Call Composite Score</div>
                <div className="grid grid-cols-4 gap-2">
                  <div><strong>Avg NPS:</strong> {composite.average_nps ?? '-'}</div>
                  <div><strong>Churn Risk:</strong> {composite.churn_risk || '-'}</div>
                  <div><strong>Expansion:</strong> {composite.expansion_likelihood || '-'}</div>
                  <div><strong>Testimonial:</strong> {composite.testimonial_quality || '-'}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">Customer references not available yet. Placeholder will be replaced when backend provides data.</div>
        )}
      </CardContent>
    </Card>
  );
}


