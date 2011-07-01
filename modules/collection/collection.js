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

      if( ev.contexts ){ e.contexts = ev.contexts;  }
      if( ev.projects ){ e.projects = ev.projects;  }
      if( ev.note ){ e.note = ev.note;  }
      if( ev.favorite ){ e.favorite = ev.favorite;  }

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
      changeProperty( id, 'done', (new Date).getTime() );
      changeProperty( id, 'new', false );
    };

    /**
    * Function: undo
    */
    var undo = function( id ){
      changeProperty( id, 'done', false );
      changeProperty( id, 'new', true );
    };

    var enableFav = function( id ){
      changeProperty( id, 'favorite', true );
    };

    var disableFav = function( id ){
      changeProperty( id, 'favorite', false );
    };

    var setWait = function( id ){
      changeProperty( id, 'wait', true );
    };

    var unsetWait = function( id ){
      changeProperty( id, 'wait', false );
    };
    var setDueDate = function( e ){
      changeProperty( e.id, 'due', e.date );
    };

    /**
    * Function: updateEntry
    */
    var updateEntry = function( e ){
      e.new = false;
      collection.entries[ e.id ] = e;
      saveData( collection.entries );
      sb.publish( fast.events.ITEM_CHANGED, e );
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
      sb.publish( fast.events.CHANGED, collection.entries );
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
            try{
              entries[item] = JSON.parse( json );
            }catch( e ){
              sb.error("could not parse json: " + e )
            }
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

      sb.subscribe( fast.events.CREATE, create );
      sb.subscribe( fast.events.DONE, done );
      sb.subscribe( fast.events.UNDO, undo );
      sb.subscribe( fast.events.DELETE, remove );
      sb.subscribe( fast.events.REFRESH, update );
      sb.subscribe( fast.events.UPDATE, updateEntry );
      sb.subscribe( fast.events.FAVORED, enableFav );
      sb.subscribe( fast.events.UNFAVORED, disableFav );
      sb.subscribe( fast.events.DUE, setDueDate );
      sb.subscribe( fast.events.SET_WAIT, setWait );
      sb.subscribe( fast.events.UNSET_WAIT, unsetWait );

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
      projects: [],
      new: true,
      wait: false,
      done: false,
      note: "",
      favorite: false,
      due: false,
      created: (new Date()).getTime()
    });

  };

  // public modules
  return({
    controller: controller,
    entry: entry,
    collection: collection
  });

})( window );
