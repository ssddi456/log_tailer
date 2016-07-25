define([
  'ko'
],function(
  ko
){
  ko.bindingHandlers.log = {
    'init' : function(el, valueAccessor, allBindings, viewModel) {
      var val = valueAccessor()

      var $container = $(el);
      var $logs = $container.find('pre');
      var drag_handle = $container.find('.drag-handle');

      val.subscribe(function( val ) {
        $logs.html(val);


      });

      // 可拖拽的高度
      // 
      var drag_info = {
        current_max_height : 0
      };

      var min_draggable_height = 400;
      drag_handle
        .on('mousedown', function( e ) {
          e.preventDefault();
          var el_logs = $logs[0];

          var clientHeight = el_logs.clientHeight;
          if( clientHeight == el_logs.scrollHeight 
            || clientHeight > min_draggable_height
          ){
            return;
          }

          drag_info.current_max_height = parseInt($logs.css('maxHeight'));
          drag_info.start_y = e.clientY;

          $('body')
            .on('mousemove', drag_move)
            .on('mouseup', drag_end);

        });

      function adjust_log_viewport( e ) {
        var delta = e.clientY - drag_info.start_y;
        $logs.css('maxHeight', 
          Math.max(drag_info.current_max_height + delta, min_draggable_height));
      }

      function drag_move( e ) {
        e.preventDefault();
        adjust_log_viewport(e);
      }

      function drag_end( e ) {
        e.preventDefault();

        $('body')
          .off('mousemove', drag_move)
          .off('mouseup', drag_end);
        adjust_log_viewport(e);
      }
    }
  };
});