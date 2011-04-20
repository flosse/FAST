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
     // model.notify();
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
      c.delegate( "button.due",'click', done );
      c.delegate( "button.done",'click', undo );
      c.delegate( "button.favorite.active",'click', disableFav );
      c.delegate( "button.favorite.inactive",'click', enableFav );
      c.delegate( "button.delete",'click', remove );
      c.delegate( "input.name",'keyup', onTitleChanged );
      c.delegate( "input.contexts",'keyup', onCtxtChanged );
      c.delegate( "input.projects",'keyup', onProjChanged );
      c.delegate( "textarea.note",'keyup', onNoteChanged );
    };
    
    /**
     * Function: remove
     */
    var remove = function(){
      if( model.selected[0] ){
	sb.publish("collection/delete", model.selected[0] );
	model.notify();
      }      
    };
    
    /**
     * Function: done
     */
    var done = function(){
      if( model.selected[0] ){
	sb.publish("collection/done", model.selected[0] );
	model.notify();
      }      
    };
    
    /**
     * Function: undo
     */
    var undo = function(){
      if( model.selected[0] ){
	sb.publish("collection/undo", model.selected[0] );
	model.notify();
      }
    };
    
    /**
    * Function: disableFav
    */
    var disableFav = function(){
      if( model.selected[0] ){
	sb.publish( "collection/fav/disable", model.selected[0] );
	model.notify();
      }
    };

    /**
    * Function: favEnable
    */
    var enableFav = function(){
      if( model.selected[0] ){
	sb.publish( "collection/fav/enable", model.selected[0] );
	model.notify();
      }
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
     * Function: onTitleChanged
     */    
    var onTitleChanged = function(){
      var item = model.entries[ model.selected[0] ];
      item.title = $(this).val();
      sb.publish("collection/update", item );
    };
    
    /**
     * Function: onCtxtChanged
     */    
    var onCtxtChanged = function(){
      var item = model.entries[ model.selected[0] ];     
      var a = $(this).val().split(',');
      for( var j in a ){
	a[j] = a[j].trim();
      }
     item.contexts = a;
     sb.publish("collection/update", item );
    };
    
     /**
     * Function: onProjChanged
     */    
    var onProjChanged = function(){
      var item = model.entries[ model.selected[0] ];     
      var a = $(this).val().split(',');
      for( var j in a ){
	a[j] = a[j].trim();
      }
     item.projects = a;
     sb.publish("collection/update", item );
    };
    
    /**
     * Function: onNoteChanged
     */    
    var onNoteChanged = function(){
      var item = model.entries[ model.selected[0] ];     
      var note = $(this).val();      
      item.note = note;
      sb.publish("collection/update", item );
    };    
    
    /**
     * Function: update
     */
    var update = function(){

      c.empty();   
      var item = {};      
      
      if( model.selected.length === 1 ){
	item = model.entries[ model.selected[0] ] || item;
      }
                  
      sb.tmpl( tmpl, {
	label_delete: sb._("delete"),
	title: sb._("Details"),
	label_name: sb._("Name"),
	name: item.title,
	label_note: sb._("Note"),
	label_contexts: getCtxtString( item.contexts ),
	contexts: item.contexts,
	label_projects: sb._("Projects"),
	projects: item.projects,
	label_new: sb._("New"),
	isNew: trueFalseToYesNo( item.new ),
	done: item.done,
	note: item.note,
	favorite: item.favorite
      }).appendTo( c );
      c.find("textarea.note").autoGrow();
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