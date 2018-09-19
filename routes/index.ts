import * as express from 'express';
export const router = express.Router();

import storage = require('../lib/storage');
import * as child_process from 'child_process';

var debug = require('debug')('log_tailer:index');

/* GET home page. */
router.get('/', function (req, res, next) {
    storage.getViews(function (err, views) {
        if (err) {
            next(err);
        } else {
            res.render('index', { title: 'Express', views });
        }
    });
});

const logCache = {
    //
    // pathname : log cache
    //
};

const maxAge = 10 * 60 * 1000;

router.post('/start_log_tail', function (req, resp, next) {
    const query = req.body;
    const pathname = query.pathname;

    if (pathname in logCache) {
        debug('has old log tailer');
        resp.json({ err: 0 });
        return;
    }
    debug('create new log tailer ');
    const cp = child_process.spawn('tail', [pathname, '-f']);

    const record = logCache[pathname] = {
        buffer: [],
        cp: cp
    };

    const buffer = record.buffer;

    cp.stdout.on('data', function (chuck) {
        buffer.push(chuck);
    });

    cp.stderr.on('data', function () { });

    cp.on('exit', function () {
        // do finish here
        debug('end tail finish ');
    });

    resp.json({ err: 0 });

});

router.post('*_log', function(req, resp, next ) {
    const query = req.body;
    const pathname = query.pathname;

    const tailer = logCache[pathname];

    debug(req.path, query);

    if(!tailer) {
        debug('log tailer for ' + pathname + ' not found');
        resp.json({ err: 1 });
        return;
    }
    debug('log tailer for ' + pathname + ' found');
    next();    
});


router.post('/append_log', function (req, resp, next) {
    debug('start append_log to ' + pathname);
    const query = req.body;
    const pathname = query.pathname;

    const tailer = logCache[pathname];

    tailer.buffer.push(new Buffer(req.body.text + '\n'));

    resp.json({ err: 0 });
});


router.post('/tail_log', function (req, resp, next) {
    const query = req.body;
    const pathname = query.pathname;

    const tailer = logCache[pathname];


    const cache = tailer.buffer;

    debug('tail_log', 'length', query.length, 'cache length', cache.length);

    const textBuffer = cache.slice(query.length || 0);

    const text = Buffer.concat(textBuffer).toString();
    resp.json({
        err: 0,
        text: text,
        length: cache.length
    });
});

router.post('/stop_tail_log', function (req, resp, next) {
    const query = req.body;
    const pathname = query.pathname;
    const tailer = logCache[pathname];


    tailer.cp.kill();
    logCache[pathname] = undefined;
    resp.json({ err: 0 });
});


router.post('/remove_view', function (req, resp, next) {

    const body = req.body;
    const _id = body._id;

    storage.removeView(_id, function (err) {
        if (err) {
            next(err);
        } else {
            resp.json({ err: 0 });
        }
    });
});

router.post('/add_view', function (req, resp, next) {
    storage.addView(function (err, doc) {
        if (err) {
            next(err);
        } else {
            resp.json({
                view: doc,
                err: 0,
            });
        }
    });
});

router.post('/update_view', function (req, resp, next) {
    const body = req.body;

    storage.update(body._id, body.data, function (err, res) {
        if (err) {
            next(err);
            return;
        }

        resp.json({ err: 0 });
    });
});

router.post('/update_layout', function (req, resp, next) {
    const body = req.body;
    storage.updateLayout(body, function (err, res) {
        if (err) {
            next(err);
            return;
        }

        resp.json({ err: 0 });
    });
});
