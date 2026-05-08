(function initSgcuAuditLog() {
  if (window.sgcuAuditLog) return;

  const getConfig = () => (typeof SGCU_APP_CONFIG === "object" && SGCU_APP_CONFIG ? SGCU_APP_CONFIG : {});
  const getFirestore = () => window.sgcuFirestore || {};
  const getAuthUser = () => window.sgcuAuth?.auth?.currentUser || null;
  const collectionName = () => getConfig().firestore?.collections?.auditLogs || "auditLogs";

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

  const toDisplayDateTime = (value) => {
    const date =
      typeof value?.toDate === "function"
        ? value.toDate()
        : value instanceof Date
          ? value
          : value
            ? new Date(value)
            : null;
    if (!date || Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short"
    });
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
      "borrow.request.create": "ยื่นคำขอยืมพัสดุ",
      "borrow.request.status_update": "อัปเดตสถานะพัสดุ",
      "borrow.request.delete": "ลบคำขอยืมพัสดุ",
      "content.news.create": "เพิ่มข่าว",
      "content.news.update": "แก้ข่าว",
      "content.document.create": "เพิ่มเอกสาร",
      "content.document.update": "แก้เอกสาร",
      "booking.created": "สร้างคำขอจองห้อง",
      "booking.status_updated": "อัปเดตสถานะจองห้อง",
      "booking.status_updated_by_staff": "สตาฟอัปเดตสถานะจองห้อง",
      "booking.deleted_by_staff": "สตาฟลบคำขอจองห้อง",
      "booking.cancelled_by_requester": "ผู้จองยกเลิกคำขอ",
      "booking.reschedule_requested": "ผู้จองขอเปลี่ยนเวลา",
      "meeting_room.created": "เพิ่มห้องประชุม",
      "meeting_room.deleted": "ลบห้องประชุม",
      "meeting_room.renamed": "แก้ชื่อห้องประชุม",
      "meeting_room.booking_access_updated": "แก้สิทธิ์จองห้อง",
      "meeting_holiday.created": "เพิ่มวันหยุดห้องประชุม",
      "meeting_holiday.deleted": "ลบวันหยุดห้องประชุม"
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
      meetingRoomHoliday: "วันหยุดห้องประชุม"
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
      reschedule_requested: "ขอเปลี่ยนเวลา",
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
      const requester = normalizeText(data.requester || data.requesterEmail);
      const status = getStatusChangeText(item);
      const reschedule = data.rescheduleRequestedDate
        ? `ขอเปลี่ยนเป็น ${[
            data.rescheduleRequestedDate,
            `${data.rescheduleRequestedStartTime || "-"}-${data.rescheduleRequestedEndTime || "-"}`
          ].filter(Boolean).join(" ")}`
        : "";
      return [room, schedule, requester, status, reschedule].filter(Boolean).join(" | ");
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
        statusLabel(data.status),
        normalizeText(data.requesterEmail)
      ].filter(Boolean).join(" | ");
    }

    if (entityType === "newsItem") {
      return [normalizeText(data.title), statusLabel(data.status)].filter(Boolean).join(" | ");
    }

    if (entityType === "downloadDocument") {
      return [normalizeText(data.name), normalizeText(data.category), statusLabel(data.status)].filter(Boolean).join(" | ");
    }

    return action ? entityLabel(entityType, item.entityId) : "";
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
    query: ""
  };

  const getTypeGroup = (item = {}) => {
    const action = normalizeText(item.action);
    const entityType = normalizeText(item.entityType);
    if (action.startsWith("budget.") || entityType === "budgetApprovalRequest" || entityType === "budgetApprovalSettings") return "budget";
    if (action.startsWith("borrow.") || entityType === "borrowAssetRequest") return "borrow";
    if (action.startsWith("booking.") || action.startsWith("meeting_") || entityType.startsWith("meetingRoom")) return "booking";
    if (action.startsWith("content.") || entityType === "newsItem" || entityType === "downloadDocument") return "content";
    return "other";
  };

  const getSearchText = (item = {}) => [
    actionLabel(item.action),
    entityLabel(item.entityType, item.entityId),
    detailText(item),
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
      "ผู้ทำรายการ": item.actorEmail || "-",
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
      body.innerHTML = `<tr><td colspan="4">ยังไม่มี Activity Log</td></tr>`;
      return;
    }
    body.innerHTML = rows.map((item) => `
      <tr>
        <td>${escapeHtml(toDisplayDateTime(item.timestamp))}</td>
        <td>${escapeHtml(actionLabel(item.action))}</td>
        <td>${escapeHtml(detailText(item) || entityLabel(item.entityType, item.entityId))}</td>
        <td>${escapeHtml(normalizeText(item.actorEmail) || "-")}</td>
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
    const searchInput = document.getElementById("dashboardAuditLogSearchInput");
    const searchClear = document.getElementById("dashboardAuditLogSearchClear");
    typeFilter?.addEventListener("change", () => {
      state.filterType = normalizeText(typeFilter.value) || "all";
      renderRows(state.rows);
    });
    searchInput?.addEventListener("input", () => {
      state.query = normalizeText(searchInput.value);
      renderRows(state.rows);
    });
    searchClear?.addEventListener("click", () => {
      state.query = "";
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
