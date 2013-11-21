var approvalWindow = {

    approvalModel: null,

    SetupApprovalWindow: function () {
        var window = $("#approvalWindow");

        var onClose = function () {
        };

        $('#dialogCancelButton').click(function () {
            window.data("kendoWindow").close();
        });

        $('#dialogSubmitButton').click(function () {
            approvalWindow.SubmitTime();
            window.data("kendoWindow").close();
        });

        if (!window.data("kendoWindow")) {
            window.kendoWindow({
                //width: $('#body').width(),
                width: "564px",
                title: "Approve Time",
                modal: true,
                visible: false,
                close: onClose,
                activate: function() {
                   $('#dialogSubmitButton').focus();
                }
            });
        }
    },

    Open: function (approvalModel) {
        approvalWindow.approvalModel = approvalModel;
        
        var window = $("#approvalWindow");

        var bodyOffset = $('#body').offset();
        var bottomActionMenuOffset = $('#bottomActionMenu').offset();
        window.data("kendoWindow").element.parent().css({ left: bodyOffset.left, top: bodyOffset.top, height: bottomActionMenuOffset.top - bodyOffset.top - 32 });

        window.data("kendoWindow").open();
        approvalWindow.SetHeader();
        approvalWindow.CreateEmployeeGrid();
    },
    
    SetHeader: function () {
        var date = $.datepicker.parseDate('mm/dd/yy', approvalWindow.approvalModel.EntryDate);
        var dateHeaderText = $.datepicker.formatDate('DD, MM, d, yy', date);
        $("#approvalHeader").html("Approve Time - " + dateHeaderText);
    },

    SubmitTime: function () {
        $.ajax({
            url: global.GetBaseUrl() + "/TimeReviewJob/Approve",
            type: 'POST',
            data: global.AddAntiForgeryToken({ json: JSON.stringify(approvalWindow.approvalModel) }),
            success: function (data) {
                if (data.hadError && data.hadError === true) {
                    timeEntryHelper.ShowErrorsAndWarnings(data);
                } else {
                    timeEntryHelper.HideErrorsAndWarnings();
                    masterGrid.UpdateGrid();
                }
            },
            error: function (jqXhr, textStatus, errorThrown) {
                alert('Error approving timecards: ' + errorThrown);
            }
        });
    },

    CreateEmployeeGrid: function () {
        //Make sure starting with empty grid section
        $("#kEmployeeGrid").html('');

        //Create kendo datasource
        var dataSource = new kendo.data.DataSource({
            data: approvalWindow.approvalModel.Models,
            autoSync: true,
            schema: {
                model: {
                    id: "EmployeeUserId",
                    fields: {
                        EmployeeUserId: { editable: false, type: "string" },
                        HoursTotal: { editable: false, type: "number" }
                    }
                }
            },
            aggregate: masterGrid.GetAggregateFields(approvalWindow.approvalModel.Models[0])
        });

        //Create grid columns
        var columns = [
            {
                field: "EmployeeName",
                title: "Employee"
            },
            {
                field: "HoursTotal",
                title: "Hours",
                width: 100,
                attributes: { style: "text-align:right;" },
                headerAttributes: { style: "text-align:right;" },
                footerAttributes: { style: "text-align:right;" },
                footerTemplate: "<b>#=sum#</b>"
            }
        ];

        //Create grid
        $("#kEmployeeGrid").kendoGrid({
            dataSource: dataSource,
            scrollable: true,
            resizable: true,
            sortable: true,
            editable: false,
            columns: columns
        });
    }
};