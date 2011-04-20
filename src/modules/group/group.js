/**
* Copyright (c) 2011 Markus Kohlhase (mail@markus-kohlhase.de)
*/

/**
 * Class: box
 * This class contains the group module for fast.
 */
fast.modules.group = fast.modules.group || (function( window, undefined ){

  //container for keywords
  var keywords = {
    PROJECT: "PROJECT",
    CONTEXT: "CONTEXT",
    BOX: "BOX",
    WITHOUT_CONTEXT: "WithoutContext",
    WITHOUT_PROJECT: "WithoutProject",
    NEW: "New",
    DONE: "Done",
  };
  
  /**
   * Class: group.controller
   */  
  var controller = function( sb ){
    
    var model;
    var view;
    
    /**
     * Function: updateGroups
     */    
    var updateGroups = function( entries ){
      model.entries = entries;
      model.groups = {};
      model.groups[ keywords.PROJECT ] = { name: sb._("Project"), count: countProjects( entries ) };
      model.groups[ keywords.CONTEXT ] = { name: sb._("Context"), count: countContexts( entries ) };
      model.groups[ keywords.BOX ] = { name: sb._("Box"), count: 3 };
      model.notify();      
    };
    
    /**
     * Class: group
     */    
    var group = {
      
      /**
      * Function: byContext
      */    
      byContext: function( items ){
	
	groups = { };

	contexts = getContexts ( items );

	for( var i in contexts ){
	  groups[ i ] = { };
	}
	
	groups[ sb._(keywords.WITHOUT_CONTEXT) ] = { };
	
	for( var j in items ){
	  
	  var item = items[j];
	  
	  if( !item.contexts ){
	    item.contexts = [];
	  }
	  if( item.contexts.length > 0 ){
	    for( var k in item.contexts ){
	      groups[ item.contexts[k] ][ item.id ] = item.id;
	    }
	  }else{
	    groups[ sb._(keywords.WITHOUT_CONTEXT) ][ item.id ] = item.id;
	  }
	}
	
	return groups;
      },
      
      /**
      * Function: byProject
      */          
      byProject: function( items ){
	
	groups = { };

	projects = getProjects( items );

	for( var i in projects ){	  
	  groups[ i ] = { };
	}
	
	groups[ sb._(keywords.WITHOUT_PROJECT) ] = { };
	
	for( var j in items ){
	  
	  var item = items[j];
	  
	  if( !item.projects ){
	    item.projects = [];
	  }
	  if( item.projects.length > 0 ){
	    for( var k in item.projects ){
	      groups[ item.projects[k] ][ item.id ] = item.id;
	    }
	  }else{
	    groups[ sb._(keywords.WITHOUT_PROJECT) ][ item.id ] = item.id;
	  }
	}
	
	return groups;
      },
      
      /**
      * Function: byBox
      */    
      byBox: function( items ){
	
	groups = { };	
	groups[ sb._( keywords.NEW ) ] =  filterByBox( items, keywords.NEW );
	groups[ sb._( keywords.DONE ) ] = filterByBox( items, keywords.DONE );	
	return groups;	
      }
    };
    
    /**
     * Function: filterByBox
     */    
    var filterByBox = function( items, box ){
      
      var entries = { };
      
      switch( box ){
	case keywords.DONE:
	  for( var i in items ){
	    if( items[i].done === true ){
	      entries[i] = items[i].id;
	    }
	  }
	  break;
	case keywords.NEW:
	  for( var i in items ){
	    if( items[i].new === true ){
	      entries[i] = items[i].id;
	    }
	  }
	  break;
      }
      return entries; 
    };
    
    /**
     * Function: getContexts
     */        
    var getContexts = function( items ){
      
      var contexts = {};      
      
      for( var i in items ){
	var item = items[i];
	
	for( var j in item.contexts ){
	  
	  var cntxt = item.contexts[j].trim();
	  
	  if( !contexts[ cntxt ] && cntxt !== ""){
	    contexts[ cntxt ] = cntxt;
	  }
	}       
      }      
      return contexts;  
    };
    
    /**
     * Function: getProjects
     */    
    var getProjects = function( items ){
      
      var projects = {};      
      
      for( var i in items ){
	var item = items[i];
	
	for( var j in item.projects ){
	  
	  var proj = item.projects[j].trim();
	  
	  if( !projects[ proj ] && proj !== ""){
	    projects[ proj ] = proj;
	  }
	}       
      }      
      return projects;  
    };
    
    /**
     * Function: regroup
     */    
    var regroup = function(){
      switch( model.current ){
	case keywords.CONTEXT:
	  model.grouped = group.byContext( model.entries );
	  break;
	case keywords.PROJECT:
	  model.grouped = group.byProject( model.entries );
	  break;
	case keywords.BOX:
	  model.grouped = group.byBox( model.entries );
	  break;
      }      
    };
    
    /**
     * Function: update
     */
    var update = function(){
      regroup();
      sb.publish( fast.events.GROUP, model.grouped );
    };
    
    /**
    * Function: countProjects
    */  
    var countProjects = function( entries ){
      return countByType( entries, 'projects' );
    };
    
    /**
    * Function: countContexts
    */  
    var countContexts = function( entries ){
      return countByType( entries, 'contexts' );
    };
        
    /**
    * Function: countByType
    */  
    var countByType = function( entries, type ){
      
      var types = { }
      
      for( var i in entries ){
	if( entries[i][type] ){
	  for( var j in entries[i][type] ){
	    var t = entries[i][type][j];
	    if( !types[t] ){
	      types[t] = t;
	    }
	  }
	}
      }
      return sb.count( types );
    };
    
    /**
     * Function: init
     */
    var init = function(){
	model = sb.getModel("model");
	model.subscribe( this );
	view = new sb.getView("view")();
	view.init( sb, model );
	sb.subscribe( fast.events.CHANGED, updateGroups );
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
   * Class: group.model
   */
  var model = {
    groups: {},
    current: keywords.CONTEXT
  };
  
  /**
   * Class: group.view
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
      c.delegate("li", "click", setGroup );
    };
    
    /**
    * Function: setGroup
    */
    var setGroup = function( ev ){
      model.current = $(this).data("group");
      model.notify();
    };
    
    /**
    * Function: update
    */
    var update = function(){
      c.empty();      
      sb.tmpl( tmpl, { title: sb._("Grouping"), groups: model.groups, current: model.current } ).appendTo( c );
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