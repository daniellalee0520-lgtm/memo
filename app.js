/* =========================================================
   物品管理 App 2.0
   UI：1.0 紧凑风格
   功能：2.0 全功能
   ========================================================= */


/* =========================================================
   1. 基础数据
   ========================================================= */

const STORAGE_KEY = "my-item-manager-v2";

let state = {
  people: ["我"],
  currentPerson: "我",
  items: []
};


/* =========================================================
   2. 初始化
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  loadData();

  normalizeData();

  setupEvents();

  renderAll();

});


/* =========================================================
   3. LocalStorage
   ========================================================= */

function loadData() {

  try {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {

      const data = JSON.parse(saved);

      if (data && typeof data === "object") {

        state = {
          people:
            Array.isArray(data.people) && data.people.length
              ? data.people
              : ["我"],

          currentPerson:
            data.currentPerson ||
            (Array.isArray(data.people) && data.people.length
              ? data.people[0]
              : "我"),

          items:
            Array.isArray(data.items)
              ? data.items
              : []
        };

      }

    }

  } catch (error) {

    console.error("读取数据失败：", error);

  }

}


function saveData() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

  } catch (error) {

    console.error("保存数据失败：", error);

    alert("数据保存失败，请检查浏览器存储权限。");

  }

}


/* =========================================================
   4. 数据标准化
   ========================================================= */

function normalizeData() {

  if (!Array.isArray(state.people) || state.people.length === 0) {
    state.people = ["我"];
  }

  if (!state.people.includes(state.currentPerson)) {
    state.currentPerson = state.people[0];
  }

  if (!Array.isArray(state.items)) {
    state.items = [];
  }

  state.items = state.items.map(item => {

    const purchaseQuantity =
      Number(
        item.purchaseQuantity ??
        item.quantityPurchased ??
        item.amount ??
        0
      ) || 0;

    const price =
      Number(
        item.price ??
        item.totalPrice ??
        0
      ) || 0;

    let averagePrice =
      Number(item.averagePrice || 0);

    if (
      purchaseQuantity > 0 &&
      price > 0
    ) {
      averagePrice =
        price / purchaseQuantity;
    }

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
        Number(item.quantity ?? 0) || 0,

      minimum:
        Number(item.minimum ?? 0) || 0,

      expiry:
        item.expiry ||
        "",

      location:
        item.location ||
        "",

      purchaseDate:
        item.purchaseDate ||
        "",

      notes:
        item.notes ||
        "",

      price:
        price,

      purchaseQuantity:
        purchaseQuantity,

      averagePrice:
        averagePrice,

      createdAt:
        item.createdAt ||
        Date.now()

    };

  });

  saveData();

}


/* =========================================================
   5. 工具函数
   ========================================================= */

function generateId() {

  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 9)
  );

}


function escapeHTML(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function escapeJS(value) {

  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
}


function $(selector) {

  return document.querySelector(selector);

}


function $all(selector) {

  return Array.from(
    document.querySelectorAll(selector)
  );

}


/* =========================================================
   6. 事件
   ========================================================= */

function setupEvents() {

  const searchInput =
    $("#searchInput") ||
    $("#search");

  if (searchInput) {

    searchInput.addEventListener(
      "input",
      renderItems
    );

  }


  const categoryFilter =
    $("#categoryFilter");

  if (categoryFilter) {

    categoryFilter.addEventListener(
      "change",
      renderItems
    );

  }


  const statusFilter =
    $("#statusFilter");

  if (statusFilter) {

    statusFilter.addEventListener(
      "change",
      renderItems
    );

  }


  const sortSelect =
    $("#sortSelect");

  if (sortSelect) {

    sortSelect.addEventListener(
      "change",
      renderItems
    );

  }


  const personSelect =
    $("#personSelect") ||
    $("#personSelector");

  if (personSelect) {

    personSelect.addEventListener(
      "change",
      event => {

        state.currentPerson =
          event.target.value;

        saveData();

        renderAll();

      }
    );

  }


  /* 添加物品 */

  $all(
    '[onclick="openItemModal()"]'
  ).forEach(button => {

    button.addEventListener(
      "click",
      event => {

        event.preventDefault();

        openItemModal();

      }
    );

  });

}


/* =========================================================
   7. 获取当前管理对象物品
   ========================================================= */

function getCurrentItems() {

  return state.items.filter(
    item =>
      item.person === state.currentPerson
  );

}


/* =========================================================
   8. 日期计算
   ========================================================= */

function getDaysUntilExpiry(expiry) {

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

  if (isNaN(expiryDate.getTime())) {
    return null;
  }

  const difference =
    expiryDate.getTime() -
    today.getTime();

  return Math.round(
    difference /
    (1000 * 60 * 60 * 24)
  );

}


/* =========================================================
   9. 到期文字
   ========================================================= */

function getExpiryText(expiry) {

  const days =
    getDaysUntilExpiry(expiry);

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
   10. 状态
   ========================================================= */

function getItemStatus(item) {

  if (Number(item.quantity) <= 0) {

    return "empty";

  }

  const days =
    getDaysUntilExpiry(item.expiry);

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


/* =========================================================
   11. 状态文字
   ========================================================= */

function getStatusText(status) {

  switch (status) {

    case "expired":
      return "已过期";

    case "soon":
      return "即将到期";

    case "low":
      return "余量告急";

    case "empty":
      return "已用完";

    default:
      return "正常";

  }

}


/* =========================================================
   12. 仪表盘
   ========================================================= */

function renderDashboard() {

  const items =
    getCurrentItems();

  let expired = 0;
  let soon = 0;
  let low = 0;

  items.forEach(item => {

    const status =
      getItemStatus(item);

    if (status === "expired") {
      expired++;
    }

    if (status === "soon") {
      soon++;
    }

    if (
      status === "low" ||
      status === "empty"
    ) {
      low++;
    }

  });


  setText(
    "#totalItems",
    items.length
  );

  setText(
    "#expiredItems",
    expired
  );

  setText(
    "#soonItems",
    soon
  );

  setText(
    "#lowItems",
    low
  );


  /* 兼容可能的旧 ID */

  setText(
    "#statItems",
    items.length
  );

  setText(
    "#statExpired",
    expired
  );

  setText(
    "#statSoon",
    soon
  );

  setText(
    "#statLow",
    low
  );

}


/* =========================================================
   13. 设置文字
   ========================================================= */

function setText(selector, value) {

  const element =
    $(selector);

  if (element) {

    element.textContent =
      value;

  }

}


/* =========================================================
   14. 分类
   ========================================================= */

function getCategories() {

  const categories =
    getCurrentItems()
      .map(item => item.category)
      .filter(Boolean);

  return [
    ...new Set(categories)
  ];

}


function renderCategoryFilter() {

  const select =
    $("#categoryFilter");

  if (!select) {
    return;
  }

  const oldValue =
    select.value;

  const categories =
    getCategories();

  select.innerHTML =
    `<option value="">全部分类</option>` +
    categories
      .sort((a, b) =>
        a.localeCompare(b, "zh")
      )
      .map(
        category =>
          `<option value="${escapeHTML(category)}">
             ${escapeHTML(category)}
           </option>`
      )
      .join("");

  if (
    categories.includes(oldValue)
  ) {

    select.value =
      oldValue;

  }

}


/* =========================================================
   15. 搜索 + 筛选 + 排序
   ========================================================= */

function getFilteredItems() {

  let items =
    [...getCurrentItems()];

  const searchInput =
    $("#searchInput") ||
    $("#search");

  const keyword =
    searchInput
      ? searchInput.value
        .trim()
        .toLowerCase()
      : "";


  if (keyword) {

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

        return text.includes(keyword);

      });

  }


  const categoryFilter =
    $("#categoryFilter");

  const category =
    categoryFilter
      ? categoryFilter.value
      : "";


  if (category) {

    items =
      items.filter(
        item =>
          item.category === category
      );

  }


  const statusFilter =
    $("#statusFilter");

  const status =
    statusFilter
      ? statusFilter.value
      : "";


  if (status) {

    items =
      items.filter(
        item =>
          getItemStatus(item) === status
      );

  }


  const sortSelect =
    $("#sortSelect");

  const sort =
    sortSelect
      ? sortSelect.value
      : "created";


  items.sort(
    (a, b) => {

      switch (sort) {

        case "name":

          return a.name.localeCompare(
            b.name,
            "zh"
          );


        case "expiry": {

          const da =
            getDaysUntilExpiry(a.expiry);

          const db =
            getDaysUntilExpiry(b.expiry);

          if (da === null) {
            return 1;
          }

          if (db === null) {
            return -1;
          }

          return da - db;

        }


        case "quantity":

          return (
            Number(a.quantity) -
            Number(b.quantity)
          );


        case "price":

          return (
            Number(b.price || 0) -
            Number(a.price || 0)
          );


        case "average":

          return (
            Number(a.averagePrice || 0) -
            Number(b.averagePrice || 0)
          );


        case "created":
        default:

          return (
            Number(b.createdAt || 0) -
            Number(a.createdAt || 0)
          );

      }

    }
  );


  return items;

}


/* =========================================================
   16. 渲染所有物品
   ========================================================= */

function renderItems() {

  const container =
    $("#itemsList") ||
    $("#itemList") ||
    $("#itemsContainer");

  if (!container) {
    return;
  }

  const items =
    getFilteredItems();


  if (items.length === 0) {

    container.innerHTML = `

      <div style="
        background:white;
        border:1px solid #dfe4ec;
        border-radius:16px;
        padding:30px 15px;
        text-align:center;
        color:#8b929d;
        font-size:14px;
      ">

        暂无物品

      </div>

    `;

    return;

  }


  container.innerHTML =
    items
      .map(
        item =>
          renderItemCard(item)
      )
      .join("");

}


/* =========================================================
   17. 物品卡片
   ========================================================= */

function renderItemCard(item) {

  const status =
    getItemStatus(item);

  const expiryText =
    getExpiryText(item.expiry);

  const days =
    getDaysUntilExpiry(item.expiry);


  let expiryClass =
    "green";

  if (
    days !== null &&
    days < 0
  ) {

    expiryClass = "red";

  } else if (
    days !== null &&
    days <= 30
  ) {

    expiryClass = "orange";

  }


  const price =
    Number(item.price || 0);


  const purchaseQuantity =
    Number(
      item.purchaseQuantity || 0
    );


  let averagePrice =
    Number(
      item.averagePrice || 0
    );


  /* 自动重新计算均价 */

  if (
    price > 0 &&
    purchaseQuantity > 0
  ) {

    averagePrice =
      price /
      purchaseQuantity;

  }


  const priceText =
    price > 0
      ? `¥${price.toFixed(2)}`
      : "—";


  const averageText =
    averagePrice > 0
      ? `¥${averagePrice.toFixed(2)} / ${escapeHTML(item.unit || "个")}`
      : "—";


  return `

    <div class="item-card">

      <!-- 顶部 -->

      <div class="item-top">

        <div>

          <div class="item-name">
            ${escapeHTML(item.name)}
          </div>

          <div class="item-meta">

            ${
              item.brand
                ? escapeHTML(item.brand)
                : ""
            }

            ${
              item.brand &&
              item.spec
                ? " · "
                : ""
            }

            ${
              item.spec
                ? escapeHTML(item.spec)
                : ""
            }

            ${
              (item.brand || item.spec) &&
              item.category
                ? " · "
                : ""
            }

            ${
              item.category
                ? escapeHTML(item.category)
                : ""
            }

          </div>

        </div>


        <div class="
          status-badge
          ${status}
        ">

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


        <span class="
          item-tag
          ${expiryClass}
        ">

          ${escapeHTML(expiryText)}

        </span>


        ${
          item.minimum > 0
            ? `
              <span class="item-tag">
                最低 ${item.minimum}${escapeHTML(item.unit)}
              </span>
            `
            : ""
        }

      </div>


      <!-- 当前余量 -->

      <div class="quantity-box">

        <div>

          <div class="quantity-title">
            当前余量
          </div>

          <div class="quantity-value">

            ${item.quantity}
            ${escapeHTML(item.unit)}

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
            ＋
          </button>

        </div>

      </div>


      <!-- 信息 -->

      <div class="item-info-grid">


        <!-- 到期日 -->

        <div class="info-box">

          <div class="info-title">
            到期日
          </div>

          <div class="info-value">

            ${
              item.expiry
                ? escapeHTML(item.expiry)
                : "—"
            }

          </div>

        </div>


        <!-- 状态 -->

        <div class="info-box">

          <div class="info-title">
            状态
          </div>

          <div class="info-value">

            ${escapeHTML(expiryText)}

          </div>

        </div>


        <!-- 存放位置 -->

        <div class="info-box">

          <div class="info-title">
            存放位置
          </div>

          <div class="info-value">

            ${
              item.location
                ? escapeHTML(item.location)
                : "—"
            }

          </div>

        </div>


        <!-- 购买日期 -->

        <div class="info-box">

          <div class="info-title">
            购买日期
          </div>

          <div class="info-value">

            ${
              item.purchaseDate
                ? escapeHTML(item.purchaseDate)
                : "—"
            }

          </div>

        </div>


        <!-- 总价格 -->

        <div class="info-box">

          <div class="info-title">
            总价格
          </div>

          <div class="info-value">

            ${priceText}

          </div>

        </div>


        <!-- 均价 -->

        <div class="info-box">

          <div class="info-title">
            均价
          </div>

          <div class="
            info-value
            average-price
          ">

            ${averageText}

            ${
              price > 0 &&
              purchaseQuantity > 0
                ? `
                  <small>
                    ¥${price.toFixed(2)}
                    ÷
                    ${purchaseQuantity}${escapeHTML(item.unit)}
                  </small>
                `
                : ""
            }

          </div>

        </div>


      </div>


      <!-- 备注 -->

      ${
        item.notes
          ? `
            <div
              class="item-meta"
              style="margin-top:9px;"
            >

              📝
              ${escapeHTML(item.notes)}

            </div>
          `
          : ""
      }


      <!-- 操作 -->

      <div class="item-actions">

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

    </div>

  `;

}


/* =========================================================
   18. 快速修改余量
   ========================================================= */

function changeQuantity(id, amount) {

  const item =
    state.items.find(
      item =>
        String(item.id) === String(id)
    );

  if (!item) {
    return;
  }

  const oldQuantity =
    Number(item.quantity || 0);

  item.quantity =
    Math.max(
      0,
      oldQuantity + Number(amount)
    );


  saveData();

  renderAll();

}


/* =========================================================
   19. 打开添加 / 编辑窗口
   ========================================================= */

function openItemModal(id = null) {

  let modal =
    $("#itemModal");


  /* 如果 HTML 没有 modal，
     自动创建一个 */

  if (!modal) {

    createItemModal();

    modal =
      $("#itemModal");

  }


  const form =
    $("#itemForm");

  if (!form) {
    return;
  }


  form.reset();


  const idInput =
    $("#itemId");

  if (idInput) {
    idInput.value =
      id || "";
  }


  const title =
    $("#itemModalTitle");


  if (id) {

    const item =
      state.items.find(
        item =>
          String(item.id) === String(id)
      );

    if (!item) {
      return;
    }


    if (title) {
      title.textContent =
        "编辑物品";
    }


    fillInput(
      "itemName",
      item.name
    );

    fillInput(
      "itemBrand",
      item.brand
    );

    fillInput(
      "itemSpec",
      item.spec
    );

    fillInput(
      "itemCategory",
      item.category
    );

    fillInput(
      "itemUnit",
      item.unit
    );

    fillInput(
      "itemQuantity",
      item.quantity
    );

    fillInput(
      "itemMinimum",
      item.minimum
    );

    fillInput(
      "itemExpiry",
      item.expiry
    );

    fillInput(
      "itemLocation",
      item.location
    );

    fillInput(
      "itemPurchaseDate",
      item.purchaseDate
    );

    fillInput(
      "itemPrice",
      item.price
    );

    fillInput(
      "itemPurchaseQuantity",
      item.purchaseQuantity
    );

    fillInput(
      "itemNotes",
      item.notes
    );


  } else {

    if (title) {
      title.textContent =
        "添加物品";
    }


    fillInput(
      "itemUnit",
      "个"
    );

    fillInput(
      "itemCategory",
      "其他"
    );

    fillInput(
      "itemQuantity",
      0
    );

    fillInput(
      "itemMinimum",
      0
    );


    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    fillInput(
      "itemPurchaseDate",
      today
    );

  }


  updateAveragePreview();


  modal.classList.add(
    "show"
  );

}


/* =========================================================
   20. 创建添加窗口
   ========================================================= */

function createItemModal() {

  const modal =
    document.createElement("div");

  modal.id =
    "itemModal";

  modal.className =
    "modal";


  modal.innerHTML = `

    <div class="modal-content">

      <div class="modal-header">

        <h2 id="itemModalTitle">
          添加物品
        </h2>

        <button
          type="button"
          onclick="closeItemModal()"
        >
          ×
        </button>

      </div>


      <form
        id="itemForm"
        onsubmit="saveItem(event)"
      >

        <input
          type="hidden"
          id="itemId"
        >


        <label>
          物品名称
          <input
            id="itemName"
            required
            placeholder="例如：卫生巾"
          >
        </label>


        <div class="form-row">

          <label>
            品牌
            <input
              id="itemBrand"
              placeholder="例如：护舒宝"
            >
          </label>


          <label>
            规格
            <input
              id="itemSpec"
              placeholder="例如：270mm"
            >
          </label>

        </div>


        <div class="form-row">

          <label>
            分类
            <input
              id="itemCategory"
              placeholder="例如：日用品"
            >
          </label>


          <label>
            单位
            <select id="itemUnit">

              <option value="个">个</option>
              <option value="片">片</option>
              <option value="袋">袋</option>
              <option value="瓶">瓶</option>
              <option value="支">支</option>
              <option value="盒">盒</option>
              <option value="包">包</option>
              <option value="卷">卷</option>
              <option value="件">件</option>
              <option value="套">套</option>
              <option value="条">条</option>
              <option value="双">双</option>
              <option value="罐">罐</option>

            </select>
          </label>

        </div>


        <div class="form-row">

          <label>
            当前余量
            <input
              id="itemQuantity"
              type="number"
              min="0"
              step="1"
              value="0"
            >
          </label>


          <label>
            最低余量
            <input
              id="itemMinimum"
              type="number"
              min="0"
              step="1"
              value="0"
            >
          </label>

        </div>


        <div class="form-row">

          <label>
            到期日
            <input
              id="itemExpiry"
              type="date"
            >
          </label>


          <label>
            购买日期
            <input
              id="itemPurchaseDate"
              type="date"
            >
          </label>

        </div>


        <label>
          存放位置
          <input
            id="itemLocation"
            placeholder="例如：抽屉"
          >
        </label>


        <!-- 价格 -->

        <div class="price-section">

          <div class="section-title">
            💰 价格信息
          </div>


          <div class="form-row">

            <label>
              总价格（¥）
              <input
                id="itemPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="例如：15.21"
              >
            </label>


            <label>
              购买数量
              <input
                id="itemPurchaseQuantity"
                type="number"
                min="0"
                step="1"
                placeholder="例如：30"
              >
            </label>

          </div>


          <div class="average-price-box">

            <div>

              <span>
                自动均价
              </span>

              <small>
                总价格 ÷ 购买数量
              </small>

            </div>


            <strong
              id="averagePricePreview"
            >
              —
            </strong>

          </div>

        </div>


        <label>
          备注
          <textarea
            id="itemNotes"
            rows="2"
            placeholder="其他备注……"
          ></textarea>
        </label>


        <button
          class="submit-button"
          type="submit"
        >
          保存物品
        </button>

      </form>

    </div>

  `;


  document.body.appendChild(
    modal
  );


  /* 点击背景关闭 */

  modal.addEventListener(
    "click",
    event => {

      if (
        event.target === modal
      ) {

        closeItemModal();

      }

    }
  );


  /* 均价实时计算 */

  const price =
    $("#itemPrice");

  const purchaseQuantity =
    $("#itemPurchaseQuantity");


  if (price) {

    price.addEventListener(
      "input",
      updateAveragePreview
    );

  }


  if (purchaseQuantity) {

    purchaseQuantity.addEventListener(
      "input",
      updateAveragePreview
    );

  }

}


/* =========================================================
   21. 填充输入框
   ========================================================= */

function fillInput(id, value) {

  const element =
    document.getElementById(id);

  if (element) {

    element.value =
      value ?? "";

  }

}


/* =========================================================
   22. 均价实时预览
   ========================================================= */

function updateAveragePreview() {

  const price =
    Number(
      getValue("itemPrice")
    );


  const quantity =
    Number(
      getValue("itemPurchaseQuantity")
    );


  const preview =
    $("#averagePricePreview");


  if (!preview) {
    return;
  }


  if (
    price > 0 &&
    quantity > 0
  ) {

    const average =
      price / quantity;

    const unit =
      getValue("itemUnit") ||
      "个";


    preview.textContent =
      `¥${average.toFixed(2)} / ${unit}`;

  } else {

    preview.textContent =
      "—";

  }

}


/* =========================================================
   23. 获取表单值
   ========================================================= */

function getValue(id) {

  const element =
    document.getElementById(id);

  return element
    ? element.value
    : "";

}


/* =========================================================
   24. 保存物品
   ========================================================= */

function saveItem(event) {

  if (event) {
    event.preventDefault();
  }


  const id =
    getValue("itemId");


  const name =
    getValue("itemName")
      .trim();


  if (!name) {

    alert("请输入物品名称。");

    return;

  }


  const price =
    Number(
      getValue("itemPrice") || 0
    );


  const purchaseQuantity =
    Number(
      getValue(
        "itemPurchaseQuantity"
      ) || 0
    );


  let averagePrice = 0;


  if (
    price > 0 &&
    purchaseQuantity > 0
  ) {

    averagePrice =
      price /
      purchaseQuantity;

  }


  const itemData = {

    person:
      state.currentPerson,

    name:
      name,

    brand:
      getValue("itemBrand")
        .trim(),

    spec:
      getValue("itemSpec")
        .trim(),

    category:
      getValue("itemCategory")
        .trim() ||
      "其他",

    unit:
      getValue("itemUnit") ||
      "个",

    quantity:
      Number(
        getValue("itemQuantity") || 0
      ),

    minimum:
      Number(
        getValue("itemMinimum") || 0
      ),

    expiry:
      getValue("itemExpiry"),

    location:
      getValue("itemLocation")
        .trim(),

    purchaseDate:
      getValue("itemPurchaseDate"),

    price:
      price,

    purchaseQuantity:
      purchaseQuantity,

    averagePrice:
      averagePrice,

    notes:
      getValue("itemNotes")
        .trim()

  };


  /* 编辑 */

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

        ...itemData

      };

    }


  } else {

    /* 新增 */

    state.items.push({

      id:
        generateId(),

      ...itemData,

      createdAt:
        Date.now()

    });

  }


  saveData();

  closeItemModal();

  renderAll();

}


/* =========================================================
   25. 关闭窗口
   ========================================================= */

function closeItemModal() {

  const modal =
    $("#itemModal");

  if (modal) {

    modal.classList.remove(
      "show"
    );

  }

}


/* =========================================================
   26. 删除
   ========================================================= */

function deleteItem(id) {

  const item =
    state.items.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!item) {
    return;
  }


  const confirmed =
    confirm(
      `确定删除「${item.name}」吗？`
    );


  if (!confirmed) {
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
   27. 管理对象
   ========================================================= */

function renderPeople() {

  const select =
    $("#personSelect") ||
    $("#personSelector");


  if (!select) {
    return;
  }


  const oldValue =
    state.currentPerson;


  select.innerHTML =
    state.people
      .map(
        person =>
          `<option value="${escapeHTML(person)}">
            ${escapeHTML(person)}
          </option>`
      )
      .join("");


  if (
    state.people.includes(oldValue)
  ) {

    select.value =
      oldValue;

  }

}


/* =========================================================
   28. 管理对象窗口
   ========================================================= */

function openPeopleModal() {

  let modal =
    $("#peopleModal");


  if (!modal) {

    createPeopleModal();

    modal =
      $("#peopleModal");

  }


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


/* =========================================================
   29. 创建管理对象窗口
   ========================================================= */

function createPeopleModal() {

  const modal =
    document.createElement("div");

  modal.id =
    "peopleModal";

  modal.className =
    "modal";


  modal.innerHTML = `

    <div class="modal-content">

      <div class="modal-header">

        <h2>
          管理对象
        </h2>

        <button
          type="button"
          onclick="closePeopleModal()"
        >
          ×
        </button>

      </div>


      <div id="peopleList">
      </div>


      <div class="add-person">

        <input
          id="newPersonName"
          placeholder="输入姓名"
        >

        <button
          type="button"
          onclick="addPerson()"
        >
          添加
        </button>

      </div>

    </div>

  `;


  document.body.appendChild(
    modal
  );


  modal.addEventListener(
    "click",
    event => {

      if (
        event.target === modal
      ) {

        closePeopleModal();

      }

    }
  );

}


/* =========================================================
   30. 渲染管理对象列表
   ========================================================= */

function renderPeopleList() {

  const container =
    $("#peopleList");

  if (!container) {
    return;
  }


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


/* =========================================================
   31. 添加管理对象
   ========================================================= */

function addPerson() {

  const input =
    $("#newPersonName");


  if (!input) {
    return;
  }


  const name =
    input.value.trim();


  if (!name) {

    alert("请输入姓名。");

    return;

  }


  if (
    state.people.includes(name)
  ) {

    alert("这个管理对象已经存在。");

    return;

  }


  state.people.push(name);

  state.currentPerson =
    name;


  input.value =
    "";


  saveData();

  renderAll();

  renderPeopleList();

}


/* =========================================================
   32. 删除管理对象
   ========================================================= */

function deletePerson(name) {

  if (
    state.people.length <= 1
  ) {

    alert("至少需要保留一个管理对象。");

    return;

  }


  const confirmed =
    confirm(
      `确定删除「${name}」吗？`
    );


  if (!confirmed) {
    return;
  }


  state.people =
    state.people.filter(
      person =>
        person !== name
    );


  /*
   * 这里不删除该人的物品。
   * 只是将物品重新归到当前管理对象，
   * 避免数据丢失。
   */

  state.items =
    state.items.map(item => {

      if (
        item.person === name
      ) {

        return {

          ...item,

          person:
            state.people[0]

        };

      }

      return item;

    });


  if (
    state.currentPerson === name
  ) {

    state.currentPerson =
      state.people[0];

  }


  saveData();

  renderAll();

  renderPeopleList();

}


/* =========================================================
   33. Excel 导出
   ========================================================= */

function exportExcel() {

  if (
    typeof XLSX ===
    "undefined"
  ) {

    alert(
      "Excel 功能需要网络连接，请稍后再试。"
    );

    return;

  }


  const items =
    getCurrentItems();


  if (items.length === 0) {

    alert("当前没有可以导出的物品。");

    return;

  }


  const rows =
    items.map(item => ({

      管理对象:
        item.person,

      物品名称:
        item.name,

      品牌:
        item.brand,

      规格:
        item.spec,

      分类:
        item.category,

      单位:
        item.unit,

      当前余量:
        item.quantity,

      最低余量:
        item.minimum,

      到期日:
        item.expiry,

      存放位置:
        item.location,

      购买日期:
        item.purchaseDate,

      总价格:
        item.price,

      购买数量:
        item.purchaseQuantity,

      均价:
        item.averagePrice,

      备注:
        item.notes

    }));


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


  const date =
    new Date()
      .toISOString()
      .slice(0, 10);


  XLSX.writeFile(
    workbook,
    `物品管理_${state.currentPerson}_${date}.xlsx`
  );

}


/* =========================================================
   34. Excel 导入
   ========================================================= */

function importExcel(file) {

  if (
    !file
  ) {
    return;
  }


  if (
    typeof XLSX ===
    "undefined"
  ) {

    alert(
      "Excel 功能需要网络连接，请稍后再试。"
    );

    return;

  }


  const reader =
    new FileReader();


  reader.onload =
    event => {

      try {

        const data =
          new Uint8Array(
            event.target.result
          );


        const workbook =
          XLSX.read(
            data,
            {
              type: "array"
            }
          );


        const sheet =
          workbook.Sheets[
            workbook.SheetNames[0]
          ];


        const rows =
          XLSX.utils.sheet_to_json(
            sheet,
            {
              defval: ""
            }
          );


        if (
          !rows.length
        ) {

          alert(
            "Excel 中没有找到数据。"
          );

          return;

        }


        let imported =
          0;


        rows.forEach(row => {

          const name =
            row["物品名称"] ||
            row["名称"] ||
            row["物品"] ||
            "";


          if (
            !String(name).trim()
          ) {

            return;

          }


          const person =
            row["管理对象"] ||
            state.currentPerson;


          const price =
            Number(
              row["总价格"] ||
              row["价格"] ||
              0
            ) || 0;


          const purchaseQuantity =
            Number(
              row["购买数量"] ||
              row["购买份数"] ||
              0
            ) || 0;


          let averagePrice =
            Number(
              row["均价"] ||
              0
            ) || 0;


          if (
            price > 0 &&
            purchaseQuantity > 0
          ) {

            averagePrice =
              price /
              purchaseQuantity;

          }


          state.items.push({

            id:
              generateId(),

            person:
              String(person),

            name:
              String(name),

            brand:
              String(
                row["品牌"] || ""
              ),

            spec:
              String(
                row["规格"] || ""
              ),

            category:
              String(
                row["分类"] || "其他"
              ),

            unit:
              String(
                row["单位"] || "个"
              ),

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

            location:
              String(
                row["存放位置"] || ""
              ),

            purchaseDate:
              normalizeExcelDate(
                row["购买日期"]
              ),

            price:
              price,

            purchaseQuantity:
              purchaseQuantity,

            averagePrice:
              averagePrice,

            notes:
              String(
                row["备注"] || ""
              ),

            createdAt:
              Date.now() + imported

          });


          /* 如果 Excel 中出现新管理对象 */

          if (
            person &&
            !state.people.includes(
              String(person)
            )
          ) {

            state.people.push(
              String(person)
            );

          }


          imported++;

        });


        saveData();

        renderAll();


        alert(
          `成功导入 ${imported} 条物品。`
        );


      } catch (error) {

        console.error(
          "Excel 导入失败：",
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

}


/* =========================================================
   35. Excel 日期处理
   ========================================================= */

function normalizeExcelDate(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return "";

  }


  /* 已经是标准日期 */

  if (
    typeof value === "string"
  ) {

    const text =
      value.trim();


    if (
      /^\d{4}-\d{1,2}-\d{1,2}$/.test(
        text
      )
    ) {

      const parts =
        text.split("-");


      return [
        parts[0],
        String(parts[1]).padStart(2, "0"),
        String(parts[2]).padStart(2, "0")
      ].join("-");

    }


    const date =
      new Date(text);


    if (
      !isNaN(
        date.getTime()
      )
    ) {

      return formatDate(date);

    }

  }


  /* Excel serial number */

  if (
    typeof value === "number"
  ) {

    const date =
      XLSX.SSF.parse_date_code(
        value
      );


    if (date) {

      return [
        date.y,
        String(date.m).padStart(2, "0"),
        String(date.d).padStart(2, "0")
      ].join("-");

    }

  }


  return String(value);

}


/* =========================================================
   36. 日期格式
   ========================================================= */

function formatDate(date) {

  return [

    date.getFullYear(),

    String(
      date.getMonth() + 1
    ).padStart(2, "0"),

    String(
      date.getDate()
    ).padStart(2, "0")

  ].join("-");

}


/* =========================================================
   37. JSON 备份
   ========================================================= */

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


  const date =
    new Date()
      .toISOString()
      .slice(0, 10);


  a.href =
    url;

  a.download =
    `物品管理备份_${date}.json`;


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
   38. JSON 恢复
   ========================================================= */

function importJSON(file) {

  if (!file) {
    return;
  }


  const reader =
    new FileReader();


  reader.onload =
    event => {

      try {

        const data =
          JSON.parse(
            event.target.result
          );


        if (
          !data ||
          !Array.isArray(
            data.items
          )
        ) {

          throw new Error(
            "JSON 格式不正确"
          );

        }


        const confirmed =
          confirm(
            "恢复备份会覆盖当前数据，确定继续吗？"
          );


        if (!confirmed) {
          return;
        }


        state = {

          people:
            Array.isArray(data.people) &&
            data.people.length
              ? data.people
              : ["我"],

          currentPerson:
            data.currentPerson ||
            (
              Array.isArray(data.people) &&
              data.people.length
                ? data.people[0]
                : "我"
            ),

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
          "JSON 恢复失败：",
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

}


/* =========================================================
   39. 文件选择
   ========================================================= */

function handleExcelInput(event) {

  const file =
    event.target.files[0];

  if (file) {

    importExcel(file);

  }


  event.target.value =
    "";

}


function handleJSONInput(event) {

  const file =
    event.target.files[0];

  if (file) {

    importJSON(file);

  }


  event.target.value =
    "";

}


/* =========================================================
   40. 总渲染
   ========================================================= */

function renderAll() {

  renderPeople();

  renderCategoryFilter();

  renderDashboard();

  renderItems();

}


/* =========================================================
   41. 兼容旧版按钮
   ========================================================= */

window.openItemModal =
  openItemModal;

window.closeItemModal =
  closeItemModal;

window.saveItem =
  saveItem;

window.deleteItem =
  deleteItem;

window.changeQuantity =
  changeQuantity;

window.openPeopleModal =
  openPeopleModal;

window.closePeopleModal =
  closePeopleModal;

window.addPerson =
  addPerson;

window.deletePerson =
  deletePerson;

window.exportExcel =
  exportExcel;

window.exportJSON =
  exportJSON;

window.importExcel =
  importExcel;

window.importJSON =
  importJSON;

window.handleExcelInput =
  handleExcelInput;

window.handleJSONInput =
  handleJSONInput;

window.renderAll =
  renderAll;


/* =========================================================
   42. 兼容 HTML 中的 onchange
   ========================================================= */

window.updateAveragePreview =
  updateAveragePreview;


/* =========================================================
   43. 自动监听 Excel / JSON input
   ========================================================= */

document.addEventListener(
  "change",
  event => {

    if (
      event.target.id ===
      "excelInput"
    ) {

      handleExcelInput(
        event
      );

    }


    if (
      event.target.id ===
      "jsonInput"
    ) {

      handleJSONInput(
        event
      );

    }

  }
);


/* =========================================================
   完成
   ========================================================= */