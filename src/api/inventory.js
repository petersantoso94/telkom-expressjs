const {
  Router
} = require('express');
const Inventory = require('../persistence/inventory');
const InventoryMovement = require('../persistence/inventory-movement');

const sessionMiddleware = require('../middleware/session-middleware');
const router = new Router();

//0->shipin,1->return, 2->shipout, 3->warehouse, 4-> Consignment
const Status = {
  Shipin: 0,
  Return: 1,
  Shipout: 2,
  WarehouseMovement: 3,
  Consignment: 4
}

router.post('/', sessionMiddleware, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      res.status(400).json({
        message: 'Need array of objects'
      });
      return;
    }
    if (req.body.length === 0) {
      res.status(400).json({
        message: 'Empty array'
      });
      return;
    }
    let inv_move = [];
    req.body.forEach(({
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
      if (!Serial_Number || !Price || !Warehouse || !Type || !MSISDN || !Provider || !Voucher_Value || !Remark_Inv || !Form_Number || !Fabiao_Number) {
        res.status(400).json({
          message: 'Wrong inventory object fields'
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
      })
    });
    await Inventory.create(req.body, req.userId).then(async () => {
      // create history movement for each inventory with status = shipin
      await InventoryMovement.create(inv_move, req.userId, Status.Shipin).catch(err => {
        console.error(
          `POST inventory_movements >> ${err.stack})`
        );
        res.status(400).json();
        return
      });
    }).catch(err => {
      console.error(
        `POST inventories >> ${err.stack})`
      );
      res.status(400).json();
      return
    });

    res.status(201).json();
  } catch (error) {
    console.error(
      `POST inventories >> ${error.stack})`
    );
    res.status(500).json();
  }

});

router.post('/shipout', sessionMiddleware, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      res.status(400).json({
        message: 'Need array of objects'
      });
      return;
    }
    if (req.body.length === 0) {
      res.status(400).json({
        message: 'Empty array'
      });
      return;
    }
    let inv_move = [];
    let list_serial_number = [];
    req.body.forEach(({
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
      if (!Serial_Number || !Price || !Warehouse || !Type || !MSISDN || !Provider || !Voucher_Value || !Remark_Inv || !Form_Number || !Fabiao_Number) {
        res.status(400).json({
          message: 'Wrong inventory object fields'
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
      })
      //make list_serial_number
      list_serial_number.push(
        Serial_Number
      )
    });
    //check the serial number last status
    await Inventory.getStatusFromSerialNumbers(list_serial_number).then(async (listStatus) => {
      //check if all serial number has status = shipin/return
      list_serial_number = [];
      listStatus.forEach(stat => {
        if (stat.status == Status.Shipin || stat.status == Status.WarehouseMovement || stat.status == Status.Return) {
          list_serial_number.push(stat.serial_number);
        }
      });
      inv_move = inv_move.filter(inv => {
        return list_serial_number.includes(inv.Serial_Number)
      })
      // create history movement for each inventory with status = shipout
      if (list_serial_number.length === 0) {
        res.status(200).json({
          message: 'No inventory updated'
        });
        return;
      }
      await InventoryMovement.create(inv_move, req.userId, Status.Shipout).then(async () => {
        //change the status on inventory
        Inventory.updateStatus(list_serial_number, req.userId, Status.Shipout).then(() => {
          res.status(201).json();
          return;
        }).catch(err => {
          console.error(
            `POST inventory:updateStatus >> ${err.stack})`
          );
          res.status(400).json();
          return
        });

      }).catch(err => {
        console.error(
          `POST inventory_movements:create >> ${err.stack})`
        );
        res.status(400).json();
        return
      });

    }).catch(err => {
      console.error(
        `POST inventory_movements:getStatusFromSerialNumbers >> ${err.stack})`
      );
      res.status(400).json();
      return
    });

  } catch (error) {
    console.error(
      `POST shipout inventories >> ${error.stack})`
    );
    res.status(500).json();
  }
});

module.exports = router;
