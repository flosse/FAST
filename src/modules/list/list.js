/**
* Copyright (c) 2011 Markus Kohlhase (mail@markus-kohlhase.de)
*/

/**
 * Class: list
 * This class contains the list module for fast.
 */
fast.modules.list = fast.modules.list || (function( window, undefined ){
  
  // container for some keywords
  var keywords = {
    ALL: "ALL",
    NULL: "NULL"
  };
  
  /**
  * Class: list.controller 
  */
  var controller = function( sb ){
    
    var model;
    var view;

    // container for several filter
    var filter = {      
      
      byContext: function( items, ctxt ){
	
	var entries = { };    
	
	if( ctxt === keywords.ALL ){	  	  
	  // copy items	
	  for( var i in items ){
	    entries[ i ] = items[i];      
	  }
	  return entries;
	}
	if( ctxt === keywords.NULL ){
	  ctxt = null;
	}
    
	for( var i in items ){
	  
	  var item = items[i];
	  
	  if( item ){
	    
	    if( !item.contexts ){
	      item.contexts = [];
	    }
	    var contexts = item.contexts;

	    if( !ctxt && contexts.length < 1 ){	  
	      entries[ item.id ] = item;
	    }
	    else if( ctxt && contexts.length > 0 ){
	      for( var j in contexts ){
		if( contexts[j].toLowerCase() === ctxt.toLowerCase() ){ 
		  entries[ item.id ] = item;      
		}
	      }
	    }
	  }
	}
	return entries;      
      }      
    };
    
    /**
    * Function: onCollectionChanged
    */
    var onCollectionChanged = function( c ){
      model.collection = c;
      model.filtered = filter.byContext( model.collection, model.context );
      model.notify();
    };
    
    /**
    * Function: onContextChanged
    */
    var onContextChanged = function( c ){
      model.filtered = filter.byContext( model.collection, c );
      model.notify();
    };
    
    /**
    * Function: init
    */    
    var init = function(){
      
      model = sb.getModel("model");
      view = new sb.getView("view")();
      view.init( sb, model );
      
      sb.subscribe("collection/changed", onCollectionChanged );
      sb.subscribe("context/changed", onContextChanged );
      sb.publish("collection/refresh");
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
      c.delegate( "a.due",'click', remove );
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
    * Function: update
    */
    var update = function(){
      c.empty();
      sb.tmpl( ulTmpl, { entries: model.filtered } ).appendTo( c );
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
    collection: {},
    filtered: {},
    context: keywords.ALL
  };
  
  // public API
  return ({
    controller: controller,
    model: model,
    view: view
  });
  
})( window );