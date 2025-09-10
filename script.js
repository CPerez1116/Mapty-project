'use strict';

// ======================
// PARENT CLASS: Workout
// ======================
class Workout {
  date = new Date(); // timestamp when workout is created
  id = (Date.now() + '').slice(-10); // unique ID from current time
  clicks = 0; // counts clicks on workout (used for testing)

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in minutes
  }

  _setDescription() {
    // List of months for pretty date formatting
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // e.g. "Running on July 14"
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++; // small public method for debugging
  }
}

// ======================
// CHILD CLASS: Running
// ======================
class Running extends Workout {
  type = 'running'; // used for styling + description

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration); // call parent constructor
    this.cadence = cadence; // steps per minute
    this.calcPace(); // calculate pace right away
    this._setDescription(); // set description text
  }

  calcPace() {
    // pace = minutes per km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

// ======================
// CHILD CLASS: Cycling
// ======================
class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain; // meters climbed
    this.calcSpeed(); // calculate speed right away
    this._setDescription();
  }

  calcSpeed() {
    // speed in km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// ======================
// DOM ELEMENTS
// ======================
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// ======================
// MAIN APPLICATION CLASS
// ======================
class App {
  #map; // Leaflet map instance
  #mapZoomLevel = 13; // default zoom
  #mapEvent; // stores click event on map
  #workouts = []; // array of workouts

  constructor() {
    // Get user's position (async)
    this._getPosition();

    // Load saved workouts from localStorage
    this._getLocalStorage();

    // Attach event listeners
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggelElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  // ======================
  // GEOLOCATION + MAP
  // ======================
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this), // success callback
        function () {
          alert(`Could not get your position`);
        }
      );
  }

  _loadMap(position) {
    // destructure coords from position object
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];

    // Initialize Leaflet map
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    // Add OpenStreetMap tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handle clicks on map (show form)
    this.#map.on('click', this._showForm.bind(this));

    // Render any saved workouts from storage
    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  // ======================
  // FORM HANDLING
  // ======================
  _showForm(mapE) {
    this.#mapEvent = mapE; // save click event
    form.classList.remove('hidden'); // show form
    inputDistance.focus(); // auto-focus on first field
  }

  _hideForm() {
    // Clear inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    // Hide form
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000); // reset
  }

  _toggelElevationField() {
    // Toggle between cadence and elevation inputs
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  // ======================
  // CREATE NEW WORKOUT
  // ======================
  _newWorkout(e) {
    e.preventDefault();

    // Helper functions
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    // Get form data
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // Running
    if (type == 'running') {
      const cadence = +inputCadence.value;

      // Validate
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers.');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // Cycling
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers.');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new workout
    this.#workouts.push(workout);

    // Render workout in UI
    this._renderWorkoutMarker(workout);
    this._renderWorkout(workout);

    // Hide + reset form
    this._hideForm();

    // Save to localStorage
    this._setLocalStorage();
  }

  // ======================
  // RENDERING
  // ======================
  _renderWorkoutMarker(workout) {
    // Display workout marker on map
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    // Create workout list item HTML
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
    `;

    if (workout.type === 'running')
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`;

    if (workout.type === 'cycling')
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>`;

    form.insertAdjacentHTML('afterend', html);
  }

  // ======================
  // INTERACTION
  // ======================
  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    // Animate map to workout location
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    });
  }

  // ======================
  // LOCAL STORAGE
  // ======================
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;

    this.#workouts = data;

    // Render workouts in list (markers rendered only when map loads)
    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }

  // Developer helper: clear all workouts
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

// Start app
const app = new App();
