function SocialSharing(config) {
    this.adapters = [];
    this.config = config || {};
    this.popup = undefined;
    this.selection = {};

    if(config.adapters && typeof config.adapters.push === 'function') {
        for(var index in config.adapters) {
            if(config.adapters.hasOwnProperty(index)) {
                var adapter = config.adapters[index];

                this.addAdapter(adapter.logo, adapter.url, adapter.buildUrl);
            }
        }
    }
}

SocialSharing.prototype.bindAll = function() {
    document.addEventListener('mousedown', function(event) {
        this.selection.top = event.pageY;
        this.selection.left = event.pageX;
    }.bind(this));

    document.addEventListener('mouseup', function(event) {
        if(this.getSelection()) {
            var popup = this.getPopup(event);
            document.body.appendChild(popup);
        } else if(this.popup && this.popup.parentNode) {
            this.popup.parentNode.removeChild(this.popup);
            this.popup = undefined;
        }
    }.bind(this));

    var elements = document.getElementsByClassName(this.config.baseClass + '-mark');
    for(var index in elements) {
        if(elements.hasOwnProperty(index)) {
            var popup = this.getPopup(this.config.highlightPosition, event, false);
            elements[index].appendChild(popup);
        }
    }
};

/**
 * This method adds an adapter, this adapter will receive a logo, a share url, can be used with %s and the likes,
 * and a serializer, this is an extra function which is used to serialize the data.
 *
 * Also the logo will be used as an identifier.
 *
 * @param {String} logo The logo class
 * @param {String} url The sharing url
 * @param {Function} buildUrl The function which adds extra checks on the text.
 * @returns {SocialSharing} The current object
 */
SocialSharing.prototype.addAdapter = function(logo, url, buildUrl) {
    this.adapters.push({
        logo: logo,
        url: url,
        buildUrl: buildUrl
    });

    return this;
};

SocialSharing.prototype.shareText = function(adapter) {
    // Here we will have everything.
    var url = adapter.buildUrl.call(this, this.getSelection());

    if(typeof url === 'object') {
        var parts = [];

        for(var index in url) {
            if(url.hasOwnProperty(index)) {
                parts.push(index + '=' + url[index]);
            }
        }

        url = parts.join('&');
    }

    window.open(adapter.url + '?' + url, '', 'width=715,height=450');
};

SocialSharing.prototype.getPopup = function(pos, event, writeGlobal) {
    if(pos instanceof Event) {
        event = pos;
        pos = this.config.position;
    }

    // Add all the share buttons.
    if(!this.popup) {
        var fragment = document.createDocumentFragment();
        var position = this.getCoordinates(event, pos);
        var popup = document.createElement('div');

        popup.classList.add(this.config.baseClass);
        if(position.extraClass) {
            popup.classList.add(this.config.baseClass + '--' + position.extraClass);
        }

        popup.style.top = position.top + 'px';
        popup.style.left = position.left + 'px';
        popup = fragment.appendChild(popup);

        this.adapters.forEach(function (item, key) {
            var button = document.createElement('a');
            button.classList.add(this.config.baseClass + '__link');
            button.classList.add(this.config.baseClass + '__link--' + item.logo);
            button.addEventListener('mousedown', this.shareText.bind(this, item));

            popup.appendChild(button);
        }.bind(this));

        if(writeGlobal !== false) {
            this.popup = popup;
        }
    }

    return this.popup ? this.popup : popup;
};

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

SocialSharing.prototype.getSelection = function() {
    var text = '';

    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }

    return text;
};