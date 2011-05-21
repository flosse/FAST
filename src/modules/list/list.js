/**
* Copyright (c) 2011 Markus Kohlhase (mail@markus-kohlhase.de)
*/

/**
 * Class: list
 * This class contains the list module for fast.
 */
fast.modules.list = fast.modules.list || (function( window, undefined ){

  /**
  * Class: list.controller
  */
  var controller = function( sb ){

    var model;
    var view;

    /**
    * Function: onCollectionChanged
    */
    var onCollectionChanged = function( c ){
      model.collection = c;
      model.notify();
    };

    var onItemChanged = function( item ){

			var old = model.collection[ item.id ];

			if( old.done !== item.done || old.title !== item.title || old.favorite !== item.favorite ){
				model.collection[ item.id ] = item;
				model.notify();
			}else{
				model.collection[ item.id ] = item;
			}

    };
    /**
    * Function: onMaskChanged
    */
    var onMaskChanged = function( data ){
      if( typeof data === "object" ){
				if( data.id && data.mask ){
					model.masks[ data.id ] = data.mask;
					refilter();
					model.notify();
				}
      }
    };

    /**
    * Function: onMaskChanged
    */
    var onGroupChanged = function( data ){
      model.groupedMask = data;
      refilter();
      model.notify();
    };

    /**
    * Function: onSearch
    */
    var onSearch = function( pattern ){

      var mask = {};
      var search = new RegExp( pattern, 'gi' );

      for( var i in model.collection ){

				if( search.test( model.collection[i].title ) ){
					mask[ i ] = i;
				}
      }

      model.masks["search"] = mask;
      refilter();
      model.masks["search"] = undefined; // reset the mask
      model.notify();

    };

		var onSelect = function( id ){
      model.selected[0] = id;
      model.notify();
		};

    /**
    * Function: equal
    */
    var equal = function( a, b ){
      return ( a === b ) ? a : false;
    };

    /**
    * Function: or
    */
    var or = function( a, b ){
      return ( a || b ) ? a || b : false;
    };

    /**
    * Function: maxObj
    */
    var maxObj = function( a,b ){
      return ( sb.count(b) > sb.count(a) ) ? b : a;
    };

    /**
    * Function: combineMasks
    *
    * Parameters:
    * (Array) a
    * (Function) fn
    */
    var combineMasks = function( a, fn ){

      if( a.length === 1 ){

				return a[0];

      }else if( a.length === 2 ){

				var newMask = {};
				var c = maxObj( a[0], a[1] );
				var d = false;

				for( var i in c ){
					d = fn( a[0][i], a[1][i] );
					if( d ){
						newMask[ i ] = d;
					}
				}
				return newMask;

      } // a.length > 3
      return combineMasks( [ a[0], combineMasks( a.slice(1), fn ) ], fn );
    };

    /**
    * Function: refilter
    */
    var refilter = function(){

      var masks = [];

      for( var i in model.masks ){
				if( model.masks[i] ){
					masks.push( model.masks[i] );
				}
      }

      model.filtered = {};
      var combinedMask = combineMasks( masks, equal );
      for( var i in combinedMask ){
				model.filtered[i] = model.collection[i];
      }

      model.grouped = {};
      for( var i in model.groupedMask ){
				model.grouped[ i ] = combineMasks([ model.groupedMask[i], combinedMask ], equal );
      };
    };

    /**
    * Function: init
    */
    var init = function(){

      model = sb.getModel("model");
      view = new sb.getView("view")();
      view.init( sb, model );
      sb.subscribe( fast.events.CHANGED, onCollectionChanged );
      sb.subscribe( fast.events.ITEM_CHANGED, onItemChanged );
      sb.subscribe( fast.events.MASK, onMaskChanged );
      sb.subscribe( fast.events.GROUP, onGroupChanged );
      sb.subscribe( fast.events.SEARCH, onSearch );
      sb.subscribe( fast.events.SELECT, onSelect );
    };

    /**
    * Function: destroy
    */
    var destroy = function(){
	// nothing yet
    };

    // public API
    return({
      init: init,
      destroy: destroy
    });
  };

  /**
  * Class: list.view
  */
  var view = function(){

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
      id = $(this).parent().parent().attr("id");
      sb.publish( fast.events.DELETE, id );
    };

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
      model.selected[0] = id;
      model.notify();
      sb.publish( fast.events.SELECT, id );
    };

    /**
    * Function: update
    */
		var update = function(){
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
		};

    // public API
    return({
      init: init,
      update: update
    });
  };

  /**
  * Class: list.model
  */
  var model = {
    selected:[],
    collection: {},
    filtered: {},
    masks: {},
    combinedMask: {},
    groupedMask: {}
  };

  // public API
  return ({
    controller: controller,
    model: model,
    view: view
  });

})( window );
