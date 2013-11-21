(function ($) {
    // The validator function
    $.validator.addMethod('rangeDate', function (value, element, param) {
        if (!value) {
            return true; // not testing 'is required' here!
        }
        try {
            var dateValue = $.datepicker.parseDate("mm/dd/yy", value);
        }
        catch (e) {
            return false;
        }
        return param.min <= dateValue && dateValue <= param.max;
    });

    // The adapter to support ASP.NET MVC unobtrusive validation
    $.validator.unobtrusive.adapters.add('daterange', ['min', 'max'], function (options) {
        var params = {
            min: $.datepicker.parseDate("mm/dd/yy", options.params.min),
            max: $.datepicker.parseDate("mm/dd/yy", options.params.max)
        };

        options.rules['rangeDate'] = params;
        if (options.message) {
            options.messages['rangeDate'] = options.message;
        }
    });

    //******* Time Range Validation
    // The validator function
    $.validator.addMethod('rangeTime', function (value, element, param) {
        if (!value) {
            return true; // not testing 'is required' here!
        }
        var valid = true;
        try {
            var timeVal = value.split(':'); for (var i = 0; i < timeVal.length; i++) timeVal[i] = timeVal[i] | 0;
            var timeMinVal = param.min.split(':'); for (var i = 0; i < timeMinVal.length; i++) timeMinVal[i] = timeMinVal[i] | 0;
            var timeMaxVal = param.max.split(':'); for (var i = 0; i < timeMaxVal.length; i++) timeMaxVal[i] = timeMaxVal[i] | 0;

            valid = (timeMinVal[0] < timeVal[0] && timeVal[0] < timeMaxVal[0])
            || (timeMinVal[0] == timeVal[0] && timeMinVal[1] <= timeVal[1])
            || (timeVal[0] == timeMaxVal[0] && timeVal[1] <= timeMaxVal[1]);
        }
        catch (e) {
            return false;
        }
        return valid;
    });

    // The adapter to support ASP.NET MVC unobtrusive validation
    $.validator.unobtrusive.adapters.add('timerange', ['min', 'max'], function (options) {
        var params = {
            min: options.params.min,
            max: options.params.max
        };

        options.rules['rangeTime'] = params;
        if (options.message) {
            options.messages['rangeTime'] = options.message;
        }
    });

    // Validation fails if selected optin has empty Guid
    $.validator.addMethod("requiredDropDown", function (value, element) {
        if (element.value == "" || element.value == "00000000-0000-0000-0000-000000000000")
            return false;
        return true;
    });
    // The validator function for compare validator
    $.validator.addMethod('compareValue', function (value, element, param) {
        return value.toLowerCase() == $(param.dependson).val().toLowerCase();
    });

    // The adapter to support compare validator
    $.validator.unobtrusive.adapters.add('compare', ['dependson'], function (options) {
        options.rules['compareValue'] = options.params;
        if (options.message) {
            options.messages['compareValue'] = options.message;
        }
    });

    // The validator function for DateMonthDay parameter
    // Note: This assumes the premise is passing the current year in all DateMonthDay parameters, including
    //       DefaultValue, MinValue, and MaxValue.
    $.validator.addMethod('rangeDateMonthDay', function (value, element, param) {
        if (!value) {
            return true; // not testing 'is required' here!
        }
        try {
            var tempDate = new Date();
            var dateValue = new Date(value + "/" + tempDate.getFullYear());
        }
        catch (e) {
            return false;
        }
        return param.min <= dateValue && dateValue <= param.max;
    });

    // The adapter to support ASP.NET MVC unobtrusive validation
    $.validator.unobtrusive.adapters.add('datemonthdayrange', ['min', 'max'], function (options) {
        var params = {
            min: new Date(options.params.min),
            max: new Date(options.params.max)
        };

        options.rules['rangeDateMonthDay'] = params;
        if (options.message) {
            options.messages['rangeDateMonthDay'] = options.message;
        }
    });

    // The validator function for DateMonthYear parameter
    $.validator.addMethod('rangeDateMonthYear', function (value, element, param) {
        if (!value) {
            return true; // not testing 'is required' here!
        }
        try {
            var tempDate = new Date();
            // Use 1 for day to match the edit control in the UI
            var dateValue = new Date(value.replace("/", "/1/"));
        }
        catch (e) {
            return false;
        }
        return param.min <= dateValue && dateValue <= param.max;
    });

    // The adapter to support ASP.NET MVC unobtrusive validation
    $.validator.unobtrusive.adapters.add('datemonthyearrange', ['min', 'max'], function (options) {
        var params = {
            min: new Date(options.params.min),
            max: new Date(options.params.max)
        };

        options.rules['rangeDateMonthYear'] = params;
        if (options.message) {
            options.messages['rangeDateMonthYear'] = options.message;
        }
    });

    // The validator function for DateMonthYear parameter
    $.validator.addMethod('rangedatetime', function (value, element, param) {
        if (!value) {
            return true;
        }

        try {
            var dateValue = $.trim($('#DatePart_' + param.dependson).val());
            var timeValue = $.trim($('#' + param.dependson).val());
            var dateTimeValue = new Date(dateValue + " " + timeValue);
            if (isNaN(dateTimeValue))
                return false;
        }
        catch (e) {
            return false;
        }
        return param.min <= dateTimeValue && dateTimeValue <= param.max;
    });

    // The adapter to support ASP.NET MVC unobtrusive validation
    $.validator.unobtrusive.adapters.add('datetimerange', ['min', 'max', 'dependson'], function (options) {
        var params = {
            min: new Date(options.params.min),
            max: new Date(options.params.max),
            dependson: options.params.dependson
        };

        options.rules['rangedatetime'] = params;
        if (options.message) {
            options.messages['rangedatetime'] = options.message;
        }
    });

    $.validator.addMethod('datedatatype', function (value, element, param) {
        if (!value) {
            return true;
        }

        try {
            var dateValue;
            if (param.format.toLowerCase() == 'monthday') {
                tempDate = new Date();
                dateValue = value + "/" + tempDate.getYear();
            }
            else if (param.format.toLowerCase() == 'monthyear') {
                dateValue = new Date(value.replace("/", "/1/"));
            }
            else {
                dateValue = value;
            }

            var dateObject = new Date(dateValue);
            if (isNaN(dateObject))
                return false;
            else
                return true;
        }
        catch (e) {
            return false;
        }
    });

    // The adapter to support ASP.NET MVC unobtrusive validation
    $.validator.unobtrusive.adapters.add('datespecial', ['format'], function (options) {
        var params = {
            format: options.params.format
        };

        options.rules['datedatatype'] = params;
        if (options.message) {
            options.messages['datedatatype'] = options.message;
        }
    });

    var getModelPrefix = function(fieldName) {
        return fieldName.substr(0, fieldName.lastIndexOf('.') + 1);
    };

    var appendModelPrefix = function(value, prefix) {
        if (value.indexOf('*.') === 0) {
            value = value.replace('*.', prefix);
        }
        return value;
    };

    jQuery.validator.addMethod('ifrequired', function (value, element, params) {
        var thisValue = $(params.element).val();
        if (thisValue.toLowerCase() != params.othervalue.toLowerCase()) {
            return true;
        }

        return value != null && value != '';

    }, '');

    $.validator.unobtrusive.adapters.add('requiredif', ['other', 'othervalue'], function (options) {
        var prefix = getModelPrefix(options.element.name),
                other = options.params.other,
                fullOtherName = appendModelPrefix(other, prefix),
                element = $(options.form).find(':input[name="' + fullOtherName + '"]')[0];

        var params = {
            element: element,
            othervalue: options.params.othervalue
        };

        options.rules['ifrequired'] = params;
        if (options.message) {
            options.messages['ifrequired'] = options.message;
        }
    }
    );

} (jQuery));