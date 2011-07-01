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
      model.notify();
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
      view = new sb.getView("view")( sb, model );
      view.init();
      sb.subscribe( fast.events.CHANGED, onCollectionChanged );
      sb.subscribe( fast.events.SELECT, onSelection );
    };

    /**
     * Function: destroy
     */
    var destroy = function(){
      sb.unsubscribe( fast.events.CHANGED );
      sb.unsubscribe( fast.events.SELECT );
      model = null;
      view.destroy();
      view = null;
    };

    // public API
    return ({
      init: init,
      destroy: destroy
    });

  };

  /**
   * Class: detail.view
   */
  var view = function( sb, model ){

    var c;
    var tmpl;

    /**
     * Function: init
     */
    var init = function( ){

      model.subscribe( this );
      $.datepicker.regional[ scaleApp.i18n.getBrowserLanguage() ];
      c = sb.getContainer()
      tmpl = sb.getTemplate("detail");
      model.notify();

      c.delegate( "button.due",'click', done );
      c.delegate( "button.done",'click', undo );
      c.delegate( "button.favorite.active",'click', disableFav );
      c.delegate( "button.favorite.inactive",'click', enableFav );
      c.delegate( "button.wait.active",'click', disableWait );
      c.delegate( "button.wait.inactive",'click', enableWait );
      c.delegate( "button.delete",'click', remove );

      c.delegate( "input.name",'keydown keyup', onTitleChanged );
      c.delegate( "input.contexts",'keydown keyup', onCtxtChanged );
      c.delegate( "input.projects",'keydown keyup', onProjChanged );
      c.delegate( "textarea.note",'keydown keyup', onNoteChanged );

      c.delegate( "input",'focusout', onFocusOut );
      c.delegate( "input",'focusin', onFocusIn );
      c.delegate( "textarea",'focusout', onFocusOut );
      c.delegate( "textarea",'focusin', onFocusIn );

    };

    /**
     * Function: onFocusOut
     */
    var onFocusOut = function( ev ){
      model.focus = false;
    };

    /**
     * Function: onFocusIn
     */
    var onFocusIn = function( ev ){
      model.focus = true;
    };

    /**
     * Function: destroy
     */
    var destroy = function(){
      // nothing implemented yet
    };

    /**
     * Function: remove
     */
    var remove = function(){
      if( model.selected[0] ){
        sb.publish( fast.events.DELETE, getCurrent().id );
        model.notify();
      }
    };

    /**
     * Function: done
     */
    var done = function(){
      if( model.selected[0] ){
        sb.publish( fast.events.DONE, getCurrent().id );
        model.notify();
      }
    };

    /**
     * Function: undo
     */
    var undo = function(){
      if( model.selected[0] ){
        sb.publish( fast.events.UNDO, getCurrent().id );
        model.notify();
      }
    };

    /**
    * Function: disableFav
    */
    var disableFav = function(){
      if( model.selected[0] ){
        sb.publish( fast.events.UNFAVORED, getCurrent().id );
        model.notify();
      }
    };

    /**
    * Function: favEnable
    */
    var enableFav = function(){
      if( model.selected[0] ){
        sb.publish( fast.events.FAVORED, getCurrent().id );
        model.notify();
      }
    };

    /**
    * Function: disableWait
    */
    var disableWait = function(){
      if( model.selected[0] ){
        sb.publish( fast.events.UNSET_WAIT, getCurrent().id );
        model.notify();
      }
    };

    /**
    * Function: enableWait
    */
    var enableWait = function(){
      if( model.selected[0] ){
        sb.publish( fast.events.SET_WAIT, getCurrent().id );
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
    var onTitleChanged = function( ev ){
      if( ev.which === 27 ){
        $(this).val( getCurrent().title ).blur();
      }else{
        var item = getCurrent();
        item.title = $(this).val();
        sb.publish( fast.events.UPDATE, item );
      }
    };

    /**
     * Function: onCtxtChanged
     */
    var onCtxtChanged = function( ev ){
      if( ev.which === 27 ){
        $(this).blur();
      }else{
        var item = getCurrent();
        var a = $(this).val().split(',');
        for( var j in a ){
          a[j] = a[j].trim();
        }
        item.contexts = a;
        sb.publish( fast.events.UPDATE, item );
      }
    };

     /**
     * Function: onProjChanged
     */
    var onProjChanged = function( ev ){
      if( ev.which === 27 ){
        $(this).blur();
      }
      else{
        var item = getCurrent();
        var a = $(this).val().split(',');
        for( var j in a ){
          a[j] = a[j].trim();
         }
        item.projects = a;
        sb.publish( fast.events.UPDATE, item );
      }
    };

    /**
     * Function: onNoteChanged
     */
    var onNoteChanged = function(){
      var item = getCurrent();
      item.note = $(this).val();
      sb.publish( fast.events.UPDATE, item );
    };

    /**
     * Function: onDateChanged
     */
    var onDateChanged = function( dateText, inst ){
      var item = getCurrent();
      var date = $(this).datepicker("getDate");
      if( date ){
        item.due = date.getTime();
      }else{
        item.due = false;
      }
      sb.publish( fast.events.UPDATE, item );
    };

    /**
     * Function: getCurrent
     */
    var getCurrent = function(){
      return model.entries[ model.selected[0] ];
    };

    /**
     * Function: update
     */
    var update = function(){

      var item = {};

      if( !model.focus ){

        c.empty();

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
          due: item.due,
          label_due: sb._("DueDate"),
          label_clearDate: sb._("clearDate"),
          note: item.note,
          favorite: item.favorite,
          wait: item.wait
        }).appendTo( c );

        c.find("textarea.note")
          .autoGrow()
          .focusout( update );

        var due = c.find("input.duedate");

        due.datepicker({
          onSelect: onDateChanged,
        });

        if( item.due ){
          due.datepicker("setDate", new Date(item.due) );
        }

        c.find("button.clear-date").click(function(){
            due.datepicker("setDate", null );
            onDateChanged();
        });
      }
    };

    // public API
    return({
      init: init,
      update: update,
      destroy: destroy
    });

  };

  /**
   * Class: detail.model
   */
  var model = {
    selected: [],
    entries: {}
  };

  // public modules
  return({
    controller: controller,
    model: model,
    view: view,
  });

})( window );
