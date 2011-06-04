/**
* Copyright (c) 2011 Markus Kohlhase (mail@markus-kohlhase.de)
*/

/**
 * Class: list
 * This class contains the context module for fast.
 */
fast.modules.context = fast.modules.context || (function( window, undefined ){

  // container for keywords
  var keywords = {
      ALL: "ALL",
      NULL: "NULL"
  };

  /**
   * Class: context.controller
   */
  var controller = function( sb ){

    var model;
    var view;

    /**
    * Function: updateCtxt
    */
    var updateCtxt = function( entries ){
      model.entries = entries;
      model.contexts = {};
      model.contexts[ keywords.ALL ] = { name: sb._("All"), count: sb.count( entries ) }
      model.contexts[ keywords.NULL ] = { name: sb._("WithoutContext"), count: countContextless( entries ) }
      $.extend( model.contexts, sortObject( getContexts( entries )) );
      model.notify();
    };

    var updateItemCtxt = function( item ){

      var oldItem = model.entries[ item.id ];

      if( contextChanged( oldItem.contexts, item.contexts ) ){
        model.entries[ item.id ] = item
        updateCtxt( model.entries );
      }else{
        model.entries[ item.id ] = item
      }
    };

    var contextChanged = function( a, b ){
      if( a.length !== b.length ){
        return true;
      }else{
        var x = a.sort();
        var y = b.sort();
        for( var i = 0; b[i]; i++ ){
          if( x[i] !== y[i] ){
            return true;
          }
        }
      }
      return false
    };

    /**
    * Function: countContextless
    */
    var countContextless = function( entries ){
      var count = 0;
      $.each( entries, function( i, entry ){
        if( entry ){
          if( !entry.contexts ){
            count++;
          }
          else if( entry.contexts.length < 1 ){
            count++;
          }
        }
      });
      return count;
    };

    /**
     * Function: filterByContext
     */
    var filterByContext = function( items, ctxt ){

      var entries = { };

      if( ctxt === keywords.ALL ){
        // copy items
        for( var i in items ){
          if( items[i] ){
            entries[ i ] = items[i].id;
          }
        }
        return entries;
      }
      if( ctxt === keywords.NULL ){
        ctxt = null;
      }

      $.each( items, function( i, item ){

        if( item ){

          if( !item.contexts ){
            item.contexts = [];
          }
          var contexts = item.contexts;

          if( !ctxt && contexts.length < 1 ){
            entries[ item.id ] = item.id;
          }
          else if( ctxt && contexts.length > 0 ){
            for( var j in contexts ){
              if( contexts[j].toLowerCase() === ctxt.toLowerCase() ){
                entries[ item.id ] = item.id;
              }
            }
          }
        }
      });
      return entries;
    };

    /**
    * Function: update
    */
    var update = function(){
      sb.publish( fast.events.MASK, {
        id:"context",
        mask: filterByContext( model.entries, model.current )
      });
    };

    /**
    * Function: sortObject
    */
    var sortObject = function( o ){

      var sorted = {},
      key, a = [];

      for( key in o ){
        if( o.hasOwnProperty( key ) ){
          a.push( key );
        }
      }

      a.sort();

      for( key = 0; key < a.length; key++ ){
        sorted[ a[key] ] = o[ a[key] ];
      }
      return sorted;
    };

    /**
    * Function: getContexts
    */
    var getContexts = function( items ){

      var contexts = {};
      var contextArray = [];

      $.each( items, function( i, item ){
        if( item ){
          if( item.contexts ){

            for( var j in item.contexts ){

              var cntxt = item.contexts[j].trim();

              if( !contexts[ cntxt ] && cntxt !== ""){
                contexts[ cntxt ] = { name: cntxt, count: 1 };
              }else if( contexts[ cntxt ] && cntxt !== ""){
                contexts[ cntxt ].count++;
              }
            }
          }
        }
      });
      return contexts;
    };

    /**
    * Function: init
    */
    var init = function(){

      model = new sb.getModel("model");
      model.subscribe( this );
      view = new sb.getView("view")();
      view.init( sb, model );
      sb.subscribe( fast.events.CHANGED, updateCtxt );
      sb.subscribe( fast.events.ITEM_CHANGED, updateItemCtxt );

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
  * Class: context.model
  */
  var model = {
    entries: {},
    current: keywords.ALL,
    contexts: {}
  };

  /**
  * Class: context.view
  */
  var view = function(){

    var model;
    var sb;
    var tmpl;
    var c;

    /**
    * Function: init
    */
    var init = function( s, m ){

      sb = s;
      mode = m;
      model = m;
      model.subscribe( this );
      sb = s;
      c = sb.getContainer()
      tmpl = sb.getTemplate("list");
      c.delegate("li", "click", setContext );
      model.notify();

    };

    /**
    * Function: setContext
    */
    var setContext = function( ev ){
      model.current = $(this).data("context");
      model.notify();
    };

    /**
    * Function: update
    */
    var update = function(){
      c.empty();
      sb.tmpl( tmpl, { title: sb._("Context"), contexts: model.contexts, current: model.current } ).appendTo( c );
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
