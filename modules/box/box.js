/**
* Copyright (c) 2011 Markus Kohlhase (mail@markus-kohlhase.de)
*/

/**
 * Class: box
 * This class contains the box module for fast.
 */
fast.modules.box = fast.modules.box || (function( window, undefined ){

  //container for keywords
  var keywords = {
    ALL: "ALL",
    NEW: "NEW",
    WAITING: "WAITING",
    DONE: "DONE"
  };

  /**
   * Class: box.controller
   */
  var controller = function( sb ){

    var model;
    var view;

    /**
     *
     * Function: updateBoxes
     */
    var updateBoxes = function( entries ){
      model.entries = entries;
      model.boxes = {};
      model.boxes[ keywords.ALL ] = { name: sb._("All"), count: sb.count( filterByBox( entries, keywords.ALL ) ) };
      model.boxes[ keywords.NEW ] = { name: sb._("New"), count: countNew( entries ) };
      model.boxes[ keywords.WAITING ] = { name: sb._("Waiting"), count: countWaiting( entries ) };
      model.boxes[ keywords.DONE ] = { name: sb._("Done"), count: countDone( entries ) };
      model.notify();
    };

    var updateItem = function( item ){

      var oldItem = model.entries[ item.id ];

      if( oldItem.due !== item.due ){
        model.entries[ item.id ] = item;
        model.boxes[ keywords.DONE ] = { name: sb._("Done"), count: countDone( model.entries ) };
        model.notify();
      }
      else if( oldItem.new !== item.new ){
        model.entries[ item.id ] = item;
        model.boxes[ keywords.NEW ] = { name: sb._("New"), count: countNew( model.entries ) };
        model.notify();
      }
      else if( oldItem.wait !== item.wait ){
        model.entries[ item.id ] = item;
        model.boxes[ keywords.WAITING ] = { name: sb._("Waiting"), count: countWaiting( model.entries ) };
        model.notify();
      }
    };

    /**
     * Function: update
     */
    var update = function(){
      sb.publish( fast.events.MASK, {
        id: "box",
        mask: filterByBox( model.entries, model.current)
      });
    };

    /**
    * Function: filterByBox
    */
    var filterByBox = function( items, box ){

      var filter = function( items, cond ){
        var entries = { };
        $.each( items, function( i, item ){
          if( cond( item ) ){ entries[i] = item; }
        });
        return entries;
      };

      var reduce = function( items ){
        var entries = { };
        $.each( items, function( i, item ){
           entries[i] = i;
        });
        return entries;
      };

      var delta = 86400000;

      var doneFilter = function( item ){
        if( !item ){ return false }
        if( typeof item.done === "number" ){
          if( item.done < (new Date).getTime() - delta ){
            return false;
          }
        }else if( item.done === true ){
          return false;
        }
        return true;
      };

      switch( box ){

        case "ALL":
          return reduce( filter( items, doneFilter ) );
        case "DONE":
          return reduce( filter( items, function( item ){ return ( item.done !== false ); } ));
        case "NEW":
          return reduce( filter( items, function( item ){ return ( item.new === true ); } ));
        case "WAITING":
          return reduce( filter( filter( items, function( item ){ return ( item.wait === true ); } ), doneFilter ));

      }

      return {};
    };

    /**
    * Function: countNew
    */
    var countNew = function( entries ){
      var count = 0;
      $.each( entries, function( i, entry ){
        if( entry ){
          if( entry.new === undefined ){
            count++;
          }
          else if( entry.new === true ){
            count++;
          }
        }
      });
      return count;
    };

    /**
    * Function: countDone
    */
    var countDone = function( entries ){
      var count = 0;
      $.each( entries, function( i, entry ){
        if( entry ){
          if( entry.done !== false ){
            count++;
          }
        }
      });
      return count;
    };
    /**
    * Function: countWaiting
    */
    var countWaiting = function( entries ){
      var count = 0;
      $.each( entries, function( i, entry ){
        if( entry ){
          if( entry.wait === true ){
            count++;
          }
        }
      });
      return count;
    };

    /**
     * Function: init
     */
    var init = function(){
      model = sb.getModel("model");
      model.subscribe( this );
      view = new sb.getView("view")();
      view.init( sb, model );
      sb.subscribe( fast.events.CHANGED, updateBoxes );
      sb.subscribe( fast.events.ITEM_CHANGED, updateItem );
    };

    /**
     * Function: destroy
     */
    var destroy = function(){
  // nothing yet
    };

    //public API
    return({
      init: init,
      destroy: destroy,
      update: update
    });
  };

  /**
   * Class: box.model
   */
  var model = {
    boxes: {},
    current: keywords.ALL
  };

  /**
   * Class: box.view
   */
  var view = function(){

    var model;
    var sb;
    var tmpl;
    var c;

    var init = function( s, m ){

      sb = s;
      model = m;
      model.subscribe( this );
      c = sb.getContainer();
      tmpl = sb.getTemplate("list");
      c.delegate("li", "click", setBox );
    };

    /**
    * Function: setBox
    */
    var setBox = function( ev ){
      model.current = $(this).data("box");
      model.notify();
    };

    /**
    * Function: update
    */
    var update = function(){
      c.empty();
      sb.tmpl( tmpl, {
        title: sb._("Box"),
        boxes: model.boxes,
        current: model.current
      }).appendTo( c );
    };

    //public API
    return({
      init: init,
      update: update
    });
  };

  //public modules
  return({
    controller: controller,
    model: model,
    view: view
  });

})( window );
