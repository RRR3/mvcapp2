$(function () {

    var titleActionBar = [
        {
            id: "thingLauraInsistsHaveADifferentLabel",
            name: "Hide Map",
            action: ToggleMap
        }
    ];
    SageWidgetGlobal.cssClasses = ['sageWidget'];

    var w = new SageWidget({
        displayDiv: $("#projectWidget"),
        sourceType: WidgetSources.PreLoaded,
        title: 'My Project Map',

        isSuperWidget: false
    });
    w.Load();
    w.SetHeaderActionBar(titleActionBar);
});
