export enum Subject {
  PHYSICS = 'Physics',
  CHEMISTRY = 'Chemistry',
  MATH = 'Mathematics'
}

export interface Paper {
  id: string;
  title: string;
  url: string; // Mock URL
}

export interface YearData {
  year: number;
  papers: {
    [key in Subject]?: Paper[];
  };
}

export interface Book {
  id: string;
  title: string;
  author: string;
  subject: Subject;
  coverUrl: string;
  downloadUrl: string;
}

export type View = 'papers' | 'books';