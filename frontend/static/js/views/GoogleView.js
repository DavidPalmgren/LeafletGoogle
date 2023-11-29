import AbstractView from "./AbstractView.js";
import helpers from "../helpers.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Google Map");
        this.name = 'Google';
        this.isSimulationRunning = false;
        this.intervalTiming = 1000;
        this.markers = 1000;
        this.movementRange = 0.2;
        if ('performance' in window && 'memory' in window.performance) {
            this.performanceMemory = window.performance.memory;
            //this.displayMemoryInfo();
        }
    }

    initJs() {
        console.log("Init");
        helpers.remakeMap()
        this.renderMap();
    }


    renderMap() {
        // should've just put this in head like a normal person not like it'll affect the measurments prolly
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCKCz7rxC_w2L24NOp6YzNWAPcDABABr14&callback=initMap`;
        script.defer = true;
        script.async = true;
        const mapLoadStart = new Date()

    
        window.initMap = () => {
            const map = new google.maps.Map(document.getElementById("map2"), {
                center: { lat: 51.505, lng: -0.09 },
                zoom: 7,
            });
            console.log(map)
            const mapLoadEnd = new Date()
            const mapLoadTime = mapLoadEnd - mapLoadStart; // Calculate elapsed time
    
            console.log(`Map load time: ${mapLoadTime} milliseconds`);
            document.querySelector('#mapLoad').innerHTML = `Map Load: ${mapLoadTime}ms`

            this.renderMarkers(map);
        };
        document.head.appendChild(script);
    }
    
    renderMarkers(map) {
        let markersArray = [];
        
    
        const restartSimulation = () => {
            // Removing old markers
            markersArray.forEach(marker => {
                marker.setMap(null); // Removes the marker from the map
            });
            markersArray = []; // Clear the markersArray
            // start time
            const startTime2 = performance.now();
            this.manualTimeStart = new Date()

            // New markers creation
            for (let i = 1; i <= this.markers; i++) {
                const newlat = 51.5 + helpers.getRandomFloat(-this.movementRange, this.movementRange);
                const newlng = -0.09 + helpers.getRandomFloat(-this.movementRange, this.movementRange);
                //console.log('lat: ',newlat, 'long: ', newlng)
                const marker = new google.maps.Marker({
                    position: { lat: newlat, lng: newlng },
                    map: map
                });
                markersArray.push(marker);
            }
            const endTime = performance.now();
            const markerLoadTime = parseFloat(endTime - startTime2).toFixed(2);
            console.log('All markers visually loaded in:', markerLoadTime, 'milliseconds');
            document.querySelector('#markerLoad').innerHTML = `Marker Load: ${markerLoadTime}ms`;


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
                    this.routeSimulation(map, markersArray);
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
        
            // Clear the current interval and start a new one with the updated timing
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
            // Make sure it only works when sim is running to avoid doubble loading
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

        document.querySelector('#movementRange').addEventListener('input', (event) => {
            const value = event.target.value;
            document.querySelector('#movementRangeValue').textContent = value;
            this.movementRange = Number(value)
        });

        document.querySelector('#manualTime').addEventListener('click', (event) => {
            const endtime = new Date()
            console.log(endtime - this.manualTimeStart, 'ms')
            const deltatime = endtime - this.manualTimeStart
            document.querySelector('#manualLoad').innerHTML = `Manual LoadT: ${deltatime}ms`
            this.manualTimeStart = 0;
        });

    };

    routeSimulation(map, markersArray) {
        this.performanceMemory = window.performance.memory;
        this.displayMemoryInfo();
        if (this.movementRange != 0) {
            markersArray.forEach((marker) => {
                const lat = marker.getPosition().lat() + helpers.getRandomFloat(-this.movementRange, this.movementRange);
                const lng = marker.getPosition().lng() + helpers.getRandomFloat(-this.movementRange, this.movementRange);
                marker.setPosition({ lat, lng });
            });
        }
    }

    removeMarkers(map, numToRemove) {
        let markersRemoved = 0;
        // puke
        for (const layerId in map._layers) {
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

    displayMemoryInfo() {
        if (this.performanceMemory) {
            //console.log('Memory Info:');
            //console.log(`Total JS Heap Size: ${this.performanceMemory.totalJSHeapSize}`);
            //console.log(`Used JS Heap Size: ${this.performanceMemory.usedJSHeapSize}`);
            document.querySelector('#usedJsHeapSize').innerHTML = `HeapSizeUsed/Limit: ${parseFloat((this.performanceMemory.totalJSHeapSize / this.performanceMemory.jsHeapSizeLimit) * 100).toFixed(2)}%`
            //console.log(`JS Heap Size Limit: ${this.performanceMemory.jsHeapSizeLimit}`);
        }
    }


    getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    async getHtml() {
        return `
        <h1 style="color:white">Google Test</h1>
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
        </div>
        `;
    }
}
