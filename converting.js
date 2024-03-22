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

// 테스트용 100개 데이터
// const { fetchCustInfo,
//     fetchMdclInfoData,
//     fetchRcptData,
//     fetchSickData,
//     fetchPrscData,
//     fetchMdclRsvData,
//     fetchCrCsttDtalCntnData,
//     fetchStomCntnData,
//     fetchMdclDayMemoData,
//     fetchSprtRoomData } = require('./fetchTest.js')

// 전역으로 사용할 orgId
const orgId = 1291;

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '0000',
    database: 'h01291',
    waitForConnections: true,
    connectionLimit: 100,
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

// 컨버팅 날짜와 비교하는 코드
// 현재 날짜가 컨버팅 날짜보다 이후라면 true, 그렇지 않으면 false반환
function isAfter20240321() {
    const currentDateTimeString = getCurrentDateTimeString();
    const currentDateOnly = currentDateTimeString.substring(0, 8); // 'YYYYMMDD' 형식으로 날짜만 추출
    const specifiedDate = '20240321'; // 컨버팅 날짜 입력

    return currentDateOnly > specifiedDate;
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
        let result = await executeMySqlQuery(insertQuery);
        result.forEach((row, index) => {
            data[row.CUSTNO] = row.CUSTOMERID;
            result[index] = null;
        })
        result = null;
    } catch (err) {
        console.error('Customer 데이터 삽입 중 오류 발생:', err);
    }

    return data
}


async function writecustomerData(custNoData, inputdata) {
    console.log("writecustomerData 시작");
    const m = new Map();

    const promises = [];
    // 신규회원 insert쿼리
    const insertCustomerQuery = `
    INSERT INTO TCUSTOMERPERSONAL (
                   CUSTNAME, CUSTNO, CUSTJN, CUSTDOB, DOBTYPE, CUSTGENDER, CUSTREGDATE, CUSTFSTDATE, CUSTADDR11, CRTIME, 
                   ORGID, CUSTCELL1, CUSTCELL2, CUSTPHONE1, CUSTPHONE2, CUSTEMAIL, CUSTWEB, CUSTSVCAREA,
                   CUSTTYPE, CUSTLVL, CUSTJOB, CUSTPIC, CUSTLSTDATE, CUSTZIPCODE1, CUSTADDR12, CUSTZIPCODE2,
                   CUSTADDR21, CUSTADDR22, CUSTZIPCODE3, CUSTADDR31, CUSTADDR32, CUSTNICKNAME, CUSTINTRE, CUSTINFX, 
                   SURNAME, CUSTMEMO, PERSONALINFO, INTROMEMO, STATE1, TITLE, ETHNICITY, ANNIVERSARY,
                   INSTYPE, TXAGREE, POLICYAGREE, ARBTAGREE, RECVSMSDATE,
                   RECVAD, RECVSMS, FTTIME
                 ) VALUES (
                   ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                   ?, ?, ?, ?, ?, ?, ?, ?,
                   ?, ?, ?, ?, ?, ?, ?, ?, 
                   ?, ?, ?, ?, ?, ?, ?, ?, 
                   ?, ?, ?, ?, ?, ?, ?, ?,
                   ?, ?, ?, ?, ?,
                   ?, ?, ?)
    `;

    // 기존회원 update쿼리
    const updateCustomerQuery = `
    UPDATE TCUSTOMERPERSONAL SET
        CUSTNAME = ?, CUSTJN = ?, CUSTDOB = ?, DOBTYPE = ?, CUSTGENDER = ?, 
        CUSTREGDATE = ?, CUSTFSTDATE = ?, CUSTADDR11 = ?, CRTIME = ?,ORGID = ?, 
        CUSTCELL1 = ?, CUSTCELL2 = ?, CUSTPHONE1 = ?, CUSTPHONE2 = ?, CUSTEMAIL = ?, 
        CUSTWEB = ?, CUSTSVCAREA = ?,CUSTTYPE = ?, CUSTLVL = ?, CUSTJOB = ?, 
        CUSTPIC = ?, CUSTLSTDATE = ?, CUSTZIPCODE1 = ?, CUSTADDR12 = ?, CUSTZIPCODE2 = ?,
        CUSTADDR21 = ?, CUSTADDR22 = ?, CUSTZIPCODE3 = ?, CUSTADDR31 = ?, CUSTADDR32 = ?, 
        CUSTNICKNAME = ?, CUSTINTRE = ?, CUSTINFX = ?,SURNAME = ?, CUSTMEMO = ?, 
        PERSONALINFO = ?, INTROMEMO = ?, STATE1 = ?, TITLE = ?, ETHNICITY = ?, 
        ANNIVERSARY = ?,INSTYPE = ?, TXAGREE = ?, POLICYAGREE = ?, ARBTAGREE = ?, 
        RECVSMSDATE = ?, RECVAD = ?, RECVSMS = ?, FTTIME = ?
    WHERE CUSTNO = ?`;



    inputdata.forEach((data, index) => {
        if (data.CUST_NO) {
            // 데이터 변환 및 준비 로직
            const ctznnoPrefix = Number(data.CTZN_NO.slice(0, 2)) > 24 ? '19' : '20';
            const ctznno = ctznnoPrefix + data.CTZN_NO.slice(0, 6);
            const gender = data.SEX === 'F' ? 2 : 1;
            const currentDateTimeString = getCurrentDateTimeString();
            // 광고수신동의 Y, N형식으로
            // Y 이면 1로 N이면 0으로 변경
            const smsCheck = data.SEND_FLAG === 'Y' ? 1 : 0;

            // insert values
            const values = [
                data.NAME || '', data.CUST_NO || '', data.CTZN_NO || '', ctznno || '', 0, gender || 0, data.ENTR_DAY || '', data.MDFY_DAY || '', data.ADDR1 + data.ADDR2 || '', currentDateTimeString || '',
                orgId, '', '', '', '', '', '', '',
                '', '', '', '', '', '', '', '',
                '', '', '', '', '', '', '', '',
                '', '', 0, '', '', '', '', '',
                '', 0, 0, 0, data.MDFY_DAY || '',
                smsCheck || 0, smsCheck || 0, ''
            ]

            // update values
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
                data.MDFY_DAY || '', smsCheck || 0, smsCheck || 0, '', data.CUST_NO
            ]
            // 키가 존재하면 => 이미 회원이 존재한다 update진행
            if (data.CUST_NO in custNoData) {
                // 기존 회원이 있으면, Map에 저장
                // 기존회원이 존재하면 해당 데이터 update
                promises.push(executeMySqlQuery(updateCustomerQuery, updateValues));
            } else {
                // 존재하지 않는 경우, 새로운 회원 데이터 삽입
                // custNoData에 해당 회원의 CUSTOMERID 입력
                promises.push(executeMySqlQuery(insertCustomerQuery, values).then((result) => {
                    custNoData[data.CUST_NO] = result.insertId;
                }))

            }
        }
        // 사용 index 메모리 해제
        inputdata[index] = null;
    });

    // 모든 프로미스가 완료될 때까지 기다림(병렬처리)
    await Promise.all(promises);
    console.log('writecustomerData 완료')

    // costomerId에 CUST_NO : CUSTOMERID(PK) 설정
    // costomerId 로 CUST_NO : CUSTOMERID 인 객체를 get메서드를 사용하여 얻는다
    m.set('costomerId', custNoData)

    return m
}

async function writeSchedule(mapData, mdclInfoData) {
    // CUST_NO : CUSTOMEID인 객체 가져온다
    const getCustomerId = mapData.get('costomerId');

    // 스케줄ID, 스케줄date저장
    // 스케줄IdD : CUSTNO 데이터 저장
    const scheduleId = {};
    const scheduleDate = {};

    // 스케줄 insert쿼리
    const insertSchedule = `
    INSERT INTO TCUSTOMERSCHEDULE (
        ORGID, CUSTOMERID, RESVTIME, RESVDATE, SCHEDULEDATE, 
        SCHEDULETIME, SCHEDULESTATUS, SCHDOCTOR, SCHNURSE,PHYSICALEMPL, 
        CONSULTTIME, SVCAREA, VISITTYPE, CONSULTNOTE, PROGRESSNOTE, 
        RESVMEMO, NURSEMEMO, BOOKMARK, INSTYPE,DISCD, 
        CRTIME, CONDITION1, CONDITION2, RESVCOUNT, RESVCFM, 
        RESVTMO, RESVTDY, HISTMEMO, EXTRACOST,RESVEMPLID, 
        EXRECALL, TRPLAN, ASSESSMENT, PAYMENTTYPE, MEDCOST, 
        PREGNANT, MIG, NOCON, NOCALC,MODHIST, 
        SUMMARY, TREATMENTROOM, SVCAREA2, REGTYPE, SCHTYPE,
        COLOR, ROOMNO, DURATION, SELFCHCKSTATUS
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
        ?, ?, ?, ?
    )
    `;
    const insertMemoMdclDayMemoQuery = `
    INSERT INTO TCUSTOMERMEMO (
      ORGID,USERID,EMPLNAME,CUSTOMERID,MEMO,
      MEMODATE,MEMOTYPE,DISCD,CALLTYPE,CRTIME,
      SCHEDULEID,TOP,MODTIME,EMPLOYEEID,COLOR
    ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?)`;

    
    let isMig = 0;

    const promises = [];

    // 현재 날짜가 컨버팅 날짜 이후인지 판별
    // 현재 날짜가 컨버팅 날짜 이후이면 true아니면 false
    if (isAfter20240321()) {
        isMig = 0;
    } else {
        isMig = 1;
    }


    const currentDateTimeString = getCurrentDateTimeString();

    mdclInfoData.forEach((data, index) => {
        // data.CUST_NO이 없으면 하위코드 실행x
        if (data.CUST_NO) {
            // 현재 CUST_NO에 대한 CUSTOMERID
            const customerId = getCustomerId[data.CUST_NO];

            // 데이터 변환 및 준비 로직
            const scheduleTime = data.MDCL_TIME + '00';

            // insertData
            const insertValues = [
                orgId, customerId || 0, '', '', data.MDCL_DAY || '',
                scheduleTime || '', 1, 0, 0, 0,
                '', 0, 0, '', '',
                '', '', 0, 0, 0,
                currentDateTimeString, 0, 0, data.CHRG_DCTR || '', 0,
                0, 0, '', 0, 0,
                0, data.MDCL_ROOM || '', data.SPE_CNTN || '001', customerId || '', Number(data.MDCL_SEQNO) || 0,
                0, 0, isMig, 0, '',
                '', 0, 0, 0, 0,
                '', 0, 0, 0
            ];
            
            if (customerId) {
                // executeMySqlQuery를 호출하고, then 메서드를 사용하여 결과를 처리
                promises.push(executeMySqlQuery(insertSchedule, insertValues).then((result) => {
                    //  scheduleId는 customerId와 ENTR_DAY의 쌍의 값으로 찾는다
                    scheduleId[`${customerId},${data.ENTR_DAY}`] = result.insertId;
                    scheduleDate[result.insertId] = data.MDCL_DAY;
                }).catch((error) => {
                    console.error("Error executing query:", error);
                }));
            }
            if (data.MEMO) {
                // insert tcustomermemo MEMOTYPE == 4
                const memoinsertValues = [
                    orgId, '', '', customerId || 0, data.MEMO || '',
                    data.MDCL_DAY.trim() || '', 4, 0, 0, '',
                    0, 0, '', 0, ''
                ]
                promises.push(executeMySqlQuery(insertMemoMdclDayMemoQuery, memoinsertValues));
            }
        }

        mdclInfoData[index] = null;
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

    const insertPaymentSateQuery = `
    INSERT INTO TSALESTATEMENT (
    SCHEDULEID,CUSTOMERID,LIABILITYAMT,CLAIMAMT
    ,AIDAMT1,AIDAMT2,NONINSAMT,DISCOUNTAMT,CARINSAMT
    ,LOSSAMT,DISCD,CRTIME,ORGID,INS100AMT
    ,LTCHARGEAMT,LTCLAIMAMT,TAXABLEAMT,REFUNDAMT,TAXDCAMT
    ,TAX
    ) VALUES (
        ?, ?, ?, ?, 
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?
    )
    `
    const promises = [];

    inputData.forEach((data, index) => {
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
                0, 0, '', 
            ]

            const salementValues = [
                curScheduleId || 0, customerId || 0, data.PAY_SELF_CHRG_AMT || 0, data.CLAIM_AMT || 0,
                0, 0, data.NON_PAY_TOT || 0, data.DC_AMT || 0, 0, 
                0, 0, currentDateTimeString, orgId, 0,
                0, 0, 0, 0, 0,
                0
            ]
            if (curScheduleId) {
                promises.push(executeMySqlQuery(insertPaymentCardQuery, insertValues));
                promises.push(executeMySqlQuery(insertPaymentSateQuery, salementValues));
            }
        
        } 
        if (data.CASH_RCPT_AMT > 0 && data.CUST_NO) { // CASH_RCPT_AMT > 0일경우 위의로직 수행 하는데 PAYMENTCODE를 "M00"으로 insert
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

            const salementValues = [
                curScheduleId || 0, customerId || 0, data.PAY_SELF_CHRG_AMT || 0, data.CLAIM_AMT || 0,
                0, 0, data.NON_PAY_TOT || 0, data.DC_AMT || 0, 0, 
                0, 0, currentDateTimeString, orgId, 0,
                0, 0, 0, 0, 0
            ]
            if (curScheduleId) {
                promises.push(executeMySqlQuery(insertPaymentCardQuery, insertValues));
                promises.push(executeMySqlQuery(insertPaymentSateQuery, salementValues));
            }
         
        }
        inputData[index] = null;
    });

    // 모든 프로미스가 완료될 때까지 기다림
    await Promise.all(promises);

    console.log('writePaymentCardCash 완료');

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

    const promises = []
    inputData.map((data, index) => {
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
            if (curScheduleId) {
                promises.push(executeMySqlQuery(insertDiseaseQuery, insertValues));
            };
        }
        inputData[index] = null;
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

    const promises = [];
    inputData.forEach((data, index) => {
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
            if (curScheduleId) {
                promises.push(executeMySqlQuery(insertMedicalQuery, insertValues));
            }
        }
        inputData[index] = null;
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

    let isMig = 0;
    // 현재 날짜가 컨버팅 날짜 이후인지 판별
    // 현재 날짜가 컨버팅 날짜 이후이면 true아니면 false
    if (isAfter20240321()) {
        isMig = 0;
    } else {
        isMig = 1;
    }

    // PAYMENT insert
    const insertMemoMdclRsvQuery = `
    INSERT INTO TCUSTOMERSCHEDULE (
        ORGID, CUSTOMERID, RESVTIME, RESVDATE, SCHEDULEDATE, 
        SCHEDULETIME, SCHEDULESTATUS, SCHDOCTOR, SCHNURSE,PHYSICALEMPL, 
        CONSULTTIME, SVCAREA, VISITTYPE, CONSULTNOTE, PROGRESSNOTE, 
        RESVMEMO, NURSEMEMO, BOOKMARK, INSTYPE,DISCD, 
        CRTIME, CONDITION1, CONDITION2, RESVCOUNT, RESVCFM, 
        RESVTMO, RESVTDY, HISTMEMO, EXTRACOST, RESVEMPLID, 
        EXRECALL, TRPLAN, ASSESSMENT, PAYMENTTYPE, MEDCOST, 
        PREGNANT, MIG, NOCON, NOCALC, MODHIST, 
        SUMMARY, TREATMENTROOM, SVCAREA2, REGTYPE, SCHTYPE,
        COLOR, ROOMNO, DURATION, SELFCHCKSTATUS
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
        ?, ?, ?, ?
    )`;

    const promises = [];
    inputData.forEach((data, index) => {
        if (data.CUST_NO) {

            const customerId = getCostomerId[data.CUST_NO];

            // 데이터 변환코드
            CONSULTNOTE = data.RSV_MEMO.toString().trim();
            CONSULTNOTE = CONSULTNOTE.replace(/'/g, "''");
            CONSULTNOTE = CONSULTNOTE.replace(/\\/g, "");

            const insertValues = [
                orgId, customerId || 0, '', '', data.RSV_DAY || '',
                data.RSV_TIME + "00" || '', 1, data.MDCL_ROOM || 0, 0, 0,
                data.RSV_DAY + "00" || '', 0, 0, CONSULTNOTE || '', '',
                '', '', 0, 0, 0,
                currentDateTimeString || '', 0, 0, data.CHRG_DCTR || '', 0,
                0, 0, '', 0, 0,
                0, data.MDCL_ROOM || '', '', customerId || '', data.MDCL_SEQNO || 0,
                0, isMig, 0, 0, '',
                '', 0, 0, 0, 0,
                '', 0, 0, 0
            ]
            if (customerId) {
                promises.push(executeMySqlQuery(insertMemoMdclRsvQuery, insertValues));
            }
        }
        inputData[index] = null;
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
    let isMig = 0;

    // 현재 날짜가 컨버팅 날짜 이후인지 판별
    // 현재 날짜가 컨버팅 날짜 이후이면 true아니면 false
    if (isAfter20240321()) {
        isMig = 0;
    } else {
        isMig = 1;
    }

    // PAYMENT insert
    const insertCrmCsttDtalCntnQuery = `
    INSERT INTO TCUSTOMERSCHEDULE (
        ORGID, CUSTOMERID, RESVTIME, RESVDATE, SCHEDULEDATE, 
        SCHEDULETIME, SCHEDULESTATUS, SCHDOCTOR, SCHNURSE, PHYSICALEMPL, 
        CONSULTTIME, SVCAREA, VISITTYPE, CONSULTNOTE, PROGRESSNOTE, 
        RESVMEMO, NURSEMEMO, BOOKMARK, INSTYPE, DISCD, 
        CRTIME, CONDITION1, CONDITION2, RESVCOUNT, RESVCFM, 
        RESVTMO, RESVTDY, HISTMEMO, EXTRACOST, RESVEMPLID, 
        EXRECALL, TRPLAN, ASSESSMENT, PAYMENTTYPE, MEDCOST, 
        PREGNANT, MIG, NOCON, NOCALC, MODHIST, 
        SUMMARY, TREATMENTROOM, SVCAREA2, REGTYPE, SCHTYPE,
        COLOR, ROOMNO, DURATION, SELFCHCKSTATUS
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?
    )`;

    const promises = [];
    inputData.forEach((data, index) => {
        if (data.CUST_NO) {

            const customerId = getCostomerId[data.CUST_NO];

            // 데이터 변환코드
            CONSULTNOTE = data.CSTT_DTAL.toString().trim();
            CONSULTNOTE = CONSULTNOTE.replace(/'/g, "''");
            CONSULTNOTE = CONSULTNOTE.replace(/\\/g, "");

            const insertValues = [
                orgId, customerId || 0, '', '', data.ENTR_DAY || '',
                data.ENTR_TIME + "00" || '', 1, data.MDCL_ROOM || 0, 0, 0,
                data.ENTR_DAY + "00" || '', 0, 0, CONSULTNOTE || '', '',
                '', '', 0, 0, 0,
                currentDateTimeString || '', 0, 0, '', 0,
                0, 0, '', 0, 0,
                0, '', '', '', 0,
                0, isMig, 0, 0, '',
                '', 0, 0, 0, 0,
                '', 0, 0, 0
            ]
            if (customerId) {
                promises.push(executeMySqlQuery(insertCrmCsttDtalCntnQuery, insertValues));
            }
        }
        inputData[index] = null;
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
    let isMig = 0;

    // 현재 날짜가 컨버팅 날짜 이후인지 판별
    // 현재 날짜가 컨버팅 날짜 이후이면 true아니면 false
    if (isAfter20240321()) {
        isMig = 0;
    } else {
        isMig = 1;
    }

    // PAYMENT insert
    const insertCrmCsttDtalCntnQuery = `
    INSERT INTO TCUSTOMERSCHEDULE (
        ORGID, CUSTOMERID, RESVTIME, RESVDATE, SCHEDULEDATE, 
        SCHEDULETIME, SCHEDULESTATUS, SCHDOCTOR, SCHNURSE, PHYSICALEMPL, 
        CONSULTTIME, SVCAREA, VISITTYPE, CONSULTNOTE, PROGRESSNOTE, 
        RESVMEMO, NURSEMEMO, BOOKMARK, INSTYPE, DISCD, 
        CRTIME, CONDITION1, CONDITION2, RESVCOUNT, RESVCFM, 
        RESVTMO, RESVTDY, HISTMEMO, EXTRACOST, RESVEMPLID, 
        EXRECALL, TRPLAN, ASSESSMENT, PAYMENTTYPE, MEDCOST, 
        PREGNANT, MIG, NOCON, NOCALC, MODHIST, 
        SUMMARY, TREATMENTROOM, SVCAREA2, REGTYPE, SCHTYPE,
        COLOR, ROOMNO, DURATION, SELFCHCKSTATUS
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?
    )`;

    const promises = [];
    inputData.forEach((data, index) => {
        if (data.CUST_NO) {

            const customerId = getCostomerId[data.CUST_NO];

            // 데이터 변환코드
            PROGRESSTNOTE = data.STOM_DESC.toString().trim();
            PROGRESSTNOTE = CONSULTNOTE.replace(/'/g, "''");
            PROGRESSTNOTE = CONSULTNOTE.replace(/\\/g, "");

            const insertValues = [
                orgId, customerId || 0, '', '', data.ENTR_DAY || '',
                data.ENTR_TIME + "00" || '', 1, 0, 0, 0,
                data.ENTR_DAY + "00" || '', 0, 0, '', PROGRESSTNOTE || '',
                '', '', 0, 0, 0,
                currentDateTimeString || '', 0, 0, '', 0,
                0, 0, '', 0, 0,
                0, '', '', '', data.MDCL_SEQNO || '',
                0, isMig, 0, 0, '',
                '', 0, 0, 0, 0,
                '', 0, 0, 0
            ]
            if (customerId) {
                promises.push(executeMySqlQuery(insertCrmCsttDtalCntnQuery, insertValues));
            }
        }
        inputData[index] = null;
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

    const promises = [];
    inputData.map((data, index) => {
        if (data.CUST_NO) {
            const customerId = getCostomerId[data.CUST_NO]

            // 데이터 변환코드
            let memostr = String(data.MDCL_MEMO).trim();
            memostr = memostr.replace(/'/g, "''");
            memostr = memostr.replace(/\\/g, "");

            const insertValues = [
                orgId, '', '', customerId || 0, memostr || '',
                data.MDCL_DAY.trim() || '', 1, 0, 0, '',
                0, 0, '', 0, ''
            ]
            if (customerId) {
                promises.push(executeMySqlQuery(insertMemoMdclDayMemoQuery, insertValues));
            }
        }
        inputData[index] = null;
    });

    // 모든 프로미스가 완료될 때까지 기다림
    await Promise.all(promises);

    console.log('writeCustomerMemoMdclDayMemo 완료');

    return mapData;
}
async function writeCustomerMemoSprtRoomDlvrDtal(mapData, inputData) {
    const getCostomerId = mapData.get('costomerId');

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

    promises = [];
    inputData.forEach((data, index) => {
        if (data.CUST_NO) {
            const customerId = getCostomerId[data.CUST_NO];

            // 데이터 변환코드
            let memostr = String(data.DLVR_DTAL).trim();
            memostr = memostr.replace(/'/g, "''");
            memostr = memostr.replace(/\\/g, "");


            const insertValues = [
                orgId, '', '', customerId || 0, memostr || '',
                data.DLVR_DAY.trim() || '', 3, 0, 0, '',
                0, 0, '', 0, ''
            ]
            if (customerId) {
                promises.push(executeMySqlQuery(insertMemoMdclDayMemoQuery, insertValues));
            }
        }
        inputData[index] = null;
    });

    // 모든 프로미스가 완료될 때까지 기다림
    await Promise.all(promises);

    console.log('writeCustomerMemoSprtRoomDlvrDtal 완료');

    return mapData;
}



async function main() {
    const startTime = new Date(); // 시작 시간 기록

    try {
        let custNoData = await fetchCustomerCustNo();

        // mapData => costomerId
        // 모든 회원의 CUSTOMERID : CUSTNO
        // 기존에 존재하는 회원은 데이터 업데이트, map에 해당 CUSTOMEID 넣어준다
        let custData = await fetchCustInfo();

        // TCUSTOMERPERSONAL 입력하는 코드
        let mapData = await writecustomerData(custNoData, custData);
        custData = null;
        custNoData = null;

        // 스케줄 데이터 fetch
        let mdclInfoData = await fetchMdclInfoData();

        // TCUSTOMERSCHEDULE 입력 코드
        const scheduleData = await writeSchedule(mapData, mdclInfoData);

        mdclInfoData = null;
        mapData = null;

        // // // // paymentCard, paymentCash 동시수행
        let rcptData = await fetchRcptData()

        await writePaymentCardCash(scheduleData, rcptData);

        rcptData = null;

        // writeDisease
        let sickData = await fetchSickData();

        await writeDisease(scheduleData, sickData);

        sickData = null;

        // writeMedicalItem
        let prscData = await fetchPrscData();

        await writeMedicalItem(scheduleData, prscData);

        prscData = null;

        let mdclRsvData = await fetchMdclRsvData();

        await writeCustomerMemoMdclRsv(scheduleData, mdclRsvData);

        mdclRsvData = null;

        let crCsttData = await fetchCrCsttDtalCntnData();

        await writeCustomerScheduleCrmCsttDtalCntn(scheduleData, crCsttData);

        crCsttData = null;

        let stomCntnData = await fetchStomCntnData();

        await writeCustomerScheduleStomCntn(scheduleData, stomCntnData);

        let mdclDayMemoData = await fetchMdclDayMemoData();

        await writeCustomerMemoMdclDayMemo(scheduleData, mdclDayMemoData);

        mdclDayMemoData = null;

        let sprtRoomData = await fetchSprtRoomData();

        await writeCustomerMemoSprtRoomDlvrDtal(scheduleData, sprtRoomData);

    } catch (error) {
        console.error(error);
    } finally {
        const endTime = new Date(); // 종료 시간 기록
        const timeDiff = endTime - startTime; // 밀리초 단위로 걸린 시간 계산
        const seconds = timeDiff / 1000; // 밀리초를 초 단위로 변환

        console.log(`종료. 총 걸린 시간: ${seconds}초`);
    }
}

main();