
const helpers = {
    getRandomInt: function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    },
    
    getRandomFloat: function getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },
    remakeMap: function remakeMap() {
        // these maps hate sharing so they actively fuck everything up if the element isnt reset
        // basically even after you change to the google/leaflet from the other it'll still retain the old map with all
        // the class values markers etc etc, basically i fucked myself thinking making a classic js spa since old js
        // would never run into this issue, great great.
        // this made me so bloody mad
        var existingMap = document.getElementById("map2");
        existingMap.parentNode.removeChild(existingMap);

        var newMap = document.createElement("div");
        newMap.id = "map2";
        newMap.className = "map";
        newMap.style.height = "600px";
        newMap.style.width = "600px";

        var mapContainer = document.querySelector('.map-container');
        mapContainer.appendChild(newMap);
    },
}



export default helpers;
