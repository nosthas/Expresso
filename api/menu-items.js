const express = require('express');
const menuItemsRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// :menuItemId Param Router
menuItemsRouter.param('menuItemId', (req, res, next, id) => {
  db.get("SELECT * FROM MenuItem WHERE id = $id", { $id: id}, function(err, row){
    if (!row) {
      return res.sendStatus(404);
    } else {
      req.body.menuItemId = id;
      next();
    }
  });
});

// Validate MenuItems Fields Middleware
const validateMenuItemsFields = (req, res, next) => {
  if (!req.body.menuItem || !req.body.menuItem.name || !req.body.menuItem.description || !req.body.menuItem.inventory || !req.body.menuItem.price) {
    return res.sendStatus(400);
  } else {
    next();
  }
};

// GET /api/menus/:menuId/menu-items
menuItemsRouter.get('/', (req, res, next) => {
  db.all("SELECT * FROM MenuItem WHERE menu_id = $menu_id" , { $menu_id: req.body.menuId}, function(err, rows){
    if (err) {
      return res.sendStatus(500);
    } else {
      res.status(200).send({menuItems:rows});
    }
  })
});

// POST /api/menus/:menuId/menu-items
menuItemsRouter.post('/', validateMenuItemsFields, (req, res, next) => {
  db.run("INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menu_id)", { $name: req.body.menuItem.name, $description:req.body.menuItem.description, $inventory:req.body.menuItem.inventory, $price:req.body.menuItem.price, $menu_id: req.body.menuId }, function(err){
    if (err) {
      return res.sendStatus(500);
    } else {
      db.get("SELECT * FROM MenuItem WHERE id = $id", { $id: this.lastID }, function(err, row){
        if (err) {
          return res.sendStatus(500);
        } else {
          res.status(201).send({menuItem:row});
        }
      });
    }
  });
});

// PUT /api/menus/:menuId/menu-items/:menuItemId
menuItemsRouter.put('/:menuItemId', validateMenuItemsFields, (req, res, next) => {
  db.run("UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menu_id WHERE id = $id", { $name:req.body.menuItem.name, $description:req.body.menuItem.description, $inventory:req.body.menuItem.inventory, $price:req.body.menuItem.price, $menu_id:req.body.menuId, $id:req.body.menuItemId}, function(err){
    if (err) {
      return res.sendStatus(500);
    } else {
      db.get("SELECT * FROM MenuItem WHERE id = $id", { $id: req.body.menuItemId }, function(err, row){
        if (err) {
          return res.sendStatus(500);
        } else {
          res.status(200).send({menuItem:row});
        }
      });
    }
  });
});

// DELETE /api/menus/:menuId/menu-items/:menuItemId
menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  db.run("DELETE FROM MenuItem WHERE id = $id", { $id: req.body.menuItemId}, function(err){
    if (err) {
      return res.sendStatus(500);
    } else {
      return res.sendStatus(204);
    }
  });
});

module.exports = menuItemsRouter;
