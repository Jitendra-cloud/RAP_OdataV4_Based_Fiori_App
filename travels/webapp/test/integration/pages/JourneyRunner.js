sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"travels/test/integration/pages/TravelList.gen",
	"travels/test/integration/pages/TravelObjectPage.gen"
], function (JourneyRunner, TravelListGenerated, TravelObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('travels') + '/test/flp.html#app-preview',
        pages: {
			onTheTravelListGenerated: TravelListGenerated,
			onTheTravelObjectPageGenerated: TravelObjectPageGenerated
        },
        async: true
    });

    return runner;
});

