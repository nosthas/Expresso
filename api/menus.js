const express = require('express');
const menuRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemsRouter = require('./menu-items');

// :id Param Router
menuRouter.param('menuId', (req, res, next, id) => {
  db.get("SELECT * FROM Menu WHERE id = $id", { $id: id }, function(err, row){
    if (!row) {
      return res.sendStatus(404);
    } else {
      req.body.menuId = id;
      next();
    }
  });
});

// Validate Menu Fields Middleware
const validateMenuFields = (req, res, next) => {
  if (!req.body.menu || !req.body.menu.title) {
    return res.sendStatus(400);
  } else {
    next();
  }
};

// GET /api/menus
menuRouter.get('/', (req, res, next) => {
  db.all("SELECT * FROM Menu", function(err, rows){
    if (err) {
      return res.sendStatus(500);
    } else {
      res.status(200).send({menus:rows});
    }
  });
});

// GET /api/menus/:menuId
menuRouter.get('/:menuId', (req, res, next) => {
  db.get("SELECT * FROM Menu WHERE id = $id", { $id: req.params.menuId }, function(err, row){
    if (err) {
      return res.sendStatus(500);
    } else {
      res.status(200).send({menu:row});
    }
  });
});

// POST /api/menus
menuRouter.post('/', validateMenuFields, (req, res, next) => {
  db.run("INSERT INTO Menu (title) VALUES ($title)", {$title: req.body.menu.title}, function(err){
    if (err) {
      return res.sendStatus(500);
    } else {
      db.get("SELECT * FROM Menu WHERE id = $id", { $id: this.lastID }, function(err, row){
        if (err) {
          return res.sendStatus(500);
        } else {
          res.status(201).send({menu:row});
        }
      });
    }
  });
});

// PUT /api/menus/:menuId
menuRouter.put('/:menuId', validateMenuFields, (req, res, next) => {
  db.run("UPDATE Menu SET title = $title WHERE id = $id", {$title: req.body.menu.title, $id: req.params.menuId}, function(err){
    if (err) {
      return res.sendStatus(500);
    } else {
      db.get("SELECT * FROM Menu WHERE id = $id", {$id: req.params.menuId}, function(err, row){
        if (err) {
          return res.sendStatus(500);
        } else {
          res.status(200).send({menu:row});
        }
      });
    }
  });
});

// DELETE /api/menus/:menuId
menuRouter.delete('/:menuId', (req, res, next) => {
  db.all("SELECT * FROM MenuItem WHERE menu_id = $id", { $id: req.params.menuId }, function(err, rows){
    if (rows.length > 0) {
      return res.sendStatus(400);
    } else {
      db.run("DELETE FROM Menu WHERE id = $id", { $id: req.params.menuId }, function(err){
        if (err) {
          return res.sendStatus(500);
        } else {
          return res.sendStatus(204);
        }
      });
    }
  });
});

// MenuItems Routes
menuRouter.use('/:menuId/menu-items', menuItemsRouter);

module.exports = menuRouter;
