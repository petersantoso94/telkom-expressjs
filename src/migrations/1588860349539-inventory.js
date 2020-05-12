const db = require('../persistence/db');

module.exports.up = async function (next) {
  const client = await db.connect();

  await client.query(`
  CREATE TABLE IF NOT EXISTS inventory (
    Serial_Number varchar (256) NOT NULL PRIMARY KEY,
    Price decimal (10,0) NOT NULL DEFAULT '0',
    Missing boolean NOT NULL DEFAULT FALSE,
    Status integer DEFAULT '0',
    Warehouse varchar (256) DEFAULT 'TELIN TAIWAN',
    Type smallint NOT NULL,
    MSISDN varchar (254) DEFAULT NULL,
    Provider varchar (256) NOT NULL DEFAULT 'Taiwan Star',
    Voucher_Value float DEFAULT NULL,
    Activation_Date date DEFAULT NULL,
    Activation_Name varchar (256) DEFAULT NULL,
    Activation_Store varchar (256) DEFAULT NULL,
    Channel varchar (256) DEFAULT NULL,
    Churn_Date date DEFAULT NULL,
    Valid_Date date DEFAULT NULL,
    Apf_Date date DEFAULT NULL,
    Apf_Activation smallint DEFAULT NULL,
    TopUp_MSISDN varchar (254) DEFAULT NULL,
    TopUp_Date date DEFAULT NULL,
    Remark_Inv text,
    dtRecord timestamp NOT NULL default current_timestamp,
    dtModified timestamp NOT NULL default current_timestamp,
    user_Record uuid NOT NULL,
    user_Update uuid DEFAULT NULL
  )
  `);

  await client.query(`
  CREATE TABLE IF NOT EXISTS inventory_movement (
    ID uuid NOT NULL PRIMARY KEY,
    Serial_Number varchar (256) NOT NULL,
    FOREIGN KEY (Serial_Number) REFERENCES inventory (Serial_Number),
    Sub_Agent varchar (256) DEFAULT NULL,
    Warehouse varchar (256) DEFAULT '',
    Price decimal (10,0) NOT NULL DEFAULT '0',
    Form_Number varchar (256) DEFAULT NULL,
    Fabiao_Number varchar (256) DEFAULT NULL,
    Status smallint NOT NULL DEFAULT '0',
    Deleted boolean NOT NULL DEFAULT FALSE,
    Date date NOT NULL,
    Remark text,
    dtRecord timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dtModified timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_Record uuid NOT NULL,
    user_Update uuid NOT NULL
  )
  `);

  await client.query(`
  comment on column inventory.Status is '0->shipin,1->return, 2->shipout, 3->warehouse, 4-> Consignment';
  comment on column inventory.Type is '4->SIM4G, 1->SIM 2->e-Voucher, 3->p-Voucher';
  comment on column inventory_movement.Status is '0->shipin,1->return, 2->shipout, 3->warehouse, 4-> Consignment';
  `);

  await client.release(true);
  next()
}

module.exports.down = async function (next) {
  const client = await db.connect();

  await client.query(`
  DROP TABLE inventory_movement;
  DROP TABLE inventory;
  `);

  await client.release(true);
  next()
}
