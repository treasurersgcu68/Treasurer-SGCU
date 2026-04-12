/* Org Structure (Home section: แผนผังทีมเหรัญญิก) */
function toggleOrgStructureLoading(isLoading) {
  const container = document.getElementById("org-structure-content");
  if (orgStructureSkeletonEl) {
    orgStructureSkeletonEl.style.display = isLoading ? "grid" : "none";
  }
  if (container) {
    container.style.display = isLoading ? "none" : "";
  }
}

async function loadOrgStructure() {
  toggleOrgStructureLoading(true);
  const el = document.getElementById("org-structure-content");
  try {
    const structureCsvText = await fetchTextWithProgress(ORG_STRUCTURE_SHEET_CSV, (ratio) => {
      if (typeof updateLoaderProgress === "function") {
        updateLoaderProgress("orgStructure", ratio);
      }
    });

    const parsed = Papa.parse(structureCsvText, {
      header: false,
      skipEmptyLines: false
    });
    let authRows = null;
    try {
      const authCsvText = await fetchTextWithProgress(ORG_SHEET_CSV);
      const authParsed = Papa.parse(authCsvText, {
        header: false,
        skipEmptyLines: false
      });
      authRows = authParsed.data;
    } catch (authErr) {
      console.error("WARN: โหลดข้อมูล staff auth ไม่สำเร็จ, ใช้ข้อมูลเดิมต่อ - app.org.js:35", authErr);
    }

    const rows = parsed.data;
    renderOrgStructure(rows, authRows);
  } catch (err) {
    console.error("ERROR: โหลดข้อมูลโครงสร้างองค์กรไม่ได้  app.js:3688 - app.org.js:41", err);
    recordLoadError("orgStructure", "โหลดโครงสร้างองค์กรไม่สำเร็จ", { showRetry: true });
    setInlineError(el, "ไม่สามารถโหลดข้อมูลจาก Google Sheets ได้");
  } finally {
    toggleOrgStructureLoading(false);
    if (typeof markLoaderStep === "function") {
      markLoaderStep("orgStructure");
    }
  }
}

function renderOrgStructure(rows, authRows = null) {
  const container = document.getElementById("org-structure-content");
  if (!container) return;
  const esc = (value) =>
    typeof escapeHtml === "function"
      ? escapeHtml(value)
      : (value ?? "")
          .toString()
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll("\"", "&quot;")
          .replaceAll("'", "&#39;");

  if (!rows || rows.length < 2) {
    container.innerHTML = `<p>ไม่พบข้อมูลในชีต</p>`;
    return;
  }

  const dataRows = rows.slice(1);

  // ====== คอลัมน์ในชีตโครงสร้างองค์กร (ORG_STRUCTURE_SHEET_CSV หลังลบ A-B) ======
  const STRUCT_COL_POS = 1;    // เดิม D -> ใหม่ B
  const STRUCT_COL_PREFIX = 2; // เดิม E -> ใหม่ C
  const STRUCT_COL_FIRST = 3;  // เดิม F -> ใหม่ D
  const STRUCT_COL_LAST = 4;   // เดิม G -> ใหม่ E
  const STRUCT_COL_NICK = 5;   // เดิม H -> ใหม่ F
  const STRUCT_COL_YEAR = 7;   // เดิม J -> ใหม่ H
  const STRUCT_COL_FAC = 8;    // เดิม K -> ใหม่ I
  const STRUCT_COL_LINE = 10;  // เดิม M -> ใหม่ K
  const STRUCT_COL_PHONE = 11; // เดิม N -> ใหม่ L
  const STRUCT_COL_PHOTO = 13; // เดิม AA -> ใหม่ N

  // ====== คอลัมน์ในชีตสิทธิ์ (ORG_SHEET_CSV: คงเดิม) ======
  const AUTH_COL_POS = 3;
  const AUTH_COL_PREFIX = 4;
  const AUTH_COL_FIRST = 5;
  const AUTH_COL_LAST = 6;
  const AUTH_COL_NICK = 7;
  const AUTH_COL_YEAR = 9;
  const AUTH_COL_FAC = 10;
  const AUTH_COL_LINE = 12;
  const AUTH_COL_PHONE = 13;
  const AUTH_COL_PHOTO = 26;
  const AUTH_COL_STAFF_EMAIL = 28;
  const AUTH_COL_STAFF_ROLE = 27;
  const COL_STAFF_EMAIL_LEGACY =
    typeof globalThis.COL_STAFF_EMAIL_LEGACY === "number"
      ? globalThis.COL_STAFF_EMAIL_LEGACY
      : -1;

  const fullName = (r, cols) =>
    [r[cols.prefix], r[cols.first], r[cols.last]].filter(Boolean).join(" ").trim();

  const nickNameText = (r, cols) =>
    r[cols.nick] ? `(${r[cols.nick]})` : "";

  const initials = (r, cols) => {
    const f = (r[cols.first] || "").charAt(0);
    const l = (r[cols.last] || "").charAt(0);
    const s = (f + l).toUpperCase();
    return s || "SG";
  };

  const AVATAR_BASE_PATH = "img/org/";

  function buildAvatarUrlFromCell(raw) {
    if (!raw) return "";

    let val = raw.toString().trim();
    if (!val) return "";

    // ถ้าเป็นลิงก์ Google Drive / URL
    if (/^https?:\/\//i.test(val)) {
      const mFile = val.match(/https:\/\/drive\.google\.com\/file\/d\/([^/]+)\//);
      if (mFile && mFile[1]) {
        return `https://drive.google.com/uc?export=view&id=${mFile[1]}`;
      }
      const mId = val.match(/[?&]id=([^&]+)/);
      if (mId && mId[1]) {
        return `https://drive.google.com/uc?export=view&id=${mId[1]}`;
      }
      return val;
    }

    // ถ้าเป็นชื่อไฟล์ธรรมดา
    val = val.replace(/\s+/g, "");
    if (!val.includes(".")) {
      val = `${val}.jpg`;
    }
    return `${AVATAR_BASE_PATH}${val}`;
  }

  function avatarHTML(r, size) {
    const url = buildAvatarUrlFromCell(r[STRUCT_COL_PHOTO]);
    const cls = size === "sm" ? "org-node-circle sm" : "org-node-circle";
    if (url) {
      return `
        <div class="${cls}">
          <img
            src="${esc(url)}"
            alt="${esc(fullName(r, { prefix: STRUCT_COL_PREFIX, first: STRUCT_COL_FIRST, last: STRUCT_COL_LAST }))}"
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            width="128"
            height="128"
          >
        </div>
      `;
    }
    return `<div class="${cls}">${esc(initials(r, { first: STRUCT_COL_FIRST, last: STRUCT_COL_LAST }))}</div>`;
  }

  // ====== peopleByPos + assistantContactsByName (global) ======
  assistantContactsByName = {}; // reset global
  const authDataRows = Array.isArray(authRows) && authRows.length > 1 ? authRows.slice(1) : null;
  if (authDataRows) {
    staffEmails = new Set();
    staffProfilesByEmail = {};
  }

  const peopleByPos = {};
  for (const r of dataRows) {
    const pos = (r[STRUCT_COL_POS] || "").trim();
    if (!pos) continue;
    if (!peopleByPos[pos]) peopleByPos[pos] = [];
    peopleByPos[pos].push(r);

  }

  // ข้อมูล contact สำหรับ popup/Project Modal ใช้จาก ORG_SHEET_CSV
  // ถ้าโหลด ORG_SHEET_CSV ไม่สำเร็จ ค่อย fallback ไปข้อมูลโครงสร้าง
  const contactRows = authDataRows || dataRows;
  const contactCols = authDataRows
    ? {
        pos: AUTH_COL_POS,
        prefix: AUTH_COL_PREFIX,
        first: AUTH_COL_FIRST,
        last: AUTH_COL_LAST,
        nick: AUTH_COL_NICK,
        year: AUTH_COL_YEAR,
        fac: AUTH_COL_FAC,
        line: AUTH_COL_LINE,
        phone: AUTH_COL_PHONE,
        photo: AUTH_COL_PHOTO
      }
    : {
        pos: STRUCT_COL_POS,
        prefix: STRUCT_COL_PREFIX,
        first: STRUCT_COL_FIRST,
        last: STRUCT_COL_LAST,
        nick: STRUCT_COL_NICK,
        year: STRUCT_COL_YEAR,
        fac: STRUCT_COL_FAC,
        line: STRUCT_COL_LINE,
        phone: STRUCT_COL_PHONE,
        photo: STRUCT_COL_PHOTO
      };
  for (const r of contactRows) {
    const key = (r[contactCols.nick] || "").toString().trim();
    if (!key) continue;
    const pos = (r[contactCols.pos] || "").trim();
    const avatarUrl = buildAvatarUrlFromCell(r[contactCols.photo]);
    assistantContactsByName[key] = {
      key,
      fullName: fullName(r, contactCols),
      nick: r[contactCols.nick] || "",
      position: pos,
      phone: (r[contactCols.phone] || "").toString().trim(),
      line: (r[contactCols.line] || "").toString().trim(),
      faculty: (r[contactCols.fac] || "").toString().trim(),
      year: (r[contactCols.year] || "").toString().trim(),
      avatarUrl
    };
  }

  if (authDataRows) {
    for (const r of authDataRows) {
      const pos = (r[AUTH_COL_POS] || "").trim();
      const legacyStaffEmail =
        COL_STAFF_EMAIL_LEGACY >= 0 ? r[COL_STAFF_EMAIL_LEGACY] : "";
      const staffEmail = (r[AUTH_COL_STAFF_EMAIL] || legacyStaffEmail || "")
        .toString()
        .trim()
        .toLowerCase();
      if (!staffEmail) continue;
      staffEmails.add(staffEmail);
      const nextRole = (r[AUTH_COL_STAFF_ROLE] || "").toString().trim() || "0";
      const existingProfile = staffProfilesByEmail[staffEmail];
      if (existingProfile) {
        const mergedRoles = new Set(
          [existingProfile.role, nextRole]
            .flatMap((value) => (value || "").toString().split(","))
            .map((value) => value.trim())
            .filter(Boolean)
        );
        staffProfilesByEmail[staffEmail] = {
          position: existingProfile.position || pos,
          nick: existingProfile.nick || (r[AUTH_COL_NICK] || "").toString().trim(),
          role: Array.from(mergedRoles).join(",")
        };
      } else {
        staffProfilesByEmail[staffEmail] = {
          position: pos,
          nick: (r[AUTH_COL_NICK] || "").toString().trim(),
          role: nextRole
        };
      }
    }
  }

  function getPerson(position, index = 0) {
    const list = peopleByPos[position] || [];
    return list[index] || null;
  }

  function getUniquePeople(position) {
    const list = peopleByPos[position] || [];
    const seen = new Set();
    return list.filter((r) => {
      const nick = (r[STRUCT_COL_NICK] || "").toString().trim();
      const identity =
        nick ||
        fullName(r, {
          prefix: STRUCT_COL_PREFIX,
          first: STRUCT_COL_FIRST,
          last: STRUCT_COL_LAST
        });
      if (!identity || seen.has(identity)) return false;
      seen.add(identity);
      return true;
    });
  }

  function personKey(r) {
    const nick = (r[STRUCT_COL_NICK] || "").toString().trim();
    if (nick) return nick;
    return fullName(r, {
      prefix: STRUCT_COL_PREFIX,
      first: STRUCT_COL_FIRST,
      last: STRUCT_COL_LAST
    });
  }

  function renderPersonNode(r, opts = {}) {
    if (!r) return "";

    const key = personKey(r);
    const size = opts.size || "lg";

    return `
      <button class="org-node" type="button" data-person-key="${esc(key)}">
        ${avatarHTML(r, size === "sm" ? "sm" : "lg")}
        <div class="org-node-role">${esc((r[STRUCT_COL_POS] || "").trim())}</div>
        <div class="org-node-name">${esc(fullName(r, { prefix: STRUCT_COL_PREFIX, first: STRUCT_COL_FIRST, last: STRUCT_COL_LAST }))}</div>
        <div class="org-node-nick">${esc(nickNameText(r, { nick: STRUCT_COL_NICK }))}</div>
      </button>
    `;
  }

  // กล่องผู้ช่วย: fixed label ตามรูป, ไม่ผูก popup
  function renderAssistantBox(labelText) {
    if (!labelText) return "";
    return `
      <div class="org-node-assistant-box">
        ${labelText}
      </div>
    `;
  }

  // ====== ดึงคนตามตำแหน่งหลัก ๆ ตามรูปโครงสร้าง ======
  const treasurer   = getPerson("เหรัญญิก", 0);

  const secretary1  = getPerson("เลขานุการฝ่ายเหรัญญิก", 0);
  const secretary2  = getPerson("เลขานุการฝ่ายเหรัญญิก", 1);

  const headBudget  = getPerson("ประธานฝ่ายบริหารและพัฒนางบประมาณ", 0);
  const headFund    = getPerson("ประธานฝ่ายหาทุนและสิทธิประโยชน์", 0);

  // ประธานฝ่ายกายภาพและพัสดุ 2 คน
  const headAsset1  = getPerson("ประธานฝ่ายกายภาพและพัสดุ", 0);
  const headAsset2  = getPerson("ประธานฝ่ายกายภาพและพัสดุ", 1);

  const depBudget   = getPerson("รองประธานฝ่ายบริหารและพัฒนางบประมาณ", 0);
  const depFunds    = getUniquePeople("รองประธานฝ่ายหาทุนและสิทธิประโยชน์").slice(0, 2);
  const depAsset    = getPerson("รองประธานฝ่ายกายภาพและพัสดุ", 0);
  const secAssets   = getUniquePeople("เลขานุการฝ่ายกายภาพและพัสดุ");

  // ====== ประกอบ HTML Org Tree ======
  let html = `
    <div class="org-tree">

      <!-- Level 1: เหรัญญิก -->
      <div class="org-level">
        ${treasurer
          ? renderPersonNode(treasurer, { size: "lg" })
          : "<p>ไม่พบข้อมูลเหรัญญิก</p>"}
      </div>

      <!-- เส้นลงมาเชื่อมกับเลขาฯ -->
      <div class="org-line-vertical"></div>

      <!-- Level 2: เลขานุการ 2 คน -->
      <div class="org-level org-level-secretaries">
        ${secretary1 ? renderPersonNode(secretary1, { size: "sm" }) : ""}
        ${secretary2 ? renderPersonNode(secretary2, { size: "sm" }) : ""}
      </div>

      <!-- เส้นแนวนอนเชื่อมไปยัง 3 ประธาน -->
      <div class="org-connector-wide"></div>

      <!-- Level 3: ผู้ช่วยเหรัญญิก + สามประธาน -->
      <div class="org-level org-level-main-branches">

        <!-- LEFT: ผู้ช่วยเหรัญญิก -->
        <div class="org-left-asst" style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
          ${renderAssistantBox("ผู้ช่วยเหรัญญิกฝ่ายเทคโนโลยีสารสนเทศ")}
          ${renderAssistantBox("ผู้ช่วยเหรัญญิกส่วนกลาง")}
          ${renderAssistantBox("ผู้ช่วยเหรัญญิกฝ่ายศิลปะและวัฒนธรรม")}
          ${renderAssistantBox("ผู้ช่วยเหรัญญิกฝ่ายวิชาการ")}
          ${renderAssistantBox("ผู้ช่วยเหรัญญิกฝ่ายกีฬา")}
          ${renderAssistantBox("ผู้ช่วยเหรัญญิกฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์")}
        </div>

        <!-- RIGHT: สามสาขา -->
        <div class="org-right-branches">

          <!-- Branch: บริหารและพัฒนางบประมาณ -->
          <div class="org-branch org-branch-budget">
            <div class="org-branch-head">
              ${headBudget ? renderPersonNode(headBudget, { size: "lg" }) : ""}
            </div>
            <div class="org-branch-dep">
              ${depBudget ? renderPersonNode(depBudget, { size: "sm" }) : ""}
            </div>
            <div class="org-branch-assistant">
              ${renderAssistantBox("ผู้ช่วยฝ่ายบริหารและพัฒนางบประมาณ")}
            </div>
          </div>

          <!-- Branch: หาทุนและสิทธิประโยชน์ -->
          <div class="org-branch org-branch-fund">
            <div class="org-branch-head">
              ${headFund ? renderPersonNode(headFund, { size: "lg" }) : ""}
            </div>
            <div class="org-branch-dep org-level-depfund">
              ${depFunds.map(p => renderPersonNode(p, { size: "sm" })).join("")}
            </div>
            <div class="org-branch-assistant">
              ${renderAssistantBox("ผู้ช่วยฝ่ายหาทุนและสิทธิประโยชน์")}
            </div>
          </div>

          <!-- Branch: กายภาพและพัสดุ (ประธาน 2 คน) -->
          <div class="org-branch org-branch-asset">
            <div class="org-branch-head org-level-asset-heads">
              ${headAsset1 ? renderPersonNode(headAsset1, { size: "lg" }) : ""}
              ${headAsset2 ? renderPersonNode(headAsset2, { size: "lg" }) : ""}
            </div>
            <div class="org-branch-dep">
              ${depAsset ? renderPersonNode(depAsset, { size: "sm" }) : ""}
            </div>
            <div class="org-branch-secretary">
              ${secAssets.length
                ? secAssets.map(p => renderPersonNode(p, { size: "sm" })).join("")
                : renderAssistantBox("เลขานุการฝ่ายกายภาพและพัสดุ")}
            </div>
            <div class="org-branch-assistant">
              ${renderAssistantBox("ผู้ช่วยฝ่ายกายภาพและพัสดุ")}
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  if (refreshAuthDisplayFn && window.sgcuAuth?.auth?.currentUser) {
    refreshAuthDisplayFn(window.sgcuAuth.auth.currentUser);
  }

  // ผูก popup ให้เฉพาะปุ่มคน (วงกลม)
  initOrgPersonPopup();
}

function initOrgPersonPopup() {
  const modal = document.getElementById("personModal");
  if (!modal) return;
  const esc = (value) =>
    typeof escapeHtml === "function"
      ? escapeHtml(value)
      : (value ?? "")
          .toString()
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll("\"", "&quot;")
          .replaceAll("'", "&#39;");

  const closeBtn = document.getElementById("personModalClose");
  const dialogEl = modal.querySelector(".person-modal-dialog");
  const avatarEl = document.getElementById("personModalAvatar");
  const nameEl   = document.getElementById("personModalName");
  const nickEl   = document.getElementById("personModalNick");
  const posEl    = document.getElementById("personModalPosition");
  const contactEl= document.getElementById("personModalContact");

  function syncPersonModalSize() {
    if (!dialogEl) return;
    const hasRoom = window.innerWidth >= 1180 && window.innerHeight >= 760;
    dialogEl.classList.toggle("is-roomy", hasRoom);
  }

  function openModalForKey(key) {
    const info = assistantContactsByName[key];
    if (!info) return;

    // avatar
    avatarEl.innerHTML = "";
    if (info.avatarUrl) {
      const img = document.createElement("img");
      img.src = info.avatarUrl;
      img.alt = info.fullName || key;
      avatarEl.appendChild(img);
    } else {
      const initials = (info.fullName || "SG")
        .split(" ")
        .map((s) => s.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
      avatarEl.textContent = initials;
    }

    posEl.textContent  = info.position || "";
    nameEl.textContent = info.fullName || key;
    nickEl.textContent = info.nick ? `(${info.nick})` : "";

    const rows = [];

    if (info.faculty) {
      rows.push(`
        <div class="person-modal-contact-row">
          <div class="person-modal-contact-label">คณะ</div>
          <div class="person-modal-contact-value">${esc(info.faculty)}</div>
        </div>
      `);
    }

    // ✅ แถวชั้นปี
    if (info.year) {
      rows.push(`
        <div class="person-modal-contact-row">
          <div class="person-modal-contact-label">ชั้นปี</div>
          <div class="person-modal-contact-value">ปี ${esc(info.year)}</div>
        </div>
      `);
    }

    if (info.phone) {
      const safePhone = info.phone.toString().replace(/[^\d+\-()\s]/g, "").trim();
      rows.push(`
        <div class="person-modal-contact-row">
          <div class="person-modal-contact-label">โทร</div>
          <div class="person-modal-contact-value">
            <a href="tel:${esc(safePhone)}">${esc(info.phone)}</a>
          </div>
        </div>
      `);
    }

    if (info.line) {
      rows.push(`
        <div class="person-modal-contact-row">
          <div class="person-modal-contact-label">LINE</div>
          <div class="person-modal-contact-value">${esc(info.line)}</div>
        </div>
      `);
    }

    if (!rows.length) {
      rows.push(`
        <div class="person-modal-contact-row">
          <div class="person-modal-contact-value">
            ยังไม่มีข้อมูลช่องทางการติดต่อเพิ่มเติม
          </div>
        </div>
      `);
    }

    contactEl.innerHTML = rows.join("");

    syncPersonModalSize();
    openDialog(modal, { focusSelector: "#personModalClose" });
  }

  // ผูก event กับทุก node ที่มี data-person-key
  document
  .querySelectorAll(".org-node[data-person-key]")
  .forEach((el) => {
    el.addEventListener("click", () => {
      const key = el.dataset.personKey;
      if (!key) return;
      openModalForKey(key);
    });
  });

  function closeModal() {
    closeDialog(modal);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("person-modal-backdrop")) {
      closeModal();
    }
  });

  window.addEventListener("resize", () => {
    if (!modal.classList.contains("show")) return;
    syncPersonModalSize();
  });

}
