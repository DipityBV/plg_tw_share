<?php

class PlgContentTw_share extends JPlugin
{
    private static $_loaded = false;

    public function onContentBeforeDisplay($context, &$row, &$params, $page = 0)
    {
        // Here we need to add the stuff to our html.
        $app = JFactory::getApplication();
        $document = $app->getDocument();

        if($app->isSite() && !self::$_loaded) {
            $this->_addHighlight($row);

            // Load jQuery
            JHtml::_('jquery.framework');

            $document->addStylesheet($this->_getStyles());
            $document->addScript(JUri::base() . '/media/plg_tw_share/js/tw_share.js');
            $document->addScriptDeclaration($this->_getScript());

            self::$_loaded = true;
        }
    }

    protected function _addHighlight(&$row)
    {
        $row->text = preg_replace('/{share}(.*?){\/share}/', '<span class="tw-share-mark">$1</span>', $row->text);
        $row->introtext = preg_replace('/{share}(.*?){\/share}/', '<span class="tw-share-mark">$1</span>', $row->introtext);
        $row->fulltext = preg_replace('/{share}(.*?){\/share}/', '<span class="tw-share-mark">$1</span>', $row->fulltext);
    }

    protected function  _getStyles()
    {
        $app = JFactory::getApplication();

        $stylesheet = JUri::base() . '/media/plg_tw_share/css/tw_share.css';

        // Check for a stylesheet override in the active template
        if( JFile::exists( JPATH_THEMES . '/' . $app->getTemplate() . '/css/tw_share.css' )) {
            $stylesheet = JUri::base() . 'templates/' . $app->getTemplate() . '/css/tw_share.css';
        }

        return $stylesheet;
    }

    protected function _getScript()
    {
        // Here we wil concat the needed strings.
        return 'jQuery(function($) {
            $(\'.tw-share-mark\').highlight({
                baseClass: \'tw-share\',
                position: \'' . $this->params->get('select_location') . '\',
                adapters: [' . implode(',', $this->_getScriptAdapters('selection')) . ']
            });

            $(\'' . $this->params->get('selectors') . '\').select({
                baseClass: \'tw-share\',
                adapters: [' . implode(',', $this->_getScriptAdapters('highlight')) . ']
            });
        });';
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

        return $media;
    }
}