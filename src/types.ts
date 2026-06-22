export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  category: string;
  coverColor: string; // Tailwinds class or hex for luxury look
  status: 'reading' | 'completed' | 'want-to-read';
  rating?: number;
  notes?: string;
  startDate?: string;
  lastReadDate?: string;
}

export interface PathStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  bookId?: string; // Optional linked book
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: PathStep[];
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  estimatedHours: number;
}

export interface Category {
  id: string;
  name: string;
  iconName: string; // Lucide icon identifier
  description: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}
