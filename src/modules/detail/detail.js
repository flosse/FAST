/**
* Copyright (c) 2011 Markus Kohlhase (mail@markus-kohlhase.de)
*/

/**
 * Class: list
 * This class contains the detail module for fast.
 */
fast.modules.detail = fast.modules.detail || (function( window, undefined ){
  
  /**
   * Class: detail.controller
   */  
  var controller = function( sb ){
    
    var model;
    var view;
    
    /**
     * Function: onCollectionChanged
     */    
    var onCollectionChanged = function( c ){
      model.entries = c;
    };
    
    /**
     * Function: onSelection
     */
    var onSelection = function( id ){   
      model.selected = [id];
      model.notify();
    };
    
    /**
     * Function: init
     */
    var init = function(){
	model = sb.getModel("model");
	model.subscribe( this );
	view = new sb.getView("view")();
	view.init( sb, model );
	sb.subscribe("collection/changed", onCollectionChanged );
	sb.subscribe("collection/select", onSelection );
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
      destroy: destroy
    });    
  };
  
  /**
   * Class: detail.view
   */
  var view = function(){
    
    var model;
    var sb;
    var c;
    var tmpl;
    
    /**
     * Function: init
     */
    var init = function( s, m ){
      sb = s;
      model = m;
      model.subscribe( this );
      c = sb.getContainer() 
      tmpl = sb.getTemplate("detail");	
      model.notify();
    };
    
    /**
     * Function: trueFalseToYesNo
     */
    var trueFalseToYesNo = function( val ){ 
      if( val === undefined ) return "";
      return val ? sb._("Yes") : sb._("No")
    };
    
    /**
     * Function: getCtxtString
     */
    var getCtxtString = function( c ){	
      if( c ){
	if( c.length > 1 ){
	  return sb._("Contexts");
	}	  
      }
      return sb._("Context");
    };
    
    /**
     * Function: update
     */
    var update = function(){

      c.empty();   
      var item = {};      
      
      if( model.selected.length === 1 ){
	item = model.entries[ model.selected[0] ];
      }
                  
      sb.tmpl( tmpl, {
	title: sb._("Details"),
	label_name: sb._("Name"),
	name: item.title,
	label_contexts: getCtxtString( item.contexts ),
	contexts: item.contexts,
	label_new: sb._("New"),
	isNew: trueFalseToYesNo( item.new ),
	label_done: sb._("Done"),
	isDone: trueFalseToYesNo( item.done )
      }).appendTo( c );
    };
    
    // public API
    return({
      init: init,
      update: update
    });
  };
  
  /**
   * Class: detail.view
   */
  var model = {
    selected: [],
    entries: {}
  };
  
  // public modules
  return({
    controller: controller,
    model: model,
    view: view
  });
  
})( window );