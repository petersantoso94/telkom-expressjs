const db = require('./db');
const {
  v4: uuidv4
} = require('uuid');

module.exports = {
  async create(inventory_movements, user_id, status) {

    let invQueryString = "VALUES ";
    invQueryString += inventory_movements.map(inv => {
      const id = uuidv4();
      return `('${id}','${inv.Serial_Number}', '${inv.Price}', ${status}, 'false', '${inv.Warehouse}', '${inv.Form_Number}', '${inv.Fabiao_Number}', '${new Date().toISOString().slice(0, 10)}', '${inv.Remark}', '${user_id}', '${user_id}')`
    }).join(', ');

    await db.query(`INSERT INTO inventory_movement (ID, Serial_Number, Price, Status, Deleted, Warehouse, Form_Number, Fabiao_Number, Date, Remark, user_Record, user_Update) ${invQueryString};`);
  }
}
