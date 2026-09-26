// This file sets up axios, the library we use to call our backend API.
// We create one axios instance so we don't repeat the base URL everywhere.
import axios from "axios";

const api = axios.create({
  // Where the backend lives. On your own computer it is localhost:3001.
  // When you DEPLOY the app, set REACT_APP_API_URL to your live backend URL
  // (for example https://my-backend.onrender.com/api) and this will use it.
  baseURL: "https://doc-appointment-bice-chi.vercel.app/api",
});

// This is called an "interceptor". It runs before every request and
// automatically attaches the login token (if we have one) to the request.
// This way we don't have to add the token manually in every API call.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

export default api;
