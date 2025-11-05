# Exam Portal Backend

Backend API for the Exam Portal application built with Node.js, Express, and MongoDB.

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/exam-portal
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@examportal.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Documentation

The API runs on `http://localhost:5000/api`

### Health Check
- `GET /api/health` - Check server status

For complete API documentation, refer to the main README.md file.

## Database Models

- **User**: Student, Faculty, and Admin users
- **Question**: Question bank with multiple types
- **Exam**: Exam configuration and settings
- **ExamAttempt**: Student exam submissions
- **Notification**: User notifications

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Helmet security headers
- CORS configuration
- Input validation

## Dependencies

- express: Web framework
- mongoose: MongoDB ODM
- bcryptjs: Password hashing
- jsonwebtoken: JWT authentication
- dotenv: Environment variables
- cors: CORS middleware
- helmet: Security headers
- morgan: HTTP logger
- nodemailer: Email sending
- express-validator: Input validation
- express-rate-limit: Rate limiting
- cookie-parser: Cookie parsing
