//Allows for object value-based equality comparison (it's useful, trust me).
function objectEqualityTest(x, y) {
    var p;
//    for (p in y) {
//        if (typeof (x[p]) == 'undefined') {
//            return false;
//        }
//    }

    if (!y)
        return false;
    for (p in y) {
        if (y[p]) {
            switch (typeof (y[p])) {
                case 'object':
                    if (!y[p].equals(x[p])) {
                        return false;
                    }
                    break;
                case 'function':
                    if (typeof (x[p]) == 'undefined' ||
                (p != 'equals' && y[p].toString() != x[p].toString()))
                        return false;
                    break;
                default:
                    if (y[p] != x[p]) {
                        return false;
                    }
            }
        } else {
            if (x[p])
                return false;
        }
    }

//    for (p in x) {
//        if (typeof (y[p]) == 'undefined') {
//            return false;
//        }
//    }

    return true;
}


//-----------------------------------------------------------
//----------------------GLOBALS------------------------------
//-----------------------------------------------------------
var global = {
    dialogWidth: 700,
    dialogWidthSmall: 450,
    dialogWidthLarge: 850,
    dialogPosition: ['center', 40],
    loaderImageText: function () { return fncGetLoader('centerObj-hasText', true); },
    loaderImageNoText: function () { return fncGetLoader('centerObj-noText', false); },
    // This method can be used to detect the user's browser.
    // It returns an object with three properties
    // Browser name: BrowserDetect.browser
    // Browser version: BrowserDetect.version
    // OS name: BrowserDetect.OS
    GetBrowser: function () {
        var BrowserDetect = {
            init: function () {
                this.browser = this.searchString(this.dataBrowser) || "an unknown browser";
                this.version = this.searchVersion(navigator.userAgent)
            || this.searchVersion(navigator.appVersion)
            || "an unknown version";
                this.OS = this.searchString(this.dataOS) || "an unknown OS";
            },
            searchString: function (data) {
                for (var i = 0; i < data.length; i++) {
                    var dataString = data[i].string;
                    var dataProp = data[i].prop;
                    this.versionSearchString = data[i].versionSearch || data[i].identity;
                    if (dataString) {
                        if (dataString.indexOf(data[i].subString) != -1)
                            return data[i].identity;
                    }
                    else if (dataProp)
                        return data[i].identity;
                }
            },
            searchVersion: function (dataString) {
                var index = dataString.indexOf(this.versionSearchString);
                if (index == -1) return;
                return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
            },
            dataBrowser: [
                {
                    string: navigator.userAgent,
                    subString: "Chrome",
                    identity: "Chrome"
                },
                { string: navigator.userAgent,
                    subString: "OmniWeb",
                    versionSearch: "OmniWeb/",
                    identity: "OmniWeb"
                },
                {
                    string: navigator.vendor,
                    subString: "Apple",
                    identity: "Safari",
                    versionSearch: "Version"
                },
                {
                    prop: window.opera,
                    identity: "Opera",
                    versionSearch: "Version"
                },
                {
                    string: navigator.vendor,
                    subString: "iCab",
                    identity: "iCab"
                },
                {
                    string: navigator.vendor,
                    subString: "KDE",
                    identity: "Konqueror"
                },
                {
                    string: navigator.userAgent,
                    subString: "Firefox",
                    identity: "Firefox"
                },
                {
                    string: navigator.vendor,
                    subString: "Camino",
                    identity: "Camino"
                },
                {   // for newer Netscapes (6+)
                    string: navigator.userAgent,
                    subString: "Netscape",
                    identity: "Netscape"
                },
                {
                    string: navigator.userAgent,
                    subString: "MSIE",
                    identity: "Explorer",
                    versionSearch: "MSIE"
                },
                {
                    string: navigator.userAgent,
                    subString: "Gecko",
                    identity: "Mozilla",
                    versionSearch: "rv"
                },
                {   // for older Netscapes (4-)
                    string: navigator.userAgent,
                    subString: "Mozilla",
                    identity: "Netscape",
                    versionSearch: "Mozilla"
                }
            ],
            dataOS: [
                {
                    string: navigator.platform,
                    subString: "Win",
                    identity: "Windows"
                },
                {
                    string: navigator.platform,
                    subString: "Mac",
                    identity: "Mac"
                },
                {
                    string: navigator.userAgent,
                    subString: "iPhone",
                    identity: "iPhone/iPod"
                },
                {
                    string: navigator.platform,
                    subString: "Linux",
                    identity: "Linux"
                },
                {
                    string: navigator.platform,
                    subString: "iPad",
                    identity: "iPad"
                }
            ]
        };
        BrowserDetect.init();
        return BrowserDetect;
    },
    ApplyTimeZone: function (dateStringUtc) {
        var utcTime = new Date(dateStringUtc);
        var tzOffset = new Date().getTimezoneOffset() * 60000;
        var actualDate = new Date(utcTime.getTime() - tzOffset);
        var a_p = "";
        var curr_hour = actualDate.getHours();

        if (curr_hour < 12) {
            a_p = "AM";
        }
        else {
            a_p = "PM";
        }
        if (curr_hour == 0) {
            curr_hour = 12;
        }
        if (curr_hour > 12) {
            curr_hour = curr_hour - 12;
        }
        var curr_min = actualDate.getMinutes();

        var curr_date = actualDate.getDate();
        var curr_month = actualDate.getMonth();
        curr_month++;
        var curr_year = actualDate.getFullYear();
        return (curr_month + "/" + curr_date + "/" + curr_year + " " + curr_hour + ":" + ((curr_min.toString().length == 1) ? ("0" + curr_min) : curr_min) + " " + a_p);
    },

    GetClientDateString: function (dateStringUtc) {
        var utcTime = new Date(dateStringUtc);
        var currDay = utcTime.getDate();
        var currMonth = utcTime.getMonth();
        currMonth++;
        var currYear = utcTime.getFullYear();
        return (currMonth + "/" + currDay + "/" + currYear);
    },
    GetBaseUrl: function () {
        var href = window.location.href;
        if (href.indexOf("?") > 0) {
            href = href.substring(0, href.indexOf("?"));
        }
        if (href.indexOf("#") > 0) {
            href = href.substring(0, href.indexOf("#"));
        }

        var isSecure = (href.indexOf("https:") >= 0);
        if (!isSecure) {
            href = href.replace('http://', '');
        } else {
            href = href.replace("https://", "");
        }
        href = href.replace("//", "/");
        var hrefElements = href.split('/');

        var url = (isSecure ? "https://" : "http://") + hrefElements[0] + "/" + hrefElements[1] + "/";

        if (href.toLowerCase().indexOf('/project/') > 0) {
            if (hrefElements.length >= 4)
                url = url + hrefElements[2] + "/" + hrefElements[3] + "/";
        }
        return url;
    },

    HandleAjaxError: function (error) {
        if (error.isAuthenticationError) {
            fncError(errorMessages.session, true);  //redirects to login screen after notifying user their session has expired
        } else {
            if (!pageUnloading) {
                alert(error.errorDescription);
            }
        }
    },

    emptyString: '',
    userAgent: ($.browser.msie) ? 'ie' : ($.browser.webkit) ? 'webkit' : ($.browser.mozilla) ? 'mozilla' : 'other',
    userAgentVersion: $.browser.version,
    counter: 0, //global counter, always remember to reset to 0 after usage
    today: new Date(),
    logoutUrl: '/',
    AddAntiForgeryToken: function (data) { return fnAddAntiForgeryToken(data); },
    GetAntiForgeryToken: function () { return fnGetAntiForgeryToken(); },
    SetAntiForgeryToken: function (form) { return fnSetAntiForgeryToken(form); },
    //This property will provide the information whether a page unload is in progress.
    //This is required mostly in the ajax call Error event handler which shows
    //error messages on failure. We do not want to show message if a page unload happens
    //in the middle of an ajax request.
    IsPageUnloading: function () { return pageUnloading; },
    HtmlEscape: function (str) {
        if (str && str != '') {
            return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
        }
        else
            return '';
    }

};

//-----------------------------------------------------------
//-----------------PAGE LOAD---------------------------------
//-----------------------------------------------------------
$(function () {
    ajaxContentManager.init();
    $('input:text[data-default-text],input:password[data-default-text],textarea[data-default-text]').InlineFieldHelp();

    //hover states on the static widgets
    $('.btnA').hover(
        function () { $(this).addClass('ui-state-hover'); },
        function () { $(this).removeClass('ui-state-hover'); }
    );

    //hover states on the dynamic contents
    $('.btnA').live("mouseover", function (e) { $(this).addClass('ui-state-hover'); });
    $('.btnA').live("mouseout", function (e) { $(this).removeClass('ui-state-hover'); });

    fncRunAfterLoad();

    //fncSetEqualHeight($("#contentContainer  > div")); //this has error in that it prevents column from dynamically growing
    /*this is the default of how buttons are rendered in jquery ui dialog
    <div class="ui-dialog-buttonset">
    <button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false"><span class="ui-button-text">Cancel</span></button>
    <button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false"><span class="ui-button-text">Save</span></button>
    </div>*/
    /*Overiding the default number validation to take .2 for 0.2*/
    $.validator.methods.number = function (value, element) { return this.optional(element) || /^-?([0-9]*|\d*\.\d{1}?\d*)$/.test(value); };


    $.fn.extend({
        dialogDefaults: {
            open: function () { fncRunAfterLoad(); }
        }
    });

    /*Select Menu*/
    $('.selectmenu').selectmenu();
    $('.multiselectmenu').multiselect();
    $('.datePicker').live('blur', function () {
        try {
            $.datepicker.parseDate($('.datePicker').datepicker('option', 'dateFormat'), this.value);
        } catch (error) {
            this.value = '';
        }
    });

    /*This is to float the buttons to the right*/
    $(".ui-dialog").live("dialogopen", function (event, ui) {
        fncRunAfterLoad();
    });

    fnSetTimeOffsetCookie();

    /* For supporting separate set of help pages for normal users and Sage admins */
    /* converting to mousedown event to handle "open in new tab" scenario */
    $('.helpMenuElement a, a.helpMenuElement').live("mousedown", function (event) {
        if (event.which == 1 || event.which == 3) {
            var helpBaseUrl = $("#hdnTopicHelpBaseUrl").val();
            var origHref = $(this).attr('href');
            $(this).attr('href', origHref.replace(/^Help/, helpBaseUrl.replace("Topic", "")));
            if (event.which == 1) {
                this.click();
            }
        } 
    });

    $(".tile-menu").live("click", function() {
        $(".tile-menu").not(this).removeClass("selected");
        $(this).toggleClass("selected");
    });

    String.prototype.endsWith = function (value) {
        return this.indexOf(value, this.length - value.length) !== -1;
    };

    //if ($.cookie("AllowDrag", { path: '/' })) {
    $(".column").sortable({
        connectWith: ".column",
        cursor: "move",
        handle: ".widget-header",
        opacity: 0.7,
        tolerance: 'pointer',
        placeholder: 'ui-sortable-placeholder',
        stop: function (event, ui) {
            if ($.browser.msie) {
                ui.item.css("filter", '');
            }
        }
    });
    //}
    $(".portlet").addClass("ui-widget ui-widget-content ui-helper-clearfix ui-corner-all").end();
    $(".widget-header .ui-icon").live('click', function () {
        $(this).toggleClass("ui-icon-minusthick").toggleClass("ui-icon-plusthick");
        //$(this).parents(".portlet:first").find(".sageWidget").toggle();
    });
});

//-----------------------------------------------------------
//-------------------------TEXT------------------------------
//-----------------------------------------------------------
//use whereever text is needed in another script file - add as necessary
var labelText = {
    ok: 'Ok',
    cancel: 'Cancel',
    submit: 'Submit',
    save: 'Save',
    close: 'Close'
};
$(function () {

    //re-set all client validation given a jQuery selected form or child
    $.fn.resetValidation = function () {

        var $form = this.closest('form');

        //reset jQuery Validate's internals
        $form.validate().resetForm();

        //reset unobtrusive validation summary, if it exists
        $form.find("[data-valmsg-summary=true]")
            .removeClass("validation-summary-errors")
            .addClass("validation-summary-valid")
            .find("ul").empty();

        //reset unobtrusive field level, if it exists
        $form.find("[data-valmsg-replace]")
            .removeClass("field-validation-error")
            .addClass("field-validation-valid")
            .empty();

        return $form;
    };

    //reset a form given a jQuery selected form or a child
    //by default validation is also reset
    $.fn.formReset = function(resetValidation) {
        var $form = this.closest('form');

        $form[0].reset();

        if (resetValidation == undefined || resetValidation) {
            $form.resetValidation();
        }

        return $form;
    };
});

//put anything here that should execute after an ajax call
function fncRunAfterLoad() {
    /*$('.gridContainer').zebraStripe({ className: 'alternating', altElem: '.group', isOdd: true });
    $('.gridContainer').zebraStripe({ className: 'alternating', altElem: '.parameters', isOdd: true });*/

    $.each($('.ui-dialog-buttonset button'), function () {
        var objToSearch = $(this).find('span');
        if ($(objToSearch).text().toLowerCase() == 'save') { $(this).addClass('float-r'); }
        if ($(objToSearch).text().toLowerCase() == 'create') { $(this).addClass('float-r'); }
        if ($(objToSearch).text().toLowerCase() == 'submit') { $(this).addClass('float-r'); }
        if ($(objToSearch).text().toLowerCase() == 'finish') { $(this).addClass('float-r'); }
        if ($(objToSearch).text().toLowerCase() == 'confirm') { $(this).addClass('float-r'); }
        if ($(objToSearch).text().toLowerCase() == 'change email') { $(this).addClass('float-r'); }
        if ($(objToSearch).text().toLowerCase() == 'request report') { $(this).addClass('float-r'); }
        if ($(objToSearch).text().toLowerCase() == 'ok') { $(this).addClass('float-r'); }
        if ($(objToSearch).text().toLowerCase() == 'invite') { $(this).addClass('float-r'); }
        if ($(objToSearch).text().toLowerCase() == 'activate') { $(this).addClass('float-r'); }
        if ($(objToSearch).text().toLowerCase() == 'yes') { $(this).addClass('float-r'); }
        if ($(objToSearch).text().toLowerCase() == 'upload') { $(this).addClass('float-r'); }
        if ($(objToSearch).text().toLowerCase() == 'copy') { $(this).addClass('float-r'); }
        if ($(objToSearch).text().toLowerCase() == 'move') { $(this).addClass('float-r'); }
        if ($(objToSearch).text().toLowerCase() == 'approve') { $(this).addClass('float-r'); }
        if ($(objToSearch).text().toLowerCase() == 'assign') { $(this).addClass('float-r'); }
    });
}

function fnAddAntiForgeryToken(data) {
    data.__RequestVerificationToken = fnGetAntiForgeryToken();
    return data;
}

function fnGetAntiForgeryToken() {
    return $("#antiforgerytoken_holder input[type='hidden'][name='__RequestVerificationToken']").val();
}

function fnSetAntiForgeryToken(form) {
    /* Injecting the Antiforgery token to all forms. If the Form already has the 
    __RequestVerificationToken element, then set it with the global token, else,
    inject the element with the global token */
    hiddenToken = $(form).find("input[type='hidden'][name='__RequestVerificationToken']");
    if (hiddenToken.length > 0) {
        hiddenToken[0].value = global.GetAntiForgeryToken();
    } else {
        var requestTokenControl = "<input type='hidden' name='__RequestVerificationToken' value='";
        requestTokenControl = requestTokenControl + global.GetAntiForgeryToken() + "' />";
        form.append(requestTokenControl);
    }
}

function fnSetTimeOffsetCookie() {
    var storedTimeZoneOffset = $.cookie('TimeZoneOffset');
    currentTimeZoneOffset = (new Date()).getTimezoneOffset().toString();
    currentTimeZoneOffset = currentTimeZoneOffset * -1; //We want the offset to have the right sign for search to work.
    if (storedTimeZoneOffset === null || storedTimeZoneOffset !== currentTimeZoneOffset) {
        $.cookie('TimeZoneOffset', currentTimeZoneOffset);
    }
}

function fnEnforceMaxLength(event) {
    // ignore these keys
    var ignore = [8, 9, 13, 33, 34, 35, 36, 37, 38, 39, 40, 46, 86];
    var self = $(this),
        maxlength = self.attr('maxlength'),
        code = $.data(this, 'keycode');

    // check if maxlength has a value.
    // The value must be greater than 0
    if (maxlength && maxlength > 0) {
        // continue with this keystroke if maxlength
        // not reached or one of the ignored keys were pressed.
        return (self.val().length < maxlength || $.inArray(code, ignore) !== -1);
    }
}

/*Text Area max length handling*/
jQuery(function ($) {
    // use keypress instead of keydown as that's the only
    // place keystrokes could be canceled in Opera
    var eventName = 'keypress';

    // handle textareas with maxlength attribute
    $('textarea[class*=maxlength]')

    // this is where the magic happens
    .live(eventName, fnEnforceMaxLength)

    // store keyCode from keydown event for later use
    .live('keydown', function (event) {
        $.data(this, 'keycode', event.keyCode || event.which);
});


});

//-----------------------------------------------------------
//----------------REPLACE BROWSER MSGBOXES-------------------
//-----------------------------------------------------------

ConfirmCallbacks = { Yes: function () { }, No: function () { } };
var oldAlert = window.alert;

var SupportedBrowser = {
    //This function checks for the browsers that you want to show out of date browser warning on.
    //The function returns true if it’s an unsupported browser and returns false if it’s not.
    badBrowser: function (event) {
        var currentBrowser = global.GetBrowser();
        var exit = false;
        if (SupportedBrowser.getBadBrowser('browserWarning') != 'seen') {
            $.each(hdnBrowserVersionInfo, function () {
                if (currentBrowser.browser.toLowerCase() == "explorer" && this.Item1.toLowerCase() == "internet explorer") {
                    if (currentBrowser.version < parseInt(this.Item2)) {
                        exit = true;
                        return true;
                    }
                }
                else if (currentBrowser.browser.toLowerCase() == "chrome" && this.Item1.toLowerCase() == "chrome") {
                    if (currentBrowser.version < parseInt(this.Item2)) {
                        exit = true;
                        return true;
                    }
                }
                else if (currentBrowser.browser.toLowerCase() == "firefox" && this.Item1.toLowerCase() == "mozilla firefox") {
                    if (currentBrowser.version < parseInt(this.Item2)) {
                        exit = true;
                        return true;
                    }
                }
                else if (currentBrowser.browser.toLowerCase() == "safari" && this.Item1.toLowerCase() == "safari") {
                    if ((currentBrowser.version < parseInt(this.Item2) && currentBrowser.OS.toLowerCase() == "ipad") || currentBrowser.OS.toLowerCase() != "ipad") {
                        exit = true;
                        return true;
                    }
                }
            });
            if (exit) {
                return true;
            }
        }
        return false;
    },

    //This function creates a cookie with the value which indicates if browser outdated warning is already displayed
    setBadBrowser: function (cookieName, value, expiredays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + expiredays);
        document.cookie = cookieName + "=" + escape(value) +
            ((expiredays == null) ? "" : ";expires=" +
            exdate.toGMTString());
    },

    //This function returns the value of the cookie where the value which indicates if browser outdated warning is already displayed
    getBadBrowser: function (cookieName) {
        if (document.cookie.length > 0) {
            c_start = document.cookie.indexOf(cookieName + "=");
            if (c_start != -1) {
                c_start = c_start + cookieName.length + 1;
                c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) c_end = document.cookie.length;
                return unescape(document.cookie.substring(c_start, c_end));
            }
        }
        return "";
    },

    formatString: function (string, arg) {
        if (string != null) {
            for (var i = 0; i < arg.length; i++) {
                var reg = new RegExp("\\{" + i + "\\}", "gm");
                string = string.replace(reg, arg[i]);
            }
        }
        return string;
    }
};

$(function () {
    var currentBrowser = global.GetBrowser();
    var argumentsList = [];

    currentBrowser.browser = currentBrowser.browser.replace("Explorer", "Internet Explorer");
    argumentsList.push(currentBrowser.browser);
    argumentsList.push($("[name='browserVersionHelpBaseUrl']").val());

    var formattedstring = SupportedBrowser.formatString($('#outDatedBrowserMessage').val(), argumentsList);
    if (formattedstring != null) {
        if (SupportedBrowser.badBrowser()) {
            $("<div id='browserWarning' class ='outDatedBrowser'>" + formattedstring + "</div>")
        .prependTo("body");
        } 
    }

    $('#warningClose').click(function () {
        SupportedBrowser.setBadBrowser('browserWarning', 'seen');
        $('#browserWarning').slideUp('slow');
        return false;
    });

    $("#jQueryUImessageBox").dialog({
        autoOpen: false,
        title: "Sage Construction Anywhere",
        bgiframe: true,
        width: 500,
        modal: true,
        buttons: [{
            text: "Ok",
            id: "btnjQueryUImessageBoxOk", //Added for automation
            click: function () {
                $(this).dialog('close');
                ConfirmCallbacks.Yes();
            }
        }]
    });

    $("#jQueryUIconfirmBox").dialog({
        autoOpen: false,
        title: "Sage Construction Anywhere",
        bgiframe: true,
        width: 500,
        modal: true,
        buttons: [{
            text: "No",
            id: "btnjQueryUIConfirmBoxNo",
            click: function () {
                $(this).dialog('close');
                ConfirmCallbacks.No();
            }
        },
            {
                text: "Yes",
                id: "btnjQueryUIConfirmBoxYes",
                click: function () {
                    $(this).dialog('close');
                    ConfirmCallbacks.Yes();
                }
            }]
    });

    window.alert = function (message) {
        ConfirmCallbacks.Yes = function () {
        };
        ConfirmCallbacks.No = function () {
        };
        $("#jQueryUImessageBox").empty();
        $("#jQueryUImessageBox").append(message);
        $("#jQueryUImessageBox").dialog('open');
    };

    $('#ajaxSpinner')
            .ajaxStart(function () {
                $(this).slideDown();
            })
            .ajaxStop(function () {
                var that = this;
                setTimeout(function () { $(that).slideUp(); }, 500);
            });
});

function fancyMessage(message, okCallback) {
    if (okCallback)
        ConfirmCallbacks.Yes = okCallback;
    $("#jQueryUImessageBox").empty();
    $("#jQueryUImessageBox").append(message);
    $("#jQueryUImessageBox").dialog('open');
}

function fancyConfirm(message, yesCallback, noCallback) {
    if(yesCallback)
        ConfirmCallbacks.Yes = yesCallback;
    if(noCallback)
        ConfirmCallbacks.No = noCallback;

    $("#jQueryUIconfirmBox").empty();
    $("#jQueryUIconfirmBox").append(message);
    $("#jQueryUIconfirmBox").dialog('open');
}
//Global Unhandled Exception Handler (really, is it still an unhandled exception if there's a handler for it?)
var hasTriedToNotify = false;
window.onerror = function (msg, url, line) {
    //Hide the spinner so it doesn't spin on forever when there's an AJAX problem
    $('#ajaxSpinner').stop(true, true);

    //Hack to change url if JS error handling is from Enroll screen
    //TODO: Need to find a more elegant solution for this.
    var baseUrl = global.GetBaseUrl();
    if (baseUrl.indexOf("Enroll") > 0) {
        baseUrl = baseUrl.replace("Enroll/", "Enroll/LogJavascriptError/");
    } else {
        baseUrl = baseUrl + 'Json/LogJavascriptError';
    }

    if (!hasTriedToNotify) {
        $.ajax({
            url: baseUrl,
            dataType: "json",
            jsonp: "$callback",
            global: false,      //Suppress spinner
            data: global.AddAntiForgeryToken({ Message: msg, Url: url, Line: line }),
            type: "POST",
            context: this,
            success: function (data) {
                hasTriedToNotify = false;
            },
            error: function (jqXhr, textStatus, errorThrown) {
                hasTriedToNotify = true;            //Endless loops are bad, mmkay.
            }
        });
    }
            };

$.fn.hasScrollBar = function() {
    var _elm = $(this)[0];
    var _hasScrollBar = false;
    if ((_elm.clientHeight < _elm.scrollHeight) || (_elm.clientWidth < _elm.scrollWidth)) {
        _hasScrollBar = true;
    }
    return _hasScrollBar;
};

jQuery.findTag = function (tagName, arr) {
    var _tag = $.grep(arr, function (item) {
        return item.toLowerCase() == tagName.toLowerCase();
    });
    return _tag.length ? _tag[0] : null;
};


//Extending the dialog ui to include a help icon in the piece of code below.

var _init = $.ui.dialog.prototype._init;

   //Custom Dialog Init
$.ui.dialog.prototype._init = function () {
    
    //We do not require help link in confirm dialog and messagebox
    if (!(this.element.attr("id") == "jQueryUImessageBox" || this.element.attr("id") == "jQueryUIconfirmBox")) {

        _init.apply(this, arguments);

        //custom init functionality, variables and event binding.
        //Reference to the titlebar
        uiDialogTitlebar = this.uiDialogTitlebar;
        windowHelpLocation = $(".helpMenuElement.tile-menu").attr('href');
        uiDialogTitlebar.append('<a target = "_blank" href=' + windowHelpLocation + ' id="dialog-helpMenuElement" class="float-r"><span class="sca-icon-dialogpopup sca-icon-help" style="width: 24px; height: 24px; display: block" title = "Help"></span></a>');

        // Click handler which handles dialog help click.
        $('#dialog-helpMenuElement').live("click", function () {
            var helpBaseUrl = $("#hdnTopicHelpBaseUrl").val();
            var origHref = $(this).attr('href');
            $(this).attr('href', origHref.replace(/^Help/, helpBaseUrl.replace("Topic", "")));
        });
    }
};

//Custom Dialog Functions will go in here. 
$.extend($.ui.dialog.prototype, {
});
    

//-----------------------------------------------------------
//----------------KEEP TRACK OF PAGE UNLOAD------------------
// If user navigates away from a page while an ajax request
// is in progress, the xhr error event is fired. So, alert
// with error message is displayed. We do not want the message
// when the page is undloading. This handler will track
// page unload and any error handler will have to call
// global.IsPageUnloading() to check and avoid the message.
//-----------------------------------------------------------
var pageUnloading = false;
window.onbeforeunload = function () {
    pageUnloading = true;
};
