import AbstractView from "./AbstractView.js";
import helpers from "../helpers.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Docs");
    }

    initJs() {
        console.log("Init");
        helpers.remakeMap()
    }


    async getHtml() {
        return `
        <h1 style="color:white">Documentation</h1>
        <div class="docs-upper">
            <p>
                Hi, this is a simple project meant to measure the loading differences between some popular map tools such as Leaflet, Google Maps JavaScript API, and more to come.
            </p>
            <p>
                There are several tools implemented to help you measure the time it takes for the different maps. I'll list them below with a more extensive overview of their use cases.
            </p>
            <h2>Interactive Tools</h2>
            <p><strong>Start simulation button:</strong> This starts/restarts a simulation from scratch and removes all previous elements before it takes the time. While you're simply playing around, you can increase interval, number of markers, movement, etc. Live and in order to have proper tests for load, a restart is required to measure a more accurate time, which is what the restart button provides.</p>
            <p><strong>Interval timing:</strong> Measures and sets the setTime delay. This effectively limits the amount of updates the movement receives per second.</p>
            <p><strong>Movement Range:</strong> Indicates the Ceiling and Floor of the movement the markers will do on the map. If set to 0, the movement will stop altogether and movement 'costs' will be removed.</p>
            <p><strong>Stop time (Manually):</strong> This is a manual stopwatch. It will start automatically (xD), but the stop time is done manually. The purpose of this is to get a rough time for rendering/painting, etc., when the user can see the markers visually on the screen. For a more accurate version, I suggest using Google's Lighthouse or other similar measuring tools as it gives a more precise view of the rendering/time and more.</p>
            <h2>Measurements</h2>
            <p><strong>Map Load:</strong> Represents the initial load of the map.</p>
            <p><strong>Marker Load Time:</strong> Represents the time it takes for the backend to finish creating the DOM elements for the map.</p>
            <p><strong>Manual Load Time:</strong> Represents the time it takes until you hit the stop time (Manual) button.</p>
            <p><strong>Heap size Used/Limit:</strong> Is the Heap size used divided by the Limit. Frankly, I was trying to put in as many stats as I could. Maybe someone smarter than me will have a better time understanding it if it has any value at all or not.</p>
        </div>
        `;
    }
}
