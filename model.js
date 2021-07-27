const { Sequelize, Model, DataTypes } = require("sequelize");

const db = new Sequelize(
  "postgres://postgres:password@localhost:5432/postgres"
);

db.authenticate().then(
  console.log(`Connected to ${db.getDatabaseName}@localhost:5432`)
);

const tokens = db.define("tokens", {
  token: { type: DataTypes.STRING, primaryKey: true },
  expiryDate: { type: DataTypes.DATE },
});

const account = db.define("account", {
  username: { primaryKey: true, type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  usertoken: { type: DataTypes.STRING, allowNull: true },
  balance: { type: DataTypes.DOUBLE, allowNull: true, defaultValue: 0 },
});

account
  .sync()
  .then(console.info(`Table ${account.getTableName()} synced to Database`));

tokens
  .sync()
  .then(console.info(`Table ${account.getTableName()} synced to Database`));

module.exports.dbConnection = db;
module.exports.tables = { account, tokens };
