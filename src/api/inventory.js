const { Router } = require("express");
const Inventory = require("../persistence/inventory");
const InventoryMovement = require("../persistence/inventory-movement");

const sessionMiddleware = require("../middleware/session-middleware");
const router = new Router();

//0->shipin,1->return, 2->shipout, 3->warehouse, 4-> Consignment
const Status = {
  Shipin: 0,
  Return: 1,
  Shipout: 2,
  WarehouseMovement: 3,
  Consignment: 4
};

router.post("/", sessionMiddleware, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      res.status(400).json({
        message: "Need array of objects"
      });
      return;
    }
    if (req.body.length === 0) {
      res.status(400).json({
        message: "Empty array"
      });
      return;
    }
    let inv_move = [];
    req.body.forEach(
      ({
        Serial_Number,
        Price,
        Warehouse,
        Type,
        MSISDN,
        Provider,
        Voucher_Value,
        Remark_Inv,
        Form_Number,
        Fabiao_Number
      }) => {
        if (
          !Serial_Number ||
          !Price ||
          isNaN(Price) ||
          !Warehouse ||
          !Type ||
          !MSISDN ||
          !Provider ||
          !Voucher_Value ||
          !Remark_Inv ||
          !Form_Number ||
          !Fabiao_Number
        ) {
          res.status(400).json({
            message: "Wrong inventory object fields"
          });
          return;
        }
        // make inventory_movement object
        inv_move.push({
          Serial_Number,
          Price,
          Warehouse,
          Form_Number,
          Fabiao_Number,
          Remark: Remark_Inv
        });
      }
    );
    await Inventory.create(req.body, req.userId)
      .then(async () => {
        // create history movement for each inventory with status = shipin
        await InventoryMovement.create(
          inv_move,
          req.userId,
          Status.Shipin
        ).catch(err => {
          console.error(`POST inventory_movements >> ${err.stack})`);
          res.status(400).json();
          return;
        });
      })
      .catch(err => {
        console.error(`POST inventories >> ${err.stack})`);
        res.status(400).json();
        return;
      });

    res.status(201).json();
  } catch (error) {
    console.error(`POST inventories >> ${error.stack})`);
    res.status(500).json();
  }
});

router.post("/return", sessionMiddleware, (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      res.status(400).json({
        message: "Need array of objects"
      });
      return;
    }
    if (req.body.length === 0) {
      res.status(400).json({
        message: "Empty array"
      });
      return;
    }
    MoveInventory(
      req,
      res,
      "Return",
      stat =>
        stat.status == Status.Shipout || stat.status == Status.Consignment,
      Status.Return
    );
  } catch (error) {
    console.error(`POST return inventories >> ${error.stack})`);
    res.status(500).json();
  }
});

router.post("/shipout", sessionMiddleware, (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      res.status(400).json({
        message: "Need array of objects"
      });
      return;
    }
    if (req.body.length === 0) {
      res.status(400).json({
        message: "Empty array"
      });
      return;
    }
    MoveInventory(
      req,
      res,
      "Shipout",
      stat =>
        stat.status == Status.Shipin ||
        stat.status == Status.WarehouseMovement ||
        stat.status == Status.Return,
      Status.Shipout
    );
  } catch (error) {
    console.error(`POST shipout inventories >> ${error.stack})`);
    res.status(500).json();
  }
});

router.post("/warehousemovement", sessionMiddleware, (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      res.status(400).json({
        message: "Need array of objects"
      });
      return;
    }
    if (req.body.length === 0) {
      res.status(400).json({
        message: "Empty array"
      });
      return;
    }
    MoveInventory(
      req,
      res,
      "Warehouse",
      stat =>
        stat.status == Status.Shipin ||
        stat.status == Status.WarehouseMovement ||
        stat.status == Status.Return,
      Status.WarehouseMovement
    );
  } catch (error) {
    console.error(`POST warehouse movement inventories >> ${error.stack})`);
    res.status(500).json();
  }
});

const MoveInventory = (
  req,
  res,
  status_string,
  required_status_condition,
  status
) => {
  let inv_move = [];
  let list_serial_number = [];
  req.body.forEach(
    ({
      Serial_Number,
      Price,
      Warehouse,
      Remark_Inv,
      Form_Number,
      Fabiao_Number
    }) => {
      if (
        !Serial_Number ||
        !Price ||
        isNaN(Price) ||
        !Warehouse ||
        !Remark_Inv ||
        !Form_Number ||
        !Fabiao_Number
      ) {
        res.status(400).json({
          message:
            "Wrong inventory object fields, required (Serial_Number, Price, Warehouse, Remark_Inv, Form_Number, Fabiao_Number)"
        });
        return;
      }
      // make inventory_movement object
      inv_move.push({
        Serial_Number,
        Price,
        Warehouse,
        Form_Number,
        Fabiao_Number,
        Remark: Remark_Inv
      });
      //make list_serial_number
      list_serial_number.push(Serial_Number);
    }
  );
  //check the serial number last status
  Inventory.getStatusFromSerialNumbers(list_serial_number)
    .then(async listStatus => {
      //check if all serial number has status = shipin/return
      list_serial_number = [];
      listStatus.forEach(stat => {
        if (required_status_condition(stat)) {
          list_serial_number.push(stat.serial_number);
        }
      });
      inv_move = inv_move.filter(inv => {
        return list_serial_number.includes(inv.Serial_Number);
      });
      // create history movement for each inventory with status = shipout
      if (list_serial_number.length === 0) {
        res.status(200).json({
          message: "No inventory updated"
        });
        return;
      }
      InventoryMovement.create(inv_move, req.userId, status)
        .then(async () => {
          //change the status on inventory
          Inventory.updateStatus(list_serial_number, req.userId, status)
            .then(() => {
              res.status(201).json();
              return;
            })
            .catch(err => {
              console.error(
                `POST ${status_string} inventory:updateStatus >> ${err.stack})`
              );
              res.status(400).json();
              return;
            });
          if (status == Status.WarehouseMovement) {
            //change the warehouse of inventory
            Inventory.updateWarehouse(inv_move, req.userId)
              .then(() => {
                res.status(201).json();
                return;
              })
              .catch(err => {
                console.error(
                  `POST ${status_string} inventory:updateWarehouse >> ${err.stack})`
                );
                res.status(400).json();
                return;
              });
          }
          if (status == Status.Shipout) {
            // modify the price
            Inventory.updatePrice(inv_move, req.userId)
              .then(() => {
                res.status(201).json();
                return;
              })
              .catch(err => {
                console.error(
                  `POST ${status_string} inventory:updatePrice >> ${err.stack})`
                );
                res.status(400).json();
                return;
              });
          }
        })
        .catch(err => {
          console.error(
            `POST ${status_string} inventory_movements:create >> ${err.stack})`
          );
          res.status(400).json();
          return;
        });
    })
    .catch(err => {
      console.error(
        `POST ${status_string} inventory_movements:getStatusFromSerialNumbers >> ${err.stack})`
      );
      res.status(400).json();
      return;
    });
};

module.exports = router;
