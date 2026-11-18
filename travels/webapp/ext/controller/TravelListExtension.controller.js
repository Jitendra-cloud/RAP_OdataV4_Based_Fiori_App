sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/Label",
    "sap/m/Text",
    "sap/ui/model/json/JSONModel",
    "sap/ui/layout/form/SimpleForm",
    "sap/ui/core/Title",
    "sap/m/MessageBox"
], function (
    ControllerExtension,
    Dialog,
    Button,
    VBox,
    Label,
    Text,
    JSONModel,
    SimpleForm,
    Title,
    MessageBox
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

    return ControllerExtension.extend("travels.ext.controller.TravelListExtension", {
        /**
         * Enable the toolbar action only when exactly one Travel row is selected.
         */
        isSingleSelectionEnabled: function (oBindingContext, aSelectedContexts) {
            return Array.isArray(aSelectedContexts) && aSelectedContexts.length === 1;
        },

        /**
         * Display the selected Travel record in a read-only form.
         * Uses the public Fiori elements ExtensionAPI and OData V4 Context API.
         */
        onShowSelectedTravel: async function () {
            const oExtensionAPI = this.base.getExtensionAPI();
            const aSelectedContexts = oExtensionAPI.getSelectedContexts();

            if (aSelectedContexts.length !== 1) {
                MessageBox.information("Select exactly one Travel record first.");
                return;
            }

            const oSelectedContext = aSelectedContexts[0];
            const oData = {};

            try {
                await Promise.all(aFields.map(async function (oField) {
                    oData[oField.name] = await oSelectedContext.requestProperty(oField.name);
                }));
            } catch (oError) {
                MessageBox.error("Unable to read the selected Travel record. " + (oError.message || ""));
                return;
            }

            const oModel = new JSONModel(oData);
            const aFormContent = [new Title({ text: "Travel Information" })];

            aFields.forEach(function (oField) {
                aFormContent.push(new Label({ text: oField.label }));
                aFormContent.push(new Text({
                    text: {
                        path: "/" + oField.name,
                        formatter: function (vValue) {
                            if (vValue === null || vValue === undefined || vValue === "") {
                                return "—";
                            }
                            return String(vValue);
                        }
                    },
                    wrapping: oField.name === "Description"
                }));
            });

            const oForm = new SimpleForm({
                editable: false,
                layout: "ResponsiveGridLayout",
                labelSpanXL: 4,
                labelSpanL: 4,
                labelSpanM: 4,
                labelSpanS: 12,
                adjustLabelSpan: false,
                emptySpanXL: 0,
                emptySpanL: 0,
                emptySpanM: 0,
                emptySpanS: 0,
                columnsXL: 1,
                columnsL: 1,
                columnsM: 1,
                singleContainerFullSize: true,
                content: aFormContent
            });

            const oWatermarkContainer = new VBox({
                width: "100%",
                items: [oForm]
            }).addStyleClass("travelDetailsWatermark");
            oWatermarkContainer.setModel(oModel);

            const oDialog = new Dialog({
                title: "Selected Travel Details",
                contentWidth: "42rem",
                content: [oWatermarkContainer],
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
        }
    });
});
