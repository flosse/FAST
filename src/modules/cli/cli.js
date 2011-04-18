/**
* Copyright (c) 2011 Markus Kohlhase (mail@markus-kohlhase.de)
*/

/**
 * Class: cli
 * This class contains the commandline module for fast.
 */
fast.modules.cli = fast.modules.cli || (function( window, undefined ){

  /**
   * Class: cli.controller
   */
  var controller = function( sb ){
    
    // container for all keywords
    var keywords = {
      meta: '#',
      context: 'c',
      project: 'p',
      note: 'n',
      fav: 'f',    
    };
        
    var model;
    var view;
    
    /**
     * Function: parse
     * Parses the command string and creates an object with all parsed properties.
     * 
     * Parameters:
     * (String) cmd - command
     * 
     * Returns:
     * Object with parsed properties.
     */    
    var parse = function( cmd ){
      
      var inputArray = cmd.split( keywords.meta );
      var e = { title: inputArray[0] };
	
      for( var i = 1; i < inputArray.length; i++ ){
	  
	  var metaData = inputArray[i];
	  var keyChar = metaData[0];
	  var term = metaData.substr(1);
	  var termArray = term.split(',');
	  
	  for( var j in termArray ){
	    termArray[j] = termArray[j].trim();
	  }
	  
	  switch( keyChar ){
	    
	    case keywords.context:
	      e.contexts = termArray;
	      break;
	    case keywords.project:
	      e.projects = termArray;
	      break;
	    case keywords.note:
	      e.note = term;
	      break;
	    case keywords.fav:
	      e.fav = true;
	      break;
	  }
      }  
      return e;
    };
    
    /**
     * Function: resetModel
     */
    var resetModel = function(){
      model.enterPressed = false;
      model.cmd = '';
      model.notify();
    }
    
    /**
     * Function: update
     */
    var update = function( ev ){
                
      if( model.enterPressed === true ){
	if( model.cmd.trim() !== ''){
	  var e = parse( model.cmd.trim() );
	  sb.publish("collection/create", e );
	  resetModel();
	}
      }else{
	sb.publish( "cli", model.cmd );
      }
    };
    
    /**
     * Function: init
     */
    var init = function(){

      model = sb.getModel( "model" );
      sb.mixin( model, sb.observable );
      model.subscribe( this );
      
      view = new sb.getView( "view" )();
      view.init( sb, model );
    };
    
    /**
     * Function: destrory
     */
    destroy = function(){
      delete view;
      delete model;
    };
    
    // public API
    return ({
      init: init,
      destroy: destroy,
      update: update,
    });
  };
   
  /**
   * Class: cli.model
   */
  var model = {
    cmd: "",
    enterPressed: false
  };
    
  /**
   * Class: cli.view
   */
  var view = function(){
    
    var model;
    var cli;
    var sb;
    
    /**
     * Function: update
     */
    var update = function( ev ){
      cli.val( model.cmd );      
    };
    
    /**
     * Function: onKeyUp
     */
    var onKeyUp = function( ev ){
	  
      if( ev.which == '27' ){		// on escape
	model.cmd = '';
	model.notify();
      }else{
	model.cmd = $(this).val();
	if( ev.which == '13' ){		// on enter
	  model.enterPressed = true;
	  model.notify();
	}
      }
      
    }
    
    /**
     * Function: init
     */
    var init = function( s, m ){
	
	sb = s;
	model = m;
	cli = sb.tmpl("cli", {} );
	
	model.subscribe( this );
	
	cli.appendTo( sb.getContainer() );
	cli.attr("placeholder", sb._("placeholder"));
	cli.keyup( onKeyUp );
	
    };

    return ({ 
      init: init, 
      update: update       
    });     
    
  };
  
  // public classes
  return ({
    controller: controller,
    model: model,
    view: view
  });
  
})( window );