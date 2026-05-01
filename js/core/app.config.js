/* App configuration (loaded before app.core.js) */
const SGCU_APP_CONFIG = {
  sheets: {
    projects:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSfcEartu_DeoGQXOJ7_rYPGizNtDhYJEaXivywadNZibj1rch9WKC1GF1yNbZ3zRgQ4Efjj8jrTOrf/pub?output=csv",
    projectContacts:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSfcEartu_DeoGQXOJ7_rYPGizNtDhYJEaXivywadNZibj1rch9WKC1GF1yNbZ3zRgQ4Efjj8jrTOrf/pub?gid=427464098&single=true&output=csv",
    orgStructure:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSiGgrustQXlqTrRlPj2sY7pkI7slLhTFSIKjPDHenzt0ddhhoQA6VHbffoiT29J2Hk1ndxYGKVSZ4B/pub?output=csv",
    downloads:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTburYaUshqF-DOvbwOEinWik0KXNwqqJLfO6frlxUn1iEsLu5RzkNoum4KgnWeSwBdo4--B1eScRD5/pub?output=csv",
    scoreboard:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_oiV1Ntv0x8UuRBKyvl9tTaUxrKkvImEmyFUU4oPp0pSKnLHOjJIz574Te4l25Y2IKFbLMaFlp3UW/pub?gid=676554954&single=true&output=csv",
    news:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLaBypwNGVEZHCjCxQDSLn8s7tTx1EKAIKuYjL7oIx7_fmssMnAcq9hpLyC4N5TvwIhrzwtZxxCAe0/pub?output=csv",
    orgFilters:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vT3mW8GVPRgbiURGAx59WyB3TZT5GbKoXJxHxmgpU2LRd_jgow9JBwXVjtjJRvfIgYYL5MKLLuZEddd/pub?output=csv"
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
