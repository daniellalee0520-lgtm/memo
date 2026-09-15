const STORAGE_KEY = "my-item-manager-v2-1";


let state = {
  people: ["自己"],
  currentPerson: "自己",
  items: []
};


// ============================
// 初始化
// ============================

document.addEventListener("DOMContentLoaded", () => {

  loadData();

  renderPeopleSelect();
  renderCategoryFilter();
  renderItems();
  updateDashboard();

});


// ============================
// 数据保存
// ============================

function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );

}


function loadData() {

  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return;

  try {

    const data = JSON.parse(saved);

    if (data.people) {
      state.people = data.people;
    }

    if (data.currentPerson) {
      state.currentPerson = data.currentPerson;
    }

    if (data.items) {
      state.items = data.items;
    }

  } catch (error) {

    console.error("读取数据失败", error);

  }

}


// ============================
// 管理对象
// ============================

function renderPeopleSelect() {

  const select = document.getElementById("personSelect");

  select.innerHTML = "";

  state.people.forEach(person => {

    const option = document.createElement("option");

    option.value = person;
    option.textContent = person;

    if (person === state.currentPerson) {
      option.selected = true;
    }

    select.appendChild(option);

  });

}


function changePerson() {

  state.currentPerson =
    document.getElementById("personSelect").value;

  saveData();

  renderItems();
  updateDashboard();

}


function openPeopleModal() {

  renderPeopleList();

  document
    .getElementById("peopleModal")
    .classList.add("show");

}


function closePeopleModal() {

  document
    .getElementById("peopleModal")
    .classList.remove("show");

}


function renderPeopleList() {

  const container =
    document.getElementById("peopleList");

  container.innerHTML = "";

  state.people.forEach(person => {

    const div = document.createElement("div");

    div.className = "person-item";

    div.innerHTML = `
      <strong>${escapeHTML(person)}</strong>
      ${
        state.people.length > 1
        ? `<button onclick="deletePerson('${escapeJS(person)}')">删除</button>`
        : ""
      }
    `;

    container.appendChild(div);

  });

}


function addPerson() {

  const input =
    document.getElementById("newPersonName");

  const name = input.value.trim();

  if (!name) return;

  if (state.people.includes(name)) {

    alert("这个管理对象已经存在");

    return;

  }

  state.people.push(name);

  state.currentPerson = name;

  input.value = "";

  saveData();

  renderPeopleSelect();
  renderPeopleList();
  renderItems();
  updateDashboard();

}


function deletePerson(person) {

  if (state.people.length <= 1) {

    alert("至少需要保留一个管理对象");

    return;

  }

  if (
    !confirm(
      `确定删除「${person}」这个管理对象吗？`
    )
  ) {

    return;

  }

  state.people =
    state.people.filter(p => p !== person);

  if (state.currentPerson === person) {

    state.currentPerson =
      state.people[0];

  }

  saveData();

  renderPeopleSelect();
  renderPeopleList();
  renderItems();
  updateDashboard();

}


// ============================
// 分类
// ============================

function renderCategoryFilter() {

  const select =
    document.getElementById("categoryFilter");

  const current =
    select.value || "all";

  const categories =
    [
      ...new Set(
        state.items
          .filter(item =>
            item.person === state.currentPerson
          )
          .map(item => item.category)
          .filter(Boolean)
      )
    ]
    .sort();

  select.innerHTML =
    `<option value="all">全部分类</option>`;

  categories.forEach(category => {

    const option =
      document.createElement("option");

    option.value = category;
    option.textContent = category;

    select.appendChild(option);

  });

  if (
    categories.includes(current)
  ) {

    select.value = current;

  }

}


// ============================
// 添加物品
// ============================

function openItemModal(itemId = null) {

  document
    .getElementById("itemModal")
    .classList.add("show");

  document
    .getElementById("itemForm")
    .reset();

  document
    .getElementById("itemId")
    .value = "";

  document
    .getElementById("itemMinimum")
    .value = 0;

  document
    .getElementById("modalTitle")
    .textContent = "添加物品";

  document
    .getElementById("averagePricePreview")
    .textContent = "¥0.00 / 个";


  if (itemId) {

    const item =
      state.items.find(
        x => x.id === itemId
      );

    if (!item) return;

    document
      .getElementById("modalTitle")
      .textContent = "编辑物品";

    document
      .getElementById("itemId")
      .value = item.id;

    document
      .getElementById("itemName")
      .value = item.name || "";

    document
      .getElementById("itemBrand")
      .value = item.brand || "";

    document
      .getElementById("itemCategory")
      .value = item.category || "";

    document
      .getElementById("itemSpec")
      .value = item.spec || "";

    document
      .getElementById("itemUnit")
      .value = item.unit || "个";

    document
      .getElementById("itemPrice")
      .value = item.price ?? "";

    document
      .getElementById("itemPurchaseQuantity")
      .value =
        item.purchaseQuantity ?? "";

    document
      .getElementById("itemQuantity")
      .value =
        item.quantity ?? 0;

    document
      .getElementById("itemMinimum")
      .value =
        item.minimum ?? 0;

    document
      .getElementById("itemExpiry")
      .value =
        item.expiry || "";

    document
      .getElementById("itemLocation")
      .value =
        item.location || "";

    document
      .getElementById("itemNotes")
      .value =
        item.notes || "";

    updateAveragePrice();

  }

}


function closeItemModal() {

  document
    .getElementById("itemModal")
    .classList.remove("show");

}


// ============================
// 均价计算
// ============================

function updateAveragePrice() {

  const price =
    parseFloat(
      document.getElementById("itemPrice").value
    ) || 0;

  const purchaseQuantity =
    parseFloat(
      document
        .getElementById("itemPurchaseQuantity")
        .value
    ) || 0;

  const unit =
    document.getElementById("itemUnit").value;

  let average = 0;

  if (purchaseQuantity > 0) {

    average =
      price / purchaseQuantity;

  }

  document
    .getElementById("averagePricePreview")
    .textContent =
      `¥${average.toFixed(2)} / ${unit}`;

}


// ============================
// 保存物品
// ============================

function saveItem(event) {

  event.preventDefault();

  const id =
    document.getElementById("itemId").value;

  const price =
    parseFloat(
      document.getElementById("itemPrice").value
    ) || 0;

  const purchaseQuantity =
    parseFloat(
      document
        .getElementById("itemPurchaseQuantity")
        .value
    ) || 0;

  const averagePrice =
    purchaseQuantity > 0
      ? price / purchaseQuantity
      : 0;


  const item = {

    id:
      id ||
      Date.now().toString(),

    person:
      state.currentPerson,

    name:
      document
        .getElementById("itemName")
        .value.trim(),

    brand:
      document
        .getElementById("itemBrand")
        .value.trim(),

    category:
      document
        .getElementById("itemCategory")
        .value.trim(),

    spec:
      document
        .getElementById("itemSpec")
        .value.trim(),

    unit:
      document
        .getElementById("itemUnit")
        .value,

    // 价格
    price: price,

    // 买了多少
    purchaseQuantity:
      purchaseQuantity,

    // 自动计算的均价
    averagePrice:
      averagePrice,

    // 当前剩余数量
    quantity:
      parseFloat(
        document
          .getElementById("itemQuantity")
          .value
      ) || 0,

    minimum:
      parseFloat(
        document
          .getElementById("itemMinimum")
          .value
      ) || 0,

    expiry:
      document
        .getElementById("itemExpiry")
        .value,

    location:
      document
        .getElementById("itemLocation")
        .value.trim(),

    notes:
      document
        .getElementById("itemNotes")
        .value.trim(),

    addedAt:
      id
        ? (
            state.items.find(
              x => x.id === id
            )?.addedAt ||
            Date.now()
          )
        : Date.now()

  };


  if (id) {

    const index =
      state.items.findIndex(
        x => x.id === id
      );

    if (index !== -1) {

      state.items[index] = item;

    }

  } else {

    state.items.push(item);

  }


  saveData();

  closeItemModal();

  renderCategoryFilter();
  renderItems();
  updateDashboard();

}


// ============================
// 状态判断
// ============================

function getExpiryDays(expiry) {

  if (!expiry) return null;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const date = new Date(expiry);

  date.setHours(0, 0, 0, 0);

  return Math.ceil(
    (date - today) /
    (1000 * 60 * 60 * 24)
  );

}


function getItemStatus(item) {

  if (item.quantity <= 0) {

    return "empty";

  }

  const days =
    getExpiryDays(item.expiry);

  if (days !== null && days < 0) {

    return "expired";

  }

  if (
    item.minimum > 0 &&
    item.quantity <= item.minimum
  ) {

    return "low";

  }

  if (
    days !== null &&
    days <= 30
  ) {

    return "soon";

  }

  return "normal";

}


function getStatusText(status) {

  const map = {

    normal: "正常",

    soon: "即将到期",

    expired: "已过期",

    low: "余量告急",

    empty: "已用完"

  };

  return map[status] || status;

}


// ============================
// 到期显示
// ============================

function getExpiryText(expiry) {

  if (!expiry) {

    return "无到期日";

  }

  const days =
    getExpiryDays(expiry);

  if (days < 0) {

    return `已过期 ${Math.abs(days)} 天`;

  }

  if (days === 0) {

    return "今天到期";

  }

  if (days === 1) {

    return "明天到期";

  }

  return `${days} 天后到期`;

}


// ============================
// 渲染物品
// ============================

function renderItems() {

  const container =
    document.getElementById("itemList");

  const search =
    document
      .getElementById("searchInput")
      .value
      .trim()
      .toLowerCase();

  const category =
    document
      .getElementById("categoryFilter")
      .value;

  const statusFilter =
    document
      .getElementById("statusFilter")
      .value;

  const sort =
    document
      .getElementById("sortSelect")
      .value;


  let items =
    state.items.filter(
      item =>
        item.person === state.currentPerson
    );


  // 搜索

  if (search) {

    items =
      items.filter(item => {

        const text = [

          item.name,
          item.brand,
          item.spec,
          item.category,
          item.location,
          item.notes

        ]
          .join(" ")
          .toLowerCase();

        return text.includes(search);

      });

  }


  // 分类

  if (category !== "all") {

    items =
      items.filter(
        item =>
          item.category === category
      );

  }


  // 状态

  if (statusFilter !== "all") {

    items =
      items.filter(
        item =>
          getItemStatus(item) ===
          statusFilter
      );

  }


  // 排序

  if (sort === "name") {

    items.sort(
      (a, b) =>
        a.name.localeCompare(
          b.name,
          "zh-CN"
        )
    );

  }


  if (sort === "expiry") {

    items.sort((a, b) => {

      if (!a.expiry) return 1;

      if (!b.expiry) return -1;

      return (
        new Date(a.expiry) -
        new Date(b.expiry)
      );

    });

  }


  if (sort === "quantity") {

    items.sort(
      (a, b) =>
        Number(a.quantity) -
        Number(b.quantity)
    );

  }


  if (sort === "price") {

    items.sort(
      (a, b) =>
        Number(
          a.averagePrice || 0
        ) -
        Number(
          b.averagePrice || 0
        )
    );

  }


  if (sort === "added-desc") {

    items.sort(
      (a, b) =>
        Number(b.addedAt || 0) -
        Number(a.addedAt || 0)
    );

  }


  if (!items.length) {

    container.innerHTML = `
      <div style="
        text-align:center;
        padding:50px 20px;
        color:#999;
      ">
        <div style="font-size:40px;">📦</div>
        <div style="margin-top:10px;">
          暂时没有物品
        </div>
      </div>
    `;

    return;

  }


  container.innerHTML =
    items
      .map(renderItemCard)
      .join("");

}


// ============================
// 单个物品卡片
// ============================

function renderItemCard(item) {

  const status =
    getItemStatus(item);

  const expiryText =
    getExpiryText(item.expiry);


  const averagePrice =
    Number(
      item.averagePrice || 0
    );


  const priceDisplay =
    item.price > 0
      ? `¥${Number(item.price).toFixed(2)}`
      : "未填写";


  const averageDisplay =
    averagePrice > 0
      ? `¥${averagePrice.toFixed(2)} / ${escapeHTML(item.unit || "个")}`
      : "未填写";


  return `

    <div class="item-card">

      <div class="item-top">

        <div>

          <div class="item-name">
            ${escapeHTML(item.name)}
          </div>

          <div class="item-meta">

            ${
              item.brand
                ? escapeHTML(item.brand) + " · "
                : ""
            }

            ${
              item.spec
                ? escapeHTML(item.spec)
                : ""
            }

            ${
              item.category
                ? ` · ${escapeHTML(item.category)}`
                : ""
            }

          </div>

        </div>


        <div class="status-badge ${status}">
          ${getStatusText(status)}
        </div>

      </div>


      <div class="item-info-grid">


        <!-- 当前余量 -->

        <div class="info-box">

          <div class="info-title">
            当前余量
          </div>

          <div class="info-value">

            ${item.quantity}
            ${escapeHTML(item.unit || "")}

          </div>

        </div>


        <!-- 到期 -->

        <div class="info-box">

          <div class="info-title">
            到期情况
          </div>

          <div class="info-value">

            ${expiryText}

          </div>

        </div>


        <!-- 总价格 -->

        <div class="info-box">

          <div class="info-title">
            总价格
          </div>

          <div class="info-value">

            ${priceDisplay}

          </div>

        </div>


        <!-- 均价 -->

        <div class="info-box">

          <div class="info-title">
            均价
          </div>

          <div class="info-value average-price">

            ${averageDisplay}

            ${
              item.purchaseQuantity
                ? `<small>
                    ${item.price ? "¥" + Number(item.price).toFixed(2) : ""}
                    ÷
                    ${item.purchaseQuantity}${escapeHTML(item.unit || "")}
                   </small>`
                : ""
            }

          </div>

        </div>

      </div>


      <!-- 快速调整余量 -->

      <div class="quantity-control">

        <button
          onclick="changeQuantity('${escapeJS(item.id)}', -1)"
        >
          −
        </button>

        <div class="quantity-number">
          ${item.quantity}
          ${escapeHTML(item.unit || "")}
        </div>

        <button
          onclick="changeQuantity('${escapeJS(item.id)}', 1)"
        >
          ＋
        </button>

      </div>


      ${
        item.location
          ? `
            <div class="item-meta">
              📍 ${escapeHTML(item.location)}
            </div>
          `
          : ""
      }


      ${
        item.notes
          ? `
            <div class="item-meta">
              📝 ${escapeHTML(item.notes)}
            </div>
          `
          : ""
      }


      <div class="item-actions">

        <button
          onclick="openItemModal('${escapeJS(item.id)}')"
        >
          ✏️ 编辑
        </button>

        <button
          class="delete"
          onclick="deleteItem('${escapeJS(item.id)}')"
        >
          🗑 删除
        </button>

      </div>

    </div>

  `;

}


// ============================
// 快速调整数量
// ============================

function changeQuantity(id, amount) {

  const item =
    state.items.find(
      x => x.id === id
    );

  if (!item) return;

  item.quantity =
    Math.max(
      0,
      Number(item.quantity || 0) +
      amount
    );

  saveData();

  renderItems();
  updateDashboard();

}


// ============================
// 删除
// ============================

function deleteItem(id) {

  const item =
    state.items.find(
      x => x.id === id
    );

  if (!item) return;

  if (
    !confirm(
      `确定删除「${item.name}」吗？`
    )
  ) {

    return;

  }

  state.items =
    state.items.filter(
      x => x.id !== id
    );

  saveData();

  renderCategoryFilter();
  renderItems();
  updateDashboard();

}


// ============================
// 仪表盘
// ============================

function updateDashboard() {

  const items =
    state.items.filter(
      item =>
        item.person === state.currentPerson
    );


  const expired =
    items.filter(
      item =>
        getItemStatus(item) === "expired"
    ).length;


  const soon =
    items.filter(
      item =>
        getItemStatus(item) === "soon"
    ).length;


  const low =
    items.filter(
      item =>
        getItemStatus(item) === "low"
    ).length;


  document
    .getElementById("totalCount")
    .textContent =
      items.length;

  document
    .getElementById("expiredCount")
    .textContent =
      expired;

  document
    .getElementById("soonCount")
    .textContent =
      soon;

  document
    .getElementById("lowCount")
    .textContent =
      low;

}


// ============================
// Excel 导出
// ============================

function exportExcel() {

  if (
    typeof XLSX === "undefined"
  ) {

    alert("Excel功能加载失败，请检查网络连接。");

    return;

  }


  const items =
    state.items.map(item => ({

      管理对象:
        item.person,

      物品名称:
        item.name,

      品牌:
        item.brand,

      分类:
        item.category,

      规格:
        item.spec,

      单位:
        item.unit,

      总价格:
        item.price,

      购买数量:
        item.purchaseQuantity,

      均价:
        item.averagePrice,

      当前余量:
        item.quantity,

      最低余量:
        item.minimum,

      到期日:
        item.expiry,

      存放位置:
        item.location,

      备注:
        item.notes,

      添加时间:
        item.addedAt
          ? new Date(item.addedAt).toLocaleString()
          : ""

    }));


  const worksheet =
    XLSX.utils.json_to_sheet(items);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "物品"
  );


  XLSX.writeFile(
    workbook,
    "物品管理.xlsx"
  );

}


// ============================
// Excel 导入
// ============================

function importExcel(event) {

  const file =
    event.target.files[0];

  if (!file) return;


  if (
    typeof XLSX === "undefined"
  ) {

    alert("Excel功能加载失败，请检查网络连接。");

    return;

  }


  const reader =
    new FileReader();


  reader.onload = function(e) {

    try {

      const workbook =
        XLSX.read(
          e.target.result,
          {
            type: "array"
          }
        );


      const sheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];


      const rows =
        XLSX.utils.sheet_to_json(sheet);


      rows.forEach(row => {

        const price =
          Number(row["总价格"] || 0);

        const purchaseQuantity =
          Number(row["购买数量"] || 0);


        const averagePrice =
          purchaseQuantity > 0
            ? price / purchaseQuantity
            : Number(row["均价"] || 0);


        state.items.push({

          id:
            Date.now().toString() +
            Math.random()
              .toString(36)
              .slice(2),

          person:
            row["管理对象"] ||
            state.currentPerson,

          name:
            row["物品名称"] || "",

          brand:
            row["品牌"] || "",

          category:
            row["分类"] || "",

          spec:
            row["规格"] || "",

          unit:
            row["单位"] || "个",

          price:
            price,

          purchaseQuantity:
            purchaseQuantity,

          averagePrice:
            averagePrice,

          quantity:
            Number(
              row["当前余量"] || 0
            ),

          minimum:
            Number(
              row["最低余量"] || 0
            ),

          expiry:
            formatExcelDate(
              row["到期日"]
            ),

          location:
            row["存放位置"] || "",

          notes:
            row["备注"] || "",

          addedAt:
            Date.now()

        });

      });


      saveData();

      renderCategoryFilter();
      renderItems();
      updateDashboard();


      alert(
        `成功导入 ${rows.length} 条物品`
      );


    } catch (error) {

      console.error(error);

      alert(
        "Excel导入失败，请检查文件格式。"
      );

    }

  };


  reader.readAsArrayBuffer(file);

  event.target.value = "";

}


// ============================
// Excel日期转换
// ============================

function formatExcelDate(value) {

  if (!value) return "";

  if (
    typeof value === "string"
  ) {

    return value;

  }


  if (typeof value === "number") {

    const date =
      new Date(
        Math.round(
          (value - 25569) *
          86400 *
          1000
        )
      );

    return date
      .toISOString()
      .split("T")[0];

  }


  return "";

}


// ============================
// JSON备份
// ============================

function exportJSON() {

  const data =
    JSON.stringify(
      state,
      null,
      2
    );


  const blob =
    new Blob(
      [data],
      {
        type: "application/json"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    "物品管理备份.json";

  a.click();


  URL.revokeObjectURL(url);

}


// ============================
// JSON恢复
// ============================

function importJSON(event) {

  const file =
    event.target.files[0];

  if (!file) return;


  const reader =
    new FileReader();


  reader.onload = function(e) {

    try {

      const data =
        JSON.parse(
          e.target.result
        );


      if (
        !data.people ||
        !data.items
      ) {

        throw new Error(
          "格式错误"
        );

      }


      if (
        !confirm(
          "恢复备份会覆盖当前数据，确定继续吗？"
        )
      ) {

        return;

      }


      state = data;

      saveData();

      renderPeopleSelect();
      renderCategoryFilter();
      renderItems();
      updateDashboard();


      alert("恢复成功");


    } catch (error) {

      alert(
        "JSON备份文件无效。"
      );

    }

  };


  reader.readAsText(file);

  event.target.value = "";

}


// ============================
// HTML安全处理
// ============================

function escapeHTML(value) {

  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function escapeJS(value) {

  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'");

}