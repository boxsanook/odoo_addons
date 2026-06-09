from odoo import api, fields, models, tools, _
class posconfigrefund(models.Model):
    _inherit = 'pos.config'
    module_pos_refund_multiple = fields.Boolean(config_parameter='lock_refund_orders.module_pos_refund_multiple',string="Turn off multiple refunds",
                                                help="Turn off multiple refunds" )
    module_pos_refund_lock_date = fields.Boolean( config_parameter='lock_refund_orders.module_pos_refund_lock_date',string="Turn off retrospective refunds.",
                                                 help="Turn off retrospective refunds." )
    module_pos_refund_lock_date_number = fields.Integer(string='The number of days in which a refund can be made retrospectively.' ,default=1 )
