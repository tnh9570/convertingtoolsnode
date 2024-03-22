
// 샘플
async function updateMedicalItem(custData, scheduleData, inputData) {

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

            const customerId = custData[data.CUST_NO];

            const curScheduleId = scheduleData[`${customerId},${data.ENTR_DAY}`];
            // 데이터 변환코드

            const insertValues = [
                curScheduleId || 0, data.ITEMTITLE || 0, data.ITEMCODE || '', data.CLAIM_AMT || 0, 0,
                0, data.TOT_MDCT_QTY || 0, data.MDCT_QTY || 0, data.MDCT_CNT || 0, 0,
                orgId, '', '', '', String(data.CUST_NO).trim() || '',
                '', 0, 0, 0, 0,
                '', '', '', 0, '',
                '', 0, ''
            ]

            promises.push(executeMySqlQuery(insertMedicalQuery, insertValues));
            // const queryPromise = executeMySqlQuery(insertSchedule, insertValues).then((result) => {
            //     scheduleId[`${customerId},${data.ENTR_DAY}`] = result.insertId;
            //     scheduleDate[result.insertId] = data.MDCL_DAY;

            // promises.push(queryPromise);

            // }).catch((error) => {
            //     console.error("Error executing query:", error);
            // });
        }
        inputData[index] = null;
    });

    // 모든 프로미스가 완료될 때까지 기다림
    await Promise.all(promises);

    console.log('writeMedicalItem 완료');

    return true
}


promises.push(executeMySqlQuery(insertDiseaseQuery, insertValues).then(() => { console.log(data.CUST_NO) }));


async function updateDisease(custData, scheduleData, inputData) {
    // PAYMENT insert
    const insertDiseaseQuery = `
    INSERT INTO TDIAGNOSISDISEASE (
        SCHEDULEID,ORGID,DISEASECODE,DISEASETYPE,DISEASENAME,
        KCDV6ID,DISEASENAME_EN,SUSPECT,LRCODE,SEQ
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )`;

    const promises = [];
    inputData.forEach((data, index) => {
        if (data.CUST_NO) {

            const customerId = custData[data.CUST_NO];

            const curScheduleId = scheduleData[`${customerId},${data.ENTR_DAY}`];

            console.log(curScheduleId);

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

            promises.push(executeMySqlQuery(insertDiseaseQuery, insertValues).then(() => { console.log(data.CUST_NO) }));

        }
        inputData[index] = null;
    });

    // 모든 프로미스가 완료될 때까지 기다림
    await Promise.all(promises);

    console.log('writeDisease완료');

    return true;
}


async function updateMedicalItem(custData, scheduleData, inputData) {

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

            const customerId = custData[data.CUST_NO];

            const curScheduleId = scheduleData[`${customerId},${data.ENTR_DAY}`];
            // 데이터 변환코드

            const insertValues = [
                curScheduleId || 0, data.ITEMTITLE || 0, data.ITEMCODE || '', data.CLAIM_AMT || 0, 0,
                0, data.TOT_MDCT_QTY || 0, data.MDCT_QTY || 0, data.MDCT_CNT || 0, 0,
                orgId, '', '', '', String(data.CUST_NO).trim() || '',
                '', 0, 0, 0, 0,
                '', '', '', 0, '',
                '', 0, ''
            ]

            promises.push(executeMySqlQuery(insertMedicalQuery, insertValues));
        }
        inputData[index] = null;
    });

    // 모든 프로미스가 완료될 때까지 기다림
    await Promise.all(promises);

    console.log('writeMedicalItem 완료');

    return true
}

// 기존 코드 분석
promises.push(executeMySqlQuery(insertCustomerQuery, values).then((result) => { 
    custNoData[data.CUST_NO] = result.insertId;
}))


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


// 기존방식
// async function updateMedicalItem(mapData, inputData) {
//     // CUST_NO : CUSTOMERID
//     const getCostomerId = mapData.get('costomerId');

//     // key: [방문스케줄ID, 방문날짜], value : 스케줄아이디
//     const getScheduleId = mapData.get('scheduleId');

//     // PAYMENT insert
//     const insertMedicalQuery = `
//     INSERT INTO TSALEITEM (
//       SCHEDULEID,ITEMNAME,ITEMCODE,UNITPRICE,TOTALPRICE,
//       CATEGORY,NODAYS,DAILYDOSE,DAILYAPP,DISCOUNT,
//       ORGID,ACUPOINT,POSTURE,DESCRIPTION,SPCODE,
//       SPDETAIL,EXCLAIM,DURID,INS100,MAXPRICE,
//       PRESCMEMO,ACODE,SFLAG,TAX,SAMPLECODE,
//       MEMO,SEQ,DOSAGE
//     ) VALUES (
//       ?, ?, ?, ?, ?,
//       ?, ?, ?, ?, ?,
//       ?, ?, ?, ?, ?,
//       ?, ?, ?, ?, ?,
//       ?, ?, ?, ?, ?,
//       ?, ?, ?
//     )`;

//     const promises = inputData.map(async data => {
//         if (data.CUST_NO) {

//             const customerId = getCostomerId[data.CUST_NO];

//             const curScheduleId = getScheduleId[`${customerId},${data.ENTR_DAY}`];

//             // 데이터 변환코드

//             const insertValues = [
//                 curScheduleId || 0, data.ITEMTITLE || 0, data.ITEMCODE || '', data.CLAIM_AMT || 0, 0,
//                 0, data.TOT_MDCT_QTY || 0, data.MDCT_QTY || 0, data.MDCT_CNT || 0, 0,
//                 orgId, '', '', '', String(data.CUST_NO).trim() || '',
//                 '', 0, 0, 0, 0,
//                 '', '', '', 0, '',
//                 '', 0, ''
//             ]


//             try {
//                 console.log(`updateMedicalItem 시작 ${data.CUST_NO}`);
//                 await executeMySqlQuery(insertMedicalQuery, insertValues);
//                 console.log(`updateMedicalItem 완료 ${data.CUST_NO}`);

//             } catch (err) {
//                 console.error('Customer 데이터 삽입 중 오류 발생:', err);
//             }

//         }
//     });

//     // 모든 프로미스가 완료될 때까지 기다림
//     await Promise.all(promises);

//     console.log('writeMedicalItem 완료');

//     return mapData;
// }


STATEMENTID
,SCHEDULEID
,CUSTOMERID
,LIABILITYAMT
,CLAIMAMT
,AIDAMT1
,AIDAMT2
,NONINSAMT
,DISCOUNTAMT
,CARINSAMT
,LOSSAMT
,DISCD
,CRTIME
,ORGID
,INS100AMT
,LTCHARGEAMT
,LTCLAIMAMT
,TAXABLEAMT
,REFUNDAMT
,TAXDCAMT
