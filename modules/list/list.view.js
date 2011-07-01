
/**
* Class: list.view
*/
fast.modules.list.view = (function( window, undefined ){

  return function(){

    var model;
    var sb;
    var ulTmpl;
    var c;

    /**
    * Function: init
    */
    var init = function( s, m ){
      sb = s;
      model = m;
      c = sb.getContainer();
      c.delegate( "button.due",'click', done );
      c.delegate( "button.done",'click', undo );
      c.delegate( "button.favorite.inactive",'click', favEnable );
      c.delegate( "button.favorite.active",'click', favDisable );
      c.delegate( "div.item",'click', select );
      ulTmpl = sb.getTemplate("list");
      model.subscribe( this );
    };

    /**
    * Function: remove
    */
    var remove = function( ev ){
      id = $(this).parent().attr("rel");
      sb.publish( fast.events.DELETE, id );
    };

    /**
    * Function: done
    */
    var done = function( ev ){
      id = $(this).parent().attr("rel");
      sb.publish( fast.events.DONE, id );
    };

    /**
    * Function: undo
    */
    var undo = function( ev ){
      id = $(this).parent().attr("rel");
      sb.publish( fast.events.UNDO, id );
    };

    /**
    * Function: favDisable
    */
    var favDisable = function( ev ){
      id = $(this).parent().attr("rel");
      sb.publish( fast.events.UNFAVORED, id );
    };

    /**
    * Function: favEnable
    */
    var favEnable = function( ev ){
      id = $(this).parent().attr("rel");
      sb.publish( fast.events.FAVORED, id );
    };

    /**
    * Function: select
    */
    var select = function( ev ){
      id = $(this).attr("rel");
      model.selected[0] = id;
      model.notify();
      sb.publish( fast.events.SELECT, id );
    };

    /**
    * Function: updateItem
    */
    var updateItem = function( id ){
      sb.debug( "update item " + id );
    };

    /**
    * Function: update
    */
    var update = function(){

      if( model.collectionChanged === true ){
        c.empty();

        for( var i in model.grouped ){
          var entries = {};
            for( var j in model.grouped[i] ){
              entries[j] = model.collection[j];
          }
          if( sb.count(entries) > 0){
            sb.tmpl( ulTmpl, { title: i ,entries: entries, selected: model.selected[0] } ).appendTo( c );
          }
        }
        c.find(".items").isotope({
          animationEngine : 'best-available',
          itemSelector: '.item',
          layoutMode : 'cellsByRow',
          resizable: true,
          cellsByRow : {
            columnWidth : 240,
            rowHeight : 25
          },
        });
      }
    };

    // public API
    return({
      init: init,
      update: update
    });
  };
})( window );
