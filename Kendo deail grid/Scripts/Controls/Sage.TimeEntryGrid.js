var gridSection = {
    Projects:[],
    SubJobs: [],
    CostCodes: [],
    Employees:[],
    CurrentDataSet: null,
    HasUnfilledRow: false,
    HasEmptyTotalRow: false,
    WeekDays: [],
    HideNoteIcon: false,

    // create details grid
    CreateDetailGrid: function (container, config, detailModel) {
        var userId = detailModel.Employee.UserId;

        //create columns and fields
        var cols = gridSection.GetColumns(config);
        var fields = gridSection.GetFields(userId, config);
        
        //create dataset for the grid
        gridSection.CurrentDataSet = gridSection.GetKendoDataset(detailModel, config);

        $("<div id='detail_" + userId + "' class='timedetailGrid'/>").appendTo(container).kendoGrid({
            dataSource: {
                batch: true,
                requestEnd: function(e) {
                    console.log(e);
                },
                transport: {
                    read: function(options) {
                        options.success(gridSection.CurrentDataSet);
                    },
                    parameterMap: function(options, operation) {
                        if (operation !== "read" && options.models) {
                            return { models: kendo.stringify(options.models) };
                        }

                        return options;
                    }
                },
                schema: {
                    model: {
                        id: "EntryId",
                        fields: fields
                    },
                    errors: "errors"
                }
            },
            scrollable: false,
            sortable: false,
            pageable: false,
            editable: true,
            resizable: true,
            edit: function(p) {
                if (p.container.context !== undefined) {
                    var indexCell = p.container.context.cellIndex;

                    if (gridSection.IsReadOnly(p) && gridSection.HideNoteIcon) {
                        //Ignore edit if the entry is in approved state.
                        if (indexCell != 'undefined') {
                            this.closeCell();
                        }
                    }

                    //Ignore editing of select all, daynotes and totals row. Prevent editing Project for exisitng rows.
                    var entryId = p.model.EntryId;
                    if ((entryId == 1 || entryId == 2 || entryId == 3) || (config.ShowProjectColumn && indexCell == 1 && !p.model.IsNew)) {
                        this.closeCell();
                    }

                    //TODO: Need to fix this. Make cell read-only if all entries submitted for that row
                    //if ((p.model.Status == gridSection.GetStatus(8) || p.model.Status == gridSection.GetStatus(7)) && (indexCell == 1 || indexCell == 2 || indexCell == 3 || p.model.PayType == '')) {
                    //    this.closeCell();
                    //}

                }
            },
            save: function(p) {
                if ((p.values.Subjob) && (p.values.Subjob != p.model.Subjob)) {
                    p.container.parent().find('td[class*="costcode"]').html('').attr('class', 'costcode');
                    p.model.CostCode = '';
                }

                //Set Status New for a new entry
                $.each(p.values, function(prop, value) {
                    if (typeof prop == 'string' && prop.indexOf('D_') != -1) {
                        var statusDate = gridSection.GetDateFromDynamicColumnName(prop);
                        statusDate = gridSection.GetDynamicColumnNameFromDate("S_", statusDate);
                        if (p.model[statusDate] == "") {
                            p.model[statusDate] = gridSection.GetStatus(1);
                            return false;
                        }
                    }
                });

                //TODO: Need to fix this
                //var message = gridSection.GetValidationMessage(p);
                var that = this;
                //if (message == '') {
                    var dataSource = $('#detail_' + p.model.UserId).data('kendoGrid').dataSource;
                    var oldEntry = $.extend(true, {}, p.model);
                    var existingEntry = gridSection.IsExisitngEntry(p);

                    if (existingEntry != null) {
                        fancyConfirm($('#EntriesAlreadyExistsMessage').text(), function() {
                            gridSection.UpdateEntriesInDataSet(p, oldEntry, p.model.UserId, existingEntry);
                        }, function() {
                            that.cancelChanges();
                        });
                    } else {
                        if (!p.model.IsNew
                            && (p.values.Project || p.values.Subjob || p.values.CostCode || p.values.PayType)
                            && gridSection.IsFilledEntry(p.model)) {
                            dataSource._destroyed.push(oldEntry);
                        }
                    }
                //}
                //else {
                //    alert(message);
                //    this.cancelChanges();
                //}
                if (p.values.PayType && p.values.PayType != '' && p.container.context.className.indexOf('bakCLRIndianRed1') != -1) {
                    gridSection.DeleteInvalidEntryInModel(p.model);
                    p.container.context.className = p.container.context.className.split('bakCLRIndianRed1')[1];
                }
                gridSection.IsCurrentDirty = true;
            },
            error: function(e) {
                console.log(e.errors);
            },
            dataBound: gridSection.OnDataBound,
            toolbar: [
                { name: "cancel" },
                {
                    template: '#=gridSection.GetSaveChangesButton()#'
                },
                {
                    name: "create",
                    text: "Add time"
                }
            ],
            columns: cols
        });
    },

    GetColumns: function (config) {
        var cols = [
            {
                field: "PayType",
                title: "Pay Type",
                width: "90px",
                editable: true,
                editor: gridSection.PayTypeEditor,
                nullable: false,
                attributes: { "class": "paytype" }
            },
            {
                field: "Project",
                title: "<div style='cursor:pointer'><input class='approveAll' id='approveAllBox' type='checkbox' />Project</div>",
                width: "90px",
                editable: true,
                encoded: false,
                nullable: false,
                editor: gridSection.ProjectEditor,
                attributes: { "class": "project" },
                hidden: config.ShowProjectColumn ? false : true
            },
            {
                field: "Subjob",
                title: gridSection.GetSubjobTitle(),
                width: "90px",
                editable: true,
                editor: gridSection.SubJobEditor,
                encoded: false,
                nullable: false,
                attributes: { "class": "subjob" }
            },
            {
                field: "CostCode",
                title: "Cost Code",
                width: "90px",
                editable: true,
                editor: gridSection.CostCodeEditor,
                encoded: false,
                nullable: false,
                attributes: { "class": "costcode" }
            }
        ];

        for (var d in gridSection.WeekDays) {
            var weekEntry = gridSection.WeekDays[d];
            var day = weekEntry.DateString;
            var displayDay = weekEntry.DisplayDate;
            var dayOfWeek = weekEntry.DayOfWeek;
            var columnName = gridSection.GetDynamicColumnNameFromDate("D_", day);
            var noteColumnName = gridSection.GetDynamicColumnNameFromDate("N_", day);
            var statusColumnName = gridSection.GetDynamicColumnNameFromDate("S_", day);
            var isEditableColumnName = gridSection.GetDynamicColumnNameFromDate("E_", day);
            var idValue = columnName.substr(2);

            cols.push({
                field: columnName,
                title: dayOfWeek + "<br />" + displayDay + "<div style='width:100%; cursor:pointer'><input class='approvalBox approveThese' type='checkbox' id='" + idValue + "' /></div>",
                type: "number",
                width: "40px",
                encoded: false,
                editor: gridSection.HoursEditor,
                template: kendo.template("#if (" + columnName + " != null) {# \#=" + columnName + "\# #} else {# 0 #}#")
            });

            cols.push({
                field: noteColumnName,
                hidden: true
            });

            cols.push({
                field: statusColumnName,
                hidden: true
            });

            cols.push({
                field: isEditableColumnName,
                type: "boolean",
                hidden: true
            });
        }

        cols.push({
            field: "Totals",
            title: "Total",
            width: "50px",
            editable: false,
            encoded: false
        });

        cols.push({
            field: "Status",
            title: "Status",
            width: "80px",
            editable: false,
            encoded: false,
            hidden: config.ShowStatusColumn ? false : true
        });

        cols.push({
            field: "Reason",
            title: "Reason",
            editable: false,
            encoded: false,
            hidden: config.ShowReasonColumn ? false : true
        });


        cols.push({
            field: "Delete",
            width: "40px",
            title: " ",
            editable: false,
            template: kendo.template("#if (IsEditable || IsNew) {# <button type='button' href='javascript:void(0)' class='alignVert-m ui-state-default ui-corner-all btnA' id='deleteLine' style='padding-left: 5px !important; width: 95%;'><span class='k-icon k-delete'></span></a> #} else { # &nbsp #} #"),
            encoded: false,
            hidden: config.ShowDeleteColumn ? false : true
        });

        return cols;
    },
    
    GetFields: function (userId, config) {
        var fields = {
            EntryId: {
                editable: false,
                defaultValue: 3
            },
            UserId: {
                editable: false,
                defaultValue: userId
            },
            PayType: {
                defaultValue: ""
            },
            
            Project: {
                defaultValue: ""
            },
           
            Subjob: {
                defaultValue: ""
            },
            
            CostCode: {
                defaultValue: ""
            },
            IsNew: {
                defaultValue: true
            },
            IsEditable: {
                defaultValue: true
            }
        };

        for (var d in gridSection.WeekDays) {
            var weekEntry = gridSection.WeekDays[d];
            var columnName = gridSection.GetDynamicColumnNameFromDate("D_", weekEntry.DateString);
            var noteColumnName = gridSection.GetDynamicColumnNameFromDate("N_", weekEntry.DateString);
            var statusColumnName = gridSection.GetDynamicColumnNameFromDate("S_", weekEntry.DateString);
            var isEditableColumnName = gridSection.GetDynamicColumnNameFromDate("E_", day);
            
            fields[columnName] = {
                type: "string",
                defaultValue: '',
                nullable: false
            };

            fields[noteColumnName] = {
                editable: false
            };

            fields[statusColumnName] = {
                editable: false
            };
            fields[isEditableColumnName] = {
                editable: false,
                defaultValue: true,
                type: "boolean"
            };
        }

        fields['Totals'] = {
            editable: false,
            encoded: false
        };
        
        if (config.ShowStatusColumn) {
            fields['Status'] = {
                editable: false,
                defaultValue: gridSection.GetStatus(1)
            };
        }

        if (config.ShowReasonColumn) {
            fields['Reason'] = {
                editable: false
            };
        }

        if (config.ShowDeleteColumn) {
            fields['Delete'] = {
                editable: false,
                defaultValue: "<button type='button' href='javascript:void(0)' class='alignVert-m ui-state-default ui-corner-all btnA' id='deleteLine' style='padding-left: 5px !important; width: 95%;'><span class='k-icon k-delete'></span></a>",
                encoded: false
            };
        }

        return fields;
    },
    
    GetKendoDataset: function (detailModel, config) {
        var retVal = [];
        
        //create line items rows
        gridSection.CreateEntryRows(detailModel, config, retVal);

        //insert totals row
        var totalsRowSeed = gridSection.GetTotalsRow(detailModel, config);
        retVal.push(totalsRowSeed);

        //insert day notes row
        var noteRowSeed = gridSection.GetDayNotesRow(detailModel, config);
        retVal.push(noteRowSeed);

        if (config.CreateStatusRow) {
            //create status row
            var statusRowSeed = gridSection.GetStatusRow(detailModel, config);
            retVal.push(statusRowSeed);
        }
        
        //populate hours for line items
        gridSection.PopulateLineItems(detailModel, retVal);

        //remove empty rowseeds
        var actualRetVal = gridSection.RemoveEmptyObjects(detailModel, retVal);

        return actualRetVal;
    },

    CreateEntryRows: function (detailModel, config, retVal) {
        var id = 4;
        var userId = detailModel.Employee.UserId;
        for (var j in detailModel.StatusEntries) {
            var combo = detailModel.StatusEntries[j];
            if (!combo.IsDeleted) {
                var isNew = combo.IsNew;
                var rowSeed = {
                    EntryId: ++id,
                    IsNew: isNew,
                    UserId: userId,
                    PayType: combo.PayTypeName,
                    PayTypeId: combo.PayTypeId,
                    Project: combo.ProjectName,
                    ProjectId: combo.ProjectId,
                    Subjob: combo.SubjobName,
                    SubjobId: combo.SubjobId,
                    CostCode: combo.CostCodeName,
                    CostCodeId: combo.CostCodeId
                };

                for (var k in detailModel.WeekDays) {
                    var dateColumn = gridSection.GetDynamicColumnNameFromDate("D_", detailModel.WeekDays[k].DateString);
                    var statusColumn = gridSection.GetDynamicColumnNameFromDate("S_", detailModel.WeekDays[k].DateString);
                    var noteColumn = gridSection.GetDynamicColumnNameFromDate("N_", detailModel.WeekDays[k].DateString);
                    var isEditableColumn = gridSection.GetDynamicColumnNameFromDate("E_", detailModel.WeekDays[k].DateString);
                    rowSeed[dateColumn] = gridSection.CreateCell();
                    rowSeed[statusColumn] = '';
                    rowSeed[noteColumn] = '';
                    rowSeed[isEditableColumn] = true;
                }

                rowSeed["Totals"] = gridSection.GetTotalHoursForPayType(detailModel, combo.ProjectId, combo.SubjobId, combo.CostCodeId, combo.PayTypeId);

                if (config.ShowStatusColumn) {
                    //TODO: Need to fix this to get the row status based on the type of screen.
                    rowSeed["Status"] = gridSection.GetRowStatus(detailModel, combo.ProjectId, combo.SubjobId, combo.CostCodeId, combo.PayTypeId);
                }

                if (config.ShowReasonColumn) {
                    rowSeed["Reason"] = gridSection.GetRejectionReason(detailModel, combo.ProjectId, combo.SubjobId, combo.CostCodeId, combo.PayTypeId);
                }
                
                retVal.push(rowSeed);
            }
        }
    },

    GetTotalsRow: function (detailModel, config) {
        var userId = detailModel.Employee.UserId;

        var totalsRowSeed = {
            EntryId: 1,
            UserId: userId,
            PayType: "",
            Project: "",
            Subjob: "",
            CostCode: "Employee Total"
        };

        for (var j in gridSection.WeekDays) {
            var columnName = gridSection.GetDynamicColumnNameFromDate("D_", detailModel.WeekDays[j].DateString);
            totalsRowSeed[columnName] = gridSection.TotalHoursForDay(detailModel, detailModel.WeekDays[j].DateString);
        }
        var weekTotal = gridSection.GetTotalHours(detailModel);

        totalsRowSeed["Totals"] = weekTotal;

        if (config.ShowStatusColumn) {
            totalsRowSeed["Status"] = "";
        }

        if (config.ShowReasonColumn) {
            totalsRowSeed["Reason"] = "";
        }

        totalsRowSeed["Delete"] = "";

        return totalsRowSeed;
    },
    
    GetDayNotesRow: function (detailModel, config) {
        var userId = detailModel.Employee.UserId;

        var noteRowSeed = {
            EntryId: 2,
            UserId: userId,
            PayType: "",
            Project: "",
            Subjob: "",
            CostCode: "Notes"
        };

        //populate day notes row
        for (var j in gridSection.WeekDays) {
            var date = gridSection.WeekDays[j].DateString;
            var columnName = gridSection.GetDynamicColumnNameFromDate("D_", date);

            var note = "";
            for (var n in detailModel.DailyNotes) {
                if (detailModel.DailyNotes[n].TimeEntryDateString == date) {
                    note = detailModel.DailyNotes[n].DayNote;
                    break;
                }
            }
            noteRowSeed[columnName] = note === "" || note === "" ? "<span><span/>" : "<a href='javascript:void(0)' class='dayNotes' data-UserId='" + userId + "'  data-note = '" + global.HtmlEscape(note) + "'  data-date = '" + columnName + "'><img src='/Content/Icons/note_gray8_16_16_32.png' alt='Note' /></a>";
            var noteField = gridSection.GetDynamicColumnNameFromDate("N_", date);
            noteRowSeed[noteField] = note;
        }

        noteRowSeed["Totals"] = "";

        if (config.ShowStatusColumn) {
            noteRowSeed["Status"] = "";
        }

        if (config.ShowReasonColumn) {
            noteRowSeed["Reason"] = "";
        }

        noteRowSeed["Delete"] = "";
        
        return noteRowSeed;
    },

    GetStatusRow: function (detailModel, config) {
        var userId = detailModel.Employee.UserId;

        var statusRowSeed = {
            EntryId: 3,
            UserId: userId,
            PayType: "",
            Project: "",
            Subjob: "",
            CostCode: "Status"
        };
        for (var j in gridSection.WeekDays) {
            var columnName = gridSection.GetDynamicColumnNameFromDate("D_", detailModel.WeekDays[j].DateString);
            statusRowSeed[columnName] = gridSection.GetDayStatus(detailModel, detailModel.WeekDays[j].DateString);
        }
        
        statusRowSeed["Totals"] = "";

        if (config.ShowStatusColumn) {
            statusRowSeed["Status"] = "";
        }

        if (config.ShowReasonColumn) {
            statusRowSeed["Reason"] = "";
        }

        statusRowSeed["Delete"] = "";

        return statusRowSeed;
    },

    PopulateLineItems: function (detailModel, retVal) {
        for (var k in detailModel.StatusEntries) {
            var entry = detailModel.StatusEntries[k];
            //Populate date
            var targetDate = gridSection.GetDynamicColumnNameFromDate("D_", entry.TimeEntryDateString);
            var targetValue = gridSection.GetTimeCell(parseFloat(entry.Hours));
            gridSection.PopulateCell(retVal, entry.ProjectId, entry.CostCodeId, entry.SubjobId, entry.PayTypeId, targetDate, targetValue);

            //Populate status
            var targetStatus = gridSection.GetDynamicColumnNameFromDate("S_", entry.TimeEntryDateString);
            targetValue = gridSection.GetStatus(entry.Status);
            gridSection.PopulateCell(retVal, entry.ProjectId, entry.CostCodeId, entry.SubjobId, entry.PayTypeId, targetStatus, targetValue);

            //Populate entry note
            var targetNote = gridSection.GetDynamicColumnNameFromDate("N_", entry.TimeEntryDateString);
            targetValue = entry.TimeEntryNote;
            gridSection.PopulateCell(retVal, entry.ProjectId, entry.CostCodeId, entry.SubjobId, entry.PayTypeId, targetNote, targetValue);
            
            //Populate IsEditable
            var targetIsEditable = gridSection.GetDynamicColumnNameFromDate("E_", entry.TimeEntryDateString);
            targetValue = entry.IsEditable;
            gridSection.PopulateCell(retVal, entry.ProjectId, entry.CostCodeId, entry.SubjobId, entry.PayTypeId, targetIsEditable, targetValue);
        }
    },

    RemoveEmptyObjects: function (retVal) {
        var actualRetVal = [];
        for (var l in retVal) {
            var row = retVal[l];
            var hadData = false;

            for (var i in gridSection.WeekDays) {
                var weekDay = gridSection.WeekDays[i];
                var date = gridSection.GetDynamicColumnNameFromDate("D_", weekDay.DateString);
                if (row.IsNew || (row[date] != null && row[date] != "")) {
                    if ((row.IsNew && gridSection.IsEmptyRow(row)) ||
                    ((row.CostCode == null || row.CostCode == "" || row.PayType == null || row.PayType == "") && (row.Totals && (row.Totals == '0.00' || row.Totals == 0)))) {
                        continue;
                    }
                    hadData = true;
                    break;
                }
            }
            if (hadData)
                actualRetVal.push(row);
        }
        return actualRetVal;
    },

    GetTotalHoursForPayType: function (detailModel, projectId, jobId, costCodeId, payTypeId) {
        var totalHrs = 0;
        for (var i in detailModel.StatusEntries) {
            var entry = detailModel.StatusEntries[i];
            if (projectId == entry.ProjectId && jobId == entry.SubjobId && costCodeId == entry.CostCodeId && payTypeId == entry.PayTypeId) {
                totalHrs = totalHrs + parseFloat(entry.Hours);
            }
        }
        return totalHrs.toFixed(2);
    },
    
    TotalHoursForDay: function (detailModel, date) {
        var hours = 0;
        for (var i in detailModel.StatusEntries) {
            if (detailModel.StatusEntries[i].TimeEntryDateString == date) {
                hours = hours + parseFloat(detailModel.StatusEntries[i].Hours);
            }
        }

        return hours.toFixed(2);
    },
    
    GetTotalHours: function (detailModel) {
        var hours = 0;
        for (var i in detailModel.StatusEntries) {
            hours = hours + parseFloat(detailModel.StatusEntries[i].Hours);
        }

        return hours.toFixed(2);
    },

    GetTimeCell: function (hours) {
        var hr = (!hours || hours == 0) ? '' : hours;
        var ret = gridSection.CreateCell(hr);
        return ret;
    },

    CreateCell: function (hours) {
        if (hours && hours != '') {
            return hours.toFixed(2);
        }
        else {
            return '';
        }
    },

    PopulateCell: function (retVal, projectId, ccId, subjobId, payTypeId, prop, value) {
        for (var row in retVal) {
            if (retVal[row].ProjectId == projectId && retVal[row].SubjobId === subjobId && retVal[row].CostCodeId == ccId && retVal[row].PayTypeId == payTypeId) {
                retVal[row][prop] = value;
                return;
            }
        }
    },
    
    IsEmptyRow: function (row) {
        var emptyDatesCount = 0;
        $.each(gridSection.WeekDays, function () {
            var date = gridSection.GetDynamicColumnNameFromDate("D_", this.DateString);
            if (row[date] == "" && (row.Totals && (row.Totals != "0.00" && row.Totals != 0))) {
                emptyDatesCount++;
            }
        });

        return (emptyDatesCount == gridSection.WeekDays.length);
    },
    
    GetDayStatus: function (detailModel, date) {
        //TODO: Need to fix this code.
        var dayStatusEntries = $.grep(detailModel.StatusEntries, function (e) { return e.TimeEntryDateString == date; });
        if (dayStatusEntries && dayStatusEntries.length > 0) {
            if ($.grep(dayStatusEntries, function (e) { return e.Status == 2; }).length > 0) {
                return gridSection.GetStatus(2);
            } else if ($.grep(dayStatusEntries, function (e) { return e.Status == detailModel.DefaultStatus; }).length > 0) {
                return gridSection.GetStatus(detailModel.DefaultStatus);
            }
            else if ($.grep(dayStatusEntries, function (e) { return e.Status > detailModel.DefaultStatus; }).length > 0) {
                if ($.grep(dayStatusEntries, function (e) { return e.Status == 9; }).length > 0) {
                    return gridSection.GetStatus(9);
                }

                var nextStatus = (parseInt(detailModel.DefaultStatus) + 1);
                while (nextStatus == 8) {
                    if ($.grep(dayStatusEntries, function (e) { return e.Status == nextStatus; }).length == dayStatusEntries.length) {
                        return gridSection.GetStatus(nextStatus);
                    } else {
                        nextStatus = nextStatus + 1;
                    }
                }
               
            }
        }
        
        return detailModel.DefaultStatus;
    },
    
    IsReadOnly: function (p) {
        var userId = $(p.sender.element).attr("id").split('_')[1];
        var statusDate = p.container.find('.hours').attr('data-Date');
        var isReadOnly = false;
        var dataSource = $("#detail_" + userId).data("kendoGrid").dataSource;
        var data = dataSource.data();
        var entry = $.grep(data, function (e) {
            return (e.ProjectId == p.model.ProjectId
                && e.SubjobId == p.model.SubjobId
                && e.CostCodeId == p.model.CostCodeId
                && e.PayTypeId == p.model.PayTypeId
                && e.TimeEntryDateString == statusDate
                );
        })[0];

        if (entry) {
            isReadOnly = !(entry[gridSection.GetDynamicColumnNameFromDate("E_", statusDate)]);
        }

        return isReadOnly;
    },
    
    IsFilledEntry: function (entry) {
        if ((entry.Project != '' || entry.ProjectId) && (entry.Subjob != '' || entry.SubjobId) && (entry.CostCode != '' || entry.CostCodeId) && (entry.PayType != '' || entry.PayTypeId)) {
            return true;
        }
    },

    UpdateEntriesInDataSet: function (p, oldEntry, userId, existingEntry) {
        var grid = $("#detail_" + userId).data("kendoGrid");
        var dailyHours = gridSection.GetHoursByDayForEntry(p);
        for (var i in dailyHours) {
            if (dailyHours[i].Hours != "") {
                var dateColumnName = gridSection.GetDynamicColumnNameFromDate("D_", dailyHours[i].Date);
                var isEditableColumnName = gridSection.GetDynamicColumnNameFromDate("E_", dailyHours[i].Date);
                
                if (dailyHours[i].IsEditable && existingEntry[isEditableColumnName]) {
                    if ((existingEntry[dateColumnName] && existingEntry[dateColumnName] != '') && (dailyHours[i].Hours && dailyHours[i].Hours != '')) {
                        existingEntry[dateColumnName] = (parseFloat(existingEntry[dateColumnName]) + parseFloat(dailyHours[i].Hours)).toFixed(2);
                    }
                    else if (dailyHours[i].Hours && dailyHours[i].Hours != '') {
                        existingEntry[dateColumnName] = parseFloat(dailyHours[i].Hours).toFixed(2);
                    }
                    existingEntry.dirty = true;
                }
            }
        }

        var dataToRemove = null;
        var ds = grid.dataSource.data();
        var keepSourceEntry = false;

        $(ds).each(function (i) {
            if (this.uid == oldEntry.uid) {
                var that = this;
                keepSourceEntry = gridSection.IsCompletedEntryPresent(that);
                if (keepSourceEntry) {
                    $.each(oldEntry, function (prop) {
                        if (typeof prop == 'string' && prop.indexOf('D_') != -1) {
                            var date = gridSection.GetDateFromDynamicColumnName(prop);
                            var isEditableColumnName = gridSection.GetDynamicColumnNameFromDate("E_", date);
                            if (oldEntry[isEditableColumnName] && parseFloat(that[prop]) > 0) {
                                that[prop] = '';
                            }
                        }
                        else {
                            that[prop] = oldEntry[prop];
                        }
                    });
                    grid.refresh();
                }

                dataToRemove = that;
                return false;
            }
        });

        if (!keepSourceEntry) {
            grid.dataSource.remove(dataToRemove);

            //Delete element contains change value. So, replace deleted element with the old entry.
            grid.dataSource._destroyed.pop();
            grid.dataSource._destroyed.push(oldEntry);
        }
    },
    
    GetHoursByDayForEntry: function (p) {
        var dayHours = [];
        $.each(p.model, function (i, n) {
            if (i.indexOf("D_") >= 0) {
                var date = gridSection.GetDateFromDynamicColumnName(i);
                var isEditableColumnName = gridSection.GetDynamicColumnNameFromDate("E_", date);
                var isEditable = p.model[isEditableColumnName];
                if (p.values[i] !== undefined) {
                    dayHours.push({ Date: date, Hours: p.values[i], IsEditable: isEditable });
                } else {
                    dayHours.push({ Date: date, Hours: n, IsEditable: isEditable });
                }
            }
        });
        return dayHours;
    },
    
    IsCompletedEntryPresent: function (dataToRemove) {
        var isCompletedEntryPresent = false;

        $.each(dataToRemove, function (i) {
            if (i.indexOf("E_") >= 0 && !dataToRemove[i]) {
                isCompletedEntryPresent = true;
                return false;
            }
        });

        return isCompletedEntryPresent;
    },

    DeleteInvalidEntryInModel: function (oldEntry) {
        var ids = gridSection.GetIdsByNames(oldEntry);
        //TODO: Need to fix this.
        var employeeSummary = modelFromServer.GetTimeSummaryForEmployee(oldEntry.UserId);
        var entries = null;
        if (employeeSummary.EmployeeEntryDetails) {
            entries = employeeSummary.EmployeeEntryDetails.StatusEntries;
        }

        if (entries.length > 0) {
            $.each(oldEntry, function (i, value) {
                if (i.indexOf("D_") >= 0) {
                    var date = gridSection.GetDateFromDynamicColumnName(i);
                    if (value && value != '') {
                        $.each(entries, function () {
                            if (this.ProjectId == ids.ProjectId && this.SubjobId == ids.SubjobId && this.CostCodeId == ids.CostCodeId && this.PayTypeId == ids.PayTypeId
                            && this.TimeEntryDateString == date && !gridSection.IsCompletedEntry(this)) {
                                this.Hours = 0;
                                this.IsDeleted = true;
                            }
                        });
                    }
                }
            });
        }
    },
    
    OnDataBound: function (ev) {
        $(".k-detail-row").each(function () {
            $(this).css('background-color', '#CDE4B5');
        });

        var childGridId = "#" + $(ev.sender.element).attr("id");
        var childGrid = $(childGridId).data("kendoGrid");

        gridSection.ApplyStyles(childGrid);

        var btnId = childGridId + " tbody tr .k-grid-delete";
        $(btnId).each(function () {
            $(this).remove();
        });

        $("table tbody td").live('hover ontouchstart', function (e) {
            var childGridId = "#" + $(ev.sender.element).attr("id");
            gridSection.GenerateTooltips($(this), childGridId);
            e.preventDefault();
        });

        $(".k-grid-cancel-changes").click(function (e) {
            gridSection.IsCurrentDirty = false;
        });

        $(".grid-saveChanges").unbind("click").click(function (e) {
            var childGridId = "#" + $(ev.sender.element).attr("id");
            gridSection.SaveEntries(childGridId);
            e.stopPropagation();
        });
    },

    GenerateTooltips: function (that, childGridId) {
        var grid = $(childGridId).data("kendoGrid");
        if (grid && grid.dataItem(that.closest("tr"))) {
            var currentDataItem = grid.dataItem(that.closest("tr"));
            var header = that.closest('div').find('thead.k-grid-header').find('th').eq(that.index()).attr('data-field');
            if (currentDataItem && header && header.indexOf("D_") != -1 && currentDataItem.EntryId != 2) {
                var date = header.split('D_')[1];
                if (date && parseFloat(currentDataItem[header]) > 0) {
                    var note = '';
                    var status = gridSection.GetStatus(1);
                    if (!currentDataItem.IsNew) {
                        note = currentDataItem["N_" + date];
                        status = currentDataItem["S_" + date];
                    }
                    //If status is not unknown, add tooltip
                    if (status != gridSection.GetStatus(-1)) {
                        if (!note) {
                            note = '';
                        }
                        that.kendoTooltip({
                            position: "top",
                            content: function () {
                                return "<div class='txt-l txtSZ8em'><span>Status: " + status + "</span><br/>" + "<span>Note: " + note;
                            }
                        });
                    }
                }
            }
        }
    },

    ApplyStyles: function (grid) {
        if (grid) {
            grid.tbody.find("tr").each(function () {
                var that = $(this);
                var currentDataItem = grid.dataItem(that);
                if (gridSection.IsTimeEntryEntryItem(currentDataItem)) {
                    that.children('td').each(function () {
                        var header = $(this).closest('div').find('thead.k-grid-header').find('th').eq($(this).index()).attr('data-field');
                        if (header && header.indexOf("D_") != -1) {
                            var date = header.split('D_')[1];
                            if (date && parseFloat(currentDataItem[header]) > 0) {
                                var note = '';
                                var status = gridSection.GetStatus(1);
                                if (!currentDataItem.IsNew) {
                                    status = currentDataItem["S_" + date];
                                    note = currentDataItem['N_' + date];
                                }

                                //If status is rejected, mark hour red.
                                if (status == gridSection.GetStatus(9)) {
                                    $(this).addClass('clrRed');
                                }

                                //If status is completed, make background green.
                                if (status == gridSection.GetStatus(8) || status == gridSection.GetStatus(7)) {
                                    $(this).addClass('bakCLRSpringGreen1');
                                }
                                //Check if hour exceeded setting
                                if (!$(this).hasClass('clrRed') && !$(this).hasClass('bakCLRSpringGreen1') && gridSection.IsHourLimitExceeded(currentDataItem["PayTypeId"], $(this).html())) {
                                    $(this).addClass('bakCLRlightYellow');
                                }

                                //Apply color if any note exists.
                                if ((note && note != '') && (!$(this).hasClass('clrRed') && !$(this).hasClass('bakCLRlightYellow') && !$(this).hasClass('bakCLRSpringGreen1'))) {
                                    $(this).addClass('bakCLRblue2');
                                }
                            }
                            //Make totals row bold
                            if (currentDataItem.EntryId == 2 && $(this).html()) {
                                $(this).addClass('bold');
                            }

                            //Make Totals column bold
                            if (header && header == 'Totals' && $(this).html()) {
                                $(this).addClass('bold');
                            }
                        }

                        //highlight invalid paytype red
                        if (header && header == 'PayType' && (!currentDataItem['PayType'] || currentDataItem['PayType'] == '') && !currentDataItem.IsNew && currentDataItem.Status != gridSection.GetStatus(8) && currentDataItem.Status != gridSection.GetStatus(7)) {
                            $(this).addClass('bakCLRIndianRed1');
                        }

                        if (header && header == 'Status' && ($(this).html() == gridSection.GetStatus(8) || $(this).html() == gridSection.GetStatus(7))) {
                            //Make status green if completed
                            $(this).addClass('clrSpringGreen1');
                        }
                        else if (header && header == 'Status' && $(this).html() == gridSection.GetStatus(9)) {
                            //Make status red if rejected
                            $(this).addClass('clrRed');
                        }

                        //Mark reason for rejection red
                        if (header && header == 'Reason' && $(this).html()) {
                            $(this).addClass('clrRed');
                        }

                        //Make Totals column bold
                        if (header && header == 'Totals' && $(this).html()) {
                            $(this).addClass('bold');
                        }
                        //highlight 'Unknown' costcode in yellow
                        if (header && header == 'CostCode'
                    && (currentDataItem.CostCode && currentDataItem.CostCode.toLowerCase().indexOf($('#Unknown').text().toLowerCase()) != -1)) {
                            $(this).addClass('bakCLRlightYellow');
                        }
                    });


                }

                //Make totals row bold
                if (currentDataItem.EntryId == 2 && $(this).html()) {
                    $(this).addClass('bold');
                    $(this).children('td').each(function () {
                        var header = $(this).closest('div').prevAll('div.k-grid-header').find('th').eq($(this).index()).attr('data-field');
                        if (header && header == 'Totals' && (parseFloat($(this).html()) > gridSection.MaxWeeklyLimit())) {
                            $(this).addClass('bakCLRlightYellow');
                        }
                    });
                }
            });
        }
    },

    GetSaveChangesButton: function () {
        return '<a class="k-button k-button-icontext grid-saveChanges float-r" href="#" ><span class="k-icon k-update"/>Save changes</a>';
    },
    
    IsTimeEntryEntryItem: function (entry) {
        return (entry.EntryId != 1 && entry.EntryId != 2 && entry.EntryId != 3);
    },

    //The dynamic columns [Week Day Columns] get the name from the date they
    //represent. This method will take the date string and return the column name.
    GetDynamicColumnNameFromDate: function (prefix, dateString) {
        return prefix + dateString.replace(/\//g, "_");
    },

    GetDateFromDynamicColumnName: function (columnName) {
        return columnName.replace(/\_/g, "/").substr(2);
    },

    GetNewStatusEntry: function (projectId, jobId, costCodeId, payTypeId, date, hours, note) {
        var statusEntry = new Object;
        statusEntry.TimeEntryId = gridSection.GetEmptyGuid();
        statusEntry.TimeEntryStatusEntryId = gridSection.GetEmptyGuid();
        statusEntry.TimeEntryDate = date;
        statusEntry.TimeEntryDateString = date;
        statusEntry.Status = 1;
        statusEntry.ProjectId = projectId;
        statusEntry.SubjobId = jobId;
        statusEntry.CostCodeId = costCodeId;
        statusEntry.PayTypeId = payTypeId;
        statusEntry.Hours = hours;
        statusEntry.IsNew = true;
        statusEntry.IsDeleted = false;
        statusEntry.TimeEntryNote = note;
        statusEntry.Reason = '';
        return statusEntry;
    },

    GetIdsForEntry: function (entry) {
        var ids = new Object;
        ids.ProjectId = entry.ProjectId;
        ids.SubjobId = entry.SubjobId;
        ids.CostCodeId = entry.CostCodeId;
        ids.PayTypeId = entry.PayTypeId;

        return ids;
    },

    GetIdsByNames: function (entry, isDeletedEntry) {
        var ids = new Object;
        ids.ProjectId = gridSection.GetProjectIdByName(entry.Project);
        ids.SubjobId = gridSection.GetSubjobIdByName(entry.Subjob, ids.ProjectId);
        if (isDeletedEntry && (!ids.SubjobId || ids.SubjobId == '')) {
            ids.SubjobId = entry.SubjobId;
        }
        ids.CostCodeId = gridSection.GetCostCodeIdByName(entry.CostCode, ids.ProjectId, ids.SubjobId);
        if (isDeletedEntry && (!ids.CostCodeId || ids.CostCodeId == '')) {
            ids.CostCodeId = entry.CostCodeId;
        }
        ids.PayTypeId = gridSection.GetPayTypeIdByName(entry.PayType);

        if ((!ids.PayTypeId || ids.PayTypeId == '') && (entry.PayTypeId && entry.PayTypeId != '')) {
            ids.PayTypeId = entry.PayTypeId;
        }
        return ids;
    },
    
    GetStatus: function (status) {
        switch (status) {
            case 1:
                return $('#New').text();
            case 2:
                return $('#Saved').text();
            case 3:
                return $('#SupervisorReview').text();
            case 4:
                return $('#ProjectReview').text();
            case 5:
                return $('#PayrollReview').text();
            case 6:
                return $('#PayrollManagerApproved').text();
            case 7:
                return $('#Processing').text();
            case 8:
                return $('#Completed').text();
            case 9:
                return $('#Rejected').text();
            default:
                return $('#Unknown').text();
        }
    },
    
    GetMaximumHourForPaytype: function (payTypeId) {
        var maxHour = 24;
        if (payrollReview.CurrentTemplate) {
            $.each(payrollReview.CurrentTemplate.PayKinds, function () {
                if ($(this)[0].PayTypeId == payTypeId && $(this)[0].MaximumMinutes && $(this)[0].MaximumMinutes != '') {
                    maxHour = parseFloat(parseFloat($(this)[0].MaximumMinutes / 60).toFixed(2));
                    return false;
                }
            });
        }
        return maxHour;
    },
    
    GenerateGuid: function () {
        var newGuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        return newGuid;
    },
    
    /*---------------------------TODO: Region Need to be fixed---------------------------------------*/
    /*-----------------------------------------------------------------------------------------------*/
    GetSubjobTitle: function () {
        return $("#hdnSubjobCustomDescription").val();
    },

    GetSubjobNoneId: function () {
        return $("#hdnSubjobNoneId").val();
    },

    GetSubjobNoneName: function () {
        return $("#hdnSubjobNoneName").val();
    },

    GetProjectIdByName: function (projectName) {
        var projectId = null;
        $(modelFromServer.Projects).each(function () {
            if (this.ProjectName == projectName) {
                projectId = this.ProjectId;
                return false;
            }
        });
        return projectId;
    },

    GetSubjobIdByName: function (jobDescription, projectId) {
        var subjobId = gridSection.GetEmptyGuid();  //If subjob is None.
        var project = modelFromServer.GetProjectById(projectId);
        if (project != null) {
            $(project.ProjectSubJobs).each(function () {
                if (this.JobDescription == jobDescription) {
                    subjobId = this.SubjobId;
                    return false;
                }
            });
        }
        return subjobId;
    },

    GetCostCodeIdByName: function (costcodeName, projectId, subjobId) {
        var costCodeId = null;
        var project = modelFromServer.GetProjectById(projectId);

        if (project != null) {
            //Make subjob to empty string for Subjob 'None'.
            if (subjobId == gridSection.GetEmptyGuid()) {
                subjobId = '';
            }

            $(project.ProjectCostCodes).each(function () {
                if (this.SubjobId == subjobId && this.CostCodeName == costcodeName) {
                    costCodeId = this.CostCodeId;
                    return false;
                }
            });
        }
        return costCodeId;
    },

    GetPayTypeIdByName: function (payTypeName) {
        var payTypeId = null;
        $(modelFromServer.CurrentPolicyPayTypes).each(function () {
            if (this.PayTypeName == payTypeName) {
                payTypeId = this.PayTypeId;
                return false;
            }
        });
        return payTypeId;
    },
    
    IsHourLimitExceeded: function (payTypeId, hour) {
        if (!hour || hour == '' || !payTypeId) {
            return false;
        }
        return (parseFloat(hour) > gridSection.GetMaximumHourForPaytype(payTypeId));
    },

    GetNewOrUpdatedRecords: function (grid) {
        //get the new and the updated records
        var currentData = grid.dataSource.data();

        var data = new Object;
        data.UpdatedRecords = [];
        data.NewRecords = [];

        for (var i = 0; i < currentData.length; i++) {
            if (currentData[i].isNew()) {
                //this record is new
                data.NewRecords.push(currentData[i].toJSON());
            }
            if (!currentData[i].isNew() && currentData[i].dirty) {
                //this record is updated
                data.UpdatedRecords.push(currentData[i].toJSON());
            }
        }

        return data;
    },

    SaveEntries: function (childGridId) {
        var grid = $(childGridId).data("kendoGrid");
        var userId = childGridId.split('_')[1];
        if (grid) {
            var data = gridSection.GetNewOrUpdatedRecords(grid);

            if (!gridSection.HasEmptyPayType(userId)) {
                if (!gridSection.HasUnfilledRow) {
                    gridSection.HasUnfilledRow = gridSection.HasUnfilledRows(userId);
                }

                if (!gridSection.HasEmptyTotalRow) {
                    gridSection.HasEmptyTotalRow = gridSection.HasAnyEmptyTotalRow(userId);
                }

                if (gridSection.HasUnfilledRow || gridSection.HasEmptyTotalRow) {
                    var message = gridSection.HasEmptyTotalRow ? $('#ZeroHoursEntryMessage').text() : $('#DeleteUnfilledRowsMessage').text();

                    gridSection.HasUnfilledRow = false;
                    gridSection.HasEmptyTotalRow = false;

                    fancyConfirm(message, function () {
                        var employeesToSave = gridSection.GetObjectForServer(data, grid, userId);
                        gridSection.Save(employeesToSave);
                        $("#jQueryUIconfirmBox").dialog("close");
                    });
                } else {
                    gridSection.HasUnfilledRow = false;
                    gridSection.HasEmptyTotalRow = false;

                    var employeesToSave = gridSection.GetObjectForServer(data, grid, userId);
                    if (employeesToSave) {
                        gridSection.Save(employeesToSave);
                    }
                }
            }
        }
    },

    GetObjectForServer: function (data, grid, userId) {
        var employeeSummary = modelFromServer.GetTimeSummaryForEmployee(userId);
        var employeesToSave = [];
        var statusEntriesModel = [];

        var employeeSummaryModel = new Object;
        employeeSummaryModel.UserId = userId;
        employeeSummaryModel.WeekStartDateString = modelFromServer.CurrentWeekStartDateString;

        if (employeeSummary.EmployeeEntryDetails != null) {
            var employeeDetailsModel = new Object;

            if (data.NewRecords.length > 0) {
                //Populate status entries from new records
                gridSection.PopulateStatusEntries(grid, employeeSummary, data.NewRecords, 'create', statusEntriesModel);
            }

            if (data.UpdatedRecords.length > 0) {
                //Populate status entries from updated records
                gridSection.PopulateStatusEntries(grid, employeeSummary, data.UpdatedRecords, 'update', statusEntriesModel);
            }

            //Get deleted records
            var deletedRecords = [];
            for (var i = 0; i < grid.dataSource._destroyed.length; i++) {
                deletedRecords.push(grid.dataSource._destroyed[i].toJSON());
            }

            if (deletedRecords.length > 0) {
                //Populate status entries from deleted records
                gridSection.PopulateStatusEntries(grid, employeeSummary, deletedRecords, 'delete', statusEntriesModel);
            }


            //Populate invalid entries for delete.
            $.each(employeeSummary.EmployeeEntryDetails.StatusEntries, function () {
                if (!this.IsNew && this.PayTypeName == '') {
                    this.IsDeleted = true;
                    this.Hours = 0;
                    statusEntriesModel.push(this);
                }
            });

            employeeDetailsModel.DailyNotes = employeeSummary.EmployeeEntryDetails.DailyNotes;
            employeeDetailsModel.StatusEntries = statusEntriesModel;

            employeeSummaryModel.EmployeeEntryDetails = employeeDetailsModel;
            employeesToSave.push(employeeSummaryModel);
        }

        return employeesToSave;
    },

    PopulateStatusEntries: function (grid, employeeSummary, entries, action, statusEntriesModel) {
        $.each(entries, function () {
            var entry = this;

            var ids = gridSection.GetIdsByNames(entry, action == 'delete');

            //Remove unfilled entries from dataSource
            if (entry.IsNew && gridSection.IsTimeEntryEntryItem(entry) && (!gridSection.IsAnyHourEntered(entry) || ids.ProjectId == '' || ids.SubjobId == '' || ids.CostCodeId == '')) {
                grid.dataSource.remove(entry);
                grid.refresh();
                return;
            }

            //Remove entries from deleted list if it exists in entries to be updated.
            if (action != 'delete' && (grid.dataSource && grid.dataSource._destroyed.length > 0)) {
                var matchingEntry = gridSection.IsEntryExistsInDestroyedList(grid.dataSource._destroyed, ids);
                if (matchingEntry) {
                    grid.dataSource._destroyed.splice(matchingEntry, 1);
                }
            }

            for (var property in entry) {
                if (property.substring(0, 2) == 'D_') {
                    var isExisitngEntry = false;
                    var date = gridSection.GetDateFromDynamicColumnName(property);
                    var entryNoteField = gridSection.GetDynamicColumnNameFromDate('N_', date);
                    var statusField = gridSection.GetDynamicColumnNameFromDate('S_', date);
                    if (gridSection.IsTimeEntryEntryItem(entry)) {
                        var hours = parseFloat(entry[property]);
                        $.each(employeeSummary.EmployeeEntryDetails.StatusEntries, function () {
                            if (this.ProjectId == ids.ProjectId
                                && this.SubjobId == ids.SubjobId
                                && this.CostCodeId == ids.CostCodeId
                                && this.PayTypeId == ids.PayTypeId
                                && this.TimeEntryDateString == date) {
                                isExisitngEntry = true;
                                if (!gridSection.IsCompletedEntry(this)) {
                                    if (!hours || hours == 0 || action == 'delete') {
                                        this.Hours = 0;
                                        this.IsDeleted = true;
                                        this.TimeEntryNote = '';
                                    } else {
                                        if (this.Hours != hours) {
                                            this.Hours = hours;
                                        }

                                        this.TimeEntryNote = entry[entryNoteField];
                                    }
                                    statusEntriesModel.push(this);
                                }
                                return false;
                            }
                        });

                        //add if new status entry
                        if (!isExisitngEntry && (hours && hours > 0) && action != 'delete' && (ids.ProjectId && ids.SubjobId && ids.CostCodeId && ids.PayTypeId) && (entry[statusField] != gridSection.GetStatus(7) && entry[statusField] != gridSection.GetStatus(8))) {
                            var entryNote = entry[entryNoteField];
                            if (!entryNote) {
                                entryNote = '';
                            }
                            statusEntriesModel.push(gridSection.GetNewStatusEntry(ids.ProjectId, ids.SubjobId, ids.CostCodeId, ids.PayTypeId, date, hours, entryNote));
                        }
                    }
                    else if (entry.EntryId == 1) {
                        //Update day notes in the model
                        $.each(employeeSummary.EmployeeEntryDetails.DailyNotes, function () {
                            if ((this.DayNote && this.TimeEntryDateString == date) && (entry[entryNoteField] && (this.DayNote != entry[entryNoteField]))) {
                                this.DayNote = entry[entryNoteField];
                            }
                        });
                    }
                }
            }
        });
    },

    Save: function (employeesToSave) {
        //Remove the Master Grid expand/collapse icon, so that,
        //user would not be able to expand any other grid while
        //any Detail Grid save is in progress.
        $('td.k-hierarchy-cell .k-icon').removeClass();

        $.ajax({
            type: "POST",
            url: gridSection.GetTimeEntryPayrollBaseUrl() + "/UpdateTimeEntries",
            data: global.AddAntiForgeryToken({ json: JSON.stringify(employeesToSave), weekStartDate: modelFromServer.CurrentWeekStartDateString, policyId: modelFromServer.CurrentTemplateId, isToApprove: false }),
            context: this,
            success: function (data, textStatus, jqXHR) {
                gridSection.HasUnfilledRow = false;
                gridSection.HasEmptyTotalRow = false;
                if (data.hadError && data.hadError === true && data.errorDescription) {
                    global.HandleAjaxError(data);
                } else {
                    gridSection.ShowActionBar(false);
                    var employeeSummary = modelFromServer.GetTimeSummaryForEmployee(employeesToSave[0].UserId);
                    employeeSummary.EmployeeEntryDetails = data;
                    gridSection.IsCurrentDirty = false;
                    masterGrid.UpdateGridData(modelFromServer.CurrentWeekStartDateString);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                gridSection.HasUnfilledRow = false;
                gridSection.HasEmptyTotalRow = false;
                var errorMessage = $.validator.format($('#ErrorSavingTimecard').text(), errorThrown);
                alert(errorMessage);
            }
        });
    },

    HasUnfilledRows: function (userId) {
        var hasUnFilledEntry = false;

        var grid = $("#detail_" + userId).data("kendoGrid");
        if (grid && grid.dataSource) {
            $.each(grid.dataSource.view(), function () {
                if (gridSection.IsTimeEntryEntryItem(this) && (this.Subjob == '' || this.Project == '' || this.CostCode == '')) {
                    hasUnFilledEntry = true;
                    return false;
                }
            });
        }
        return hasUnFilledEntry;
    },

    HasAnyEmptyTotalRow: function (userId) {
        var hasUnFilledHour = false;

        var grid = $("#detail_" + userId).data("kendoGrid");
        if (grid && grid.dataSource) {
            $.each(grid.dataSource.view(), function () {
                if (gridSection.IsTimeEntryEntryItem(this) && !gridSection.IsAnyHourEntered(this)) {
                    hasUnFilledHour = true;
                    return false;
                }
            });
        }
        return hasUnFilledHour;
    },

    IsAnyHourEntered: function (entry) {
        var isAnyHourEntered = false;
        $.each(gridSection.WeekDays, function () {
            var dateColumn = gridSection.GetDynamicColumnNameFromDate("D_", this.DateString);
            if (entry[dateColumn] && entry[dateColumn] != '' && parseFloat(entry[dateColumn]) != 0) {
                isAnyHourEntered = true;
                return false;
            }
        });

        return isAnyHourEntered;
    },

    IsExisitngEntry: function (p) {
        //Validate for existing items
        var userId = $(p.sender.element).attr("id").split('_')[1];
        var existingEntry = null;
        if (p.values.Project) {
            existingEntry = gridSection.IsEntryExists(userId, p.values.Project, p.model.Subjob, p.model.CostCode, p.model.PayType);
        }
        else if (p.values.Subjob) {
            existingEntry = gridSection.IsEntryExists(userId, p.model.Project, p.values.Subjob, p.model.CostCode, p.model.PayType);
        }
        else if (p.values.CostCode) {
            existingEntry = gridSection.IsEntryExists(userId, p.model.Project, p.model.Subjob, p.values.CostCode, p.model.PayType);
        }
        else if (p.values.PayType) {
            existingEntry = gridSection.IsEntryExists(userId, p.model.Project, p.model.Subjob, p.model.CostCode, p.values.PayType);
        }

        return existingEntry;
    },

    IsEntryExists: function (userId, projectName, subJobName, costCodeName, payTypeName) {
        if (projectName && subJobName && costCodeName && payTypeName) {
            var dataSource = $("#detail_" + userId).data("kendoGrid").dataSource;
            var data = dataSource.data();
            var existingEntry = null;
            $.each(data, function (index, item) {
                if (gridSection.IsTimeEntryEntryItem(item)) {
                    if (item.Project == projectName && item.Subjob == subJobName && item.CostCode == costCodeName && item.PayType == payTypeName) {
                        existingEntry = item;
                        return false;
                    }
                }
            });
        }
        return existingEntry;
    },

    IsDayTotalExceeded: function (grid, p, statusDate) {
        var weekTotal = 0;
        $.each(grid.dataSource.view(), function () {
            if (gridSection.IsTimeEntryEntryItem(this)) {
                var dayHr = parseFloat(this[statusDate]);
                if (dayHr > 0) {
                    weekTotal = weekTotal + dayHr;
                }
            }
        });
        if (parseFloat(p.model[statusDate]) <= 0 || p.model[statusDate] == "") {
            p.model[statusDate] = 0;
        }
        return (((parseFloat(weekTotal) - parseFloat(p.model[statusDate])) + parseFloat(p.values[statusDate])) > 24);
    },

    ToggleCheckbox: function (id) {
        var checkBoxes = $("#" + id);
        var shouldCheck = !(checkBoxes.attr("checked"));

        checkBoxes.attr("checked", shouldCheck);
    },

    ProjectEditor: function (container, options) {
        var projects = [];
        $(modelFromServer.Projects).each(function () {
            if (this.ProjectName != gridSection.GetProjectTitle()) {
                projects.push({ "ProjectId": this.ProjectId, "ProjectName": this.ProjectName });
            }
        });
        $('<input required data-text-field="ProjectName" data-value-field="ProjectName" data-bind="value:' + options.field + '"/>')
        .appendTo(container)
        .kendoDropDownList({
            dataTextField: "ProjectName",
            dataValueField: "ProjectId",
            dataSource: projects,
            optionLabel: " ",
            index: 0
        });
    },

    SubJobEditor: function (container, options) {
        gridSection.SubJobs = [];
        var projectId = options.model.ProjectId ? options.model.ProjectId : gridSection.GetProjectIdByName(options.model.Project);
        if (projectId) {
            var project = modelFromServer.GetProjectById(projectId);
            if (project != null) {
                $(project.ProjectSubJobs).each(function () {
                    if (this.JobDescription != gridSection.GetSubjobNoneName()) {
                        gridSection.SubJobs.push({ "SubjobId": this.JobId, "SubjobName": this.JobDescription });
                    }
                });
                if ($.grep(gridSection.SubJobs, function (e) { return e.JobId == gridSection.GetSubjobNoneId(); }).length < 1) {
                    gridSection.SubJobs.unshift({ "SubjobId": gridSection.GetSubjobNoneId(), "SubjobName": gridSection.GetSubjobNoneName() });
                }

            }
            $('<input required data-text-field="SubjobName" data-value-field="SubjobName" data-bind="value:' + options.field + '"/>')
                .appendTo(container)
                .kendoDropDownList({
                    dataTextField: "SubjobName",
                    dataValueField: "SubjobId",
                    dataSource: gridSection.SubJobs,
                    optionLabel: " ",
                    index: 0
                });
        }
    },

    CostCodeEditor: function (container, options) {
        gridSection.CostCodes = [];
        var projectId = options.model.ProjectId ? options.model.ProjectId : gridSection.GetProjectIdByName(options.model.Project);
        var jobId = gridSection.GetSubjobIdByName(options.model.Subjob, projectId);
        if (projectId && jobId) {
            var project = modelFromServer.GetProjectById(projectId);
            if (jobId == gridSection.GetEmptyGuid()) {
                jobId = "";
            }
            if (project != null) {
                $(project.ProjectCostCodes).each(function () {
                    if (this.SubjobId == jobId) {
                        gridSection.CostCodes.push({ "CostCodeId": this.CostCodeId, "CostCodeName": this.CostCodeName });
                    }
                });
            }
            $('<input required data-text-field="CostCodeName" data-value-field="CostCodeName" data-bind="value:' + options.field + '"/>')
                .appendTo(container)
                .kendoDropDownList({
                    dataTextField: "CostCodeName",
                    dataValueField: "CostCodeId",
                    optionLabel: " ",
                    dataSource: gridSection.CostCodes,
                    index: 0
                });
        }
    },

    PayTypeEditor: function (container, options) {
        var payTypes = [];

        $(modelFromServer.CurrentPolicyPayTypes).each(function () {
            if (this.PayTypeName != gridSection.GetPayTypeTitle()) {
                payTypes.push({ "PayTypeId": this.PayTypeId, "PayTypeName": this.PayTypeName });
            }
        });

        $('<input required data-text-field="PayTypeName" data-value-field="PayTypeName" data-bind="value:' + options.field + '"/>')
        .appendTo(container)
        .kendoDropDownList({
            dataTextField: "PayTypeName",
            dataValueField: "PayTypeId",
            dataSource: payTypes,
            optionLabel: " ",
            index: 0
        });
    },

    HoursEditor: function (container, options) {
        var ids = gridSection.GetIdsByNames(options.model);
        var date = gridSection.GetDateFromDynamicColumnName(options.field);
        var noteColumn = gridSection.GetDynamicColumnNameFromDate('N_', date);
        var statusColumn = gridSection.GetDynamicColumnNameFromDate('S_', date);
        var note = options.model[noteColumn];
        var status = options.model[statusColumn];
        var hours = options.model[options.field];

        if (note == null) {
            note = '';
        }

        if ((status != gridSection.GetStatus(8)) && (status != gridSection.GetStatus(7))) {
            var span = $('<span></span>').appendTo(container);
            $('<input style="width:35px" class="hours" data-Date="' + date + '" name="' + options.field + '" data-bind="value:' + options.field + '" ></input>')
            .appendTo(span)
                    .kendoNumericTextBox({
                        min: 0,
                        max: 24,
                        spinners: false
                    });
        }
        else {
            $('<span class="hours" data-Date="' + date + '">' + hours + '</span>').appendTo(container);
        }

        gridSection.HideNoteIcon = false; //If entry is completed and there is no note entered, do not show note icon.
        if ((status == gridSection.GetStatus(8) || status == gridSection.GetStatus(7)) && (!note || note == '')) {
            gridSection.HideNoteIcon = true;
        }
        else if (!hours || hours == '') {
            gridSection.HideNoteIcon = true;
        }

        if (!gridSection.HideNoteIcon) {
            var noteIcon = "<a  href='#' class='editEntryNote sca-icon sca-icon-note'" + "data-Note='" + global.HtmlEscape(note) + "' data-UserId='" + options.model.UserId + "' data-date='" + date + "' data-status='" + status +
              "' data-ProjectId='" + ids.ProjectId + "'  data-SubjobId='" + ids.SubjobId + "'  data-CostCodeId='" + ids.CostCodeId + "' data-PayTypeId='" + ids.PayTypeId + "'>" +
              "</a>";
            $(noteIcon).appendTo(container);
        }


        $("[data-role='numerictextbox']").focus(function () {
            var input = $(this);
            setTimeout(function () {
                input.select();
            });
        });

        $('.hours').on('focusout', function (event) {
            if (global.GetBrowser().browser != 'Explorer') {
                event.stopPropagation();
            }
        });

        $('.editEntryNote').on('click', function (event) {
            event.preventDefault();
            isDayNote = false;
            dialogDate = $(this).attr('data-date');
            dialogStatus = $(this).attr('data-status');
            dialogUserId = $(this).attr('data-UserId');
            dialogProjectId = $(this).attr('data-ProjectId');
            dialogSubjobId = $(this).attr('data-SubjobId');
            dialogCostCodeId = $(this).attr('data-CostCodeId');
            dialogPayTypeId = $(this).attr('data-PayTypeId');
            dialogNote = gridSection.GetEntryNote(dialogUserId, dialogDate, dialogProjectId, dialogSubjobId, dialogCostCodeId, dialogPayTypeId);
            $('#currentEntryId').val(dialogDate);
            $('#currentEntryNote').val($("<div />").text(dialogNote).text());

            //Don't show page save prompt on click of note
            if (gridSection.IsCurrentDirty) {
                $('#notesWindow').data('isCurrentDirty', true);
                gridSection.IsCurrentDirty = false;
            }

            $("#notesWindow").dialog('open');
        });
    },

    UpdateSelectedCheckboxList: function (userId, checkedDate) {
        var employeeSummary = modelFromServer.GetTimeSummaryForEmployee(userId);
        $(employeeSummary.EmployeeEntryDetails.WeekDays).each(function () {
            if (this.DateString == checkedDate) {
                this.DateSelected = true;
                return false;
            }
        });
    },

    RemoveSelectedCheckboxList: function (userId, checkedDate) {
        var employeeSummary = modelFromServer.GetTimeSummaryForEmployee(userId);
        $(employeeSummary.EmployeeEntryDetails.WeekDays).each(function () {
            if (this.DateString == checkedDate) {
                this.DateSelected = false;
                return false;
            }
        });
    },

    SelectAllCheckbox: function (userId) {
        var employeeSummary = modelFromServer.GetTimeSummaryForEmployee(userId);
        $(employeeSummary.EmployeeEntryDetails.WeekDays).each(function () {
            this.DateSelected = true;
        });
    },

    UnselectAllCheckbox: function (userId) {
        var employeeSummary = modelFromServer.GetTimeSummaryForEmployee(userId);
        $(employeeSummary.EmployeeEntryDetails.WeekDays).each(function () {
            this.DateSelected = false;
        });
    },

    InitNoteDialog: function () {
        $("#notesWindow").dialog({
            autoOpen: false,
            title: "Edit Note",
            width: 300,
            position: global.dialogPosition,
            modal: true,
            closeOnEscape: true,
            open: function () {
                if (!isDayNote && dialogStatus && (dialogStatus == gridSection.GetStatus(8) || dialogStatus == gridSection.GetStatus(7))) {
                    $("#dlgNoteSave").attr('disabled', 'disabled');
                }
            },
            buttons: [
            {
                text: "Save",
                id: "dlgNoteSave",
                click: function () {
                    var newNote = $('#currentEntryNote').val();

                    if (isDayNote) {
                        gridSection.UpdateDataSetForDayNote(dialogUserId, newNote, dialogDate);
                    }
                    else {
                        gridSection.UpdateDataSetForEntryNote(dialogUserId, newNote, dialogDate, dialogProjectId, dialogCostCodeId, dialogSubjobId, dialogPayTypeId);
                    }

                    dialogNote = null;
                    dialogDate = null;
                    $('#currentEntryId').val('');
                    $('#currentEntryNote').val('');
                    gridSection.IsCurrentDirty = true;
                    $('#dlgNoteSave').removeAttr('disabled');
                    $(this).dialog("close");
                }
            },
            {
                text: "Cancel",
                id: "dlgNoteCancel",
                click: function () {
                    dialogNote = null;
                    dialogDate = null;
                    $('#currentEntryId').val('');
                    $('#currentEntryNote').val('');
                    if ($("#notesWindow").data('isCurrentDirty')) {
                        gridSection.IsCurrentDirty = true;
                    }
                    $('#dlgNoteSave').removeAttr('disabled');
                    $(this).dialog("close");
                }
            }
            ]
        });
    },

    UpdateDataSetForDayNote: function (userId, newNote, date) {
        var columnName = gridSection.GetDynamicColumnNameFromDate("N_", date);
        var grid = $("#detail_" + userId).data("kendoGrid");
        $.each(grid.dataSource.data(), function () {
            if (this.EntryId == 1 && this[columnName] != newNote) {
                this[columnName] = newNote;
                this.dirty = true;
                return false;
            }
        });
    },

    UpdateDataSetForEntryNote: function (userId, newNote, date, projectId, costCodeId, subJobId, payTypeId) {
        var columnName = gridSection.GetDynamicColumnNameFromDate("N_", date);
        var grid = $("#detail_" + userId).data("kendoGrid");
        $.each(grid.dataSource.data(), function () {
            if (gridSection.IsTimeEntryEntryItem(this)) {
                if (this.ProjectId == projectId
                && this.SubjobId == subJobId
                && this.CostCodeId == costCodeId
                && this.PayTypeId == payTypeId
                && this[columnName] != newNote) {
                    this[columnName] = newNote;
                    this.dirty = true;
                    return false;
                }
            }
        });
    },

    GetDayNote: function (userId, date) {
        var note = '';
        var columnName = gridSection.GetDynamicColumnNameFromDate("N_", date);
        var grid = $("#detail_" + userId).data("kendoGrid");
        $.each(grid.dataSource.data(), function () {
            if (this.EntryId == 1) {
                note = this[columnName];
                return false;
            }
        });

        return note;
    },

    GetEntryNote: function (userId, date, projectId, jobId, costCodeId, payTypeId) {
        var note = '';
        var columnName = gridSection.GetDynamicColumnNameFromDate("N_", date);
        var grid = $("#detail_" + userId).data("kendoGrid");
        $.each(grid.dataSource.data(), function () {
            if (gridSection.IsTimeEntryEntryItem(this) && this.ProjectId == projectId && this.CostCodeId == costCodeId && this.SubjobId == jobId && this.PayTypeId == payTypeId) {
                note = this[columnName];
                return false;
            }
        });

        return note;
    },

    IsCompletedEntry: function (entry) {
        return (entry.Status == 6 || entry.Status == 7 || entry.Status == 8);
    },

    IsUnfilledRowsExists: function (employeesToApprove) {
        var hasInvalidEntries = false;
        $.each(employeesToApprove, function () {
            if (this.EmployeeEntryDetails && this.EmployeeEntryDetails.StatusEntries.length > 0) {
                $.each(this.EmployeeEntryDetails.StatusEntries, function () {
                    if ((this.ProjectId == null || this.ProjectId == '')
                    || (this.CostCodeId == null || this.CostCodeId == '')
                    || (this.PayTypeId == null || this.PayTypeId == '')
                    || (this.Hours == '0.00' && !this.IsDeleted)) {
                        hasInvalidEntries = true;
                        return false;
                    }
                });
            }
        });
        return hasInvalidEntries;
    },
    
    GetRowStatus: function (detailModel, projectId, jobId, costCodeId, payTypeId) {
        if (gridSection.CheckForRejectedStatus(detailModel, projectId, jobId, costCodeId, payTypeId)) {
            return gridSection.GetStatus(9);
        }
        else if (gridSection.CheckForProcessingStatus(detailModel, projectId, jobId, costCodeId, payTypeId)) {
            return gridSection.GetStatus(7);
        }
        else if (gridSection.CheckForCompletedStatus(detailModel, projectId, jobId, costCodeId, payTypeId)) {
            return gridSection.GetStatus(8);
        }
        else if (gridSection.CheckForNewStatus(detailModel, projectId, jobId, costCodeId, payTypeId)) {
            return gridSection.GetStatus(1);
        }
        return gridSection.GetStatus(5);
    },

    CheckForNewStatus: function (detailModel, projectId, jobId, costCodeId, payTypeId) {
        var rowEntryCount = 0;
        var newEntryCount = 0;
        //If all entries are new return true
        $.each(detailModel.StatusEntries, function () {
            if (this.ProjectId == projectId && this.CostCodeId == costCodeId && this.SubjobId == jobId && this.PayTypeId == payTypeId) {
                rowEntryCount++;
                if (this.Status == 1) {
                    newEntryCount++;
                }
            }
        });

        return newEntryCount == rowEntryCount;
    },

    CheckForRejectedStatus: function (detailModel, projectId, jobId, costCodeId, payTypeId) {
        var isRejected = false;
        //If any one entry is rejected, return
        $.each(detailModel.StatusEntries, function () {
            if (this.ProjectId == projectId && this.CostCodeId == costCodeId && this.SubjobId == jobId && this.PayTypeId == payTypeId && this.Status == 9) {
                isRejected = true;
                return false;
            }
        });

        return isRejected;
    },

    CheckForProcessingStatus: function (detailModel, projectId, jobId, costCodeId, payTypeId) {
        var rowEntryCount = 0;
        var processingEntryCount = 0;
        var completedEntryCount = 0;
        //If all entries are new return true
        $.each(detailModel.StatusEntries, function () {
            if (this.ProjectId == projectId && this.CostCodeId == costCodeId && this.SubjobId == jobId && this.PayTypeId == payTypeId) {
                rowEntryCount++;
                if (this.Status == 7) {
                    processingEntryCount++;
                }
                else if (this.Status == 8) {
                    completedEntryCount++;
                }
            }
        });

        if (processingEntryCount == rowEntryCount) {
            return true;
        }
        else if (processingEntryCount > 0 && (processingEntryCount + completedEntryCount) == rowEntryCount) {
            return true;
        }

        return false;
    },

    CheckForCompletedStatus: function (detailModel, projectId, jobId, costCodeId, payTypeId) {
        var rowEntryCount = 0;
        var approvedEntryCount = 0;

        //If all entries are new return true
        $.each(detailModel.StatusEntries, function () {
            if (this.ProjectId == projectId && this.CostCodeId == costCodeId && this.SubjobId == jobId && this.PayTypeId == payTypeId) {
                rowEntryCount++;
                if (gridSection.IsCompletedEntry(this)) {
                    approvedEntryCount++;
                }
            }
        });

        return (approvedEntryCount == rowEntryCount);
    },

    GetRejectionReason: function (detailModel, projectId, jobId, costCodeId, payTypeId) {
        var reason = '';
        $.each(detailModel.StatusEntries, function () {
            if (this.ProjectId == projectId && this.CostCodeId == costCodeId && this.SubjobId == jobId && this.PayTypeId == payTypeId) {
                if (this.Status == 9) {
                    reason = reason + this.TimeEntryDateString + ": " + this.Reason + "<br/>";
                }
            }
        });
        return reason;
    },

    GetValidationMessage: function (p) {
        var userId = $(p.sender.element).attr("id").split('_')[1];
        var statusDate;

        $.each(p.values, function (prop, value) {
            if (typeof prop == 'string' && prop.indexOf('D_') != -1) {
                statusDate = prop;
                return false;
            }
        });

        if (statusDate) {
            var grid = $("#detail_" + userId).data("kendoGrid");
            var hourForDay = p.values[statusDate];
            if (grid && grid.dataSource && hourForDay && hourForDay != '') {
                if (parseFloat(hourForDay) >= 0) {
                    if (gridSection.IsDayTotalExceeded(grid, p, statusDate)) {
                        return $('#MaximumHoursForDayExceeded').text();
                    }
                }
                else {
                    return $('#InvalidTimeEntered').text();
                }
            }
        }
        return '';
    }
    /*-----------------------------------------------------------------------------------------------*/
    /*----------------------------End of region------------------------------------------------------*/
};

function TimeEntryGrid(opts) {
    /////////////////////////////////////
    //     Options
    var that = this;

    this.options = {
        container: null,
        data: null,
        config: null,
        employees: null,
        projects: null,
        subJobs: null,
        costCodes: null,
        endPoint: null,
        onInitailize: null
    };

    //Apply options
    for (var key in opts) {
        that.options[key] = opts[key];
    }

    ////////////////////////////////////
    //      Private Helpers
    var IsJQElement = function (thing) {
        return (thing.html && thing.html != null && typeof thing.html == "function");
    };


    ////////////////////////////////////
    //      Public Methods
    
    this.EventCallback = function (evt, args) {
        if (evt) {
            evt(args);
        }
    };
    
    this.Load = function () {

        var container = that.options.container;
        
        if (!container)
            throw "container is a required setting for the SageTimeEntryGrid object";

        if (!IsJQElement(container)) {
            container = $("#" + container);
        }
        
        if (!that.options.data) {
            return;
        }
        
        gridSection.WeekDays = that.options.data.WeekDays;
        gridSection.Projects = that.options.projects;
        gridSection.SubJobs = that.options.subJobs;
        gridSection.CostCodes = that.options.costCodes;
        gridSection.Employees = that.options.employees;
        gridSection.CreateDetailGrid(container, that.options.config, that.options.data);
        
        that.EventCallback(that.options.onInitialize, that);
    };

   
}