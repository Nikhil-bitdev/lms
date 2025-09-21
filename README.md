# Learning Management System (LMS)

A full-stack Learning Management System built with React and Node.js.

## Features

- 🎓 Course Management
- 📝 Assignment System
- 🧪 Quiz Creation & Taking
- 📊 Analytics Dashboard
- 👥 User Authentication (Students & Instructors)
- 🌙 Dark Mode Support
- 📱 Responsive Design

## Tech Stack

### Frontend
- React 19.1.1
- Vite 7.1.6
- Tailwind CSS 3.x
- Formik + Yup (Forms & Validation)
- React Hot Toast (Notifications)
- Chart.js (Analytics)

### Backend
- Node.js + Express
- SQLite + Sequelize ORM
- JWT Authentication
- Bcrypt (Password Hashing)
- Multer (File Uploads)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd lms
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   
   # Install server dependencies
   cd ../server && npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   DB_HOST=127.0.0.1
   DB_NAME=lms_db
   DB_USER=lms_user
   DB_PASSWORD=your_password
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

4. **Run the application**
   ```bash
   # From the root directory, run both client and server
   npm run dev
   ```

   Or run them separately:
   ```bash
   # Terminal 1 - Server
   npm run dev:server
   
   # Terminal 2 - Client
   npm run dev:client
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Project Structure

```
lms/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── services/
│   └── package.json
├── server/          # Node.js backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   └── package.json
└── package.json     # Root package for scripts
```

## Available Scripts

- `npm run dev` - Run both client and server
- `npm run dev:client` - Run only the frontend
- `npm run dev:server` - Run only the backend

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.