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
    "CREATE TABLE if NOT EXISTS customerInfo (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, " +
        "name TEXT, " +
        "email TEXT, " +
        "gender TEXT, " +
        "password TEXT, " +
        "UNIQUE (email));"
)
db.run (
    "CREATE TABLE if NOT EXISTS pins (" +
    "     id INTEGER, " +
    "     sport TEXT, " +
    "     skill TEXT," +
    "     lat Decimal(9,6)," +
    "     lng Decimal(9,6));"
)
db.close()

/**
 *
 */
io.on('connection', function(objectSocket) {
    objectSocket.on('map_load', function (objectData) {
        //load all of the pin locations
        var pins = [];
        let db = new sqlite3.Database('../db/clientDatabase.db');
        var sql = "SELECT name, email, gender, sport, skill, lat lng " +
                    "FROM pins JOIN customerInfo;";

        db.each(sql, {}, function(err, row) {
            var pinData = {name: row.name, email: row.email, gender: row.gender, sport: row.sport, lat: row.lat, lng:row.lng};
            pins.push(pinData);
            io.emit('pinData', pins);
        })
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
            console.log("A row has been inserted with rowid ${this.lastID}`");
        });

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
        let insertSql = "INSERT INTO pins (id, sport, skill, lat, long) " +
            "VALUES (:id, :sport, :skill, :lat, :long);";

        db.run(insertSql,
            {
              ':id':objectData.id,
              ':sport':objectData.sport,
              ':skill':objectData.skill,
              ':lat': objectData.lat,
              ':long': objectData.long
            },
            (err) => {
                if (err) {
                    io.emit('dbErr', {clientError: "unknown", msg: err.message});
                }

            });


        let sql = "SELECT name, gender, email  FROM customerInfo " +
            "WHERE id = :id";
        db.get(sql,
            {
                ':id': objectData.id
            },
            (err, row) => {
                if (err) {
                    io.emit('dbErr', {clientError: "unknown", msg: err.message});
                }
                else {
                    var data = {name: row.name, gender: row.gender, email: row.email, sport: objectData.sport, skill: objectData.skill};
                    console.log(data);
                    io.emit('pinContentResponse', data);
                }
            });
        db.close();

    });



});

console.log('go ahead and open "http://localhost:8080/index.html" in your browser');