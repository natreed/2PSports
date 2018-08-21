'use strict';

var express = require('express'); // do not change this line
var assert = require('assert'); // do not change this line
var socket = require('socket.io'); // do not change this line
var sqlite3 = require('sqlite3').verbose();
var passport = require('passport'); // do not change this line
var Strategy = require('passport-http').BasicStrategy;// do not change this line


//unique id for database
var customerId = null;

var server = express();

//set express static dirname
var dir = __dirname;
server.use('/', express.static('../'));

//start server
var io = socket(server.listen(process.env.PORT || 8080));
let db = new sqlite3.Database('../db/clientDatabase.db');
//Create customer info table
db.run(
    "CREATE TABLE if NOT EXISTS customerInfo (" +
        "id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, " +
        "name TEXT, " +
        "email TEXT, " +
        "gender TEXT, " +
        "password TEXT, " +
        "UNIQUE (email));"
)
db.run (
    "CREATE TABLE if NOT EXISTS pins (" +
    "     id INTEGER NOT NULL, " +
    "     sport TEXT NOT NULL, " +
    "     skill TEXT NOT NULL," +
    "     lat Decimal(9,6) NOT NULL," +
    "     lng Decimal(9,6) NOT NULL);"
)
db.close()

/**
 *
 */
io.on('connection', function(objectSocket) {
    objectSocket.on('map_load', function (objectData) {
        //load all of the pin locations

        var pins = [];
        var pinData;
        let db = new sqlite3.Database('../db/clientDatabase.db');
        var sql = "SELECT name, email, gender, sport, skill, lat,lng " +
                    "FROM pins JOIN customerInfo " +
                    "ON customerInfo.id = pins.id AND pins.sport = :sport;";

        db.all(sql,
            {":sport": objectData.sport},
            (err, rows) => {
            if (err) {
                io.emit('dbErr', {clientError: "unknown", msg: err.message});
            }

            for (var i=0; i < rows.length; i++) {
                var pinData = {
                    skill: rows[i].skill,
                    name: rows[i].name,
                    email: rows[i].email,
                    gender: rows[i].gender,
                    sport: rows[i].sport,
                    lat: rows[i].lat,
                    lng: rows[i].lng};
                pins.push(pinData);
            }
            io.emit('pinData', pins);
        });

        db.close()
    });

    objectSocket.on('disconnect', function () {
        io.emit('logout')
        //TODO: Delete pin locations for id
    });


    /**
     *
     */
    objectSocket.on('signup', function (signupData) {
        //http://www.sqlitetutorial.net/sqlite-nodejs/insert/
        let db = new sqlite3.Database('../db/clientDatabase.db');
        var sql = 'INSERT INTO customerInfo (name, email, gender, password) Values(?,?,?,?)';
        var values = [signupData.name, signupData.email, signupData.gender, signupData.password];
        db.run(sql, values, function (err) {
            if (err) {
                console.log(err.message);
                var lastWord = err.message.split(' ').pop();
                if (lastWord === "customerInfo.email") {
                    io.emit('dbErr', {clientError: "emailExists", msg: err.message});
                }
            }

            let sql = "Select id, name, password From customerInfo " +
                "WHERE customerInfo.email = :email " +
                "AND customerInfo.password = :password";

            db.get(sql,
                {':email': signupData.email, ':password': signupData.password},
                (err, row) => {
                    if (err) {
                        io.emit('dbErr', {clientError: "unknown", msg: err.message});
                    }
                    else if (row === undefined) {
                        io.emit("dbErr", {clientError: "noRecordLogin", email: signupData.email})
                    }
                    else if (row.password !== signupData.password) {
                        io.emit("dbErr", {clientError: "invalidPassword"});
                    }
                    else {
                        customerId = row.id;
                        io.emit('loginSuccess', {name: row.name, id: row.id})
                        console.log("customer id: " + row.id);
                    }
                });
        });;

        var sql = 'select * from customerInfo';

        db.all(sql, [], (err, rows) => {
            console.log(rows);
        })

        db.close();
    });


    /**
     * Verify login email and password
     */
    objectSocket.on('login', function (objectData) {
        let db = new sqlite3.Database('../db/clientDatabase.db');

        let sql = "Select id, name, password From customerInfo " +
            "WHERE customerInfo.email = :email " +
            "AND customerInfo.password = :password";

        db.get(sql,
            {':email': objectData.email, ':password': objectData.password},
            (err, row) => {
                if (err) {
                    io.emit('dbErr', {clientError: "unknown", msg: err.message});
                }
                else if (row === undefined) {
                    io.emit("dbErr", {clientError: "noRecordLogin", email: objectData.email})
                }
                else if (row.password !== objectData.password) {
                    io.emit("dbErr", {clientError: "invalidPassword"});
                }
                else {
                    customerId = row.id;
                    io.emit('loginSuccess', {name: row.name, id: row.id})
                    console.log("customer id: " + row.id);
                }
            });
        db.close();
    });

    /**
     * This serves two purposes.
     * 1. Adds new pin location to database
     * 2. Sends Content to be added to pin
     */
    objectSocket.on('clientInfoRequest',  function (objectData) {
        let db = new sqlite3.Database('../db/clientDatabase.db');

        //insert customer data
        let insertSql = "INSERT INTO pins (id, sport, skill, lat, lng) " +
            "VALUES (:id, :sport, :skill, :lat, :lng);";

        for (var i = 0; i < objectData.latLngs.length; i++) {
            db.run(insertSql,
                {
                    ':id':objectData.id,
                    ':sport':objectData.sport,
                    ':skill':objectData.skill,
                    ':lat': objectData.latLngs[i].lat,
                    ':lng': objectData.latLngs[i].lng
                },
                (err) => {
                    if (err) {
                        io.emit('dbErr', {clientError: "unknown", msg: err.message});
                    }

                });
        }

        db.close();

    });
});

console.log('go ahead and open "http://localhost:8080/index.html" in your browser');