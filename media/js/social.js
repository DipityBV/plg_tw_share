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

    document.addEventListener('mousedown', function(event) {
        this.selection.top = event.pageY;
        this.selection.left = event.pageX;
    }.bind(this));

    document.addEventListener('mouseup', function(event) {
        if(this.getSelection()) {
            this.showPopup(event);
        } else if(this.popup) {
            this.popup.parentNode.removeChild(this.popup);
            this.popup = undefined;
        }
    }.bind(this));

    var regex = /{share}(.*?){\/share}/gm;
    var matches = document.body.innerHTML.match(regex);

    for(var index in matches) {
        if(matches.hasOwnProperty(index)) {
            var match = matches[index];
            var string = '<span class="' + config.staticClass + '">' + match.replace('{share}', '').replace('{/share}', '') + '</span>';

            document.body.innerHTML = document.body.innerHTML.replace(match, string);
        }
    }

    var elements = document.getElementsByClassName(config.staticClass);
    for(var index in elements) {
        if(elements.hasOwnProperty(index)) {
            console.log(elements[index]);
            elements[index].addEventListener('hover', this.showPopup.bind(this, config.position));
        }
    }
}

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
    window.open(adapter.url + url, '', 'width=715,height=450');
};

SocialSharing.prototype.showPopup = function(event) {
    // Add all the share buttons.
    if(!this.popup) {
        var fragment = document.createDocumentFragment();
        var position = this.getCoordinates(event, this.config.position);
        var popup = document.createElement('div');

        popup.classList.add(this.config.popupClasses);
        if(position.extraClass) {
            popup.classList.add(this.config.popupClasses + '--' + position.extraClass);
        }

        popup.style.top = position.top + 'px';
        popup.style.left = position.left + 'px';
        popup = fragment.appendChild(popup);

        this.adapters.forEach(function (item, key) {
            var button = document.createElement(this.config.buttonElement);
            button.classList.add(this.config.shareClass);
            button.classList.add(item.logo);
            button.addEventListener('mousedown', this.shareText.bind(this, item));

            popup.appendChild(button);
        }.bind(this));

        this.popup = popup;
        document.body.appendChild(fragment);
    }
};

SocialSharing.prototype.getCoordinates = function(event, position) {
    switch(position) {
        case 'top':

            return {
                top: (this.selection.top - 60),
                left: ((this.selection.left + event.pageX) / 2),
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