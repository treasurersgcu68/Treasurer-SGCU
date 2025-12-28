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
    const csvText = await fetchTextWithProgress(ORG_SHEET_CSV, (ratio) => {
      if (typeof updateLoaderProgress === "function") {
        updateLoaderProgress("orgStructure", ratio);
      }
    });

    const parsed = Papa.parse(csvText, {
      header: false,
      skipEmptyLines: false
    });

    const rows = parsed.data;
    renderOrgStructure(rows);
  } catch (err) {
    console.error("ERROR: โหลดข้อมูลโครงสร้างองค์กรไม่ได้  app.js:3688 - app.org.js:30", err);
    recordLoadError("orgStructure", "โหลดโครงสร้างองค์กรไม่สำเร็จ", { showRetry: true });
    setInlineError(el, "ไม่สามารถโหลดข้อมูลจาก Google Sheets ได้");
  } finally {
    toggleOrgStructureLoading(false);
    if (typeof markLoaderStep === "function") {
      markLoaderStep("orgStructure");
    }
  }
}

function renderOrgStructure(rows) {
  const container = document.getElementById("org-structure-content");
  if (!container) return;

  if (!rows || rows.length < 2) {
    container.innerHTML = `<p>ไม่พบข้อมูลในชีต</p>`;
    return;
  }

  const dataRows = rows.slice(1);

  // ====== คอลัมน์ในชีตโครงสร้างองค์กร ======
  const COL_POS    = 3;   // ตำแหน่ง
  const COL_PREFIX = 4;   // คำนำหน้า
  const COL_FIRST  = 5;   // ชื่อ
  const COL_LAST   = 6;   // นามสกุล
  const COL_NICK   = 7;   // ชื่อเล่น (ใช้เป็น key)
  const COL_YEAR   = 9;   // J ชั้นปี
  const COL_FAC    = 10;  // K คณะ
  const COL_STAFF_EMAIL = 11; // L อีเมล Staff
  const COL_LINE   = 12;
  const COL_PHONE  = 13;
  const COL_PHOTO  = 26;  // ชื่อไฟล์รูป หรือ URL

  const COL_ASSISTANT_KEY = COL_NICK; // ใช้ชื่อเล่นเป็น key

  const fullName = (r) =>
    [r[COL_PREFIX], r[COL_FIRST], r[COL_LAST]].filter(Boolean).join(" ").trim();

  const nickNameText = (r) =>
    r[COL_NICK] ? `(${r[COL_NICK]})` : "";

  const initials = (r) => {
    const f = (r[COL_FIRST] || "").charAt(0);
    const l = (r[COL_LAST] || "").charAt(0);
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
    const url = buildAvatarUrlFromCell(r[COL_PHOTO]);
    const cls = size === "sm" ? "org-node-circle sm" : "org-node-circle";
    if (url) {
      return `
        <div class="${cls}">
          <img src="${url}" alt="${fullName(r)}" loading="lazy">
        </div>
      `;
    }
    return `<div class="${cls}">${initials(r)}</div>`;
  }

  // ====== peopleByPos + assistantContactsByName (global) ======
  assistantContactsByName = {}; // reset global
  staffEmails = new Set();
  staffProfilesByEmail = {};

  const peopleByPos = {};
  for (const r of dataRows) {
    const pos = (r[COL_POS] || "").trim();
    if (!pos) continue;

    const key = (r[COL_ASSISTANT_KEY] || "").toString().trim();
    const avatarUrl = buildAvatarUrlFromCell(r[COL_PHOTO]);

    if (key) {
      assistantContactsByName[key] = {
        key,
        fullName: fullName(r),
        nick: r[COL_NICK] || "",
        position: pos,
        phone: (r[COL_PHONE] || "").toString().trim(),
        line: (r[COL_LINE] || "").toString().trim(),
        faculty: (r[COL_FAC] || "").toString().trim(),
        year: (r[COL_YEAR] || "").toString().trim(), 
        avatarUrl
      };
    }

    if (!peopleByPos[pos]) peopleByPos[pos] = [];
    peopleByPos[pos].push(r);

    const staffEmail = (r[COL_STAFF_EMAIL] || "").toString().trim().toLowerCase();
    if (staffEmail) {
      staffEmails.add(staffEmail);
      staffProfilesByEmail[staffEmail] = {
        position: pos,
        nick: (r[COL_NICK] || "").toString().trim(),
        role: "00"
      };
    }
  }

  function getPerson(position, index = 0) {
    const list = peopleByPos[position] || [];
    return list[index] || null;
  }

  function personKey(r) {
    const nick = (r[COL_NICK] || "").toString().trim();
    if (nick) return nick;
    return fullName(r);
  }

  function renderPersonNode(r, opts = {}) {
    if (!r) return "";

    const key = personKey(r);
    const size = opts.size || "lg";

    return `
      <button class="org-node" type="button" data-person-key="${key}">
        ${avatarHTML(r, size === "sm" ? "sm" : "lg")}
        <div class="org-node-role">${(r[COL_POS] || "").trim()}</div>
        <div class="org-node-name">${fullName(r)}</div>
        <div class="org-node-nick">${nickNameText(r)}</div>
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
  const depFunds    = peopleByPos["รองประธานฝ่ายหาทุนและสิทธิประโยชน์"] || []; // อาจมีหลายคน
  const depAsset    = getPerson("รองประธานฝ่ายกายภาพและพัสดุ", 0);

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

  const closeBtn = document.getElementById("personModalClose");
  const avatarEl = document.getElementById("personModalAvatar");
  const nameEl   = document.getElementById("personModalName");
  const nickEl   = document.getElementById("personModalNick");
  const posEl    = document.getElementById("personModalPosition");
  const contactEl= document.getElementById("personModalContact");

  function openModalForKey(key) {
    const info = assistantContactsByName[key];
    if (!info) return;

    // avatar
    avatarEl.innerHTML = "";
    if (info.avatarUrl) {
      avatarEl.innerHTML = `<img src="${info.avatarUrl}" alt="${info.fullName}">`;
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
          <div class="person-modal-contact-value">${info.faculty}</div>
        </div>
      `);
    }

    // ✅ แถวชั้นปี
    if (info.year) {
      rows.push(`
        <div class="person-modal-contact-row">
          <div class="person-modal-contact-label">ชั้นปี</div>
          <div class="person-modal-contact-value">ปี ${info.year}</div>
        </div>
      `);
    }

    if (info.phone) {
      rows.push(`
        <div class="person-modal-contact-row">
          <div class="person-modal-contact-label">โทร</div>
          <div class="person-modal-contact-value">
            <a href="tel:${info.phone}">${info.phone}</a>
          </div>
        </div>
      `);
    }

    if (info.line) {
      rows.push(`
        <div class="person-modal-contact-row">
          <div class="person-modal-contact-label">LINE</div>
          <div class="person-modal-contact-value">${info.line}</div>
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

}
