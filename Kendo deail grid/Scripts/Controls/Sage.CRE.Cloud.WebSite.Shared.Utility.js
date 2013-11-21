var Utility = {

    ExpandSection: function (link) {
        link.find('span').removeClass('ui-icon-triangle-1-e').addClass('ui-icon-triangle-1-s');
        link.parent().siblings(link.attr("data-container")).fadeIn(200);
    },

    CloseExpandSiblings: function (link) {
        var linkParent = link.parent();
        var expandedLink;
        var expandedSpans = $(linkParent).find(".ui-icon-triangle-1-s");
        if (expandedSpans.length > 0) { expandedLink = $(expandedSpans[0]).parent(); }

        if (expandedLink == null) {
            Utility.ExpandSection(link);
        }
        else if (link.attr("class") == expandedLink.attr("class")) {
            link.find('span').removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-e');
            linkParent.siblings(link.attr("data-container")).fadeOut(200);
        }
        else {
            Utility.HideSection(expandedLink, link);
        }
    }
    ,
    HideSection: function (hideLink, showLink) {
        hideLink.find('span').removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-e');
        hideLink.parent().siblings(hideLink.attr("data-container")).fadeOut(200,
        function () {
            Utility.ExpandSection(showLink, showLink.attr("data-container"));
        });
    },
    EnableDisableButton: function (buttonId, enable) {
        $(buttonId).attr('disabled', enable);
    },

    ButtonDialogState: function (dialogId, buttonId, isEnabled) {
        $(dialogId + " ~ .ui-dialog-buttonpane .ui-dialog-buttonset").children(buttonId).button((isEnabled == true) ? "enable" : "disable");
    }
};