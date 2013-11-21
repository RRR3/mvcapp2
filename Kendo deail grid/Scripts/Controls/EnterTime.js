$(function () {
    enterTime.SetupPage();
});

var enterTime = {
    Projects: [],
    Subjobs: [],
    CostCodes: [],
    PayTypes:[],
    Employees: [],
    
    SetupPage: function() {
        timeEntryHelper.HideErrorsAndWarnings();
        enterTime.CreateFilters();
        enterTime.RenderGrid();
        dummyWidget.SetBottomActionBar(enterTime.ActionBar);
    },
    
    CreateFilters: function() {
        //configure dayAndWeekSelectionMenu
        $(dayAndWeekSelectionMenu).bind('onPeriodSelectionChanged onDateSelectionChanged onPreviousDateButtonClicked onNextDateButtonClicked', function (e, eventArgs) {
            //update grid
        });
    },

    ActionBar: [
        {
            name: "Approve",
            actionClass: "sca-icon-actionbar sca-icon-assign",
            action: function () {
                //code here
            }
        }
    ],
    
    ShowActionBar: function (show) {
        if (show == true) {
            dummyWidget.ShowBottomActionBar(true);
        } else {
            dummyWidget.ShowBottomActionBar(false);
        }
    },
    
    RenderGrid: function() {
        var grid = new TimeEntryGrid({
            container: $('#gridArea'),
            data: timeDetailModel,
            config: timeDetailModel.Options,
            employees: null,
            projects: null,
            subJobs: null,
            costCodes: null,
            endpoint: enterTime.GetTimeEntryWorkFlowBaseUrl() + "/UpdateTimeEntries"
        });
        grid.Load();
    },
    
    GetTimeEntryWorkFlowBaseUrl: function() {
        return global.GetBaseUrl() + "TimeEntryWorkflow/";
    }
};