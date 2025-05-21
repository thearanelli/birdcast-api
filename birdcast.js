const axios = require('axios');

module.exports = async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  const delta = 0.25;
  const minLon = parseFloat(lon) - delta;
  const maxLon = parseFloat(lon) + delta;
  const minLat = parseFloat(lat) - delta;
  const maxLat = parseFloat(lat) + delta;

  const url = `https://migrationmap.birdcast.info/api/liveMigration?bbox=${minLon},${minLat},${maxLon},${maxLat}`;

  try {
    const response = await axios.get(url);
    const features = response.data?.features || [];

    let totalBirds = 0;
    for (const f of features) {
      const density = f?.properties?.density;
      if (density) totalBirds += density;
    }

    let intensity = 'LOW';
    if (totalBirds > 100000) intensity = 'MEDIUM';
    if (totalBirds > 250000) intensity = 'HIGH';

    return res.json({ intensity, birdsPerHour: totalBirds });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'Failed to fetch BirdCast data' });
  }
};
