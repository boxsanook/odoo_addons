# -*- coding: utf-8 -*-
# Copyright 2023 boxs.me - https://www.boxs.me
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    'name': 'Turn off multiple refunds and retrospective refunds.',
    'version': '14+3.0.1.0.0',
    'author': 'Boxs.Me',
    'description': """
    Turn off multi-refund and point-of-sale retroactive refunds so that they can be returned by a specific date.
    """,
    'summary': """Turn off multi-refund and point-of-sale retroactive refunds so that they can be returned by a specific date.""",
    'category': 'Tools',
    'website': 'https://www.boxs.me',
    'depends': [
        'point_of_sale',
    ],
    'data': [
         'views/pos_config_views.xml',
    ],
    'images': [
        'static/description/cover.gif'
    ],
    'installable': True,
    'auto_install': False,
    'license': 'OPL-1',
    'installable': True,
    'application': True,
    'auto_install': False,
    'currency': 'USD',
    'price': 25.00,
}
