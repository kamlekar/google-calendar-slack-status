const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const app = express();
const port = process.env.PORT || 5000;
const { Init } = require('./src/init');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({
  verify: function(req:any, res:any, buff:any, encoding:any){
    console.log("====buffer response====");
    console.log(buff.toString());
    console.log("====end of buffer response====");
  }
}));

app.post('/', (req:any, res:any, next:any) => {
  // check for secret token
  if (!req.body.token || req.body.token !== process.env.SECRET_TOKEN) {
    next();
    return;
  }
  var options = { 
    eventSummary: req.body.title, 
    startDate: req.body.start,
    endDate: req.body.end, 
    eventAction: req.body.type
  };
  console.log(options);
  var init = new Init(options);

  init.init();

  res.status(200);
  res.send('🤘');
});
app.get('/', (req:any, res:any, next:any) => {
  // welcome message
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome!</title>
        <style>
          pre {
            background-color: #DDD;
            padding: 1em;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <h1>Your Heroku server is running!</h1>
        <p>You'll need the following information for your IFTTT recipe:</p>
        <h3>Body</h3>
        <pre>{
          "title":"<<<{{Title}}>>>",
          "start":"{{Starts}}",
          "end":"{{Ends}}",
          "token": "${process.env.SECRET_TOKEN}"
        }</pre>
      </body>
    </html>
  `);
});

app.use((req:any, res:any, next:any) => {
  res.status(404);
  res.send('Not found');
});

app.listen(port);
console.log(`Server running on port ${port}`);