/* Modal: รายละเอียดโครงการ + PDF autofill */
function openProjectModal(project) {
  if (!projectModalEl) return;

  const code = project.code || "-";
  const name = project.name || "-";
  const yearStr = project.year ? `ปีการศึกษา ${project.year}` : "-";
  const orgName = project.orgName || "-";
  const orgGroup = project.orgGroup || "-";
  const approveStatus = project.approvalStatus || project.statusMain || "-";
  const canDownloadPdf = shouldShowPdfDownload(project);

  // title + badge ด้านบน
  projectModalTitleEl.textContent = name;
  projectModalTitleBadgeEl.textContent = code || "";

  const tags = [];
  if (orgGroup) tags.push(orgGroup);
  if (orgName) tags.push(orgName);

  projectModalHeaderRowEl.innerHTML = `
    <div class="modal-header-maincode">
      <strong>${code}</strong> · ${yearStr}
    </div>
    <div class="modal-header-tags">
      ${tags.map((t) => `<span class="modal-tag">${t}</span>`).join("")}
    </div>
  `;

  // เตรียมข้อมูลที่ใช้ต่อ
  const councilSessionText = project.councilSessionText || "-";
  const approveDate = project.approveDate || "-";
  const lastWorkDate = project.lastWorkDate || "-";
  const fundSource = project.fundSource || "-";
  const approvedBudget100 =
    project.approvedBudget100 != null ? project.approvedBudget100 : project.budget || 0;
  const approvedBudget100Text = `${formatMoney(approvedBudget100)} บาท`;

  const transferStatus = project.transferStatus || "-";
  const transferDocNo = project.transferDocNo || "-";
  const transferDiffDisplay = project.transferDiffDisplay || "-";
  const transferNetText =
    project.transferNet != null ? `${formatMoney(project.transferNet)} บาท` : "-";

  const advanceStatus = project.advanceStatus || "-";
  const advanceDocNo = project.advanceDocNo || "-";
  const advanceDue = project.advanceDueDate || "-";
  const advancePercentText =
    project.advancePercent != null
      ? project.advancePercent.toFixed(0) + "%"
      : "-";
  const advanceAmountText =
    project.advanceAmount != null ? `${formatMoney(project.advanceAmount)} บาท` : "-";

  const closeChecker = (project.closeChecker || "").trim();
  const closeDueDate = project.closeDueDate || "-";
  const actualBudgetText =
    project.actualBudget != null ? `${formatMoney(project.actualBudget)} บาท` : "-";
  const remainingBudgetText =
    project.remainingBudget != null ? `${formatMoney(project.remainingBudget)} บาท` : "-";
  const usagePercentText =
    project.usagePercent != null
      ? project.usagePercent.toFixed(2) + "%"
      : "-";
  const closeDurationText =
    project.closeDurationText || formatDaysToDeadline(project.daysToDeadline);
  const decreeNo = project.decreeNo || "-";
  const closeStatusAdvance = project.closeStatusAdvance || "-";
  const closeStatusDecree = project.closeStatusDecree || project.statusClose || "-";

  // ผู้สอบตรวจเอกสาร + contact box
  let closeCheckerHtml = "-";
  if (closeChecker) {
    const contact = assistantContactsByName[closeChecker];
    if (contact) {
      const bodyLines = [];

      if (contact.phone) {
        bodyLines.push(`
          <div>
            <span class="label">โทร</span>
            <a class="value" href="tel:${contact.phone}">${contact.phone}</a>
          </div>
        `);
      }
      if (contact.line) {
        bodyLines.push(`
          <div>
            <span class="label">LINE</span>
            <span class="value">${contact.line}</span>
          </div>
        `);
      }
      if (bodyLines.length === 0) {
        bodyLines.push(`
          <div>
            <span class="value">ยังไม่ได้บันทึกช่องทางการติดต่อเพิ่มเติม</span>
          </div>
        `);
      }

      closeCheckerHtml = `
        <button type="button" class="assistant-contact-link" data-assistant-name="${closeChecker}">
          ${closeChecker}
        </button>
        <div class="assistant-contact-box" data-assistant-box="${closeChecker}">
          <div class="assistant-contact-box-header">
            <span class="assistant-contact-title">ช่องทางการติดต่อ</span>
            <span class="assistant-contact-role">${contact.position || ""}</span>
          </div>
          <div class="assistant-contact-box-body">
            ${bodyLines.join("")}
          </div>
        </div>
      `;
    } else {
      closeCheckerHtml = closeChecker;
    }
  }

  // === layout แบบการ์ดตามภาพ ===
  const html = `
    <div class="modal-sections">

      <!-- 1) ข้อมูลโครงการ -->
      <section class="modal-section">
        <div class="modal-section-header">
          <div class="modal-section-icon icon-info">
            <span>📁</span>
          </div>
          <div class="modal-section-header-text">
            <div class="modal-section-title">ข้อมูลโครงการ</div>
            <div class="modal-section-caption">
              ข้อมูลพื้นฐานของโครงการจากระบบจัดทำโครงการ
            </div>
          </div>
        </div>
        <div class="modal-section-grid">
          <div>
            <div class="modal-item-label">รหัสโครงการ</div>
            <div class="modal-item-value">${code}</div>
          </div>
          <div>
            <div class="modal-item-label">ชื่อโครงการ</div>
            <div class="modal-item-value">${name}</div>
          </div>
          <div>
            <div class="modal-item-label">ผู้รับผิดชอบโครงการ</div>
            <div class="modal-item-value">${orgName}</div>
          </div>
          <div>
            <div class="modal-item-label">ฝ่ายที่รับผิดชอบโครงการ</div>
            <div class="modal-item-value">${orgGroup}</div>
          </div>
          <div>
            <div class="modal-item-label">ปีการศึกษา</div>
            <div class="modal-item-value">${yearStr}</div>
          </div>
        </div>
      </section>
      
      <div> <br/> </div>

      <!-- 2) อนุมัติ -->
      <section class="modal-section">
        <div class="modal-section-header">
          <div class="modal-section-icon icon-approve">
            <span>✅</span>
          </div>
          <div class="modal-section-header-text">
            <div class="modal-section-title">อนุมัติ</div>
            <div class="modal-section-caption">
              สถานะการอนุมัติและรายละเอียดจากที่ประชุมสภา
            </div>
          </div>
        </div>
        <div class="modal-section-grid">
          <div>
            <div class="modal-item-label">สถานะการอนุมัติ</div>
            <div class="modal-item-value">${approveStatus}</div>
          </div>
          <div>
            <div class="modal-item-label">ผ่านที่ประชุมสภา</div>
            <div class="modal-item-value">${councilSessionText}</div>
          </div>
          <div>
            <div class="modal-item-label">วันที่อนุมัติโครงการ</div>
            <div class="modal-item-value">${approveDate}</div>
          </div>
          <div>
            <div class="modal-item-label">วันที่ปฏิบัติงานวันสุดท้าย</div>
            <div class="modal-item-value">${lastWorkDate}</div>
          </div>
          <div>
            <div class="modal-item-label">แหล่งงบประมาณ (กองทุน)</div>
            <div class="modal-item-value">${fundSource}</div>
          </div>
          <div>
            <div class="modal-item-label">งบประมาณที่ได้รับอนุมัติ (100%)</div>
            <div class="modal-item-value">${approvedBudget100Text}</div>
          </div>
        </div>
      </section>

      <div> <br/> </div>

      <!-- 3) โอนงบประมาณ -->
      <section class="modal-section">
        <div class="modal-section-header">
          <div class="modal-section-icon icon-transfer">
            <span>💸</span>
          </div>
          <div class="modal-section-header-text">
            <div class="modal-section-title">โอนงบประมาณ</div>
            <div class="modal-section-caption">
              สถานะการโอนงบประมาณและส่วนต่างของการโอน
            </div>
          </div>
        </div>
        <div class="modal-section-grid">
          <div>
            <div class="modal-item-label">สถานะโอนงบประมาณ</div>
            <div class="modal-item-value">${transferStatus}</div>
          </div>
          <div>
            <div class="modal-item-label">เลขรันเอกสารโอนงบประมาณ</div>
            <div class="modal-item-value">${transferDocNo}</div>
          </div>
          <div>
            <div class="modal-item-label">ส่วนต่างการโอนงบประมาณ</div>
            <div class="modal-item-value">${transferDiffDisplay}</div>
          </div>
          <div>
            <div class="modal-item-label">งบประมาณสุทธิ</div>
            <div class="modal-item-value">${transferNetText}</div>
          </div>
        </div>
      </section>

      <div> <br/> </div>

      <!-- 4) ยืมรองจ่าย -->
      <section class="modal-section">
        <div class="modal-section-header">
          <div class="modal-section-icon icon-advance">
            <span>🧾</span>
          </div>
          <div class="modal-section-header-text">
            <div class="modal-section-title">ยืมรองจ่าย</div>
            <div class="modal-section-caption">
              รายละเอียดการยืมรองจ่ายและกำหนดคืนรองจ่าย
            </div>
          </div>
        </div>
        <div class="modal-section-grid">
          <div>
            <div class="modal-item-label">สถานะยืมรองจ่าย</div>
            <div class="modal-item-value">${advanceStatus}</div>
          </div>
          <div>
            <div class="modal-item-label">เลขรันเอกสารยืมรองจ่าย</div>
            <div class="modal-item-value">${advanceDocNo}</div>
          </div>
          <div>
            <div class="modal-item-label">วันที่ต้องคืนรองจ่าย</div>
            <div class="modal-item-value">${advanceDue}</div>
          </div>
          <div>
            <div class="modal-item-label">ร้อยละการยืมรองจ่าย</div>
            <div class="modal-item-value">${advancePercentText}</div>
          </div>
          <div>
            <div class="modal-item-label">จำนวนเงินยืมรองจ่าย</div>
            <div class="modal-item-value">${advanceAmountText}</div>
          </div>
        </div>
        ${
          canDownloadPdf
            ? `
        <div class="modal-actions">
          <button type="button" class="btn-primary pdf-download-btn" data-project-pdf>ดาวน์โหลดเอกสารยืมรองจ่าย (อัตโนมัติ)</button>
        </div>
        `
            : ""
        }
      </section>

      <div> <br/> </div>

      <!-- 5) ส่งปิดโครงการ -->
      <section class="modal-section">
        <div class="modal-section-header">
          <div class="modal-section-icon icon-close">
            <span>📚</span>
          </div>
          <div class="modal-section-header-text">
            <div class="modal-section-title">ส่งปิดโครงการ</div>
            <div class="modal-section-caption">
              สถานะการส่งปิดโครงการและข้อมูลการใช้งบประมาณจริง
            </div>
          </div>
        </div>
        <div class="modal-section-grid">
          <div>
            <div class="modal-item-label">ผู้สอบตรวจสอบเอกสาร</div>
            <div class="modal-item-value">${closeCheckerHtml}</div>
          </div>
          <div>
            <div class="modal-item-label">วันที่ต้องส่งเอกสารสรุปโครงการ</div>
            <div class="modal-item-value">${closeDueDate}</div>
          </div>
          <div>
            <div class="modal-item-label">งบประมาณที่ใช้จริง</div>
            <div class="modal-item-value">${actualBudgetText}</div>
          </div>
          <div>
            <div class="modal-item-label">งบประมาณคงเหลือ</div>
            <div class="modal-item-value">${remainingBudgetText}</div>
          </div>
          <div>
            <div class="modal-item-label">% การใช้งบประมาณ</div>
            <div class="modal-item-value">${usagePercentText}</div>
          </div>
          <div>
            <div class="modal-item-label">ระยะเวลาในการส่งสรุปโครงการ</div>
            <div class="modal-item-value">${closeDurationText}</div>
          </div>
          <div>
            <div class="modal-item-label">เลขฎีกา</div>
            <div class="modal-item-value">${decreeNo}</div>
          </div>
          <div>
            <div class="modal-item-label">สถานะปิดโครงการ (ยืมรองจ่าย)</div>
            <div class="modal-item-value">${closeStatusAdvance}</div>
          </div>
          <div>
            <div class="modal-item-label">สถานะปิดโครงการ (ฎีกา)</div>
            <div class="modal-item-value">${closeStatusDecree}</div>
          </div>
        </div>
      </section>

    </div>
  `;

  projectModalBodyEl.innerHTML = html;
  openDialog(projectModalEl, { focusSelector: "#projectModalClose" });

  const pdfBtn = projectModalBodyEl.querySelector("[data-project-pdf]");
  if (pdfBtn) {
    pdfBtn.addEventListener("click", () => downloadProjectPdf(project));
  }

  // toggle กล่อง contact ผู้ช่วยเหรัญญิก
  const links = projectModalBodyEl.querySelectorAll(".assistant-contact-link");
  links.forEach((link) => {
    link.addEventListener("click", () => {
      const name = link.dataset.assistantName;
      const box = projectModalBodyEl.querySelector(
        `.assistant-contact-box[data-assistant-box="${name}"]`
      );
      if (box) {
        box.classList.toggle("show");
      }
    });
  });
}

function shouldShowPdfDownload(project) {
  const status = (project.statusMain || project.approvalStatus || "").toString().trim();
  const approveDate = (project.approveDate || "").toString().trim();
  const daysToDeadline =
    typeof project.daysToDeadline === "number" && !isNaN(project.daysToDeadline)
      ? project.daysToDeadline
      : null;

  return status === "อนุมัติโครงการ" && approveDate !== "" && daysToDeadline !== null && daysToDeadline > 21;
}


function closeProjectModal() {
  if (!projectModalEl) return;
  closeDialog(projectModalEl);
}

/* ===== PDF Auto-fill ===== */
const PDF_SIGNERS = {
  treasurerName: "นายธุวานนท์ กิ้มเฉี้ยง",
  presidentName: "นางสาวเกวลี เอกโยคยะ"
};

function formatPdfNumber(value) {
  if (value === null || value === undefined || value === "" || isNaN(value)) return "";
  return formatMoney(value);
}

function formatPercentForPdf(value) {
  if (value === null || value === undefined || value === "" || isNaN(value)) return "";
  return Number(value).toFixed(0);
}

function buildPdfData(project) {
  const budget100 =
    project.approvedBudget100 != null ? project.approvedBudget100 : project.budget || 0;
  const budget80 = Math.round(budget100 * 0.8 * 100) / 100;
  const dateRange = formatThaiDateRange(project.approveDate, project.lastWorkDate);
  const evidenceDueDateText = formatThaiDateNoPrefix(project.evidenceDueDate);
  const advancePercentText = formatPercentForPdf(project.advancePercent);
  const leadInfo = getProjectLeadInfo();

  return {
    projectName: project.name || "",
    projectCode: project.code || "",
    orgName: project.orgName || "",
    orgGroup: project.orgGroup || "",
    councilSessionText: project.councilSessionText || "",
    projectDateRange: dateRange,
    approvedBudget100Text: formatPdfNumber(budget100),
    approvedBudget80Text: formatPdfNumber(budget80),
    approvedBudget100Words: thaiBahtText(budget100),
    approvedBudget80Words: thaiBahtText(budget80),
    evidenceDueDateText,
    advancePercentText,
    transferDocNo: project.transferDocNo || "",
    signerTreasurerName: PDF_SIGNERS.treasurerName,
    signerPresidentName: PDF_SIGNERS.presidentName,
    projectLeadName: leadInfo.name,
    projectLeadPhone: leadInfo.phone
  };
}

function fillPdfFields(data, rootEl = pdfRootEl) {
  if (!rootEl) return;
  rootEl.querySelectorAll("[data-pdf-field]").forEach((el) => {
    const key = el.getAttribute("data-pdf-field");
    const value = data[key];
    const text = value == null ? "" : value.toString().trim();
    el.textContent = text;
  });
}

function applyThaiSegmentation(rootEl) {
  if (!rootEl || typeof Intl === "undefined" || !Intl.Segmenter) return;

  const segmenter = new Intl.Segmenter("th", { granularity: "word" });
  const targets = rootEl.querySelectorAll(".pdf-paragraph");

  targets.forEach((el) => {
    const doc = el.ownerDocument;
    const walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach((node) => {
      const text = node.nodeValue || "";
      if (!text.trim()) return;

      const frag = doc.createDocumentFragment();
      for (const seg of segmenter.segment(text)) {
        frag.appendChild(doc.createTextNode(seg.segment));
        if (seg.isWordLike) {
          frag.appendChild(doc.createElement("wbr"));
        }
      }
      node.parentNode.replaceChild(frag, node);
    });
  });
}

function downloadProjectPdf(project) {
  if (!pdfRootEl) return;
  if (downloadPdfInSameTab(project)) return;

  const printWin = window.open("", "_blank");
  if (!printWin) {
    alert("ไม่สามารถเปิดหน้าพิมพ์ PDF ได้ กรุณาอนุญาตป๊อปอัปสำหรับหน้านี้");
    return;
  }

  openPdfPrintWindow(project, printWin);
}

function getProjectLeadInfo() {
  const name = window.prompt("กรุณากรอกชื่อประธานโครงการสำหรับใช้ใน PDF\nเช่น นายองค์การบริหาร สภานิสิต", "");
  const phone = window.prompt("กรุณากรอกเบอร์ติดต่อประธานโครงการสำหรับใช้ใน PDF\nเช่น 081-234-5678", "");
  return {
    name: (name || "").trim(),
    phone: (phone || "").trim()
  };
}

function parsePdfDate(text) {
  if (!text) return null;
  const s = text.toString().trim();
  if (!s) return null;

  let m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const day = parseInt(m[1], 10);
    const mon = parseInt(m[2], 10) - 1;
    const yr = parseInt(m[3], 10);
    const d = new Date(yr, mon, day);
    return isNaN(d.getTime()) ? null : d;
  }

  m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (m) {
    const yr = parseInt(m[1], 10);
    const mon = parseInt(m[2], 10) - 1;
    const day = parseInt(m[3], 10);
    const d = new Date(yr, mon, day);
    return isNaN(d.getTime()) ? null : d;
  }

  const direct = new Date(s);
  return isNaN(direct.getTime()) ? null : direct;
}

function parseAmountNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = parseFloat(value.toString().replace(/,/g, ""));
  return isNaN(num) ? null : num;
}

function readThaiNumberGroup(num) {
  const units = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"];
  const digits = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  let result = "";
  const str = num.toString();
  const len = str.length;

  for (let i = 0; i < len; i++) {
    const digit = parseInt(str.charAt(i), 10);
    const pos = len - i - 1;
    if (digit === 0) continue;

    if (pos === 0 && digit === 1 && len > 1) {
      result += "เอ็ด";
    } else if (pos === 1 && digit === 2) {
      result += "ยี่";
    } else if (pos === 1 && digit === 1) {
      result += "";
    } else {
      result += digits[digit];
    }
    result += units[pos];
  }

  return result;
}

function readThaiNumber(num) {
  if (num === 0) return "ศูนย์";
  if (num >= 1000000) {
    const million = Math.floor(num / 1000000);
    const rest = num % 1000000;
    const head = readThaiNumber(million) + "ล้าน";
    return rest ? head + readThaiNumber(rest) : head;
  }
  return readThaiNumberGroup(num);
}

function thaiBahtText(value) {
  const amount = parseAmountNumber(value);
  if (amount === null) return "";

  let intPart = Math.floor(amount);
  let satang = Math.round((amount - intPart) * 100);

  if (satang === 100) {
    intPart += 1;
    satang = 0;
  }

  const intText = readThaiNumber(intPart);
  if (satang === 0) {
    return `${intText}บาทถ้วน`;
  }

  const satangText = readThaiNumber(satang);
  return `${intText}บาท${satangText}สตางค์`;
}

function formatThaiDate(dateObj) {
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) return "";
  const dayMonth = new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long"
  }).format(dateObj);
  const year = dateObj.getFullYear() + 543;
  return `วันที่ ${dayMonth} พ.ศ. ${year}`;
}

function formatThaiDateRange(startRaw, endRaw) {
  const startDate = parsePdfDate(startRaw);
  const endDate = parsePdfDate(endRaw);
  const startText = formatThaiDate(startDate);
  const endText = formatThaiDate(endDate);

  if (startText && endText) return `${startText} ถึง ${endText}`;
  return startText || endText || "";
}

function formatThaiDateNoPrefix(raw) {
  const parsed = parsePdfDate(raw);
  if (!parsed || isNaN(parsed.getTime())) return (raw || "").toString().trim();
  const dayMonth = new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long"
  }).format(parsed);
  const year = parsed.getFullYear() + 543;
  return `${dayMonth} พ.ศ. ${year}`;
}

function openPdfPrintWindow(project, printWin) {
  if (!pdfRootEl) return false;

  const data = buildPdfData(project);
  const tempRoot = pdfRootEl.cloneNode(true);
  tempRoot.id = "pdfRootPrint";
  tempRoot.removeAttribute("aria-hidden");
  tempRoot.style.position = "static";
  tempRoot.style.left = "0";
  tempRoot.style.top = "0";
  tempRoot.style.visibility = "visible";
  tempRoot.style.pointerEvents = "auto";

  fillPdfFields(data, tempRoot);
  applyThaiSegmentation(tempRoot);

  const cssHref = "css/style.css";
  const fontHref =
    "https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap";

  printWin.document.open();
  printWin.document.write(`
    <!doctype html>
    <html lang="th">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>SGCU PDF</title>
        <link rel="stylesheet" href="${fontHref}" />
        <link rel="stylesheet" href="${cssHref}" />
        <style>
          body { margin: 0; background: #fff; }
          .pdf-root { position: static !important; left: 0 !important; top: 0 !important; }
        </style>
      </head>
      <body></body>
    </html>
  `);
  printWin.document.close();

  printWin.onload = () => {
    printWin.document.body.appendChild(tempRoot);
    printWin.focus();
    printWin.print();
  };

  return true;
}

function downloadPdfInSameTab(project) {
  if (!pdfRootEl) return false;

  const data = buildPdfData(project);
  const tempRoot = pdfRootEl.cloneNode(true);
  tempRoot.id = "pdfRootInline";
  tempRoot.removeAttribute("aria-hidden");
  tempRoot.style.position = "static";
  tempRoot.style.left = "0";
  tempRoot.style.top = "0";
  tempRoot.style.visibility = "visible";
  tempRoot.style.pointerEvents = "auto";

  fillPdfFields(data, tempRoot);
  applyThaiSegmentation(tempRoot);

  const iframe = document.createElement("iframe");
  iframe.className = "pdf-print-frame";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  const baseHref = new URL(".", window.location.href).href;
  doc.open();
  doc.write(`
    <!doctype html>
    <html lang="th">
      <head>
        <meta charset="UTF-8" />
        <base href="${baseHref}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>SGCU PDF</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap" />
        <link rel="stylesheet" href="css/style.css" />
        <style>
          body { margin: 0; background: #fff; }
          .pdf-root { position: static !important; left: 0 !important; top: 0 !important; }
        </style>
      </head>
      <body></body>
    </html>
  `);
  doc.close();

  const doPrint = () => {
    doc.body.appendChild(tempRoot);
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => iframe.remove(), 1000);
  };

  iframe.onload = () => {
    setTimeout(doPrint, 200);
  };

  if (iframe.contentWindow.document.readyState === "complete") {
    setTimeout(doPrint, 200);
  }

  return true;
}
