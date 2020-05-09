const db = require('../persistence/db');

module.exports.up = async function (next) {
  const client = await db.connect();

  await client.query(`
  CREATE TABLE IF NOT EXISTS productive_msisdn (
    MSISDN varchar (254) NOT NULL,
    MO int NOT NULL DEFAULT '0',
    MT int NOT NULL DEFAULT '0',
    Internet float NOT NULL DEFAULT '0',
    Sms int NOT NULL DEFAULT '0',
    Service smallint DEFAULT NULL,
    DataFromHK smallint NOT NULL DEFAULT '0',
    DataFromTST smallint NOT NULL DEFAULT '0',
    Day int NOT NULL DEFAULT '1',
    Month varchar (254) NOT NULL,
    Year varchar (254) NOT NULL,
    unique_idx varchar (254) NOT NULL unique,
    dtModified timestamp NOT NULL default current_timestamp,
    dtRecord timestamp NOT NULL default current_timestamp
  )
  `);

  await client.query(`
  CREATE INDEX productive_msisdn_unique_idx on productive_msisdn (unique_idx);
  `);

  await client.release(true);
  next()
}

module.exports.down = async function (next) {
  const client = await db.connect();

  await client.query(`
  DROP TABLE productive_msisdn;
  `);

  await client.release(true);
  next()
}
