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
       const custData = await sql.query('SELECT * FROM CUST_INFO');
       const mdclData = await sql.query('SELECT * FROM MDCL_DAY_SPE_CNTN');
       const mdclInfoData = await sql.query('SELECT * FROM MDCL_INFO');

       console.log(custData)

       return { custData: custData.recordset, mdclData: mdclData.recordset, mdclInfoData: mdclInfoData.recordset };

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


      return { custData: custData.recordset, mdclData: mdclData.recordset };

  } catch (err) {
      console.error(err);
  } finally {
      // 연결 종료
      sql.close();
  }
}

// Customer에 insert
async function customerData(custData) {
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
            data.NAME, data.CUST_NO,data.CTZN_NO,ctznno, 0, data.SEX, data.ENTR_DAY, data.MDFY_DAY, data.ADDR1 + data.ADDR2, currentDateTimeString, 
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

// 스케줄 작성
async function writeSchedule(m,mdclInfoData) {
  // mysql 연결
  const connection = await mysql.createConnection(mysqlConfig);

  const scheduleId = {};

  const scheduleDate = {};

  const currentDateTimeString = getCurrentDateTimeString();
  try{
    mdclInfoData.forEach(async (data) => {
      const custmerId = m[data.CUST_NO]
      
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
          )
        `;

      // 시간형식
      const scheduleTime = data.ENTR_TIME + '00';

      // 빈 항목의 값을 '',0로 변경
      const emptyString = '';
      const zeroValue = 0;

      const values = [
         zeroValue, custmerId, emptyString, emptyString, data.MDCL_DAY, scheduleTime, 7, zeroValue, zeroValue,
         zeroValue, currentDateTimeString, zeroValue, zeroValue, emptyString, emptyString, emptyString, emptyString, zeroValue, zeroValue,
         zeroValue, currentDateTimeString, zeroValue, zeroValue, data.CHRG_DCTR, zeroValue, zeroValue, zeroValue, emptyString, zeroValue,
         zeroValue, zeroValue, emptyString, data.SPE_CNTN, custmerId, data.MDCL_SEQNO, zeroValue, zeroValue, zeroValue, zeroValue,
         emptyString, emptyString, zeroValue, zeroValue, zeroValue, zeroValue,
         emptyString, zeroValue, zeroValue, zeroValue, emptyString

     ]
          
      const [packat, fields] = await connection.execute(query, values);

      // SCHEDULEID, CUSTOMERID, SCHEDULEDATE를 map으로 받아오기
      scheduleId[custmerId] = packat.insertId;
      scheduleDate[custmerId] = data.MDCL_DAY;
      
    })
    m.set('scheduleId',scheduleId)
    m.set('scheduleDate',scheduleDate)

    return m

  } catch(err) {
    console.error(err);
  }
  finally {
    // 연결 종료
    await connection.end();
  } 
}

async function insertCustomerSchedule(scheduleMap,mdclData) {
  const currentDateTimeString = getCurrentDateTimeString();
  // mysql 연결
  const connection = await mysql.createConnection(mysqlConfig);

  
  try{
      mdclData.forEach(async (data) => {
        // CUST_NO : COSTOMERID로 되어있는 객체 getCostomerId를 가져온다
        const getCostomerId = m.get('costomerId');

        // COSTOMERID : SCHEDULEDATE로 되어있는 객체 getScheduleDate를 가져온다
        const getScheduleDate = m.get('scheduleDate')

        // CUST_NO에 해당하는 customerid
        const curCustomerid = m.CUST_NO;

        // 확인한다
        // 해당 CUST_NO에 해당하는 COSTOMERID를 가져온다.
        const costmemberId = getCostomerId[curCustomerid];

        // 해당 데이터의 날짜는 data.ENTR_DAY다 이거와 costmemberId가 존재하는지 확인

        // getScheduleDate[costmemberId] 가 존재하면 있는거

        if (getScheduleDate[costmemberId]) {
          const query = `UPDATE tcustomerschedule SET ASSESSMENT = ? WHERE `
        }else {
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
            )
          `;

        // 시간형식
        const scheduleTime = data.ENTR_TIME + '00';

        // 빈 항목의 값을 '',0로 변경
        const emptyString = '';
        const zeroValue = 0;

        const values = [
           zeroValue, curCustomerid, emptyString, emptyString, data.ENTR_DAY, scheduleTime, 7, zeroValue, zeroValue,
           zeroValue, data.ENTR_DAY + data.ENTR_TIME + "00", zeroValue, zeroValue, emptyString, emptyString, emptyString, emptyString, zeroValue, zeroValue,
           zeroValue, emptyString, zeroValue, zeroValue, emptyString, zeroValue, zeroValue, zeroValue, emptyString, zeroValue,
           zeroValue, zeroValue, emptyString, data.SPE_CNTN, emptyString, zeroValue, zeroValue, zeroValue, zeroValue, zeroValue,
           emptyString, emptyString, zeroValue, zeroValue, zeroValue, zeroValue,
           emptyString, zeroValue, zeroValue, zeroValue, emptyString

       ]
            
        const [packat, fields] = await connection.execute(query, values);

        console.log(`Inserted CUSTOMERID: ${curCustomerid}`);
        }
      })

  } catch(err) {
      console.error(err);
  }
 finally {
    // 연결 종료
    await connection.end();
  }

}

async function main() {
    try {
        // fetchData 함수 호출 후 결과 확인
        // CUST_INFO, MDCL_DAY_SPE_CNTN 테이블에서 쿼리를 get

        const { custData, mdclData, mdclInfoData }= await getfetchCustomer100();


        // customer에 회원값을 insert후 CNTNNO - CUSTOMERID의 값으로 된 m을 return
        const m = await customerData(custData);


        // schedule 작성코드
        const scheduleMap = await writeSchedule(m, mdclInfoData);

        // schedule 작성 후 memo 추가

        insertCustomerSchedule(scheduleMap, mdclData);

      } catch (error) {
        console.error(error);
      }
}

main();
