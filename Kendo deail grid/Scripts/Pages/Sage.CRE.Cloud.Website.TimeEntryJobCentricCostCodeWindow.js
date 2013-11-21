var costCodeWindow = {

    SetupCostCodeWindow: function () {
        var isFirstTimeOpen = true;
        var windowWidthText = (jobCentricModel.CurrentProject.ProjectSubJobs.length > 0) ? "520px" : "380px";
        var windowWidth = (jobCentricModel.CurrentProject.ProjectSubJobs.length > 0) ? 520 : 380;

        var ccWindow = $("#tableSettingsWindow"),
        ccButton = $("#costCodesButton").bind("click", function () {
            if (isFirstTimeOpen) {
                var bodyOffset = $('#body').offset();
                ccWindow.data("kendoWindow").element.parent().css({ left: bodyOffset.left + $('#body').width() - windowWidth, top: bodyOffset.top });
                isFirstTimeOpen = false;
            }
            ccWindow.data("kendoWindow").open();
            ccButton.hide();
        });

        var onClose = function () {
            ccButton.show();
        };



        if (!ccWindow.data("kendoWindow")) {
            ccWindow.kendoWindow({
                width: windowWidthText,
                height: "526px",
                title: "Cost Code Columns",
                visible: false,
                close: onClose
            });
        }

        costCodeWindow.CreateNumberOfCostCodeColumnsVisibleDropdown();
    },

    CreateCostCodeGrid: function () {
        //Make sure starting with empty grid section
        $("#kCostCodeGrid").html('');

        //Create kendo datasource
        var dataSource = new kendo.data.DataSource({
            data: jobCentricModel.CostColumnsToDisplay,
            autoSync: true,
            schema: {
                model: {
                    id: "CostCodeId",
                    fields: {
                        CostCodeId: { editable: false, type: "string" },
                        CostCodeCode: { editable: false, type: "string" },
                        CostCodeName: { editable: false, type: "string" },
                        Name: { editable: false, type: "string" },
                        CostCodeDescription: { editable: false, type: "string" },
                        IsShown: { type: "boolean", editable: true },
                        HasTimePosted: { type: "boolean", editable: false },
                        SubJobId: { editable: false, type: "string" },
                        SubJobName: { editable: false, type: "string" }
                    }
                }
            }
        });

        //Create grid columns
        var columns = [];
        columns.push(
            {
                field: "IsShown",
                title: " ",
                template: "<input type='checkbox' #= IsShown ? checked='checked':'' # class='chkbx'/>",
                width: "25px"
            });
        if (jobCentricModel.CurrentProject.ProjectSubJobs.length > 0) {

            columns.push({
                field: "SubJobDescription",
                title: timeEntryHelper.GetSubjobDesc(),
                width: 130
            });
        }
        columns.push({
            field: "CostCodeCode",
            title: "Cost Code",
            width: 100
        });
        columns.push({
            field: "CostCodeDescription",
            title: "Name"
        });
        columns.push({
            field: "HasTimePosted",
            title: " ",
            template: "#= costCodeWindow.HasTimePostedColumnTemplate(data) #",
            width: "30px"
        });
        columns.push({ command: "destroy", title: " ", width: "40px" });

        //Create cost code grid
        $("#kCostCodeGrid").kendoGrid({
            dataSource: dataSource,
            //        resizable: true,
            scrollable: true,
            resizable: true,
            sortable: true,
            editable: { confirmation: false },
            columns: columns,
            remove: function (e) {
                for (var i = 0; i < jobCentricModel.CostColumnsToDisplay.length; i++) {
                    if (jobCentricModel.CostColumnsToDisplay[i].CostCodeId === e.model.CostCodeId) {
                        //add the cost code back to the the cost code combo
                        var costCodeCombo = $("#costCode").data("kendoComboBox");
                        var ds = costCodeCombo.dataSource;
                        ds._filter.filters = $.grep(ds._filter.filters, function (o, i) { return o.name == e.model.CostCodeId; }, true);
                        ds.read();
                        //remove the cost code from the grid
                        jobCentricModel.CostColumnsToDisplay.splice(i, 1);
                        masterGrid.CreateGridWithNewColumns();
                        break;
                    }
                }
            },
            dataBound: function (e) {
                if ($('.k-grid-delete').length != 0) {
                    var innerContent = $(".k-grid-delete").html().replace("Delete", "");
                    $(".k-grid-delete").html(innerContent);
                }
            },
            edit: function (p) {
                var indexCell = p.container.context.cellIndex;
                // We want to prevent edit of all columns in cost code grid.
                this.closeCell();
            }
        });

        //Cost Code Grid on checkbox click handler
        $('#kCostCodeGrid').on('click', '.chkbx', function () {
            var checked = $(this).is(':checked');
            var grid = $('#kCostCodeGrid').data().kendoGrid;
            var dataItem = grid.dataItem($(this).closest('tr'));
            if (dataItem != undefined) {
                dataItem.set('IsShown', checked);
                masterGrid.CreateGridWithNewColumns();
            }
        });

        //Clean up previous sub job combo
        var subJobCombo = $("#subJob").data("kendoComboBox");
        if (subJobCombo != undefined) {
            subJobCombo.destroy();
            $("#subJob").html('');
        }

        //Create sub job combo control
        //Hide sub-job controls if job does not have sub-jobs
        if (jobCentricModel.HasSubJobs) {
            //create sub-job combo
            $('#addSubJob').show();
            $('#costCodeLabel').show();
            CreateKendoDropDown("subJob", "JobDescription", "SubjobId", true, "Select Sub-job...", jobCentricModel.CurrentProject.ProjectSubJobs);
        } else {
            $('#addSubJob').hide();
            $('#costCodeLabel').hide();
        }

        //Clean up previous cost code combo
        var costCodeCombo = $("#costCode").data("kendoComboBox");
        if (costCodeCombo != undefined) {
            costCodeCombo.destroy();
            $("#costCode").html('');
        }

        //create cost code combo
        CreateKendoDropDown("costCode", "CostCodeName", "CostCodeId", true, "Select Cost Code...", jobCentricModel.CurrentProject.ProjectCostCodes, "subJob");
        costCodeCombo = $("#costCode").data("kendoComboBox");

        //Set initial sub-job value
        subJobCombo = $("#subJob").data("kendoComboBox");
        if (subJobCombo !== undefined) {

            subJobCombo.select(0);
        }

        //Filter cost code combo: filter out already selected cost codes
        var ds = costCodeCombo.dataSource;
        //        ds._filter = { logic: "and", filters: [] };
        ds._filter = { logic: "and", filters: ((ds._filter === undefined) ? [] : ds._filter.filters) };

        $.each(jobCentricModel.CostColumnsToDisplay, function () {
            ds._filter.filters.push({
                field: "CostCodeId",
                operator: "neq",
                value: this.CostCodeId,
                name: this.CostCodeId
            });

            ds.read();
        });

        //cost code combo - change event
        costCodeCombo.bind("change", function (e) {
            var costCodeDropDown = $("#costCode").data("kendoComboBox");
            var ds = costCodeDropDown.dataSource;
            if (costCodeDropDown.value() && (e.sender.selectedIndex != -1)) {
                var itemSelected = costCodeDropDown.dataSource.view()[e.sender.selectedIndex];
                if (itemSelected != undefined) {
                    var subJob = $.grep(jobCentricModel.CurrentProject.ProjectSubJobs, function (e) { return e.SubjobId == itemSelected.SubjobId; });
                    //add selected cost code to the CostColumnsToDisplay list
                    jobCentricModel.CostColumnsToDisplay.push({
                        "CostCodeId": itemSelected.CostCodeId,
                        "CostCodeName": itemSelected.Description,
                        "CostCodeCode": itemSelected.BackOfficeUniqueIdentifier,
                        "SubJobId": itemSelected.SubjobId,
                        "SubJobName": ((subJob.length > 0) && (subJob[0].SubjobId != "0")) ? subJob[0].JobName : "",
                        "SubJobDescription": ((subJob.length > 0) && (subJob[0].SubjobId != "0")) ? subJob[0].JobDescription : "",
                        "Name": itemSelected.Name,
                        "CostCodeDescription": itemSelected.Description,
                        "IsShown": true,
                        "HasTimePosted": false
                    });

                    //refresh cost codes grid
                    var grid = $('#kCostCodeGrid').data("kendoGrid");
                    grid.dataSource.read();

                    //remove selected cost code from cost code combo (filter it out)
                    e.sender.dataSource._filter.filters.push({
                        field: "CostCodeId",
                        operator: "neq",
                        value: costCodeDropDown.value(),
                        name: costCodeDropDown.value()
                    });
                    e.sender.dataSource.read();

                    //set the cost code drop down value to blank
                    costCodeDropDown.value("");
                }

                //Redisplay main job centric grid
                masterGrid.CreateGridWithNewColumns();
            } else {
                //invalid value entered, simply blank it out
                costCodeDropDown.value("");
            }
        });
    },

    // cc window
    CreateNumberOfCostCodeColumnsVisibleDropdown: function () {
        var options = [
        { "value": 2, "text": "2" },
        { "value": 3, "text": "3" },
        { "value": 4, "text": "4" },
        { "value": 5, "text": "5" },
        { "value": 6, "text": "6" },
        { "value": 7, "text": "7" },
        { "value": 8, "text": "8" }       
    ];

        //Create Number of columns dropdown
        $("#numberOfVisibleColumns").kendoDropDownList({
            dataTextField: "text",
            dataValueField: "value",
            dataSource: options,
            height: "100px",
            index: 0,
            change: function (e) {
                jobCentricReviewPage.NumberOfCostCodeColumnsVisible = options[e.sender.selectedIndex].value;
                //Redisplay main job centric grid
                masterGrid.CreateGridWithNewColumns();
            }
        });

        var numVisibleColumns = $("#numberOfVisibleColumns").data("kendoDropDownList");

        numVisibleColumns.select(jobCentricReviewPage.NumberOfCostCodeColumnsVisible - 2);
    },

    HasTimePostedColumnTemplate: function (model) {

        if (model.HasTimePosted) {
            return "<span alt='Has time' class='ui-icon ui-icon-clock'/>";
        } else {
            return "";
        }
    }
};