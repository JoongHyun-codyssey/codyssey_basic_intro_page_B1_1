const GITHUB_USERNAME = "JoongHyun-codyssey";
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=6`;
const root = document.documentElement;
root.classList.add("js-enabled");
const themeButton = document.querySelector(".theme-toggle");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
const header = document.querySelector(".site-header");
const scrollTopButton = document.querySelector(".scroll-top");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const state = {
    theme: "light",
    menuOpen: false,
    projects: { status: "idle", repositories: [], error: "" },
    form: { errors: {}, touched: new Set(), submitted: false },
};

const renderTheme = () => {
    root.dataset.theme = state.theme;
    const dark = state.theme === "dark";
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.setAttribute("aria-label", dark ? "라이트 모드 켜기" : "다크 모드 켜기");
    document.querySelector('meta[name="theme-color"]').content = dark ? "#1e211e" : "#f7f5f0";
};
try {
    state.theme = localStorage.getItem("portfolio-theme") === "dark" ? "dark" : "light";
} catch { /* 저장소를 사용할 수 없어도 테마 전환은 가능합니다. */ }
renderTheme();
themeButton.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    renderTheme();
    try { localStorage.setItem("portfolio-theme", state.theme); } catch { /* 저장 불가 */ }
});

const renderMenu = () => {
    navigation.classList.toggle('active', state.menuOpen);
    menuButton.setAttribute("aria-expanded", String(state.menuOpen));
};
const closeMenu = () => {
    state.menuOpen = false;
    renderMenu();
};
menuButton.addEventListener("click", () => {
    state.menuOpen = !state.menuOpen;
    renderMenu();
});
navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.menuOpen) {
        closeMenu();
        menuButton.focus();
    }
});
document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav-wrap")) closeMenu();
});
window.matchMedia("(min-width: 768px)").addEventListener("change", closeMenu);
document.querySelector("#year").textContent = new Date().getFullYear();

const renderScroll = () => {
    header.classList.toggle("scrolled", window.scrollY >= 60);
    scrollTopButton.hidden = window.scrollY < 300;
};
window.addEventListener("scroll", renderScroll, { passive: true });
renderScroll();
scrollTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "instant" : "smooth" });
});

// 메뉴 위치 강조와 별도로, 콘텐츠가 20% 보이면 한 번 등장합니다.
if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(({ isIntersecting, target }) => {
            if (!isIntersecting) return;
            target.classList.remove("reveal-pending");
            revealObserver.unobserve(target);
        });
    }, { threshold: 0.2 });
    document.querySelectorAll(".section-heading, .about-layout, .skill-card, .project-card, .contact > div, .contact-note").forEach((element) => {
        element.classList.add("reveal-pending");
        revealObserver.observe(element);
    });
}

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

// 외부 API 문자열을 HTML에 넣기 전에 이스케이프합니다.
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

const renderProjects = () => {
    const { status, repositories, error } = state.projects;
    projectsList.setAttribute("aria-busy", String(status === "loading"));
    projectsRetry.hidden = status !== "error";
    const messages = {
        idle: "GitHub 저장소를 불러올 준비 중입니다.",
        loading: "프로젝트 로딩 중...",
        success: `최근 업데이트한 공개 저장소 ${repositories.length}개입니다.`,
        empty: "표시할 프로젝트가 없습니다.",
        error: `프로젝트를 불러올 수 없습니다. ${error}`,
    };
    projectsStatus.textContent = messages[status];
    projectsList.innerHTML = status === "success" ? repositories.map((repository) => {
        const { name, description, language, stargazers_count = 0 } = repository;
        const url = `https://github.com/${encodeURIComponent(GITHUB_USERNAME)}/${encodeURIComponent(name)}`;
        return `<article class="repo-card">
            <h4><a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(name)} ↗</a></h4>
            <p>${escapeHTML(description || "아직 등록된 설명이 없습니다.")}</p>
            <div class="skill-tags"><span>${escapeHTML(language || "언어 미지정")}</span><span aria-label="스타 ${escapeHTML(stargazers_count)}개">★ ${escapeHTML(stargazers_count)}</span></div>
        </article>`;
    }).join("") : "";
};

async function fetch_projects() {
    if (state.projects.status === "loading") return;
    state.projects = { status: "loading", repositories: [], error: "" };
    renderProjects();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(GITHUB_API_URL, {
            headers: { Accept: "application/vnd.github+json" }, signal: controller.signal,
        });
        if (!response.ok) {
            if (response.status === 404) throw new Error("GitHub 사용자를 찾을 수 없습니다.");
            if (response.status === 403 || response.status === 429) throw new Error("요청이 제한되었습니다. 잠시 후 다시 시도해 주세요.");
            throw new Error(`HTTP ${response.status}`);
        }
        const repositories = await response.json();
        if (!Array.isArray(repositories) || repositories.some((repo) => !repo || typeof repo.name !== "string")) {
            throw new Error("저장소 목록의 응답 형식이 올바르지 않습니다.");
        }
        state.projects = { status: repositories.length ? "success" : "empty", repositories, error: "" };
    } catch (error) {
        state.projects.status = "error";
        state.projects.error = error.name === "AbortError"
            ? "응답 시간이 초과되었습니다. 다시 시도해 주세요."
            : error instanceof TypeError ? "인터넷 연결을 확인하고 다시 시도해 주세요." : error.message;
    } finally {
        clearTimeout(timeout);
        renderProjects();
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
const touchedFields = state.form.touched;
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

const renderForm = () => {
    contactFields.forEach((field) => {
        const message = state.form.errors[field.name] || "";
        const errorText = document.querySelector(`#${field.id}-error`);
        errorText.textContent = message;
        errorText.hidden = !message;
        field.setAttribute("aria-invalid", String(Boolean(message)));
    });
    contactStatus.textContent = state.form.submitted
        ? "입력 검증에 성공했습니다. 감사합니다! 이 데모 폼은 메시지를 실제로 전송하지 않습니다." : "";
    contactStatus.hidden = !state.form.submitted;
};
const validateContactField = (field) => {
    state.form.errors[field.name] = getContactError(field);
    renderForm();
    return !state.form.errors[field.name];
};

contactFields.forEach((field) => {
    field.addEventListener("blur", () => {
        touchedFields.add(field);
        validateContactField(field);
    });
    field.addEventListener("input", () => {
        state.form.submitted = false;
        renderForm();
        // 한 번 검사한 입력란은 수정하는 동안 오류를 바로 갱신합니다.
        if (touchedFields.has(field)) validateContactField(field);
    });
});

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.form.submitted = false;
    renderForm();
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
    state.form.submitted = true;
    renderForm();
});
