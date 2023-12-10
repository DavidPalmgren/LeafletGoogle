import AbstractView from "./AbstractView.js";
import helpers from "../helpers.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Zone");
        this.name = 'Zone';
        this.zones = [];
        this.zoneMarkers = [];
        this.polygon = null;
    }

    initJs() {
        console.log("Init")
        helpers.remakeMap()
        this.renderMap()
    }

    renderMap() {
        const map = L.map('map2').setView([51.505, -0.09], 7);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        map.on('click', (event) => {
            const { lat, lng } = event.latlng;
            console.log(`Clicked at Latitude: ${lat}, Longitude: ${lng}`);
            const marker = L.marker([lat, lng]).addTo(map);
            this.zoneMarkers.push([lat, lng]); // Store lat/lng in zoneMarkers array as an array for our structure
        });

        const zoneForm = document.createElement('form');
        zoneForm.innerHTML = `
            <label for="zoneId">Zone ID:</label>
            <input type="text" id="zoneId" name="zoneId" required><br><br>
            <label for="zoneType">Type:</label>
            <input type="text" id="zoneType" name="zoneType" placeholder="City, Parking, etc." required><br><br>
            <label for="zoneColour">Colour:</label>
            <input type="text" id="zoneColour" name="zoneColour" placeholder="#fff or red" required><br><br>
            <label for="zoneName">Name:</label>
            <input type="text" id="zoneName" name="zoneName" required><br><br>
            <label for="zoneDescription">Description:</label><br>
            <textarea id="zoneDescription" name="zoneDescription" required></textarea><br><br>
            <label for="zoneParkingValue">Parking Value:</label>
            <input type="number" id="zoneParkingValue" name="zoneParkingValue" required><br><br>
            <button type="submit" id="finishZoneButton">Finish Zone</button>
            <button type="button" id="postAllZonesButton">Post All Zones</button>
        `;
        document.querySelector('.content-upper').appendChild(zoneForm);

        // handles form submission
        zoneForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(zoneForm);
            const zoneData = {
                zoneId: formData.get('zoneId'),
                type: formData.get('zoneType'),
                area: this.zoneMarkers,
                colour: formData.get('zoneColour'),
                name: formData.get('zoneName'),
                description: formData.get('zoneDescription'),
                parkingValue: parseFloat(formData.get('zoneParkingValue'))
            };
            this.zones.push(zoneData);
            this.zoneMarkers = [];
            console.log('Zone finished:', this.zones);
            this.drawZonesOnMap(map);
            zoneForm.reset();
        });

        // handles posting all zones
        document.querySelector('#postAllZonesButton').addEventListener('click', async () => {
            let tokenholder = await this.getToken();
            await this.postAllZones(tokenholder.data.token);
        });
    }

    drawZonesOnMap(map) {
        if (this.polygon) {
            map.removeLayer(this.polygon); // who cares
        }

        this.zones.forEach((zone) => {
            this.polygon = L.polygon(zone.area, { color: zone.colour }).addTo(map);
            this.polygon.bindPopup(`Zone ID: ${zone.zoneId}<br>Type: ${zone.type}<br>Name: ${zone.name}<br>Description: ${zone.description}`).openPopup();
        });
    }

    async getToken() {
        try {
            const response = await fetch(`http://localhost:1337/admin/token`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: "POST",
                body: JSON.stringify({
                    "username": "chefen",
                    "password": "chefen"
                })
            })
            const res = await response.json()
            return res
        } catch (error) {
            console.error(error)
            throw new Error('well shit not wroking is it')
        }
    }
    // lägg in en token här manuellt om något inte fungerar
    // ingen safety fall du postar conflict 409 i databasen och det kommer hända om du skickar in med samma värden för att tömma kör bara en f5
    // men conflict 409 spelar ingen roll, ingen krash eller negativa saker som händer bara ett surt meddelande i console
    async postAllZones(token) {
        console.log(token)
        try {
            await Promise.all(this.zones.map(async (zone) => {
                const res = await fetch(`http://localhost:1337/zone/${zone.zoneId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Access-Token': token
                    },
                    body: JSON.stringify(zone)
                });
                console.log(`Zone ${zone.zoneId} posted. Response:`, res);
            }));
        } catch (error) {
            console.error('Error posting zones:', error);
        }
    }

    async getHtml() {
        return `
        <h1 style="color:white">Zone Creator</h1>
        <div class="content-upper">
            <!-- Everything dynamically added -->
        </div>
        `;
    };
};
