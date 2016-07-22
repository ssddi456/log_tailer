define([
  'ko'
],function(
  ko
){
  function log_view() {
    var vm = {
      name : 'undefined',
      pathname : ko.observable('D:\\OneDrive\\shortcuts\\sl\\logs'),
      watching : ko.observable(false),
      log  : ko.observable(''),
      max_buffer : ko.observable(1000),
      timer : undefined,
      load_log : function( done ) {
        var self = this;
        $.get('/update_log',
          {
            pathname : this.pathname,
            time : Date.now()
          },
          function( text ) {
            done && done();

            text = self.log() + text;
            var count = text.split('\n').length;

            var count_delta = count - self.max_buffer();

            var index_lineend = 0;
            while( count_delta > 0 ){
              index_lineend = text.indexOf('\n', index_lineend)
              count_delta--;
              count--;
            }

            text = text.slice(index_lineend);
            self.line_count = count;
            self.log( text );
          });
      },
      start : function( done ) {
        $.get('/start_log_tail', {
          pathname : this.pathname
        }, function( args ) {
          console.log( args );
          done && done();
        });
      }
    };

    vm.watching.subscribe(function( bool ) {
      if( !bool ){
        if( vm.timer ){
          clearTimeout(vm.timer);
        }
      } else {
        if( vm.timer ){
          // pass
        } else {

          var load_log = function() {
            vm.load_log(function() {
              vm.timer = setTimeout(load_log, 1e3);
            })
          };

          vm.start(load_log);
        }
      }
    });
    return vm;
  }

  return log_view;
});