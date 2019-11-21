// importing modules
var express = require("express")
var sqlite3 = require("sqlite3")
var fs = require("fs")
var bodyParser = require("body-parser")
var path = require("path")
var js2xmlparser = require("js2xmlparser")

// set path for public directory and database
var public_dir = path.join(__dirname, "public");
var db_filename = path.join(__dirname, "public", "stpaul_crime.sqlite3");

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
var port = 8000;

app.use(express.static(public_dir));

// open stpaul_crime.sqlite3 database
var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
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
    
    var queryString = "SELECT * FROM Codes";
    if (req.query.code !== undefined) {
        var requestedCodes = req.query.code.split(",");
        queryString += " WHERE code=?";
        for (let i=1; i<requestedCodes.length; i++) {
            queryString += " OR code=?"
        }
        console.log(queryString);
        db.each(queryString, requestedCodes, (err, row) => {
            newKey = "C" + row.code;
            newValue = row.incident_type;
            codeObject[newKey] = newValue;
        }, () => {
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
    } else {
        db.each("SELECT * FROM Codes", (err, row) => {
            newKey = "C" + row.code;
            newValue = row.incident_type;
            codeObject[newKey] = newValue;
        }, () => {
            if (req.query.format == "xml") {
                // sends xml file if format=xml
                var xmlCodes = js2xmlparser.parse("codes", codeObject);
                res.type("xml").send(xmlCodes);
            } else {
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

    
    var queryString = "SELECT * FROM Neighborhoods";
    if (req.query.id !== undefined) {
        var requestedNeighborhoods = req.query.id.split(",");
        queryString += " WHERE neighborhood_number=?";
        for (let i=1; i<requestedNeighborhoods.length; i++) {
            queryString += " OR neighborhood_number=?"
        }
        console.log(queryString);
        db.each(queryString, requestedNeighborhoods, (err, row) => {
            newKey = "N" + row.neighborhood_number;
            newValue = row.neighborhood_name;
            neighborhoodObject[newKey] = newValue;
        }, () => {
            if (req.query.format == "xml") {
                // sends xml file if format=xml
                var xmlCodes = js2xmlparser.parse("neighborhoods", neighborhoodObject);
                res.type("xml").send(xmlCodes);
            }
            else {
                // if xml is not specified, sends json object
                res.type("json").send(neighborhoodObject);
            }
        });  
    } else {
        db.each("SELECT * FROM Neighborhoods", (err, row) => {
            newKey = "N" + row.neighborhood_number;
            newValue = row.neighborhood_name;
            neighborhoodObject[newKey] = newValue;
        }, () => {
            if (req.query.format == "xml") {
                // sends xml file if format=xml
                var xmlCodes = js2xmlparser.parse("neighborhoods", neighborhoodObject);
                res.type("xml").send(xmlCodes);
            } else {
                // if xml is not specified, sends json object
                res.type("json").send(neighborhoodObject);
            }
        });
    }
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
    
    
    
    if (start_date !== undefined || end_date !== undefined) {
        
        
        
    } else if (limit !== undefined) {
        db.each("SELECT * FROM incidents ORDER BY date_time", (err,row) =>{// for limit sort by date time then do the first n objects
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
        });
    } else {
    
        db.each("SELECT * FROM incidents", (err,row) =>{// for limit sort by date time then do the first n objects
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
            if (req.query.format == "xml") {
                // sends xml file if format=xml
                var xmlCodes = js2xmlparser.parse("incident", incidentObject);
                res.type("xml").send(xmlCodes);
            }
            else{
            // sends json object
                res.type("json").send(incidentObject);
            }
        });
    
    }
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
	var incident_check=false;
	var incident_number= parseInt(req.body.case_number,10);
	var date_time=req.body.date+"T"+req.body.time;
	console.log(date_time);
	var	code=req.body.code;
	var	incident=req.body.incident;
	var police_grid=req.body.police_grid;
	var neighborhood_number=req.body.neighborhood_number;
	var block=req.body.block;
	db.get("SELECT * FROM incidents WHERE incidents=?",[incident_number] ,(err, row) => {
		if(row === undefined)
		{
			db.run("INSERT INTO incidents (case_number,date_time,code,incident,police_grid,neighborhood_number,block) VALUES(?,?,?,?,?,?,?)",[incident_number,date_time,code,incident,police_grid,neighborhood_number,block],(err)=>{
				if(err)
				{
										console.log(err);

					res.status(500).send('Error: something happened');
				}
				else
				{
					res.status(200).send('Success');
				}
			});
		}
		else
		{
			res.status(500).send('Error: case already exist');
		}
		
	})	// need to figure out where case_number is in the put request
    
});


var server = app.listen(port);
console.log("Now listening on port " + port);
