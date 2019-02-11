const express = require('express');
const bodyparser = require('body-parser');

const app = express();

app.use(bodyparser.json());

app.post('/', (request, response) => {
    console.log(request.body);
    response.send('Hello World!');
});

app.listen(8080, () => {
    console.log("Server started on port 8080");
});