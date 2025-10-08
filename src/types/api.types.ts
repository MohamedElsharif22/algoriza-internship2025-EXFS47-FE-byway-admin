// Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}

// Course Types
export interface Course {
  id: number;
  title: string;
  description: string;
  rating: number;
  price: number;
  // API uses coverPictureUrl
  coverPicture?: string;
  coverPictureUrl?: string;
  lecturesCount?: number;
  durationInMinutes?: number;
  durationInHours?: number;
  instructorId?: number;
  instructorName?: string;
  categoryId?: number;
  categoryName?: string;
  courseLevel?: number;
  contents?: CourseContent[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseContent {
  id: number;
  name: string;
  lecturesCount: number;
  durationInHours: number;
}

export interface CourseFilters {
  pageSize?: number;
  pageIndex?: number;
  categories?: number[];
  instructorId?: number;
  search?: string;
  sort?: 1 | 2 | 3 | 4 | 5 | 6; // 1=PriceAsc, 2=PriceDesc, 3=RatingAsc, 4=RatingDesc, 5=Newest, 6=Oldest
  priceRange?: {
    min: number;
    max: number;
  };
  rangeOfLectures?: {
    min: number;
    max: number;
  };
}

export interface Category {
  id: number;
  name: string;
}

// Instructor Types
export interface Instructor {
  id: number;
  name: string;
  jobTitle: string;
  about: string;
  profilePicture: string;
  rating: number;
}

// New Instructor Response Type
export interface InstructorResponse {
  id: number;
  name: string;
  jopTitle: string;
  about: string;
  profilePictureUrl: string;
  coursesCount: number;
  totalLectures: number;
  averageRating: number;
  studentsCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface InstructorsListResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: InstructorResponse[];
}

export interface InstructorFilters {
  pageSize?: number;
  pageIndex?: number;
  search?: string;
}

export interface JobTitle {
  id: number;
  title: string;
  value?: number;
}

// Cart Types
export interface CartItem {
  courseId: number;
  course?: Course;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}

// Checkout Types
export interface CheckoutSummary {
  subtotal: number;
  total: number;
  items: CartItem[];
}

export interface CheckoutRequest {
  paymentMethod: string;
  paymentToken: string;
}

export interface Enrollment {
  courseId: number;
  enrollmentDate: string;
  course: Course;
}