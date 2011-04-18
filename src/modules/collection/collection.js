/**
* Copyright (c) 2011 Markus Kohlhase (mail@markus-kohlhase.de)
*/

/**
 * Class: collection
 * This class contains the collection module for fast.
 */
fast.modules.collection = fast.modules.collection || (function( window, undefined ){
  
 /**
 * Class: collection.controller
 */
  var controller = function( sb ){
    
    var collection;
    var entry;
    
    /**
    * Function: getUniqueId
    * 
    * Parameters;
    * (String) salt
    * 
    * Returns:
    * a unique id
    */
    var getUniqueId = function( salt ){
      
      var rand = Math.round( Math.random() * 100 );
      var time = (new Date()).getTime();
      
      if( typeof( salt ) == "string" || typeof( salt ) == "number" ){
	return rand + "" + time + ":" + salt;
      }else{
	return rand + "" + time + "";
      }
    };
    
    /**
    * Function: create
    */        
    var create = function( ev ){      
      var e = new entry( getUniqueId( ev.title ), ev.title );      
      if( typeof ev.contexts ){ 
	e.contexts = ev.contexts;
      }
      collection.entries[ e.id ] = e;      
      saveData( collection.entries );
      collection.notify();
    };
    
    /**
    * Function: remove
    */        
    var remove = function( id ){      
      delete collection.entries[ id ];
      saveData( collection.entries );
      collection.notify();
    };
    
    /**
    * Function: done
    */        
    var done = function( id ){      
      changeProperty( id, 'done', true );
      changeProperty( id, 'new', false );
    };
    
    /**
    * Function: undo
    */        
    var undo = function( id ){
      changeProperty( id, 'done', false );      
      changeProperty( id, 'new', true );
    };
    
    /**
    * Function: updateEntry
    */        
    var updateEntry = function( e ){
      collection.entries[ e.id ] = e;
      saveData( collection.entries );
      sb.publish("collection/changed", collection.entries );
    };
    
    /**
    * Function: changeProperty
    */        
    var changeProperty = function( id, property, value ){      
      collection.entries[ id ][property] = value;
      saveData( collection.entries );
      collection.notify();
    };
    
    /**
    * Function: update
    */            
    var update = function(){      
      sb.publish("collection/changed", collection.entries );
    };
    
    /**
    * Function: saveData
    */        
    var saveData = function( entries ){
          
      localStorage.clear();
      for( i in entries ){
	var e = entries[i];
	if( e ){
	  localStorage.setItem( e.id, JSON.stringify( e ) );
	}
      }    
    };
    
    /**
    * Function: restoreData
    * Loads the data from local storage.
    */
    var restoreData = function(){
      
      var entries = {};

      if( localStorage ){      

	for( var i = 0; i < localStorage.length; i++ ){
	  var item = localStorage.key(i);

	  var json = localStorage.getItem( item );

	  if( json ){
	    entries[item] = JSON.parse( json );	
	  }
	}      
      }
      return entries;
    };
    
    /**
    * Function: init
    */        
    var init = function(){      
                  
      collection = sb.getModel("collection");      
      collection.subscribe( this );
      collection.entries = restoreData();
      
      entry = sb.getModel("entry");      
      sb.subscribe("collection/create", create );
      sb.subscribe("collection/done", done );
      sb.subscribe("collection/undo", undo );
      sb.subscribe("collection/delete", remove );
      sb.subscribe("collection/refresh", update );
      sb.subscribe("collection/update", updateEntry );
      
    };
    
    /**
    * Function: destroy
    */        
    var destroy = function(){
      // nothing yet
    };
    
    // public API
    return ({ 
      init: init, 
      destroy: destroy,
      update: update
    });
  };
  
  /**
  * Class: collection
  */          
  var collection = {
    entries: {}
  };
  
  /**
  * Class: entry
  */          
  var entry = function( id, title ){
    
    return({
      id: id,
      title: title,
      contexts: [],
      new: true,
      done: false,
      note: ""
    });    
    
  };  
  
  // public modules
  return({
    controller: controller,
    entry: entry,
    collection: collection
  });
  
})( window );