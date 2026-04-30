/* Public meeting room calendar viewer */
(function initPublicMeetingRoomCalendar() {
  if (window.__sgcuPublicMeetingCalendarInitDone) return;
  window.__sgcuPublicMeetingCalendarInitDone = true;

  const calendarPanel = document.getElementById("meetingPublicCalendar");
  const calendarTitle = document.getElementById("meetingPublicCalendarTitle");
  const stateEl = document.getElementById("meetingPublicCalendarState");
  const prevBtn = document.getElementById("meetingPublicCalendarPrevMonth");
  const nextBtn = document.getElementById("meetingPublicCalendarNextMonth");
  const todayBtn = document.getElementById("meetingPublicCalendarToday");

  const dayModalEl = document.getElementById("meetingPublicBookingDayModal");
  const dayModalTitleEl = document.getElementById("meetingPublicBookingDayTitle");
  const dayModalBodyEl = document.getElementById("meetingPublicBookingDayBody");
  const dayModalCloseEl = document.getElementById("meetingPublicBookingDayClose");

  if (!calendarPanel || !calendarTitle || !stateEl) return;

  const BOOKING_COLLECTION_NAME = "meetingRoomBookings";
  const ROOM_COLLECTION_NAME = "meetingRooms";
  const HOLIDAY_COLLECTION_NAME = "meetingRoomHolidays";
  const DEFAULT_MEETING_ROOMS = [
    { id: "room-1", name: "ห้องประชุม 1 ชั้น 2" },
    { id: "room-2", name: "ห้องประชุม 2 ชั้น 2" },
    { id: "room-3", name: "ห้องประชุม 3 ชั้น 2" }
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

  let firestore = window.sgcuFirestore || {};
  let hasFirestore = false;
  let bookings = [];
  let meetingRooms = [...DEFAULT_MEETING_ROOMS];
  let holidayLookup = new Map();
  let activeDayDate = "";
  let calendarCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const resolveFirestoreBridge = () => {
    firestore = window.sgcuFirestore || {};
    hasFirestore = !!(
      firestore.db &&
      firestore.collection &&
      firestore.onSnapshot &&
      firestore.query &&
      firestore.orderBy
    );
    return hasFirestore;
  };

  const normalizeStatus = (status) => {
    const value = (status || "pending").toString().trim().toLowerCase();
    if (
      value === "approved" ||
      value === "rejected" ||
      value === "cancel_requested" ||
      value === "reschedule_requested" ||
      value === "no_show"
    ) {
      return value;
    }
    return "pending";
  };

  const getHolidayYears = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  };

  const buildDefaultHolidayLookup = () => {
    const map = new Map();
    getHolidayYears().forEach((year) => {
      DEFAULT_THAI_PUBLIC_HOLIDAYS.forEach((item) => {
        map.set(`${year}-${item.md}`, item.name);
      });
    });
    return map;
  };

  const refreshHolidayLookup = (customHolidays = []) => {
    holidayLookup = buildDefaultHolidayLookup();
    customHolidays.forEach((item) => {
      if (!item?.date) return;
      const name = (item.name || "").toString().trim() || "วันหยุด";
      holidayLookup.set(item.date, name);
    });
  };

  const escapeText = (text) =>
    String(text || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const normalizeRoomDisplay = (roomId, roomName) =>
    meetingRooms.find((room) => room.id === roomId)?.name || roomName || roomId || "-";

  const toDateKey = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDate = (dateText = "") => {
    if (!dateText) return "-";
    const parsed = new Date(`${dateText}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return dateText;
    return parsed.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
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

  const getHolidayName = (date, dateKey) => {
    const explicit = holidayLookup.get(dateKey);
    if (explicit) return explicit;
    if (date.getDay() === 0) return "วันหยุดสุดสัปดาห์";
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

  const statusText = (status) => {
    const normalized = safeStatus(status);
    if (normalized === "approved") return "อนุมัติแล้ว";
    if (normalized === "cancel_requested") return "ขอยกเลิก (รออนุมัติ)";
    if (normalized === "reschedule_requested") return "ขอเปลี่ยนเวลา (รออนุมัติ)";
    if (normalized === "no_show") return "ไม่มาใช้ห้อง (No-show)";
    if (normalized === "rejected") return "ไม่อนุมัติ / ยกเลิกแล้ว";
    return "รออนุมัติ";
  };

  const statusBadgeClass = (status) => {
    const normalized = safeStatus(status);
    if (normalized === "approved") return "badge-approved";
    if (normalized === "rejected") return "badge-rejected";
    if (normalized === "cancel_requested" || normalized === "reschedule_requested" || normalized === "no_show") {
      return "badge-warning";
    }
    return "badge-pending";
  };

  const calendarStatusClass = (status) => {
    const normalized = safeStatus(status);
    if (normalized === "approved") return "approved";
    if (normalized === "rejected") return "cancelled";
    if (normalized === "cancel_requested" || normalized === "reschedule_requested" || normalized === "no_show") {
      return "cancel-requested";
    }
    return "pending";
  };

  const getCalendarMonthState = (dateLike = new Date()) => {
    const safe = new Date(dateLike);
    return {
      year: safe.getFullYear(),
      month: safe.getMonth(),
      firstDay: new Date(safe.getFullYear(), safe.getMonth(), 1)
    };
  };

  const getCalendarMaxEvents = () => {
    if (window.matchMedia && window.matchMedia("(max-width: 640px)").matches) return 2;
    if (window.matchMedia && window.matchMedia("(max-width: 860px)").matches) return 3;
    return 4;
  };

  const parseDateTime = (date, time) => {
    const parsed = new Date(`${date || ""}T${time || ""}:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    return null;
  };

  const sortBookings = (list) =>
    [...list].sort((a, b) => {
      const aTime = parseDateTime(a.date, a.startTime)?.getTime() || Number.MAX_SAFE_INTEGER;
      const bTime = parseDateTime(b.date, b.startTime)?.getTime() || Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

  const setState = (text = "", color = "#6b7280") => {
    stateEl.textContent = text;
    stateEl.style.color = color;
  };

  const openModal = (modalEl) => {
    if (!modalEl) return;
    modalEl.classList.add("show");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-modal");
  };

  const closeModal = (modalEl) => {
    if (!modalEl) return;
    modalEl.classList.remove("show");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-modal");
  };

  const setDayModalBody = (dateText = "") => {
    if (!dayModalBodyEl || !dayModalTitleEl) return;
    const items = sortBookings(bookings.filter((item) => item.date === dateText && item.status !== "rejected"));
    dayModalTitleEl.textContent = `รายการจองวันที่ ${formatLongDate(dateText)} (${items.length} รายการ)`;

    if (!items.length) {
      dayModalBodyEl.innerHTML = '<div class="section-text-sm">ไม่มีรายการจองในวันที่เลือก</div>';
      return;
    }

    dayModalBodyEl.innerHTML = `
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
            ${items
              .map(
                (item) => `
                  <tr>
                    <td>${escapeText(`${item.startTime || "-"} - ${item.endTime || "-"}`)}</td>
                    <td>${escapeText(normalizeRoomDisplay(item.roomId, item.roomName))}</td>
                    <td>${escapeText(item.requester || "-")}</td>
                    <td>${escapeText(item.purpose || "-")}</td>
                    <td><span class="badge ${statusBadgeClass(item.status)}">${escapeText(statusText(item.status))}</span></td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  };

  const openDayModal = (dateText = "") => {
    if (!dateText) return;
    activeDayDate = dateText;
    setDayModalBody(dateText);
    openModal(dayModalEl);
  };

  const renderCalendar = () => {
    const selectedMonthStart = getCalendarMonthState(calendarCursor);
    const daysInMonth = new Date(selectedMonthStart.year, selectedMonthStart.month + 1, 0).getDate();
    const todayKey = toDateKey(new Date());
    const maxEvents = getCalendarMaxEvents();

    const monthBookings = bookings
      .filter((item) => {
        if (!item.date || item.status === "rejected") return false;
        const date = new Date(`${item.date}T00:00:00`);
        if (Number.isNaN(date.getTime())) return false;
        return (
          date.getFullYear() === selectedMonthStart.year &&
          date.getMonth() === selectedMonthStart.month
        );
      })
      .reduce((acc, item) => {
        if (!acc[item.date]) acc[item.date] = [];
        acc[item.date].push(item);
        return acc;
      }, {});

    Object.values(monthBookings).forEach((items) => {
      items.sort((a, b) => (a.startTime || "00:00").localeCompare(b.startTime || "00:00"));
    });

    calendarTitle.textContent = `ปฏิทินจองห้องประชุม — ${MONTH_NAMES_TH[selectedMonthStart.month]} ${selectedMonthStart.year}`;

    const cells = [];
    for (let i = 0; i < selectedMonthStart.firstDay.getDay(); i += 1) {
      cells.push('<div class="calendar-day calendar-day-empty"></div>');
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(selectedMonthStart.year, selectedMonthStart.month, day);
      const dateKey = toDateKey(date);
      const items = monthBookings[dateKey] || [];
      const visibleItems = items.slice(0, maxEvents);
      const remainingCount = Math.max(items.length - maxEvents, 0);
      const isToday = dateKey === todayKey;
      const holidayName = getHolidayName(date, dateKey);
      const isHoliday = !!holidayName;

      const eventRows = visibleItems
        .map((item) => {
          const roomName = normalizeRoomDisplay(item.roomId, item.roomName);
          const label = `${item.startTime || "-"}-${item.endTime || "-"} ${roomName}`;
          return `<div class="calendar-event ${calendarStatusClass(item.status)}" title="${escapeText(
            `${roomName} · ${item.startTime || "-"}-${item.endTime || "-"} · ${item.requester || "-"}`
          )}">${escapeText(label)}</div>`;
        })
        .join("");

      const moreText =
        remainingCount > 0
          ? `<div class="calendar-event calendar-more">และอีก ${remainingCount} รายการ</div>`
          : "";

      const classes = ["calendar-day"];
      if (isToday) classes.push("calendar-day-today");
      if (items.length) classes.push("calendar-day-has-events");
      if (isHoliday) classes.push("calendar-day-holiday");

      cells.push(`
        <div class="${classes.join(" ")}" data-date="${dateKey}">
          <div class="calendar-day-header">
            ${day}
            ${isToday ? '<span class="calendar-today-pill">วันนี้</span>' : ""}
            ${isHoliday ? `<span class="calendar-holiday-pill" title="${escapeText(holidayName)}">วันหยุด</span>` : ""}
          </div>
          ${eventRows}
          ${moreText}
        </div>
      `);
    }

    calendarPanel.innerHTML = cells.join("");

    if (!bookings.length) {
      setState("ยังไม่มีรายการจองห้องประชุม", "#6b7280");
      return;
    }

    const visibleCount = bookings.filter((item) => item.status !== "rejected").length;
    const monthVisibleCount = Object.values(monthBookings).reduce(
      (sum, items) => sum + (Array.isArray(items) ? items.length : 0),
      0
    );
    const latestBooking = sortBookings(bookings).slice(-1)[0];
    const latestText = latestBooking
      ? `${formatDate(latestBooking.date)} ${latestBooking.startTime || "-"}-${latestBooking.endTime || "-"}`
      : "-";
    setState(
      `เดือนนี้ ${monthVisibleCount} รายการ • ทั้งหมด ${visibleCount} รายการ • อัปเดตล่าสุด ${latestText}`,
      "#6b7280"
    );
  };

  const subscribeRooms = () => {
    const colRef = firestore.collection(firestore.db, ROOM_COLLECTION_NAME);
    firestore.onSnapshot(
      colRef,
      (snapshot) => {
        const loadedRooms = snapshot.docs
          .map((docItem) => {
            const data = docItem.data() || {};
            const name = (data.name || "").toString().trim();
            if (!name) return null;
            return {
              id: docItem.id,
              name
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.name.localeCompare(b.name, "th"));

        meetingRooms = loadedRooms.length ? loadedRooms : [...DEFAULT_MEETING_ROOMS];
        renderCalendar();
        if (activeDayDate) setDayModalBody(activeDayDate);
      },
      () => {
        meetingRooms = [...DEFAULT_MEETING_ROOMS];
        renderCalendar();
      }
    );
  };

  const subscribeHolidays = () => {
    const colRef = firestore.collection(firestore.db, HOLIDAY_COLLECTION_NAME);
    const q = firestore.query(colRef, firestore.orderBy("date", "asc"));
    firestore.onSnapshot(
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
        renderCalendar();
      },
      () => {
        refreshHolidayLookup([]);
        renderCalendar();
      }
    );
  };

  const subscribeBookings = () => {
    const colRef = firestore.collection(firestore.db, BOOKING_COLLECTION_NAME);
    firestore.onSnapshot(
      colRef,
      (snapshot) => {
        bookings = snapshot.docs.map((docItem) => {
          const data = docItem.data() || {};
          const normalizedStatus = normalizeStatus(data.status);
          return {
            id: docItem.id,
            roomId: data.roomId || "",
            roomName: data.roomName || "",
            date: data.date || "",
            startTime: data.startTime || "",
            endTime: data.endTime || "",
            requester: data.requester || "",
            purpose: data.purpose || "",
            status: normalizedStatus
          };
        });
        renderCalendar();
        if (activeDayDate) setDayModalBody(activeDayDate);
      },
      (err) => {
        const code = (err?.code || "").toString().trim();
        if (code === "permission-denied") {
          setState("ไม่สามารถอ่านข้อมูลได้: โปรดเปิดสิทธิ์อ่านปฏิทินใน Firestore Rules", "#b91c1c");
          return;
        }
        setState("โหลดข้อมูลการจองไม่สำเร็จในขณะนี้", "#b91c1c");
      }
    );
  };

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
      renderCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
      renderCalendar();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener("click", () => {
      const now = new Date();
      calendarCursor = new Date(now.getFullYear(), now.getMonth(), 1);
      renderCalendar();
    });
  }

  calendarPanel.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const dayCard = target.closest(".calendar-day[data-date]");
    if (!dayCard || !dayCard.dataset.date) return;
    openDayModal(dayCard.dataset.date);
  });

  if (dayModalCloseEl) {
    dayModalCloseEl.addEventListener("click", () => {
      closeModal(dayModalEl);
      activeDayDate = "";
    });
  }

  if (dayModalEl) {
    dayModalEl.addEventListener("click", (event) => {
      if (event.target === dayModalEl) {
        closeModal(dayModalEl);
        activeDayDate = "";
      }
    });
  }

  refreshHolidayLookup([]);
  renderCalendar();

  if (!resolveFirestoreBridge()) {
    setState("กำลังเชื่อมต่อข้อมูล...", "#6b7280");
    const start = Date.now();
    const timer = window.setInterval(() => {
      if (resolveFirestoreBridge()) {
        window.clearInterval(timer);
        subscribeRooms();
        subscribeBookings();
        subscribeHolidays();
        return;
      }
      if (Date.now() - start > 15000) {
        window.clearInterval(timer);
        setState("ไม่สามารถเชื่อมต่อ Firestore ได้", "#b91c1c");
      }
    }, 300);
    return;
  }

  subscribeRooms();
  subscribeBookings();
  subscribeHolidays();
})();
