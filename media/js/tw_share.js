; (function($, window) {
    var defaults = {
        baseClass: '',
        position: '',
        enabled: ['highlight', 'select'],
        highlightColor: '',
        adapters: []
    };

    function Social() {
        this.adapters = [];
        this.selection = {};
    }

    $.extend(Social, {
        getPopup: function() {
            var popup = $(document.createElement('div'));
            popup.addClass(defaults.baseClass);

            defaults.adapters.forEach(function (item, key) {
                var button = $(document.createElement('a'));
                button.addClass(defaults.baseClass + '__link');
                button.addClass(defaults.baseClass + '__link--' + item.logo);
                button.on('mousedown', this.prototype.shareText.bind(this, item));

                popup.append(button);
            }.bind(this));

            return popup[0];
        },
        getSelection: function() {
            var text = '';

            if (window.getSelection) {
                text = window.getSelection().toString();
            } else if (document.getSelection) {
                text = document.getSelection().toString();
            } else if (document.selection && document.selection.type != "Control") {
                text = document.selection.createRange().text;
            }

            return text;
        }
    });

    $.extend(Social.prototype, {
        shareText: function(adapter) {
            var url = adapter.buildUrl.call(this, this.getSelection());

            if (typeof url === 'object') {
                var parts = [];

                for (var index in url) {
                    if (url.hasOwnProperty(index)) {
                        parts.push(index + '=' + url[index]);
                    }
                }

                url = parts.join('&');
            }

            window.open(adapter.url + '?' + url, '', 'width=715,height=450');
        },
        getLocation: function() {

        }
    });

    $.fn.select = function(config) {
        $.extend(defaults, config);

        var coordinates = {
            y: 0,
            x: 0
        };

        this.each(function() {
            console.log(this);

            $(this).on('mousedown', function(event) {
                // Remove all the popup elements from the document.
                $('.' + defaults.baseClass).each(function(key, item) {
                    if($(item).parent('.tw-share-mark').length === 0) {
                        $(item).remove();
                    }
                });

                // Get the coordinates
                coordinates.y = event.clientY;
                coordinates.x = event.clientX;
            });

            $(this).on('mouseup', function(event) {
                var selection = Social.getSelection(),
                    top = (event.clientY <= coordinates.y) ? coordinates.y : event.clientY,
                    center = (coordinates.x + event.clientX) / 2,
                    css = {
                        top: 0,
                        left: 0,
                        extra_class: ''
                    };

                if(selection) {
                    // get the position.
                    switch(defaults.position) {
                        case 'top':
                            css.top = top;
                            css.left = center;
                            css.extra_class = 'bottom';
                            break;
                        default:
                            css.top = event.clientY;
                            css.left = event.clientX;
                            break;
                    }

                    var popup = $(Social.getPopup());
                    if(css.extra_class) {
                        popup.addClass(defaults.baseClass + '--' + css.extra_class);
                    }
                    popup.css('top', css.top);
                    popup.css('left', css.left);

                    $(document.body).append(popup[0]);
                }
            });
        });
    };

    $.fn.highlight = function(config) {
        $.extend(defaults, config);

        this.each(function() {
            $(this).off('mouseup, mousedown');
            $(this).append(Social.getPopup());
        });
    };
})(window.jQuery, window);