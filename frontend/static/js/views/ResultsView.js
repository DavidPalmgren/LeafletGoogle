import AbstractView from "./AbstractView.js";
import helpers from "../helpers.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Results");
        this.allSettingsAndResults = JSON.parse(localStorage.getItem('allSettingsAndResults')) || [];
    }

    initJs() {
        console.log("Init");
        helpers.remakeMap();
        this.createChart();
    }

    createChart() {
        const allSettingsAndResults = this.allSettingsAndResults;
    
        // Filter data for Leaflet and Google
        const leafletData = allSettingsAndResults.filter(data => data.settings.name === 'Leaflet');
        const googleData = allSettingsAndResults.filter(data => data.settings.name === 'Google');
    
        // Extract markerLoadTime and markers for Leaflet and Google data
        const leafletMarkerLoadTimes = leafletData.map(data => data.results.markerLoadTime);
        const leafletMarkerCounts = leafletData.map(data => data.settings.markers);
        const googleMarkerLoadTimes = googleData.map(data => data.results.markerLoadTime);
        const googleMarkerCounts = googleData.map(data => data.settings.markers);
    
        leafletMarkerCounts.sort((a, b) => a - b); // Sort Leaflet marker counts
        googleMarkerCounts.sort((a, b) => a - b); // Sort Google marker counts

        const ctxLeaflet = document.getElementById('chartLeaflet').getContext('2d');
        const ctxGoogle = document.getElementById('chartGoogle').getContext('2d');
    
        new Chart(ctxLeaflet, {
            type: 'bar',
            data: {
                labels: leafletMarkerCounts, // X-axis labels (number of markers for Leaflet)
                datasets: [{
                    label: 'Leaflet Marker Load Time',
                    data: leafletMarkerLoadTimes,
                    backgroundColor: 'blue',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'ms'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Number of Markers Added (Leaflet)'
                        }
                    }
                }
            }
        });
    
        new Chart(ctxGoogle, {
            type: 'bar',
            data: {
                labels: googleMarkerCounts, // X-axis labels (number of markers for Google)
                datasets: [{
                    label: 'Google Marker Load Time',
                    data: googleMarkerLoadTimes,
                    backgroundColor: 'red',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'ms'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Number of Markers Added (Google)'
                        }
                    }
                }
            }
        });
    }
    
    

    async getHtml() {
        let allResultsHTML = '';

        this.allSettingsAndResults.forEach((data, index) => {
            allResultsHTML += `
                <div class="result-container">
                    <h2>Performance ${index + 1}</h2>
                    <div class="settings-container">
                        <h3>Settings</h3>
                        <ul>
                            ${Object.entries(data.settings).map(([key, value]) => `
                                <li><strong>${key}:</strong> ${value}</li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="results-container">
                        <h3>Results</h3>
                        <ul>
                            ${Object.entries(data.results).map(([key, value]) => `
                                <li><strong>${key}:</strong> ${value}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
        });

        return `
            <h1 style="color:white">Results</h1>
            <canvas id="chartLeaflet" width="400" height="200"></canvas>
            <canvas id="chartGoogle" width="400" height="200"></canvas>
            <div class="all-results">
                ${allResultsHTML}
            </div>
        `;
    }
}
