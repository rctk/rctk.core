// http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth

var rctk = rctk || {};

rctk.core = (function($) {
    var not_defined = function(msg) { alert(msg); };

    var handlers = {
        request: function(path, callback, sessionid, data) { 
            not_defined("Request function not set -> " + path); 
        },
        handle: function(task) { 
            not_defined("Handle function not set -> " + task); 
        }
    };

    var queue = [];

    return {
        sid: null,

        handlers: handlers,

        run: function() {
            handlers.request("start", rctk.util.proxy(this.start, this));
        },
        start: function(sessionid, data) {
            sid = sessionid;
            if('title' in data) {
                document.title = data.title;
            }
            handlers.request("pop", rctk.util.proxy(this.handle_tasks, this), sid);
        },
        push: function(task) {
            queue.push(task);
        },
        flush: function() {
            if(queue.length > 0) {
                // show_throbber()
                handlers.request("task", rctk.util.proxy(this.handle_tasks, this), sid, "queue="+JSON.stringify(queue));
                queue = [];
            }
        },
        handle_tasks: function(sessionid, data) {
            if(data) {
                for(var i=0; i < data.length; i++) {
                    handlers.handle(data[i]);
                }
            }
            this.flush(); 
        }

    };

})(jQuery);
