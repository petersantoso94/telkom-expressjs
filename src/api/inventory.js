const {
  Router
} = require('express');
const Inventory = require('../persistence/inventory');
const InventoryMovement = require('../persistence/inventory-movement');

const sessionMiddleware = require('../middleware/session-middleware');
const router = new Router();

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
    await Inventory.create(req.body, req.userId).catch(err => {
      console.error(
        `POST inventories >> ${err.stack})`
      );
      res.status(400).json();
      return
    });
    await InventoryMovement.shipin(inv_move, req.userId).catch(err => {
      console.error(
        `POST inventory_movements >> ${err.stack})`
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

module.exports = router;
