# -*- coding: utf-8 -*-
{
    'name': 'User Font Settings',
    'version': '18.0.1.3.0',
    'summary': 'ปุ่ม ก-/ก+ ใน systray navbar — เปลี่ยน font size บันทึกต่อ user',
    'category': 'Tools',
    'author':   'Anulak Ch.',
    'website':  'https://github.com/boxsanook',
    'depends':  ['web', 'base'],
    'data': [
        'security/ir.model.access.csv',
        'views/res_config_settings_views.xml',
        'views/res_users_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'user_font_settings/static/src/css/font_settings.css',
            'user_font_settings/static/src/js/font_settings_backend.js',
        ],
    },
    'installable':  True,
    'application':  False,
    'auto_install': False,
    'license':      'LGPL-3',
}
