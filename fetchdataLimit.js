const sql = require('mssql');
const sqlConfig = {
    user: 'sa',
    password: '@1023ldde1023',
    server: 'DESKTOP-VI1EG1F',
    database: 'Almighty1',
    options: {
        encrypt: false,
    },
    port: 1433,
    connectionTimeout: 86400000, // 24시간
    requestTimeout: 86400000 // 24시간
};

// 성능 향상을 위한 특정컬럼만 가져오기

// 필요한 컬럼만 가져오는 작업(사용컬럼만으로 수정)
// 연도지정해서 가져오기

async function fetchCustInfo(startRow, endRow) {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query(`
        SELECT *
        FROM (
            SELECT P.*,
                   ROW_NUMBER() OVER (ORDER BY LEN(CUST_NO), CUST_NO) AS SN
            FROM dbo.CUST_INFO P
        ) AS T
        WHERE SN BETWEEN ${startRow} AND ${endRow}
            `);
        return result.recordset;
    } catch (err) {
        console.error('CUST_INFO 데이터 가져오기 실패:', err);
        throw err;
    } finally {
        await sql.close();
    }
}

async function fetchMdclDaySpeData() {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query(`
        SELECT  MI.*, MDS.* 
        FROM MDCL_INFO MI 
        INNER JOIN MDCL_DAY_SPE_CNTN MDS ON MI.CUST_NO = MDS.CUST_NO AND MI.ENTR_DAY = MDS.ENTR_DAY`);
        return result.recordset;
    } catch (err) {
        console.error('MDCL_DAY_SPE_CNTN 데이터 가져오기 실패:', err);
        throw err;
    } finally {
        await sql.close();
    }
}

async function fetchMdclInfoData(startRow, endRow) {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query(`
        SELECT 
            T.CUST_NO, 
            T.MDCL_DAY, 
            T.MDCL_TIME, 
            T.CHRG_DCTR, 
            T.MDCL_ROOM, 
            T.SPE_CNTN,
            T.MDCL_SEQNO,
            T.SN
        FROM (
            SELECT 
                MI.CUST_NO, 
                MI.MDCL_DAY, 
                MI.MDCL_TIME, 
                MI.CHRG_DCTR, 
                MI.MDCL_ROOM, 
                MDS.SPE_CNTN,
                MI.MDCL_SEQNO,
                ROW_NUMBER() OVER (ORDER BY MI.MDCL_DAY, MI.MDCL_TIME) AS SN
            FROM MDCL_INFO MI
            INNER JOIN MDCL_DAY_SPE_CNTN MDS 
                ON MI.CUST_NO = MDS.CUST_NO 
                AND MI.MDCL_DAY = MDS.ENTR_DAY
        ) AS T WHERE SN BETWEEN ${startRow} AND ${endRow}
    `);
        return result.recordset;
    } catch (err) {
        console.error('MDCL_INFO 데이터 가져오기 실패:', err);
        throw err;
    } finally {
        await sql.close();
    }
}

// writePaymentCardCash
async function fetchRcptData(startRow, endRow) {
    try {
        await sql.connect(sqlConfig);
        // 필요한 컬럼만 선택하도록 쿼리 수정
        const result = await sql.query(`
        SELECT 
        T.CUST_NO, 
        T.ENTR_DAY, 
        T.CARD_RCPT_AMT, 
        T.CASH_RCPT_AMT,
        T.SN
    FROM (
        SELECT 
            CUST_NO, 
            ENTR_DAY, 
            CARD_RCPT_AMT, 
            CASH_RCPT_AMT,
            ROW_NUMBER() OVER (ORDER BY CUST_NO, ENTR_DAY) AS SN
        FROM RCPT_INFO
    ) AS T WHERE SN BETWEEN ${startRow} AND ${endRow}
        `);
        return result.recordset;
    } catch (err) {
        console.error('RCPT_INFO 데이터 가져오기 실패:', err);
        throw err;
    } finally {
        await sql.close();
    }
}

// writeDisease
async function fetchSickData(startRow, endRow) {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query(`
        SELECT   * 
        FROM 
        (SELECT P.*, I.ITNT_CD, I.KOR_NAME, I.ENG_NAME, ROW_NUMBER() OVER (ORDER BY P.CUST_NO, P.ENTR_DAY, P.SORT_NO) AS SN FROM SICK_CNTN P 
        LEFT OUTER JOIN USE_SICK_INFO I ON P.USE_SICK_CD = I.USE_SICK_CD )
         AS T WHERE SN BETWEEN ${startRow} AND ${endRow}`);
        await sql.close();
        return result.recordset;
    } catch (err) {
        console.error('Sick 데이터 가져오기 실패:', err);
        await sql.close();
        throw err;
    }
}

// writeMedicalItem
async function fetchPrscData(startRow, endRow) {
    try {
        await sql.connect(sqlConfig);
        // 필요한 컬럼만 선택하도록 쿼리 수정
        const result = await sql.query(`
        SELECT 
        T.CUST_NO, 
        T.ENTR_DAY, 
        T.ITEMCODE, 
        T.ITEMTITLE, 
        T.CLAIM_AMT, 
        T.TOT_MDCT_QTY, 
        T.MDCT_QTY, 
        T.MDCT_CNT,
        T.SN
    FROM (
        SELECT 
            CS.CUST_NO, 
            CS.ENTR_DAY, 
            ISNULL(CS.CLAIM_CD, CS.USE_PRSC_CD) AS ITEMCODE, 
            ISNULL(U.USE_NAME, CS.USE_PRSC_CD) AS ITEMTITLE, 
            CS.CLAIM_AMT, 
            CS.TOT_MDCT_QTY, 
            CS.MDCT_QTY, 
            CS.MDCT_CNT,
            ROW_NUMBER() OVER (ORDER BY CS.CUST_NO, CS.MDCL_SEQNO, CS.PRSC_SEQNO) AS SN
        FROM PRSC_CNTN CS
        LEFT JOIN USE_PRSC_INFO U ON CS.USE_PRSC_CD = U.USE_PRSC_CD
    ) AS T WHERE SN BETWEEN ${startRow} AND ${endRow}
        `);
        await sql.close();
        return result.recordset;
    } catch (err) {
        console.error('Prsc 데이터 가져오기 실패:', err);
        await sql.close();
        throw err;
    }
}

// writeCustomerMemoMdclRsv
async function fetchMdclRsvData(startRow, endRow) {
    try {
        await sql.connect(sqlConfig);
        // 필요한 컬럼만 선택하도록 쿼리 수정
        const result = await sql.query(`
        SELECT 
        T.CUST_NO, 
        T.RSV_DAY, 
        T.RSV_TIME, 
        T.MDCL_ROOM, 
        T.CHRG_DCTR, 
        T.MDCL_SEQNO, 
        T.RSV_MEMO,
        T.SN
    FROM (
        SELECT 
            M.CUST_NO, 
            M.RSV_DAY, 
            M.RSV_TIME, 
            M.MDCL_ROOM, 
            M.CHRG_DCTR, 
            M.MDCL_SEQNO, 
            M.RSV_MEMO,
            ROW_NUMBER() OVER (ORDER BY M.RSV_DAY, M.CUST_NO, M.RSV_SEQNO) AS SN
        FROM MDCL_RSV M
    ) AS T WHERE SN BETWEEN ${startRow} AND ${endRow}
        `);
        await sql.close();
        return result.recordset;
    } catch (err) {
        console.error('MdclRsv 데이터 가져오기 실패:', err);
        await sql.close();
        throw err;
    }
}

// 8
async function fetchCrCsttDtalCntnData() {
    try {
        await sql.connect(sqlConfig);
        // 필요한 컬럼만 선택하도록 쿼리 수정
        const result = await sql.query(`
        SELECT   * FROM ( SELECT  M.*, ROW_NUMBER() OVER (ORDER BY M.ENTR_DAY, M.CUST_NO, M.CSTT_SEQNO) AS SN FROM CRM_CSTT_DTAL_CNTN M ) AS X
        `);
        await sql.close();
        return result.recordset;
    } catch (err) {
        console.error('CrCsttDtal 데이터 가져오기 실패:', err);
        await sql.close();
        throw err;
    }
}

// 9
async function fetchStomCntnData() {
    try {
        await sql.connect(sqlConfig);
        // 필요한 컬럼만 선택하도록 쿼리 수정
        const result = await sql.query(`
            SELECT 
                M.CUST_NO, 
                M.ENTR_DAY, 
                M.ENTR_TIME, 
                M.STOM_DESC, 
                M.MDCL_SEQNO
            FROM STOM_CNTN M
            ORDER BY M.ENTR_DAY, M.CUST_NO, M.MDCL_SEQNO
        `);
        await sql.close();
        return result.recordset;
    } catch (err) {
        console.error('StomCntn 데이터 가져오기 실패:', err);
        await sql.close();
        throw err;
    }
}

async function fetchMdclDayMemoData() {
    try {
        await sql.connect(sqlConfig);
        // 필요한 컬럼만 선택하도록 쿼리 수정
        const result = await sql.query(`
            SELECT 
                CUST_NO, 
                MDCL_MEMO, 
                MDCL_DAY
            FROM MDCL_DAY_MEMO
        `);
        await sql.close();
        return result.recordset;
    } catch (err) {
        console.error('MdclDayMemo 데이터 가져오기 실패:', err);
        await sql.close();
        throw err;
    }
}

async function fetchSprtRoomData() {
    try {
        await sql.connect(sqlConfig);
        // 필요한 컬럼만 선택하도록 쿼리 수정
        const result = await sql.query(`
            SELECT 
                CUST_NO, 
                DLVR_DTAL, 
                DLVR_DAY
            FROM SPRT_ROOM_DLVR_DTAL
        `);
        await sql.close();
        return result.recordset;
    } catch (err) {
        console.error('SprtRoom 데이터 가져오기 실패:', err);
        await sql.close();
        throw err;
    }
}

module.exports = {
    fetchCustInfo,
    fetchMdclDaySpeData,
    fetchMdclInfoData,
    fetchRcptData,
    fetchSickData,
    fetchPrscData,
    fetchMdclRsvData,
    fetchCrCsttDtalCntnData,
    fetchStomCntnData,
    fetchMdclDayMemoData,
    fetchSprtRoomData
};