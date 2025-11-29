import { Book, Subject, YearData } from './types';

// Helper function to generate PDF path
const getPaperPath = (year: number, subject: Subject, paperNum: number): string => {
  const subjectFolder = subject.toLowerCase();
  return `/papers/${year}/${subjectFolder}/paper-${paperNum}.pdf`;
};

// Generate years from 1985 to 2025
export const YEARS: YearData[] = Array.from({ length: 2025 - 1985 + 1 }, (_, i) => {
  const year = 2025 - i;
  return {
    year,
    papers: {
      [Subject.PHYSICS]: [
        { id: `p-${year}-1`, title: `${year} Physics Paper I`, url: getPaperPath(year, Subject.PHYSICS, 1) },
        { id: `p-${year}-2`, title: `${year} Physics Paper II`, url: getPaperPath(year, Subject.PHYSICS, 2) },
      ],
      [Subject.CHEMISTRY]: [
        { id: `c-${year}-1`, title: `${year} Chemistry Paper I`, url: getPaperPath(year, Subject.CHEMISTRY, 1) },
        { id: `c-${year}-2`, title: `${year} Chemistry Paper II`, url: getPaperPath(year, Subject.CHEMISTRY, 2) },
      ],
      [Subject.MATH]: [
        { id: `m-${year}-1`, title: `${year} Mathematics Paper I`, url: getPaperPath(year, Subject.MATH, 1) },
        { id: `m-${year}-2`, title: `${year} Mathematics Paper II`, url: getPaperPath(year, Subject.MATH, 2) },
      ],
    }
  };
});

export const BOOKS: Book[] = [
  {
    id: 'b1',
    title: 'Concepts of Physics',
    author: 'H.C. Verma',
    subject: Subject.PHYSICS,
    coverUrl: 'https://picsum.photos/id/24/300/400',
    downloadUrl: '#'
  },
  {
    id: 'b2',
    title: 'Problems in General Physics',
    author: 'I.E. Irodov',
    subject: Subject.PHYSICS,
    coverUrl: 'https://picsum.photos/id/25/300/400',
    downloadUrl: '#'
  },
  {
    id: 'b3',
    title: 'Organic Chemistry',
    author: 'Morrison & Boyd',
    subject: Subject.CHEMISTRY,
    coverUrl: 'https://picsum.photos/id/30/300/400',
    downloadUrl: '#'
  },
  {
    id: 'b4',
    title: 'Physical Chemistry',
    author: 'P. Bahadur',
    subject: Subject.CHEMISTRY,
    coverUrl: 'https://picsum.photos/id/42/300/400',
    downloadUrl: '#'
  },
  {
    id: 'b5',
    title: 'Calculus for IIT-JEE',
    author: 'Amit M. Agarwal',
    subject: Subject.MATH,
    coverUrl: 'https://picsum.photos/id/20/300/400',
    downloadUrl: '#'
  },
  {
    id: 'b6',
    title: 'Higher Algebra',
    author: 'Hall & Knight',
    subject: Subject.MATH,
    coverUrl: 'https://picsum.photos/id/21/300/400',
    downloadUrl: '#'
  },
  {
    id: 'b7',
    title: 'Fundamentals of Physics',
    author: 'Resnick & Halliday',
    subject: Subject.PHYSICS,
    coverUrl: 'https://picsum.photos/id/35/300/400',
    downloadUrl: '#'
  },
  {
    id: 'b8',
    title: 'Coordinate Geometry',
    author: 'S.L. Loney',
    subject: Subject.MATH,
    coverUrl: 'https://picsum.photos/id/36/300/400',
    downloadUrl: '#'
  },
  {
    id: 'b9',
    title: 'Inorganic Chemistry',
    author: 'J.D. Lee',
    subject: Subject.CHEMISTRY,
    coverUrl: 'https://picsum.photos/id/48/300/400',
    downloadUrl: '#'
  },
];