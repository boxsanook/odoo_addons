# User Font Settings

**Odoo 18 Custom Addon** — ปรับแต่งฟอนต์แยกต่อ User

## ภาพรวม

Module นี้เพิ่มปุ่ม **ก-** / **ก+** เข้าไปใน systray navbar (มุมขวาบน) ของ Odoo Backend  
ผู้ใช้แต่ละคนสามารถปรับขนาดฟอนต์ได้เองโดยไม่กระทบผู้ใช้คนอื่น และค่าที่ตั้งจะถูกจำไว้ใน database

## คุณสมบัติ

- **ปุ่ม ก- / ก+** ใน systray — คลิกครั้งเดียวเปลี่ยน font size ทันที
- **บันทึกต่อ User** — แต่ละ user มีค่าฟอนต์เป็นของตัวเอง
- **โหลดเร็ว** — ใช้ localStorage แคชค่าไว้ก่อน จากนั้น sync กับ DB เบื้องหลัง
- **ปรับได้ 3 ค่า** — Font Family, Font Size, Line Height
- **ค่าเริ่มต้นระบบ** — Admin กำหนด default ได้ใน Settings → Technical

## การติดตั้ง

1. คัดลอกโฟลเดอร์ `user_font_settings` ไปไว้ใน `addons` path ของ Odoo
2. รีสตาร์ท Odoo server
3. ไปที่ **Apps** → ค้นหา `User Font Settings` → กด **Install**

## การใช้งาน

### ผู้ใช้ทั่วไป

| ปุ่ม | การทำงาน |
|------|----------|
| **ก-** (fa-minus) | ลด font size ลง 1px |
| **ก+** (fa-plus) | เพิ่ม font size ขึ้น 1px |

- ขนาดฟอนต์: **10px – 24px**
- การเปลี่ยนแปลงมีผลทันทีและบันทึก DB อัตโนมัติ
- Toast notification แสดงขนาดปัจจุบันหลังกด

### Admin — ตั้งค่า Default ของระบบ

ไปที่ **Settings → Technical → User Font Settings**

| ฟิลด์ | ค่าเริ่มต้น | ตัวเลือก |
|-------|------------|---------|
| ฟอนต์เริ่มต้น | Sarabun | Sarabun, Noto Sans Thai, Prompt, Kanit, IBM Plex Sans Thai, Roboto, Open Sans, Lato, Poppins, Inter, Nunito, Source Sans 3 |
| ขนาดฟอนต์เริ่มต้น | 14px | 10px – 24px |
| ความสูงบรรทัดเริ่มต้น | 1.4 | 1.2, 1.4, 1.6, 1.8, 2.0 |

ค่า default มีผลกับ user ใหม่หรือ user ที่ยังไม่เคยตั้งค่า

## โครงสร้างไฟล์

```
user_font_settings/
├── __manifest__.py
├── __init__.py
├── models/
│   ├── res_users.py           # fields: font_family, font_size, font_line_height
│   └── res_config_settings.py # system-wide defaults
├── views/
│   ├── res_users_views.xml
│   └── res_config_settings_views.xml
├── static/src/
│   ├── css/font_settings.css
│   └── js/font_settings_backend.js   # Systray component (OWL)
└── security/
    └── ir.model.access.csv
```

## ข้อมูลทางเทคนิค

| รายการ | ค่า |
|--------|-----|
| Odoo Version | 18.0 |
| Module Version | 1.3.0 |
| License | LGPL-3 |
| Author | Anulak Ch. |
| Dependencies | `web`, `base` |

### System Parameters

Module ใช้ `ir.config_parameter` เก็บค่า default ของระบบ:

- `user_font_settings.default_font_family`
- `user_font_settings.default_font_size`
- `user_font_settings.default_font_line_height`

### localStorage Key

```
user_font_settings.backend
```

ใช้แคชค่าฟอนต์ในเบราว์เซอร์เพื่อลด flash ขณะโหลดหน้า
