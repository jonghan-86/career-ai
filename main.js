// 진로 · 전공 탐색 메인 스크립트

const DATA_FILES = Array.from({ length: 15 }, (_, i) =>
  `data/majors_${String(i).padStart(3, "0")}.json`
);

let allMajors = [];
let loaded = false;

// DOM 참조
const keywordInput = document.getElementById("keyword");
const regionSelect = document.getElementById("region");
const degreeSelect = document.getElementById("degree");
const categorySelect = document.getElementById("category");
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");
const statusEl = document.getElementById("status");
const summaryEl = document.getElementById("summary");
const resultsEl = document.getElementById("results");
const resultCountEl = document.getElementById("resultCount");

async function loadData() {
  try {
    statusEl.textContent = "데이터 로딩 중입니다...";
    searchBtn.disabled = true;

    const all = [];
    for (const file of DATA_FILES) {
      const res = await fetch(file);
      if (!res.ok) {
        console.warn("데이터 파일 로딩 실패:", file, res.status);
        continue;
      }
      const arr = await res.json();
      if (Array.isArray(arr)) all.push(...arr);
    }

    allMajors = all;
    loaded = true;
    statusEl.textContent = `전국 전공 ${allMajors.length.toLocaleString()}개 로딩 완료`;
    searchBtn.disabled = false;

    buildFilters();
    renderSummary(allMajors);
  } catch (err) {
    console.error(err);
    statusEl.textContent = "데이터 로딩 중 오류가 발생했습니다. (개발자 도구 콘솔 확인)";
  }
}

function buildFilters() {
  const regions = new Set();
  const degrees = new Set();
  const categories = new Set();

  for (const m of allMajors) {
    if (m["시도명"]) regions.add(m["시도명"]);
    if (m["학위과정명"]) degrees.add(m["학위과정명"]);
    if (m["대학자체계열명"] || m["대학자체계열명(계열)"]) {
      categories.add(m["대학자체계열명"] || m["대학자체계열명(계열)"]);
    }
  }

  const addOptions = (select, values) => {
    const sorted = Array.from(values).sort((a, b) =>
      String(a).localeCompare(String(b), "ko")
    );
    for (const v of sorted) {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    }
  };

  addOptions(regionSelect, regions);
  addOptions(degreeSelect, degrees);
  addOptions(categorySelect, categories);
}

function renderSummary(list) {
  if (!list.length) {
    summaryEl.innerHTML =
      "<p>조건에 맞는 전공을 찾지 못했습니다. 검색어 또는 조건을 다시 조정해 보세요.</p>";
    return;
  }

  const total = list.length;
  const byRegion = {};
  for (const m of list) {
    const r = m["시도명"] || "기타";
    byRegion[r] = (byRegion[r] || 0) + 1;
  }

  const topRegions = Object.entries(byRegion)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => `${name} ${count.toLocaleString()}개`)
    .join(", ");

  summaryEl.innerHTML = `
    <p>현재 조건에 해당하는 전공은 <strong>${total.toLocaleString()}개</strong>입니다.</p>
    <p>전공 개수가 많은 지역: <strong>${topRegions}</strong></p>
    <p>리스트를 스크롤하면서 세부 정보를 확인해 보세요.</p>
  `;
}

function filterMajors() {
  if (!loaded) return;

  const kw = keywordInput.value.trim().toLowerCase();
  const region = regionSelect.value;
  const degree = degreeSelect.value;
  const category = categorySelect.value;

  const result = allMajors.filter((m) => {
    if (region && m["시도명"] !== region) return false;
    if (degree && m["학위과정명"] !== degree) return false;

    const cat = m["대학자체계열명"] || m["대학자체계열명(계열)"] || "";
    if (category && cat !== category) return false;

    if (kw) {
      const fields = [
        m["학교명"],
        m["학과명"],
        m["주요교과목명"],
        m["관련직업명"],
        m["대학자체계열명"],
        m["대학자체계열명(계열)"],
      ];
      const hay = fields
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(kw)) return false;
    }

    return true;
  });

  renderSummary(result);
  renderResults(result);
}

function renderResults(list) {
  resultsEl.innerHTML = "";
  resultCountEl.textContent = list.length.toLocaleString();

  if (!list.length) {
    const p = document.createElement("p");
    p.textContent = "검색 결과가 없습니다.";
    resultsEl.appendChild(p);
    return;
  }

  const fragment = document.createDocumentFragment();

  list.slice(0, 300).forEach((m) => {
    const item = document.createElement("article");
    item.className = "result-item";

    const header = document.createElement("div");
    header.className = "result-header";

    const title = document.createElement("h3");
    title.textContent = `${m["학교명"] || ""} - ${m["학과명"] || ""}`;
    header.appendChild(title);

    const regionText = document.createElement("span");
    regionText.className = "chip";
    const loc =
      (m["시도명"] || "") +
      (m["시군구명"] ? " " + m["시군구명"] : "");
    regionText.textContent = loc || "지역 정보 없음";
    header.appendChild(regionText);

    const chips = document.createElement("div");
    chips.className = "chip-row";

    const degreeChip = document.createElement("span");
    degreeChip.className = "chip green";
    degreeChip.textContent =
      (m["학위과정명"] || "") +
      (m["수업연한"] ? ` / ${m["수업연한"]}` : "");
    chips.appendChild(degreeChip);

    const typeChip = document.createElement("span");
    typeChip.className = "chip blue";
    typeChip.textContent =
      (m["주야과정명"] || "") +
      (m["학교구분명"] ? ` / ${m["학교구분명"]}` : "");
    chips.appendChild(typeChip);

    const cat = m["대학자체계열명"] || m["대학자체계열명(계열)"];
    if (cat) {
      const catChip = document.createElement("span");
      catChip.className = "chip orange";
      catChip.textContent = cat;
      chips.appendChild(catChip);
    }

    const body = document.createElement("div");
    body.className = "result-body";

    const majorSubjects = m["주요교과목명"];
    if (majorSubjects) {
      const p = document.createElement("p");
      p.innerHTML = `<span class="label">주요 교과목:</span> ${majorSubjects}`;
      body.appendChild(p);
    }

    const careers = m["관련직업명"];
    if (careers) {
      const p = document.createElement("p");
      p.innerHTML = `<span class="label">관련 직업:</span> ${careers}`;
      body.appendChild(p);
    }

    const quota = m["입학정원수"];
    if (quota) {
      const p = document.createElement("p");
      p.innerHTML = `<span class="label">입학 정원:</span> ${quota}`;
      body.appendChild(p);
    }

    item.appendChild(header);
    item.appendChild(chips);
    item.appendChild(body);

    fragment.appendChild(item);
  });

  resultsEl.appendChild(fragment);
}

// 이벤트 설정
searchBtn.addEventListener("click", filterMajors);
resetBtn.addEventListener("click", () => {
  keywordInput.value = "";
  regionSelect.value = "";
  degreeSelect.value = "";
  categorySelect.value = "";
  renderSummary(allMajors);
  renderResults(allMajors);
});

keywordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    filterMajors();
  }
});

// 초기 로딩
document.addEventListener("DOMContentLoaded", () => {
  loadData();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("sw.js")
      .catch((err) => console.warn("ServiceWorker 등록 실패:", err));
  }
});
