/* =========================================================
   我的物品管理
   1.0 紧凑界面 + 2.0 全功能
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
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    const data = JSON.parse(saved);

    if (!data || typeof data !== "object") return;

    state.people =
      Array.isArray(data.people) && data.people.length
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
    console.error("读取数据失败:", error);
  }
}


function saveData() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch (error) {
    console.error("保存数据失败:", error);
    alert("数据保存失败，请检查浏览器存储权限。");
  }
}


function normalizeData() {

  if (
    !Array.isArray(state.people) ||
    state.people.length === 0
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

      const averagePrice =
        price > 0 &&
        purchaseQuantity > 0
          ? price / purchaseQuantity
          : 0;

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

        price:

          price,

        purchaseQuantity:

          purchaseQuantity,

        averagePrice:

          averagePrice,

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


/* =========================================================
   工具
   ========================================================= */

function generateId() {

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .substring(2, 9)
  );

}


function $(selector) {
  return document.querySelector(selector);
}


function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
  ) {
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


/* =========================================================
   管理对象
   ========================================================= */

function renderPeople() {

  const select =
    $("#personSelect");

  if (!select) return;

  select.innerHTML =
    state.people
      .map(person => {

        return `
          <option value="${escapeHTML(person)}">
            ${escapeHTML(person)}
          </option>
        `;

      })
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

  modal.classList.add("show");
}


function closePeopleModal() {

  const modal =
    $("#peopleModal");

  if (!modal) return;

  modal.classList.remove("show");
}


function renderPeopleList() {

  const container =
    $("#peopleList");

  if (!container) return;

  container.innerHTML =
    state.people
      .map(person => {

        return `

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

        `;

      })
      .join("");
}


function addPerson() {

  const input =
    $("#newPersonName");

  if (!input) return;

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

  input.value = "";

  saveData();

  renderAll();

  renderPeopleList();
}


function deletePerson(name) {

  if (
    state.people.length <= 1
  ) {
    alert("至少需要保留一个管理对象。");
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
      person => person !== name
    );

  /*
   * 不删除这个人的物品。
   * 将物品转移给剩余的第一个管理对象。
   */

  state.items =
    state.items.map(item => {

      if (
        item.person === name
      ) {

        return {
          ...item,
          person: replacement
        };

      }

      return item;

    });

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


/* =========================================================
   当前管理对象物品
   ========================================================= */

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

  if (
    isNaN(
      expiryDate.getTime()
    )
  ) {
    return null;
  }

  return Math.round(
    (
      expiryDate.getTime() -
      today.getTime()
    ) /
    (1000 * 60 * 60 * 24)
  );
}


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
   状态
   ========================================================= */

function getItemStatus(item) {

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
   仪表盘
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

  });


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


function setText(
  selector,
  value
) {

  const element =
    $(selector);

  if (element) {
    element.textContent =
      value;
  }
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
    ];

  select.innerHTML =
    `
      <option value="all">
        全部分类
      </option>
    ` +
    categories
      .sort(
        (a, b) =>
          a.localeCompare(
            b,
            "zh"
          )
      )
      .map(
        category => `
          <option value="${escapeHTML(category)}">
            ${escapeHTML(category)}
          </option>
        `
      )
      .join("");

  if (
    oldValue === "all" ||
    categories.includes(oldValue)
  ) {
    select.value =
      oldValue;
  } else {
    select.value =
      "all";
  }
}


/* =========================================================
   搜索 + 筛选 + 排序
   ========================================================= */

function getFilteredItems() {

  let items =
    [...getCurrentItems()];


  /* 搜索 */

  const search =
    $("#searchInput");

  const keyword =
    search
      ? search.value
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

        return text.includes(
          keyword
        );

      });

  }


  /* 分类 */

  const categorySelect =
    $("#categoryFilter");

  const category =
    categorySelect
      ? categorySelect.value
      : "all";

  /*
   * 这里特别修复了：
   * all = 全部，而不是过滤条件
   */

  if (
    category &&
    category !== "all"
  ) {

    items =
      items.filter(
        item =>
          item.category ===
          category
      );

  }


  /* 状态 */

  const statusSelect =
    $("#statusFilter");

  const status =
    statusSelect
      ? statusSelect.value
      : "all";

  /*
   * 这里同样修复：
   * all = 全部
   */

  if (
    status &&
    status !== "all"
  ) {

    items =
      items.filter(
        item =>
          getItemStatus(item) ===
          status
      );

  }


  /* 排序 */

  const sortSelect =
    $("#sortSelect");

  const sort =
    sortSelect
      ? sortSelect.value
      : "added-desc";


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
            getDaysUntilExpiry(
              a.expiry
            );

          const db =
            getDaysUntilExpiry(
              b.expiry
            );

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
            Number(a.quantity || 0) -
            Number(b.quantity || 0)
          );


        case "price":

          return (
            Number(a.averagePrice || 0) -
            Number(b.averagePrice || 0)
          );


        case "added-desc":

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
   渲染物品
   ========================================================= */

function renderItems() {

  const container =
    $("#itemList");

  if (!container) return;

  const items =
    getFilteredItems();


  if (
    items.length === 0
  ) {

    container.innerHTML = `

      <div style="
        text-align:center;
        padding:30px 15px;
        color:#8b929d;
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
   物品卡片
   ========================================================= */

function renderItemCard(item) {

  const status =
    getItemStatus(item);

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

  } else if (
    days !== null &&
    days <= 30
  ) {

    expiryClass =
      "orange";

  }


  const price =
    Number(
      item.price || 0
    );

  const purchaseQuantity =
    Number(
      item.purchaseQuantity || 0
    );

  const averagePrice =
    price > 0 &&
    purchaseQuantity > 0
      ? price /
        purchaseQuantity
      : 0;


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
              (item.brand ||
               item.spec) &&
              item.category
                ? " · "
                : ""
            }

            ${
              item.category
                ? escapeHTML(
                    item.category
                  )
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


      <div class="item-tags">

        <span class="item-tag">
          ${escapeHTML(
            item.category
          )}
        </span>

        <span class="
          item-tag
          ${expiryClass}
        ">

          ${escapeHTML(
            expiryText
          )}

        </span>

      </div>


      <div class="quantity-box">

        <div>

          <div class="quantity-title">
            当前余量
          </div>

          <div class="quantity-value">

            ${item.quantity}
            ${escapeHTML(
              item.unit
            )}

          </div>

        </div>


        <div class="quantity-buttons">

          <button
            type="button"
            onclick="
              changeQuantity(
                '${escapeJS(item.id)}',
                -1
              )
            "
          >
            −
          </button>

          <button
            type="button"
            onclick="
              changeQuantity(
                '${escapeJS(item.id)}',
                1
              )
            "
          >
            ＋
          </button>

        </div>

      </div>


      <div class="item-info-grid">


        <div class="info-box">

          <div class="info-title">
            到期日
          </div>

          <div class="info-value">

            ${
              item.expiry
                ? escapeHTML(
                    item.expiry
                  )
                : "—"
            }

          </div>

        </div>


        <div class="info-box">

          <div class="info-title">
            状态
          </div>

          <div class="info-value">

            ${escapeHTML(
              expiryText
            )}

          </div>

        </div>


        <div class="info-box">

          <div class="info-title">
            存放位置
          </div>

          <div class="info-value">

            ${
              item.location
                ? escapeHTML(
                    item.location
                  )
                : "—"
            }

          </div>

        </div>


        <div class="info-box">

          <div class="info-title">
            购买日期
          </div>

          <div class="info-value">

            ${
              item.purchaseDate
                ? escapeHTML(
                    item.purchaseDate
                  )
                : "—"
            }

          </div>

        </div>


        <div class="info-box">

          <div class="info-title">
            总价格
          </div>

          <div class="info-value">

            ${
              price > 0
                ? `¥${price.toFixed(2)}`
                : "—"
            }

          </div>

        </div>


        <div class="info-box">

          <div class="info-title">
            均价
          </div>

          <div class="info-value">

            ${
              averagePrice > 0
                ? `
                  ¥${averagePrice.toFixed(2)}
                  /${escapeHTML(item.unit)}
                `
                : "—"
            }

            ${
              averagePrice > 0
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


      ${
        item.notes
          ? `
            <div
              class="item-meta"
              style="margin-top:8px;"
            >
              📝
              ${escapeHTML(
                item.notes
              )}
            </div>
          `
          : ""
      }


      <div class="item-actions">

        <button
          type="button"
          onclick="
            openItemModal(
              '${escapeJS(item.id)}'
            )
          "
        >
          ✏️ 编辑
        </button>


        <button
          type="button"
          class="delete"
          onclick="
            deleteItem(
              '${escapeJS(item.id)}'
            )
          "
        >
          🗑 删除
        </button>

      </div>

    </div>

  `;
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
      Number(item.quantity || 0) +
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

  if (!modal || !form) {
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
    $("#modalTitle");


  if (id) {

    const item =
      state.items.find(
        item =>
          String(item.id) ===
          String(id)
      );

    if (!item) return;


    if (title) {
      title.textContent =
        "编辑物品";
    }


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
      "itemLocation",
      item.location
    );

    setInput(
      "itemNotes",
      item.notes
    );


  } else {

    if (title) {
      title.textContent =
        "添加物品";
    }

    setInput(
      "itemCategory",
      "其他"
    );

    setInput(
      "itemUnit",
      "个"
    );

    setInput(
      "itemQuantity",
      0
    );

    setInput(
      "itemMinimum",
      0
    );

  }


  updateAveragePrice();

  modal.classList.add(
    "show"
  );
}


function closeItemModal() {

  const modal =
    $("#itemModal");

  if (!modal) return;

  modal.classList.remove(
    "show"
  );
}


function setInput(
  id,
  value
) {

  const element =
    document.getElementById(id);

  if (element) {
    element.value =
      value ?? "";
  }
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
    ) || "个";

  const preview =
    $("#averagePricePreview");

  if (!preview) return;


  if (
    price > 0 &&
    quantity > 0
  ) {

    preview.textContent =
      `¥${(
        price / quantity
      ).toFixed(2)} / ${unit}`;

  } else {

    preview.textContent =
      "¥0.00 / 个";

  }
}


/*
 * 兼容我之前版本里的函数名
 */
function updateAveragePreview() {
  updateAveragePrice();
}


function getValue(id) {

  const element =
    document.getElementById(id);

  return element
    ? element.value
    : "";
}


/* =========================================================
   保存
   ========================================================= */

function saveItem(event) {

  if (event) {
    event.preventDefault();
  }


  const name =
    getValue(
      "itemName"
    ).trim();


  if (!name) {
    alert("请输入物品名称。");
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


  const averagePrice =
    price > 0 &&
    purchaseQuantity > 0
      ? price /
        purchaseQuantity
      : 0;


  const data = {

    person:
      state.currentPerson,

    name:
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

    price:
      price,

    purchaseQuantity:
      purchaseQuantity,

    averagePrice:
      averagePrice,

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

  } else {

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
   删除
   ========================================================= */

function deleteItem(id) {

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
    items.map(item => ({

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

      购买日期:
        item.purchaseDate,

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
    `物品管理_${date}.xlsx`
  );
}


/* =========================================================
   Excel 导入
   ========================================================= */

/*
 * 你的 index.html 是：
 *
 * onchange="importExcel(event)"
 *
 * 所以这里必须接收 event。
 */

function importExcel(event) {

  const file =
    event &&
    event.target
      ? event.target.files[0]
      : event;


  if (!file) {
    return;
  }


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

        const data =
          new Uint8Array(
            e.target.result
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


        if (!rows.length) {

          alert(
            "Excel 中没有找到数据。"
          );

          return;
        }


        let count = 0;


        rows.forEach(row => {

          const name =
            row["物品名称"] ||
            row["名称"] ||
            row["物品"];


          if (
            !String(
              name || ""
            ).trim()
          ) {
            return;
          }


          const person =
            String(
              row["管理对象"] ||
              state.currentPerson
            );


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


          const averagePrice =
            price > 0 &&
            purchaseQuantity > 0
              ? price /
                purchaseQuantity
              : 0;


          state.items.push({

            id:
              generateId(),

            person:
              person,

            name:
              String(
                name
              ),

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

            price:
              price,

            purchaseQuantity:
              purchaseQuantity,

            averagePrice:
              averagePrice,

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
                row["存放位置"] ||
                ""
              ),

            purchaseDate:
              normalizeExcelDate(
                row["购买日期"]
              ),

            notes:
              String(
                row["备注"] ||
                ""
              ),

            createdAt:
              Date.now() +
              count

          });


          count++;

        });


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


  /*
   * 允许再次选择同一个文件
   */

  if (
    event &&
    event.target
  ) {

    event.target.value =
      "";

  }
}


/* =========================================================
   Excel 日期
   ========================================================= */

function normalizeExcelDate(
  value
) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }


  if (
    typeof value ===
    "string"
  ) {

    const text =
      value.trim();


    if (
      /^\d{4}-\d{1,2}-\d{1,2}$/
        .test(text)
    ) {

      const parts =
        text.split("-");

      return [
        parts[0],
        String(parts[1])
          .padStart(2, "0"),
        String(parts[2])
          .padStart(2, "0")
      ].join("-");

    }


    const date =
      new Date(text);


    if (
      !isNaN(
        date.getTime()
      )
    ) {

      return formatDate(
        date
      );

    }

  }


  if (
    typeof value ===
    "number" &&
    typeof XLSX !==
    "undefined"
  ) {

    const date =
      XLSX.SSF
        .parse_date_code(
          value
        );


    if (date) {

      return [
        date.y,
        String(date.m)
          .padStart(2, "0"),
        String(date.d)
          .padStart(2, "0")
      ].join("-");

    }

  }


  return String(value);
}


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

function importJSON(event) {

  const file =
    event &&
    event.target
      ? event.target.files[0]
      : event;


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


  if (
    event &&
    event.target
  ) {
    event.target.value =
      "";
  }
}


/* =========================================================
   总渲染
   ========================================================= */

function renderAll() {

  renderPeople();

  renderCategoryFilter();

  renderDashboard();

  renderItems();

}


/* =========================================================
   全局函数
   给 index.html 的 onclick / onchange 使用
   ========================================================= */

window.changePerson =
  changePerson;

window.openPeopleModal =
  openPeopleModal;

window.closePeopleModal =
  closePeopleModal;

window.addPerson =
  addPerson;

window.deletePerson =
  deletePerson;

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

window.exportExcel =
  exportExcel;

window.importExcel =
  importExcel;

window.exportJSON =
  exportJSON;

window.importJSON =
  importJSON;

window.updateAveragePrice =
  updateAveragePrice;

window.updateAveragePreview =
  updateAveragePreview;

window.renderItems =
  renderItems;

window.renderAll =
  renderAll;