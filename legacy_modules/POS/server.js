const express = require('express');
const app = express();

app.get('/', (req,res) => {
    res.render('login.ejs');
})

app.listen(5500);