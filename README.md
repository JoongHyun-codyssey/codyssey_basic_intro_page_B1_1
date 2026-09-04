# Portfolio Website

순수 **HTML, CSS, JavaScript**를 활용하여 제작하는 반응형 포트폴리오 웹사이트입니다.

외부 프레임워크 없이 웹의 기본 구조와 동작 원리를 학습하고, 사용자 이벤트에 따른 상태 변경과 DOM 업데이트 과정을 직접 구현하는 것을 목표로 합니다.

또한 GitHub REST API를 활용하여 저장소 정보를 동적으로 불러오고, API 요청 과정에서 발생할 수 있는 **Loading / Success / Error / Empty** 상태를 UI에 표현합니다.

---

## 프로젝트 소개

이 프로젝트는 HTML, CSS, JavaScript의 기본 개념을 활용하여 반응형 포트폴리오 웹사이트를 구현한 프로젝트입니다.

웹사이트는 다음 섹션으로 구성됩니다.

- Hero
- About
- Skills
- Projects
- Contact
- Footer

Projects 영역은 GitHub API와 연동하여 GitHub 저장소 정보를 동적으로 표시합니다.

사용자의 입력과 행동에 따라 화면이 변경되는 과정을 구현하면서 다음과 같은 흐름을 이해하는 것을 목표로 합니다.

```text
사용자 이벤트 → 상태 변경 → DOM 업데이트 → 화면 변화
```

---

## 주요 기능

### 반응형 웹 디자인

모바일 퍼스트 방식으로 스타일을 작성하고 미디어 쿼리를 이용하여 다양한 화면 크기에 대응합니다.

- Mobile: 기본 레이아웃
- Tablet: 768px 이상
- Desktop: 1024px 이상
- Flexbox를 활용한 Navigation 구성
- CSS Grid를 활용한 Projects 카드 구성
- `auto-fit`, `minmax()`를 이용한 프로젝트 카드 자동 배치

### 모바일 Navigation

모바일 환경에서는 기존 Navigation 메뉴를 숨기고 햄버거 버튼을 표시합니다.

햄버거 버튼 클릭 시 `classList.toggle()`을 이용하여 Navigation 메뉴의 표시 상태를 변경합니다.

### Dark Mode

Dark Mode 버튼을 클릭하면 페이지의 테마가 변경됩니다.

CSS 변수와 `data-theme` 속성을 이용하여 Light/Dark Theme를 구분하고, 사용자가 선택한 Theme는 `localStorage`에 저장합니다.

따라서 페이지를 새로고침하더라도 이전에 선택한 Theme가 유지됩니다.

### Smooth Scroll

Navigation 메뉴를 클릭하면 각 Section으로 부드럽게 이동합니다.

### Scroll Top Button

페이지를 일정 거리 이상 스크롤하면 Scroll Top 버튼이 표시됩니다.

- 표시 기준: `300px`
- 버튼 클릭 시 페이지 최상단으로 이동

### Navigation Scroll Effect

페이지를 일정 거리 이상 스크롤하면 Navigation의 스타일이 변경됩니다.

- 변경 기준: `60px`

스크롤 위치에 따라 클래스를 추가하거나 제거하여 Navigation의 배경 스타일을 변경합니다.

### Scroll Animation

`IntersectionObserver`를 사용하여 Section 또는 요소가 화면에 들어왔을 때 애니메이션이 실행되도록 구현합니다.

- Intersection Observer threshold: `0.2`

### Contact Form Validation

Contact Form에서 다음 입력값을 검증합니다.

- 이름
- 이메일
- 메시지

빈 입력값 제출을 방지하고 이메일 형식을 검사합니다.

유효하지 않은 입력값이 존재하면 해당 입력 필드 주변에 Error Message를 표시합니다.

폼 제출 시 `event.preventDefault()`를 이용하여 기본 제출 동작을 막고, 모든 입력값이 유효한 경우 Success Message를 표시합니다.

---

## GitHub API

GitHub REST API를 사용하여 GitHub Repository 정보를 가져옵니다.

```text
https://api.github.com/users/{GitHub ID}/repos
```

`fetch()`와 `async/await`를 이용하여 비동기 요청을 처리합니다.

API 요청 상태에 따라 Projects Section의 UI가 변경됩니다.

| 상태    | 화면                                                  |
| ------- | ----------------------------------------------------- |
| Loading | 프로젝트를 불러오는 중이라는 메시지 또는 Spinner 표시 |
| Success | GitHub Repository를 Project Card로 표시               |
| Error   | 오류 메시지와 Retry 버튼 표시                         |
| Empty   | 표시할 프로젝트가 없다는 메시지 표시                  |

API 요청 중 발생하는 오류는 `try/catch`를 이용하여 처리합니다.

---

## 상태와 렌더링

이 프로젝트에서는 사용자 이벤트에 따라 상태가 변경되고, 변경된 상태에 맞게 화면을 다시 표현하는 흐름을 구현합니다.

### Theme

```text
Dark Mode 버튼 클릭
        ↓
Theme 상태 변경
        ↓
data-theme 변경
        ↓
화면 Theme 변경
        ↓
localStorage 저장
```

### GitHub Projects

```text
API 요청
   ↓
Loading
   ↓
Success / Error / Empty
   ↓
Projects UI 업데이트
```

### Form Validation

```text
사용자 입력
    ↓
입력값 검증
    ↓
Validation 상태 변경
    ↓
Error Message 표시 / 제거
```

---

## 사용 기술

### HTML

- Semantic HTML
- Accessibility
- Form
- Anchor Navigation

### CSS

- CSS Variables
- Flexbox
- Grid
- Media Query
- Transition
- Hover Effect
- Box Shadow
- Responsive Design
- Dark Mode

### JavaScript

- DOM Manipulation
- Event Listener
- Intersection Observer
- Local Storage
- Fetch API
- Async / Await
- Try / Catch
- Template Literals
- Destructuring
- Arrow Function
- Array Methods
    - `map()`
    - `filter()`
    - `forEach()`

---

## 프로젝트 구조

```text
b1_1/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── images/
│   └── ...
└── README.md
```

각 디렉터리는 다음 역할을 담당합니다.

| 파일 / 디렉터리 | 역할                             |
| --------------- | -------------------------------- |
| `index.html`    | 웹페이지의 구조 및 콘텐츠        |
| `css/`          | 웹페이지 스타일 및 반응형 디자인 |
| `js/`           | DOM 조작, 이벤트 및 API 처리     |
| `images/`       | 프로필 및 프로젝트 이미지        |
| `README.md`     | 프로젝트 설명 및 구현 내용       |

---

## Semantic HTML

페이지의 구조와 각 영역의 의미를 명확하게 표현하기 위해 단순히 `div`만 사용하는 대신 Semantic Tag를 사용했습니다.

```html
<header>
    <nav>
        <main>
            <section>
                <article>
                    <footer></footer>
                </article>
            </section>
        </main>
    </nav>
</header>
```

이를 통해 문서 구조를 명확하게 구분하고 코드의 가독성과 접근성을 높이고자 했습니다.

---

## Flexbox와 Grid

Navigation처럼 **한 방향으로 요소를 배치하는 영역**에는 Flexbox를 사용합니다.

```text
Logo ← Navigation → Menu
```

Projects처럼 **행과 열을 기반으로 여러 카드를 배치하는 영역**에는 CSS Grid를 사용합니다.

```text
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Project │ │ Project │ │ Project │
└─────────┘ └─────────┘ └─────────┘

┌─────────┐ ┌─────────┐ ┌─────────┐
│ Project │ │ Project │ │ Project │
└─────────┘ └─────────┘ └─────────┘
```

Grid에는 `auto-fit`과 `minmax()`를 사용하여 화면 크기에 따라 카드 개수가 자연스럽게 변경되도록 구현합니다.

---

## JavaScript 이벤트 처리

HTML에 직접 `onclick`을 작성하지 않고 JavaScript의 `addEventListener()`를 이용하여 이벤트를 처리합니다.

기본적인 동작 흐름은 다음과 같습니다.

```text
DOM 요소 선택
     ↓
Event Listener 등록
     ↓
사용자 Event 발생
     ↓
상태 변경
     ↓
DOM 업데이트
```

DOM 요소 선택에는 `querySelector()`와 `querySelectorAll()`을 사용합니다.

---

## 실행 방법

Repository를 Clone합니다.

```bash
git clone <repository-url>
```

프로젝트 디렉터리로 이동합니다.

```bash
cd <repository-name>
```

VS Code에서 프로젝트를 실행한 후 Live Server를 이용하여 `index.html`을 실행합니다.

---

## 배포

GitHub Pages를 이용하여 배포합니다.

**Deploy URL**

```text
추후 추가
```

---

## Screenshot

### Desktop

```text
추후 추가
```

### Mobile

```text
추후 추가
```

### Dark Mode

```text
추후 추가
```

---

## 구현 기준

프로젝트에서 사용한 주요 기준값입니다.

| 기능                            |   기준 |
| ------------------------------- | -----: |
| Tablet Breakpoint               |  768px |
| Desktop Breakpoint              | 1024px |
| Scroll Top Button               |  300px |
| Navigation Style Change         |   60px |
| Intersection Observer Threshold |    0.2 |

---

## 학습 목표

이 프로젝트를 통해 다음 내용을 학습하는 것을 목표로 합니다.

- Semantic HTML을 활용한 웹페이지 구조 설계
- Flexbox와 Grid의 차이와 활용 방법
- CSS Media Query를 활용한 반응형 디자인
- JavaScript DOM 선택 및 조작
- `addEventListener()`를 활용한 이벤트 처리
- 사용자 이벤트에 따른 상태 변경과 DOM 업데이트
- ES6+ 문법 활용
- `fetch()`와 `async/await`를 활용한 비동기 처리
- GitHub API 연동
- Loading / Success / Error / Empty 상태 처리
- `localStorage`를 활용한 사용자 설정 유지
- Form Validation 구현
- GitHub Pages를 활용한 웹사이트 배포

---

## 배운 점

> 프로젝트 완료 후 작성 예정

프로젝트를 진행하면서 새롭게 알게 된 내용, 구현 과정에서 발생한 문제와 해결 방법 등을 작성합니다.

---

## 개선 사항

> 프로젝트 완료 후 작성 예정

현재 구현에서 개선할 수 있는 부분이나 추후 추가하고 싶은 기능을 작성합니다.
