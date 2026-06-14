"use strict";

const boutique = (() => {
    const phone = "919670681647";
    const leadFormEndpoint = "https://script.google.com/macros/s/AKfycbywkiy9wl9XDUikEM_lklaZP560sJXYvLEViwdhmX3adpLVa2pMSMC6m0CAIlCJixfj/exec";

    const blouseData = [
        { title: "Blue Designer Blouse", sku: "BL007-BLU", thumbnail: "photo/blouses/blueblouseB.webp" },
        { title: "Gold & Green Designer Blouse - Back View", sku: "BL008-GGR", thumbnail: "photo/blouses/goldgreenB.webp" },
        { title: "Golden Designer Blouse - Back View", sku: "BL009-GLD", thumbnail: "photo/blouses/goldenblouseb.webp" },
        { title: "Blue Designer Blouse - Front View", sku: "BL0015-PNK", thumbnail: "photo/blouses/pinkblouse4f.webp" },
        { title: "Blue Designer Blouse - Front View", sku: "BL0016-GLD", thumbnail: "photo/blouses/goldenblousef1.webp" },
        { title: "Green Designer Blouse - Back View", sku: "BL010-GRN", thumbnail: "photo/blouses/greenblouseb.webp" },
        { title: "Pink Designer Blouse - Front View", sku: "BL011-PNK", thumbnail: "photo/blouses/pinkblouse3f.webp" },
        { title: "Red Designer Blouse - Back View 2", sku: "BL012-RED2", thumbnail: "photo/blouses/redblouse2b.webp" },
        { title: "Red Designer Blouse - Front View 3", sku: "BL013-RED3", thumbnail: "photo/blouses/redblouse3f.webp" },
        { title: "Red Designer Blouse - Front View", sku: "BL014-REDF", thumbnail: "photo/blouses/redblousefront.webp" }
    ];

    const state = {
        modalFocus: null,
        lightboxFocus: null,
        offerFocus: null,
        blouseCardsRendered: false
    };

    const qs = (selector, scope = document) => scope.querySelector(selector);
    const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

    const getWhatsAppUrl = (message) => {
        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    };

    const initLoader = () => {
        const loader = qs("#siteLoader");
        if (!loader) return;

        const startedAt = performance.now();
        const minVisibleTime = 1100;
        const maxVisibleTime = 1800;
        let hidden = false;

        const hideLoader = () => {
            if (hidden) return;

            hidden = true;
            loader.classList.add("is-hidden");
            loader.setAttribute("aria-hidden", "true");

            window.setTimeout(() => {
                loader.remove();
            }, 460);
        };

        const hideAfterLoad = () => {
            const elapsed = performance.now() - startedAt;
            window.setTimeout(hideLoader, Math.max(minVisibleTime - elapsed, 0));
        };

        if (document.readyState === "complete") {
            hideAfterLoad();
        } else {
            window.addEventListener("load", hideAfterLoad, { once: true });
        }

        window.setTimeout(hideLoader, maxVisibleTime);
    };

    const setBodyLock = (locked) => {
        document.body.classList.toggle("modal-open", locked);
    };

    const initHeader = () => {
        const header = qs("#header");
        const toggle = qs("#mobileMenuBtn");
        const menu = qs("#navMenu");

        if (!header || !toggle || !menu) return;

        const setMenu = (open) => {
            menu.classList.toggle("active", open);
            document.body.classList.toggle("menu-open", open);
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
            toggle.innerHTML = `<i class="fa-solid ${open ? "fa-xmark" : "fa-bars"}" aria-hidden="true"></i>`;
        };

        toggle.addEventListener("click", () => {
            setMenu(!menu.classList.contains("active"));
        });

        qsa("a", menu).forEach((link) => {
            link.addEventListener("click", () => setMenu(false));
        });

        document.addEventListener("click", (event) => {
            if (!menu.classList.contains("active")) return;
            if (menu.contains(event.target) || toggle.contains(event.target)) return;
            setMenu(false);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && menu.classList.contains("active")) {
                setMenu(false);
                toggle.focus();
            }
        });

        window.addEventListener("resize", () => {
            if (window.matchMedia("(min-width: 900px)").matches) setMenu(false);
        });

        const updateHeader = () => {
            header.classList.toggle("scrolled", window.scrollY > 20);
        };

        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });
    };

    const initSmoothScroll = () => {
        qsa('a[href^="#"]').forEach((link) => {
            link.addEventListener("click", (event) => {
                const id = link.getAttribute("href");
                if (!id || id === "#") return;

                const target = qs(id);
                if (!target) return;

                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                history.replaceState(null, "", id);
            });
        });
    };

    const initReveal = () => {
        const items = qsa(".reveal");
        if (!items.length) return;

        if (!("IntersectionObserver" in window)) {
            items.forEach((item) => item.classList.add("visible"));
            return;
        }

        const observer = new IntersectionObserver((entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("visible");
                currentObserver.unobserve(entry.target);
            });
        }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });

        items.forEach((item) => observer.observe(item));
    };

    const openLightbox = ({ src, alt, caption }) => {
        const lightbox = qs("#lightbox");
        const image = qs("#lightboxImage");
        const label = qs("#lightboxCaption");
        if (!lightbox || !image || !label) return;

        state.lightboxFocus = document.activeElement;
        image.src = src;
        image.alt = alt || caption || "Tailoring portfolio image";
        label.textContent = caption || "";
        lightbox.classList.add("active");
        lightbox.setAttribute("aria-hidden", "false");
        setBodyLock(true);
        qs("#closeLightbox")?.focus();
    };

    const closeLightbox = () => {
        const lightbox = qs("#lightbox");
        const image = qs("#lightboxImage");
        const label = qs("#lightboxCaption");
        if (!lightbox || !image || !label) return;

        lightbox.classList.remove("active");
        lightbox.setAttribute("aria-hidden", "true");
        image.src = "";
        label.textContent = "";
        setBodyLock(qs("#blousePopup")?.classList.contains("active") || false);
        state.lightboxFocus?.focus?.();
    };

    const initGallery = () => {
        qsa(".gallery-item").forEach((item) => {
            item.addEventListener("click", () => {
                const image = qs("img", item);
                const title = item.dataset.title || image?.alt || "Portfolio image";
                const sku = item.dataset.sku ? `SKU: ${item.dataset.sku}` : "";

                openLightbox({
                    src: item.dataset.full || image?.src,
                    alt: image?.alt,
                    caption: sku ? `${title} - ${sku}` : title
                });
            });
        });
    };

    const renderBlouseCards = () => {
        const grid = qs("#blouseGrid");
        if (!grid || state.blouseCardsRendered) return;

        const fragment = document.createDocumentFragment();

        blouseData.forEach((item) => {
            const article = document.createElement("article");
            article.className = "blouse-card";

            const previewButton = document.createElement("button");
            previewButton.type = "button";
            previewButton.setAttribute("aria-label", `Preview ${item.title}`);

            const image = document.createElement("img");
            image.src = item.thumbnail;
            image.alt = item.title;
            image.loading = "lazy";
            image.width = 480;
            image.height = 480;

            previewButton.append(image);
            previewButton.addEventListener("click", () => {
                openLightbox({
                    src: item.thumbnail,
                    alt: item.title,
                    caption: `${item.title} - SKU: ${item.sku}`
                });
            });

            const content = document.createElement("div");
            content.className = "blouse-card-content";
            content.innerHTML = `
                <h3>${item.title}</h3>
                <p>SKU: ${item.sku}</p>
                <a class="whatsapp-btn" href="${getWhatsAppUrl(`Hello, I want the price for ${item.title} (SKU: ${item.sku})`)}" target="_blank" rel="noopener">Get Price</a>
            `;

            article.append(previewButton, content);
            fragment.append(article);
        });

        grid.append(fragment);
        state.blouseCardsRendered = true;
    };

    const openBlouseModal = () => {
        const modal = qs("#blousePopup");
        if (!modal) return;

        state.modalFocus = document.activeElement;
        renderBlouseCards();
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        setBodyLock(true);
        qs("#closeBlousePopup")?.focus();
    };

    const closeBlouseModal = () => {
        const modal = qs("#blousePopup");
        if (!modal) return;

        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        setBodyLock(qs("#lightbox")?.classList.contains("active") || false);
        state.modalFocus?.focus?.();
    };

    const initModals = () => {
        qs("#openBlousePopup")?.addEventListener("click", openBlouseModal);
        qs("#closeBlousePopup")?.addEventListener("click", closeBlouseModal);
        qs("#closeLightbox")?.addEventListener("click", closeLightbox);

        qs("#blousePopup")?.addEventListener("click", (event) => {
            if (event.target === event.currentTarget) closeBlouseModal();
        });

        qs("#lightbox")?.addEventListener("click", (event) => {
            if (event.target === event.currentTarget) closeLightbox();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") return;
            if (qs("#lightbox")?.classList.contains("active")) closeLightbox();
            if (qs("#blousePopup")?.classList.contains("active")) closeBlouseModal();
        });
    };

    const initFAQ = () => {
        const questions = qsa(".faq-question");
        if (!questions.length) return;

        const setItem = (button, open) => {
            const answer = qs(`#${button.getAttribute("aria-controls")}`);
            if (!answer) return;

            button.setAttribute("aria-expanded", String(open));
            answer.classList.toggle("active", open);
        };

        questions.forEach((button) => {
            button.addEventListener("click", () => {
                const shouldOpen = button.getAttribute("aria-expanded") !== "true";

                questions.forEach((currentButton) => {
                    setItem(currentButton, currentButton === button && shouldOpen);
                });
            });
        });
    };

    const initLeadForm = () => {
        const form = qs("#leadForm");
        if (!form) return;

        const submitButton = qs("#leadSubmit", form);
        const status = qs("#leadFormStatus", form);

        const fields = {
            name: qs("#leadName", form),
            phone: qs("#leadPhone", form),
            service: qs("#leadService", form),
            message: qs("#leadMessage", form)
        };

        const errors = {
            name: qs("#leadNameError", form),
            phone: qs("#leadPhoneError", form)
        };

        const setFieldError = (field, message) => {
            const input = fields[field];
            const error = errors[field];
            if (!input || !error) return;

            input.closest(".form-field")?.classList.toggle("is-invalid", !!message);
            input.setAttribute("aria-invalid", String(!!message));
            error.textContent = message;
        };

        const setStatus = (message, type = "") => {
            if (!status) return;
            status.className = `form-status ${type}`.trim();
            status.textContent = message;
        };

        const validate = () => {
            let valid = true;

            const name = fields.name.value.trim();
            const phone = fields.phone.value.trim().replace(/\D/g, "");

            setFieldError("name", "");
            setFieldError("phone", "");

            if (!name) {
                setFieldError("name", "Please enter your name.");
                valid = false;
            }

            if (phone.length < 10 || phone.length > 13) {
                setFieldError("phone", "Please enter valid mobile number.");
                valid = false;
            }

            return valid;
        };

        const getPayload = () => ({
            name: fields.name.value.trim(),
            phone: fields.phone.value.trim(),
            service: fields.service.value,
            message: fields.message.value.trim(),
            source: "Maa Ladies Tailor Website",
            submittedAt: new Date().toISOString()
        });

        const toggleSubmitting = (loading) => {
            submitButton.disabled = loading;
            submitButton.innerHTML = loading
                ? '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...'
                : '<i class="fa-solid fa-paper-plane"></i> Submit Form';
        };

        Object.entries(fields).forEach(([key, input]) => {
            input?.addEventListener("input", () => {
                if (key === "name" || key === "phone") setFieldError(key, "");
                setStatus("");
            });
        });

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            setStatus("");

            if (!validate()) return;

            if (
                !leadFormEndpoint ||
                !leadFormEndpoint.startsWith("https://script.google.com/")
            ) {
                setStatus("Form endpoint is not configured.", "error");
                return;
            }

            toggleSubmitting(true);

            try {
                const payload = getPayload();

                await fetch(leadFormEndpoint, {
                    method: "POST",
                    mode: "no-cors",
                    body: JSON.stringify(payload)
                });

                form.reset();

                setStatus(
                    "Thank you. Your request has been submitted successfully. We will contact you soon.",
                    "success"
                );

            } catch (error) {
                setStatus(
                    "We could not submit right now. Please contact us on WhatsApp.",
                    "error"
                );
            } finally {
                toggleSubmitting(false);
            }
        });
    };

    const initOfferModal = () => {
        const modal = qs("#offerModal");
        const closeButton = qs("#closeOfferModal");
        const maybeLaterButton = qs("#offerMaybeLater");
        const cta = qs(".offer-cta", modal);
        if (!modal || !closeButton || !maybeLaterButton || !cta) return;

        const oldStorageKey = "maaLadiesTailorOfferShown";
        const storageKey = "maaLadiesTailorOfferLastShownAt";
        const expiryMs = 24 * 60 * 60 * 1000;
        const focusableSelector = [
            "a[href]",
            "button:not([disabled])",
            "textarea:not([disabled])",
            "input:not([disabled])",
            "select:not([disabled])",
            '[tabindex]:not([tabindex="-1"])'
        ].join(",");

        let delayTimer;
        let hasOpened = false;

        const removeOldStorage = () => {
            try {
                localStorage.removeItem(oldStorageKey);
            } catch (error) {
                // Ignore storage failures in private browsing modes.
            }
        };

        const getLastShownAt = () => {
            try {
                return Number(localStorage.getItem(storageKey)) || 0;
            } catch (error) {
                return 0;
            }
        };

        const isOfferFresh = () => {
            const lastShownAt = getLastShownAt();
            return lastShownAt && Date.now() - lastShownAt < expiryMs;
        };

        const markOfferShown = () => {
            try {
                localStorage.setItem(storageKey, String(Date.now()));
            } catch (error) {
                // The modal can still show even if storage is unavailable.
            }
        };

        const shouldLockBody = () => {
            return (
                modal.classList.contains("active") ||
                qs("#lightbox")?.classList.contains("active") ||
                qs("#blousePopup")?.classList.contains("active") ||
                false
            );
        };

        const getFocusableItems = () => qsa(focusableSelector, modal)
            .filter((item) => item.offsetParent !== null || item === document.activeElement);

        const openOffer = () => {
            if (hasOpened || isOfferFresh()) return;

            hasOpened = true;
            window.clearTimeout(delayTimer);
            window.removeEventListener("scroll", handleScrollTrigger);

            state.offerFocus = document.activeElement;
            markOfferShown();
            modal.classList.add("active");
            modal.setAttribute("aria-hidden", "false");
            setBodyLock(true);

            window.requestAnimationFrame(() => {
                modal.classList.add("visible");
                cta.focus();
            });
        };

        const closeOffer = () => {
            window.clearTimeout(delayTimer);
            window.removeEventListener("scroll", handleScrollTrigger);
            modal.classList.remove("visible");
            modal.setAttribute("aria-hidden", "true");

            window.setTimeout(() => {
                modal.classList.remove("active");
                setBodyLock(shouldLockBody());
                state.offerFocus?.focus?.();
            }, 280);
        };

        function handleScrollTrigger() {
            if (hasOpened || isOfferFresh()) return;

            const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollableHeight <= 0) return;

            const scrolledPercent = window.scrollY / scrollableHeight;
            if (scrolledPercent >= 0.3) openOffer();
        }

        const scheduleOffer = () => {
            if (isOfferFresh()) return;
            delayTimer = window.setTimeout(openOffer, 4000);
            window.addEventListener("scroll", handleScrollTrigger, { passive: true });
        };

        const trapFocus = (event) => {
            if (!modal.classList.contains("active") || event.key !== "Tab") return;

            const focusableItems = getFocusableItems();
            if (!focusableItems.length) return;

            const firstItem = focusableItems[0];
            const lastItem = focusableItems[focusableItems.length - 1];

            if (event.shiftKey && document.activeElement === firstItem) {
                event.preventDefault();
                lastItem.focus();
            } else if (!event.shiftKey && document.activeElement === lastItem) {
                event.preventDefault();
                firstItem.focus();
            }
        };

        removeOldStorage();
        scheduleOffer();

        closeButton.addEventListener("click", closeOffer);
        maybeLaterButton.addEventListener("click", closeOffer);
        cta.addEventListener("click", closeOffer);

        modal.addEventListener("click", (event) => {
            if (event.target === modal) closeOffer();
        });

        document.addEventListener("keydown", (event) => {
            if (!modal.classList.contains("active")) return;
            if (event.key === "Escape") closeOffer();
            trapFocus(event);
        });
    };

    const initWhatsAppTracking = () => {
        qsa(".whatsapp-link").forEach((link) => {
            link.addEventListener("click", () => {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: "whatsapp_cta_click",
                    ctaText: link.textContent.trim()
                });
            });
        });
    };

    const init = () => {
        initLoader();
        initHeader();
        initSmoothScroll();
        initReveal();
        initGallery();
        initModals();
        initFAQ();
        initLeadForm();
        initOfferModal();
        initWhatsAppTracking();
    };

    return { init };
})();

document.addEventListener("DOMContentLoaded", boutique.init);
