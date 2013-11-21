(function ($) {
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

    });

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
    });


} (jQuery));
