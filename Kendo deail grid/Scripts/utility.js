//-----------------------------------------------------------
//Author: Micah Montoya
//Created Date: 1/7/2010
//Last update: 11/22/2011
//-----------------------------------------------------------

//-----------------------------------------------------------
//----------------------ERROR MESSAGES-----------------------
//-----------------------------------------------------------
/*How to use - add as necessary

invalid: use anytime validation has failed and a more meaningful message is not available
general: use whenever an error has occurred with the app.  The user should only see this once per request.  
If the error occurs a second time the user tries on the same page, then show the "server" message
missing: use whenever a page request is made and the page doesn't exist.  The user should only see this once per request.  
If the error occurs a second time the user tries on the same page, then show the "server" message
server: use whenever a server error occurs that is a stopper
session: use whenever the user session has expired on an ajax request.
archive: use this whenever you are deleting an item but the item has the ability to be undone
perDel: use this whenever you are permanently deleting an item
remove: use this whenever the action 'delete' is executed but the item it is supposed to affect is not known

These messages could be used with the function fncError(message, logout);

For localizing these messages, it is recommended to use a separate js file per language
*/
var errorMessages = {
    invalid: 'The value(s) specified are incorrect.  Please fix the incorrect value(s) and try again.',
    general: 'An error has occurred.  Please try again.',
    missing: 'The page cannot be found.  Please try again.',
    server: 'An internal error has occurred.  We apologize for the inconvenience and ask that you try back at a later time.',
    session: 'We apologize for the inconvenience but for security purposes your session has expired.  You will be redirected to the login screen where you will need to relogin to continue.',
    archive: function (item) { var msg = 'Are you sure you want to delete {0}? This can be undone in the archived section.'; return stringFormat(msg, item); },
    perDel: function (item) { var msg = 'Are you sure you want to delete {0}? This cannot be undone.'; return stringFormat(msg, item); },
    remove: function (item) { var msg = 'Please select a {0} to delete.'; return stringFormat(msg, item); }
};


//-----------------------------------------------------------
//----------------------JQUERY EXTENDERS---------------------
//-----------------------------------------------------------
(function ($) {
    //SUMMARY: center element - element is floated over everything else
    //USAGE: $(id).centerElem();
    $.fn.centerElem = function () {
        return this.css({ position: "absolute", zIndex: 9991, top: ($(window).height() - this.height()) / 2 + $(window).scrollTop() + "px", left: ($(window).width() - this.width()) / 2 + $(window).scrollLeft() + "px" });
    };

    //SUMMARY: will set alternating colors on a specific type of element using element type, class name or like in a specific container
    //USAGE: $(elem).zebraStripe('alternatingColor', 'td', true); or $(elem).zebraStripe('alternatingColor', '.className', true);
    $.fn.zebraStripe = function (options) {
        var defaults = {
            className: global.emptyString,
            altElem: 'p',
            isOdd: true
        };
        var nOptions = $.extend(defaults, options), nAltItem = (nOptions.isOdd ? nOptions.altElem + ':odd' : nOptions.altElem + ':even');
        this.find("tr:last-child").addClass("lastRow");
        return this.find(nAltItem).addClass(nOptions.className);
    };

    //SUMMARY: resets all form fields to blank or inputs in a specific element - not same thing as reset
    //USAGE: $('#elem').clearFields({setSelectFirst: false});
    $.fn.clearFields = function (options) {
        var defaults = {
            setSelectFirst: true,
            inputTag: null
        };
        var nOptions = $.extend(defaults, options), checkType = this;
        if (nOptions.inputTag !== null) {
            checkType = $(this).find(nOptions.inputTag);
        }
        return checkType.each(function () {
            if (this.tagName.toLowerCase() === 'form') {
                return $('option:input', this).clearForm();
            }
            switch (this.type) {
                case 'password':
                case 'textarea':
                case 'text':
                case 'file':
                    this.value = global.emptyString;
                    break;
                case 'select-multiple':
                case 'select-one':
                    this.selectedIndex = nOptions.setSelectFirst ? 0 : -1;
                    break;
                case 'radio':
                case 'checkbox':
                    this.checked = false;
                    break;
            }
        });
    };

    //SUMMARY: resets form fields - similar to form reset button
    //USAGE: $('form').resetForm();
    $.fn.resetForm = function () { return this[0].reset(); };

    //SUMMARY: select a specific item in a drop down, checkbox, radio by value - pass multiple values to select multiple items
    //USAGE: $(elem).selectItemByVal(15); or $(elem).selectItemByVal('15,20,30',',');
    $.fn.selectItemByVal = function (options) {
        var defaults = {
            value: global.emptyString,
            separator: ','
        };
        var nOptions = $.extend(defaults, options);
        this.clearFields();
        var nValueArray = String(nOptions.value).split(nOptions.separator), nMatchingOptions = $.grep($('option,checkbox,radio', this), function (e) { return $.inArray($(e).val(), nValueArray) > -1; });
        $(nMatchingOptions).attr('selected', true);
        return this;
    };

    //SUMMARY: select a specific item in a drop down, checkbox, radio by text/name - pass multiple values to select multiple items
    //USAGE: $(elem).selectItemByText('Oregon');
    $.fn.selectItemByText = function (options) {
        var defaults = {
            value: global.emptyString,
            separator: ','
        };
        var nOptions = $.extend(defaults, options);
        this.clearFields();
        var nValueArray = String(nOptions.value).split(nOptions.separator), nMatchingOptions = $.grep($('option,checkbox,radio', this), function (e) { return $.inArray($(e).text(), nValueArray) > -1 || $.inArray($(e).attr('name'), nValueArray) > -1; });
        $(nMatchingOptions).attr('selected', true);
        return this;
    };

    //SUMMARY: remove item in a drop down, checkbox, radio by value - pass multiple values to remove multiple items
    //USAGE: $(elem).removeItemByVal(15);
    $.fn.removeItemByVal = function (options) {
        var defaults = {
            value: global.emptyString,
            separator: ','
        };
        var nOptions = $.extend(defaults, options);
        var nValueArray = String(nOptions.value).split(nOptions.separator), nMatchingOptions = $.grep($('option,checkbox,radio', this), function (e) { return $.inArray($(e).val(), nValueArray) > -1; });
        $(nMatchingOptions).remove();
        return this;
    };

    //SUMMARY: remove item in a drop down or list by text
    //USAGE: $(elem).removeItemByText('Oregon');
    $.fn.removeItemByText = function (options) {
        var defaults = {
            value: global.emptyString,
            separator: ','
        };
        var nOptions = $.extend(defaults, options);
        var nValueArray = String(nOptions.value).split(nOptions.separator), nMatchingOptions = $.grep($('option,checkbox,radio', this), function (e) { return $.inArray($(e).text(), nValueArray) > -1 || $.inArray($(e).attr('name'), nValueArray) > -1; });
        $(nMatchingOptions).remove();
        return this;
    };

    //SUMMARY: get selected value from list - will return array if more than 1 selected - can't chain on this
    //USAGE: var val = $(elem).getVal();
    $.fn.getVal = function () { return this.val(); };

    //SUMMARY: get selected text from list - will return array if more than 1 selected - can't chain on this
    //USAGE: var text = $(elem).getText();
    $.fn.getText = function () {
        var nOptions = [];
        $.each(this.find('option'), function () {
            if ($(this).is(':selected')) {
                nOptions.push($(this).text());
            }
        });
        return nOptions;
    };

    //SUMMARY: replace an existing image
    //USAGE: $(elem).replaceImage('star.png',true});
    $.fn.replaceImage = function (options) {
        var defaults = {
            isIcon: true,
            newImage: global.emptyString
        };
        var nOptions = $.extend(defaults, options);
        return this; // this.attr('src', (nOptions.isIcon ? global.iconDirectory : global.imageDirectory) + nOptions.newImage);
    };

    //SUMMARY: will reposition a modal window that is dynamically populated or other - call after load
    //USAGE: $('#myDialogObj').repositionModal();
    $.fn.repositionDialog = function () { return; };  // return this.dialog('option', 'position', this.dialog('option', 'position')); };

    //SUMMARY: prints a specfic elements content
    //USAGE: $('#bigText').printMe();
    $.fn.printMe = function () {
        var title='Document1';
        if ($(this).attr('data-print-title') != undefined){
            title = $(this).attr('data-print-title');
        }
        var nOptions = window.open(global.emptyString);
        nOptions.document.write('<html><head><title>' + title + '</title>');
        nOptions.document.write('<link rel="stylesheet" href="/Content/master.css" type="text/css" media="print" ></link>');
        nOptions.document.write('</head><body >');
        nOptions.document.write(this.html());
        nOptions.document.write('</body></html>');
        nOptions.document.close();
        nOptions.focus();
        nOptions.print();
        nOptions.close();
        return this;
    };

    //SUMMARY: uses .net ajax to validate a group - can't chain on this
    //RETURNS: true or false
    //USAGE: if($('#test').validateByGroup(groupName);
    $.fn.validateByGroup = function (options) {
        var defaults = {
            groupName: '*'
        };
        var nOptions = $.extend(defaults, options);
        return Page_ClientValidate(nOptions.groupName);
    };

    //SUMMARY: uses .net ajax to enable/disable a validation control
    //USAGE: if($('#test').validatorState(false);
    $.fn.setValidatorState = function (options) {
        var defaults = {
            isDisabled: false
        };
        var nOptions = $.extend(defaults, options);
        ValidatorEnable(this, nOptions.isDisabled);
        return this;
    };

    //SUMMARY: get date from datepicker
    //RETURNS: date or null if nothing picked yet
    //USAGE: var date = $('#datePicker1').getDatePicked();
    $.fn.getDatePicked = function () { return this.datepicker('getDate'); };

    //SUMMARY: checks/unchecks all radio/checkbox types that reside in a container
    //USAGE: $('#test').checkControl({ checked: true });
    $.fn.checkControl = function (options) {
        var defaults = {
            checked: false
        };
        var nOptions = $.extend(defaults, options);
        $.map(this.find('input:checkbox,input:radio'), function (e) { $(e).attr('checked', nOptions.checked); });
        return this;
    };

    //SUMMARY: disables/enables all input types that reside in a container - does not disable buttons by default
    //USAGE: $('#test').disableFormInputs({ isDisabled: true,types:'input' });
    $.fn.disableFormInputs = function (options) {
        var defaults = {
            isDisabled: false,
            types: 'input:text,input:password,input:radio,input:checkbox,select,textarea'
        };
        var nOptions = $.extend(defaults, options);
        $.map($(nOptions.types, this), function (e) { $(e).attr('disabled', nOptions.isDisabled); });
        return this;
    };

    //SUMMARY: opens a pop-up window
    //USAGE: $('#someID').popUpWindow('http://www.google.com','gSite',true,true }); or $('#someID').popUpWindow('files/document.doc',name: 'docFile');
    //URl - is required
    $.fn.popUpWindow = function (options) {
        var defaults = {
            url: global.emptyString,
            name: 'newWinX01',
            width: 500,
            height: 500,
            showToolBar: false,
            showScrollBars: false,
            showLocation: false,
            showMenuBar: false,
            isResizable: false
        };
        var nOptions = $.extend(defaults, options);
        var nNewWinOpts = ((nOptions.showToolBar) ? 'toolbar=1,' : 'toolbar=0,') + ((nOptions.showScrollBars) ? 'scrollbars=1,' : 'scrollbars=0,') + ((nOptions.showScrollBars) ? 'resizable=1,' : 'resizable=0,') + ((nOptions.showScrollBars) ? 'location=1,' : 'location=0,') + ((nOptions.showScrollBars) ? 'statusbar=1,' : 'statusbar=0,') + ((nOptions.showScrollBars) ? 'menubar=1,' : 'menubar=0,') + 'width=' + nOptions.width + ',height=' + nOptions.height;
        var newWindow = window.open(nOptions.url, nOptions.name, nNewWinOpts);
        //if (!_newWindow.exists) { alert(popupsBlocked); }
        if (window.focus) { newWindow.focus(); }
        return this;
    };

    //SUMMARY: causes a pause to occur for a defined amount of time - time is in milliseconds, 1 sec =  1000 milliseconds
    //USAGE: $('#test').wait(1000).animate({left:'+=200'},2000)
    $.fn.wait = function (options) {
        var defaults = {
            time: 1000,
            type: 'fx'
        };
        var nOptions = $.extend(defaults, options);
        return this.queue(nOptions.type, function () {
            setTimeout(function () {
                $(this).dequeue();
            }, nOptions.time);
        });
    };

    $.fn.openDialog = function () { return this.dialog('open'); };
    $.fn.closeDialog = function (destroy) { return (destroy) ? this.dialog('destroy') : this.dialog('close'); };
    $.fn.openDatePicker = function () { return this.datepicker('show'); };
    $.fn.closeDatePicker = function (destroy) { return (destroy) ? this.datepicker('destroy') : this.datepicker('close'); };
    $.fn.enableDatePicker = function () { return this.datepicker('enable'); };
    $.fn.disableDatePicker = function () { return this.datepicker('disable'); };
    $.fn.refreshDatePicker = function () { return this.datepicker('refresh'); };

    $.fn.msgNotifier = function (options) {
        var defaults = {
            autoHide: true //set to false to not hide unless removed by other script
        };
        var nOptions = $.extend(defaults, options);
        if (nOptions.autoHide) {return this.css({ opacity: 1 }).slideDown(100).delay(300).queue(function () { $(this).animate({ opacity: 0.0 }, 3000, function () { $(this).slideUp(); }).dequeue(); }); } 
        else {return this.css({ opacity: 1 }).slideDown(100); }
    };

    $.fn.selectTab = function (options) {
        var defaults = {
            tabIndex: 0 //default - select 1st tab
        };
        var nOptions = $.extend(defaults, options);
        return this.tabs("select", nOptions.tabIndex);
    };

    $.fn.limitChars = function(options) {
        var defaults = {maxChars: 0};
        var nOptions = $.extend(defaults, options);
        if(nOptions.maxChars === 0) { return this; }

        this.bind('keydown', function(e) {
            var count = this.val().length;
            if(count===nOptions.maxChars) { e.preventDefault();}
        });
        return this;
    };
})(jQuery);

//-----------------------------------------------------------
//-----------------PROTOTYPE---------------------------------
//-----------------------------------------------------------

//SUMMARY: checks to see that a specific item isnt blank, length is greater than 0, or that it exists 
//USAGE: obj.exists;
String.prototype.exists = function () { return (!this || /^\s*$/.test(this) || 0 === this.length || this === null) ? false : true; };

//USES the .net operatives - uses the Sys.CultureInfo.CurrentCulture property to determine the culture value
/*
DATE
d - Short date pattern (e.g.: 02/17/2007)
D - Long date pattern (e.g: Saturday, 17 February 2007)
t - Short time pattern (e.g.: 22:10)
T - Long time pattern (e.g.: 22:10:30)
F - Full date pattern (e.g.: Saturday, 17 February 2007 22:10:30)
m (or M) - Month and day pattern (e.g.: February 17)
s - Sortable date and time pattern (e.g.: 2007-02-17T22:10:30)
y - (or Y) Year and month pattern (e.g.: 2007 February)

NUMBER
p - The number is converted to a string that represents a percent (e.g.: -1,234.56 %)
d - The number is converted to a string of decimal digits (0-9), prefixed by a minus sign if the number is negative (e.g.: -1234.56)
c - The number is converted to a string that represents a currency amount (e.g.: ($1,234.56))
n - The number is converted to a string of the form "-d,ddd,ddd.ddd…" (e.g.: -1,234.56)
*/
String.prototype.formatDateString = function (value, format) { var newDte = Date.parseInvariant(value, format); return newDte.localFormat(format); };
String.prototype.formatNumber = function (value, format) { return value.localFormat(format); };

//SUMMARY: count number of times a char exists in the string
//VARIABLES: match - character to look for
//RETURNS: length
//USAGE: var t = obj.charCount("c"); - will return count of all letters c in obj - obj is a string type
String.prototype.charCount = function (match) { var res = this.match(new RegExp(match, 'g')); if (res === null) { return 0; } return res.length; };

//SUMMARY: get the month name
//VARIABLES: addedValue - used to determine format of month name - relies on language file to work
//RETURNS: month
//USAGE: var t = obj.getMonthName(0); - will return the full month name from obj (add 12 to start at 3 char and 24 to start at single char) - obj is a date type
Date.prototype.getMonthName = function (addedValue) { return monthNames[this.getMonth() + (addedValue.exists) ? addedValue : global.emptyString]; };

//SUMMARY: get the day name
//VARIABLES: addedValue - used to determine format of day name - relies on language file to work
//RETURNS: day
//USAGE: var t = obj.getDayName(0) - will return the full day name from obj (add 7 to start at 3 char and 14 to start at single char) - obj is a date type
Date.prototype.getDayName = function (addedValue) { return dayNames[this.getDay() + (addedValue.exists) ? addedValue : global.emptyString]; };

//SUMMARY: get the difference in milliseconds between two dates - only valid from 1970+
//VARIABLES: startDate - date starting, endDate - date ending
//RETURNS: milliseconds
//USAGE: var t = obj.getDateDiff('1/1/2010'); - will return the number of milleseconds from obj - obj is a date type
Date.prototype.getDateDiff = function (endDate) { return this.getTime() - endDate.getTime(); };

//SUMMARY: strips out all HTML tags from string
//USAGE: $(obj).html().removeHTMLtags();
String.prototype.removeHTMLtags = function () { return this.replace(/<\/?[^>]+(>|$)/g, global.emptyString); };

//SUMMARY: capitalizes the first letter
//USAGE: $(obj).text().capFirstLetter();
String.prototype.capFirstLetter = function () { return this.charAt(0).toUpperCase() + this.slice(1); };

//SUMMARY: adds/subtracts a set number of days to the current date
//VARIABLES: days - days to add/subtracts, use negative number to subtract the days
//RETURNS: new date
//USAGE: $(obj).addDays(2);
Date.prototype.addDays = function (days) { return this.setDate(this.getDate() + days); };

//-----------------------------------------------------------
//-----------------AJAX OPERATIONS---------------------------
//-----------------------------------------------------------
//SUMMARY: gives a general ajax setting for all ajax calls
var ajaxContentManager = {
    id: null,
    url: null,
    pagePart: null,
    data: '{}',
    dataType: 'json',
    type: 'GET',
    cache: false,
    password: null,
    username: null,
    //timeout: 5000, //10 seconds - anything longer needs refactoring
    isModal: false,
    contentType: "application/json; charset=utf-8",
    loadingMsg: null,
    init: function () { //global setup for all ajax calls
        $.ajaxSetup({
            cache: this.cache,
            type: this.type,
            password: this.password,
            username: this.username,
            timeout: this.timeout,
            beforeSend: function () { this.loadingMsg; },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var nState = XMLHttpRequest.readyState, nStatus = XMLHttpRequest.status, nResponse = XMLHttpRequest.responseText;

                var msg = errorMessages.general, logout = false;
                switch (nStatus) {
                    case '403':
                    case '500':
                        msg = errorMessages.server;
                        logout = true;
                        break;
                    case '404':
                        msg = errorMessages.missing;
                        break;
                    default:
                        msg = errorMessages.general;
                        break;
                }
                switch (textStatus) {
                    case 'timeout':
                    case 'parsererror':
                        msg = errorMessages.server;
                        logout = true;
                        break;
                    default:
                        msg = errorMessages.general;
                        break;
                }
                fncError(msg, logout);

                //TO DO: something with error for developers, best to write this somewhere if possible for review and fixes
                return errorThrown;
            },
            success: function () {
                $(this).repositionDialog(); fncRunAfterLoad();
            },
            complete: function (textStatus) {
                //TO DO: something with error for developers, best to write this somewhere if possible for review and fixes
                if (textStatus.status !== 'success') { return; }
                fncRunAfterLoad();
                $(this).repositionDialog();
            }
        });
    },
    disableErrorHandler: function () {
        $.ajaxSetup({ error: function (g, h, y) { return y; } });
    },
    //loads content from db or similar
    getDynamicContent: function () {
        if (!this.id.exists || !this.pageToLoad.exists) { return; }
        $.ajax({
            url: this.url,
            data: this.data,
            dataType: this.dataType,
            contentType: this.contentType,
            success: function (data, textStatus, XMLHttpRequest) {
                if (data.hadError && data.hadError === true) {
                    global.HandleAjaxError(data);
                    return global.emptyString;
                }
                else {
                    return data;
                }
            }
        });
    },
    //loads content from static file (txt, htm, etc)
    getStaticContent: function () {
        if (!this.id.exists || !this.pageToLoad.exists) { return; }
        $(this.id).load(this.url + this.pagePart, function () {
            if (this.isModal) { $(this).repositionDialog(); }
        });
    }
};

//-----------------------------------------------------------
//---------------------IE8 Array indexOf---------------------
//-----------------------------------------------------------

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt /*, from*/) {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
          this[from] === elt)
                return from;
        }
        return -1;
    };
}





//-----------------------------------------------------------
//-------------------------FUNCTIONS-------------------------
//-----------------------------------------------------------

//SUMMARY: formats a string similar to how .net does. it looks for {n} and replaces each with the text in the same array index
//variable: originalText - the text with the areas for replacement, replacementText - comma delimited string
//RETURNS: originalText - with 
//USAGE: var formattedtext = stringFormat('Hello {0}, welcome {1}.', 'Mr. Smith, home');
var stringFormat = function (originalText, replacementText) {
    var numberOfItems = originalText.split('}').length - 1, rTextArray = replacementText.split(','), i;
    for (i = 0; i < numberOfItems; i++) { 
        var regExp = new RegExp('\\{' + i + '\\}', 'g');
        originalText = originalText.replace(regExp, rTextArray[i]);
    }
    return originalText;
};

//default loader
function fncGetLoader(className, displayText) { 
    if (!displayText) {
        return "<div class='" + className + "'><img id='loaderimg' src='/Content/Images/spinner.gif'></img></div>"; 
    } else {
        return "<div id='loaderimg' class='" + className + "'><p><img src='/Content/Images/spinner.gif'></img> Loading. Please wait...</p></div>"; 
    }
}

//this creates equal height columns for floated columns - dynamic content will not work with this
function fncSetEqualHeight(columns) {
    var tallestcolumn = 0;
    columns.each(function () {
        var currentHeight = $(this).height();
        if (currentHeight > tallestcolumn) { tallestcolumn = currentHeight; }
    });
    columns.height(tallestcolumn);
}

//SUMMARY: prints the page
//variable: none
//RETURNS: nothing
//USAGE: fncPrint();
function fncPrint() { window.print(); }

//SUMMARY: creates a string from an object
//VARIABLES: obj - object
//RETURNS: string equivalent of object
//USAGE: fncGetObjString(object);
function fncGetObjString(obj) { return $('<div>').append(obj.clone()).remove().html(); }

//SUMMARY: returns the value from the query string
//USAGE: var t =  $('#test').getQueryStringVal(0);
function fncGetQueryStringVal(position) {
    var nObjURL = { }, nQvalReturn = null, strKey = 0;
    global.counter = 0;
    window.location.search.replace(new RegExp("([^?=&]+)(=([^&]*))?", "g"), function ($0, $1, $2, $3) { nObjURL[$1] = $3; });
    for (strKey in nObjURL) { if (position === global.counter) { nQvalReturn = nObjURL[strKey]; } global.counter++; }
    return nQvalReturn;
}

//SUMMARY: reloads the active site
//variable: none
//RETURNS: host
//USAGE: fncReloadDocument();
function fncReloadPage() { window.location.reload(); }

//SUMMARY: loads a new document or site
//variable: url - page or site URL
//RETURNS: host
//USAGE: fncAssign('page.htm');
function fncAssign(url) { window.location.assign(url); }
//SUMMARY: replaces the current document with a new one - no history
//variable: url - page or site URL
//RETURNS: host
//USAGE: fncReplaceURL('page.htm');
function fncReplaceURL(url) { window.location.replace(url); }

//SUMMARY: redirects to new site - history retained
//variable: url - page or site URL
//RETURNS: host
//USAGE: fncRedirect('page.htm');
function fncRedirect(url) { window.location.href = url; }

//SUMMARY: creates a dialog that shows the error message and can also logout the user
//variable: error - error message to show to user from the errorMessages var, logout - set to true to logout user
//USAGE: fncError(errorMessages.general,false);
function fncError(errorMessage, logout) {
    $('#errorMessageContainer').html(errorMessage);
    $('#errorDialog').dialog(
    {
        width: 400, modal: true, draggable: false, resizable: false, buttons: {
            "Ok": function () { if (logout) { fncAssign(global.logoutUrl); } else { $(this).closeDialog(); } }
        }
    });
}

//SUMMARY: creates a confirm dialog that shows the message.  allows the user to cancel the act or continue with the action
//variable: message - message to show to user from the errorMessages or text var, functionToCall - specify function to call on clicking ok. do not wrap in quotes
//USAGE: fncConfirm(text.archive('user'),fncDeleteUser);
function fncConfirm(message, functionToCall) {
    $('#errorMessageContainer').html(message);
    $('#errorDialog').dialog(
    {
        width: 400, modal: true, draggable: false, resizable: false, buttons: {
            Cancel: function () { $(this).closeDialog(); },
            "Ok": function () { if ($.isFunction(functionToCall)) { functionToCall.call(this); } }
        }
    });
}

//SUMMARY: checks to see that a specific item isnt blank, length is greater than 0, or that it exists 
//USAGE: fncExists(obj);
function fncExists(item) { return (!item || /^\s*$/.test(item) || 0 === item.length || item === null) ? false : true; }



//-------------------------
//jsb commented out as part of transition to jquery-ui 1.10.2. It was breaking appears to be fixed. Left for ref in case it comes back in testing.
//if foxtrot branch is out and this is still here. delete it...
/**
* This is part of a patch to address a jQueryUI bug.  The bug is responsible
* for the inability to scroll a page when a modal dialog is active. If the content
* of the dialog extends beyond the bottom of the viewport, the user is only able
* to scroll with a mousewheel or up/down keyboard keys.
*
* This javascript patch overwrites the $.ui.dialog.overlay.events object to remove
* the mousedown, mouseup and click events from the list of events that are bound
* in $.ui.dialog.overlay.create
*
* The original code for this object:
* $.ui.dialog.overlay.events: $.map('focus,mousedown,mouseup,keydown,keypress,click'.split(','),
*  function(event) { return event + '.dialog-overlay'; }).join(' '),
*
*/

/*jslint:ignore*/

//(function ($, undefined) {
//    if ($.ui && $.ui.dialog) {
//        $.ui.dialog.overlay.events = $.map('focus,keydown,keypress'.split(','), function (event) { return event + '.dialog-overlay'; }).join(' ');
//    }
//} (jQuery));

/*jslint:end*/