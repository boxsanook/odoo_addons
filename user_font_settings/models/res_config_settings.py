# -*- coding: utf-8 -*-
from odoo import fields, models

from .res_users import (
    DEFAULT_FONT_FAMILY_PARAM,
    DEFAULT_FONT_SIZE_PARAM,
    DEFAULT_LINE_HEIGHT_PARAM,
    FONT_FAMILIES,
    FONT_SIZES,
    LINE_HEIGHTS,
)


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    font_default_family = fields.Selection(
        FONT_FAMILIES,
        string='ฟอนต์เริ่มต้น',
        config_parameter=DEFAULT_FONT_FAMILY_PARAM,
        default='Sarabun',
    )
    font_default_size = fields.Selection(
        FONT_SIZES,
        string='ขนาดฟอนต์เริ่มต้น',
        config_parameter=DEFAULT_FONT_SIZE_PARAM,
        default='14',
    )
    font_default_line_height = fields.Selection(
        LINE_HEIGHTS,
        string='ความสูงบรรทัดเริ่มต้น',
        config_parameter=DEFAULT_LINE_HEIGHT_PARAM,
        default='1.4',
    )