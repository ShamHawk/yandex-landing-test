document.addEventListener("DOMContentLoaded", () => {
    // Функция для загрузки контента в указанный контейнер
    const loadContent = (containerId, url) => {
        fetch(url)
            .then((response) => {
                if (!response.ok)
                    throw new Error(`HTTP error! status: ${response.status}`);
                return response.text();
            })
            .then((html) => {
                const container = document.getElementById(containerId);
                if (!container)
                    throw new Error(`Container ${containerId} not found`);
                container.innerHTML = html;
                console.log(`Content loaded into ${containerId}`);

                // Инициализация функций в зависимости от контейнера
                if (containerId.startsWith("marquee-container")) {
                    startMarqueeAnimation(containerId);
                } else if (containerId === "participants-info-container") {
                    initializeParticipantsCarousel();
                } else if (containerId === "transformation-stages-container") {
                    initializeStagesCarousel();
                } else if (
                    containerId === "header-container" &&
                    "tournament-info-container"
                ) {
                    initializeSmoothScroll();
                }
            })
            .catch((err) => console.error("Error loading content:", err));
    };

    // Загрузка контента в контейнеры
    loadContent("header-container", "./components/header/header.html");
    loadContent("marquee-container", "./components/marquee/marquee.html");
    loadContent(
        "tournament-info-container",
        "./components/tournament-info/tournament-info.html"
    );
    loadContent(
        "transformation-stages-container",
        "./components/transformation-stages/transformation-stages.html"
    );
    loadContent(
        "participants-info-container",
        "./components/participants-info/participants-info.html"
    );
    loadContent(
        "marquee-container-footer",
        "./components/marquee/marquee.html"
    );
    loadContent("footer-container", "./components/footer/footer.html");

    // Функция для анимации бегущей строки
    const startMarqueeAnimation = (containerId) => {
        const marqueeContent = document
            .getElementById(containerId)
            ?.querySelector(".marquee-content");
        if (!marqueeContent) {
            console.error(`Marquee content not found in ${containerId}`);
            return;
        }
        marqueeContent.innerHTML += marqueeContent.innerHTML;
        let step = 0;

        const animate = () => {
            step -= 1;
            if (step <= -marqueeContent.scrollWidth / 2) step = 0;
            marqueeContent.style.transform = `translateX(${step}px)`;
            requestAnimationFrame(animate);
        };
        animate();
    };

    // Функция для инициализации карусели участников
    const initializeParticipantsCarousel = () => {
        const carouselContainer = document.getElementById(
            "participantsContainer"
        );
        const nextButton = document.getElementById("nextButton");
        const prevButton = document.getElementById("prevButton");
        const counter = document.getElementById("participantsCounter");

        let currentIndex = 0;
        const numItems = document.querySelectorAll(
            ".participants-info__item"
        ).length;
        let startX = 0;
        let endX = 0;
        let autoSlideInterval;

        const getItemsToShow = () =>
            window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;

        const updateCounter = () => {
            const itemsToShow = getItemsToShow();
            const currentProgress = currentIndex + itemsToShow;
            const totalText = `${currentProgress} / ${numItems}`;
            const [currentText, totalTextPart] = totalText.split(" / ");

            counter.innerHTML = `${currentText} / <span class="opacity-transition">${totalTextPart}</span>`;
            const opacity = currentProgress >= numItems ? 1 : 0.6;
            counter.querySelector(".opacity-transition").style.opacity =
                opacity;

            nextButton.style.backgroundColor =
                currentProgress >= numItems ? "#D6D6D6" : "";
            prevButton.style.backgroundColor =
                currentIndex <= 0 ? "#D6D6D6" : "";
        };

        const slide = () => {
            const itemsToShow = getItemsToShow();
            const offset = -currentIndex * (100 / itemsToShow);
            carouselContainer.style.transform = `translateX(${offset}%)`;
            updateCounter();
            updateVisibility();
        };

        const updateVisibility = () => {
            const items = document.querySelectorAll(".participants-info__item");
            const itemsToShow = getItemsToShow();
            items.forEach((item, index) => {
                item.classList.toggle(
                    "hidden",
                    index < currentIndex || index >= currentIndex + itemsToShow
                );
                item.classList.toggle(
                    "visible",
                    index >= currentIndex && index < currentIndex + itemsToShow
                );
            });
        };

        const handleTouchStart = (event) => (startX = event.touches[0].clientX);
        const handleTouchMove = (event) => (endX = event.touches[0].clientX);
        const handleTouchEnd = () => {
            const diff = startX - endX;
            if (diff > 50 && currentIndex < numItems - getItemsToShow())
                currentIndex++;
            else if (diff < -50 && currentIndex > 0) currentIndex--;
            slide();
            resetAutoSlide();
        };

        const nextSlide = () => {
            if (currentIndex < numItems - getItemsToShow()) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            slide();
        };

        const resetAutoSlide = () => {
            clearInterval(autoSlideInterval);
            autoSlideInterval = setInterval(nextSlide, 4000);
        };

        nextButton.addEventListener("click", () => {
            if (currentIndex < numItems - getItemsToShow()) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            slide();
            resetAutoSlide();
        });

        prevButton.addEventListener("click", () => {
            if (currentIndex > 0) {
                currentIndex--;
            }
            slide();
            resetAutoSlide();
        });

        carouselContainer.addEventListener("touchstart", handleTouchStart);
        carouselContainer.addEventListener("touchmove", handleTouchMove);
        carouselContainer.addEventListener("touchend", handleTouchEnd);
        window.addEventListener("resize", slide);

        updateCounter();
        updateVisibility();
        autoSlideInterval = setInterval(nextSlide, 4000);
    };

    // Функция для инициализации карусели стадий трансформации
    const initializeStagesCarousel = () => {
        const carouselContainer = document.querySelector(
            ".transformation-stages__content-mobile"
        );
        const nextButton = document.getElementById("nextStagesButton");
        const prevButton = document.getElementById("prevStagesButton");
        const progressDots = document.querySelectorAll(
            ".transformation-stages__progress-dot"
        );
        const items = document.querySelectorAll(
            ".transformation-stages__item-mobile"
        );

        let currentIndex = 0;
        const numItems = items.length;
        let startX = 0;
        let endX = 0;

        const updateDots = () => {
            progressDots.forEach((dot, index) => {
                dot.src =
                    index === currentIndex
                        ? "./images/dot-active.svg"
                        : "./images/dot-disabled.svg";
            });
        };

        const updateVisibility = () => {
            items.forEach((item, index) => {
                item.classList.toggle("hidden", index !== currentIndex);
                item.classList.toggle("visible", index === currentIndex);
            });
        };

        const slide = () => {
            const offset = -currentIndex * 100;
            carouselContainer.style.transform = `translateX(${offset}%)`;
            updateVisibility();
            updateDots();
            updateButtonVisibility();
        };

        const updateButtonVisibility = () => {
            nextButton.style.backgroundColor =
                currentIndex >= numItems - 1 ? "#D6D6D6" : "";
            prevButton.style.backgroundColor =
                currentIndex <= 0 ? "#D6D6D6" : "";
        };

        nextButton.addEventListener("click", () => {
            if (currentIndex < numItems - 1) {
                currentIndex++;
                slide();
            }
        });

        prevButton.addEventListener("click", () => {
            if (currentIndex > 0) {
                currentIndex--;
                slide();
            }
        });

        carouselContainer.addEventListener(
            "touchstart",
            (event) => (startX = event.touches[0].clientX)
        );
        carouselContainer.addEventListener(
            "touchmove",
            (event) => (endX = event.touches[0].clientX)
        );
        carouselContainer.addEventListener("touchend", () => {
            const diff = startX - endX;
            if (Math.abs(diff) > 50) {
                if (diff > 0 && currentIndex < numItems - 1)
                    currentIndex++; // Смахивание влево
                else if (diff < 0 && currentIndex > 0) currentIndex--; // Смахивание вправо
                slide();
            }
        });

        updateDots();
        updateVisibility();
        updateButtonVisibility();
    };

    // Плавная прокрутка
    const initializeSmoothScroll = () => {
        const buttons = document.querySelectorAll(
            "#header-container .header__button-first, #header-container .header__button-second"
        );

        buttons.forEach((button) => {
            button.addEventListener("click", function (e) {
                e.preventDefault();
                const targetId = this.getAttribute("href").substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    const targetPosition =
                        targetElement.getBoundingClientRect().top;
                    const offset = targetPosition + window.scrollY;

                    window.scrollTo({
                        top: offset,
                        behavior: "smooth",
                    });
                }
            });
        });
    };
});
