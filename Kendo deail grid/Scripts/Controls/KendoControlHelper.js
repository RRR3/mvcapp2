//dataSource is optional
function CreateKendoDropDown(newControlId, dataTextField, dataValueField, makeItComboBox, placeholder, dataSource, cascadeFrom) {
    if (newControlId.indexOf("#") != 0) {
        newControlId = "#" + newControlId;
    }
    if (placeholder == null) placeholder = "";
    if (makeItComboBox) {
        $(newControlId).kendoComboBox({
            dataTextField: dataTextField,
            dataValueField: dataValueField,
            filter: "contains",
            suggest: true,
            dataSource: dataSource ? dataSource : [],
            placeholder: placeholder,
            highLightFirst: false,
            cascadeFrom: cascadeFrom ? cascadeFrom : ""
        });
    } else {
        $(newControlId).kendoDropDownList({
            dataTextField: dataTextField,
            dataValueField: dataValueField,
            filter: "contains",
            suggest: true,
            dataSource: dataSource ? dataSource : [],
            highLightFirst: false,
            cascadeFrom: cascadeFrom ? cascadeFrom : ""
        });
    }

}

function ClearControlDatasource(newControlIds) {
    for (var i in newControlIds) {
        if (newControlIds[i].indexOf("#") != 0) {
            newControlIds[i] = "#" + newControlIds[i];
        }
        var dropdowntype = $(newControlIds[i]).attr("data-role");
        var control = null;
        if (dropdowntype == "combobox") {
            control = $(newControlIds[i]).data("kendoComboBox");
        }
        if (dropdowntype == "dropdownlist") {
            control = $(newControlIds[i]).data("kendoDropDownList");
        }
        control.value("");
        control.setDataSource([]);
    }
}

function PrefillDropdownControlValue(controlId, selectedValue) {
    if (controlId.indexOf("#") != 0) {
        controlId = "#" + controlId;
    }
    if ($(controlId).length == 0) return;

    var dropdowntype = $(controlId).attr("data-role");
    var control = null;
    if (dropdowntype == "combobox") {
        control = $(controlId).data("kendoComboBox");
    }
    if (dropdowntype == "dropdownlist") {
        control = $(controlId).data("kendoDropDownList");
    }
    control.value(selectedValue);
}