/* ============================================================
   Career-AI Major Search System (최종 통합본)
   - JSON 데이터 로드
   - 전체 예외상태 제거
   - 입학정원 공백/0 제외
   - 졸업자수 0 제외
   - 사이버대/원격대 제외
============================================================ */

(function () {

  /* ----------------------------------------------------------
     0. 전역 상태
  ---------------------------------------------------------- */
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

  // 제외해야 하는 상태
  const EXCLUDED_STATUS = [
    "폐지","폐과","정지","모집중지","미운영","휴지","통합","개편"
  ];

  // 사이버/원격 계열 대학
  const EXCLUDED_SCHOOL_TYPES = [
    "사이버대학",
    "원격대학",
    "방송통신대"
  ];

  function isEmpty(v){
    if (v === null || v === undefined) return true;
    if (typeof v === "string"){
      const t = v.trim();
      if (t === "" || t === "-" || t === "0") return true;
    }
    if (Number(v) === 0) return true;
    return false;
  }

  /* ----------------------------------------------------------
     1. DOM 요소 참조
  ---------------------------------------------------------- */
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

  const summaryTitle = document.querySelector(".summary-panel h2");
  if (summaryTitle) summaryTitle.textContent = "검색 결과 요약";


  /* ----------------------------------------------------------
     2. 유틸 함수
  ---------------------------------------------------------- */
  function uniq(arr){ return Array.from(new Set(arr)); }
  function uniqSortedKo(arr){
    return uniq(arr.filter(Boolean)).sort((a,b)=>
      String(a).localeCompare(String(b),"ko")
    );
  }
  function formatNumber(n){
    return (Number(n)||0).toLocaleString("ko-KR");
  }

  function buildConditionSentence(cond){
    const parts = [];
    if (cond.keyword) parts.push(`"${cond.keyword}" 관련`);
    if (cond.region)  parts.push(`${cond.region} 지역`);
    if (cond.degree)  parts.push(`${cond.degree} 과정`);
    if (cond.category)parts.push(`${cond.category} 계열`);

    if (!parts.length) return "현재는 전체 전공을 기준으로 살펴보고 있습니다.";
    return parts.join(", ") + " 전공을 중심으로 살펴보고 있습니다.";
  }

  function buildRegionTopSentence(list){
    if (!list.length) return "아직 조건에 맞는 전공이 없습니다.";

    const counts = {};
    list.forEach(m=>{
      const r = m["시도명"] || "지역 정보 없음";
      counts[r] = (counts[r]||0)+1;
    });

    const sorted = Object.entries(counts)
      .map(([region,count])=>({region,count}))
      .sort((a,b)=>b.count - a.count)
      .slice(0,3);

    return "전공이 많이 개설된 지역은 " +
      sorted.map(e=>`${e.region}(${e.count}개)`).join(", ") +
      " 순입니다.";
  }


  /* ----------------------------------------------------------
     3. JSON 데이터 로드 + 필터링(고객님 요청 기능 완전 통합)
  ---------------------------------------------------------- */
  async function loadData() {
    if (dataLoaded) return;

    statusEl.textContent = "전공 데이터를 불러오는 중입니다...";
    const all = [];

    for (let i=0; i<DATA_FILES.length; i++){
      const file = DATA_FILES[i];
      try {
        const res = await fetch(file);
        if (!res.ok) continue;

        const arr = await res.json();
        if (!Array.isArray(arr)) continue;

        // 🔥 필터링 적용
        const filtered = arr.filter(m=>{
          if (!m) return false;

          const status = (m["학과상태명"] || "").trim();
          const quota  = m["입학정원수"] ?? m["입학정원"];
          const grads  = m["졸업자수"] ?? null;
          const type   = (m["학교구분명"] || "").trim();
          const univ   = (m["학교명"] || "");

          // ① 운영 예외 상태 제거
          if (EXCLUDED_STATUS.includes(status)) return false;

          // ② 입학정원 공백/하이픈/0 제거
          if (isEmpty(quota)) return false;

          // ③ 졸업자수 0 제거
          if (isEmpty(grads)) return false;

          // ④ 사이버/원격 대학 제거
          if (EXCLUDED_SCHOOL_TYPES.includes(type)) return false;
          if (univ.includes("사이버") || univ.includes("원격") || univ.includes("방송통신"))
            return false;

          return true;
        });

        all.push(...filtered);

      } catch(e){
        console.warn("로드 오류", file, e);
      }
    }

    allMajors = all.filter(m=>m && m["학과명"]);
    dataLoaded = true;

    statusEl.textContent =
      `전국 전공 ${allMajors.length.toLocaleString()}개 로딩 완료`;

    buildFilters();
    renderSummary(allMajors,{initial:true});
    renderResults(allMajors);
  }


  /* ----------------------------------------------------------
     4. 필터 옵션 생성
  ---------------------------------------------------------- */
  function buildFilters(){
    const regions = new Set();
    const degrees = new Set();
    const categories = new Set();

    allMajors.forEach(m=>{
      if (m["시도명"]) regions.add(m["시도명"]);
      if (m["학위과정명"]) degrees.add(m["학위과정명"]);
      const cat = m["대학자체계열명"] || m["대학자체계열명(계열)"];
      if (cat) categories.add(cat);
    });

    uniqSortedKo([...regions]).forEach(r=>{
      const op=document.createElement("option");
      op.value=r; op.textContent=r;
      regionSelect.appendChild(op);
    });

    uniqSortedKo([...degrees]).forEach(d=>{
      const op=document.createElement("option");
      op.value=d; op.textContent=d;
      degreeSelect.appendChild(op);
    });

    uniqSortedKo([...categories]).forEach(c=>{
      const op=document.createElement("option");
      op.value=c; op.textContent=c;
      categorySelect.appendChild(op);
    });
  }


  /* ----------------------------------------------------------
     5. 검색 필터
  ---------------------------------------------------------- */
  function filterMajors(cond){
    const keyword  = (cond.keyword||"").toLowerCase();
    const region   = cond.region   || "";
    const degree   = cond.degree   || "";
    const category = cond.category || "";

    return allMajors.filter(m=>{
      if (region && m["시도명"] !== region) return false;
      if (degree && m["학위과정명"] !== degree) return false;

      const cat = m["대학자체계열명"] || m["대학자체계열명(계열)"] || "";
      if (category && cat !== category) return false;

      if (keyword){
        const text = [
          m["학교명"],
          m["학과명"],
          m["주요교과목명"],
          m["관련직업명"]
        ].filter(Boolean).join(" ").toLowerCase();

        if (!text.includes(keyword)) return false;
      }
      return true;
    });
  }


  /* ----------------------------------------------------------
     6. 요약 출력
  ---------------------------------------------------------- */
  function renderSummary(list,options){
    options = options || {};

    if (options.initial && (!list || !list.length)){
      summaryEl.innerHTML =
        '<p>아직 검색 전입니다. 조건을 선택 후 <strong>검색하기</strong> 버튼을 눌러주세요.</p>';
      return;
    }

    if (options.initial && list.length){
      summaryEl.innerHTML =
        '<p>전체 전공 데이터가 로드되었습니다. 필터를 적용해보세요.</p>';
      return;
    }

    if (!list.length){
      summaryEl.innerHTML =
        '<p>조건에 맞는 전공이 없습니다.</p>';
      return;
    }

    const condSentence = buildConditionSentence(options.conditions||{});
    const regionSentence = buildRegionTopSentence(list);

    summaryEl.innerHTML =
      `<p>${condSentence}</p>`+
      `<p>${regionSentence}</p>`+
      `<p>총 <strong>${formatNumber(list.length)}</strong>개 전공이 검색되었습니다.</p>`;
  }


  /* ----------------------------------------------------------
     7. 전공 카드 출력
  ---------------------------------------------------------- */
  function renderResults(list){
    resultsEl.innerHTML="";
    resultCountEl.textContent=list.length;

    if (!list.length){
      resultsEl.innerHTML='<div class="no-result">조건에 맞는 전공이 없습니다.</div>';
      return;
    }

    const maxShow=300;
    list.slice(0,maxShow).forEach(m=>{
      const card=document.createElement("article");
      card.className="major-card";

      const region=m["시도명"]||"";
      const degree=m["학위과정명"]||"";
      const category=m["대학자체계열명"]||m["대학자체계열명(계열)"]||"";
      const univ=m["학교명"]||"";
      const major=m["학과명"]||"";

      const subjects=m["주요교과목명"]||"";
      const jobs=m["관련직업명"]||"";
      const capacity=m["입학정원수"];
      const grads=m["졸업자수"];

      card.innerHTML =
        `<h3 class="major-title">${univ}</h3>
         <h4 class="major-name">${major}</h4>
         <div class="chip-row">
           ${region?`<span class="chip chip-region">${region}</span>`:""}
           ${degree?`<span class="chip chip-degree">${degree}</span>`:""}
           ${category?`<span class="chip chip-category">${category}</span>`:""}
         </div>
         ${subjects?`<p class="major-sub"><b>주요교과</b> ${subjects}</p>`:""}
         ${jobs?`<p class="major-job"><b>관련직업</b> ${jobs}</p>`:""}
         <p class="major-meta">지역: ${region} · 학위: ${degree} ${category?`· 계열: ${category}`:""}</p>
         <p class="major-meta small">입학정원: ${capacity?formatNumber(capacity):"정보 없음"}명 · 졸업자수: ${grads?formatNumber(grads):"정보 없음"}명</p>
        `;

      resultsEl.appendChild(card);
    });

    if (list.length>maxShow){
      const extra=document.createElement("p");
      extra.className="more-info";
      extra.textContent=`전공이 많아 ${maxShow}개만 표시했습니다.`;
      resultsEl.appendChild(extra);
    }
  }


  /* ----------------------------------------------------------
     8. 검색 실행
  ---------------------------------------------------------- */
  function doSearch(){
    if (!dataLoaded){
      statusEl.textContent="데이터 로딩 중입니다...";
      return;
    }

    const cond={
      keyword:keywordInput.value.trim(),
      region:regionSelect.value,
      degree:degreeSelect.value,
      category:categorySelect.value
    };

    statusEl.textContent="검색 중...";
    searchBtn.disabled=true;

    setTimeout(()=>{
      const list=filterMajors(cond);
      renderSummary(list,{conditions:cond});
      renderResults(list);
      statusEl.textContent="검색 완료";
      searchBtn.disabled=false;
    },30);
  }


  /* ----------------------------------------------------------
     9. 초기화
  ---------------------------------------------------------- */
  function resetAll(){
    keywordInput.value="";
    regionSelect.value="";
    degreeSelect.value="";
    categorySelect.value="";

    if (!dataLoaded){
      summaryEl.innerHTML='<p>아직 검색 전입니다.</p>';
      resultsEl.innerHTML="";
      resultCountEl.textContent="0";
      statusEl.textContent="초기화되었습니다.";
      return;
    }

    renderSummary(allMajors,{initial:true});
    renderResults(allMajors);
    statusEl.textContent="필터 초기화 완료";
  }


  /* ----------------------------------------------------------
     10. 초기 실행
  ---------------------------------------------------------- */
  function init(){
    if (searchBtn) searchBtn.addEventListener("click",doSearch);
    if (resetBtn) resetBtn.addEventListener("click",resetAll);

    keywordInput.addEventListener("keydown",e=>{
      if (e.key==="Enter") doSearch();
    });

    summaryEl.innerHTML='<p>아직 검색 전입니다. 조건을 선택 후 검색 버튼을 눌러주세요.</p>';

    loadData();

    if ("serviceWorker" in navigator){
      navigator.serviceWorker.register("sw.js").catch(()=>{});
    }
  }

  document.addEventListener("DOMContentLoaded",init);

})();