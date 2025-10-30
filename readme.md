# 🎓 EduNexus - Learning Management System

A full-stack Learning Management System (LMS) built with the MERN stack, featuring real-time chat, video lectures, assignments, and role-based access control.

## ✨ Features

### 👨‍🎓 For Students
- Browse and enroll in courses
- Watch video lectures
- Submit assignments
- Real-time course chat
- Track progress and grades

### 👨‍🏫 For Instructors
- Create and manage courses
- Upload video lectures (up to 500MB)
- Create and grade assignments
- View student submissions
- Real-time chat with students
- Publish/unpublish courses

### 👨‍💼 For Admins
- Manage all users (students, instructors, admins)
- Manage all courses
- View platform statistics
- Delete users and courses

## 🚀 Tech Stack

### Frontend
- **React 18** - UI library
- **React Router v6** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.IO** - WebSocket server
- **Cloudinary** - Media storage
- **Express File Upload** - File handling

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas account)
- **Cloudinary** account (for file uploads)

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/edunexus-lms.git
cd edunexus-lms
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Environment Variables

#### Backend `.env` (in `backend` folder)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client
CLIENT_URL=http://localhost:5173
```

#### Frontend `.env` (in `frontend` folder)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 5. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Recommended)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string and add to `.env`

### 6. Setup Cloudinary

1. Create account at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret
4. Add to backend `.env` file

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

### Production Mode

**Build Frontend:**
```bash
cd frontend
npm run build
```

**Start Backend:**
```bash
cd backend
npm start
```

## 👥 Default User Roles

You can register as:
- **Student** - Can enroll in courses
- **Instructor** - Can create and manage courses
- **Admin** - Full system access

## 📁 Project Structure
```
edunexus-lms/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── lectureController.js
│   │   ├── assignmentController.js
│   │   ├── submissionController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roleCheck.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Lecture.js
│   │   ├── Assignment.js
│   │   ├── Submission.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── lectures.js
│   │   ├── assignments.js
│   │   ├── submissions.js
│   │   ├── admin.js
│   │   └── chat.js
│   ├── socket/
│   │   └── chatSocket.js
│   ├── utils/
│   │   └── upload.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── common/
│   │   │   ├── instructor/
│   │   │   └── student/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CourseContext.jsx
│   │   ├── hooks/
│   │   │   └── useSocket.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env
├── .gitignore
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all published courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (instructor)
- `PUT /api/courses/:id` - Update course (instructor)
- `DELETE /api/courses/:id` - Delete course (instructor)
- `POST /api/courses/:id/enroll` - Enroll in course (student)
- `GET /api/courses/enrolled` - Get enrolled courses (student)
- `GET /api/courses/instructor/my-courses` - Get instructor courses

### Lectures
- `POST /api/lectures` - Upload lecture (instructor)
- `GET /api/lectures/course/:courseId` - Get course lectures
- `DELETE /api/lectures/:id` - Delete lecture (instructor)

### Assignments
- `POST /api/assignments` - Create assignment (instructor)
- `GET /api/assignments/course/:courseId` - Get course assignments

### Submissions
- `POST /api/submissions` - Submit assignment (student)
- `GET /api/submissions/assignment/:assignmentId` - Get submissions (instructor)
- `PUT /api/submissions/:id/grade` - Grade submission (instructor)

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/courses` - Get all courses
- `DELETE /api/admin/courses/:id` - Delete course

### Chat
- `GET /api/chat/:courseId` - Get course messages

## 🔌 WebSocket Events

### Client → Server
- `joinCourse` - Join course chat room
- `sendMessage` - Send message to course
- `leaveCourse` - Leave course chat room

### Server → Client
- `newMessage` - Receive new message
- `error` - Error notification

## 🎨 Features in Detail

### Video Upload
- Supports multiple formats (MP4, AVI, MOV, WEBM, etc.)
- Maximum file size: 500MB
- Progress tracking during upload
- Cloudinary integration for storage

### Real-time Chat
- Socket.IO implementation
- Course-specific chat rooms
- User presence indicators
- Message persistence

### Assignment System
- File upload for submissions
- Grading system with feedback
- Due date tracking
- Submission history

### Role-Based Access
- JWT authentication
- Protected routes
- Middleware authorization
- Role-specific dashboards

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Or check MongoDB Atlas connection string
```

### Socket.IO Not Connecting
```bash
# Check CORS settings in server.js
# Verify VITE_SOCKET_URL in frontend .env
```

### File Upload Failing
```bash
# Verify Cloudinary credentials
# Check file size (max 500MB)
# Ensure temp directory exists
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port in .env
PORT=5001
```

## 📝 Future Enhancements

- [ ] Course reviews and ratings
- [ ] Video progress tracking
- [ ] Email notifications
- [ ] Certificate generation
- [ ] Payment integration
- [ ] Live video classes
- [ ] Discussion forums
- [ ] Mobile app
- [ ] Analytics dashboard
- [ ] Quiz system

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- MongoDB for database
- Cloudinary for media storage
- Socket.IO for real-time features
- Tailwind CSS for styling
- React team for amazing library

## 📞 Support

For support, email your.email@example.com or create an issue in the repository.

---
