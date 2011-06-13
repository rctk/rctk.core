// http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth

var rctk = rctk || {};

rctk.core = (function($) {
    var request = function(path, callback, sessionid, data) { alert("Request function not set -> " + path); };
    var handle = function(task) { alert("Handle function not set -> " + task); };
    var queue = [];

    return {
        sid: null,

        setRequest: function(r) { request = r; },
        setHandle: function(r) { handle = r; },

        run: function() {
            request("start", rctk.util.proxy(this.start, this));
        },
        start: function(sessionid, data) {
            sid = sessionid;
            if('title' in data) {
                document.title = data.title;
            }
            request("pop", rctk.util.proxy(this.handle_tasks, this), sid);
        },
        push: function(task) {
            queue.push(task);
        },
        flush: function() {
            if(queue.length > 0) {
                // show_throbber()
                request("task", rctk.util.proxy(this.handle_tasks, this), sid, "queue="+JSON.stringify(queue));
                queue = [];
            }
        },
        handle_tasks: function(sessionid, data) {
            if(data) {
                for(var i=0; i < data.length; i++) {
                    handle(data[i]);
                }
            }
            this.flush(); 
        }

    };

})(jQuery);
