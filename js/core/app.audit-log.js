(function initSgcuAuditLog() {
  if (window.sgcuAuditLog) return;

  const getConfig = () => (typeof SGCU_APP_CONFIG === "object" && SGCU_APP_CONFIG ? SGCU_APP_CONFIG : {});
  const getFirestore = () => window.sgcuFirestore || {};
  const getAuthUser = () => window.sgcuAuth?.auth?.currentUser || null;
  const collectionName = () => getConfig().firestore?.collections?.auditLogs || "auditLogs";
  const userProfileCollectionName = () => getConfig().firestore?.collections?.userProfiles || "userProfiles";

  const normalizeText = (value) => (value == null ? "" : String(value).trim());
  const escapeHtml = (value) =>
    normalizeText(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  const normalizeSnapshotData = (value) => {
    if (value == null) return null;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_) {
      return { value: normalizeText(value) };
    }
  };

  const actorNameCache = new Map();
  const actorNameLoadingKeys = new Set();

  const getProfileFullName = (profile = {}) => {
    const firstName = normalizeText(profile.firstName);
    const lastName = normalizeText(profile.lastName);
    return [firstName, lastName].filter(Boolean).join(" ").trim();
  };

  const readLocalProfileByEmail = (email = "") => {
    const normalizedEmail = normalizeText(email).toLowerCase();
    if (!normalizedEmail) return null;
    const storageKeys = ["sgcu_user_profile_by_email_v1", "sgcu_borrow_profile_by_email_v1"];
    for (const key of storageKeys) {
      try {
        const parsed = JSON.parse(window.localStorage?.getItem(key) || "{}");
        const profile = parsed && typeof parsed === "object" ? parsed[normalizedEmail] : null;
        if (profile && typeof profile === "object") return profile;
      } catch (_) {
        // ignore malformed local profile data
      }
    }
    return null;
  };

  const getActorCacheKey = (item = {}) => {
    const uid = normalizeText(item.actorUid);
    if (uid) return `uid:${uid}`;
    const email = normalizeText(item.actorEmail).toLowerCase();
    return email ? `email:${email}` : "";
  };

  const getActorDisplayName = (item = {}) => {
    const storedName = normalizeText(item.actorName || item.actorDisplayName);
    if (storedName) return storedName;

    const cacheKey = getActorCacheKey(item);
    if (cacheKey && actorNameCache.has(cacheKey)) {
      const cachedName = normalizeText(actorNameCache.get(cacheKey));
      if (cachedName) return cachedName;
    }

    const localName = getProfileFullName(readLocalProfileByEmail(item.actorEmail) || {});
    if (localName) return localName;

    const currentUser = getAuthUser();
    if (normalizeText(currentUser?.uid) && normalizeText(currentUser?.uid) === normalizeText(item.actorUid)) {
      const currentName = normalizeText(currentUser?.displayName);
      if (currentName) return currentName;
    }

    return normalizeText(item.actorEmail) || "-";
  };

  const getCurrentActorDisplayName = () => {
    const user = getAuthUser();
    const email = normalizeText(user?.email).toLowerCase();
    const localName = getProfileFullName(readLocalProfileByEmail(email) || {});
    return localName || normalizeText(user?.displayName);
  };

  const hydrateActorNames = (rows = []) => {
    const firestore = getFirestore();
    if (!firestore.db || !firestore.doc || !firestore.getDoc) return;
    const loadJobs = [];

    rows.forEach((item) => {
      const uid = normalizeText(item.actorUid);
      if (!uid) return;
      const cacheKey = `uid:${uid}`;
      if (actorNameCache.has(cacheKey) || actorNameLoadingKeys.has(cacheKey)) return;
      actorNameLoadingKeys.add(cacheKey);
      const job = firestore.getDoc(firestore.doc(firestore.db, userProfileCollectionName(), uid))
        .then((snap) => {
          const profile = snap?.exists?.() ? (snap.data() || {}) : {};
          actorNameCache.set(cacheKey, getProfileFullName(profile));
        })
        .catch(() => {
          actorNameCache.set(cacheKey, "");
        })
        .finally(() => {
          actorNameLoadingKeys.delete(cacheKey);
        });
      loadJobs.push(job);
    });

    if (loadJobs.length) {
      Promise.allSettled(loadJobs).then(() => renderRows(state.rows));
    }
  };

  const toDisplayDateTime = (value) => {
    const date = toDateObject(value);
    if (!date) return "-";
    return date.toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  const toDateObject = (value) => {
    const date =
      typeof value?.toDate === "function"
        ? value.toDate()
        : value instanceof Date
          ? value
          : value
            ? new Date(value)
            : null;
    return !date || Number.isNaN(date.getTime()) ? null : date;
  };

  const parseDateBoundary = (value = "", endOfDay = false) => {
    const text = normalizeText(value);
    if (!text) return null;
    const date = new Date(`${text}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const isInDateRange = (item = {}) => {
    const timestamp = toDateObject(item.timestamp);
    if (!timestamp) return true;
    const start = parseDateBoundary(state.startDate, false);
    const end = parseDateBoundary(state.endDate, true);
    if (start && timestamp < start) return false;
    if (end && timestamp > end) return false;
    return true;
  };

  const actionLabel = (action = "") => {
    const key = normalizeText(action);
    const labels = {
      "budget.settings.update": "แก้การตั้งค่างบ",
      "budget.round.delete": "ลบรอบงบ",
      "budget.project_codes.run": "รันรหัสโครงการ",
      "budget.project_codes.clear": "ยกเลิกรหัสโครงการ",
      "budget.request.create": "เพิ่มคำของบ",
      "budget.request.update": "แก้คำของบ",
      "budget.request.cancel": "ลด/ยกเลิกคำของบ",
      "budget.request.delete": "ลบคำของบ",
      "borrow.request.create": "ยื่นคำขอยืมพัสดุ",
      "borrow.request.status_update": "อัปเดตสถานะพัสดุ",
      "borrow.request.delete": "ลบคำขอยืมพัสดุ",
      "content.news.create": "เพิ่มข่าว",
      "content.news.update": "แก้ข่าว",
      "content.news.import": "Import ข่าว",
      "content.document.create": "เพิ่มเอกสาร",
      "content.document.update": "แก้เอกสาร",
      "content.document.import": "Import เอกสาร",
      "content.document.reorder": "จัดลำดับเอกสาร",
      "booking.created": "สร้างคำขอจองห้อง",
      "booking.status_updated": "อัปเดตสถานะจองห้อง",
      "booking.status_updated_by_staff": "สตาฟอัปเดตสถานะจองห้อง",
      "booking.deleted_by_staff": "สตาฟลบคำขอจองห้อง",
      "booking.cancelled_by_requester": "ผู้จองขอยกเลิกคำขอ",
      "booking.reschedule_requested": "ผู้จองขอเปลี่ยนห้อง/เวลา",
      "meeting_room.created": "เพิ่มห้องประชุม",
      "meeting_room.deleted": "ลบห้องประชุม",
      "meeting_room.renamed": "แก้ชื่อห้องประชุม",
      "meeting_room.booking_access_updated": "แก้สิทธิ์จองห้อง",
      "meeting_holiday.created": "เพิ่มวันหยุดห้องประชุม",
      "meeting_holiday.deleted": "ลบวันหยุดห้องประชุม",
      "staff.auth_access.upsert": "บันทึกสิทธิ์เข้าใช้ชั่วคราว",
      "staff.auth_access.delete": "ลบสิทธิ์เข้าใช้ชั่วคราว",
      "staff.position.create": "เพิ่มตำแหน่งสตาฟ",
      "staff.position.update": "แก้ตำแหน่งสตาฟ",
      "staff.position.delete": "ลบตำแหน่งสตาฟ",
      "staff.application.create": "ส่งคำขอสมัครสตาฟ",
      "staff.application.status_update": "อัปเดตสถานะคำขอสตาฟ",
      "staff.application.revoke": "ยกเลิกอนุมัติคำขอสตาฟ",
      "staff.application.position_update": "ปรับตำแหน่งสตาฟ",
      "staff.application.delete": "ลบคำขอสตาฟ",
      "staff.org_representative.status_update": "อัปเดตสถานะตัวแทนองค์กร",
      "staff.org_representative.delete": "ลบคำขอตัวแทนองค์กร",
      "staff.organization_catalog.upsert": "บันทึกทะเบียนองค์กร",
      "staff.organization_catalog.archive": "ลบทะเบียนองค์กร",
      "staff.organization_catalog.import": "Import ทะเบียนองค์กร"
    };
    return labels[key] || key || "-";
  };

  const entityLabel = (entityType = "", entityId = "") => {
    const labels = {
      budgetApprovalRequest: "คำของบ",
      budgetApprovalSettings: "ตั้งค่างบ",
      borrowAssetRequest: "คำขอยืมพัสดุ",
      newsItem: "ข่าว",
      downloadDocument: "เอกสาร",
      meetingRoomBooking: "จองห้อง",
      meetingRoom: "ห้องประชุม",
      meetingRoomHoliday: "วันหยุดห้องประชุม",
      authEmailAccess: "สิทธิ์เข้าใช้ชั่วคราว",
      staffPosition: "ตำแหน่งสตาฟ",
      staffApplication: "คำขอสตาฟ",
      orgRepresentativeApplication: "คำขอตัวแทนองค์กร",
      organizationCatalogItem: "ทะเบียนองค์กร"
    };
    const type = labels[normalizeText(entityType)] || normalizeText(entityType) || "-";
    const id = normalizeText(entityId);
    return id ? `${type} / ${id}` : type;
  };

  const statusLabel = (status = "") => {
    const key = normalizeText(status).toLowerCase();
    const labels = {
      pending: "รออนุมัติ",
      approved: "อนุมัติแล้ว",
      rejected: "ปฏิเสธ/ยกเลิก",
      cancel_requested: "ขอยกเลิก",
      reschedule_requested: "ขอเปลี่ยนห้อง/เวลา",
      no_show: "No-show",
      received: "รับของแล้ว",
      returned: "คืนแล้ว",
      cancelled: "ยกเลิก",
      published: "เผยแพร่",
      archived: "เก็บถาวร",
      draft: "ฉบับร่าง"
    };
    return labels[key] || key || "";
  };

  const formatSchedule = (item = {}) => {
    const date = normalizeText(item.date);
    const start = normalizeText(item.startTime);
    const end = normalizeText(item.endTime);
    if (!date && !start && !end) return "";
    const time = start || end ? `${start || "-"}-${end || "-"}` : "";
    return [date, time].filter(Boolean).join(" ");
  };

  const getAuditPayload = (item = {}) => {
    const after = item.after && typeof item.after === "object" ? item.after : null;
    const before = item.before && typeof item.before === "object" ? item.before : null;
    return after || before || {};
  };

  const getStatusChangeText = (item = {}) => {
    const before = item.before && typeof item.before === "object" ? item.before : null;
    const after = item.after && typeof item.after === "object" ? item.after : null;
    const beforeStatus = statusLabel(before?.status);
    const afterStatus = statusLabel(after?.status);
    if (beforeStatus && afterStatus && beforeStatus !== afterStatus) return `${beforeStatus} -> ${afterStatus}`;
    return afterStatus || beforeStatus || "";
  };

  const detailText = (item = {}) => {
    const entityType = normalizeText(item.entityType);
    const action = normalizeText(item.action);
    const data = getAuditPayload(item);

    if (entityType === "meetingRoomBooking") {
      const room = normalizeText(data.roomName || data.roomDisplay || data.roomId) || "ไม่ระบุห้อง";
      const schedule = formatSchedule(data);
      const status = getStatusChangeText(item);
      const reschedule = data.rescheduleRequestedDate
        ? `ขอเปลี่ยนเป็น ${[
            data.rescheduleRequestedRoomName || data.rescheduleRequestedRoomId || "",
            data.rescheduleRequestedDate,
            `${data.rescheduleRequestedStartTime || "-"}-${data.rescheduleRequestedEndTime || "-"}`
          ].filter(Boolean).join(" ")}`
        : "";
      return [room, schedule, status, reschedule].filter(Boolean).join(" | ");
    }

    if (entityType === "meetingRoom") {
      const room = normalizeText(data.name) || normalizeText(item.entityId) || "ไม่ระบุห้อง";
      const access = data.bookingAccess === "staff_only" ? "สตาฟจองเท่านั้น" : data.bookingAccess === "public" ? "คนทั่วไปจอง" : "";
      return [room, access].filter(Boolean).join(" | ");
    }

    if (entityType === "meetingRoomHoliday") {
      return [normalizeText(data.date), normalizeText(data.name)].filter(Boolean).join(" | ");
    }

    if (entityType === "budgetApprovalRequest") {
      return [
        normalizeText(data.projectName),
        normalizeText(data.organizationName),
        statusLabel(data.status),
        data.approvedAmount != null ? `อนุมัติ ${data.approvedAmount}` : ""
      ].filter(Boolean).join(" | ");
    }

    if (entityType === "borrowAssetRequest") {
      const assets = Array.isArray(data.assets)
        ? data.assets.map((asset) => normalizeText(asset.name || asset.assetName || asset.code)).filter(Boolean).slice(0, 3).join(", ")
        : "";
      return [
        normalizeText(data.projectName),
        assets,
        statusLabel(data.status)
      ].filter(Boolean).join(" | ");
    }

    if (entityType === "newsItem") {
      return [normalizeText(data.title), statusLabel(data.status)].filter(Boolean).join(" | ");
    }

    if (entityType === "downloadDocument") {
      return [normalizeText(data.name), normalizeText(data.category), statusLabel(data.status)].filter(Boolean).join(" | ");
    }

    if (entityType === "authEmailAccess") {
      const active = data.active === false ? "ปิดใช้งาน" : data.active === true ? "เปิดใช้งาน" : "";
      return [normalizeText(data.email || item.entityId), active, normalizeText(data.reason)].filter(Boolean).join(" | ");
    }

    if (entityType === "staffPosition") {
      return [
        normalizeText(data.name),
        normalizeText(data.divisionCodeYY),
        normalizeText(data.levelCodeZZ)
      ].filter(Boolean).join(" | ");
    }

    if (entityType === "staffApplication") {
      return [
        normalizeText(data.applicantName || data.applicantEmail),
        normalizeText(data.approvedPosition || data.requestedPosition),
        statusLabel(data.status)
      ].filter(Boolean).join(" | ");
    }

    if (entityType === "orgRepresentativeApplication") {
      return [
        normalizeText(data.applicantEmail || data.email),
        normalizeText(data.organizationName || data.orgName),
        statusLabel(data.status)
      ].filter(Boolean).join(" | ");
    }

    if (entityType === "organizationCatalogItem") {
      return [
        normalizeText(data.formName || data.name),
        normalizeText(data.group),
        normalizeText(data.code || data.documentRunCode),
        statusLabel(data.status)
      ].filter(Boolean).join(" | ");
    }

    return action ? entityLabel(entityType, item.entityId) : "";
  };

  const renderDetailHtml = (item = {}) => {
    const text = detailText(item) || entityLabel(item.entityType, item.entityId);
    const parts = normalizeText(text).split(" | ").map(normalizeText).filter(Boolean);
    if (!parts.length) return escapeHtml("-");
    return `<div class="dashboard-audit-detail-list">${parts.map((part) => (
      `<span class="dashboard-audit-detail-item">${escapeHtml(part)}</span>`
    )).join("")}</div>`;
  };

  const write = async ({
    action = "",
    entityType = "",
    entityId = "",
    before = null,
    after = null,
    metadata = {},
    source = "web_app"
  } = {}) => {
    const firestore = getFirestore();
    if (!firestore.db || !firestore.collection || !firestore.addDoc || !firestore.serverTimestamp) return false;
    try {
      const user = getAuthUser();
      await firestore.addDoc(
        firestore.collection(firestore.db, collectionName()),
        {
          action: normalizeText(action),
          entityType: normalizeText(entityType),
          entityId: normalizeText(entityId),
          before: normalizeSnapshotData(before),
          after: normalizeSnapshotData(after),
          actorUid: normalizeText(user?.uid),
          actorEmail: normalizeText(user?.email).toLowerCase(),
          actorDisplayName: getCurrentActorDisplayName(),
          actorRole: source.includes("staff") ? "staff" : "",
          source: normalizeText(source) || "web_app",
          metadata: normalizeSnapshotData(metadata) || {},
          timestamp: firestore.serverTimestamp()
        }
      );
      return true;
    } catch (_) {
      return false;
    }
  };

  const setStatus = (text, tone = "") => {
    const el = document.getElementById("dashboardAuditLogStatus");
    if (!el) return;
    el.textContent = text || "";
    el.dataset.tone = tone || "";
    el.hidden = !text;
  };

  const state = {
    rows: [],
    filterType: "all",
    query: "",
    startDate: "",
    endDate: ""
  };

  const getTypeGroup = (item = {}) => {
    const action = normalizeText(item.action);
    const entityType = normalizeText(item.entityType);
    if (action.startsWith("budget.") || entityType === "budgetApprovalRequest" || entityType === "budgetApprovalSettings") return "budget";
    if (action.startsWith("borrow.") || entityType === "borrowAssetRequest") return "borrow";
    if (action.startsWith("booking.") || action.startsWith("meeting_") || entityType.startsWith("meetingRoom")) return "booking";
    if (action.startsWith("content.") || entityType === "newsItem" || entityType === "downloadDocument") return "content";
    if (action.startsWith("staff.") || entityType === "authEmailAccess" || entityType === "staffPosition" || entityType === "orgRepresentativeApplication" || entityType === "organizationCatalogItem") return "staff";
    return "other";
  };

  const getSearchText = (item = {}) => [
    actionLabel(item.action),
    entityLabel(item.entityType, item.entityId),
    detailText(item),
    getActorDisplayName(item),
    item.actorEmail,
    item.source,
    item.action,
    item.entityType,
    item.entityId
  ].map(normalizeText).join(" ").toLowerCase();

  const getFilteredRows = () => {
    const query = normalizeText(state.query).toLowerCase();
    return state.rows.filter((item) => {
      if (state.filterType !== "all" && getTypeGroup(item) !== state.filterType) return false;
      if (!isInDateRange(item)) return false;
      if (query && !getSearchText(item).includes(query)) return false;
      return true;
    });
  };

  const getRowsForExport = () => {
    const rows = getFilteredRows();
    return rows.map((item) => ({
      "เวลา": toDisplayDateTime(item.timestamp),
      "การกระทำ": actionLabel(item.action),
      "ประเภท/รหัส": entityLabel(item.entityType, item.entityId),
      "รายละเอียด": detailText(item),
      "ผู้ทำรายการ": getActorDisplayName(item),
      "ที่มา": item.source || "-",
      "Metadata": JSON.stringify(item.metadata || {})
    }));
  };

  const renderRows = (items = []) => {
    const body = document.getElementById("dashboardAuditLogBody");
    const caption = document.getElementById("dashboardAuditLogCaption");
    const exportBtn = document.getElementById("dashboardAuditLogExportCsvBtn");
    if (!body) return;
    if (items !== state.rows) {
      state.rows = Array.isArray(items) ? items : [];
    }
    const rows = getFilteredRows().slice(0, 100);
    window.__sgcuAuditLogRows = rows;
    if (caption) {
      const total = state.rows.length;
      caption.textContent = `แสดง ${rows.length} จาก ${total} รายการล่าสุด`;
    }
    if (exportBtn) exportBtn.disabled = rows.length === 0;
    if (!rows.length) {
      body.innerHTML = `<tr class="dashboard-audit-empty-row"><td colspan="4">ยังไม่มี Activity Log</td></tr>`;
      return;
    }
    hydrateActorNames(rows);
    body.innerHTML = rows.map((item) => `
      <tr class="dashboard-audit-row">
        <td data-label="เวลา">${escapeHtml(toDisplayDateTime(item.timestamp))}</td>
        <td data-label="การกระทำ">${escapeHtml(actionLabel(item.action))}</td>
        <td class="dashboard-audit-detail-cell" data-label="รายละเอียด">${renderDetailHtml(item)}</td>
        <td data-label="ผู้ทำรายการ">${escapeHtml(getActorDisplayName(item))}</td>
      </tr>
    `).join("");
  };

  const initDashboard = () => {
    const body = document.getElementById("dashboardAuditLogBody");
    if (!body || body.dataset.auditReady === "true") return;
    body.dataset.auditReady = "true";

    const firestore = getFirestore();
    if (!firestore.db || !firestore.collection || !firestore.query || !firestore.orderBy || !firestore.onSnapshot) {
      renderRows([]);
      setStatus("ระบบ Activity Log ยังไม่พร้อมใช้งาน", "error");
      return;
    }

    setStatus("กำลังโหลด Activity Log...", "");
    const queryRef = firestore.query(
      firestore.collection(firestore.db, collectionName()),
      firestore.orderBy("timestamp", "desc"),
      ...(firestore.limit ? [firestore.limit(100)] : [])
    );
    firestore.onSnapshot(
      queryRef,
      (snapshot) => {
        const rows = [];
        snapshot.forEach((docSnap) => rows.push({ id: docSnap.id, ...(docSnap.data() || {}) }));
        renderRows(rows);
        setStatus("");
      },
      (error) => {
        renderRows([]);
        setStatus(error?.code === "permission-denied" ? "บัญชีนี้ยังไม่มีสิทธิ์อ่าน Activity Log" : "โหลด Activity Log ไม่สำเร็จ", "error");
      }
    );

    const exportBtn = document.getElementById("dashboardAuditLogExportCsvBtn");
    exportBtn?.addEventListener("click", () => {
      const rows = getRowsForExport();
      window.sgcuCsvExport?.download?.({
        headers: ["เวลา", "การกระทำ", "ประเภท/รหัส", "รายละเอียด", "ผู้ทำรายการ", "ที่มา", "Metadata"],
        rows,
        fileName: "sgcu-activity-log"
      });
    });

    const typeFilter = document.getElementById("dashboardAuditLogTypeFilter");
    const startDateInput = document.getElementById("dashboardAuditLogStartDate");
    const endDateInput = document.getElementById("dashboardAuditLogEndDate");
    const searchInput = document.getElementById("dashboardAuditLogSearchInput");
    const searchClear = document.getElementById("dashboardAuditLogSearchClear");
    typeFilter?.addEventListener("change", () => {
      state.filterType = normalizeText(typeFilter.value) || "all";
      renderRows(state.rows);
    });
    startDateInput?.addEventListener("change", () => {
      state.startDate = normalizeText(startDateInput.value);
      renderRows(state.rows);
    });
    endDateInput?.addEventListener("change", () => {
      state.endDate = normalizeText(endDateInput.value);
      renderRows(state.rows);
    });
    searchInput?.addEventListener("input", () => {
      state.query = normalizeText(searchInput.value);
      renderRows(state.rows);
    });
    searchClear?.addEventListener("click", () => {
      state.filterType = "all";
      state.startDate = "";
      state.endDate = "";
      state.query = "";
      if (typeFilter) typeFilter.value = "all";
      if (startDateInput) startDateInput.value = "";
      if (endDateInput) endDateInput.value = "";
      if (searchInput) searchInput.value = "";
      renderRows(state.rows);
      searchInput?.focus();
    });
  };

  window.sgcuAuditLog = {
    write,
    initDashboard,
    renderRows,
    actionLabel,
    entityLabel
  };
})();
