/* Feature script loader config */
(function initFeatureLoaderConfig() {
  if (window.sgcuFeatureLoaderConfig) return;
  window.sgcuFeatureLoaderConfig = {
    pageScripts: {
      "borrow-assets": "js/app.borrow-assets.js?v=20260414-7",
      "borrow-assets-staff": "js/app.borrow-assets.js?v=20260414-7",
      "meeting-room-booking": "js/app.meeting-room-booking.js?v=20260415-12",
      "meeting-room-staff": "js/app.meeting-room-staff.js?v=20260415-3",
      "budget-approval-request": "js/app.budget-request.js?v=20260414-1"
    },
    idlePrefetchPages: [
      "borrow-assets",
      "meeting-room-booking",
      "borrow-assets-staff",
      "meeting-room-staff",
      "budget-approval-request"
    ]
  };
})();
