# KarmFlow

KarmFlow is a modern recruitment and applicant-tracking web app that helps candidates discover jobs, apply with resumes, and lets recruiters manage openings, applicants, and hiring stages from a single dashboard.

## Overview

KarmFlow combines a React + TypeScript frontend with an Express + MongoDB backend to provide:

- Role-based authentication for candidates, recruiters, and admins
- Job posting and job browsing flows
- Resume upload and resume text parsing
- ATS-style matching for candidate-job compatibility
- Recruiter pipeline views with application stages
- Real-time updates for application events using Socket.IO

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Socket.IO Client

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT authentication
- Cloudinary for resume upload storage
- Redis for caching
- Optional Gemini ATS scoring with keyword fallback

## Project Structure

```text
src/                  # React frontend application
  components/         # Reusable UI components and role-based screens
  lib/                # Mock data and schema helpers
server/               # Express + TypeScript backend
  src/                # API routes, models, middleware, and scoring logic
```

## Getting Started

### 1. Install dependencies

From the project root:

```bash
npm install
cd server
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root with the required variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: disable Gemini if you do not want AI scoring
GEMINI_DISABLE=true
```

### 3. Start the app

Run the frontend:

```bash
npm run dev
```

Run the backend:

```bash
cd server
npm run dev
```

The frontend typically runs on `http://localhost:5173` and the backend on `http://localhost:3000`.

## Available Scripts

### Root app
- `npm run dev` — start Vite dev server
- `npm run build` — build the frontend for production
- `npm run preview` — preview the production build

### Server
- `cd server && npm run dev` — start the Express server with hot reload

## Features in Focus

### Candidate experience
- Sign up / login
- Browse open jobs
- Apply to jobs with resume upload
- Track application status and ATS score

### Recruiter experience
- View job postings
- Review applications by stage
- Move candidates through the hiring pipeline
- Monitor candidates in a structured board view

## Notes

- Resume uploads are processed through Cloudinary.
- ATS scoring uses Gemini when available; if Gemini quota is unavailable, the app falls back to keyword-based scoring automatically.
- The repository includes sample assets and local upload data for development purposes.

## License

This project is currently distributed for local development and educational purposes.
