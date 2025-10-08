export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Instructor {
  id: string;
  name: string;
  jobTitle: string;
  description: string;
  rate: number;
  image?: string;
}

export interface Course {
  id: string;
  name: string;
  instructor: Instructor;
  category: string;
  level: string;
  totalHours: number;
  lecturesCount: number;
  price: number;
  rating: number;
  image?: string;
  description: string;
  certification: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}