/* Meeting room booking staff approval (Firestore shared data) */
function initMeetingRoomStaffApproval() {
  if (window.__meetingRoomStaffInitDone) return true;
  const queueBody = document.getElementById("meetingRoomStaffQueueBody");
  const approvedCountEl = document.getElementById("meetingRoomApprovedCount");
  const pendingCountEl = document.getElementById("meetingRoomStaffPendingCount");
  const rejectedCountEl = document.getElementById("meetingRoomRejectedCount");
  const allCountEl = document.getElementById("meetingRoomAllCount");
  const allTableBody = document.getElementById("meetingRoomAllTableBody");
  const staffMeetingAllSection = document.getElementById("staffMeetingAll");
  const panelTitleEl = document.getElementById("meetingRoomStaffPanelTitle");
  const panelCaptionEl = document.getElementById("meetingRoomStaffPanelCaption");
  const roomManageForm = document.getElementById("meetingRoomManageForm");
  const roomManageInput = document.getElementById("meetingRoomManageInput");
  const roomManageMessage = document.getElementById("meetingRoomManageMessage");
  const roomManageList = document.getElementById("meetingRoomManageList");
  const roomManageCountEl = document.getElementById("meetingRoomManageCount");
  const staffCalendarPanel = document.getElementById("meetingRoomStaffCalendar");
  const staffCalendarTitle = document.getElementById("meetingStaffCalendarTitle");
  const staffCalendarPrevBtn = document.getElementById("meetingStaffCalendarPrevMonth");
  const staffCalendarNextBtn = document.getElementById("meetingStaffCalendarNextMonth");
  const tabButtons = Array.from(
    document.querySelectorAll(".tab-btn[data-meeting-staff-tab]")
  );

  if (!allTableBody) {
    return false;
  }
  window.__meetingRoomStaffInitDone = true;

  const COLLECTION_NAME = "meetingRoomBookings";
  const ROOM_COLLECTION_NAME = "meetingRooms";
  const DEFAULT_ROOMS = [
    { id: "room-1", name: "ห้องประชุม 1 ชั้น 2", isDefault: true },
    { id: "room-2", name: "ห้องประชุม 2 ชั้น 2", isDefault: true },
    { id: "room-3", name: "ห้องประชุม 3 ชั้น 2", isDefault: true }
  ];

  const firestore = window.sgcuFirestore || {};
  const hasFirestore = !!(
    firestore.db &&
    firestore.collection &&
    firestore.addDoc &&
    firestore.onSnapshot &&
    firestore.query &&
    firestore.orderBy &&
    firestore.doc &&
    firestore.deleteDoc &&
    firestore.updateDoc &&
    firestore.serverTimestamp
  );

  const normalizeStatus = (status) => {
    const value = (status || "pending").toString().trim().toLowerCase();
    if (value === "approved" || value === "rejected" || value === "cancel_requested") return value;
    return "pending";
  };

  const statusLabel = (status) => {
    if (status === "approved") return '<span class="badge badge-approved">อนุมัติแล้ว</span>';
    if (status === "rejected") return '<span class="badge badge-rejected">ปฏิเสธ</span>';
    if (status === "cancel_requested") return '<span class="badge badge-warning">ขอยกเลิก</span>';
    return '<span class="badge badge-pending">รออนุมัติ</span>';
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    });
  };

  const parseBookingEndDateTime = (booking) => {
    const dateText = String(booking?.date || "").trim();
    if (!dateText) return null;
    const endTimeText = String(booking?.endTime || "").trim() || "23:59";
    const safeTime = /^\d{1,2}:\d{2}$/.test(endTimeText) ? `${endTimeText}:00` : "23:59:59";
    const parsed = new Date(`${dateText}T${safeTime}`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    const fallback = new Date(`${dateText}T23:59:59`);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  };

  const isPastBooking = (booking) => {
    const endAt = parseBookingEndDateTime(booking);
    if (!endAt) return false;
    return endAt.getTime() < Date.now();
  };

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

  const getCalendarMonthState = (date) => {
    const safe = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
    const firstDay = new Date(safe.getFullYear(), safe.getMonth(), 1);
    return {
      year: firstDay.getFullYear(),
      month: firstDay.getMonth(),
      firstDay
    };
  };

  const toDateKey = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const escapeText = (value) => {
    const safe = (value ?? "").toString();
    return safe
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  };

  const calendarStatusClass = (status) => {
    if (status === "approved") return "approved";
    if (status === "rejected") return "cancelled";
    if (status === "cancel_requested") return "cancel-requested";
    return "pending";
  };

  const getMeetingCalendarMaxEvents = () => {
    if (window.matchMedia && window.matchMedia("(max-width: 640px)").matches) return 2;
    if (window.matchMedia && window.matchMedia("(max-width: 860px)").matches) return 3;
    return 4;
  };

  let bookings = [];
  let rooms = [...DEFAULT_ROOMS];
  let unsubscribe = null;
  let unsubscribeRooms = null;
  let hasRenderedOnce = false;
  let subscribeGuardTimer = null;
  let activeTab = "requests";
  let isSeedingDefaultRooms = false;
  let editingRoomId = "";
  let calendarCursor = new Date();

  const normalizeRoomDisplay = (roomId, roomName) => {
    const matched = rooms.find((room) => room.id === roomId);
    return matched?.name || roomName || roomId || "-";
  };

  const mapSnapshotDoc = (docItem) => {
    const data = docItem.data() || {};
    const roomId = data.roomId || "";
    return {
      id: docItem.id,
      roomId,
      roomDisplay: normalizeRoomDisplay(roomId, data.roomName),
      roomName: data.roomName || "",
      date: data.date || "",
      startTime: data.startTime || "",
      endTime: data.endTime || "",
      requester: data.requester || "",
      purpose: data.purpose || "",
      contactPhone: data.contactPhone || "",
      contactInfo: data.contactInfo || "",
      cancelRequestReason: data.cancelRequestReason || "",
      status: normalizeStatus(data.status)
    };
  };

  const setRoomManageMessage = (text = "", color = "#374151") => {
    if (!roomManageMessage) return;
    roomManageMessage.textContent = text;
    roomManageMessage.style.color = color;
  };

  const renderRoomManageList = () => {
    if (!roomManageList) return;
    if (roomManageCountEl) {
      roomManageCountEl.textContent = `พบ ${rooms.length} ห้อง`;
    }
    if (!rooms.length) {
      roomManageList.innerHTML = '<div class="meeting-room-manage-empty">ยังไม่มีห้องประชุม</div>';
      return;
    }
    roomManageList.innerHTML = rooms
      .map((room) => {
        const isEditing = editingRoomId === room.id;
        return `
          <div class="meeting-room-manage-item">
            ${isEditing
              ? `
                <input
                  type="text"
                  class="login-input meeting-room-manage-edit-input"
                  data-role="room-edit-input"
                  data-room-id="${room.id}"
                  value="${room.name}"
                  maxlength="100"
                />
              `
              : `<div class="meeting-room-manage-name">${room.name}</div>`
            }
            <div class="meeting-room-manage-actions">
              ${isEditing
                ? `
                  <button
                    type="button"
                    class="btn-primary meeting-room-manage-btn"
                    data-action="rename-room-save"
                    data-room-id="${room.id}"
                  >
                    บันทึก
                  </button>
                  <button
                    type="button"
                    class="btn-ghost meeting-room-manage-btn"
                    data-action="rename-room-cancel"
                    data-room-id="${room.id}"
                  >
                    ยกเลิก
                  </button>
                `
                : `
                  <button
                    type="button"
                    class="btn-ghost meeting-room-manage-btn"
                    data-action="rename-room-start"
                    data-room-id="${room.id}"
                  >
                    แก้ไข
                  </button>
                  <button
                    type="button"
                    class="btn-ghost meeting-room-manage-btn"
                    data-action="remove-room"
                    data-room-id="${room.id}"
                    ${room.isDefault ? "disabled" : ""}
                  >
                    ลบ
                  </button>
                `
              }
            </div>
          </div>
        `;
      })
      .join("");
  };

  const seedDefaultRoomsIfEmpty = async () => {
    if (!hasFirestore || isSeedingDefaultRooms) return;
    isSeedingDefaultRooms = true;
    try {
      for (const room of DEFAULT_ROOMS) {
        await firestore.addDoc(firestore.collection(firestore.db, ROOM_COLLECTION_NAME), {
          name: room.name,
          createdAt: firestore.serverTimestamp(),
          updatedAt: firestore.serverTimestamp()
        });
      }
    } catch (err) {
      // keep fallback rooms if seed fails
    } finally {
      isSeedingDefaultRooms = false;
    }
  };

  const subscribeRooms = () => {
    if (!hasFirestore) {
      renderRoomManageList();
      return;
    }
    try {
      const colRef = firestore.collection(firestore.db, ROOM_COLLECTION_NAME);
      unsubscribeRooms = firestore.onSnapshot(
        colRef,
        (snapshot) => {
          const loaded = snapshot.docs
            .map((docItem) => {
              const data = docItem.data() || {};
              const name = (data.name || "").toString().trim();
              if (!name) return null;
              return { id: docItem.id, name, isDefault: false };
            })
            .filter(Boolean)
            .sort((a, b) => a.name.localeCompare(b.name, "th"));
          if (!loaded.length) {
            rooms = [...DEFAULT_ROOMS];
            renderRoomManageList();
            void seedDefaultRoomsIfEmpty();
            return;
          }
          rooms = loaded;
          renderRoomManageList();
          render();
        },
        () => {
          rooms = [...DEFAULT_ROOMS];
          renderRoomManageList();
          render();
        }
      );
    } catch (err) {
      rooms = [...DEFAULT_ROOMS];
      renderRoomManageList();
      render();
    }
  };

  const addRoom = async (nameValue) => {
    const name = (nameValue || "").toString().trim().replace(/\s+/g, " ");
    if (!name) {
      setRoomManageMessage("กรุณากรอกชื่อห้องประชุม", "#b91c1c");
      return;
    }
    const duplicate = rooms.some((room) => room.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      setRoomManageMessage("มีห้องประชุมชื่อนี้อยู่แล้ว", "#b91c1c");
      return;
    }
    if (!hasFirestore) {
      setRoomManageMessage("ระบบยังไม่เชื่อมต่อ Firestore", "#b91c1c");
      return;
    }
    try {
      await firestore.addDoc(firestore.collection(firestore.db, ROOM_COLLECTION_NAME), {
        name,
        createdAt: firestore.serverTimestamp(),
        updatedAt: firestore.serverTimestamp()
      });
      setRoomManageMessage("เพิ่มห้องประชุมเรียบร้อยแล้ว", "#047857");
      if (roomManageInput) roomManageInput.value = "";
    } catch (err) {
      setRoomManageMessage("ไม่สามารถเพิ่มห้องประชุมได้ในขณะนี้", "#b91c1c");
    }
  };

  const removeRoom = async (roomId) => {
    if (!roomId || !hasFirestore) return;
    const room = rooms.find((item) => item.id === roomId);
    if (!room || room.isDefault) return;
    if (rooms.length <= 1) {
      setRoomManageMessage("ต้องมีห้องประชุมอย่างน้อย 1 ห้อง", "#b91c1c");
      return;
    }
    try {
      await firestore.deleteDoc(firestore.doc(firestore.db, ROOM_COLLECTION_NAME, roomId));
      setRoomManageMessage("ลบห้องประชุมเรียบร้อยแล้ว", "#047857");
    } catch (err) {
      setRoomManageMessage("ไม่สามารถลบห้องประชุมได้ในขณะนี้", "#b91c1c");
    }
  };

  const renameRoom = async (roomId, nextNameValue) => {
    if (!roomId || !hasFirestore) return;
    const room = rooms.find((item) => item.id === roomId);
    if (!room) return;
    const nextName = (nextNameValue || "").toString().trim().replace(/\s+/g, " ");
    if (!nextName) {
      setRoomManageMessage("กรุณากรอกชื่อห้องประชุมใหม่", "#b91c1c");
      return;
    }
    if (nextName.toLowerCase() === room.name.toLowerCase()) {
      setRoomManageMessage("ชื่อห้องประชุมยังเหมือนเดิม", "#6b7280");
      return;
    }
    const duplicate = rooms.some(
      (item) => item.id !== roomId && item.name.toLowerCase() === nextName.toLowerCase()
    );
    if (duplicate) {
      setRoomManageMessage("มีห้องประชุมชื่อนี้อยู่แล้ว", "#b91c1c");
      return;
    }
    try {
      await firestore.updateDoc(
        firestore.doc(firestore.db, ROOM_COLLECTION_NAME, roomId),
        {
          name: nextName,
          updatedAt: firestore.serverTimestamp()
        }
      );
      editingRoomId = "";
      renderRoomManageList();
      setRoomManageMessage("แก้ไขชื่อห้องประชุมเรียบร้อยแล้ว", "#047857");
    } catch (err) {
      setRoomManageMessage("ไม่สามารถแก้ไขชื่อห้องประชุมได้ในขณะนี้", "#b91c1c");
    }
  };

  const getRowActions = (booking) => {
    if (booking.status === "approved") {
      return `
        <button
          class="btn-ghost staff-room-cancel"
          type="button"
          data-action="cancel"
          data-id="${booking.id}"
        >
          ยกเลิกการอนุมัติ
        </button>
        <button
          class="btn-ghost staff-room-delete"
          type="button"
          data-action="delete"
          data-id="${booking.id}"
        >
          ลบคำขอ
        </button>
      `;
    }

    if (booking.status === "rejected") {
      return `
        <button
          class="btn-ghost staff-room-delete"
          type="button"
          data-action="delete"
          data-id="${booking.id}"
        >
          ลบคำขอ
        </button>
      `;
    }

    return `
      <button
        class="btn-primary staff-room-approve"
        type="button"
        data-action="approve"
        data-id="${booking.id}"
      >
        อนุมัติ
      </button>
      <button
        class="btn-ghost staff-room-reject"
        type="button"
        data-action="reject"
        data-id="${booking.id}"
      >
        ไม่อนุมัติ
      </button>
      <button
        class="btn-ghost staff-room-delete"
        type="button"
        data-action="delete"
        data-id="${booking.id}"
      >
        ลบคำขอ
      </button>
    `;
  };

  const getStatusOptionLabel = (value) => {
    if (value === "approved") return "อนุมัติแล้ว";
    if (value === "rejected") return "ไม่อนุมัติ";
    if (value === "cancel_requested") return "ขอยกเลิก";
    if (value === "pending") return "รออนุมัติ";
    return value;
  };

  const statusSelectClass = (value) => {
    if (value === "approved") return "is-approved";
    if (value === "rejected") return "is-rejected";
    if (value === "cancel_requested") return "is-cancel-requested";
    if (value === "delete") return "is-delete";
    return "is-pending";
  };

  const getStatusDropdown = (booking, suffix = "") => `
    <select
      class="staff-status-select ${statusSelectClass(booking.status)}"
      data-role="status-select"
      data-id="${booking.id}"
      aria-label="จัดการสถานะคำขอ${suffix ? ` (${suffix})` : ""}"
    >
      <option value="pending" ${booking.status === "pending" ? "selected" : ""}>
        ${getStatusOptionLabel("pending")}
      </option>
      <option value="approved" ${booking.status === "approved" ? "selected" : ""}>
        ${getStatusOptionLabel("approved")}
      </option>
      <option value="rejected" ${booking.status === "rejected" ? "selected" : ""}>
        ${getStatusOptionLabel("rejected")}
      </option>
      <option value="cancel_requested" ${booking.status === "cancel_requested" ? "selected" : ""}>
        ${getStatusOptionLabel("cancel_requested")}
      </option>
      <option value="delete">ลบคำขอ</option>
    </select>
  `;

  const updateTabUI = (nextTab) => {
    activeTab = nextTab === "history" ? "history" : "requests";
    tabButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.meetingStaffTab === activeTab);
    });
    if (panelTitleEl) {
      panelTitleEl.textContent = activeTab === "history" ? "ประวัติการขอ" : "รายการคำขอ";
    }
    if (panelCaptionEl) {
      panelCaptionEl.textContent = activeTab === "history"
        ? "แสดงคำขอที่เลยวันขอแล้ว"
        : "แสดงคำขอที่ยังไม่เลยวันขอ";
    }
  };

  const getVisibleRowsForActiveTab = (source) => {
    const ordered = [...source].sort((a, b) => {
      if (a.date === b.date) {
        return String(a.startTime || "").localeCompare(String(b.startTime || ""));
      }
      return String(a.date || "").localeCompare(String(b.date || ""));
    });
    const upcomingRows = ordered.filter((booking) => !isPastBooking(booking));
    const historyRows = ordered.filter((booking) => isPastBooking(booking));
    return activeTab === "history" ? historyRows : upcomingRows;
  };

  const renderStaffCalendar = (sourceRows = []) => {
    if (!staffCalendarPanel) return;

    const monthState = getCalendarMonthState(calendarCursor);
    const daysInMonth = new Date(monthState.year, monthState.month + 1, 0).getDate();
    const monthBookings = sourceRows
      .filter((item) => {
        if (!item.date) return false;
        const date = new Date(`${item.date}T00:00:00`);
        if (Number.isNaN(date.getTime())) return false;
        return date.getFullYear() === monthState.year && date.getMonth() === monthState.month;
      })
      .reduce((acc, item) => {
        if (!acc[item.date]) acc[item.date] = [];
        acc[item.date].push(item);
        return acc;
      }, {});

    Object.values(monthBookings).forEach((items) => {
      items.sort((a, b) => String(a.startTime || "").localeCompare(String(b.startTime || "")));
    });

    if (staffCalendarTitle) {
      staffCalendarTitle.textContent = `ปฏิทินคำขอจองห้องประชุม (${MONTH_NAMES_TH[monthState.month]} ${monthState.year + 543})`;
    }

    const todayKey = toDateKey(new Date());
    const maxEvents = getMeetingCalendarMaxEvents();
    const cells = [];

    for (let i = 0; i < monthState.firstDay.getDay(); i += 1) {
      cells.push('<div class="calendar-day calendar-day-empty"></div>');
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(monthState.year, monthState.month, day);
      const dateKey = toDateKey(date);
      const items = monthBookings[dateKey] || [];
      const visibleItems = items.slice(0, maxEvents);
      const remainingCount = items.length - maxEvents;
      const isToday = dateKey === todayKey;

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

      cells.push(`
        <div class="${className.join(" ")}">
          <div class="calendar-day-header">${day}</div>
          ${eventRows}
          ${moreText}
        </div>
      `);
    }

    staffCalendarPanel.innerHTML = cells.join("");
  };

  const render = () => {
    hasRenderedOnce = true;
    if (subscribeGuardTimer) {
      window.clearTimeout(subscribeGuardTimer);
      subscribeGuardTimer = null;
    }
    const sorted = [...bookings].sort((a, b) => {
      const aDate = `${a.date}T${a.startTime || "00:00"}`;
      const bDate = `${b.date}T${b.startTime || "00:00"}`;
      return aDate.localeCompare(bDate);
    });

    const pending = sorted.filter(
      (booking) => booking.status === "pending" || booking.status === "cancel_requested"
    );
    const pendingCount = pending.length;
    const approvedCount = sorted.filter((booking) => booking.status === "approved").length;
    const rejectedCount = sorted.filter((booking) => booking.status === "rejected").length;

    if (queueBody) {
      if (!pending.length) {
        queueBody.innerHTML = `
          <tr>
            <td colspan="7">ยังไม่มีคำขอรออนุมัติ</td>
          </tr>
        `;
      } else {
        queueBody.innerHTML = pending
          .map((booking) => {
            const roomName = normalizeRoomDisplay(booking.roomId, booking.roomName);
            const dateText = formatDate(booking.date);
            const timeText = `${booking.startTime || "-"} - ${booking.endTime || "-"}`;
            return `
              <tr data-booking-id="${booking.id}">
                <td>${roomName}</td>
                <td>${dateText}</td>
                <td>${timeText}</td>
                <td>${booking.requester || "-"}</td>
                <td>${booking.purpose || "-"}</td>
                <td>${statusLabel(booking.status)}</td>
                <td>
                  ${getStatusDropdown(booking, "คิวรออนุมัติ")}
                </td>
              </tr>
            `;
          })
          .join("");
      }
    }

    if (approvedCountEl) approvedCountEl.textContent = approvedCount;
    if (pendingCountEl) pendingCountEl.textContent = pendingCount;
    if (rejectedCountEl) rejectedCountEl.textContent = rejectedCount;
    if (allCountEl) allCountEl.textContent = `พบ ${sorted.length} รายการ`;

    const rowsForTab = getVisibleRowsForActiveTab(sorted);
    const emptyText = activeTab === "history"
      ? "ยังไม่มีประวัติการขอ"
      : "ยังไม่มีรายการคำขอที่ยังไม่เลยวัน";

    allTableBody.innerHTML = rowsForTab.length
      ? rowsForTab
          .map((booking) => {
            const roomName = normalizeRoomDisplay(booking.roomId, booking.roomName);
            const dateText = formatDate(booking.date);
            const timeText = `${booking.startTime || "-"} - ${booking.endTime || "-"}`;
            return `
              <tr data-booking-id="${booking.id}">
                <td>${roomName}</td>
                <td>${dateText}</td>
                <td>${timeText}</td>
                <td>${booking.requester || "-"}</td>
                <td>${booking.purpose || "-"}</td>
                <td>
                  ${getStatusDropdown(booking, activeTab === "history" ? "ประวัติการขอ" : "รายการคำขอ")}
                </td>
              </tr>
            `;
          })
          .join("")
      : `
          <tr>
            <td colspan="6">${emptyText}</td>
          </tr>
        `;

    if (staffMeetingAllSection) {
      staffMeetingAllSection.style.display = "block";
    }
    renderStaffCalendar(rowsForTab);
  };

  const setStatusById = async (id, status) => {
    if (!hasFirestore || !id) return;
    try {
      await firestore.updateDoc(
        firestore.doc(firestore.db, COLLECTION_NAME, id),
        {
          status,
          updatedAt: firestore.serverTimestamp()
        }
      );
    } catch (err) {
      // ignore approval errors
    }
  };

  const deleteById = async (id) => {
    if (!hasFirestore || !id) return;
    try {
      await firestore.deleteDoc(firestore.doc(firestore.db, COLLECTION_NAME, id));
    } catch (err) {
      // ignore delete errors
    }
  };

  const subscribeBookings = () => {
    if (!hasFirestore) return;
    try {
      const colRef = firestore.collection(firestore.db, COLLECTION_NAME);
      const q = firestore.query(colRef, firestore.orderBy("startAt", "asc"));
      if (subscribeGuardTimer) {
        window.clearTimeout(subscribeGuardTimer);
      }
      subscribeGuardTimer = window.setTimeout(() => {
        if (hasRenderedOnce) return;
        allTableBody.innerHTML = `
          <tr>
            <td colspan="6">โหลดข้อมูลนานผิดปกติ โปรดลองรีเฟรชหน้าอีกครั้ง</td>
          </tr>
        `;
      }, 8000);
      unsubscribe = firestore.onSnapshot(
        q,
        (snapshot) => {
          bookings = snapshot.docs.map(mapSnapshotDoc);
          render();
        },
        (err) => {
          const detail = err?.code ? ` (${err.code})` : "";
          if (queueBody) {
            queueBody.innerHTML = `
              <tr>
                <td colspan="7">ไม่สามารถโหลดข้อมูลได้${detail}</td>
              </tr>
            `;
          }
          allTableBody.innerHTML = `
            <tr>
              <td colspan="6">ไม่สามารถโหลดข้อมูลได้${detail}</td>
            </tr>
          `;
          renderStaffCalendar([]);
        }
      );
    } catch (err) {
      const detail = err?.code ? ` (${err.code})` : "";
      if (queueBody) {
        queueBody.innerHTML = `
          <tr>
            <td colspan="7">ไม่สามารถเชื่อมต่อ Firestore ได้${detail}</td>
          </tr>
        `;
      }
      allTableBody.innerHTML = `
        <tr>
          <td colspan="6">ไม่สามารถเชื่อมต่อ Firestore ได้${detail}</td>
        </tr>
      `;
      renderStaffCalendar([]);
    }
  };

  const root = (queueBody || allTableBody).closest(".page");
  if (root) {
    if (tabButtons.length) {
      tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          updateTabUI(btn.dataset.meetingStaffTab || "requests");
          render();
        });
      });
    }

    root.addEventListener("click", (event) => {
      const clickedElement = event.target;
      if (!(clickedElement instanceof HTMLElement)) return;

      const interactiveEl = clickedElement.closest(
        "button, select, input, textarea, a, [data-action], [data-role]"
      );
      if (!interactiveEl) {
        const row = clickedElement.closest("tr[data-booking-id]");
        const bookingId = row?.dataset?.bookingId || "";
        if (bookingId && typeof window.openMeetingBookingDetailModal === "function") {
          const booking = bookings.find((item) => item.id === bookingId);
          if (booking) {
            window.openMeetingBookingDetailModal(booking, { includeContact: true });
            return;
          }
        }
      }

      const button = event.target;
      if (!(button instanceof HTMLButtonElement)) return;
      const action = button.dataset.action;
      const id = button.dataset.id;
      if (action === "rename-room-start") {
        const roomId = button.dataset.roomId;
        if (!roomId) return;
        editingRoomId = roomId;
        renderRoomManageList();
        window.setTimeout(() => {
          const input = root.querySelector(
            `.meeting-room-manage-edit-input[data-room-id="${roomId}"]`
          );
          if (input instanceof HTMLInputElement) {
            input.focus();
            input.select();
          }
        }, 0);
        return;
      }
      if (action === "rename-room-cancel") {
        editingRoomId = "";
        renderRoomManageList();
        return;
      }
      if (action === "rename-room-save") {
        const roomId = button.dataset.roomId;
        if (!roomId) return;
        const input = root.querySelector(
          `.meeting-room-manage-edit-input[data-room-id="${roomId}"]`
        );
        const nextName = input instanceof HTMLInputElement ? input.value : "";
        void renameRoom(roomId, nextName);
        return;
      }
      if (action === "remove-room") {
        const roomId = button.dataset.roomId;
        if (!roomId) return;
        void removeRoom(roomId);
        return;
      }
      if (!id) return;
      if (action === "approve") {
        setStatusById(id, "approved");
      } else if (action === "reject") {
        setStatusById(id, "rejected");
      } else if (action === "cancel") {
        setStatusById(id, "pending");
      } else if (action === "delete") {
        deleteById(id);
      }
    });

    root.addEventListener("change", (event) => {
      const select = event.target;
      if (!(select instanceof HTMLSelectElement)) return;
      if (select.dataset.role !== "status-select") return;
      const id = select.dataset.id;
      const value = (select.value || "").toString();
      if (!id || !value) return;
      select.classList.remove("is-pending", "is-approved", "is-rejected", "is-cancel-requested", "is-delete");
      select.classList.add(statusSelectClass(value));

      const booking = bookings.find((item) => item.id === id);
      if (value === "delete") {
        deleteById(id);
        return;
      }
      if (value !== "pending" && value !== "approved" && value !== "rejected" && value !== "cancel_requested") return;
      if (booking && booking.status === value) return;
      setStatusById(id, value);
    });

    root.addEventListener("keydown", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.dataset.role !== "room-edit-input") return;
      if (event.key !== "Enter") return;
      event.preventDefault();
      const roomId = target.dataset.roomId || "";
      if (!roomId) return;
      void renameRoom(roomId, target.value);
    });

    if (staffCalendarPanel) {
      staffCalendarPanel.addEventListener("click", (event) => {
        const target = event.target.closest(".calendar-event[data-booking-id]");
        if (!target || !target.dataset.bookingId) return;
        const booking = bookings.find((item) => item.id === target.dataset.bookingId);
        if (!booking) return;
        if (typeof window.openMeetingBookingDetailModal === "function") {
          window.openMeetingBookingDetailModal(booking, { includeContact: true });
        }
      });
    }
  }

  updateTabUI(activeTab);
  renderStaffCalendar([]);

  if (staffCalendarPrevBtn) {
    staffCalendarPrevBtn.addEventListener("click", () => {
      calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
      renderStaffCalendar(getVisibleRowsForActiveTab(bookings));
    });
  }

  if (staffCalendarNextBtn) {
    staffCalendarNextBtn.addEventListener("click", () => {
      calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
      renderStaffCalendar(getVisibleRowsForActiveTab(bookings));
    });
  }

  if (roomManageForm) {
    roomManageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      void addRoom(roomManageInput?.value || "");
    });
  }
  renderRoomManageList();

  if (!hasFirestore) {
    rooms = [...DEFAULT_ROOMS];
    renderRoomManageList();
    setRoomManageMessage("ระบบยังไม่เชื่อมต่อ Firestore", "#b91c1c");
    if (queueBody) {
      queueBody.innerHTML = `
        <tr>
          <td colspan="7">ระบบยังไม่เชื่อมต่อ Firestore โปรดตรวจสอบการตั้งค่า</td>
        </tr>
      `;
    }
    allTableBody.innerHTML = `
      <tr>
        <td colspan="6">ระบบยังไม่เชื่อมต่อ Firestore โปรดตรวจสอบการตั้งค่า</td>
      </tr>
    `;
    if (approvedCountEl) approvedCountEl.textContent = "0";
    if (pendingCountEl) pendingCountEl.textContent = "0";
    if (rejectedCountEl) rejectedCountEl.textContent = "0";
    if (allCountEl) allCountEl.textContent = "พบ 0 รายการ";
    renderStaffCalendar([]);
    return;
  }

  subscribeRooms();
  subscribeBookings();
  window.addEventListener("beforeunload", () => {
    if (typeof unsubscribe === "function") {
      unsubscribe();
    }
    if (typeof unsubscribeRooms === "function") {
      unsubscribeRooms();
    }
  });
  return true;
}

function bootstrapMeetingRoomStaffApproval() {
  let attempts = 0;
  const maxAttempts = 20;
  const attemptInit = () => {
    const initialized = initMeetingRoomStaffApproval();
    if (initialized) return;
    attempts += 1;
    if (attempts < maxAttempts) {
      window.setTimeout(attemptInit, 300);
    }
  };
  attemptInit();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapMeetingRoomStaffApproval);
} else {
  bootstrapMeetingRoomStaffApproval();
}

window.addEventListener("hashchange", () => {
  if (window.location.hash === "#meeting-room-staff") {
    initMeetingRoomStaffApproval();
  }
});

window.initMeetingRoomStaffApproval = initMeetingRoomStaffApproval;
