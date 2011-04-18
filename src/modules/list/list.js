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
      for( var i in combineMasks( masks, equal ) ){
	model.filtered[i] = model.collection[i];
      }

    };
        
    /**
    * Function: init
    */    
    var init = function(){
      
      model = sb.getModel("model");
      view = new sb.getView("view")();
      view.init( sb, model );      
      sb.subscribe("collection/changed", onCollectionChanged );
      sb.subscribe("mask/changed", onMaskChanged );
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
      c.delegate( "li",'click', select );
      ulTmpl = sb.getTemplate("list");      
      model.subscribe( this );     
    };
    
    /**
    * Function: remove
    */
    var remove = function( ev ){
      id = $(this).parent().parent().attr("id");
      sb.publish("collection/delete", id );
    }
    
    /**
    * Function: done
    */
    var done = function( ev ){
      id = $(this).parent().parent().attr("id");
      sb.publish("collection/done", id );
    }
    
    /**
    * Function: undo
    */
    var undo = function( ev ){
      id = $(this).parent().parent().attr("id");
      sb.publish("collection/undo", id );
    }
    
    /**
    * Function: select
    */    
    var select = function( ev ){
      id = $(this).attr("id");
      model.selected[0] = id;
      model.notify();
      sb.publish("collection/select", id );
    };
    
    /**
    * Function: update
    */
    var update = function(){
      c.empty();
      sb.tmpl( ulTmpl, { entries: model.filtered, selected: model.selected[0]  } ).appendTo( c );
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
    groups: []
  };
  
  // public API
  return ({
    controller: controller,
    model: model,
    view: view
  });
  
})( window );