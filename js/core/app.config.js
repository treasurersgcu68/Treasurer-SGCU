/* App configuration (loaded before app.core.js) */
const SGCU_APP_CONFIG = {
  sheets: {
    projectSources:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQoybDIWotYcgg-UWuRAUvbEkmWrdIbKbHWANHRyzta4i7CCNR5dKPVi_40ruIxrvbVMtsxrUUagrEx/pub?output=csv",
    orgStructure:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSiGgrustQXlqTrRlPj2sY7pkI7slLhTFSIKjPDHenzt0ddhhoQA6VHbffoiT29J2Hk1ndxYGKVSZ4B/pub?output=csv",
    downloads:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTburYaUshqF-DOvbwOEinWik0KXNwqqJLfO6frlxUn1iEsLu5RzkNoum4KgnWeSwBdo4--B1eScRD5/pub?output=csv",
    news:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLaBypwNGVEZHCjCxQDSLn8s7tTx1EKAIKuYjL7oIx7_fmssMnAcq9hpLyC4N5TvwIhrzwtZxxCAe0/pub?output=csv",
    orgFilters:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vT3mW8GVPRgbiURGAx59WyB3TZT5GbKoXJxHxmgpU2LRd_jgow9JBwXVjtjJRvfIgYYL5MKLLuZEddd/pub?output=csv",
    borrowAssets:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQcx0zotyWntFscUtgXHg4dkJQ6xI16Xrasy58sQfr-29iwgdpujpuvLC7poHH3TG4KR6P36A-bLyZR/pub?gid=0&single=true&output=csv"
  },
  managementLinks: {
    projectSources:
      "https://docs.google.com/spreadsheets/d/1YmrHUdwdCGErwuMOlm9ohEFDvJkeeSq8AKNUu4h6c8c/edit?usp=sharing",
    orgStructure:
      "https://docs.google.com/spreadsheets/d/1vWD8BwJm_gk8Jrww8gwKEdRHc6lu6xSzJHDR7b5_4KY/edit?usp=sharing",
    news:
      "https://docs.google.com/spreadsheets/d/1QrlqwCsSg-vZZtFIESdLSAaFekHX5HoIS6oyl9v-LWk/edit?usp=sharing",
    downloads:
      "https://docs.google.com/spreadsheets/d/17-Gh5J6heNjjHlxSAoFy_pDmXY7aTIQQUB4VzdWQSp4/edit?usp=sharing",
    orgFilters:
      "https://docs.google.com/spreadsheets/d/19ncbNPEVXoTMGXQeKAvY88Dsr4a-Xy35-VyekQj8xdk/edit?usp=sharing",
    borrowAssets: ""
  },
  firestore: {
    collections: {
      auditLogs: "auditLogs",
      appSettings: "appSettings",
      borrowAssetRequests: "borrowAssetRequests",
      borrowAssetRequestsFallback: "borrowAssetsRequests",
      borrowAssetStockReservations: "borrowAssetStockReservations",
      budgetApprovalRequests: "budgetApprovalRequests",
      budgetApprovalSettings: "budgetApprovalSettings",
      meetingRoomBookings: "meetingRoomBookings",
      meetingRoomHolidays: "meetingRoomHolidays",
      meetingRooms: "meetingRooms",
      organizationRepresentativeApplications: "organizationRepresentativeApplications",
      staffApplications: "staffApplications",
      staffPositionCatalog: "staffPositionCatalog",
      staffPositionCodeCounters: "staffPositionCodeCounters",
      staffProfiles: "staffProfiles",
      userProfiles: "userProfiles"
    },
    docs: {
      budgetApprovalSettings: "global"
    }
  },
  features: {
    borrowAssets: {
      useCsvAssetCatalog: true,
      enableAssetAvailabilityCheck: false
    }
  },
  org: {
    defaultBaseGroups: [
      "ชมรมฝ่ายศิลปะและวัฒนธรรม",
      "ชมรมฝ่ายวิชาการ",
      "ชมรมฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์",
      "ชมรมฝ่ายกีฬา",
      "องค์การบริหารสโมสรนิสิต",
      "สภานิสิต",
      "องค์การบริหารสโมสรนิสิต, สภานิสิต"
    ]
  },
  auth: {
    sessionMaxAgeMs: 7 * 24 * 60 * 60 * 1000,
    staffEmailLegacyColumn: -1
  },
  cache: {
    ttlMs: 3 * 60 * 1000,
    keys: {
      PROJECTS: "sgcu_cache_projects",
      NEWS: "sgcu_cache_news",
      DOWNLOADS: "sgcu_cache_downloads",
      ORG_FILTERS: "sgcu_cache_org_filters",
      SCOREBOARD: "sgcu_cache_scoreboard"
    }
  }
};

globalThis.SGCU_APP_CONFIG = SGCU_APP_CONFIG;
