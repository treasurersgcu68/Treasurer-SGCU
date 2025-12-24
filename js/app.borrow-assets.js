/* Borrow assets: multi-item rows + assets table */
document.addEventListener("DOMContentLoaded", () => {
  const borrowAssetList = document.getElementById("borrowAssetList");
  const addBorrowAssetRow = document.getElementById("addBorrowAssetRow");
  const borrowAssetsTableBody = document.getElementById("borrowAssetsTableBody");
  const borrowAssetsTableBodyStaff = document.getElementById("borrowAssetsTableBodyStaff");
  if (!borrowAssetList || !addBorrowAssetRow) return;

  const assetMap = new Map();
  const BORROW_ASSETS_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQcx0zotyWntFscUtgXHg4dkJQ6xI16Xrasy58sQfr-29iwgdpujpuvLC7poHH3TG4KR6P36A-bLyZR/pub?gid=0&single=true&output=csv";

  const normalizeBool = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "y";
  };

  const parseNumber = (value) => {
    const num = Number(String(value || "").replace(/[^\d.-]/g, ""));
    return Number.isFinite(num) ? num : null;
  };

  const renderBorrowAssetsTable = (rows) => {
    if (!borrowAssetsTableBody) return;
    if (!rows.length) {
      borrowAssetsTableBody.innerHTML = `
        <tr>
          <td colspan="7">ไม่พบรายการพัสดุ</td>
        </tr>
      `;
      return;
    }
    borrowAssetsTableBody.innerHTML = rows
      .map((row) => {
        const remainingText =
          row.remaining != null
            ? `${row.remaining}${row.unit ? " " + row.unit : ""}`
            : "-";
        let statusLabel = row.approved ? "พร้อมยืม" : "ไม่อนุมัติ";
        let statusClass = row.approved ? "badge-approved" : "badge-rejected";
        if (row.remaining != null && row.remaining <= 0) {
          statusLabel = "หมด";
          statusClass = "badge-warning";
        }
        return `
          <tr>
            <td>${row.type || "-"}</td>
            <td>${row.code || "-"}</td>
            <td>${row.name || "-"}</td>
            <td>${row.location || "-"}</td>
            <td>${remainingText}</td>
            <td><span class="badge ${statusClass}">${statusLabel}</span></td>
            <td>${row.note || "-"}</td>
          </tr>
        `;
      })
      .join("");
  };

  const renderBorrowAssetsTableStaff = (rows) => {
    if (!borrowAssetsTableBodyStaff) return;
    if (!rows.length) {
      borrowAssetsTableBodyStaff.innerHTML = `
        <tr>
          <td colspan="11">ไม่พบรายการพัสดุ</td>
        </tr>
      `;
      return;
    }
    borrowAssetsTableBodyStaff.innerHTML = rows
      .map((row) => {
        return `
          <tr>
            <td>${row.type || "-"}</td>
            <td>${row.code || "-"}</td>
            <td>${row.name || "-"}</td>
            <td>${row.location || "-"}</td>
            <td>${row.total != null ? row.total : "-"}</td>
            <td>${row.approvedText || "-"}</td>
            <td>${row.borrowed != null ? row.borrowed : "-"}</td>
            <td>${row.damaged != null ? row.damaged : "-"}</td>
            <td>${row.remaining != null ? row.remaining : "-"}</td>
            <td>${row.unit || "-"}</td>
            <td>${row.note || "-"}</td>
          </tr>
        `;
      })
      .join("");
  };

  const loadBorrowAssets = () => {
    if (!window.Papa || !window.fetch) return;
    fetch(BORROW_ASSETS_CSV_URL)
      .then((res) => res.text())
      .then((csvText) => {
        const result = window.Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true
        });
        if (result.errors && result.errors.length) {
          return;
        }
        const rows = result.data
          .map((item) => {
            const type = (item["ประเภท"] || "").trim();
            const code = (item["รหัสพัสดุ"] || "").trim().toUpperCase();
            const name = (item["รายการ"] || "").trim();
            const location = (item["ที่เก็บ"] || "").trim();
            const approved = normalizeBool(item["อนุมัติการยืม"]);
            const approvedText = (item["อนุมัติการยืม"] || "").toString().trim();
            const total = parseNumber(item["จำนวนทั้งหมด"]);
            const borrowed = parseNumber(item["ยืมอยู่"]);
            const damaged = parseNumber(item["ชำรุด"]);
            const remaining = parseNumber(item["คงเหลือ"]);
            const unit = (item["หน่วย"] || "").trim();
            const note = (item["หมายเหตุ"] || "").trim();
            return {
              type,
              code,
              name,
              location,
              approved,
              approvedText,
              total,
              borrowed,
              damaged,
              remaining,
              unit,
              note
            };
          })
          .filter((row) => row.code || row.name);

        assetMap.clear();
        rows.forEach((row) => {
          if (row.code && row.name) {
            assetMap.set(row.code, row.name);
          }
        });
        renderBorrowAssetsTable(rows);
        renderBorrowAssetsTableStaff(rows);

        borrowAssetList.querySelectorAll("[data-asset-row]").forEach((row) => {
          const codeInput = row.querySelector('[data-asset-field="code"]');
          if (codeInput) {
            codeInput.dispatchEvent(new Event("input"));
          }
        });
      })
      .catch(() => {
        if (borrowAssetsTableBody) {
          borrowAssetsTableBody.innerHTML = `
            <tr>
              <td colspan="7">ไม่สามารถโหลดรายการพัสดุได้</td>
            </tr>
          `;
        }
        if (borrowAssetsTableBodyStaff) {
          borrowAssetsTableBodyStaff.innerHTML = `
            <tr>
              <td colspan="11">ไม่สามารถโหลดรายการพัสดุได้</td>
            </tr>
          `;
        }
      });
  };

  const updateRowIds = (row, index) => {
    row.querySelectorAll("[data-asset-field]").forEach((input) => {
      const field = input.dataset.assetField;
      const id = `borrowAsset${field.charAt(0).toUpperCase()}${field.slice(1)}-${index}`;
      input.id = id;
      const label = row.querySelector(`[data-asset-label="${field}"]`);
      if (label) {
        label.setAttribute("for", id);
      }
    });
  };

  const bindRow = (row) => {
    const codeInput = row.querySelector('[data-asset-field="code"]');
    const nameInput = row.querySelector('[data-asset-field="name"]');
    const warning = row.querySelector("[data-asset-warning]");
    const removeBtn = row.querySelector("[data-asset-remove]");
    if (!codeInput || !nameInput) return;

    const updateName = () => {
      const code = codeInput.value.trim().toUpperCase();
      if (!code) {
        nameInput.value = "";
        if (warning) warning.hidden = true;
        return;
      }
      const name = assetMap.get(code);
      nameInput.value = name || "";
      if (warning) warning.hidden = !!name;
    };

    codeInput.addEventListener("input", updateName);
    codeInput.addEventListener("blur", updateName);

    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        const rows = borrowAssetList.querySelectorAll("[data-asset-row]");
        if (rows.length <= 1) return;
        row.remove();
      });
    }
  };

  const firstRow = borrowAssetList.querySelector("[data-asset-row]");
  if (firstRow) {
    updateRowIds(firstRow, 1);
    bindRow(firstRow);
  }

  addBorrowAssetRow.addEventListener("click", () => {
    const rowTemplate = borrowAssetList.querySelector("[data-asset-row]");
    if (!rowTemplate) return;
    const newRow = rowTemplate.cloneNode(true);
    const nextIndex = borrowAssetList.querySelectorAll("[data-asset-row]").length + 1;
    updateRowIds(newRow, nextIndex);
    newRow.querySelectorAll("input").forEach((input) => {
      input.value = "";
    });
    const warning = newRow.querySelector("[data-asset-warning]");
    if (warning) warning.hidden = true;
    const removeBtn = newRow.querySelector("[data-asset-remove]");
    if (removeBtn) removeBtn.hidden = false;
    borrowAssetList.appendChild(newRow);
    bindRow(newRow);
  });

  loadBorrowAssets();

  const staffTabBtns = document.querySelectorAll(".tab-btn[data-assets-staff-tab]");
  const staffBorrowQueue = document.getElementById("staffBorrowQueue");
  const staffBorrowAssets = document.getElementById("staffBorrowAssets");
  if (staffTabBtns.length && staffBorrowQueue && staffBorrowAssets) {
    staffTabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.assetsStaffTab;
        staffTabBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        if (target === "queue") {
          staffBorrowQueue.style.display = "block";
          staffBorrowAssets.style.display = "none";
          staffBorrowQueue.classList.add("section-visible");
          staffBorrowAssets.classList.remove("section-visible");
        } else {
          staffBorrowQueue.style.display = "none";
          staffBorrowAssets.style.display = "block";
          staffBorrowAssets.classList.add("section-visible");
          staffBorrowQueue.classList.remove("section-visible");
        }
      });
    });
  }
});
