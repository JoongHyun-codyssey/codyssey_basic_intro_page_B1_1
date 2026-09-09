const GITHUB_USERNAME = "JoongHyun-codyssey";
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=6`;
const root = document.documentElement;
root.classList.add("js-enabled");
const themeButton = document.querySelector(".theme-toggle");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");

function setTheme(theme) {
    root.dataset.theme = theme;
    const dark = theme === "dark";
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.setAttribute(
        "aria-label",
        dark ? "라이트 모드 켜기" : "다크 모드 켜기",
    );
    document.querySelector('meta[name="theme-color"]').content = dark
        ? "#1e211e"
        : "#f7f5f0";
}

let savedTheme;
try {
    savedTheme = localStorage.getItem("portfolio-theme");
} catch {
    /* Storage can be unavailable in private browsing. */
}
setTheme(savedTheme === "dark" ? "dark" : "light");
themeButton.addEventListener("click", () => {
    const theme = root.dataset.theme === "dark" ? "light" : "dark";
    setTheme(theme);
    try {
        localStorage.setItem("portfolio-theme", theme);
    } catch {
        /* The theme still works without storage. */
    }
});

function closeMenu() {
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
}
menuButton.addEventListener("click", () => {
    const open = navigation.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(open));
});
navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("is-open")) {
        closeMenu();
        menuButton.focus();
    }
});
document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav-wrap")) closeMenu();
});
window.matchMedia("(min-width: 701px)").addEventListener("change", closeMenu);
document.querySelector("#year").textContent = new Date().getFullYear();

if ("IntersectionObserver" in window) {
    const links = [...navigation.querySelectorAll("a")];
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                links.forEach((link) => {
                    const active = link.hash === `#${entry.target.id}`;
                    link.classList.toggle("active", active);
                    if (active) link.setAttribute("aria-current", "location");
                    else link.removeAttribute("aria-current");
                });
            });
        },
        { rootMargin: "-15% 0px -45% 0px", threshold: 0 },
    );
    document
        .querySelectorAll("main > section[id]")
        .forEach((section) => observer.observe(section));
}

const projectsList = document.querySelector("#github-projects");
const projectsStatus = document.querySelector("#projects-status");
const projectsRetry = document.querySelector("#projects-retry");
document.querySelector("#github-profile").href =
    `https://github.com/${GITHUB_USERNAME}?tab=repositories`;

// JSON 데이터를 HTML 카드로 변환합니다.
const render_projects = (repositories) => {
    const cards = repositories.map((repo) => {
        const card = document.createElement("article");
        card.className = "repo-card";

        const heading = document.createElement("h4");
        const link = document.createElement("a");
        link.href = `https://github.com/${encodeURIComponent(GITHUB_USERNAME)}/${encodeURIComponent(repo.name)}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = `${repo.name} ↗`;
        heading.append(link);

        const description = document.createElement("p");
        description.textContent =
            repo.description || "아직 등록된 설명이 없습니다.";

        const metadata = document.createElement("div");
        metadata.className = "skill-tags";
        const language = document.createElement("span");
        language.textContent = repo.language || "언어 미지정";
        const stars = document.createElement("span");
        stars.textContent = `★ ${repo.stargazers_count ?? 0}`;
        stars.setAttribute(
            "aria-label",
            `스타 ${repo.stargazers_count ?? 0}개`,
        );
        metadata.append(language, stars);

        card.append(heading, description, metadata);
        return card;
    });
    projectsList.replaceChildren(...cards);
};

async function fetch_projects() {
    if (projectsList.getAttribute("aria-busy") === "true") return;
    projectsList.setAttribute("aria-busy", "true");
    projectsStatus.textContent = "GitHub 저장소를 불러오는 중입니다…";
    projectsRetry.hidden = true;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
        // 1. GitHub에 저장소 목록을 요청합니다.
        const response = await fetch(GITHUB_API_URL, {
            headers: { Accept: "application/vnd.github+json" },
            signal: controller.signal,
        });

        // ok는 함수가 아니라 요청 성공 여부를 나타내는 boolean 값입니다.
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(
                    "GitHub 사용자를 찾을 수 없습니다. GITHUB_USERNAME을 확인해 주세요.",
                );
            }
            if (response.status === 403 || response.status === 429) {
                throw new Error(
                    "GitHub 요청이 제한되었습니다. 잠시 후 다시 시도해 주세요.",
                );
            }
            throw new Error(
                `저장소를 불러오지 못했습니다. (HTTP ${response.status})`,
            );
        }

        // 2. json()도 비동기 작업이므로 await로 결과를 기다립니다.
        const repositories = await response.json();
        if (!Array.isArray(repositories)) {
            throw new Error("저장소 목록의 응답 형식이 올바르지 않습니다.");
        }

        // 3. 가져온 목록을 화면에 표시합니다.
        render_projects(repositories);
        projectsStatus.textContent = repositories.length
            ? `최근 업데이트한 공개 저장소 ${repositories.length}개입니다. 이름을 누르면 GitHub에서 열립니다.`
            : "아직 공개된 저장소가 없습니다.";
    } catch (error) {
        projectsStatus.textContent =
            error.name === "AbortError"
                ? "응답 시간이 초과되었습니다. 다시 시도해 주세요."
                : error instanceof TypeError
                  ? "GitHub에 연결하지 못했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요."
                  : error.message;
        projectsRetry.hidden = false;
    } finally {
        clearTimeout(timeout);
        projectsList.setAttribute("aria-busy", "false");
    }
}

projectsRetry.addEventListener("click", fetch_projects);
// 함수 선언만으로는 실행되지 않으므로 직접 호출합니다.
fetch_projects();
let typingBool = false;
let typingIdx = 0;
let tyInt;
const typ = document.getElementsByClassName("typing")[0];
const typingWrap = document.querySelector(".hero-description-wrap");
let Txt = document.getElementsByClassName("hero-description")[0].innerText;
Txt = Txt.split("");

const typingTxt = () => {
    if (typingBool == false) {
        typingBool = true;
        typingIdx = 0;
        typ.textContent = "";
        tyInt = setInterval(typing, 100);
    }
};

const typing = () => {
    if (typingIdx < Txt.length) {
        typ.append(Txt[typingIdx]);
        typingIdx++;
    }

    if (typingIdx >= Txt.length) {
        clearInterval(tyInt);
        setTimeout(() => {
            typingBool = false;
            typingTxt();
        }, 5000);
    }
};

// 모션 줄이기 설정에서는 원문을 그대로 보여줍니다.
if (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    Txt.length > 0
) {
    typingWrap.classList.add("is-typing");
    typingTxt();
}

const contactForm = document.querySelector("#contact-form");
const contactFields = [...contactForm.querySelectorAll("input, textarea")];
const contactStatus = document.querySelector("#contact-status");
const touchedFields = new Set();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 오류 문구를 반환하고, 올바른 값이면 빈 문자열을 반환합니다.
const getContactError = (field) => {
    const value = field.value.trim();
    if (!value) {
        const emptyMessages = {
            email: "이메일을 입력해 주세요.",
            name: "이름을 입력해 주세요.",
            message: "메시지를 입력해 주세요.",
        };
        return emptyMessages[field.name];
    }
    if (field.name === "email" && !emailRegex.test(value)) {
        return "이메일 형식이 알맞지 않습니다. 예: you@example.com";
    }
    return "";
};

const validateContactField = (field) => {
    const message = getContactError(field);
    const errorText = document.querySelector(`#${field.id}-error`);
    errorText.textContent = message;
    errorText.hidden = !message;
    field.setAttribute("aria-invalid", String(Boolean(message)));
    return !message;
};

contactFields.forEach((field) => {
    field.addEventListener("blur", () => {
        touchedFields.add(field);
        validateContactField(field);
    });
    field.addEventListener("input", () => {
        contactStatus.hidden = true;
        // 한 번 검사한 입력란은 수정하는 동안 오류를 바로 갱신합니다.
        if (touchedFields.has(field)) validateContactField(field);
    });
});

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    contactStatus.hidden = true;
    let firstInvalidField;
    contactFields.forEach((field) => {
        touchedFields.add(field);
        if (!validateContactField(field) && !firstInvalidField) {
            firstInvalidField = field;
        }
    });
    if (firstInvalidField) {
        firstInvalidField.focus();
        return;
    }
    contactStatus.textContent = "입력 형식을 확인했습니다. 메시지 전송 기능은 아직 연결되지 않았습니다.";
    contactStatus.hidden = false;
});
