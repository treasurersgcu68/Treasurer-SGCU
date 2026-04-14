/* Meeting room booking (Firestore shared data) */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("meetingRoomBookingForm");
  const roomSelect = document.getElementById("meetingRoomName");
  const dateInput = document.getElementById("meetingDate");
  const startTimeInput = document.getElementById("meetingStartTime");
  const endTimeInput = document.getElementById("meetingEndTime");
  const meetingProfileRequesterEl = document.getElementById("meetingProfileRequester");
  const meetingProfilePhoneEl = document.getElementById("meetingProfilePhone");
  const meetingProfileContactEl = document.getElementById("meetingProfileContact");
  const purposeInput = document.getElementById("meetingPurpose");
  const cancelForm = document.getElementById("meetingCancelForm");
  const cancelBookingSelect = document.getElementById("meetingCancelBookingSelect");
  const cancelReasonInput = document.getElementById("meetingCancelReason");
  const cancelMessageEl = document.getElementById("meetingCancelMessage");
  const rescheduleForm = document.getElementById("meetingRescheduleForm");
  const rescheduleBookingSelect = document.getElementById("meetingRescheduleBookingSelect");
  const rescheduleDateInput = document.getElementById("meetingRescheduleDate");
  const rescheduleStartTimeInput = document.getElementById("meetingRescheduleStartTime");
  const rescheduleEndTimeInput = document.getElementById("meetingRescheduleEndTime");
  const rescheduleReasonInput = document.getElementById("meetingRescheduleReason");
  const rescheduleMessageEl = document.getElementById("meetingRescheduleMessage");
  const projectModeSelect = document.getElementById("meetingProjectMode");
  const projectCodeInput = document.getElementById("meetingProjectCode");
  const projectCodeState = document.getElementById("meetingProjectCodeState");
  const projectNamePreview = document.getElementById("meetingProjectNamePreview");
  const messageEl = document.getElementById("meetingBookingMessage");
  let tableBody = document.getElementById("meetingRoomTableBody");
  const calendarPanel = document.getElementById("meetingRoomCalendar");
  const calendarTitle = document.getElementById("meetingCalendarTitle");
  const calendarPanelWrap = document.getElementById("meetingRoomCalendarPanel");
  let listPanel = document.getElementById("meetingRoomListPanel");
  let viewCalendarBtn = document.getElementById("meetingViewCalendarBtn");
  let viewListBtn = document.getElementById("meetingViewListBtn");
  const calendarPrevBtn = document.getElementById("meetingCalendarPrevMonth");
  const calendarNextBtn = document.getElementById("meetingCalendarNextMonth");
  let bookingCountEl = document.getElementById("meetingRoomBookingCount");
  let pendingCountEl = document.getElementById("meetingRoomPendingCount");
  let latestDateEl = document.getElementById("meetingRoomLatestDate");
  const bookingDetailModalEl = document.getElementById("meetingBookingDetailModal");
  const bookingDetailTitleEl = document.getElementById("meetingBookingDetailTitle");
  const bookingDetailBodyEl = document.getElementById("meetingBookingDetailBody");
  const bookingDetailCloseEl = document.getElementById("meetingBookingDetailClose");
  const bookingDayModalEl = document.getElementById("meetingBookingDayModal");
  const bookingDayModalTitleEl = document.getElementById("meetingBookingDayTitle");
  const bookingDayModalBodyEl = document.getElementById("meetingBookingDayBody");
  const bookingDayModalCloseEl = document.getElementById("meetingBookingDayClose");
  const rejectReasonModalEl = document.getElementById("meetingRejectReasonModal");
  const rejectReasonInputEl = document.getElementById("meetingRejectReasonInput");
  const rejectReasonErrorEl = document.getElementById("meetingRejectReasonError");
  const rejectReasonSubmitEl = document.getElementById("meetingRejectReasonSubmit");
  const rejectReasonCancelEl = document.getElementById("meetingRejectReasonCancel");
  const rejectReasonCloseEl = document.getElementById("meetingRejectReasonClose");

  if (!form || !roomSelect || !dateInput || !startTimeInput || !endTimeInput ||
      !purposeInput || !messageEl) {
    return;
  }

  const STORAGE_KEY = "meetingRoomBookings-v1";
  const LOCAL_MIGRATED_KEY = "meetingRoomBookingsMigratedToFirestore-v1";
  const PROFILE_STORAGE_KEY = "sgcu_borrow_profile_by_email_v1";
  const USER_PROFILE_COLLECTION = "userProfiles";
  const BOOKING_COLLECTION_NAME = "meetingRoomBookings";
  const ROOM_COLLECTION_NAME = "meetingRooms";
  const HOLIDAY_COLLECTION_NAME = "meetingRoomHolidays";
  const AUDIT_COLLECTION_NAME = "auditLogs";
  const DEFAULT_MEETING_ROOMS = [
    { id: "room-1", name: "ห้องประชุม 1 ชั้น 2", bookingAccess: "public" },
    { id: "room-2", name: "ห้องประชุม 2 ชั้น 2", bookingAccess: "public" },
    { id: "room-3", name: "ห้องประชุม 3 ชั้น 2", bookingAccess: "public" }
  ];
  const MONTH_NAMES_TH = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม"
  ];
  const DEFAULT_PROJECT_MODE = "non_project";
  const MIN_ADVANCE_BOOKING_HOURS = 24;
  const MIN_CANCEL_BEFORE_HOURS = 12;
  const NO_SHOW_LOOKBACK_DAYS = 90;
  const NO_SHOW_BLOCK_THRESHOLD = 3;
  const NO_SHOW_BLOCK_DAYS = 30;
  const NO_SHOW_REASON_MARKER = "[NO_SHOW]";
  let projectLookupPromise = null;
  let projectLookupReady = false;
  let projectByCode = new Map();
  let meetingRooms = [...DEFAULT_MEETING_ROOMS];
  let firestore = window.sgcuFirestore || {};
  let hasFirestore = false;
  const resolveFirestoreBridge = () => {
    firestore = window.sgcuFirestore || {};
    hasFirestore = !!(
      firestore.db &&
      firestore.collection &&
      firestore.addDoc &&
      firestore.onSnapshot &&
      firestore.query &&
      firestore.orderBy &&
      firestore.doc &&
      firestore.updateDoc &&
      firestore.serverTimestamp
    );
    return hasFirestore;
  };
  resolveFirestoreBridge();
  let meetingRoomActiveView = "calendar";

  const normalizeStatus = (status) => {
    const value = (status || "pending").toString().trim().toLowerCase();
    if (value === "approved" || value === "rejected" || value === "cancel_requested" || value === "reschedule_requested" || value === "no_show") return value;
    return "pending";
  };
  const isNoShowReason = (reason) =>
    (reason || "").toString().trim().toUpperCase().startsWith(NO_SHOW_REASON_MARKER);
  const buildNoShowReason = (reason = "") => {
    const text = (reason || "").toString().trim();
    if (isNoShowReason(text)) return text;
    return `${NO_SHOW_REASON_MARKER} ไม่มาใช้ห้องตามเวลาจอง`;
  };

  const normalizeRoomBookingAccess = (value) =>
    value === "staff_only" ? "staff_only" : "public";

  const normalizeRoomDisplay = (roomId, roomName) =>
    meetingRooms.find((room) => room.id === roomId)?.name || roomName || roomId || "-";

  const getRoomBookingAccess = (roomId) =>
    normalizeRoomBookingAccess(meetingRooms.find((room) => room.id === roomId)?.bookingAccess);

  const toDateTime = (date, time) => new Date(`${date}T${time}:00`);

  const normalizeProjectCode = (value) => {
    const text = (value || "").toString();
    const normalized = typeof text.normalize === "function"
      ? text.normalize("NFKC")
      : text;
    return normalized
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/^'+/, "")
      .replace(/\s+/g, "")
      .trim()
      .toUpperCase();
  };

  const canonicalProjectCode = (value) =>
    normalizeProjectCode(value).replace(/[^A-Z0-9]/g, "");

  let calendarCursor = new Date();

  const readProjectSource = () => {
    if (typeof window === "undefined") return [];
    if (window.sgcuProjectData?.projects) return window.sgcuProjectData.projects;
    if (Array.isArray(window.projects)) return window.projects;
    if (typeof projects !== "undefined" && Array.isArray(projects)) return projects;
    return [];
  };

  const hydrateProjectLookup = (source = []) => {
    projectByCode = new Map();
    if (!Array.isArray(source)) return;
    source.forEach((item) => {
      const code = normalizeProjectCode(item?.code);
      if (!code) return;
      projectByCode.set(code, item);
      const canonicalCode = canonicalProjectCode(code);
      if (canonicalCode && !projectByCode.has(canonicalCode)) {
        projectByCode.set(canonicalCode, item);
      }
    });
    projectLookupReady = source.length > 0;
  };

  const waitForProjectData = async () => {
    if (projectLookupPromise) return projectLookupPromise;
    projectLookupPromise = (async () => {
      if (!projectLookupReady) {
        const ensureLoader =
          (typeof window !== "undefined" && typeof window.ensureProjectDataLoaded === "function")
            ? window.ensureProjectDataLoaded
            : (typeof ensureProjectDataLoaded === "function" ? ensureProjectDataLoaded : null);
        if (ensureLoader) {
          try {
            await ensureLoader();
          } catch (err) {
            // leave with fallback local cache
          }
        }
        hydrateProjectLookup(readProjectSource());
      }
    })();
    await projectLookupPromise;
    projectLookupPromise = null;
  };

  const getProjectByCode = async (codeValue) => {
    const normalized = normalizeProjectCode(codeValue);
    if (!normalized) return null;
    await waitForProjectData();
    const exact = projectByCode.get(normalized);
    if (exact) return exact;
    const canonical = canonicalProjectCode(normalized);
    if (canonical) return projectByCode.get(canonical) || null;
    return null;
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const createFieldElement = ({ id, label, required = false, type = "text", value = "", placeholder = "" }) => {
    const wrapper = document.createElement("div");
    wrapper.className = "form-group";
    const labelEl = document.createElement("label");
    labelEl.setAttribute("for", id);
    labelEl.textContent = required ? `${label} *` : label;
    const input = document.createElement("input");
    input.id = id;
    input.name = id;
    input.type = type;
    input.className = "form-input";
    input.placeholder = placeholder;
    input.required = !!required;
    input.value = value;
    wrapper.appendChild(labelEl);
    wrapper.appendChild(input);
    return wrapper;
  };

  const createSelectElement = ({ id, label, options = [] }) => {
    const wrapper = document.createElement("div");
    wrapper.className = "form-group";
    const labelEl = document.createElement("label");
    labelEl.setAttribute("for", id);
    labelEl.textContent = `${label} *`;
    const select = document.createElement("select");
    select.id = id;
    select.name = id;
    select.className = "form-input";
    select.required = true;
    options.forEach((option) => {
      const optionEl = document.createElement("option");
      optionEl.value = option.value;
      optionEl.textContent = option.label;
      select.appendChild(optionEl);
    });
    wrapper.appendChild(labelEl);
    wrapper.appendChild(select);
    return wrapper;
  };

  const ensureFormContactFields = () => {
    if (!form || !messageEl) return;

    const projectModeField = document.getElementById("meetingProjectMode");
    if (!projectModeField) return;
    const projectFieldsWrapper = document.getElementById("meetingProjectFields");

    const toggleProjectFields = () => {
      const isProject = projectModeField.value === "project";
      if (projectFieldsWrapper) {
        projectFieldsWrapper.hidden = !isProject;
      }
      if (!isProject) {
        clearProjectFeedback();
      }
    };
    projectModeField.addEventListener("change", toggleProjectFields);
    toggleProjectFields();

    if (projectCodeInput) {
      projectCodeInput.addEventListener("blur", async () => {
        if (projectModeField.value !== "project") return;
        const code = projectCodeInput.value;
        if (!code.trim()) {
          clearProjectFeedback();
          return;
        }
        const project = await getProjectByCode(code);
        if (project) {
          showProjectSuccess(project);
        } else {
          showProjectError("ไม่พบรหัสโครงการนี้ กรุณากรอกรหัสใหม่");
        }
      });
    }
  };

  const readSharedProfiles = () => {
    try {
      const raw = window.localStorage?.getItem(PROFILE_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  };

  const applySharedProfileToMeetingForm = (profile) => {
    if (!profile || typeof profile !== "object") return;
    activeMeetingProfile = {
      firstName: (profile.firstName || "").toString().trim(),
      lastName: (profile.lastName || "").toString().trim(),
      phone: (profile.phone || "").toString().trim(),
      lineId: (profile.lineId || "").toString().trim()
    };
    const fullName = [activeMeetingProfile.firstName, activeMeetingProfile.lastName]
      .map((part) => (part || "").toString().trim())
      .filter(Boolean)
      .join(" ");
    if (meetingProfileRequesterEl) meetingProfileRequesterEl.textContent = `ชื่อผู้ขอ: ${fullName || "-"}`;
    if (meetingProfilePhoneEl) meetingProfilePhoneEl.textContent = `เบอร์ติดต่อ: ${activeMeetingProfile.phone || "-"}`;
    if (meetingProfileContactEl) meetingProfileContactEl.textContent = `ช่องทางติดต่อ: ${activeMeetingProfile.lineId || "-"}`;
  };

  const restoreMeetingProfileForCurrentUser = () => {
    const email = (currentUserEmail || "").toString().trim().toLowerCase();
    if (!email) {
      activeMeetingProfile = null;
      if (meetingProfileRequesterEl) meetingProfileRequesterEl.textContent = "ชื่อผู้ขอ: -";
      if (meetingProfilePhoneEl) meetingProfilePhoneEl.textContent = "เบอร์ติดต่อ: -";
      if (meetingProfileContactEl) meetingProfileContactEl.textContent = "ช่องทางติดต่อ: -";
      return;
    }
    const profile = readSharedProfiles()[email];
    if (!profile) return;
    applySharedProfileToMeetingForm(profile);
  };

  const getMeetingProfileForSubmit = async () => {
    const email = (currentUserEmail || "").toString().trim().toLowerCase();
    if (!email) return null;
    if (activeMeetingProfile && activeMeetingProfile.firstName && activeMeetingProfile.lastName) {
      return activeMeetingProfile;
    }
    const local = readSharedProfiles()[email];
    if (local) {
      applySharedProfileToMeetingForm(local);
      return activeMeetingProfile;
    }
    const remote = await readMeetingProfileFromFirestore();
    if (remote) {
      applySharedProfileToMeetingForm(remote);
      return activeMeetingProfile;
    }
    return null;
  };

  const readMeetingProfileFromFirestore = async () => {
    const firestoreBridge = window.sgcuFirestore || {};
    const authUser = window.sgcuAuth?.auth?.currentUser || null;
    const email = (authUser?.email || "").toString().trim().toLowerCase();
    const uid = (authUser?.uid || "").toString().trim();
    if (!email || !uid) return null;
    if (!firestoreBridge.db || !firestoreBridge.doc || !firestoreBridge.getDoc) return null;
    try {
      const ref = firestoreBridge.doc(firestoreBridge.db, USER_PROFILE_COLLECTION, uid);
      const snap = await firestoreBridge.getDoc(ref);
      if (!snap?.exists()) return null;
      const data = snap.data() || {};
      if (!data || typeof data !== "object") return null;
      const profiles = readSharedProfiles();
      profiles[email] = {
        ...(profiles[email] || {}),
        ...data,
        updatedAt: Date.now()
      };
      try {
        window.localStorage?.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
      } catch (_) {
        // ignore local cache write errors
      }
      return profiles[email];
    } catch (_) {
      return null;
    }
  };

  const setProjectStatus = (type, text = "") => {
    if (!projectCodeState) return;
    projectCodeState.hidden = !text;
    projectCodeState.textContent = text;
    projectCodeState.dataset.state = type;
  };

  const showProjectSuccess = (project) => {
    setMessage("", "#374151");
    if (projectNamePreview) {
      projectNamePreview.hidden = false;
      projectNamePreview.textContent = `ชื่อโครงการ: ${project?.name || "ไม่พบชื่อ"}`;
    }
    setProjectStatus("ok", "รหัสถูกต้อง");
  };

  const showProjectError = (text) => {
    if (projectNamePreview) {
      projectNamePreview.hidden = true;
      projectNamePreview.textContent = "";
    }
    setProjectStatus("error", text);
  };

  const clearProjectFeedback = () => {
    setProjectStatus("", "");
    if (projectNamePreview) {
      projectNamePreview.hidden = true;
      projectNamePreview.textContent = "";
    }
  };

  const setMessage = (text, color = "#374151") => {
    messageEl.textContent = text || "";
    messageEl.style.color = color;
  };

  const setCancelMessage = (text, color = "#374151") => {
    if (!cancelMessageEl) return;
    cancelMessageEl.textContent = text || "";
    cancelMessageEl.style.color = color;
  };

  const setRescheduleMessage = (text, color = "#374151") => {
    if (!rescheduleMessageEl) return;
    rescheduleMessageEl.textContent = text || "";
    rescheduleMessageEl.style.color = color;
  };

  const ensureBookingListUI = () => {
    if (tableBody && listPanel) {
      return;
    }
    const bookingPage = document.querySelector('.page-view[data-page="meeting-room-booking"] .page');
    if (!bookingPage) return;
    const calendarPanelNode = document.getElementById("meetingRoomCalendarPanel");
    if (!calendarPanelNode) return;

    // Remove legacy view-toggle UI and keep calendar-only UX.
    const toolbar = document.getElementById("meetingRoomViewToggle");
    if (toolbar) toolbar.remove();
    if (viewCalendarBtn) viewCalendarBtn.remove();
    if (viewListBtn) viewListBtn.remove();

    const summary = document.getElementById("meetingRoomListSummary");
    if (summary) summary.remove();
    const legacyCount = document.getElementById("meetingRoomBookingCount");
    if (legacyCount) legacyCount.closest("#meetingRoomListSummary")?.remove();
    const legacyPending = document.getElementById("meetingRoomPendingCount");
    if (legacyPending) legacyPending.closest("#meetingRoomListSummary")?.remove();
    const legacyLatest = document.getElementById("meetingRoomLatestDate");
    if (legacyLatest) legacyLatest.closest("#meetingRoomListSummary")?.remove();

    let listPanelNode = document.getElementById("meetingRoomListPanel");
    if (!listPanelNode) {
      listPanelNode = document.createElement("div");
      listPanelNode.id = "meetingRoomListPanel";
      listPanelNode.className = "panel panel-hover section-appear section-delay-2";
      listPanelNode.style.display = "none";
      listPanelNode.innerHTML = `
        <div class="panel-header">
          <div>
            <div class="panel-title">รายการคำขอจองห้องประชุม</div>
          </div>
        </div>
        <div class="panel-body">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ห้อง</th>
                  <th>วันที่</th>
                  <th>เวลา</th>
                  <th>ผู้ขอ</th>
                  <th>วัตถุประสงค์</th>
                </tr>
              </thead>
              <tbody id="meetingRoomTableBody"></tbody>
            </table>
          </div>
        </div>
      `;
      calendarPanelNode.parentNode?.insertBefore(listPanelNode, calendarPanelNode.nextSibling);
    }

    viewCalendarBtn = null;
    viewListBtn = null;
    bookingCountEl = null;
    pendingCountEl = null;
    latestDateEl = null;
    listPanel = document.getElementById("meetingRoomListPanel");
    tableBody = document.getElementById("meetingRoomTableBody");
  };

  const buildStorageBooking = (item) => ({
    roomId: item.roomId || "",
    roomName: item.roomName || "",
    date: item.date || "",
    startTime: item.startTime || "",
    endTime: item.endTime || "",
    requester: item.requester || "",
    purpose: item.purpose || "",
    contactPhone: item.contactPhone || "",
    contactInfo: item.contactInfo || "",
    requesterEmail: (item.requesterEmail || "").toString().trim().toLowerCase(),
    projectMode: item.projectMode || DEFAULT_PROJECT_MODE,
    projectCode: item.projectCode || "",
    projectName: item.projectName || "",
    roomBookingAccess: normalizeRoomBookingAccess(item.roomBookingAccess),
    rescheduleBaseStatus: normalizeStatus(item.rescheduleBaseStatus),
    rescheduleRequestedDate: item.rescheduleRequestedDate || "",
    rescheduleRequestedStartTime: item.rescheduleRequestedStartTime || "",
    rescheduleRequestedEndTime: item.rescheduleRequestedEndTime || "",
    rescheduleRequestReason: item.rescheduleRequestReason || "",
    startAt: item.startAt || "",
    endAt: item.endAt || "",
    status: normalizeStatus(item.status)
  });

  const hasOverlap = (candidate, list, options = {}) => {
    const ignoredBookingId = options.ignoredBookingId || "";
    const parseDateOnly = (value) => {
      const text = (value || "").toString().trim();
      if (!text) return null;
      const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
      const ymd = text.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
      if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
      const dmy = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (dmy) {
        let year = Number(dmy[3]);
        if (year > 2400) year -= 543;
        return new Date(year, Number(dmy[2]) - 1, Number(dmy[1]));
      }
      const parsed = new Date(text);
      if (!Number.isFinite(parsed.getTime())) return null;
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    };
    const parseMinutes = (value) => {
      const text = (value || "").toString().trim();
      const match = text.match(/^(\d{1,2}):(\d{2})$/);
      if (!match) return null;
      const h = Number(match[1]);
      const m = Number(match[2]);
      if (h < 0 || h > 23 || m < 0 || m > 59) return null;
      return (h * 60) + m;
    };
    const dayKey = (dateObj) => {
      if (!(dateObj instanceof Date) || !Number.isFinite(dateObj.getTime())) return "";
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, "0");
      const d = String(dateObj.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };
    const parseDateTime = (dateTimeValue, dateValue, timeValue) => {
      const parsed = new Date(dateTimeValue);
      if (Number.isFinite(parsed.getTime())) return parsed;
      const dateObj = parseDateOnly(dateValue);
      const minutes = parseMinutes(timeValue);
      if (!dateObj || minutes === null) return null;
      return new Date(
        dateObj.getFullYear(),
        dateObj.getMonth(),
        dateObj.getDate(),
        Math.floor(minutes / 60),
        minutes % 60,
        0,
        0
      );
    };
    const candidateStart = parseDateTime("", candidate.date, candidate.startTime);
    const candidateEnd = parseDateTime("", candidate.date, candidate.endTime);
    if (!candidateStart || !candidateEnd) return false;
    const candidateDayKey = dayKey(parseDateOnly(candidate.date));
    const candidateStartMin = parseMinutes(candidate.startTime);
    const candidateEndMin = parseMinutes(candidate.endTime);
    const normalizeRoomValue = (value) =>
      (value || "").toString().trim().toLowerCase().replace(/\s+/g, " ");
    const candidateRoomId = normalizeRoomValue(candidate.roomId);
    const candidateRoomName = normalizeRoomValue(candidate.roomName);
    const candidateRoomDisplay = normalizeRoomValue(
      normalizeRoomDisplay(candidate.roomId, candidate.roomName)
    );

    return list.some((item) => {
      if (ignoredBookingId && item.id === ignoredBookingId) return false;
      const itemRoomId = normalizeRoomValue(item.roomId);
      const itemRoomName = normalizeRoomValue(item.roomName);
      const itemRoomDisplay = normalizeRoomValue(
        normalizeRoomDisplay(item.roomId, item.roomName)
      );
      const sameRoomById = !!candidateRoomId && !!itemRoomId && candidateRoomId === itemRoomId;
      const sameRoomByName = !!candidateRoomName && !!itemRoomName && candidateRoomName === itemRoomName;
      const sameRoomByDisplay =
        !!candidateRoomDisplay && !!itemRoomDisplay && candidateRoomDisplay === itemRoomDisplay;
      if (!sameRoomById && !sameRoomByName && !sameRoomByDisplay) return false;
      if (item.status === "rejected" || item.status === "no_show") return false;
      const itemStart =
        parseDateTime("", item.date, item.startTime) ||
        parseDateTime(item.startAt, item.date, item.startTime);
      const itemEnd =
        parseDateTime("", item.date, item.endTime) ||
        parseDateTime(item.endAt, item.date, item.endTime);
      if (itemStart && itemEnd) {
        return candidateStart < itemEnd && candidateEnd > itemStart;
      }
      const itemDayKey = dayKey(parseDateOnly(item.date));
      const itemStartMin = parseMinutes(item.startTime);
      const itemEndMin = parseMinutes(item.endTime);
      if (
        !candidateDayKey ||
        !itemDayKey ||
        candidateDayKey !== itemDayKey ||
        candidateStartMin === null ||
        candidateEndMin === null ||
        itemStartMin === null ||
        itemEndMin === null
      ) {
        return false;
      }
      return candidateStartMin < itemEndMin && candidateEndMin > itemStartMin;
    });
  };

  let bookings = [];
  let unsubscribe = null;
  let unsubscribeRooms = null;
  let unsubscribeHolidays = null;
  let hasMigrated = false;
  let currentUserEmail = "";
  let activeDetailBookingId = "";
  let activeDetailOptions = {};
  let roomsLoaded = false;
  let bookingsLoaded = false;
  let roomsLoadFailed = false;
  let bookingsLoadFailed = false;
  let meetingStateEl = null;
  let activeDayModalDate = "";
  let autoRetryTimer = null;
  let autoRetryAttempt = 0;
  let activeMeetingProfile = null;

  const mapSnapshotDoc = (docItem) => {
    const data = docItem.data() || {};
    const roomId = data.roomId || "";
    const normalizedDbStatus = normalizeStatus(data.status);
    const derivedStatus =
      normalizedDbStatus === "rejected" && isNoShowReason(data.rejectionReason)
        ? "no_show"
        : normalizedDbStatus;
    const booking = {
      id: docItem.id,
      roomId,
      roomName: data.roomName || "",
      date: data.date || "",
      startTime: data.startTime || "",
      endTime: data.endTime || "",
      requester: data.requester || "",
      purpose: data.purpose || "",
      rejectionReason: data.rejectionReason || "",
      contactPhone: data.contactPhone || "",
      contactInfo: data.contactInfo || "",
      cancelRequestReason: data.cancelRequestReason || "",
      requesterEmail: (data.requesterEmail || "").toString().trim().toLowerCase(),
      projectMode: data.projectMode || DEFAULT_PROJECT_MODE,
      projectCode: data.projectCode || "",
      projectName: data.projectName || "",
      roomBookingAccess: normalizeRoomBookingAccess(data.roomBookingAccess),
      rescheduleBaseStatus: normalizeStatus(data.rescheduleBaseStatus),
      rescheduleRequestedDate: data.rescheduleRequestedDate || "",
      rescheduleRequestedStartTime: data.rescheduleRequestedStartTime || "",
      rescheduleRequestedEndTime: data.rescheduleRequestedEndTime || "",
      rescheduleRequestReason: data.rescheduleRequestReason || "",
      status: derivedStatus,
      startAt: data.startAt || "",
      endAt: data.endAt || "",
      roomDisplay: normalizeRoomDisplay(roomId, data.roomName)
    };
    if (!booking.startAt && booking.date && booking.startTime) {
      booking.startAt = toDateTime(booking.date, booking.startTime).toISOString();
    }
    if (!booking.endAt && booking.date && booking.endTime) {
      booking.endAt = toDateTime(booking.date, booking.endTime).toISOString();
    }
    return booking;
  };

  const sortBookings = (list) => {
    return [...list].sort((a, b) => {
      const aTime = Number.isFinite(new Date(a.startAt).getTime()) ? new Date(a.startAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = Number.isFinite(new Date(b.startAt).getTime()) ? new Date(b.startAt).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
  };

  const pickBookingAuditFields = (item = {}) => ({
    id: item.id || "",
    roomId: item.roomId || "",
    roomName: item.roomName || "",
    date: item.date || "",
    startTime: item.startTime || "",
    endTime: item.endTime || "",
    requester: item.requester || "",
    requesterEmail: (item.requesterEmail || "").toString().trim().toLowerCase(),
    purpose: item.purpose || "",
    rejectionReason: item.rejectionReason || "",
    status: normalizeStatus(item.status),
    projectMode: item.projectMode || DEFAULT_PROJECT_MODE,
    projectCode: item.projectCode || "",
    projectName: item.projectName || "",
    rescheduleBaseStatus: normalizeStatus(item.rescheduleBaseStatus),
    rescheduleRequestedDate: item.rescheduleRequestedDate || "",
    rescheduleRequestedStartTime: item.rescheduleRequestedStartTime || "",
    rescheduleRequestedEndTime: item.rescheduleRequestedEndTime || "",
    rescheduleRequestReason: item.rescheduleRequestReason || "",
    cancelRequestReason: item.cancelRequestReason || "",
    roomBookingAccess: normalizeRoomBookingAccess(item.roomBookingAccess)
  });

  const getAuditActor = () => {
    const authUser = window.sgcuAuth?.auth?.currentUser || null;
    const email = (authUser?.email || "").toString().trim().toLowerCase();
    return {
      actorUid: authUser?.uid || "",
      actorEmail: email,
      actorRole: isStaffUser() ? "staff" : "member"
    };
  };

  const writeAuditLog = async (action, entityType, entityId, beforeData, afterData, metadata = {}) => {
    if (!hasFirestore) return;
    try {
      const actor = getAuditActor();
      await firestore.addDoc(
        firestore.collection(firestore.db, AUDIT_COLLECTION_NAME),
        {
          action,
          entityType,
          entityId: entityId || "",
          before: beforeData || null,
          after: afterData || null,
          actorUid: actor.actorUid,
          actorEmail: actor.actorEmail,
          actorRole: actor.actorRole,
          source: "web_app",
          metadata: metadata || {},
          timestamp: firestore.serverTimestamp()
        }
      );
    } catch (err) {
      // Keep audit logging non-blocking for booking flow.
    }
  };

  const ensureMeetingStateEl = () => {
    if (meetingStateEl) return meetingStateEl;
    const panelBody = calendarPanelWrap?.querySelector(".panel-body");
    if (!panelBody) return null;
    meetingStateEl = document.createElement("div");
    meetingStateEl.id = "meetingRoomBookingState";
    meetingStateEl.className = "section-text-sm";
    meetingStateEl.hidden = true;
    meetingStateEl.style.marginBottom = "10px";
    panelBody.prepend(meetingStateEl);
    return meetingStateEl;
  };

  const retryMeetingSubscriptions = () => {
    resolveFirestoreBridge();
    if (!hasFirestore) {
      renderMeetingLoadState();
      return;
    }
    if (autoRetryTimer) {
      window.clearTimeout(autoRetryTimer);
      autoRetryTimer = null;
    }
    if (typeof unsubscribe === "function") unsubscribe();
    if (typeof unsubscribeRooms === "function") unsubscribeRooms();
    if (typeof unsubscribeHolidays === "function") unsubscribeHolidays();
    unsubscribe = null;
    unsubscribeRooms = null;
    unsubscribeHolidays = null;
    roomsLoaded = false;
    bookingsLoaded = false;
    roomsLoadFailed = false;
    bookingsLoadFailed = false;
    subscribeRooms();
    subscribeBookings();
    subscribeHolidays();
    renderMeetingLoadState();
  };

  const scheduleMeetingAutoRetry = () => {
    resolveFirestoreBridge();
    if (!hasFirestore) return;
    if (autoRetryTimer) return;
    const attempt = Math.min(autoRetryAttempt, 4);
    const delayMs = Math.min(12000, 1000 * (2 ** attempt));
    autoRetryAttempt += 1;
    autoRetryTimer = window.setTimeout(() => {
      autoRetryTimer = null;
      retryMeetingSubscriptions();
    }, delayMs);
  };

  const clearMeetingAutoRetry = () => {
    if (autoRetryTimer) {
      window.clearTimeout(autoRetryTimer);
      autoRetryTimer = null;
    }
    autoRetryAttempt = 0;
  };

  const renderMeetingLoadState = () => {
    const stateEl = ensureMeetingStateEl();
    if (!stateEl) return;
    if (!hasFirestore) {
      stateEl.hidden = false;
      stateEl.style.color = "#b91c1c";
      stateEl.innerHTML = "ระบบยังไม่เชื่อมต่อ Firestore โปรดตรวจสอบการตั้งค่า";
      return;
    }
    if (!roomsLoaded || !bookingsLoaded) {
      stateEl.hidden = false;
      stateEl.style.color = "#6b7280";
      stateEl.innerHTML = "กำลังโหลดข้อมูลการจองห้องประชุม...";
      return;
    }
    if (roomsLoadFailed || bookingsLoadFailed) {
      stateEl.hidden = false;
      stateEl.style.color = "#b91c1c";
      stateEl.innerHTML = `
        โหลดข้อมูลการจองไม่สำเร็จในขณะนี้
        <button id="meetingRoomRetryButton" type="button" class="btn-ghost" style="margin-left:8px;">ลองใหม่</button>
      `;
      const retryBtn = stateEl.querySelector("#meetingRoomRetryButton");
      if (retryBtn) retryBtn.addEventListener("click", retryMeetingSubscriptions);
      scheduleMeetingAutoRetry();
      return;
    }
    clearMeetingAutoRetry();
    if (!bookings.length) {
      stateEl.hidden = false;
      stateEl.style.color = "#6b7280";
      stateEl.innerHTML = "ยังไม่มีการจองห้องประชุม";
      return;
    }
    stateEl.hidden = true;
    stateEl.innerHTML = "";
  };

  const renderRows = () => {
    const sorted = sortBookings(bookings);
    const now = Date.now();
    const total = sorted.length;
    const upcoming = sorted.filter((item) => new Date(item.startAt).getTime() >= now).length;
    const latest = sorted[sorted.length - 1];

    if (bookingCountEl) bookingCountEl.textContent = String(total);
    if (pendingCountEl) pendingCountEl.textContent = String(upcoming);
    if (latestDateEl) {
      latestDateEl.textContent = latest
        ? `อัปเดตล่าสุด: ${formatDate(latest.date)} ${latest.startTime || ""}-${latest.endTime || ""} (${latest.requester || "ผู้จอง"})`
        : "ยังไม่มีข้อมูล";
    }

    if (tableBody) {
      if (!sorted.length) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5">ยังไม่มีการจอง</td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = sorted
          .map((item) => {
            const projectLine = item.projectMode === "project"
              ? `<div class="meeting-row-meta">โครงการ: ${escapeText(item.projectCode || "-")} ${item.projectName ? `(${escapeText(item.projectName)})` : ""}</div>`
              : "";
            const contactLine = item.contactPhone || item.contactInfo
              ? `<div class="meeting-row-meta">ติดต่อ: ${escapeText(item.contactPhone || "-")}${item.contactInfo ? ` / ${escapeText(item.contactInfo)}` : ""}</div>`
              : "";
            const rejectedLine = item.status === "rejected" && item.rejectionReason
              ? `<div class="meeting-row-meta">เหตุผลไม่อนุมัติ: ${escapeText(item.rejectionReason)}</div>`
              : "";
            return `
              <tr>
                <td>${escapeText(normalizeRoomDisplay(item.roomId, item.roomName))}</td>
                <td>${escapeText(formatDate(item.date))}</td>
                <td>${escapeText(item.startTime || "-")} - ${escapeText(item.endTime || "-")}</td>
                <td>${escapeText(item.requester || "-")}</td>
                <td>
                  ${escapeText(item.purpose || "-")}${projectLine}${contactLine}${rejectedLine}
                </td>
              </tr>
            `;
          })
          .join("");
      }
    }

    renderCalendarOverview();
    renderOwnBookingOptions();
    renderMeetingLoadState();
  };

  const readCurrentUserEmail = () => {
    const email = window.sgcuAuth?.auth?.currentUser?.email || "";
    return email.toString().trim().toLowerCase();
  };

  const parseBookingStartDateTime = (booking) => {
    const startAt = new Date(booking?.startAt || "");
    if (!Number.isNaN(startAt.getTime())) return startAt;
    const date = (booking?.date || "").toString().trim();
    const time = (booking?.startTime || "").toString().trim();
    if (!date || !time) return null;
    const parsed = toDateTime(date, time);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const getNoShowRestriction = (emailValue) => {
    const email = (emailValue || "").toString().trim().toLowerCase();
    if (!email) return { restricted: false, noShowCount: 0, blockedUntil: null };
    const now = Date.now();
    const lookbackMs = NO_SHOW_LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
    const recent = bookings
      .filter((item) => {
        if (normalizeStatus(item.status) !== "no_show") return false;
        const requesterEmail = (item.requesterEmail || "").toString().trim().toLowerCase();
        if (!requesterEmail || requesterEmail !== email) return false;
        const startAt = parseBookingStartDateTime(item);
        if (!startAt) return false;
        return startAt.getTime() >= (now - lookbackMs);
      })
      .sort((a, b) => {
        const aTime = parseBookingStartDateTime(a)?.getTime() || 0;
        const bTime = parseBookingStartDateTime(b)?.getTime() || 0;
        return bTime - aTime;
      });
    if (recent.length < NO_SHOW_BLOCK_THRESHOLD) {
      return { restricted: false, noShowCount: recent.length, blockedUntil: null };
    }
    const latestStart = parseBookingStartDateTime(recent[0]);
    if (!latestStart) {
      return { restricted: false, noShowCount: recent.length, blockedUntil: null };
    }
    const blockedUntil = new Date(latestStart.getTime() + (NO_SHOW_BLOCK_DAYS * 24 * 60 * 60 * 1000));
    return {
      restricted: blockedUntil.getTime() > now,
      noShowCount: recent.length,
      blockedUntil
    };
  };

  const isStaffUser = () => {
    if (typeof staffAuthUser !== "undefined" && !!staffAuthUser) return true;
    const email = readCurrentUserEmail();
    if (!email) return false;
    if (typeof getStaffProfileByEmail === "function") {
      return !!getStaffProfileByEmail(email);
    }
    if (typeof staffEmails !== "undefined" && staffEmails instanceof Set) {
      return staffEmails.has(email);
    }
    return false;
  };

  const ownCancelableBookings = () => {
    if (!currentUserEmail) return [];
    return sortBookings(bookings).filter((item) => {
      const status = (item.status || "").toString().toLowerCase();
      if (status === "rejected" || status === "cancel_requested" || status === "reschedule_requested" || status === "no_show") return false;
      const email = (item.requesterEmail || "").toString().trim().toLowerCase();
      return !!email && email === currentUserEmail;
    });
  };

  const ownReschedulableBookings = () => {
    if (!currentUserEmail) return [];
    return sortBookings(bookings).filter((item) => {
      const status = (item.status || "").toString().toLowerCase();
      if (status === "rejected" || status === "cancel_requested" || status === "reschedule_requested" || status === "no_show") return false;
      const email = (item.requesterEmail || "").toString().trim().toLowerCase();
      return !!email && email === currentUserEmail;
    });
  };

  const renderOwnBookingOptions = () => {
    if (!cancelBookingSelect) return;
    const selected = cancelBookingSelect.value;
    const list = ownCancelableBookings();
    cancelBookingSelect.innerHTML = `
      <option value="">เลือกคำขอที่ต้องการยกเลิก</option>
    `;
    list.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      const room = normalizeRoomDisplay(item.roomId, item.roomName);
      option.textContent = `${formatDate(item.date)} ${item.startTime || "-"}-${item.endTime || "-"} | ${room} | ${item.purpose || "-"}`;
      option.selected = selected === item.id;
      cancelBookingSelect.appendChild(option);
    });
    cancelBookingSelect.disabled = !currentUserEmail || !list.length;

    if (!rescheduleBookingSelect) return;
    const selectedReschedule = rescheduleBookingSelect.value;
    const rescheduleList = ownReschedulableBookings();
    rescheduleBookingSelect.innerHTML = `
      <option value="">เลือกรายการที่ต้องการขอเปลี่ยนเวลา</option>
    `;
    rescheduleList.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      const room = normalizeRoomDisplay(item.roomId, item.roomName);
      option.textContent = `${formatDate(item.date)} ${item.startTime || "-"}-${item.endTime || "-"} | ${room} | ${item.purpose || "-"}`;
      option.selected = selectedReschedule === item.id;
      rescheduleBookingSelect.appendChild(option);
    });
    rescheduleBookingSelect.disabled = !currentUserEmail || !rescheduleList.length;
  };

  const getCalendarMonthState = (dateLike = new Date()) => {
    const cursorDate = new Date(dateLike);
    return {
      year: cursorDate.getFullYear(),
      month: cursorDate.getMonth(),
      firstDay: new Date(cursorDate.getFullYear(), cursorDate.getMonth(), 1)
    };
  };

  const startCalendar = () => {
    const baseDate = dateInput?.value ? new Date(`${dateInput.value}T00:00:00`) : new Date();
    calendarCursor = getCalendarMonthState(baseDate).firstDay;
  };

  const formatCalendarTitle = (dateLike) => {
    const current = new Date(dateLike.getFullYear(), dateLike.getMonth(), 1);
    return `ปฏิทินจองห้องประชุม — ${MONTH_NAMES_TH[current.getMonth()]} ${current.getFullYear()}`;
  };

  const getMeetingCalendarMaxEvents = () => {
    if (window.matchMedia && window.matchMedia("(max-width: 640px)").matches) return 2;
    if (window.matchMedia && window.matchMedia("(max-width: 860px)").matches) return 3;
    return 4;
  };

  const toDateKey = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const DEFAULT_THAI_PUBLIC_HOLIDAYS = [
    { md: "01-01", name: "วันขึ้นปีใหม่" },
    { md: "04-06", name: "วันจักรี" },
    { md: "04-13", name: "วันสงกรานต์" },
    { md: "04-14", name: "วันสงกรานต์" },
    { md: "04-15", name: "วันสงกรานต์" },
    { md: "05-01", name: "วันแรงงานแห่งชาติ" },
    { md: "05-04", name: "วันฉัตรมงคล" },
    { md: "06-03", name: "วันเฉลิมพระชนมพรรษาสมเด็จพระราชินี" },
    { md: "07-28", name: "วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว" },
    { md: "08-12", name: "วันแม่แห่งชาติ" },
    { md: "10-13", name: "วันนวมินทรมหาราช" },
    { md: "10-23", name: "วันปิยมหาราช" },
    { md: "12-05", name: "วันพ่อแห่งชาติ" },
    { md: "12-10", name: "วันรัฐธรรมนูญ" },
    { md: "12-31", name: "วันสิ้นปี" }
  ];

  const getHolidayYears = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  };

  const readHolidayLookup = () => {
    const map = new Map();
    getHolidayYears().forEach((year) => {
      DEFAULT_THAI_PUBLIC_HOLIDAYS.forEach((item) => {
        map.set(`${year}-${item.md}`, item.name);
      });
    });
    const source = window.sgcuHolidayData;
    if (Array.isArray(source)) {
      source.forEach((item) => {
        const date = (item?.date || "").toString().trim();
        if (!date) return;
        const name = (item?.name || item?.title || "วันหยุด").toString().trim() || "วันหยุด";
        map.set(date, name);
      });
    }
    return map;
  };

  const defaultHolidayLookup = readHolidayLookup();
  let holidayLookup = new Map(defaultHolidayLookup);

  const refreshHolidayLookup = (customHolidays = []) => {
    holidayLookup = new Map(defaultHolidayLookup);
    customHolidays.forEach((item) => {
      if (!item?.date) return;
      const name = (item.name || "").toString().trim() || "วันหยุด";
      holidayLookup.set(item.date, name);
    });
  };

  const getHolidayName = (date, dateKey) => {
    const explicit = holidayLookup.get(dateKey);
    if (explicit) return explicit;
    const day = date.getDay();
    if (day === 0) return "วันหยุดสุดสัปดาห์";
    return "";
  };

  const safeStatus = (status) => {
    if (status === "approved") return "approved";
    if (status === "rejected") return "rejected";
    if (status === "cancel_requested") return "cancel_requested";
    if (status === "reschedule_requested") return "reschedule_requested";
    if (status === "no_show") return "no_show";
    return "pending";
  };

  const calendarStatusClass = (status) => {
    const normalized = safeStatus(status);
    if (normalized === "approved") return "approved";
    if (normalized === "rejected") return "cancelled";
    if (normalized === "cancel_requested" || normalized === "reschedule_requested" || normalized === "no_show") return "cancel-requested";
    return "pending";
  };

  const statusText = (status) => {
    const normalized = safeStatus(status);
    if (normalized === "approved") return "อนุมัติแล้ว";
    if (normalized === "rejected") return "ไม่อนุมัติ / ยกเลิกแล้ว";
    if (normalized === "cancel_requested") return "ขอยกเลิก (รออนุมัติ)";
    if (normalized === "reschedule_requested") return "ขอเปลี่ยนเวลา (รออนุมัติ)";
    if (normalized === "no_show") return "ไม่มาใช้ห้อง (No-show)";
    return "รออนุมัติ";
  };

  const statusBadgeClass = (status) => {
    const normalized = safeStatus(status);
    if (normalized === "approved") return "badge-approved";
    if (normalized === "rejected") return "badge-rejected";
    if (normalized === "cancel_requested" || normalized === "reschedule_requested" || normalized === "no_show") return "badge-warning";
    return "badge-pending";
  };

  const getStatusOptionLabel = (value) => {
    if (value === "approved") return "อนุมัติแล้ว";
    if (value === "rejected") return "ไม่อนุมัติ";
    if (value === "cancel_requested") return "ขอยกเลิก";
    if (value === "reschedule_requested") return "ขอเปลี่ยนเวลา";
    if (value === "no_show") return "ไม่มาใช้ห้อง (No-show)";
    if (value === "pending") return "รออนุมัติ";
    return value;
  };

  const statusSelectClass = (value) => {
    if (value === "approved") return "is-approved";
    if (value === "rejected") return "is-rejected";
    if (value === "cancel_requested" || value === "reschedule_requested" || value === "no_show") return "is-cancel-requested";
    return "is-pending";
  };

  const canEditBookingStatusInModal = (options = {}) => {
    if (!hasFirestore) return false;
    if (options.allowStatusEdit === true) return true;
    return isStaffUser();
  };

  const setBookingDetailStatusMessage = (text = "", color = "#374151") => {
    if (!bookingDetailBodyEl) return;
    const messageEl = bookingDetailBodyEl.querySelector("#meetingBookingDetailStatusMessage");
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.style.color = color;
  };

  const askRejectionReason = async (initialValue = "") => {
    const fallbackPrompt = () => {
      if (typeof window.prompt !== "function") return null;
      const input = window.prompt("กรุณาระบุเหตุผลที่ไม่อนุมัติ", initialValue || "");
      const reason = (input || "").toString().trim();
      return reason || null;
    };
    if (
      !rejectReasonModalEl ||
      !rejectReasonInputEl ||
      !rejectReasonErrorEl ||
      !rejectReasonSubmitEl ||
      !rejectReasonCancelEl ||
      !rejectReasonCloseEl ||
      typeof openDialog !== "function" ||
      typeof closeDialog !== "function"
    ) {
      return fallbackPrompt();
    }

    return new Promise((resolve) => {
      let settled = false;
      const done = (value) => {
        if (settled) return;
        settled = true;
        rejectReasonSubmitEl.removeEventListener("click", onSubmit);
        rejectReasonCancelEl.removeEventListener("click", onCancel);
        rejectReasonCloseEl.removeEventListener("click", onCancel);
        rejectReasonModalEl.removeEventListener("click", onBackdropClick);
        rejectReasonInputEl.removeEventListener("keydown", onKeydown);
        resolve(value);
      };
      const onSubmit = () => {
        const reason = (rejectReasonInputEl.value || "").toString().trim();
        if (!reason) {
          rejectReasonErrorEl.textContent = "กรุณาระบุเหตุผลที่ไม่อนุมัติ";
          rejectReasonInputEl.focus();
          return;
        }
        rejectReasonErrorEl.textContent = "";
        closeDialog(rejectReasonModalEl);
        done(reason);
      };
      const onCancel = () => {
        rejectReasonErrorEl.textContent = "";
        closeDialog(rejectReasonModalEl);
        done(null);
      };
      const onBackdropClick = (event) => {
        if (event.target === rejectReasonModalEl) {
          onCancel();
        }
      };
      const onKeydown = (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onCancel();
        }
      };

      rejectReasonInputEl.value = (initialValue || "").toString();
      rejectReasonErrorEl.textContent = "";
      rejectReasonSubmitEl.addEventListener("click", onSubmit);
      rejectReasonCancelEl.addEventListener("click", onCancel);
      rejectReasonCloseEl.addEventListener("click", onCancel);
      rejectReasonModalEl.addEventListener("click", onBackdropClick);
      rejectReasonInputEl.addEventListener("keydown", onKeydown);
      openDialog(rejectReasonModalEl, { focusSelector: "#meetingRejectReasonInput" });
      window.setTimeout(() => {
        rejectReasonInputEl.focus();
        rejectReasonInputEl.select();
      }, 0);
    });
  };

  const applyStatusByIdFromModal = async (bookingId, nextStatus) => {
    if (!hasFirestore || !bookingId) return;
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) {
      setBookingDetailStatusMessage("ไม่พบรายการจองนี้", "#b91c1c");
      return;
    }
    if (!["pending", "approved", "rejected", "cancel_requested", "reschedule_requested", "no_show"].includes(nextStatus)) {
      setBookingDetailStatusMessage("สถานะที่เลือกไม่ถูกต้อง", "#b91c1c");
      return;
    }
    if (booking.status === nextStatus) {
      setBookingDetailStatusMessage("สถานะยังเหมือนเดิม", "#6b7280");
      return;
    }
    const payload = {
      status: nextStatus,
      updatedAt: firestore.serverTimestamp()
    };
    if (nextStatus === "no_show") {
      payload.status = "rejected";
      payload.rejectionReason = buildNoShowReason(booking.rejectionReason || "");
    }
    if (booking.status !== "reschedule_requested" && nextStatus === "rejected") {
      let rejectionReason = (await askRejectionReason(booking.rejectionReason || "")) || "";
      if (!rejectionReason) {
        setBookingDetailStatusMessage("กรุณาระบุเหตุผลที่ไม่อนุมัติ", "#b91c1c");
        return;
      }
      payload.rejectionReason = rejectionReason;
    }
    if (nextStatus !== "rejected" && nextStatus !== "no_show") {
      payload.rejectionReason = "";
    }
    if (booking.status === "reschedule_requested" && nextStatus === "approved") {
      const nextDate = booking.rescheduleRequestedDate || "";
      const nextStartTime = booking.rescheduleRequestedStartTime || "";
      const nextEndTime = booking.rescheduleRequestedEndTime || "";
      if (!nextDate || !nextStartTime || !nextEndTime) {
        setBookingDetailStatusMessage("ไม่พบวัน/เวลาใหม่ที่ขอเปลี่ยน", "#b91c1c");
        return;
      }
      const candidate = {
        roomId: booking.roomId,
        date: nextDate,
        startTime: nextStartTime,
        endTime: nextEndTime
      };
      if (hasOverlap(candidate, bookings, { ignoredBookingId: bookingId })) {
        const roomName = normalizeRoomDisplay(booking.roomId, booking.roomName);
        setBookingDetailStatusMessage(
          `อนุมัติเปลี่ยนเวลาไม่ได้เพราะชนเวลา (${roomName} ${formatDate(nextDate)} ${nextStartTime}-${nextEndTime})`,
          "#b91c1c"
        );
        return;
      }
      payload.status = "approved";
      payload.date = nextDate;
      payload.startTime = nextStartTime;
      payload.endTime = nextEndTime;
      payload.startAt = toDateTime(nextDate, nextStartTime).toISOString();
      payload.endAt = toDateTime(nextDate, nextEndTime).toISOString();
      payload.rescheduleBaseStatus = "";
      payload.rescheduleRequestedDate = "";
      payload.rescheduleRequestedStartTime = "";
      payload.rescheduleRequestedEndTime = "";
      payload.rescheduleRequestReason = "";
    }
    if (booking.status === "reschedule_requested" && nextStatus === "rejected") {
      payload.status = normalizeStatus(booking.rescheduleBaseStatus || "approved");
      payload.rescheduleBaseStatus = "";
      payload.rescheduleRequestedDate = "";
      payload.rescheduleRequestedStartTime = "";
      payload.rescheduleRequestedEndTime = "";
      payload.rescheduleRequestReason = "";
      payload.rejectionReason = "";
    }
    try {
      await firestore.updateDoc(
        firestore.doc(firestore.db, BOOKING_COLLECTION_NAME, bookingId),
        payload
      );
      await writeAuditLog(
        "booking.status_updated",
        "meetingRoomBooking",
        bookingId,
        pickBookingAuditFields(booking),
        pickBookingAuditFields({ ...booking, ...payload }),
        { context: "booking_detail_modal" }
      );
      setBookingDetailStatusMessage("อัปเดตสถานะคำขอเรียบร้อยแล้ว", "#047857");
    } catch (err) {
      const code = (err?.code || "").toString().trim();
      if (code === "permission-denied") {
        setBookingDetailStatusMessage(
          "ไม่มีสิทธิ์อัปเดตสถานะนี้ (ตรวจสอบสิทธิ์บัญชี Staff และ Firestore Rules)",
          "#b91c1c"
        );
        return;
      }
      setBookingDetailStatusMessage("ไม่สามารถอัปเดตสถานะคำขอได้ในขณะนี้", "#b91c1c");
    }
  };

  const setBookingDetailBody = (booking, options = {}) => {
    const includeContact = !!options.includeContact;
    const allowStatusEdit = canEditBookingStatusInModal(options);
    if (!bookingDetailBodyEl) return;
    if (!booking) {
      bookingDetailBodyEl.innerHTML = '<div class="section-text-sm">ไม่พบรายละเอียดรายการจอง</div>';
      return;
    }
    const projectText = booking.projectMode === "project"
      ? `${booking.projectCode || "-"}${booking.projectName ? ` (${booking.projectName})` : ""}`
      : "ประชุมทั่วไป";
    const cancelReason = booking.cancelRequestReason || "-";
    const rescheduleReason = booking.rescheduleRequestReason || "-";
    const rejectionReason = booking.rejectionReason || "-";
    const requestedDate = booking.rescheduleRequestedDate || "-";
    const requestedTime = booking.rescheduleRequestedDate
      ? `${booking.rescheduleRequestedStartTime || "-"} - ${booking.rescheduleRequestedEndTime || "-"}`
      : "-";
    const contactText = [booking.contactPhone, booking.contactInfo]
      .filter((value) => (value || "").toString().trim())
      .join(" / ") || "-";
    const roomText = normalizeRoomDisplay(booking.roomId, booking.roomName);
    const dateText = formatDate(booking.date);
    const timeText = `${booking.startTime || "-"} - ${booking.endTime || "-"}`;
    const rows = [
      ["ผู้ขอ", booking.requester || "-"],
      ["ประเภทคำขอ", projectText],
      ["วัตถุประสงค์", booking.purpose || "-"]
    ];
    if (includeContact) {
      rows.push(["ข้อมูลติดต่อ", contactText]);
    }
    if (cancelReason !== "-") rows.push(["เหตุผลขอยกเลิก", cancelReason]);
    if (rejectionReason !== "-") rows.push(["เหตุผลไม่อนุมัติ", rejectionReason]);
    if (requestedDate !== "-") rows.push(["วันที่ใหม่ที่ขอ", formatDate(requestedDate)]);
    if (requestedTime !== "-") rows.push(["เวลาใหม่ที่ขอ", requestedTime]);
    if (rescheduleReason !== "-") rows.push(["เหตุผลขอเปลี่ยนเวลา", rescheduleReason]);
    const selectOptions = [
      "pending",
      "approved",
      "rejected",
      "cancel_requested",
      "no_show",
      ...(booking.status === "reschedule_requested" ? ["reschedule_requested"] : [])
    ];
    bookingDetailBodyEl.innerHTML = `
      <div class="meeting-booking-detail-shell">
        <div class="meeting-booking-detail-summary">
          <div class="meeting-booking-summary-item">
            <div class="meeting-booking-summary-label">ห้องประชุม</div>
            <div class="meeting-booking-summary-value">${escapeText(roomText)}</div>
          </div>
          <div class="meeting-booking-summary-item">
            <div class="meeting-booking-summary-label">วันที่</div>
            <div class="meeting-booking-summary-value">${escapeText(dateText)}</div>
          </div>
          <div class="meeting-booking-summary-item">
            <div class="meeting-booking-summary-label">เวลา</div>
            <div class="meeting-booking-summary-value">${escapeText(timeText)}</div>
          </div>
          <div class="meeting-booking-summary-item">
            <div class="meeting-booking-summary-label">สถานะ</div>
            <div class="meeting-booking-summary-value">
              <span class="status-pill ${statusBadgeClass(booking.status)}">${escapeText(statusText(booking.status))}</span>
            </div>
          </div>
        </div>
        <div class="meeting-booking-detail-grid">
          ${rows.map(([label, value]) => `
            <div class="meeting-booking-detail-item">
              <div class="meeting-booking-detail-label">${escapeText(label)}</div>
              <div class="meeting-booking-detail-value">${escapeText(value)}</div>
            </div>
          `).join("")}
        </div>
      </div>
      ${allowStatusEdit
        ? `
          <div class="modal-actions">
            <select
              id="meetingBookingDetailStatusSelect"
              class="staff-status-select ${statusSelectClass(booking.status)}"
              aria-label="ปรับสถานะคำขอ"
            >
              ${selectOptions.map((statusValue) => `
                <option value="${statusValue}" ${booking.status === statusValue ? "selected" : ""}>
                  ${getStatusOptionLabel(statusValue)}
                </option>
              `).join("")}
            </select>
            <button id="meetingBookingDetailStatusApply" type="button" class="btn-primary">บันทึกสถานะ</button>
          </div>
          <div id="meetingBookingDetailStatusMessage" class="section-text-sm" aria-live="polite"></div>
        `
        : ""
      }
    `;
  };

  const openBookingDetailModal = (bookingOrId, options = {}) => {
    const booking = typeof bookingOrId === "string"
      ? bookings.find((item) => item.id === bookingOrId)
      : bookingOrId;
    if (bookingDetailTitleEl) {
      bookingDetailTitleEl.textContent = "รายละเอียดการจองห้องประชุม";
    }
    activeDetailBookingId = booking?.id || "";
    activeDetailOptions = options || {};
    setBookingDetailBody(booking || null, options);
    if (bookingDetailModalEl && typeof openDialog === "function") {
      openDialog(bookingDetailModalEl, { focusSelector: "#meetingBookingDetailClose" });
    }
  };

  const openDayBookingListModal = (dateText, options = {}) => {
    if (!bookingDetailBodyEl) return;
    const sourceBookings = Array.isArray(options.sourceBookings) ? options.sourceBookings : bookings;
    const titlePrefix = (options.titlePrefix || "รายการจองวันที่").toString().trim() || "รายการจองวันที่";
    const dayBookings = sortBookings(sourceBookings).filter((item) => item.date === dateText);
    if (bookingDetailTitleEl) {
      bookingDetailTitleEl.textContent = `${titlePrefix} ${formatDate(dateText)}`;
    }
    activeDetailBookingId = "";
    activeDetailOptions = {};
    if (!dayBookings.length) {
      bookingDetailBodyEl.innerHTML = '<div class="section-text-sm">ยังไม่มีรายการจองในวันนี้</div>';
    } else {
      bookingDetailBodyEl.innerHTML = `
        <div class="meeting-day-list-summary">
          <span class="meeting-day-list-count">ทั้งหมด ${dayBookings.length} รายการ</span>
        </div>
        <div class="meeting-day-list">
          ${dayBookings.map((item, index) => `
            <div class="meeting-day-list-card">
              <div class="meeting-day-list-card-head">
                <div class="meeting-day-list-card-index">รายการ ${index + 1}</div>
                <span class="badge ${statusBadgeClass(item.status)}">${escapeText(statusText(item.status))}</span>
              </div>
              <div class="meeting-day-list-card-main">
                <div class="meeting-day-list-time">${escapeText(`${item.startTime || "-"} - ${item.endTime || "-"}`)}</div>
                <div class="meeting-day-list-room">${escapeText(normalizeRoomDisplay(item.roomId, item.roomName))}</div>
              </div>
              <div class="meeting-day-list-meta">
                <div class="meeting-day-list-meta-row">
                  <span class="meeting-day-list-meta-label">ผู้ขอ</span>
                  <span class="meeting-day-list-meta-value">${escapeText(item.requester || "-")}</span>
                </div>
                <div class="meeting-day-list-meta-row">
                  <span class="meeting-day-list-meta-label">วัตถุประสงค์</span>
                  <span class="meeting-day-list-meta-value">${escapeText(item.purpose || "-")}</span>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }
    if (bookingDetailModalEl && typeof openDialog === "function") {
      openDialog(bookingDetailModalEl, { focusSelector: "#meetingBookingDetailClose" });
    }
  };

  const closeBookingDetailModal = () => {
    activeDetailBookingId = "";
    activeDetailOptions = {};
    if (bookingDetailModalEl && typeof closeDialog === "function") {
      closeDialog(bookingDetailModalEl);
    }
  };

  const getDayBookings = (dateText = "") => {
    if (!dateText) return [];
    return sortBookings(bookings.filter((item) => item.date === dateText));
  };

  const formatLongDate = (dateText = "") => {
    if (!dateText) return "-";
    const parsed = new Date(`${dateText}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return dateText;
    return parsed.toLocaleDateString("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const setBookingDayBody = (dateText = "") => {
    if (!bookingDayModalBodyEl || !bookingDayModalTitleEl) return;
    const items = getDayBookings(dateText);
    bookingDayModalTitleEl.textContent = `รายการจองวันที่ ${formatLongDate(dateText)} (${items.length} รายการ)`;
    if (!items.length) {
      bookingDayModalBodyEl.innerHTML = '<div class="section-text-sm">ไม่มีรายการจองในวันที่เลือก</div>';
      return;
    }
    bookingDayModalBodyEl.innerHTML = `
      <div class="modal-table-wrap">
        <table class="modal-table">
          <thead>
            <tr>
              <th>เวลา</th>
              <th>ห้อง</th>
              <th>ผู้ขอ</th>
              <th>วัตถุประสงค์</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item) => `
              <tr data-booking-id="${escapeText(item.id || "")}">
                <td>${escapeText(`${item.startTime || "-"} - ${item.endTime || "-"}`)}</td>
                <td>${escapeText(normalizeRoomDisplay(item.roomId, item.roomName))}</td>
                <td>${escapeText(item.requester || "-")}</td>
                <td>${escapeText(item.purpose || "-")}${item.status === "rejected" && item.rejectionReason ? `<div class="meeting-row-meta">เหตุผลไม่อนุมัติ: ${escapeText(item.rejectionReason)}</div>` : ""}</td>
                <td>
                  <span class="status-pill ${statusBadgeClass(item.status)}">${escapeText(statusText(item.status))}</span>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <div class="section-text-sm" style="margin-top:8px;color:#6b7280;">คลิกแถวเพื่อดูรายละเอียดรายการจอง</div>
    `;
  };

  const openBookingDayModal = (dateText = "") => {
    if (!dateText || !bookingDayModalEl || typeof openDialog !== "function") return;
    activeDayModalDate = dateText;
    setBookingDayBody(dateText);
    openDialog(bookingDayModalEl, { focusSelector: "#meetingBookingDayClose" });
  };

  const closeBookingDayModal = () => {
    activeDayModalDate = "";
    if (bookingDayModalEl && typeof closeDialog === "function") {
      closeDialog(bookingDayModalEl);
    }
  };

  const setCalendarCursorFromDate = (dateText = "") => {
    if (!dateText) return;
    const parsed = new Date(`${dateText}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return;
    calendarCursor = getCalendarMonthState(parsed).firstDay;
  };

  const updateMeetingRoomView = (mode = "calendar") => {
    meetingRoomActiveView = "calendar";

    if (calendarPanelWrap) {
      calendarPanelWrap.style.display = "";
    }
    if (listPanel) {
      listPanel.style.display = "none";
    }

    renderCalendarOverview();
  };

  const escapeText = (text) => {
    const safe = String(text || "");
    return safe
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  };

  const renderCalendarOverview = () => {
    if (!calendarPanel) return;

    const selectedMonthStart = getCalendarMonthState(calendarCursor);
    const daysInMonth = new Date(selectedMonthStart.year, selectedMonthStart.month + 1, 0).getDate();
    const monthBookings = bookings
      .filter((item) => {
        if (!item.date || item.status === "rejected") return false;
        const date = new Date(`${item.date}T00:00:00`);
        if (Number.isNaN(date.getTime())) return false;
        return date.getFullYear() === selectedMonthStart.year && date.getMonth() === selectedMonthStart.month;
      })
      .reduce((acc, item) => {
        if (!acc[item.date]) acc[item.date] = [];
        acc[item.date].push(item);
        return acc;
      }, {});

    Object.values(monthBookings).forEach((items) => {
      items.sort((a, b) => {
        const at = a.startTime || "00:00";
        const bt = b.startTime || "00:00";
        return at.localeCompare(bt);
      });
    });

    if (calendarTitle) {
      calendarTitle.textContent = formatCalendarTitle(selectedMonthStart.firstDay);
    }

    const todayKey = toDateKey(new Date());
    const maxEvents = getMeetingCalendarMaxEvents();
    const cells = [];

    // ช่องว่างก่อนวันที่ 1 ของเดือน (ให้ตรงวันในสัปดาห์)
    for (let i = 0; i < selectedMonthStart.firstDay.getDay(); i++) {
      cells.push(`<div class="calendar-day calendar-day-empty"></div>`);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedMonthStart.year, selectedMonthStart.month, day);
      const dateKey = toDateKey(date);
      const items = monthBookings[dateKey] || [];
      const visibleItems = items.slice(0, maxEvents);
      const remainingCount = items.length - maxEvents;
      const isToday = dateKey === todayKey;
      const holidayName = getHolidayName(date, dateKey);
      const isHoliday = !!holidayName;
      const todayBadge = isToday
        ? `<span class="calendar-today-pill">วันนี้</span>`
        : "";
      const holidayBadge = isHoliday
        ? `<span class="calendar-holiday-pill" title="${escapeText(holidayName)}">วันหยุด</span>`
        : "";

      const eventRows = visibleItems
        .map((item) => {
          const roomName = normalizeRoomDisplay(item.roomId, item.roomName);
          return `<div class="calendar-event ${calendarStatusClass(item.status)}" data-booking-id="${escapeText(item.id || "")}" title="${escapeText(
            `${roomName} · ${item.startTime || "-"}-${item.endTime || "-"} · ${item.requester || "-"}`
          )}">
            ${escapeText(`${item.startTime || "-"}-${item.endTime || "-"} ${roomName}`)}
          </div>`;
        })
        .join("");

      const moreText = remainingCount > 0
        ? `<div class="calendar-event calendar-more">และอีก ${remainingCount} คำขอ</div>`
        : "";

      const className = ["calendar-day"];
      if (isToday) className.push("calendar-day-today");
      if (items.length) className.push("calendar-day-has-events");
      if (isHoliday) className.push("calendar-day-holiday");

      cells.push(`
        <div class="${className.join(" ")}" data-date="${dateKey}">
          <div class="calendar-day-header">
            ${day}${todayBadge}${holidayBadge}
          </div>
          ${eventRows}
          ${moreText}
        </div>
      `);
    }

    calendarPanel.innerHTML = cells.join("");
  };

  const normalizeLocalPayload = (item, overrides = {}) => ({
    ...buildStorageBooking(item),
    ...overrides
  });

  const migrateLocalStorageToFirestore = async () => {
    if (!hasFirestore || hasMigrated) return;
    hasMigrated = true;
    const already = window.localStorage?.getItem(LOCAL_MIGRATED_KEY) === "1";
    if (already) return;

    if (bookings.length > 0) {
      window.localStorage?.setItem(LOCAL_MIGRATED_KEY, "1");
      return;
    }

    try {
      const raw = window.localStorage?.getItem(STORAGE_KEY);
      if (!raw) {
        window.localStorage?.setItem(LOCAL_MIGRATED_KEY, "1");
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.length) {
        window.localStorage?.setItem(LOCAL_MIGRATED_KEY, "1");
        return;
      }

      for (const item of parsed) {
        const payload = normalizeLocalPayload(item);
        if (!payload.roomId || !payload.date || !payload.startTime || !payload.endTime || !payload.requester || !payload.purpose) {
          continue;
        }
        const room = normalizeRoomDisplay(payload.roomId, payload.roomName);
        await firestore.addDoc(
          firestore.collection(firestore.db, BOOKING_COLLECTION_NAME),
          {
            roomId: payload.roomId,
            roomName: room,
            date: payload.date,
            startTime: payload.startTime,
            endTime: payload.endTime,
            requester: payload.requester,
            requesterEmail: payload.requesterEmail || "",
            purpose: payload.purpose,
            contactPhone: payload.contactPhone || "",
            contactInfo: payload.contactInfo || "",
            projectMode: payload.projectMode || DEFAULT_PROJECT_MODE,
            projectCode: payload.projectCode || "",
            projectName: payload.projectName || "",
            roomBookingAccess: normalizeRoomBookingAccess(payload.roomBookingAccess),
            rescheduleBaseStatus: normalizeStatus(payload.rescheduleBaseStatus),
            rescheduleRequestedDate: payload.rescheduleRequestedDate || "",
            rescheduleRequestedStartTime: payload.rescheduleRequestedStartTime || "",
            rescheduleRequestedEndTime: payload.rescheduleRequestedEndTime || "",
            rescheduleRequestReason: payload.rescheduleRequestReason || "",
            status: normalizeStatus(payload.status),
            startAt: payload.startAt || toDateTime(payload.date, payload.startTime).toISOString(),
            endAt: payload.endAt || toDateTime(payload.date, payload.endTime).toISOString(),
            createdAt: firestore.serverTimestamp(),
            updatedAt: firestore.serverTimestamp(),
            migratedFromLocal: true
          }
        );
      }

      window.localStorage?.setItem(LOCAL_MIGRATED_KEY, "1");
    } catch (err) {
      // keep key untouched if migrate fails so user can retry
      hasMigrated = false;
    }
  };

  const setupRoomOptions = () => {
    const selectedRoomId = roomSelect.value;
    roomSelect.innerHTML = `
      <option value="" disabled ${selectedRoomId ? "" : "selected"}>เลือกห้องประชุม</option>
    `;
    meetingRooms.forEach((room) => {
      const bookingAccess = normalizeRoomBookingAccess(room.bookingAccess);
      const isStaffOnly = bookingAccess === "staff_only";
      const option = document.createElement("option");
      option.value = room.id;
      option.textContent = isStaffOnly ? `${room.name} (สตาฟจองเท่านั้น)` : room.name;
      option.selected = selectedRoomId === room.id;
      roomSelect.appendChild(option);
    });
  };

  const subscribeRooms = () => {
    if (!hasFirestore) {
      roomsLoaded = true;
      roomsLoadFailed = true;
      setupRoomOptions();
      renderRows();
      return;
    }
    try {
      const colRef = firestore.collection(firestore.db, ROOM_COLLECTION_NAME);
      unsubscribeRooms = firestore.onSnapshot(
        colRef,
        (snapshot) => {
          const loadedRooms = snapshot.docs
            .map((docItem) => {
              const data = docItem.data() || {};
              const name = (data.name || "").toString().trim();
              if (!name) return null;
              return {
                id: docItem.id,
                name,
                bookingAccess: normalizeRoomBookingAccess(data.bookingAccess)
              };
            })
            .filter(Boolean)
            .sort((a, b) => a.name.localeCompare(b.name, "th"));
          meetingRooms = loadedRooms.length ? loadedRooms : [...DEFAULT_MEETING_ROOMS];
          roomsLoaded = true;
          roomsLoadFailed = false;
          setupRoomOptions();
          renderRows();
          renderCalendarOverview();
        },
        (err) => {
          const code = (err?.code || "").toString().trim();
          const currentUserEmail = readCurrentUserEmail();
          if (code === "permission-denied" && !currentUserEmail) {
            roomsLoaded = false;
            roomsLoadFailed = false;
            setMessage("กำลังตรวจสอบสิทธิ์การเข้าถึงข้อมูล...", "#6b7280");
            renderMeetingLoadState();
            scheduleMeetingAutoRetry();
            return;
          }
          meetingRooms = [...DEFAULT_MEETING_ROOMS];
          roomsLoaded = true;
          roomsLoadFailed = true;
          setupRoomOptions();
          renderRows();
          renderCalendarOverview();
          scheduleMeetingAutoRetry();
        }
      );
    } catch (err) {
      meetingRooms = [...DEFAULT_MEETING_ROOMS];
      roomsLoaded = true;
      roomsLoadFailed = true;
      setupRoomOptions();
      renderRows();
      renderCalendarOverview();
      scheduleMeetingAutoRetry();
    }
  };

  const setMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateInput.min = today.toISOString().slice(0, 10);
    if (!dateInput.value) {
      dateInput.value = dateInput.min;
    }
    if (rescheduleDateInput) {
      rescheduleDateInput.min = dateInput.min;
    }
  };

  const subscribeBookings = () => {
    if (!hasFirestore) {
      bookingsLoaded = true;
      bookingsLoadFailed = true;
      renderMeetingLoadState();
      return;
    }
    try {
      const colRef = firestore.collection(firestore.db, BOOKING_COLLECTION_NAME);
      unsubscribe = firestore.onSnapshot(
        colRef,
        (snapshot) => {
          bookings = snapshot.docs.map(mapSnapshotDoc);
          bookingsLoaded = true;
          bookingsLoadFailed = false;
          renderRows();
          if (activeDayModalDate) {
            setBookingDayBody(activeDayModalDate);
          }
          if (!window.localStorage?.getItem(LOCAL_MIGRATED_KEY) && !hasMigrated) {
            void migrateLocalStorageToFirestore();
          }
        },
        (err) => {
          const code = (err?.code || "").toString().trim();
          const currentUserEmail = readCurrentUserEmail();
          if (code === "permission-denied" && !currentUserEmail) {
            bookingsLoaded = false;
            bookingsLoadFailed = false;
            setMessage("กำลังตรวจสอบสิทธิ์การเข้าถึงข้อมูล...", "#6b7280");
            renderMeetingLoadState();
            scheduleMeetingAutoRetry();
            return;
          }
          bookingsLoaded = true;
          bookingsLoadFailed = true;
          setMessage("เกิดปัญหาการดึงข้อมูลการจอง", "#b91c1c");
          renderMeetingLoadState();
          scheduleMeetingAutoRetry();
        }
      );
    } catch (err) {
      bookingsLoaded = true;
      bookingsLoadFailed = true;
      setMessage("ไม่สามารถเชื่อมต่อ Firestore ได้", "#b91c1c");
      renderMeetingLoadState();
      scheduleMeetingAutoRetry();
    }
  };

  const subscribeHolidays = () => {
    if (!hasFirestore) return;
    try {
      const colRef = firestore.collection(firestore.db, HOLIDAY_COLLECTION_NAME);
      const q = firestore.query(colRef, firestore.orderBy("date", "asc"));
      unsubscribeHolidays = firestore.onSnapshot(
        q,
        (snapshot) => {
          const custom = snapshot.docs
            .map((docItem) => {
              const data = docItem.data() || {};
              const date = (data.date || "").toString().trim();
              if (!date) return null;
              return {
                date,
                name: (data.name || "วันหยุด").toString().trim() || "วันหยุด"
              };
            })
            .filter(Boolean);
          refreshHolidayLookup(custom);
          renderCalendarOverview();
        },
        () => {
          refreshHolidayLookup([]);
          renderCalendarOverview();
        }
      );
    } catch (err) {
      refreshHolidayLookup([]);
      renderCalendarOverview();
    }
  };

  const submitBooking = async () => {
    const roomId = roomSelect.value;
    const date = dateInput.value;
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    const purpose = purposeInput.value.trim();
    const meetingProfile = await getMeetingProfileForSubmit();
    const requester = meetingProfile
      ? [meetingProfile.firstName, meetingProfile.lastName].filter(Boolean).join(" ")
      : "";
    const contactPhone = (meetingProfile?.phone || "").toString().trim();
    const contactInfo = (meetingProfile?.lineId || "").toString().trim();
    const projectMode = (document.getElementById("meetingProjectMode")?.value || DEFAULT_PROJECT_MODE).toString();
    const projectCode = projectMode === "project"
      ? (document.getElementById("meetingProjectCode")?.value || "").trim()
      : "";
    let projectName = "";
    const roomBookingAccess = getRoomBookingAccess(roomId);

    if (!roomsLoaded || !bookingsLoaded || roomsLoadFailed || bookingsLoadFailed) {
      setMessage("ข้อมูลการจองยังไม่พร้อมตรวจสอบเวลา กรุณารอสักครู่แล้วลองใหม่", "#b91c1c");
      return;
    }

    if (!meetingProfile) {
      setMessage("ไม่พบข้อมูลผู้ขอ กรุณาบันทึกข้อมูลที่หน้าเข้าสู่ระบบก่อน", "#b91c1c");
      return;
    }
    if (!roomId || !date || !startTime || !endTime || !requester || !purpose) {
      setMessage("กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำรายการจอง", "#b91c1c");
      return;
    }
    if (roomBookingAccess === "staff_only" && !isStaffUser()) {
      setMessage("ห้องที่เลือกเปิดให้สตาฟจองเท่านั้น", "#b91c1c");
      return;
    }
    if (!contactPhone && !contactInfo) {
      setMessage("กรุณาใส่ข้อมูลติดต่ออย่างน้อยช่องทางหนึ่ง", "#b91c1c");
      return;
    }
    if (projectMode === "project" && !projectCode) {
      setMessage("กรุณาใส่รหัสโครงการ", "#b91c1c");
      return;
    }
    if (projectMode === "project") {
      const project = await getProjectByCode(projectCode);
      if (!project) {
        setMessage("ไม่พบรหัสโครงการนี้ กรุณากรอกรหัสใหม่", "#b91c1c");
        if (projectCodeInput) {
          projectCodeInput.focus();
        }
        showProjectError("ไม่พบรหัสโครงการนี้ กรุณากรอกรหัสใหม่");
        return;
      }
      projectName = (project.name || "").trim();
      showProjectSuccess(project);
    } else {
      clearProjectFeedback();
    }

    const startAt = toDateTime(date, startTime);
    const endAt = toDateTime(date, endTime);
    const now = new Date();
    const earliestAllowed = new Date(now.getTime() - (60 * 60 * 1000));
    const latestAllowed = new Date(now);
    latestAllowed.setMonth(latestAllowed.getMonth() + 1);
    const allowLongAdvanceBooking = isStaffUser();
    if (!(startAt < endAt)) {
      setMessage("กรุณากำหนดเวลาเริ่มต้นให้ก่อนเวลาสิ้นสุด", "#b91c1c");
      return;
    }
    if (startAt < earliestAllowed) {
      setMessage("จองย้อนหลังได้ไม่เกิน 1 ชั่วโมง", "#b91c1c");
      return;
    }
    if (!isStaffUser() && (startAt.getTime() - now.getTime()) < (MIN_ADVANCE_BOOKING_HOURS * 60 * 60 * 1000)) {
      setMessage(`ผู้ขอใช้ต้องจองล่วงหน้าไม่น้อยกว่า ${MIN_ADVANCE_BOOKING_HOURS} ชั่วโมง`, "#b91c1c");
      return;
    }
    if (!allowLongAdvanceBooking && startAt > latestAllowed) {
      setMessage("จองล่วงหน้าได้ไม่เกิน 1 เดือน", "#b91c1c");
      return;
    }
    const restriction = getNoShowRestriction(readCurrentUserEmail());
    if (!isStaffUser() && restriction.restricted) {
      const blockedUntilText = restriction.blockedUntil
        ? restriction.blockedUntil.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })
        : "-";
      setMessage(
        `บัญชีนี้ถูกจำกัดสิทธิ์ชั่วคราวจากประวัติ No-show (${restriction.noShowCount} ครั้ง) ใช้งานใหม่ได้หลัง ${blockedUntilText}`,
        "#b91c1c"
      );
      return;
    }

    const candidate = {
      roomId,
      roomName: normalizeRoomDisplay(roomId, ""),
      date,
      startTime,
      endTime,
      requester,
      purpose,
      contactPhone,
      contactInfo,
      projectMode,
      projectCode,
      projectName,
      roomBookingAccess,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      status: "pending"
    };

    if (hasOverlap(candidate, bookings)) {
      setMessage("ช่วงเวลานี้ของห้องที่เลือกมีการจองทับซ้อน", "#b91c1c");
      return;
    }

    if (!hasFirestore) {
      setMessage("ระบบยังไม่พร้อมใช้งาน", "#b91c1c");
      return;
    }

    try {
      const createdDoc = await firestore.addDoc(firestore.collection(firestore.db, BOOKING_COLLECTION_NAME), {
        roomId: candidate.roomId,
        roomName: candidate.roomName,
        date,
        startTime,
        endTime,
        requester,
        purpose,
        contactPhone,
        contactInfo,
        requesterEmail: readCurrentUserEmail(),
        projectMode,
        projectCode,
        projectName,
        roomBookingAccess,
        status: "pending",
        startAt: candidate.startAt,
        endAt: candidate.endAt,
        createdAt: firestore.serverTimestamp(),
        updatedAt: firestore.serverTimestamp()
      });
      await writeAuditLog(
        "booking.created",
        "meetingRoomBooking",
        createdDoc?.id || "",
        null,
        pickBookingAuditFields({
          ...candidate,
          id: createdDoc?.id || "",
          requesterEmail: readCurrentUserEmail()
        }),
        { context: "booking_form" }
      );
      form.reset();
      clearProjectFeedback();
      setMessage("บันทึกการจองเรียบร้อยแล้ว", "#047857");
      setTimeout(() => {
        if (messageEl && messageEl.style.color === "rgb(4, 120, 87)") {
          setMessage("");
        }
      }, 2500);
    } catch (err) {
      setMessage("ไม่สามารถบันทึกคำขอจองได้ในขณะนี้", "#b91c1c");
    }
  };

  const cancelOwnBooking = async () => {
    const bookingId = (cancelBookingSelect?.value || "").trim();
    const cancelReason = (cancelReasonInput?.value || "").trim();
    if (!bookingId) {
      setCancelMessage("กรุณาเลือกรายการที่ต้องการยกเลิก", "#b91c1c");
      return;
    }
    if (!cancelReason) {
      setCancelMessage("กรุณาระบุเหตุผลการขอยกเลิก", "#b91c1c");
      return;
    }
    currentUserEmail = readCurrentUserEmail();
    if (!currentUserEmail) {
      setCancelMessage("กรุณา Sign in ก่อนยกเลิกคำขอ", "#b91c1c");
      return;
    }
    if (!hasFirestore) {
      setCancelMessage("ระบบยังไม่พร้อมใช้งาน", "#b91c1c");
      return;
    }

    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) {
      setCancelMessage("ไม่พบคำขอที่เลือก", "#b91c1c");
      return;
    }
    if ((booking.requesterEmail || "").toLowerCase() !== currentUserEmail) {
      setCancelMessage("อีเมลที่ใช้งานไม่ตรงกับผู้จองรายการนี้", "#b91c1c");
      return;
    }
    if (booking.status === "rejected") {
      setCancelMessage("คำขอนี้ถูกยกเลิก/ปฏิเสธไปแล้ว", "#6b7280");
      return;
    }
    if (booking.status === "no_show") {
      setCancelMessage("คำขอนี้ถูกบันทึกเป็น No-show แล้ว", "#6b7280");
      return;
    }
    if (booking.status === "cancel_requested") {
      setCancelMessage("คำขอนี้ถูกส่งขอยกเลิกไว้แล้ว", "#6b7280");
      return;
    }
    if (booking.status === "reschedule_requested") {
      setCancelMessage("คำขอนี้อยู่ระหว่างรออนุมัติการเปลี่ยนเวลา", "#6b7280");
      return;
    }
    const bookingStartAt = parseBookingStartDateTime(booking);
    if (
      !isStaffUser() &&
      bookingStartAt &&
      (bookingStartAt.getTime() - Date.now()) < (MIN_CANCEL_BEFORE_HOURS * 60 * 60 * 1000)
    ) {
      setCancelMessage(`ต้องยกเลิกการจองล่วงหน้าไม่น้อยกว่า ${MIN_CANCEL_BEFORE_HOURS} ชั่วโมง`, "#b91c1c");
      return;
    }

    try {
      await firestore.updateDoc(
        firestore.doc(firestore.db, BOOKING_COLLECTION_NAME, bookingId),
        {
          status: "rejected",
          cancelledByRequester: true,
          cancelRequestReason: cancelReason,
          cancelledAt: firestore.serverTimestamp(),
          updatedAt: firestore.serverTimestamp()
        }
      );
      await writeAuditLog(
        "booking.cancelled_by_requester",
        "meetingRoomBooking",
        bookingId,
        pickBookingAuditFields(booking),
        pickBookingAuditFields({
          ...booking,
          status: "rejected",
          cancelledByRequester: true,
          cancelRequestReason: cancelReason
        }),
        { context: "cancel_form" }
      );
      setCancelMessage("ยกเลิกคำขอเรียบร้อยแล้ว", "#047857");
      if (cancelBookingSelect) cancelBookingSelect.value = "";
      if (cancelReasonInput) cancelReasonInput.value = "";
    } catch (err) {
      setCancelMessage("ไม่สามารถยกเลิกคำขอได้ในขณะนี้", "#b91c1c");
    }
  };

  const submitRescheduleRequest = async () => {
    const bookingId = (rescheduleBookingSelect?.value || "").trim();
    const nextDate = (rescheduleDateInput?.value || "").trim();
    const nextStartTime = (rescheduleStartTimeInput?.value || "").trim();
    const nextEndTime = (rescheduleEndTimeInput?.value || "").trim();
    const reason = (rescheduleReasonInput?.value || "").trim();

    if (!roomsLoaded || !bookingsLoaded || roomsLoadFailed || bookingsLoadFailed) {
      setRescheduleMessage("ข้อมูลการจองยังไม่พร้อมตรวจสอบเวลา กรุณารอสักครู่แล้วลองใหม่", "#b91c1c");
      return;
    }
    if (!bookingId) {
      setRescheduleMessage("กรุณาเลือกรายการที่ต้องการขอเปลี่ยนเวลา", "#b91c1c");
      return;
    }
    if (!nextDate || !nextStartTime || !nextEndTime) {
      setRescheduleMessage("กรุณาระบุวันและเวลาใหม่ให้ครบถ้วน", "#b91c1c");
      return;
    }
    if (!reason) {
      setRescheduleMessage("กรุณาระบุเหตุผลการขอเปลี่ยนเวลา", "#b91c1c");
      return;
    }
    currentUserEmail = readCurrentUserEmail();
    if (!currentUserEmail) {
      setRescheduleMessage("กรุณา Sign in ก่อนส่งคำขอเปลี่ยนเวลา", "#b91c1c");
      return;
    }
    if (!hasFirestore) {
      setRescheduleMessage("ระบบยังไม่พร้อมใช้งาน", "#b91c1c");
      return;
    }

    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) {
      setRescheduleMessage("ไม่พบคำขอที่เลือก", "#b91c1c");
      return;
    }
    if ((booking.requesterEmail || "").toLowerCase() !== currentUserEmail) {
      setRescheduleMessage("อีเมลที่ใช้งานไม่ตรงกับผู้จองรายการนี้", "#b91c1c");
      return;
    }
    if (booking.status === "rejected") {
      setRescheduleMessage("คำขอนี้ถูกยกเลิก/ปฏิเสธไปแล้ว", "#6b7280");
      return;
    }
    if (booking.status === "no_show") {
      setRescheduleMessage("คำขอนี้ถูกบันทึกเป็น No-show แล้ว", "#6b7280");
      return;
    }
    if (booking.status === "cancel_requested") {
      setRescheduleMessage("คำขอนี้อยู่ระหว่างรออนุมัติการยกเลิก", "#6b7280");
      return;
    }
    if (booking.status === "reschedule_requested") {
      setRescheduleMessage("คำขอนี้อยู่ระหว่างรออนุมัติการเปลี่ยนเวลาอยู่แล้ว", "#6b7280");
      return;
    }
    if (booking.date === nextDate && booking.startTime === nextStartTime && booking.endTime === nextEndTime) {
      setRescheduleMessage("วันและเวลาใหม่ตรงกับคำขอเดิม", "#6b7280");
      return;
    }

    const nextStartAt = toDateTime(nextDate, nextStartTime);
    const nextEndAt = toDateTime(nextDate, nextEndTime);
    const now = new Date();
    const earliestAllowed = new Date(now.getTime() - (60 * 60 * 1000));
    const latestAllowed = new Date(now);
    latestAllowed.setMonth(latestAllowed.getMonth() + 1);
    if (!(nextStartAt < nextEndAt)) {
      setRescheduleMessage("กรุณากำหนดเวลาเริ่มต้นให้ก่อนเวลาสิ้นสุด", "#b91c1c");
      return;
    }
    if (nextStartAt < earliestAllowed) {
      setRescheduleMessage("ปรับเวลาเป็นย้อนหลังได้ไม่เกิน 1 ชั่วโมง", "#b91c1c");
      return;
    }
    if (!isStaffUser() && (nextStartAt.getTime() - now.getTime()) < (MIN_ADVANCE_BOOKING_HOURS * 60 * 60 * 1000)) {
      setRescheduleMessage(`ต้องขอเปลี่ยนเวลาให้วันใช้งานใหม่ล่วงหน้าไม่น้อยกว่า ${MIN_ADVANCE_BOOKING_HOURS} ชั่วโมง`, "#b91c1c");
      return;
    }
    if (!isStaffUser() && nextStartAt > latestAllowed) {
      setRescheduleMessage("ปรับเวลาเป็นล่วงหน้าได้ไม่เกิน 1 เดือน", "#b91c1c");
      return;
    }
    const restriction = getNoShowRestriction(currentUserEmail);
    if (!isStaffUser() && restriction.restricted) {
      const blockedUntilText = restriction.blockedUntil
        ? restriction.blockedUntil.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })
        : "-";
      setRescheduleMessage(
        `บัญชีนี้ถูกจำกัดสิทธิ์ชั่วคราวจากประวัติ No-show (${restriction.noShowCount} ครั้ง) ใช้งานใหม่ได้หลัง ${blockedUntilText}`,
        "#b91c1c"
      );
      return;
    }

    const candidate = {
      roomId: booking.roomId,
      date: nextDate,
      startTime: nextStartTime,
      endTime: nextEndTime
    };
    if (hasOverlap(candidate, bookings, { ignoredBookingId: bookingId })) {
      setRescheduleMessage("ช่วงเวลาใหม่ของห้องนี้มีการจองทับซ้อน", "#b91c1c");
      return;
    }

    try {
      await firestore.updateDoc(
        firestore.doc(firestore.db, BOOKING_COLLECTION_NAME, bookingId),
        {
          status: "reschedule_requested",
          rescheduleBaseStatus: normalizeStatus(booking.status),
          rescheduleRequestedDate: nextDate,
          rescheduleRequestedStartTime: nextStartTime,
          rescheduleRequestedEndTime: nextEndTime,
          rescheduleRequestReason: reason,
          updatedAt: firestore.serverTimestamp()
        }
      );
      await writeAuditLog(
        "booking.reschedule_requested",
        "meetingRoomBooking",
        bookingId,
        pickBookingAuditFields(booking),
        pickBookingAuditFields({
          ...booking,
          status: "reschedule_requested",
          rescheduleBaseStatus: normalizeStatus(booking.status),
          rescheduleRequestedDate: nextDate,
          rescheduleRequestedStartTime: nextStartTime,
          rescheduleRequestedEndTime: nextEndTime,
          rescheduleRequestReason: reason
        }),
        { context: "reschedule_form" }
      );
      setRescheduleMessage("ส่งคำขอเปลี่ยนเวลาเรียบร้อยแล้ว (รอ Staff อนุมัติ)", "#047857");
      if (rescheduleBookingSelect) rescheduleBookingSelect.value = "";
      if (rescheduleDateInput) rescheduleDateInput.value = "";
      if (rescheduleStartTimeInput) rescheduleStartTimeInput.value = "";
      if (rescheduleEndTimeInput) rescheduleEndTimeInput.value = "";
      if (rescheduleReasonInput) rescheduleReasonInput.value = "";
    } catch (err) {
      setRescheduleMessage("ไม่สามารถส่งคำขอเปลี่ยนเวลาได้ในขณะนี้", "#b91c1c");
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submitBooking();
  });

  if (cancelForm) {
    cancelForm.addEventListener("submit", (event) => {
      event.preventDefault();
      void cancelOwnBooking();
    });
  }

  if (rescheduleForm) {
    rescheduleForm.addEventListener("submit", (event) => {
      event.preventDefault();
      void submitRescheduleRequest();
    });
  }

  if (window.sgcuAuth?.auth && typeof window.sgcuAuth.onAuthStateChanged === "function") {
    window.sgcuAuth.onAuthStateChanged(window.sgcuAuth.auth, () => {
      currentUserEmail = readCurrentUserEmail();
      restoreMeetingProfileForCurrentUser();
      void readMeetingProfileFromFirestore().then((profile) => {
        if (profile) applySharedProfileToMeetingForm(profile);
      });
      setupRoomOptions();
      renderOwnBookingOptions();
      if (resolveFirestoreBridge() && (roomsLoadFailed || bookingsLoadFailed || !roomsLoaded || !bookingsLoaded)) {
        retryMeetingSubscriptions();
      }
    });
  }

  setupRoomOptions();
  currentUserEmail = readCurrentUserEmail();
  restoreMeetingProfileForCurrentUser();
  void readMeetingProfileFromFirestore().then((profile) => {
    if (profile) applySharedProfileToMeetingForm(profile);
  });
  setMinDate();
  ensureFormContactFields();
  ensureBookingListUI();
  startCalendar();
  updateMeetingRoomView(meetingRoomActiveView || "calendar");
  renderMeetingLoadState();

  if (viewCalendarBtn) {
    viewCalendarBtn.addEventListener("click", () => {
      updateMeetingRoomView("calendar");
    });
  }

  if (viewListBtn) {
    viewListBtn.addEventListener("click", () => {
      updateMeetingRoomView("list");
    });
  }

  if (roomSelect) {
    roomSelect.addEventListener("focus", () => {
      setupRoomOptions();
    });
  }

  if (dateInput) {
    dateInput.addEventListener("change", () => {
      setCalendarCursorFromDate(dateInput.value);
      renderCalendarOverview();
    });
  }

  window.addEventListener("sgcu:user-profile-updated", (event) => {
    const detail = event?.detail || {};
    const email = (detail.email || "").toString().trim().toLowerCase();
    if (!email || email !== currentUserEmail) return;
    applySharedProfileToMeetingForm(detail.profile || {});
  });

  if (calendarPanel && dateInput) {
    calendarPanel.addEventListener("click", (event) => {
      const clickedElement = event.target;
      if (!(clickedElement instanceof Element)) return;
      const eventTarget = clickedElement.closest(".calendar-event[data-booking-id]");
      if (eventTarget && eventTarget.dataset.bookingId) {
        openBookingDetailModal(eventTarget.dataset.bookingId);
        return;
      }
      const target = clickedElement.closest(".calendar-day");
      if (!target || !target.dataset?.date) return;
      const nextValue = target.dataset.date;
      dateInput.value = nextValue;
      setCalendarCursorFromDate(nextValue);
      renderCalendarOverview();
      openBookingDayModal(nextValue);
    });
  }

  if (calendarPrevBtn) {
    calendarPrevBtn.addEventListener("click", () => {
      calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
      renderCalendarOverview();
    });
  }

  if (calendarNextBtn) {
    calendarNextBtn.addEventListener("click", () => {
      calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
      renderCalendarOverview();
    });
  }

  if (resolveFirestoreBridge()) {
    subscribeRooms();
    subscribeBookings();
    subscribeHolidays();
  } else {
    setMessage("กำลังเชื่อมต่อข้อมูลห้องประชุม...", "#6b7280");
    renderMeetingLoadState();
    const startedAt = Date.now();
    const waitTimer = window.setInterval(() => {
      if (resolveFirestoreBridge()) {
        window.clearInterval(waitTimer);
        setMessage("");
        retryMeetingSubscriptions();
        return;
      }
      if (Date.now() - startedAt >= 15000) {
        window.clearInterval(waitTimer);
        setMessage("ระบบยังไม่เชื่อมต่อ Firestore โปรดตรวจสอบการตั้งค่า", "#b91c1c");
        renderMeetingLoadState();
      }
    }, 300);
  }

  if (bookingDetailCloseEl) {
    bookingDetailCloseEl.addEventListener("click", closeBookingDetailModal);
  }
  if (bookingDetailModalEl) {
    bookingDetailModalEl.addEventListener("click", (event) => {
      if (event.target === bookingDetailModalEl) {
        closeBookingDetailModal();
      }
    });
  }
  if (bookingDetailBodyEl) {
    bookingDetailBodyEl.addEventListener("change", (event) => {
      const select = event.target;
      if (!(select instanceof HTMLSelectElement)) return;
      if (select.id !== "meetingBookingDetailStatusSelect") return;
      select.classList.remove("is-pending", "is-approved", "is-rejected", "is-cancel-requested");
      select.classList.add(statusSelectClass(select.value));
      setBookingDetailStatusMessage("");
    });

    bookingDetailBodyEl.addEventListener("click", (event) => {
      const button = event.target;
      if (!(button instanceof HTMLButtonElement)) return;
      if (button.id !== "meetingBookingDetailStatusApply") return;
      const select = bookingDetailBodyEl.querySelector("#meetingBookingDetailStatusSelect");
      if (!(select instanceof HTMLSelectElement)) return;
      const bookingId = activeDetailBookingId;
      if (!bookingId) return;
      button.disabled = true;
      void applyStatusByIdFromModal(bookingId, select.value).finally(() => {
        button.disabled = false;
        const latest = bookings.find((item) => item.id === bookingId);
        if (latest) {
          setBookingDetailBody(latest, activeDetailOptions);
        }
      });
    });
  }

  if (bookingDayModalCloseEl) {
    bookingDayModalCloseEl.addEventListener("click", closeBookingDayModal);
  }
  if (bookingDayModalEl) {
    bookingDayModalEl.addEventListener("click", (event) => {
      if (event.target === bookingDayModalEl) {
        closeBookingDayModal();
      }
    });
  }
  if (bookingDayModalBodyEl) {
    bookingDayModalBodyEl.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const row = target.closest("tr[data-booking-id]");
      if (!row || !row.dataset.bookingId) return;
      const detailOptions = {};
      if (row.dataset.includeContact === "true") {
        detailOptions.includeContact = true;
      }
      if (row.dataset.allowStatusEdit === "true") {
        detailOptions.allowStatusEdit = true;
      }
      closeBookingDayModal();
      openBookingDetailModal(row.dataset.bookingId, detailOptions);
    });
  }

  window.openMeetingBookingDetailModal = openBookingDetailModal;
  window.openMeetingBookingDayListModal = openDayBookingListModal;

  window.addEventListener("beforeunload", () => {
    if (typeof unsubscribe === "function") {
      unsubscribe();
    }
    if (typeof unsubscribeRooms === "function") {
      unsubscribeRooms();
    }
    if (typeof unsubscribeHolidays === "function") {
      unsubscribeHolidays();
    }
  });
});
