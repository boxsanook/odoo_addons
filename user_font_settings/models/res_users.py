# -*- coding: utf-8 -*-
from odoo import models, fields, api

FONT_FAMILIES = [
    ('Sarabun', 'Sarabun (ภาษาไทย)'),
    ('Noto Sans Thai', 'Noto Sans Thai'),
    ('Prompt', 'Prompt'),
    ('Kanit', 'Kanit'),
    ('IBM Plex Sans Thai', 'IBM Plex Sans Thai'),
    ('Roboto', 'Roboto'),
    ('Open Sans', 'Open Sans'),
    ('Lato', 'Lato'),
    ('Poppins', 'Poppins'),
    ('Inter', 'Inter'),
    ('Nunito', 'Nunito'),
    ('Source Sans 3', 'Source Sans 3'),
]

FONT_SIZES = [
    ('10','10px'),('11','11px'),('12','12px (เล็ก)'),
    ('13','13px'),('14','14px (ปกติ)'),('15','15px'),
    ('16','16px'),('17','17px'),('18','18px (ใหญ่)'),
    ('20','20px'),('22','22px'),('24','24px (ใหญ่พิเศษ)'),
]

LINE_HEIGHTS = [
    ('1.2','แน่น (1.2)'),('1.4','ปกติ (1.4)'),
    ('1.6','กว้าง (1.6)'),('1.8','กว้างมาก (1.8)'),('2.0','กว้างพิเศษ (2.0)'),
]

DEFAULT_FONT_FAMILY_PARAM = 'user_font_settings.default_font_family'
DEFAULT_FONT_SIZE_PARAM = 'user_font_settings.default_font_size'
DEFAULT_LINE_HEIGHT_PARAM = 'user_font_settings.default_font_line_height'


def _get_system_font_defaults(env):
    params = env['ir.config_parameter'].sudo()
    return {
        'font_family': params.get_param(DEFAULT_FONT_FAMILY_PARAM, 'Sarabun'),
        'font_size': params.get_param(DEFAULT_FONT_SIZE_PARAM, '14'),
        'font_line_height': params.get_param(DEFAULT_LINE_HEIGHT_PARAM, '1.4'),
    }


class ResUsers(models.Model):
    _inherit = 'res.users'

    font_family     = fields.Selection(
        FONT_FAMILIES,
        string='ฟอนต์',
        default=lambda self: _get_system_font_defaults(self.env)['font_family'],
    )
    font_size       = fields.Selection(
        FONT_SIZES,
        string='ขนาดฟอนต์',
        default=lambda self: _get_system_font_defaults(self.env)['font_size'],
    )
    font_line_height= fields.Selection(
        LINE_HEIGHTS,
        string='ความสูงบรรทัด',
        default=lambda self: _get_system_font_defaults(self.env)['font_line_height'],
    )

    @api.model
    def get_font_settings(self):
        """Return current user's font settings for JS."""
        u = self.env.user
        system_defaults = _get_system_font_defaults(self.env)
        return {
            'font_family':      u.font_family      or system_defaults['font_family'],
            'font_size':        u.font_size        or system_defaults['font_size'],
            'font_line_height': u.font_line_height or system_defaults['font_line_height'],
        }

    def save_font_settings(self, font_family, font_size, font_line_height):
        """
        Save font settings.  Pass None/False to keep the existing value.
        ใช้งาน:
            save_font_settings("Sarabun", "16", "1.4")   # บันทึกทุกค่า
            save_font_settings(None, "18", None)          # บันทึกแค่ font_size
        """
        vals = {}
        if font_family:      vals['font_family']      = font_family
        if font_size:        vals['font_size']        = str(font_size)
        if font_line_height: vals['font_line_height'] = font_line_height
        if vals:
            self.env.user.sudo().write(vals)
        return {'success': True, 'updated': list(vals.keys())}
