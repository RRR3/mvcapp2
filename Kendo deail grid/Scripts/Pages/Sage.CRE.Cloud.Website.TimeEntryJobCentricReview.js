$(function () {
    jobCentricReviewPage.SetupPage();
});


var jobCentricReviewPage = {

    // page variables
    FirstCostCodeColumnIndex: 6,
    NumberOfCostCodeColumnsVisible: 4,
    ColumnsAreLocked: false,

    SetupPage: function () {
        timeEntryHelper.HideErrorsAndWarnings();
        jobCentricReviewPage.CreateFilters();
        costCodeWindow.SetupCostCodeWindow();
        notesWindow.SetupNotesWindow();
        masterGrid.CreateAndPopulateGrid();
        costCodeWindow.CreateCostCodeGrid();
        dummyWidget.SetBottomActionBar(jobCentricReviewPage.ActionBar);
    },

    CreateFilters: function () {

        //configure dayAndWeekSelectionMenu
        $(dayAndWeekSelectionMenu).bind('onPeriodSelectionChanged onDateSelectionChanged onPreviousDateButtonClicked onNextDateButtonClicked', function (e, eventArgs) {
            masterGrid.UpdateGrid();
        });
        //Set date to JCM FilterDate
        dayAndWeekSelectionMenu.SetInitialDate(jobCentricModel.FilterDate);

        //Sub-job filter change handler
        $(subJobSelector).bind('onSubJobSelectionChanged', function (e, eventArgs) {
            jobCentricReviewPage.ColumnsAreLocked = false;
            masterGrid.UpdateGrid();
        });

        //Populate the sub-job filter control
        if (jobCentricModel.HasSubJobs) {
            subJobSelector.PopulateList(jobCentricModel.CurrentProject.ProjectSubJobs);
            subJobSelector.Show();
        }

        //add click event handlers for next/prev cost codes
        $('#prevPageCostCodes').live('click', function (e) {
            jobCentricReviewPage.NavigatePrevCostCode();
        });
        $('#nextPageCostCodes').live('click', function (e) {
            jobCentricReviewPage.NavigateNextCostCode();
        });

        $("#lockColumnsCheckbox").change(function () {
            jobCentricReviewPage.ColumnsAreLocked = this.checked;
        });
    },

    PrepareForSubJobs: function () {
        //Prepare for sub-jobs
        if (jobCentricModel.HasSubJobs) {
            //Update ProjectCostCodes array: set SubjobId to empty guid instead of "".  
            //This is needed for the cascading kendo combo boxes.
            //   Subjob combo subjobid must match costcode combo cost code subjobid
            $.grep(jobCentricModel.CurrentProject.ProjectCostCodes, function (e) {
                if (e.SubjobId === "") {
                    e.SubjobId = timeEntryHelper.GetSubjobNoneId();
                }
            });
        }
    },
    // main page
    EnableDisableFiltersAndSettings: function (skipEmployeeDataSource) {

        var pendingChanges = false;
        // skip for pending changes in a very specific case. See sync method in the detail grid
        if (typeof (skipEmployeeDataSource) !== 'undefined') {
            pendingChanges = masterGrid.AreChangesPending(skipEmployeeDataSource);
        }
        else {
            pendingChanges = masterGrid.AreChangesPending();
        }
        if (pendingChanges === true) {
            $("#costCodesButton").attr('disabled', true).addClass('k-state-disabled');
            dayAndWeekSelectionMenu.Disable();
            subJobSelector.Disable();
            $("#prevPageCostCodes").attr('disabled', true).addClass('k-state-disabled');
            $("#nextPageCostCodes").attr('disabled', true).addClass('k-state-disabled');
        }
        else {
            $('#costCodesButton').attr('disabled', false).removeClass('k-state-disabled');
            dayAndWeekSelectionMenu.Enable();
            subJobSelector.Enable();
            jobCentricReviewPage.SetNavigateCostCodesButtonStates();
        }
    },

    SetNavigateCostCodesButtonStates: function () {
        var reviewGrid = $("#jobCentricReviewGridArea").data("kendoGrid");

        //determine last visible column
        var lastVisibleColumnIndex = jobCentricReviewPage.LastVisibleGridColumn();

        //if more cost codes to view, enable next cost codes button
        if (jobCentricReviewPage.MoreCostCodesToView()) {
            $('#nextPageCostCodes').attr('disabled', false).removeClass('k-state-disabled');
        }
        else {
            $("#nextPageCostCodes").attr('disabled', true).addClass('k-state-disabled');
        }

        //if previous cost codes to view, enable previous cost codes button
        if (lastVisibleColumnIndex >= jobCentricReviewPage.FirstCostCodeColumnIndex + jobCentricReviewPage.NumberOfCostCodeColumnsVisible) {
            $('#prevPageCostCodes').attr('disabled', false).removeClass('k-state-disabled');
        }
        else {
            $("#prevPageCostCodes").attr('disabled', true).addClass('k-state-disabled');
        }
    },

    // main page
    //Handler for Navigate Next Cost Code
    NavigateNextCostCode: function () {
        //Navigate forward 1 cost code

        var reviewGrid = $("#jobCentricReviewGridArea").data("kendoGrid");

        //determine last visible column
        var lastVisibleColumnIndex = jobCentricReviewPage.LastVisibleGridColumn();

        if (jobCentricReviewPage.MoreCostCodesToView()) {
            var colIndexToHide = lastVisibleColumnIndex - jobCentricReviewPage.NumberOfCostCodeColumnsVisible + 1;
            var colIndexToShow = lastVisibleColumnIndex + 1;
            reviewGrid.hideColumn(colIndexToHide);
            reviewGrid.showColumn(colIndexToShow);
            jobCentricReviewPage.SetNavigateCostCodesButtonStates();

        }
    },

    // main page
    //Handler for Navigate prev Cost Code
    NavigatePrevCostCode: function () {
        //Navigate back 1 cost code
        var reviewGrid = $("#jobCentricReviewGridArea").data("kendoGrid");

        //determine last visible column
        var lastVisibleColumnIndex = jobCentricReviewPage.LastVisibleGridColumn();

        //if previous cost code
        if (lastVisibleColumnIndex >= jobCentricReviewPage.FirstCostCodeColumnIndex + jobCentricReviewPage.NumberOfCostCodeColumnsVisible) {
            var colIndexToHide = lastVisibleColumnIndex;
            var colIndexToShow = lastVisibleColumnIndex - jobCentricReviewPage.NumberOfCostCodeColumnsVisible;
            reviewGrid.hideColumn(colIndexToHide);
            reviewGrid.showColumn(colIndexToShow);
            jobCentricReviewPage.SetNavigateCostCodesButtonStates();
        }
    },

    // main page
    MoreCostCodesToView: function () {
        var colIndex = jobCentricReviewPage.LastVisibleGridColumn(); //grid column index of last visible cc column
        var ccColNumber = colIndex - jobCentricReviewPage.FirstCostCodeColumnIndex + 1; //which cost code is being viewed,  i.e. viewing the 5th cost code

        return (ccColNumber < jobCentricReviewPage.CostColumnsToDisplayCount());
    },

    // main page
    LastVisibleGridColumn: function () {
        var reviewGrid = $("#jobCentricReviewGridArea").data("kendoGrid");

        //determine last visible column
        var lastVisibleColumn = 0;
        var columnIndex = 0;
        for (var column in reviewGrid.columns) {
            if (reviewGrid.columns[column].hidden == false && (reviewGrid.columns[column].field != "L"))
                lastVisibleColumn = columnIndex;
            columnIndex++;
        }
        return (lastVisibleColumn);
    },

    // main page
    CostColumnsToDisplayCount: function () {
        var count = 0;

        for (var costCodeInfo in jobCentricModel.CostColumnsToDisplay) {
            if (jobCentricModel.CostColumnsToDisplay[costCodeInfo].IsShown) {
                count++;
            }
        }

        return (count);
    },

    // main page
    CostCodeIsInColumnsToDisplay: function (costCodeId) {
        var returnVal = false;

        for (var costCodeInfo in jobCentricModel.CostColumnsToDisplay) {
            if (jobCentricModel.CostColumnsToDisplay[costCodeInfo].CostCodeId == costCodeId) {
                returnVal = true;
                break;
            }
        }

        return (returnVal);
    },

    ActionBar: [
        {
            name: "Approve",
            actionClass: "sca-icon-actionbar sca-icon-assign",
            action: function () {
                jobCentricReviewPage.ApproveTime();
            }
        }
    ]
    ,
    ShowActionBar: function (show) {
        if (show == true) {
            dummyWidget.ShowBottomActionBar(true);
        } else {
            dummyWidget.ShowBottomActionBar(false);
        }

    },

    ApproveTime: function () {
        var approvalModel = new Object;
        approvalModel.ApprovedBySupervisor = jobCentricModel.IsSupervisorReview;
        approvalModel.EntryDate = dayAndWeekSelectionMenu.DateSelected();
        var employeesToApprove = [];
        var grid = $("#jobCentricReviewGridArea").data("kendoGrid");
        var dsrc = grid.dataSource.data();
        $.each(dsrc, function () {
            if (this.IsSelectedForApproval == true) {
                var employeeToApproveModel = new Object;
                employeeToApproveModel.EmployeeUserId = this.EmpId;
                employeeToApproveModel.EmployeeName = this.Name;
                employeeToApproveModel.EntryDate = dayAndWeekSelectionMenu.DateSelected();
                employeeToApproveModel.HoursTotal = this.HoursTotal;
                employeesToApprove.push(employeeToApproveModel);
            }
        });
        approvalModel.Models = employeesToApprove;

        //        jobCentricReviewPage.DisplayApprovalWindow(approvalModel);
        jobCentricReviewPage.Approve(approvalModel);
    },
    Approve: function (approvalModel) {
        $.ajax({
            url: global.GetBaseUrl() + "/TimeReviewJob/Approve",
            type: 'POST',
            data: global.AddAntiForgeryToken({ json: JSON.stringify(approvalModel) }),
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
    }
};


var notesWindow = {

    notesModel: null,

    SetupNotesWindow: function () {
        $("#notesWindow").dialog({
            autoOpen: false,
            title: "Edit Note",
            width: 300,
            position: global.dialogPosition,
            modal: true,
            closeOnEscape: true,
            buttons: [
            {
                text: "Save",
                id: "dlgNoteSave",
                click: function () {

                    $(this).dialog("close");
                    notesWindow.EditNote();
                }
            },
            {
                text: "Cancel",
                id: "dlgNoteCancel",
                click: function () {

                    $(this).dialog("close");
                    notesWindow.EditNote();
                }
            }
        ]
        });
       
    },

    EditNote: function () {
        notesWindow.notesModel.Note = $("#entryNotes").val();
        notesWindow.notesModel.EditCallback(notesWindow.notesModel);
    }


};