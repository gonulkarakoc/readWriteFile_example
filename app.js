const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);

const fs = require('fs');
const readline = require('readline');
const { once } = require('events');

let allLines = [];
async function processLineByLine() {
  try {
    const rl = readline.createInterface({
      input: fs.createReadStream('./file/id_file'),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      const  text = line.split(': ');
      allLines.push(text[1]);
    });
    await once(rl, 'close');

    const filterIds = allLines.filter(function (item, index){
      return  allLines.indexOf(item) >= index;
    });

    const writeStream = fs.createWriteStream('./file/unique_ids.txt');
    const pathName = writeStream.path;
    filterIds.forEach(value => writeStream.write(`${value}\n`));

    writeStream.on('finish', () => {
      console.log(`Wrote all the Id informations to file ${pathName}`);
    });
    writeStream.end();
  }
  catch (err) {
    console.error(err);
  }
};
processLineByLine();


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
