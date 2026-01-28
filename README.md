golf-better-plan/
├─ server/                      # Node/Express API
│  ├─ index.js                  # /api/isochrone (OpenRouteService), /api/courses (Google Places)
│  ├─ .env.sample               # ORS_KEY, GOOGLE_PLACES_API_KEY, PORT
│  └─ package.json
└─ client/
   └─ index.html                # Google Map + polygon + markers + review links + Directions
   # from the project root (golf-better-plan)
git init
git add .
git commit -m "Initial Golf Better Plan prototype"
git branch -M main
git remote add origin https://github.com/BelterGolf/golf-better-plan.git
git push -u origin main
