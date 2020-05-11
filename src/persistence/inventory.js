const db = require('./db');

module.exports = {
  async create(inventories) {
    let invQueryString = "VALUES ";
    invQueryString += inventories.map(inv => `('${inv.Serial_Number}', '${inv.Price}', '${inv.Missing}', '${inv.Status}', '${inv.Warehouse}', '${inv.Type}', '${inv.MSISDN}', '${inv.Provider}', '${inv.Voucher_Value}', '${inv.Activation_Date}', '${inv.Activation_Name}', '${inv.Activation_Store}', '${inv.Channel}', '${inv.Churn_Date}', '${inv.Valid_Date}', '${inv.Apf_Date}', '${inv.Apf_Activation}', '${inv.TopUp_MSISDN}', '${inv.TopUp_Date}', '${inv.Remark_Inv}', '${inv.user_Record}', '${inv.user_Update}')`).join(', ');

    console.log(invQueryString)
    await db.query(`INSERT INTO inventory (Serial_Number, Price, Missing, Status, Warehouse, Type, MSISDN, Provider, Voucher_Value, Activation_Date, Activation_Name, Activation_Store, Channel, Churn_Date, Valid_Date, Apf_Date, Apf_Activation, TopUp_MSISDN, TopUp_Date, Remark_Inv, user_Record, user_Update) ${invQueryString};`);
  }
}
