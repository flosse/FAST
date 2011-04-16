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
      model.boxes = {};
      model.boxes[ keywords.ALL ] = { name: sb._("All"), count: countEntries( entries ) };
      model.boxes[ keywords.NEW ] = { name: sb._("New"), count: countNew( entries ) };
      model.boxes[ keywords.DONE ] = { name: sb._("Done"), count: countDone( entries ) };
      model.notify();      
    };
    
    /**
     * Function: update
     */
    var update = function(){
      sb.publish("box/changed", model.current );
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
    * Function: countNew
    */  
    var countNew = function( entries ){
      var count = 0;
      for( var i in entries ){
	if( entries[i].new === undefined ){
	  count++;
	}
	else if( entries[i].new === true ){
	  count++;
	}
      }
      return count;
    };
    
    /**
    * Function: countDone
    */  
    var countDone = function( entries ){
      var count = 0;
      for( var i in entries ){
	if( entries[i].done === true ){
	  count++;
	}
      }
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
	sb.subscribe("collection/changed", updateBoxes );
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
      sb.tmpl( tmpl, { title: sb._("Box"), boxes: model.boxes, current: model.current } ).appendTo( c );
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