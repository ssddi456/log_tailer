var express = require('express');
var router = express.Router();

var storage = require('../lib/storage');
var child_process = require('child_process');

/* GET home page. */
router.get('/', function(req, res, next) {
  storage.get_views(function( err, views ) {
    if( err ){
      next(err);
    } else {
      res.render('index', { title: 'Express', views: views });
    }
  })
});


var log_cache = {
  // 
  // pathname : log cache
  // 
};

var max_age = 10 * 60 * 1000;

router.get('/start_log_tail', function( req, resp, next ) {
  var query = req.query;
  var pathname = query.pathname;

  if( pathname in log_cache ){
    resp.json({ err : 0 });
    return;
  }

  var cp = child_process.spawn('tail', [pathname, '-f']);

  var record = log_cache[pathname] = { 
    lastvisit : Date.now(),
    timeout : function() {
      cp.kill();
      clearTimeout(this.timer);
      delete log_cache[pathname];
    },
    tick : function() {
      clearTimeout(this.timer);
      this.timer = setTimeout( this.timeout, max_age );
    },
    timer : undefined
  };

  var buffer = [];

  record.buffer = buffer;

  cp.stdout.on('data',function( chuck ) {
    buffer.push(chuck);

    if( Date.now() - record.lastvisit > max_age ) {
      record.timeout();
    } else {
      record.tick();
    }
  });

  cp.stderr.on('data',function() { });

  cp.on('exit', function() {
    // do finish here 
    console.log('end tail finish '); 
  });

  resp.json({ err : 0 });
    
});


router.get('/update_log', function( req, resp, next ) {
  var query = req.query;
  var pathname = query.pathname;

  var cache = log_cache[pathname].buffer;
  var text = cache.slice();

  cache.length = 0;
  cache.lastvisit = Date.now();

  text = Buffer.concat(text);
  console.log('text', text.length);

  resp.end(text);
});

router.post('/remove_view', function( req, resp, next ) {
  
  var body = req.body;
  var _id = body._id;

  storage.remove_view(_id, function( err ) {
    if(err){
      next(err);
    } else {
      resp.json({ err : 0 });
    }
  });
});

router.post('/add_view', function( req, resp, next ) {
  storage.add_view(function( err, doc ) {
    if( err ){
      next(err);
    } else {
      resp.json({
        view : doc,
        err  : 0
      });
    }
  });
});

router.post('/update_view', function( req, resp, next ) {
  var body = req.body;

  resp.update(body._id, body.data, function( err, res ) {
    if( err ){
      next(err);
      return;
    }

    resp.json({ err : 0 });
  });
});

router.post('/update_layout', function( req, resp, next) {
  var body = req.body;
  resp.update_layout( body, function(err, res ) {
    if( err ) {
      next(err);
      return;
    }

    resp.json({ err : 0 });
  });
});

module.exports = router;
