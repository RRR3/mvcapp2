var detailGridSection = {
    // child grid
    CancelChangesInProcess: false,
    DetailGridInit: function (e) {
        //initialize detail grid

        var isDayView = dayAndWeekSelectionMenu.IsDayView();

        var canShowToolbar = detailGridSection.CanShowToolbar(e.data);

        var cols = [];

        if (isDayView) {
            cols.push({
                field: "IsLockedFromModification",
                title: "Status",
                template: "#= detailGridSection.StatusColumnTemplate(data) #"
            });
        }

        if (jobCentricModel.HasSubJobs === true) {
            cols.push({
                field: "SubJobId",
                title: timeEntryHelper.GetSubjobDesc(),
                template: "#= detailGridSection.SubJobColumnTemplate(data) #",
                editor: detailGridSection.SubJobEditor
            });
        }

        cols.push({
            field: "CostCodeId",
            title: "Cost Code",
            template: "#= detailGridSection.CostCodeColumnTemplate(data) #",
            editor: detailGridSection.CostCodeEditor
        });

        if (isDayView) {
            cols.push({
                field: "Note",
                title: "Notes",
                width: "30px",
                template: "#= detailGridSection.NoteColumnTemplate(data) #",
                editor: detailGridSection.NoteEditor
            });
        }

        if (e.data.Template.RegularPayName != null) {
            cols.push({
                field: "RegularTimeInHours",
                template: "#= detailGridSection.RegularHoursTemplate(data) #",
                title: e.data.Template.RegularPayName,
                editor: detailGridSection.HoursEditor,
                width: 100
            });
        }

        if (e.data.Template.OvertimePayName != null) {
            cols.push({
                field: "OverTimeInHours",
                template: "#= detailGridSection.OvertimeHoursTemplate(data) #",
                title: e.data.Template.OvertimePayName,
                editor: detailGridSection.HoursEditor,
                width: 100
            });
        }

        if (e.data.Template.DoublePayName != null) {
            cols.push({
                field: "DoubleTimeInHours",
                template: "#= detailGridSection.DoubleHoursTemplate(data) #",
                title: e.data.Template.DoublePayName,
                editor: detailGridSection.HoursEditor,
                width: 100
            });
        }

        if (isDayView) {
            cols.push({
                command: { name: "destroy", text: "" },
                title: "&nbsp;",
                width: "40px"
            });
        }

        var emptyGuid = $('#hdnEmptyGuidVal').val();

        $("<div id='detail_" + e.data.EmpId + "' style='border-color:#92ad77'/>").appendTo(e.detailCell).kendoGrid({
            dataSource: {
                batch: true,
                change: function (e) {
                    jobCentricReviewPage.EnableDisableFiltersAndSettings();

                    if (detailGridSection.CancelChangesInProcess) {
                        //note: As user adds rows and modifies rows in the detail grid, the master row Entries object
                        //is updated.  But when the user selects cancel changes, the master row Entries object is not 
                        //getting updated (still has stale data from before the cancel changes).
                        //The following code is needed to resync the master row Entries object after
                        //user selects cancel changes in the detail grid.  
                        detailGridSection.CancelChangesInProcess = false;
                        var empId = e.sender.options.table.parent().attr('id').replace('detail_', '');
                        var dsrc = e.items;
                        detailGridSection.UpdateMasterDatasourceDetailEntries(empId, dsrc);
                    }
                },

                sync: function (e) {
                    var empId = e.sender.options.table.parent().attr('id').replace('detail_', '');
                    var grid = $('#detail_' + empId).data("kendoGrid");
                    var dsrc = grid.dataSource;
                    detailGridSection.UpdateMasterDatasourceDetailEntries(empId, dsrc._data);
                    // See TFS 111902. If there is a single line item and it is deleted and a row is added in the same batch, kendo does not seem to track the row count correctly.
                    // See AreChangesPending(). We force kendo to ignore this data source in the AreChangesPending() check since it has been sync'ed
                    jobCentricReviewPage.EnableDisableFiltersAndSettings(empId);
                },

                transport: {
                    read: function (options) {
                        if (e.data.Entries != null) {
                            options.success(e.data.Entries);
                        }
                    },
                    update: detailGridSection.updateLineItem,
                    destroy: detailGridSection.deleteLineItem,
                    create: detailGridSection.createLineItem,
                    parameterMap: function (options, operation) {
                        if (operation !== "read" && options.models) {
                            return { models: kendo.stringify(options.models) };
                        }

                        return options;
                    }
                },
                schema: {
                    model: {
                        id: "EntryId",
                        fields: {
                            EntryId: { editable: false, defaultValue: emptyGuid },
                            EmployeeUserId: { editable: false },
                            CostCodeId: { validation: { required: true} },
                            EntryDate: { editable: false },
                            SubJobId: { defaultValue: timeEntryHelper.GetSubjobNoneId() },
                            CostCodeName: { editable: false },
                            SubJobName: { editable: false },
                            RegularEntryId: { editable: false },
                            RegularTimeInHours: { editable: true, type: "number", validation: { min: 0, max: 24} },
                            OvertimeEntryId: { editable: false },
                            OverTimeInHours: { editable: true, type: "number", validation: { min: 0, max: 24} },
                            DoubleEntryId: { editable: false },
                            DoubleTimeInHours: { editable: true, type: "number", validation: { min: 0, max: 24} },
                            Note: { editable: true, validation: { required: false} },
                            IsLockedFromModification: { editable: false },
                            ItemStatus: { editable: false, type: "number", defaultValue: 1 },
                            TotalTimeInHours: { editable: true, type: "number" }
                        }
                    },
                    errors: "errors"
                }
            },
            scrollable: false,
            sortable: true,
            navigatable: true,
            pageable: false,
            editable: { confirmation: false },
            edit: function (p) {

                var isCellClosed = false;

                if (p.container.context !== undefined) {
                    var indexCell = p.container.context.cellIndex;

                    if (p.model.EntryId && p.model.IsLockedFromModification) { // when Editing
                        if (indexCell !== 'undefined') {
                            this.closeCell();
                            isCellClosed = true;
                        }
                    }

                    if ((indexCell === 0 || indexCell === 1 || indexCell === 2) && !p.model.isNew()) {
                        this.closeCell();
                        isCellClosed = true;
                    } else if (indexCell === 1 && p.model.isNew() && p.model.CostCodeId !== "") {
                        var childGridId = "#" + this.element.context.id;
                        var currentDataItem = $(childGridId).data("kendoGrid").dataItem($(p.container).closest("tr"));
                        currentDataItem.set("CostCodeId", "");
                    }
                }
            },
            save: function (es) {

                if (es.model.isNew()) {

                    var childGridId = $(es.sender.element).attr("id").split('_')[1];
                    if (es.model.EmployeeUserId === "") {
                        es.model.EmployeeUserId = childGridId;
                    }

                    if (es.model.EntryDate === "") {
                        es.model.EntryDate = dayAndWeekSelectionMenu.DateSelected();
                    }
                }
            },
            saveChanges: function (e) {
                if ((e !== undefined) && (e.sender !== undefined) && (e.sender._data !== undefined)) {

                    detailGridSection.RemoveNewRowsWithZeroHours(e.sender._data, e.sender.element);

                    var validateTotalHoursMatch = false;

                    var employeeId = e.sender._cellId.replace('detail_', '');
                    employeeId = employeeId.replace('_active_cell', '');
                    var employeeTimeCard = $.grep(jobCentricModel.EmployeeTimeCards, function (e) { return (e.Employee.UserId === employeeId); });
                    if (employeeTimeCard.length > 0) {
                        //has the employee entered time for himself?
                        var originalEntriesFromOtherUser = $.grep(employeeTimeCard[0].HourlyEntries, function (e) { return (e.ModifiedByUserId !== jobCentricModel.CurrentUserId); });
                        if (originalEntriesFromOtherUser.length > 0) {
                            validateTotalHoursMatch = true;
                        }
                    }
                    if (validateTotalHoursMatch) {
                        //Get TotalHours from master grid
                        var currentTotalHours = $("#jobCentricReviewGridArea").data().kendoGrid.dataItem(e.sender.element.closest('tr').prev()).HoursTotal;

                        //Get original total hours from JobCentricModel
                        var originalTotalHours = 0;
                        var originalEntries = employeeTimeCard[0].HourlyEntries;
                        $.grep(originalEntries, function (e) {
                            originalTotalHours += e.RegularTimeInHours + e.OverTimeInHours + e.DoubleTimeInHours;
                        });

                        //We only want to display the warning message the first time the user increases/decreases total hours.
                        //if the currentTotalHours <> orginalTotalHours then user has already modified total time and a subsequent 
                        //warning should not be given.
                        if (currentTotalHours === originalTotalHours) {
                            //Get new total hours in detail grid
                            var newTotalHours = 0;
                            var entries = e.sender._data;
                            $.grep(entries, function (e) {
                                newTotalHours += e.RegularTimeInHours + e.OverTimeInHours + e.DoubleTimeInHours;
                            });

                            //If original total hours <> detail total hours, display confirmation message
                            if (originalTotalHours !== newTotalHours) {
                                var employeeFullName = "";
                                var message = "";
                                var employee = $.grep(jobCentricModel.EmployeeTimeCards, function (e) { return (e.Employee.UserId === originalEntriesFromOtherUser[0].ModifiedByUserId); });
                                if (employee.length > 0) {
                                    employeeFullName = employee[0].Employee.FullName;
                                    message = employeeFullName + " previously entered a total of " + originalTotalHours + " hours.  The new total hours for " + employeeFullName +
                                        " is " + newTotalHours + ".  This is a change from the total hours originally entered.  " + $('#DoYouWantToContinue').text();
                                } else {
                                    message = "Total hours have changed from " + originalTotalHours + " to " + newTotalHours + ".  This is a change from the total hours originally entered.  " + $('#DoYouWantToContinue').text();
                                }

                                if (!confirm(message)) {
                                    e.preventDefault();
                                }
                            }
                        }
                    }
                }
            },
            error: function (e) {
                console.log(e.errors);
            },
            dataBound: function (ev) {

                $(".k-detail-row").each(function () {
                    $(this).css('background-color', '#CDE4B5');
                });

                $('.k-grid-cancel-changes').css('float', 'right');
                $('.k-grid-save-changes').css('float', 'right');
                $('.k-grid-add').css('float', 'right');

                var childGridId = "#" + $(ev.sender.element).attr("id");
                var btnId = childGridId + " tbody tr .k-grid-delete";
                $(btnId).each(function () {
                    this.style.width = "25px";
                    this.style.minWidth = "25px";
                    var currentDataItem = $(childGridId).data("kendoGrid").dataItem($(this).closest("tr"));

                    //Check in the current dataItem if the row is deletable
                    if (currentDataItem.IsLockedFromModification === true) {
                        $(this).remove();
                    }
                });
            },
            toolbar: (isDayView && canShowToolbar) ? [{ name: "cancel" }
                , { name: "save" }
                , { name: "create", text: "Add time" }
            ] : [],
            columns: cols
        });

        var gridId = "#detail_" + e.data.EmpId;

        $(gridId).find(".k-grid-cancel-changes").bind("click", function () {
            detailGridSection.CancelChangesInProcess = true;
            timeEntryHelper.HideErrorsAndWarnings();
        });
    },

    // child grid
    HoursEditor: function (container, options) {
        $('<input name="' + options.field + '" data-bind="value:' + options.field + '"/>')
            .appendTo(container).kendoNumericTextBox({
                min: 0,
                max: 24,
                spinners: false
            });

        $("[data-role='numerictextbox']").focus(function () {
            var input = $(this);
            setTimeout(function () {
                input.select();
            });
        });
    },

    // child grid
    CostCodeEditor: function (container, options) {
        var costCodes = [];
        var usedCostCodes = [];

        var childDataModels = options.model.parent();

        var gridIdAttr = $(container).closest("div").attr("id");

        var grid = $('#' + gridIdAttr).data("kendoGrid");
        var dsrc = grid.dataSource;

        // get all the cost codes currently in the line items
        for (var i = 0; i < childDataModels.length; i++) {
            usedCostCodes.push(childDataModels[i].CostCodeId);
        }

        // if there are pending deletes, those are "used" as well
        for (var k = 0; k < dsrc._destroyed.length; k++) {
            usedCostCodes.push(dsrc._destroyed[k].CostCodeId);
        }

        var costCodesToUse = [];

        if (jobCentricModel.HasSubJobs === true) {
            var subJob = options.model.SubJobId;
            if (subJob === timeEntryHelper.GetSubjobNoneId()) {
                costCodesToUse = $.grep(jobCentricModel.CurrentProject.ProjectCostCodes, function (e) { return e.SubjobId === timeEntryHelper.GetSubjobNoneId(); });
            } else {
                costCodesToUse = $.grep(jobCentricModel.CurrentProject.ProjectCostCodes, function (e) { return e.SubjobId === subJob; });
            }
        } else {
            costCodesToUse = jobCentricModel.CurrentProject.ProjectCostCodes;
            //costCodesToUse = $.grep(jobCentricModel.CurrentProject.ProjectCostCodes, function (e) { return e.SubjobId == timeEntryHelper.GetSubjobNoneId(); });
        }
        costCodes.push({ "CostCodeId": "", "CostCodeName": "-- select cost code --" });

        for (var cc in costCodesToUse) {
            if ($.inArray(costCodesToUse[cc].CostCodeId, usedCostCodes) === -1) {
                costCodes.push({
                    "CostCodeId": costCodesToUse[cc].CostCodeId,
                    "CostCodeName": costCodesToUse[cc].CostCodeName
                });
            }
        }

        $('<input required data-text-field="CostCodeName" data-value-field="CostCodeId" data-bind="value:' + options.field + '"/>')
            .appendTo(container)
            .kendoDropDownList({
                dataTextField: "CostCodeName",
                dataValueField: "CostCodeId",
                dataSource: costCodes,
                index: 0
            });
    },

    SubJobEditor: function (container, options) {
        var subJobs = [];

        var subJobFilterSelection = subJobSelector.SubJobSelectedText();
        var subJobSelectionVal = subJobSelector.SubJobSelectedValue();

        for (var cc in jobCentricModel.CurrentProject.ProjectSubJobs) {

            var id = jobCentricModel.CurrentProject.ProjectSubJobs[cc].SubjobId;
            var description = jobCentricModel.CurrentProject.ProjectSubJobs[cc].JobDescription;

            if (subJobFilterSelection === timeEntryHelper.GetSubjobNoneName() && description === timeEntryHelper.GetSubjobNoneName()) {
                subJobs.push({
                    "SubJobId": id,
                    "SubJobName": description
                });
                break;
            } else if (subJobFilterSelection !== "All" && id === subJobSelectionVal) {

                subJobs.push({
                    "SubJobId": id,
                    "SubJobName": description
                });
                break;
            } else if (subJobFilterSelection === "All") {
                subJobs.push({
                    "SubJobId": id,
                    "SubJobName": description
                });
            }

        }

        var ddl = $('<input required data-text-field="SubJobName" data-value-field="SubJobId" data-bind="value:' + options.field + '"/>')
            .appendTo(container)
            .kendoDropDownList({
                dataTextField: "SubJobName",
                dataValueField: "SubJobId",
                dataSource: subJobs,
                index: 0
            }).data("kendoDropDownList");

        if (subJobFilterSelection !== "All" && subJobSelectionVal !== timeEntryHelper.GetSubjobNoneId()) {
            ddl.refresh();
            ddl.value(subJobSelectionVal);
            options.model.SubJobId = subJobSelectionVal;
        }
    },

    // child grid
    HoursColumnTemplate: function (hours, minutes) {

        var stat = timeEntryHelper.GetFormattedHours(hours, minutes);

        return stat;

    },

    RegularHoursTemplate: function (model) {
        if (model.RegularTimeInHours == null) {
            model.RegularTimeInHours = 0;
        }
        var contents = "<span>" + model.RegularTimeInHours + "</span>";

        if (dayAndWeekSelectionMenu.IsDayView()) {
            var employeeRow = $.grep(jobCentricModel.EmployeeTimeCards, function (f) { return f.Employee.UserId === model.EmployeeUserId; });
            if ((employeeRow.length > 0) && (employeeRow[0].Template.TimeEntryWorkAmountPolicy.MaximumDailyRegularMinutes !== null) && (employeeRow[0].Template.TimeEntryWorkAmountPolicy.MaximumDailyRegularMinutes > 0)) {
                if (model.RegularTimeInMinutes > employeeRow[0].Template.TimeEntryWorkAmountPolicy.MaximumDailyRegularMinutes) {
                    var dispTextDay = jQuery.validator.format($('#TimeEntryPolicyPayTypeMaxTime').text(), employeeRow[0].Template.RegularPayName,
                        Math.floor(employeeRow[0].Template.TimeEntryWorkAmountPolicy.MaximumDailyRegularMinutes / 60), employeeRow[0].Template.TimeEntryWorkAmountPolicy.MaximumDailyRegularMinutes % 60);
                    contents = "<span class='warningState' title='" + dispTextDay + "'>" + model.RegularTimeInHours + "</span>";
                }
            }
        }

        return contents;
    },

    DoubleHoursTemplate: function (model) {
        if (model.DoubleTimeInHours == null) {
            model.DoubleTimeInHours = 0;
        }

        var contents = "<span>" + model.DoubleTimeInHours + "</span>";

        if (dayAndWeekSelectionMenu.IsDayView()) {
            var employeeRow = $.grep(jobCentricModel.EmployeeTimeCards, function (f) { return f.Employee.UserId === model.EmployeeUserId; });
            if (employeeRow.length > 0 && (employeeRow[0].Template.TimeEntryWorkAmountPolicy.MaximumDailyDoubleMinutes !== null) && (employeeRow[0].Template.TimeEntryWorkAmountPolicy.MaximumDailyDoubleMinutes > 0)) {
                if (model.DoubleTimeInMinutes > employeeRow[0].Template.TimeEntryWorkAmountPolicy.MaximumDailyDoubleMinutes) {
                    var dispTextDay = jQuery.validator.format($('#TimeEntryPolicyPayTypeMaxTime').text(), employeeRow[0].Template.DoublePayName,
                        Math.floor(employeeRow[0].Template.TimeEntryWorkAmountPolicy.MaximumDailyDoubleMinutes / 60), employeeRow[0].Template.TimeEntryWorkAmountPolicy.MaximumDailyDoubleMinutes % 60);
                    contents = "<span class='warningState' title='" + dispTextDay + "'>" + model.DoubleTimeInHours + "</span>";
                }
            }
        }

        return contents;
    },

    OvertimeHoursTemplate: function (model) {
        if (model.OverTimeInHours == null) {
            model.OverTimeInHours = 0;
        }

        var contents = "<span>" + model.OverTimeInHours + "</span>";

        if (dayAndWeekSelectionMenu.IsDayView()) {
            var employeeRow = $.grep(jobCentricModel.EmployeeTimeCards, function (f) { return f.Employee.UserId === model.EmployeeUserId; });
            if (employeeRow.length > 0 && (employeeRow[0].Template.TimeEntryWorkAmountPolicy.MaximumDailyOvertimeMinutes !== null) && (employeeRow[0].Template.TimeEntryWorkAmountPolicy.MaximumDailyOvertimeMinutes > 0)) {
                if (model.OverTimeInMinutes > employeeRow[0].Template.TimeEntryWorkAmountPolicy.MaximumDailyOvertimeMinutes) {
                    var dispTextDay = jQuery.validator.format($('#TimeEntryPolicyPayTypeMaxTime').text(), employeeRow[0].Template.OvertimePayName,
                        Math.floor(employeeRow[0].Template.TimeEntryWorkAmountPolicy.MaximumDailyOvertimeMinutes / 60), employeeRow[0].Template.TimeEntryWorkAmountPolicy.MaximumDailyOvertimeMinutes % 60);
                    contents = "<span class='warningState' title='" + dispTextDay + "'>" + model.OverTimeInHours + "</span>";
                }
            }
        }

        return contents;
    },

    // child grid
    StatusColumnTemplate: function (model) {

        var stat = timeEntryHelper.GetStatus(model.ItemStatus);

        if (model.IsLockedFromModification) {
            return "<div>" + stat + "<span alt='Is Locked' class='ui-icon ui-icon-locked'/>" + "</div>";
        } else {
            return "<div>" + stat + "</div>";
        }

    },

    // child grid
    CostCodeColumnTemplate: function (model) {

        var retVal = "";
        var contents = "";
        for (var cc in jobCentricModel.CurrentProject.ProjectCostCodes) {
            if (model.CostCodeId === jobCentricModel.CurrentProject.ProjectCostCodes[cc].CostCodeId) {
                retVal = jobCentricModel.CurrentProject.ProjectCostCodes[cc].CostCodeName;
                break;
            }
        }

        if (retVal.toLowerCase().indexOf("unknown") !== -1) {
            var dispTextDay = "Unknown cost code";
            contents = "<span alt='Cost Code' class='warningState' title='" + dispTextDay + "'>" + retVal + "</span>";
            return contents;
        }

        return retVal;
    },

    SubJobColumnTemplate: function (model) {
        var retVal = timeEntryHelper.GetSubjobNoneName();
        for (var cc in jobCentricModel.CurrentProject.ProjectSubJobs) {
            if (model.SubJobId === jobCentricModel.CurrentProject.ProjectSubJobs[cc].SubjobId) {
                retVal = jobCentricModel.CurrentProject.ProjectSubJobs[cc].JobDescription;
                break;
            }
        }

        return retVal;

    },

    NoteColumnTemplate: function (model) {

        if (model.Note != null && model.Note !== "") {
            return "<div class='sca-icon sca-icon-note'></div>";
        } else {
            return "<div title='Add Note' style='height: 20px'>" + "</div>";
        }

    },

    NoteEditor: function (container, options) {
        if (options.model.IsLockedFromModification) {
            return;
        }
        var noteModel = new Object();
        noteModel.Note = options.model.Note;
        noteModel.Container = container;
        noteModel.EditCallback = function (modifiedModel) {
            var childGridId = "#detail_" + options.model.EmployeeUserId;
            if (options.model.Note !== modifiedModel.Note) {

                var currentDataItem = $(childGridId).data("kendoGrid").dataItem($(modifiedModel.Container).closest("tr"));
                currentDataItem.set("Note", modifiedModel.Note);
            }
            $(childGridId).data("kendoGrid").closeCell();

        };

        notesWindow.notesModel = noteModel;
        $("#entryNotes").val(notesWindow.notesModel.Note);
        $("#notesWindow").dialog('open');

    },

    RemoveNewRowsWithZeroHours: function (models, element) {
        var newRowsWithZeroHoursIndexes = [];

        if (models.length > 0) {
            var emptyGuid = $('#hdnEmptyGuidVal').val();
            var grid = $('#' + $(element).attr("id")).data("kendoGrid");

            for (var i = 0; i < models.length; i++) {
                if ((models[i].EntryId === emptyGuid) && (models[i].RegularTimeInHours === 0) && (models[i].OverTimeInHours === 0) && (models[i].DoubleTimeInHours === 0)) {
                    newRowsWithZeroHoursIndexes.push(models[i]);
                }
            }
            if (newRowsWithZeroHoursIndexes.length > 0) {
                $.each(newRowsWithZeroHoursIndexes, function () {
                    var dataRow = grid.dataSource.getByUid(this.uid);
                    grid.dataSource.remove(dataRow);
                });

                models = models.filter(function (e) {
                    return (newRowsWithZeroHoursIndexes.indexOf(e) < 0);
                });
            }
        }
    },

    PrepareModelsForPersist: function (models) {
        for (var i = 0; i < models.length; i++) {
            if (models[i].SubJobId === timeEntryHelper.GetSubjobNoneId()) {
                models[i].SubJobId = null;
            }
            var regHrs = timeEntryHelper.GetHours(models[i].RegularTimeInHours);
            var regMins = timeEntryHelper.GetMinutes(parseFloat(models[i].RegularTimeInHours));

            if (regHrs == null || isNaN(regHrs))
                regHrs = 0;

            if (regMins == null || isNaN(regMins))
                regMins = 0;

            models[i].RegularHours = regHrs;
            models[i].RegularMinutes = regMins;

            var otHrs = timeEntryHelper.GetHours(models[i].OverTimeInHours);
            var otMins = timeEntryHelper.GetMinutes(parseFloat(models[i].OverTimeInHours));

            if (otHrs == null || isNaN(otHrs))
                otHrs = 0;

            if (otMins == null || isNaN(otMins))
                otMins = 0;

            models[i].OvertimeHours = otHrs;
            models[i].OvertimeMinutes = otMins;

            var dblHrs = timeEntryHelper.GetHours(models[i].DoubleTimeInHours);
            var dblMins = timeEntryHelper.GetMinutes(parseFloat(models[i].DoubleTimeInHours));

            if (dblHrs == null || isNaN(dblHrs))
                dblHrs = 0;

            if (dblMins == null || isNaN(dblMins))
                dblMins = 0;

            models[i].DoubleHours = dblHrs;
            models[i].DoubleMinutes = dblMins;
        }
    },

    // child grid
    updateLineItem: function (options) {
        var urlToCall = global.GetBaseUrl() + '/TimeReviewJob/UpdateTimeEntry';

        var empId = options.data.models[0].EmployeeUserId;

        detailGridSection.PrepareModelsForPersist(options.data.models);
        timeEntryHelper.HideErrorsAndWarnings();

        $.ajax({
            type: "POST",
            url: urlToCall,
            data: { json: JSON.stringify(options.data.models) },
            context: this,
            success: function (data, textStatus, jqXHR) {
                if (data.hadError && data.hadError === true) {
                    timeEntryHelper.ShowErrorsAndWarnings(data);
                    options.error(data);
                } else {
                    var grid = $('#detail_' + empId).data("kendoGrid");
                    var dsrc = grid.dataSource;
                    options.success(data.returnList);
                }


            },
            error: function (jqXHR, textStatus, errorThrown) {
                options.error(data);
            }
        });
    },

    // child grid
    deleteLineItem: function (options) {
        var urlToCall = global.GetBaseUrl() + '/TimeReviewJob/DeleteTimeEntry';
        var empId = options.data.models[0].EmployeeUserId;
        timeEntryHelper.HideErrorsAndWarnings();

        $.ajax({
            type: "POST",
            url: urlToCall,
            data: { json: JSON.stringify(options.data.models) },
            context: this,
            success: function (data, textStatus, jqXHR) {
                if (data.hadError && data.hadError === true) {
                    timeEntryHelper.ShowErrorsAndWarnings(data);
                    options.error(data);
                } else {
                    var grid = $('#detail_' + empId).data("kendoGrid");
                    var dsrc = grid.dataSource;
                    options.success(data.returnList);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                options.error(data);
            }
        });
    },

    createTimeHeader: function (empId) {
        var objectForServer = new Object();
        objectForServer.Day = dayAndWeekSelectionMenu.DateSelected();
        var emptyGuid = $('#hdnEmptyGuidVal').val();
        objectForServer.DailyId = emptyGuid;
        objectForServer.IsEdit = false;
        objectForServer.IsApprovable = false;
        objectForServer.HasInvalidEntries = false;

        var employeeRow = $.grep(jobCentricModel.EmployeeTimeCards, function (f) { return f.Employee.UserId === empId; });
        if (employeeRow.length > 0) {
            objectForServer.Employee = employeeRow[0].Employee;
        }
        return (objectForServer);
    },

    newRowStatus: function (empId) {
        var itemStatus = 1;
        var employeeRow = $.grep(jobCentricModel.EmployeeTimeCards, function (f) { return f.Employee.UserId === empId; });
        if (employeeRow.length > 0) {
            if (employeeRow[0].HourlyEntries) {
                var entries = $.grep(employeeRow[0].HourlyEntries, function (f) { return ((f.ItemStatus === 3) || (f.ItemStatus === 4)); });
                if (entries.length > 0)
                    itemStatus = entries[0].ItemStatus;
            }
        }
        return (itemStatus);
    },

    getURLForNewRow: function (itemStatus) {
        var urlToCall = global.GetBaseUrl() + "TimeEntryNew/";
        if (itemStatus === 3) {
            urlToCall += "SubmitChanges";
        }
        else if (itemStatus === 4) {
            urlToCall += "SubmitChangesAsSupervisorApproved";
        }
        else {
            urlToCall += "SaveChanges";
        }
        return (urlToCall);
    },

    // child grid
    createLineItem: function (options) {
        var empId = options.data.models[0].EmployeeUserId;
        var itemStatus = detailGridSection.newRowStatus(empId);
        var urlToCall = detailGridSection.getURLForNewRow(itemStatus);
        var objectForServer = detailGridSection.createTimeHeader(empId);

        detailGridSection.PrepareModelsForPersist(options.data.models);

        var entriesToSave = [];
        for (var j = 0; j < options.data.models.length; j++) {
            options.data.models[j].EntryId = $('#hdnEmptyGuidVal').val();
            options.data.models[j].ProjectId = jobCentricModel.CurrentProject.ProjectId;
            options.data.models[j].ItemStatus = itemStatus;
            options.data.models[j].IsEntryInvalid = false;
            options.data.models[j].IsLockedFromModification = false;
            entriesToSave.push(options.data.models[j]);
        }
        objectForServer.HourlyEntries = entriesToSave;
        objectForServer.TimeSpanEntries = [];
        timeEntryHelper.HideErrorsAndWarnings();

        $.ajax({
            url: urlToCall,
            type: 'POST',
            data: (itemStatus === 1) ? global.AddAntiForgeryToken({ json: JSON.stringify(objectForServer) }) : global.AddAntiForgeryToken({ json: JSON.stringify(objectForServer), allowEditSubmitted: true }),
            success: function (data) {
                if (data.hadError && data.hadError === true) {
                    timeEntryHelper.ShowErrorsAndWarnings(data);
                    options.error(data);
                } else {
                    var grid = $('#detail_' + empId).data("kendoGrid");
                    var dsrc = grid.dataSource;
                    options.success(data.HourlyEntries);
                }
            },
            error: function (jqXhr, textStatus, errorThrown) {
                options.error(data);
            }
        });
    },

    CanShowToolbar: function (gridData) {
        var showToolbar = true;

        if (!gridData) {
            return showToolbar;
        }

        if (!gridData.Entries || gridData.Entries.length === 0) {
            return showToolbar;
        }

        var allLocked = true;
        for (var i = 0; i < gridData.Entries.length; i++) {
            if (!gridData.Entries[i].IsLockedFromModification) {
                allLocked = false;
                break;
            }
        }

        if (!gridData.IsApprovable || allLocked === true) {
            showToolbar = false;
        }

        return showToolbar;
    },

    UpdateMasterDatasourceDetailEntries: function (employeeId, detailEntries) {
        var masterDatagrid = $("#jobCentricReviewGridArea").data("kendoGrid");
        var masterds = masterDatagrid.dataSource.data();

        var employeeRow = $.grep(masterds, function (f) { return f.EmpId === employeeId; });
        if (employeeRow.length > 0) {
            employeeRow[0].Entries = detailEntries;
            masterGrid.RecalculateTotals(employeeId);
        }
    }
};
