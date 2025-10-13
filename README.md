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
   Copy `.env.example` at repo root to `.env` (root). Minimum variables:
   ```env
   PORT=5000
   PORT_RANGE=5000-5010        # optional: fallback window if 5000 busy
   SQLITE_STORAGE=server/dev.sqlite
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

   Optional Postgres (future migration):
   ```env
   # DB_DIALECT=postgres
   # DB_HOST=127.0.0.1
   # DB_PORT=5432
   # DB_NAME=lms
   # DB_USER=lms_user
   # DB_PASSWORD=your_password
   ```

   Frontend override knobs (normally not needed because of auto-detection):
   ```env
   # VITE_API_URL=http://localhost:5000/api      # lock API base
   # VITE_API_PORTS=5000,5001,5002               # ordered probe list
   # VITE_API_PORT_RANGE=5000-5005               # generated probe list
   ```
   The frontend logic:
   1. Uses VITE_API_URL if set.
   2. Else uses a cached working base (sessionStorage) if still reachable.
   3. Else probes candidate ports for /api/ping (ports list or range or default 5000-5004).
   Backend exposes `GET /api/meta/port` to reveal which port actually bound.

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