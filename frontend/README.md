
# Complaint Management System Frontend

This project is a Vite + React + TailwindCSS frontend for a Complaint Management System. It supports three roles (user, subadmin, admin) with dashboards, reusable components, JWT authentication, push notifications, and form validation.

## Features
- Role-based dashboards and route protection
- Complaint and task management
- User, department, and subadmin management (admin)
- Push notifications
- Pagination, severity badges, and filtering
- Form validation with Joi/yup

## Getting Started
1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`

## Directory Structure
- `/src/components` – Reusable UI components
- `/src/pages/Auth/Login.jsx` – Login page
- `/src/pages/User/ComplaintForm.jsx`, `ComplaintList.jsx` – User dashboard
- `/src/pages/Subadmin/TaskForm.jsx`, `ComplaintView.jsx` – Subadmin dashboard
- `/src/pages/Admin/Dashboard.jsx`, `UserList.jsx` – Admin dashboard
- `/src/services/api.js` – Axios API service
- `/src/context/AuthContext.jsx` – Auth context
- `/src/utils/tokenStorage.js` – JWT storage helpers

## TailwindCSS
Tailwind is installed and configured. Add your styles in `src/index.css`.

## API
Configure API endpoints in `/src/services/api.js`.

## Auth
Use React context and JWT from localStorage for authentication.

## Push Notifications
Service worker registration is required for web push notifications.

## License
MIT
