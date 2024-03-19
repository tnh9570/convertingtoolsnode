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
    connectionTimeout: 86400000, // 24시간
    requestTimeout: 86400000 // 24시간
};

// 전체데이터입력

// async function fetchCustInfo() {
//     try {
//         await sql.connect(sqlConfig);
//         const result = await sql.query('SELECT  * FROM CUST_INFO');
//         return result.recordset;
//     } catch (err) {
//         console.error('CUST_INFO 데이터 가져오기 실패:', err);
//         throw err;
//     } finally {
//         await sql.close();
//     }
// }

// async function fetchMdclDaySpeData() {
//     try {
//         await sql.connect(sqlConfig);
//         const result = await sql.query('SELECT  MI.*, MDS.* FROM MDCL_INFO MI INNER JOIN MDCL_DAY_SPE_CNTN MDS ON MI.CUST_NO = MDS.CUST_NO AND MI.ENTR_DAY = MDS.ENTR_DAY');
//         return result.recordset;
//     } catch (err) {
//         console.error('MDCL_DAY_SPE_CNTN 데이터 가져오기 실패:', err);
//         throw err;
//     } finally {
//         await sql.close();
//     }
// }

// async function fetchMdclInfoData() {
//     try {
//         await sql.connect(sqlConfig);
//         const result = await sql.query('SELECT DISTINCT MDCL_INFO.CUST_NO, MDCL_INFO.ENTR_DAY, MDCL_INFO.*, MDCL_DAY_SPE_CNTN.SPE_CNTN FROM MDCL_INFO JOIN MDCL_DAY_SPE_CNTN ON MDCL_INFO.CUST_NO = MDCL_DAY_SPE_CNTN.CUST_NO AND MDCL_INFO.ENTR_DAY = MDCL_DAY_SPE_CNTN.ENTR_DAY');
//         return result.recordset;
//     } catch (err) {
//         console.error('MDCL_INFO 데이터 가져오기 실패:', err);
//         throw err;
//     } finally {
//         await sql.close();
//     }
// }

// async function fetchRcptData() {
//     try {
//         await sql.connect(sqlConfig);
//         const result = await sql.query('SELECT  * FROM RCPT_INFO');
//         return result.recordset;
//     } catch (err) {
//         console.error('RCPT_INFO 데이터 가져오기 실패:', err);
//         throw err;
//     } finally {
//         await sql.close();
//     }
// }
// // 5
// async function fetchSickData() {
//     try {
//         await sql.connect(sqlConfig);
//         const result = await sql.query('SELECT  * FROM (SELECT P.*, I.ITNT_CD, I.KOR_NAME, I.ENG_NAME, ROW_NUMBER() OVER (ORDER BY P.CUST_NO, P.ENTR_DAY, P.SORT_NO) AS SN FROM SICK_CNTN P LEFT OUTER JOIN USE_SICK_INFO I ON P.USE_SICK_CD = I.USE_SICK_CD ) AS T');
//         await sql.close();
//         return result.recordset;
//     } catch (err) {
//         console.error('Sick 데이터 가져오기 실패:', err);
//         await sql.close();
//         throw err;
//     }
// }

// // 6
// async function fetchPrscData() {
//     try {
//         await sql.connect(sqlConfig);
//         const result = await sql.query('SELECT  * FROM ( SELECT CS.*, ISNULL(CS.CLAIM_CD, CS.USE_PRSC_CD) AS ITEMCODE, ISNULL(U.USE_NAME, CS.USE_PRSC_CD) AS ITEMTITLE, ROW_NUMBER() OVER (ORDER BY CS.CUST_NO, CS.MDCL_SEQNO, CS.PRSC_SEQNO) AS SN FROM PRSC_CNTN CS LEFT JOIN USE_PRSC_INFO U ON CS.USE_PRSC_CD = U.USE_PRSC_CD ) T');
//         await sql.close();
//         return result.recordset;
//     } catch (err) {
//         console.error('Prsc 데이터 가져오기 실패:', err);
//         await sql.close();
//         throw err;
//     }
// }

// // 7
// async function fetchMdclRsvData() {
//     try {
//         await sql.connect(sqlConfig);
//         const result = await sql.query('SELECT  * FROM ( SELECT M.*, ROW_NUMBER() OVER (ORDER BY M.RSV_DAY, M.CUST_NO, M.RSV_SEQNO) AS SN FROM MDCL_RSV M ) AS X');
//         await sql.close();
//         return result.recordset;
//     } catch (err) {
//         console.error('MdclRsv 데이터 가져오기 실패:', err);
//         await sql.close();
//         throw err;
//     }
// }

// // 8
// async function fetchCrCsttDtalCntnData() {
//     try {
//         await sql.connect(sqlConfig);
//         const result = await sql.query('SELECT  * FROM ( SELECT  M.*, ROW_NUMBER() OVER (ORDER BY M.ENTR_DAY, M.CUST_NO, M.CSTT_SEQNO) AS SN FROM CRM_CSTT_DTAL_CNTN M ) AS X');
//         await sql.close();
//         return result.recordset;
//     } catch (err) {
//         console.error('CrCsttDtal 데이터 가져오기 실패:', err);
//         await sql.close();
//         throw err;
//     }
// }

// // 9
// async function fetchStomCntnData() {
//     try {
//         await sql.connect(sqlConfig);
//         const result = await sql.query('SELECT  * FROM ( SELECT  M.*, ROW_NUMBER() OVER (ORDER BY M.ENTR_DAY, M.CUST_NO, M.MDCL_SEQNO) AS SN FROM STOM_CNTN M ) AS X');
//         await sql.close();
//         return result.recordset;
//     } catch (err) {
//         console.error('stomCntn 데이터 가져오기 실패:', err);
//         await sql.close();
//         throw err;
//     }
// }

// async function fetchMdclDayMemoData() {
//     try {
//         await sql.connect(sqlConfig);
//         const result = await sql.query('SELECT  * FROM MDCL_DAY_MEMO');
//         await sql.close();
//         return result.recordset;
//     } catch (err) {
//         console.error('mdclDayMemo 데이터 가져오기 실패:', err);
//         await sql.close();
//         throw err;
//     }
// }

// async function fetchSprtRoomData() {
//     try {
//         await sql.connect(sqlConfig);
//         const result = await sql.query('SELECT  * FROM SPRT_ROOM_DLVR_DTAL');
//         await sql.close();
//         return result.recordset;
//     } catch (err) {
//         console.error('sprtRoom 데이터 가져오기 실패:', err);
//         await sql.close();
//         throw err;
//     }
// }

// 100개 테스트용

async function fetchCustInfo() {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query('SELECT TOP 100  * FROM CUST_INFO');
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
        const result = await sql.query('SELECT TOP 100  MI.*, MDS.* FROM MDCL_INFO MI INNER JOIN MDCL_DAY_SPE_CNTN MDS ON MI.CUST_NO = MDS.CUST_NO AND MI.ENTR_DAY = MDS.ENTR_DAY');
        return result.recordset;
    } catch (err) {
        console.error('MDCL_DAY_SPE_CNTN 데이터 가져오기 실패:', err);
        throw err;
    } finally {
        await sql.close();
    }
}

async function fetchMdclInfoData() {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query('SELECT TOP 100 DISTINCT MDCL_INFO.CUST_NO, MDCL_INFO.ENTR_DAY, MDCL_INFO.*, MDCL_DAY_SPE_CNTN.SPE_CNTN FROM MDCL_INFO JOIN MDCL_DAY_SPE_CNTN ON MDCL_INFO.CUST_NO = MDCL_DAY_SPE_CNTN.CUST_NO AND MDCL_INFO.ENTR_DAY = MDCL_DAY_SPE_CNTN.ENTR_DAY');
        return result.recordset;
    } catch (err) {
        console.error('MDCL_INFO 데이터 가져오기 실패:', err);
        throw err;
    } finally {
        await sql.close();
    }
}

async function fetchRcptData() {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query('SELECT TOP 100  * FROM RCPT_INFO');
        return result.recordset;
    } catch (err) {
        console.error('RCPT_INFO 데이터 가져오기 실패:', err);
        throw err;
    } finally {
        await sql.close();
    }
}
// 5
async function fetchSickData() {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query('SELECT TOP 100  * FROM (SELECT P.*, I.ITNT_CD, I.KOR_NAME, I.ENG_NAME, ROW_NUMBER() OVER (ORDER BY P.CUST_NO, P.ENTR_DAY, P.SORT_NO) AS SN FROM SICK_CNTN P LEFT OUTER JOIN USE_SICK_INFO I ON P.USE_SICK_CD = I.USE_SICK_CD ) AS T');
        await sql.close();
        return result.recordset;
    } catch (err) {
        console.error('Sick 데이터 가져오기 실패:', err);
        await sql.close();
        throw err;
    }
}

// 6
async function fetchPrscData() {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query('SELECT TOP 100 * FROM ( SELECT CS.*, ISNULL(CS.CLAIM_CD, CS.USE_PRSC_CD) AS ITEMCODE, ISNULL(U.USE_NAME, CS.USE_PRSC_CD) AS ITEMTITLE, ROW_NUMBER() OVER (ORDER BY CS.CUST_NO, CS.MDCL_SEQNO, CS.PRSC_SEQNO) AS SN FROM PRSC_CNTN CS LEFT JOIN USE_PRSC_INFO U ON CS.USE_PRSC_CD = U.USE_PRSC_CD ) T');
        await sql.close();
        return result.recordset;
    } catch (err) {
        console.error('Prsc 데이터 가져오기 실패:', err);
        await sql.close();
        throw err;
    }
}

// 7
async function fetchMdclRsvData() {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query('SELECT TOP 100  * FROM ( SELECT M.*, ROW_NUMBER() OVER (ORDER BY M.RSV_DAY, M.CUST_NO, M.RSV_SEQNO) AS SN FROM MDCL_RSV M ) AS X');
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
        const result = await sql.query('SELECT TOP 100  * FROM ( SELECT  M.*, ROW_NUMBER() OVER (ORDER BY M.ENTR_DAY, M.CUST_NO, M.CSTT_SEQNO) AS SN FROM CRM_CSTT_DTAL_CNTN M ) AS X');
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
        const result = await sql.query('SELECT TOP 100  * FROM ( SELECT  M.*, ROW_NUMBER() OVER (ORDER BY M.ENTR_DAY, M.CUST_NO, M.MDCL_SEQNO) AS SN FROM STOM_CNTN M ) AS X');
        await sql.close();
        return result.recordset;
    } catch (err) {
        console.error('stomCntn 데이터 가져오기 실패:', err);
        await sql.close();
        throw err;
    }
}

async function fetchMdclDayMemoData() {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query('SELECT TOP 100  * FROM MDCL_DAY_MEMO');
        await sql.close();
        return result.recordset;
    } catch (err) {
        console.error('mdclDayMemo 데이터 가져오기 실패:', err);
        await sql.close();
        throw err;
    }
}

async function fetchSprtRoomData() {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query('SELECT TOP 100  * FROM SPRT_ROOM_DLVR_DTAL');
        await sql.close();
        return result.recordset;
    } catch (err) {
        console.error('sprtRoom 데이터 가져오기 실패:', err);
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