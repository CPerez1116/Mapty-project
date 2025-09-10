🗺️ Mapty – Workout Tracker (OOP + Geolocation + Leaflet)

A demo project built during Jonas Schmedtmann’s JavaScript course
.
The app uses geolocation and Leaflet.js to track workouts (running & cycling) on an interactive map.

⚠️ Note: This project was built while following along with the course. I do not claim this as my original idea — all credit goes to Jonas Schmedtmann. I’m using it as a learning project and personal practice.

🚀 Features

Detects your current location with the Geolocation API

Add workouts (🏃 Running or 🚴 Cycling) by clicking on the map

Form input validation (only positive numbers allowed)

Display workouts in a list with distance, duration, pace, speed, etc.

Save workouts to local storage (data persists on refresh)

Click on a workout in the list to move to its location on the map

Object-Oriented Programming with ES6 Classes

🛠️ Tech Stack

JavaScript (ES6+) – OOP principles

Leaflet.js – Interactive map rendering

Geolocation API – Get user’s coordinates

HTML5 / CSS3 – UI & styling

LocalStorage – Save workouts persistently

📂 Project Structure
📦 mapty-app
 ┣ 📂 css
 ┃ ┗ style.css
 ┣ 📂 js
 ┃ ┗ script.js
 ┣ index.html
 ┗ README.md

🧑‍💻 How It Works

On load, the app requests your current location.

The map centers on your position using Leaflet.js.

Click anywhere on the map to add a Running or Cycling workout.

Workouts are shown on the map (marker + popup) and in a list below the form.

All workouts are stored in local storage so they remain after reload.
