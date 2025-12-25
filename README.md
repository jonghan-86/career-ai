# 충남RISE 공유대학 랜딩 페이지

2026학년도 스마트모빌리티융합전공 학생모집 웹사이트

---

## 📁 파일 구조

```
chungnam-rise-landing/
├── index.html       (33KB) - 메인 HTML 파일
├── styles.css       (27KB) - 스타일시트
├── scripts.js       (1KB)  - JavaScript 파일
└── README.md                - 이 문서
```

---

## 🚀 사용 방법

### 1. 로컬에서 테스트

가장 간단한 방법:
```bash
# 파일을 더블클릭하여 브라우저에서 열기
index.html 더블클릭
```

Python 서버 사용:
```bash
# Python 3가 설치되어 있다면
python -m http.server 8000

# 브라우저에서 접속
http://localhost:8000
```

---

## 🌐 배포 방법

### Option 1: Vercel (권장)

```bash
# 1. Vercel CLI 설치
npm install -g vercel

# 2. 프로젝트 폴더에서 배포
vercel

# 3. 프로덕션 배포
vercel --prod
```

### Option 2: Netlify

```bash
# 1. Netlify CLI 설치
npm install -g netlify-cli

# 2. 배포
netlify deploy

# 3. 프로덕션 배포
netlify deploy --prod
```

### Option 3: GitHub Pages

```bash
# 1. GitHub 저장소 생성
# 2. 파일 업로드
# 3. Settings → Pages → Source: main branch
```

---

## ✨ 주요 기능

### 1. 반응형 디자인
- 모바일 (375px ~)
- 태블릿 (768px ~)
- 데스크톱 (1024px ~)

### 2. 주요 섹션
- ✅ 메인 비주얼 (Hero Section)
- ✅ 모집 안내
- ✅ 스토리 섹션
- ✅ 프로그램 구조
- ✅ 8개 마이크로디그리 커리큘럼
- ✅ 장학금 안내 (최대 700만원)
- ✅ 취업지원 프로그램
- ✅ 합격자 리뷰 (4명)
- ✅ 비교과 프로그램
- ✅ 최종 CTA
- ✅ 플로팅 바 (하단 고정)

### 3. 인터랙션
- 부드러운 스크롤
- 플로팅 바 자동 표시/숨김
- 호버 효과
- 반응형 네비게이션

---

## 🎨 디자인 시스템

### 색상 팔레트

```css
/* 메인 컬러 */
--navy-blue: #0f2e5c;
--light-navy: #1a4d8f;
--accent-red: #d4213d;

/* 보조 컬러 */
--gray-100: #f9fafb;
--gray-200: #e5e7eb;
--gray-600: #6b7280;
```

### 타이포그래피

```css
/* 폰트 */
font-family: 'Noto Sans KR', -apple-system, sans-serif;

/* 크기 */
h1: 3.5rem (56px)
h2: 2.5rem (40px)
body: 1rem (16px)
```

---

## 🔗 중요 링크

### Google Form (지원서)
```
https://docs.google.com/forms/d/e/1FAIpQLSc7nvuNg55kswjKw_JJ2xJqDoPdF7SxMK5dR34nyR0hVAlvhg/viewform
```

### 연락처
- 📞 전화: 041-521-9912
- ✉️ 이메일: rise@kongju.ac.kr
- 📍 주소: 충남 공주시 공주대학로 56

---

## ⚡ 성능 최적화

### 적용된 최적화
- ✅ 외부 CSS/JS 분리 (캐싱 가능)
- ✅ Google Fonts 사전 연결
- ✅ 부드러운 스크롤 (CSS smooth scroll)
- ✅ 최소화된 DOM 조작

### 권장 추가 최적화
- [ ] CSS/JS 압축 (minification)
- [ ] 이미지 최적화 (WebP 변환)
- [ ] CDN 사용
- [ ] Lazy Loading
- [ ] Critical CSS 인라인

---

## 🔧 수정 가이드

### CSS 수정
```css
/* styles.css 에서 수정 */

/* 메인 컬러 변경 */
.header { background: #새로운색상; }

/* 반응형 브레이크포인트 조정 */
@media (max-width: 768px) { ... }
```

### JavaScript 수정
```javascript
// scripts.js 에서 수정

// 플로팅 바 표시 시점 조정
if (window.scrollY > visualHeight * 0.5) { ... }
// 0.5를 0.3으로 변경하면 더 빨리 표시됨
```

### HTML 수정
```html
<!-- index.html 에서 수정 -->

<!-- 전화번호 변경 -->
<a href="tel:041-521-9912">📞 041-521-9912</a>

<!-- Google Form 링크 변경 -->
<a href="https://docs.google.com/forms/...">지원하기</a>
```

---

## 📊 브라우저 호환성

| 브라우저 | 버전 | 지원 |
|---------|------|------|
| Chrome  | 90+  | ✅ 완전 지원 |
| Edge    | 90+  | ✅ 완전 지원 |
| Firefox | 88+  | ✅ 완전 지원 |
| Safari  | 14+  | ✅ 완전 지원 |
| IE 11   | -    | ❌ 미지원 |

---

## 🐛 알려진 이슈

없음

---

## 📝 변경 이력

### v2.0.0 (2025-12-25)
- CSS/JS 외부 파일 분리
- 캐싱 최적화
- 코드 구조 개선

### v1.0.0 (2025-12-24)
- 초기 버전 (단일 HTML 파일)

---

## 📞 문의

**충남RISE 공유대학 사무국**
- 전화: 041-521-9912
- 이메일: rise@kongju.ac.kr
- 운영시간: 평일 09:00 - 18:00

---

## 📄 라이선스

© 2025 충남RISE 공유대학. All rights reserved.

---

**제작**: Claude AI  
**날짜**: 2025-12-25  
**버전**: 2.0.0
