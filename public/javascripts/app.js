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
    log_views : ko.observableArray()
  };

  var log_view1 = log_view();
  var log_view2 = log_view();

  vm.log_views.push(log_view1);
  vm.log_views.push(log_view2);

  // 在这里初始化各种view
  log_view1.pathname();
  log_view1.watching(true);
  log_view1.pathname();
  log_view2.watching(true);

  ko.applyBindings( vm );

});