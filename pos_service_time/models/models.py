# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo import tools, _
from odoo.exceptions import ValidationError
import logging
from pprint import pprint,pformat
import requests
import pdb


_logger = logging.getLogger(__name__)

TIME_TYPE_SERVICE = [('hour', 'per Hour'),('minute', 'per Minute')]


class PosServiceTimePosConfig(models.Model):
    _inherit = 'pos.config'

    check_time_ticket = fields.Boolean(string='Time Service in Ticket')

class PosServiceTimeProductProduct(models.Model):
    _inherit = 'product.product'

    service_time_type = fields.Selection(TIME_TYPE_SERVICE, related="product_tmpl_id.service_time_type")
    variant_name = fields.Char("Variant Name", compute="get_variant_product", store=True)

    @api.multi
    def get_variant_product(self):

        for record in self.search([]):
            for record_two in record.product_template_attribute_value_ids:

                record.variant_name = record_two.name

class PosServiceTimeProductTemplate(models.Model):
    _inherit = 'product.template'

    service_time_type = fields.Selection(TIME_TYPE_SERVICE, string="Service Time")

    #Dont not working for this APP
    @api.onchange('time_service_hr', 'time_service_mint')
    def _onchange_time_service_hr(self):

        if self.time_service_hr == True & self.time_service_mint == True:
            raise ValidationError(_('You can only choose a format for the service time, Hours or Minutes.'))

class PosOrderServiceTime(models.Model):
    _inherit = 'pos.order.line'

    usage_time = fields.Char("Usage time")
