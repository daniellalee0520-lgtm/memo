/* =====================================================
   我的物品管理 2.0
===================================================== */

const STORAGE_KEY = "my-item-manager-v2";


/* =====================================================
   初始数据
===================================================== */

const defaultState = {

  people: [
    "我自己"
  ],

  activePerson: "我自己",

  items: []

};


let state = loadData();


/* =====================================================
   基础工具
===================================================== */

function uid() {

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .substring(2, 9)
  );

}


function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );

}


function loadData() {

  try {

    const data =
      JSON.parse(
        localStorage.getItem(
          STORAGE_KEY
        )
      );

    if (
      data &&
      Array.isArray(data.people) &&
      Array.isArray(data.items)
    ) {

      return data;

    }

  } catch (error) {

    console.error(error);

  }

  return structuredClone(defaultState);

}


function escapeHTML(value = "") {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =====================================================
   日期
===================================================== */

function today() {

  const d = new Date();

  d.setHours(
    0,
    0,
    0,
    0
  );

  return d;

}


function getDaysToExpiry(date) {

  if (!date) {

    return null;

  }

  const target =
    new Date(
      date + "T00:00:00"
    );

  return Math.ceil(
    (
      target.getTime() -
      today().getTime()
    ) /
    86400000
  );

}


/* =====================================================
   状态
===================================================== */

function getStatus(item) {

  const quantity =
    Number(item.quantity) || 0;

  const minimum =
    Number(item.minQuantity) || 0;

  const days =
    getDaysToExpiry(
      item.expiryDate
    );


  /* 已用完 */

  if (quantity <= 0) {

    return {

      type: "empty",

      text: "已用完",

      color: "red"

    };

  }


  /* 已过期 */

  if (
    days !== null &&
    days < 0
  ) {

    return {

      type: "expired",

      text:
        `已过期 ${Math.abs(days)} 天`,

      color: "red"

    };

  }


  /* 库存不足 */

  if (
    minimum > 0 &&
    quantity <= minimum
  ) {

    return {

      type: "low",

      text: "余量告急",

      color: "orange"

    };

  }


  /* 即将到期 */

  if (
    days !== null &&
    days <= 30
  ) {

    return {

      type: "soon",

      text:
        days === 0
          ? "今天到期"
          : `剩余 ${days} 天`,

      color: "orange"

    };

  }


  /* 正常 */

  if (days !== null) {

    return {

      type: "normal",

      text:
        `剩余 ${days} 天`,

      color: "green"

    };

  }


  return {

    type: "normal",

    text: "无到期日",

    color: "blue"

  };

}


/* =====================================================
   Toast
===================================================== */

let toastTimer;


function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  clearTimeout(
    toastTimer
  );

  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2200
    );

}


/* =====================================================
   管理对象
===================================================== */

function renderPeople() {

  const select =
    document.getElementById(
      "personSelect"
    );


  select.innerHTML =
    state.people
      .map(
        person => `
          <option
            value="${escapeHTML(person)}"
            ${person === state.activePerson
              ? "selected"
              : ""}
          >
            ${escapeHTML(person)}
          </option>
        `
      )
      .join("");


  document.getElementById(
    "currentPersonText"
  ).textContent =
    `管理：${state.activePerson}`;


  renderPeopleModal();

}


function renderPeopleModal() {

  const list =
    document.getElementById(
      "peopleList"
    );


  list.innerHTML =
    state.people
      .map(
        person => {

          const canDelete =
            state.people.length > 1;

          return `

            <div class="person-row">

              <div class="person-name">

                ${escapeHTML(person)}

                ${
                  person ===
                  state.activePerson
                    ? "（当前）"
                    : ""
                }

              </div>


              ${
                canDelete
                  ? `
                    <button
                      class="person-delete"
                      data-delete-person="${escapeHTML(person)}"
                    >
                      删除
                    </button>
                  `
                  : ""
              }

            </div>

          `;

        }
      )
      .join("");

}


/* =====================================================
   分类
===================================================== */

function renderCategories() {

  const select =
    document.getElementById(
      "categoryFilter"
    );


  const current =
    select.value;


  const categories =
    [
      ...new Set(

        state.items

          .filter(
            item =>
              item.person ===
              state.activePerson
          )

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
          "zh-CN"
        )
    );


  select.innerHTML = `

    <option value="">
      全部分类
    </option>

    ${categories
      .map(
        category => `
          <option
            value="${escapeHTML(category)}"
          >
            ${escapeHTML(category)}
          </option>
        `
      )
      .join("")}

  `;


  if (
    categories.includes(
      current
    )
  ) {

    select.value =
      current;

  }

}


/* =====================================================
   仪表盘
===================================================== */

function renderDashboard() {

  const items =
    state.items.filter(
      item =>
        item.person ===
        state.activePerson
    );


  let expired = 0;

  let soon = 0;

  let low = 0;


  items.forEach(
    item => {

      const status =
        getStatus(item);


      if (
        status.type ===
        "expired"
      ) {

        expired++;

      }


      if (
        status.type ===
        "soon"
      ) {

        soon++;

      }


      if (
        status.type ===
        "low"
      ) {

        low++;

      }

    }
  );


  document.getElementById(
    "totalCount"
  ).textContent =
    items.length;


  document.getElementById(
    "expiredCount"
  ).textContent =
    expired;


  document.getElementById(
    "soonCount"
  ).textContent =
    soon;


  document.getElementById(
    "lowCount"
  ).textContent =
    low;

}


/* =====================================================
   获取过滤后的物品
===================================================== */

function getFilteredItems() {

  const search =
    document.getElementById(
      "searchInput"
    )
      .value
      .trim()
      .toLowerCase();


  const category =
    document.getElementById(
      "categoryFilter"
    ).value;


  const status =
    document.getElementById(
      "statusFilter"
    ).value;


  const sort =
    document.getElementById(
      "sortSelect"
    ).value;


  let items =
    state.items.filter(
      item => {

        if (
          item.person !==
          state.activePerson
        ) {

          return false;

        }


        const text =
          [
            item.name,
            item.category,
            item.brand,
            item.spec,
            item.location,
            item.notes
          ]
          .join(" ")
          .toLowerCase();


        if (
          search &&
          !text.includes(search)
        ) {

          return false;

        }


        if (
          category &&
          item.category !==
          category
        ) {

          return false;

        }


        if (
          status &&
          getStatus(item).type !==
          status
        ) {

          return false;

        }


        return true;

      }
    );


  /* 排序 */

  items.sort(
    (a, b) => {

      if (
        sort === "name"
      ) {

        return a.name.localeCompare(
          b.name,
          "zh-CN"
        );

      }


      if (
        sort === "expiry"
      ) {

        const ad =
          getDaysToExpiry(
            a.expiryDate
          );

        const bd =
          getDaysToExpiry(
            b.expiryDate
          );


        if (ad === null) return 1;

        if (bd === null) return -1;

        return ad - bd;

      }


      if (
        sort === "quantity"
      ) {

        return (
          Number(a.quantity) -
          Number(b.quantity)
        );

      }


      if (
        sort === "created"
      ) {

        return (
          Number(b.createdAt) -
          Number(a.createdAt)
        );

      }


      return 0;

    }
  );


  return items;

}


/* =====================================================
   渲染物品
===================================================== */

function renderItems() {

  const list =
    document.getElementById(
      "itemsList"
    );


  const empty =
    document.getElementById(
      "emptyState"
    );


  const items =
    getFilteredItems();


  if (
    items.length === 0
  ) {

    list.innerHTML = "";

    empty.classList.remove(
      "hidden"
    );

    return;

  }


  empty.classList.add(
    "hidden"
  );


  list.innerHTML =
    items
      .map(
        renderItemCard
      )
      .join("");

}


/* =====================================================
   单个物品卡片
===================================================== */

function renderItemCard(item) {

  const status =
    getStatus(item);


  const minimum =
    Number(item.minQuantity) || 0;


  const quantity =
    Number(item.quantity) || 0;


  const days =
    getDaysToExpiry(
      item.expiryDate
    );


  let expiryText =
    "—";


  if (
    item.expiryDate
  ) {

    if (
      days < 0
    ) {

      expiryText =
        `已过期 ${Math.abs(days)} 天`;

    } else if (
      days === 0
    ) {

      expiryText =
        "今天到期";

    } else {

      expiryText =
        `剩余 ${days} 天`;

    }

  }


  return `

    <article
      class="item-card"
    >

      <div class="item-header">

        <div>

          <div class="item-name">

            ${escapeHTML(item.name)}

          </div>


          <div class="item-subtitle">

            ${escapeHTML(item.brand || "")}

            ${
              item.brand &&
              item.spec
                ? " · "
                : ""
            }

            ${escapeHTML(item.spec || "")}

          </div>

        </div>

      </div>


      <div class="badges">

        ${
          item.category
            ? `
              <span class="badge blue">
                ${escapeHTML(item.category)}
              </span>
            `
            : ""
        }


        <span
          class="badge ${status.color}"
        >
          ${escapeHTML(status.text)}
        </span>


        ${
          minimum > 0
            ? `
              <span class="badge">
                最低 ${minimum} ${escapeHTML(item.unit)}
              </span>
            `
            : ""
        }

      </div>


      <!-- 余量 -->

      <div class="quantity-box">

        <div>

          <div class="detail-label">
            当前余量
          </div>

          <div class="quantity-number">

            ${quantity}
            ${escapeHTML(item.unit)}

          </div>

        </div>


        <div class="quantity-controls">

          <button
            data-action="minus"
            data-id="${item.id}"
          >
            −
          </button>


          <button
            data-action="plus"
            data-id="${item.id}"
          >
            ＋
          </button>

        </div>

      </div>


      <!-- 详细信息 -->

      <div class="item-details">

        <div class="detail">

          <div class="detail-label">
            到期日
          </div>

          ${escapeHTML(
            item.expiryDate || "—"
          )}

        </div>


        <div class="detail">

          <div class="detail-label">
            状态
          </div>

          ${escapeHTML(
            expiryText
          )}

        </div>


        <div class="detail">

          <div class="detail-label">
            存放位置
          </div>

          ${escapeHTML(
            item.location || "—"
          )}

        </div>


        <div class="detail">

          <div class="detail-label">
            购买日期
          </div>

          ${escapeHTML(
            item.purchaseDate || "—"
          )}

        </div>

      </div>


      ${
        item.notes
          ? `
            <div class="item-notes">
              📝 ${escapeHTML(item.notes)}
            </div>
          `
          : ""
      }


      <div class="item-actions">

        <button
          data-action="edit"
          data-id="${item.id}"
        >
          ✏️ 编辑
        </button>


        <button
          data-action="delete"
          data-id="${item.id}"
        >
          🗑 删除
        </button>

      </div>

    </article>

  `;

}


/* =====================================================
   打开编辑窗口
===================================================== */

function openItemModal(
  item = null
) {

  document.getElementById(
    "modalTitle"
  ).textContent =
    item
      ? "编辑物品"
      : "添加物品";


  document.getElementById(
    "itemId"
  ).value =
    item?.id || "";


  const fields = [

    "name",
    "category",
    "brand",
    "spec",
    "quantity",
    "unit",
    "minQuantity",
    "expiryDate",
    "purchaseDate",
    "location",
    "notes"

  ];


  fields.forEach(
    field => {

      const element =
        document.getElementById(
          field
        );


      if (
        item
      ) {

        element.value =
          item[field] ?? "";

      } else {

        if (
          field === "quantity"
        ) {

          element.value = 0;

        } else if (
          field ===
          "minQuantity"
        ) {

          element.value = 0;

        } else if (
          field === "unit"
        ) {

          element.value = "片";

        } else {

          element.value = "";

        }

      }

    }
  );


  document.getElementById(
    "itemModal"
  )
    .classList
    .remove(
      "hidden"
    );

}


/* =====================================================
   关闭窗口
===================================================== */

function closeModal(
  id
) {

  document.getElementById(
    id
  )
    .classList
    .add(
      "hidden"
    );

}


/* =====================================================
   添加 / 编辑
===================================================== */

document.getElementById(
  "itemForm"
).addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const id =
      document.getElementById(
        "itemId"
      ).value;


    const item = {

      id:
        id || uid(),

      person:
        state.activePerson,

      name:
        document.getElementById(
          "name"
        ).value.trim(),

      category:
        document.getElementById(
          "category"
        ).value.trim(),

      brand:
        document.getElementById(
          "brand"
        ).value.trim(),

      spec:
        document.getElementById(
          "spec"
        ).value.trim(),

      quantity:
        Number(
          document.getElementById(
            "quantity"
          ).value
        ) || 0,

      unit:
        document.getElementById(
          "unit"
        ).value,

      minQuantity:
        Number(
          document.getElementById(
            "minQuantity"
          ).value
        ) || 0,

      expiryDate:
        document.getElementById(
          "expiryDate"
        ).value,

      purchaseDate:
        document.getElementById(
          "purchaseDate"
        ).value,

      location:
        document.getElementById(
          "location"
        ).value.trim(),

      notes:
        document.getElementById(
          "notes"
        ).value.trim(),

      createdAt:
        id
          ? (
              state.items.find(
                x => x.id === id
              )?.createdAt ||
              Date.now()
            )
          : Date.now()

    };


    if (!item.name) {

      showToast(
        "请输入物品名称"
      );

      return;

    }


    const index =
      state.items.findIndex(
        x => x.id === id
      );


    if (
      index >= 0
    ) {

      state.items[index] =
        item;

      showToast(
        "物品已更新"
      );

    } else {

      state.items.push(
        item
      );

      showToast(
        "物品已添加"
      );

    }


    saveData();

    closeModal(
      "itemModal"
    );

    renderAll();

  }
);


/* =====================================================
   快速增加 / 减少库存
===================================================== */

function changeQuantity(
  id,
  amount
) {

  const item =
    state.items.find(
      x => x.id === id
    );


  if (!item) return;


  item.quantity =
    Math.max(
      0,
      Number(item.quantity) +
      amount
    );


  saveData();

  renderAll();

}


/* =====================================================
   物品操作
===================================================== */

document.getElementById(
  "itemsList"
).addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-action]"
      );


    if (!button) return;


    const action =
      button.dataset.action;


    const id =
      button.dataset.id;


    const item =
      state.items.find(
        x => x.id === id
      );


    if (!item) return;


    if (
      action === "plus"
    ) {

      changeQuantity(
        id,
        1
      );

    }


    if (
      action === "minus"
    ) {

      changeQuantity(
        id,
        -1
      );

    }


    if (
      action === "edit"
    ) {

      openItemModal(
        item
      );

    }


    if (
      action === "delete"
    ) {

      const yes =
        confirm(
          `确定删除“${item.name}”吗？`
        );


      if (!yes) return;


      state.items =
        state.items.filter(
          x => x.id !== id
        );


      saveData();

      renderAll();

      showToast(
        "物品已删除"
      );

    }

  }
);


/* =====================================================
   管理对象切换
===================================================== */

document.getElementById(
  "personSelect"
).addEventListener(
  "change",
  event => {

    state.activePerson =
      event.target.value;

    saveData();

    renderAll();

  }
);


/* =====================================================
   添加管理对象
===================================================== */

document.getElementById(
  "addPersonBtn"
).addEventListener(
  "click",
  () => {

    const input =
      document.getElementById(
        "newPerson"
      );


    const name =
      input.value.trim();


    if (!name) {

      showToast(
        "请输入名称"
      );

      return;

    }


    if (
      state.people.includes(
        name
      )
    ) {

      showToast(
        "这个管理对象已经存在"
      );

      return;

    }


    state.people.push(
      name
    );


    state.activePerson =
      name;


    input.value = "";


    saveData();

    renderAll();

    showToast(
      `已添加：${name}`
    );

  }
);


/* =====================================================
   删除管理对象
===================================================== */

document.getElementById(
  "peopleList"
).addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-delete-person]"
      );


    if (!button) return;


    const person =
      button.dataset.deletePerson;


    const hasItems =
      state.items.some(
        item =>
          item.person === person
      );


    let message =
      `确定删除“${person}”吗？`;


    if (hasItems) {

      message +=
        "\n\n这个对象下面还有物品数据。物品数据会保留，但将不再显示在当前对象中。";

    }


    if (
      !confirm(message)
    ) {

      return;

    }


    state.people =
      state.people.filter(
        x => x !== person
      );


    if (
      state.activePerson ===
      person
    ) {

      state.activePerson =
        state.people[0];

    }


    saveData();

    renderAll();

    showToast(
      "管理对象已删除"
    );

  }
);


/* =====================================================
   搜索 / 筛选 / 排序
===================================================== */

[
  "searchInput",
  "categoryFilter",
  "statusFilter",
  "sortSelect"

].forEach(
  id => {

    document.getElementById(
      id
    ).addEventListener(
      "input",
      () => {

        renderItems();

      }
    );

  }
);


/* =====================================================
   打开 / 关闭 Modal
===================================================== */

document.getElementById(
  "addBtn"
).addEventListener(
  "click",
  () => {

    openItemModal();

  }
);


document.getElementById(
  "managePeopleBtn"
).addEventListener(
  "click",
  () => {

    renderPeopleModal();

    document.getElementById(
      "peopleModal"
    )
      .classList
      .remove(
        "hidden"
      );

  }
);


document
  .querySelectorAll(
    "[data-close]"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          closeModal(
            button.dataset.close
          );

        }
      );

    }
  );


/* 点击背景关闭 */

document
  .querySelectorAll(
    ".modal"
  )
  .forEach(
    modal => {

      modal.addEventListener(
        "click",
        event => {

          if (
            event.target ===
            modal
          ) {

            modal.classList.add(
              "hidden"
            );

          }

        }
      );

    }
  );


/* =====================================================
   Excel 导出
===================================================== */

document.getElementById(
  "exportBtn"
).addEventListener(
  "click",
  () => {

    if (
      typeof XLSX ===
      "undefined"
    ) {

      showToast(
        "Excel组件加载失败，请检查网络"
      );

      return;

    }


    const rows =
      state.items.map(
        item => ({

          "管理对象":
            item.person,

          "物品名称":
            item.name,

          "分类":
            item.category,

          "品牌":
            item.brand,

          "规格":
            item.spec,

          "余量":
            item.quantity,

          "单位":
            item.unit,

          "最低余量":
            item.minQuantity,

          "到期日":
            item.expiryDate,

          "购买日期":
            item.purchaseDate,

          "存放位置":
            item.location,

          "备注":
            item.notes

        })
      );


    const workbook =
      XLSX.utils.book_new();


    const worksheet =
      XLSX.utils.json_to_sheet(
        rows
      );


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "物品"
    );


    const filename =
      `物品管理_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;


    XLSX.writeFile(
      workbook,
      filename
    );


    showToast(
      "Excel 已导出"
    );

  }
);


/* =====================================================
   Excel 导入
===================================================== */

document.getElementById(
  "importInput"
).addEventListener(
  "change",
  event => {

    const file =
      event.target.files[0];


    if (!file) return;


    if (
      typeof XLSX ===
      "undefined"
    ) {

      showToast(
        "Excel组件加载失败"
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


          let imported = 0;


          rows.forEach(
            row => {

              const name =
                String(
                  row["物品名称"] ||
                  ""
                ).trim();


              if (!name) return;


              const person =
                String(
                  row["管理对象"] ||
                  "我自己"
                );


              const item = {

                id: uid(),

                person,

                name,

                category:
                  String(
                    row["分类"] ||
                    ""
                  ),

                brand:
                  String(
                    row["品牌"] ||
                    ""
                  ),

                spec:
                  String(
                    row["规格"] ||
                    ""
                  ),

                quantity:
                  Number(
                    row["余量"]
                  ) || 0,

                unit:
                  String(
                    row["单位"] ||
                    "个"
                  ),

                minQuantity:
                  Number(
                    row["最低余量"]
                  ) || 0,

                expiryDate:
                  normalizeDate(
                    row["到期日"]
                  ),

                purchaseDate:
                  normalizeDate(
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
                  Date.now()

              };


              state.items.push(
                item
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


              imported++;

            }
          );


          saveData();

          renderAll();

          showToast(
            `成功导入 ${imported} 条`
          );


        } catch(error) {

          console.error(
            error
          );

          alert(
            "导入失败，请检查 Excel 格式。"
          );

        }

      };


    reader.readAsArrayBuffer(
      file
    );


    event.target.value = "";

  }
);


/* =====================================================
   日期格式处理
===================================================== */

function normalizeDate(value) {

  if (!value) {

    return "";

  }


  if (
    typeof value ===
    "number"
  ) {

    try {

      const d =
        XLSX.SSF.parse_date_code(
          value
        );


      return (
        `${d.y}-` +
        `${String(d.m).padStart(2, "0")}-` +
        `${String(d.d).padStart(2, "0")}`
      );

    } catch {

      return "";

    }

  }


  const text =
    String(value)
      .trim()
      .replaceAll("/", "-")
      .replaceAll(".", "-");


  const match =
    text.match(
      /(\d{4})-(\d{1,2})-(\d{1,2})/
    );


  if (!match) {

    return text;

  }


  return (
    `${match[1]}-` +
    `${String(match[2]).padStart(2, "0")}-` +
    `${String(match[3]).padStart(2, "0")}`
  );

}


/* =====================================================
   JSON 备份
===================================================== */

function downloadFile(
  blob,
  filename
) {

  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href = url;

  link.download =
    filename;


  document.body.appendChild(
    link
  );


  link.click();

  link.remove();


  setTimeout(
    () => {

      URL.revokeObjectURL(
        url
      );

    },
    1000
  );

}


document.getElementById(
  "backupBtn"
).addEventListener(
  "click",
  () => {

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


    downloadFile(
      blob,
      "物品管理备份.json"
    );


    showToast(
      "备份已导出"
    );

  }
);


/* =====================================================
   JSON 恢复
===================================================== */

document.getElementById(
  "backupInput"
).addEventListener(
  "change",
  event => {

    const file =
      event.target.files[0];


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
            !Array.isArray(
              data.people
            ) ||
            !Array.isArray(
              data.items
            )
          ) {

            throw new Error(
              "Invalid backup"
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

          renderAll();

          showToast(
            "备份恢复成功"
          );


        } catch(error) {

          alert(
            "备份文件无效。"
          );

        }

      };


    reader.readAsText(
      file
    );


    event.target.value = "";

  }
);


/* =====================================================
   PWA 注册
===================================================== */

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    () => {

      /*
       * 以后如果增加 service-worker.js，
       * 可以在这里注册。
       *
       * GitHub Pages 需要 HTTPS。
       */

    }
  );

}


/* =====================================================
   全局刷新
===================================================== */

function renderAll() {

  renderPeople();

  renderCategories();

  renderDashboard();

  renderItems();

}


/* =====================================================
   启动
===================================================== */

renderAll();