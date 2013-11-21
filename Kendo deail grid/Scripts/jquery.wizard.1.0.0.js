//This builds upon the jquery ui dialog to convert it into a wizard type operation
//each step is a fieldset
//the legend is used to show all steps and then highlights current, it will be hidden

(function ($) {
    var wzdMethods_defaults = {
        'dialogId': '#wzdDialog',
        'validate': true,
        'saveOnLastStepOnly': true,
        'stepContainer': '#wzdSteps',
        'previousButtonText': 'Previous',
        'nextButtonText': 'Next',
        'cancelButtonText': 'Cancel',
        'closeButtonText': 'Close',
        'unvisitedClass': '#ccc',
        'visitedClass': '#454545',
        'currentClass': '#009900',
        'saveFunction': null, //need save function
        'validationCheckFunction': null //need validate function if validating
    };
    var _wzdMethods_number_steps = 0, _wzdMethods_current_step = 0;
    var wzdMethods = {
        init: function (options) {
            _wzdMethods_options = $.extend(defaults, options);
            return this.each(function (index, value) {
                var $this = $(this);
                _number_steps = $this.find('frameset').length - 1; //-1 so it is 0 based
                _step_titles = $this.find('frameset legend');
                _step_titles.hide();
                wzdMethods.createStepTitles(_step_titles);
                wzdMethods.createCancelButton;
                wzdMethods.createNextButton;
                changeStep(_current_step);
            });
        },
        createNextButton: function () {
            $(this).dialog("option", "buttons", [
            {
                text: _options.nextButtonText,
                click: function () { wzdMethods.nextButtonClick }
            }
            ]);
        },
        createPreviousButton: function () {
            $(this).dialog("option", "buttons", [
            {
                text: _options.previousButtonText,
                click: function () { wzdMethods.previousButtonClick }
            }
            ]);
        },
        createCancelButton: function () {
            $(this).dialog("option", "buttons", [
            {
                text: _options.cancelButtonText,
                click: function () { wzdMethods.cancelButtonClick }
            }
            ]);
        },
        ceateCloseButton: function () {
            $(this).dialog("option", "buttons", [
            {
                text: _options.closeButtonText,
                click: function () { wzdMethods.closeButtonClick }
            }
            ]);
        },
        removeButton: function (buttonName) {
            var buttons = this.element.dialog('option', 'buttons');
            delete buttons[buttonName];
            this.element.dialog('option', 'buttons', buttons);
        },
        removeAllButton: function () {
            var buttons = this.element.dialog('option', 'buttons');
            delete buttons;
        },
        previousButtonClick: function () {
            _wzdMethods_current_step--;
            if (_wzdMethods_current_step < 1) { wzdMethods.removeButton(_wzdMethods_options.previousButtonText); }
            wzdMethods.changeStepTitles(_wzdMethods_current_step);
            wzdMethods.changeStep(_wzdMethods_current_step);
        },
        nextButtonClick: function () {
            var status = false;
            //call any saves, validation, etc from here
            if (_wzdMethods_options.validate) {
                var validateFunction = _wzdMethods_options.validationCheckFunction;
                if ($.isFunction(validateFunction)) {
                    status = validateFunction.call(this, data);
                }
            }
            if (_wzdMethods_options.savePerChange) {
                var saveFunction = _wzdMethods_options.saveFunction;
                if ($.isFunction(saveFunction)) {
                    status = saveFunction.call(this, data);
                }
                if (!status) { return false; } //didn't save successfully, don't proceed to next step
            }
            _wzdMethods_current_step++;
            wzdMethods.removeAllButton();
            if (_wzdMethods_current_step > -1 && _wzdMethods_current_step < _number_steps - 1) { wzdMethods.createNextButton; }
            if (_wzdMethods_current_step > 0 && _wzdMethods_current_step < _wzdMethods_number_steps - 1) { wzdMethods.createPreviousButton; }
            if (_wzdMethods_current_step < _wzdMethods_number_steps - 1) { wzdMethods.createCancelButton; }
            if (_wzdMethods_current_step == _wzdMethods_number_steps) { wzdMethods.createCloseButton; }
            wzdMethods.changeStepTitles(_wzdMethods_current_step);
            wzdMethods.changeStep(_wzdMethods_current_step);
        },
        cancelButtonClick: function () {
            wzdMethods.closeButtonClick()
        },
        closeButtonClick: function () {
            _wzdMethods_number_steps == 0, _wzdMethods_current_step = 1;
            $(this).dialog('close');
        },
        createStepTitles: function (stepNames) {
            for (name in stepNames) {
                var step = $('<p/>').text(name);
                if (_wzdMethods_current_step === 1) { step.addClass(_wzdMethods_options.currentClass); } else { step.addClass(_wzdMethods_options.unvisitedClass); }
                $(_wzdMethods_options.stepContainer).append(step);
            }
        },
        changeStepTitles: function (newStep) {
            var stepObj = $.makeArray($(_wzdMethods_options.stepContainer).find('p'));
            for (var i = 0; i < stepObj.length; i++) {
                if (i > newStep) { $(stepObj[i]).addClass(_wzdMethods_options.unvisitedClass); }
                if (i == newStep) { $(stepObj[i]).addClass(_wzdMethods_options.currentClass); }
                if (i < newStep) { $(stepObj[i]).addClass(_wzdMethods_options.visitedClass); }
            }
        },
        changeStep: function (newStep) {
            var stepObj = $.makeArray($this.find('frameset'));
            for (var i = 0; i < stepObj.length; i++) {
                if (i == newStep) { $(stepObj[i]).show(); } else { $(stepObj[i]).hide(); }
            }
        }
    };
})(jQuery);