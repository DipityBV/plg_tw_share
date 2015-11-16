<?php

class PlgSystemTw_share extends JPlugin
{
    public function onBeforeRender() {
        $app = JFactory::getApplication();
        $document = $app->getDocument();

        if($app->isSite()) {
            JHtml::_('jquery.framework');

            $document->addStylesheet($this->_getStyles());
            $document->addScript(JUri::base() . 'media/plg_tw_share/js/tw_share.js');
            $document->addScriptDeclaration($this->_getScript());
        }
    }

    public function onAfterRender()
    {
        $app = JFactory::getApplication();

        if($app->isSite()) {
            $this->_addHighlight($app);
        }
    }

    protected function _addHighlight(&$app)
    {
        $app->setBody(preg_replace('/{share}(.*?){\/share}/', '<span class="tw-share-mark">$1</span>', $app->getBody()));
    }

    protected function  _getStyles()
    {
        $app = JFactory::getApplication();

        $stylesheet = JUri::base() . 'media/plg_tw_share/css/tw_share.css';

        // Check for a stylesheet override in the active template
        if( JFile::exists( JPATH_THEMES . '/' . $app->getTemplate() . '/css/tw_share.css' )) {
            $stylesheet = JUri::base() . 'templates/' . $app->getTemplate() . '/css/tw_share.css';
        }

        return $stylesheet;
    }

    protected function _getScript()
    {
        $highlight_adapters = $this->_getScriptAdapters('highlight');
        $selection_adapters = $this->_getScriptAdapters('selection');

        // Here we wil concat the needed strings.
        $script = 'jQuery(function($) {';

        if(count($highlight_adapters) > 0) {
            $script .= '$(\'.tw-share-mark\').highlight({
                baseClass: \'tw-share\',
                adapters: [' . implode(',', $highlight_adapters) . ']
            });';
        }

        if(count($selection_adapters) > 0) {
            $script .= '$(\'' . $this->params->get('selectors') . '\').select({
                baseClass: \'tw-share\',
                position: \'' . $this->params->get('select_location') . '\',
                adapters: [' . implode(',', $selection_adapters) . ']
            })';
        }

        return $script . '})';
    }

    private function _getScriptAdapters($namespace) {
        $media = array();

        if($this->params->get($namespace . '_enable_twitter')) {
            $media[] = '{
                logo: \'twitter\',
                url: \'http://twitter.com/share\',
                buildUrl: function(text) {
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
                }
            }';
        }

        if($this->params->get($namespace . '_enable_google_plus')) {
            $media[] = '{
                logo: \'google-plus\',
                url: \'https://plus.google.com/share\',
                buildUrl: function(text) {
                    return {
                        url: window.location.toString(),
                        description: text
                    };
                }
            }';
        }

        if($this->params->get($namespace . '_enable_linkedin')) {

            $config = JFactory::getConfig();

            $title = $config->get( 'sitename' );

            $media[] = '{
                logo: \'linkedin\',
                url: \'https://www.linkedin.com/shareArticle\',
                buildUrl: function(text) {
                    return {
                        mini: true,
                        url: window.location.toString(),
                        title: "' . $title . '",
                        summary: text,
                        source: "' . $title . '"
                    };
                }
            }';
        }

        if($this->params->get($namespace . '_enable_facebook')) {
            $media[] = '{
                logo: \'facebook\',
                url: \'https://www.facebook.com/sharer/sharer.php\',
                buildUrl: function(text) {
                    return {
                        u: window.location.toString(),
                        text: text
                    };
                }
            }';
        }

        if($this->params->get($namespace . '_enable_pinterest')) {
            $media[] = '{
                logo: \'pinterest\',
                url: \'https://www.pinterest.com/pin/create/button/\',
                buildUrl: function(text) {
                    return {
                        url: window.location.toString(),
                        description: text
                    };
                }
            }';
        }

        return $media;
    }
}