// http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth

var rctk = rctk || {};

/*
 * We don't want a single, global monolithic object. In stead, create a
 * function that can be constructed multiple times using 'new', so we can
 * create multiple sessions in the same window. E.g. multiple applications
 * running in their own rctk space
 */
rctk.core = (function($) {
  // return a functions so we can create instances using new
  return function() {
    /*
     * Private state 
     */
    var not_defined = function(msg) { alert(msg); };
    var request_count = 0;
    var poll = false;
    var interval = 1000;
    var debug = false;
    var crashed = false;

    var handlers = {
        request: function(path, callback, sessionid, data) { 
            not_defined("Request function not set -> " + path); 
        },
        construct: function(klass, parent, id) {
            not_defined("Construct function not set");
        },
        dump: function(data, debug) {
            // invoked to dump a debug stacktrace
            alert(data);
        },
        busy: function() {
            // invoked when we're waiting for data
            // add a delay XXX
            // setTimeout(function(if request_count...) {}, 1000);
            $("body").css("cursor", "progress");
        },
        idle: function() {
            // invoked when we're idle / not waiting for data
            $("body").css("cursor", "auto");
        }
    };

    var queue = [];
    var controls = {};
    var busy = [];

    return {
        sid: null,

        handlers: handlers,

        run: function(root) {
            controls[0] = root;
            handlers.request("start", rctk.util.proxy(this.start, this));
        },
        start: function(sessionid, data) {
            sid = sessionid;
            if(jQuery.isArray(data) && 'crash' in data[0] && data[0].crash) {
              // pass true for debug, since we've never actually received
              // a configuration
              handlers.dump(data[0], true);
              return;
            }
            if('config' in data) {
                var config = data.config;
    
                if('polling' in config) {
                    if(config.polling) {
                        poll = true;
                        interval = config.polling;
                        polltimer = setInterval(rctk.util.proxy(this.get_tasks, this), interval);
                    }
                    else {
                        poll = false;
                    }
                }
                if('debug' in config) {
                    debug = config.debug;
                }
                if('title' in config) {
                      // fails on IE8, argh!
                      //$("title").html(config.title);
                      document.title = config.title || '';
                }
            }
            this.get_tasks();
        },
        get_tasks: function() {
            request_count++;
            handlers.busy();
            handlers.request("pop", 
                             rctk.util.proxy(this.handle_tasks, this), sid);
        },
        push: function(task) {
            queue.push(task);
        },
        flush: function() {
            if(queue.length > 0) {
                handlers.busy();
                handlers.request("task", 
                                 rctk.util.proxy(this.handle_tasks, this), 
                                 sid, "queue="+JSON.stringify(queue));
                queue = [];
            }
        },
        handle_tasks: function(sessionid, data) {
            request_count--;
            if(request_count == 0) {
                handlers.idle();
            }
            if(data) {
                for(var i=0; i < data.length; i++) {
                    this.handle_task(data[i]);
                }
            }
            // everything that was marked busy is no longer busy anymore
            for(var i in busy) {
                var c = busy[i];
                rctk.util.log("Control no longer busy", c);
                c.busy = false;
            }

            busy = [];
            this.flush(); 
        },
        handle_task: function(data) {
            var id = data.id;
            var control = controls[id];

            if(crashed) {
                return;
            }
            rctk.util.log("handle_task: ", data);

            switch(data.action) {
            case "append":
                var container = control;
                var child = controls[data.child];
                container.append(child, data);
                break;
            case "remove":
                var container = control;
                var child = controls[data.child];
                container.remove(child, data);
                break;
            case "create":
                var parent = controls[data.parentid];
                c = handlers.construct(data.control, parent, id);
                c.create(data);
                controls[id] = c;
                break;
            case "destroy":
                control.destroy();
                controls[id] = null;
                break;
            case "update":
                control.set_properties(data.update);
                break;
            case "call":
                var method = data.method;
                var args = data.args || [];
                control[method].apply(control, args);
                control.set_properties(data.update);
                break;
            case "handler":
                control.handle(data.type);
                // control["handle_"+data.type] = true;
                break;
            case "layout":
                var container = control;
                container.setLayout(data.type, data.config);
                break;
            case "relayout":
                var container = control;
                rctk.util.log("relayout", container);
                container.relayout(data.config);
                break;
            case "timer":
                rctk.util.log("Handling timer " + id + ", " + data.milliseconds);
                var self=this;
                setTimeout(
                  function() { 
                      self.push({method:"event", type:"timer", id:id, data:{}});
                      self.flush();
                   }, data.milliseconds);
                break;
            
            }
        },
        get_control: function(id) {
            // used by, e.g., layout managers to lookup children
            return controls[id];
        },
        register_busy: function(control) {
            control.busy = true;
            busy.push(control);
        }
    };
 }
})(jQuery);
