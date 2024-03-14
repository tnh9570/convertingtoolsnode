const sql = require('mssql');

const sqlConfig = {
    user: SQLSERVER_USER,
    password: SQLSERVER_PASSWORD,
    server: SQLSERVER_SERVER,
    database: SQLSERVER_DATABASE,
    options: {
        encrypt: false, // 필요에 따라 수정
      },
    port: SQLSERVER_PORT,
}

module.exports = sqlConfig;