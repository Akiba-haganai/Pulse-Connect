import type { Profile } from '../../../types/profile';

export interface CompletionMetrics {
  percentage: number;
  missingFields: string[];
  nextActionSuggestion: string;
}

export function calculateProfileCompletion(profile: Profile | null): CompletionMetrics {
  if (!profile) return { percentage: 0, missingFields: ['all'], nextActionSuggestion: 'Initialize account profile node.' };

  const evaluationMatrix = [
    { field: 'full_name', weight: 25, label: 'Full Name' },
    { field: 'username', weight: 25, label: 'Unique Username' },
    { field: 'avatar_url', weight: 25, label: 'Profile Picture' },
    { field: 'bio', weight: 25, label: 'Academic Bio' },
  ];

  let currentScore = 0;
  const missingFields: string[] = [];

  evaluationMatrix.forEach(({ field, weight, label }) => {
    const value = profile[field as keyof Profile];
    if (value && String(value).trim().length > 0) {
      currentScore += weight;
    } else {
      missingFields.push(label);
    }
  });

  let suggestion = 'Your academic profile is fully optimized!';
  if (missingFields.includes('Academic Bio')) suggestion = 'Add an academic bio to share your current research or field of study.';
  if (missingFields.includes('Profile Picture')) suggestion = 'Upload an avatar picture node to personalize your profile presence.';
  if (missingFields.includes('Unique Username')) suggestion = 'Configure a custom @username handle for direct indexing.';
  if (missingFields.includes('Full Name')) suggestion = 'Provide your full real name to register verified identity credentials.';

  return {
    percentage: currentScore,
    missingFields,
    nextActionSuggestion: suggestion
  };
}