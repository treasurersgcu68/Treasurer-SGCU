/* Staff application + approval flow */
function initStaffAccessPages() {
  if (window.__sgcuStaffAccessInitDone) return;
  window.__sgcuStaffAccessInitDone = true;

  const applicationModalEl = document.getElementById("staffApplicationModal");
  const applicationModalCloseEl = document.getElementById("staffApplicationModalClose");
  const applicationModalOpenEl = document.getElementById("loginHelpApplyBtn");
  const approvalPageEl = document.querySelector('.page-view[data-page="staff-approval"]');
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

  if (approvalDetailModalEl && approvalDetailModalEl.parentElement !== document.body) {
    document.body.appendChild(approvalDetailModalEl);
  }

  const positionManageFormEl = document.getElementById("staffPositionManageForm");
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

  const COLLECTION_APPLICATIONS = "staffApplications";
  const COLLECTION_PROFILES = "staffProfiles";
  const COLLECTION_USER_PROFILES = "userProfiles";
  const COLLECTION_POSITIONS = "staffPositionCatalog";
  const COLLECTION_POSITION_CODE_COUNTERS = "staffPositionCodeCounters";
  const STAFF_HEAD_EMAIL_OVERRIDES = new Set([
    "6534324223@student.chula.ac.th"
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
    { id: "dashboard-staff", label: "ภาพรวมสตาฟ" },
    { id: "project-status-staff", label: "กำกับสถานะโครงการ" },
    { id: "borrow-assets-staff", label: "อนุมัติยืมทรัพย์สิน" },
    { id: "meeting-room-staff", label: "อนุมัติห้องประชุม" },
    { id: "staff-approval", label: "อนุมัติสมาชิกสตาฟ" },
    { id: "login", label: "หน้าเข้าสู่ระบบ" }
  ];

  let firestore = window.sgcuFirestore || {};
  let hasStore = false;
  let unsubscribeMyApplications = null;
  let unsubscribePendingApplications = null;
  let unsubscribeApprovalHistory = null;
  let unsubscribePositionCatalog = null;

  let currentMyApplications = [];
  let currentPendingApplications = [];
  let currentApprovedHistory = [];
  let currentApprovedHistoryGrouped = [];
  let currentPositionCatalog = [];
  let currentEditingPositionId = "";
  let appFormStatusLocked = false;
  let currentApprovalView = "pending";
  let currentApprovalDetailRequestKey = "";
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

  const openApplicationModal = () => {
    if (!applicationModalEl) return;
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
    if (typeof closeDialog === "function") {
      closeDialog(applicationModalEl);
      return;
    }
    applicationModalEl.classList.remove("show");
    applicationModalEl.setAttribute("aria-hidden", "true");
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
    const currentUserHasRealProfile = !!(currentUserEmail && staffProfilesByEmail?.[currentUserEmail]);
    if (currentUserEmail && STAFF_HEAD_EMAIL_OVERRIDES.has(currentUserEmail) && !currentUserHasRealProfile) return true;
    if (!staffAuthUser) return false;
    const staffEmail = (staffAuthUser.email || "").toString().trim().toLowerCase();
    const staffHasRealProfile = !!(staffEmail && staffProfilesByEmail?.[staffEmail]);
    if (staffEmail && STAFF_HEAD_EMAIL_OVERRIDES.has(staffEmail) && !staffHasRealProfile) return true;
    const yyList = Array.isArray(staffAuthUser.divisionCodesYY)
      ? staffAuthUser.divisionCodesYY.map((item) => normalizeCode2(item))
      : [normalizeCode2(staffAuthUser.divisionCodeYY || staffAuthUser.positionCodeYY || "")];
    return yyList.includes("00") || hasRoleToken(staffAuthUser.role, "0");
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
  const isKnownStaffPage = (page) => STAFF_PAGE_OPTIONS.some((item) => item.id === (page || "").toString().trim());
  const getDefaultAllowedPagesByYY = (yy) => {
    const code = normalizeCode2(yy);
    if (code === "00") {
      return ["project-status-staff", "dashboard-staff", "borrow-assets-staff", "meeting-room-staff", "staff-approval", "login"];
    }
    return ["login"];
  };
  const normalizeAllowedPages = (pages, fallbackYY = "") => {
    const list = Array.isArray(pages)
      ? pages.map((item) => (item || "").toString().trim()).filter(Boolean)
      : [];
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
    if (normalized === "ผู้ช่วยเหรัญญิก") return "01";
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
    const isKnownDivisionByName =
      inferredYY === "00" ||
      inferredYY === "01" ||
      inferredYY === "02" ||
      inferredYY === "03" ||
      inferredYY === "04" ||
      inferredYY === "09";
    const forcedTreasurerYY =
      normalizedPosition === "เหรัญญิก" ||
      normalizedPosition === "เลขานุการฝ่ายเหรัญญิก" ||
      normalizedPosition === "ผู้ช่วยเหรัญญิก";
    const fallbackYY = inferredYY;
    const yy = forcedTreasurerYY
      ? fallbackYY
      : isKnownDivisionByName
      ? fallbackYY
      : catalogMeta?.divisionCodeYY
      ? normalizeCode2(catalogMeta.divisionCodeYY)
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
    allowedPages: normalizeAllowedPages(entry.allowedPages, entry.yy || entry.positionCodeYY || entry.divisionCodeYY || ""),
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
      divisionCodeYY: primary?.yy || ""
    };
  };

  const getAllowedPagesForCatalogPosition = (item = {}) => {
    const yy = normalizeCode2(item.divisionCodeYY || item.yy || "");
    return normalizeAllowedPages(item.allowedPages, yy);
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
                ${allowedPages.map((page) => {
                  const label = STAFF_PAGE_OPTIONS.find((entry) => entry.id === page)?.label || page;
                  return `<span class="staff-position-page-badge">${toSafeText(label)}</span>`;
                }).join("")}
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
            <td>${toSafeText(formatDateTime(item.createdAt))}</td>
            <td>${toSafeText(item.requestedPosition || "-")}</td>
            <td>${mapStatusBadge(item.status)}</td>
            <td>${toSafeText(reviewerNote || "-")}</td>
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
              <td>
                <div>${toSafeText(applicantName)}</div>
                <div class="section-text-sm">${toSafeText(applicantEmail || "-")}</div>
              </td>
              <td>${toSafeText(createdAtText)}</td>
              <td>
                <input
                  type="text"
                  class="login-input staff-approval-position-input"
                  list="staffPositionOptionsList"
                  data-application-id="${toSafeText(id)}"
                  value="${toSafeText(requestedPosition)}"
                  placeholder="ตำแหน่งที่อนุมัติ"
                />
              </td>
              <td>
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
      console.error("renderApprovalRows failed - app.staff-access.js:1013", error);
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
              <td>
                <div>${toSafeText(applicantName)}</div>
                <div class="section-text-sm">${toSafeText(applicantEmail)}</div>
              </td>
              <td>${toSafeText(approvedPosition)}</td>
              <td>${approvedPositionCode}</td>
            </tr>
          `;
        })
        .join("");

      refreshSummaryCounts();
      syncApprovalPanelCaption();
    } catch (error) {
      console.error("renderApprovedHistory failed - app.staff-access.js:1137", error);
      approvalHistoryBodyEl.innerHTML = `<tr><td colspan="3">แสดงผลรายชื่อไม่สำเร็จ: ${toSafeText(error?.message || "unknown")}</td></tr>`;
    }
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
        allowedPages: normalizeAllowedPages(item.allowedPages, item.divisionCodeYY)
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
              allowedPages: normalizeAllowedPages(item.allowedPages, yy)
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
            allowedPages: normalizeAllowedPages(item.allowedPages, item.divisionCodeYY)
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
        console.error("staff position catalog listener failed - app.staff-access.js:1278", error);
        currentPositionCatalog = DEFAULT_POSITION_OPTIONS.map((item) => ({
          id: slugifyPosition(item.name),
          name: item.name,
          divisionCodeYY: item.divisionCodeYY,
          levelCodeZZ: item.levelCodeZZ,
          allowedPages: normalizeAllowedPages(item.allowedPages, item.divisionCodeYY)
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
          (snapshot?.docs || []).map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() || {}) })),
          "createdAt"
        );
        renderMyApplications();
        scheduleApprovalUiSync();
      },
      (error) => {
        console.error("staff applications listener failed - app.staff-access.js:1334", error);
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

    if (typeof unsubscribePendingApplications === "function") {
      unsubscribePendingApplications();
      unsubscribePendingApplications = null;
    }

    const q = firestore.query(
      firestore.collection(firestore.db, COLLECTION_APPLICATIONS)
    );

    unsubscribePendingApplications = firestore.onSnapshot(
      q,
      (snapshot) => {
        currentPendingApplications = sortByTimestampDesc(
          (snapshot?.docs || [])
            .map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() || {}) }))
            .filter((item) => normalizeApplicationStatus(item.status) === "pending"),
          "createdAt"
        );
        renderApprovalRows();
        scheduleApprovalUiSync();
      },
      (error) => {
        console.error("staff pending listener failed - app.staff-access.js:1371", error);
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

    if (typeof unsubscribeApprovalHistory === "function") {
      unsubscribeApprovalHistory();
      unsubscribeApprovalHistory = null;
    }

    const q = firestore.query(
      firestore.collection(firestore.db, COLLECTION_APPLICATIONS)
    );

    unsubscribeApprovalHistory = firestore.onSnapshot(
      q,
      (snapshot) => {
        currentApprovedHistory = sortByTimestampDesc(
          (snapshot?.docs || [])
            .map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() || {}) }))
            .filter((item) => normalizeApplicationStatus(item.status) === "approved"),
          "updatedAt"
        );
        renderApprovedHistory();
        scheduleApprovalUiSync();
      },
      (error) => {
        console.error("staff approved history listener failed - app.staff-access.js:1411", error);
        const code = (error?.code || "").toString();
        const msg = code === "unauthenticated"
          ? "กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้"
          : buildListenerErrorText("ไม่สามารถโหลดรายชื่อผู้ปฏิบัติงานตอนนี้ได้ในขณะนี้", error);
        approvalHistoryBodyEl.innerHTML = `<tr><td colspan="3">${toSafeText(msg)}</td></tr>`;
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
      console.error("revoke approved application failed - app.staff-access.js:1494", error);
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
          allowedPages: normalizeAllowedPages(positionMeta?.allowedPages, approvedPositionCodeMeta.yy),
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
      console.error("update approved position failed - app.staff-access.js:1605", error);
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
    } else if (!positionManageMessageEl?.textContent) {
      setMessage(positionManageMessageEl, "เพิ่มหรือลบตำแหน่งได้จากส่วนนี้", "#6b7280");
    }
  };

  const hasPendingApplication = () => {
    return currentMyApplications.some((item) => (item.status || "pending") === "pending");
  };

  const prefillApplicationForm = () => {
    renderApplicationPositionSelect();
  };

  const submitStaffApplication = async () => {
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
      await ensurePositionExists(requestedPosition, user);
      setMessage(appMessageEl, "ส่งคำขอสมัครสตาฟเรียบร้อยแล้ว", "#047857");
      window.setTimeout(() => {
        appFormStatusLocked = false;
        setApplicationAvailabilityByAuth();
      }, 1800);
    } catch (error) {
      console.error("submit staff application failed - app.staff-access.js:1712", error);
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
      console.error("add position failed - app.staff-access.js:1771", error);
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
      console.error("remove position failed - app.staff-access.js:1798", error);
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
      console.error("update position failed - app.staff-access.js", error);
      setMessage(positionManageMessageEl, "อัปเดตตำแหน่งไม่สำเร็จ", "#b91c1c");
      return false;
    }
  };

  const updateApplicationStatus = async (applicationId, action) => {
    if (!resolveStore()) {
      setMessage(approvalMessageEl, "ระบบฐานข้อมูลยังไม่พร้อมใช้งาน", "#b91c1c");
      return;
    }
    if (!isSuperStaff()) {
      setMessage(approvalMessageEl, "หน้านี้สำหรับหัวหน้าสตาฟเท่านั้น", "#b91c1c");
      return;
    }

    const id = (applicationId || "").toString();
    if (!id) return;

    const rowEl = approvalBodyEl
      ? Array.from(approvalBodyEl.querySelectorAll("tr")).find((tr) => tr.getAttribute("data-application-id") === id)
      : null;
    if (!rowEl) return;

    const positionInput = rowEl.querySelector(".staff-approval-position-input");
    const approvedPosition = normalizePositionText(positionInput?.value || "");

    const currentUser = readCurrentUser();
    const reviewerUid = (currentUser?.uid || "").toString();
    const reviewerEmail = (currentUser?.email || "").toString().trim().toLowerCase();

    if (action === "approve" && !approvedPosition) {
      setMessage(approvalMessageEl, "กรุณาระบุตำแหน่งก่อนอนุมัติ", "#b91c1c");
      return;
    }

    let reviewedNote = "";
    let approvedPositionCode = "";
    if (action === "reject") {
      reviewedNote = (window.prompt("ระบุเหตุผลที่ไม่อนุมัติ (ไม่บังคับ)", "") || "").toString().trim();
    } else {
      reviewedNote = `อนุมัติเป็น ${approvedPosition}`;
    }

    const rowButtons = rowEl.querySelectorAll("button");
    rowButtons.forEach((btn) => {
      btn.disabled = true;
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
    } catch (error) {
      console.error("update staff application status failed - app.staff-access.js:1969", error);
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
      rowButtons.forEach((btn) => {
        btn.disabled = false;
      });
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
    if (!readCurrentUser()?.email) {
      closeApplicationModal();
    }
    setApprovalAvailabilityByRole();
    startMyApplicationsListener();
    startPendingApplicationsListener();
    startApprovedHistoryListener();
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

      select.classList.remove("is-pending", "is-approved", "is-rejected");
      if (value === "approved") select.classList.add("is-approved");
      else if (value === "rejected") select.classList.add("is-rejected");
      else select.classList.add("is-pending");

      if (value === "pending") {
        setMessage(approvalMessageEl, "สถานะยังเป็นรออนุมัติ", "#6b7280");
        return;
      }

      const action = value === "approved" ? "approve" : value === "rejected" ? "reject" : "";
      if (!action) return;
      void updateApplicationStatus(id, action);
    });
  }

  if (approvalShowPendingBtnEl) {
    approvalShowPendingBtnEl.addEventListener("click", () => setApprovalView("pending"));
  }
  if (approvalShowHistoryBtnEl) {
    approvalShowHistoryBtnEl.addEventListener("click", () => setApprovalView("history"));
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
    if ((window.location.hash || "").replace("#", "") === "staff-approval") {
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
  setApprovalView("pending");

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
      unsubscribePositionCatalog
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
    unsubscribePositionCatalog = null;
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStaffAccessPages, { once: true });
} else {
  initStaffAccessPages();
}
