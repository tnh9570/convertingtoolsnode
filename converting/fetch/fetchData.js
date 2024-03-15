const sql = require('mssql');


const sqlConfig = {
    user: 'sa',
    password: '@1023ldde1023',
    server: 'DESKTOP-VI1EG1F',
    database: 'Almighty',
    options: {
        encrypt: false,
    },
    port: 1433,
};

async function getfetchCustData() {
    try {
        // 데이터베이스 연결
        const pool = await sql.connect(sqlConfig);

        // 쿼리 실행 (각각 100개만 가져오도록 수정)
        const result = await pool.request().query('SELECT TOP 100 * FROM CUST_INFO');

        // 연결 해제
        await pool.close();

        return { custData: result.recordset };

    } catch (err) {
        console.error(err);
    }
}

async function getfetchMdclData() {
    try {
        // 데이터베이스 연결
        const pool = await sql.connect(sqlConfig);

        // 쿼리 실행 (각각 100개만 가져오도록 수정)
        const result = await pool.request().query('SELECT TOP 100 * FROM MDCL_DAY_SPE_CNTN');

        // 연결 해제
        await pool.close();

        return { mdclData: result.recordset };

    } catch (err) {
        console.error(err);
    }
}

async function getfetchMdclInfoData() {
    try {
        // 데이터베이스 연결
        const pool = await sql.connect(sqlConfig);

        // 쿼리 실행 (각각 100개만 가져오도록 수정)
        const result = await pool.request().query('SELECT TOP 100 * FROM MDCL_INFO');

        // 연결 해제
        await pool.close();

        return { mdclInfoData: result.recordset };

    } catch (err) {
        console.error(err);
    }
}

async function getfetchRcptData() {
    try {
        // 데이터베이스 연결
        const pool = await sql.connect(sqlConfig);

        // 쿼리 실행 (각각 100개만 가져오도록 수정)
        const result = await pool.request().query('SELECT TOP 100 * FROM RCPT_INFO');

        // 연결 해제
        await pool.close();

        return { rcptData: result.recordset };

    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    getfetchCustData,
    getfetchMdclData,
    getfetchMdclInfoData,
    getfetchRcptData
};