// helpful links
// INSERT INTO database: https://www.guru99.com/insert-into.html


// importing modules
var express = require("express")
var sqlite3 = require("sqlite3")
var fs = require("fs")
var path = require("path")
var js2xmlparser = require("js2xmlparser")

// set path for public directory and database
var public_dir = path.join(__dirname, "public");
var db_filename = path.join(__dirname, "public", "stpaul_crime.sqlite3");

var app = express();
var port = 8000;

app.use(express.static(public_dir));

// open stpaul_crime.sqlite3 database
var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log("Error opening " + db_filename);
    }
    else {
        console.log("Now connected to " + db_filename);
    }
});

// returns JSON object with list of codes and their corresponding incident type
// query options: code, format
app.get("/codes", (req, res) => {
    var codeObject = {};
    var newKey = "";
    var newValue = "";
    // if codes are specified, run a query for each code and send the object
    if (req.query.code !== undefined) {
        var requestedCodes = req.query.code.split(",");
        // promise for database query 
        var codePromise = new Promise((resolve, reject) => {
            requestedCodes.forEach(code => {
                db.get("SELECT * FROM Codes WHERE code=?", [code], (err, row) => {
                    newKey = "C" + row.code;
                    newValue = row.incident_type;
                    codeObject[newKey] = newValue;
                });
            });
            resolve(codeObject);
        });
        codePromise.then(result => {
            if (req.query.format == "xml") {
                // sends xml file if format=xml
                var xmlCodes = js2xmlparser.parse("codes", result);
                res.type("xml").send(xmlCodes);
            }
            else {
                // if xml is not specified, sends json object
                res.type("json").send(result);
            }
        });
    }
    else {
        // if no codes specified
        db.each("SELECT * FROM Codes", (err, row) => {
            newKey = "C" + row.code;
            newValue = row.incident_type;
            codeObject[newKey] = newValue;
        }, () => {
            // changes format of response 
            if (req.query.format == "xml") {
                // sends xml file if format=xml
                var xmlCodes = js2xmlparser.parse("codes", codeObject);
                res.type("xml").send(xmlCodes);
            }
            else {
                // if xml is not specified, sends json object
                res.type("json").send(codeObject);
            }
        });
    }
});

// returns JSON object wiht list of neighborhood ids and their corresponding neighborhood name
// query options: id, format
app.get("/neighborhoods", (req, res) => {
    var neighborhoodObject = {};
    var newKey = "";
    var newValue = "";
    db.each("SELECT * FROM Neighborhoods", (err, row) => {
        newKey = "N" + row.neighborhood_number;
        newValue = row.neighborhood_name;
        neighborhoodObject[newKey] = newValue;
    }, () => {
        // sends json object
        res.type("json").send(neighborhoodObject);
    });
});

// returns JSON object with list of crime incidents
// seperate date and time fields
// query options: start_date, end_date, code, grid, neighborhood, limit, format
app.get("/incidents", (req, res) => {
	
	var incidentObject ={};
	var keys ={
		date:{},
		time:{},
		incident:{},
		police_grid:{},
		block:{}
	};
    
	db.each("SELECT * FROM incidents", (err,row) =>{
		//keys = "I"+ row.case_number;
		incidentObject["I"+ row.case_number]={
		date:row.date_time.split("T")[0],
		time:row.date_time.split("T")[1],
		code:row.code,
		incident:row.incident,
		police_grid:row.police_grid,
		neighborhood_number:row.neighborhood_number,
		block:row.block
		};
	},	() => {
        // sends json object
        res.type("json").send(incidentObject);
    });
    
});

// upload new incident to database
/*
    fields: 
        case_number
        date
        time
        code
        incident
        police_grid
        neighborhood_number
        block
*/
// reject with status 500 if case number already exists
app.put("/new-incident", (req, res) => {
	/*var new_incident={ id: "I"+parseInt(req.body.case_number,14)
	}*/ // need to figure out where case_number is in the put request
    
});


var server = app.listen(port);
console.log("Now listening on port " + port);