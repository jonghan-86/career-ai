/* ============================
   AI 진로·전공 탐색 main.js (최종 버전)
   - 입학정원 0 제외 (정규화 강화)
   - 폐지 / 통합 / 개편 학과 제외
   - 전체 데이터 요약 자동 계산
   ============================ */

/* ---------------------------
   유틸 함수: 안전한 문자열 처리
--------------------------- */
function normalize(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

/* ---------------------------
   입학정원 유효성 검사 (최종 완성)
--------------------------- */
function isEmptyCapacity(v) {
  if (v === null || v === undefined) return true;

  const t = String(v).trim();

  // 완전 제외 값
  if (t === "" || t === "-" || t === "0" || t === "0명" || t === "0 명") return true;

  // 숫자만 추출
  const num = parseInt(t.replace(/[^0-9]/g, ""), 10);

  // 숫자가 아니거나 0이면 제외
  if (isNaN(num) || num === 0) return true;

  return false;
}

/* ---------------------------
   폐지 / 통합 / 개편 여부 검사
--------------------------- */
function isInvalidStatus(status) {
  if (!status) return false;

  const t = status.trim();
  const badWords = ["폐지", "통합", "개편", "재편", "조정"];

  return badWords.some(word => t.includes(word));
}

/* ---------------------------
   UI 요소
--------------------------- */
const keywordInput = document.getElementById("keyword");
const regionSelect = document.getElementById("region");
const degreeSelect = document.getElementById("degree");
const categorySelect = document.getElementById("category");
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");
const resultsContainer = document.getElementById("results");
const summaryBox = document.getElementById("summary");
const totalCountEl = document.getElementById("totalCount");

let allMajors = [];

/* ---------------------------
   JSON 파일 15개 로딩
--------------------------- */
async function loadData() {
  const fileList = Array.from({ length: 15 }, (_, i) =>
    `./data/majors_00${i}.json`
  );

  const promises = fileList.map(f =>
    fetch(f).then(r => r.json()).catch(() => [])
  );

  const results = await Promise.all(promises);
  allMajors = results.flat();

  renderTotalSummary();
}

/* ---------------------------
   전체 전공 요약 계산
--------------------------- */
function renderTotalSummary() {
  const total = allMajors.length;
  totalCountEl.textContent = total.toLocaleString();
}

/* ---------------------------
   검색 실행
--------------------------- */
function filterMajors() {
  const keyword = normalize(keywordInput.value).toLowerCase();
  const region = normalize(regionSelect.value);
  const degree = normalize(degreeSelect.value);
  const category = normalize(categorySelect.value);

  const filtered = allMajors.filter(m => {
    const name = normalize(m["학과명"] || "").toLowerCase();
    const school = normalize(m["학교명"] || "").toLowerCase();
    const majorField = normalize(m["표준분류계열코드"] || "");
    const majorStatus = normalize(m["학과상태명"] || "");

    // ① 폐지 / 통합 / 개편 제외
    if (isInvalidStatus(majorStatus)) return false;

    // ② 입학정원 0 제외
    const quota = m["입학정원수"] ?? m["입학정원"];
    if (isEmptyCapacity(quota)) return false;

    // ③ 키워드 조건
    if (keyword && !name.includes(keyword) && !school.includes(keyword))
      return false;

    // ④ 지역
    if (region !== "전체" && normalize(m["지역"]) !== region) return false;

    // ⑤ 학위 과정
    if (degree !== "전체" && normalize(m["학위과정명"]) !== degree)
      return false;

    // ⑥ 계열
    if (category !== "전체" && majorField !== category) return false;

    return true;
  });

  renderResults(filtered);
}

/* ---------------------------
   검색 결과 UI 렌더링
--------------------------- */
function renderResults(list) {
  resultsContainer.innerHTML = "";

  document.getElementById("resultCount").textContent = list.length;

  if (list.length === 0) {
    resultsContainer.innerHTML =
      `<div class="no-result">검색 결과가 없습니다.</div>`;
    return;
  }

  list.forEach(m => {
    const div = document.createElement("div");
    div.className = "major-item";

    div.innerHTML = `
      <h3>${m["학교명"]} - ${m["학과명"]}</h3>
      <div class="meta">
        <span>${m["지역"]}</span>
        <span>${m["학위과정명"]}</span>
        <span>${m["대학특성명"] || ""}</span>
        <span>${m["학교학과특성명"] || ""}</span>
      </div>
      <p class="subject">${m["주요교과목명"] || "교과 정보 없음"}</p>

      <p class="quota">입학 정원: <strong>${normalize(
        m["입학정원수"] ?? m["입학정원"]
      )}</strong></p>

      <p class="job">관련 직업: ${m["관련직업명"] || "정보 없음"}</p>
    `;

    resultsContainer.appendChild(div);
  });
}

/* ---------------------------
   초기화 버튼
--------------------------- */
resetBtn.addEventListener("click", () => {
  keywordInput.value = "";
  regionSelect.value = "전체";
  degreeSelect.value = "전체";
  categorySelect.value = "전체";
  renderResults([]);
});

/* ---------------------------
   이벤트 바인딩
--------------------------- */
searchBtn.addEventListener("click", filterMajors);

/* ---------------------------
   데이터 로드 시작
--------------------------- */
loadData();