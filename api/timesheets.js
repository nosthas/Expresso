const express = require('express');
const timesheetsRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// :timesheetId Param Router
timesheetsRouter.param('timesheetId', (req, res, next, id) => {
  db.get("SELECT * FROM Timesheet WHERE id = $id", { $id: id}, function(err, row){
    if (!row) {
      return res.sendStatus(404);
    } else {
      req.body.timesheetId = id;
      next();
    }
  });
});

// Validate Timesheet Fields Middleware
const validateTimesheetFields = (req, res, next) => {
  if (!req.body.timesheet || !req.body.timesheet.hours || !req.body.timesheet.rate || !req.body.timesheet.date) {
    return res.sendStatus(400);
  } else {
    next();
  }
};

// GET /api/employees/:employeeId/timesheets
timesheetsRouter.get('/', (req, res, next) => {
  db.all("SELECT * FROM Timesheet WHERE employee_id = $employeeId" , { $employeeId: req.body.employeeId}, function(err, rows){
    if (err) {
      return res.sendStatus(500);
    } else {
      res.status(200).send({timesheets:rows});
    }
  })
});

// POST /api/employees/:employeeId/timesheets
timesheetsRouter.post('/', validateTimesheetFields, (req, res, next) => {
  db.run("INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employee_id)", { $hours: req.body.timesheet.hours, $rate: req.body.timesheet.rate, $date: req.body.timesheet.date, $employee_id: req.body.employeeId }, function(err){
    if (err) {
      return res.sendStatus(500);
    } else {
      db.get("SELECT * FROM Timesheet WHERE id = $id", { $id: this.lastID }, function(err, row){
        if (err) {
          return res.sendStatus(500);
        } else {
          res.status(201).send({timesheet:row});
        }
      });
    }
  });
});

// PUT /api/employees/:employeeId/timesheets/:timesheetId
timesheetsRouter.put('/:timesheetId', validateTimesheetFields, (req, res, next) => {
  db.run("UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employee_id WHERE id = $id", { $hours: req.body.timesheet.hours, $rate: req.body.timesheet.rate, $date: req.body.timesheet.date, $employee_id: req.body.employeeId, $id:req.body.timesheetId}, function(err){
    if (err) {
      return res.sendStatus(500);
    } else {
      db.get("SELECT * FROM Timesheet WHERE id = $id", { $id: req.body.timesheetId }, function(err, row){
        if (err) {
          return res.sendStatus(500);
        } else {
          res.status(200).send({timesheet:row});
        }
      });
    }
  });
});

// DELETE /api/employees/:employeeId/timesheets/:timesheetId
timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  db.run("DELETE FROM Timesheet WHERE id = $id", { $id: req.body.timesheetId}, function(err){
    if (err) {
      return res.sendStatus(500);
    } else {
      return res.sendStatus(204);
    }
  });
});

module.exports = timesheetsRouter;
