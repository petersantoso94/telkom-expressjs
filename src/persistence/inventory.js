const db = require('./db');

module.exports = {
  async create(inventories, user_id) {
    let invQueryString = "VALUES ";
    invQueryString += inventories.map(inv => `('${inv.Serial_Number}', '${inv.Price}', 0, 'false', '${inv.Warehouse}', '${inv.Type}', '${inv.MSISDN}', '${inv.Provider}', '${inv.Voucher_Value}', '${inv.Remark_Inv}', '${user_id}', '${user_id}')`).join(', ');

    await db.query(`INSERT INTO inventory (Serial_Number, Price, Status, Missing, Warehouse, Type, MSISDN, Provider, Voucher_Value, Remark_Inv, user_Record, user_Update) ${invQueryString};`);
  }
}
