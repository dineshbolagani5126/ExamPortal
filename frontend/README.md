# Exam Portal Frontend

React-based frontend for the Exam Portal application.

## Installation

```bash
npm install
```

## Running the Application

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Features

- Modern, responsive UI with Tailwind CSS
- Role-based dashboards (Student, Faculty, Admin)
- Real-time exam interface with timer
- Interactive charts and analytics
- Toast notifications
- Protected routes with authentication
- Auto-save functionality
- Mobile-friendly design

## Tech Stack

- React 18
- React Router v6
- Axios for API calls
- Tailwind CSS for styling
- React Icons
- React Toastify for notifications
- Recharts for data visualization
- Date-fns for date handling
- Vite as build tool

## Project Structure

```
src/
├── components/       # Reusable components
├── context/         # React context (Auth)
├── pages/           # Page components
│   ├── auth/       # Authentication pages
│   ├── student/    # Student pages
│   ├── faculty/    # Faculty pages
│   ├── admin/      # Admin pages
│   └── common/     # Common pages
├── utils/          # Utility functions
├── App.jsx         # Main app component
├── main.jsx        # Entry point
└── index.css       # Global styles
```

## Available Routes

### Public Routes
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Forgot password
- `/reset-password/:token` - Reset password

### Student Routes
- `/student` - Dashboard
- `/student/exams` - Exam list
- `/student/exam/:examId` - Take exam
- `/student/results` - View results
- `/student/profile` - Profile settings
- `/student/notifications` - Notifications

### Faculty Routes
- `/faculty` - Dashboard
- `/faculty/exams` - Manage exams
- `/faculty/exams/create` - Create exam
- `/faculty/questions` - Question bank
- `/faculty/evaluate` - Evaluate submissions
- `/faculty/notifications` - Notifications

### Admin Routes
- `/admin` - Dashboard
- `/admin/users` - Manage users
- `/admin/exams` - Manage exams
- `/admin/questions` - Question bank
- `/admin/analytics` - System analytics
- `/admin/notifications` - Notifications

## Environment

The frontend connects to the backend API at `http://localhost:5000/api` by default (configured in vite.config.js proxy).

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Customization

### Tailwind Configuration
Edit `tailwind.config.js` to customize colors, fonts, and other design tokens.

### API Base URL
Update the proxy configuration in `vite.config.js` for different environments.
