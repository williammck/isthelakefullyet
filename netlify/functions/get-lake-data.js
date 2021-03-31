const https = require('https')
const fetch = require('node-fetch')

const handler = async function () {
  try {
    // LCRA's Hydromet has a bad certificate chain :/
    const agent = new https.Agent({ rejectUnauthorized: false });
    const response = await fetch('https://hydromet.lcra.org/api/RiverReport/GetRiverReportData/', {
      headers: { Accept: 'application/json' },
      agent,
    })

    if (!response.ok) {
      return { statusCode: 500, body: 'error fetching lake data' }
    }

    const data = await response.json()
    const levels = data.currentLakeLevels.find(e => e.site_number == 3963)
    const storage = data.currentStorage.find(e => e.site_number == 3963)
    const lakeData = {
      currentDepth: levels.head_Elevation,
      fullVolume: storage.capacity,
      maxVolume: 1.072 * storage.capacity,
      currentVolume: storage.currentVol,
      timestamp: new Date().toString(),
    }

    return {
      statusCode: 200,
      body: JSON.stringify(lakeData),
    }
  } catch (error) {
    // output to netlify function log
    console.log(error)

    return { statusCode: 500, body: 'error fetching lake data' }
  }
}

module.exports = { handler }
