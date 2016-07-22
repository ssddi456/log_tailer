define([
  'ko'
],function(
  ko
){
  ko.bindingHandlers.log = {
    'init' : function(el, valueAccessor, allBindings, viewModel) {
      var val = valueAccessor()

      var $container = $(el);
      val.subscribe(function( val ) {
        $(el).html(val);
      });
    }
  };
});