export enum Sender {
  USER = 'user',
  AI = 'ai'
}

export interface SimilarProblem {
  title: string;
  source: string; // e.g., "AMC 12 2015"
  problemText: string;
  similarityLogic: string; // Explains the shared concept/theorem
  difficulty: string;
}

export interface MathSolution {
  originalProblemOCR?: string;
  stepByStepSolution: string; // User's problem solution
  finalAnswer: string;
  similarProblems: SimilarProblem[];
}

export interface VerificationResult {
  isCorrect: boolean;
  feedback: string;
  correctSolution: string;
}

export interface Message {
  id: string;
  sender: Sender;
  text?: string;
  image?: string; // base64
  solution?: MathSolution;
  isThinking?: boolean;
}

export interface AppState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}