// career-ai main.js
// JSON 분할 데이터 + 검색 UX + 친절한 요약 통합 최종본

(function () {
  // -----------------------------
  // 0. 전역 상태
  // -----------------------------
  const DATA_FILES = [
    "data/majors_000.json",
    "data/majors_001.json",
    "data/majors_002.json",
    "data/majors_003.json",
    "data/majors_004.json",
    "data/majors_005.json",
    "data/majors_006.json",
    "data/majors_007.json",
    "data/majors_008.json",
    "data/majors_009.json",
    "data/majors_010.json",
    "data/majors_011.json",
    "data/majors_012.json",
    "data/majors_013.json",
    "data/majors_014.json"
  ];

  let allMajors = [];
  let dataLoaded = false;

  // -----------------------------
  // 1. DOM 참조
  // -----------------------------
  const keywordInput  = document.getElementById("keyword");
  const regionSelect  = document.getElementById("region");
  const degreeSelect  = document.getElementById("degree");
  const categorySelect= document.getElementById("category");

  const searchBtn = document.getElementById("searchBtn");
  const resetBtn  = document.getElementById("resetBtn");

  const statusEl     = document.getElementById("status");
  const summaryEl    = document.getElementById("summary");
  const resultsEl    = document.getElementById("results");
  const resultCountEl= document.getElementById("resultCount");

  // summary 제목 문구 통일
  const summaryTitle = document.querySelector(".summary-panel h2");
  if (summaryTitle) {
    summaryTitle.textContent = "검색 결과 요약";
  }

  // -----------------------------
  // 2. 유틸 함수
  // -----------------------------
  function uniq(arr) {
    return Array.from(new Set(arr));
  }

  function uniqSortedKo(arr) {
    return uniq(arr.filter(Boolean)).sort(function (a, b) {
      return String(a).localeCompare(String(b), "ko");
    });
  }

  function formatNumber(n) {
    const num = Number(n) || 0;
    return num.toLocaleString("ko-KR");
  }

  // 조건을 사람이 읽기 좋게 문장으로 변환
  function buildConditionSentence(cond) {
    const parts = [];

    if (cond.keyword) {
      parts.push('"' + cond.keyword + '" 관련');
    }
    if (cond.region) {
      parts.push(cond.region + " 지역");
    }
    if (cond.degree) {
      parts.push(cond.degree + " 과정");
    }
    if (cond.category) {
      parts.push(cond.category + " 계열");
    }

    if (!parts.length) {
      return "현재는 전체 전공을 기준으로 살펴보고 있습니다.";
    }

    return parts.join(", ") + " 전공을 중심으로 살펴보고 있습니다.";
  }

  // 지역 TOP3 문장 생성
  function buildRegionTopSentence(list) {
    if (!list.length) {
      return "아직 조건에 맞는 전공이 없습니다. 검색어 또는 필터를 조금만 바꿔 보세요.";
    }

    const counts = {};
    list.forEach(function (m) {
      const r = m["시도명"] || "지역 정보 없음";
      counts[r] = (counts[r] || 0) + 1;
    });

    const entries = Object.keys(counts).map(function (k) {
      return { region: k, count: counts[k] };
    });

    entries.sort(function (a, b) {
      return b.count - a.count;
    });

    const top = entries.slice(0, 3);
    if (!top.length) {
      return "";
    }

    const parts = top.map(function (e) {
      return e.region + "(" + e.count + "개)";
    });

    return "전공이 많이 개설된 지역은 " + parts.join(", ") + " 순입니다.";
  }

  // -----------------------------
  // 3. 데이터 로드
  // -----------------------------
  async function loadData() {
    if (dataLoaded) return;
    statusEl.textContent = "전공 데이터를 불러오는 중입니다...";

    const all = [];

    for (var i = 0; i < DATA_FILES.length; i++) {
      const file = DATA_FILES[i];
      try {
        const res = await fetch(file);
        if (!res.ok) {
          console.warn("경고: JSON 로드 실패:", file);
          continue;
        }
        const arr = await res.json();
        if (Array.isArray(arr)) {
          all.push.apply(all, arr);
        }
      } catch (e) {
        console.warn("JSON 파싱 오류:", file, e);
      }
    }

    allMajors = all.filter(function (m) {
      return m && m["학과명"];
    });

    dataLoaded = true;

    if (!allMajors.length) {
      statusEl.textContent =
        "전공 데이터를 불러오지 못했습니다. data 폴더와 JSON 파일을 확인해 주세요.";
      return;
    }

    statusEl.textContent = "전공 데이터 불러오기 완료.";
    buildFilters();
    renderSummary(allMajors, { initial: true });
    renderResults(allMajors);
  }

  // -----------------------------
  // 4. 필터 옵션 구성
  // -----------------------------
  function buildFilters() {
    const regions = new Set();
    const degrees = new Set();
    const categories = new Set();

    allMajors.forEach(function (m) {
      if (m["시도명"]) regions.add(m["시도명"]);
      if (m["학위과정명"]) degrees.add(m["학위과정명"]);
      const cat = m["대학자체계열명"] || m["대학자체계열명(계열)"];
      if (cat) categories.add(cat);
    });

    uniqSortedKo(Array.from(regions)).forEach(function (r) {
      const op = document.createElement("option");
      op.value = r;
      op.textContent = r;
      regionSelect.appendChild(op);
    });

    uniqSortedKo(Array.from(degrees)).forEach(function (d) {
      const op = document.createElement("option");
      op.value = d;
      op.textContent = d;
      degreeSelect.appendChild(op);
    });

    uniqSortedKo(Array.from(categories)).forEach(function (c) {
      const op = document.createElement("option");
      op.value = c;
      op.textContent = c;
      categorySelect.appendChild(op);
    });
  }

  // -----------------------------
  // 5. 전공 필터링
  // -----------------------------
  function filterMajors(cond) {
    const keyword  = (cond.keyword || "").toLowerCase();
    const region   = cond.region   || "";
    const degree   = cond.degree   || "";
    const category = cond.category || "";

    return allMajors.filter(function (m) {
      if (region && m["시도명"] !== region) return false;
      if (degree && m["학위과정명"] !== degree) return false;

      const cat = m["대학자체계열명"] || m["대학자체계열명(계열)"] || "";
      if (category && cat !== category) return false;

      if (keyword) {
        const fields = [
          m["학교명"],
          m["학과명"],
          m["주요교과목명"],
          m["관련직업명"]
        ];
        const text = fields
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!text.includes(keyword)) return false;
      }

      return true;
    });
  }

  // -----------------------------
  // 6. 요약 렌더링
  // -----------------------------
  function renderSummary(list, options) {
    options = options || {};

    // 초기 상태 - 데이터도 없고 아직 아무 것도 안 한 경우
    if (options.initial && (!list || !list.length)) {
      summaryEl.innerHTML =
        '<p>아직 검색 전입니다. 상단에서 키워드나 지역, 계열을 선택한 뒤 <strong>검색하기</strong> 버튼을 눌러주세요.</p>';
      return;
    }

    // 초기 전체 데이터 로드 후
    if (options.initial && list && list.length) {
      summaryEl.innerHTML =
        '<p>전체 전공 데이터가 로드되었습니다. 원하는 조건을 선택해 나만의 전공을 찾아보세요.</p>' +
        '<p>필터를 조합할수록 더 정확한 결과를 볼 수 있습니다.</p>';
      return;
    }

    // 검색 / 리셋 공통 처리
    if (!list || !list.length) {
      summaryEl.innerHTML =
        '<p>조건에 맞는 전공이 없습니다.</p>' +
        '<p>키워드 철자를 다시 확인하거나, 지역·학위·계열 조건을 조금 완화해 보세요.</p>';
      return;
    }

    // 친절한 문장 스타일
    var cond = options.conditions || {};
    var condSentence   = buildConditionSentence(cond);
    var regionSentence = buildRegionTopSentence(list);

    var total = list.length;
    var resultSentence =
      "현재 조건에서 총 <strong>" + formatNumber(total) + "개</strong> 전공이 검색되었습니다.";

    summaryEl.innerHTML =
      "<p>" + condSentence + "</p>" +
      (regionSentence ? "<p>" + regionSentence + "</p>" : "") +
      "<p>" + resultSentence + "</p>";
  }

  // -----------------------------
  // 7. 결과 리스트 렌더링
  // -----------------------------
  function renderResults(list) {
    resultsEl.innerHTML = "";
    var count = list ? list.length : 0;
    resultCountEl.textContent = count;

    if (!list || !list.length) {
      resultsEl.innerHTML =
        '<div class="no-result">조건에 맞는 전공이 없습니다.</div>';
      return;
    }

    var maxShow = 300;
    list.slice(0, maxShow).forEach(function (m) {
      var card = document.createElement("article");
      card.className = "major-card";

      var region   = m["시도명"] || "";
      var degree   = m["학위과정명"] || "";
      var category = m["대학자체계열명"] || m["대학자체계열명(계열)"] || "";
      var univ     = m["학교명"] || "";
      var major    = m["학과명"] || "";

      var subjects = m["주요교과목명"] || "";
      var jobs     = m["관련직업명"] || "";
      var capacity = m["입학정원수"];
      var grads    = m["졸업자수"];

      var subjHtml = subjects
        ? '<p class="major-sub"><span class="label">주요 교과목</span> ' + subjects + "</p>"
        : "";
      var jobsHtml = jobs
        ? '<p class="major-job"><span class="label">관련 직업</span> ' + jobs + "</p>"
        : "";

      var bottomMeta =
        '<p class="major-meta">지역: ' +
        (region || "정보 없음") +
        " · 학위: " +
        (degree || "정보 없음") +
        (category ? " · 계열: " + category : "") +
        "</p>";

      var capacityGrads =
        '<p class="major-meta small">입학정원: ' +
        (capacity ? formatNumber(capacity) + "명" : "정보 없음") +
        " · 졸업자수: " +
        (grads ? formatNumber(grads) + "명" : "정보 없음") +
        "</p>";

      card.innerHTML =
        '<h3 class="major-title">' + univ + "</h3>" +
        '<h4 class="major-name">' + major + "</h4>" +
        '<div class="chip-row">' +
        (region   ? '<span class="chip chip-region">'   + region   + "</span>" : "") +
        (degree   ? '<span class="chip chip-degree">'   + degree   + "</span>" : "") +
        (category ? '<span class="chip chip-category">' + category + "</span>" : "") +
        "</div>" +
        subjHtml +
        jobsHtml +
        bottomMeta +
        capacityGrads;

      resultsEl.appendChild(card);
    });

    if (list.length > maxShow) {
      var extra = document.createElement("p");
      extra.className = "more-info";
      extra.textContent =
        "전공이 너무 많아 상위 " + maxShow + "개만 먼저 보여드립니다. 필터를 더 추가해 보세요.";
      resultsEl.appendChild(extra);
    }
  }

  // -----------------------------
  // 8. 검색 실행
  // -----------------------------
  function doSearch() {
    if (!dataLoaded) {
      statusEl.textContent =
        "아직 데이터가 모두 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.";
      return;
    }

    var cond = {
      keyword: keywordInput.value.trim(),
      region:  regionSelect.value,
      degree:  degreeSelect.value,
      category:categorySelect.value
    };

    statusEl.textContent = "검색 중입니다...";
    searchBtn.disabled = true;

    // 검색이 무거워 보이지 않도록 약간의 딜레이
    setTimeout(function () {
      var list = filterMajors(cond);
      renderSummary(list, { conditions: cond });
      renderResults(list);

      statusEl.textContent = "검색이 완료되었습니다.";
      searchBtn.disabled = false;
    }, 30);
  }

  // -----------------------------
  // 9. 초기화
  // -----------------------------
  function resetAll() {
    keywordInput.value  = "";
    regionSelect.value  = "";
    degreeSelect.value  = "";
    categorySelect.value= "";

    if (!dataLoaded || !allMajors.length) {
      summaryEl.innerHTML =
        '<p>아직 검색 전입니다. 상단에서 조건을 선택하고 <strong>검색하기</strong> 버튼을 눌러주세요.</p>';
      resultsEl.innerHTML = "";
      resultCountEl.textContent = "0";
      statusEl.textContent = "초기화되었습니다.";
      return;
    }

    renderSummary(allMajors, { initial: true });
    renderResults(allMajors);
    statusEl.textContent = "필터가 초기화되었습니다.";
  }

  // -----------------------------
  // 10. 이벤트 바인딩 & 초기 로드
  // -----------------------------
  function init() {
    // 버튼 이벤트
    if (searchBtn) {
      searchBtn.addEventListener("click", doSearch);
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", resetAll);
    }

    // 엔터 키 검색
    if (keywordInput) {
      keywordInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          doSearch();
        }
      });
    }

    // 초기 요약 문구
    summaryEl.innerHTML =
      '<p>아직 검색 전입니다. 상단에서 키워드나 지역, 계열을 선택한 뒤 <strong>검색하기</strong> 버튼을 눌러주세요.</p>';

    // 데이터 로드 시작
    loadData();

    // 서비스워커 등록
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(function () {
        // 실패해도 앱 기능에는 영향 없음
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();