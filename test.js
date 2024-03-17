const sql = require('mssql');
const mysql = require('mysql2/promise');

const sqlConfig = {
    user: 'sa',
    password: '@1023ldde1023',
    server: 'DESKTOP-VI1EG1F',
    database: 'Almighty',
    options: {
        encrypt: false,
      },
    port: 1433,
}

const mysqlConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '0000',
    database: 'h00044'
}


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

// Customer에 들어갈 회원정보 get
async function getfetchCustomer() {
    try {
      // sqlserver 연결
      await sql.connect(sqlConfig);
  
       // 쿼리 실행
       const custData = await sql.query('SELECT  * FROM CUST_INFO');
      const mdclData = await sql.query('SELECT  * FROM MDCL_DAY_SPE_CNTN');
      const mdclInfoData = await sql.query('SELECT  * FROM MDCL_INFO');
      const rcptData = await sql.query('SELECT  * FROM RCPT_INFO');
      const sickData = await sql.query('SELECT  * FROM SICK_CNTN');
      const prscData = await sql.query('SELECT  * FROM PRSC_CNTN');
      const mdclRsvData = await sql.query('SELECT  * FROM MDCL_RSV');
      const crmCsttDtalCntnData = await sql.query('SELECT  * FROM CRM_CSTT_DTAL_CNTN');
      const stomCntnData = await sql.query('SELECT  * FROM STOM_CNTN');
      const mdclDayMemoData = await sql.query('SELECT  * FROM MDCL_DAY_MEMO');
      const sprtRoomDlvrDtalData = await sql.query('SELECT  * FROM SPRT_ROOM_DLVR_DTAL');

      return { custData: custData.recordset, mdclData: mdclData.recordset, mdclInfoData: mdclInfoData.recordset, rcptData: rcptData.recordset ,sickData: sickData.recordset
        , prscData: prscData.recordset, mdclRsvData: mdclRsvData.recordset, crmCsttDtalCntnData: crmCsttDtalCntnData.recordset, stomCntnData: stomCntnData.recordset,
        mdclDayMemoData : mdclDayMemoData.recordset, sprtRoomDlvrDtalData: sprtRoomDlvrDtalData.recordset
      };

    } catch (err) {
      console.error(err);
    } finally {
      // 연결 종료
      sql.close();
    }
  }

// Customer에 들어갈 회원정보 get 100개 테스트용
async function getfetchCustomer100() {
  try {
      // sqlserver 연결
      await sql.connect(sqlConfig);

      // 쿼리 실행 (각각 100개만 가져오도록 수정)
      const custData = await sql.query('SELECT TOP 100 * FROM CUST_INFO');
      const mdclData = await sql.query('SELECT TOP 100 * FROM MDCL_DAY_SPE_CNTN');
      const mdclInfoData = await sql.query('SELECT TOP 100 * FROM MDCL_INFO');
      const rcptData = await sql.query('SELECT TOP 100 * FROM RCPT_INFO');
      const sickData = await sql.query('SELECT TOP 100 * FROM SICK_CNTN');
      const prscData = await sql.query('SELECT TOP 100 * FROM PRSC_CNTN');
      const mdclRsvData = await sql.query('SELECT TOP 100 * FROM MDCL_RSV');
      const crmCsttDtalCntnData = await sql.query('SELECT TOP 100 * FROM CRM_CSTT_DTAL_CNTN');
      const stomCntnData = await sql.query('SELECT TOP 100 * FROM STOM_CNTN');
      const mdclDayMemoData = await sql.query('SELECT TOP 100 * FROM MDCL_DAY_MEMO');
      const sprtRoomDlvrDtalData = await sql.query('SELECT TOP 100 * FROM SPRT_ROOM_DLVR_DTAL');

      return { custData: custData.recordset, mdclData: mdclData.recordset, mdclInfoData: mdclInfoData.recordset, rcptData: rcptData.recordset ,sickData: sickData.recordset
        , prscData: prscData.recordset, mdclRsvData: mdclRsvData.recordset, crmCsttDtalCntnData: crmCsttDtalCntnData.recordset, stomCntnData: stomCntnData.recordset,
        mdclDayMemoData : mdclDayMemoData.recordset, sprtRoomDlvrDtalData: sprtRoomDlvrDtalData.recordset
      };

  } catch (err) {
      console.error(err);
  } finally {
      // 연결 종료
      sql.close();
  }
}

// Customer에 insert
async function writecustomerData(custData) {
    const currentDateTimeString = getCurrentDateTimeString();
    // mysql 연결
    const connection = await mysql.createConnection(mysqlConfig);
    const m =new Map();
    const costomerId = {}
    try{
      custData.forEach(async (data) => {
        const query = `
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

          let ctznno = data.CTZN_NO.slice(0, 6);
          let ctznnoStation = Number(data.CTZN_NO.slice(0, 2)); 
          if (ctznnoStation > 24) {
              ctznno = '19' + ctznno;
          }else {
              ctznno = '20' + ctznno;
          }
          if ( data.SEX === 'F') {
              data.SEX = 2;
          }else {
              data.SEX = 1;
          }

          // 빈 항목의 값을 '',0로 변경
          const emptyString = '';
          const zeroValue = 0;

          const values = [
            data.NAME || emptyString, data.CUST_NO || '', data.CTZN_NO || '', ctznno, 0, data.SEX, data.ENTR_DAY, data.MDFY_DAY, data.ADDR1 + data.ADDR2, currentDateTimeString, 
            zeroValue, emptyString, emptyString, emptyString, emptyString, emptyString, emptyString, emptyString, 
            emptyString, emptyString,emptyString, emptyString, emptyString, emptyString, emptyString, emptyString, 
            emptyString, emptyString, emptyString, emptyString, emptyString, emptyString, emptyString, emptyString, 
            emptyString, emptyString, zeroValue, emptyString, emptyString, emptyString, emptyString, emptyString,
            emptyString, zeroValue, zeroValue, zeroValue, emptyString 
          ]  

          const [packat, fields] = await connection.execute(query, values);
          costomerId[data.CUST_NO] = packat.insertId
        }
        )
      // const retrievedCostomerId = m.get('costomerId'); 이렇게호출
      m.set('costomerId',costomerId)
      return m
    } catch(err) {
      console.error(err);
    }
    finally {
      // 연결 종료
      await connection.end();
    }
  
}

async function writeSchedule(m, mdclInfoData) {
  // mysql 연결
  const connection = await mysql.createConnection(mysqlConfig);

  const scheduleId = {};
  const scheduleDate = {};
  const currentDateTimeString = getCurrentDateTimeString();
  const getCustomerId = m.get('costomerId');

  try {
      for (const data of mdclInfoData) {
          if (data.CUST_NO === '') {
              // CUST_NO가 없으면 pass
              continue;
          }
          const customerId = getCustomerId[data.CUST_NO];

          const query = `
              INSERT INTO tcustomerschedule (
                  ORGID, CUSTOMERID, RESVTIME, RESVDATE, SCHEDULEDATE, SCHEDULETIME, SCHEDULESTATUS, SCHDOCTOR, SCHNURSE,
                  PHYSICALEMPL, CONSULTTIME, SVCAREA, VISITTYPE, CONSULTNOTE, PROGRESSNOTE, RESVMEMO, NURSEMEMO, BOOKMARK, INSTYPE,
                  DISCD, CRTIME, CONDITION1, CONDITION2, RESVCOUNT, RESVCFM, RESVTMO, RESVTDY, HISTMEMO, EXTRACOST,
                  RESVEMPLID, EXRECALL, TRPLAN, ASSESSMENT, PAYMENTTYPE, MEDCOST, PREGNANT, MIG, NOCON, NOCALC,
                  MODHIST, SUMMARY, TREATMENTROOM, SVCAREA2, REGTYPE, SCHTYPE,
                  COLOR, ROOMNO, DURATION, SELFCHCKSTATUS, HOMENURSE
              ) VALUES (
                  ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?
              )
          `;

          const scheduleTime = data.ENTR_TIME + '00';

          const values = [
              0, customerId, '', '', data.MDCL_DAY || '', scheduleTime, 7, 0, 0,
              0, currentDateTimeString, 0, 0, '', '', '', '', 0, 0,
              0, currentDateTimeString, 0, 0, data.CHRG_DCTR, 0, 0, 0, '', 0,
              0, 0, '', data.SPE_CNTN || '', customerId, data.MDCL_SEQNO, 0, 0, 0, 0,
              '', '', 0, 0, 0, 0,
              '', 0, 0, 0, ''
          ];

          const [packet, fields] = await connection.execute(query, values);
          
      
          // 회원아이디와 날짜 배열로 한것을 key로 사용

          scheduleId[[customerId, data.MDCL_DAY]] = packet.insertId;

          // 스케줄아이디 : 스케줄날짜로 만든다
          scheduleDate[packet.insertId] = data.MDCL_DAY;

      }

      m.set('scheduleId', scheduleId);
      m.set('scheduleDate', scheduleDate);

      return m;
  } catch (err) {
      console.error(err);
  } finally {
      // 연결 종료
      await connection.end();
  }
}

async function insertCustomerSchedule(scheduleMap, mdclData) {

  const currentDateTimeString = getCurrentDateTimeString();
  // mysql 연결
  const connection = await mysql.createConnection(mysqlConfig);
  
  // CUST_NO : CUSTOMERID로 되어있는 객체 getCustomerId를 가져온다
  const getCustomerId = scheduleMap.get('costomerId');

  // '스케줄아이디, 날짜'로 스케줄아이디 가져온다
  const getScheduleId = scheduleMap.get('scheduleId');

  // 스케줄아이디 : SCHEDULEDATE로 되어있는 객체 getScheduleDate를 가져온다
  const getScheduleDate = scheduleMap.get('scheduleDate');

  try {
      for (const data of mdclData) {
          if (data.CUST_NO === '') {
              continue; // CUST_NO가 없으면 skip
          }
          
          // CUST_NO에 해당하는 customerid
          if (getCustomerId[data.CUST_NO]) {
            costomerId = getCustomerId[data.CUST_NO];
          }else {
            continue;
          }


          // 해당 데이터의 날짜는 data.ENTR_DAY다 이거와 해당 customerid가 존재하는지 확인
          // 해당row가 존재하는지 확인
          // 해당 회원에대한 방문날짜 배열형태로 가져온다
      
          const curScheduleId = getScheduleId[`${costomerId},${data.ENTR_DAY}`]
          const curScheduleDate = getScheduleDate[curScheduleId]
          

          // 해당 row가 존재하는지 판별(초기값 false)
          let isValue = false
    
          if (curScheduleDate === data.MDCL_DAY) {
            isValue = true;
          }

          // 해당 회원의 ID - 방문했던 날짜와 data.MDCL_DAY가 같으면 이미 등록된 정보 UPDATE진행
          if (isValue) {
              const query = `UPDATE tcustomerschedule SET ASSESSMENT = ? WHERE CUSTOMERID = ? and SCHEDULEDATE = ? `;
              const values = [data.SPE_CNTN, costomerId, data.ENTR_DAY];
              const [rows, fields] = await connection.execute(query, values);
            
          } else {
              const query = `
              INSERT INTO tcustomerschedule (
                  ORGID,CUSTOMERID,RESVTIME,RESVDATE,SCHEDULEDATE,SCHEDULETIME,SCHEDULESTATUS,SCHDOCTOR,SCHNURSE,
                  PHYSICALEMPL,CONSULTTIME,SVCAREA,VISITTYPE,CONSULTNOTE,PROGRESSNOTE,RESVMEMO,NURSEMEMO,BOOKMARK,INSTYPE,
                  DISCD,CRTIME,CONDITION1,CONDITION2,RESVCOUNT,RESVCFM,RESVTMO,RESVTDY,HISTMEMO,EXTRACOST,
                  RESVEMPLID,EXRECALL,TRPLAN,ASSESSMENT,PAYMENTTYPE,MEDCOST,PREGNANT,MIG,NOCON,NOCALC,
                  MODHIST,SUMMARY,TREATMENTROOM,SVCAREA2,REGTYPE,SCHTYPE,
                  COLOR,ROOMNO,DURATION,SELFCHCKSTATUS,HOMENURSE
              ) VALUES (
                  ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?
              )`;

              // 시간형식
              const scheduleTime = data.ENTR_TIME + '00';
    
              const values = [
                  0, costomerId, '', '', data.ENTR_DAY, scheduleTime, 7, 0, 0,
                  0, data.ENTR_DAY + data.ENTR_TIME + "00", 0, 0, '', '', '', '', 0, 0,
                  0, '', 0, 0, '', 0, 0, 0, '', 0,
                  0, 0, '', data.SPE_CNTN, '', 0, 0, 0, 0, 0,
                  '', '', 0, 0, 0, 0,
                  '', 0, 0, 0, ''
              ];

              const [packet, fields] = await connection.execute(query, values);
          }
      }

  } catch (err) {
      console.error(err);
  } finally {
      // 연결 종료
      await connection.end();
  }
}

async function writePaymentCard(m, rcptData) {
  const connection = await mysql.createConnection(mysqlConfig);
  // CUST_NO : CUSTOMERID
  const getCostomerId = m.get('costomerId');

  // key: [방문스케줄ID, 방문날짜], value : 스케줄아이디
  const getScheduleId = m.get('scheduleId');

  // key: 스케줄ID, value: 스케줄날짜
  const getScheduleDate = m.get('scheduleDate');
  try {
    const currentDateTimeString = getCurrentDateTimeString();
    for (const data of rcptData) {
      if (data.CARD_RCPT_AMT <= 0){
        // cash, card구분
        continue;
      }

      if (data.CUST_NO === '') {
        // CUST_NO가 없으면 pass
        continue;
      }
      

      

      // CUST_NO에 대한 CUSTOMERID MAP에서 가져오기
      const customerId = getCostomerId[data.CUST_NO];

      const curScheduleId = getScheduleId[`${customerId}, ${data.ENTR_DAY}`]

      const query = `
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

        const values = [
          0, customerId || '', curScheduleId || 0, Number(data.CARD_RCPT_AMT) || 0, 0,
          "C00", 0, 0, 0, '',
          '',0, data.ENTR_DAY || '',data.MDFY_DAY || '','',
          0,0,currentDateTimeString || '','',0,
          0,0,''
        ]

        const [packet, fields] = await connection.execute(query, values);
    }

  } catch(err) {
    console.error(err);
  }finally {
    // 연결 종료
    await connection.end();
  }
}

async function writePaymentCash(m, rcptData) {
  const connection = await mysql.createConnection(mysqlConfig);
  // CUST_NO : CUSTOMERID
  const getCostomerId = m.get('costomerId');

  // key: [방문스케줄ID, 방문날짜], value : 스케줄아이디
  const getScheduleId = m.get('scheduleId');

  // key: 스케줄ID, value: 스케줄날짜
  const getScheduleDate = m.get('scheduleDate');
  try {
    const currentDateTimeString = getCurrentDateTimeString();
    for (const data of rcptData) {
      if (data.CASH_RCPT_AMT <= 0){
        // cash, card구분
        continue;
      }

      if (data.CUST_NO === '') {
        // CUST_NO가 없으면 pass
        continue;
      }
      
      // CUST_NO에 대한 CUSTOMERID MAP에서 가져오기
      const customerId = getCostomerId[data.CUST_NO];

      const curScheduleId = getScheduleId[`${customerId}, ${data.ENTR_DAY}`]

      const query = `
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

        const values = [
          0, customerId || '', curScheduleId || 0, Number(data.CARD_RCPT_AMT) || 0, 0,
          "C00", 0, 0, 0, '',
          '',0, data.ENTR_DAY || '',data.MDFY_DAY || '','',
          0,0,currentDateTimeString || '','',0,
          0,0,''
        ]

        const [packet, fields] = await connection.execute(query, values);
    }

  } catch(err) {
    console.error(err);
  }finally {
    // 연결 종료
    await connection.end();
  }
}

async function writeDisease(m, sickData) {
  const connection = await mysql.createConnection(mysqlConfig);
  // CUST_NO : CUSTOMERID
  const getCostomerId = m.get('costomerId');

  // key: [방문스케줄ID, 방문날짜], value : 스케줄아이디
  const getScheduleId = m.get('scheduleId');

  // key: 스케줄ID, value: 스케줄날짜
  const getScheduleDate = m.get('scheduleDate');
  try {
    const currentDateTimeString = getCurrentDateTimeString();
    for (const data of sickData) {

      if (data.CUST_NO === '') {
        // CUST_NO가 없으면 pass
        continue;
      }
      
      // CUST_NO에 대한 CUSTOMERID MAP에서 가져오기
      const customerId = getCostomerId[data.CUST_NO];

      // 현재 스케줄번호
      const curScheduleId = getScheduleId[`${customerId}, ${data.ENTR_DAY}`]

      const query = `
        INSERT INTO TDIAGNOSISDISEASE (
          SCHEDULEID,ORGID,DISEASECODE,DISEASETYPE,DISEASENAME,
          KCDV6ID,DISEASENAME_EN,SUSPECT,LRCODE,SEQ
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )`;

        const values = [
          curScheduleId || 0, 0, data.USE_SICK_CD || '', data.MAIN_SICK_TYPE || 0,'K',
          data.CUST_NO, 'E', 0, '', 0
        ]

        const [packet, fields] = await connection.execute(query, values);
    }

  } catch(err) {
    console.error(err);
  }finally {
    // 연결 종료
    await connection.end();
  }
}

async function writeMedicalItem(m, prscData) {
  const connection = await mysql.createConnection(mysqlConfig);
  // CUST_NO : CUSTOMERID
  const getCostomerId = m.get('costomerId');

  // key: [방문스케줄ID, 방문날짜], value : 스케줄아이디
  const getScheduleId = m.get('scheduleId');

  // key: 스케줄ID, value: 스케줄날짜
  const getScheduleDate = m.get('scheduleDate');
  try {
    const currentDateTimeString = getCurrentDateTimeString();
    for (const data of prscData) {

      if (data.CUST_NO === '') {
        // CUST_NO가 없으면 pass
        continue;
      }
      
      // CUST_NO에 대한 CUSTOMERID MAP에서 가져오기
      const customerId = getCostomerId[data.CUST_NO];

      // 현재 스케줄번호
      const curScheduleId = getScheduleId[`${customerId}, ${data.ENTR_DAY}`]

      const query = `
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

        const values = [
          curScheduleId || 0, data.USE_PRSC_CD || 0, data.USE_PRSC_CD || '', data.CLAIM_AMT || 0, 0,
          0, data.TOT_MDCT_QTY || 0, data.MDCT_QTY || 0, data.MDCT_CNT || 0, 0,
          0, '', '', '', data.CUST_NO || '', 
          '', 0, 0, 0, 0,
          '', '', '', 0, '',
          '', 0, ''
        ]

        const [packet, fields] = await connection.execute(query, values);
    }

  } catch(err) {
    console.error(err);
  }finally {
    // 연결 종료
    await connection.end();
  }
}

async function writeCustomerMemoMdclRsv(m, mdclRsvData) {
  const connection = await mysql.createConnection(mysqlConfig);
  // CUST_NO : CUSTOMERID
  const getCostomerId = m.get('costomerId');

  // key: [방문스케줄ID, 방문날짜], value : 스케줄아이디
  const getScheduleId = m.get('scheduleId');

  // key: 스케줄ID, value: 스케줄날짜
  const getScheduleDate = m.get('scheduleDate');
  try {
    const currentDateTimeString = getCurrentDateTimeString();
    for (const data of mdclRsvData) {
      if (data.CUST_NO === '') {
        // CUST_NO가 없으면 pass
        continue;
      }
      
      // CUST_NO에 대한 CUSTOMERID MAP에서 가져오기
      const customerId = getCostomerId[data.CUST_NO];

      // 현재 스케줄번호
      const curScheduleId = getScheduleId[`${customerId}, ${data.ENTR_DAY}`]

      const query = `
              INSERT INTO tcustomerschedule (
                  ORGID, CUSTOMERID, RESVTIME, RESVDATE, SCHEDULEDATE, SCHEDULETIME, SCHEDULESTATUS, SCHDOCTOR, SCHNURSE,
                  PHYSICALEMPL, CONSULTTIME, SVCAREA, VISITTYPE, CONSULTNOTE, PROGRESSNOTE, RESVMEMO, NURSEMEMO, BOOKMARK, INSTYPE,
                  DISCD, CRTIME, CONDITION1, CONDITION2, RESVCOUNT, RESVCFM, RESVTMO, RESVTDY, HISTMEMO, EXTRACOST,
                  RESVEMPLID, EXRECALL, TRPLAN, ASSESSMENT, PAYMENTTYPE, MEDCOST, PREGNANT, MIG, NOCON, NOCALC,
                  MODHIST, SUMMARY, TREATMENTROOM, SVCAREA2, REGTYPE, SCHTYPE,
                  COLOR, ROOMNO, DURATION, SELFCHCKSTATUS, HOMENURSE
              ) VALUES (
                  ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?
              )
          `;

        
        let CONSULTNOTE = data.RSV_MEMO.toString().trim();
        CONSULTNOTE = CONSULTNOTE.replace(/'/g, "''");
        CONSULTNOTE = CONSULTNOTE.replace(/\\/g, "");

        const values = [
          0, customerId || '', '', '', data.RSV_DAY || '', data.RSV_TIME + "00" || '', 0, Number(data.MDCL_ROOM), 0,
          0, data.RSV_DAY + data.RSV_TIME + "00" || '', 0, 0, CONSULTNOTE || '', '', '', '', 0, 0,
          0, currentDateTimeString || '', 0, 0, data.CHRG_DCTR || '', 0, 0, 0, '', 0,
          0, 0, data.MDCL_ROOM || '', '', customerId || '', data.MDCL_SEQNO || 0, 0, 0, 0, 0,
          '', '', 0, 0, 0, 0,
          '', 0, 0, 0, ''
        ]

        const [packet, fields] = await connection.execute(query, values);
    }

  } catch(err) {
    console.error(err);
  }finally {
    // 연결 종료
    await connection.end();
  }
}

async function writeCustomerScheduleCrmCsttDtalCntn(m, crmCsttDtalCntnData) {
  const connection = await mysql.createConnection(mysqlConfig);
  // CUST_NO : CUSTOMERID
  const getCostomerId = m.get('costomerId');

  // key: [방문스케줄ID, 방문날짜], value : 스케줄아이디
  const getScheduleId = m.get('scheduleId');

  try {
    const currentDateTimeString = getCurrentDateTimeString();
    for (const data of crmCsttDtalCntnData) {

      if (data.CUST_NO === '') {
        // CUST_NO가 없으면 pass
        continue;
      }
      
      // CUST_NO에 대한 CUSTOMERID MAP에서 가져오기
      const customerId = getCostomerId[data.CUST_NO];

      // 현재 스케줄번호
      const curScheduleId = getScheduleId[`${customerId}, ${data.ENTR_DAY}`]

      const query = `
              INSERT INTO tcustomerschedule (
                  ORGID, CUSTOMERID, RESVTIME, RESVDATE, SCHEDULEDATE, SCHEDULETIME, SCHEDULESTATUS, SCHDOCTOR, SCHNURSE,
                  PHYSICALEMPL, CONSULTTIME, SVCAREA, VISITTYPE, CONSULTNOTE, PROGRESSNOTE, RESVMEMO, NURSEMEMO, BOOKMARK, INSTYPE,
                  DISCD, CRTIME, CONDITION1, CONDITION2, RESVCOUNT, RESVCFM, RESVTMO, RESVTDY, HISTMEMO, EXTRACOST,
                  RESVEMPLID, EXRECALL, TRPLAN, ASSESSMENT, PAYMENTTYPE, MEDCOST, PREGNANT, MIG, NOCON, NOCALC,
                  MODHIST, SUMMARY, TREATMENTROOM, SVCAREA2, REGTYPE, SCHTYPE,
                  COLOR, ROOMNO, DURATION, SELFCHCKSTATUS, HOMENURSE
              ) VALUES (
                  ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?
              )
          `;

        
        let CONSULTNOTE = data.CSTT_DTAL.toString().trim();
        CONSULTNOTE = CONSULTNOTE.replace(/'/g, "''");
        CONSULTNOTE = CONSULTNOTE.replace(/\\/g, "");

        const values = [
          0, customerId || 0, '', '', data.ENTR_DAY || '', data.ENTR_TIME + "00" || '', 0, 0, 0,
          0, data.ENTR_DAY + data.ENTR_TIME + "00" || '', 0, 0, CONSULTNOTE || '', '', '', '', 0, 0,
          0, currentDateTimeString || '', 0, 0, '', 0, 0, 0, '', 0,
          0, 0, data.MDCL_ROOM || '', '', customerId || '', 0, 0, 0, 0, 0,
          '', '', 0, 0, 0, 0,
          '', 0, 0, 0, ''
        ]

        const [packet, fields] = await connection.execute(query, values);
    }

  } catch(err) {
    console.error(err);
  }finally {
    // 연결 종료
    await connection.end();
  }
}

async function writeCustomerScheduleStomCntn(m, crmCsttDtalCntnData) {
  const connection = await mysql.createConnection(mysqlConfig);
  // CUST_NO : CUSTOMERID
  const getCostomerId = m.get('costomerId');

  // key: [방문스케줄ID, 방문날짜], value : 스케줄아이디
  const getScheduleId = m.get('scheduleId');

  // key: 스케줄ID, value: 스케줄날짜
  const getScheduleDate = m.get('scheduleDate');
  try {
    const currentDateTimeString = getCurrentDateTimeString();
    for (const data of crmCsttDtalCntnData) {

      if (data.CUST_NO === '') {
        // CUST_NO가 없으면 pass
        continue;
      }
      
      // CUST_NO에 대한 CUSTOMERID MAP에서 가져오기
      const customerId = getCostomerId[data.CUST_NO];

      // 현재 스케줄번호
      const curScheduleId = getScheduleId[`${customerId}, ${data.ENTR_DAY}`]

      const query = `
              INSERT INTO tcustomerschedule (
                  ORGID, CUSTOMERID, RESVTIME, RESVDATE, SCHEDULEDATE, SCHEDULETIME, SCHEDULESTATUS, SCHDOCTOR, SCHNURSE,
                  PHYSICALEMPL, CONSULTTIME, SVCAREA, VISITTYPE, CONSULTNOTE, PROGRESSNOTE, RESVMEMO, NURSEMEMO, BOOKMARK, INSTYPE,
                  DISCD, CRTIME, CONDITION1, CONDITION2, RESVCOUNT, RESVCFM, RESVTMO, RESVTDY, HISTMEMO, EXTRACOST,
                  RESVEMPLID, EXRECALL, TRPLAN, ASSESSMENT, PAYMENTTYPE, MEDCOST, PREGNANT, MIG, NOCON, NOCALC,
                  MODHIST, SUMMARY, TREATMENTROOM, SVCAREA2, REGTYPE, SCHTYPE,
                  COLOR, ROOMNO, DURATION, SELFCHCKSTATUS, HOMENURSE
              ) VALUES (
                  ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?
              )
          `;

        
        let CONSULTNOTE = data.STOM_DESC.toString().trim();
        CONSULTNOTE = CONSULTNOTE.replace(/'/g, "''");
        CONSULTNOTE = CONSULTNOTE.replace(/\\/g, "");

        const values = [
          0, customerId || 0, '', '', data.ENTR_DAY || '', data.ENTR_TIME + "00" || '', 0, 0, 0,
          0, data.ENTR_DAY + data.ENTR_TIME + "00" || '', 0, 0, CONSULTNOTE || '', '', '', '', 0, 0,
          0, currentDateTimeString || '', 0, 0, data.CHRG_DCTR || '', 0, 0, 0, '', 0,
          0, 0, data.MDCL_ROOM || '', '', customerId || '', data.MDCL_SEQNO || 0, 0, 0, 0, 0,
          '', '', 0, 0, 0, 0,
          '', 0, 0, 0, ''
        ]

        const [packet, fields] = await connection.execute(query, values);
    }

  } catch(err) {
    console.error(err);
  }finally {
    // 연결 종료
    await connection.end();
  }
}

async function writeCustomerMemoMdclDayMemo(m, mdclDayMemoData) {
  const connection = await mysql.createConnection(mysqlConfig);
  // CUST_NO : CUSTOMERID
  const getCostomerId = m.get('costomerId');

  // key: [방문스케줄ID, 방문날짜], value : 스케줄아이디
  const getScheduleId = m.get('scheduleId');

  // key: 스케줄ID, value: 스케줄날짜
  const getScheduleDate = m.get('scheduleDate');
  try {
    const currentDateTimeString = getCurrentDateTimeString();
    for (const data of mdclDayMemoData) {

      if (data.CUST_NO === '') {
        // CUST_NO가 없으면 pass
        continue;
      }
      
      // CUST_NO에 대한 CUSTOMERID MAP에서 가져오기
      const customerId = getCostomerId[data.CUST_NO];

      // 현재 스케줄번호
      const curScheduleId = getScheduleId[`${customerId}, ${data.ENTR_DAY}`]

      const query = `
              INSERT INTO TCUSTOMERMEMO (
                ORGID,USERID,EMPLNAME,CUSTOMERID,MEMO,
                MEMODATE,MEMOTYPE,DISCD,CALLTYPE,CRTIME,
                SCHEDULEID,TOP,MODTIME,EMPLOYEEID,COLOR
              ) VALUES (
                  ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?
              )
          `;

        
        let CONSULTNOTE = data.MDCL_MEMO.toString().trim();
        CONSULTNOTE = CONSULTNOTE.replace(/'/g, "''");
        CONSULTNOTE = CONSULTNOTE.replace(/\\/g, "");

        const values = [
          0, '', '', customerId || 0, CONSULTNOTE || '',
          data.MDCL_DAY || '', 0, 0, 0, '',
          0, 0, '', 0, ''
        ]

        const [packet, fields] = await connection.execute(query, values);
    }

  } catch(err) {
    console.error(err);
  }finally {
    // 연결 종료
    await connection.end();
  }
}

async function writeCustomerMemoSprtRoomDlvrDtal(m, datas) {
  const connection = await mysql.createConnection(mysqlConfig);
  // CUST_NO : CUSTOMERID
  const getCostomerId = m.get('costomerId');

  // key: [방문스케줄ID, 방문날짜], value : 스케줄아이디
  const getScheduleId = m.get('scheduleId');

  // key: 스케줄ID, value: 스케줄날짜
  const getScheduleDate = m.get('scheduleDate');


  try {
    const currentDateTimeString = getCurrentDateTimeString();
    for (const data of datas) {

      if (data.CUST_NO === '') {
        // CUST_NO가 없으면 pass
        continue;
      }
      
      // CUST_NO에 대한 CUSTOMERID MAP에서 가져오기
      const customerId = getCostomerId[data.CUST_NO];

      // 현재 스케줄번호
      const curScheduleId = getScheduleId[`${customerId}, ${data.ENTR_DAY}`]

      const query = `
              INSERT INTO TCUSTOMERMEMO (
                ORGID,USERID,EMPLNAME,CUSTOMERID,MEMO,
                MEMODATE,MEMOTYPE,DISCD,CALLTYPE,CRTIME,
                SCHEDULEID,TOP,MODTIME,EMPLOYEEID,COLOR
              ) VALUES (
                  ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?
              )
          `;

        
        let CONSULTNOTE = data.DLVR_DTAL.toString().trim();
        CONSULTNOTE = CONSULTNOTE.replace(/'/g, "''");
        CONSULTNOTE = CONSULTNOTE.replace(/\\/g, "");

        const values = [
          0, '', '', customerId || 0, CONSULTNOTE || '',
          data.DLVR_DAY || '', 0, 0, 0, '',
          0, 0, '', 0, ''
        ]

        const [packet, fields] = await connection.execute(query, values);
    }

  } catch(err) {
    console.error(err);
  }finally {
    // 연결 종료
    await connection.end();
  }
}

async function main() {
    try {
        // fetchData 함수 호출 후 결과 확인
        // CUST_INFO, MDCL_DAY_SPE_CNTN 테이블에서 쿼리를 get

        const { custData, mdclData, mdclInfoData, rcptData, sickData, prscData,
                mdclRsvData, crmCsttDtalCntnData, stomCntnData, mdclDayMemoData,
                sprtRoomDlvrDtalData
         }  = await getfetchCustomer();


        // customer에 회원값을 insert후 CNTNNO - CUSTOMERID의 값으로 된 m을 return
        const m = await writecustomerData(custData);


        // // schedule 작성코드
        const scheduleMap = await writeSchedule(m, mdclInfoData);

        // schedule 작성 후 memo 추가 assent(명세서) 추가
        await insertCustomerSchedule(scheduleMap, mdclData);

        // writePaymentCard수행 
        await writePaymentCard(scheduleMap, rcptData);

        // writePaymentCash수행
        await writePaymentCash(scheduleMap, rcptData);

        // writeDisease 수행
        await writeDisease(scheduleMap, sickData);

        // writeMedicalItem 수행
        await writeMedicalItem(scheduleMap, prscData);
        
        // writeCustomerMemoMdclRsv 수행
        await writeCustomerMemoMdclRsv(scheduleMap, mdclRsvData);
        
        // writeCustomerScheduleCrmCsttDtalCntn 수행
        await writeCustomerScheduleCrmCsttDtalCntn(scheduleMap, crmCsttDtalCntnData);

        // writeCustomerScheduleStomCntn 수행
        await writeCustomerScheduleStomCntn(scheduleMap, stomCntnData);

        // writeCustomerMemoMdclDayMemo 수행
        await writeCustomerMemoMdclDayMemo(scheduleMap, mdclDayMemoData)

        // writeCustomerMemoSprtRoomDlvrDtal

        await writeCustomerMemoSprtRoomDlvrDtal(scheduleMap, sprtRoomDlvrDtalData)

      } catch (error) {
        console.error(error);
      }
}

main();
