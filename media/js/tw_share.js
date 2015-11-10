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
            var popup = document.createElement('div');
            popup.classList.add(defaults.baseClass);

            defaults.adapters.forEach(function (item, key) {
                var button = document.createElement('a');
                button.classList.add(defaults.baseClass + '__link');
                button.classList.add(defaults.baseClass + '__link--' + item.logo);
                button.addEventListener('mousedown', this.prototype.shareText.bind(this, item));

                popup.appendChild(button);
            }.bind(this));

            return $(popup).html();
        }
    });

    $.extend(Social.prototype, {
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
        },
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

    });

    $.fn.select = function(config) {
        this.each(function() {

        });

        $.extend(defaults, config);
    };

    $.fn.highlight = function(config) {
        $.extend(defaults, config);

        this.each(function() {
            $(this).off('mouseup, mousedown');
            $(this).append(Social.getPopup());
        });
    };
})(window.jQuery, window);

function SocialSharing(config) {
    this.adapters = [];
    this.config = config || {};
    this.selection = {};
    this.popup = undefined;

    if(config.adapters && typeof config.adapters.push === 'function') {
        for(var index in config.adapters) {
            if(config.adapters.hasOwnProperty(index)) {
                var adapter = config.adapters[index];

                this.addAdapter(adapter.logo, adapter.url, adapter.buildUrl);
            }
        }
    }
}

SocialSharing.prototype.getCoordinates = function(event, position) {
    switch(position) {
        case 'top':
            if(event.target && event.target.tagName === 'SPAN') {
                this.selection.left = ((event.target.offsetLeft + event.target.offsetLeft + event.target.offsetWidth) / 2);
                this.selection.top = event.target.offsetTop;
            } else {
                this.selection.left = (this.selection.left + event.pageX) / 2;
            }

            return {
                top: (this.selection.top - 60),
                left: this.selection.left,
                extraClass: 'bottom'
            };
            break;
        case 'bottom':
            // Do calc
            break;
        case 'left':
            // Do calc
            break;
        case 'right':
            // Do calc
            break;
        default:
            return {left: event.pageX, top: event.pageY};
    }
};