/** @odoo-module **/
/**
 * User Font Settings — Odoo 18 Backend
 *
 * - render ปุ่ม  ก-  /  ก+  เข้าใน o_menu_systray (navbar บนขวา)
 * - โหลด font_size ของ user จาก DB ตอน mount
 * - กดปุ่มแล้วเปลี่ยน font-size ทันทีและบันทึก DB
 * - ครอบคลุม navbar + sidebar + content ทุกส่วน
 */

import { registry }   from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Component, onMounted, xml } from "@odoo/owl";

const FONT_MIN     = 10;
const FONT_MAX     = 24;
const FONT_STEP    = 1;
const FONT_DEFAULT = 14;
const FONT_FAMILY_DEFAULT = "Sarabun";
const LINE_HEIGHT_DEFAULT = "1.4";
const STORAGE_KEY = "user_font_settings.backend";
const FONT_FALLBACK_STACK = [
    "Segoe UI",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "Apple Color Emoji",
    "Noto Color Emoji",
    "sans-serif",
].join(", ");

// ─── helpers ──────────────────────────────────────────────────────────────────

function buildFontFamily(fontFamily) {
    return `'${fontFamily}', ${FONT_FALLBACK_STACK}`;
}

function applyFontSettings(settings) {
    const fontSize = Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(settings.fontSize || FONT_DEFAULT)));
    const fontFamily = settings.fontFamily || FONT_FAMILY_DEFAULT;
    const lineHeight = settings.lineHeight || LINE_HEIGHT_DEFAULT;
    const fontFamilyStack = buildFontFamily(fontFamily);

    document.documentElement.style.setProperty("--ufs-font-size", fontSize + "px");
    document.documentElement.style.setProperty("--ufs-font-family", fontFamilyStack);
    document.documentElement.style.setProperty("--ufs-line-height", lineHeight);

    document.body.style.fontSize = fontSize + "px";
    document.body.style.fontFamily = fontFamilyStack;
    document.body.style.lineHeight = lineHeight;
    return fontSize;
}

function readLocalSettings() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }
        const settings = JSON.parse(raw);
        return {
            fontFamily: settings.fontFamily || FONT_FAMILY_DEFAULT,
            fontSize: parseInt(settings.fontSize || FONT_DEFAULT),
            lineHeight: settings.lineHeight || LINE_HEIGHT_DEFAULT,
        };
    } catch (e) {
        console.warn("[FontSettings] localStorage read failed:", e);
        return null;
    }
}

function writeLocalSettings(settings) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
            fontFamily: settings.fontFamily || FONT_FAMILY_DEFAULT,
            fontSize: Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(settings.fontSize || FONT_DEFAULT))),
            lineHeight: settings.lineHeight || LINE_HEIGHT_DEFAULT,
        }));
    } catch (e) {
        console.warn("[FontSettings] localStorage write failed:", e);
    }
}

function currentSize() {
    return Math.round(parseFloat(getComputedStyle(document.body).fontSize) || FONT_DEFAULT);
}

function showToast(msg, iconClass) {
    iconClass = iconClass || "fa fa-play";
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

// ─── Systray Component ────────────────────────────────────────────────────────

export class FontSizeSystray extends Component {
    static template = xml`
        <div class="o_font_size_systray d-flex align-items-center ">
            <a href="javascript:void(0)"
               class="mFont o_font_btn o_font_btn_minus"
               title="ลดขนาดฟอนต์"
               t-on-click="decrease"><i class="fa fa-font" aria-hidden="true"></i><i class="fa fa-minus"></i></a>
            <a href="javascript:void(0)"
               class="mFont o_font_btn o_font_btn_plus"
               title="เพิ่มขนาดฟอนต์"
               t-on-click="increase"><i class="fa fa-font" aria-hidden="true"></i><i class="fa fa-plus"></i></a>
        </div>
    `;
    static props = {};

    setup() {
        this.orm = useService("orm");
        this.currentSettings = {
            fontFamily: FONT_FAMILY_DEFAULT,
            fontSize: FONT_DEFAULT,
            lineHeight: LINE_HEIGHT_DEFAULT,
        };

        onMounted(async () => {
            const localSettings = readLocalSettings();
            if (localSettings) {
                this.currentSettings = localSettings;
                applyFontSettings(this.currentSettings);
            }

            try {
                const s = await this.orm.call("res.users", "get_font_settings", []);
                const dbSettings = {
                    fontFamily: s?.font_family || FONT_FAMILY_DEFAULT,
                    fontSize: parseInt(s?.font_size || FONT_DEFAULT),
                    lineHeight: s?.font_line_height || LINE_HEIGHT_DEFAULT,
                };

                // localStorage เป็นค่าที่ผู้ใช้คาดว่าจะคงอยู่หลัง hard refresh
                // ถ้ามี local อยู่แล้ว ให้ใช้ local เป็นหลักและค่อย sync DB เบื้องหลัง
                if (!localSettings) {
                    this.currentSettings = dbSettings;
                    applyFontSettings(this.currentSettings);
                    writeLocalSettings(this.currentSettings);
                }
            } catch (e) {
                console.warn("[FontSettings] load failed:", e);
            }
        });
    }

    async decrease(ev) {
        ev.preventDefault();
        await this._change(-FONT_STEP);
    }

    async increase(ev) {
        ev.preventDefault();
        await this._change(+FONT_STEP);
    }

    async _change(delta) {
        this.currentSettings.fontSize = currentSize() + delta;
        const newSize = applyFontSettings(this.currentSettings);
        this.currentSettings.fontSize = newSize;
        writeLocalSettings(this.currentSettings);

        try {
            await this.orm.call("res.users", "save_font_settings", [
                null, String(newSize), null,
            ]);
            showToast(`ขนาดฟอนต์: ${newSize}px`, "fa fa-play");
        } catch (e) {
            showToast("บันทึกในเครื่องแล้ว", "fa fa-save");
            console.warn("[FontSettings] save failed:", e);
        }
    }
}

// sequence ต่ำ = อยู่ทางขวาสุดของ systray (ก่อน user menu)
registry.category("systray").add(
    "user_font_settings.FontSizeSystray",
    { Component: FontSizeSystray },
    { sequence: 1 }
);
