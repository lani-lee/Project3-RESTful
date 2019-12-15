var map;
var app;
var incidents;
var crime_api_url;
var incident_list;
var neighborhood;
var neighborhood_coords;
var markers;
var m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15, m16, m17;
// prefix of code
// ex: C120 -> 2
//     C9959 -> 99
var crime_types = {
    violent: [1, 2, 4, 8],
    property: [3, 5, 6, 7, 9, 14],
    other: [18, 26, 99]
};

var latLong="Search...";

markers = new Array();

// default boundaries of St. Paul
var corner1 = L.latLng(44.988019, -93.208612),
    corner2 = L.latLng(44.890657, -93.004356),
    cityLimits = L.latLngBounds(corner1,corner2);
    
function Prompt() {
    $("#dialog-form").dialog({
        autoOpen: true,
        modal: true,
        width: "360px",
        buttons: {
            "Ok": function() {
                var prompt_input = $("#prompt_input");
                Init(prompt_input.val());
                $(this).dialog("close");
            },
            "Cancel": function() {
                $(this).dialog("close");
            }
        }
    });
}
// when page loads, load: map, all vues
function Init(api_url) {
    crime_api_url = api_url;
    incident_list = new Vue({
        el: '#Vue',
        data: {
            incidents: {},
            neighborhoods: {},
            codes: {},
            neighborhood_crimes: new Array(17),
            visible_neighborhoods: new Array(17),
            Robbery: true,
            Murder:true,
            Rape:true,
            Vandalism: true,
            Burglary: true,
            Theft: true,
            Narcotics:true,
            ConwayBattlecreekHighwood: true,
            GreaterEastSide: true,            
            WestSide: true,
            DaytonsBluff: true,
            PaynePhalen: true,
            NorthEnd: true,
            ThomasDaleFrogtown: true,
            SummitUniversity: true,
            WestSeventh: true,
            Como: true,
            HamlineMidway: true,
            StAnthony: true,
            UnionPark: true,
            MacalesterGroveland: true,
            Highland: true,
            SummitHill: true,
            CapitolRiver: true,
            startDate:"2019-10-01",         
            endDate: "2019-10-31",
            startTime:"00:00:00",
            endTime:"23:59:59"
        },
        computed: {
            
        },
        methods: {
               selectRow(date, time, incident, block) {
                    // in address, change x to 0
                    if (block.indexOf("X") > -1 && !isNaN(block.charAt(block.indexOf("X")-1))) {
                        block = block.replace("X", "0");
                    }
                    console.log(block);
                    // get coords of address
                    $.getJSON("https://nominatim.openstreetmap.org/search/" + block + "?" + 
                    "viewbox=-93.208612,44.988019,-93.004356,44.890657&bounded=1&format=json&limit=1", (data) => {
                        console.log(data);
                        if (data !== undefined) {
                            var lat = data[0].lat;
                            var lon = data[0].lon;
                            let markerelement=document.createElement("div");
                            markerelement.textContent="Date: " + date + "Time: " + time + "Incident: " + incident;
                            let markerButton= document.createElement("button");
                            markerButton.textContent="Delete";

                            markerButton.type="button";
                            markerelement.appendChild(markerButton);
                            let marker= new L.marker([lat, lon]);
                            marker.bindPopup(
                            markerelement
                            // add delete button
                            )
                            console.log(markers.length);
                            map.addLayer(marker);
                            map.flyTo([lat, lon], 18);
                            markerButton.onclick= function(){
                                map.removeLayer(marker);
                            };
                        }
                    });
                    
                    /*change to coords of address*/   
                },
                isFiltered(incident){
                    if(this[incident.replace(/\s/g,"")]===undefined){
                        return false
                    }
                    else{
                        return this[incident];
                    }
                },
                neighborhoodSelected(neighborhood_number) {
                     return this[this.neighborhoods["N" + neighborhood_number].replace(/[^A-Za-z]/g, '')];
                    
                },
                isTime(time){
                    if (this.startTime.length<8 || this.endTime.length<8) {
                        // intentionally left blank to do nothing if not long enough
                    }
                    else {
                        // displays message if time is not the correct format
                        if((this.startTime.match(/[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/)===null || this.startTime.length>8) && 
                           (this.endTime.match(/[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/)===null) || this.endTime.length>8) 
                        {
                            document.getElementById("time-msg").innerHTML = "Please enter the start and end time in the correct format: hh:mm:ss";
                        }
                        else if(this.startTime.match(/[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/)===null || this.startTime.length>8)
                        {
                            document.getElementById("time-msg").innerHTML = "Please enter the start time in the correct format: hh:mm:ss";
                        }
                        else if(this.endTime.match(/[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/)===null || this.endTime.length>8)
                        {
                            document.getElementById("time-msg").innerHTML = "Please enter the start time in the correct format: hh:mm:ss";
                        }
                        else {
                            document.getElementById("time-msg").innerHTML = "";
                        }
                        
                        var start=this.startTime.split(":");
                        var end=this.endTime.split(":");
                      
                        if((parseInt(end[0]) <=23 && parseInt(start[0])<=23)&& (parseInt(end[0])>=0&&parseInt(start[0])>=0))//HH
                        {
                            if((parseInt(end[1]) <=59 && parseInt(start[1])<=59)&& (parseInt(end[1])>=0&&parseInt(start[1])>=0))
                            {
                                if((parseInt(end[2]) <=59 && parseInt(start[2])<=59)&& (parseInt(end[2])>=0&&parseInt(start[2])>=0)){
                                    var tableTime=parseInt(time.replace(":","").replace(":",""));
                                    if(tableTime>=(parseInt(""+start[0]+start[1]+start[2]))&&tableTime<=(parseInt(""+end[0]+end[1]+end[2])))
                                    {
                                        return true;
                                    }
                                    else
                                    {
                                        return false;
                                    }
                                }
                                else { // incorrect second
                                    document.getElementById("time-msg").innerHTML = "Please make sure you entered a second between 00 and 59";
                                }
                            } 
                            else{ // incorrect minute
                                document.getElementById("time-msg").innerHTML = "Please make sure you entered a minute between 00 and 59";
                            }
                        }
                        else{ // incorrect hour
                            document.getElementById("time-msg").innerHTML = "Please make sure you entered an hour between 00 and 23";
                        }

                    }
               },
               changeTable(){
                    $.getJSON(crime_api_url + "/incidents?start_date="+this.startDate+"&end_date="+this.endDate, (data)=> {
                        incident_list.incidents = data;
                        for (var i in incident_list.incidents) {
                            incident_list.neighborhood_crimes[incident_list.incidents[i].neighborhood_number-1]=0;
                        }
                        for (var i in incident_list.incidents) {
                            incident_list.neighborhood_crimes[incident_list.incidents[i].neighborhood_number-1]+=1;
                       }
                       m1.bindPopup("N1: \n Number of Crimes: "+incident_list.neighborhood_crimes[0]);
                       m2.bindPopup("N2: \n Number of Crimes: "+incident_list.neighborhood_crimes[1]);
                       m3.bindPopup("N3: \n Number of Crimes: "+incident_list.neighborhood_crimes[2]);
                       m4.bindPopup("N4: \n Number of Crimes: "+incident_list.neighborhood_crimes[3]);
                       m5.bindPopup("N5: \n Number of Crimes: "+incident_list.neighborhood_crimes[4]);
                       m6.bindPopup("N6: \n Number of Crimes: "+incident_list.neighborhood_crimes[5]);
                       m7.bindPopup("N7: \n Number of Crimes: "+incident_list.neighborhood_crimes[6]);
                       m8.bindPopup("N8: \n Number of Crimes: "+incident_list.neighborhood_crimes[7]);
                       m9.bindPopup("N9: \n Number of Crimes: "+incident_list.neighborhood_crimes[8]);
                       m10.bindPopup("N10: \n Number of Crimes: "+incident_list.neighborhood_crimes[9]);
                       m11.bindPopup("N11: \n Number of Crimes: "+incident_list.neighborhood_crimes[10]);
                       m12.bindPopup("N12: \n Number of Crimes: "+incident_list.neighborhood_crimes[11]);
                       m13.bindPopup("N13: \n Number of Crimes: "+incident_list.neighborhood_crimes[12]);
                       m14.bindPopup("N14: \n Number of Crimes: "+incident_list.neighborhood_crimes[13]);
                       m15.bindPopup("N15: \n Number of Crimes: "+incident_list.neighborhood_crimes[14]);
                       m16.bindPopup("N16: \n Number of Crimes: "+incident_list.neighborhood_crimes[15]);
                       m17.bindPopup("N17: \n Number of Crimes: "+incident_list.neighborhood_crimes[16]);
                   });
                   this.updateTable();
                   
                   
               },
                neighborhoodVisible(neighborhood_number){
                   return (this.visible_neighborhoods[neighborhood_number-1]);   
               },
               updateTable() {
                   this.$forceUpdate();
               },
               getBgColor(code) {
                   var prefix = Math.floor(code/100);
                   var color = {}
                   if (crime_types.violent.indexOf(prefix) > -1) {
                       color.backgroundColor = 'LightPink';
                   }
                   else if (crime_types.property.indexOf(prefix) > -1) {
                       color.backgroundColor = 'LightCyan';
                   }
                   else {
                       color.backgroundColor = 'PaleGreen';
                   }
                return color;
            }
        }
    });
    // create map with set boundaries
    map = L.map('mapid',{
        maxBounds: cityLimits
    }).setView([44.949, -93.079], 13);
    
    // adds base layer to map
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 11,
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
    
    var crimeIcon = L.icon({
       //iconUrl:  
    });
  //using search plug in from leaflet plug in derived from github
  //
      var geocoder = L.Control.Geocoder.nominatim();
      if (URLSearchParams && location.search) {
        // parse /?geocoder=nominatim from URL
        var params = new URLSearchParams(location.search);
        var geocoderString = params.get('geocoder');
        if (geocoderString && L.Control.Geocoder[geocoderString]) {
          console.log('Using geocoder', geocoderString);
          geocoder = L.Control.Geocoder[geocoderString]();
        } else if (geocoderString) {
          console.warn('Unsupported geocoder', geocoderString);
        }
      }

      // adds geocoder to map 
      var control = L.Control.geocoder({
        collapsed: false,
        placeholder:latLong,
        geocoder: geocoder,
      }).addTo(map);
      var marker;
      map.on('click', function(e) {
        geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom()), function(results) {
          var r = results[0];
          if (r) {
            if (marker) {
              marker
                .setLatLng(r.center)
                .setPopupContent(r.html || r.name)
                .openPopup();
            } else {
              marker = L.marker(r.center)
                .bindPopup(r.name)
                .addTo(map)
                .openPopup();
            }
          }
        });
      });
      
    // add search function to map
    /*map.addControl(
        new L.Control.Search({
            url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',function(){
            },
            jsonpParam: 'json_callback',
            propertyName: 'display_name',
            propertyLoc: ['lat','lon'],
            moveToLocation: function(latlng, title, map){
                map.setView(latlng,15);
            },
            //marker: L.circleMarker([0,0],{radius:30}),
            marker: pointerIcon,
            autoCollapse: true,
            autoType: false,
            minLength: 2
        })
    );*/
    
    
    
    neighborhood_coords = [[44.939038,-93.015913], [44.981086,-93.024898], [44.929603,-93.083709], [44.959407,-93.056327], [44.978094,-93.067305], [44.976429, -93.108051], [44.960303, -93.119727], [44.952346, -93.129301], [44.932281, -93.120426], [44.983644, -93.147154], [44.962879, -93.166564], [44.969908, -93.197343], [44.949160, -93.172167], [44.936545, -93.178968], [44.911447, -93.173530], [44.937675, -93.137083], [44.948875, -93.093550]];


    
    // get incident data from api, populate vue
    $.getJSON(crime_api_url + "/incidents?start_date=2019-10-01&end_date=2019-10-31", (data)=> {
        incident_list.incidents = data;
        // count crimes in each neighborhood and adds the total to the correct marker
        for (var i in incident_list.incidents) {
            incident_list.neighborhood_crimes[incident_list.incidents[i].neighborhood_number-1]+=1;
        }
        
        m1 = L.marker([44.939038,-93.015913],//BattleCreek
        {
        }).bindPopup("N1: \n Number of Crimes: "+incident_list.neighborhood_crimes[0]).addTo(map);
        m2 = L.marker([44.981086,-93.024898],//GreaterEastSide
        {
        }).bindPopup("N2: \n Number of Crimes: "+incident_list.neighborhood_crimes[1]).addTo(map);
        m3 = L.marker([44.929603,-93.083709],//EastSide
        {
        }).bindPopup("N3: \n Number of Crimes: "+incident_list.neighborhood_crimes[2]).addTo(map);
        m4 = L.marker([44.959407,-93.056327],//DaytonBluff
        {
        }).bindPopup("N4: \n Number of Crimes: "+incident_list.neighborhood_crimes[3]).addTo(map);
        m5 = L.marker([44.978094,-93.067305],//Payne/Phalen
        {
        }).bindPopup("N5: \n Number of Crimes: "+incident_list.neighborhood_crimes[4]).addTo(map);
        m6 = L.marker([44.976429, -93.108051],//NorthEnd
        {
        }).bindPopup("N6: \n Number of Crimes: "+incident_list.neighborhood_crimes[5]).addTo(map);
        m7 = L.marker([44.960303, -93.119727],//Thomas/FrogTown
        {
        }).bindPopup("N7: \n Number of Crimes: "+incident_list.neighborhood_crimes[6]).addTo(map);
        m8 = L.marker([44.952346, -93.129301],//Summit-University
        {
        }).bindPopup("N8:\n Number of Crimes: "+incident_list.neighborhood_crimes[7]).addTo(map);
        m9 = L.marker([44.932281, -93.120426],//West-7th
        {
        }).bindPopup("N9:\n Number of Crimes: "+incident_list.neighborhood_crimes[8]).addTo(map);
        m10 = L.marker([44.983644, -93.147154],//Como
        {
        }).bindPopup("N10: \n Number of Crimes: "+incident_list.neighborhood_crimes[9]).addTo(map);
        m11 = L.marker([44.962879, -93.166564],//Mid-way/Hamline
        {
        }).bindPopup("N11: \n Number of Crimes: "+incident_list.neighborhood_crimes[10]).addTo(map);
        m12 = L.marker([44.969908, -93.197343],
        {
        }).bindPopup("N12:\n Number of Crimes: "+incident_list.neighborhood_crimes[11]).addTo(map);
        m13 = L.marker([44.949160, -93.172167],//Union-Park
        {
        }).bindPopup("N13: \n Number of Crimes: "+incident_list.neighborhood_crimes[12]).addTo(map);
        m14 = L.marker([44.936545, -93.178968],//Macalster-GroveLand
        {
        }).bindPopup("N14: \n Number of Crimes: "+incident_list.neighborhood_crimes[13]).addTo(map);
        m15 = L.marker([44.911447, -93.173530],//Highland
        {
        }).bindPopup("N15:\n Number of Crimes: "+incident_list.neighborhood_crimes[14]).addTo(map);
        m16 = L.marker([44.937675, -93.137083],//summitHall
        {
        }).bindPopup("N16:\n Number of Crimes: "+incident_list.neighborhood_crimes[15]).addTo(map);
        m17 = L.marker([44.948875, -93.093550],//Capitol-river
        {
        }).bindPopup("N17: \n Number of Crimes: "+incident_list.neighborhood_crimes[16]).addTo(map);
    });
    
    $.getJSON(crime_api_url + "/neighborhoods", (data)=> {
         incident_list.neighborhoods = data;
    });
    
    $.getJSON(crime_api_url + "/codes", (data)=> {
         incident_list.codes = data;
    });
    
    
    for (let i =0;i<17;i++)
    {
        incident_list.neighborhood_crimes[i]=0;
        incident_list.visible_neighborhoods[i] = true;
    }   
    
    //console.log(getIncidents(corner1, corner2));
    
    map.on("moveend", function() {
        document.getElementById('info').innerHTML =  map.getCenter();
        control.placeholder=""+map.getCenter();
        
        // change visible neighborhoods here when map moves
        for (var i = 0; i<neighborhood_coords.length; i++) {   
            if (map.getBounds().contains(neighborhood_coords[i])) {
                incident_list.visible_neighborhoods[i] = true;
            }
            else {
                incident_list.visible_neighborhoods[i] = false;
            }
        }
        incident_list.updateTable();
        
        //LatLngBounds.contains(LatLng)
           
        // incident_list.bounds = L.getBounds();
    });


}


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