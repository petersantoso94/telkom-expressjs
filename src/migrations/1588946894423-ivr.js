const db = require('../persistence/db');

module.exports.up = async function (next) {
  const client = await db.connect();

  await client.query(`
  CREATE TABLE IF NOT EXISTS ivr (
    MSISDN varchar (254) NOT NULL,
    Date date NOT NULL,
    unique_idx varchar (200) NOT NULL UNIQUE,
    Purchase_Amount decimal(10,0) NOT NULL,
    dtRecord timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dtModified timestamp NOT NULL default current_timestamp,
    Remark text NOT NULL,
    user_Record smallint NOT NULL,
    user_Update smallint NOT NULL
  )
  `);

  await client.query(`
  CREATE INDEX ivr_unique_idx on ivr (unique_idx);
  `);

  await client.release(true);
  next()
}

module.exports.down = async function (next) {
  const client = await db.connect();

  await client.query(`
  DROP INDEX ivr_unique_idx;
  DROP TABLE ivr;
  `);

  await client.release(true);
  next()
}
