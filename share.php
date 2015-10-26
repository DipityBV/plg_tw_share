<?php

class PlgContentShare extends JPlugin
{
    private static $_loaded = false;

    public function onContentBeforeDisplay($context, &$row, &$params, $page = 0)
    {
        // Here we need to add the stuff to our html.
        $app = JFactory::getApplication();
        $document = $app->getDocument();

        if($app->isSite() && !self::$_loaded) {
            $document->addStyleSheet(JUri::base() . '/media/plg_share/css/styling.css');

            $document->addScript(JUri::base() . '/media/plg_share/js/social.js');
            $document->addScriptDeclaration($this->_getScript());

            self::$_loaded = true;
        }
    }

    protected function _getScript()
    {
        // Here we wil concat the needed strings.
        $script = 'window.addEventListener(\'load\', function(event) {
            var social = new SocialSharing({
                buttonElement: \'' . $this->params->get('button_element') . '\',
                shareClass: \'' . $this->params->get('share_class') . '\',
                popupClasses: \'' . $this->params->get('popup_class') . '\',
                staticClass: \'' . $this->params->get('hover_class') . '\',
                position: \'' . $this->params->get('select_location') . '\',
                highlightPosition: \'' . $this->params->get('highlight_location') . '\',
                highlightColor: \'' . $this->params->get('highlight_color') . '\'
            });';

        if($this->params->get('enable_twitter')) {
            $script .= '
                social.addAdapter(\'tw-share__link--twitter\', \'http://twitter.com/share\', function(text) {
                    if(text.length > 140) {
                        text = text.substring(0, 140 - ((\'...\'.length) + (window.location.toString().length + 1)));
                    }

                    if(\'' . $this->params->get('twitter_username') . '\') {
                        text = text.substring(0, text.length - (\' via @' . $this->params->get('twitter_username') . '\'.length));
                    }

                    var tweet = {
                        url: window.location.toString(),
                        text: text + \'...\'
                    };

                    if(\'' . $this->params->get('twitter_username') . '\') {
                        tweet.via = \'' . $this->params->get('twitter_username') . '\';
                    }

                    return tweet;
                });
            ';
        }

        if($this->params->get('enable_facebook')) {
            $script .= '
                social.addAdapter(\'tw-share__link--facebook\', \'https://www.facebook.com/sharer/sharer.php\', function(text) {
                    return {
                        u: window.location.toString(),
                        text: text
                    };
                });
            ';
        }

        if($this->params->get('enable_pinterest')) {
            $script .= '
                social.addAdapter(\'tw-share__link--pinterest\', \'https://www.pinterest.com/pin/create/button/\', function(text) {
                    return {
                        url: window.location.toString(),
                        description: text
                    };
                });
            ';
        }

        if($this->params->get('enable_google_plus')) {
            $script .= '
                social.addAdapter(\'tw-share__link--google-plus\', \'https://plus.google.com/share\', function(text) {
                    return {
                        url: window.location.toString(),
                        description: text
                    };
                });
            ';
        }

        return $script .= '});';
    }
}