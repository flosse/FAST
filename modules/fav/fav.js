fast.modules.fav = fast.modules.fav || (function( window, undefined ){

  var controller = function( sb ){

    var model;
    var view;

    var onChange = function( data ){

      model.entries = data;
      model.notify();
    };

    var onItemChange = function( item ){

      var oldItem = model.entries[ item.id ];
      if( oldItem.favorite !== item.favorite ){
        model.entries[ item.id ] = item;
        model.notify();
      }
    };

    var onSelect = function( id ){
      model.selected = id;
      model.notify();
    };

    var init = function(){
      model = sb.getModel();
      view = new sb.getView()( sb, model );
      view.init();
      sb.subscribe( fast.events.CHANGED, onChange );
      sb.subscribe( fast.events.ITEM_CHANGED, onItemChange );
      sb.subscribe( fast.events.SELECT, onSelect );
    };

    var destroy = function(){};

    return ({
      init: init,
      destroy: destroy
    });
  };

  var view = function( sb, model ){

    var c;
    var tmpl;

    /**
    * Function: done
    */
    var done = function( ev ){
      id = $(this).parent().parent().attr("id");
      sb.publish( fast.events.DONE, id );
    };

    /**
    * Function: undo
    */
    var undo = function( ev ){
      id = $(this).parent().parent().attr("id");
      sb.publish( fast.events.UNDO, id );
    };

    /**
    * Function: favDisable
    */
    var favDisable = function( ev ){
      id = $(this).parent().parent().attr("id");
      sb.publish( fast.events.UNFAVORED, id );
    };

    /**
    * Function: favEnable
    */
    var favEnable = function( ev ){
      id = $(this).parent().parent().attr("id");
      sb.publish( fast.events.FAVORED, id );
    };

    /**
    * Function: select
    */
    var select = function( ev ){
      id = $(this).attr("id");
      model.selected = id;
      model.notify();
      sb.publish( fast.events.SELECT, id );
    };


    var init = function(){
      c = sb.getContainer();
      c.delegate( "button.due", "click", done );
      c.delegate( "button.done", "click", undo );
      c.delegate( "button.favorite", "click", favDisable );
      c.delegate( "li", "click", select );
      tmpl = sb.getTemplate("fav");
      model.subscribe( this );
    };

    var filterNewItems = function( items, delta ){
      return $.map( items, function( e ){
        if( e ){
          if( e.favorite === true ){
            if( e.done === false ){
              return e;
            }else if( typeof e.done === "number" ){
              if( e.done > (new Date).getTime() - delta ){
                return e;
              }
            }
          }
        }
      });
    };

    var update = function(){

      c.empty();
      sb.tmpl( tmpl, {
          header: sb._("Favorites"),
          entries: filterNewItems( model.entries, 86400000 ),
          selected: model.selected
        }).appendTo( c );
    };

    return ({
      init: init,
      update: update
    });
  };

  var model = {
    entries : [],
    selected: ""
  };

  return ({
    controller: controller,
    view: view,
    model: model
  });

})( window );
