/**
 * User Font Settings — FRONTEND / WEBSITE (Odoo 18)
 *
 * ทำงานในหน้า website/portal ที่ไม่มี OWL framework
 * - ผูกปุ่ม .mFont (A- / A+) ที่อยู่ใน navbar/sidebar ของ theme
 * - เรียก /web/dataset/call_kw โดยตรง (JSON-RPC) เพื่อ load/save
 * - apply font-size กับ document.body ทั้งหมด
 *
 * ไม่ใช้ @odoo/owl เพราะ frontend ไม่มี OWL registry
 */

(function () {
    "use strict";

    const FONT_MIN     = 10;
    const FONT_MAX     = 24;
    const FONT_STEP    = 1;
    const FONT_DEFAULT = 14;

    // ─── JSON-RPC helper ──────────────────────────────────────────────────────

    async function callKw(model, method, args) {
        const res = await fetch("/web/dataset/call_kw", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method:  "call",
                params: {
                    model,
                    method,
                    args,
                    kwargs: { context: {} },
                },
            }),
        });
        const json = await res.json();
        if (json.error) throw new Error(json.error.data?.message || json.error.message);
        return json.result;
    }

    // ─── DOM helpers ──────────────────────────────────────────────────────────

    function applyFontSize(size) {
        size = Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(size)));
        document.documentElement.style.setProperty("--ufs-font-size", size + "px");
        document.body.style.fontSize = size + "px";
        return size;
    }

    function showToast(msg, iconClass) {
        iconClass = iconClass || "fa fa-play";
        var existing = document.querySelector(".o_font_toast");
        if (existing) existing.remove();
        var el = document.createElement("div");
        el.className = "o_font_toast";
        el.innerHTML = "<span><i class=\"" + iconClass + "\" aria-hidden=\"true\"></i></span><span>" + msg + "</span>";
        document.body.appendChild(el);
        setTimeout(function () {
            el.classList.add("ufs-hiding");
            setTimeout(function () { el.remove(); }, 280);
        }, 2000);
    }

    // ─── Load saved font size ─────────────────────────────────────────────────

    async function loadAndApply() {
        try {
            const s = await callKw("res.users", "get_font_settings", []);
            applyFontSize(parseInt(s?.font_size || FONT_DEFAULT));
        } catch (e) {
            // user ไม่ได้ login หรือ session หมด — ใช้ค่า default
            console.info("[FontSettings/Frontend] not logged in or load failed:", e.message);
        }
    }

    // ─── Bind .mFont buttons ──────────────────────────────────────────────────

    function bindButtons() {
        document.querySelectorAll("a.mFont, button.mFont").forEach(function (el) {
            if (el.dataset.ufsBound) return;
            el.dataset.ufsBound = "1";
            el.addEventListener("click", onFontButtonClick);
        });
    }

    async function onFontButtonClick(ev) {
        ev.preventDefault();
        var text       = ev.currentTarget.textContent.trim();
        var isIncrease = /\+/.test(text);
        var isDecrease = /[-−]/.test(text);
        if (!isIncrease && !isDecrease) return;

        var current = Math.round(parseFloat(document.body.style.fontSize) || FONT_DEFAULT);
        var newSize = applyFontSize(current + (isIncrease ? FONT_STEP : -FONT_STEP));

        try {
            await callKw("res.users", "save_font_settings", [null, String(newSize), null]);
            showToast("ขนาดฟอนต์: " + newSize + "px", "fa fa-play");
        } catch (e) {
            showToast("บันทึกไม่สำเร็จ", "fa fa-exclamation-triangle");
            console.warn("[FontSettings/Frontend] save failed:", e);
        }
    }

    // ─── Init ─────────────────────────────────────────────────────────────────

    function init() {
        loadAndApply();
        bindButtons();

        // รองรับ navbar/sidebar ที่ render ทีหลัง (lazy load)
        var observer = new MutationObserver(function () { bindButtons(); });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
