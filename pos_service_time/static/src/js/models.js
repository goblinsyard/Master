/* Copyright 2019 GTICA.com,.ve - Ing. Henry Vivas
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define('pos_sservice_time.models', function(require) {
    "use strict";

    var rpc = require('web.rpc')
    var models = require("point_of_sale.models");
    var core = require('web.core');
    var _t = core._t;
    var SuperOrderline = models.Orderline.prototype;

    models.load_fields('product.product', 'service_time_type');
    models.load_fields('product.product', 'variant_name');
    models.load_fields('product.product', 'check_time_ticket');

    rpc.query({
            model: 'product.product',
            method: 'get_variant_product',
            args: [{ }]
        }).then(function (returned_value) {
            // do something
        });

    models.Orderline = models.Orderline.extend({
        initialize: function(attr, options) {
            SuperOrderline.initialize.call(this, attr, options);
            this.time_init = false;
            this.time_end = false;
            this.usage_time = "00:00:00";
            this.start = null;
            this.stop = null;
            if (options.json) {
                this.time_init = options.json.time_init;
                this.time_end = options.json.time_end;
                this.usage_time = options.json.usage_time;
                this.start = options.json.start;
                this.stop = options.json.stop;
            }
        },
        can_be_merged_with: function(orderline) {
            var self = this;

            if (orderline.product.time_service_hr || orderline.product.time_service_mint)
                console.log(orderline.product)
                return false;
            return SuperOrderline.can_be_merged_with.call(this, orderline);
        },
        export_as_JSON: function() {
            var dict = SuperOrderline.export_as_JSON.call(this);
            dict.time_init = this.time_init;
            dict.time_end = this.time_end;
            dict.usage_time = this.usage_time;
            dict.start = this.start;
            dict.stop = this.stop;
            return dict;
        },
        set_quantity: function(quantity, keep_price) {
            var self = this;
            if (!this.time_init)
                SuperOrderline.set_quantity.call(this, quantity, keep_price);
            else {
                self.pos.gui.show_popup('time_service_popup', {
                    'title': _t('Movement not allowed'),
                    'body': _t("You cannot make changes to a service in use"),
                });
            }
        },
    });
});