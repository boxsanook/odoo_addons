from odoo import api, fields, models, tools, _
import datetime
from odoo.addons.point_of_sale.models.pos_order import PosOrder

class ModelposName(models.Model):
    _inherit = "pos.order"
    lock_refund = fields.Char(string='sale contacts type')
    def refund(self):
        refund_config = self.env['pos.config'].search([('id', '=', self.session_id.config_id.id)], limit=1)
        if refund_config.module_pos_refund_multiple == True:
            refund_orders = self.env['pos.order']
            total_len = refund_orders.search_count([('pos_reference', '=', self.pos_reference)])
            if refund_config.module_pos_refund_lock_date == True:
                new_date = refund_config.module_pos_refund_lock_date_number
                date_string = self.date_order
                now = datetime.datetime.now()
                next_day = date_string + datetime.timedelta(days=int(new_date))
                if now > next_day:
                    return self.show_notification("ระบบถูกปิดการทำการคืนเงินย้อนหลัง !!!",
                                                  "ระบบถูกปิดไม่ให้มีการทำการคืนเงินย้อนหลัง " + str(
                                                      new_date) + " วัน ", "warning")
                else:
                    if total_len > 1:
                        return self.show_notification("คุณได้ทำการคืนเงินในระบบแล้ว !!!",
                                                      "เลขที่ใบเสร็จรับเงิน :" + self.pos_reference + "ได้ทำการคืนเงินในระบบแล้ว",
                                                      "danger")
                    else:
                        return PosOrder.refund(self)
            else:
                if total_len > 1:
                    return self.show_notification("คุณได้ทำการคืนเงินในระบบแล้ว !!!",
                                                  "เลขที่ใบเสร็จรับเงิน :" + self.pos_reference + "ได้ทำการคืนเงินในระบบแล้ว",
                                                  "danger")
                else:
                    return PosOrder.refund(self)
        else:
            if refund_config.module_pos_refund_lock_date == True:
                new_date = refund_config.module_pos_refund_lock_date_number
                date_string = self.date_order
                now = datetime.datetime.now()
                next_day = date_string + datetime.timedelta(days=int(new_date))
                if now > next_day:
                    return self.show_notification("ระบบถูกปิดการทำการคืนเงินย้อนหลัง !!!",
                                                  "ระบบถูกปิดไม่ให้มีการทำการคืนเงินย้อนหลัง " + new_date + " วัน ",
                                                  "warning")
                else:
                    return PosOrder.refund(self)
    def show_notification(self, title, Message, type, sticky=True):
        notification = {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': (title),
                'message': Message,
                'type': type,  # types: success,warning,danger,info
                'sticky': sticky,  # True/False will display for few seconds if false
            },
        }
        return notification
