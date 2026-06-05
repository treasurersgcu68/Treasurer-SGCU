/* Staff application + approval flow */
function initStaffAccessPages() {
  if (window.__sgcuStaffAccessInitDone) return;
  window.__sgcuStaffAccessInitDone = true;

  const applicationModalEl = document.getElementById("staffApplicationModal");
  const applicationModalCloseEl = document.getElementById("staffApplicationModalClose");
  const applicationModalOpenEl = document.getElementById("loginHelpApplyBtn");
  const approvalPageEl = document.querySelector('.page-view[data-page="staff-approval"], .page-view[data-page="org-representative-approval-staff"]');
  if (!applicationModalEl && !approvalPageEl) return;

  const appFormEl = document.getElementById("staffApplicationForm");
  const appPositionEl = document.getElementById("staffApplicationPosition");
  const appProfileHintEl = document.getElementById("staffApplicationProfileHint");
  const appStudentFieldsEl = document.getElementById("staffApplicationStudentFields");
  const appDivisionLabelEl = document.getElementById("staffApplicationDivisionLabel");
  const appDivisionEl = document.getElementById("staffApplicationDivision");
  const appLevelLabelEl = document.getElementById("staffApplicationLevelLabel");
  const appLevelEl = document.getElementById("staffApplicationLevel");
  const appResolvedPositionEl = document.getElementById("staffApplicationResolvedPosition");
  const appSubmitEl = document.getElementById("staffApplicationSubmitBtn");
  const appMessageEl = document.getElementById("staffApplicationMessage");
  const myTableBodyEl = document.getElementById("staffApplicationMyTableBody");
  const myCaptionEl = document.getElementById("staffApplicationListCaption");

  const approvalPanelTitleEl = document.getElementById("staffApprovalPanelTitle");
  const approvalPanelCaptionEl = document.getElementById("staffApprovalPanelCaption");
  const approvalBodyEl = document.getElementById("staffApprovalPendingBody");
  const approvalCaptionEl = document.getElementById("staffApprovalPendingCaption") || approvalPanelCaptionEl;
  const approvalMessageEl = document.getElementById("staffApprovalMessage");
  const approvalPendingContentEl = document.getElementById("staffApprovalPendingContent");
  const approvalHistoryContentEl = document.getElementById("staffApprovalHistoryContent");
  const approvalHistoryBodyEl = document.getElementById("staffApprovalHistoryBody");
  const approvalHistoryCaptionEl = document.getElementById("staffApprovalHistoryCaption");
  const approvalDetailModalEl = document.getElementById("staffApprovalDetailModal");
  const approvalDetailCloseEl = document.getElementById("staffApprovalDetailClose");
  const approvalDetailBodyEl = document.getElementById("staffApprovalDetailBody");
  const approvalPendingPanelEl = document.getElementById("staffApprovalPendingPanel");
  const approvalShowPendingBtnEl = document.getElementById("staffApprovalShowPendingBtn");
  const approvalShowHistoryBtnEl = document.getElementById("staffApprovalShowHistoryBtn");
  const staffApprovalPendingCountEl = document.getElementById("staffApprovalPendingCount");
  const staffApprovalApprovedCountEl = document.getElementById("staffApprovalApprovedCount");
  const staffApprovalPositionCountEl = document.getElementById("staffApprovalPositionCount");
  const staffApprovalTypeStaffBtnEl = document.getElementById("staffApprovalTypeStaffBtn");
  const staffApprovalTypeOrgBtnEl = document.getElementById("staffApprovalTypeOrgBtn");
  const staffApprovalStaffSectionEl = document.getElementById("staffApprovalStaffSection");
  const staffApprovalMainApprovalTabEl = document.getElementById("staffApprovalMainApprovalTab");
  const staffApprovalMainStructureTabEl = document.getElementById("staffApprovalMainStructureTab");
  const staffApprovalMainPanelEl = document.getElementById("staffApprovalMainPanel");
  const staffStructurePanelEl = document.getElementById("staffStructurePanel");
  const orgRepresentativeApprovalSectionEl = document.getElementById("orgRepresentativeApprovalSection");
  const orgRepresentativePanelTitleEl = document.getElementById("orgRepresentativeApprovalPanelTitle");
  const orgRepresentativePanelCaptionEl = document.getElementById("orgRepresentativeApprovalPanelCaption");
  const orgRepresentativePendingContentEl = document.getElementById("orgRepresentativePendingContent");
  const orgRepresentativeHistoryContentEl = document.getElementById("orgRepresentativeHistoryContent");
  const orgRepresentativePendingBodyEl = document.getElementById("orgRepresentativePendingBody");
  const orgRepresentativeHistoryBodyEl = document.getElementById("orgRepresentativeHistoryBody");
  const orgRepresentativeHistoryCaptionEl = document.getElementById("orgRepresentativeHistoryCaption");
  const orgRepresentativeMessageEl = document.getElementById("orgRepresentativeApprovalMessage");
  const orgRepresentativeOverviewContentEl = document.getElementById("orgRepresentativeOverviewContent");
  const orgRepresentativeOverviewBodyEl = document.getElementById("orgRepresentativeOverviewBody");
  const orgRepresentativeShowOverviewBtnEl = document.getElementById("orgRepresentativeShowOverviewBtn");
  const orgRepresentativeExportCsvBtnEl = document.getElementById("orgRepresentativeExportCsvBtn");
  const orgRepresentativeShowPendingBtnEl = document.getElementById("orgRepresentativeShowPendingBtn");
  const orgRepresentativeShowHistoryBtnEl = document.getElementById("orgRepresentativeShowHistoryBtn");
  const orgRepresentativeSearchInputEl = document.getElementById("orgRepresentativeSearchInput");
  const orgRepresentativeStatusFilterEl = document.getElementById("orgRepresentativeStatusFilter");
  const orgRepresentativeAcademicYearFilterEl = document.getElementById("orgRepresentativeAcademicYearFilter");
  const orgRepresentativeGroupFilterEl = document.getElementById("orgRepresentativeGroupFilter");
  const orgRepresentativeTotalOrgCountEl = document.getElementById("orgRepresentativeTotalOrgCount");
  const orgRepresentativeCompleteOrgCountEl = document.getElementById("orgRepresentativeCompleteOrgCount");
  const orgRepresentativeIncompleteOrgCountEl = document.getElementById("orgRepresentativeIncompleteOrgCount");
  const orgRepresentativeApprovedTotalCountEl = document.getElementById("orgRepresentativeApprovedTotalCount");
  const orgRepresentativeMainOverviewTabEl = document.getElementById("orgRepresentativeMainOverviewTab");
  const orgRepresentativeMainFilterTabEl = document.getElementById("orgRepresentativeMainFilterTab");
  const orgRepresentativeOverviewPanelEl = document.getElementById("orgRepresentativeOverviewPanel");
  const orgRepresentativeFilterPanelEl = document.getElementById("orgRepresentativeFilterPanel");
  const organizationCatalogImportBtnEl = document.getElementById("organizationCatalogImportBtn");
  const organizationCatalogImportFileEl = document.getElementById("organizationCatalogImportFile");
  const organizationCatalogImportMessageEl = document.getElementById("organizationCatalogImportMessage");
  const organizationCatalogTableBodyEl = document.getElementById("organizationCatalogTableBody");
  const organizationCatalogTableCaptionEl = document.getElementById("organizationCatalogTableCaption");
  const organizationCatalogFormEl = document.getElementById("organizationCatalogForm");
  const organizationCatalogFormTitleEl = document.getElementById("organizationCatalogFormTitle");
  const organizationCatalogFormMessageEl = document.getElementById("organizationCatalogFormMessage");
  const organizationCatalogSaveBtnEl = document.getElementById("organizationCatalogSaveBtn");
  const organizationCatalogResetBtnEl = document.getElementById("organizationCatalogResetBtn");
  const organizationCatalogArchiveBtnEl = document.getElementById("organizationCatalogArchiveBtn");
  const organizationCatalogGroupFilterEl = document.getElementById("organizationCatalogGroupFilter");
  const organizationCatalogSearchInputEl = document.getElementById("organizationCatalogSearchInput");
  const organizationCatalogFilterResetBtnEl = document.getElementById("organizationCatalogFilterResetBtn");
  const organizationCatalogShowMoreBtnEl = document.getElementById("organizationCatalogShowMoreBtn");
  const organizationCatalogAcademicYearEl = document.getElementById("organizationCatalogAcademicYear");
  const organizationCatalogTotalCountEl = document.getElementById("organizationCatalogTotalCount");
  const organizationCatalogGroupCountEl = document.getElementById("organizationCatalogGroupCount");
  const organizationCatalogFilteredCountEl = document.getElementById("organizationCatalogFilteredCount");
  const organizationCatalogVisibleCountEl = document.getElementById("organizationCatalogVisibleCount");
  const organizationCatalogResponsibilityControlsEl = document.getElementById("organizationCatalogResponsibilityControls");
  const organizationCatalogResponsibilityDivisionEl = document.getElementById("organizationCatalogResponsibilityDivision");
  const organizationCatalogResponsibilitySubCodeEl = document.getElementById("organizationCatalogResponsibilitySubCode");
  const organizationCatalogCustomResponsibilityControlsEl = document.getElementById("organizationCatalogCustomResponsibilityControls");
  const organizationCatalogCustomDivisionCodeEl = document.getElementById("organizationCatalogCustomDivisionCode");
  const organizationCatalogCustomDivisionNameEl = document.getElementById("organizationCatalogCustomDivisionName");
  const organizationCatalogFields = {
    id: document.getElementById("organizationCatalogId"),
    group: document.getElementById("organizationCatalogGroup"),
    name: document.getElementById("organizationCatalogName"),
    code: document.getElementById("organizationCatalogCode"),
    documentRunCode: document.getElementById("organizationCatalogRunCode"),
    accountNo: document.getElementById("organizationCatalogAccountNo")
  };

  if (approvalDetailModalEl && approvalDetailModalEl.parentElement !== document.body) {
    document.body.appendChild(approvalDetailModalEl);
  }

  const positionManageFormEl = document.getElementById("staffPositionManageForm");
  const positionManagePanelEl = document.getElementById("staffPositionManagePanel");
  const positionManageInputEl = document.getElementById("staffPositionManageInput");
  const positionDivisionCodeEl = document.getElementById("staffPositionDivisionCode");
  const positionDivisionNameEl = document.getElementById("staffPositionDivisionName");
  const positionLevelCodeEl = document.getElementById("staffPositionLevelCode");
  const positionAllowedPagesEl = document.getElementById("staffPositionAllowedPages");
  const positionManageMessageEl = document.getElementById("staffPositionManageMessage");
  const positionListEl = document.getElementById("staffPositionList");
  const positionOptionsDatalistEl = document.getElementById("staffPositionOptionsList");
  const divisionCodeOptionsDatalistEl = document.getElementById("staffDivisionCodeOptionsList");
  const divisionNameOptionsDatalistEl = document.getElementById("staffDivisionNameOptionsList");
  const orgStructureMemberFormEl = document.getElementById("orgStructureMemberForm");
  const orgStructureTableBodyEl = document.getElementById("orgStructureTableBody");
  const orgStructureListCaptionEl = document.getElementById("orgStructureListCaption");
  const orgStructureFormMessageEl = document.getElementById("orgStructureFormMessage");
  const orgStructureTermFilterEl = document.getElementById("orgStructureTermFilter");
  const orgStructureStatusFilterEl = document.getElementById("orgStructureStatusFilter");
  const orgStructureSearchInputEl = document.getElementById("orgStructureSearchInput");
  const orgStructureFilterResetEl = document.getElementById("orgStructureFilterReset");
  const orgStructureRefreshBtnEl = document.getElementById("orgStructureRefreshBtn");
  const orgStructureExportBtnEl = document.getElementById("orgStructureExportBtn");
  const orgStructureArchiveBtnEl = document.getElementById("orgStructureArchiveBtn");
  const orgStructureResetBtnEl = document.getElementById("orgStructureResetBtn");
  const orgStructurePhotoPreviewEl = document.getElementById("orgStructurePhotoPreview");
  const orgStructureFields = {
    id: document.getElementById("orgStructureMemberId"),
    positionCode: document.getElementById("orgStructurePositionCode"),
    position: document.getElementById("orgStructurePosition"),
    prefix: document.getElementById("orgStructurePrefix"),
    firstName: document.getElementById("orgStructureFirstName"),
    lastName: document.getElementById("orgStructureLastName"),
    nick: document.getElementById("orgStructureNick"),
    studentId: document.getElementById("orgStructureStudentId"),
    year: document.getElementById("orgStructureYear"),
    faculty: document.getElementById("orgStructureFaculty"),
    email: document.getElementById("orgStructureEmail"),
    lineId: document.getElementById("orgStructureLineId"),
    phone: document.getElementById("orgStructurePhone"),
    photoUrl: document.getElementById("orgStructurePhotoUrl"),
    status: document.getElementById("orgStructureStatus")
  };

  const appConfig = typeof SGCU_APP_CONFIG === "object" && SGCU_APP_CONFIG ? SGCU_APP_CONFIG : {};
  const firestoreCollections = appConfig.firestore?.collections || {};
  const COLLECTION_APPLICATIONS = firestoreCollections.staffApplications || "staffApplications";
  const COLLECTION_ORG_REPRESENTATIVES =
    firestoreCollections.organizationRepresentativeApplications || "organizationRepresentativeApplications";
  const COLLECTION_PROFILES = firestoreCollections.staffProfiles || "staffProfiles";
  const COLLECTION_USER_PROFILES = firestoreCollections.userProfiles || "userProfiles";
  const COLLECTION_POSITIONS = firestoreCollections.staffPositionCatalog || "staffPositionCatalog";
  const COLLECTION_ORG_STRUCTURE = firestoreCollections.orgStructureMembers || "orgStructureMembers";
  const COLLECTION_ORGANIZATION_CATALOG = firestoreCollections.organizationCatalog || "organizationCatalog";
  const COLLECTION_POSITION_CODE_COUNTERS =
    firestoreCollections.staffPositionCodeCounters || "staffPositionCodeCounters";
  const STAFF_APPLICATION_LIST_LIMIT = 500;
  const ORG_REPRESENTATIVE_LIST_LIMIT = 500;
  const STAFF_HEAD_EMAIL_OVERRIDES = new Set([
    "tuwanon.kimchiang@gmail.com",
    "treasurer.sgcu68@gmail.com"
  ]);
  const LOGIN_PROFILE_STORAGE_KEY = "sgcu_user_profile_by_email_v1";
  const LEGACY_LOGIN_PROFILE_STORAGE_KEY = "sgcu_borrow_profile_by_email_v1";
  const STUDENT_FACULTY_MAP = {
    "21": "วิศวกรรมศาสตร์",
    "22": "อักษรศาสตร์",
    "23": "วิทยาศาสตร์",
    "24": "รัฐศาสตร์",
    "25": "สถาปัตยกรรมศาสตร์",
    "26": "พาณิชยศาสตร์และการบัญชี",
    "27": "ครุศาสตร์",
    "28": "นิเทศศาสตร์",
    "29": "เศรษฐศาสตร์",
    "30": "แพทยศาสตร์",
    "31": "สัตวแพทยศาสตร์",
    "32": "ทันตแพทยศาสตร์",
    "33": "เภสัชศาสตร์",
    "34": "นิติศาสตร์",
    "35": "ศิลปกรรมศาสตร์",
    "37": "สหเวชศาสตร์",
    "38": "จิตวิทยา",
    "39": "วิทยาศาสตร์การกีฬา",
    "40": "เกษตรและบูรณาการ",
    "56": "สถาบันนวัตกรรมบูรณาการฯ"
  };
  const DEFAULT_POSITION_OPTIONS = [
    { name: "เหรัญญิก", divisionCodeYY: "00", levelCodeZZ: "01" },
    { name: "เลขานุการฝ่ายเหรัญญิก", divisionCodeYY: "00", levelCodeZZ: "03" },
    { name: "ผู้ช่วยเหรัญญิก", divisionCodeYY: "01", levelCodeZZ: "04" },
    { name: "ประธานฝ่ายบริหารและพัฒนางบประมาณ", divisionCodeYY: "02", levelCodeZZ: "01" },
    { name: "รองประธานฝ่ายบริหารและพัฒนางบประมาณ", divisionCodeYY: "02", levelCodeZZ: "02" },
    { name: "ผู้ช่วยฝ่ายบริหารและพัฒนางบประมาณ", divisionCodeYY: "02", levelCodeZZ: "04" },
    { name: "ประธานฝ่ายหาทุนและสิทธิประโยชน์", divisionCodeYY: "03", levelCodeZZ: "01" },
    { name: "รองประธานฝ่ายหาทุนและสิทธิประโยชน์", divisionCodeYY: "03", levelCodeZZ: "02" },
    { name: "ผู้ช่วยฝ่ายหาทุนและสิทธิประโยชน์", divisionCodeYY: "03", levelCodeZZ: "04" },
    { name: "ประธานฝ่ายกายภาพและพัสดุ", divisionCodeYY: "04", levelCodeZZ: "01" },
    { name: "เลขานุการฝ่ายกายภาพและพัสดุ", divisionCodeYY: "04", levelCodeZZ: "03" },
    { name: "ผู้ช่วยฝ่ายกายภาพและพัสดุ", divisionCodeYY: "04", levelCodeZZ: "04" },
    { name: "เจ้าหน้าที่สำนักบริหารกิจการนิสิต", divisionCodeYY: "09", levelCodeZZ: "04" }
  ];
  const STAFF_PAGE_OPTIONS = [
    { id: "dashboard-staff", label: "ภาพรวมโครงการ" },
    { id: "system-data-staff", label: "ข้อมูลระบบ" },
    { id: "budget-approval-staff", label: "คำของบประมาณ" },
    { id: "borrow-assets-staff", label: "ยืม-คืนพัสดุ" },
    { id: "meeting-room-staff", label: "ห้องประชุม" },
    { id: "staff-approval", label: "สมาชิกสตาฟ" },
    { id: "org-representative-approval-staff", label: "ตัวแทนองค์กร" },
    { id: "content-management-staff", label: "จัดการเนื้อหา" },
    { id: "content-news-staff", label: "ข่าวสาร" },
    { id: "content-documents-staff", label: "เอกสารการเงิน" }
  ];
  const STAFF_IMPLICIT_ALLOWED_PAGES = ["login", "project-status-staff"];
  const REQUIRED_ORG_REPRESENTATIVE_ROLES = [
    { key: "president", label: "ประธาน" },
    { key: "vice_president", label: "รองประธาน" },
    { key: "secretary", label: "เลขา" },
    { key: "treasurer", label: "เหรัญญิก" }
  ];

  let firestore = window.sgcuFirestore || {};
  let hasStore = false;
  let unsubscribeMyApplications = null;
  let unsubscribePendingApplications = null;
  let unsubscribeApprovalHistory = null;
  let unsubscribePositionCatalog = null;
  let unsubscribeOrgStructureMembers = null;
  let unsubscribeOrgRepresentativeApplications = null;

  let currentMyApplications = [];
  let currentPendingApplications = [];
  let currentApprovedHistory = [];
  let currentApprovedHistoryGrouped = [];
  let currentOrgRepresentativeApplications = [];
  let currentOrgRepresentativePending = [];
  let currentOrgStructureMembers = [];
  const ORGANIZATION_CATALOG_PAGE_SIZE = 120;
  const organizationCatalogFilters = {
    group: "all",
    query: "",
    visibleLimit: ORGANIZATION_CATALOG_PAGE_SIZE
  };
  const orgStructureFilters = {
    query: "",
    term: "all",
    status: "all"
  };
  let currentOrgRepresentativeApproved = [];
  let currentOrgRepresentativeOrganizations = [];
  let currentOrgRepresentativeFilteredOrganizations = [];
  let currentOrgRepresentativeAcademicYear = "";
  let orgRepresentativeOrgFiltersLoadPromise = null;
  let orgRepresentativeOrgFiltersLoadedForPage = false;
  let currentPositionCatalog = [];
  let currentEditingPositionId = "";
  let appFormStatusLocked = false;
  let currentApprovalView = "pending";
  let currentApprovalType = "staff";
  let currentStaffApprovalMainTab = "approval";
  let currentOrgRepresentativeView = "overview";
  let currentApprovalDetailRequestKey = "";
  let currentAccessProfile = null;
  let currentAccessProfileEmail = "";
  let currentAccessProfileLoadingEmail = "";
  let lastKnownAuthState = {
    isAuthenticated: false,
    uid: "",
    email: ""
  };
  let deferredBootstrapTimer = 0;
  let approvalUiSyncTimer = 0;

  const syncApprovalPanelCaption = () => {
    if (!approvalPanelCaptionEl) return;
    approvalPanelCaptionEl.textContent = currentApprovalView === "history"
      ? (approvalHistoryCaptionEl?.textContent || "แสดงผล 0 รายการ")
      : (approvalCaptionEl?.textContent || "แสดงผล 0 รายการ");
  };

  const setApprovalView = (view = "pending") => {
    currentApprovalView = view === "history" ? "history" : "pending";
    const showPending = currentApprovalView === "pending";
    if (approvalPendingPanelEl) approvalPendingPanelEl.style.display = "";
    if (approvalPendingContentEl) approvalPendingContentEl.style.display = showPending ? "" : "none";
    if (approvalHistoryContentEl) approvalHistoryContentEl.style.display = showPending ? "none" : "";
    if (approvalPanelTitleEl) {
      approvalPanelTitleEl.textContent = showPending ? "คำขอที่รออนุมัติ" : "รายชื่อผู้ปฏิบัติงานตอนนี้";
    }
    if (approvalPanelCaptionEl) {
      syncApprovalPanelCaption();
    }
    if (approvalShowPendingBtnEl) {
      approvalShowPendingBtnEl.classList.toggle("is-active", showPending);
      approvalShowPendingBtnEl.setAttribute("aria-selected", showPending ? "true" : "false");
    }
    if (approvalShowHistoryBtnEl) {
      approvalShowHistoryBtnEl.classList.toggle("is-active", !showPending);
      approvalShowHistoryBtnEl.setAttribute("aria-selected", showPending ? "false" : "true");
    }
  };

  const syncStaffPositionPanelVisibility = () => {
    if (!positionManagePanelEl) return;
    const showOrg = currentApprovalType === "org";
    const showStructure = currentStaffApprovalMainTab === "structure";
    positionManagePanelEl.style.display = showOrg || showStructure ? "none" : "";
  };

  const setStaffApprovalMainTab = (tab = "approval") => {
    currentStaffApprovalMainTab = tab === "structure" ? "structure" : "approval";
    const showApproval = currentStaffApprovalMainTab === "approval";
    if (staffApprovalMainPanelEl) staffApprovalMainPanelEl.hidden = !showApproval;
    if (staffStructurePanelEl) staffStructurePanelEl.hidden = showApproval;
    if (staffApprovalMainApprovalTabEl) {
      staffApprovalMainApprovalTabEl.classList.toggle("is-active", showApproval);
      staffApprovalMainApprovalTabEl.setAttribute("aria-selected", showApproval ? "true" : "false");
    }
    if (staffApprovalMainStructureTabEl) {
      staffApprovalMainStructureTabEl.classList.toggle("is-active", !showApproval);
      staffApprovalMainStructureTabEl.setAttribute("aria-selected", showApproval ? "false" : "true");
    }
    syncStaffPositionPanelVisibility();
    if (!showApproval) {
      startOrgStructureMembersListener();
    }
  };

  const syncOrgRepresentativePanelCaption = () => {
    if (!orgRepresentativePanelCaptionEl) return;
    if (currentOrgRepresentativeView === "history") {
      orgRepresentativePanelCaptionEl.textContent = orgRepresentativeHistoryCaptionEl?.textContent || "แสดงผล 0 รายการ";
      return;
    }
    if (currentOrgRepresentativeView === "pending") {
      orgRepresentativePanelCaptionEl.textContent = `แสดงผล ${currentOrgRepresentativePending.length} รายการ`;
      return;
    }
    orgRepresentativePanelCaptionEl.textContent =
      `แสดงผล ${currentOrgRepresentativeFilteredOrganizations.length} จาก ${currentOrgRepresentativeOrganizations.length} องค์กร`;
  };

  const setOrgRepresentativeMainTab = (tab = "overview") => {
    const nextTab = tab === "filter" ? "filter" : "overview";
    const showOverview = nextTab === "overview";
    if (orgRepresentativeOverviewPanelEl) orgRepresentativeOverviewPanelEl.hidden = !showOverview;
    if (orgRepresentativeFilterPanelEl) orgRepresentativeFilterPanelEl.hidden = showOverview;
    if (!showOverview && orgRepresentativeFilterPanelEl) {
      orgRepresentativeFilterPanelEl.querySelectorAll(".section-appear").forEach((section) => {
        section.classList.add("section-visible");
      });
    }
    if (orgRepresentativeMainOverviewTabEl) {
      orgRepresentativeMainOverviewTabEl.classList.toggle("is-active", showOverview);
      orgRepresentativeMainOverviewTabEl.setAttribute("aria-selected", showOverview ? "true" : "false");
    }
    if (orgRepresentativeMainFilterTabEl) {
      orgRepresentativeMainFilterTabEl.classList.toggle("is-active", !showOverview);
      orgRepresentativeMainFilterTabEl.setAttribute("aria-selected", showOverview ? "false" : "true");
    }
  };

  const setOrgRepresentativeView = (view = "overview") => {
    currentOrgRepresentativeView = view === "history" ? "history" : view === "pending" ? "pending" : "overview";
    const showOverview = currentOrgRepresentativeView === "overview";
    const showPending = currentOrgRepresentativeView === "pending";
    const showHistory = currentOrgRepresentativeView === "history";
    if (orgRepresentativeOverviewContentEl) orgRepresentativeOverviewContentEl.style.display = showOverview ? "" : "none";
    if (orgRepresentativePendingContentEl) orgRepresentativePendingContentEl.style.display = showPending ? "" : "none";
    if (orgRepresentativeHistoryContentEl) orgRepresentativeHistoryContentEl.style.display = showHistory ? "" : "none";
    if (orgRepresentativePanelTitleEl) {
      orgRepresentativePanelTitleEl.textContent = showOverview
        ? "อนุมัติตัวแทนองค์กร"
        : showPending
          ? "คำขอตัวแทนองค์กรที่รออนุมัติ"
          : "ตัวแทนองค์กรที่อนุมัติแล้ว";
    }
    if (orgRepresentativeShowOverviewBtnEl) {
      orgRepresentativeShowOverviewBtnEl.classList.toggle("is-active", showOverview);
      orgRepresentativeShowOverviewBtnEl.setAttribute("aria-selected", showOverview ? "true" : "false");
    }
    if (orgRepresentativeShowPendingBtnEl) {
      orgRepresentativeShowPendingBtnEl.classList.toggle("is-active", showPending);
      orgRepresentativeShowPendingBtnEl.setAttribute("aria-selected", showPending ? "true" : "false");
    }
    if (orgRepresentativeShowHistoryBtnEl) {
      orgRepresentativeShowHistoryBtnEl.classList.toggle("is-active", showHistory);
      orgRepresentativeShowHistoryBtnEl.setAttribute("aria-selected", showHistory ? "true" : "false");
    }
    syncOrgRepresentativePanelCaption();
  };

  const setApprovalType = (type = "staff") => {
    if (!staffApprovalTypeStaffBtnEl && !staffApprovalTypeOrgBtnEl) {
      if (staffApprovalStaffSectionEl) staffApprovalStaffSectionEl.style.display = "";
      syncStaffPositionPanelVisibility();
      if (orgRepresentativeApprovalSectionEl) orgRepresentativeApprovalSectionEl.style.display = "";
      return;
    }
    currentApprovalType = type === "org" ? "org" : "staff";
    const showOrg = currentApprovalType === "org";
    if (staffApprovalStaffSectionEl) staffApprovalStaffSectionEl.style.display = showOrg ? "none" : "";
    syncStaffPositionPanelVisibility();
    if (orgRepresentativeApprovalSectionEl) orgRepresentativeApprovalSectionEl.style.display = showOrg ? "" : "none";
    if (staffApprovalTypeStaffBtnEl) {
      staffApprovalTypeStaffBtnEl.classList.toggle("is-active", !showOrg);
      staffApprovalTypeStaffBtnEl.setAttribute("aria-selected", showOrg ? "false" : "true");
    }
    if (staffApprovalTypeOrgBtnEl) {
      staffApprovalTypeOrgBtnEl.classList.toggle("is-active", showOrg);
      staffApprovalTypeOrgBtnEl.setAttribute("aria-selected", showOrg ? "true" : "false");
    }
  };

  const openApplicationModal = () => {
    if (!applicationModalEl) return;
    window.__sgcuStaffApplicationFlowActive = true;
    prefillApplicationForm();
    const currentUserEmail = getCurrentAuthEmail();
    const localProfile = currentUserEmail ? (readLoginProfiles()[currentUserEmail] || {}) : {};
    const profileType = ((localProfile.profileType || window.currentUserProfileType || "student").toString().trim().toLowerCase() === "affairs")
      ? "affairs"
      : "student";
    const focusSelector = profileType === "affairs" ? "#staffApplicationAffairsPosition" : "#staffApplicationDivision";
    if (typeof openDialog === "function") {
      openDialog(applicationModalEl, { focusSelector });
      return;
    }
    applicationModalEl.classList.add("show");
    applicationModalEl.setAttribute("aria-hidden", "false");
  };

  const closeApplicationModal = () => {
    if (!applicationModalEl) return;
    window.__sgcuStaffApplicationFlowActive = false;
    if (typeof closeDialog === "function") {
      closeDialog(applicationModalEl);
      return;
    }
    applicationModalEl.classList.remove("show");
    applicationModalEl.setAttribute("aria-hidden", "true");
  };

  const ensureStaffRejectionReasonModal = () => {
    let modalEl = document.getElementById("staffRejectionReasonModal");
    if (modalEl) return modalEl;
    if (!document.body) return null;

    document.body.insertAdjacentHTML("beforeend", `
      <div
        id="staffRejectionReasonModal"
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-hidden="true"
        aria-labelledby="staffRejectionReasonTitle"
      >
        <div class="modal-dialog staff-rejection-reason-dialog">
          <div class="modal-header">
            <div>
              <div id="staffRejectionReasonTitle" class="modal-title">เหตุผลที่ไม่อนุมัติ</div>
              <div id="staffRejectionReasonSubtitle" class="modal-subtitle">เหตุผลนี้จะแสดงในประวัติคำขอของผู้สมัคร</div>
            </div>
            <button id="staffRejectionReasonClose" type="button" class="modal-close" aria-label="ปิด">✕</button>
          </div>
          <div class="modal-body">
            <div class="modal-section staff-rejection-reason-section">
              <label class="login-label" for="staffRejectionReasonInput">เหตุผล</label>
              <textarea
                id="staffRejectionReasonInput"
                class="login-input staff-rejection-reason-input"
                rows="5"
                maxlength="300"
                placeholder="ระบุเหตุผลที่ไม่อนุมัติ"
              ></textarea>
              <div class="staff-rejection-reason-meta">
                <span id="staffRejectionReasonCounter" class="section-text-sm staff-rejection-reason-counter">0/300</span>
              </div>
              <div id="staffRejectionReasonError" class="section-text-sm staff-rejection-reason-error" aria-live="polite"></div>
            </div>
          </div>
          <div class="modal-footer staff-rejection-reason-actions">
            <button id="staffRejectionReasonCancel" type="button" class="btn-ghost">ยกเลิก</button>
            <button id="staffRejectionReasonSubmit" type="button" class="btn-primary">บันทึกไม่อนุมัติ</button>
          </div>
        </div>
      </div>
    `);
    return document.getElementById("staffRejectionReasonModal");
  };

  const askStaffRejectionReason = ({
    initialValue = "",
    subtitle = "เหตุผลนี้จะแสดงในประวัติคำขอของผู้สมัคร",
    helperText = "กดบันทึกไม่อนุมัติเพื่อยืนยัน หรือกดยกเลิกเพื่อไม่เปลี่ยนสถานะ"
  } = {}) => {
    const modalEl = ensureStaffRejectionReasonModal();
    const inputEl = document.getElementById("staffRejectionReasonInput");
    const subtitleEl = document.getElementById("staffRejectionReasonSubtitle");
    const helperEl = document.getElementById("staffRejectionReasonHelper");
    const counterEl = document.getElementById("staffRejectionReasonCounter");
    const errorEl = document.getElementById("staffRejectionReasonError");
    const submitEl = document.getElementById("staffRejectionReasonSubmit");
    const cancelEl = document.getElementById("staffRejectionReasonCancel");
    const closeEl = document.getElementById("staffRejectionReasonClose");

    if (
      !modalEl ||
      !(inputEl instanceof HTMLTextAreaElement) ||
      !(submitEl instanceof HTMLButtonElement) ||
      !(cancelEl instanceof HTMLButtonElement) ||
      !(closeEl instanceof HTMLButtonElement)
    ) {
      const input = window.prompt("ระบุเหตุผลที่ไม่อนุมัติ (ไม่บังคับ)", initialValue || "");
      if (input === null) return Promise.resolve(null);
      return Promise.resolve((input || "").toString().trim());
    }

    return new Promise((resolve) => {
      const updateCounter = () => {
        if (counterEl) counterEl.textContent = `${inputEl.value.length}/300`;
      };
      const cleanup = () => {
        submitEl.removeEventListener("click", onSubmit);
        cancelEl.removeEventListener("click", onCancel);
        closeEl.removeEventListener("click", onCancel);
        modalEl.removeEventListener("click", onBackdropClick);
        modalEl.removeEventListener("keydown", onKeydown);
        inputEl.removeEventListener("input", updateCounter);
      };
      const closeReasonDialog = (value) => {
        cleanup();
        if (typeof closeDialog === "function") {
          closeDialog(modalEl);
        } else {
          modalEl.classList.remove("show");
          modalEl.setAttribute("aria-hidden", "true");
        }
        resolve(value);
      };
      const onSubmit = () => {
        if (errorEl) errorEl.textContent = "";
        closeReasonDialog((inputEl.value || "").toString().trim());
      };
      const onCancel = () => {
        if (errorEl) errorEl.textContent = "";
        closeReasonDialog(null);
      };
      const onBackdropClick = (event) => {
        if (event.target === modalEl) onCancel();
      };
      const onKeydown = (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onCancel();
        }
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          event.preventDefault();
          onSubmit();
        }
      };
      if (subtitleEl) subtitleEl.textContent = subtitle;
      if (helperEl) helperEl.textContent = helperText;
      if (errorEl) errorEl.textContent = "";
      inputEl.value = (initialValue || "").toString().slice(0, 300);
      updateCounter();
      submitEl.addEventListener("click", onSubmit);
      cancelEl.addEventListener("click", onCancel);
      closeEl.addEventListener("click", onCancel);
      modalEl.addEventListener("click", onBackdropClick);
      modalEl.addEventListener("keydown", onKeydown);
      inputEl.addEventListener("input", updateCounter);

      if (typeof openDialog === "function") {
        openDialog(modalEl, { focusSelector: "#staffRejectionReasonInput" });
      } else {
        modalEl.classList.add("show");
        modalEl.setAttribute("aria-hidden", "false");
      }
      setTimeout(() => {
        inputEl.focus();
        inputEl.select();
      }, 0);
    });
  };

  const openApprovalDetailModal = (item) => {
    if (!approvalDetailModalEl || !approvalDetailBodyEl || !item) return;
    const approvedAt = item.updatedAt || item.createdAt || null;
    const detailTitleEl = document.getElementById("staffApprovalDetailTitle");
    if (detailTitleEl) {
      detailTitleEl.textContent = "รายละเอียดผู้ปฏิบัติงาน";
    }
    const applicationId = (item.primaryApplicationId || item.id || "").toString();
    const approvedPosition = (item.approvedPosition || item.requestedPosition || "").toString();
    const approvedItemsRaw = Array.isArray(item.approvedItems) ? item.approvedItems : [];
    const approvedItems = approvedItemsRaw.length
      ? approvedItemsRaw
      : [{ id: applicationId, position: approvedPosition || "-", code: (item.approvedPositionCode || "-").toString() }];
    const approvedCodes = Array.from(
      new Set(
        approvedItems
          .map((entry) => (entry?.code || "").toString().trim())
          .filter(Boolean)
      )
    );
    const applicantUid = (item.applicantUid || "").toString().trim();
    const applicantEmail = (item.applicantEmail || "").toString().trim().toLowerCase();
    const requestKey = `${applicationId}:${Date.now()}`;
    currentApprovalDetailRequestKey = requestKey;
    approvalDetailBodyEl.setAttribute("data-application-id", applicationId);
    approvalDetailBodyEl.setAttribute("data-request-key", requestKey);
    approvalDetailBodyEl.innerHTML = `
      <div class="staff-approval-detail-layout">
        <div class="modal-section">
          <div class="modal-section-title">ข้อมูลผู้ปฏิบัติงาน</div>
          <div class="modal-section-grid">
            <div>
              <div class="modal-item-label">ชื่อผู้ปฏิบัติงาน</div>
              <div class="modal-item-value">${toSafeText(item.applicantName || "-")}</div>
            </div>
            <div>
              <div class="modal-item-label">อีเมล</div>
              <div class="modal-item-value">${toSafeText(item.applicantEmail || "-")}</div>
            </div>
            <div>
              <div class="modal-item-label">รหัสนิสิต</div>
              <div id="staffApprovalDetailStudentId" class="modal-item-value">-</div>
            </div>
            <div>
              <div class="modal-item-label">คณะ</div>
              <div id="staffApprovalDetailFaculty" class="modal-item-value">-</div>
            </div>
            <div>
              <div class="modal-item-label">ชั้นปี</div>
              <div id="staffApprovalDetailYear" class="modal-item-value">-</div>
            </div>
            <div>
              <div class="modal-item-label">UID</div>
              <div id="staffApprovalDetailUid" class="modal-item-value">${toSafeText(applicantUid || "-")}</div>
            </div>
          </div>
        </div>
        <div class="modal-section">
          <div class="modal-section-title">ข้อมูลการอนุมัติ</div>
          <div class="staff-approval-info-top">
            <span class="badge badge-approved">อนุมัติแล้ว</span>
            <span class="staff-approval-code-pill">${toSafeText(approvedCodes.join(" • ") || "-")}</span>
          </div>
          <div class="modal-section-grid staff-approval-info-grid">
            <div>
              <div class="modal-item-label">จำนวนตำแหน่งที่อนุมัติ</div>
              <div class="modal-item-value">${toSafeText(String(approvedItems.length))}</div>
            </div>
            <div>
              <div class="modal-item-label">ผู้อนุมัติ</div>
              <div class="modal-item-value">${toSafeText(item.reviewedByEmail || "-")}</div>
            </div>
            <div>
              <div class="modal-item-label">คำขออ้างอิง</div>
              <div class="modal-item-value">${toSafeText((applicationId || "-").toString())}</div>
            </div>
            <div>
              <div class="modal-item-label">เวลาที่อนุมัติ</div>
              <div class="modal-item-value">${toSafeText(formatDateTime(approvedAt))}</div>
            </div>
            </div>
          <div class="staff-approval-all-positions">
            <div class="modal-item-label">ตำแหน่งที่อนุมัติทั้งหมด</div>
            <div class="staff-approval-position-list">
              ${approvedItems.map((entry) => `<div class="staff-approval-position-item"><span>${toSafeText(entry.position || "-")}</span><code>${toSafeText(entry.code || "-")}</code></div>`).join("")}
            </div>
          </div>
        </div>
        <div class="modal-section staff-approval-manage-section">
          <div class="modal-section-title">จัดการผู้ปฏิบัติงาน</div>
          <div class="modal-section-caption">เลือกตำแหน่งที่ต้องการแก้ไขก่อน แล้วค่อยปรับสถานะหรือเปลี่ยนชื่อตำแหน่ง</div>
          <div class="staff-approval-manage-grid">
          <div class="staff-approval-manage-field">
            <label class="login-label" for="modalApprovalTargetSelect">เลือกรายการตำแหน่งที่จะจัดการ</label>
            <select id="modalApprovalTargetSelect" class="login-input">
              ${approvedItems.map((entry, idx) => `
                <option
                  value="${toSafeText((entry.id || applicationId).toString())}"
                  data-position="${toSafeText((entry.position || "").toString())}"
                  ${idx === 0 ? "selected" : ""}
                >
                  ${toSafeText(`${(entry.position || "-").toString()} (${(entry.code || "-").toString()})`)}
                </option>
              `).join("")}
            </select>
          </div>
          <div class="staff-approval-manage-field">
            <label class="login-label" for="modalApprovalPositionInput">ปรับตำแหน่ง</label>
            <div class="staff-approval-modal-edit-row">
              <input
                id="modalApprovalPositionInput"
                type="text"
                class="login-input"
                list="staffPositionOptionsList"
                value="${toSafeText(approvedPosition)}"
                placeholder="ระบุตำแหน่งใหม่"
              />
              <button
                type="button"
                class="btn-primary modal-approval-save-position"
                data-application-id="${toSafeText((approvedItems[0]?.id || applicationId).toString())}"
              >
                บันทึกตำแหน่ง
              </button>
            </div>
            <div id="modalApprovalActionMessage" class="section-text-sm staff-access-status" aria-live="polite"></div>
          </div>
          </div>
          <div class="staff-approval-manage-actions">
            <button
              type="button"
              class="btn-ghost modal-approval-revert-pending staff-approval-manage-btn"
              data-application-id="${toSafeText((approvedItems[0]?.id || applicationId).toString())}"
            >
              คืนเป็นรออนุมัติ
            </button>
            <button
              type="button"
              class="btn-primary modal-approval-reject staff-approval-manage-btn is-danger"
              data-application-id="${toSafeText((approvedItems[0]?.id || applicationId).toString())}"
            >
              เปลี่ยนเป็นไม่อนุมัติ
            </button>
          </div>
          <div class="section-text-sm staff-approval-manage-hint">การจัดการทั้งหมดจะมีผลเฉพาะตำแหน่งที่เลือกอยู่ด้านบน</div>
        </div>
      </div>
    `;
    const fillAcademicFields = (profile) => {
      if (currentApprovalDetailRequestKey !== requestKey) return;
      const studentIdEl = document.getElementById("staffApprovalDetailStudentId");
      const facultyEl = document.getElementById("staffApprovalDetailFaculty");
      const yearEl = document.getElementById("staffApprovalDetailYear");
      const effectiveEmail = ((profile?.email || applicantEmail || item?.applicantEmail || "").toString().trim().toLowerCase());
      const fallback = deriveAcademicProfile(profile || {}, effectiveEmail);
      const studentId = getMeaningfulProfileValue(profile?.studentId, fallback.studentId, "-");
      const faculty = getMeaningfulProfileValue(profile?.faculty, fallback.faculty, "-");
      const year = getMeaningfulProfileValue(profile?.year, fallback.year, "-");
      if (studentIdEl) studentIdEl.textContent = studentId;
      if (facultyEl) facultyEl.textContent = faculty;
      if (yearEl) yearEl.textContent = year;
    };

    const localProfiles = readLoginProfiles();
    fillAcademicFields(localProfiles[applicantEmail] || {});

    if (
      firestore?.db &&
      firestore?.doc &&
      firestore?.getDoc
    ) {
      const fetchByUid = applicantUid
        ? firestore
          .getDoc(firestore.doc(firestore.db, COLLECTION_USER_PROFILES, applicantUid))
          .then((snap) => (snap?.exists?.() ? (snap.data() || {}) : null))
          .catch(() => null)
        : Promise.resolve(null);

      const fetchByEmail = applicantEmail && firestore?.collection && firestore?.query && firestore?.where && firestore?.onSnapshot
        ? (async () => {
            try {
              const q = firestore.query(
                firestore.collection(firestore.db, COLLECTION_USER_PROFILES),
                firestore.where("email", "==", applicantEmail)
              );
              return await new Promise((resolve) => {
                let done = false;
                const unsub = firestore.onSnapshot(
                  q,
                  (snap) => {
                    if (done) return;
                    done = true;
                    try { unsub?.(); } catch (_) {}
                    const first = snap?.docs?.[0];
                    resolve(first ? (first.data() || {}) : null);
                  },
                  () => {
                    if (done) return;
                    done = true;
                    try { unsub?.(); } catch (_) {}
                    resolve(null);
                  }
                );
                window.setTimeout(() => {
                  if (done) return;
                  done = true;
                  try { unsub?.(); } catch (_) {}
                  resolve(null);
                }, 1800);
              });
            } catch (_) {
              return null;
            }
          })()
        : Promise.resolve(null);

      Promise.all([fetchByUid, fetchByEmail]).then(([uidProfile, emailProfile]) => {
        const profile = {
          ...(emailProfile || {}),
          ...(uidProfile || {})
        };
        if ((uidProfile || emailProfile) && Object.keys(profile).length) {
          fillAcademicFields(profile);
        }
      });
    }

    if (typeof openDialog === "function") {
      openDialog(approvalDetailModalEl, { focusSelector: "#modalApprovalPositionInput" });
      return;
    }
    approvalDetailModalEl.classList.add("show");
    approvalDetailModalEl.setAttribute("aria-hidden", "false");
  };

  const closeApprovalDetailModal = () => {
    if (!approvalDetailModalEl) return;
    const detailTitleEl = document.getElementById("staffApprovalDetailTitle");
    if (detailTitleEl) {
      detailTitleEl.textContent = "รายละเอียดผู้ปฏิบัติงาน";
    }
    if (typeof closeDialog === "function") {
      closeDialog(approvalDetailModalEl);
      return;
    }
    approvalDetailModalEl.classList.remove("show");
    approvalDetailModalEl.setAttribute("aria-hidden", "true");
  };

  const resolveStore = () => {
    firestore = window.sgcuFirestore || {};
    hasStore = !!(
      firestore.db &&
      firestore.collection &&
      firestore.addDoc &&
      firestore.doc &&
      firestore.updateDoc &&
      firestore.setDoc &&
      firestore.deleteDoc &&
      firestore.onSnapshot &&
      firestore.query &&
      firestore.where &&
      firestore.serverTimestamp
    );
    return hasStore;
  };

  const scheduleDeferredBootstrap = () => {
    if (deferredBootstrapTimer) return;
    deferredBootstrapTimer = window.setTimeout(() => {
      deferredBootstrapTimer = 0;
      if (!resolveStore()) {
        scheduleDeferredBootstrap();
        return;
      }
      startPositionCatalogListener();
      startMyApplicationsListener();
      startPendingApplicationsListener();
      startApprovedHistoryListener();
      startOrgRepresentativeApplicationsListener();
    }, 350);
  };

  const syncApprovalTablesFromState = () => {
    if (approvalBodyEl && !approvalBodyEl.isConnected) return;
    if (approvalHistoryBodyEl && !approvalHistoryBodyEl.isConnected) return;
    if (approvalCaptionEl && currentPendingApplications.length) {
      renderApprovalRows();
    } else if (approvalBodyEl && /กำลังโหลดข้อมูล/.test(approvalBodyEl.textContent || "")) {
      renderApprovalRows();
    }
    if (approvalHistoryCaptionEl && currentApprovedHistory.length) {
      renderApprovedHistory();
    } else if (approvalHistoryBodyEl && /กำลังโหลดข้อมูล/.test(approvalHistoryBodyEl.textContent || "")) {
      renderApprovedHistory();
    }
    if (positionListEl && currentPositionCatalog.length && /ยังไม่มีรายการตำแหน่ง/.test(positionListEl.textContent || "")) {
      renderPositionCatalog();
    }
  };

  const scheduleApprovalUiSync = () => {
    if (approvalUiSyncTimer) {
      window.clearTimeout(approvalUiSyncTimer);
    }
    approvalUiSyncTimer = window.setTimeout(() => {
      approvalUiSyncTimer = 0;
      syncApprovalTablesFromState();
    }, 80);
  };

  const readCurrentUser = () => window.sgcuAuth?.auth?.currentUser || null;
  const getCurrentAuthEmail = () => {
    const currentUserEmail = (readCurrentUser()?.email || "").toString().trim().toLowerCase();
    if (currentUserEmail) return currentUserEmail;
    return (lastKnownAuthState.email || "").toString().trim().toLowerCase();
  };

  const normalizeRoleCode = (role) => {
    const value = (role || "").toString().trim();
    if (!value) return "";
    const normalized = value.replace(/^0+(?=\d)/, "");
    return normalized || "0";
  };

  const hasRoleToken = (roleValue, roleToken) => {
    const target = normalizeRoleCode(roleToken);
    const tokens = (roleValue || "")
      .toString()
      .split(",")
      .map((item) => normalizeRoleCode(item))
      .filter(Boolean);
    return tokens.includes(target);
  };

  const isSuperStaff = () => {
    const currentUserEmail = getCurrentAuthEmail();
    if (currentUserEmail && STAFF_HEAD_EMAIL_OVERRIDES.has(currentUserEmail)) return true;
    const profiles = [];
    if (typeof staffAuthUser !== "undefined" && staffAuthUser) profiles.push(staffAuthUser);
    if (currentAccessProfile && currentAccessProfileEmail === currentUserEmail) profiles.push(currentAccessProfile);
    if (
      currentUserEmail &&
      typeof staffProfilesByEmail !== "undefined" &&
      staffProfilesByEmail &&
      staffProfilesByEmail[currentUserEmail]
    ) {
      profiles.push(staffProfilesByEmail[currentUserEmail]);
    }
    return profiles.some(isHeadStaffProfileData);
  };

  const isHeadStaffProfileData = (profile = {}) => {
    if (!profile || typeof profile !== "object") return false;
    const profileEmail = (profile.email || "").toString().trim().toLowerCase();
    if (profileEmail && STAFF_HEAD_EMAIL_OVERRIDES.has(profileEmail)) return true;
    if (hasRoleToken(profile.role, "0")) return true;

    const yyList = new Set();
    if (Array.isArray(profile.divisionCodesYY)) {
      profile.divisionCodesYY.forEach((item) => {
        const code = normalizeCode2(item);
        if (code) yyList.add(code);
      });
    }
    [profile.divisionCodeYY, profile.positionCodeYY].forEach((item) => {
      const code = normalizeCode2(item);
      if (code) yyList.add(code);
    });
    if (Array.isArray(profile.positions)) {
      profile.positions.forEach((entry) => {
        const code = normalizeCode2(entry?.yy || entry?.positionCodeYY || entry?.divisionCodeYY || "");
        if (code) yyList.add(code);
      });
    }
    const positionText = normalizePositionText(profile.position || "");
    return yyList.has("00") || positionText.includes("เหรัญญิก");
  };

  const toSafeText = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const normalizePositionText = (value) => (value || "").toString().trim().replace(/\s+/g, " ");
  const normalizeCode2 = (value) => {
    const digits = String(value || "").trim().replace(/\D/g, "");
    if (!digits) return "";
    return digits.padStart(2, "0").slice(-2);
  };
  const isValidDivisionCodeYY = (value) => /^\d{2}$/.test(normalizeCode2(value));
  const isValidLevelCodeZZ = (value) => ["01", "02", "03", "04"].includes(normalizeCode2(value));
  const isKnownStaffPage = (page) => {
    const id = (page || "").toString().trim();
    return STAFF_PAGE_OPTIONS.some((item) => item.id === id) || STAFF_IMPLICIT_ALLOWED_PAGES.includes(id);
  };
  const normalizeAllowedPageId = (value) => {
    const raw = (value || "").toString().trim();
    if (!raw) return "";
    const cleaned = raw
      .replace(/^https?:\/\/[^/#?]+/i, "")
      .replace(/^\.?\/*(?:index\.html)?#?\/?/, "")
      .replace(/^#\/?/, "")
      .replace(/^\/+/, "")
      .replace(/[?#].*$/, "");
    const lowered = cleaned.toLowerCase();
    const kebab = cleaned
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .toLowerCase();
    const compact = kebab.replace(/[\s_/]+/g, "-");
    const byDirectId = STAFF_PAGE_OPTIONS.find((item) => item.id === raw || item.id === lowered || item.id === compact);
    if (byDirectId) return byDirectId.id;
    if (STAFF_IMPLICIT_ALLOWED_PAGES.includes(cleaned) || STAFF_IMPLICIT_ALLOWED_PAGES.includes(lowered) || STAFF_IMPLICIT_ALLOWED_PAGES.includes(compact)) {
      return compact;
    }
    const byLabel = STAFF_PAGE_OPTIONS.find((item) => item.label === raw || item.label === cleaned);
    if (byLabel) return byLabel.id;
    const aliases = new Map([
      ["dashboard", "dashboard-staff"],
      ["staff-dashboard", "dashboard-staff"],
      ["ภาพรวมโครงการ", "dashboard-staff"],
      ["project-status", "project-status-staff"],
      ["project-status-staff", "project-status-staff"],
      ["สถานะโครงการ", "project-status-staff"],
      ["สถานะโครงการฝั่ง-staff", "project-status-staff"],
      ["system-data", "system-data-staff"],
      ["health-check", "system-data-staff"],
      ["ข้อมูลระบบ", "system-data-staff"],
      ["borrow-assets", "borrow-assets-staff"],
      ["borrow-assets-staff", "borrow-assets-staff"],
      ["ยืม-คืนพัสดุ", "borrow-assets-staff"],
      ["meeting-room", "meeting-room-staff"],
      ["meeting-room-booking", "meeting-room-staff"],
      ["meeting-room-staff", "meeting-room-staff"],
      ["ห้องประชุม", "meeting-room-staff"],
      ["budget-approval", "budget-approval-staff"],
      ["budget-approval-staff", "budget-approval-staff"],
      ["คำของบประมาณ", "budget-approval-staff"],
      ["content-management", "content-management-staff"],
      ["content-management-staff", "content-management-staff"],
      ["จัดการเนื้อหา", "content-management-staff"],
      ["news", "content-news-staff"],
      ["content-news", "content-news-staff"],
      ["content-news-staff", "content-news-staff"],
      ["ข่าวสาร", "content-news-staff"],
      ["financial-docs", "content-documents-staff"],
      ["content-documents", "content-documents-staff"],
      ["content-documents-staff", "content-documents-staff"],
      ["เอกสารการเงิน", "content-documents-staff"],
      ["staff", "staff-approval"],
      ["staff-approval", "staff-approval"],
      ["สมาชิกสตาฟ", "staff-approval"],
      ["org-representative", "org-representative-approval-staff"],
      ["org-representative-approval", "org-representative-approval-staff"],
      ["org-representative-approval-staff", "org-representative-approval-staff"],
      ["ตัวแทนองค์กร", "org-representative-approval-staff"],
      ["login", "login"],
      ["เข้าสู่ระบบ", "login"],
      ["เข้าสู่ระบบ-บัญชีผู้ใช้", "login"]
    ]);
    return aliases.get(raw) || aliases.get(cleaned) || aliases.get(lowered) || aliases.get(compact) || "";
  };
  const flattenAllowedPageValues = (pages) => {
    if (Array.isArray(pages)) return pages.flatMap((item) => flattenAllowedPageValues(item));
    if (typeof pages === "string") {
      const text = pages.trim();
      if (!text) return [];
      if (text === "*" || text.toLowerCase() === "all") {
        return [...STAFF_PAGE_OPTIONS.map((item) => item.id), ...STAFF_IMPLICIT_ALLOWED_PAGES];
      }
      return text.split(/[,;|\n]+/).map((item) => item.trim()).filter(Boolean);
    }
    if (pages && typeof pages === "object") {
      const picked = ["id", "page", "pageId", "value", "name", "label", "route"]
        .map((key) => pages[key])
        .filter((item) => item !== undefined && item !== null && item !== "");
      const truthyKeys = Object.entries(pages)
        .filter(([, enabled]) => enabled === true || enabled === "true" || enabled === 1 || enabled === "1")
        .map(([key]) => key);
      return [...picked, ...truthyKeys].flatMap((item) => flattenAllowedPageValues(item));
    }
    return [];
  };
  const readAllowedPagesInput = (entry = {}) => {
    if (!entry || typeof entry !== "object") return entry;
    return (
      entry.allowedPages ??
      entry.allowedPageIds ??
      entry.allowedStaffPages ??
      entry.staffPages ??
      entry.pages ??
      entry.pageAccess ??
      entry.pagePermissions ??
      entry.permissions?.allowedPages ??
      entry.permissions?.pages ??
      entry.access?.allowedPages ??
      entry.access?.pages ??
      []
    );
  };
  const getStaffPageLabel = (page) => {
    const id = (page || "").toString().trim();
    const explicit = STAFF_PAGE_OPTIONS.find((item) => item.id === id);
    if (explicit) return explicit.label;
    if (id === "login") return "เข้าสู่ระบบ / บัญชีผู้ใช้";
    if (id === "project-status-staff") return "สถานะโครงการฝั่ง Staff";
    return id || "-";
  };
  const getDefaultAllowedPagesByYY = (yy) => {
    const code = normalizeCode2(yy);
    if (code === "00") {
      return ["dashboard-staff", "system-data-staff", "borrow-assets-staff", "meeting-room-staff", "budget-approval-staff", "content-management-staff", "content-news-staff", "content-documents-staff", "staff-approval", "org-representative-approval-staff", "login"];
    }
    return ["login"];
  };
  const normalizeAllowedPages = (pages, fallbackYY = "") => {
    const list = flattenAllowedPageValues(pages)
      .map((item) => normalizeAllowedPageId(item))
      .filter(Boolean);
    const filtered = Array.from(new Set(list.filter((page) => isKnownStaffPage(page))));
    return filtered.length ? filtered : getDefaultAllowedPagesByYY(fallbackYY);
  };

  const divisionCodeLabel = (yy) => {
    const code = normalizeCode2(yy);
    const catalogItem = currentPositionCatalog.find((item) => normalizeCode2(item.divisionCodeYY || item.yy || "") === code);
    const catalogLabel = normalizePositionText(catalogItem?.divisionLabel || catalogItem?.divisionName || "");
    if (catalogLabel) return catalogLabel;
    if (code === "00") return "เหรัญญิก / เลขานุการฝ่ายเหรัญญิก";
    if (code === "01") return "ผู้ช่วยเหรัญญิก";
    if (code === "02") return "บริหารและพัฒนางบประมาณ";
    if (code === "03") return "หาทุนและสิทธิประโยชน์";
    if (code === "04") return "กายภาพและพัสดุ";
    if (code === "09") return "เจ้าหน้าที่สำนักบริหารกิจการนิสิต";
    return code ? `หมวดงาน ${code}` : "-";
  };

  const levelCodeLabel = (zz) => {
    const code = normalizeCode2(zz);
    if (code === "01") return "ประธานฝ่าย";
    if (code === "02") return "รองประธานฝ่าย";
    if (code === "03") return "เลขานุการฝ่าย";
    if (code === "04") return "ผู้ช่วยฝ่าย";
    return "-";
  };

  const buildPositionNameFromParts = (divisionCodeYY, levelCodeZZ, divisionLabelRaw = "") => {
    const yy = normalizeCode2(divisionCodeYY);
    const zz = normalizeCode2(levelCodeZZ);
    const divisionLabel = normalizePositionText(divisionLabelRaw || divisionCodeLabel(yy));
    const levelLabel = levelCodeLabel(zz);
    if (yy === "00") {
      if (zz === "01") return "เหรัญญิก";
      if (zz === "03") return "เลขานุการฝ่ายเหรัญญิก";
      if (zz === "04") return "ผู้ช่วยเหรัญญิก";
    }
    if (yy === "01" && divisionLabel) return divisionLabel;
    if (yy === "09" && divisionLabel) return divisionLabel;
    if (!divisionLabel || divisionLabel === "-" || !levelLabel || levelLabel === "-") return "";
    const divisionCore = divisionLabel.replace(/^ฝ่าย\s*/u, "");
    return `${levelLabel}${divisionCore}`;
  };

  const getAcademicYearCodeXX = () => {
    if (typeof getCurrentAcademicYearBE === "function") {
      const beYear = Number(getCurrentAcademicYearBE());
      if (Number.isFinite(beYear) && beYear > 0) {
        return String(beYear).slice(-2).padStart(2, "0");
      }
    }
    const now = new Date();
    const yearCE = now.getFullYear();
    const month = now.getMonth() + 1;
    const academicYearCE = month >= 6 ? yearCE : yearCE - 1;
    const academicYearBE = academicYearCE + 543;
    return String(academicYearBE).slice(-2).padStart(2, "0");
  };

  const resolveDivisionCodeYY = (positionText) => {
    const normalized = normalizePositionText(positionText);
    if (!normalized) return "00";
    if (normalized === "เหรัญญิก" || normalized === "เลขานุการฝ่ายเหรัญญิก") return "00";
    if (normalized === "ผู้ช่วยเหรัญญิก") return "00";
    if (normalized.includes("บริหารและพัฒนางบประมาณ")) return "02";
    if (normalized.includes("หาทุนและสิทธิประโยชน์")) return "03";
    if (normalized.includes("กายภาพและพัสดุ")) return "04";
    if (normalized.includes("สำนักบริหารกิจการนิสิต")) return "09";
    if (normalized.includes("เหรัญญิก")) return "00";
    return "00";
  };

  const resolveLevelCodeZZ = (positionText) => {
    const normalized = normalizePositionText(positionText);
    if (!normalized) return "00";
    if (normalized === "เหรัญญิก") return "01";
    if (normalized.includes("รองประธานฝ่าย")) return "02";
    if (normalized.includes("ประธานฝ่าย")) return "01";
    if (normalized.includes("เลขานุการฝ่าย")) return "03";
    if (normalized.includes("ผู้ช่วยฝ่าย") || normalized.includes("ผู้ช่วยเหรัญญิก")) return "04";
    if (normalized.includes("เลขานุการ")) return "03";
    if (normalized.includes("ผู้ช่วย")) return "04";
    return "00";
  };

  const findPositionMetaByName = (positionText) => {
    const normalized = normalizePositionText(positionText).toLowerCase();
    if (!normalized) return null;
    return currentPositionCatalog.find(
      (item) => normalizePositionText(item.name).toLowerCase() === normalized
    ) || null;
  };

  const buildPositionCodePrefix = (xx, yy, zz) => `SGCU${xx}.10.${yy}.${zz}`;

  const reserveApplicationOrderAAA = async (xx, yy, zz) => {
    const key = `${xx}-10-${yy}-${zz}`;
    if (firestore.runTransaction && firestore.doc && firestore.db) {
      const ref = firestore.doc(firestore.db, COLLECTION_POSITION_CODE_COUNTERS, key);
      const nextSeq = await firestore.runTransaction(firestore.db, async (transaction) => {
        const snap = await transaction.get(ref);
        const currentSeq = Number(snap?.data?.()?.lastSeq || 0);
        const safeCurrent = Number.isFinite(currentSeq) && currentSeq >= 0 ? currentSeq : 0;
        const next = safeCurrent + 1;
        transaction.set(
          ref,
          {
            key,
            xx,
            yy,
            zz,
            lastSeq: next,
            updatedAt: firestore.serverTimestamp ? firestore.serverTimestamp() : new Date().toISOString()
          },
          { merge: true }
        );
        return next;
      });
      return Number(nextSeq);
    }

    const prefix = `${buildPositionCodePrefix(xx, yy, zz)}-`;
    const fallbackSeq =
      currentApprovedHistory.filter((item) =>
        (item.approvedPositionCode || "").toString().startsWith(prefix)
      ).length + 1;
    return fallbackSeq;
  };

  const buildApprovedPositionCode = async (positionText) => {
    const xx = getAcademicYearCodeXX();
    const catalogMeta = findPositionMetaByName(positionText);
    const normalizedPosition = normalizePositionText(positionText);
    const inferredYY = resolveDivisionCodeYY(positionText);
    const forcedTreasurerYY =
      normalizedPosition === "เหรัญญิก" ||
      normalizedPosition === "เลขานุการฝ่ายเหรัญญิก" ||
      normalizedPosition === "ผู้ช่วยเหรัญญิก";
    const fallbackYY = inferredYY;
    const catalogYY = normalizeCode2(catalogMeta?.divisionCodeYY || "");
    const yy = forcedTreasurerYY
      ? fallbackYY
      : isValidDivisionCodeYY(catalogYY)
        ? catalogYY
        : fallbackYY;
    let zz = catalogMeta?.levelCodeZZ
      ? normalizeCode2(catalogMeta.levelCodeZZ)
      : resolveLevelCodeZZ(positionText);
    if (!isValidLevelCodeZZ(zz)) {
      if (yy === "00") zz = normalizePositionText(positionText).includes("เลขานุการ") ? "03" : "01";
      else if (yy === "01") zz = "04";
      else zz = "04";
    }
    if (!isValidDivisionCodeYY(yy) || !isValidLevelCodeZZ(zz)) {
      throw new Error("position-code-segment-unresolved");
    }
    const seq = await reserveApplicationOrderAAA(xx, yy, zz);
    const aaa = String(seq).padStart(3, "0");
    const code = `${buildPositionCodePrefix(xx, yy, zz)}-${aaa}`;
    return { code, xx, yy, zz, aaa };
  };

  const slugifyPosition = (value) => {
    const normalized = normalizePositionText(value).toLowerCase();
    const slug = normalized
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    return slug || `position-${Date.now()}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getCurrentAcademicYearBE = () => {
    const now = new Date();
    const yearCE = now.getFullYear();
    const month = now.getMonth() + 1;
    const academicYearCE = month >= 6 ? yearCE : yearCE - 1;
    return academicYearCE + 543;
  };

  currentOrgRepresentativeAcademicYear = String(getCurrentAcademicYearBE());

  const getAcademicYearFromTimestamp = (value) => {
    if (!value) return "";
    const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    const yearCE = date.getFullYear();
    const month = date.getMonth() + 1;
    return String((month >= 6 ? yearCE : yearCE - 1) + 543);
  };

  const getOrgRepresentativeAcademicYear = (item = {}) => {
    const explicit = (item.academicYear || item.representativeAcademicYear || item.schoolYear || "").toString().trim();
    if (/^\d{4}$/.test(explicit)) return explicit;
    return getAcademicYearFromTimestamp(item.createdAt || item.reviewedAt || item.updatedAt) || String(getCurrentAcademicYearBE());
  };

  const isMeaningfulProfileValue = (value) => {
    const normalized = (value || "").toString().trim().toLowerCase();
    return !["", "-", "—", "unknown", "n/a", "na", "null", "undefined", "ไม่ระบุ"].includes(normalized);
  };

  const getMeaningfulProfileValue = (...values) => {
    for (const value of values) {
      if (!isMeaningfulProfileValue(value)) continue;
      return (value || "").toString().trim();
    }
    return "";
  };

  const deriveAcademicProfileFromStudentId = (rawStudentId) => {
    const studentId = (rawStudentId || "").toString().trim();
    if (!/^\d{10}$/.test(studentId)) return { studentId: "", faculty: "", year: "" };
    const facultyCode = studentId.slice(7, 9);
    const faculty = STUDENT_FACULTY_MAP[facultyCode] || "";
    const entryPrefix = Number(studentId.slice(0, 2));
    const currentAcademicBE = getCurrentAcademicYearBE();
    const entryAcademicBE = Number.isFinite(entryPrefix) ? 2500 + entryPrefix : NaN;
    const yearLevel = Number.isFinite(entryAcademicBE)
      ? currentAcademicBE - entryAcademicBE + 1
      : NaN;
    const year = Number.isFinite(yearLevel) && yearLevel >= 1 && yearLevel <= 8 ? String(yearLevel) : "";
    return { studentId, faculty, year };
  };

  const deriveAcademicProfileFromEmail = (email) => {
    const normalizedEmail = (email || "").toString().trim().toLowerCase();
    const localPart = normalizedEmail.split("@")[0] || "";
    return deriveAcademicProfileFromStudentId(localPart);
  };

  const deriveAcademicProfile = (profile = {}, email = "") => {
    const explicitStudentId = getMeaningfulProfileValue(profile?.studentId);
    const fromStudentId = deriveAcademicProfileFromStudentId(explicitStudentId);
    const fromEmail = deriveAcademicProfileFromEmail(email);
    return {
      studentId: getMeaningfulProfileValue(explicitStudentId, fromEmail.studentId),
      faculty: getMeaningfulProfileValue(profile?.faculty, fromStudentId.faculty, fromEmail.faculty),
      year: getMeaningfulProfileValue(profile?.year, fromStudentId.year, fromEmail.year)
    };
  };

  const mapStatusBadge = (status) => {
    const normalized = (status || "pending").toString().trim().toLowerCase();
    if (normalized === "approved") return '<span class="badge badge-approved">อนุมัติแล้ว</span>';
    if (normalized === "rejected") return '<span class="badge badge-rejected">ไม่อนุมัติ</span>';
    return '<span class="badge badge-pending">รออนุมัติ</span>';
  };

  const toPositionEntry = (entry = {}) => ({
    name: normalizePositionText(entry.name || entry.position || ""),
    code: (entry.code || entry.positionCode || "").toString().trim(),
    yy: normalizeCode2(entry.yy || entry.positionCodeYY || entry.divisionCodeYY || ""),
    zz: normalizeCode2(entry.zz || entry.positionCodeZZ || entry.levelCodeZZ || ""),
    allowedPages: normalizeAllowedPages(readAllowedPagesInput(entry), entry.yy || entry.positionCodeYY || entry.divisionCodeYY || ""),
    sourceApplicationId: (entry.sourceApplicationId || "").toString().trim(),
    approvedAt: entry.approvedAt || null
  });

  const normalizePositionsArray = (arr) => {
    if (!Array.isArray(arr)) return [];
    const list = arr
      .map((item) => toPositionEntry(item))
      .filter((item) => item.name || item.code);
    const unique = new Map();
    list.forEach((item) => {
      const key = `${item.sourceApplicationId || "-"}|${item.code || "-"}|${item.name.toLowerCase()}`;
      if (!unique.has(key)) unique.set(key, item);
    });
    return Array.from(unique.values());
  };

  const extractExistingPositionsFromProfile = (profileData = {}) => {
    const fromArray = normalizePositionsArray(profileData.positions || []);
    if (fromArray.length) return fromArray;
    const legacyName = normalizePositionText(profileData.position || "");
    const legacyCode = (profileData.positionCode || "").toString().trim();
    const legacyYY = normalizeCode2(profileData.positionCodeYY || profileData.divisionCodeYY || "");
    if (!legacyName && !legacyCode) return [];
    return normalizePositionsArray([
      {
        name: legacyName,
        code: legacyCode,
        yy: legacyYY,
        sourceApplicationId: (profileData.sourceApplicationId || "").toString().trim()
      }
    ]);
  };

  const deriveLegacyRoleFromPositions = (positions = []) => {
    const hasHead = positions.some((item) => normalizeCode2(item.yy) === "00");
    return hasHead ? "0" : "1";
  };

  const buildProfileFieldsFromPositions = (positions = []) => {
    const normalized = normalizePositionsArray(positions);
    const primary = normalized[0] || null;
    return {
      positions: normalized,
      role: normalized.length ? deriveLegacyRoleFromPositions(normalized) : "",
      position: primary?.name || "",
      positionCode: primary?.code || "",
      positionCodeYY: primary?.yy || "",
      divisionCodeYY: primary?.yy || "",
      divisionCodesYY: Array.from(new Set(normalized.map((item) => normalizeCode2(item.yy)).filter(Boolean)))
    };
  };

  const getAllowedPagesForCatalogPosition = (item = {}) => {
    const yy = normalizeCode2(item.divisionCodeYY || item.yy || "");
    return normalizeAllowedPages(readAllowedPagesInput(item), yy);
  };

  const findPositionAccessMeta = (positionText, yyHint = "", zzHint = "") => {
    const normalized = normalizePositionText(positionText).toLowerCase();
    const yy = normalizeCode2(yyHint || "");
    const zz = normalizeCode2(zzHint || "");
    const exact = currentPositionCatalog.find((item) => normalizePositionText(item.name).toLowerCase() === normalized) || null;
    if (exact) return exact;
    if (yy && zz) {
      return currentPositionCatalog.find(
        (item) => normalizeCode2(item.divisionCodeYY) === yy && normalizeCode2(item.levelCodeZZ) === zz
      ) || null;
    }
    return null;
  };

  const setMessage = (el, text = "", color = "#6b7280") => {
    if (!el) return;
    el.textContent = text;
    el.style.color = color;
  };

  const refreshAccessProfileForCurrentUser = async ({ force = false } = {}) => {
    const email = getCurrentAuthEmail();
    if (!email) {
      currentAccessProfile = null;
      currentAccessProfileEmail = "";
      currentAccessProfileLoadingEmail = "";
      return null;
    }
    if (!force && currentAccessProfileEmail === email) {
      return currentAccessProfile;
    }
    if (currentAccessProfileLoadingEmail === email) {
      return currentAccessProfile;
    }
    if (!resolveStore() || !firestore.getDoc || !firestore.doc || !firestore.db) {
      return currentAccessProfile;
    }

    currentAccessProfileLoadingEmail = email;
    try {
      const profileRef = firestore.doc(firestore.db, COLLECTION_PROFILES, email);
      const snap = await firestore.getDoc(profileRef);
      const data = snap?.exists?.() ? (snap.data() || {}) : null;
      currentAccessProfile = data ? { email, ...data } : null;
      currentAccessProfileEmail = email;
      if (
        data &&
        typeof staffProfilesByEmail !== "undefined" &&
        staffProfilesByEmail &&
        typeof staffProfilesByEmail === "object"
      ) {
        staffProfilesByEmail[email] = { ...(staffProfilesByEmail[email] || {}), ...data };
      }
      setApprovalAvailabilityByRole();
      return currentAccessProfile;
    } catch (error) {
      console.warn("load current staff access profile failed - app.staff-access.js", error);
      return currentAccessProfile;
    } finally {
      if (currentAccessProfileLoadingEmail === email) {
        currentAccessProfileLoadingEmail = "";
      }
    }
  };

  const escapeStaffHtml = (value) =>
    typeof escapeHtml === "function"
      ? escapeHtml(value)
      : (value ?? "")
          .toString()
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll("\"", "&quot;")
          .replaceAll("'", "&#39;");

  const normalizeOrgStructureText = (value) =>
    (value || "").toString().trim();

  const orgStructureFacultyMap = {
    "21": "วิศวกรรมศาสตร์",
    "22": "อักษรศาสตร์",
    "23": "วิทยาศาสตร์",
    "24": "รัฐศาสตร์",
    "25": "สถาปัตยกรรมศาสตร์",
    "26": "พาณิชยศาสตร์และการบัญชี",
    "27": "ครุศาสตร์",
    "28": "นิเทศศาสตร์",
    "29": "เศรษฐศาสตร์",
    "30": "แพทยศาสตร์",
    "31": "สัตวแพทย์ศาสตร์",
    "32": "ทันตแพทย์ศาสตร์",
    "33": "เภสัชศาสตร์",
    "34": "นิติศาสตร์",
    "35": "ศิลปกรรมศาสตร์",
    "37": "สหเวชศาสตร์",
    "38": "จิตวิทยา",
    "39": "วิทยาศาสตร์การกีฬา",
    "40": "เกษตรและบูรณาการ",
    "56": "สถาบันนวัตกรรมบูรณาการฯ"
  };

  const resolveOrgStructureStudentMeta = (studentId = "", positionCode = "") => {
    const digits = normalizeOrgStructureText(studentId).replace(/\D/g, "");
    if (digits.length < 10) return { year: "", faculty: "", isComplete: false };

    const faculty = orgStructureFacultyMap[digits.slice(-2)] || "";
    const studentYear = Number(digits.slice(0, 2));
    const termMatch = normalizeOrgStructureText(positionCode).match(/^SGCU\s*(\d{2,4})(?=\.|$)/i);
    const termYear = termMatch ? Number(termMatch[1].slice(-2)) : NaN;
    const yearLevel = Number.isFinite(studentYear) && Number.isFinite(termYear)
      ? termYear - studentYear + 1
      : NaN;
    const year = yearLevel >= 1 && yearLevel <= 8 ? String(yearLevel) : "";
    return { year, faculty, isComplete: !!(year && faculty) };
  };

  const updateOrgStructureStudentMeta = () => {
    const meta = resolveOrgStructureStudentMeta(
      orgStructureFields.studentId?.value,
      orgStructureFields.positionCode?.value
    );
    if (orgStructureFields.year) orgStructureFields.year.value = meta.year;
    if (orgStructureFields.faculty) orgStructureFields.faculty.value = meta.faculty;
    return meta;
  };

  const getOrgStructureTerm = (positionCode = "") => {
    const match = normalizeOrgStructureText(positionCode).match(/^SGCU\s*(\d{2,4})(?=\.|$)/i);
    return match ? `SGCU${match[1].slice(-2)}` : "";
  };

  const slugifyOrgStructureId = (value) => {
    const base = normalizeOrgStructureText(value)
      .toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/[^a-z0-9ก-๙]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100);
    return base || `org-member-${Date.now()}`;
  };

  const extractOrgStructureDriveFileId = (value) => {
    const raw = normalizeOrgStructureText(value);
    if (!raw) return "";
    const fileMatch = raw.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
    if (fileMatch?.[1]) return fileMatch[1];
    const idMatch = raw.match(/[?&]id=([^&#]+)/i);
    if (idMatch?.[1]) return idMatch[1];
    const openMatch = raw.match(/drive\.google\.com\/open\?id=([^&#]+)/i);
    if (openMatch?.[1]) return openMatch[1];
    return "";
  };

  const resolveOrgStructurePhotoPreviewUrl = (value) => {
    const raw = normalizeOrgStructureText(value);
    if (!raw) return "";
    const driveFileId = extractOrgStructureDriveFileId(raw);
    if (driveFileId) return `https://lh3.googleusercontent.com/d/${driveFileId}=w240`;
    if (/^https?:\/\//i.test(raw)) return raw;
    return raw.includes(".") ? `img/org/${raw.replace(/\s+/g, "")}` : "";
  };

  const updateOrgStructurePhotoPreview = () => {
    if (!orgStructurePhotoPreviewEl) return;
    const raw = normalizeOrgStructureText(orgStructureFields.photoUrl?.value);
    const previewUrl = resolveOrgStructurePhotoPreviewUrl(raw);
    if (!raw) {
      orgStructurePhotoPreviewEl.innerHTML = `<span>ยังไม่ได้แนบรูป</span>`;
      orgStructurePhotoPreviewEl.dataset.state = "empty";
      return;
    }
    if (!previewUrl) {
      orgStructurePhotoPreviewEl.innerHTML = `<span>วางลิงก์รูปจาก Google Drive หรือ URL รูปภาพ</span>`;
      orgStructurePhotoPreviewEl.dataset.state = "hint";
      return;
    }
    orgStructurePhotoPreviewEl.innerHTML = `
      <img src="${escapeStaffHtml(previewUrl)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
      <span>รูปที่จะแสดงบนหน้าเว็บ</span>
    `;
    orgStructurePhotoPreviewEl.dataset.state = "ready";
  };

  const buildOrgStructureRow = (item) => [
    item.positionCode,
    item.position,
    item.prefix,
    item.firstName,
    item.lastName,
    item.nick,
    item.studentId,
    item.year,
    item.faculty,
    item.email,
    item.lineId,
    item.phone,
    item.photoUrl
  ].map((value) => normalizeOrgStructureText(value));

  const normalizeOrgStructureDoc = (docSnap) => {
    const data = docSnap?.data ? docSnap.data() : {};
    const row = Array.isArray(data.row) ? data.row : [];
    const item = {
      id: docSnap.id,
      positionCode: normalizeOrgStructureText(data.positionCode || row[0]),
      position: normalizeOrgStructureText(data.position || row[1]),
      prefix: normalizeOrgStructureText(data.prefix || row[2]),
      firstName: normalizeOrgStructureText(data.firstName || row[3]),
      lastName: normalizeOrgStructureText(data.lastName || row[4]),
      nick: normalizeOrgStructureText(data.nick || row[5]),
      studentId: normalizeOrgStructureText(data.studentId || row[6]),
      year: normalizeOrgStructureText(data.year || row[7]),
      faculty: normalizeOrgStructureText(data.faculty || row[8]),
      email: normalizeOrgStructureText(data.email || row[9]).toLowerCase(),
      lineId: normalizeOrgStructureText(data.lineId || row[10]),
      phone: normalizeOrgStructureText(data.phone || row[11]),
      photoUrl: normalizeOrgStructureText(data.photoUrl || data.photo || row[12]),
      sortOrder: Number(data.sortOrder || 0),
      status: normalizeOrgStructureText(data.status || "published")
    };
    const studentMeta = resolveOrgStructureStudentMeta(item.studentId, item.positionCode);
    if (studentMeta.year) item.year = studentMeta.year;
    if (studentMeta.faculty) item.faculty = studentMeta.faculty;
    item.term = getOrgStructureTerm(item.positionCode);
    item.fullName = [item.prefix, item.firstName, item.lastName].filter(Boolean).join(" ").trim();
    return item;
  };

  const syncOrgStructureFilterOptions = () => {
    if (!orgStructureTermFilterEl) return;
    const currentValue = orgStructureTermFilterEl.value || "all";
    const terms = Array.from(new Set(currentOrgStructureMembers.map((item) => item.term).filter(Boolean)))
      .sort((a, b) => Number((b.match(/\d+/) || [0])[0]) - Number((a.match(/\d+/) || [0])[0]));
    orgStructureTermFilterEl.innerHTML = `<option value="all">ทุกรุ่น</option>${terms
      .map((term) => `<option value="${escapeStaffHtml(term)}">${escapeStaffHtml(term)}</option>`)
      .join("")}`;
    orgStructureTermFilterEl.value = terms.includes(currentValue) ? currentValue : "all";
    orgStructureFilters.term = orgStructureTermFilterEl.value || "all";
  };

  const getFilteredOrgStructureMembers = () => {
    const query = normalizeOrgStructureText(orgStructureFilters.query).toLowerCase();
    return currentOrgStructureMembers.filter((item) => {
      if (orgStructureFilters.term !== "all" && item.term !== orgStructureFilters.term) return false;
      if (orgStructureFilters.status !== "all" && item.status !== orgStructureFilters.status) return false;
      if (!query) return true;
      return [
        item.positionCode,
        item.position,
        item.fullName,
        item.nick,
        item.term,
        item.email,
        item.faculty
      ].join(" ").toLowerCase().includes(query);
    });
  };

  const renderOrgStructureMembers = () => {
    if (!orgStructureTableBodyEl || !orgStructureListCaptionEl) return;
    syncOrgStructureFilterOptions();
    const visibleItems = getFilteredOrgStructureMembers();
    orgStructureListCaptionEl.textContent =
      `แสดง ${visibleItems.length.toLocaleString("th-TH")} จาก ${currentOrgStructureMembers.length.toLocaleString("th-TH")} รายชื่อจาก Firestore`;

    if (!currentOrgStructureMembers.length) {
      orgStructureTableBodyEl.innerHTML = `<tr><td colspan="4">ยังไม่มีรายชื่อใน Firestore</td></tr>`;
      return;
    }
    if (!visibleItems.length) {
      orgStructureTableBodyEl.innerHTML = `<tr><td colspan="4">ไม่พบรายชื่อตามตัวกรอง</td></tr>`;
      return;
    }

    orgStructureTableBodyEl.innerHTML = visibleItems
      .map((item) => {
        return `
          <tr class="org-structure-admin-row" data-org-member-id="${escapeStaffHtml(item.id)}" tabindex="0" role="button" aria-label="แก้ไข ${escapeStaffHtml(item.fullName)}">
            <td>
              <strong>${escapeStaffHtml(item.fullName || "-")}</strong>
              <small>${escapeStaffHtml([item.position, item.nick ? `(${item.nick})` : ""].filter(Boolean).join(" "))}</small>
            </td>
            <td>${escapeStaffHtml(item.positionCode || "-")}</td>
            <td>${escapeStaffHtml(item.term || "-")}</td>
            <td><span class="content-admin-status status-${escapeStaffHtml(item.status || "published")}">${escapeStaffHtml(item.status || "published")}</span></td>
          </tr>
        `;
      })
      .join("");
  };

  const resetOrgStructureForm = () => {
    orgStructureMemberFormEl?.reset();
    if (orgStructureFields.id) orgStructureFields.id.value = "";
    if (orgStructureFields.status) orgStructureFields.status.value = "published";
    updateOrgStructureStudentMeta();
    updateOrgStructurePhotoPreview();
    setMessage(orgStructureFormMessageEl, "");
  };

  const fillOrgStructureForm = (item) => {
    if (!item || !orgStructureMemberFormEl) return;
    Object.keys(orgStructureFields).forEach((key) => {
      const field = orgStructureFields[key];
      if (!field) return;
      field.value = key === "id" ? (item.id || "") : (item[key] || "");
    });
    updateOrgStructureStudentMeta();
    updateOrgStructurePhotoPreview();
    setMessage(orgStructureFormMessageEl, `กำลังแก้ไข: ${item.fullName || item.positionCode}`, "#1d4ed8");
    orgStructureMemberFormEl.scrollIntoView({ behavior: "smooth", block: "start" });
    orgStructureFields.positionCode?.focus();
  };

  const readOrgStructurePayload = () => {
    const studentId = normalizeOrgStructureText(orgStructureFields.studentId?.value);
    const positionCode = normalizeOrgStructureText(orgStructureFields.positionCode?.value);
    const studentMeta = resolveOrgStructureStudentMeta(studentId, positionCode);
    const payload = {
      positionCode,
      position: normalizeOrgStructureText(orgStructureFields.position?.value),
      prefix: normalizeOrgStructureText(orgStructureFields.prefix?.value),
      firstName: normalizeOrgStructureText(orgStructureFields.firstName?.value),
      lastName: normalizeOrgStructureText(orgStructureFields.lastName?.value),
      nick: normalizeOrgStructureText(orgStructureFields.nick?.value),
      studentId,
      year: studentMeta.year,
      faculty: studentMeta.faculty,
      email: normalizeOrgStructureText(orgStructureFields.email?.value).toLowerCase(),
      lineId: normalizeOrgStructureText(orgStructureFields.lineId?.value),
      phone: normalizeOrgStructureText(orgStructureFields.phone?.value),
      photoUrl: normalizeOrgStructureText(orgStructureFields.photoUrl?.value),
      status: normalizeOrgStructureText(orgStructureFields.status?.value) || "published"
    };
    if (!payload.positionCode) throw new Error("กรุณากรอกรหัสตำแหน่ง");
    if (!payload.position) throw new Error("กรุณากรอกตำแหน่ง");
    if (!payload.firstName) throw new Error("กรุณากรอกชื่อ");
    if (payload.studentId && !studentMeta.isComplete) {
      throw new Error("กรุณาตรวจสอบรหัสนิสิต เพื่อให้ระบบระบุชั้นปีและคณะได้");
    }
    payload.row = buildOrgStructureRow(payload);
    payload.term = getOrgStructureTerm(payload.positionCode);
    return payload;
  };

  const saveOrgStructureMember = async (event) => {
    event.preventDefault();
    if (!resolveStore()) {
      setMessage(orgStructureFormMessageEl, "ระบบ Firestore ยังไม่พร้อม", "#b91c1c");
      return;
    }
    const controls = Array.from(orgStructureMemberFormEl?.elements || []);
    controls.forEach((control) => {
      if ("disabled" in control) control.disabled = true;
    });
    try {
      const payload = readOrgStructurePayload();
      const id = normalizeOrgStructureText(orgStructureFields.id?.value);
      const docId = id || slugifyOrgStructureId(payload.positionCode);
      const existingIndex = currentOrgStructureMembers.findIndex((item) => item.id === docId);
      const nextSortOrder = existingIndex >= 0
        ? currentOrgStructureMembers[existingIndex].sortOrder || existingIndex + 1
        : currentOrgStructureMembers.length + 1;
      await firestore.setDoc(
        firestore.doc(firestore.db, COLLECTION_ORG_STRUCTURE, docId),
        {
          ...payload,
          sortOrder: nextSortOrder,
          updatedAt: firestore.serverTimestamp(),
          updatedBy: window.sgcuAuth?.auth?.currentUser?.email || ""
        },
        { merge: true }
      );
      resetOrgStructureForm();
      setMessage(orgStructureFormMessageEl, "บันทึกรายชื่อทำเนียบรุ่นแล้ว", "#047857");
    } catch (error) {
      console.error("save org structure member failed - app.staff-access.js", error);
      setMessage(orgStructureFormMessageEl, error.message || "บันทึกทำเนียบรุ่นไม่สำเร็จ", "#b91c1c");
    } finally {
      controls.forEach((control) => {
        if ("disabled" in control) control.disabled = false;
      });
    }
  };

  const archiveCurrentOrgStructureMember = () => {
    if (!orgStructureFields.id?.value) {
      if (orgStructureFields.status) orgStructureFields.status.value = "archived";
      return;
    }
    if (orgStructureFields.status) orgStructureFields.status.value = "archived";
    orgStructureMemberFormEl?.requestSubmit();
  };

  const startOrgStructureMembersListener = () => {
    if (!orgStructureTableBodyEl || !resolveStore() || unsubscribeOrgStructureMembers) return;
    orgStructureListCaptionEl.textContent = "กำลังโหลดรายชื่อ...";
    orgStructureTableBodyEl.innerHTML = `<tr><td colspan="4">กำลังโหลดรายชื่อ...</td></tr>`;
    unsubscribeOrgStructureMembers = firestore.onSnapshot(
      firestore.collection(firestore.db, COLLECTION_ORG_STRUCTURE),
      (snapshot) => {
        currentOrgStructureMembers = (snapshot?.docs || [])
          .map((docSnap) => normalizeOrgStructureDoc(docSnap))
          .sort((a, b) => a.sortOrder - b.sortOrder || a.positionCode.localeCompare(b.positionCode, "th"));
        renderOrgStructureMembers();
      },
      (error) => {
        console.error("load org structure members failed - app.staff-access.js", error);
        orgStructureListCaptionEl.textContent = "โหลดทำเนียบรุ่นไม่สำเร็จ";
        orgStructureTableBodyEl.innerHTML = `<tr><td colspan="4">ไม่สามารถโหลดรายชื่อจาก Firestore ได้</td></tr>`;
      }
    );
  };

  const exportOrgStructureMembersCsv = () => {
    const rows = getFilteredOrgStructureMembers().map((item) => ({
      positionCode: item.positionCode,
      position: item.position,
      prefix: item.prefix,
      firstName: item.firstName,
      lastName: item.lastName,
      nick: item.nick,
      studentId: item.studentId,
      year: item.year,
      faculty: item.faculty,
      email: item.email,
      lineId: item.lineId,
      phone: item.phone,
      photoUrl: item.photoUrl,
      status: item.status
    }));
    const ok = window.sgcuCsvExport?.download?.("org-structure-members.csv", rows);
    if (!ok) setMessage(orgStructureFormMessageEl, "ไม่พบตัวช่วย Export CSV", "#b91c1c");
  };

  const buildListenerErrorText = (contextLabel, error) => {
    const code = (error?.code || "unknown").toString();
    if (code === "permission-denied") {
      return `${contextLabel}: ไม่มีสิทธิ์อ่านข้อมูล (permission-denied)`;
    }
    if (code === "unauthenticated") {
      return `${contextLabel}: เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่`;
    }
    return `${contextLabel}: โหลดไม่สำเร็จ (${code})`;
  };

  const buildActionErrorText = (contextLabel, error, extra = "") => {
    const code = (error?.code || "unknown").toString();
    const message = (error?.message || "").toString().trim();
    const suffix = extra ? ` | ${extra}` : "";
    if (message) return `${contextLabel}: ${code} - ${message}${suffix}`;
    return `${contextLabel}: ${code}${suffix}`;
  };

  const setAppFormEnabled = (enabled) => {
    const disabled = !enabled;
    [appPositionEl, appDivisionEl, appLevelEl, appSubmitEl].forEach((el) => {
      if (el) el.disabled = disabled;
    });
  };

  const setPositionManageEnabled = (enabled) => {
    const disabled = !enabled;
    if (positionManageInputEl) positionManageInputEl.disabled = disabled;
    if (positionDivisionCodeEl) positionDivisionCodeEl.disabled = disabled;
    if (positionDivisionNameEl) positionDivisionNameEl.disabled = disabled;
    if (positionLevelCodeEl) positionLevelCodeEl.disabled = disabled;
    const addBtn = document.getElementById("staffPositionManageAddBtn");
    if (addBtn) addBtn.disabled = disabled;
    if (positionAllowedPagesEl) {
      positionAllowedPagesEl.querySelectorAll(".staff-position-page-checkbox").forEach((input) => {
        if (input instanceof HTMLInputElement) input.disabled = disabled;
      });
    }
    if (!positionListEl) return;
    positionListEl.querySelectorAll("button[data-position-id], button[data-edit-position-id], button[data-save-position-id]").forEach((btn) => {
      btn.disabled = disabled;
    });
  };

  const readLoginProfiles = () => {
    try {
      const rawPrimary = window.localStorage?.getItem(LOGIN_PROFILE_STORAGE_KEY);
      const rawLegacy = window.localStorage?.getItem(LEGACY_LOGIN_PROFILE_STORAGE_KEY);
      const raw = rawPrimary || rawLegacy;
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  };

  const sortByTimestampDesc = (items, key = "createdAt") => {
    return [...items].sort((a, b) => {
      const aTime = typeof a?.[key]?.toMillis === "function"
        ? a[key].toMillis()
        : new Date(a?.[key] || 0).getTime();
      const bTime = typeof b?.[key]?.toMillis === "function"
        ? b[key].toMillis()
        : new Date(b?.[key] || 0).getTime();
      return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
    });
  };

  const normalizeApplicationStatus = (value) => {
    const status = (value || "").toString().trim().toLowerCase();
    if (status === "approved" || status === "rejected" || status === "pending") return status;
    return "pending";
  };

  const isStaffApplicationRecord = (item = {}) => {
    const requestType = (item.requestType || "staff_application").toString().trim();
    return !requestType || requestType === "staff_application";
  };

  const sortPositionCatalogItems = (items = []) =>
    [...items].sort((a, b) => {
      const yyCompare = normalizeCode2(a.divisionCodeYY).localeCompare(normalizeCode2(b.divisionCodeYY));
      if (yyCompare !== 0) return yyCompare;
      const zzCompare = normalizeCode2(a.levelCodeZZ).localeCompare(normalizeCode2(b.levelCodeZZ));
      if (zzCompare !== 0) return zzCompare;
      return normalizePositionText(a.name).localeCompare(normalizePositionText(b.name), "th");
    });

  const refreshSummaryCounts = () => {
    if (staffApprovalPendingCountEl) {
      staffApprovalPendingCountEl.textContent = String(currentPendingApplications.length);
    }
    if (staffApprovalApprovedCountEl) {
      staffApprovalApprovedCountEl.textContent = String(currentApprovedHistory.length);
    }
    if (staffApprovalPositionCountEl) {
      staffApprovalPositionCountEl.textContent = String(currentPositionCatalog.length);
    }
  };

  const renderPositionDatalist = () => {
    if (positionOptionsDatalistEl) {
      positionOptionsDatalistEl.innerHTML = currentPositionCatalog
        .map((item) => `<option value="${toSafeText(item.name)}"></option>`)
        .join("");
    }
    const divisions = Array.from(
      new Map(
        currentPositionCatalog
          .map((item) => {
            const code = normalizeCode2(item.divisionCodeYY || item.yy || "");
            if (!code) return null;
            return [code, divisionCodeLabel(code)];
          })
          .filter(Boolean)
      ).entries()
    ).sort((a, b) => a[0].localeCompare(b[0]));
    if (divisionCodeOptionsDatalistEl) {
      divisionCodeOptionsDatalistEl.innerHTML = divisions
        .map(([code, label]) => `<option value="${toSafeText(code)}">${toSafeText(label)}</option>`)
        .join("");
    }
    if (divisionNameOptionsDatalistEl) {
      divisionNameOptionsDatalistEl.innerHTML = divisions
        .map(([, label]) => `<option value="${toSafeText(label)}"></option>`)
        .join("");
    }
  };

  const renderPositionAllowedPageOptions = (selectedPages = [], fallbackYY = "") => {
    if (!positionAllowedPagesEl) return;
    const selected = new Set(normalizeAllowedPages(selectedPages, fallbackYY));
    const allSelected = STAFF_PAGE_OPTIONS.every((item) => selected.has(item.id));
    positionAllowedPagesEl.innerHTML = [
      `
        <label class="staff-position-page-option staff-position-page-option-all">
          <input
            type="checkbox"
            class="staff-position-page-checkbox staff-position-page-checkbox-all"
            data-role="all-page-checkbox"
            ${allSelected ? "checked" : ""}
          />
          <span>แสดงทุกหน้า</span>
        </label>
      `,
      ...STAFF_PAGE_OPTIONS
      .map((item) => `
        <label class="staff-position-page-option">
          <input
            type="checkbox"
            class="staff-position-page-checkbox"
            data-role="page-checkbox"
            value="${toSafeText(item.id)}"
            ${selected.has(item.id) ? "checked" : ""}
          />
          <span>${toSafeText(item.label)}</span>
        </label>
      `)
    ]
      .join("");
  };

  const renderPositionAllowedPageOptionsMarkup = (selectedPages = [], fallbackYY = "", prefix = "edit") => {
    const selected = new Set(normalizeAllowedPages(selectedPages, fallbackYY));
    const allSelected = STAFF_PAGE_OPTIONS.every((item) => selected.has(item.id));
    return [
      `
        <label class="staff-position-page-option staff-position-page-option-all">
          <input
            type="checkbox"
            class="staff-position-page-checkbox staff-position-page-checkbox-all"
            data-role="${toSafeText(prefix)}-all-page-checkbox"
            ${allSelected ? "checked" : ""}
          />
          <span>แสดงทุกหน้า</span>
        </label>
      `,
      ...STAFF_PAGE_OPTIONS
      .map((item) => `
        <label class="staff-position-page-option">
          <input
            type="checkbox"
            class="staff-position-page-checkbox"
            data-role="${toSafeText(prefix)}-page-checkbox"
            value="${toSafeText(item.id)}"
            ${selected.has(item.id) ? "checked" : ""}
          />
          <span>${toSafeText(item.label)}</span>
        </label>
      `)
    ]
      .join("");
  };

  const updateManageResolvedPositionName = () => {
    if (!positionManageInputEl) return;
    const divisionCodeYY = normalizeCode2(positionDivisionCodeEl?.value || "");
    const existingDivision = currentPositionCatalog.find((item) => normalizeCode2(item.divisionCodeYY || "") === divisionCodeYY);
    const divisionLabel = normalizePositionText(
      positionDivisionNameEl?.value ||
      existingDivision?.divisionLabel ||
      existingDivision?.divisionName ||
      ""
    );
    const levelCodeZZ = normalizeCode2(positionLevelCodeEl?.value || "");
    positionManageInputEl.value = buildPositionNameFromParts(divisionCodeYY, levelCodeZZ, divisionLabel);
  };

  const updatePositionEditorResolvedName = (container) => {
    if (!(container instanceof Element)) return;
    const nameInput = container.querySelector('[data-role="edit-name"]');
    const yyInput = container.querySelector('[data-role="edit-yy"]');
    const divisionLabelInput = container.querySelector('[data-role="edit-division-label"]');
    const zzSelect = container.querySelector('[data-role="edit-zz"]');
    if (!(nameInput instanceof HTMLInputElement)) return;
    const divisionCodeYY = yyInput instanceof HTMLInputElement ? yyInput.value : "";
    const divisionLabel = divisionLabelInput instanceof HTMLInputElement ? divisionLabelInput.value : "";
    const levelCodeZZ = zzSelect instanceof HTMLSelectElement ? zzSelect.value : "";
    nameInput.value = buildPositionNameFromParts(divisionCodeYY, levelCodeZZ, divisionLabel);
  };

  const readSelectedPositionAllowedPages = () => {
    if (!positionAllowedPagesEl) return [];
    return Array.from(positionAllowedPagesEl.querySelectorAll(".staff-position-page-checkbox:checked"))
      .map((input) => (input instanceof HTMLInputElement ? input.value : ""))
      .filter(Boolean);
  };

  const readSelectedPositionAllowedPagesFrom = (container) => {
    if (!(container instanceof Element)) return [];
    return Array.from(container.querySelectorAll('[data-role="edit-page-checkbox"]:checked'))
      .map((input) => (input instanceof HTMLInputElement ? input.value : ""))
      .filter(Boolean);
  };

  const syncAllPagesCheckbox = (container, prefix = "") => {
    if (!(container instanceof Element)) return;
    const pageSelector = prefix
      ? `[data-role="${prefix}-page-checkbox"]`
      : '[data-role="page-checkbox"]';
    const allSelector = prefix
      ? `[data-role="${prefix}-all-page-checkbox"]`
      : '[data-role="all-page-checkbox"]';
    const pages = Array.from(container.querySelectorAll(pageSelector))
      .filter((input) => input instanceof HTMLInputElement);
    const allInput = container.querySelector(allSelector);
    if (!(allInput instanceof HTMLInputElement)) return;
    allInput.checked = pages.length > 0 && pages.every((input) => input.checked);
    allInput.indeterminate = pages.some((input) => input.checked) && !allInput.checked;
  };

  const handleAllowedPagesToggle = (event, container, prefix = "") => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const allRole = prefix ? `${prefix}-all-page-checkbox` : "all-page-checkbox";
    const pageRole = prefix ? `${prefix}-page-checkbox` : "page-checkbox";
    if (target.dataset.role === allRole) {
      const pageSelector = prefix
        ? `[data-role="${prefix}-page-checkbox"]`
        : '[data-role="page-checkbox"]';
      container.querySelectorAll(pageSelector).forEach((input) => {
        if (input instanceof HTMLInputElement) input.checked = target.checked;
      });
      target.indeterminate = false;
      return;
    }
    if (target.dataset.role === pageRole) {
      syncAllPagesCheckbox(container, prefix);
    }
  };

  const renderAllowedPageBadges = (allowedPages = []) => {
    const pages = new Set(normalizeAllowedPages(allowedPages, ""));
    const orderedPages = [
      ...STAFF_PAGE_OPTIONS.map((item) => item.id),
      "project-status-staff"
    ]
      .filter((page) => pages.has(page));
    if (!orderedPages.length) return '<span class="staff-position-page-badge is-summary">ไม่มีหน้าฝั่ง Staff</span>';
    const hasAllSelectableStaffPages = STAFF_PAGE_OPTIONS.every((item) => pages.has(item.id));
    if (hasAllSelectableStaffPages) {
      return `<span class="staff-position-page-badge is-summary">ทุกหน้า (${toSafeText(STAFF_PAGE_OPTIONS.length)} หน้า)</span>`;
    }
    return orderedPages
      .map((page) => `<span class="staff-position-page-badge">${toSafeText(getStaffPageLabel(page))}</span>`)
      .join("");
  };

  const renderApplicationPositionSelect = () => {
    const currentUserEmail = getCurrentAuthEmail();
    const localProfile = currentUserEmail ? (readLoginProfiles()[currentUserEmail] || {}) : {};
    const profileType = ((localProfile.profileType || window.currentUserProfileType || "student").toString().trim().toLowerCase() === "affairs")
      ? "affairs"
      : "student";

    if (appProfileHintEl) {
      appProfileHintEl.textContent = profileType === "affairs"
        ? "ระบบกำหนดตำแหน่งสมัครได้เพียงรายการเดียวตามประเภทบัญชีผู้ใช้"
        : "เลือกหมวดงานก่อน แล้วค่อยเลือกระดับตำแหน่ง";
    }
    if (appDivisionLabelEl) {
      appDivisionLabelEl.textContent = profileType === "affairs" ? "หมวดงาน" : "ฝ่าย / หมวดงาน";
    }
    if (appLevelLabelEl) {
      appLevelLabelEl.textContent = profileType === "affairs" ? "ระดับตำแหน่ง" : "ตำแหน่ง";
    }

    if (appStudentFieldsEl) appStudentFieldsEl.hidden = false;

    if (profileType === "affairs") {
      const affairsPosition = currentPositionCatalog.find((item) => normalizeCode2(item.divisionCodeYY) === "09")
        || DEFAULT_POSITION_OPTIONS.find((item) => normalizeCode2(item.divisionCodeYY) === "09")
        || null;
      const positionName = normalizePositionText(affairsPosition?.name || "เจ้าหน้าที่สำนักบริหารกิจการนิสิต");
      if (appResolvedPositionEl) appResolvedPositionEl.value = positionName;
      if (appPositionEl) appPositionEl.value = positionName;
      if (appDivisionEl) {
        appDivisionEl.innerHTML = '<option value="09" selected>เจ้าหน้าที่สำนักบริหารกิจการนิสิต</option>';
        appDivisionEl.value = "09";
      }
      if (appLevelEl) {
        appLevelEl.innerHTML = '<option value="04" selected>เจ้าหน้าที่</option>';
        appLevelEl.value = "04";
      }
      return;
    }

    const currentDivision = normalizeCode2(appDivisionEl?.value || "");
    const currentLevel = normalizeCode2(appLevelEl?.value || "");
    const studentPositions = currentPositionCatalog.filter((item) => normalizeCode2(item.divisionCodeYY) !== "09");
    const divisionList = Array.from(
      new Map(
        studentPositions.map((item) => [normalizeCode2(item.divisionCodeYY), item])
      ).values()
    ).sort((a, b) => normalizeCode2(a.divisionCodeYY).localeCompare(normalizeCode2(b.divisionCodeYY)));

    if (appDivisionEl) {
      appDivisionEl.innerHTML = [
        '<option value="" selected disabled>เลือกฝ่ายใหญ่</option>',
        ...divisionList.map((item) => {
          const yy = normalizeCode2(item.divisionCodeYY);
          return `<option value="${toSafeText(yy)}">${toSafeText(divisionCodeLabel(yy))}</option>`;
        })
      ].join("");
      if (divisionList.some((item) => normalizeCode2(item.divisionCodeYY) === currentDivision)) {
        appDivisionEl.value = currentDivision;
      }
    }

    const activeDivision = normalizeCode2(appDivisionEl?.value || "");
    const levelList = studentPositions.filter((item) => normalizeCode2(item.divisionCodeYY) === activeDivision);
    const uniqueLevels = Array.from(
      new Map(
        levelList.map((item) => [normalizeCode2(item.levelCodeZZ), item])
      ).values()
    ).sort((a, b) => normalizeCode2(a.levelCodeZZ).localeCompare(normalizeCode2(b.levelCodeZZ)));

    if (appLevelEl) {
      appLevelEl.innerHTML = [
        '<option value="" selected disabled>เลือกระดับตำแหน่ง</option>',
        ...uniqueLevels.map((item) => {
          const zz = normalizeCode2(item.levelCodeZZ);
          return `<option value="${toSafeText(zz)}">${toSafeText(levelCodeLabel(zz))}</option>`;
        })
      ].join("");
      if (uniqueLevels.some((item) => normalizeCode2(item.levelCodeZZ) === currentLevel)) {
        appLevelEl.value = currentLevel;
      }
    }

    const activeLevel = normalizeCode2(appLevelEl?.value || "");
    const resolvedPosition = levelList.find((item) => normalizeCode2(item.levelCodeZZ) === activeLevel) || null;
    const resolvedName = normalizePositionText(resolvedPosition?.name || "");
    if (appResolvedPositionEl) {
      appResolvedPositionEl.value = resolvedName || "";
    }
    if (appPositionEl) {
      appPositionEl.value = resolvedName || "";
    }
  };

  const renderPositionCatalog = () => {
    if (!positionListEl) return;

    if (!currentPositionCatalog.length) {
      positionListEl.innerHTML = '<div class="section-text-sm">ยังไม่มีรายการตำแหน่ง</div>';
      refreshSummaryCounts();
      return;
    }

    const allowManage = isSuperStaff();
    positionListEl.innerHTML = currentPositionCatalog
      .map((item) => {
        const removeBtn = allowManage
          ? `<button type="button" class="btn-ghost staff-position-remove-btn" data-position-id="${toSafeText(item.id)}">ลบ</button>`
          : "";
        const editBtn = allowManage
          ? `<button type="button" class="btn-ghost staff-position-edit-btn" data-edit-position-id="${toSafeText(item.id)}">${currentEditingPositionId === item.id ? "ยกเลิก" : "แก้ไข"}</button>`
          : "";
        const yy = normalizeCode2(item.divisionCodeYY || "00");
        const zz = normalizeCode2(item.levelCodeZZ || "00");
        const divisionLabel = normalizePositionText(item.divisionLabel || item.divisionName || divisionCodeLabel(yy));
        const generatedName = buildPositionNameFromParts(yy, zz, divisionLabel) || item.name;
        const allowedPages = getAllowedPagesForCatalogPosition(item);
        const isEditing = allowManage && currentEditingPositionId === item.id;
        return `
          <div class="staff-position-chip${isEditing ? " is-editing" : ""}">
            <div class="staff-position-chip-main">
              <div class="staff-position-chip-summary">
                <span class="staff-position-chip-name">${toSafeText(generatedName)}</span>
              </div>
              <div class="staff-position-chip-pages${isEditing ? " is-muted" : ""}">
                ${renderAllowedPageBadges(allowedPages)}
              </div>
              ${isEditing ? `
                <div class="staff-position-editor">
                  <div class="staff-position-editor-head">
                    <div>
                      <div class="staff-position-editor-title">แก้ไขตำแหน่ง</div>
                    </div>
                    <div class="staff-position-editor-source">ใช้เป็นสิทธิ์หลัก</div>
                  </div>
                  <div class="staff-position-editor-grid">
                    <div class="staff-position-editor-field staff-position-editor-result-field">
                      <label class="login-label" for="staffPositionEditName-${toSafeText(item.id)}">ชื่อตำแหน่ง</label>
                      <input
                        id="staffPositionEditName-${toSafeText(item.id)}"
                        class="login-input staff-position-result-input"
                        type="text"
                        data-role="edit-name"
                        value="${toSafeText(generatedName)}"
                        readonly
                        aria-readonly="true"
                      />
                    </div>
                    <div class="staff-position-editor-field">
                      <label class="login-label" for="staffPositionEditYY-${toSafeText(item.id)}">หมวดงาน</label>
                      <input
                        id="staffPositionEditYY-${toSafeText(item.id)}"
                        class="login-input"
                        type="text"
                        inputmode="numeric"
                        pattern="\\d{2}"
                        maxlength="2"
                        list="staffDivisionCodeOptionsList"
                        data-role="edit-yy"
                        value="${toSafeText(yy)}"
                      />
                    </div>
                    <div class="staff-position-editor-field">
                      <label class="login-label" for="staffPositionEditDivisionName-${toSafeText(item.id)}">ชื่อหมวดงาน</label>
                      <input
                        id="staffPositionEditDivisionName-${toSafeText(item.id)}"
                        class="login-input"
                        type="text"
                        list="staffDivisionNameOptionsList"
                        data-role="edit-division-label"
                        value="${toSafeText(divisionLabel)}"
                      />
                    </div>
                    <div class="staff-position-editor-field">
                      <label class="login-label" for="staffPositionEditZZ-${toSafeText(item.id)}">ระดับตำแหน่ง</label>
                      <select id="staffPositionEditZZ-${toSafeText(item.id)}" class="login-input" data-role="edit-zz">
                        <option value="01" ${zz === "01" ? "selected" : ""}>ประธานฝ่าย</option>
                        <option value="02" ${zz === "02" ? "selected" : ""}>รองประธานฝ่าย</option>
                        <option value="03" ${zz === "03" ? "selected" : ""}>เลขานุการฝ่าย</option>
                        <option value="04" ${zz === "04" ? "selected" : ""}>ผู้ช่วยฝ่าย</option>
                      </select>
                    </div>
                  </div>
                  <div class="staff-position-editor-pages">
                    <div class="staff-position-editor-pages-title">หน้าที่อนุญาตให้แสดง</div>
                    <div class="staff-position-pages-grid">
                      ${renderPositionAllowedPageOptionsMarkup(allowedPages, yy, "edit")}
                    </div>
                  </div>
                  <div class="staff-position-editor-actions">
                    <button type="button" class="btn-primary staff-position-save-btn" data-save-position-id="${toSafeText(item.id)}">บันทึกการแก้ไข</button>
                  </div>
                </div>
              ` : ""}
            </div>
            <div class="staff-position-chip-actions">
              ${editBtn}
              ${removeBtn}
            </div>
          </div>
        `;
      })
      .join("");

    refreshSummaryCounts();
  };

  const renderMyApplications = () => {
    if (!myTableBodyEl || !myCaptionEl) return;
    myCaptionEl.textContent = `แสดงผล ${currentMyApplications.length} รายการ`;

    if (!currentMyApplications.length) {
      myTableBodyEl.innerHTML = '<tr><td colspan="4">ยังไม่มีคำขอสมัครสตาฟ</td></tr>';
      return;
    }

    myTableBodyEl.innerHTML = currentMyApplications
      .map((item) => {
          const reviewerNote = (item.reviewedNote || "").toString().trim();
          return `
            <tr>
              <td data-label="เวลายื่นคำขอ">${toSafeText(formatDateTime(item.createdAt))}</td>
              <td data-label="ตำแหน่ง">${toSafeText(item.requestedPosition || "-")}</td>
              <td data-label="สถานะ">${mapStatusBadge(item.status)}</td>
              <td data-label="หมายเหตุ">${toSafeText(reviewerNote || "-")}</td>
            </tr>
          `;
      })
      .join("");
  };

  const renderApprovalRows = () => {
    if (!approvalBodyEl || !approvalCaptionEl) return;

    try {
      approvalCaptionEl.textContent = `แสดงผล ${currentPendingApplications.length} รายการ`;
      setMessage(approvalMessageEl, "", "#6b7280");
      if (!currentPendingApplications.length) {
        approvalBodyEl.innerHTML = '<tr><td colspan="4">ไม่มีคำขอที่รออนุมัติ</td></tr>';
        refreshSummaryCounts();
        syncApprovalPanelCaption();
        return;
      }

      approvalBodyEl.innerHTML = currentPendingApplications
        .map((item) => {
          const id = (item.id || "").toString();
          const applicantEmail = (item.applicantEmail || "").toString().trim().toLowerCase();
          const applicantName = (item.applicantName || "-").toString();
          const applicantNick = (item.applicantNick || "").toString();
          const createdAtText = typeof formatDateTime === "function"
            ? formatDateTime(item.createdAt)
            : "-";
          const requestedPosition = (item.requestedPosition || "").toString();
          return `
            <tr
              data-application-id="${toSafeText(id)}"
              data-applicant-email="${toSafeText(applicantEmail)}"
              data-applicant-name="${toSafeText(applicantName)}"
              data-applicant-nick="${toSafeText(applicantNick)}"
            >
              <td data-label="ผู้สมัคร">
                <div>${toSafeText(applicantName)}</div>
                <div class="section-text-sm">${toSafeText(applicantEmail || "-")}</div>
              </td>
              <td data-label="เวลายื่นคำขอ">${toSafeText(createdAtText)}</td>
              <td data-label="ตำแหน่งที่ขอ">
                <input
                  type="text"
                  class="login-input staff-approval-position-input"
                  list="staffPositionOptionsList"
                  data-application-id="${toSafeText(id)}"
                  value="${toSafeText(requestedPosition)}"
                  placeholder="ตำแหน่งที่อนุมัติ"
                />
              </td>
              <td data-label="จัดการคำขอ">
                <select
                  class="staff-status-select is-pending staff-approval-action-select"
                  data-role="status-select"
                  data-application-id="${toSafeText(id)}"
                  aria-label="จัดการคำขอสตาฟ"
                >
                  <option value="pending" selected>รออนุมัติ</option>
                  <option value="approved">อนุมัติแล้ว</option>
                  <option value="rejected">ไม่อนุมัติ</option>
                </select>
              </td>
            </tr>
          `;
        })
        .join("");
      refreshSummaryCounts();
      syncApprovalPanelCaption();
    } catch (error) {
      console.error("renderApprovalRows failed - app.staff-access.js:1683", error);
      approvalBodyEl.innerHTML = `<tr><td colspan="4">แสดงผลคำขอไม่สำเร็จ: ${toSafeText(error?.message || "unknown")}</td></tr>`;
      setMessage(approvalMessageEl, "แสดงผลคำขอไม่สำเร็จ กรุณาลองใหม่", "#b91c1c");
    }
  };

  const renderApprovedHistory = () => {
    if (!approvalHistoryBodyEl || !approvalHistoryCaptionEl) return;

    try {
      const groupedMap = new Map();
      currentApprovedHistory.forEach((item) => {
        const emailKey = (item.applicantEmail || "").toString().trim().toLowerCase();
        const uidKey = (item.applicantUid || "").toString().trim();
        const fallbackKey = (item.id || "").toString().trim();
        const key = emailKey || uidKey || fallbackKey;
        if (!key) return;
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            key,
            applicantEmail: item.applicantEmail || "",
            applicantUid: item.applicantUid || "",
            applicantName: item.applicantName || "-",
            applicantNick: item.applicantNick || "",
            primaryApplicationId: (item.id || "").toString(),
            primaryUpdatedAt: item.updatedAt || item.createdAt || null,
            approvedPosition: item.approvedPosition || item.requestedPosition || "-",
            approvedPositionCode: item.approvedPositionCode || "-",
            reviewedByEmail: item.reviewedByEmail || "",
            reviewedNote: item.reviewedNote || "",
            approvedItems: []
          });
        }
        const target = groupedMap.get(key);
        if (!target.applicantEmail && item.applicantEmail) {
          target.applicantEmail = item.applicantEmail;
        }
        if (!target.applicantUid && item.applicantUid) {
          target.applicantUid = item.applicantUid;
        }
        if ((!target.applicantName || target.applicantName === "-") && item.applicantName) {
          target.applicantName = item.applicantName;
        }
        if (!target.applicantNick && item.applicantNick) {
          target.applicantNick = item.applicantNick;
        }
        target.approvedItems.push({
          id: (item.id || "").toString(),
          position: (item.approvedPosition || item.requestedPosition || "-").toString(),
          code: (item.approvedPositionCode || "-").toString(),
          reviewedByEmail: (item.reviewedByEmail || "").toString(),
          reviewedNote: (item.reviewedNote || "").toString(),
          approvedAt: item.updatedAt || item.createdAt || null
        });

        const currentTime = typeof target.primaryUpdatedAt?.toMillis === "function"
          ? target.primaryUpdatedAt.toMillis()
          : new Date(target.primaryUpdatedAt || 0).getTime();
        const itemTime = typeof item?.updatedAt?.toMillis === "function"
          ? item.updatedAt.toMillis()
          : new Date(item?.updatedAt || item?.createdAt || 0).getTime();
        if ((Number.isFinite(itemTime) ? itemTime : 0) > (Number.isFinite(currentTime) ? currentTime : 0)) {
          target.primaryApplicationId = (item.id || "").toString();
          target.primaryUpdatedAt = item.updatedAt || item.createdAt || null;
          target.approvedPosition = item.approvedPosition || item.requestedPosition || "-";
          target.approvedPositionCode = item.approvedPositionCode || "-";
          target.reviewedByEmail = item.reviewedByEmail || "";
          target.reviewedNote = item.reviewedNote || "";
        }
      });

      currentApprovedHistoryGrouped = Array.from(groupedMap.values()).sort((a, b) => {
        const aTime = typeof a?.primaryUpdatedAt?.toMillis === "function"
          ? a.primaryUpdatedAt.toMillis()
          : new Date(a?.primaryUpdatedAt || 0).getTime();
        const bTime = typeof b?.primaryUpdatedAt?.toMillis === "function"
          ? b.primaryUpdatedAt.toMillis()
          : new Date(b?.primaryUpdatedAt || 0).getTime();
        return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
      });

      approvalHistoryCaptionEl.textContent = `แสดงผล ${currentApprovedHistoryGrouped.length} รายการ`;
      if (!currentPendingApplications.length) {
        setMessage(approvalMessageEl, "", "#6b7280");
      }
      if (!currentApprovedHistoryGrouped.length) {
        approvalHistoryBodyEl.innerHTML = '<tr><td colspan="3">ยังไม่มีรายการที่อนุมัติ</td></tr>';
        refreshSummaryCounts();
        syncApprovalPanelCaption();
        return;
      }

      approvalHistoryBodyEl.innerHTML = currentApprovedHistoryGrouped
        .map((item) => {
          const id = (item.primaryApplicationId || "").toString();
          const approvedPosition = (item.approvedPosition || "-").toString();
          const applicantName = (item.applicantName || "-").toString();
          const applicantEmail = (item.applicantEmail || "-").toString();
          const approvedCodes = Array.from(
            new Set(
              (Array.isArray(item.approvedItems) ? item.approvedItems : [])
                .map((entry) => (entry?.code || "").toString().trim())
                .filter(Boolean)
            )
          );
          const approvedPositionCode = approvedCodes.length
            ? approvedCodes.map((code) => `<span class="staff-approval-history-code">${toSafeText(code)}</span>`).join(" ")
            : `<span class="staff-approval-history-code">-</span>`;
          return `
            <tr class="staff-approval-history-row" data-application-id="${toSafeText(id)}" data-staff-key="${toSafeText(item.key || "")}">
              <td data-label="ผู้ที่ถูกอนุมัติ">
                <div>${toSafeText(applicantName)}</div>
                <div class="section-text-sm">${toSafeText(applicantEmail)}</div>
              </td>
              <td data-label="ตำแหน่ง">${toSafeText(approvedPosition)}</td>
              <td data-label="รหัสตำแหน่ง">${approvedPositionCode}</td>
            </tr>
          `;
        })
        .join("");

      refreshSummaryCounts();
      syncApprovalPanelCaption();
    } catch (error) {
      console.error("renderApprovedHistory failed - app.staff-access.js:1807", error);
      approvalHistoryBodyEl.innerHTML = `<tr><td colspan="3">แสดงผลรายชื่อไม่สำเร็จ: ${toSafeText(error?.message || "unknown")}</td></tr>`;
    }
  };

  const getOrgRepresentativeApplicant = (item = {}) => {
    const applicant = item.applicant && typeof item.applicant === "object" ? item.applicant : {};
    const requester = item.requester && typeof item.requester === "object" ? item.requester : {};
    const email = (item.applicantEmail || applicant.email || requester.email || "").toString().trim().toLowerCase();
    const academic = deriveAcademicProfile(
      {
        ...requester,
        ...applicant,
        studentId: applicant.studentId || requester.studentId || item.studentId || "",
        faculty: applicant.faculty || requester.faculty || item.faculty || "",
        year: applicant.year || requester.year || item.year || ""
      },
      email
    );
    const displayName = (applicant.displayName || requester.displayName || item.applicantName || email || "-").toString();
    return {
      email,
      displayName,
      phone: (applicant.phone || requester.phone || "").toString(),
      lineId: (applicant.lineId || requester.lineId || "").toString(),
      studentId: getMeaningfulProfileValue(applicant.studentId, requester.studentId, item.studentId, academic.studentId),
      faculty: getMeaningfulProfileValue(applicant.faculty, requester.faculty, item.faculty, academic.faculty),
      year: getMeaningfulProfileValue(applicant.year, requester.year, item.year, academic.year)
    };
  };

  const getOrgRepresentativeOrgKey = (orgType = "", orgName = "") => {
    const type = (orgType || "").toString().trim();
    const name = (orgName || "").toString().trim();
    return `${type || "-"}||${name || "-"}`.toLowerCase();
  };

  const getKnownOrganizationFilters = () => {
    try {
      if (typeof orgFilters !== "undefined" && Array.isArray(orgFilters)) return orgFilters;
    } catch (_) {}
    return Array.isArray(globalThis.orgFilters) ? globalThis.orgFilters : [];
  };

  const loadOrgRepresentativeOrgFiltersFromStore = async () => {
    if (!resolveStore() || !firestore.getDocs || !firestore.collection) return false;
    const colRef = firestore.collection(firestore.db, COLLECTION_ORGANIZATION_CATALOG);
    const q = firestore.query && firestore.where
      ? firestore.query(colRef, firestore.where("status", "==", "active"))
      : colRef;
    const snapshot = await firestore.getDocs(q);
    const rows = [];
    (snapshot?.docs || []).forEach((docSnap) => {
      const data = docSnap.data?.() || {};
      const status = normalizeOrganizationCatalogText(data.status || "active").toLowerCase();
      if (status && status !== "active") return;
      const group = normalizeOrganizationCatalogText(data.group || data.organizationType || data.orgGroup);
      const name = normalizeOrganizationCatalogText(data.name || data.organizationName || data.orgName);
      if (!group || !name) return;
      const code = normalizeOrganizationCatalogText(data.code || data.orgCode).toUpperCase();
      rows.push({
        id: normalizeOrganizationCatalogText(docSnap.id),
        group,
        name,
        code,
        documentRunCode: resolveOrganizationCatalogDocumentRunBaseForGroup({
          group,
          code,
          documentRunCode: data.documentRunCode || data.runCode,
          documentRunCodeByAcademicYear: data.documentRunCodeByAcademicYear,
          runCodeByAcademicYear: data.runCodeByAcademicYear
        }),
        documentRunCodeByAcademicYear: buildOrganizationCatalogDocumentRunMap({
          documentRunCode: data.documentRunCode || data.runCode,
          documentRunCodeByAcademicYear: data.documentRunCodeByAcademicYear,
          runCodeByAcademicYear: data.runCodeByAcademicYear
        }),
        codeByAcademicYear: buildOrganizationCatalogCodeMap({
          group,
          code,
          codeByAcademicYear: data.codeByAcademicYear,
          orgCodeByAcademicYear: data.orgCodeByAcademicYear,
          documentRunCodeByAcademicYear: data.documentRunCodeByAcademicYear
        }),
        accountNo: normalizeOrganizationCatalogText(data.accountNo || data.bankAccount || data.bankAccountNo)
      });
    });
    rows.sort((a, b) =>
      a.group.localeCompare(b.group, "th") ||
      (a.code || "").localeCompare(b.code || "", "th", { numeric: true }) ||
      a.name.localeCompare(b.name, "th")
    );
    if (rows.length) {
      setLocalOrganizationCatalogRows(rows);
      return true;
    }
    return false;
  };

  const canLoadOrgRepresentativeOrgFilters = () =>
    typeof loadOrgFilters === "function" || !!(resolveStore() && firestore.getDocs && firestore.collection);

  const ensureOrgRepresentativeOrgFiltersLoaded = () => {
    if (orgRepresentativeOrgFiltersLoadedForPage && getKnownOrganizationFilters().length) return Promise.resolve(true);
    if (!canLoadOrgRepresentativeOrgFilters()) return Promise.resolve(false);
    if (orgRepresentativeOrgFiltersLoadPromise) return orgRepresentativeOrgFiltersLoadPromise;
    orgRepresentativeOrgFiltersLoadPromise = Promise.resolve()
      .then(() => {
        if (typeof loadOrgFilters === "function") {
          return Promise.resolve(loadOrgFilters()).then(() => getKnownOrganizationFilters().length > 0);
        }
        return false;
      })
      .then((loadedFromSharedLoader) => {
        if (loadedFromSharedLoader || getKnownOrganizationFilters().length) return true;
        return loadOrgRepresentativeOrgFiltersFromStore();
      })
      .then((loaded) => {
        orgRepresentativeOrgFiltersLoadedForPage = true;
        return !!loaded || getKnownOrganizationFilters().length > 0;
      })
      .catch((error) => {
        console.warn("load organization filters for representative overview failed", error);
        orgRepresentativeOrgFiltersLoadedForPage = true;
        return false;
      })
      .finally(() => {
        orgRepresentativeOrgFiltersLoadPromise = null;
      });
    return orgRepresentativeOrgFiltersLoadPromise;
  };

  const normalizeOrganizationCatalogText = (value) =>
    (value ?? "")
      .toString()
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim();

  const slugifyOrganizationCatalogId = (value) => {
    const slug = normalizeOrganizationCatalogText(value)
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120);
    return slug || `organization-${Date.now()}`;
  };

  const getOrganizationCatalogDisplayAcademicYear = () => {
    const selected = normalizeOrganizationCatalogText(currentOrgRepresentativeAcademicYear);
    if (/^\d{4}$/.test(selected)) return selected;
    return String(getCurrentAcademicYearBE());
  };

  const ORGANIZATION_CATALOG_LEGACY_DOCUMENT_RUN_ACADEMIC_YEAR = "2568";

  const ORGANIZATION_CATALOG_DOCUMENT_PREFIX_BY_GROUP = new Map([
    ["องค์การบริหารสโมสรนิสิต", "อบจ."],
    ["สภานิสิต", "สภจ."],
    ["ชมรมฝ่ายกีฬา", "อบจ.กฬ."],
    ["ชมรมฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์", "อบจ.พฒ."],
    ["ชมรมฝ่ายวิชาการ", "อบจ.วชก."],
    ["ชมรมฝ่ายศิลปะและวัฒนธรรม", "อบจ.ศป."]
  ]);

  const getOrganizationCatalogDocumentPrefix = (group) =>
    ORGANIZATION_CATALOG_DOCUMENT_PREFIX_BY_GROUP.get(normalizeOrganizationCatalogText(group)) || "";

  const isOrganizationCatalogManualDocumentRunGroup = (group) =>
    normalizeOrganizationCatalogText(group) === "องค์การบริหารสโมสรนิสิต";

  const isOrganizationCatalogCouncilGroup = (group) =>
    normalizeOrganizationCatalogText(group) === "สภานิสิต";

  const ORGANIZATION_CATALOG_RESPONSIBILITY_DIVISIONS = [
    { code: "01", label: "ฝ่ายนายกสโมสร" },
    { code: "02", label: "ฝ่ายอุปนายกคนที่หนึ่ง" },
    { code: "03", label: "ฝ่ายอุปนายกคนที่สอง" },
    { code: "04", label: "ฝ่ายเลขานุการ" },
    { code: "05", label: "ฝ่ายนิสิตสัมพันธ์" },
    { code: "06", label: "ฝ่ายศิลปะและวัฒนธรรม" },
    { code: "07", label: "ฝ่ายวิชาการ" },
    { code: "08", label: "ฝ่ายกีฬา" },
    { code: "09", label: "ฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์" },
    { code: "10", label: "ฝ่ายเหรัญญิก" }
  ];

  const populateOrganizationCatalogResponsibilityDivisions = () => {
    if (!organizationCatalogResponsibilityDivisionEl) return;
    if (organizationCatalogResponsibilityDivisionEl.options.length > 1) return;
    organizationCatalogResponsibilityDivisionEl.innerHTML = [
      '<option value="">เลือกฝ่ายหลัก</option>',
      ...ORGANIZATION_CATALOG_RESPONSIBILITY_DIVISIONS.map((item) =>
        `<option value="${toSafeText(item.code)}">${toSafeText(`${item.code} ${item.label}`)}</option>`
      ),
      '<option value="__custom__">กำหนดฝ่ายหลักเอง</option>'
    ].join("");
  };

  const stripOrganizationCatalogDocumentRunYear = (value) =>
    normalizeOrganizationCatalogText(value)
      .replace(/^(?:อบจ(?:\.(?:กฬ|พฒ|วชก|ศป))?\.?)\s*/u, "")
      .replace(/\s*\/\s*\d{4}\s*$/u, "");

  const parseOrganizationCatalogManualDocumentRunBase = (value) => {
    const base = stripOrganizationCatalogDocumentRunYear(value);
    const match = base.match(/^(\d{1,2})(?:[.-](\d{1,3}))?$/);
    if (!match) return { divisionCode: "", subCode: "" };
    return {
      divisionCode: match[1].padStart(2, "0").slice(-2),
      subCode: match[2] ? match[2].padStart(2, "0") : ""
    };
  };

  const getOrganizationCatalogManualRunForYear = (item = {}, academicYear = getOrganizationCatalogDisplayAcademicYear()) => {
    const year = normalizeOrganizationCatalogText(academicYear);
    const runMap = buildOrganizationCatalogDocumentRunMap({
      documentRunCode: item.documentRunCode || item.runCode,
      documentRunCodeByAcademicYear: item.documentRunCodeByAcademicYear,
      runCodeByAcademicYear: item.runCodeByAcademicYear
    });
    return stripOrganizationCatalogDocumentRunYear(runMap[year] || "");
  };

  const getOrganizationCatalogManualRunSubNumber = (value) => {
    const parsed = parseOrganizationCatalogManualDocumentRunBase(value);
    const number = Number(parsed.subCode);
    return Number.isFinite(number) && number > 0 ? number : 0;
  };

  const formatOrganizationCatalogManualRunSubCode = (value) =>
    String(Math.max(1, Number(value) || 1)).padStart(2, "0");

  const getOrganizationCatalogSelectedDivisionCode = () => {
    const selectedDivision = normalizeOrganizationCatalogText(organizationCatalogResponsibilityDivisionEl?.value);
    const rawDivisionCode = selectedDivision === "__custom__"
      ? organizationCatalogCustomDivisionCodeEl?.value
      : selectedDivision;
    return normalizeOrganizationCatalogText(rawDivisionCode)
      .replace(/\D/g, "")
      .padStart(2, "0")
      .slice(-2);
  };

  const getOrganizationCatalogNextManualSubCode = ({ group = "", divisionCode = "", academicYear = "", excludeIds = [] } = {}) => {
    const excluded = new Set(excludeIds.map((id) => normalizeOrganizationCatalogText(id)).filter(Boolean));
    const year = normalizeOrganizationCatalogText(academicYear) || getOrganizationCatalogDisplayAcademicYear();
    let maxSubCode = 0;
    getOrganizationCatalogRows().forEach((item) => {
      if (excluded.has(normalizeOrganizationCatalogText(item.id))) return;
      if (normalizeOrganizationCatalogText(item.group) !== normalizeOrganizationCatalogText(group)) return;
      const parsed = parseOrganizationCatalogManualDocumentRunBase(getOrganizationCatalogManualRunForYear(item, year));
      if (parsed.divisionCode !== divisionCode) return;
      const subNumber = Number(parsed.subCode);
      if (Number.isFinite(subNumber) && subNumber > maxSubCode) maxSubCode = subNumber;
    });
    return formatOrganizationCatalogManualRunSubCode(maxSubCode + 1);
  };

  const resolveOrganizationCatalogManualDocumentRunBaseFromForm = ({ group = "" } = {}) => {
    const divisionCode = getOrganizationCatalogSelectedDivisionCode();
    if (!divisionCode) return "";
    const id = normalizeOrganizationCatalogText(organizationCatalogFields.id?.value);
    const academicYear = getOrganizationCatalogDisplayAcademicYear();
    const existingItem = id ? getOrganizationCatalogRows().find((item) => item.id === id) : null;
    const existingParsed = parseOrganizationCatalogManualDocumentRunBase(getOrganizationCatalogManualRunForYear(existingItem, academicYear));
    const typedSubCode = normalizeOrganizationCatalogText(organizationCatalogResponsibilitySubCodeEl?.value)
      .replace(/\D/g, "")
      .padStart(2, "0");
    const shouldAutoAppend = !id || (existingParsed.divisionCode && existingParsed.divisionCode !== divisionCode);
    const subCode = shouldAutoAppend
      ? getOrganizationCatalogNextManualSubCode({ group, divisionCode, academicYear, excludeIds: [id] })
      : typedSubCode || existingParsed.subCode || getOrganizationCatalogNextManualSubCode({ group, divisionCode, academicYear, excludeIds: [id] });
    return subCode ? `${divisionCode}.${subCode}` : "";
  };

  const buildOrganizationCatalogManualDocumentRunBase = () => {
    const divisionCode = getOrganizationCatalogSelectedDivisionCode();
    const subCode = normalizeOrganizationCatalogText(organizationCatalogResponsibilitySubCodeEl?.value)
      .replace(/\D/g, "")
      .padStart(2, "0");
    if (!divisionCode || !subCode) return "";
    return `${divisionCode}.${subCode}`;
  };

  const formatOrganizationCatalogDocumentRunCode = (value, group = "") => {
    const base = stripOrganizationCatalogDocumentRunYear(value);
    if (!base) return "";
    const prefix = getOrganizationCatalogDocumentPrefix(group);
    const displayBase = isOrganizationCatalogManualDocumentRunGroup(group) && !/-YYY$/i.test(base)
      ? `${base}-YYY`
      : base;
    return `${prefix ? `${prefix} ` : ""}${displayBase}/${getOrganizationCatalogDisplayAcademicYear()}`;
  };

  const getOrganizationCatalogDocumentRunBaseFromCode = (code) => {
    const match = normalizeOrganizationCatalogText(code).toUpperCase().match(/^[A-Z]+-(\d{2,})$/);
    return match ? `${match[1]}-YYY` : "";
  };

  const resolveOrganizationCatalogDocumentRunBase = ({ code = "", documentRunCode = "" } = {}) =>
    getOrganizationCatalogDocumentRunBaseFromCode(code) || stripOrganizationCatalogDocumentRunYear(documentRunCode);

  const normalizeOrganizationCatalogDocumentRunMap = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.entries(value).reduce((acc, [year, runCode]) => {
      const normalizedYear = normalizeOrganizationCatalogText(year);
      const normalizedRunCode = stripOrganizationCatalogDocumentRunYear(runCode);
      if (/^\d{4}$/.test(normalizedYear) && normalizedRunCode) {
        acc[normalizedYear] = normalizedRunCode;
      }
      return acc;
    }, {});
  };

  const buildOrganizationCatalogDocumentRunMap = ({ documentRunCode = "", documentRunCodeByAcademicYear = {}, runCodeByAcademicYear = {} } = {}) => {
    const map = {
      ...normalizeOrganizationCatalogDocumentRunMap(runCodeByAcademicYear),
      ...normalizeOrganizationCatalogDocumentRunMap(documentRunCodeByAcademicYear)
    };
    const legacyRunCode = stripOrganizationCatalogDocumentRunYear(documentRunCode);
    if (legacyRunCode && !Object.keys(map).length) {
      map[ORGANIZATION_CATALOG_LEGACY_DOCUMENT_RUN_ACADEMIC_YEAR] = legacyRunCode;
    }
    return map;
  };

  const resolveOrganizationCatalogDocumentRunBaseForGroup = ({
    group = "",
    code = "",
    documentRunCode = "",
    documentRunCodeByAcademicYear = {},
    runCodeByAcademicYear = {},
    academicYear = getOrganizationCatalogDisplayAcademicYear()
  } = {}) => {
    if (isOrganizationCatalogCouncilGroup(group)) {
      return "YYY";
    }
    if (!isOrganizationCatalogManualDocumentRunGroup(group)) {
      return resolveOrganizationCatalogDocumentRunBase({ code, documentRunCode });
    }
    const year = normalizeOrganizationCatalogText(academicYear);
    const runMap = buildOrganizationCatalogDocumentRunMap({
      documentRunCode,
      documentRunCodeByAcademicYear,
      runCodeByAcademicYear
    });
    return stripOrganizationCatalogDocumentRunYear(runMap[year] || "");
  };

  const resolveOrganizationCatalogDocumentRunBaseFromForm = ({ group = "", code = "" } = {}) =>
    isOrganizationCatalogCouncilGroup(group)
      ? "YYY"
      : isOrganizationCatalogManualDocumentRunGroup(group)
      ? resolveOrganizationCatalogManualDocumentRunBaseFromForm({ group }) || buildOrganizationCatalogManualDocumentRunBase() || stripOrganizationCatalogDocumentRunYear(organizationCatalogFields.documentRunCode?.value)
      : resolveOrganizationCatalogDocumentRunBase({
          code,
          documentRunCode: organizationCatalogFields.documentRunCode?.value
        });

  const ORGANIZATION_CATALOG_CODE_PREFIX_BY_GROUP = new Map([
    ["องค์การบริหารสโมสรนิสิต", "SGCU"],
    ["สภานิสิต", "SCCU"],
    ["ชมรมฝ่ายศิลปะและวัฒนธรรม", "ART"],
    ["ชมรมฝ่ายวิชาการ", "VCK"],
    ["ชมรมฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์", "PHT"],
    ["ชมรมฝ่ายกีฬา", "SPT"]
  ]);

  const getOrganizationCatalogCodePrefix = (group) =>
    ORGANIZATION_CATALOG_CODE_PREFIX_BY_GROUP.get(normalizeOrganizationCatalogText(group)) || "";

  const buildOrganizationCatalogManualCodeFromRunBase = (group = "", runBase = "") => {
    const prefix = getOrganizationCatalogCodePrefix(group);
    const base = stripOrganizationCatalogDocumentRunYear(runBase);
    return prefix && base ? `${prefix}-${base}`.toUpperCase() : "";
  };

  const normalizeOrganizationCatalogCodeMap = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.entries(value).reduce((acc, [year, code]) => {
      const normalizedYear = normalizeOrganizationCatalogText(year);
      const normalizedCode = normalizeOrganizationCatalogText(code).toUpperCase();
      if (/^\d{4}$/.test(normalizedYear) && normalizedCode) {
        acc[normalizedYear] = normalizedCode;
      }
      return acc;
    }, {});
  };

  const buildOrganizationCatalogCodeMap = ({ group = "", code = "", codeByAcademicYear = {}, orgCodeByAcademicYear = {}, documentRunCodeByAcademicYear = {} } = {}) => {
    const map = {
      ...normalizeOrganizationCatalogCodeMap(orgCodeByAcademicYear),
      ...normalizeOrganizationCatalogCodeMap(codeByAcademicYear)
    };
    if (isOrganizationCatalogManualDocumentRunGroup(group)) {
      Object.entries(normalizeOrganizationCatalogDocumentRunMap(documentRunCodeByAcademicYear)).forEach(([year, runCode]) => {
        const generatedCode = buildOrganizationCatalogManualCodeFromRunBase(group, runCode);
        if (generatedCode) map[year] = generatedCode;
      });
    }
    const legacyCode = normalizeOrganizationCatalogText(code).toUpperCase();
    if (legacyCode && !Object.keys(map).length) {
      map[ORGANIZATION_CATALOG_LEGACY_DOCUMENT_RUN_ACADEMIC_YEAR] = legacyCode;
    }
    return map;
  };

  const generateOrganizationCatalogCode = ({ id = "", group = "", code = "" } = {}, extraCodeValues = []) => {
    const explicitCode = normalizeOrganizationCatalogText(code).toUpperCase();
    if (explicitCode) return explicitCode;

    const prefix = getOrganizationCatalogCodePrefix(group);
    if (!prefix) return "";
    const pattern = new RegExp(`^${prefix}-(\\d{2,})$`, "i");
    let maxNumber = 0;
    [
      ...getOrganizationCatalogRows()
        .filter((item) => !id || item.id !== id)
        .map((item) => item.code),
      ...extraCodeValues
    ].forEach((value) => {
      const match = normalizeOrganizationCatalogText(value).toUpperCase().match(pattern);
      if (!match) return;
      const number = Number(match[1]);
      if (Number.isFinite(number) && number > maxNumber) {
        maxNumber = number;
      }
    });
    return `${prefix}-${String(maxNumber + 1).padStart(2, "0")}`;
  };

  const isOrganizationCatalogHeaderRow = (row = []) => {
    const first = normalizeOrganizationCatalogText(row[0]);
    const second = normalizeOrganizationCatalogText(row[1]);
    return /ประเภท|group|type/i.test(first) || /ชื่อ|ชมรม|องค์กร|name|organization/i.test(second);
  };

  const parseOrganizationCatalogCsvRows = (rows = []) => {
    const dataRows = Array.isArray(rows) && rows.length && isOrganizationCatalogHeaderRow(rows[0])
      ? rows.slice(1)
      : rows;
    const byId = new Map();
    const generatedCodeValues = [];

    dataRows.forEach((row, index) => {
      if (!Array.isArray(row)) return;
      const group = normalizeOrganizationCatalogText(row[0]);
      const name = normalizeOrganizationCatalogText(row[1]);
      const inputCode = normalizeOrganizationCatalogText(row[2]).toUpperCase();
      const accountNo = normalizeOrganizationCatalogText(row[4]);
      if (!group || !name) return;

      const id = slugifyOrganizationCatalogId(`${group}-${inputCode || name}`);
      const code = generateOrganizationCatalogCode({ id, group, code: inputCode }, generatedCodeValues);
      const documentRunCode = resolveOrganizationCatalogDocumentRunBaseForGroup({
        group,
        code,
        documentRunCode: row[3],
        academicYear: ORGANIZATION_CATALOG_LEGACY_DOCUMENT_RUN_ACADEMIC_YEAR
      });
      const documentRunCodeByAcademicYear = buildOrganizationCatalogDocumentRunMap({ documentRunCode });
      const codeByAcademicYear = buildOrganizationCatalogCodeMap({
        group,
        code,
        documentRunCodeByAcademicYear
      });
      if (code) generatedCodeValues.push(code);
      byId.set(id, {
        id,
        group,
        name,
        code,
        codeByAcademicYear,
        documentRunCode,
        documentRunCodeByAcademicYear,
        accountNo,
        bankAccount: accountNo,
        status: "active",
        sortOrder: index + 1,
        source: "legacy-csv"
      });
    });

    return Array.from(byId.values());
  };

  const writeOrganizationCatalogItems = async (items, importedBy) => {
    if (!items.length) return 0;
    const timestampValue = firestore.serverTimestamp ? firestore.serverTimestamp() : new Date().toISOString();

    if (firestore.writeBatch) {
      let written = 0;
      for (let start = 0; start < items.length; start += 450) {
        const batch = firestore.writeBatch(firestore.db);
        items.slice(start, start + 450).forEach((item) => {
          const { id, ...fields } = item;
          batch.set(
            firestore.doc(firestore.db, COLLECTION_ORGANIZATION_CATALOG, id),
            {
              ...fields,
              importedAt: timestampValue,
              importedBy,
              updatedAt: timestampValue
            },
            { merge: true }
          );
        });
        await batch.commit();
        written += Math.min(450, items.length - start);
      }
      return written;
    }

    let written = 0;
    for (const item of items) {
      const { id, ...fields } = item;
      await firestore.setDoc(
        firestore.doc(firestore.db, COLLECTION_ORGANIZATION_CATALOG, id),
        {
          ...fields,
          importedAt: timestampValue,
          importedBy,
          updatedAt: timestampValue
        },
        { merge: true }
      );
      written += 1;
    }
    return written;
  };

  const refreshOrganizationCatalogAfterImport = (items) => {
    setLocalOrganizationCatalogRows(items.map((item) => ({
      id: item.id,
      group: item.group,
      name: item.name,
      code: item.code,
      codeByAcademicYear: item.codeByAcademicYear,
      documentRunCode: item.documentRunCode,
      documentRunCodeByAcademicYear: item.documentRunCodeByAcademicYear,
      accountNo: item.accountNo
    })));
    renderOrganizationCatalogTable();
    renderOrgRepresentativeApplications();
  };

  const setLocalOrganizationCatalogRows = (rows) => {
    const nextFilters = Array.isArray(rows) ? rows : [];
    try {
      orgFilters = nextFilters;
    } catch (_) {
      globalThis.orgFilters = nextFilters;
    }
    try {
      if (typeof setCache === "function" && typeof CACHE_KEYS !== "undefined") {
        setCache(CACHE_KEYS.ORG_FILTERS, nextFilters);
      }
    } catch (_) {}
  };

  const getOrganizationCatalogRows = () =>
    getKnownOrganizationFilters()
      .map((item) => {
        const group = normalizeOrganizationCatalogText(item?.group || item?.organizationType || item?.orgGroup);
        const rawCode = normalizeOrganizationCatalogText(item?.code || item?.orgCode).toUpperCase();
        const documentRunCode = resolveOrganizationCatalogDocumentRunBaseForGroup({
          group,
          code: rawCode,
          documentRunCode: item?.documentRunCode || item?.runCode,
          documentRunCodeByAcademicYear: item?.documentRunCodeByAcademicYear,
          runCodeByAcademicYear: item?.runCodeByAcademicYear
        });
        const codeByAcademicYear = buildOrganizationCatalogCodeMap({
          group,
          code: rawCode,
          codeByAcademicYear: item?.codeByAcademicYear,
          orgCodeByAcademicYear: item?.orgCodeByAcademicYear,
          documentRunCodeByAcademicYear: item?.documentRunCodeByAcademicYear || item?.runCodeByAcademicYear
        });
        const code = isOrganizationCatalogManualDocumentRunGroup(group)
          ? codeByAcademicYear[getOrganizationCatalogDisplayAcademicYear()] || buildOrganizationCatalogManualCodeFromRunBase(group, documentRunCode) || rawCode
          : rawCode;
        return {
          id: normalizeOrganizationCatalogText(item?.id),
          group,
          name: normalizeOrganizationCatalogText(item?.name || item?.organizationName || item?.orgName),
          code,
          codeByAcademicYear,
          documentRunCode,
          documentRunCodeByAcademicYear: buildOrganizationCatalogDocumentRunMap({
            documentRunCode: item?.documentRunCode || item?.runCode,
            documentRunCodeByAcademicYear: item?.documentRunCodeByAcademicYear,
            runCodeByAcademicYear: item?.runCodeByAcademicYear
          }),
          accountNo: normalizeOrganizationCatalogText(item?.accountNo || item?.bankAccount || item?.bankAccountNo)
        };
      })
      .filter((item) => item.group && item.name)
      .sort((a, b) =>
        a.group.localeCompare(b.group, "th") ||
        (a.code || "").localeCompare(b.code || "", "th", { numeric: true }) ||
        a.name.localeCompare(b.name, "th")
      );

  const syncOrganizationCatalogGroupOptions = (rows = getOrganizationCatalogRows()) => {
    const groups = Array.from(new Set(rows.map((item) => item.group).filter(Boolean)))
      .sort((a, b) => b.localeCompare(a, "th"));
    if (organizationCatalogFields.group?.tagName === "SELECT") {
      const currentValue = normalizeOrganizationCatalogText(organizationCatalogFields.group.value);
      organizationCatalogFields.group.innerHTML = [
        '<option value="">เลือกประเภทองค์กร</option>',
        ...groups.map((group) => `<option value="${toSafeText(group)}">${toSafeText(group)}</option>`)
      ].join("");
      organizationCatalogFields.group.value = groups.includes(currentValue) ? currentValue : "";
    }
    if (organizationCatalogGroupFilterEl) {
      const currentValue = organizationCatalogFilters.group || "all";
      organizationCatalogGroupFilterEl.innerHTML = [
        '<option value="all">ทุกประเภทองค์กร</option>',
        ...groups.map((group) => `<option value="${toSafeText(group)}">${toSafeText(group)}</option>`)
      ].join("");
      organizationCatalogGroupFilterEl.value = groups.includes(currentValue) ? currentValue : "all";
      organizationCatalogFilters.group = organizationCatalogGroupFilterEl.value || "all";
    }
  };

  const renderOrganizationCatalogTable = () => {
    if (!organizationCatalogTableBodyEl && !organizationCatalogTableCaptionEl) return;
    const rows = getOrganizationCatalogRows();
    syncOrganizationCatalogGroupOptions(rows);
    const groupCount = new Set(rows.map((item) => item.group).filter(Boolean)).size;
    const query = normalizeOrganizationCatalogText(organizationCatalogFilters.query).toLowerCase();
    const filteredRows = rows.filter((item) => {
      if (organizationCatalogFilters.group !== "all" && item.group !== organizationCatalogFilters.group) {
        return false;
      }
      if (!query) return true;
      return [
        item.group,
        item.name,
        item.code,
        item.documentRunCode,
        ...Object.values(item.documentRunCodeByAcademicYear || {}),
        formatOrganizationCatalogDocumentRunCode(item.documentRunCode, item.group),
        item.accountNo
      ].some((value) => normalizeOrganizationCatalogText(value).toLowerCase().includes(query));
    });
    const visibleLimit = Math.max(ORGANIZATION_CATALOG_PAGE_SIZE, organizationCatalogFilters.visibleLimit || ORGANIZATION_CATALOG_PAGE_SIZE);
    const visibleRows = filteredRows.slice(0, visibleLimit);
    const selectedId = normalizeOrganizationCatalogText(organizationCatalogFields.id?.value);
    if (organizationCatalogTotalCountEl) organizationCatalogTotalCountEl.textContent = rows.length.toLocaleString("th-TH");
    if (organizationCatalogGroupCountEl) organizationCatalogGroupCountEl.textContent = groupCount.toLocaleString("th-TH");
    if (organizationCatalogFilteredCountEl) organizationCatalogFilteredCountEl.textContent = filteredRows.length.toLocaleString("th-TH");
    if (organizationCatalogVisibleCountEl) organizationCatalogVisibleCountEl.textContent = visibleRows.length.toLocaleString("th-TH");

    if (organizationCatalogTableCaptionEl) {
      organizationCatalogTableCaptionEl.textContent = rows.length
        ? `แสดง ${visibleRows.length.toLocaleString("th-TH")} จาก ${filteredRows.length.toLocaleString("th-TH")} รายการ (${rows.length.toLocaleString("th-TH")} ทั้งหมด) จาก ${groupCount.toLocaleString("th-TH")} ประเภท`
        : "ยังไม่มีข้อมูล";
    }
    if (organizationCatalogShowMoreBtnEl) {
      const remaining = filteredRows.length - visibleRows.length;
      organizationCatalogShowMoreBtnEl.hidden = remaining <= 0;
      organizationCatalogShowMoreBtnEl.textContent = remaining > 0
        ? `แสดงเพิ่มอีก ${Math.min(ORGANIZATION_CATALOG_PAGE_SIZE, remaining).toLocaleString("th-TH")} รายการ`
        : "";
    }
    if (!organizationCatalogTableBodyEl) return;
    if (!rows.length) {
      organizationCatalogTableBodyEl.innerHTML = '<tr><td colspan="5" data-label="ทะเบียนองค์กร">ยังไม่มีทะเบียนองค์กรในระบบ หรือยังโหลดข้อมูลไม่สำเร็จ</td></tr>';
      return;
    }
    if (!visibleRows.length) {
      organizationCatalogTableBodyEl.innerHTML = '<tr><td colspan="5" data-label="ทะเบียนองค์กร">ไม่พบองค์กรตามตัวกรองที่เลือก</td></tr>';
      return;
    }
    organizationCatalogTableBodyEl.innerHTML = visibleRows.map((item) => `
      <tr class="organization-catalog-row${item.id && item.id === selectedId ? " is-selected" : ""}" data-organization-id="${toSafeText(item.id)}">
        <td data-label="ประเภทองค์กร">${toSafeText(item.group)}</td>
        <td data-label="ชื่อองค์กร">${toSafeText(item.name)}</td>
        <td data-label="รหัส">${toSafeText(item.code || "-")}</td>
        <td data-label="เลขรันเอกสาร">${toSafeText(formatOrganizationCatalogDocumentRunCode(item.documentRunCode, item.group) || "-")}</td>
        <td data-label="เลขที่บัญชี">${toSafeText(item.accountNo || "-")}</td>
      </tr>
    `).join("");
  };

  const resetOrganizationCatalogForm = () => {
    Object.values(organizationCatalogFields).forEach((field) => {
      if (field) field.value = "";
    });
    if (organizationCatalogResponsibilityDivisionEl) organizationCatalogResponsibilityDivisionEl.value = "";
    if (organizationCatalogResponsibilitySubCodeEl) organizationCatalogResponsibilitySubCodeEl.value = "";
    if (organizationCatalogCustomDivisionCodeEl) organizationCatalogCustomDivisionCodeEl.value = "";
    if (organizationCatalogCustomDivisionNameEl) organizationCatalogCustomDivisionNameEl.value = "";
    if (organizationCatalogResponsibilityControlsEl) organizationCatalogResponsibilityControlsEl.hidden = true;
    if (organizationCatalogCustomResponsibilityControlsEl) organizationCatalogCustomResponsibilityControlsEl.hidden = true;
    if (organizationCatalogFields.documentRunCode) {
      organizationCatalogFields.documentRunCode.readOnly = true;
      organizationCatalogFields.documentRunCode.setAttribute("aria-readonly", "true");
      organizationCatalogFields.documentRunCode.placeholder = "ระบบเติมจากรหัสชมรม";
    }
    if (organizationCatalogFormTitleEl) organizationCatalogFormTitleEl.textContent = "เพิ่มองค์กรใหม่";
    if (organizationCatalogSaveBtnEl) organizationCatalogSaveBtnEl.textContent = "เพิ่มองค์กร";
    if (organizationCatalogArchiveBtnEl) organizationCatalogArchiveBtnEl.disabled = true;
    setMessage(organizationCatalogFormMessageEl, "", "#6b7280");
    updateOrganizationCatalogFormUi();
    renderOrganizationCatalogTable();
  };

  const syncOrganizationCatalogDocumentRunInputMode = () => {
    if (!organizationCatalogFields.documentRunCode) return;
    populateOrganizationCatalogResponsibilityDivisions();
    const group = normalizeOrganizationCatalogText(organizationCatalogFields.group?.value);
    const isManual = isOrganizationCatalogManualDocumentRunGroup(group);
    if (organizationCatalogResponsibilityControlsEl) {
      organizationCatalogResponsibilityControlsEl.hidden = !isManual;
    }
    organizationCatalogFields.documentRunCode.readOnly = true;
    organizationCatalogFields.documentRunCode.setAttribute("aria-readonly", "true");
    organizationCatalogFields.documentRunCode.placeholder = isManual
      ? "เลือกฝ่ายหลักและเลขย่อยด้านล่าง"
      : "ระบบเติมจากรหัสชมรม";
    if (organizationCatalogResponsibilitySubCodeEl) {
      organizationCatalogResponsibilitySubCodeEl.readOnly = isManual;
      organizationCatalogResponsibilitySubCodeEl.setAttribute("aria-readonly", isManual ? "true" : "false");
      organizationCatalogResponsibilitySubCodeEl.placeholder = isManual ? "ระบบเติมอัตโนมัติ" : "เช่น 03";
    }
    syncOrganizationCatalogCustomResponsibilityControls();
  };

  const syncOrganizationCatalogCustomResponsibilityControls = () => {
    if (!organizationCatalogCustomResponsibilityControlsEl) return;
    const showCustom =
      !organizationCatalogResponsibilityControlsEl?.hidden &&
      normalizeOrganizationCatalogText(organizationCatalogResponsibilityDivisionEl?.value) === "__custom__";
    organizationCatalogCustomResponsibilityControlsEl.hidden = !showCustom;
    if (!showCustom) {
      if (organizationCatalogCustomDivisionCodeEl) organizationCatalogCustomDivisionCodeEl.value = "";
      if (organizationCatalogCustomDivisionNameEl) organizationCatalogCustomDivisionNameEl.value = "";
    }
  };

  const refreshOrganizationCatalogGeneratedCode = ({ force = false } = {}) => {
    const group = normalizeOrganizationCatalogText(organizationCatalogFields.group?.value);
    const id = normalizeOrganizationCatalogText(organizationCatalogFields.id?.value);
    const currentCode = normalizeOrganizationCatalogText(organizationCatalogFields.code?.value).toUpperCase();
    if (!organizationCatalogFields.code || !group) return;
    if (!force && currentCode) return;
    const code = generateOrganizationCatalogCode({ id, group });
    if (code) {
      organizationCatalogFields.code.value = code;
      refreshOrganizationCatalogDocumentRunPreview();
    }
  };

  const refreshOrganizationCatalogDocumentRunPreview = () => {
    if (!organizationCatalogFields.documentRunCode) return;
    const code = normalizeOrganizationCatalogText(organizationCatalogFields.code?.value).toUpperCase();
    const group = normalizeOrganizationCatalogText(organizationCatalogFields.group?.value);
    const base = resolveOrganizationCatalogDocumentRunBaseFromForm({
      group,
      code
    });
    organizationCatalogFields.documentRunCode.value = base
      ? formatOrganizationCatalogDocumentRunCode(base, group)
      : "";
    if (isOrganizationCatalogManualDocumentRunGroup(group) && organizationCatalogResponsibilitySubCodeEl) {
      const parsed = parseOrganizationCatalogManualDocumentRunBase(base);
      organizationCatalogResponsibilitySubCodeEl.value = parsed.subCode || "";
      if (organizationCatalogFields.code) {
        organizationCatalogFields.code.value = buildOrganizationCatalogManualCodeFromRunBase(group, base);
      }
    }
  };

  const normalizeOrganizationCatalogDocumentRunInput = () => {
    if (!isOrganizationCatalogManualDocumentRunGroup(organizationCatalogFields.group?.value)) return;
    const parsed = parseOrganizationCatalogManualDocumentRunBase(organizationCatalogFields.documentRunCode?.value);
    if (organizationCatalogResponsibilityDivisionEl && parsed.divisionCode) {
      organizationCatalogResponsibilityDivisionEl.value = parsed.divisionCode;
    }
    if (organizationCatalogResponsibilitySubCodeEl && parsed.subCode) {
      organizationCatalogResponsibilitySubCodeEl.value = parsed.subCode;
    }
  };

  const updateOrganizationCatalogFormUi = () => {
    const id = normalizeOrganizationCatalogText(organizationCatalogFields.id?.value);

    if (organizationCatalogFormTitleEl) {
      organizationCatalogFormTitleEl.textContent = id ? "แก้ไของค์กร" : "เพิ่มองค์กรใหม่";
    }
    if (organizationCatalogSaveBtnEl) {
      organizationCatalogSaveBtnEl.textContent = id ? "บันทึกการแก้ไข" : "เพิ่มองค์กร";
    }
  };

  const fillOrganizationCatalogForm = (item) => {
    if (!item) return;
    syncOrganizationCatalogGroupOptions();
    if (organizationCatalogFields.id) organizationCatalogFields.id.value = item.id || "";
    if (organizationCatalogFields.group) organizationCatalogFields.group.value = item.group || "";
    syncOrganizationCatalogDocumentRunInputMode();
    if (isOrganizationCatalogManualDocumentRunGroup(item.group)) {
      const parsed = parseOrganizationCatalogManualDocumentRunBase(item.documentRunCode);
      const isKnownDivision = ORGANIZATION_CATALOG_RESPONSIBILITY_DIVISIONS.some((entry) => entry.code === parsed.divisionCode);
      if (organizationCatalogResponsibilityDivisionEl) {
        organizationCatalogResponsibilityDivisionEl.value = parsed.divisionCode && !isKnownDivision
          ? "__custom__"
          : parsed.divisionCode || "";
      }
      if (organizationCatalogCustomDivisionCodeEl) {
        organizationCatalogCustomDivisionCodeEl.value = parsed.divisionCode && !isKnownDivision ? parsed.divisionCode : "";
      }
      if (organizationCatalogResponsibilitySubCodeEl) organizationCatalogResponsibilitySubCodeEl.value = parsed.subCode || "";
      syncOrganizationCatalogCustomResponsibilityControls();
    }
    if (organizationCatalogFields.name) organizationCatalogFields.name.value = item.name || "";
    if (organizationCatalogFields.code) organizationCatalogFields.code.value = item.code || "";
    if (organizationCatalogFields.documentRunCode) organizationCatalogFields.documentRunCode.value = formatOrganizationCatalogDocumentRunCode(item.documentRunCode, item.group) || "";
    if (organizationCatalogFields.accountNo) organizationCatalogFields.accountNo.value = item.accountNo || "";
    if (organizationCatalogFormTitleEl) organizationCatalogFormTitleEl.textContent = "แก้ไของค์กร";
    if (organizationCatalogSaveBtnEl) organizationCatalogSaveBtnEl.textContent = "บันทึกการแก้ไข";
    if (organizationCatalogArchiveBtnEl) organizationCatalogArchiveBtnEl.disabled = !item.id;
    setMessage(organizationCatalogFormMessageEl, "กำลังแก้ไขรายการที่เลือก", "#475569");
    updateOrganizationCatalogFormUi();
    renderOrganizationCatalogTable();
  };

  const refreshSelectedOrganizationCatalogFormForAcademicYear = () => {
    const selectedId = normalizeOrganizationCatalogText(organizationCatalogFields.id?.value);
    if (!selectedId) {
      refreshOrganizationCatalogDocumentRunPreview();
      return;
    }
    const selectedItem = getOrganizationCatalogRows().find((item) => item.id === selectedId);
    if (selectedItem) fillOrganizationCatalogForm(selectedItem);
  };

  const buildOrganizationCatalogManualDocumentRunSaveFields = ({ item = {}, documentRunCodeByAcademicYear = {}, currentRunCode = "" } = {}) => {
    const runMap = normalizeOrganizationCatalogDocumentRunMap(documentRunCodeByAcademicYear);
    const legacyRunCode = runMap[ORGANIZATION_CATALOG_LEGACY_DOCUMENT_RUN_ACADEMIC_YEAR] || stripOrganizationCatalogDocumentRunYear(currentRunCode);
    const activeRunCode = runMap[getOrganizationCatalogDisplayAcademicYear()] || legacyRunCode || Object.values(runMap)[0] || "";
    const codeMap = {
      ...normalizeOrganizationCatalogCodeMap(item.codeByAcademicYear),
      ...buildOrganizationCatalogCodeMap({
        group: item.group,
        code: item.code,
        documentRunCodeByAcademicYear: runMap
      })
    };
    return {
      documentRunCode: legacyRunCode || Object.values(runMap)[0] || "",
      documentRunCodeByAcademicYear: runMap,
      code: codeMap[ORGANIZATION_CATALOG_LEGACY_DOCUMENT_RUN_ACADEMIC_YEAR] || buildOrganizationCatalogManualCodeFromRunBase(item.group, activeRunCode) || normalizeOrganizationCatalogText(item.code).toUpperCase(),
      codeByAcademicYear: codeMap,
      accountNo: normalizeOrganizationCatalogText(item.accountNo || item.bankAccount || item.bankAccountNo),
      bankAccount: normalizeOrganizationCatalogText(item.accountNo || item.bankAccount || item.bankAccountNo)
    };
  };

  const buildOrganizationCatalogManualMoveUpdates = ({ payload = {}, academicYear = "" } = {}) => {
    const year = normalizeOrganizationCatalogText(academicYear);
    if (!year || !isOrganizationCatalogManualDocumentRunGroup(payload.group)) return [];
    const rows = getOrganizationCatalogRows();
    const existingItem = rows.find((item) => item.id === payload.id);
    if (!existingItem) return [];
    const fromParsed = parseOrganizationCatalogManualDocumentRunBase(getOrganizationCatalogManualRunForYear(existingItem, year));
    const toParsed = parseOrganizationCatalogManualDocumentRunBase(payload.documentRunCodeByAcademicYear?.[year] || payload.documentRunCode);
    const fromSubNumber = Number(fromParsed.subCode);
    if (
      !fromParsed.divisionCode ||
      !toParsed.divisionCode ||
      fromParsed.divisionCode === toParsed.divisionCode ||
      !Number.isFinite(fromSubNumber)
    ) {
      return [];
    }

    return rows
      .map((item) => {
        if (item.id === payload.id || item.group !== payload.group) return null;
        const runCode = getOrganizationCatalogManualRunForYear(item, year);
        const parsed = parseOrganizationCatalogManualDocumentRunBase(runCode);
        const subNumber = Number(parsed.subCode);
        if (parsed.divisionCode !== fromParsed.divisionCode || !Number.isFinite(subNumber) || subNumber <= fromSubNumber) {
          return null;
        }
        const nextRunMap = {
          ...normalizeOrganizationCatalogDocumentRunMap(item.documentRunCodeByAcademicYear),
          [year]: `${parsed.divisionCode}.${formatOrganizationCatalogManualRunSubCode(subNumber - 1)}`
        };
        const saveFields = buildOrganizationCatalogManualDocumentRunSaveFields({
          item,
          documentRunCodeByAcademicYear: nextRunMap,
          currentRunCode: item.documentRunCode
        });
        return {
          id: item.id,
          group: item.group,
          name: item.name,
          ...saveFields,
          status: "active"
        };
      })
      .filter(Boolean);
  };

  const buildOrganizationCatalogPayloadFromForm = () => {
    const id = normalizeOrganizationCatalogText(organizationCatalogFields.id?.value);
    const group = normalizeOrganizationCatalogText(organizationCatalogFields.group?.value);
    const name = normalizeOrganizationCatalogText(organizationCatalogFields.name?.value);
    const formCode = generateOrganizationCatalogCode({
      id,
      group,
      code: normalizeOrganizationCatalogText(organizationCatalogFields.code?.value).toUpperCase()
    });
    const documentRunCode = resolveOrganizationCatalogDocumentRunBaseFromForm({
      group,
      code: formCode
    });
    const code = isOrganizationCatalogManualDocumentRunGroup(group)
      ? buildOrganizationCatalogManualCodeFromRunBase(group, documentRunCode) || formCode
      : formCode;
    const academicYear = getOrganizationCatalogDisplayAcademicYear();
    const existingItem = id ? getOrganizationCatalogRows().find((item) => item.id === id) : null;
    const documentRunCodeByAcademicYear = {
      ...normalizeOrganizationCatalogDocumentRunMap(existingItem?.documentRunCodeByAcademicYear)
    };
    if (documentRunCode && isOrganizationCatalogManualDocumentRunGroup(group)) {
      documentRunCodeByAcademicYear[academicYear] = documentRunCode;
    }
    const codeByAcademicYear = {
      ...normalizeOrganizationCatalogCodeMap(existingItem?.codeByAcademicYear)
    };
    if (code && isOrganizationCatalogManualDocumentRunGroup(group)) {
      codeByAcademicYear[academicYear] = code;
    }
    const storedDocumentRunCode = isOrganizationCatalogManualDocumentRunGroup(group)
      ? documentRunCodeByAcademicYear[ORGANIZATION_CATALOG_LEGACY_DOCUMENT_RUN_ACADEMIC_YEAR] || documentRunCode || ""
      : documentRunCode;
    const storedCode = isOrganizationCatalogManualDocumentRunGroup(group)
      ? codeByAcademicYear[ORGANIZATION_CATALOG_LEGACY_DOCUMENT_RUN_ACADEMIC_YEAR] || code
      : code;
    const accountNo = normalizeOrganizationCatalogText(organizationCatalogFields.accountNo?.value);
    const docId = id || slugifyOrganizationCatalogId(`${group}-${code || name}`);
    return {
      id: docId,
      group,
      name,
      code: storedCode,
      codeByAcademicYear,
      documentRunCode: storedDocumentRunCode,
      documentRunCodeByAcademicYear,
      accountNo,
      bankAccount: accountNo,
      status: "active"
    };
  };

  const saveOrganizationCatalogForm = async (event) => {
    event?.preventDefault?.();
    if (!resolveStore() || !firestore.setDoc || !firestore.doc) {
      setMessage(organizationCatalogFormMessageEl, "ระบบยังไม่พร้อมบันทึก Firebase", "#b91c1c");
      return;
    }
    const payload = buildOrganizationCatalogPayloadFromForm();
    if (!payload.group || !payload.name) {
      setMessage(organizationCatalogFormMessageEl, "กรุณากรอกประเภทองค์กรและชื่อองค์กร", "#b91c1c");
      return;
    }

    const currentUser = readCurrentUser();
    const updatedBy = (currentUser?.email || getCurrentAuthEmail() || "").toString().trim().toLowerCase();
    const timestampValue = firestore.serverTimestamp ? firestore.serverTimestamp() : new Date().toISOString();
    try {
      if (organizationCatalogSaveBtnEl) organizationCatalogSaveBtnEl.disabled = true;
      setMessage(organizationCatalogFormMessageEl, "กำลังบันทึก...", "#1d4ed8");
      const { id, ...fields } = payload;
      const moveUpdates = buildOrganizationCatalogManualMoveUpdates({
        payload,
        academicYear: getOrganizationCatalogDisplayAcademicYear()
      });
      const writeFields = (item) => {
        const { id: itemId, ...itemFields } = item;
        return {
          ref: firestore.doc(firestore.db, COLLECTION_ORGANIZATION_CATALOG, itemId),
          fields: {
            ...itemFields,
            updatedAt: timestampValue,
            updatedBy
          }
        };
      };
      const writes = [
        writeFields({ id, ...fields }),
        ...moveUpdates.map(writeFields)
      ];
      if (firestore.writeBatch && writes.length > 1) {
        const batch = firestore.writeBatch(firestore.db);
        writes.forEach((write) => batch.set(write.ref, write.fields, { merge: true }));
        await batch.commit();
      } else {
        for (const write of writes) {
          await firestore.setDoc(write.ref, write.fields, { merge: true });
        }
      }

      const updatedById = new Map(moveUpdates.map((item) => [item.id, item]));
      const nextRows = getOrganizationCatalogRows()
        .filter((item) => item.id !== id)
        .map((item) => updatedById.get(item.id) || item);
      nextRows.push({
        id,
        group: payload.group,
        name: payload.name,
        code: payload.code,
        codeByAcademicYear: payload.codeByAcademicYear,
        documentRunCode: payload.documentRunCode,
        documentRunCodeByAcademicYear: payload.documentRunCodeByAcademicYear,
        accountNo: payload.accountNo
      });
      setLocalOrganizationCatalogRows(nextRows);
      fillOrganizationCatalogForm(nextRows.find((item) => item.id === id));
      setMessage(organizationCatalogFormMessageEl, "บันทึกทะเบียนองค์กรแล้ว", "#047857");
      renderOrgRepresentativeApplications();
    } catch (error) {
      console.error("save organization catalog failed - app.staff-access.js", error);
      const message = (error?.code || "") === "permission-denied"
        ? "ไม่มีสิทธิ์บันทึกทะเบียนองค์กร"
        : (error?.message || "บันทึกทะเบียนองค์กรไม่สำเร็จ");
      setMessage(organizationCatalogFormMessageEl, message, "#b91c1c");
    } finally {
      if (organizationCatalogSaveBtnEl) organizationCatalogSaveBtnEl.disabled = false;
    }
  };

  const archiveCurrentOrganizationCatalogItem = async () => {
    const id = normalizeOrganizationCatalogText(organizationCatalogFields.id?.value);
    if (!id) return;
    const name = normalizeOrganizationCatalogText(organizationCatalogFields.name?.value) || "รายการนี้";
    const ok = window.confirm(`ยืนยันลบ "${name}" ออกจากทะเบียนองค์กร?`);
    if (!ok) return;
    if (!resolveStore() || !firestore.updateDoc || !firestore.doc) {
      setMessage(organizationCatalogFormMessageEl, "ระบบยังไม่พร้อมลบข้อมูล", "#b91c1c");
      return;
    }
    const currentUser = readCurrentUser();
    const updatedBy = (currentUser?.email || getCurrentAuthEmail() || "").toString().trim().toLowerCase();
    try {
      if (organizationCatalogArchiveBtnEl) organizationCatalogArchiveBtnEl.disabled = true;
      await firestore.updateDoc(
        firestore.doc(firestore.db, COLLECTION_ORGANIZATION_CATALOG, id),
        {
          status: "archived",
          archivedAt: firestore.serverTimestamp ? firestore.serverTimestamp() : new Date().toISOString(),
          updatedAt: firestore.serverTimestamp ? firestore.serverTimestamp() : new Date().toISOString(),
          updatedBy
        }
      );
      setLocalOrganizationCatalogRows(getOrganizationCatalogRows().filter((item) => item.id !== id));
      resetOrganizationCatalogForm();
      setMessage(organizationCatalogFormMessageEl, "ลบออกจากทะเบียนแล้ว", "#047857");
      renderOrgRepresentativeApplications();
    } catch (error) {
      console.error("archive organization catalog failed - app.staff-access.js", error);
      const message = (error?.code || "") === "permission-denied"
        ? "ไม่มีสิทธิ์ลบทะเบียนองค์กร"
        : (error?.message || "ลบทะเบียนองค์กรไม่สำเร็จ");
      setMessage(organizationCatalogFormMessageEl, message, "#b91c1c");
      if (organizationCatalogArchiveBtnEl) organizationCatalogArchiveBtnEl.disabled = false;
    }
  };

  const importOrganizationCatalogCsvFile = async (file) => {
    if (!file) return;
    if (!resolveStore()) {
      setMessage(organizationCatalogImportMessageEl, "ระบบยังไม่พร้อมเชื่อมต่อ Firestore", "#b91c1c");
      return;
    }
    if (!firestore.setDoc || !firestore.doc) {
      setMessage(organizationCatalogImportMessageEl, "ระบบยังไม่พร้อมบันทึกทะเบียนองค์กร", "#b91c1c");
      return;
    }

    const currentUser = readCurrentUser();
    const importedBy = (currentUser?.email || getCurrentAuthEmail() || "").toString().trim().toLowerCase();
    if (!importedBy) {
      setMessage(organizationCatalogImportMessageEl, "กรุณาเข้าสู่ระบบก่อนอัปโหลดไฟล์", "#b91c1c");
      return;
    }

    try {
      if (organizationCatalogImportBtnEl) organizationCatalogImportBtnEl.disabled = true;
      setMessage(organizationCatalogImportMessageEl, "กำลังอ่านไฟล์เก่า...", "#1d4ed8");
      await window.sgcuVendorLoader?.ensurePapa?.();
      if (!window.Papa) throw new Error("ไม่พบ PapaParse สำหรับอ่าน CSV");

      const text = await file.text();
      const parsed = window.Papa.parse(text, {
        header: false,
        skipEmptyLines: true
      });
      if (parsed.errors && parsed.errors.length) {
        console.warn("organization catalog csv parse warnings - app.staff-access.js", parsed.errors);
      }

      const items = parseOrganizationCatalogCsvRows(parsed.data || []);
      if (!items.length) {
        setMessage(organizationCatalogImportMessageEl, "ไม่พบข้อมูลในไฟล์ CSV: ต้องมีคอลัมน์ A ประเภทองค์กร และ B ชื่อชมรม", "#b91c1c");
        return;
      }

      setMessage(organizationCatalogImportMessageEl, `กำลังอัปโหลด ${items.length.toLocaleString("th-TH")} องค์กรเข้า Firebase...`, "#1d4ed8");
      const written = await writeOrganizationCatalogItems(items, importedBy);
      refreshOrganizationCatalogAfterImport(items);
      setMessage(organizationCatalogImportMessageEl, `อัปโหลดทะเบียนองค์กร ${written.toLocaleString("th-TH")} รายการเข้า Firebase แล้ว`, "#047857");
    } catch (error) {
      console.error("import organization catalog csv failed - app.staff-access.js", error);
      const code = (error?.code || "").toString();
      const message = code === "permission-denied"
        ? "ไม่มีสิทธิ์อัปโหลดทะเบียนองค์กรเข้า Firebase"
        : (error?.message || "อัปโหลดไฟล์เก่าไม่สำเร็จ");
      setMessage(organizationCatalogImportMessageEl, message, "#b91c1c");
    } finally {
      if (organizationCatalogImportBtnEl) organizationCatalogImportBtnEl.disabled = false;
      if (organizationCatalogImportFileEl) organizationCatalogImportFileEl.value = "";
    }
  };

  const getOrgRepresentativeRoleKey = (role = "") => {
    const text = (role || "").toString().trim().toLowerCase();
    if (!text) return "";
    if (text.includes("รอง") && text.includes("ประธาน")) return "vice_president";
    if (text.includes("ประธาน")) return "president";
    if (text.includes("เหรัญญิก") || text.includes("การเงิน")) return "treasurer";
    if (text.includes("เลขา") || text.includes("เลขานุการ")) return "secretary";
    return "";
  };

  const getMissingOrgRepresentativeRoles = (approvedItems = []) => {
    const approvedKeys = new Set(
      approvedItems
        .map((item) => getOrgRepresentativeRoleKey(item.representativeRole))
        .filter(Boolean)
    );
    return REQUIRED_ORG_REPRESENTATIVE_ROLES.filter((role) => !approvedKeys.has(role.key));
  };

  const getOrgRepresentativeCompleteness = (approvedItems = [], pendingCount = 0) => {
    const approvedCount = Array.isArray(approvedItems) ? approvedItems.length : Number(approvedItems || 0);
    const missingRoles = Array.isArray(approvedItems) ? getMissingOrgRepresentativeRoles(approvedItems) : [];
    if (Array.isArray(approvedItems) && missingRoles.length <= 0) {
      return { status: "complete", label: "ข้อมูลครบ", className: "badge-approved" };
    }
    if (approvedCount <= 0 && pendingCount <= 0) {
      return { status: "empty", label: "ยังไม่มีตัวแทน", className: "badge-rejected" };
    }
    return {
      status: "incomplete",
      label: `ยังขาด ${Array.isArray(approvedItems) ? missingRoles.length : Math.max(0, 4 - approvedCount)} ตำแหน่ง`,
      className: "badge-pending"
    };
  };

  const getOrgRepresentativeAcademicYearOptions = () =>
    Array.from(new Set([
      String(getCurrentAcademicYearBE()),
      ORGANIZATION_CATALOG_LEGACY_DOCUMENT_RUN_ACADEMIC_YEAR,
      ...currentOrgRepresentativeApplications.map((item) => getOrgRepresentativeAcademicYear(item)),
      ...getOrganizationCatalogRows().flatMap((item) => [
        ...Object.keys(item.documentRunCodeByAcademicYear || {}),
        ...Object.keys(item.codeByAcademicYear || {})
      ])
    ].filter(Boolean))).sort((a, b) => Number(b) - Number(a));

  const syncOrgRepresentativeAcademicYearSelect = (selectEl, years, selected) => {
    if (!selectEl) return "";
    selectEl.innerHTML = years
      .map((year) => `<option value="${toSafeText(year)}">${toSafeText(year)}${year === String(getCurrentAcademicYearBE()) ? " (ปัจจุบัน)" : ""}</option>`)
      .join("");
    selectEl.value = years.includes(selected) ? selected : String(getCurrentAcademicYearBE());
    return selectEl.value;
  };

  const populateOrgRepresentativeAcademicYearFilter = () => {
    const years = getOrgRepresentativeAcademicYearOptions();
    const selected = currentOrgRepresentativeAcademicYear || String(getCurrentAcademicYearBE());
    currentOrgRepresentativeAcademicYear =
      syncOrgRepresentativeAcademicYearSelect(orgRepresentativeAcademicYearFilterEl, years, selected) ||
      syncOrgRepresentativeAcademicYearSelect(organizationCatalogAcademicYearEl, years, selected) ||
      String(getCurrentAcademicYearBE());
    syncOrgRepresentativeAcademicYearSelect(orgRepresentativeAcademicYearFilterEl, years, currentOrgRepresentativeAcademicYear);
    syncOrgRepresentativeAcademicYearSelect(organizationCatalogAcademicYearEl, years, currentOrgRepresentativeAcademicYear);
  };

  const setOrgRepresentativeAcademicYear = (value) => {
    const nextYear = normalizeOrganizationCatalogText(value) || String(getCurrentAcademicYearBE());
    currentOrgRepresentativeAcademicYear = nextYear;
    const years = getOrgRepresentativeAcademicYearOptions();
    syncOrgRepresentativeAcademicYearSelect(orgRepresentativeAcademicYearFilterEl, years, nextYear);
    syncOrgRepresentativeAcademicYearSelect(organizationCatalogAcademicYearEl, years, nextYear);
    refreshSelectedOrganizationCatalogFormForAcademicYear();
    renderOrganizationCatalogTable();
  };

  const buildOrgRepresentativeOrganizations = () => {
    const orgMap = new Map();
    const selectedAcademicYear = currentOrgRepresentativeAcademicYear || String(getCurrentAcademicYearBE());
    getKnownOrganizationFilters().forEach((item) => {
      const orgType = (item?.group || item?.organizationType || "").toString().trim();
      const orgName = (item?.name || item?.organizationName || "").toString().trim();
      if (!orgName) return;
      const key = getOrgRepresentativeOrgKey(orgType, orgName);
      if (!orgMap.has(key)) {
        orgMap.set(key, { key, orgType, orgName, applications: [], approved: [], pending: [], rejected: [] });
      }
    });

    currentOrgRepresentativeApplications
      .filter((item) => getOrgRepresentativeAcademicYear(item) === selectedAcademicYear)
      .forEach((item) => {
      const orgType = (item.organizationType || "").toString().trim();
      const orgName = (item.organizationName || "").toString().trim();
      if (!orgName) return;
      const key = getOrgRepresentativeOrgKey(orgType, orgName);
      if (!orgMap.has(key)) {
        orgMap.set(key, { key, orgType, orgName, applications: [], approved: [], pending: [], rejected: [] });
      }
      const entry = orgMap.get(key);
      entry.applications.push(item);
      const status = normalizeApplicationStatus(item.status);
      if (status === "approved") entry.approved.push(item);
      else if (status === "pending") entry.pending.push(item);
      else if (status === "rejected") entry.rejected.push(item);
    });

    currentOrgRepresentativeOrganizations = Array.from(orgMap.values())
      .map((entry) => ({
        ...entry,
        searchText: [
          entry.orgType,
          entry.orgName,
          ...entry.applications.flatMap((item) => {
            const applicant = getOrgRepresentativeApplicant(item);
            return [applicant.displayName, applicant.email, applicant.phone, applicant.lineId, item.representativeRole, getOrgRepresentativeAcademicYear(item)];
          })
        ].join(" ").toLowerCase()
      }))
      .sort((a, b) => {
        const typeCompare = (b.orgType || "").localeCompare(a.orgType || "", "th");
        if (typeCompare) return typeCompare;
        return (a.orgName || "").localeCompare(b.orgName || "", "th");
      });
  };

  const populateOrgRepresentativeGroupFilter = () => {
    if (!orgRepresentativeGroupFilterEl) return;
    const currentValue = orgRepresentativeGroupFilterEl.value || "all";
    const groups = Array.from(
      new Set(currentOrgRepresentativeOrganizations.map((entry) => (entry.orgType || "").trim()).filter(Boolean))
    ).sort((a, b) => b.localeCompare(a, "th"));
    orgRepresentativeGroupFilterEl.innerHTML = [
      '<option value="all">ทุกประเภทองค์กร</option>',
      ...groups.map((group) => `<option value="${toSafeText(group)}">${toSafeText(group)}</option>`)
    ].join("");
    orgRepresentativeGroupFilterEl.value = groups.includes(currentValue) ? currentValue : "all";
  };

  const renderOrgRepresentativeOverview = () => {
    if (!orgRepresentativeOrgFiltersLoadedForPage && canLoadOrgRepresentativeOrgFilters()) {
      if (orgRepresentativeOverviewBodyEl) {
        orgRepresentativeOverviewBodyEl.innerHTML = '<tr><td colspan="5">กำลังโหลดทะเบียนองค์กร...</td></tr>';
      }
      if (orgRepresentativePanelCaptionEl && currentOrgRepresentativeView === "overview") {
        orgRepresentativePanelCaptionEl.textContent = "กำลังโหลดทะเบียนองค์กร...";
      }
      void ensureOrgRepresentativeOrgFiltersLoaded().then((loaded) => {
        if (!loaded) {
          renderOrgRepresentativeOverview();
          return;
        }
        renderOrganizationCatalogTable();
        renderOrgRepresentativeOverview();
      });
      return;
    }

    populateOrgRepresentativeAcademicYearFilter();
    buildOrgRepresentativeOrganizations();
    populateOrgRepresentativeGroupFilter();

    const query = (orgRepresentativeSearchInputEl?.value || "").toString().trim().toLowerCase();
    const statusFilter = (orgRepresentativeStatusFilterEl?.value || "all").toString();
    const groupFilter = (orgRepresentativeGroupFilterEl?.value || "all").toString();
    currentOrgRepresentativeFilteredOrganizations = currentOrgRepresentativeOrganizations.filter((entry) => {
      const complete = getOrgRepresentativeCompleteness(entry.approved, entry.pending.length);
      if (query && !entry.searchText.includes(query)) return false;
      if (groupFilter !== "all" && entry.orgType !== groupFilter) return false;
      if (statusFilter === "pending") return entry.pending.length > 0;
      if (statusFilter !== "all" && complete.status !== statusFilter) return false;
      return true;
    });

    const totalOrgCount = currentOrgRepresentativeOrganizations.length;
    const completeOrgCount = currentOrgRepresentativeOrganizations
      .filter((entry) => getOrgRepresentativeCompleteness(entry.approved, entry.pending.length).status === "complete").length;
    const emptyOrgCount = currentOrgRepresentativeOrganizations
      .filter((entry) => getOrgRepresentativeCompleteness(entry.approved, entry.pending.length).status === "empty").length;
    const incompleteOrgCount = Math.max(0, totalOrgCount - completeOrgCount);
    const approvedTotalCount = currentOrgRepresentativeApplications
      .filter((item) => normalizeApplicationStatus(item.status) === "approved").length;

    if (orgRepresentativeTotalOrgCountEl) orgRepresentativeTotalOrgCountEl.textContent = String(totalOrgCount);
    if (orgRepresentativeCompleteOrgCountEl) orgRepresentativeCompleteOrgCountEl.textContent = String(completeOrgCount);
    if (orgRepresentativeIncompleteOrgCountEl) {
      orgRepresentativeIncompleteOrgCountEl.textContent = emptyOrgCount
        ? `${incompleteOrgCount} (${emptyOrgCount} ว่าง)`
        : String(incompleteOrgCount);
    }
    if (orgRepresentativeApprovedTotalCountEl) orgRepresentativeApprovedTotalCountEl.textContent = String(approvedTotalCount);

    if (!orgRepresentativeOverviewBodyEl) {
      syncOrgRepresentativePanelCaption();
      return;
    }

    if (!currentOrgRepresentativeFilteredOrganizations.length) {
      orgRepresentativeOverviewBodyEl.innerHTML = '<tr><td colspan="5">ไม่พบองค์กรตามตัวกรองที่เลือก</td></tr>';
      syncOrgRepresentativePanelCaption();
      return;
    }

    orgRepresentativeOverviewBodyEl.innerHTML = currentOrgRepresentativeFilteredOrganizations.map((entry) => {
      const complete = getOrgRepresentativeCompleteness(entry.approved, entry.pending.length);
      const missingRoles = getMissingOrgRepresentativeRoles(entry.approved).map((role) => role.label);
      const approvedNames = entry.approved.slice(0, 4).map((item) => getOrgRepresentativeApplicant(item).displayName).filter(Boolean);
      const pendingNames = entry.pending.slice(0, 3).map((item) => getOrgRepresentativeApplicant(item).displayName).filter(Boolean);
      return `
        <tr class="org-representative-org-row" data-org-key="${toSafeText(entry.key)}">
          <td data-label="องค์กร">
            <div>${toSafeText(entry.orgName || "-")}</div>
            <div class="section-text-sm">${toSafeText(entry.orgType || "-")}</div>
          </td>
          <td data-label="ตัวแทนอนุมัติแล้ว">
            <div class="org-representative-count">${toSafeText(String(entry.approved.length))}/4</div>
            <div class="section-text-sm">${toSafeText(approvedNames.join(", ") || "-")}</div>
          </td>
          <td data-label="คำขอรออนุมัติ">
            <div class="org-representative-count">${toSafeText(String(entry.pending.length))}</div>
            <div class="section-text-sm">${toSafeText(pendingNames.join(", ") || "-")}</div>
          </td>
          <td data-label="ตำแหน่งที่ยังขาด">${toSafeText(missingRoles.join(", ") || "-")}</td>
          <td data-label="สถานะข้อมูล"><span class="badge ${complete.className}">${toSafeText(complete.label)}</span></td>
        </tr>
      `;
    }).join("");
    syncOrgRepresentativePanelCaption();
  };

  const renderOrgRepresentativePending = () => {
    if (!orgRepresentativePendingBodyEl) return;
    currentOrgRepresentativePending = currentOrgRepresentativeApplications
      .filter((item) => normalizeApplicationStatus(item.status) === "pending");

    if (!currentOrgRepresentativePending.length) {
      orgRepresentativePendingBodyEl.innerHTML = '<tr><td colspan="5">ไม่มีคำขอตัวแทนองค์กรที่รออนุมัติ</td></tr>';
      setMessage(orgRepresentativeMessageEl, "", "#6b7280");
      syncOrgRepresentativePanelCaption();
      return;
    }

    orgRepresentativePendingBodyEl.innerHTML = currentOrgRepresentativePending.map((item) => {
      const id = (item.id || "").toString();
      const applicant = getOrgRepresentativeApplicant(item);
      const orgType = (item.organizationType || "-").toString();
      const orgName = (item.organizationName || "-").toString();
      const role = (item.representativeRole || "-").toString();
      const evidence = (item.evidenceNote || "-").toString();
      return `
        <tr class="org-representative-row" data-org-representative-id="${toSafeText(id)}">
          <td data-label="ผู้สมัคร">
            <div>${toSafeText(applicant.displayName)}</div>
            <div class="section-text-sm">${toSafeText(applicant.email || "-")}</div>
            <div class="section-text-sm">${toSafeText([applicant.phone, applicant.lineId].filter(Boolean).join(" / ") || "")}</div>
          </td>
          <td data-label="องค์กร">
            <div>${toSafeText(orgName)}</div>
            <div class="section-text-sm">${toSafeText(orgType)}</div>
          </td>
          <td data-label="ตำแหน่ง">${toSafeText(role)}</td>
          <td data-label="ข้อมูลยืนยัน">${toSafeText(evidence)}</td>
          <td data-label="จัดการคำขอ">
            <select
              class="staff-status-select is-pending org-representative-action-select"
              data-role="org-representative-status-select"
              data-org-representative-id="${toSafeText(id)}"
              aria-label="จัดการคำขอตัวแทนองค์กร"
            >
              <option value="pending" selected>รออนุมัติ</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="rejected">ไม่อนุมัติ</option>
            </select>
          </td>
        </tr>
      `;
    }).join("");
    syncOrgRepresentativePanelCaption();
  };

  const renderOrgRepresentativeHistory = () => {
    if (!orgRepresentativeHistoryBodyEl || !orgRepresentativeHistoryCaptionEl) return;
    currentOrgRepresentativeApproved = currentOrgRepresentativeApplications
      .filter((item) => normalizeApplicationStatus(item.status) === "approved");
    orgRepresentativeHistoryCaptionEl.textContent = `แสดงผล ${currentOrgRepresentativeApproved.length} รายการ`;

    if (!currentOrgRepresentativeApproved.length) {
      orgRepresentativeHistoryBodyEl.innerHTML = '<tr><td colspan="5">ยังไม่มีตัวแทนองค์กรที่อนุมัติแล้ว</td></tr>';
      syncOrgRepresentativePanelCaption();
      return;
    }

    orgRepresentativeHistoryBodyEl.innerHTML = currentOrgRepresentativeApproved.map((item) => {
      const applicant = getOrgRepresentativeApplicant(item);
      const orgType = (item.organizationType || "-").toString();
      const orgName = (item.organizationName || "-").toString();
      const role = (item.representativeRole || "-").toString();
      const id = (item.id || "").toString();
      return `
        <tr class="org-representative-row" data-org-representative-id="${toSafeText(id)}">
          <td data-label="ตัวแทน">
            <div>${toSafeText(applicant.displayName)}</div>
            <div class="section-text-sm">${toSafeText(applicant.email || "-")}</div>
          </td>
          <td data-label="องค์กร">
            <div>${toSafeText(orgName)}</div>
            <div class="section-text-sm">${toSafeText(orgType)}</div>
          </td>
          <td data-label="ตำแหน่ง">${toSafeText(role)}</td>
          <td data-label="เวลาที่อนุมัติ">${toSafeText(formatDateTime(item.reviewedAt || item.updatedAt || item.createdAt))}</td>
          <td data-label="จัดการสิทธิ์">
            <select
              class="staff-status-select is-approved org-representative-history-action-select"
              data-role="org-representative-status-select"
              data-org-representative-id="${toSafeText(id)}"
              aria-label="จัดการสิทธิ์ตัวแทนองค์กร"
            >
              <option value="approved" selected>อนุมัติแล้ว</option>
              <option value="pending">ยกเลิกอนุมัติ</option>
              <option value="rejected">ลบสิทธิ์/ไม่อนุมัติ</option>
            </select>
          </td>
        </tr>
      `;
    }).join("");
    syncOrgRepresentativePanelCaption();
  };

  const renderOrgRepresentativeApplications = () => {
    renderOrganizationCatalogTable();
    renderOrgRepresentativeOverview();
    renderOrgRepresentativePending();
    renderOrgRepresentativeHistory();
  };

  const exportOrgRepresentativeOverviewCsv = () => {
    renderOrgRepresentativeOverview();
    const rows = currentOrgRepresentativeFilteredOrganizations.map((entry) => {
      const complete = getOrgRepresentativeCompleteness(entry.approved, entry.pending.length);
      const missingRoles = getMissingOrgRepresentativeRoles(entry.approved).map((role) => role.label);
      const approvedPeople = entry.approved.map((item) => {
        const applicant = getOrgRepresentativeApplicant(item);
        return `${applicant.displayName || "-"} (${item.representativeRole || "-"})`;
      });
      const pendingPeople = entry.pending.map((item) => {
        const applicant = getOrgRepresentativeApplicant(item);
        return `${applicant.displayName || "-"} (${item.representativeRole || "-"})`;
      });
      return {
        "ปีการศึกษา": currentOrgRepresentativeAcademicYear || String(getCurrentAcademicYearBE()),
        "ประเภทองค์กร": entry.orgType || "",
        "องค์กร": entry.orgName || "",
        "ตัวแทนอนุมัติแล้ว": entry.approved.length,
        "คำขอรออนุมัติ": entry.pending.length,
        "ตำแหน่งที่ยังขาด": missingRoles.join(", "),
        "สถานะข้อมูล": complete.label,
        "รายชื่อตัวแทนอนุมัติแล้ว": approvedPeople.join("; "),
        "รายชื่อคำขอรออนุมัติ": pendingPeople.join("; ")
      };
    });
    const headers = [
      "ปีการศึกษา",
      "ประเภทองค์กร",
      "องค์กร",
      "ตัวแทนอนุมัติแล้ว",
      "คำขอรออนุมัติ",
      "ตำแหน่งที่ยังขาด",
      "สถานะข้อมูล",
      "รายชื่อตัวแทนอนุมัติแล้ว",
      "รายชื่อคำขอรออนุมัติ"
    ];
    if (window.sgcuCsvExport?.download) {
      window.sgcuCsvExport.download({
        fileName: `organization-representatives-${currentOrgRepresentativeAcademicYear || getCurrentAcademicYearBE()}`,
        headers,
        rows
      });
      return;
    }
    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? "").replaceAll("\"", "\"\"")}"`).join(","))
    ].join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `organization-representatives-${currentOrgRepresentativeAcademicYear || getCurrentAcademicYearBE()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const openOrgRepresentativeOrganizationModal = (orgKey) => {
    if (!approvalDetailModalEl || !approvalDetailBodyEl) return;
    const entry = currentOrgRepresentativeOrganizations.find((item) => (item.key || "").toString() === (orgKey || "").toString());
    if (!entry) return;
    const detailTitleEl = document.getElementById("staffApprovalDetailTitle");
    if (detailTitleEl) detailTitleEl.textContent = "จัดการตัวแทนรายองค์กร";
    const complete = getOrgRepresentativeCompleteness(entry.approved, entry.pending.length);
    const missingRoles = getMissingOrgRepresentativeRoles(entry.approved).map((role) => role.label);
    const sortedApplications = [...entry.pending, ...entry.approved, ...entry.rejected];
    const rowHtml = sortedApplications.length
      ? sortedApplications.map((item) => {
        const applicant = getOrgRepresentativeApplicant(item);
        const id = (item.id || "").toString();
        const status = normalizeApplicationStatus(item.status);
        const statusLabel = status === "approved" ? "อนุมัติแล้ว" : status === "rejected" ? "ไม่อนุมัติ" : "รออนุมัติ";
        return `
          <tr data-org-representative-id="${toSafeText(id)}">
            <td data-label="ตัวแทน">
              <div>${toSafeText(applicant.displayName || "-")}</div>
              <div class="section-text-sm">${toSafeText(applicant.email || "-")}</div>
              <div class="section-text-sm">${toSafeText([applicant.phone, applicant.lineId].filter(Boolean).join(" / ") || "")}</div>
            </td>
            <td data-label="ตำแหน่ง">${toSafeText(item.representativeRole || "-")}</td>
            <td data-label="สถานะ">${toSafeText(statusLabel)}</td>
            <td data-label="จัดการ">
              <select
                class="staff-status-select ${status === "approved" ? "is-approved" : status === "rejected" ? "is-rejected" : "is-pending"}"
                data-role="org-representative-status-select"
                data-org-representative-id="${toSafeText(id)}"
                aria-label="จัดการสิทธิ์ตัวแทนองค์กร"
              >
                <option value="pending" ${status === "pending" ? "selected" : ""}>รออนุมัติ</option>
                <option value="approved" ${status === "approved" ? "selected" : ""}>อนุมัติแล้ว</option>
                <option value="rejected" ${status === "rejected" ? "selected" : ""}>ไม่อนุมัติ</option>
              </select>
            </td>
          </tr>
        `;
      }).join("")
      : '<tr><td colspan="4">ยังไม่มีคำขอตัวแทนขององค์กรนี้</td></tr>';

    approvalDetailBodyEl.removeAttribute("data-application-id");
    approvalDetailBodyEl.innerHTML = `
      <div class="staff-approval-detail-layout org-representative-org-detail">
        <div class="modal-section">
          <div class="modal-section-title">${toSafeText(entry.orgName || "-")}</div>
          <div class="modal-section-caption">${toSafeText(entry.orgType || "-")} · ปีการศึกษา ${toSafeText(currentOrgRepresentativeAcademicYear || String(getCurrentAcademicYearBE()))}</div>
          <div class="org-representative-detail-summary">
            <div>
              <div class="modal-item-label">ตัวแทนอนุมัติแล้ว</div>
              <div class="modal-item-value">${toSafeText(String(entry.approved.length))}/4</div>
            </div>
            <div>
              <div class="modal-item-label">รออนุมัติ</div>
              <div class="modal-item-value">${toSafeText(String(entry.pending.length))}</div>
            </div>
            <div>
              <div class="modal-item-label">สถานะข้อมูล</div>
              <div class="modal-item-value"><span class="badge ${complete.className}">${toSafeText(complete.label)}</span></div>
            </div>
            <div>
              <div class="modal-item-label">ตำแหน่งที่ยังขาด</div>
              <div class="modal-item-value">${toSafeText(missingRoles.join(", ") || "-")}</div>
            </div>
          </div>
        </div>
        <div class="modal-section">
          <div class="modal-section-title">รายชื่อตัวแทน</div>
          <div class="modal-table-wrap">
            <table class="modal-table">
              <thead>
                <tr>
                  <th>ตัวแทน</th>
                  <th>ตำแหน่ง</th>
                  <th>สถานะ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>${rowHtml}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    if (typeof openDialog === "function") {
      openDialog(approvalDetailModalEl, { focusSelector: ".org-representative-org-detail select, .modal-close" });
    } else {
      approvalDetailModalEl.classList.add("show");
      approvalDetailModalEl.setAttribute("aria-hidden", "false");
      document.body.classList.add("has-modal");
    }
  };

  const openOrgRepresentativeDetailModal = (item) => {
    if (!approvalDetailModalEl || !approvalDetailBodyEl || !item) return;
    const detailTitleEl = document.getElementById("staffApprovalDetailTitle");
    if (detailTitleEl) {
      detailTitleEl.textContent = "รายละเอียดตัวแทนองค์กร";
    }
    const applicant = getOrgRepresentativeApplicant(item);
    const applicationId = (item.id || "").toString();
    const applicantUid = (item.applicantUid || item.applicant?.uid || item.requester?.uid || "").toString().trim();
    const applicantEmail = (applicant.email || item.applicantEmail || "").toString().trim().toLowerCase();
    const requestKey = `org:${applicationId}:${Date.now()}`;
    currentApprovalDetailRequestKey = requestKey;
    const status = normalizeApplicationStatus(item.status);
    const statusText = status === "approved" ? "อนุมัติแล้ว" : status === "rejected" ? "ไม่อนุมัติ" : "รออนุมัติ";
    const statusClass = status === "approved" ? "badge-approved" : status === "rejected" ? "badge-rejected" : "badge-pending";
    approvalDetailBodyEl.setAttribute("data-application-id", applicationId);
    approvalDetailBodyEl.setAttribute("data-request-key", requestKey);
    approvalDetailBodyEl.innerHTML = `
      <div class="staff-approval-detail-layout">
        <div class="modal-section">
          <div class="modal-section-title">ข้อมูลผู้สมัคร</div>
          <div class="modal-section-grid">
            <div>
              <div class="modal-item-label">ชื่อผู้สมัคร</div>
              <div class="modal-item-value">${toSafeText(applicant.displayName || "-")}</div>
            </div>
            <div>
              <div class="modal-item-label">อีเมล</div>
              <div class="modal-item-value">${toSafeText(applicant.email || "-")}</div>
            </div>
            <div>
              <div class="modal-item-label">รหัสนิสิต</div>
              <div id="orgRepresentativeDetailStudentId" class="modal-item-value">${toSafeText(applicant.studentId || "-")}</div>
            </div>
            <div>
              <div class="modal-item-label">คณะ</div>
              <div id="orgRepresentativeDetailFaculty" class="modal-item-value">${toSafeText(applicant.faculty || "-")}</div>
            </div>
            <div>
              <div class="modal-item-label">ชั้นปี</div>
              <div id="orgRepresentativeDetailYear" class="modal-item-value">${toSafeText(applicant.year || "-")}</div>
            </div>
            <div>
              <div class="modal-item-label">เบอร์โทร</div>
              <div class="modal-item-value">${toSafeText(applicant.phone || "-")}</div>
            </div>
            <div>
              <div class="modal-item-label">Line ID</div>
              <div class="modal-item-value">${toSafeText(applicant.lineId || "-")}</div>
            </div>
          </div>
        </div>
        <div class="modal-section">
          <div class="modal-section-title">ข้อมูลองค์กร</div>
          <div class="modal-section-grid">
            <div>
              <div class="modal-item-label">ฝ่าย / ชมรม</div>
              <div class="modal-item-value">${toSafeText(item.organizationName || "-")}</div>
            </div>
            <div>
              <div class="modal-item-label">ประเภทองค์กร</div>
              <div class="modal-item-value">${toSafeText(item.organizationType || "-")}</div>
            </div>
            <div>
              <div class="modal-item-label">ตำแหน่งในองค์กร</div>
              <div class="modal-item-value">${toSafeText(item.representativeRole || "-")}</div>
            </div>
            <div>
              <div class="modal-item-label">สถานะ</div>
              <div class="modal-item-value"><span class="badge ${statusClass}">${toSafeText(statusText)}</span></div>
            </div>
          </div>
        </div>
        <div class="modal-section">
          <div class="modal-section-title">ข้อมูลยืนยันและการพิจารณา</div>
          <div class="modal-section-grid">
            <div class="staff-approval-note-block">
              <div class="modal-item-label">ข้อมูลยืนยันเพิ่มเติม</div>
              <div class="modal-item-value">${toSafeText(item.evidenceNote || "-")}</div>
            </div>
            <div>
              <div class="modal-item-label">เวลายื่นคำขอ</div>
              <div class="modal-item-value">${toSafeText(formatDateTime(item.createdAt))}</div>
            </div>
            <div>
              <div class="modal-item-label">ผู้พิจารณา</div>
              <div class="modal-item-value">${toSafeText(item.reviewedByEmail || "-")}</div>
            </div>
            <div>
              <div class="modal-item-label">เวลาพิจารณา</div>
              <div class="modal-item-value">${toSafeText(formatDateTime(item.reviewedAt || item.updatedAt))}</div>
            </div>
            <div class="staff-approval-note-block">
              <div class="modal-item-label">หมายเหตุ</div>
              <div class="modal-item-value">${toSafeText(item.reviewedNote || "-")}</div>
            </div>
          </div>
        </div>
      </div>
    `;
    const fillAcademicFields = (profile) => {
      if (currentApprovalDetailRequestKey !== requestKey) return;
      const studentIdEl = document.getElementById("orgRepresentativeDetailStudentId");
      const facultyEl = document.getElementById("orgRepresentativeDetailFaculty");
      const yearEl = document.getElementById("orgRepresentativeDetailYear");
      const effectiveEmail = ((profile?.email || applicantEmail || "").toString().trim().toLowerCase());
      const fallback = deriveAcademicProfile(profile || {}, effectiveEmail);
      const studentId = getMeaningfulProfileValue(profile?.studentId, applicant.studentId, fallback.studentId) || "-";
      const faculty = getMeaningfulProfileValue(profile?.faculty, applicant.faculty, fallback.faculty) || "-";
      const year = getMeaningfulProfileValue(profile?.year, applicant.year, fallback.year) || "-";
      if (studentIdEl) studentIdEl.textContent = studentId;
      if (facultyEl) facultyEl.textContent = faculty;
      if (yearEl) yearEl.textContent = year;
    };

    const localProfiles = readLoginProfiles();
    fillAcademicFields(localProfiles[applicantEmail] || {});

    if (firestore?.db && firestore?.doc && firestore?.getDoc) {
      const fetchByUid = applicantUid
        ? firestore
          .getDoc(firestore.doc(firestore.db, COLLECTION_USER_PROFILES, applicantUid))
          .then((snap) => (snap?.exists?.() ? (snap.data() || {}) : null))
          .catch(() => null)
        : Promise.resolve(null);

      fetchByUid.then((profile) => {
        if (profile && Object.keys(profile).length) fillAcademicFields(profile);
      });
    }

    if (typeof openDialog === "function") {
      openDialog(approvalDetailModalEl, { focusSelector: "#staffApprovalDetailClose" });
      return;
    }
    approvalDetailModalEl.classList.add("show");
    approvalDetailModalEl.setAttribute("aria-hidden", "false");
  };

  const refreshLocalStaffCache = (email, profile) => {
    const normalizedEmail = (email || "").toString().trim().toLowerCase();
    if (!normalizedEmail) return;

    if (typeof staffEmails !== "undefined" && staffEmails instanceof Set) {
      staffEmails.add(normalizedEmail);
    }
    if (typeof staffProfilesByEmail !== "undefined" && staffProfilesByEmail && typeof staffProfilesByEmail === "object") {
      const normalizedPositions = normalizePositionsArray(profile?.positions || []);
      const primary = normalizedPositions[0] || null;
      staffProfilesByEmail[normalizedEmail] = {
        position: normalizePositionText(profile?.position || primary?.name || ""),
        nick: (profile?.nick || "").toString().trim(),
        role: normalizeRoleCode(profile?.role || ""),
        divisionCodeYY: normalizeCode2(profile?.divisionCodeYY || profile?.positionCodeYY || primary?.yy || ""),
        positionCodeYY: normalizeCode2(profile?.positionCodeYY || profile?.divisionCodeYY || primary?.yy || ""),
        positionCode: (profile?.positionCode || primary?.code || "").toString().trim(),
        positions: normalizedPositions
      };
    }

    if (typeof refreshAuthDisplayFn === "function") {
      const user = readCurrentUser();
      if (user) refreshAuthDisplayFn(user);
    }
  };

  const clearLocalStaffCache = (email) => {
    const normalizedEmail = (email || "").toString().trim().toLowerCase();
    if (!normalizedEmail) return;

    if (typeof staffEmails !== "undefined" && staffEmails instanceof Set) {
      staffEmails.delete(normalizedEmail);
    }
    if (typeof staffProfilesByEmail !== "undefined" && staffProfilesByEmail && typeof staffProfilesByEmail === "object") {
      delete staffProfilesByEmail[normalizedEmail];
    }

    if (typeof refreshAuthDisplayFn === "function") {
      const user = readCurrentUser();
      if (user) refreshAuthDisplayFn(user);
    }
  };

  const ensurePositionExists = async (positionName, actor, codeMeta = {}) => {
    const safeName = normalizePositionText(positionName);
    if (!safeName || !resolveStore()) return;
    const docId = slugifyPosition(safeName);
    const catalogMeta = findPositionMetaByName(safeName);
    const yyFromMeta = normalizeCode2(codeMeta.divisionCodeYY || "");
    const zzFromMeta = normalizeCode2(codeMeta.levelCodeZZ || "");
    const yyFromCatalog = normalizeCode2(catalogMeta?.divisionCodeYY || "");
    const zzFromCatalog = normalizeCode2(catalogMeta?.levelCodeZZ || "");
    const divisionCodeYY = isValidDivisionCodeYY(yyFromMeta)
      ? yyFromMeta
      : isValidDivisionCodeYY(yyFromCatalog)
        ? yyFromCatalog
        : resolveDivisionCodeYY(safeName);
    const levelCodeZZ = isValidLevelCodeZZ(zzFromMeta)
      ? zzFromMeta
      : isValidLevelCodeZZ(zzFromCatalog)
        ? zzFromCatalog
        : resolveLevelCodeZZ(safeName);
    const allowedPages = normalizeAllowedPages(
      codeMeta.allowedPages || catalogMeta?.allowedPages,
      divisionCodeYY
    );
    const divisionLabel = normalizePositionText(
      codeMeta.divisionLabel || catalogMeta?.divisionLabel || catalogMeta?.divisionName || divisionCodeLabel(divisionCodeYY)
    );
    const ref = firestore.doc(firestore.db, COLLECTION_POSITIONS, docId);
    await firestore.setDoc(
      ref,
      {
        name: safeName,
        divisionCodeYY,
        divisionLabel,
        levelCodeZZ,
        allowedPages,
        updatedAt: firestore.serverTimestamp(),
        updatedByEmail: (actor?.email || "").toString().trim().toLowerCase() || ""
      },
      { merge: true }
    );
  };

  const startPositionCatalogListener = () => {
    if (!resolveStore()) {
      currentPositionCatalog = sortPositionCatalogItems(DEFAULT_POSITION_OPTIONS.map((item) => ({
        id: slugifyPosition(item.name),
        name: item.name,
        divisionCodeYY: item.divisionCodeYY,
        divisionLabel: divisionCodeLabel(item.divisionCodeYY),
        levelCodeZZ: item.levelCodeZZ,
        allowedPages: normalizeAllowedPages(readAllowedPagesInput(item), item.divisionCodeYY)
      })));
      renderPositionDatalist();
      renderPositionCatalog();
      renderPositionAllowedPageOptions([], "");
      return;
    }
    if (!getCurrentAuthEmail()) {
      currentPositionCatalog = sortPositionCatalogItems(DEFAULT_POSITION_OPTIONS.map((item) => ({
        id: slugifyPosition(item.name),
        name: item.name,
        divisionCodeYY: item.divisionCodeYY,
        divisionLabel: divisionCodeLabel(item.divisionCodeYY),
        levelCodeZZ: item.levelCodeZZ,
        allowedPages: normalizeAllowedPages(readAllowedPagesInput(item), item.divisionCodeYY)
      })));
      renderPositionDatalist();
      renderPositionCatalog();
      renderPositionAllowedPageOptions([], "");
      return;
    }

    if (typeof unsubscribePositionCatalog === "function") {
      unsubscribePositionCatalog();
      unsubscribePositionCatalog = null;
    }

    const q = firestore.query(firestore.collection(firestore.db, COLLECTION_POSITIONS));
    unsubscribePositionCatalog = firestore.onSnapshot(
      q,
      (snapshot) => {
        const fromStore = (snapshot?.docs || [])
          .map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() || {}) }))
          .map((item) => {
            const name = normalizePositionText(item.name || "");
            const fallbackYY = resolveDivisionCodeYY(name);
            const fallbackZZ = resolveLevelCodeZZ(name);
            const yy = isValidDivisionCodeYY(item.divisionCodeYY)
              ? normalizeCode2(item.divisionCodeYY)
              : fallbackYY;
            const zz = isValidLevelCodeZZ(item.levelCodeZZ)
              ? normalizeCode2(item.levelCodeZZ)
              : fallbackZZ;
            return {
              id: item.id,
              name,
              divisionCodeYY: yy,
              divisionLabel: normalizePositionText(item.divisionLabel || item.divisionName || divisionCodeLabel(yy)),
              levelCodeZZ: zz,
              allowedPages: normalizeAllowedPages(readAllowedPagesInput(item), yy)
            };
          })
          .filter((item) => item.name);

        const uniqueByName = new Map();
        [
          ...fromStore,
          ...DEFAULT_POSITION_OPTIONS.map((item) => ({
            id: slugifyPosition(item.name),
            name: item.name,
            divisionCodeYY: item.divisionCodeYY,
            divisionLabel: item.divisionLabel || divisionCodeLabel(item.divisionCodeYY),
            levelCodeZZ: item.levelCodeZZ,
            allowedPages: normalizeAllowedPages(readAllowedPagesInput(item), item.divisionCodeYY)
          }))
        ].forEach((item) => {
          const key = normalizePositionText(item.name).toLowerCase();
          if (!key) return;
          if (!uniqueByName.has(key)) uniqueByName.set(key, item);
        });

        currentPositionCatalog = sortPositionCatalogItems(Array.from(uniqueByName.values()));
        renderPositionDatalist();
        renderApplicationPositionSelect();
        renderPositionCatalog();
        if (positionAllowedPagesEl && !positionAllowedPagesEl.children.length) {
          renderPositionAllowedPageOptions([], "");
        }
      },
      (error) => {
        console.error("staff position catalog listener failed - app.staff-access.js:2240", error);
        currentPositionCatalog = DEFAULT_POSITION_OPTIONS.map((item) => ({
          id: slugifyPosition(item.name),
          name: item.name,
          divisionCodeYY: item.divisionCodeYY,
          levelCodeZZ: item.levelCodeZZ,
          allowedPages: normalizeAllowedPages(readAllowedPagesInput(item), item.divisionCodeYY)
        }));
        renderPositionDatalist();
        renderApplicationPositionSelect();
        renderPositionCatalog();
        renderPositionAllowedPageOptions([], "");
      }
    );
  };

  const startMyApplicationsListener = () => {
    if (!myTableBodyEl) return;
    if (!resolveStore()) {
      scheduleDeferredBootstrap();
      return;
    }
    const user = readCurrentUser();

    if (typeof unsubscribeMyApplications === "function") {
      unsubscribeMyApplications();
      unsubscribeMyApplications = null;
    }

    const applicantUid = (user?.uid || "").toString().trim();
    const applicantEmail = (user?.email || "").toString().trim().toLowerCase();
    if (!applicantUid && !applicantEmail) {
      currentMyApplications = [];
      renderMyApplications();
      return;
    }

    const q = applicantUid
      ? firestore.query(
        firestore.collection(firestore.db, COLLECTION_APPLICATIONS),
        firestore.where("applicantUid", "==", applicantUid)
      )
      : firestore.query(
        firestore.collection(firestore.db, COLLECTION_APPLICATIONS),
        firestore.where("applicantEmail", "==", applicantEmail)
      );

    unsubscribeMyApplications = firestore.onSnapshot(
      q,
      (snapshot) => {
        currentMyApplications = sortByTimestampDesc(
          (snapshot?.docs || [])
            .map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() || {}) }))
            .filter(isStaffApplicationRecord),
          "createdAt"
        );
        renderMyApplications();
        scheduleApprovalUiSync();
      },
      (error) => {
        console.error("staff applications listener failed - app.staff-access.js:2300", error);
        const msg = buildListenerErrorText("ไม่สามารถโหลดคำขอสมัครได้ในขณะนี้", error);
        myTableBodyEl.innerHTML = `<tr><td colspan="4">${toSafeText(msg)}</td></tr>`;
        setMessage(appMessageEl, msg, "#b91c1c");
      }
    );
  };

  const startPendingApplicationsListener = () => {
    if (!approvalBodyEl) return;
    if (!resolveStore()) {
      scheduleDeferredBootstrap();
      return;
    }
    if (!getCurrentAuthEmail()) {
      currentPendingApplications = [];
      approvalBodyEl.innerHTML = `<tr><td colspan="5">กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้</td></tr>`;
      setMessage(approvalMessageEl, "", "#6b7280");
      return;
    }

    if (typeof unsubscribePendingApplications === "function") {
      unsubscribePendingApplications();
      unsubscribePendingApplications = null;
    }

    const colRef = firestore.collection(firestore.db, COLLECTION_APPLICATIONS);
    const q = firestore.where
      ? firestore.query(
        colRef,
        firestore.where("status", "==", "pending"),
        ...(firestore.limit ? [firestore.limit(STAFF_APPLICATION_LIST_LIMIT)] : [])
      )
      : firestore.query(
        colRef,
        ...(firestore.limit ? [firestore.limit(STAFF_APPLICATION_LIST_LIMIT)] : [])
      );

    unsubscribePendingApplications = firestore.onSnapshot(
      q,
      (snapshot) => {
        currentPendingApplications = sortByTimestampDesc(
          (snapshot?.docs || [])
            .map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() || {}) }))
            .filter(isStaffApplicationRecord)
            .filter((item) => normalizeApplicationStatus(item.status) === "pending"),
          "createdAt"
        );
        renderApprovalRows();
        scheduleApprovalUiSync();
      },
      (error) => {
        console.error("staff pending listener failed - app.staff-access.js:2338", error);
        const code = (error?.code || "").toString();
        const msg = code === "unauthenticated"
          ? "กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้"
          : buildListenerErrorText("ไม่สามารถโหลดคำขอรออนุมัติได้ในขณะนี้", error);
        approvalBodyEl.innerHTML = `<tr><td colspan="5">${toSafeText(msg)}</td></tr>`;
        setMessage(approvalMessageEl, msg, "#b91c1c");
      }
    );
  };

  const startApprovedHistoryListener = () => {
    if (!approvalHistoryBodyEl) return;
    if (!resolveStore()) {
      scheduleDeferredBootstrap();
      return;
    }
    if (!getCurrentAuthEmail()) {
      currentApprovedHistory = [];
      approvalHistoryBodyEl.innerHTML = `<tr><td colspan="3">กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้</td></tr>`;
      return;
    }

    if (typeof unsubscribeApprovalHistory === "function") {
      unsubscribeApprovalHistory();
      unsubscribeApprovalHistory = null;
    }

    const colRef = firestore.collection(firestore.db, COLLECTION_APPLICATIONS);
    const q = firestore.where
      ? firestore.query(
        colRef,
        firestore.where("status", "==", "approved"),
        ...(firestore.limit ? [firestore.limit(STAFF_APPLICATION_LIST_LIMIT)] : [])
      )
      : firestore.query(
        colRef,
        ...(firestore.limit ? [firestore.limit(STAFF_APPLICATION_LIST_LIMIT)] : [])
      );

    unsubscribeApprovalHistory = firestore.onSnapshot(
      q,
      (snapshot) => {
        currentApprovedHistory = sortByTimestampDesc(
          (snapshot?.docs || [])
            .map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() || {}) }))
            .filter(isStaffApplicationRecord)
            .filter((item) => normalizeApplicationStatus(item.status) === "approved"),
          "updatedAt"
        );
        renderApprovedHistory();
        scheduleApprovalUiSync();
      },
      (error) => {
        console.error("staff approved history listener failed - app.staff-access.js:2379", error);
        const code = (error?.code || "").toString();
        const msg = code === "unauthenticated"
          ? "กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้"
          : buildListenerErrorText("ไม่สามารถโหลดรายชื่อผู้ปฏิบัติงานตอนนี้ได้ในขณะนี้", error);
        approvalHistoryBodyEl.innerHTML = `<tr><td colspan="3">${toSafeText(msg)}</td></tr>`;
      }
    );
  };

  const startOrgRepresentativeApplicationsListener = () => {
    if (!orgRepresentativeApprovalSectionEl) return;
    if (!resolveStore()) {
      scheduleDeferredBootstrap();
      return;
    }
    if (!getCurrentAuthEmail()) {
      if (orgRepresentativePendingBodyEl) {
        orgRepresentativePendingBodyEl.innerHTML = '<tr><td colspan="5">กำลังตรวจสอบสิทธิ์การเข้าถึงข้อมูล...</td></tr>';
      }
      setMessage(orgRepresentativeMessageEl, "", "#6b7280");
      return;
    }

    if (!orgRepresentativeOrgFiltersLoadedForPage) {
      ensureOrgRepresentativeOrgFiltersLoaded()
        .then(() => {
          renderOrganizationCatalogTable();
          renderOrgRepresentativeOverview();
        });
    }

    if (typeof unsubscribeOrgRepresentativeApplications === "function") {
      unsubscribeOrgRepresentativeApplications();
      unsubscribeOrgRepresentativeApplications = null;
    }

    const q = firestore.query(
      firestore.collection(firestore.db, COLLECTION_ORG_REPRESENTATIVES),
      ...(firestore.limit ? [firestore.limit(ORG_REPRESENTATIVE_LIST_LIMIT)] : [])
    );

    unsubscribeOrgRepresentativeApplications = firestore.onSnapshot(
      q,
      (snapshot) => {
        currentOrgRepresentativeApplications = sortByTimestampDesc(
          (snapshot?.docs || [])
            .map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() || {}) }))
            .filter((item) => (item.requestType || "").toString().trim() === "organization_representative"),
          "updatedAt"
        );
        const renderLoadedApplications = () => {
          renderOrgRepresentativeApplications();
          window.setTimeout(() => {
            renderOrgRepresentativeOverview();
          }, 0);
        };
        if (!orgRepresentativeOrgFiltersLoadedForPage) {
          ensureOrgRepresentativeOrgFiltersLoaded().then(() => {
            renderLoadedApplications();
          });
          return;
        }
        renderLoadedApplications();
      },
      (error) => {
        console.error("organization representative listener failed - app.staff-access.js:2417", error);
        if (!getCurrentAuthEmail()) {
          if (orgRepresentativePendingBodyEl) {
            orgRepresentativePendingBodyEl.innerHTML = '<tr><td colspan="5">กำลังตรวจสอบสิทธิ์การเข้าถึงข้อมูล...</td></tr>';
          }
          setMessage(orgRepresentativeMessageEl, "", "#6b7280");
          return;
        }
        const msg = buildListenerErrorText("ไม่สามารถโหลดคำขอตัวแทนองค์กรได้ในขณะนี้", error);
        if (orgRepresentativePendingBodyEl) {
          orgRepresentativePendingBodyEl.innerHTML = `<tr><td colspan="5">${toSafeText(msg)}</td></tr>`;
        }
        setMessage(orgRepresentativeMessageEl, msg, "#b91c1c");
      }
    );
  };

  const revokeApprovedApplication = async (applicationId, targetStatus = "pending") => {
    if (!resolveStore()) {
      setMessage(approvalMessageEl, "ระบบฐานข้อมูลยังไม่พร้อมใช้งาน", "#b91c1c");
      return;
    }
    if (!isSuperStaff()) {
      setMessage(approvalMessageEl, "หน้านี้สำหรับหัวหน้าสตาฟเท่านั้น", "#b91c1c");
      return;
    }
    const id = (applicationId || "").toString().trim();
    if (!id) return;
    const target = currentApprovedHistory.find((item) => (item.id || "").toString() === id);
    if (!target) return;

    const nextStatus = targetStatus === "rejected" ? "rejected" : "pending";
    const statusLabel = nextStatus === "rejected" ? "ไม่อนุมัติ" : "รออนุมัติ";
    const ok = window.confirm(`ยืนยันเปลี่ยนสถานะคำขอของ "${target.applicantName || target.applicantEmail || "-"}" เป็น "${statusLabel}" ?`);
    if (!ok) return;

    try {
      const appRef = firestore.doc(firestore.db, COLLECTION_APPLICATIONS, id);
      await firestore.updateDoc(appRef, {
        status: nextStatus,
        reviewedByUid: "",
        reviewedByEmail: "",
        reviewedNote: nextStatus === "rejected"
          ? "ปรับสถานะเป็นไม่อนุมัติโดยหัวหน้าสตาฟ"
          : "ยกเลิกอนุมัติโดยหัวหน้าสตาฟ",
        approvedPosition: "",
        approvedPositionCode: "",
        updatedAt: firestore.serverTimestamp()
      });

      const applicantEmail = (target.applicantEmail || "").toString().trim().toLowerCase();
      if (applicantEmail) {
        const profileRef = firestore.doc(firestore.db, COLLECTION_PROFILES, applicantEmail);
        const profileSnap = firestore.getDoc ? await firestore.getDoc(profileRef) : null;
        const profileData = profileSnap?.exists?.() ? (profileSnap.data() || {}) : {};
        const existingPositions = extractExistingPositionsFromProfile(profileData);
        const nextPositions = existingPositions.filter(
          (entry) => (entry.sourceApplicationId || "") !== id
        );
        const nextProfile = buildProfileFieldsFromPositions(nextPositions);
        await firestore.setDoc(
          profileRef,
          {
            ...nextProfile,
            positionCodeXX: nextPositions.length ? (profileData.positionCodeXX || "") : "",
            positionCodeYY: nextProfile.positionCodeYY || "",
            positionCodeZZ: nextPositions.length ? (profileData.positionCodeZZ || "") : "",
            positionCodeAAA: nextPositions.length ? (profileData.positionCodeAAA || "") : "",
            sourceApplicationId: nextProfile.positions?.[0]?.sourceApplicationId || "",
            revokedAt: firestore.serverTimestamp(),
            updatedAt: firestore.serverTimestamp()
          },
          { merge: true }
        );
        if (!nextPositions.length) {
        clearLocalStaffCache(applicantEmail);
        } else {
          refreshLocalStaffCache(applicantEmail, {
            ...nextProfile,
            nick: (profileData.nick || "").toString()
          });
        }
      }

      setMessage(
        approvalMessageEl,
        nextStatus === "rejected" ? "เปลี่ยนเป็นไม่อนุมัติเรียบร้อยแล้ว" : "คืนเป็นรออนุมัติเรียบร้อยแล้ว",
        "#047857"
      );
    } catch (error) {
      console.error("revoke approved application failed - app.staff-access.js:2500", error);
      const code = (error?.code || "unknown").toString();
      if (code === "permission-denied") {
        setMessage(approvalMessageEl, "ไม่มีสิทธิ์ยกเลิกอนุมัติ (permission-denied)", "#b91c1c");
      } else {
        setMessage(approvalMessageEl, "ยกเลิกอนุมัติไม่สำเร็จ กรุณาลองใหม่", "#b91c1c");
      }
    }
  };

  const updateApprovedPosition = async (applicationId, nextPositionRaw) => {
    if (!resolveStore()) {
      setMessage(approvalMessageEl, "ระบบฐานข้อมูลยังไม่พร้อมใช้งาน", "#b91c1c");
      return false;
    }
    if (!isSuperStaff()) {
      setMessage(approvalMessageEl, "หน้านี้สำหรับหัวหน้าสตาฟเท่านั้น", "#b91c1c");
      return false;
    }

    const id = (applicationId || "").toString().trim();
    const nextPosition = normalizePositionText(nextPositionRaw || "");
    if (!id || !nextPosition) {
      setMessage(approvalMessageEl, "กรุณาระบุตำแหน่งใหม่ให้ถูกต้อง", "#b91c1c");
      return false;
    }

    const target = currentApprovedHistory.find((item) => (item.id || "").toString() === id);
    if (!target) {
      setMessage(approvalMessageEl, "ไม่พบรายการที่ต้องการปรับตำแหน่ง", "#b91c1c");
      return false;
    }

    const currentUser = readCurrentUser();
    const reviewerUid = (currentUser?.uid || "").toString();
    const reviewerEmail = (currentUser?.email || "").toString().trim().toLowerCase();

    try {
      const approvedPositionCodeMeta = await buildApprovedPositionCode(nextPosition);
      const approvedPositionCode = approvedPositionCodeMeta.code;
        const applicantEmail = (target.applicantEmail || "").toString().trim().toLowerCase();
        const applicantName = (target.applicantName || "").toString().trim();
        const applicantNick = (target.applicantNick || "").toString().trim();
        const positionMeta = findPositionAccessMeta(nextPosition, approvedPositionCodeMeta.yy, approvedPositionCodeMeta.zz);
        const nextPositionEntry = {
          name: nextPosition,
          code: approvedPositionCode,
          yy: approvedPositionCodeMeta.yy,
          zz: approvedPositionCodeMeta.zz,
          allowedPages: normalizeAllowedPages(readAllowedPagesInput(positionMeta || {}), approvedPositionCodeMeta.yy),
          sourceApplicationId: id,
          approvedAt: new Date().toISOString()
        };

      if (applicantEmail) {
        const profileRef = firestore.doc(firestore.db, COLLECTION_PROFILES, applicantEmail);
        const profileSnap = firestore.getDoc ? await firestore.getDoc(profileRef) : null;
        const profileData = profileSnap?.exists?.() ? (profileSnap.data() || {}) : {};
        const existingPositions = extractExistingPositionsFromProfile(profileData);
        const filteredPositions = existingPositions.filter(
          (entry) => (entry.sourceApplicationId || "") !== id
        );
        const nextPositions = [nextPositionEntry, ...filteredPositions];
        const nextProfile = buildProfileFieldsFromPositions(nextPositions);
        await firestore.setDoc(
          profileRef,
          {
            email: applicantEmail,
            name: applicantName,
            nick: applicantNick,
            ...nextProfile,
            approvedByUid: reviewerUid,
            approvedByEmail: reviewerEmail,
            approvedAt: firestore.serverTimestamp(),
            positionCodeXX: approvedPositionCodeMeta.xx,
            positionCodeYY: approvedPositionCodeMeta.yy,
            positionCodeZZ: approvedPositionCodeMeta.zz,
            positionCodeAAA: approvedPositionCodeMeta.aaa,
            sourceApplicationId: nextProfile.positions?.[0]?.sourceApplicationId || id,
            updatedAt: firestore.serverTimestamp()
          },
          { merge: true }
        );

        refreshLocalStaffCache(applicantEmail, {
          position: nextProfile.position,
          nick: applicantNick,
          role: nextProfile.role,
          divisionCodeYY: nextProfile.divisionCodeYY,
          positionCodeYY: nextProfile.positionCodeYY,
          positionCode: nextProfile.positionCode,
          positions: nextProfile.positions
        });
      }

      await ensurePositionExists(nextPosition, currentUser, {
        divisionCodeYY: approvedPositionCodeMeta.yy,
        levelCodeZZ: approvedPositionCodeMeta.zz,
        allowedPages: nextPositionEntry.allowedPages
      });

      const appRef = firestore.doc(firestore.db, COLLECTION_APPLICATIONS, id);
      await firestore.updateDoc(appRef, {
        reviewedByUid: reviewerUid,
        reviewedByEmail: reviewerEmail,
        reviewedNote: `ปรับตำแหน่งหลังอนุมัติเป็น ${nextPosition} รหัส ${approvedPositionCode}`,
        approvedPosition: nextPosition,
        approvedPositionCode,
        updatedAt: firestore.serverTimestamp()
      });

      setMessage(approvalMessageEl, "ปรับตำแหน่งเรียบร้อยแล้ว", "#047857");
      return true;
    } catch (error) {
      console.error("update approved position failed - app.staff-access.js:2614", error);
      const code = (error?.code || "unknown").toString();
      if (error?.message === "position-code-segment-unresolved") {
        setMessage(approvalMessageEl, "ไม่สามารถสร้างรหัสตำแหน่งได้: ตรวจชื่อตำแหน่งให้ตรงหมวดที่กำหนด", "#b91c1c");
      } else if (code === "permission-denied") {
        setMessage(approvalMessageEl, "ไม่มีสิทธิ์ปรับตำแหน่ง (permission-denied)", "#b91c1c");
      } else {
        setMessage(approvalMessageEl, "ปรับตำแหน่งไม่สำเร็จ กรุณาลองใหม่", "#b91c1c");
      }
      return false;
    }
  };

  const setApplicationAvailabilityByAuth = () => {
    const user = readCurrentUser();
    if (!user?.email) {
      setAppFormEnabled(false);
      setMessage(appMessageEl, "กรุณาเข้าสู่ระบบก่อนส่งคำขอสมัครสตาฟ", "#b45309");
      return;
    }
    setAppFormEnabled(true);
    if (!currentMyApplications.length && !appFormStatusLocked) {
      setMessage(appMessageEl, "กรอกข้อมูลแล้วกดส่งคำขอได้ทันที", "#6b7280");
    }
  };

  const setApprovalAvailabilityByRole = () => {
    const allowManage = isSuperStaff();
    renderPositionCatalog();
    setPositionManageEnabled(allowManage);
    if (positionManageFormEl) {
      positionManageFormEl.style.opacity = allowManage ? "1" : "0.7";
    }
    if (!allowManage) {
      setMessage(positionManageMessageEl, "ส่วนจัดการตำแหน่งสำหรับหัวหน้าสตาฟเท่านั้น", "#b45309");
      if (getCurrentAuthEmail() && currentAccessProfileEmail !== getCurrentAuthEmail()) {
        void refreshAccessProfileForCurrentUser();
      }
    } else if (!positionManageMessageEl?.textContent) {
      setMessage(positionManageMessageEl, "เพิ่มหรือลบตำแหน่งได้จากส่วนนี้", "#6b7280");
    }
  };

  const hasPendingApplication = () => {
    return currentMyApplications
      .filter(isStaffApplicationRecord)
      .some((item) => (item.status || "pending") === "pending");
  };

  const prefillApplicationForm = () => {
    renderApplicationPositionSelect();
  };

  const submitStaffApplication = async () => {
    window.__sgcuStaffApplicationFlowActive = true;
    if (!resolveStore()) {
      setMessage(appMessageEl, "ระบบฐานข้อมูลยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง", "#b91c1c");
      return;
    }

    const user = readCurrentUser();
    if (!user?.uid || !user?.email) {
      setMessage(appMessageEl, "กรุณาเข้าสู่ระบบก่อนส่งคำขอสมัครสตาฟ", "#b91c1c");
      return;
    }

    const currentUserEmail = (user.email || "").toString().trim().toLowerCase();
    const localProfile = currentUserEmail ? (readLoginProfiles()[currentUserEmail] || {}) : {};
    const profileType = ((localProfile.profileType || window.currentUserProfileType || "student").toString().trim().toLowerCase() === "affairs")
      ? "affairs"
      : "student";

    if (profileType === "student") {
      if (!appDivisionEl?.reportValidity()) return;
      renderApplicationPositionSelect();
      if (!appLevelEl?.reportValidity()) return;
    }

    const requestedPosition = normalizePositionText(appPositionEl?.value || "");
    if (!requestedPosition) {
      setMessage(appMessageEl, profileType === "affairs" ? "ไม่พบตำแหน่งสำหรับเจ้าหน้าที่สำนักบริหารกิจการนิสิต" : "กรุณาเลือกหมวดงานและระดับตำแหน่งให้ครบ", "#b91c1c");
      return;
    }
    if (hasPendingApplication()) {
      setMessage(appMessageEl, "คุณมีคำขอที่รออนุมัติอยู่แล้ว กรุณารอผลก่อนยื่นคำขอใหม่", "#b45309");
      return;
    }

    const applicantEmail = currentUserEmail;
    const profile = localProfile;
    const displayName = (user.displayName || "").toString().trim();
    const fallbackName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
    const applicantName = fallbackName || displayName || applicantEmail;
    const applicantNick = (profile.nickname || "").toString().trim();
    const requestedDivisionCodeYY = profileType === "affairs" ? "09" : normalizeCode2(appDivisionEl?.value || "");
    const requestedLevelCodeZZ = profileType === "affairs" ? "04" : normalizeCode2(appLevelEl?.value || "");

    const payload = {
      requestType: "staff_application",
      applicantUid: (user.uid || "").toString(),
      applicantEmail,
      applicantName,
      applicantNick,
      applicantDisplayName: (user.displayName || "").toString().trim(),
      applicantProfileType: profileType,
      requestedDivisionCodeYY,
      requestedLevelCodeZZ,
      requestedPosition,
      status: "pending",
      createdAt: firestore.serverTimestamp(),
      updatedAt: firestore.serverTimestamp()
    };

    setAppFormEnabled(false);
    appFormStatusLocked = true;
    setMessage(appMessageEl, "กำลังส่งคำขอสมัครสตาฟ...", "#1d4ed8");

    try {
      await firestore.addDoc(
        firestore.collection(firestore.db, COLLECTION_APPLICATIONS),
        payload
      );
      try {
        await ensurePositionExists(requestedPosition, user);
      } catch (catalogError) {
        console.warn("sync staff position catalog after application failed - app.staff-access.js", catalogError);
      }
      setMessage(appMessageEl, "ส่งคำขอสมัครสตาฟเรียบร้อยแล้ว", "#047857");
      window.setTimeout(() => {
        appFormStatusLocked = false;
        setApplicationAvailabilityByAuth();
      }, 1800);
    } catch (error) {
      console.error("submit staff application failed - app.staff-access.js:2740", error);
      const debugInfo = `email=${applicantEmail || "-"} project=${firestore?.db?.app?.options?.projectId || "-"}`;
      const msg = buildActionErrorText("ส่งคำขอไม่สำเร็จ", error, debugInfo);
      setMessage(appMessageEl, msg, "#b91c1c");
    } finally {
      setApplicationAvailabilityByAuth();
    }
  };

  const addPosition = async () => {
    if (!resolveStore()) {
      setMessage(positionManageMessageEl, "ระบบฐานข้อมูลยังไม่พร้อมใช้งาน", "#b91c1c");
      return;
    }
    if (!isSuperStaff()) {
      setMessage(positionManageMessageEl, "ส่วนจัดการตำแหน่งสำหรับหัวหน้าสตาฟเท่านั้น", "#b91c1c");
      return;
    }

    const user = readCurrentUser();
    const divisionCodeYY = normalizeCode2(positionDivisionCodeEl?.value || "");
    const existingDivision = currentPositionCatalog.find((item) => normalizeCode2(item.divisionCodeYY || "") === divisionCodeYY);
    const divisionLabel = normalizePositionText(
      positionDivisionNameEl?.value ||
      existingDivision?.divisionLabel ||
      existingDivision?.divisionName ||
      ""
    );
    const levelCodeZZ = normalizeCode2(positionLevelCodeEl?.value || "");
    if (!isValidDivisionCodeYY(divisionCodeYY) || !isValidLevelCodeZZ(levelCodeZZ)) {
      setMessage(positionManageMessageEl, "กรุณาเลือกหมวดงานและระดับตำแหน่ง", "#b91c1c");
      return;
    }
    if (!divisionLabel) {
      setMessage(positionManageMessageEl, "กรุณากรอกชื่อหมวดงาน", "#b91c1c");
      return;
    }
    const safeName = buildPositionNameFromParts(divisionCodeYY, levelCodeZZ, divisionLabel);
    if (!safeName) {
      setMessage(positionManageMessageEl, "ระบบสร้างชื่อตำแหน่งไม่ได้ กรุณาตรวจสอบหมวดงานและระดับตำแหน่ง", "#b91c1c");
      return;
    }

    const duplicated = currentPositionCatalog.some(
      (item) => normalizePositionText(item.name).toLowerCase() === safeName.toLowerCase()
    );
    if (duplicated) {
      setMessage(positionManageMessageEl, "ตำแหน่งนี้มีอยู่แล้ว", "#b45309");
      return;
    }

    try {
      const id = slugifyPosition(safeName);
      const allowedPages = normalizeAllowedPages(readSelectedPositionAllowedPages(), divisionCodeYY);
      await firestore.setDoc(
        firestore.doc(firestore.db, COLLECTION_POSITIONS, id),
        {
          name: safeName,
          divisionCodeYY,
          divisionLabel,
          levelCodeZZ,
          allowedPages,
          createdAt: firestore.serverTimestamp(),
          createdByEmail: (user?.email || "").toString().trim().toLowerCase(),
          updatedAt: firestore.serverTimestamp()
        },
        { merge: true }
      );
      if (positionManageInputEl) positionManageInputEl.value = "";
      if (positionDivisionCodeEl) positionDivisionCodeEl.value = "";
      if (positionDivisionNameEl) positionDivisionNameEl.value = "";
      if (positionLevelCodeEl) positionLevelCodeEl.value = "";
      updateManageResolvedPositionName();
      renderPositionAllowedPageOptions([], "");
      setMessage(positionManageMessageEl, "เพิ่มตำแหน่งเรียบร้อยแล้ว", "#047857");
    } catch (error) {
      console.error("add position failed - app.staff-access.js:2816", error);
      setMessage(positionManageMessageEl, "เพิ่มตำแหน่งไม่สำเร็จ", "#b91c1c");
    }
  };

  const removePosition = async (positionId) => {
    if (!resolveStore()) {
      setMessage(positionManageMessageEl, "ระบบฐานข้อมูลยังไม่พร้อมใช้งาน", "#b91c1c");
      return;
    }
    if (!isSuperStaff()) {
      setMessage(positionManageMessageEl, "ส่วนจัดการตำแหน่งสำหรับหัวหน้าสตาฟเท่านั้น", "#b91c1c");
      return;
    }

    const safeId = (positionId || "").toString().trim();
    if (!safeId) return;
    const target = currentPositionCatalog.find((item) => item.id === safeId);
    if (!target) return;

    const ok = window.confirm(`ยืนยันลบตำแหน่ง "${target.name}" ?`);
    if (!ok) return;

    try {
      await firestore.deleteDoc(firestore.doc(firestore.db, COLLECTION_POSITIONS, safeId));
      setMessage(positionManageMessageEl, "ลบตำแหน่งเรียบร้อยแล้ว", "#047857");
    } catch (error) {
      console.error("remove position failed - app.staff-access.js:2843", error);
      setMessage(positionManageMessageEl, "ลบตำแหน่งไม่สำเร็จ", "#b91c1c");
    }
  };

  const updatePosition = async (positionId, nextData = {}) => {
    if (!resolveStore()) {
      setMessage(positionManageMessageEl, "ระบบฐานข้อมูลยังไม่พร้อมใช้งาน", "#b91c1c");
      return false;
    }
    if (!isSuperStaff()) {
      setMessage(positionManageMessageEl, "ส่วนจัดการตำแหน่งสำหรับหัวหน้าสตาฟเท่านั้น", "#b91c1c");
      return false;
    }

    const safeId = (positionId || "").toString().trim();
    const target = currentPositionCatalog.find((item) => item.id === safeId);
    if (!safeId || !target) {
      setMessage(positionManageMessageEl, "ไม่พบตำแหน่งที่ต้องการแก้ไข", "#b91c1c");
      return false;
    }

    const divisionCodeYY = normalizeCode2(nextData.divisionCodeYY || "");
    const existingDivision = currentPositionCatalog.find((item) => normalizeCode2(item.divisionCodeYY || "") === divisionCodeYY);
    const divisionLabel = normalizePositionText(
      nextData.divisionLabel ||
      existingDivision?.divisionLabel ||
      existingDivision?.divisionName ||
      ""
    );
    const levelCodeZZ = normalizeCode2(nextData.levelCodeZZ || "");
    const allowedPages = normalizeAllowedPages(nextData.allowedPages, divisionCodeYY);

    if (!isValidDivisionCodeYY(divisionCodeYY) || !isValidLevelCodeZZ(levelCodeZZ)) {
      setMessage(positionManageMessageEl, "กรุณาเลือกหมวดงานและระดับตำแหน่ง", "#b91c1c");
      return false;
    }
    if (!divisionLabel) {
      setMessage(positionManageMessageEl, "กรุณากรอกชื่อหมวดงาน", "#b91c1c");
      return false;
    }
    const safeName = buildPositionNameFromParts(divisionCodeYY, levelCodeZZ, divisionLabel);
    if (!safeName) {
      setMessage(positionManageMessageEl, "ระบบสร้างชื่อตำแหน่งไม่ได้ กรุณาตรวจสอบหมวดงานและระดับตำแหน่ง", "#b91c1c");
      return false;
    }

    const duplicated = currentPositionCatalog.some((item) => (
      item.id !== safeId &&
      normalizePositionText(item.name).toLowerCase() === safeName.toLowerCase()
    ));
    if (duplicated) {
      setMessage(positionManageMessageEl, "ชื่อตำแหน่งนี้มีอยู่แล้ว", "#b45309");
      return false;
    }

    try {
      await firestore.setDoc(
        firestore.doc(firestore.db, COLLECTION_POSITIONS, safeId),
        {
          name: safeName,
          divisionCodeYY,
          divisionLabel,
          levelCodeZZ,
          allowedPages,
          updatedAt: firestore.serverTimestamp(),
          updatedByEmail: (readCurrentUser()?.email || "").toString().trim().toLowerCase()
        },
        { merge: true }
      );
      currentEditingPositionId = "";
      setMessage(positionManageMessageEl, "อัปเดตตำแหน่งเรียบร้อยแล้ว", "#047857");
      return true;
    } catch (error) {
      console.error("update position failed - app.staff-access.js:2917", error);
      setMessage(positionManageMessageEl, "อัปเดตตำแหน่งไม่สำเร็จ", "#b91c1c");
      return false;
    }
  };

  const updateOrgRepresentativeStatus = async (applicationId, action) => {
    if (!resolveStore()) {
      setMessage(orgRepresentativeMessageEl, "ระบบฐานข้อมูลยังไม่พร้อมใช้งาน", "#b91c1c");
      return false;
    }
    if (!isSuperStaff()) {
      setMessage(orgRepresentativeMessageEl, "หน้านี้สำหรับหัวหน้าสตาฟเท่านั้น", "#b91c1c");
      return false;
    }

    const id = (applicationId || "").toString();
    if (!id) return false;

    const rowEl = [
      ...(orgRepresentativePendingBodyEl ? Array.from(orgRepresentativePendingBodyEl.querySelectorAll("tr")) : []),
      ...(orgRepresentativeHistoryBodyEl ? Array.from(orgRepresentativeHistoryBodyEl.querySelectorAll("tr")) : []),
      ...(approvalDetailBodyEl ? Array.from(approvalDetailBodyEl.querySelectorAll("tr")) : [])
    ].find((tr) => tr.getAttribute("data-org-representative-id") === id) || null;
    const target = currentOrgRepresentativeApplications.find((item) => (item.id || "").toString() === id);
    if (!target) return false;

    const currentUser = readCurrentUser();
    const reviewerUid = (currentUser?.uid || "").toString();
    const reviewerEmail = (currentUser?.email || "").toString().trim().toLowerCase();
    const currentStatus = normalizeApplicationStatus(target.status);
    const nextStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : "pending";
    let reviewedNote = nextStatus === "approved" ? "อนุมัติเป็นตัวแทนองค์กร" : "";

    if (currentStatus === "approved" && nextStatus === "pending") {
      const applicant = getOrgRepresentativeApplicant(target);
      const ok = window.confirm(`ยืนยันยกเลิกอนุมัติตัวแทนองค์กรของ "${applicant.displayName || applicant.email || "-"}" ?`);
      if (!ok) return false;
      reviewedNote = "ยกเลิกอนุมัติโดยหัวหน้าสตาฟ";
    } else if (nextStatus === "rejected") {
      const reason = await askStaffRejectionReason();
      if (reason === null) {
        setMessage(orgRepresentativeMessageEl, "ยกเลิกการไม่อนุมัติ", "#6b7280");
        return false;
      }
      reviewedNote = reason ? `ไม่อนุมัติ: ${reason}` : "ไม่อนุมัติคำขอ";
    }

    const rowControls = rowEl ? rowEl.querySelectorAll("button, select, input") : [];
    rowControls.forEach((control) => {
      control.disabled = true;
    });

    try {
      await firestore.updateDoc(
        firestore.doc(firestore.db, COLLECTION_ORG_REPRESENTATIVES, id),
        {
          status: nextStatus,
          reviewedByUid: reviewerUid,
          reviewedByEmail: reviewerEmail,
          reviewedNote,
          reviewedAt: nextStatus === "approved" ? firestore.serverTimestamp() : (target.reviewedAt || null),
          revokedAt: nextStatus === "pending" ? firestore.serverTimestamp() : (target.revokedAt || null),
          updatedAt: firestore.serverTimestamp()
        }
      );
      const successText = nextStatus === "approved"
        ? "อนุมัติคำขอตัวแทนองค์กรเรียบร้อยแล้ว"
        : nextStatus === "pending"
          ? "ยกเลิกอนุมัติและคืนเป็นรออนุมัติเรียบร้อยแล้ว"
          : "ไม่อนุมัติคำขอตัวแทนองค์กรเรียบร้อยแล้ว";
      setMessage(
        orgRepresentativeMessageEl,
        successText,
        "#047857"
      );
      return true;
    } catch (error) {
      console.error("update organization representative status failed - app.staff-access.js:2994", error);
      const code = (error?.code || "unknown").toString();
      if (code === "permission-denied") {
        setMessage(orgRepresentativeMessageEl, "ไม่มีสิทธิ์อัปเดตคำขอตัวแทนองค์กร (permission-denied)", "#b91c1c");
      } else if (code === "unauthenticated") {
        setMessage(orgRepresentativeMessageEl, "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่", "#b91c1c");
      } else {
        setMessage(orgRepresentativeMessageEl, "อัปเดตคำขอตัวแทนองค์กรไม่สำเร็จ กรุณาลองใหม่", "#b91c1c");
      }
      rowControls.forEach((control) => {
        control.disabled = false;
      });
      return false;
    }
  };

  const updateApplicationStatus = async (applicationId, action) => {
    if (!resolveStore()) {
      setMessage(approvalMessageEl, "ระบบฐานข้อมูลยังไม่พร้อมใช้งาน", "#b91c1c");
      return false;
    }
    if (!isSuperStaff()) {
      setMessage(approvalMessageEl, "หน้านี้สำหรับหัวหน้าสตาฟเท่านั้น", "#b91c1c");
      return false;
    }

    const id = (applicationId || "").toString();
    if (!id) return false;

    const rowEl = approvalBodyEl
      ? Array.from(approvalBodyEl.querySelectorAll("tr")).find((tr) => tr.getAttribute("data-application-id") === id)
      : null;
    if (!rowEl) return false;

    const positionInput = rowEl.querySelector(".staff-approval-position-input");
    const approvedPosition = normalizePositionText(positionInput?.value || "");

    const currentUser = readCurrentUser();
    const reviewerUid = (currentUser?.uid || "").toString();
    const reviewerEmail = (currentUser?.email || "").toString().trim().toLowerCase();

    if (action === "approve" && !approvedPosition) {
      setMessage(approvalMessageEl, "กรุณาระบุตำแหน่งก่อนอนุมัติ", "#b91c1c");
      return false;
    }

    let reviewedNote = "";
    let approvedPositionCode = "";
    if (action === "reject") {
      const reason = await askStaffRejectionReason();
      if (reason === null) {
        setMessage(approvalMessageEl, "ยกเลิกการไม่อนุมัติ", "#6b7280");
        return false;
      }
      reviewedNote = reason ? `ไม่อนุมัติ: ${reason}` : "ไม่อนุมัติคำขอ";
    } else {
      reviewedNote = `อนุมัติเป็น ${approvedPosition}`;
    }

    const rowControls = rowEl.querySelectorAll("button, select, input");
    rowControls.forEach((control) => {
      control.disabled = true;
    });

    try {
      if (action === "approve") {
        const applicantEmail = (rowEl.getAttribute("data-applicant-email") || "").toString().trim().toLowerCase();
        const applicantName = (rowEl.getAttribute("data-applicant-name") || "").toString().trim();
        const applicantNick = (rowEl.getAttribute("data-applicant-nick") || "").toString().trim();
        const approvedPositionCodeMeta = await buildApprovedPositionCode(approvedPosition);
        approvedPositionCode = approvedPositionCodeMeta.code;
        const nextPositionEntry = {
          name: approvedPosition,
          code: approvedPositionCode,
          yy: approvedPositionCodeMeta.yy,
          zz: approvedPositionCodeMeta.zz,
          sourceApplicationId: id,
          approvedAt: new Date().toISOString()
        };

        if (applicantEmail) {
          const profileRef = firestore.doc(firestore.db, COLLECTION_PROFILES, applicantEmail);
          const profileSnap = firestore.getDoc ? await firestore.getDoc(profileRef) : null;
          const profileData = profileSnap?.exists?.() ? (profileSnap.data() || {}) : {};
          const existingPositions = normalizePositionsArray(profileData.positions || []);
          const filteredPositions = existingPositions.filter(
            (entry) => (entry.sourceApplicationId || "") !== id
          );
          const nextPositions = [nextPositionEntry, ...filteredPositions];
          const nextProfile = buildProfileFieldsFromPositions(nextPositions);
          await firestore.setDoc(
            profileRef,
            {
              email: applicantEmail,
              name: applicantName,
              nick: applicantNick,
              ...nextProfile,
              approvedByUid: reviewerUid,
              approvedByEmail: reviewerEmail,
              approvedAt: firestore.serverTimestamp(),
              positionCodeXX: approvedPositionCodeMeta.xx,
              positionCodeYY: approvedPositionCodeMeta.yy,
              positionCodeZZ: approvedPositionCodeMeta.zz,
              positionCodeAAA: approvedPositionCodeMeta.aaa,
              sourceApplicationId: nextProfile.positions?.[0]?.sourceApplicationId || id,
              updatedAt: firestore.serverTimestamp()
            },
            { merge: true }
          );

          refreshLocalStaffCache(applicantEmail, {
            position: nextProfile.position,
            nick: applicantNick,
            role: nextProfile.role,
            divisionCodeYY: nextProfile.divisionCodeYY,
            positionCodeYY: nextProfile.positionCodeYY,
            positionCode: nextProfile.positionCode,
            positions: nextProfile.positions
          });

          await ensurePositionExists(approvedPosition, currentUser, {
            divisionCodeYY: approvedPositionCodeMeta.yy,
            levelCodeZZ: approvedPositionCodeMeta.zz,
            allowedPages: nextPositionEntry.allowedPages
          });
        }

        reviewedNote = `อนุมัติเป็น ${approvedPosition} รหัส ${approvedPositionCode}`;
      } else {
        const applicantEmail = (rowEl.getAttribute("data-applicant-email") || "").toString().trim().toLowerCase();
        if (applicantEmail && firestore.getDoc) {
          const profileRef = firestore.doc(firestore.db, COLLECTION_PROFILES, applicantEmail);
          const profileSnap = await firestore.getDoc(profileRef);
          const profileData = profileSnap?.exists?.() ? (profileSnap.data() || {}) : null;
          const existingPositions = extractExistingPositionsFromProfile(profileData || {});
          const matchedPosition = existingPositions.some(
            (entry) => (entry.sourceApplicationId || "") === id
          );
          const sourceApplicationId = (profileData?.sourceApplicationId || "").toString().trim();

          if (matchedPosition || (sourceApplicationId && sourceApplicationId === id)) {
            const nextPositions = existingPositions.filter(
              (entry) => (entry.sourceApplicationId || "") !== id
            );
            const nextProfile = buildProfileFieldsFromPositions(nextPositions);
            await firestore.setDoc(
              profileRef,
              {
                ...nextProfile,
                positionCodeXX: nextPositions.length ? (profileData?.positionCodeXX || "") : "",
                positionCodeYY: nextProfile.positionCodeYY || "",
                positionCodeZZ: nextPositions.length ? (profileData?.positionCodeZZ || "") : "",
                positionCodeAAA: nextPositions.length ? (profileData?.positionCodeAAA || "") : "",
                sourceApplicationId: nextProfile.positions?.[0]?.sourceApplicationId || "",
                revokedAt: firestore.serverTimestamp(),
                updatedAt: firestore.serverTimestamp()
              },
              { merge: true }
            );
            if (!nextPositions.length) {
            clearLocalStaffCache(applicantEmail);
            } else {
              refreshLocalStaffCache(applicantEmail, {
                ...nextProfile,
                nick: (profileData?.nick || "").toString()
              });
            }
          }
        }
      }

      const appRef = firestore.doc(firestore.db, COLLECTION_APPLICATIONS, id);
      await firestore.updateDoc(appRef, {
        status: action === "approve" ? "approved" : "rejected",
        reviewedByUid: reviewerUid,
        reviewedByEmail: reviewerEmail,
        reviewedNote,
        approvedPosition: action === "approve" ? approvedPosition : "",
        approvedPositionCode: action === "approve" ? approvedPositionCode : "",
        updatedAt: firestore.serverTimestamp()
      });

      setMessage(
        approvalMessageEl,
        action === "approve" ? "อนุมัติคำขอเรียบร้อยแล้ว" : "ไม่อนุมัติคำขอเรียบร้อยแล้ว",
        "#047857"
      );
      return true;
    } catch (error) {
      console.error("update staff application status failed - app.staff-access.js:3183", error);
      const code = (error?.code || "unknown").toString();
      if (error?.message === "position-code-segment-unresolved") {
        setMessage(approvalMessageEl, "ไม่สามารถสร้างรหัสตำแหน่งได้: ตรวจชื่อตำแหน่งให้ตรงหมวดที่กำหนด", "#b91c1c");
      } else if (code === "permission-denied") {
        setMessage(approvalMessageEl, "ไม่มีสิทธิ์อัปเดตคำขอ (permission-denied)", "#b91c1c");
      } else if (code === "unauthenticated") {
        setMessage(approvalMessageEl, "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่", "#b91c1c");
      } else {
        setMessage(approvalMessageEl, "อัปเดตคำขอไม่สำเร็จ กรุณาลองใหม่", "#b91c1c");
      }
      rowControls.forEach((control) => {
        control.disabled = false;
      });
      return false;
    }
  };

  const handleAuthOrProfileUpdate = (event) => {
    const detail = event?.detail && typeof event.detail === "object" ? event.detail : null;
    if (detail) {
      lastKnownAuthState = {
        isAuthenticated: !!detail.isAuthenticated,
        uid: (detail.uid || "").toString().trim(),
        email: (detail.email || "").toString().trim().toLowerCase()
      };
    } else if (!readCurrentUser()) {
      lastKnownAuthState = {
        isAuthenticated: false,
        uid: "",
        email: ""
      };
    }
    prefillApplicationForm();
    setApplicationAvailabilityByAuth();
    void refreshAccessProfileForCurrentUser({ force: true });
    if (!readCurrentUser()?.email) {
      closeApplicationModal();
    }
    setApprovalAvailabilityByRole();
    startMyApplicationsListener();
    startPendingApplicationsListener();
    startApprovedHistoryListener();
    startOrgRepresentativeApplicationsListener();
    scheduleApprovalUiSync();
  };

  if (appFormEl) {
    appFormEl.addEventListener("submit", (event) => {
      event.preventDefault();
      void submitStaffApplication();
    });
  }

  if (appDivisionEl) {
    appDivisionEl.addEventListener("change", () => {
      if (appLevelEl) appLevelEl.value = "";
      renderApplicationPositionSelect();
    });
  }

  if (appLevelEl) {
    appLevelEl.addEventListener("change", () => {
      renderApplicationPositionSelect();
    });
  }

  if (applicationModalOpenEl) {
    applicationModalOpenEl.addEventListener("click", () => {
      openApplicationModal();
    });
  }

  if (applicationModalCloseEl) {
    applicationModalCloseEl.addEventListener("click", () => {
      closeApplicationModal();
    });
  }

  if (applicationModalEl) {
    applicationModalEl.addEventListener("click", (event) => {
      if (event.target === applicationModalEl) {
        closeApplicationModal();
      }
    });
    applicationModalEl.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeApplicationModal();
      }
    });
  }

  if (approvalBodyEl) {
    approvalBodyEl.addEventListener("click", (event) => {
      // no-op: ใช้ onChange แบบหน้าห้องประชุม
    });

    approvalBodyEl.addEventListener("change", (event) => {
      const select = event.target;
      if (!(select instanceof HTMLSelectElement)) return;
      if (select.dataset.role !== "status-select") return;

      const id = (select.dataset.applicationId || "").toString();
      const value = (select.value || "").toString();
      if (!id) return;

      if (value === "pending") {
        select.classList.remove("is-approved", "is-rejected");
        select.classList.add("is-pending");
        setMessage(approvalMessageEl, "สถานะยังเป็นรออนุมัติ", "#6b7280");
        return;
      }

      const action = value === "approved" ? "approve" : value === "rejected" ? "reject" : "";
      if (!action) return;
      select.value = "pending";
      select.classList.remove("is-approved", "is-rejected");
      select.classList.add("is-pending");
      void updateApplicationStatus(id, action).then((ok) => {
        select.classList.remove("is-approved", "is-rejected");
        if (ok) {
          select.value = value;
          if (value === "approved") select.classList.add("is-approved");
          else if (value === "rejected") select.classList.add("is-rejected");
          return;
        }
        select.value = "pending";
        select.classList.add("is-pending");
      });
    });
  }

  if (approvalShowPendingBtnEl) {
    approvalShowPendingBtnEl.addEventListener("click", () => setApprovalView("pending"));
  }
  if (approvalShowHistoryBtnEl) {
    approvalShowHistoryBtnEl.addEventListener("click", () => setApprovalView("history"));
  }

  if (staffApprovalMainApprovalTabEl) {
    staffApprovalMainApprovalTabEl.addEventListener("click", () => setStaffApprovalMainTab("approval"));
  }
  if (staffApprovalMainStructureTabEl) {
    staffApprovalMainStructureTabEl.addEventListener("click", () => setStaffApprovalMainTab("structure"));
  }

  if (orgStructureMemberFormEl) {
    orgStructureMemberFormEl.addEventListener("submit", (event) => {
      void saveOrgStructureMember(event);
    });
  }
  orgStructureFields.studentId?.addEventListener("input", updateOrgStructureStudentMeta);
  orgStructureFields.studentId?.addEventListener("blur", updateOrgStructureStudentMeta);
  orgStructureFields.positionCode?.addEventListener("input", updateOrgStructureStudentMeta);
  orgStructureFields.positionCode?.addEventListener("blur", updateOrgStructureStudentMeta);
  if (orgStructureTableBodyEl) {
    orgStructureTableBodyEl.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const rowEl = target.closest("[data-org-member-id]");
      if (!rowEl) return;
      const id = (rowEl.getAttribute("data-org-member-id") || "").toString();
      const item = currentOrgStructureMembers.find((entry) => entry.id === id);
      if (item) fillOrgStructureForm(item);
    });
    orgStructureTableBodyEl.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const rowEl = target.closest("[data-org-member-id]");
      if (!rowEl) return;
      event.preventDefault();
      const id = (rowEl.getAttribute("data-org-member-id") || "").toString();
      const item = currentOrgStructureMembers.find((entry) => entry.id === id);
      if (item) fillOrgStructureForm(item);
    });
  }
  orgStructureRefreshBtnEl?.addEventListener("click", () => {
    if (typeof unsubscribeOrgStructureMembers === "function") {
      unsubscribeOrgStructureMembers();
      unsubscribeOrgStructureMembers = null;
    }
    startOrgStructureMembersListener();
  });
  orgStructureExportBtnEl?.addEventListener("click", exportOrgStructureMembersCsv);
  orgStructureArchiveBtnEl?.addEventListener("click", archiveCurrentOrgStructureMember);
  orgStructureResetBtnEl?.addEventListener("click", resetOrgStructureForm);
  orgStructureTermFilterEl?.addEventListener("change", () => {
    orgStructureFilters.term = orgStructureTermFilterEl.value || "all";
    renderOrgStructureMembers();
  });
  orgStructureStatusFilterEl?.addEventListener("change", () => {
    orgStructureFilters.status = orgStructureStatusFilterEl.value || "all";
    renderOrgStructureMembers();
  });
  orgStructureSearchInputEl?.addEventListener("input", () => {
    orgStructureFilters.query = orgStructureSearchInputEl.value.trim();
    renderOrgStructureMembers();
  });
  orgStructureFields.photoUrl?.addEventListener("input", updateOrgStructurePhotoPreview);
  orgStructureFields.photoUrl?.addEventListener("change", updateOrgStructurePhotoPreview);
  orgStructureFilterResetEl?.addEventListener("click", () => {
    if (orgStructureSearchInputEl) orgStructureSearchInputEl.value = "";
    if (orgStructureTermFilterEl) orgStructureTermFilterEl.value = "all";
    if (orgStructureStatusFilterEl) orgStructureStatusFilterEl.value = "all";
    orgStructureFilters.query = "";
    orgStructureFilters.term = "all";
    orgStructureFilters.status = "all";
    renderOrgStructureMembers();
  });

  if (staffApprovalTypeStaffBtnEl) {
    staffApprovalTypeStaffBtnEl.addEventListener("click", () => setApprovalType("staff"));
  }
  if (staffApprovalTypeOrgBtnEl) {
    staffApprovalTypeOrgBtnEl.addEventListener("click", () => setApprovalType("org"));
  }
  if (orgRepresentativeMainOverviewTabEl) {
    orgRepresentativeMainOverviewTabEl.addEventListener("click", () => setOrgRepresentativeMainTab("overview"));
  }
  if (orgRepresentativeMainFilterTabEl) {
    orgRepresentativeMainFilterTabEl.addEventListener("click", () => setOrgRepresentativeMainTab("filter"));
  }
  organizationCatalogImportBtnEl?.addEventListener("click", () => {
    organizationCatalogImportFileEl?.click();
  });
  organizationCatalogImportFileEl?.addEventListener("change", (event) => {
    const file = event.target?.files?.[0] || null;
    void importOrganizationCatalogCsvFile(file);
  });
  organizationCatalogFormEl?.addEventListener("submit", (event) => {
    void saveOrganizationCatalogForm(event);
  });
  organizationCatalogFields.group?.addEventListener("change", () => {
    syncOrganizationCatalogDocumentRunInputMode();
    refreshOrganizationCatalogGeneratedCode({ force: !organizationCatalogFields.id?.value });
    refreshOrganizationCatalogDocumentRunPreview();
    updateOrganizationCatalogFormUi();
  });
  organizationCatalogFields.name?.addEventListener("input", updateOrganizationCatalogFormUi);
  organizationCatalogFields.code?.addEventListener("input", () => {
    refreshOrganizationCatalogDocumentRunPreview();
    updateOrganizationCatalogFormUi();
  });
  organizationCatalogFields.code?.addEventListener("blur", () => {
    refreshOrganizationCatalogDocumentRunPreview();
    updateOrganizationCatalogFormUi();
  });
  organizationCatalogFields.documentRunCode?.addEventListener("focus", normalizeOrganizationCatalogDocumentRunInput);
  organizationCatalogFields.documentRunCode?.addEventListener("input", updateOrganizationCatalogFormUi);
  organizationCatalogFields.documentRunCode?.addEventListener("blur", () => {
    refreshOrganizationCatalogDocumentRunPreview();
    updateOrganizationCatalogFormUi();
  });
  organizationCatalogResponsibilityDivisionEl?.addEventListener("change", () => {
    syncOrganizationCatalogCustomResponsibilityControls();
    refreshOrganizationCatalogDocumentRunPreview();
    updateOrganizationCatalogFormUi();
  });
  organizationCatalogResponsibilitySubCodeEl?.addEventListener("input", () => {
    refreshOrganizationCatalogDocumentRunPreview();
    updateOrganizationCatalogFormUi();
  });
  organizationCatalogCustomDivisionCodeEl?.addEventListener("input", () => {
    refreshOrganizationCatalogDocumentRunPreview();
    updateOrganizationCatalogFormUi();
  });
  organizationCatalogCustomDivisionNameEl?.addEventListener("input", updateOrganizationCatalogFormUi);
  organizationCatalogResetBtnEl?.addEventListener("click", resetOrganizationCatalogForm);
  organizationCatalogArchiveBtnEl?.addEventListener("click", () => {
    void archiveCurrentOrganizationCatalogItem();
  });
  organizationCatalogGroupFilterEl?.addEventListener("change", () => {
    organizationCatalogFilters.group = organizationCatalogGroupFilterEl.value || "all";
    organizationCatalogFilters.visibleLimit = ORGANIZATION_CATALOG_PAGE_SIZE;
    renderOrganizationCatalogTable();
  });
  organizationCatalogSearchInputEl?.addEventListener("input", () => {
    organizationCatalogFilters.query = organizationCatalogSearchInputEl.value || "";
    organizationCatalogFilters.visibleLimit = ORGANIZATION_CATALOG_PAGE_SIZE;
    renderOrganizationCatalogTable();
  });
  organizationCatalogFilterResetBtnEl?.addEventListener("click", () => {
    organizationCatalogFilters.group = "all";
    organizationCatalogFilters.query = "";
    organizationCatalogFilters.visibleLimit = ORGANIZATION_CATALOG_PAGE_SIZE;
    if (organizationCatalogGroupFilterEl) organizationCatalogGroupFilterEl.value = "all";
    if (organizationCatalogSearchInputEl) organizationCatalogSearchInputEl.value = "";
    renderOrganizationCatalogTable();
  });
  organizationCatalogShowMoreBtnEl?.addEventListener("click", () => {
    organizationCatalogFilters.visibleLimit += ORGANIZATION_CATALOG_PAGE_SIZE;
    renderOrganizationCatalogTable();
  });
  organizationCatalogTableBodyEl?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const rowEl = target.closest("tr[data-organization-id]");
    if (!rowEl) return;
    const id = (rowEl.getAttribute("data-organization-id") || "").toString();
    const item = getOrganizationCatalogRows().find((entry) => entry.id === id);
    if (item) fillOrganizationCatalogForm(item);
  });
  if (orgRepresentativeShowOverviewBtnEl) {
    orgRepresentativeShowOverviewBtnEl.addEventListener("click", () => setOrgRepresentativeView("overview"));
  }
  if (orgRepresentativeExportCsvBtnEl) {
    orgRepresentativeExportCsvBtnEl.addEventListener("click", exportOrgRepresentativeOverviewCsv);
  }
  if (orgRepresentativeShowPendingBtnEl) {
    orgRepresentativeShowPendingBtnEl.addEventListener("click", () => setOrgRepresentativeView("pending"));
  }
  if (orgRepresentativeShowHistoryBtnEl) {
    orgRepresentativeShowHistoryBtnEl.addEventListener("click", () => setOrgRepresentativeView("history"));
  }
  organizationCatalogAcademicYearEl?.addEventListener("change", () => {
    setOrgRepresentativeAcademicYear(organizationCatalogAcademicYearEl.value);
    renderOrgRepresentativeOverview();
  });
  [orgRepresentativeSearchInputEl, orgRepresentativeStatusFilterEl, orgRepresentativeAcademicYearFilterEl, orgRepresentativeGroupFilterEl].forEach((control) => {
    if (!control) return;
    control.addEventListener("input", () => {
      if (control === orgRepresentativeAcademicYearFilterEl) {
        setOrgRepresentativeAcademicYear(control.value);
      }
      renderOrgRepresentativeOverview();
    });
    control.addEventListener("change", () => {
      if (control === orgRepresentativeAcademicYearFilterEl) {
        setOrgRepresentativeAcademicYear(control.value);
      }
      renderOrgRepresentativeOverview();
    });
  });
  if (orgRepresentativeOverviewBodyEl) {
    orgRepresentativeOverviewBodyEl.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const rowEl = target.closest("tr[data-org-key]");
      if (!rowEl) return;
      const key = (rowEl.getAttribute("data-org-key") || "").toString();
      openOrgRepresentativeOrganizationModal(key);
    });
  }

  if (orgRepresentativePendingBodyEl) {
    orgRepresentativePendingBodyEl.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("select, button, input, textarea, a")) return;
      const rowEl = target.closest("tr[data-org-representative-id]");
      if (!rowEl) return;
      const id = (rowEl.getAttribute("data-org-representative-id") || "").toString();
      const item = currentOrgRepresentativeApplications.find((entry) => (entry.id || "").toString() === id);
      if (item) openOrgRepresentativeDetailModal(item);
    });

    orgRepresentativePendingBodyEl.addEventListener("change", (event) => {
      const select = event.target;
      if (!(select instanceof HTMLSelectElement)) return;
      if (select.dataset.role !== "org-representative-status-select") return;

      const id = (select.dataset.orgRepresentativeId || "").toString();
      const value = (select.value || "").toString();
      if (!id) return;

      if (value === "pending") {
        select.classList.remove("is-approved", "is-rejected");
        select.classList.add("is-pending");
        setMessage(orgRepresentativeMessageEl, "สถานะยังเป็นรออนุมัติ", "#6b7280");
        return;
      }

      const action = value === "approved" ? "approve" : value === "rejected" ? "reject" : "";
      if (!action) return;
      select.value = "pending";
      select.classList.remove("is-approved", "is-rejected");
      select.classList.add("is-pending");
      void updateOrgRepresentativeStatus(id, action).then((ok) => {
        select.classList.remove("is-approved", "is-rejected");
        if (ok) {
          select.value = value;
          if (value === "approved") select.classList.add("is-approved");
          else if (value === "rejected") select.classList.add("is-rejected");
          return;
        }
        select.value = "pending";
        select.classList.add("is-pending");
      });
    });
  }

  if (orgRepresentativeHistoryBodyEl) {
    orgRepresentativeHistoryBodyEl.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("select, button, input, textarea, a")) return;
      const rowEl = target.closest("tr[data-org-representative-id]");
      if (!rowEl) return;
      const id = (rowEl.getAttribute("data-org-representative-id") || "").toString();
      const item = currentOrgRepresentativeApplications.find((entry) => (entry.id || "").toString() === id);
      if (item) openOrgRepresentativeDetailModal(item);
    });

    orgRepresentativeHistoryBodyEl.addEventListener("change", (event) => {
      const select = event.target;
      if (!(select instanceof HTMLSelectElement)) return;
      if (select.dataset.role !== "org-representative-status-select") return;

      const id = (select.dataset.orgRepresentativeId || "").toString();
      const value = (select.value || "").toString();
      if (!id) return;

      if (value === "approved") {
        select.classList.remove("is-pending", "is-rejected");
        select.classList.add("is-approved");
        setMessage(orgRepresentativeMessageEl, "สถานะยังเป็นอนุมัติแล้ว", "#6b7280");
        return;
      }

      const action = value === "pending" ? "pending" : value === "rejected" ? "reject" : "";
      if (!action) return;
      select.value = "approved";
      select.classList.remove("is-pending", "is-rejected");
      select.classList.add("is-approved");
      void updateOrgRepresentativeStatus(id, action).then((ok) => {
        select.classList.remove("is-pending", "is-rejected");
        if (ok) {
          select.value = value;
          if (value === "pending") select.classList.add("is-pending");
          else if (value === "rejected") select.classList.add("is-rejected");
          return;
        }
        select.value = "approved";
        select.classList.add("is-approved");
      });
    });
  }

  if (approvalHistoryBodyEl) {
    approvalHistoryBodyEl.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const rowEl = target.closest("tr.staff-approval-history-row");
      if (!rowEl) return;
      const groupKey = (rowEl.getAttribute("data-staff-key") || "").toString();
      const id = (rowEl.getAttribute("data-application-id") || "").toString();
      const item = groupKey
        ? currentApprovedHistoryGrouped.find((entry) => (entry.key || "").toString() === groupKey)
        : currentApprovedHistory.find((entry) => (entry.id || "").toString() === id);
      if (item) openApprovalDetailModal(item);
    });
  }

  if (approvalDetailCloseEl) {
    approvalDetailCloseEl.addEventListener("click", () => {
      closeApprovalDetailModal();
    });
  }

  if (approvalDetailModalEl) {
    approvalDetailModalEl.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) return;
      if (target.dataset.role === "org-representative-status-select") {
        const id = (target.dataset.orgRepresentativeId || "").toString();
        const nextValue = (target.value || "").toString();
        const item = currentOrgRepresentativeApplications.find((entry) => (entry.id || "").toString() === id);
        const currentValue = normalizeApplicationStatus(item?.status);
        if (!id || !item || nextValue === currentValue) return;
        const action = nextValue === "approved" ? "approve" : nextValue === "rejected" ? "reject" : "pending";
        target.value = currentValue;
        target.classList.remove("is-approved", "is-rejected", "is-pending");
        target.classList.add(currentValue === "approved" ? "is-approved" : currentValue === "rejected" ? "is-rejected" : "is-pending");
        void updateOrgRepresentativeStatus(id, action).then((ok) => {
          if (!ok) return;
          target.value = nextValue;
          target.classList.remove("is-approved", "is-rejected", "is-pending");
          target.classList.add(nextValue === "approved" ? "is-approved" : nextValue === "rejected" ? "is-rejected" : "is-pending");
        });
        return;
      }
      if (target.id !== "modalApprovalTargetSelect") return;
      const selectedOption = target.selectedOptions?.[0] || null;
      const selectedId = (target.value || "").toString();
      const selectedPosition = (selectedOption?.dataset?.position || "").toString();
      const inputEl = approvalDetailBodyEl?.querySelector("#modalApprovalPositionInput");
      if (inputEl instanceof HTMLInputElement && selectedPosition) {
        inputEl.value = selectedPosition;
      }
      const saveBtn = approvalDetailBodyEl?.querySelector(".modal-approval-save-position");
      const revertBtn = approvalDetailBodyEl?.querySelector(".modal-approval-revert-pending");
      const rejectBtn = approvalDetailBodyEl?.querySelector(".modal-approval-reject");
      if (saveBtn instanceof HTMLButtonElement) saveBtn.dataset.applicationId = selectedId;
      if (revertBtn instanceof HTMLButtonElement) revertBtn.dataset.applicationId = selectedId;
      if (rejectBtn instanceof HTMLButtonElement) rejectBtn.dataset.applicationId = selectedId;
    });

    approvalDetailModalEl.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof Element) {
        const orgRepresentativeRow = target.closest(".org-representative-org-detail tr[data-org-representative-id]");
        if (orgRepresentativeRow && !target.closest("select, button, input, textarea, a")) {
          const id = (orgRepresentativeRow.getAttribute("data-org-representative-id") || "").toString();
          const item = currentOrgRepresentativeApplications.find((entry) => (entry.id || "").toString() === id);
          if (item) openOrgRepresentativeDetailModal(item);
          return;
        }
        const saveBtn = target.closest(".modal-approval-save-position");
        if (saveBtn instanceof HTMLButtonElement) {
          const id = (saveBtn.dataset.applicationId || "").toString();
          const inputEl = approvalDetailBodyEl?.querySelector("#modalApprovalPositionInput");
          const msgEl = approvalDetailBodyEl?.querySelector("#modalApprovalActionMessage");
          const nextPosition = (inputEl instanceof HTMLInputElement ? inputEl.value : "").toString().trim();
          if (!nextPosition) {
            if (msgEl instanceof HTMLElement) {
              msgEl.textContent = "กรุณาระบุตำแหน่งก่อนบันทึก";
              msgEl.style.color = "#b91c1c";
            }
            return;
          }
          if (msgEl instanceof HTMLElement) {
            msgEl.textContent = "กำลังบันทึกตำแหน่ง...";
            msgEl.style.color = "#1d4ed8";
          }
          saveBtn.disabled = true;
          void updateApprovedPosition(id, nextPosition).then((ok) => {
            saveBtn.disabled = false;
            if (msgEl instanceof HTMLElement) {
              msgEl.textContent = ok
                ? "บันทึกตำแหน่งเรียบร้อยแล้ว"
                : "บันทึกตำแหน่งไม่สำเร็จ";
              msgEl.style.color = ok ? "#047857" : "#b91c1c";
            }
          });
          return;
        }
        const revertBtn = target.closest(".modal-approval-revert-pending");
        if (revertBtn instanceof HTMLButtonElement) {
          const id = (revertBtn.dataset.applicationId || "").toString();
          if (id) void revokeApprovedApplication(id, "pending");
          return;
        }
        const rejectBtn = target.closest(".modal-approval-reject");
        if (rejectBtn instanceof HTMLButtonElement) {
          const id = (rejectBtn.dataset.applicationId || "").toString();
          if (id) void revokeApprovedApplication(id, "rejected");
          return;
        }
      }
      if (event.target === approvalDetailModalEl) {
        closeApprovalDetailModal();
      }
    });
    approvalDetailModalEl.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeApprovalDetailModal();
      }
    });
  }

  if (positionManageFormEl) {
    positionManageFormEl.addEventListener("submit", (event) => {
      event.preventDefault();
      void addPosition();
    });
  }

  if (positionDivisionCodeEl) {
    const syncDivisionManageFields = ({ commit = false } = {}) => {
      const rawCode = (positionDivisionCodeEl.value || "").toString().replace(/\D/g, "").slice(0, 2);
      const code = commit ? normalizeCode2(rawCode) : rawCode;
      if (commit && positionDivisionCodeEl.value !== code) positionDivisionCodeEl.value = code;
      const existing = currentPositionCatalog.find((item) => normalizeCode2(item.divisionCodeYY || "") === code);
      const label = normalizePositionText(existing?.divisionLabel || existing?.divisionName || "");
      if (positionDivisionNameEl && label) {
        positionDivisionNameEl.value = label;
      }
      renderPositionAllowedPageOptions([], code);
      updateManageResolvedPositionName();
    };
    positionDivisionCodeEl.addEventListener("input", () => syncDivisionManageFields());
    positionDivisionCodeEl.addEventListener("change", () => syncDivisionManageFields({ commit: true }));
    positionDivisionCodeEl.addEventListener("blur", () => syncDivisionManageFields({ commit: true }));
  }

  if (positionDivisionNameEl && positionDivisionCodeEl) {
    positionDivisionNameEl.addEventListener("input", updateManageResolvedPositionName);
    positionDivisionNameEl.addEventListener("change", () => {
      const wantedLabel = normalizePositionText(positionDivisionNameEl.value || "");
      if (!wantedLabel || normalizeCode2(positionDivisionCodeEl.value || "")) return;
      const match = currentPositionCatalog.find((item) =>
        normalizePositionText(item.divisionLabel || item.divisionName || divisionCodeLabel(item.divisionCodeYY)).toLowerCase() === wantedLabel.toLowerCase()
      );
      if (match) {
        positionDivisionCodeEl.value = normalizeCode2(match.divisionCodeYY || "");
        renderPositionAllowedPageOptions([], positionDivisionCodeEl.value || "");
      }
      updateManageResolvedPositionName();
    });
  }

  if (positionLevelCodeEl) {
    positionLevelCodeEl.addEventListener("change", updateManageResolvedPositionName);
  }

  if (positionAllowedPagesEl) {
    positionAllowedPagesEl.addEventListener("change", (event) => {
      handleAllowedPagesToggle(event, positionAllowedPagesEl);
    });
  }

  if (positionListEl) {
    const syncEditorNameFromEvent = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.matches('[data-role="edit-yy"], [data-role="edit-division-label"], [data-role="edit-zz"]')) return;
      const cardEl = target.closest(".staff-position-chip");
      updatePositionEditorResolvedName(cardEl);
    };
    positionListEl.addEventListener("input", syncEditorNameFromEvent);
    positionListEl.addEventListener("change", syncEditorNameFromEvent);
    positionListEl.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.matches('[data-role="edit-all-page-checkbox"], [data-role="edit-page-checkbox"]')) return;
      const cardEl = target.closest(".staff-position-chip");
      if (!(cardEl instanceof Element)) return;
      handleAllowedPagesToggle(event, cardEl, "edit");
    });
    positionListEl.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const editBtn = target.closest("button[data-edit-position-id]");
      if (editBtn instanceof HTMLButtonElement) {
        const positionId = (editBtn.dataset.editPositionId || "").toString();
        currentEditingPositionId = currentEditingPositionId === positionId ? "" : positionId;
        renderPositionCatalog();
        return;
      }
      const saveBtn = target.closest("button[data-save-position-id]");
      if (saveBtn instanceof HTMLButtonElement) {
        const positionId = (saveBtn.dataset.savePositionId || "").toString();
        const cardEl = saveBtn.closest(".staff-position-chip");
        if (!(cardEl instanceof Element)) return;
        const nameInput = cardEl.querySelector('[data-role="edit-name"]');
        const yyInput = cardEl.querySelector('[data-role="edit-yy"]');
        const divisionLabelInput = cardEl.querySelector('[data-role="edit-division-label"]');
        const zzSelect = cardEl.querySelector('[data-role="edit-zz"]');
        void updatePosition(positionId, {
          name: nameInput instanceof HTMLInputElement ? nameInput.value : "",
          divisionCodeYY: yyInput instanceof HTMLInputElement ? yyInput.value : "",
          divisionLabel: divisionLabelInput instanceof HTMLInputElement ? divisionLabelInput.value : "",
          levelCodeZZ: zzSelect instanceof HTMLSelectElement ? zzSelect.value : "",
          allowedPages: readSelectedPositionAllowedPagesFrom(cardEl)
        });
        return;
      }
      const removeBtn = target.closest("button[data-position-id]");
      if (!(removeBtn instanceof HTMLButtonElement)) return;
      const positionId = (removeBtn.dataset.positionId || "").toString();
      void removePosition(positionId);
    });
  }

  window.addEventListener("sgcu:auth-state", handleAuthOrProfileUpdate);
  window.addEventListener("sgcu:user-profile-updated", prefillApplicationForm);
  window.addEventListener("hashchange", () => {
    const page = (window.location.hash || "").replace("#", "");
    if (page === "staff-approval" || page === "org-representative-approval-staff") {
      scheduleApprovalUiSync();
    }
  });

  if (window.sgcuAuth?.auth && typeof window.sgcuAuth.onAuthStateChanged === "function") {
    window.sgcuAuth.onAuthStateChanged(window.sgcuAuth.auth, (user) => {
      lastKnownAuthState = {
        isAuthenticated: !!user,
        uid: (user?.uid || "").toString().trim(),
        email: (user?.email || "").toString().trim().toLowerCase()
      };
      handleAuthOrProfileUpdate();
    });
  }

  resolveStore();
  startPositionCatalogListener();
  renderApplicationPositionSelect();
  prefillApplicationForm();
  setApplicationAvailabilityByAuth();
  setApprovalAvailabilityByRole();
  startMyApplicationsListener();
  startPendingApplicationsListener();
  startApprovedHistoryListener();
  startOrgRepresentativeApplicationsListener();
  setApprovalView("pending");
  setStaffApprovalMainTab("approval");
  setOrgRepresentativeView("overview");
  setApprovalType("staff");
  updateOrgStructurePhotoPreview();

  window.addEventListener("beforeunload", () => {
    if (deferredBootstrapTimer) {
      window.clearTimeout(deferredBootstrapTimer);
      deferredBootstrapTimer = 0;
    }
    if (approvalUiSyncTimer) {
      window.clearTimeout(approvalUiSyncTimer);
      approvalUiSyncTimer = 0;
    }
    [
      unsubscribeMyApplications,
      unsubscribePendingApplications,
      unsubscribeApprovalHistory,
      unsubscribeOrgRepresentativeApplications,
      unsubscribePositionCatalog,
      unsubscribeOrgStructureMembers
    ].forEach((unsubscribe) => {
      if (typeof unsubscribe === "function") {
        try {
          unsubscribe();
        } catch (_) {
          // ignore
        }
      }
    });
    unsubscribeMyApplications = null;
    unsubscribePendingApplications = null;
    unsubscribeApprovalHistory = null;
    unsubscribeOrgRepresentativeApplications = null;
    unsubscribePositionCatalog = null;
    unsubscribeOrgStructureMembers = null;
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStaffAccessPages, { once: true });
} else {
  initStaffAccessPages();
}
