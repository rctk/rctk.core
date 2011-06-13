var rctk = rctk || {};

rctk.util = (function($) {
    return {
        "log": function() {
            if (typeof window.console != 'undefined') {
                if($.browser.msie) {
                    window.console.log(arguments);
                }
                else {
                    window.console.log.apply(window.console, arguments);
                }
            }
        },
        "debug": function() {
            if (typeof window.console != 'undefined') {
                if($.browser.msie) {
                    window.console.log(arguments);
                }
                else {
                    window.console.debug.apply(window.console, arguments);
               }
            }
        },
        proxy: function(a, b) { return $.proxy(a, b); }
    }
})(jQuery);
