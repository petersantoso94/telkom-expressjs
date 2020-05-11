const {
  Router
} = require('express');
const Inventory = require('../persistence/inventory');

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
    await Inventory.create(req.body).catch(err => {
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

module.exports = router;
