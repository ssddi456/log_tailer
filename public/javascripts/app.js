require([
  './log_view',
  'ko',
  './custom-bindings'
],function(
  log_view,
  ko,
  customBindings
){
  
  var vm = {
    active_views : ko.observableArray(),
    log_views : ko.observableArray(),
    add_view : function() {
      var self = this;
      $.post('/add_view', function( doc ) {
        var view = log_view.create(doc.view);
        self.log_views.push( view );
      });
    },
    remove_view : function( _vm ) {
      $.post('/remove_view', { _id : _vm._id }, function( res ) {
        if( !res.err ){
          vm.log_views.remove(_vm);
          vm.active_views.remove(_vm);
        }
      });
    }
  };

  //
  // 多窗口管理
  // 


  // bootstrap here

  views.forEach(function( doc ) {
    var view = log_view.create(doc);
    vm.log_views.push( view );
  });

  ko.applyBindings( vm );

});