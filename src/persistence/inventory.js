const db = require('./db');

module.exports = {
  async create(inventories, user_id) {
    let invQueryString = "VALUES ";
    invQueryString += inventories.map(inv => `('${inv.Serial_Number}', '${inv.Price}', 0, 'false', '${inv.Warehouse}', '${inv.Type}', '${inv.MSISDN}', '${inv.Provider}', '${inv.Voucher_Value}', '${inv.Remark_Inv}', '${user_id}', '${user_id}')`).join(', ');

    await db.query(`INSERT INTO inventory (Serial_Number, Price, Status, Missing, Warehouse, Type, MSISDN, Provider, Voucher_Value, Remark_Inv, user_Record, user_Update) ${invQueryString};`);
  },

  async updateStatus(serial_numbers, user_id, status) {
    let invQueryString = serial_numbers.map(serial => {
      return `('${serial}',${status},'${user_id}')`
    }).join(', ')
    await db.query(`update inventory set Status=tmp.Status, user_Update=tmp.user_Update::uuid from (values ${invQueryString}) as tmp (Serial_Number,Status,user_Update) where inventory.Serial_Number=tmp.Serial_Number;`)
  },

  async getStatusFromSerialNumbers(serial_numbers) {
    const {
      rows
    } = await db.query(`
    SELECT Serial_Number, Status FROM inventory where Serial_Number in ('${serial_numbers.join("', '")}');
    `);
    return rows;
  }
}
