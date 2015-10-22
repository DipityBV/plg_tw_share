<?php

class PlgContentSocial extends JPlugin
{
    private static $_loaded = false;

    public function onContentBeforeDisplay($context, &$row, &$params, $page = 0)
    {
        // Here we need to add the stuff to our html.
        $app = JFactory::getApplication();
        $document = $app->getDocument();

        if($app->isSite() && !self::$_loaded) {
            $document->addStyleSheet(JUri::base() . '/media/plg_social/css/styling.css');

            $document->addScript(JUri::base() . '/media/plg_social/js/social.js');
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
                position: \'' . $this->params->get('highlight_location') . '\'
            });';

        if($this->params->get('enable_twitter')) {
            $script .= '
                social.addAdapter(\'tw-share__link--twitter\', \'\', function(text) {
                    return text;
                });
            ';
        }

        return $script .= '});';
    }
}