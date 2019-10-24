const express = require('express');
const app = express();
var db = require("./database.js");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = 8000;
const HOST = '0.0.0.0';

app.get('/', (req, res) => {
    res.send('Hello world');
});

app.get("/api/employed", (req, res, next) => {
    var sql = "select * from Employed"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

app.get("/api/employed/:id", (req, res, next) => {
    var sql = "select * from Employed where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});

app.post("/api/register/", (req, res, next) => {
    var errors=[]
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (!req.body.phone){
        errors.push("No phone specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.email,
        phone : req.body.phone,
    }
    var sql ='INSERT INTO Employed (name, email, phone) VALUES (?,?,?)'
    var params =[data.name, data.email, data.phone]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
});

app.patch("/api/employed/:id", (req, res, next) => {
    var data = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
    }
    db.run(
        `UPDATE Employed set 
           name = COALESCE(?,name), 
           email = COALESCE(?,email), 
           phone = COALESCE(?,phone) 
           WHERE id = ?`,
        [data.name, data.email, data.phone, req.params.id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
    });
});

app.delete("/api/employed/:id", (req, res, next) => {
    db.run(
        'DELETE FROM Employed WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
});

app.listen(PORT,HOST, () => {
    console.log(`Server en ${HOST}:${PORT}`);
});