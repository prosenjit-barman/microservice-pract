/* eslint-disable */
//console.log("Hello From Client Side ✌");

const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken = 'pk.eyJ1IjoicHJvc2Vuaml0YmFybWFuIiwiYSI6ImNsNHc2cDU2dzAxbHgzYm9kMXNqcTY0dGkifQ.-hmuaA3UmIejKrgE6RmyFg';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/prosenjitbarman/cl4w81q2a003214q8mrmx1vlp', // style URL
    /* center: [-118.6919326, 34.0207305]
     zoom: 10 */
    scrollZoom: false
});

const bounds = new mapboxgl.LngLatBounds(); //areas that will be displayed on the map.

locations.forEach(loc => {
    //Create Marker
    const el = document.createElement('div');
    el.className = 'marker';

    //Add Marker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    })
    .setLngLat(loc.coordinates)
    .addTo(map);

    //Add Popup
    new mapboxgl.Popup({ closeOnClick: false, offset: 30 })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

    //Extend map bounds to include current location
    bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
    padding: {
        bottom: 150,
        top: 200,
        left: 100,
        right: 100
    }  
});