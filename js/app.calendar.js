/*******************************************************
 *  Calendar System — ใช้ข้อมูลจาก projects เดิม
 *  ไม่ต้องโหลดชีตเพิ่ม / ไม่ต้องมี URL ใหม่
 *******************************************************/

let calendarEvents = [];
let calendarEventsByDate = new Map();
let currentCalendarDate = new Date();

/**
 * แปลง status จากข้อมูลโครงการ → pending / approved / closed
 */
function mapProjectStatusToCalendarStatus(p) {
  const main = (p.statusMain || "").trim();
  const ar = (p.statusClose || "").trim();
  const as = (p.statusCloseDecree || "").trim();

  // ปิดโครงการแล้ว
  if (ar === "ส่งกิจการนิสิตเรียบร้อย" || as === "ปิดโครงการเรียบร้อย") {
    return "closed";
  }

  // อนุมัติโครงการแล้ว
  if (main === "อนุมัติโครงการ") {
    return "approved";
  }

  // อย่างอื่นถือเป็น pending
  return "pending";
}


function buildCalendarEventsFromProjects() {
  if (!Array.isArray(projects) || projects.length === 0) {
    calendarEvents = [];
    calendarEventsByDate = new Map();
    return;
  }

  calendarEvents = projects
    // ตัดโครงการที่ "ยกเลิกโครงการ" ออกเหมือนเดิม
    .filter((p) => (p.statusMain || "").trim() !== "ยกเลิกโครงการ")
    .map((p) => {
      // ✅ ใช้วันที่จากคอลัมน์ M เท่านั้น (lastWorkDate)
      const dateStr = p.lastWorkDate;
      let parsedDate = p.lastWorkDateObj;
      if (!parsedDate) {
        parsedDate = parseProjectDate(dateStr);
        if (parsedDate) p.lastWorkDateObj = parsedDate;
      }

      if (!parsedDate) return null; // ถ้า M ว่าง/อ่านไม่ได้ → ไม่เอาใส่ปฏิทิน

      const status = mapProjectStatusToCalendarStatus(p);

      return {
        title: p.name || "(ไม่ระบุชื่อโครงการ)",
        start: parsedDate,
        end: parsedDate,
        org: p.orgName || "(ไม่ระบุฝ่าย/ชมรม)",
        year: p.year || "ไม่ระบุ",
        status,
        code: p.code || "-",
        note: `รหัสโครงการ: ${p.code || "-"}`,
        budgetSource: p.fundSource || "-"
      };
    })
    .filter(Boolean);

  calendarEventsByDate = new Map();
  calendarEvents.forEach((ev) => {
    const d = ev.start;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    if (!calendarEventsByDate.has(key)) {
      calendarEventsByDate.set(key, []);
    }
    calendarEventsByDate.get(key).push(ev);
  });
}


/**
 * เตรียม Filter (ปี / องค์กร) จาก calendarEvents
 */
function initCalendarFilters() {
  const yearSelect = calendarYearSelectEl;
  const orgSelect = calendarOrgSelectEl;

  if (!yearSelect || !orgSelect) return;

  // reset options (เหลือค่า all ไว้)
  yearSelect.innerHTML = `<option value="all">ทุกปีการศึกษา</option>`;
  orgSelect.innerHTML = `<option value="all">ทุกฝ่าย / ทุกชมรม</option>`;

  const years = Array.from(new Set(calendarEvents.map((e) => e.year).filter(Boolean)));
  years.sort();
  years.forEach((y) => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  });

  const orgs = Array.from(new Set(calendarEvents.map((e) => e.org).filter(Boolean)));
  orgs.sort();
  orgs.forEach((o) => {
    const opt = document.createElement("option");
    opt.value = o;
    opt.textContent = o;
    orgSelect.appendChild(opt);
  });
}

/**
 * คืนรายการ events ที่อยู่ในวัน date และผ่านเงื่อนไข filter
 */
function getEventsForDate(date) {
  const yearSel = calendarYearSelectEl;
  const orgSel = calendarOrgSelectEl;
  const statusSel = calendarStatusSelectEl;

  const yearFilter = yearSel ? yearSel.value : "all";
  const orgFilter = orgSel ? orgSel.value : "all";
  const statusFilter = statusSel ? statusSel.value : "all";

  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
  const baseEvents = calendarEventsByDate.get(key) || [];

  return baseEvents.filter((ev) => {
    if (yearFilter !== "all" && ev.year !== yearFilter) return false;
    if (orgFilter !== "all" && ev.org !== orgFilter) return false;
    if (statusFilter !== "all" && ev.status !== statusFilter) return false;

    return true;
  });
}

/**
 * อัปเดตหัวปฏิทิน (ชื่อเดือน + ปี)
 */
function updateCalendarHeader() {
  const panel = calendarPanelTitleEl;
  if (!panel) return;

  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
    "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
    "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const y = currentCalendarDate.getFullYear();
  const m = currentCalendarDate.getMonth();

  panel.textContent = `ปฏิทินกิจกรรม — ${monthNames[m]} ${y}`;
}

function getHeatmapLevel(count, maxCount) {
  if (!count || maxCount <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count >= 3 && count <= 5) return 3;
  if (count >= 6 && count <= 10) return 4;
  return 5;
}

function getCalendarMaxEvents() {
  if (window.matchMedia && window.matchMedia("(max-width: 640px)").matches) return 2;
  if (window.matchMedia && window.matchMedia("(max-width: 840px)").matches) return 3;
  return 4;
}

/**
 * วาดปฏิทินตาม currentCalendarDate
 */
function generateCalendar() {
  const container = calendarContainerEl;
  if (!container) return;

  container.innerHTML = "";

  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  // วันแรกของเดือน
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay(); // 0=Sun,1=Mon,...

  // จำนวนวันในเดือน
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // เติมช่องว่างก่อนวันที่ 1
  for (let i = 0; i < startWeekday; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day calendar-day-empty";
    container.appendChild(emptyCell);
  }

  // เติมวันที่ 1..daysInMonth
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";

    const header = document.createElement("div");
    header.className = "calendar-day-header";
    header.textContent = day;
    cell.appendChild(header);

    const thisDate = new Date(year, month, day);
    const isToday =
      thisDate.getFullYear() === todayY &&
      thisDate.getMonth() === todayM &&
      thisDate.getDate() === todayD;
    if (isToday) {
      cell.classList.add("calendar-day-today");
      const pill = document.createElement("span");
      pill.className = "calendar-today-pill";
      pill.textContent = "วันนี้";
      header.appendChild(pill);
    }

    const todaysEvents = getEventsForDate(thisDate);
    const MAX_EVENTS = getCalendarMaxEvents();
    const visibleEvents = todaysEvents.slice(0, MAX_EVENTS);

    if (todaysEvents.length) {
      cell.classList.add("calendar-day-has-events");
    }

    visibleEvents.forEach((ev) => {
      const evDiv = document.createElement("div");
      evDiv.className = `calendar-event ${ev.status}`;
      evDiv.textContent = ev.title;
      evDiv.title = ev.title;

      evDiv.addEventListener("click", () => openCalendarModal(ev));

      cell.appendChild(evDiv);
    });

    const remaining = todaysEvents.length - MAX_EVENTS;
    if (remaining > 0) {
      const moreDiv = document.createElement("div");
      moreDiv.className = "calendar-event calendar-more";
      moreDiv.textContent = `และอื่น ๆ อีก ${remaining} โครงการ`;
      moreDiv.addEventListener("click", () => openCalendarDayModal(thisDate, todaysEvents));
      cell.appendChild(moreDiv);
    }

    // คลิกที่หัววันเพื่อดูรายการทั้งหมดของวันนั้น
    if (todaysEvents.length > 0) {
      header.addEventListener("click", () => {
        openCalendarDayModal(thisDate, todaysEvents);
      });
    }

    container.appendChild(cell);
  }

  updateCalendarHeader();
}

/**
 * เปิด Modal รายละเอียดกิจกรรม
 */
function openCalendarModal(ev) {
  const modal = document.getElementById("calendarModal");
  const titleEl = document.getElementById("calendarModalTitle");
  const bodyEl = document.getElementById("calendarModalBody");
  if (!modal || !titleEl || !bodyEl) return;

  titleEl.textContent = ev.title;

  const fmt = (d) =>
    d && d instanceof Date && !isNaN(d.getTime())
      ? d.toLocaleDateString("th-TH")
      : "-";

  bodyEl.innerHTML = `
    <div class="modal-section">
      <div class="modal-section-title">
        <span class="icon">📅</span> รายละเอียดกิจกรรม
      </div>
      <div class="modal-section-grid">
        <div>
          <div class="modal-item-label">ชื่อโครงการ / กิจกรรม</div>
          <div class="modal-item-value">${ev.title}</div>
        </div>
        <div>
          <div class="modal-item-label">วันที่</div>
          <div class="modal-item-value">${fmt(ev.start)}</div>
        </div>
        <div>
          <div class="modal-item-label">ฝ่าย / ชมรม</div>
          <div class="modal-item-value">${ev.org}</div>
        </div>
        <div>
          <div class="modal-item-label">แหล่งงบประมาณ</div>
          <div class="modal-item-value">${ev.budgetSource || "-"}</div>
        </div>
        <div>
          <div class="modal-item-label">ปีการศึกษา</div>
          <div class="modal-item-value">${ev.year}</div>
        </div>
        <div>
          <div class="modal-item-label">สถานะ</div>
          <div class="modal-item-value">
            ${
              ev.status === "closed"
                ? "ปิดโครงการแล้ว"
                : ev.status === "approved"
                ? "อนุมัติโครงการแล้ว"
                : "อยู่ระหว่างดำเนินการ"
            }
          </div>
        </div>
        ${
          ev.note
            ? `
        <div>
          <div class="modal-item-label">หมายเหตุ</div>
          <div class="modal-item-value">${ev.note}</div>
        </div>`
            : ""
        }
      </div>
    </div>
  `;

  openDialog(modal, { focusSelector: "#calendarModalClose" });
}

function openCalendarDayModal(dateObj, events) {
  const modal = document.getElementById("calendarModal");
  const titleEl = document.getElementById("calendarModalTitle");
  const bodyEl = document.getElementById("calendarModalBody");
  if (!modal || !titleEl || !bodyEl) return;
  if (!dateObj || !Array.isArray(events) || !events.length) return;

  const dateText = dateObj.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  titleEl.textContent = `โครงการวันที่ ${dateText}`;

  const rows = events
    .map((ev, idx) => {
      const statusText =
        ev.status === "closed"
          ? "ปิดโครงการแล้ว"
          : ev.status === "approved"
          ? "อนุมัติโครงการแล้ว"
          : "อยู่ระหว่างดำเนินการ";
      return `
        <tr data-day-idx="${idx}">
          <td>
            ${ev.code || "-"}
          </td>
          <td>
            <div class="modal-table-title">${ev.title}</div>
            <div class="modal-table-caption">${ev.org || "-"}</div>
          </td>
          <td>
            <span class="status-pill status-${ev.status}">${statusText}</span>
          </td>
        </tr>
      `;
    })
    .join("");

  bodyEl.innerHTML = `
    <div class="modal-table-wrap">
      <table class="modal-table">
        <thead>
          <tr>
            <th>รหัสโครงการ</th>
            <th>ชื่อโครงการ</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;

  // คลิกแถวเพื่อเปิดรายละเอียดโครงการเดียว
  bodyEl.querySelectorAll("tr[data-day-idx]").forEach((row) => {
    const idx = Number(row.getAttribute("data-day-idx"));
    const ev = events[idx];
    if (!ev) return;
    row.addEventListener("click", () => openCalendarModal(ev));
  });
  openDialog(modal, { focusSelector: "#calendarModalClose" });
}

function closeCalendarModal() {
  const modal = document.getElementById("calendarModal");
  if (!modal) return;
  closeDialog(modal);
}

/**
 * initCalendar — เรียกหลังจาก loadProjectsFromSheet() เสร็จ
 */
function initCalendar(ctxKey = activeProjectStatusContext) {
  setActiveProjectStatusContext(ctxKey);

  const prevBtn = prevMonthBtnEl;
  const nextBtn = nextMonthBtnEl;
  const modal = document.getElementById("calendarModal");
  const modalClose = document.getElementById("calendarModalClose");

  // สร้าง events จาก projects
  buildCalendarEventsFromProjects();
  // ตั้งค่า filter
  initCalendarFilters();
  // วาดปฏิทินครั้งแรก
  generateCalendar();

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      setActiveProjectStatusContext(ctxKey);
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
      generateCalendar();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      setActiveProjectStatusContext(ctxKey);
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
      generateCalendar();
    });
  }

  [calendarYearSelectEl, calendarOrgSelectEl, calendarStatusSelectEl].forEach((el) => {
    if (el) {
      el.addEventListener("change", () => {
        setActiveProjectStatusContext(ctxKey);
        generateCalendar();
      });
    }
  });

  if (modalClose) {
    modalClose.addEventListener("click", closeCalendarModal);
  }
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeCalendarModal();
      }
    });
  }
}
