var corner1 = L.latLng(44.888288,-93.1779),
	corner2 = L.latLng(44.991993,-93.005062),
	boundss=L.latLngBounds(corner1,corner2);
var map = L.map('mapid',{
	maxBounds: boundss
}).setView([44.949, -93.079],13);

//L.latLngBounds(boundss).addTo(map);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		minZoom: 13,
		maxZoom: 18,
		id:'mapbox/streets-v11',
		accessToken:'pk.eyJ1IjoiYW11ZDY5ODEiLCJhIjoiY2szdXltcGtjMDU5djNobHBqMzk4eG0zeCJ9.BsZLJkCaw2Bui_sh7DmdgQ'

}).addTo(map);

map.addControl( new L.Control.Search({
		url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
		jsonpParam: 'json_callback',
		propertyName: 'display_name',
		propertyLoc: ['lat','lon'],
		marker: L.circleMarker([0,0],{radius:30}),
		autoCollapse: true,
		autoType: false,
		minLength: 2
	}) );