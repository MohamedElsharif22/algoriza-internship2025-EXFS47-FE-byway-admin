# 🎓 Byway Admin Dashboard

Welcome to the Byway Admin Dashboard - a powerful React-based administration panel for managing online courses, instructors, and educational content.

![Byway Admin](src/assets/logo.png)

## ✨ Features

### 🔐 Authentication

- Secure login system with JWT token management
- Google OAuth integration for quick access
- Role-based access control (Admin only)
- Protected routes and unauthorized access handling

### 📊 Dashboard

- Real-time statistics and analytics
- Overview of courses, instructors, and system metrics
- Interactive charts and data visualization
- Quick access to key functionalities

### 📚 Course Management

- Create, edit, and delete courses
- Rich text editor for course descriptions
- Course content organization with multiple sections
- Course level management (Beginner/Intermediate/Advanced)
- Course pricing and category assignment
- Media upload support for course covers

### 👨‍🏫 Instructor Management

- Comprehensive instructor profiles
- Profile picture management
- View and edit instructor details
- Track instructor courses and ratings
- Performance metrics and statistics

### 🎯 Features

- Responsive design for all screen sizes
- Modern and intuitive UI with Tailwind CSS
- Real-time form validation
- Loading indicators for better UX
- Toast notifications for user feedback
- Error handling and validation
- Pagination for large data sets

## 🛠 Technologies

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Jotai
- **Styling**: TailwindCSS
- **Form Handling**: Formik + Yup
- **HTTP Client**: Axios
- **UI Components**:
  - HeadlessUI for modals and dropdowns
  - React Quill for rich text editing
  - Heroicons for icons
  - Recharts for data visualization
- **Authentication**: JWT + Google OAuth
- **Type Checking**: TypeScript
- **Code Quality**: ESLint

## 📥 Installation

1. Clone the repository:

```bash
git clone https://github.com/MohamedElsharif22/algoriza-internship2025-EXFS47-FE-byway-admin.git
cd algoriza-internship2025-EXFS47-FE-byway-admin
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
VITE_API_URL=your_api_url
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Start the development server:

```bash
npm run dev
```

## 🚀 Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build
- `npm run typecheck`: Run TypeScript type checking

## 📁 Project Structure

```
src/
├── assets/        # Static assets (images, icons)
├── components/    # Reusable UI components
│   ├── auth/     # Authentication components
│   ├── layout/   # Layout components
│   └── ui/       # UI components
├── pages/        # Page components
├── services/     # API services
├── store/        # State management
├── types/        # TypeScript types
└── utils/        # Utility functions
```

## 🔑 Environment Variables

| Variable              | Description            |
| --------------------- | ---------------------- |
| VITE_API_URL          | Backend API URL        |
| VITE_GOOGLE_CLIENT_ID | Google OAuth Client ID |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is part of the Algoriza Internship Program.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [HeadlessUI](https://headlessui.dev/)
