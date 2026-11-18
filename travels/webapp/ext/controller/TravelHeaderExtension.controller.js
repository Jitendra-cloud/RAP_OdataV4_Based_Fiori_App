
sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "travels/model/TravelSelectionModel"
], function (
    ControllerExtension,
    oSelectionModel
) {
    "use strict";

    return ControllerExtension.extend(
        "travels.ext.controller.TravelHeaderExtension",
        {
            override: {
                onInit: function () {
                    this.base.getView().setModel(
                        oSelectionModel,
                        "travelSelection"
                    );
                }
            }
        }
    );
});
