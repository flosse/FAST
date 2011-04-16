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
      model.contexts = {};
      model.contexts[ keywords.ALL ] = { name: sb._("All"), count: countEntries( entries ) }      
      model.contexts[ keywords.NULL ] = { name: sb._("WithoutContext"), count: countContextless( entries ) }
      $.extend( model.contexts, sortObject( getContexts( entries )) );
      model.notify();
    };
    
    /**
    * Function: countContextless
    */  
    var countContextless = function( entries ){
      var count = 0;
      for( var i in entries ){	
	if( !entries[i].contexts ){
	  count++;
	}
	else if( entries[i].contexts.length < 1 ){
	  count++;
	}
      }
      return count;
    };
    
    /**
    * Function: update
    */       
    var update = function(){
      
      if( model.current === keywords.ALL ){
	sb.publish("context/changed", keywords.ALL );
      }else if( model.current === keywords.NULL ){
	sb.publish("context/changed", keywords.NULL );      
      }else{
	sb.publish("context/changed", model.current );
      }
    };
    
    /**
    * Function: countEntries
    */           
    var countEntries = function( items ){
      var count = 0;
      for( var i in items ){
	count++;
      }
      return count;
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
    }
    
    /**
    * Function: getContexts
    */           
    var getContexts = function( items ){
      
      var contexts = {};
      var contextArray = [];
      
      for( var i in items ){
	var item = items[i];
	
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
      sb.subscribe("collection/changed", updateCtxt );
      sb.publish("collection/refresh");      
      
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