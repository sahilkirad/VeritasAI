'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface VerificationPoint {
  label: string;
  status: string; // ✅ / ⚠️ / ❌
  details?: string;
}

interface FounderVerification {
  name: string;
  claimed_background?: string;
  linkedin_url?: string;
  credibility_impact?: string;
  points?: VerificationPoint[];
}

interface LinkedInVerificationProps {
  founders?: FounderVerification[];
  overallVerifiedPercent?: number;
}

export default function LinkedInVerification({ founders = [], overallVerifiedPercent }: LinkedInVerificationProps) {
  const hasData = founders && founders.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Background Verification (LinkedIn + Public Records)</CardTitle>
        <CardDescription className="text-xs">Verification of education, work history, patents, recommendations and current role</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasData ? (
          <div className="space-y-3">
            {founders.map((f, idx) => (
              <div key={idx} className="border rounded p-2 bg-gray-50">
                <div className="text-sm font-semibold">Founder: {f.name}</div>
                {f.claimed_background && (
                  <div className="text-xs text-gray-700 mt-1"><strong>Claimed Background:</strong> {f.claimed_background}</div>
                )}
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-2 py-1 text-left font-semibold">Verification Point</th>
                        <th className="px-2 py-1 text-left font-semibold">Status</th>
                        <th className="px-2 py-1 text-left font-semibold">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(f.points || []).map((p, i) => (
                        <tr key={i}>
                          <td className="px-2 py-1 font-medium">{p.label}</td>
                          <td className="px-2 py-1">{p.status}</td>
                          <td className="px-2 py-1 text-gray-600">{p.details || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  {f.linkedin_url && (
                    <a href={f.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn Profile</a>
                  )}
                  {f.credibility_impact && (
                    <div className="text-gray-700"><strong>Credibility Impact:</strong> {f.credibility_impact}</div>
                  )}
                </div>
              </div>
            ))}
            {overallVerifiedPercent !== undefined && (
              <div className="bg-green-50 border border-green-200 rounded p-2 text-xs">
                <span className="font-semibold">Overall Team Verification:</span> {overallVerifiedPercent}% Verified
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">LinkedIn verification data not available yet. Showing placeholder until backend enrichment completes.</div>
        )}
      </CardContent>
    </Card>
  );
}


