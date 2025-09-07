// Shared TypeScript interfaces for the AI Fashion Studio application

export interface PredefinedModel {
  id: string;       // Firestore Document ID
  gender: 'male' | 'female';
  name: string;     // e.g., "Bella" or "Model F-01"
  tags: string[];   // e.g., ["5'11\"", "Athletic", "Caucasian"]
  imageUrl: string; // Public URL from Firebase Storage
}

// Additional types can be added here as the application grows
export interface GenerationRecord {
  id: string;
  userId: string;
  modelImageUrl: string;
  garmentImageUrl: string;
  outputImageUrl: string;
  createdAt: Date;
  method: string;
}

export interface UserData {
  name: string;
  email: string;
  phone: string;
  remainingGenerations: number;
  createdAt: Date;
  lastLoginAt: Date;
  totalGenerations: number;
  accountStatus: string;
}
