/* =========================================================
   我的物品管理
   1.0 紧凑界面 + 2.0 全功能
   主界面精简：详细信息放入「详情」
========================================================= */

const STORAGE_KEY = "my-item-manager-v2";

let state = {
  people: ["我"],
  currentPerson: "我",
  items: []
};


/* =========================================================
   初始化
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  loadData();

  normalizeData();

  renderAll();

});


/* =========================================================
   数据
========================================================= */

function loadData() {

  try {

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    const data =
      JSON.parse(saved);

    if (!data || typeof data !== "object") {
      return;
    }


    state.people =
      Array.isArray(data.people) &&
      data.people.length
        ? data.people
        : ["我"];


    state.currentPerson =
      data.currentPerson &&
      state.people.includes(data.currentPerson)
        ? data.currentPerson
        : state.people[0];


    state.items =
      Array.isArray(data.items)
        ? data.items
        : [];

  } catch (error) {

    console.error(
      "读取数据失败:",
      error
    );

  }

}


function saveData() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

  } catch (error) {

    console.error(
      "保存数据失败:",
      error
    );

    alert(
      "数据保存失败，请检查浏览器存储权限。"
    );

  }

}


function normalizeData() {

  if (
    !Array.isArray(state.people) ||
    !state.people.length
  ) {

    state.people = ["我"];

  }


  if (
    !state.people.includes(
      state.currentPerson
    )
  ) {

    state.currentPerson =
      state.people[0];

  }


  if (!Array.isArray(state.items)) {

    state.items = [];

  }


  state.items =
    state.items.map(item => {

      const price =
        Number(
          item.price ??
          item.totalPrice ??
          0
        ) || 0;


      const purchaseQuantity =
        Number(
          item.purchaseQuantity ??
          item.quantityPurchased ??
          item.amount ??
          0
        ) || 0;


      return {

        id:
          item.id ||
          generateId(),

        person:
          item.person ||
          state.currentPerson,

        name:
          item.name ||
          "",

        brand:
          item.brand ||
          "",

        spec:
          item.spec ||
          "",

        category:
          item.category ||
          "其他",

        unit:
          item.unit ||
          "个",

        quantity:
          Number(
            item.quantity ?? 0
          ) || 0,

        minimum:
          Number(
            item.minimum ?? 0
          ) || 0,

        expiry:
          item.expiry ||
          "",

        location:
          item.location ||
          "",

        purchaseDate:
          item.purchaseDate ||
          "",

        price,

        purchaseQuantity,

        averagePrice:
          price > 0 &&
          purchaseQuantity > 0
            ? price / purchaseQuantity
            : 0,

        notes:
          item.notes ||
          "",

        createdAt:
          item.createdAt ||
          Date.now()

      };

    });


  saveData();

}


function generateId() {

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2, 9)
  );

}


function $(selector) {

  return document.querySelector(
    selector
  );

}


function escapeHTML(value) {

  return String(value ?? "")

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


function escapeJS(value) {

  return String(value ?? "")
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /'/g,
      "\\'"
    );

}


function setText(
  selector,
  value
) {

  const el =
    $(selector);

  if (el) {

    el.textContent =
      value;

  }

}


/* =========================================================
   管理对象
========================================================= */

function renderPeople() {

  const select =
    $("#personSelect");

  if (!select) return;


  select.innerHTML =
    state.people

      .map(
        person => `
          <option value="${escapeHTML(person)}">
            ${escapeHTML(person)}
          </option>
        `
      )

      .join("");


  select.value =
    state.currentPerson;

}


function changePerson() {

  const select =
    $("#personSelect");

  if (!select) return;


  state.currentPerson =
    select.value;


  saveData();

  renderAll();

}


function openPeopleModal() {

  const modal =
    $("#peopleModal");

  if (!modal) return;


  renderPeopleList();

  modal.classList.add(
    "show"
  );

}


function closePeopleModal() {

  const modal =
    $("#peopleModal");

  if (modal) {

    modal.classList.remove(
      "show"
    );

  }

}


function renderPeopleList() {

  const container =
    $("#peopleList");

  if (!container) return;


  container.innerHTML =
    state.people

      .map(
        person => `

          <div class="person-item">

            <strong>
              ${escapeHTML(person)}
            </strong>

            ${
              state.people.length > 1

                ? `

                  <button
                    type="button"
                    onclick="deletePerson('${escapeJS(person)}')"
                  >
                    删除
                  </button>

                `

                : ""
            }

          </div>

        `
      )

      .join("");

}


function addPerson() {

  const input =
    $("#newPersonName");

  if (!input) return;


  const name =
    input.value.trim();


  if (!name) {

    alert(
      "请输入管理对象名称。"
    );

    return;

  }


  if (
    state.people.includes(
      name
    )
  ) {

    alert(
      "这个管理对象已经存在。"
    );

    return;

  }


  state.people.push(
    name
  );


  state.currentPerson =
    name;


  input.value =
    "";


  saveData();

  renderAll();

  renderPeopleList();

}


function deletePerson(name) {

  if (
    state.people.length <= 1
  ) {

    alert(
      "至少需要保留一个管理对象。"
    );

    return;

  }


  if (
    !confirm(
      `确定删除「${name}」吗？`
    )
  ) {

    return;

  }


  const replacement =
    state.people.find(
      person =>
        person !== name
    );


  state.items =
    state.items.map(
      item =>

        item.person === name

          ? {
              ...item,
              person: replacement
            }

          : item
    );


  state.people =
    state.people.filter(
      person =>
        person !== name
    );


  if (
    state.currentPerson === name
  ) {

    state.currentPerson =
      replacement;

  }


  saveData();

  renderAll();

  renderPeopleList();

}


function getCurrentItems() {

  return state.items.filter(
    item =>
      item.person ===
      state.currentPerson
  );

}


/* =========================================================
   日期
========================================================= */

function getDaysUntilExpiry(
  expiry
) {

  if (!expiry) {
    return null;
  }


  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );


  const expiryDate =
    new Date(
      `${expiry}T00:00:00`
    );


  if (
    Number.isNaN(
      expiryDate.getTime()
    )
  ) {

    return null;

  }


  return Math.round(
    (
      expiryDate.getTime() -
      today.getTime()
    ) / 86400000
  );

}


function getExpiryText(
  expiry
) {

  const days =
    getDaysUntilExpiry(
      expiry
    );


  if (days === null) {

    return "无到期日";

  }


  if (days < 0) {

    return `已过期 ${Math.abs(days)} 天`;

  }


  if (days === 0) {

    return "今天到期";

  }


  return `剩余 ${days} 天`;

}


/* =========================================================
   状态
========================================================= */

function getItemStatus(
  item
) {

  if (
    Number(item.quantity) <= 0
  ) {

    return "empty";

  }


  const days =
    getDaysUntilExpiry(
      item.expiry
    );


  if (
    days !== null &&
    days < 0
  ) {

    return "expired";

  }


  if (
    Number(item.minimum) > 0 &&
    Number(item.quantity) <=
      Number(item.minimum)
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


function getStatusText(
  status
) {

  return {

    expired: "已过期",

    soon: "即将到期",

    low: "余量告急",

    empty: "已用完",

    normal: "正常"

  }[status] || "正常";

}


/* =========================================================
   仪表盘
========================================================= */

function renderDashboard() {

  const items =
    getCurrentItems();


  let expired = 0;

  let soon = 0;

  let low = 0;


  items.forEach(
    item => {

      const status =
        getItemStatus(
          item
        );


      if (
        status === "expired"
      ) {

        expired++;

      }


      if (
        status === "soon"
      ) {

        soon++;

      }


      if (
        status === "low" ||
        status === "empty"
      ) {

        low++;

      }

    }
  );


  setText(
    "#totalCount",
    items.length
  );


  setText(
    "#expiredCount",
    expired
  );


  setText(
    "#soonCount",
    soon
  );


  setText(
    "#lowCount",
    low
  );

}


/* =========================================================
   分类
========================================================= */

function renderCategoryFilter() {

  const select =
    $("#categoryFilter");

  if (!select) return;


  const oldValue =
    select.value;


  const categories =
    [
      ...new Set(
        getCurrentItems()

          .map(
            item =>
              item.category
          )

          .filter(Boolean)
      )
    ]

      .sort(
        (a, b) =>
          a.localeCompare(
            b,
            "zh"
          )
      );


  select.innerHTML =
    `
      <option value="all">
        全部分类
      </option>
    ` +

    categories

      .map(
        category => `

          <option value="${escapeHTML(category)}">
            ${escapeHTML(category)}
          </option>

        `
      )

      .join("");


  select.value =
    oldValue === "all" ||
    categories.includes(
      oldValue
    )
      ? oldValue
      : "all";

}


/* =========================================================
   搜索 / 筛选 / 排序
========================================================= */

function getFilteredItems() {

  let items =
    [
      ...getCurrentItems()
    ];


  const keyword =
    (
      $("#searchInput")
        ?.value ||
      ""
    )
      .trim()
      .toLowerCase();


  if (keyword) {

    items =
      items.filter(
        item =>

          [

            item.name,

            item.brand,

            item.spec,

            item.category,

            item.location,

            item.notes

          ]

            .join(" ")

            .toLowerCase()

            .includes(
              keyword
            )

      );

  }


  const category =
    $("#categoryFilter")
      ?.value ||
    "all";


  if (
    category !== "all"
  ) {

    items =
      items.filter(
        item =>
          item.category ===
          category
      );

  }


  const status =
    $("#statusFilter")
      ?.value ||
    "all";


  if (
    status !== "all"
  ) {

    items =
      items.filter(
        item =>
          getItemStatus(item) ===
          status
      );

  }


  const sort =
    $("#sortSelect")
      ?.value ||
    "added-desc";


  if (
    sort === "name"
  ) {

    items.sort(
      (a, b) =>
        a.name.localeCompare(
          b.name,
          "zh"
        )
    );

  }


  else if (
    sort === "expiry"
  ) {

    items.sort(
      (a, b) => {

        if (
          !a.expiry &&
          !b.expiry
        ) {

          return 0;

        }


        if (!a.expiry) {

          return 1;

        }


        if (!b.expiry) {

          return -1;

        }


        return a.expiry.localeCompare(
          b.expiry
        );

      }
    );

  }


  else if (
    sort === "quantity"
  ) {

    items.sort(
      (a, b) =>
        Number(a.quantity) -
        Number(b.quantity)
    );

  }


  else if (
    sort === "price"
  ) {

    items.sort(
      (a, b) => {

        const ap =
          Number(
            a.averagePrice ||
            0
          );


        const bp =
          Number(
            b.averagePrice ||
            0
          );


        return ap - bp;

      }
    );

  }


  else {

    items.sort(
      (a, b) =>
        Number(
          b.createdAt || 0
        ) -

        Number(
          a.createdAt || 0
        )
    );

  }


  return items;

}


/* =========================================================
   物品列表
========================================================= */

function renderItems() {

  const container =
    $("#itemList");

  if (!container) return;


  const items =
    getFilteredItems();


  if (!items.length) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          📦
        </div>

        <div>
          暂无物品
        </div>

        <small>
          点击下方「＋ 添加物品」开始记录
        </small>

      </div>

    `;

    return;

  }


  container.innerHTML =
    items
      .map(
        renderItemCard
      )
      .join("");

}


function renderItemCard(
  item
) {

  const status =
    getItemStatus(
      item
    );


  const expiryText =
    getExpiryText(
      item.expiry
    );


  const days =
    getDaysUntilExpiry(
      item.expiry
    );


  let expiryClass =
    "green";


  if (
    days !== null &&
    days < 0
  ) {

    expiryClass =
      "red";

  }


  else if (
    days !== null &&
    days <= 30
  ) {

    expiryClass =
      "orange";

  }


  const meta =
    [
      item.brand,
      item.spec,
      item.category
    ]

      .filter(Boolean)

      .map(
        escapeHTML
      )

      .join(" · ");


  return `

    <div class="item-card">


      <!-- 标题 -->

      <div class="item-top">

        <div class="item-main-title">

          <div class="item-name">
            ${escapeHTML(item.name)}
          </div>


          <div class="item-meta">
            ${meta || "—"}
          </div>

        </div>


        <div
          class="status-badge ${status}"
        >
          ${getStatusText(status)}
        </div>

      </div>


      <!-- 标签 -->

      <div class="item-tags">

        ${
          item.category

            ? `

              <span class="item-tag">
                ${escapeHTML(item.category)}
              </span>

            `

            : ""
        }


        <span
          class="item-tag ${expiryClass}"
        >
          ${escapeHTML(expiryText)}
        </span>

      </div>


      <!-- 当前余量 -->

      <div class="quantity-box">

        <div>

          <div class="quantity-title">
            当前余量
          </div>


          <div class="quantity-value">

            ${formatNumber(item.quantity)}

            <span>
              ${escapeHTML(item.unit || "个")}
            </span>

          </div>

        </div>


        <div class="quantity-buttons">

          <button
            type="button"
            onclick="changeQuantity('${escapeJS(item.id)}', -1)"
          >
            −
          </button>


          <button
            type="button"
            onclick="changeQuantity('${escapeJS(item.id)}', 1)"
          >
            +
          </button>

        </div>

      </div>


      <!-- 操作 -->

      <div class="item-actions">

        <button
          type="button"
          class="detail-button"
          onclick="openDetailModal('${escapeJS(item.id)}')"
        >
          🗂️ 详情
        </button>


        <button
          type="button"
          onclick="openItemModal('${escapeJS(item.id)}')"
        >
          ✏️ 编辑
        </button>


        <button
          type="button"
          class="delete"
          onclick="deleteItem('${escapeJS(item.id)}')"
        >
          🗑 删除
        </button>

      </div>


      ${
        item.notes

          ? `

            <div class="item-notes">
              ${escapeHTML(item.notes)}
            </div>

          `

          : ""
      }

    </div>

  `;

}


function formatNumber(
  value
) {

  const n =
    Number(value);


  if (
    !Number.isFinite(n)
  ) {

    return "0";

  }


  return Number.isInteger(n)

    ? String(n)

    : String(
        Number(
          n.toFixed(2)
        )
      );

}


/* =========================================================
   快速修改余量
========================================================= */

function changeQuantity(
  id,
  amount
) {

  const item =
    state.items.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!item) return;


  item.quantity =
    Math.max(
      0,
      Number(
        item.quantity || 0
      ) +
      Number(amount)
    );


  saveData();

  renderAll();

}


/* =========================================================
   添加 / 编辑
========================================================= */

function openItemModal(
  id = null
) {

  const modal =
    $("#itemModal");


  const form =
    $("#itemForm");


  if (
    !modal ||
    !form
  ) {

    return;

  }


  form.reset();


  $("#itemId").value =
    id || "";


  const title =
    $("#modalTitle");


  if (id) {

    const item =
      state.items.find(
        item =>
          String(item.id) ===
          String(id)
      );


    if (!item) return;


    title.textContent =
      "编辑物品";


    setInput(
      "itemName",
      item.name
    );


    setInput(
      "itemBrand",
      item.brand
    );


    setInput(
      "itemCategory",
      item.category
    );


    setInput(
      "itemSpec",
      item.spec
    );


    setInput(
      "itemUnit",
      item.unit
    );


    setInput(
      "itemPrice",
      item.price
    );


    setInput(
      "itemPurchaseQuantity",
      item.purchaseQuantity
    );


    setInput(
      "itemQuantity",
      item.quantity
    );


    setInput(
      "itemMinimum",
      item.minimum
    );


    setInput(
      "itemExpiry",
      item.expiry
    );


    setInput(
      "itemPurchaseDate",
      item.purchaseDate
    );


    setInput(
      "itemLocation",
      item.location
    );


    setInput(
      "itemNotes",
      item.notes
    );


    updateAveragePrice();

  }


  else {

    title.textContent =
      "添加物品";


    $("#itemMinimum").value =
      0;


    updateAveragePrice();

  }


  modal.classList.add(
    "show"
  );

}


function closeItemModal() {

  const modal =
    $("#itemModal");


  if (modal) {

    modal.classList.remove(
      "show"
    );

  }

}


function setInput(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.value =
      value ?? "";

  }

}


function getValue(
  id
) {

  const element =
    document.getElementById(
      id
    );


  return element
    ? element.value
    : "";

}


/* =========================================================
   均价
========================================================= */

function updateAveragePrice() {

  const price =
    Number(
      getValue(
        "itemPrice"
      ) || 0
    );


  const quantity =
    Number(
      getValue(
        "itemPurchaseQuantity"
      ) || 0
    );


  const unit =
    getValue(
      "itemUnit"
    ) ||
    "个";


  const preview =
    $("#averagePricePreview");


  if (!preview) return;


  preview.textContent =

    price > 0 &&
    quantity > 0

      ? `¥${(
          price / quantity
        ).toFixed(2)} / ${unit}`

      : `¥0.00 / ${unit}`;

}


function updateAveragePreview() {

  updateAveragePrice();

}


/* =========================================================
   保存
========================================================= */

function saveItem(
  event
) {

  if (event) {

    event.preventDefault();

  }


  const name =
    getValue(
      "itemName"
    ).trim();


  if (!name) {

    alert(
      "请输入物品名称。"
    );

    return;

  }


  const id =
    getValue(
      "itemId"
    );


  const price =
    Number(
      getValue(
        "itemPrice"
      ) || 0
    );


  const purchaseQuantity =
    Number(
      getValue(
        "itemPurchaseQuantity"
      ) || 0
    );


  const data = {

    person:
      state.currentPerson,

    name,

    brand:
      getValue(
        "itemBrand"
      ).trim(),

    category:
      getValue(
        "itemCategory"
      ).trim() ||
      "其他",

    spec:
      getValue(
        "itemSpec"
      ).trim(),

    unit:
      getValue(
        "itemUnit"
      ) ||
      "个",

    price,

    purchaseQuantity,

    averagePrice:
      price > 0 &&
      purchaseQuantity > 0

        ? price /
          purchaseQuantity

        : 0,

    quantity:
      Number(
        getValue(
          "itemQuantity"
        ) || 0
      ),

    minimum:
      Number(
        getValue(
          "itemMinimum"
        ) || 0
      ),

    expiry:
      getValue(
        "itemExpiry"
      ),

    purchaseDate:
      getValue(
        "itemPurchaseDate"
      ),

    location:
      getValue(
        "itemLocation"
      ).trim(),

    notes:
      getValue(
        "itemNotes"
      ).trim()

  };


  if (id) {

    const index =
      state.items.findIndex(
        item =>
          String(item.id) ===
          String(id)
      );


    if (index !== -1) {

      state.items[index] = {

        ...state.items[index],

        ...data

      };

    }

  }


  else {

    state.items.push({

      id:
        generateId(),

      ...data,

      createdAt:
        Date.now()

    });

  }


  saveData();

  closeItemModal();

  renderAll();

}


/* =========================================================
   详情
========================================================= */

function openDetailModal(
  id
) {

  const item =
    state.items.find(
      item =>
        String(item.id) ===
        String(id)
    );


  const modal =
    $("#detailModal");


  if (
    !item ||
    !modal
  ) {

    return;

  }


  const price =
    Number(
      item.price || 0
    );


  const purchaseQuantity =
    Number(
      item.purchaseQuantity || 0
    );


  const average =

    price > 0 &&
    purchaseQuantity > 0

      ? price /
        purchaseQuantity

      : 0;


  setText(
    "#detailTitle",
    item.name ||
      "物品详情"
  );


  setText(
    "#detailExpiry",
    item.expiry ||
      "—"
  );


  setText(
    "#detailPurchaseDate",
    item.purchaseDate ||
      "—"
  );


  setText(
    "#detailLocation",
    item.location ||
      "—"
  );


  setText(
    "#detailPrice",
    price > 0
      ? `¥${price.toFixed(2)}`
      : "—"
  );


  setText(
    "#detailPurchaseQuantity",

    purchaseQuantity > 0

      ? `${formatNumber(
          purchaseQuantity
        )} ${item.unit || "个"}`

      : "—"
  );


  setText(
    "#detailAveragePrice",

    average > 0

      ? `¥${average.toFixed(2)} / ${item.unit || "个"}`

      : "—"
  );


  setText(
    "#detailNotes",
    item.notes ||
      "—"
  );


  modal.classList.add(
    "show"
  );

}


function closeDetailModal() {

  const modal =
    $("#detailModal");


  if (modal) {

    modal.classList.remove(
      "show"
    );

  }

}


/* =========================================================
   删除
========================================================= */

function deleteItem(
  id
) {

  const item =
    state.items.find(
      item =>
        String(item.id) ===
        String(id)
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
      item =>
        String(item.id) !==
        String(id)
    );


  saveData();

  renderAll();

}


/* =========================================================
   Excel 导出
========================================================= */

function exportExcel() {

  if (
    typeof XLSX ===
    "undefined"
  ) {

    alert(
      "Excel 功能需要网络连接。"
    );

    return;

  }


  const items =
    getCurrentItems();


  if (!items.length) {

    alert(
      "当前没有可以导出的物品。"
    );

    return;

  }


  const rows =
    items.map(
      item => ({

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

        购买日期:
          item.purchaseDate,

        存放位置:
          item.location,

        备注:
          item.notes

      })
    );


  const worksheet =
    XLSX.utils.json_to_sheet(
      rows
    );


  const workbook =
    XLSX.utils.book_new();


  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "物品"
  );


  XLSX.writeFile(
    workbook,
    `物品管理_${formatDate(new Date())}.xlsx`
  );

}


/* =========================================================
   Excel 导入
========================================================= */

function importExcel(
  event
) {

  const file =
    event?.target?.files?.[0] ||
    event;


  if (!file) return;


  if (
    typeof XLSX ===
    "undefined"
  ) {

    alert(
      "Excel 功能需要网络连接。"
    );

    return;

  }


  const reader =
    new FileReader();


  reader.onload =
    function(e) {

      try {

        const workbook =
          XLSX.read(
            e.target.result,
            {
              type: "array",
              cellDates: true
            }
          );


        const sheetName =
          workbook.SheetNames[0];


        if (!sheetName) {

          throw new Error(
            "没有工作表"
          );

        }


        const rows =
          XLSX.utils.sheet_to_json(
            workbook.Sheets[
              sheetName
            ],
            {
              defval: ""
            }
          );


        if (!rows.length) {

          alert(
            "Excel 中没有找到数据。"
          );

          return;

        }


        let count = 0;


        rows.forEach(
          (
            row,
            index
          ) => {

            const name =
              String(
                row["物品名称"] ||
                row["名称"] ||
                ""
              ).trim();


            if (!name) return;


            const person =
              String(
                row["管理对象"] ||
                state.currentPerson ||
                "我"
              ).trim() ||
              "我";


            if (
              !state.people.includes(
                person
              )
            ) {

              state.people.push(
                person
              );

            }


            const price =
              Number(
                row["总价格"] ||
                row["价格"] ||
                0
              ) || 0;


            const purchaseQuantity =
              Number(
                row["购买数量"] ||
                0
              ) || 0;


            state.items.push({

              id:
                generateId(),

              person,

              name,

              brand:
                String(
                  row["品牌"] ||
                  ""
                ),

              category:
                String(
                  row["分类"] ||
                  "其他"
                ),

              spec:
                String(
                  row["规格"] ||
                  ""
                ),

              unit:
                String(
                  row["单位"] ||
                  "个"
                ),

              price,

              purchaseQuantity,

              averagePrice:

                price > 0 &&
                purchaseQuantity > 0

                  ? price /
                    purchaseQuantity

                  : 0,

              quantity:
                Number(
                  row["当前余量"] ||
                  row["余量"] ||
                  0
                ) || 0,

              minimum:
                Number(
                  row["最低余量"] ||
                  0
                ) || 0,

              expiry:
                normalizeExcelDate(
                  row["到期日"]
                ),

              purchaseDate:
                normalizeExcelDate(
                  row["购买日期"]
                ),

              location:
                String(
                  row["存放位置"] ||
                  ""
                ),

              notes:
                String(
                  row["备注"] ||
                  ""
                ),

              createdAt:
                Date.now() +
                index

            });


            count++;

          }
        );


        saveData();

        renderAll();


        alert(
          `成功导入 ${count} 条物品。`
        );


      } catch (error) {

        console.error(
          "Excel 导入失败:",
          error
        );


        alert(
          "Excel 导入失败，请检查文件格式。"
        );

      }

    };


  reader.readAsArrayBuffer(
    file
  );


  if (event?.target) {

    event.target.value =
      "";

  }

}


function normalizeExcelDate(
  value
) {

  if (!value) {

    return "";

  }


  if (
    value instanceof Date &&
    !Number.isNaN(
      value.getTime()
    )
  ) {

    return formatDate(
      value
    );

  }


  if (
    typeof value ===
    "number"
  ) {

    const date =
      XLSX.SSF.parse_date_code(
        value
      );


    if (date) {

      const d =
        new Date(
          date.y,
          date.m - 1,
          date.d
        );


      return formatDate(
        d
      );

    }

  }


  const text =
    String(
      value
    ).trim();


  if (!text) {

    return "";

  }


  const match =
    text.match(
      /^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/
    );


  if (match) {

    return (

      `${match[1]}-` +

      `${String(
        match[2]
      ).padStart(2, "0")}-` +

      `${String(
        match[3]
      ).padStart(2, "0")}`

    );

  }


  const parsed =
    new Date(
      text
    );


  return Number.isNaN(
    parsed.getTime()
  )

    ? text

    : formatDate(
        parsed
      );

}


/* =========================================================
   JSON 备份
========================================================= */

function exportJSON() {

  const blob =
    new Blob(
      [
        JSON.stringify(
          state,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const a =
    document.createElement(
      "a"
    );


  a.href =
    url;


  a.download =
    `物品管理备份_${formatDate(new Date())}.json`;


  document.body.appendChild(
    a
  );


  a.click();


  a.remove();


  URL.revokeObjectURL(
    url
  );

}


/* =========================================================
   JSON 恢复
========================================================= */

function importJSON(
  event
) {

  const file =
    event?.target?.files?.[0] ||
    event;


  if (!file) return;


  const reader =
    new FileReader();


  reader.onload =
    function(e) {

      try {

        const data =
          JSON.parse(
            e.target.result
          );


        if (
          !data ||
          !Array.isArray(
            data.items
          )
        ) {

          throw new Error(
            "JSON格式错误"
          );

        }


        if (
          !confirm(
            "恢复备份会覆盖当前数据，确定继续吗？"
          )
        ) {

          return;

        }


        state = {

          people:

            Array.isArray(
              data.people
            ) &&
            data.people.length

              ? data.people

              : ["我"],

          currentPerson:
            data.currentPerson ||
            "我",

          items:
            data.items

        };


        normalizeData();

        saveData();

        renderAll();


        alert(
          "备份恢复成功。"
        );


      } catch (error) {

        console.error(
          "JSON恢复失败:",
          error
        );


        alert(
          "备份文件格式不正确。"
        );

      }

    };


  reader.readAsText(
    file,
    "utf-8"
  );


  if (event?.target) {

    event.target.value =
      "";

  }

}


/* =========================================================
   日期
========================================================= */

function formatDate(
  date
) {

  const d =
    new Date(
      date
    );


  if (
    Number.isNaN(
      d.getTime()
    )
  ) {

    return "";

  }


  return [

    d.getFullYear(),

    String(
      d.getMonth() + 1
    ).padStart(
      2,
      "0"
    ),

    String(
      d.getDate()
    ).padStart(
      2,
      "0"
    )

  ].join("-");

}


/* =========================================================
   总渲染
========================================================= */

function renderAll() {

  renderPeople();

  renderDashboard();

  renderCategoryFilter();

  renderItems();

}


/* =========================================================
   暴露给 HTML
========================================================= */

Object.assign(
  window,
  {

    renderItems,

    changePerson,

    openPeopleModal,

    closePeopleModal,

    addPerson,

    deletePerson,

    openItemModal,

    closeItemModal,

    saveItem,

    changeQuantity,

    deleteItem,

    updateAveragePrice,

    updateAveragePreview,

    exportExcel,

    importExcel,

    exportJSON,

    importJSON,

    openDetailModal,

    closeDetailModal

  }
);