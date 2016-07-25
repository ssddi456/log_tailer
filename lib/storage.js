var nedb = require('nedb');

var fs = require('fs');
var path = require('path');
var nedb = require('nedb');

var storage = new nedb({ 
                  filename : path.join(__dirname, '../data/storage.db'),
                  autoload : true
                });

storage.persistence.setAutocompactionInterval(3*60*1e3);

//
// 需要保存的配置 
// views
// active views
// view layouts
// 

function create_updates ( data ) {
  var updates = {};
  if( typeof data == 'object' ){

    for(var k in data){
      if( typeof data[k] != 'object' ){
        updates[k] = data[k];
      } else {

        for(var m in data[k] ){
          updates[k + '.' + m ] = data[k][m];
        }
        if( 'length' in data[k] ){
          updates[k + '.' + 'length' ] = data[k]['length']; 
        }
      }
    }
    if( 'length' in data ){
      updates['length' ] = data['length']; 
    }
  } else if( typeof data == 'string' ){
    updates.code = data
  }
  return updates;
}

var _storage = module.exports = {
  add_view : function( done ) {
    var note = {
      timestamp : Date.now(),
      type : 'view',
      name : 'untitled',
      pathname : '',
      highlights : []
    };
    storage.insert(note, done);
  },

  remove_view : function( id, done ) {
    storage.remove({ _id : id }, done);
  },
  get : function( id, done ){
    storage.findOne({
      _id : id
    }, done);
  },

  get_views : function( done ) {
    storage.find({ type : 'view' })
      .sort({ timestamp : -1 })
      .exec(function( err, notes) {
        if( err ){ return done(err); }
        if( !notes || !notes.length ){
          _storage.add_view(function( err, note ) {
            done(err, [note]);
          });
        } else {
          done(err, notes);
        }
      });
  },

  get_layout : function( done ) {
    storage.findOne({ type : 'layout' })
      .exec(function( err, layout) {
        if( err ){ return done(err); }
        done(err, layout || {});
      });
  },

  update_layout : function( data, done ) {
    var updates = create_updates(data);
    
    updates.timestamp = Date.now();
    updates.type = 'layout';

    storage.update({ type : 'layout' }, { $set : updates }, { upsert : true }, done);
  },

  update : function( id, data, done ){
    var updates = create_updates(data);

    updates.timestamp = Date.now();
    storage.update({ _id : id }, { $set : updates }, done);
  },

  storage : storage,

  remove : function( id, done ) {
    storage.remove({ _id : id },done);
  }
};