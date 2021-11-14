import * as express from 'express';
import * as path from 'path';
import { json, urlencoded } from 'body-parser';
import { router } from './routes/index';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found') as (Error & { status: number });
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {

        res.status(err.status || 500);

        if (req.xhr) {

            res.json({
                err: 1,
                msg: err.message,
                stack: err.stack,
            });

        } else {

            res.render('error', {
                message: err.message,
                error: err,
            });

        }

    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);

    if (req.xhr) {

        res.json({
            err: 1,
            msg: err.message,
        });

    } else {

        res.render('error', {
            message: err.message,
            error: {},
        });

    }

});

export default app;
