const express = require('express');

const sqlserverRouter = require('./routes/sqlserver');

const app = express();
const port = 3000; // 사용할 포트 번호를 지정하세요.

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/sqlserver', sqlserverRouter);

app.use((err, req, res, next) => {
    if (!err.message) err.message = '오류가 발생하였습니다.';
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).json({ err }); 
})

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

