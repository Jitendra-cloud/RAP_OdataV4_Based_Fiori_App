
sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function (JSONModel) {
    "use strict";

    const oSelectionModel = new JSONModel({
        TravelID: "",
        AgencyID: "",
        CustomerID: "",
        Description: "",
        BeginDate: "",
        EndDate: "",
        TotalPrice: ""
    });

    return oSelectionModel;
});
