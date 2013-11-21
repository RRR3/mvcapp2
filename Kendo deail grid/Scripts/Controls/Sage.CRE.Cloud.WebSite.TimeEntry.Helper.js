var timeEntryHelper = {
    GetSubjobNoneName: function () {
        return $("#hdnSubjobNoneName").val();
    },
    GetSubjobNoneId: function () {
        return $("#hdnSubjobNoneId").val();
    },
    GetSubjobDesc: function () {
        return $("#hdnSubjobCustomDescription").val();
    },
    GetStatus: function (status) {
        switch (status) {
            case 1:
                return $('#New').text();
            case 2:
                return $('#Saved').text();
            case 3:
                return $('#Submitted').text();
            case 4:
                return $('#SupervisorApproved').text();
            case 5:
                return $('#ProjectManagerApproved').text();
            case 6:
                return $('#PayrollManagerApproved').text();
            case 7:
                return $('#PostedToBackOffice').text();
            case 8:
                return $('#Approved').text();
            case 9:
                return $('#Rejected').text();
            default:
                return $('#Unknown').text();
        }
    },

    // Functions for time formatting
    GetFormattedHours: function (hours, minutes) {
        var total = 0;
        total = parseInt(hours) + parseFloat(minutes / 60);
        return total;
    },
    GetHours: function (hours) {
        if (hours == '') {
            return 0;
        }
        return parseInt(hours);
    },
    GetMinutes: function (hours) {
        if (hours == '') {
            return 0;
        }
        var hrs = parseInt(hours);
        var minutes = parseFloat(hours - hrs) * 60;
        return parseInt(minutes);
    },

    ShowErrorsAndWarnings: function (data) {
        timeEntryHelper.ShowErrors(data);
        timeEntryHelper.ShowWarnings(data);
    },

    // functions to display errors
    ShowErrors: function (data) {
        if (data.hadError && data.hadError === true && data.errorDescription) {
            global.HandleAjaxError(data);
        } else {
            if (data.errors && (data.errors !== undefined) && (data.errors.length > 0)) {
                var list = $('#ulServerErrors');
                list.html('');
                for (i in data.errors) {
                    list.append('<li>' + data.errors[i] + '</li>');
                }
                $('#Errors').show();
            }
        }
    },

    CheckForWarnings: function (dailyItem) {
        var warnings = [];
        var totalRegularMinutes = 0;
        var totalOverTimeMinutes = 0;
        var totalDoubleTimeMinutes = 0;


        $.each(dailyItem.Entries, function () {
            totalRegularMinutes += this.RegularTimeInMinutes;
            totalOverTimeMinutes += this.OverTimeInMinutes;
            totalDoubleTimeMinutes += this.DoubleTimeInMinutes;
        });

        if (( dailyItem.Template.TimeEntryWorkAmountPolicy.MaximumDailyRegularMinutes > 0) && (totalRegularMinutes > dailyItem.Template.TimeEntryWorkAmountPolicy.MaximumDailyRegularMinutes)) {
            var warningMsg = jQuery.validator.format($('#TimeEntryPolicyEmployeeMaxTime').text(), dailyItem.Name, dailyItem.Template.RegularPayName,
                Math.floor(totalRegularMinutes / 60), totalRegularMinutes % 60,
                Math.floor(dailyItem.Template.TimeEntryWorkAmountPolicy.MaximumDailyRegularMinutes / 60), dailyItem.Template.TimeEntryWorkAmountPolicy.MaximumDailyRegularMinutes % 60);
            warnings.push(warningMsg);
        }
        if ((dailyItem.Template.TimeEntryWorkAmountPolicy.MaximumDailyOvertimeMinutes > 0) && (totalOverTimeMinutes > dailyItem.Template.TimeEntryWorkAmountPolicy.MaximumDailyOvertimeMinutes)) {
            warningMsg = jQuery.validator.format($('#TimeEntryPolicyEmployeeMaxTime').text(), dailyItem.Name, dailyItem.Template.OvertimePayName,
                Math.floor(totalOverTimeMinutes / 60), totalOverTimeMinutes % 60,
                Math.floor(dailyItem.Template.TimeEntryWorkAmountPolicy.MaximumDailyOvertimeMinutes / 60), dailyItem.Template.TimeEntryWorkAmountPolicy.MaximumDailyOvertimeMinutes % 60);
            warnings.push(warningMsg);
        }
        if ((dailyItem.Template.TimeEntryWorkAmountPolicy.MaximumDailyDoubleMinutes > 0) && totalDoubleTimeMinutes > dailyItem.Template.TimeEntryWorkAmountPolicy.MaximumDailyDoubleMinutes) {
            warningMsg = jQuery.validator.format($('#TimeEntryPolicyEmployeeMaxTime').text(), dailyItem.Name, dailyItem.Template.DoublePayName,
                Math.floor(totalDoubleTimeMinutes / 60), totalDoubleTimeMinutes % 60,
                Math.floor(dailyItem.Template.TimeEntryWorkAmountPolicy.MaximumDailyDoubleMinutes / 60), dailyItem.Template.TimeEntryWorkAmountPolicy.MaximumDailyDoubleMinutes % 60);
            warnings.push(warningMsg);
        }

        return warnings;
    },

    ValidateAndShowWarnings: function (dailyItem) {
        var warnings = timeEntryHelper.CheckForWarnings(dailyItem);
        var data = new Object;
        data.warnings = warnings;
        timeEntryHelper.ShowWarnings(data);
    },

    // functions to display errors
    ShowWarnings: function (data) {
        if (data.warnings && (data.warnings !== undefined) && (data.warnings.length > 0)) {
            var list = $('#ulServerWarnings');
            list.html('');
            for (i in data.warnings) {
                list.append('<li>' + data.warnings[i] + '</li>');
            }
            $('#Warnings').show();
        }
    },

    DisplayErrorsAsAlertMessageBox: function (data) {
        if (data.hadError && data.hadError === true && data.errorDescription) {
            global.HandleAjaxError(data);
        } else {
            var list = $('#ulServerErrors');
            list.html('');
            for (i in data.errors) {
                list.append('<li>' + data.errors[i] + '</li>');
            }
            alert(list);
        }
    },

    HideErrorsAndWarnings: function () {
        timeEntryHelper.HideErrors();
        timeEntryHelper.HideWarnings();
    },

    HideErrors: function () {
        $('#Errors').addClass('hide-h');
        $('#Errors').hide();
    },

    HideWarnings: function () {
        $('#Warnings').addClass('hide-h');
        $('#Warnings').hide();
    }
};