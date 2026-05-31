/** @odoo-module **/
/**
 * User Font Settings — Odoo 18
 * ผูกปุ่ม .mFont (A- / A+) กับ font_size ของแต่ละ user
 */

import { registry }   from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Component, onMounted, onWillUnmount, xml } from "@odoo/owl";

const FONT_MIN     = 10;
const FONT_MAX     = 24;
const FONT_STEP    = 1;
const FONT_DEFAULT = 14;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentSize() {
    const raw = parseFloat(getComputedStyle(document.body).fontSize) || FONT_DEFAULT;
    return Math.round(raw);
}

function applyFontSize(size) {
    size = Math.min(FONT_MAX, Math.max(FONT_MIN, size));
    document.body.style.fontSize = size + "px";
    document.documentElement.style.setProperty("--ufs-font-size", size + "px");
    return size;
}

function showToast(msg, iconClass = "fa fa-play") {
    document.querySelector(".o_font_toast")?.remove();
    const el = document.createElement("div");
    el.className = "o_font_toast";
    el.innerHTML = `<span><i class="${iconClass}" aria-hidden="true"></i></span><span>${msg}</span>`;
    document.body.appendChild(el);
    setTimeout(() => {
        el.classList.add("ufs-hiding");
        setTimeout(() => el.remove(), 280);
    }, 2000);
}

// ─── Component ────────────────────────────────────────────────────────────────

export class FontButtonService extends Component {
    // OWL 2 ต้องการ template เสมอ — ใช้ tag เปล่าเพื่อไม่ render อะไร
    static template = xml`<t/>`;
    static props    = {};

    setup() {
        this.orm = useService("orm");

        this._onClick = this._onClick.bind(this);

        onMounted(async () => {
            await this._loadAndApply();
            this._bindButtons();

            // รองรับปุ่มที่ render ทีหลัง (lazy / portal)
            this._observer = new MutationObserver(() => this._bindButtons());
            this._observer.observe(document.body, { childList: true, subtree: true });
        });

        onWillUnmount(() => {
            document.removeEventListener("click", this._onClick);
            this._observer?.disconnect();
        });
    }

    async _loadAndApply() {
        try {
            const s = await this.orm.call("res.users", "get_font_settings", []);
            applyFontSize(parseInt(s?.font_size || FONT_DEFAULT));
        } catch (e) {
            console.warn("[FontSettings] load failed:", e);
        }
    }

    _bindButtons() {
        document.querySelectorAll("a.mFont, button.mFont").forEach(el => {
            if (el.dataset.ufsBound) return;
            el.dataset.ufsBound = "1";
            el.addEventListener("click", this._onClick);
        });
    }

    async _onClick(ev) {
        ev.preventDefault();
        const text      = ev.currentTarget.textContent.trim();
        const isIncrease = /\+/.test(text);
        const isDecrease = /\-/.test(text);
        if (!isIncrease && !isDecrease) return;

        const newSize = applyFontSize(getCurrentSize() + (isIncrease ? FONT_STEP : -FONT_STEP));

        try {
            await this.orm.call("res.users", "save_font_settings", [
                null, String(newSize), null,
            ]);
            showToast(`ขนาดฟอนต์: ${newSize}px`);
        } catch (e) {
            console.warn("[FontSettings] save failed:", e);
        }
    }
}

registry.category("systray").add(
    "user_font_settings.FontButtonService",
    { Component: FontButtonService },
    { sequence: 999 }
);
