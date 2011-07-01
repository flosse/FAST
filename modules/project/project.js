/**
* Copyright (c) 2011 Markus Kohlhase (mail@markus-kohlhase.de)
*/

/**
 * Class: list
 * This class contains the project module for fast.
 */
fast.modules.project = fast.modules.project || (function( window, undefined ){

  // container for keywords
  var keywords = {
      ALL: "ALL",
      NULL: "NULL"
  };

  /**
   * Class: project.controller
   */
  var controller = function( sb ){

    var model;
    var view;

    /**
    * Function: updateProject
    */
    var updateProject = function( entries ){
      model.projects = {};
      model.projects[ keywords.ALL ] = { name: sb._("All"), count: sb.count( entries ) }
      model.projects[ keywords.NULL ] = { name: sb._("WithoutProject"), count: countProjectless( entries ) }
      $.extend( model.projects, sortObject( getProjects( entries )) );
      model.entries = entries;
      model.notify();
    };

    var updateProjectForItem = function( item ){

      var oldItem = model.entries[ item.id ];

      if( projectChanged( oldItem.projects, item.projects ) ){
        model.entries[ item.id ] = item;
        updateProject( model.entries );
      }else{
        model.entries[ item.id ] = item;
      }
    };

    var projectChanged = function( a, b ){
      if( a.length !== b.length ){
        return true;
      }else{
        var x = a.sort();
        var y = b.sort();
        for( var i = 0; b[i]; i++ ){
          if( x[i] !== y[i] ){
            return true;
          }
        }
      }
      return false
    };

    /**
    * Function: countProjectless
    */
    var countProjectless = function( entries ){
      var count = 0;
      $.each( entries, function( i, entry ){
        if( entry ){
          if( !entry.projects ){
            count++;
          }
          else if( entry.projects.length < 1 ){
            count++;
          }
        }
      });
      return count;
    };

    /**
    * Function: update
    */
    var update = function(){
      sb.publish( fast.events.MASK, { id:"project", mask: filterByProject( model.entries, model.current ) } );
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
    * Function: getProjects
    */
    var getProjects = function( items ){

      var projects = {};
      var projectArray = [];

      $.each( items, function( i, item ){
        if( item ){
          if( item.projects ){

            for( var j in item.projects ){

              var proj = item.projects[j].trim();

              if( !projects[ proj ] && proj !== ""){
                projects[ proj ] = { name: proj, count: 1 };
              }else if( projects[ proj ] && proj !== ""){
                projects[ proj ].count++;
              }
            }
          }
        }
      });
      return projects;
    };

    /**
     * Function: filterByProject
     */
    var filterByProject = function( items, proj ){

      var entries = {};

      if( proj === keywords.ALL ){
        // copy items
        for( var i in items ){
          if( items[i] ){
            entries[ i ] = items[i].id;
          }
        }
        return entries;
      }
      if( proj === keywords.NULL ){
        proj = null;
      }

      for( var i in items ){

        var item = items[i];

        if( item ){

          if( !item.projects ){
            item.projects = [];
          }
          var projects = item.projects;

          if( !proj && projects.length < 1 ){
            entries[ item.id ] = item.id;
          }
          else if( proj && projects.length > 0 ){
            for( var j in projects ){
              if( projects[j].toLowerCase() === proj.toLowerCase() ){
                entries[ item.id ] = item.id;
              }
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

      model = new sb.getModel("model");
      model.subscribe( this );
      view = new sb.getView("view")();
      view.init( sb, model );
      sb.subscribe( fast.events.CHANGED, updateProject );
      sb.subscribe( fast.events.ITEM_CHANGED, updateProjectForItem );

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
  * Class: project.model
  */
  var model = {
    current: keywords.ALL,
    projects: {}
  };

  /**
  * Class: projcet.view
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
      c.delegate("li", "click", setProject );
      model.notify();

    };

    /**
    * Function: setProject
    */
    var setProject = function( ev ){
      model.current = $(this).data("project");
      model.notify();
    };

    /**
    * Function: update
    */
    var update = function(){
      c.empty();
      sb.tmpl( tmpl, { title: sb._("Project"), projects: model.projects, current: model.current } ).appendTo( c );
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
