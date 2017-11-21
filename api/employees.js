const express = require('express');
const employeeRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const timesheetsRouter = require('./timesheets');

// :employeeId Param Router
employeeRouter.param('employeeId', (req, res, next, id) => {
  db.get("SELECT * FROM Employee WHERE id = $id", { $id: id }, function(err, row){
    if (!row) {
      return res.sendStatus(404);
    } else {
      req.body.employeeId = id;
      next();
    }
  });
});

// Validate Employee Fields Middleware
const validateEmployeeFields = (req, res, next) => {
  if (!req.body.employee || !req.body.employee.name || !req.body.employee.position || !req.body.employee.wage) {
    return res.sendStatus(400);
  } else {
    next();
  }
};

// GET /api/employees
employeeRouter.get('/', (req, res, next) => {
  db.all("SELECT * FROM Employee WHERE is_current_employee = 1", function(err, rows){
    if (err) {
      return res.sendStatus(500);
    } else {
      res.status(200).send({employees:rows});
    }
  });
});

// GET /api/employees/:employeeId
employeeRouter.get('/:employeeId', (req, res, next) => {
  db.get("SELECT * FROM Employee WHERE id = $id", { $id: req.params.employeeId }, function(err, row){
    if (err) {
      return res.sendStatus(500);
    } else {
      res.status(200).send({employee:row});
    }
  });
});

// POST /api/employees
employeeRouter.post('/', validateEmployeeFields, (req, res, next) => {
  db.run("INSERT INTO Employee (name, position, wage) VALUES ($name, $position, $wage)", {$name: req.body.employee.name, $position: req.body.employee.position, $wage: req.body.employee.wage}, function(err){
    if (err) {
      return res.sendStatus(500);
    } else {
      db.get("SELECT * FROM Employee WHERE id = $id", { $id: this.lastID }, function(err, row){
        if (err) {
          return res.sendStatus(500);
        } else {
          res.status(201).send({employee:row});
        }
      });
    }
  });
});

// PUT /api/employees/:employeeId
employeeRouter.put('/:employeeId', validateEmployeeFields, (req, res, next) => {
  db.run("UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE id = $id", {$name: req.body.employee.name, $position: req.body.employee.position, $wage: req.body.employee.wage, $id: req.params.employeeId}, function(err){
    if (err) {
      return res.sendStatus(500);
    } else {
      db.get("SELECT * FROM Employee WHERE id = $id", {$id: req.params.employeeId}, function(err, row){
        if (err) {
          return res.sendStatus(500);
        } else {
          res.status(200).send({employee:row});
        }
      });
    }
  });
});

// DELETE /api/employees/:employeeId
employeeRouter.delete('/:employeeId', (req, res, next) => {
  db.run("UPDATE Employee SET is_current_employee = 0 WHERE id = $id", { $id: req.params.employeeId }, function(err){
    if (err) {
      return res.sendStatus(500);
    } else {
      db.get("SELECT * FROM Employee WHERE id = $id", { $id: req.params.employeeId}, function(err, row){
        if (err) {
          return res.sendStatus(500);
        } else {
            res.status(200).send({employee:row});
        }
      });
    }
  });
});

// Timesheet Routes
employeeRouter.use('/:employeeId/timesheets', timesheetsRouter);

module.exports = employeeRouter;
