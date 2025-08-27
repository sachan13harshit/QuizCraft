# QuizCraft

QuizCraft is a full-stack web application for creating, taking, and managing quizzes. It features user authentication, quiz creation, leaderboard tracking, and more

---

## Features

- User authentication (signup, login, JWT-based sessions)
- Create, edit, and delete quizzes
- Take quizzes and view results
- Leaderboard for top performers
- Responsive and modern UI (React + Tailwind CSS)
- Modular backend with microservices for authentication and quiz management

---


## Setup Instructions

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (local or cloud instance)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/QuizCraft.git
cd QuizCraft
```

### 2. Setup Frontend

```bash
cd frontend
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev
```

### 3. Setup Backend Services

#### Auth Service

```bash
cd services/auth-service
npm install
# or
yarn install

# Start the service
npm start
# or
yarn start
```

#### Quiz Service

```bash
cd services/quiz-service
npm install
# or
yarn install

# Start the service
npm start
# or
yarn start
```

---

## Technologies Used

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB
- **Authentication:** JWT
- **API Communication:** REST

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

