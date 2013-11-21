$(function () {
    SageWidgetGlobal.cssClasses = ['sageWidget'];

    var w = new SageWidget({
        displayDiv: $("#reportingWidget"),
        sourceType: WidgetSources.PreLoaded,
        
        title: "My Project Reports",
        
        isSuperWidget: true,
        onSuperWidgetActivate: function (widget) {
            $("#reportingWidgetView").fadeOut(250, function () {
                $("#reportingSuperWidgetView").fadeIn(250, function () {
                    $("#projectReports").show();
                    $('#projectReportSpinner').hide();
                    $("#projectReports").jstree("open_all");
                });
            });
        },
        onSuperWidgetClose: function (widget) {
            $("#reportingSuperWidgetView").fadeOut(250, function () { $("#reportingWidgetView").fadeIn(250); });
        }
    });
    w.Load();
});
