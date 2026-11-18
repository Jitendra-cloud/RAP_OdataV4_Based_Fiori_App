
sap.ui.define([
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/Label",
    "sap/m/Text",
    "sap/ui/layout/form/SimpleForm",
    "sap/ui/core/Title",
    "sap/m/MessageBox",
    "travels/model/TravelSelectionModel"
], function (
    Dialog,
    Button,
    VBox,
    Label,
    Text,
    SimpleForm,
    Title,
    MessageBox,
    oSelectionModel
) {
    "use strict";

    const aFields = [
        { name: "TravelID", label: "Travel ID" },
        { name: "AgencyID", label: "Agency ID" },
        { name: "CustomerID", label: "Customer ID" },
        { name: "Description", label: "Description" },
        { name: "BeginDate", label: "Starting Date" },
        { name: "EndDate", label: "End Date" },
        { name: "TotalPrice", label: "Total Price" }
    ];

    let iRequestCounter = 0;

    function getEmptyData() {
        return {
            TravelID: "",
            AgencyID: "",
            CustomerID: "",
            Description: "",
            BeginDate: "",
            EndDate: "",
            TotalPrice: ""
        };
    }

    function formatValue(vValue) {
        if (vValue === null || vValue === undefined || vValue === "") {
            return "—";
        }

        if (vValue instanceof Date) {
            return vValue.toLocaleDateString();
        }

        return String(vValue);
    }

    return {

        // Called by Fiori elements when table selection changes
        onSelectionChanged: function (oBindingContext, aSelectedContexts) {

            const iCurrentRequest = ++iRequestCounter;

            if (!aSelectedContexts || aSelectedContexts.length !== 1) {
                oSelectionModel.setData(getEmptyData());
                return false;
            }

            const oSelectedContext = aSelectedContexts[0];

            // Clear previous selection while new values are loaded
            oSelectionModel.setData(getEmptyData());

            Promise.all(
                aFields.map(function (oField) {
                    return oSelectedContext.requestProperty(oField.name);
                })
            ).then(function (aValues) {

                // Ignore an older request if selection changed again
                if (iCurrentRequest !== iRequestCounter) {
                    return;
                }

                const oData = {};

                aFields.forEach(function (oField, iIndex) {
                    oData[oField.name] = aValues[iIndex];
                });

                oSelectionModel.setData(oData);

            }).catch(function (oError) {

                if (iCurrentRequest === iRequestCounter) {
                    oSelectionModel.setData(getEmptyData());
                    console.error(
                        "Unable to load selected Travel details:",
                        oError
                    );
                }
            });

            return true;
        },

        // Existing Display Selected Travel button
        onShowSelectedTravel: async function (
            oBindingContext,
            aSelectedContexts
        ) {
            if (!aSelectedContexts || aSelectedContexts.length !== 1) {
                MessageBox.information(
                    "Please select exactly one Travel record."
                );
                return;
            }

            const oSelectedContext = aSelectedContexts[0];

            try {
                const oData = {};

                await Promise.all(
                    aFields.map(async function (oField) {
                        oData[oField.name] =
                            await oSelectedContext.requestProperty(oField.name);
                    })
                );

                const aFormContent = [
                    new Title({ text: "Travel Information" })
                ];

                aFields.forEach(function (oField) {
                    aFormContent.push(
                        new Label({ text: oField.label })
                    );

                    aFormContent.push(
                        new Text({
                            text: formatValue(oData[oField.name]),
                            wrapping: oField.name === "Description"
                        })
                    );
                });

                const oForm = new SimpleForm({
                    editable: false,
                    layout: "ResponsiveGridLayout",
                    labelSpanXL: 4,
                    labelSpanL: 4,
                    labelSpanM: 4,
                    labelSpanS: 12,
                    columnsXL: 1,
                    columnsL: 1,
                    columnsM: 1,
                    content: aFormContent
                });

                const oContainer = new VBox({
                    width: "100%",
                    items: [oForm]
                }).addStyleClass("travelDetailsWatermark");

                const oDialog = new Dialog({
                    title: "Selected Travel Details",
                    contentWidth: "42rem",
                    content: [oContainer],
                    resizable: true,
                    draggable: true,
                    stretchOnPhone: true,
                    endButton: new Button({
                        text: "Close",
                        press: function () {
                            oDialog.close();
                        }
                    }),
                    afterClose: function () {
                        oDialog.destroy();
                    }
                });

                oDialog.open();

            } catch (oError) {
                MessageBox.error(
                    "Unable to read the selected Travel record. " +
                    (oError.message || "")
                );
            }
        }
    };
});
