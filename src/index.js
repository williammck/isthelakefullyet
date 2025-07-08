import { WorkerEntrypoint } from "cloudflare:workers";

export default class extends WorkerEntrypoint {
  async fetch(request) {
    try {
      const response = await fetch('https://hydromet.lcra.org/api/RiverReport/GetRiverReportData/', {
        headers: {
          Accept: 'application/json',
        },
      })

      if (! response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
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

      return Response.json(lakeData)
    } catch (error) {
      console.log(error)

      return new Response('error fetching lake data', { status: 500 })
    }
  }
}
