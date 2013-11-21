//This will place a default text inside of any element that uses the value tag.
//author: Micah Montoya Nov 2011

(function ($) {
    var defaults = {
        'color': '#707070', //this is the text color inside of the input field
        'defTxtAttr': 'data-default-text' //this is attribute of the element that is looks for
    };

    var ifhCheckFnc = function($this, nSetVal, nDefTxt, nColor) {
        if (nSetVal != nDefTxt && nSetVal != '') { return; }
        if (nSetVal === nDefTxt) { $this.val('').css('color', '#000'); return; }
        $this.val(nDefTxt).css('color', nColor);
    };

    var methods = {
        //run through all element types defined and set
        init: function (methodOrOptions) {
            fieldOptions = methodOrOptions;
            return this.each(function () {
                var $this = $(this), nOptions = $.extend(defaults, fieldOptions), nDefTxt = $this.attr(nOptions.defTxtAttr), nSetVal = $.trim($this.val());
                $this.bind('focusin', methods.check).bind('focusout', methods.check);
                ifhCheckFnc($this, nSetVal, nDefTxt, nOptions.color);
            });
        },
        //check the element type to see what color to apply
        check: function () {
            var $this = $(this), nOptions = $.extend(defaults, fieldOptions), nDefTxt = $this.attr(nOptions.defTxtAttr), nSetVal = $.trim($this.val());
            ifhCheckFnc($this, nSetVal, nDefTxt, nOptions.color);
        },
        //remove all binding from element type and set color to browser def
        destroy: function () {
            return this.each(function () {
                var $this = $(this);
                $this.css('color', 'inherit');
                $(window).unbind(this);
            });
        }
    };

    $.fn.InlineFieldHelp = function (methodOrOptions) {
        if (methods[methodOrOptions]) {
            return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            return methods.init.apply(this, arguments);
        } else { return alert('Method ' + methodOrOptions + ' does not exist in jQuery.InlineFieldHelp'); }
    };
})(jQuery);