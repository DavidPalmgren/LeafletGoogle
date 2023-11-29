import AbstractView from "./AbstractView.js";
import helpers from "../helpers.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Leaflet");
        this.name = 'Leaflet';
        this.isSimulationRunning = false;
        this.intervalTiming = 1000;
        this.markers = 1000;
        this.movementFloor = -0.2;
        this.movementCeil = 0.2;
        this.movementRange = 0.05
        this.manualTimeStart = 0;
        if ('performance' in window && 'memory' in window.performance) {
            this.performanceMemory = window.performance.memory;
            //this.displayMemoryInfo();
        }
        this.markerLoadTime = 0
        this.manualLoadTime = 0
        this.mapLoadTime = 0
    }

    initJs() {
        console.log("Init")
        helpers.remakeMap()
        this.renderMap()
    }

    DomCount(start) {
        const parent = document.querySelector('.leaflet-marker-pane');
        console.log(document.querySelector('.leaflet-marker-pane'))
        const numberOfChildren = parent.childNodes.length;

        console.log('number of children: ', numberOfChildren)
    }

    renderMap() {
        const mapLoadStart = new Date()

        var map = L.map('map2').setView([51.505, -0.09], 7);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        const mapLoadEnd = new Date()
        const mapLoadTime = mapLoadEnd - mapLoadStart; // Calculate elapsed time
        this.mapLoadTime = mapLoadTime //after thoughts

        console.log(`Map load time: ${mapLoadTime} milliseconds`);
        document.querySelector('#mapLoad').innerHTML = `Map Load: ${mapLoadTime}ms`
        this.renderMarkers(map);
    }


    renderMarkers(map) {
        let markersArray = [];
    
        const restartSimulation = () => {
            // Removing old markers
            markersArray.forEach(marker => marker.remove());
            markersArray = []; // Reset markersArray
            // start time
            const startTime = new Date();
            const startTime2 = performance.now();
            this.manualTimeStart = new Date()

    
            // New markers creation
            for (let i = 1; i <= this.markers; i++) {
                const lat = 51.5 + helpers.getRandomFloat(-this.movementRange, this.movementRange);
                const lng = -0.09 + helpers.getRandomFloat(-this.movementRange, this.movementRange);
                const marker = L.marker([lat, lng]).addTo(map);
                markersArray.push(marker);
            }
    
            const checkVisibility = () => {
                const visibleMarkers = markersArray.filter(marker => map.getBounds().contains(marker.getLatLng()));
                if (visibleMarkers.length === this.markers) {
                    // All markers are visible
                    const endTime = performance.now();
                    const markerLoadTime = parseFloat(endTime - startTime2).toFixed(2);
                    this.markerLoadTime = markerLoadTime;
                    console.log('All markers visually loaded in:', markerLoadTime, 'milliseconds');
                    document.querySelector('#markerLoad').innerHTML = `Marker Load: ${markerLoadTime}ms`;
                } else {
                    // Not all markers are visible yet, continue checking
                    setTimeout(checkVisibility, 100);
                }
            };
    
            // Start checking visibility
            checkVisibility();
        };
    
        // Keeping the pause button for testing purposes but honestly should be removed at some point for user experience probably
        document.querySelector('#toggleSimulation').addEventListener('click', () => {
            if (this.isSimulationRunning) {
                clearInterval(this.simulationInterval);
                this.isSimulationRunning = false;
                document.querySelector('#toggleSimulation').textContent = 'Start New Simulation';
            } else {
                restartSimulation();
                this.simulationInterval = setInterval(() => {
                    this.routeSimulation(map);
                }, this.intervalTiming);
                this.isSimulationRunning = true;
                document.querySelector('#toggleSimulation').textContent = 'Break Simulation';
            }
        });

        //steaming mess
        document.querySelector('#intervalTiming').addEventListener('input', (event) => {
            const value = event.target.value;
            document.querySelector('#intervalTimingValue').textContent = value + ' ms';
            this.intervalTiming = Number(value);
        
            // clears the current interval and start a new one with the updated timing
            //
            if (this.isSimulationRunning) {
                clearInterval(this.simulationInterval);
                this.simulationInterval = setInterval(() => {
                    this.routeSimulation(map);
                }, this.intervalTiming);
            }
        });
        
        document.querySelector('#numMarkers').addEventListener('input', (event) => {
            const value = event.target.value;
            document.querySelector('#numMarkersValue').textContent = value;
            // this is to enhance the liveplay it does not affect statistics
            // if more we add untill diff is made up
            //
            if (this.isSimulationRunning) {
                if (value > this.markers) {
                    let diff = value - this.markers
                    //console.log('current: ', this.markers, 'new req: ', value, 'diff is: ', diff)
                    for (let i = 0; i < diff; i++) {
                        //console.log(i)
                        const lat = 51.5 + helpers.getRandomFloat(-this.movementRange, this.movementRange);
                        const lng = -0.09 + helpers.getRandomFloat(-this.movementRange, this.movementRange);
                        const marker = L.marker([lat, lng]).addTo(map);
                        markersArray.push(marker);
                    }
                }
                // if target less then have we remoke markers
                if (this.markers > value) {
                    let diff2 = this.markers - value
                    this.removeMarkers(map, diff2)
                }
            }
            this.markers = Number(value);
        });
        //how did they end up here, magic
        document.querySelector('#movementRange').addEventListener('input', (event) => {
            const value = event.target.value;
            document.querySelector('#movementRangeValue').textContent = value;
            this.movementRange = Number(value)
        });

        document.querySelector('#manualTime').addEventListener('click', (event) => {
            const endtime = new Date()
            console.log(endtime - this.manualTimeStart, 'ms')
            const deltatime = endtime - this.manualTimeStart
            this.manualLoadTime = deltatime;
            document.querySelector('#manualLoad').innerHTML = `Manual LoadT: ${deltatime}ms`
            this.manualTimeStart = 0;
        });

        document.querySelector('#saveData').addEventListener('click', (event) => {
            if (this.markerLoadTime > 0) {
                const settingsAndResults = {
                    settings: {
                        name: this.name,
                        intervalTiming: this.intervalTiming,
                        markers: this.markers,
                        movementRange: this.movementRange,
                    },
                    results: {
                        markerLoadTime: this.markerLoadTime,
                        manualLoadTime: this.manualLoadTime,
                        mapLoadTime: this.mapLoadTime,
                    }
                };

                const savedData = JSON.parse(localStorage.getItem('allSettingsAndResults')) || [];
                const exists = savedData.some(entry => {
                    return JSON.stringify(entry) === JSON.stringify(settingsAndResults);
                });
        
                if (!exists) {
                    savedData.push(settingsAndResults);
                    localStorage.setItem('allSettingsAndResults', JSON.stringify(savedData));
                    console.log(savedData);
                } else {
                    console.log('This entry already exists in the results.');
                }
            }
        });
        

    };

    routeSimulation(map) {
        this.performanceMemory = window.performance.memory;
        this.displayMemoryInfo()
        if (this.movementRange != 0) {
            map.eachLayer((layer) => { 
                if (layer._latlng) {
                    layer.setLatLng([layer._latlng.lat + helpers.getRandomFloat(-this.movementRange, this.movementRange),layer._latlng.lng + helpers.getRandomFloat(-this.movementRange, this.movementRange)])
                } 
            });
        }

    }

    displayMemoryInfo() {
        if (this.performanceMemory) {
            //console.log('Memory Info:');
            //console.log(`total js Heap Size: ${this.performanceMemory.totalJSHeapSize}`); think i wont have these for final release it seems like worthless statistics for the sake of it
            //console.log(`Used js Heap Size: ${this.performanceMemory.usedJSHeapSize}`);
            document.querySelector('#usedJsHeapSize').innerHTML = `HeapSizeUsed/Limit: ${parseFloat((this.performanceMemory.totalJSHeapSize / this.performanceMemory.jsHeapSizeLimit) * 100).toFixed(2)}%`
            //console.log(`JS Heap Size Limit: ${this.performanceMemory.jsHeapSizeLimit}`);
        }
    }

    removeMarkers(map, numToRemove) {
        let markersRemoved = 0;
        // puke
        for (const layerId in map._layers) {
            // was randomly deleting an unintended layer which was the map itself
            // all this jumbo was to try and make that not the case, did work at least
            if (map._layers.hasOwnProperty(layerId)) {
                const layer = map._layers[layerId];
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                    markersRemoved++;
                    //console.log(markersRemoved);
                    if (markersRemoved >= numToRemove) {
                        break;
                    }
                }
            }
        }
    }


    async getHtml() {
        return `
        <h1 style="color:white">Leaflet Test</h1>
        <div class="content-upper">
            <button id="toggleSimulation">Start Simulation</button>
            <label class="label" for="intervalTiming">Interval Timing:</label>
            <input class="range" type="range" id="intervalTiming" min="100" max="5000" step="100" value="1000">
            <span id="intervalTimingValue">1000 ms</span>
            
            <label class="label" for="numMarkers">Number of Markers:</label>
            <input class="range" type="range" id="numMarkers" min="100" max="10000" step="100" value="1000">
            <span id="numMarkersValue">1000</span>
            
            <label class="label" for="movementRange">Movement Range:</label>
            <input class="range" type="range" id="movementRange" min="0" max="2" step="0.01" value="0.05">
            <span id="movementRangeValue">0.05</span>
            <button id="manualTime" class="tooltip tooltip2">Stop time(Manual)</button>
            <p id="mapLoad">Map loadT: </p>
            <p id="markerLoad" class="tooltip">Marker loadT</p>
            <p id="manualLoad">Manual LoadT:</p>
            <p id="usedJsHeapSize">HeapSizeUsed/Limit</p>
            <button id="saveData">Send to results</button>
        </div>
        `;
    };
};
