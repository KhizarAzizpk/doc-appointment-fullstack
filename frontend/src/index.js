// This is the entry point of the React app.
// It finds the <div id="root"> in index.html and puts our App inside it.
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./App.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // BrowserRouter lets us have different pages (routes) like /login, /admin etc.
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
