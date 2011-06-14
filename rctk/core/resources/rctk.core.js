// http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth

var rctk = rctk || {};

rctk.core = (function($) {
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
        handle: function(task) { 
            not_defined("Handle function not set -> " + task); 
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
    var widgets = {
        var registry = {};
        map: function(strclass) {
        }
    }

    return {
        sid: null,

        handlers: handlers,

        run: function() {
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
                        polltimer = setInterval(rctk.util.proxy(this.get_tasks, this), interval)
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
            handlers.request("pop", rctk.util.proxy(this.handle_tasks, this), sid);
        },
        push: function(task) {
            queue.push(task);
        },
        flush: function() {
            if(queue.length > 0) {
                handlers.busy();
                handlers.request("task", rctk.util.proxy(this.handle_tasks, this), sid, "queue="+JSON.stringify(queue));
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
                    handlers.handle(data[i]);
                }
            }
            
            this.flush(); 
        },
        handle_task: function(data) {
            var control_class = widgets.map(data.control);
            var parent = controls[data.parentid];
            var id = data.id;

            if(crashed) {
                return;
            }

        }

    };

})(jQuery);
