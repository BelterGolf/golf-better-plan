
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import * as turf from '@turf/turf';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/isochrone', async (req, res) => {
  try {
    const { lat, lng, minutes = 60 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat,lng required' });
    const url = `https://api.openrouteservice.org/v2/isochrones/driving-car?range=${Number(minutes)*60}&locations=${lng},${lat}`;
    const gj = await fetch(url, { headers: { Authorization: process.env.ORS_KEY }}).then(r => r.json());
    res.json(gj);
  } catch (e) {
    res.status(500).json({ error: 'isochrone_failed' });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const { lat, lng, polygon, max = 40 } = req.body;
    if (!lat || !lng || !polygon) return res.status(400).json({ error: 'lat,lng,polygon required' });

    const searchUrl = 'https://places.googleapis.com/v1/places:searchText';
    const searchBody = {
      textQuery: 'golf course',
      locationBias: { circle: { center: { latitude: Number(lat), longitude: Number(lng) }, radius: 60000 } },
      maxResultCount: Math.min(Number(max), 50)
    };
    const searchResp = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.formattedAddress'
      },
      body: JSON.stringify(searchBody)
    }).then(r => r.json());

    const places = (searchResp.places || []);

    const poly = polygon; // GeoJSON geometry
    const inside = places.filter(p => {
      const pt = turf.point([p.location.longitude, p.location.latitude]);
      return turf.booleanPointInPolygon(pt, poly);
    });

    const detailed = await Promise.all(inside.map(async p => {
      const detailsUrl = `https://places.googleapis.com/v1/places/${p.id}?fields=id,displayName,location,formattedAddress,websiteUri,rating,userRatingCount&key=${process.env.GOOGLE_PLACES_API_KEY}`;
      const d = await fetch(detailsUrl).then(r => r.json());
      return {
        id: d.id,
        name: d.displayName?.text || p.displayName?.text,
        address: d.formattedAddress || p.formattedAddress,
        location: d.location || p.location,
        rating: d.rating,
        userRatingsTotal: d.userRatingCount,
        website: d.websiteUri,
        reviewLinks: buildReviewLinks(d.displayName?.text || p.displayName?.text)
      };
    }));

    res.json({ results: detailed });
  } catch (e) {
    res.status(500).json({ error: 'courses_failed' });
  }
});

function buildReviewLinks(name){
  const q = encodeURIComponent(name || '');
  return {
    golfpass: `https://www.golfpass.com/search?q=${q}`,
    top100: `https://www.top100golfcourses.com/search?search=${q}`,
    golfdigest: `https://www.golfdigest.com/search?q=${q}`
  };
}

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
