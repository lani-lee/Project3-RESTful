
var map;
var app;
var incidents;
var crime_api_url;
var incident_list;
var neighborhood;

// default boundaries of St. Paul
var corner1 = L.latLng(44.988019, -93.208612),
	corner2 = L.latLng(44.890657, -93.004356),
	cityLimits = L.latLngBounds(corner1,corner2);
    
// when page loads, load: map, all vues
function Init(api_url) {
    crime_api_url = api_url;
    // create map with set boundaries
    map = L.map('mapid',{
        maxBounds: cityLimits
    }).setView([44.949, -93.079], 13);
    
    // adds base layer to map
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		minZoom: 13,
		maxZoom: 18,
		id:'mapbox/streets-v11',
		accessToken:'pk.eyJ1IjoiYW11ZDY5ODEiLCJhIjoiY2szdXltcGtjMDU5djNobHBqMzk4eG0zeCJ9.BsZLJkCaw2Bui_sh7DmdgQ'
    }).addTo(map);

    // custom icon for map
    var pointerIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon-2x.png',
        //shadowUrl: '',

        iconSize:     [50, 82], // size of the icon
        //shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [25, 80], // point of the icon which will correspond to marker's location
        //shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
    
    // add search function to map
    map.addControl(
        new L.Control.Search({
            url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
            jsonpParam: 'json_callback',
            propertyName: 'display_name',
            propertyLoc: ['lat','lon'],
            //marker: L.circleMarker([0,0],{radius:30}),
            marker: pointerIcon,
            autoCollapse: true,
            autoType: false,
            minLength: 2
        })
    );
    
    // add markers to map
    // Saint Anthony Park
    L.marker([44.969908, -93.197343],
        {
            //icon: L.circleMarker([0,0],{radius:30})
        }).addTo(map);
    
    
    
    incident_list = new Vue({
        el: '#incident-list',
        data: {
            incidents: {},
            neighborhoods: {},
            codes: {}
            //bounds: new LatLngBounds()
        }
        /*
        ,
        computed: {
            viewable_incidents: function() {
                for (var incident in this.incidents) {
                    // replace the last X of the address number with a 0
                    let address = data[incident].block.replace("X", "0");
                    console.log(address);
                    // searches for the address inside the provided bounds, returns JSON
                    $.getJSON("https://nominatim.openstreetmap.org/search?q=" + address + "&format=json&viewbox=" +
                               bounds.getWest() + "," + 
                               bounds.getNorth() + "," + 
                               bounds.getEast() + "," + 
                               bounds.getSouth() + "," + 
                               "&bounded=1", 
                    (data) => {
                        console.log(data);
                    });
                }
                return incidents;
            }
        }
        */
    });
    

	// get incident data from api, populate vue
	
    
	$.getJSON(crime_api_url + "/incidents?start_date=2019-10-01&end_date=2019-10-31", (data)=> {
        incident_list.incidents = data;
        console.log(incident_list.incidents);  
	});
    
    $.getJSON(crime_api_url + "/neighborhoods", (data)=> {
         incident_list.neighborhoods = data;
	});
    
    $.getJSON(crime_api_url + "/codes", (data)=> {
         incident_list.codes = data;
	});
    
    //console.log(getIncidents(corner1, corner2));

}

/*
map.on("moveend", function() {
    incident_list.bounds = L.getBounds();
});

map.on("zoomend", function() {
    incident_list.bounds = L.getBounds();
});

function getIncidents(corner1, corner2) {
	let incidents = [];
    console.log(data);
    for (var incident in data) {
        // replace the last X of the address number with a 0
        let address = data[incident].block.replace("X", "0");
        console.log(address);
        // searches for the address inside the provided bounds, returns JSON
        $.getJSON("https://nominatim.openstreetmap.org/search?q=" + address + "&format=json&viewbox=" +
        corner1.lat + "," + corner1.lng + "," + corner2.lat + "," + corner2.lng + "," + "&bounded=1", (data) => {
            console.log(data);
        });
    }
    return incidents;
}
*/

/*
var incident = {
    list: [],
    loadList: function() {
		// hear this function load list calls from the restful api as a promise function to gather data from the api
        return m.request({
            method: "GET",
            url: "http://localhost:8000/incidents",
            withCredentials: false,
        })
		//promise has been completed result.data is a json
        .then(function(result) {
			incident.list=[]
			for(let i  in result)
			{
				incident.list.push(result[i]);
			}
            //incident.list = result
        })
    },
};
*/

//overwritting over the map need to figure that out
/*
var incidentTable = {
    oninit: incident.loadList,
    view: function() {
		//console.log(incident);
        return m(".incidents-table", incident.list.map(function(incidents) {// incidents is treated like an array loops through array and populates it
            return m(".incidents-table-item",[m("td",incidents.date),m("td",incidents.incident)])//.incidents-table-item is a div
        }))
    }
};

//var incidentTable = require("./views/incidentTable.js")



//m.render(document.body, "hello world")

m.mount(document.body, incidentTable)// m.mount renders the specified components into a DOM element*/