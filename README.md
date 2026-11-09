# Startup CRM Lite

A full-stack Customer Relationship Management (CRM) application designed to help startups manage leads, monitor business performance, and track customer information through a simple dashboard.

## 🚀 Live Links

| Resource | Link |
|---|---|
| 🌐 Live Frontend | https://startup-crm-rho.vercel.app |
| ⚙️ Backend API | https://startup-crm-backend-1k2o.onrender.com |
| 💚 Backend Health Check | https://startup-crm-backend-1k2o.onrender.com/api/health |
| 📂 GitHub Repository | https://github.com/Buchupalle-Sireesha/startup-crm |

## ✨ Features

- User registration and secure login
- JWT-based authentication
- Dashboard with lead statistics
- Create, view, update and delete leads
- Search and filter leads
- Analytics and monthly statistics
- Revenue forecasting
- Dark mode and light mode
- User-specific data protection
- Responsive user interface

## 🛠️ Technologies Used

**Frontend**
- React.js
- Vite
- Tailwind CSS
- JavaScript
- React Router
- Lucide React

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt password hashing

**Deployment**
- Vercel – Frontend hosting
- Render – Backend hosting
- MongoDB Atlas – Database hosting

## 📁 Project Structure

```text
startup-crm/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── tests/
│   └── server.js
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── contexts/
│   ├── assets/
│   └── index.css
│
├── public/
├── package.json
└── README.md
```

## 💻 Run Locally

**1. Clone the repository**

```bash
git clone https://github.com/Buchupalle-Sireesha/startup-crm.git
```

**2. Open the project**

```bash
cd startup-crm
```

**3. Install frontend dependencies**

```bash
npm install
```

**4. Install backend dependencies**

```bash
cd backend
npm install
```

**5. Configure environment variables**

Create the required `.env` files using the project's environment variable configuration.

Backend variables:
- `MONGODB_URI`
- `JWT_SECRET`
- `PORT`
- `FRONTEND_URL`

Frontend variable:
- `VITE_API_URL`

Never upload actual passwords, tokens or secret keys to GitHub.

**6. Start the backend**

From the backend folder:

```bash
npm start
```

**7. Start the frontend**

Open another terminal in the project root:

```bash
npm run dev
```

Open the localhost URL displayed in the terminal.

## 🧪 Backend Testing

Run the integration test suite from the project root:

```bash
npm test
```

Latest local test result:

- 53 assertions passed
- 0 failures

Tests cover authentication, lead management, analytics, database operations, CORS and tenant isolation.

## 🔐 Security

- Passwords are stored using bcrypt hashing.
- JWT authentication protects private routes.
- User-specific lead access is enforced.
- Environment variables are used for sensitive configuration.

## 👩‍💻 Author

**Buchupalle Sireesha**

GitHub: https://github.com/Buchupalle-Sireesha

## 📌 Project

**Startup CRM Lite – Full Stack Development Internship Project**

