
# Golf Better Plan — Prototype

This is a clickable prototype: enter a start location and minutes to see golf courses **within a drive-time polygon**, open **Google Maps** for directions, and jump to **GolfPass / Top100GolfCourses / Golf Digest** for reviews.

## Run locally

### 1) Server
```
cd server
cp .env.sample .env  # add ORS_KEY and GOOGLE_PLACES_API_KEY
npm i
npm run dev          # http://localhost:4000
```
- Isochrones: OpenRouteService (driving-car; time-based).  
- Courses: Google Places API (New) Text Search + Place Details.

### 2) Client
- Edit `client/index.html` → insert your **Google Maps JS API key** (enable Maps JavaScript API + Places API (New)).
- Open `client/index.html` in a browser.

#### Notes
- Directions link uses Google Maps **Maps URLs**.
- Filtering inside polygon is done on the server with Turf.js.
