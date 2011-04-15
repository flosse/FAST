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
    * Function: init
    */    
    var init = function(){
      sb.info("init list");
      model = sb.getModel("model");
      view = new sb.getView("view")();
      view.init( sb, model );
      
      sb.subscribe("collection/changed", onCollectionChanged );
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
      sb.info("remove");
      id = $(this).parent().parent().attr("id");
      sb.publish("collection/delete", id );
    }
    
    /**
    * Function: update
    */
    var update = function(){
      c.empty();
      sb.tmpl( ulTmpl, { entries: model.collection } ).appendTo( c );
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
    collection: {}
  };
  
  // public API
  return ({
    controller: controller,
    model: model,
    view: view
  });
  
})( window );