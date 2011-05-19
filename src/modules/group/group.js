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
		WAIT: "Waiting",
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

		var updateGroupsForItem = function( item ){

			var oldItem = model.entries[ item.id ];

			if( oldItem.projects.length !== item.projects.length ){
				model.entries[ item.id ] = item;
				model.groups[ keywords.PROJECT ] = { name: sb._("Project"), count: countProjects( model.entries ) };
				model.notify();
			}
			if( oldItem.contexts.length !== item.contexts.length ){
				model.entries[ item.id ] = item;
				model.groups[ keywords.CONTEXT ] = { name: sb._("Context"), count: countContexts( model.entries ) };
				model.notify();
			}
			if( oldItem.new !== item.new || oldItem.done !== item.done || oldItem.wait !== item.wait ){
				model.entries[ item.id ] = item;
				model.notify();
			}
		};

		/**
		 * Class: group
		 */
		var group = {

			/**
			* Function: byContext
			*
			* Returns an object with avaiable contexts and its items
			*/
			byStringArray: function( items, arrayName, emptyName ){

				var groups = { };

				groups[ emptyName ] = { };

				$.each( items, function( j, item ){

					var arr = $.map( item[ arrayName ], function( c ){
						if( c.trim() !== "" ){ return c }
					});

					if( arr.length > 0 ){
						$.each( arr, function( k, content ){

							if( !groups[ content ] ){ groups[ content ] = {}; }
							groups[ content ][ j ] = j

						});
					}else{
						groups[ emptyName ][ j ] = j;
					}

				});

				return groups;

			},

			/**
			* Function: byContext
			*/
			byContext: function( items ){
			 return group.byStringArray( items, 'contexts', sb._( keywords.WITHOUT_CONTEXT ) )
			},

			/**
			* Function: byProject
			*/
			byProject: function( items ){
			 return group.byStringArray( items, 'projects', sb._( keywords.WITHOUT_PROJECT ) )
			},

			/**
			* Function: byBox
			*/
			byBox: function( items ){

				groups = { };
				groups[ sb._( keywords.NEW ) ] =  filterByBox( items, keywords.NEW );
				groups[ sb._( keywords.DONE ) ] = filterByBox( items, keywords.DONE );
				groups[ sb._( keywords.WAIT ) ] = filterByBox( items, keywords.WAIT );
				return groups;
			}
		};

		/**
		 * Function: filterByBox
		 */
		var filterByBox = function( items, box ){

			var filter = function( items, cond ){
				var entries = { };
				$.each( items, function( i, item ){
					if( cond( item ) ){
						sb.debug( item );
						entries[i] = item.id;
					}
				});
				return entries;
			}

			switch( box ){

				case keywords.DONE:
					return filter( items, function( item ){ return ( item.done != false ); });
				case keywords.NEW:
					return filter( items, function( item ){ return ( item.new === true ) });
				case keywords.WAIT:
					return filter( items, function( item ){ return ( item.wait === true ) });
			}
			return {};
	};

    /**
     * Function: getContexts
     */
    var getContexts = function( items ){
			return $.unique( $.map( items, function( item ){
					return item.contexts;
			}));
    };

    /**
     * Function: getProjects
     */
    var getProjects = function( items ){

			return $.unique( $.map( items, function( item ){
					return item.projects;
			}));
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

			$.each( entries, function( i, entry ){
				if( entry[type] ){
					$.each( entry[ type ], function( j, t ){
						if( !types[ t ] ){ types[ t ] = t; }
					});
				}
			});
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
			sb.subscribe( fast.events.ITEM_CHANGED, updateGroupsForItem );
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
