const sql = require('mssql');
const mysql = require('mysql2/promise');

const { fetchCustInfo,
    fetchMdclInfoData,
    fetchRcptData,
    fetchSickData,
    fetchPrscData,
    fetchMdclRsvData,
    fetchCrCsttDtalCntnData,
    fetchStomCntnData,
    fetchMdclDayMemoData,
    fetchSprtRoomData } = require('./fetchdata.js')

// 전역으로 사용할 orgId
const orgId = 37358774;

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '0000',
    database: 'h00044',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 현재시간을 나타내는 코드
function getCurrentDateTimeString() {
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    const formattedDateTime = `${year}${month}${day}${hours}${minutes}${seconds}`;

    return formattedDateTime;
}

// 쿼리실패 코드
async function executeSqlQueries(queries) {
    try {
        return await Promise.all(queries.map(query => sql.query(query)));
    } catch (err) {
        console.error('SQL 쿼리 실행 실패:', err);
        throw err;
    } finally {
        await sql.close();
    }
}

// MYSQL 쿼리 실행 코드
async function executeMySqlQuery(query, values) {
    try {
        const [result] = await pool.execute(query, values);
        return result; // 쿼리 실행 결과 반환
    } catch (err) {
        console.error('MySQL 쿼리 실행 실패:', err);
        throw err;
    }
}

// 기존의 TCUSTOMERPERSONAL에서 존재하는 모든 CUSTNO : CUSTOMERID를 가져오는 코드
async function fetchCustomerCustNo() {

    const data = {};
    const insertQuery = `
        SELECT CUSTNO, CUSTOMERID FROM TCUSTOMERPERSONAL
    `
    try {

        const result = await executeMySqlQuery(insertQuery);

        result.forEach(row => {
            data[row.CUSTNO] = row.CUSTOMERID;
        })

    } catch (err) {
        console.error('Customer 데이터 삽입 중 오류 발생:', err);
    }
    console.log('기존 CUSTNO, CUSTOMERID 가져오기 완료')

    return data
}


async function writecustomerData(custData, custNoData) {
    console.log("writecustomerData 시작");
    const m = new Map();

    // 신규회원 insert쿼리
    const insertCustomerQuery = `
    INSERT INTO tcustomerpersonal (
                   CUSTNAME, CUSTNO, CUSTJN, CUSTDOB, DOBTYPE, CUSTGENDER, CUSTREGDATE, CUSTFSTDATE, CUSTADDR11, CRTIME, 
                   ORGID, CUSTCELL1, CUSTCELL2, CUSTPHONE1, CUSTPHONE2, CUSTEMAIL, CUSTWEB, CUSTSVCAREA,
                   CUSTTYPE, CUSTLVL, CUSTJOB, CUSTPIC, CUSTLSTDATE, CUSTZIPCODE1, CUSTADDR12, CUSTZIPCODE2,
                   CUSTADDR21, CUSTADDR22, CUSTZIPCODE3, CUSTADDR31, CUSTADDR32, CUSTNICKNAME, CUSTINTRE, CUSTINFX, 
                   SURNAME, CUSTMEMO, PERSONALINFO, INTROMEMO, STATE1, TITLE, ETHNICITY, ANNIVERSARY,
                   INSTYPE, TXAGREE, POLICYAGREE, ARBTAGREE, RECVSMSDATE 
                 ) VALUES (
                   ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                   ?, ?, ?, ?, ?, ?, ?, ?,
                   ?, ?, ?, ?, ?, ?, ?, ?, 
                   ?, ?, ?, ?, ?, ?, ?, ?, 
                   ?, ?, ?, ?, ?, ?, ?, ?,
                   ?, ?, ?, ?, ?)
    `;

    // 기존회원 update쿼리
    const updateCustomerQuery = `
    UPDATE tcustomerpersonal SET
        CUSTNAME = ?, CUSTJN = ?, CUSTDOB = ?, DOBTYPE = ?, CUSTGENDER = ?, 
        CUSTREGDATE = ?, CUSTFSTDATE = ?, CUSTADDR11 = ?, CRTIME = ?,ORGID = ?, 
        CUSTCELL1 = ?, CUSTCELL2 = ?, CUSTPHONE1 = ?, CUSTPHONE2 = ?, CUSTEMAIL = ?, 
        CUSTWEB = ?, CUSTSVCAREA = ?,CUSTTYPE = ?, CUSTLVL = ?, CUSTJOB = ?, 
        CUSTPIC = ?, CUSTLSTDATE = ?, CUSTZIPCODE1 = ?, CUSTADDR12 = ?, CUSTZIPCODE2 = ?,
        CUSTADDR21 = ?, CUSTADDR22 = ?, CUSTZIPCODE3 = ?, CUSTADDR31 = ?, CUSTADDR32 = ?, 
        CUSTNICKNAME = ?, CUSTINTRE = ?, CUSTINFX = ?,SURNAME = ?, CUSTMEMO = ?, 
        PERSONALINFO = ?, INTROMEMO = ?, STATE1 = ?, TITLE = ?, ETHNICITY = ?, 
        ANNIVERSARY = ?,INSTYPE = ?, TXAGREE = ?, POLICYAGREE = ?, ARBTAGREE = ?, 
        RECVSMSDATE = ?
    WHERE CUSTNO = ?`;

    // 모든회원의 CUSTNO : CUSTOMERID를 넣어줄 객체
    const costomerId = {}

    const promises = custData.map(async data => {
        if (data.CUST_NO) {
            // 데이터 변환 및 준비 로직
        const ctznnoPrefix = Number(data.CTZN_NO.slice(0, 2)) > 24 ? '19' : '20';
        const ctznno = ctznnoPrefix + data.CTZN_NO.slice(0, 6);
        const gender = data.SEX === 'F' ? 2 : 1;
        const currentDateTimeString = getCurrentDateTimeString();

        const values = [
            data.NAME || '', data.CUST_NO || '', data.CTZN_NO || '', ctznno || '', 0, gender || 0, data.ENTR_DAY || '', data.MDFY_DAY || '', data.ADDR1 + data.ADDR2 || '', currentDateTimeString || '',
            orgId, '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '',
            '', '', 0, '', '', '', '', '',
            '', 0, 0, 0, ''
        ]

        const updateValues = [
            data.NAME || '', data.CTZN_NO || '', ctznno || '', 0, gender || 0,
            data.ENTR_DAY || '', data.MDFY_DAY || '', data.ADDR1 + data.ADDR2 || '', currentDateTimeString || '', orgId,
            '', '', '', '', '',
            '', '', '', '', '',
            '', '', '', '', '',
            '', '', '', '', '',
            '', '', '', '', '',
            0, '', '', '', '',
            '', '', 0, 0, 0,
            '', data.CUST_NO
        ]

        // 기존 회원 확인 쿼리(기존의 것을 확인해야하므로 SELECT문으로 확인)
        // const checkCustomerExistsQuery = `SELECT CUSTOMERID FROM tcustomerpersonal WHERE CUSTNO = ?`;

        try {
            // const [existingCustomer] = await executeMySqlQuery(checkCustomerExistsQuery, [data.CUST_NO]);

            // 키가 존재하면
            if (data.CUST_NO in custNoData) {
                // 기존 회원이 있으면, Map에 저장
                // 기존회원이 존재하면 해당 데이터 update
                console.log(`기존 회원 업데이트 실행 - CUST_NO: ${data.CUST_NO}`);
                const result = await executeMySqlQuery(updateCustomerQuery, updateValues);

                costomerId[data.CUST_NO] = custNoData[data.CUST_NO];
            } else {
                // 존재하지 않는 경우, 새로운 회원 데이터 삽입
                console.log(`신규 회원 추가 실행 - CUST_NO: ${data.CUST_NO}`);
                const result = await executeMySqlQuery(insertCustomerQuery, values);
                costomerId[data.CUST_NO] = result.insertId;
            }
        } catch (err) {
            console.error('Customer 데이터 삽입 중 오류 발생:', err);
        }
        }
    });

    // 모든 프로미스가 완료될 때까지 기다림(병렬처리)
    const results = await Promise.allSettled(promises);
    results.forEach((result, index) => {
        if (result.status === "rejected") {
            console.log(`작업 ${index} 실패:`, result.reason);
        }
    });
    console.log('writecustomerData 완료')

    // costomerId에 CUST_NO : CUSTOMERID(PK) 설정
    m.set('costomerId', costomerId)

    return m
}

async function writeSchedule(mapData, mdclInfoData) {
    // 고려사항
    // SCHEDULEID 저장 객체생성
    // key = CUSTNO, MDCL_DAY 사용자NO, 방문날짜로 확인

    // CUST_NO : CUSTOMEID인 객체 가져온다
    const getCustomerId = mapData.get('costomerId');

    // 스케줄ID, 스케줄date저장
    // 스케줄IdD : CUSTNO 데이터 저장
    const scheduleId = {};
    const scheduleDate = {};


    // 스케줄 insert쿼리
    const insertSchedule = `
    INSERT INTO tcustomerschedule (
        ORGID, CUSTOMERID, RESVTIME, RESVDATE, SCHEDULEDATE, 
        SCHEDULETIME, SCHEDULESTATUS, SCHDOCTOR, SCHNURSE,PHYSICALEMPL, 
        CONSULTTIME, SVCAREA, VISITTYPE, CONSULTNOTE, PROGRESSNOTE, 
        RESVMEMO, NURSEMEMO, BOOKMARK, INSTYPE,DISCD, 
        CRTIME, CONDITION1, CONDITION2, RESVCOUNT, RESVCFM, 
        RESVTMO, RESVTDY, HISTMEMO, EXTRACOST,RESVEMPLID, 
        EXRECALL, TRPLAN, ASSESSMENT, PAYMENTTYPE, MEDCOST, 
        PREGNANT, MIG, NOCON, NOCALC,MODHIST, 
        SUMMARY, TREATMENTROOM, SVCAREA2, REGTYPE, SCHTYPE,
        COLOR, ROOMNO, DURATION, SELFCHCKSTATUS, HOMENURSE,
        ACUPUNCTURE
    ) VALUES (
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?
    )
    `;


    const currentDateTimeString = getCurrentDateTimeString();

    const promises = mdclInfoData.map(async data => {
        // data.CUST_NO이 없으면 하위코드 실행x
        if (data.CUST_NO) {
            // 현재 CUST_NO에 대한 CUSTOMERID
            const customerId = getCustomerId[data.CUST_NO];

            // 데이터 변환 및 준비 로직
            const scheduleTime = data.MDCL_TIME + '00';

            // insertData
            const insertValues = [
                orgId, customerId || 0, '', '', data.MDCL_DAY || '',
                scheduleTime || '', 7, 0, 0, 0,
                '', 0, 0, '', '',
                '', '', 0, 0, 0,
                currentDateTimeString, 0, 0, data.CHRG_DCTR || '', 0,
                0, 0, '', 0, 0,
                0, data.MDCL_ROOM || '', data.SPE_CNTN || '001', customerId || '', data.MDCL_SEQNO || 0,
                0, 0, 0, 0, '',
                '', 0, 0, 0, 0,
                '', 0, 0, 0, '',
                ''
            ];

            try {
                console.log(`스케줄 추가 - CUST_NO: ${data.CUST_NO}`);
                const result = await executeMySqlQuery(insertSchedule, insertValues);
                scheduleId[[customerId, data.ENTR_DAY]] = result.insertId;
                scheduleDate[result.insertId] = data.MDCL_DAY
            } catch (err) {
                console.error('Customer 데이터 삽입 중 오류 발생:', err);
            }
        }
    });

    // 모든 프로미스가 완료될 때까지 기다림
    await Promise.all(promises);

    console.log('writeSchedule 완료');

    // costomerId에 CUST_NO : CUSTOMERID(PK) 설정
    mapData.set('scheduleId', scheduleId);
    mapData.set('scheduleDate', scheduleDate);

    return mapData
}

async function writePaymentCardCash(mapData, inputData) {
    // CUST_NO : CUSTOMERID
    const getCostomerId = mapData.get('costomerId');

    // key: [방문스케줄ID, 방문날짜], value : 스케줄아이디
    const getScheduleId = mapData.get('scheduleId');

    // key: 스케줄ID, value: 스케줄날짜
    const getScheduleDate = mapData.get('scheduleDate');

    const paymentId = {}

    // PAYMENT insert
    const insertPaymentCardQuery = `
    INSERT INTO TPAYMENT (
      ORGID,CUSTOMERID,SCHEDULEID,PAYMENTAMT,PAYLIABILITYAMT,
      PAYMENTCODE,RECEIPTISSUE,BILLISSUE,EMPLOYEEID,PAYNAME,
      DESCRIPTION,REFUNDFLAG,PAYDATE,ORDERDATE,FINALDATE,
      FINALUNPAID,PAYCALFLAG,CRTIME,CASHRECEIPTID,CRISSUED,
      DISCD,TAX,MODTIME
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )`;

    const promises = inputData.map(async data => {
        // CARD_RCPT_AMT > 0일 경우에만 로직수행
        if (data.CARD_RCPT_AMT > 0 && data.CUST_NO) {

            const customerId = getCostomerId[data.CUST_NO];

            const curScheduleId = getScheduleId[`${customerId},${data.ENTR_DAY}`];

            const curScheduleDate = getScheduleDate[curScheduleId];

            const currentDateTimeString = getCurrentDateTimeString();

            const insertValues = [
                orgId, customerId || 0, curScheduleId || 0, Number(data.CARD_RCPT_AMT) || 0, 0,
                "C00", 0, 0, 0, '',
                '', 0, data.ENTR_DAY.toString().replace(/-/g, "").substring(0, 8) || '', curScheduleDate || '', '',
                0, 0, currentDateTimeString || '', '', 0,
                0, 0, ''
            ]

            try {
                // insert 수행 후 payment pk저장
                // SCHEDULEID: paymentId 
                result = await executeMySqlQuery(insertPaymentCardQuery, insertValues);

                paymentId[curScheduleId] = result.insertId;

            } catch (err) {
                console.error('Customer 데이터 삽입 중 오류 발생:', err);
            }

        } else if (data.CASH_RCPT_AMT > 0 && data.CUST_NO) { // CASH_RCPT_AMT > 0일경우 위의로직 수행 하는데 PAYMENTCODE를 "M00"으로 insert
            const customerId = getCostomerId[data.CUST_NO];

            const curScheduleId = getScheduleId[`${customerId},${data.ENTR_DAY}`];

            const curScheduleDate = getScheduleDate[curScheduleId];

            const currentDateTimeString = getCurrentDateTimeString();

            const insertValues = [
                orgId, customerId || '', curScheduleId || 0, Number(data.CARD_RCPT_AMT) || 0, 0,
                "M00", 0, 0, 0, '',
                '', 0, data.ENTR_DAY.toString().replace(/-/g, "").substring(0, 8) || '', curScheduleDate || '', '',
                0, 0, currentDateTimeString || '', '', 0,
                0, 0, ''
            ]

            try {
                // insert 수행 후 payment pk저장
                // SCHEDULEID: paymentId 
                result = await executeMySqlQuery(insertPaymentCardQuery, insertValues);

                paymentId[curScheduleId] = result.insertId;

            } catch (err) {
                console.error('Customer 데이터 삽입 중 오류 발생:', err);
            }
        }
    });

    // 모든 프로미스가 완료될 때까지 기다림
    await Promise.all(promises);

    console.log('writePaymentCardCash 완료');

    // costomerId에 CUST_NO : CUSTOMERID(PK) 설정
    mapData.set('paymentId', paymentId)

    return mapData;
}

async function writeDisease(mapData, inputData) {
    // CUST_NO : CUSTOMERID
    const getCostomerId = mapData.get('costomerId');

    // key: [방문스케줄ID, 방문날짜], value : 스케줄아이디
    const getScheduleId = mapData.get('scheduleId');

    // PAYMENT insert
    const insertDiseaseQuery = `
    INSERT INTO TDIAGNOSISDISEASE (
        SCHEDULEID,ORGID,DISEASECODE,DISEASETYPE,DISEASENAME,
        KCDV6ID,DISEASENAME_EN,SUSPECT,LRCODE,SEQ
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )`;

    const promises = inputData.map(async data => {
        if (data.CUST_NO) {

            const customerId = getCostomerId[data.CUST_NO];

            const curScheduleId = getScheduleId[`${customerId},${data.ENTR_DAY}`];

            // 데이터 변환코드
            let a = 0;
            const mainSickType = data.MAIN_SICK_TYPE.toString().trim();
            a = parseInt(mainSickType, 10);

            let custno = data.CUST_NO.toString().trim();

            if (!isNaN(a)) {
                data.DISEASETYPE = a;
            } else {
                data.DISEASETYPE = 0;
            }
            let diseasename = "";
            let diseasenameEn = "";

            // join결과가 존재하면
            if (data.KOR_NAME) {
                diseasename = "K";
            };

            if (data.ENG_NAME) {
                diseasenameEn = "E";
            };

            const insertValues = [
                curScheduleId || 0, orgId, data.USE_SICK_CD.toString().replace(/\./g, "") || '', data.DISEASETYPE || 0, diseasename,
                custno, diseasenameEn, 0, '', data.SORT_NO
            ]



            try {
                // insert 수행 후 payment pk저장
                // SCHEDULEID: paymentId 
                result = await executeMySqlQuery(insertDiseaseQuery, insertValues);

            } catch (err) {
                console.error('Customer 데이터 삽입 중 오류 발생:', err);
            }

        }
    });

    // 모든 프로미스가 완료될 때까지 기다림
    await Promise.all(promises);

    console.log('writeDisease완료');

    return mapData;
}

async function writeMedicalItem(mapData, inputData) {
    // CUST_NO : CUSTOMERID
    const getCostomerId = mapData.get('costomerId');

    // key: [방문스케줄ID, 방문날짜], value : 스케줄아이디
    const getScheduleId = mapData.get('scheduleId');

    // PAYMENT insert
    const insertMedicalQuery = `
    INSERT INTO TSALEITEM (
      SCHEDULEID,ITEMNAME,ITEMCODE,UNITPRICE,TOTALPRICE,
      CATEGORY,NODAYS,DAILYDOSE,DAILYAPP,DISCOUNT,
      ORGID,ACUPOINT,POSTURE,DESCRIPTION,SPCODE,
      SPDETAIL,EXCLAIM,DURID,INS100,MAXPRICE,
      PRESCMEMO,ACODE,SFLAG,TAX,SAMPLECODE,
      MEMO,SEQ,DOSAGE
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )`;

    const promises = inputData.map(async data => {
        if (data.CUST_NO) {

            const customerId = getCostomerId[data.CUST_NO];

            const curScheduleId = getScheduleId[`${customerId},${data.ENTR_DAY}`];

            // 데이터 변환코드

            const insertValues = [
                curScheduleId || 0, data.ITEMTITLE || 0, data.ITEMCODE || '', data.CLAIM_AMT || 0, 0,
                0, data.TOT_MDCT_QTY || 0, data.MDCT_QTY || 0, data.MDCT_CNT || 0, 0,
                orgId, '', '', '', String(data.CUST_NO).trim() || '',
                '', 0, 0, 0, 0,
                '', '', '', 0, '',
                '', 0, ''
            ]


            try {
                await executeMySqlQuery(insertMedicalQuery, insertValues);

            } catch (err) {
                console.error('Customer 데이터 삽입 중 오류 발생:', err);
            }

        }
    });

    // 모든 프로미스가 완료될 때까지 기다림
    await Promise.all(promises);

    console.log('writeMedicalItem 완료');

    return mapData;
}

async function writeCustomerMemoMdclRsv(mapData, inputData) {
    // CUST_NO : CUSTOMERID
    const getCostomerId = mapData.get('costomerId');

    // key: [방문스케줄ID, 방문날짜], value : 스케줄아이디
    const getScheduleId = mapData.get('scheduleId');

    const currentDateTimeString = getCurrentDateTimeString();

    // PAYMENT insert
    const insertMemoMdclRsvQuery = `
    INSERT INTO tcustomerschedule (
        ORGID, CUSTOMERID, RESVTIME, RESVDATE, SCHEDULEDATE, 
        SCHEDULETIME, SCHEDULESTATUS, SCHDOCTOR, SCHNURSE,PHYSICALEMPL, 
        CONSULTTIME, SVCAREA, VISITTYPE, CONSULTNOTE, PROGRESSNOTE, 
        RESVMEMO, NURSEMEMO, BOOKMARK, INSTYPE,DISCD, 
        CRTIME, CONDITION1, CONDITION2, RESVCOUNT, RESVCFM, 
        RESVTMO, RESVTDY, HISTMEMO, EXTRACOST, RESVEMPLID, 
        EXRECALL, TRPLAN, ASSESSMENT, PAYMENTTYPE, MEDCOST, 
        PREGNANT, MIG, NOCON, NOCALC, MODHIST, 
        SUMMARY, TREATMENTROOM, SVCAREA2, REGTYPE, SCHTYPE,
        COLOR, ROOMNO, DURATION, SELFCHCKSTATUS, HOMENURSE
    ) VALUES (
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
    )`;

    const promises = inputData.map(async data => {
        if (data.CUST_NO) {

            const customerId = getCostomerId[data.CUST_NO];

            // 데이터 변환코드
            CONSULTNOTE = data.RSV_MEMO.toString().trim();
            CONSULTNOTE = CONSULTNOTE.replace(/'/g, "''");
            CONSULTNOTE = CONSULTNOTE.replace(/\\/g, "");

            const insertValues = [
                orgId, customerId || 0, '', '', data.RSV_DAY || '',
                data.RSV_TIME + "00" || '', 0, data.MDCL_ROOM || 0, 0, 0,
                data.RSV_DAY + "00" || '', 0, 0, CONSULTNOTE || '', '',
                '', '', 0, 0, 0,
                currentDateTimeString || '', 0, 0, data.CHRG_DCTR || '', 0,
                0, 0, '', 0, 0,
                0, data.MDCL_ROOM || '', '', customerId || '', data.MDCL_SEQNO || 0,
                0, 0, 0, 0, '',
                '', 0, 0, 0, 0,
                '', 0, 0, 0, ''
            ]


            try {
                await executeMySqlQuery(insertMemoMdclRsvQuery, insertValues);

            } catch (err) {
                console.error('Customer 데이터 삽입 중 오류 발생:', err);
            }

        }
    });

    // 모든 프로미스가 완료될 때까지 기다림
    await Promise.all(promises);

    console.log('writeCustomerMemoMdclRsv 완료');

    return mapData;
}

async function writeCustomerScheduleCrmCsttDtalCntn(mapData, inputData) {
    // CUST_NO : CUSTOMERID
    const getCostomerId = mapData.get('costomerId');

    const currentDateTimeString = getCurrentDateTimeString();

    // PAYMENT insert
    const insertCrmCsttDtalCntnQuery = `
    INSERT INTO tcustomerschedule (
        ORGID, CUSTOMERID, RESVTIME, RESVDATE, SCHEDULEDATE, 
        SCHEDULETIME, SCHEDULESTATUS, SCHDOCTOR, SCHNURSE, PHYSICALEMPL, 
        CONSULTTIME, SVCAREA, VISITTYPE, CONSULTNOTE, PROGRESSNOTE, 
        RESVMEMO, NURSEMEMO, BOOKMARK, INSTYPE, DISCD, 
        CRTIME, CONDITION1, CONDITION2, RESVCOUNT, RESVCFM, 
        RESVTMO, RESVTDY, HISTMEMO, EXTRACOST, RESVEMPLID, 
        EXRECALL, TRPLAN, ASSESSMENT, PAYMENTTYPE, MEDCOST, 
        PREGNANT, MIG, NOCON, NOCALC, MODHIST, 
        SUMMARY, TREATMENTROOM, SVCAREA2, REGTYPE, SCHTYPE,
        COLOR, ROOMNO, DURATION, SELFCHCKSTATUS, HOMENURSE
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
    )`;

    const promises = inputData.map(async data => {
        if (data.CUST_NO) {

            const customerId = getCostomerId[data.CUST_NO];

            // 데이터 변환코드
            CONSULTNOTE = data.CSTT_DTAL.toString().trim();
            CONSULTNOTE = CONSULTNOTE.replace(/'/g, "''");
            CONSULTNOTE = CONSULTNOTE.replace(/\\/g, "");

            const insertValues = [
                orgId, customerId || 0, '', '', data.ENTR_DAY || '',
                data.ENTR_TIME + "00" || '', 0, data.MDCL_ROOM || 0, 0, 0,
                data.ENTR_DAY + "00" || '', 0, 0, CONSULTNOTE || '', '',
                '', '', 0, 0, 0,
                currentDateTimeString || '', 0, 0, '', 0,
                0, 0, '', 0, 0,
                0, '', '', '', 0,
                0, 0, 0, 0, '',
                '', 0, 0, 0, 0,
                '', 0, 0, 0, ''
            ]
            try {
                await executeMySqlQuery(insertCrmCsttDtalCntnQuery, insertValues);

            } catch (err) {
                console.error('Customer 데이터 삽입 중 오류 발생:', err);
            }

        }
    });

    // 모든 프로미스가 완료될 때까지 기다림
    await Promise.all(promises);

    console.log('writeCustomerScheduleCrmCsttDtalCntn 완료');

    return mapData;
}

async function writeCustomerScheduleStomCntn(mapData, inputData) {
    // CUST_NO : CUSTOMERID
    const getCostomerId = mapData.get('costomerId');

    const currentDateTimeString = getCurrentDateTimeString();

    // PAYMENT insert
    const insertCrmCsttDtalCntnQuery = `
    INSERT INTO tcustomerschedule (
        ORGID, CUSTOMERID, RESVTIME, RESVDATE, SCHEDULEDATE, 
        SCHEDULETIME, SCHEDULESTATUS, SCHDOCTOR, SCHNURSE, PHYSICALEMPL, 
        CONSULTTIME, SVCAREA, VISITTYPE, CONSULTNOTE, PROGRESSNOTE, 
        RESVMEMO, NURSEMEMO, BOOKMARK, INSTYPE, DISCD, 
        CRTIME, CONDITION1, CONDITION2, RESVCOUNT, RESVCFM, 
        RESVTMO, RESVTDY, HISTMEMO, EXTRACOST, RESVEMPLID, 
        EXRECALL, TRPLAN, ASSESSMENT, PAYMENTTYPE, MEDCOST, 
        PREGNANT, MIG, NOCON, NOCALC, MODHIST, 
        SUMMARY, TREATMENTROOM, SVCAREA2, REGTYPE, SCHTYPE,
        COLOR, ROOMNO, DURATION, SELFCHCKSTATUS, HOMENURSE
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
    )`;

    const promises = inputData.map(async data => {
        if (data.CUST_NO) {

            const customerId = getCostomerId[data.CUST_NO];

            // 데이터 변환코드
            PROGRESSTNOTE = data.STOM_DESC.toString().trim();
            PROGRESSTNOTE = CONSULTNOTE.replace(/'/g, "''");
            PROGRESSTNOTE = CONSULTNOTE.replace(/\\/g, "");

            const insertValues = [
                orgId, customerId || 0, '', '', data.ENTR_DAY || '',
                data.ENTR_TIME + "00" || '', 0, 0, 0, 0,
                data.ENTR_DAY + "00" || '', 0, 0, '', PROGRESSTNOTE || '',
                '', '', 0, 0, 0,
                currentDateTimeString || '', 0, 0, '', 0,
                0, 0, '', 0, 0,
                0, '', '', '', data.MDCL_SEQNO || '',
                0, 0, 0, 0, '',
                '', 0, 0, 0, 0,
                '', 0, 0, 0, ''
            ]
            try {
                await executeMySqlQuery(insertCrmCsttDtalCntnQuery, insertValues);

            } catch (err) {
                console.error('Customer 데이터 삽입 중 오류 발생:', err);
            }

        }
    });

    // 모든 프로미스가 완료될 때까지 기다림
    await Promise.all(promises);

    console.log('writeCustomerScheduleStomCntn 완료');

    return mapData;
}

async function writeCustomerMemoMdclDayMemo(mapData, inputData) {
    // CUST_NO : CUSTOMERID
    const getCostomerId = mapData.get('costomerId');

    const currentDateTimeString = getCurrentDateTimeString();

    // PAYMENT insert
    const insertMemoMdclDayMemoQuery = `
    INSERT INTO TCUSTOMERMEMO (
      ORGID,USERID,EMPLNAME,CUSTOMERID,MEMO,
      MEMODATE,MEMOTYPE,DISCD,CALLTYPE,CRTIME,
      SCHEDULEID,TOP,MODTIME,EMPLOYEEID,COLOR
    ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?)`;

    const promises = inputData.map(async data => {
        if (data.CUST_NO) {

            // 데이터 변환코드
            let memostr = String(data.MDCL_MEMO).trim();
            memostr = memostr.replace(/'/g, "''");
            memostr = memostr.replace(/\\/g, "");

            const insertValues = [
                orgId, '', '', data.CUST_NO || 0, memostr || '',
                data.MDCL_DAY.trim() || '', 1, 0, 0, '',
                0, 0, '', 0, ''
            ]
            try {
                await executeMySqlQuery(insertMemoMdclDayMemoQuery, insertValues);

            } catch (err) {
                console.error('Customer 데이터 삽입 중 오류 발생:', err);
            }

        }
    });

    // 모든 프로미스가 완료될 때까지 기다림
    await Promise.all(promises);

    console.log('writeCustomerMemoMdclDayMemo 완료');

    return mapData;
}

async function writeCustomerMemoSprtRoomDlvrDtal(mapData, inputData) {

    // insert
    const insertMemoMdclDayMemoQuery = `
    INSERT INTO TCUSTOMERMEMO (
      ORGID,USERID,EMPLNAME,CUSTOMERID,MEMO,
      MEMODATE,MEMOTYPE,DISCD,CALLTYPE,CRTIME,
      SCHEDULEID,TOP,MODTIME,EMPLOYEEID,COLOR
    ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?)`;

    const promises = inputData.map(async data => {
        if (data.CUST_NO) {

            // 데이터 변환코드
            let memostr = String(data.DLVR_DTAL).trim();
            memostr = memostr.replace(/'/g, "''");
            memostr = memostr.replace(/\\/g, "");


            const insertValues = [
                orgId, '', '', data.CUST_NO || 0, memostr || '',
                data.DLVR_DAY.trim() || '', 3, 0, 0, '',
                0, 0, '', 0, ''
            ]
            try {
                await executeMySqlQuery(insertMemoMdclDayMemoQuery, insertValues);

            } catch (err) {
                console.error('Customer 데이터 삽입 중 오류 발생:', err);
            }

        }
    });

    // 모든 프로미스가 완료될 때까지 기다림
    await Promise.all(promises);

    console.log('writeCustomerMemoSprtRoomDlvrDtal 완료');

    return mapData;
}



async function main() {

    try {
        const custNoData = await fetchCustomerCustNo();
        // const customerData = await getfetchCustomer() // 데이터 가져오기

        // mapData => costomerId
        // 모든 회원의 CUSTOMERID : CUSTNO
        // 기존에 존재하는 회원은 데이터 업데이트, map에 해당 CUSTOMEID 넣어준다
        const custData = await fetchCustInfo();

        const mapData = await writecustomerData(custData, custNoData);
        console.log('ww')

        // scheduleData까지의 map return
        // 모든 schedule insert, update완료

        const mdclInfoData = await fetchMdclInfoData();

        // 쿼리 조인 후 SPE_CNTN을 ASSEMENT에 작성완료

        const scheduleData = await writeSchedule(mapData, mdclInfoData);

        // paymentCard, paymentCash 동시수행
        const rcptData = await fetchRcptData()

        await writePaymentCardCash(scheduleData, rcptData);

        // writeDisease
        const sickData = await fetchSickData();

        await writeDisease(scheduleData, sickData);

        // writeMedicalItem
        const prscData = await fetchPrscData();

        await writeMedicalItem(scheduleData, prscData);

        const mdclRsvData = await fetchMdclRsvData();

        await writeCustomerMemoMdclRsv(scheduleData, mdclRsvData);

        const crCsttData = await fetchCrCsttDtalCntnData();

        await writeCustomerScheduleCrmCsttDtalCntn(scheduleData, crCsttData);

        const stomCntnData = await fetchStomCntnData();

        await writeCustomerScheduleStomCntn(scheduleData, stomCntnData);

        const mdclDayMemoData = await fetchMdclDayMemoData();

        await writeCustomerMemoMdclDayMemo(scheduleData, mdclDayMemoData);

        const sprtRoomData = await fetchSprtRoomData();

        await writeCustomerMemoSprtRoomDlvrDtal(scheduleData, sprtRoomData);


    } catch (error) {
        console.error(error);
    } finally {
        console.log('종료');
    }
}

main();