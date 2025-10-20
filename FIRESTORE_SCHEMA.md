# Firestore Schema Documentation

## Collections Overview

### 1. founderProfiles Collection

**Purpose**: Stores founder profile data submitted through the founder profile form.

**Document Structure**:
```typescript
{
  id: string; // Auto-generated document ID
  email: string; // Founder's email (used for lookup)
  fullName: string;
  linkedinUrl: string;
  professionalBackground: string;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  previousCompanies: Array<{
    company: string;
    role: string;
    duration: string;
  }>;
  yearsOfExperience: number;
  teamSize: string;
  expertise: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes Required**:
- `email` (single field index for lookups)

### 2. diligenceReports Collection

**Purpose**: Tracks diligence analysis status and stores results.

**Document Structure**:
```typescript
{
  id: string; // Company ID or custom identifier
  companyId: string; // Reference to company being analyzed
  companyName: string; // Display name for UI
  investorEmail: string; // Who requested the analysis
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100 percentage
  currentStep: string; // Human-readable current step
  steps: Array<{
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    description: string;
  }>;
  results?: {
    founder_profile_validation: {
      findings: Array<{
        category: string;
        finding: string;
        confidence: number;
        evidence: string[];
        recommendation: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
      }>;
      overall_score: number;
      summary: string;
    };
    pitch_consistency_validation: {
      findings: Array<{
        category: string;
        finding: string;
        confidence: number;
        evidence: string[];
        recommendation: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
      }>;
      overall_score: number;
      summary: string;
    };
    memo1_accuracy_validation: {
      findings: Array<{
        category: string;
        finding: string;
        confidence: number;
        evidence: string[];
        recommendation: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
      }>;
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
  };
  error?: string; // Error message if status is 'failed'
  startedAt: Timestamp;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes Required**:
- `companyId` (single field index)
- `investorEmail` (single field index)
- `status` (single field index)
- `createdAt` (single field index for sorting)

### 3. companyVectorData Collection

**Purpose**: Backup storage for company data when Vector Search is not available.

**Document Structure**:
```typescript
{
  id: string; // Company ID
  company_id: string;
  memo1: object; // Memo1 data from intake agent
  founder_profile: object; // Founder profile data
  pitch_deck_text: string; // Extracted pitch deck text
  created_at: Timestamp;
  vector_search_available: boolean;
}
```

**Indexes Required**:
- `company_id` (single field index)

### 4. ingestionResults Collection

**Purpose**: Stores results from the intake curation agent.

**Document Structure**:
```typescript
{
  id: string; // Auto-generated document ID
  timestamp: string; // ISO timestamp
  processing_time_seconds: number;
  memo_1: object; // Generated memo1 data
  original_filename: string;
  status: 'SUCCESS' | 'FAILED';
  error?: string; // If status is FAILED
  embeddings_stored?: boolean; // Whether embeddings were stored
  company_id?: string; // Company identifier
}
```

**Indexes Required**:
- `status` (single field index)
- `timestamp` (single field index for sorting)

### 5. uploads Collection

**Purpose**: Tracks file uploads and their processing status.

**Document Structure**:
```typescript
{
  id: string; // Auto-generated document ID
  fileName: string; // Storage blob name
  originalName: string; // Original filename
  downloadURL: string; // Public download URL
  contentType: string; // MIME type
  size: number; // File size in bytes
  type: 'pdf' | 'video' | 'audio';
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  uploadedAt: Timestamp;
  uploadedBy: string; // User identifier
  founderEmail: string; // Founder's email
  processing_started_at?: Timestamp;
  message_id?: string; // Pub/Sub message ID
}
```

**Indexes Required**:
- `founderEmail` (single field index)
- `status` (single field index)
- `uploadedAt` (single field index for sorting)

## Security Rules

The current Firestore rules allow read/write access to all authenticated users until October 2025. For production, consider implementing more restrictive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /founderProfiles/{document} {
      allow read, write: if request.auth != null && 
        resource.data.email == request.auth.token.email;
    }
    
    // Allow authenticated users to read diligence reports they created
    match /diligenceReports/{document} {
      allow read, write: if request.auth != null && 
        resource.data.investorEmail == request.auth.token.email;
    }
    
    // Allow authenticated users to read their own uploads
    match /uploads/{document} {
      allow read, write: if request.auth != null && 
        resource.data.uploadedBy == request.auth.uid;
    }
  }
}
```

## Usage Examples

### Creating a Founder Profile
```typescript
const profileData = {
  email: 'founder@example.com',
  fullName: 'John Doe',
  linkedinUrl: 'https://linkedin.com/in/johndoe',
  professionalBackground: 'Software engineer with 10 years experience',
  education: [
    {
      degree: 'Bachelor of Computer Science',
      institution: 'Stanford University',
      year: '2014'
    }
  ],
  previousCompanies: [
    {
      company: 'Google',
      role: 'Senior Software Engineer',
      duration: '2014-2020'
    }
  ],
  yearsOfExperience: 10,
  teamSize: '5-10',
  expertise: ['JavaScript', 'Python', 'Machine Learning'],
  createdAt: firestore.Timestamp.now(),
  updatedAt: firestore.Timestamp.now()
};

await db.collection('founderProfiles').add(profileData);
```

### Creating a Diligence Report
```typescript
const diligenceReport = {
  companyId: 'company_123',
  companyName: 'TechCorp Inc',
  investorEmail: 'investor@example.com',
  status: 'pending',
  progress: 0,
  currentStep: 'Initializing diligence process...',
  steps: [
    {
      name: 'Data Collection',
      status: 'pending',
      description: 'Gathering founder profile, pitch deck, and memo1 data'
    }
    // ... more steps
  ],
  startedAt: firestore.Timestamp.now(),
  createdAt: firestore.Timestamp.now(),
  updatedAt: firestore.Timestamp.now()
};

await db.collection('diligenceReports').doc('company_123').set(diligenceReport);
```

### Updating Diligence Progress
```typescript
await db.collection('diligenceReports').doc(companyId).update({
  status: 'running',
  progress: 50,
  currentStep: 'Validating founder profile...',
  'steps.0.status': 'completed',
  'steps.1.status': 'running',
  updatedAt: firestore.Timestamp.now()
});
```

## Best Practices

1. **Use Timestamps**: Always include `createdAt` and `updatedAt` timestamps for audit trails.

2. **Index Planning**: Create composite indexes for common query patterns:
   - `investorEmail` + `status` + `createdAt` for investor's diligence history
   - `companyId` + `status` for company-specific reports

3. **Data Validation**: Implement client-side validation before writing to Firestore.

4. **Error Handling**: Always handle Firestore errors gracefully and provide user feedback.

5. **Real-time Updates**: Use Firestore listeners for real-time UI updates, especially for diligence progress.

6. **Data Cleanup**: Implement cleanup jobs for old or failed diligence reports to manage storage costs.
