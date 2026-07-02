# Doctor Appointment Booking App

A simple full-stack doctor appointment booking website built with **React**, **Node.js / Express** and **MongoDB**.

A patient can view the doctor's profile, book **online (Google Meet)** or **walk-in (clinic)** appointments, see their appointments, and manage their profile. The doctor (admin) has a dashboard to manage all appointments and set availability.

> This is a demo/portfolio project. It is intentionally kept simple.

---

## Project Structure

```
doc-appointment-booking/
├── backend/        # Node + Express + MongoDB API
└── frontend/       # React app (Create React App)
```

## What you need installed

- [Node.js](https://nodejs.org/) (v18 or newer)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally, OR a free MongoDB Atlas account

---

## How to run the project

### 1. Start MongoDB
Make sure MongoDB is running on your machine (or use an Atlas connection string).

### 2. Start the backend
```bash
cd backend
npm install
# copy .env.example to .env and edit if needed
cp .env.example .env
npm run dev        # or: npm start
```
The backend runs on **http://localhost:3001**

### 3. Start the frontend
Open a **new terminal**:
```bash
cd frontend
npm install
npm start
```
The frontend runs on **http://localhost:3000**

---

## Logins

Patients and the doctor use **separate login pages**:

| Who      | Where            | How to login |
|----------|------------------|--------------|
| Patient  | `/login` (and `/signup`) | Sign up with a mobile number + password, then log in with the same. |
| Doctor   | `/admin`         | Login with email **admin@admin.com**. There is **no fixed password** — the first time you log in, whatever password you type is saved as the admin password, and you reuse it after that. |

> The doctor's login lives behind the `/admin` route and is never shown on the patient login page. There is also a small "Doctor Login" link in the footer.

---

## Google Meet Links

The online appointment feature uses a random Google Meet link from
`backend/data/meetLinks.json`. These are **dummy links**. See the note inside
that file — create real Google Meet links and replace the dummy ones.

---

## Deploying to GitHub / the web

**1. Push the code to GitHub** (from the project root):
```bash
git init
git add .
git commit -m "Doctor appointment booking app"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```
> `node_modules`, `.env` files and the build folder are already ignored by `.gitignore`, so they won't be pushed.

**2. Going live (optional).** A common free setup:
- **Database:** create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) and copy its connection string.
- **Backend:** deploy the `backend/` folder to a host like [Render](https://render.com). Set the environment variables `MONGO_URI`, `JWT_SECRET` and `PORT` there.
- **Frontend:** deploy the `frontend/` folder to [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Set `REACT_APP_API_URL` to your live backend URL (e.g. `https://your-backend.onrender.com/api`).

> The frontend reads the backend URL from `REACT_APP_API_URL` (see `frontend/src/api.js`); on your own computer it defaults to `http://localhost:3001/api`, so no setup is needed locally.

---
