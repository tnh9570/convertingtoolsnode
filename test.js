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


async function getfetchCustomer() {
    try {
      // sqlserver 연결
      await sql.connect(sqlConfig);
  
       // 쿼리 실행
       const result = await sql.query('SELECT * FROM CUST_INFO');

       return result.recordset;

    } catch (err) {
      console.error(err);
    } finally {
      // 연결 종료
      sql.close();
    }
  }

async function customerData(glovalValue) {
    const currentDateTimeString = getCurrentDateTimeString();
  try{
      // mysql 연결
      const connection = await mysql.createConnection(mysqlConfig);
      
      // 100개만 넣기위해
      let cnt = 0;

      glovalValue.map(async (data) => {
        const query = `
        INSERT INTO tcustomerpersonal (
          CUSTNO, CUSTNAME, CUSTJN, CUSTDOB, DOBTYPE, CUSTGENDER,
          CUSTREGDATE, CUSTFSTDATE, CUSTADDR11, CRTIME, 
          ORGID, CUSTCELL1, CUSTCELL2, CUSTPHONE1, CUSTPHONE2, CUSTEMAIL,
          CUSTWEB, CUSTSVCAREA, CUSTTYPE, CUSTLVL, CUSTJOB, CUSTPIC, CUSTLSTDATE, CUSTZIPCODE1,
          CUSTADDR12, CUSTZIPCODE2, CUSTADDR21, CUSTADDR22, CUSTZIPCODE3, CUSTADDR31, CUSTADDR32,
          CUSTNICKNAME, CUSTINTRE, CUSTINFX, CUSTMEMO, PERSONALINFO, INTROMEMO, STATE1, SURNAME
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          data.CUST_NO, data.NAME, data.CTZN_NO,ctznno, 0, data.SEX, data.ENTR_DAY, data.MDFY_DAY, data.ADDR1 + data.ADDR2, currentDateTimeString, 
          zeroValue, emptyString, emptyString, emptyString, emptyString, emptyString, emptyString, emptyString, emptyString, emptyString,
          emptyString, emptyString, emptyString, emptyString, emptyString, emptyString, emptyString, emptyString, emptyString, emptyString, emptyString,
          emptyString, emptyString, emptyString, emptyString, zeroValue, emptyString, emptyString, 
        ]
            
        const [rows, fields] = await connection.execute(query, values);

        console.log(`Inserted CUSTOMERID: ${data.CUST_NO}`);
      })

      // 연결 종료
      await connection.end()
  } catch(err) {
      console.error(err);
  }
  
}


// 테스트용 100개만 넣는 코드
async function customerData100(glovalValue) {
  const currentDateTimeString = getCurrentDateTimeString();
  try {
      // mysql 연결
      const connection = await mysql.createConnection(mysqlConfig);
      
      // 100개만 넣기위해
      let cnt = 0;

      for (const data of glovalValue) {
          // 최대 100개까지만 처리
          if (cnt >= 100) break;
          
          const query = `
          INSERT INTO tcustomerpersonal (
              CUSTNO, CUSTNAME, CUSTJN, CUSTDOB, DOBTYPE, CUSTGENDER,
              CUSTREGDATE, CUSTFSTDATE, CUSTADDR11, CRTIME, 
              ORGID, CUSTCELL1, CUSTCELL2, CUSTPHONE1, CUSTPHONE2, CUSTEMAIL,
              CUSTWEB
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          let ctznno = data.CTZN_NO.slice(0, 6);
          let ctznnoStation = Number(data.CTZN_NO.slice(0, 2)); 
          if (ctznnoStation > 24) {
              ctznno = '19' + ctznno;
          } else {
              ctznno = '20' + ctznno;
          }
          if (data.SEX === 'F') {
              data.SEX = 2;
          } else {
              data.SEX = 1;
          }

          // 빈 항목의 값을 '', 0으로 변경
          const emptyString = '';
          const zeroValue = 0;

          const values = [
              data.CUST_NO, data.NAME, data.CTZN_NO, ctznno, 0, data.SEX, data.ENTR_DAY, data.MDFY_DAY, data.ADDR1 + data.ADDR2, currentDateTimeString, 
              zeroValue, emptyString, emptyString, emptyString, emptyString, emptyString, emptyString, 
          ];
              
          const [rows, fields] = await connection.execute(query, values);

          console.log(`Inserted CUSTOMERID: ${data.CUST_NO}`);

          cnt++; // 처리된 레코드 수 증가
      }

      // 연결 종료
      await connection.end();
  } catch(err) {
      console.error(err);
  }
}


async function main() {
    try {
        // fetchData 함수 호출 후 결과 확인
        const glovalValue = await getfetchCustomer();
    
        // 테스트용 100개만 넣는 코드
        await customerData100(glovalValue);
      } catch (error) {
        console.error(error);
      }
}

main();
