/**
* Copyright (c) 2011 Markus Kohlhase (mail@markus-kohlhase.de)
*/

var fast = fast || (function( window, undefined ){

  // container for the modules
  var modules = { };

  // container for all events
  var events = {
    SEARCH: "cli/search",
    CLI: "cli",
    CREATE: "collection/create",
    DONE: "collection/done",
    UNDO: "collection/undo",
    DELETE: "collection/delete",
    REFRESH: "collection/refresh",
    UPDATE: "collection/update",
    FAVORED: "collection/favored",
    UNFAVORED: "collection/unfavored",
    SET_WAIT: "collection/setWait",
    UNSET_WAIT: "collection/unsetWait",
    MASK: "mask/changed",
    SELECT: "select",
    GROUP: "group/changed",
    CHANGED: "collection/changed",
    ITEM_CHANGED: "collection/itemChanged",
    DUE: "collection/due"
  };

  var init = function(){

    $("#activatejs").remove();

    scaleApp.register("collection", fast.modules.collection.controller,{
      models: {
        collection: fast.modules.collection.collection,
        entry: fast.modules.collection.entry
      }
    });

    scaleApp.register("cli", fast.modules.cli.controller,{
      models: { model: fast.modules.cli.model },
      views: { view: fast.modules.cli.view },
      templates: { cli: "modules/cli/cli.html" },
      i18n: fast.modules.cli.i18n
    });

    scaleApp.register("list", fast.modules.list.controller,{
      models: { model: fast.modules.list.model },
      views: { view: fast.modules.list.view },
      templates: { list: "modules/list/list.html" },
      i18n: fast.modules.list.i18n
    });

    scaleApp.register("box", fast.modules.box.controller,{
      models: { model: fast.modules.box.model },
      views: { view: fast.modules.box.view },
      templates: { list: "modules/box/box.html" },
      i18n: fast.modules.box.i18n
    });

    scaleApp.register("group", fast.modules.group.controller,{
      models: { model: fast.modules.group.model },
      views: { view: fast.modules.group.view },
      templates: { list: "modules/group/group.html" },
      i18n: fast.modules.group.i18n
    });

    scaleApp.register("context", fast.modules.context.controller,{
      models: { model: fast.modules.context.model },
      views: { view: fast.modules.context.view },
      templates: { list: "modules/context/context.html" },
      i18n: fast.modules.context.i18n
    });

    scaleApp.register("project", fast.modules.project.controller,{
      models: { model: fast.modules.project.model },
      views: { view: fast.modules.project.view },
      templates: { list: "modules/project/project.html" },
      i18n: fast.modules.project.i18n
    });

    scaleApp.register("detail", fast.modules.detail.controller,{
      models: { model: fast.modules.detail.model },
      views: { view: fast.modules.detail.view },
      templates: { detail: "modules/detail/detail.html" },
      i18n: fast.modules.detail.i18n
    });

    scaleApp.register("fav", fast.modules.fav.controller,{
      models: { model: fast.modules.fav.model },
      views: { view: fast.modules.fav.view },
      templates: { fav: "modules/fav/fav.html" },
      i18n: fast.modules.fav.i18n
    });

    scaleApp.startAll( function(){
      scaleApp.publish( fast.events.REFRESH );
    });

  };

  return ({
    init: init,
    modules: modules,
    events: events
  });

})( window );

$(document).ready(function(){
  fast.init();
});
