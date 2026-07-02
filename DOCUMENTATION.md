# Doctor Appointment Booking App — Full Code Documentation

This document explains the **whole app** end to end: the backend, the frontend and the database. It is written so a fresh graduate can read it and understand **how every feature and every API call works, and why we made each choice**. Read it top to bottom before an interview and you will be able to explain any part of the project.

---

## Table of Contents

1. [Big Picture — How the app works](#1-big-picture)
2. [The Tech Stack (and why)](#2-tech-stack)
3. [How a request flows through the app](#3-request-flow)
4. [The Database (MongoDB + Mongoose)](#4-database)
5. [The Backend (Node + Express)](#5-backend)
   - [server.js](#51-serverjs)
   - [Database connection](#52-db-connection)
   - [Models](#53-models)
   - [Middleware (JWT auth)](#54-middleware)
   - [Controllers & Routes](#55-controllers-routes)
   - [The Google Meet links feature](#56-meet-links)
6. [The Frontend (React)](#6-frontend)
   - [Entry point & routing](#61-entry-routing)
   - [Talking to the API (axios)](#62-axios)
   - [Login state (localStorage + JWT)](#63-login-state)
   - [Protected routes](#64-protected-routes)
   - [Every page explained](#65-pages)
   - [Styling & responsiveness](#66-styling)
7. [Feature walkthroughs (end to end)](#7-features)
8. [Common interview questions & answers](#8-interview-qa)
9. [Things that could be improved](#9-improvements)

---

<a name="1-big-picture"></a>
## 1. Big Picture — How the app works

There are **two separate programs**:

- **Backend** (`/backend`) — a Node.js + Express server that talks to MongoDB. It exposes a **REST API** (a set of URLs like `/api/auth/login`). It does not have any HTML pages; it only sends and receives **JSON**.
- **Frontend** (`/frontend`) — a React app that runs in the browser. It shows all the pages (landing page, booking, admin, etc.) and calls the backend API to get and save data.

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:3001`. They talk to each other over HTTP.

**Who uses the app:**
- **Patient** — signs up with a mobile number + password, books online (Google Meet) or walk-in (clinic) appointments, sees their appointments, edits their profile.
- **Doctor / Admin** — logs in with `admin@admin.com`, sees all appointments, marks them completed/cancelled, joins the Google Meet call, and sets availability.

---

<a name="2-tech-stack"></a>
## 2. The Tech Stack (and why)

| Layer     | Technology            | Why we used it |
|-----------|-----------------------|----------------|
| Frontend  | **React**             | The most popular library for building user interfaces. We used plain React (no Next.js) to keep it simple. |
| Routing   | **react-router-dom**  | Lets us have multiple pages (`/`, `/login`, `/admin`…) in a single-page app. |
| HTTP calls| **axios**             | A clean, easy library to call the backend API. |
| Backend   | **Node.js + Express** | Express is a small, simple web framework for building REST APIs in JavaScript. |
| Database  | **MongoDB + Mongoose**| MongoDB stores data as JSON-like documents, which is easy to understand. Mongoose gives us a nice way to define the shape of our data (schemas). |
| Auth      | **JWT + bcryptjs**    | JWT (JSON Web Token) is a standard way to keep a user logged in. bcryptjs safely hashes passwords so we never store the real password. |

**Why this stack?** It is the classic **MERN** stack (MongoDB, Express, React, Node). All of it is JavaScript, so we only need to learn one language for the whole app. It is extremely common in junior developer jobs.

---

<a name="3-request-flow"></a>
## 3. How a request flows through the app

Example: a patient books an appointment.

```
[Browser / React]                     [Express Backend]                 [MongoDB]
      |                                       |                              |
  user clicks "Confirm Booking"               |                              |
      |                                       |                              |
  axios POST /api/appointments  ---------->   |                              |
  (with JWT token in header)                  |                              |
      |                              protect middleware checks token         |
      |                                       |                              |
      |                              bookAppointment controller runs         |
      |                                       |  --- save appointment --->   |
      |                                       |  <---- saved document ----   |
      |   <---- JSON { appointment } -------  |                              |
      |                                       |                              |
  React navigates to /my-appointments         |                              |
```

Every feature follows this same pattern:
**React → axios call → Express route → (middleware) → controller → Mongoose model → MongoDB → JSON response → React updates the screen.**

---

<a name="4-database"></a>
## 4. The Database (MongoDB + Mongoose)

MongoDB stores **collections** of **documents**. A document is basically a JSON object. We use **Mongoose** to define a **schema** (the shape) for each collection.

We have **3 collections**:

### 4.1 `users` — file: [backend/models/User.js](backend/models/User.js)

Stores both patients and the admin (doctor).

| Field      | Type   | Notes |
|------------|--------|-------|
| `name`     | String | Optional at signup, filled later in profile. |
| `mobile`   | String | **Required + unique.** Used to log in. For the admin we store the email `admin@admin.com` here. |
| `password` | String | **The hashed password** (never the real one). |
| `email`, `age`, `gender`, `address` | String | Optional profile details. |
| `role`     | String | `"patient"` or `"admin"`. Defaults to `"patient"`. |
| `createdAt`, `updatedAt` | Date | Added automatically by `{ timestamps: true }`. |

> **Interview note:** We reuse the `mobile` field to store the admin's email. This is a small shortcut (a "mistake" a beginner might make). A cleaner design would be a separate `email` login field. It is fine for a demo.

### 4.2 `appointments` — file: [backend/models/Appointment.js](backend/models/Appointment.js)

One document per booking.

| Field           | Type     | Notes |
|-----------------|----------|-------|
| `patient`       | ObjectId | A **reference** to the user who booked (`ref: "User"`). |
| `patientName`, `patientMobile` | String | Copied at booking time so admin sees them without an extra lookup. |
| `date`          | String   | e.g. `"2026-07-10"`. |
| `time`          | String   | e.g. `"10:00 AM"`. |
| `reason`        | String   | Optional note from the patient. |
| `type`          | String   | `"online"` (Google Meet) or `"walk-in"` (clinic). |
| `meetLink`      | String   | A random Google Meet link — only for online appointments. |
| `status`        | String   | `"booked"`, `"completed"` or `"cancelled"`. |

> **Interview note:** Storing the date/time as **strings** is a simplification. A more robust app would store a real `Date`. We chose strings so the beginner code is easy to read.

### 4.3 `availabilities` — file: [backend/models/Availability.js](backend/models/Availability.js)

We keep **only one** document here because there is only one doctor.

| Field   | Type       | Notes |
|---------|------------|-------|
| `days`  | [String]   | Days the doctor works, e.g. `["Monday", "Tuesday"]`. |
| `slots` | [String]   | Time slots, e.g. `["10:00 AM", "11:00 AM"]`. |

---

<a name="5-backend"></a>
## 5. The Backend (Node + Express)

Folder layout:

```
backend/
├── server.js               # starts everything
├── config/db.js            # connects to MongoDB
├── models/                 # database schemas
├── middleware/auth.js      # JWT check
├── controllers/            # the actual logic for each route
├── routes/                 # maps URLs -> controllers
└── data/
    ├── doctor.js           # the doctor's info (placeholder)
    └── meetLinks.json      # 50 Google Meet links
```

**Why split into controllers and routes?** It keeps things organised. The **route** file just says *"this URL calls this function"*. The **controller** file holds the actual logic. This is a very common professional pattern (separation of concerns).

<a name="51-serverjs"></a>
### 5.1 `server.js` — the main file — [backend/server.js](backend/server.js)

This is the file that runs when we do `npm start`. In order it:

1. `require("dotenv").config()` — loads secret values (port, DB URL, JWT secret) from the `.env` file so we don't hard-code them.
2. `connectDB()` — connects to MongoDB.
3. Creates the Express app.
4. Adds two **middlewares**:
   - `cors()` — allows the React app (on port 3000) to call this API (on port 3001). Without CORS the browser blocks the request for security.
   - `express.json()` — lets Express read JSON that the frontend sends in the request body.
5. Registers the routes with `app.use(...)`:
   - `/api/auth` → auth routes (signup/login)
   - `/api/doctor` → doctor info
   - `/api/appointments` → patient appointments
   - `/api/admin` → admin actions
   - `/api/profile` → patient profile
6. `app.listen(PORT)` — starts the server listening for requests.

<a name="52-db-connection"></a>
### 5.2 Database connection — [backend/config/db.js](backend/config/db.js)

A small `async` function that calls `mongoose.connect(process.env.MONGO_URI)`. If it fails we log the error and `process.exit(1)` (stop the app), because the app is useless without a database.

<a name="53-models"></a>
### 5.3 Models

Explained in [section 4](#4-database). Each model file creates a schema and exports `mongoose.model("Name", schema)`. That exported model is what we use in controllers to talk to the database (`.find()`, `.create()`, `.save()`, etc.).

<a name="54-middleware"></a>
### 5.4 Middleware — JWT auth — [backend/middleware/auth.js](backend/middleware/auth.js)

A **middleware** is a function that runs **before** the route's controller. It can allow the request to continue (`next()`) or stop it with an error.

**`protect`** — makes sure the user is logged in:
1. Reads the `Authorization` header (format: `Bearer <token>`).
2. If there is no header → `401` "please login".
3. Splits off the token and calls `jwt.verify(token, JWT_SECRET)`. If the token is fake or expired, this throws and we return `401`.
4. If valid, `jwt.verify` returns the data we put inside the token: `{ id, role }`. We save it on `req.user` so the controller knows who the user is.
5. Calls `next()` to continue.

**`adminOnly`** — runs *after* `protect`. It checks `req.user.role === "admin"`. If not, it returns `403` "Only admin can do this".

> **Why JWT?** When you log in, the server gives you a signed token. On every future request you send that token, and the server can verify it **without looking anything up in the database**. It is a stateless, standard way to handle login.

<a name="55-controllers-routes"></a>
### 5.5 Controllers & Routes — every API call

Below is **every endpoint**, what it does, and which controller handles it.

#### Auth — [routes/authRoutes.js](backend/routes/authRoutes.js) → [controllers/authController.js](backend/controllers/authController.js)

**`POST /api/auth/signup`**
- Body: `{ name?, mobile, password }`
- Checks mobile + password are present.
- Checks the mobile is not already registered (`User.findOne`).
- Hashes the password with `bcrypt.hash(password, 10)` (the `10` is how strong the hashing is).
- Creates the user with `User.create(...)`.
- Creates a JWT with the helper `createToken` and returns `{ token, user }`. The user is logged in immediately after signing up.

**`POST /api/auth/login`**
- Body: `{ loginId, password }` — `loginId` is a mobile number *or* the admin email.
- **Admin case:** if `loginId === "admin@admin.com"`, we find (or, the first time, create) the admin account and check the password with `bcrypt.compare`. On success we return a token with `role: "admin"`.
- **Patient case:** find the user by mobile, compare the password, return a token.
- Wrong password / no account → `400` with a message.

**`createToken(user)` helper** — `jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "7d" })`. The token holds the user id + role and lasts 7 days.

#### Doctor info — [routes/doctorRoutes.js](backend/routes/doctorRoutes.js)

**`GET /api/doctor`** — public. Just returns the object from [data/doctor.js](backend/data/doctor.js) so the landing page can show the doctor's name, bio, skills, clinic, images and fee. No database involved.

#### Profile — [routes/profileRoutes.js](backend/routes/profileRoutes.js) → [controllers/profileController.js](backend/controllers/profileController.js)
*(Both routes use `protect`, so you must be logged in.)*

**`GET /api/profile`** — returns the logged-in user (found by `req.user.id`), using `.select("-password")` so we never send the password back.

**`PUT /api/profile`** — updates `name, email, age, gender, address`. We keep the old value for any field that was not sent. Then `user.save()`.

#### Appointments (patient) — [routes/appointmentRoutes.js](backend/routes/appointmentRoutes.js) → [controllers/appointmentController.js](backend/controllers/appointmentController.js)
*(All use `protect`.)*

**`POST /api/appointments`** — book an appointment.
- Body: `{ type, date, time, reason? }`.
- Requires `date` and `time`.
- **Checks availability:** it works out the day name of the chosen date (a helper `getDayName` turns `"2026-07-04"` into `"Saturday"`) and rejects the booking with a `400` if that day is not in the doctor's available `days`, or if the `time` is not one of the available `slots`. This is the real protection — the frontend checks too, but a user could bypass the frontend, so we also check on the server.
- Loads the patient (to copy their name + mobile onto the booking).
- **If `type === "online"`**, picks a random Google Meet link (see [5.6](#56-meet-links)). Walk-in gets no link.
- Creates the appointment with `status: "booked"` and returns it.

**`GET /api/appointments/my`** — returns the logged-in patient's appointments, newest first (`.sort({ createdAt: -1 })`).

**`PUT /api/appointments/:id/cancel`** — cancels one of the patient's own appointments. It first checks the appointment **belongs to this patient** (`appointment.patient.toString() !== req.user.id` → `403`). Then sets `status = "cancelled"`.

#### Admin — [routes/adminRoutes.js](backend/routes/adminRoutes.js) → [controllers/adminController.js](backend/controllers/adminController.js)

**`GET /api/admin/appointments`** *(protect + adminOnly)* — returns **all** appointments, newest first.

**`PUT /api/admin/appointments/:id`** *(protect + adminOnly)* — sets an appointment's `status` (e.g. `"completed"` or `"cancelled"`).

**`GET /api/admin/availability`** *(public!)* — returns the single availability document, creating it with defaults if it doesn't exist. This is **public** on purpose so patients can see the available days/slots on the booking page.

**`PUT /api/admin/availability`** *(protect + adminOnly)* — updates the doctor's `days` and `slots`.

<a name="56-meet-links"></a>
### 5.6 The Google Meet links feature — [backend/data/meetLinks.json](backend/data/meetLinks.json)

The task said: *don't use the real Google Meet API; just keep 50 links in a file and pick a random one.* So:

- `meetLinks.json` is an object with a `_note_for_developer` message and a `links` array of **50 dummy links**.
- In `appointmentController.js`, `getRandomMeetLink()` picks one with `Math.floor(Math.random() * links.length)`.
- **A random link is assigned only when an `online` appointment is booked**, and saved on the appointment's `meetLink` field.

> **To use real links:** open `meetLinks.json`, create 50 real Google Meet links, and replace the dummy values in the `links` array. Do not remove the `links` key.

The **"join at appointment time"** rule is enforced on the **frontend** (see [utils.js](#65-pages)) — the Join button only appears once the appointment's date/time has arrived.

---

<a name="6-frontend"></a>
## 6. The Frontend (React)

Folder layout:

```
frontend/src/
├── index.js            # entry point
├── App.js              # all the routes (pages)
├── App.css             # all the styles
├── api.js              # axios instance (talks to backend)
├── auth.js             # login state helpers (localStorage)
├── utils.js            # helper: is the appointment time reached?
├── components/
│   ├── Navbar.js
│   └── Footer.js
└── pages/
    ├── Home.js
    ├── Login.js
    ├── Signup.js
    ├── Booking.js
    ├── MyAppointments.js
    ├── Profile.js
    └── Admin.js
```

<a name="61-entry-routing"></a>
### 6.1 Entry point & routing

**[index.js](frontend/src/index.js)** — finds `<div id="root">` in `public/index.html` and renders `<App />` inside `<BrowserRouter>`. `BrowserRouter` is what makes multiple pages (routes) possible.

**[App.js](frontend/src/App.js)** — defines every route with `<Routes>` and `<Route>`:

| Path               | Page             | Access |
|--------------------|------------------|--------|
| `/`                | Home             | Everyone |
| `/login`           | Login (patient)  | Everyone |
| `/signup`          | Signup (patient) | Everyone |
| `/book`            | Booking          | Logged-in patients |
| `/my-appointments` | MyAppointments   | Logged-in patients |
| `/profile`         | Profile          | Logged-in patients |
| `/admin`           | Admin            | Shows the **doctor login** if not logged in, else the dashboard |
| `*` (anything else)| →redirect to `/` | Everyone |

It always shows the `<Navbar />` on top and `<Footer />` at the bottom, with the current page in between.

> **Important design choice — separate logins.** The patient login (`/login`) and the doctor login are **completely separate**. Patients never see the doctor login. The doctor logs in from **inside the `/admin` page** (see [Admin.js](#65-pages) below). This is cleaner and more realistic than one shared login form.

<a name="62-axios"></a>
### 6.2 Talking to the API — [frontend/src/api.js](frontend/src/api.js)

We create **one** axios instance with a `baseURL` so we never repeat the URL. The base URL comes from `process.env.REACT_APP_API_URL` and falls back to `http://localhost:3001/api` for local development. This is what lets the same code work both on your computer and after deployment (you just set `REACT_APP_API_URL` to the live backend URL when deploying).

The key part is the **interceptor**:
```js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});
```
This automatically attaches the JWT token to **every** request. So in the pages we just call `api.get("/profile")` and the token is added for us. This is why the backend `protect` middleware can identify the user.

<a name="63-login-state"></a>
### 6.3 Login state — [frontend/src/auth.js](frontend/src/auth.js)

We store the login in the browser's **localStorage** so it survives a page refresh:
- `saveLogin(token, user)` — saves both after login/signup.
- `getUser()` — reads back the user object (or `null`).
- `isLoggedIn()` — is there a token?
- `logout()` — removes both.

> **Interview note:** localStorage is simple and common for demos, but it is vulnerable to XSS attacks. A more secure approach uses httpOnly cookies. Good to mention that you know the trade-off.

<a name="64-protected-routes"></a>
### 6.4 Protected routes

In `App.js` the patient pages (`/book`, `/my-appointments`, `/profile`) are wrapped in a small **`PrivateRoute`** component — if `!isLoggedIn()` it redirects to `/login`.

The `/admin` route is **not** wrapped. Instead the `Admin` page checks the logged-in user itself and shows either the doctor login form or the dashboard (this keeps the doctor login separate from the patient login).

> This is **frontend** protection (for a nice user experience). The **real** security is on the **backend** (`protect` / `adminOnly` middleware), because anyone can bypass frontend checks. Always enforce on the server.

<a name="65-pages"></a>
### 6.5 Every page explained

Every page follows the same React pattern:
- `useState` to hold data / form fields.
- `useEffect` to load data from the API when the page opens.
- an event handler (like `handleSubmit`) that calls the API when the user clicks a button.

**[Home.js](frontend/src/pages/Home.js)** — the landing page. On load, `api.get("/doctor")` fetches the doctor details, stored in `useState`. It shows a **hero banner** (with a gradient over the image), a **stats bar**, an **about section** with the doctor photo and skill badges (`skills.map(...)`), and a **clinic card + call-to-action**. The "Book an Appointment" button sends logged-in users to `/book` and everyone else to `/login`.

**[Signup.js](frontend/src/pages/Signup.js)** — a form (name optional, mobile, password). On submit → `api.post("/auth/signup", ...)`. On success it calls `saveLogin(...)` and navigates to `/book`. Errors from the backend are shown in a red box.

**[Login.js](frontend/src/pages/Login.js)** — the **patient** login only. A form with mobile number + password. On submit → `api.post("/auth/login", { loginId: mobile, password })`. If the account turns out to be an admin it politely refuses ("Please use the Doctor Login page."), otherwise it saves the login and navigates to `/book`. The doctor cannot log in here.

**[Booking.js](frontend/src/pages/Booking.js)** — On load, `api.get("/admin/availability")` fetches the slots. The form has: appointment **type** (online/walk-in), **date** (`<input type="date">`), **time slot** (a `<select>` built from `availability.slots`), and an optional reason. Before sending, it uses `getDayName(date)` to check the chosen date falls on one of the doctor's available days; if not it shows a message and does not book. On submit → `api.post("/appointments", ...)`, then navigate to `/my-appointments`.

**[MyAppointments.js](frontend/src/pages/MyAppointments.js)** — On load, `api.get("/appointments/my")`. Renders each appointment as a card. For **online** + **booked** appointments, it uses `isTimeReached(date, time)` from `utils.js`:
- if the time has arrived → shows a **"Join Google Meet"** button (the saved `meetLink`).
- otherwise → shows *"link will be available at your appointment time"*.
A **Cancel** button calls `api.put("/appointments/:id/cancel")` and reloads the list.

**[Profile.js](frontend/src/pages/Profile.js)** — On load, `api.get("/profile")` fills the form. The mobile field is disabled (can't be changed). Saving calls `api.put("/profile", ...)`.

**[Admin.js](frontend/src/pages/Admin.js)** — the doctor's whole area. This one file has **three** components:
- **`Admin`** (the default export) — decides what to show. It reads `getUser()` into a state called `isAdmin`. If the doctor is **not** logged in, it renders `<DoctorLogin>`. If they are, it renders `<Dashboard>`.
- **`DoctorLogin`** — the doctor's own login form (email + password). On submit → `api.post("/auth/login", ...)`. It only accepts admin accounts (`role === "admin"`), otherwise it shows an error. On success it saves the login and calls `onLoggedIn()` so the parent switches to the dashboard **without a page reload** (React just re-renders).
- **`Dashboard`** — the actual dashboard. On load it fetches both `api.get("/admin/appointments")` and `api.get("/admin/availability")`.
  - **Availability form:** clickable day "pills" (`toggleDay` adds/removes a day) and a comma-separated text box for slots. On save it splits the text into an array and calls `api.put("/admin/availability", ...)`.
  - **Appointments list:** every booking with patient name/mobile, date, time, type, status. For online + booked, the same `isTimeReached` logic shows the Join Meet button. Two buttons call `api.put("/admin/appointments/:id", { status })` to mark **completed** or **cancelled**.

> **Interview note — the admin password:** there is no pre-set admin password. The **first** time anyone logs in with `admin@admin.com`, the backend creates the admin account using whatever password was typed (see `login` in `authController.js`). After that, the same password is required. Simple and fine for a demo.

**[utils.js](frontend/src/utils.js)** — `isTimeReached(date, time)` converts the stored strings (`"2026-07-10"`, `"10:00 AM"`) into a real JavaScript `Date`, handles AM/PM → 24-hour conversion, and returns `true` if "now" is at/after that time.

**[components/Navbar.js](frontend/src/components/Navbar.js)** — the responsive top bar. It shows different links depending on who is logged in (guest / patient / admin), using `isLoggedIn()` and `getUser()`. On mobile the links collapse behind a **hamburger button** (☰): a `useState` called `open` toggles a CSS class that shows/hides the menu. It never links to the doctor login (patients don't need it). Logout clears localStorage and reloads.

**[components/Footer.js](frontend/src/components/Footer.js)** — the footer, with a small **"Doctor Login"** link pointing to `/admin` (the discreet way the doctor reaches their login).

<a name="66-styling"></a>
### 6.6 Styling & responsiveness — [frontend/src/App.css](frontend/src/App.css)

All styles live in one CSS file. A few things worth explaining in an interview:

- **CSS variables** — at the top, inside `:root`, we define all the colors and a few sizes (e.g. `--primary`, `--bg`, `--radius`). Everything else uses `var(--primary)` etc. **To re-theme the whole app you only change these few lines.** The theme is a calm medical **teal + cyan**.
- **Google Fonts** — `Poppins` for headings and `Inter` for body text, loaded in `public/index.html`.
- **Mobile responsive** — near the bottom there is one `@media (max-width: 820px)` block. On small screens it: shows the hamburger button, turns the multi-column grids (stats, about, clinic, appointments, admin) into a single column, and shrinks the hero text. All widths are fluid (`%`, `1fr`, `max-width`) so the layout adapts to any screen. `body { overflow-x: hidden }` guards against accidental sideways scrolling.

---

<a name="7-features"></a>
## 7. Feature walkthroughs (end to end)

### Feature: Patient books an ONLINE appointment
1. Patient logs in → JWT saved in localStorage.
2. Opens `/book`; React fetches availability (`GET /api/admin/availability`).
3. Picks *Online*, a date and a slot, clicks Confirm.
4. React sends `POST /api/appointments` (token attached by the axios interceptor).
5. Backend `protect` verifies the token → `bookAppointment` runs → picks a **random Meet link** → saves the appointment.
6. React navigates to `/my-appointments` and shows the new booking. The Join button only appears once the appointment time arrives.

### Feature: Doctor manages appointments
1. Doctor opens `/admin` and logs in on the **Doctor Login** form there with `admin@admin.com` → gets an **admin** token. (Patients never see this form.)
2. The `Admin` page re-renders and shows the dashboard.
3. React calls `GET /api/admin/appointments` (backend checks `adminOnly`).
4. Doctor clicks *Mark Completed* → `PUT /api/admin/appointments/:id` → status updated → list reloads.
5. Doctor edits availability → `PUT /api/admin/availability` → patients now see the new slots.

### Feature: Password security
- On signup we `bcrypt.hash` the password before saving — the database never stores the real password.
- On login we `bcrypt.compare` the typed password against the stored hash.

---

<a name="8-interview-qa"></a>
## 8. Common interview questions & answers

**Q: What is the MERN stack?**
MongoDB (database), Express (backend framework), React (frontend), Node.js (JavaScript runtime for the backend). All JavaScript.

**Q: How does login stay remembered?**
The backend returns a JWT on login. The frontend saves it in localStorage and sends it in the `Authorization` header on every request (via an axios interceptor). The backend verifies it with the secret key.

**Q: What is middleware in Express?**
A function that runs before the route handler. We use `protect` to check the JWT and `adminOnly` to check the role. Middleware calls `next()` to continue or sends an error response to stop.

**Q: Why hash passwords?**
So that if the database is ever leaked, the real passwords are not exposed. bcrypt is a one-way hash — you can't reverse it, you can only compare.

**Q: How do you keep online vs walk-in appointments apart?**
A `type` field on the appointment. Only `online` appointments get a Google Meet link; walk-in patients visit the clinic.

**Q: Why is `GET /api/admin/availability` public but the others admin-only?**
Because patients need to see the available slots to book, but only the doctor should be able to change them or view all appointments.

**Q: What is CORS and why do you need it?**
The frontend (port 3000) and backend (port 3001) are different origins. Browsers block cross-origin requests by default; the `cors()` middleware allows them.

**Q: How would you make this production-ready?**
See the next section.

---

<a name="9-improvements"></a>
## 9. Things that could be improved (honest list)

This is a **demo**, kept deliberately simple. In a real app you would:

- **Prevent double-booking** the same slot (right now two patients can book the same date/time).
- Store `date`/`time` as a real **Date** instead of strings.
- Add proper **input validation** (e.g. valid mobile number format) and better error handling.
- Use a **separate email/password field** for the admin instead of reusing the `mobile` field.
- Move the JWT out of **localStorage** into an **httpOnly cookie** to reduce XSS risk.
- Add **loading spinners** and disable buttons while a request is in flight.
- Add **pagination** for the admin's appointment list.
- Use the real **Google Meet / Calendar API** instead of a file of links.
- Add **tests** (Jest / React Testing Library) and environment configs for deployment.

Being able to name these shows an interviewer that you understand the difference between a demo and a real product. That is exactly what they want to hear from a junior developer.

---

*End of documentation. Good luck with the interviews!*
