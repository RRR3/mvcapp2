var masterGrid = {
    lastEditedRow: -1,
    lastEditedCell: -1,
    lastPageSize: 20,
    lastPage: 1,

    // main grid
    CreateAndPopulateGrid: function () {
        //Prepare for sub-jobs
        jobCentricReviewPage.PrepareForSubJobs();

        //Make sure starting with empty grid section
        $("#jobCentricReviewGridArea").html('');

        //Create kendo dataset
        var dataset = masterGrid.GetDataset();

        //Create kendo datasource
        var dataSource = masterGrid.CreateKendoDatasource(dataset);

        //Create grid columns
        var columns = masterGrid.CreateGridColumns();

        //Create grid
        masterGrid.CreateGrid(dataSource, columns);

        jobCentricReviewPage.ShowActionBar(false);
    },

    CreateGridWithNewColumns: function () {
        var dataset = masterGrid.GetModifiedDataset();
        masterGrid.lastPageSize = ($("#jobCentricReviewGridArea").data("kendoGrid")).dataSource.pageSize();
        masterGrid.lastPage = ($("#jobCentricReviewGridArea").data("kendoGrid")).dataSource.page();
        //Make sure starting with empty grid section
        $("#jobCentricReviewGridArea").html('');
        var dataSource = masterGrid.CreateKendoDatasource(dataset);
        var columns = masterGrid.CreateGridColumns();
        masterGrid.CreateGrid(dataSource, columns);
    },

    GetModifiedDataset: function () {
        var retVal = [];

        var grid = $("#jobCentricReviewGridArea").data("kendoGrid");
        var data = grid.dataSource.data();

        $.each(data, function () {
            var rowSeed = {
                EmpId: this.EmpId,
                BackOfficeId: this.BackOfficeId,
                IsApprovable: this.IsApprovable,
                IsSupervisorApproved: this.IsSupervisorApproved,
                IsProjectManagerApproved: this.IsProjectManagerApproved,
                IsSelectedForApproval: this.IsSelectedForApproval,
                Name: this.Name,
                Note: this.Note,
                HoursTotal: this.HoursTotal,
                Entries: [],
                Template: this.Template
            };

            $.each(this.Entries, function () {
                var lineItemEntry = {
                    CostCodeId: this.CostCodeId,
                    CostCodeName: this.CostCodeName,
                    DoubleEntryId: this.DoubleEntryId,
                    DoubleHours: this.DoubleHours,
                    DoubleMinutes: this.DoubleMinutes,
                    DoubleTimeInHours: this.DoubleTimeInHours,
                    DoubleTimeInMinutes: this.DoubleTimeInMinutes,
                    OvertimeEntryId: this.OvertimeEntryId,
                    OvertimeHours: this.OvertimeHours,
                    OvertimeMinutes: this.OvertimeMinutes,
                    OverTimeInHours: this.OverTimeInHours,
                    OverTimeInMinutes: this.OverTimeInMinutes,
                    RegularEntryId: this.RegularEntryId,
                    RegularHours: this.RegularHours,
                    RegularMinutes: this.RegularMinutes,
                    RegularTimeInHours: this.RegularTimeInHours,
                    RegularTimeInMinutes: this.RegularTimeInMinutes,
                    EmployeeUserId: this.EmployeeUserId,
                    EntryDate: this.EntryDate,
                    EntryId: this.EntryId,
                    IsEntryInvalid: this.IsEntryInvalid,
                    IsLockedFromModification: this.IsLockedFromModification,
                    ItemStatus: this.ItemStatus,
                    ModifiedByUserId: this.ModifiedByUserId,
                    Note: this.Note,
                    ProjectId: this.ProjectId,
                    SubJobId: this.SubJobId,
                    SubJobName: this.SubJobName,
                    TotalTimeInHours: this.TotalTimeInHours,
                    TotalTimeInMinutes: this.TotalTimeInMinutes
                };
                rowSeed.Entries.push(lineItemEntry);
            });
            
            //add the new cost code properties
            var rowViewTotal = 0;
            var ccColNumber = 1;
            for (var costCodeInfo in jobCentricModel.CostColumnsToDisplay) {
                if (jobCentricModel.CostColumnsToDisplay[costCodeInfo].IsShown) {
                    rowSeed["CC_" + ccColNumber + "Id"] = jobCentricModel.CostColumnsToDisplay[costCodeInfo].CostCodeId;
                    rowSeed["CC_" + ccColNumber + "TotalHours"] = 0;
                    for (var k in rowSeed.Entries) {
                        if (jobCentricModel.CostColumnsToDisplay[costCodeInfo].CostCodeId == rowSeed.Entries[k].CostCodeId) {
                            rowSeed["CC_" + ccColNumber + "TotalHours"] = rowSeed.Entries[k].TotalTimeInHours;
                            rowViewTotal += rowSeed.Entries[k].TotalTimeInHours;
                        }
                    }
                    ccColNumber++;
                }
            }
            rowSeed["ViewTotal"] = rowViewTotal;
            retVal.push(rowSeed);
        });

        return (retVal);
    },

    // main grid
    GetDataset: function () {
        var retVal = [];

        for (var i in jobCentricModel.EmployeeTimeCards) {

            var rowSeed = {
                EmpId: jobCentricModel.EmployeeTimeCards[i].Employee.UserId,
                BackOfficeId: jobCentricModel.EmployeeTimeCards[i].Employee.BackOfficeId,
                IsApprovable: jobCentricModel.EmployeeTimeCards[i].IsApprovable,
                IsSupervisorApproved: jobCentricModel.EmployeeTimeCards[i].IsSupervisorApproved,
                IsProjectManagerApproved: jobCentricModel.EmployeeTimeCards[i].IsProjectManagerApproved,
                IsSelectedForApproval: false,
                Name: jobCentricModel.EmployeeTimeCards[i].Employee.FullName,
                Note: jobCentricModel.EmployeeTimeCards[i].Note,
                HoursTotal: jobCentricModel.EmployeeTimeCards[i].TotalHours,
                Entries: jobCentricModel.EmployeeTimeCards[i].HourlyEntries,
                Template: jobCentricModel.EmployeeTimeCards[i].Template
            };

            //Add displayed cost code columns
            var rowViewTotal = 0;
            var ccColNumber = 1;
            for (var costCodeInfo in jobCentricModel.CostColumnsToDisplay) {
                if (jobCentricModel.CostColumnsToDisplay[costCodeInfo].IsShown) {
                    rowSeed["CC_" + ccColNumber + "Id"] = jobCentricModel.CostColumnsToDisplay[costCodeInfo].CostCodeId;
                    rowSeed["CC_" + ccColNumber + "TotalHours"] = 0;
                    for (var k in jobCentricModel.EmployeeTimeCards[i].HourlyEntries) {
                        if (jobCentricModel.CostColumnsToDisplay[costCodeInfo].CostCodeId == jobCentricModel.EmployeeTimeCards[i].HourlyEntries[k].CostCodeId) {
                            rowSeed["CC_" + ccColNumber + "TotalHours"] = jobCentricModel.EmployeeTimeCards[i].HourlyEntries[k].TotalTimeInHours;
                            rowViewTotal += jobCentricModel.EmployeeTimeCards[i].HourlyEntries[k].TotalTimeInHours;
                        }
                    }
                    ccColNumber++;
                }
            }

            rowSeed["ViewTotal"] = rowViewTotal;
            retVal.push(rowSeed);
        }
        return retVal;
    },

    // main grid
    CreateKendoDatasource: function (dataset) {
        var datasource = new kendo.data.DataSource({
            pageSize: masterGrid.lastPageSize,
            page: masterGrid.lastPage,
            data: dataset,
            schema: {
                model: {
                    id: "EmpId",
                    fields: KendoHelper.CreateEditablePropertySequenceForDataSource(dataset[0])
                }
            },
            aggregate: masterGrid.GetAggregateFields(dataset[0]),
            autoSync: true
        });
        return datasource;
    },

    // main grid
    CreateGridColumns: function () {
        //Fixed columns, Name, Total hours and Viewed Hours

        var isDayView = dayAndWeekSelectionMenu.IsDayView();

        var cols = [
            {
                field: "IsSelectedForApproval",
                width: "50px",
                template: "# if (IsApprovable == true) { #" + "<input type='checkbox' #= IsSelectedForApproval ? checked='checked':'' # class='approveEntry'/>" + " #} else { #" + "#= masterGrid.SelectedForApprovalTemplate(data) #" + "# } #",
                headerTemplate: "<input type='checkbox' class='selectAllCheckbox' title='Select All'/>",
                filterable: false,
                sortable: false,
                menu: false,
                hidden: (isDayView) ? false : true,
                attributes: {
                    style: "padding-left: 8px;" //needed to align row checkbox with column header checkbox
                },
                footerTemplate: (isDayView) ? "<b>Total</b>" : "",
                footerAttributes: { style: "text-align:right;" }
            },
             {
                 field: "BackOfficeId",
                 title: "ID",
                 width: "70px",
                 template: "#= BackOfficeId #",
                 hidden: false,
                 menu: false,
                 footerTemplate: (isDayView) ? "" : "<b>Total</b>",
                 footerAttributes: { style: "text-align:right;" }
             },
            {
                field: "Name",
                title: "Employee",
                width: "150px",
                template: "#= Name #",
                hidden: false,
                menu: false
            },
            {
                field: "Note",
                title: "Notes",
                width: "40px",
                template: "#= detailGridSection.NoteColumnTemplate(data) #",
                editor: masterGrid.NoteEditor,
                filterable: false,
                hidden: (isDayView) ? false : true,
                menu: false
            },
            {
                field: "HoursTotal",
                title: "Total Hours",
                width: "60px",
                template: "#= masterGrid.HoursTotalTemplate(data) #",
                //attributes: { style: "text-align:right;" },
                footerTemplate: "<b>#=sum#</b>",
                filterable: false,
                hidden: false,
                menu: false
            },
            {
                field: "ViewTotal",
                title: "View Hours",
                width: "60px",
                template: "#= ViewTotal #",
                footerTemplate: "<b>#=sum#</b>",
                filterable: false,
                hidden: false,
                menu: false,
                attributes: {
                    style: "border-right-color:green; border-right-width: 2px;"
                },
                headerAttributes: {
                    style: "border-right-color:green; border-right-width: 2px;"
                },
                footerAttributes: {
                    style: "border-right-color:green; border-right-width: 2px;"
                }
            }
        ];

        //Cost Code Columns
        var ccColNumber = 1;
        for (var costCodeInfo in jobCentricModel.CostColumnsToDisplay) {
            if (jobCentricModel.CostColumnsToDisplay[costCodeInfo].IsShown) {
                var fieldVal = "CC_" + ccColNumber + "TotalHours";
                var hidden = (ccColNumber > jobCentricReviewPage.NumberOfCostCodeColumnsVisible);
                var headerBackgroundColor = masterGrid.GetColumnHeaderBackgroundColor(ccColNumber);
                cols.push({
                    field: fieldVal,
                    title: jobCentricModel.CostColumnsToDisplay[costCodeInfo].SubJobDescription + jobCentricModel.CostColumnsToDisplay[costCodeInfo].CostCodeDescription,
                    template: "#= " + fieldVal + " #",
                    //attributes: { style: "text-align:right;" },
                    width: "130px",
                    filterable: false,
                    editor: detailGridSection.HoursEditor,
                    format: "{0:n2}",
                    hidden: hidden,
                    menu: false,
                    //                    headerAttributes: {
                    //                        style: "background:" + headerBackgroundColor + ";"
                    //                    },
                    headerTemplate:
                        ((jobCentricModel.HasSubJobs)
                            ? ((jobCentricModel.CostColumnsToDisplay[costCodeInfo].SubJobDescription == null)
                                ? " "
                                : jobCentricModel.CostColumnsToDisplay[costCodeInfo].SubJobDescription + "<p style='font-weight: normal;'><hr width = '80%' align='Left'></p>")
                    //: "<p style='font-weight: normal';>" + jobCentricModel.CostColumnsToDisplay[costCodeInfo].SubJobDescription + "</p>")

                            : "")
                        + jobCentricModel.CostColumnsToDisplay[costCodeInfo].CostCodeCode + "<br/>"
                        + jobCentricModel.CostColumnsToDisplay[costCodeInfo].CostCodeDescription,
                    footerTemplate: "<b>#=sum#</b>",
                    costCodeId: jobCentricModel.CostColumnsToDisplay[costCodeInfo].CostCodeId
                });
                ccColNumber++;
            }
        }

        if (jobCentricReviewPage.CostColumnsToDisplayCount() > jobCentricReviewPage.NumberOfCostCodeColumnsVisible) {
            var spacerColumnTitle = "...";
            //$('#navigateCostCodes').show();
        }
        else {
            spacerColumnTitle = " ";
            //$('#navigateCostCodes').hide();
        }

        //Add spacer column at end of grid
        cols.push({
            field: "L",
            title: spacerColumnTitle,
            hidden: false,
            menu: false,
            sortable: false,
            filterable: false
        });
        return (cols);
    },

    SelectedForApprovalTemplate: function (model) {
        if (model.IsProjectManagerApproved) {
            var contents = "<span alt='Approved' class='ui-icon imgOK' title='" + $('#ProjectManagerApproved').text() + "'/>";
            return contents;
        }
        else if ((model.IsSupervisorApproved) && (jobCentricModel.IsSupervisorReview == true)) {
            contents = "<span alt='Approved' class='ui-icon imgOK' title='" + $('#SupervisorApproved').text() + "'/>";
            return contents;
        }

        else {
            return "<span alt='Locked' class='ui-icon ui-icon-locked' title='Read Only'/>";
        }
    },

    HoursTotalTemplate: function (model) {
        var contents = "<span alt='Hours total'>" + model.HoursTotal + "</span>";
        if (dayAndWeekSelectionMenu.IsDayView()) {
            if ((model.HoursTotal * 60) > model.Template.TimeEntryWorkAmountPolicy.MaximumDailyMinutes && model.Template.TimeEntryWorkAmountPolicy.MaximumDailyMinutes !== 0) {
                var dispTextDay = jQuery.validator.format($('#TimeEntryPolicyDayMaxTime').text(),
                Math.floor(model.Template.TimeEntryWorkAmountPolicy.MaximumDailyMinutes / 60), model.Template.TimeEntryWorkAmountPolicy.MaximumDailyMinutes % 60);
                contents = "<span alt='Hours total' class='warningState' title='" + dispTextDay + "'>" + model.HoursTotal + "</span>";
            }
        }
        else {
            if ((model.HoursTotal * 60) > model.Template.TimeEntryWorkAmountPolicy.MaximumWeeklyMinutes && model.Template.TimeEntryWorkAmountPolicy.MaximumWeeklyMinutes !== 0) {
                var dispTextWeek = jQuery.validator.format($('#TimeEntryPolicyWeekMaxTime').text(),
                Math.floor(model.Template.TimeEntryWorkAmountPolicy.MaximumWeeklyMinutes / 60), model.Template.TimeEntryWorkAmountPolicy.MaximumWeeklyMinutes % 60);
                contents = "<span alt='Hours total' class='warningState' title='" + dispTextWeek + "'>" + model.HoursTotal + "</span>";
            }
        }
        return contents;
    },

    // main grid
    //Gets the column header background color
    //Uses 3 colors: grid column header default, orange, lime green
    //Each page of cost code columns is assigned a color, cycling through the 3 colors above
    GetColumnHeaderBackgroundColor: function (ccColNumber) {
        var returnVal = "";

        var pageNumber = Math.ceil(ccColNumber / jobCentricReviewPage.NumberOfCostCodeColumnsVisible);

        if ((pageNumber == 2) || (((pageNumber - 2) % 3) == 0))
            returnVal = "#faac58";

        else if ((pageNumber % 3) == 0)
            returnVal = "#acfa58";

        return (returnVal);
    },

    // main grid
    CreateGrid: function (dataSource, columns) {
        var isWeekView = dayAndWeekSelectionMenu.IsWeekView();

        $("#jobCentricReviewGridArea").kendoGrid({
            dataSource: dataSource,
            reorderable: true,
            resizable: true,
            selectable: false,
            editable: true,
            filterable: true,
            columnMenu: false,
            scrollable: false,
            navigatable: true,
            detailInit: detailGridSection.DetailGridInit,
            columnHide: masterGrid.columnHideHandler,
            columnShow: masterGrid.columnShowHandler,
            sortable: {
                mode: "single",
                allowUnsort: false
            },
            pageable: {
                pageSizes: [1, 5, 10, 20, 50],
                previousNext: true
            },
            columns: columns,
            dataBinding: function (e) {

                if (masterGrid.AreChangesPending()) {
                    e.preventDefault();
                }
            },


            edit: function (p) {
                // We want to prevent edit of all columns in the master grid row except a few.
                // This is because Kendo will not update totals when programmatically set unless the field is editable.
                if (p.container !== undefined) {

                    var indexCell = p.container[0].cellIndex;
                    var columnField = p.sender.columns[p.container[0].cellIndex - 1].field;

                    // If the notes column is being edited but no entries exist for the day, prevent a new note from being created
                    if (indexCell == 3 && !masterGrid.CanEditNotes(p)) {
                        this.closeCell();
                    }
                    // If is week view or changes are pending or column other than cost code, prevent cell from being edited
                    else if (isWeekView || masterGrid.AreChangesPending() || (indexCell <= jobCentricReviewPage.FirstCostCodeColumnIndex) || (columnField === "L")) {
                        this.closeCell();
                    }
                    // If master grid does not allow direct edit, prevent cell from being edited
                    else if (!masterGrid.RegularHoursAllowDirectEdit(p)) {
                        this.closeCell();

                        //If detail grid can be edited, expand the detail grid and set focus to corresponding cost code entry regular hours cell
                        if (masterGrid.CanEditInDetailGrid(p)) {
                            //expand detail grid
                            var grid = $('#jobCentricReviewGridArea').data().kendoGrid;
                            grid.expandRow(p.container.closest("tr"));
                            //set focus to corresponding cost code entry
                            var childGridId = "#detail_" + p.model.EmpId;
                            var entry = $.grep(($(childGridId).data('kendoGrid')).dataSource._data, function (f) { return f.CostCodeId === p.sender.columns[p.container[0].cellIndex - 1].costCodeId; });
                            var rowUid = entry[0].uid;
                            var regularColumnIndex = (jobCentricModel.HasSubJobs === true) ? 5 : 4;
                            var cell = $("[data-uid='" + rowUid + "']", ($(childGridId).data('kendoGrid')).tbody).find(">td:nth-child(" + (regularColumnIndex) + ")");
                            $(childGridId).data('kendoGrid').editCell(cell);
                        }
                    }
                    //Master grid does allow direct edit, highlight text in cell, ready for edit
                    else {
                        var inputControl = p.container.find('input[name=' + columnField + ']');
                        if (inputControl != undefined) {
                            //Workaround for kendo grid bug
                            //When in master row cost code cell, after editing the hours value, if select 'Enter'
                            //Kendo default processing expands the detail grid.
                            //Enter should behave the same as Tab.
                            inputControl.keydown(function (e) {
                                if (e.keyCode === kendo.keys.ENTER) {
                                    e.stopImmediatePropagation();
                                }
                            });
                        }
                    }
                }
            },

            save: function (e) {
                lastEditedCell = e.container[0].cellIndex;
                lastEditedRow = e.container.closest("tr");

                var regTotalHrs = /CC_\d+TotalHours/;
                var newRegularHours = undefined;
                for (var property in e.values) {
                    if (property.match(regTotalHrs)) {
                        newRegularHours = e.values[property];
                        break;
                    }
                }

                if (newRegularHours !== undefined) {
                    //Update or create the detail line item with the new regular hours
                    var costCodeEntry = $.grep(e.model.Entries, function (f) { return f.CostCodeId === e.sender.columns[lastEditedCell - 1].costCodeId; });

                    if (costCodeEntry.length > 0) {
                        if (newRegularHours === null) {
                            newRegularHours = 0;
                        }
                        //modifying hours for existing time entry
                        if (costCodeEntry[0].RegularTimeInHours !== newRegularHours) {
                            //call saveChanges() to commit data so we can rollback with cancelChanges() later if there is a validation or processing error
                            $("#jobCentricReviewGridArea").data("kendoGrid").saveChanges();
                            costCodeEntry[0].RegularTimeInHours = newRegularHours;
                            if ((costCodeEntry[0].RegularTimeInHours === 0) || (costCodeEntry[0].RegularTimeInHours === null)) {
                                masterGrid.DeleteLineItem(costCodeEntry);
                            } else {
                                masterGrid.UpdateLineItem(costCodeEntry);
                            }
                        }
                    } else if ((newRegularHours !== 0) && (newRegularHours !== null)) {
                        //creating new time entry
                        //call saveChanges() to commit data so we can rollback with cancelChanges() later if there is a validation or processing error
                        $("#jobCentricReviewGridArea").data("kendoGrid").saveChanges();
                        masterGrid.CreateLineItem(e.model.EmpId, e.sender.columns[lastEditedCell - 1].costCodeId, newRegularHours);
                    }
                }
            }
        });

        //On Approval checkbox click handler
        $('#jobCentricReviewGridArea').on('click', '.approveEntry', function () {
            var checked = $(this).is(':checked');
            var grid = $('#jobCentricReviewGridArea').data().kendoGrid;
            var dataItem = grid.dataItem($(this).closest('tr'));
            if (dataItem != undefined) {
                dataItem.set('IsSelectedForApproval', checked);
                if (checked) {
                    jobCentricReviewPage.ShowActionBar(checked);
                }
                else {
                    jobCentricReviewPage.ShowActionBar(masterGrid.IsEmployeeSelectedForApproval());
                }
            }
        });

        //On Select All checkbox clicked
        $('#jobCentricReviewGridArea').on('click', '.selectAllCheckbox', function () {
            var checked = $(this).is(':checked');
            masterGrid.SelectAllForApproval(checked);
        });

        jobCentricReviewPage.SetNavigateCostCodesButtonStates();
    },

    RegularHoursAllowDirectEdit: function (p) {
        var allowEdit = p.model.IsApprovable;

        if (allowEdit) {
            var costCodeHourlyEntry = $.grep(p.model.Entries, function (e) { return e.CostCodeId === p.sender.columns[p.container[0].cellIndex - 1].costCodeId; });
            if (costCodeHourlyEntry.length > 0) {
                allowEdit = (costCodeHourlyEntry[0].IsLockedFromModification === false) &&
                    (costCodeHourlyEntry[0].ModifiedByUserId === jobCentricModel.CurrentUserId) &&
                    ((costCodeHourlyEntry[0].DoubleTimeInMinutes === 0) && (costCodeHourlyEntry[0].OverTimeInMinutes === 0));
            }
        }
        return (allowEdit);
    },

    CanEditInDetailGrid: function (p) {
        var allowEdit = false;

        var costCodeHourlyEntry = $.grep(p.model.Entries, function (e) { return e.CostCodeId === p.sender.columns[p.container[0].cellIndex - 1].costCodeId; });
        if (costCodeHourlyEntry.length > 0) {
            allowEdit = (costCodeHourlyEntry[0].IsLockedFromModification === false);
        }
        return (allowEdit);
    },

    UpdateLineItem: function (models) {
        var urlToCall = global.GetBaseUrl() + '/TimeReviewJob/UpdateTimeEntry';

        var empId = models[0].EmployeeUserId;

        detailGridSection.PrepareModelsForPersist(models);
        timeEntryHelper.HideErrorsAndWarnings();

        $.ajax({
            type: "POST",
            url: urlToCall,
            data: { json: JSON.stringify(models) },
            context: this,
            success: function (data, textStatus, jqXHR) {
                if (data.hadError && data.hadError === true) {
                    timeEntryHelper.DisplayErrorsAsAlertMessageBox(data);
                    var grid = $("#jobCentricReviewGridArea").data("kendoGrid");
                    grid.cancelChanges();
                } else {
                    masterGrid.UpdateDetail(data.returnList, "update");
                    masterGrid.RecalculateTotals(empId);
                    masterGrid.RepositionFocus();
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('Error updating time: ' + errorThrown);
                var grid = $("#jobCentricReviewGridArea").data("kendoGrid");
                grid.cancelChanges();
            }
        });
    },

    DeleteLineItem: function (models) {
        var urlToCall = global.GetBaseUrl() + '/TimeReviewJob/DeleteTimeEntry';
        var empId = models[0].EmployeeUserId;
        timeEntryHelper.HideErrorsAndWarnings();

        $.ajax({
            type: "POST",
            url: urlToCall,
            data: { json: JSON.stringify(models) },
            context: this,
            success: function (data, textStatus, jqXHR) {
                if (data.hadError && data.hadError === true) {
                    timeEntryHelper.DisplayErrorsAsAlertMessageBox(data);
                    var grid = $("#jobCentricReviewGridArea").data("kendoGrid");
                    grid.cancelChanges();
                } else {
                    masterGrid.UpdateDetail(data.returnList, "delete");
                    masterGrid.RecalculateTotals(empId);
                    masterGrid.RepositionFocus();
                }

            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('Error updating time: ' + errorThrown);
                var grid = $("#jobCentricReviewGridArea").data("kendoGrid");
                grid.cancelChanges();
            }
        });
    },
    CreateLineItem: function (empId, costCodeId, regularHours) {
        var itemStatus = detailGridSection.newRowStatus(empId);
        var urlToCall = detailGridSection.getURLForNewRow(itemStatus);
        var objectForServer = detailGridSection.createTimeHeader(empId);
        objectForServer.HourlyEntries = [];

        var entry = new Object;
        entry.RegularTimeInHours = regularHours;
        entry.EntryId = $('#hdnEmptyGuidVal').val();
        entry.ProjectId = jobCentricModel.CurrentProject.ProjectId;
        entry.EmployeeUserId = empId;
        entry.CostCodeId = costCodeId;
        var costCode = $.grep(jobCentricModel.CurrentProject.ProjectCostCodes, function (e) { return e.CostCodeId === entry.CostCodeId; });
        if (costCode.length > 0) {
            entry.SubJobId = costCode[0].SubjobId;
        }
        entry.EntryDate = objectForServer.Day;
        entry.ItemStatus = 1;
        entry.IsEntryInvalid = false;
        entry.IsLockedFromModification = false;

        objectForServer.HourlyEntries.push(entry);
        objectForServer.TimeSpanEntries = [];

        detailGridSection.PrepareModelsForPersist(objectForServer.HourlyEntries);
        timeEntryHelper.HideErrorsAndWarnings();

        $.ajax({
            url: urlToCall,
            type: 'POST',
            data: (itemStatus === 1) ? global.AddAntiForgeryToken({ json: JSON.stringify(objectForServer) }) : global.AddAntiForgeryToken({ json: JSON.stringify(objectForServer), allowEditSubmitted: true }),
            success: function (data) {
                if (data.hadError && data.hadError === true) {
                    timeEntryHelper.DisplayErrorsAsAlertMessageBox(data);
                    var grid = $("#jobCentricReviewGridArea").data("kendoGrid");
                    grid.cancelChanges();
                }
                else {
                    masterGrid.UpdateDetail(data.HourlyEntries, "add");
                    masterGrid.RecalculateTotals(empId);
                    masterGrid.RepositionFocus();
                }
            },
            error: function (jqXhr, textStatus, errorThrown) {
                alert('Error updating time: ' + errorThrown);
                var grid = $("#jobCentricReviewGridArea").data("kendoGrid");
                grid.cancelChanges();
            }
        });
    },
    // main page
    AreChangesPending: function (skipEmployeeId) {
        var pendingChanges = false;
        var skipDataSource = false;

        $('div[id^="detail_"]').each(function (index) {
            var dsrc = $(this).data("kendoGrid").dataSource;
            skipDataSource = false;
            $.each(dsrc._data, function () {
                if (typeof (skipEmployeeId) !== 'undefined' && this.EmployeeUserId === skipEmployeeId) {
                    skipDataSource = true;
                }
                else {
                    if (((this.dirty !== null) && (this.dirty !== undefined) && this.dirty == true) || ((this.isNew !== null) && (this.isNew !== undefined) && this.isNew())) {
                        pendingChanges = true;
                    }
                }

            });

            // If this datasource has been synced, we'll ignore what kendo thinks is the rowcount. See TFS 111902
            if (skipDataSource === false) {
                if (dsrc._data.length != dsrc._total) {
                    pendingChanges = true;
                }
            }

        });

        return pendingChanges;
    },

    IsEmployeeSelectedForApproval: function () {
        var isEmpSelectedForApproval = false;
        var grid = $("#jobCentricReviewGridArea").data("kendoGrid");
        var dsrc = grid.dataSource.data();
        $.each(dsrc, function () {
            if (this.IsSelectedForApproval == true) {
                isEmpSelectedForApproval = true;
            }
        });
        return isEmpSelectedForApproval;
    },

    SelectAllForApproval: function (checked) {
        var grid = $("#jobCentricReviewGridArea").data("kendoGrid");
        var dsrc = grid.dataSource.data();
        $.each(dsrc, function () {
            if (this.IsApprovable == true) {
                this.set("IsSelectedForApproval", checked);
            }
        });
        jobCentricReviewPage.ShowActionBar(masterGrid.IsEmployeeSelectedForApproval());
    },

    // main grid
    //Updates the grid when user filters by date
    UpdateGrid: function () {
        if (jobCentricReviewPage.ColumnsAreLocked) {
            //leaves columns unchanged, just update the data
            masterGrid.UpdateGridData();
        } else {
            //update grid with new columns and data
            masterGrid.RecreateGrid();
        }
        jobCentricReviewPage.ShowActionBar(false);
    },

    // main grid
    //Recreates the grid
    RecreateGrid: function () {
        var dateText = dayAndWeekSelectionMenu.DateSelected();
        var isSupervisorReview = jobCentricModel.IsSupervisorReview;
        var isDayView = dayAndWeekSelectionMenu.IsDayView();
        var subJobFilter = subJobSelector.SubJobSelectedValue();
        //subJobFilter == "" --> pass "all"
        //subJobFilter == Guid.empty   --> pass "" (main job)
        //subJobFilter =="guid..."  --> pass "guid..." (sub job)
        if (subJobFilter === "") {
            subJobFilter = "all";
        }
        else if (subJobFilter === timeEntryHelper.GetSubjobNoneId()) {
            subJobFilter = "";
        }

        timeEntryHelper.HideErrorsAndWarnings();
        $.ajax({
            url: global.GetBaseUrl() + '/TimeReviewJob/FilterTimecards',
            data: global.AddAntiForgeryToken({ dateFilter: dateText, subjobFilter: subJobFilter, isSupervisorReview: isSupervisorReview, isDayView: isDayView }),
            type: "POST",
            context: this,
            success: function (data) {
                if (data.hadError && data.hadError === true) {
                    global.HandleAjaxError(data);
                } else {
                    jobCentricModel.CostColumnsToDisplay = data.CostColumnsToDisplay;
                    jobCentricModel.EmployeeTimeCards = data.EmployeeTimeCards;
                    jobCentricModel.PeriodDuration = data.PeriodDuration;
                    jobCentricModel.CurrentProject.ProjectSubJobs = data.CurrentProject.ProjectSubJobs;
                    masterGrid.lastPageSize = ($("#jobCentricReviewGridArea").data("kendoGrid")).dataSource.pageSize();
                    masterGrid.lastPage = ($("#jobCentricReviewGridArea").data("kendoGrid")).dataSource.page();
                    masterGrid.CreateAndPopulateGrid();
                    costCodeWindow.CreateCostCodeGrid();
                }
            },
            error: function (jqXhr, textStatus, errorThrown) {
                alert('Error fetching timecards: ' + errorThrown);
            }
        });
    },

    // main grid
    //Refreshes grid with new data, does not alter displayed columns
    UpdateGridData: function () {
        var dateText = dayAndWeekSelectionMenu.DateSelected();
        var isDayView = dayAndWeekSelectionMenu.IsDayView();
        var isSupervisorReview = jobCentricModel.IsSupervisorReview;
        var subJobFilter = subJobSelector.SubJobSelectedValue();
        if (subJobFilter === "") {
            subJobFilter = "all";
        }
        else if (subJobFilter === timeEntryHelper.GetSubjobNoneId()) {
            subJobFilter = "";
        }
        timeEntryHelper.HideErrorsAndWarnings();
        $.ajax({
            url: global.GetBaseUrl() + '/TimeReviewJob/FilterTimecards',
            data: global.AddAntiForgeryToken({ dateFilter: dateText, subjobFilter: subJobFilter, isSupervisorReview: isSupervisorReview, isDayView: isDayView }),
            type: "POST",
            context: this,
            success: function (data) {
                if (data.hadError && data.hadError === true) {
                    global.HandleAjaxError(data);
                } else {
                    var reviewGrid = $("#jobCentricReviewGridArea").data("kendoGrid");
                    jobCentricModel.EmployeeTimeCards = data.EmployeeTimeCards;
                    jobCentricModel.PeriodDuration = data.PeriodDuration;
                    var dataset = masterGrid.GetDataset();
                    reviewGrid.dataSource.data(dataset);
                    if (isDayView) {
                        reviewGrid.showColumn("IsSelectedForApproval");
                    } else {
                        reviewGrid.hideColumn("IsSelectedForApproval");
                    }
                    reviewGrid.refresh();
                }
            },
            error: function (jqXhr, textStatus, errorThrown) {
                alert('Error fetching timecards: ' + errorThrown);
            }
        });
    },

    // main grid
    columnHideHandler: function (e) {
        masterGrid.RecalculateRowViewTotals(e.column.field, false);
    },

    // main grid
    columnShowHandler: function (e) {
        masterGrid.RecalculateRowViewTotals(e.column.field, true);
    },

    // main grid
    RecalculateRowViewTotals: function (fieldName, show) {
        var grid = $("#jobCentricReviewGridArea").data("kendoGrid");
        var ds = grid.dataSource.data();
        var totalNumber = ds.length;
        for (var i = 0; i < totalNumber; i++) {
            var currentDataItem = ds[i];
            for (var propName in currentDataItem) {
                if (propName == fieldName) {
                    var val = currentDataItem[propName];

                    if (show == false) {
                        var newVal = currentDataItem["ViewTotal"] -= val;
                        currentDataItem.set("ViewTotal", newVal);
                    }
                    else {
                        var newVal2 = currentDataItem["ViewTotal"] += val;
                        currentDataItem.set("ViewTotal", newVal2);
                    }

                }
            }
        }
        //grid.dataSource.fetch();
    },
    // main grid
    GetAggregateFields: function (columns) {

        var aggregates = [];
        for (var propName in columns) {
            if (typeof columns[propName] == 'number') {
                aggregates.push({ field: propName, aggregate: "sum" });
            }
        }

        return aggregates;
    },

    IsColumnHidden: function (grid, columnName) {
        var hidden = true;
        for (var i = 0; i < grid.columns.length; i++) {
            if (grid.columns[i].field == columnName && grid.columns[i].hidden == false) {
                hidden = false;
                break;
            }
        }

        return hidden;
    },

    UpdateDetail: function (updatedData, operationPerformed) {
        var grid = $("#jobCentricReviewGridArea").data("kendoGrid");
        var ds = grid.dataSource.data();

        for (var i = 0; i < updatedData.length; i++) {
            var employeeRow = $.grep(ds, function (f) { return f.EmpId === updatedData[i].EmployeeUserId; });
            if (employeeRow.length > 0) {
                var entries = employeeRow[0].Entries;
                var entryIndex = -1;
                for (var e = 0; e < entries.length; e++) {
                    if (entries[e].EntryId === updatedData[i].EntryId) {
                        entryIndex = e;
                        break;
                    }
                }
                if (entryIndex !== -1) {
                    if (operationPerformed === "update") {
                        employeeRow[0].Entries[entryIndex] = updatedData[i];
                    }
                    else if (operationPerformed == "delete") {
                        employeeRow[0].Entries.splice(entryIndex, 1);
                    }
                }
                else {
                    employeeRow[0].Entries.push(updatedData[i]);
                }
            }
        }
        //grid.dataSource.fetch();
    },

    RepositionFocus: function () {
        var grid = $("#jobCentricReviewGridArea").data("kendoGrid");

        if ((lastEditedRow != -1) && (lastEditedCell != -1)) {
            var nextCellIndex = (lastEditedCell < (jobCentricReviewPage.LastVisibleGridColumn() + 1)) ? (lastEditedCell + 2) : (lastEditedCell + 1);
            var cell = $("[data-uid='" + lastEditedRow.data('uid') + "']", ($("#jobCentricReviewGridArea").data('kendoGrid')).tbody).find(">td:nth-child(" + (nextCellIndex) + ")");
            lastEditedRow = -1;
            lastEditedCell = -1;
            grid.editCell(cell);
        }
    },

    RecalculateTotals: function (emplUserId) {
        var grid = $("#jobCentricReviewGridArea").data("kendoGrid");
        var ds = grid.dataSource.data();
        var employeeRow = $.grep(ds, function (f) { return f.EmpId === emplUserId; });
        if (employeeRow.length > 0) {
            var totalHours = 0;
            for (var i = 0; i < employeeRow[0].Entries.length; i++) {
                totalHours += employeeRow[0].Entries[i].TotalTimeInHours;
            }
            employeeRow[0].set("HoursTotal", totalHours);
            timeEntryHelper.ValidateAndShowWarnings(employeeRow[0]);
            // this is a hack to make the totalhours cell show the updated value. If you have multiple updated grids and save only 1, we'll prevent a master grid rebind hence the need
            // to force it
            var cell = $("#jobCentricReviewGridArea").data("kendoGrid").tbody.find("tr[data-uid='" + employeeRow[0].uid + "'] td:eq(5)");
            grid.editCell(cell);
        }
        masterGrid.RecalculateCostCodeAndViewTotals(emplUserId);
    },

    RecalculateCostCodeAndViewTotals: function (emplUserId) {
        var grid = $("#jobCentricReviewGridArea").data("kendoGrid");
        var ds = grid.dataSource.data();
        var employeeRow = $.grep(ds, function (f) { return f.EmpId === emplUserId; });
        if (employeeRow.length > 0) {
            var totalViewHoursForRow = 0;

            for (var propName in employeeRow[0]) {
                var reg = /\d+/;
                var regTotalHrs = /CC_\d+TotalHours/;

                if (propName.match(regTotalHrs)) {
                    var colNumber = propName.match(reg);
                    var totalHoursForCostCodeColumnName = propName;
                    var costCodeIdColumnName = "CC_" + colNumber + "Id";
                    var costCodeId = employeeRow[0][costCodeIdColumnName];
                    var costCodeValue = 0;

                    var costCodeRow = $.grep(employeeRow[0].Entries, function (f) { return f.CostCodeId === costCodeId; });
                    if (costCodeRow.length > 0) {
                        costCodeValue = costCodeRow[0].TotalTimeInHours;
                    }
                    employeeRow[0].set(totalHoursForCostCodeColumnName, costCodeValue);

                    var costCodeColIdx = 6 + parseInt(colNumber[0]);
                    var cell = $("#jobCentricReviewGridArea").data("kendoGrid").tbody.find("tr[data-uid='" + employeeRow[0].uid + "'] td:eq(" + costCodeColIdx + ")");
                    grid.editCell(cell);
                    grid.closeCell();
                    if (masterGrid.IsColumnHidden(grid, totalHoursForCostCodeColumnName) == false) {
                        totalViewHoursForRow += employeeRow[0][totalHoursForCostCodeColumnName];
                    }
                }
            }
            employeeRow[0].set("ViewTotal", totalViewHoursForRow);
            // this is a hack to make the view total cell show the updated value. If you have multiple updated grids and save only 1, we'll prevent a master grid rebind hence the need
            // to force it
            var cell = $("#jobCentricReviewGridArea").data("kendoGrid").tbody.find("tr[data-uid='" + employeeRow[0].uid + "'] td:eq(6)");
            grid.editCell(cell);
        }
    },

    NoteEditor: function (container, options) {
        if (!masterGrid.CanEditNotes(options)) {
            return;
        }
        var noteModel = new Object;
        noteModel.Note = options.model.Note;
        noteModel.Container = container;
        noteModel.EditCallback = function (modifiedModel) {

            var gridId = "#jobCentricReviewGridArea";
            var currentDataItem = $(gridId).data("kendoGrid").dataItem($(modifiedModel.Container).closest("tr"));
            if (options.model.Note !== modifiedModel.Note) {
                masterGrid.UpdateNote(currentDataItem, modifiedModel.Note);
            } else {
                $(gridId).data("kendoGrid").closeCell();
            }
        };

        notesWindow.notesModel = noteModel;
        $("#entryNotes").val(notesWindow.notesModel.Note);
        $("#notesWindow").dialog('open');

    },

    UpdateNote: function (dataItem, modifiedNote) {
        var noteModel = new Object;
        noteModel.EmployeeUserId = dataItem.EmpId;
        noteModel.EntryDate = dayAndWeekSelectionMenu.DateSelected();
        noteModel.Note = modifiedNote;

        $.ajax({
            url: global.GetBaseUrl() + "/TimeReviewJob/EditNote",
            type: 'POST',
            data: global.AddAntiForgeryToken({ json: JSON.stringify(noteModel) }),
            success: function (data) {
                if (data.hadError && data.hadError === true) {
                    timeEntryHelper.ShowErrors(data);
                } else {
                    timeEntryHelper.HideErrorsAndWarnings();
                    dataItem.set("Note", modifiedNote);
                    $('#jobCentricReviewGridArea').data("kendoGrid").closeCell();
                }
            },
            error: function (jqXhr, textStatus, errorThrown) {
                alert('Error editing note: ' + errorThrown);
            }
        });
    },

    CanEditNotes: function (masterRow) {
        // If the notes column is being edited but no entries exist for the day, prevent a new note from being created
        return ((masterRow.model.Entries.length > 0) && (masterRow.model.Entries[0].IsLockedFromModification === false));
    }
};
