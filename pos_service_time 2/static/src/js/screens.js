/* Copyright 2019 GTICA.com,.ve - Ing. Henry Vivas
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define('pos_sale_cronometer.screens', function(require) {
    "use strict";
    var screens = require("point_of_sale.screens");
    var core = require('web.core');
    var _t = core._t;
    screens.ActionpadWidget.include({
        renderElement: function() {
            var self = this;
            this._super();
            this.$('.pay').off("click");
            this.$('.pay').click(function() {
                if (!self.pos.chrome.screens.products.order_widget.time_process()) {
                    var order = self.pos.get_order();
                    var has_valid_product_lot = _.every(order.orderlines.models, function(line) {
                        return line.has_valid_product_lot();
                    });
                    if (!has_valid_product_lot) {
                        self.gui.show_popup('confirm', {
                            'title': _t('Empty Serial/Lot Number'),
                            'body': _t('One or more product(s) required serial/lot number.'),
                            confirm: function() {
                                self.gui.show_screen('payment');
                            },
                        });
                    } else {
                        self.gui.show_screen('payment');
                    }
                } else {
                    self.gui.show_popup('time_service_popup', {
                        'title': _t('Time Service in use'),
                        'body': _t("You must stop the current process before moving on to the next screen."),
                    });
                }
            });
        },
    });
    screens.OrderWidget.include({
        update_summary: function() {
            this._super();
            if (this.time_process()) {
                this.el.querySelector('.summary .total > .value').innerHTML = "<span class='spinner'><div class='bounce1'></div><div class='bounce2'></div><div class='bounce3'></div></span><i class='fa fa-clock-o' aria-hidden='true'></i>";
                this.el.querySelector('.summary .total .subentry .value').textContent = "---";
            }
        },
        time_process: function() {
            var order = this.pos.get_order();
            var lines = order.get_orderlines();
            var ongoing = false;
            _.each(lines, line => {
                if (line.time_init) {
                    ongoing = true;
                    return true;
                }
            });
            return ongoing;
        },
        action_play: function(orderline) {
            var self = this;
            orderline.time_init = true;
            orderline.time_end = false;
            this.rerender_orderline(orderline);
            this.update_summary();

            if (!orderline.start)
                orderline.start = new Date;
            else if (orderline.stop) {
                orderline.start = new Date(new Date - (new Date(orderline.stop) - new Date(orderline.start)));
                orderline.stop = null;
            } else
                orderline.start = new Date(orderline.start);
                orderline.timer_interval = setInterval(function() {
                self.time_update(orderline)
            }, 1000);

        },
        time_update: function(orderline) {
            var total_seconds = (new Date - orderline.start) / 1000;
            var hours = Math.floor(total_seconds / 3600);
            total_seconds = total_seconds % 3600;
            var minutes = Math.floor(total_seconds / 60);
            total_seconds = total_seconds % 60;
            var seconds = Math.floor(total_seconds);
            hours = (hours < 10 ? "0" : "") + hours;
            minutes = (minutes < 10 ? "0" : "") + minutes;
            seconds = (seconds < 10 ? "0" : "") + seconds;
            var currentTimeString = hours + ":" + minutes + ":" + seconds;
            orderline.usage_time = currentTimeString;
            var node = orderline.node;
            $(node).find(".pst-timer").text(currentTimeString);
        },
        action_stop: function(orderline) {
            clearInterval(orderline.timer_interval);
            orderline.time_end = true;
            orderline.time_init = false;
            orderline.stop = new Date;

            this.pos.get_order().save_to_db();
            var duration = orderline.usage_time;
            var hours = parseInt(duration.split(":")[0]);
            var minutes = parseInt(duration.split(":")[1]);
            var seconds = parseInt(duration.split(":")[2]);
            var minute_timer = (hours * 60) + minutes;
            var regex = /[+-]?\d+(?:\.\d+)?/g;
            var variant_name = orderline.product.variant_name;
            var number_variant = variant_name ? variant_name.match(regex) : false;
            var quantity_service;

             if(minute_timer > 0 && seconds >= 0 ){
                if (orderline.product.service_time_type == 'hour') {
                    let hours_end = (hours == 0 ? hours + 1 : hours )
                    orderline.set_quantity(hours_end);
                } else {
                    if (variant_name) {
                        let quantity_service_round_up = Math.round((minute_timer / number_variant[0])+0.369);
                        quantity_service = quantity_service_round_up == 0 ? 1 : quantity_service_round_up;
                        orderline.set_quantity(quantity_service);
                    } else {
                        orderline.set_quantity(minute_timer);
                    }
                }
             }
            this.pos.get_order().save_to_db();
            this.rerender_orderline(orderline);
            this.update_summary();
        },
        click_line: function(orderline, event) {
            var self = this;
            self._super(orderline, event)
            if ($(event.target).hasClass('fa-play-circle-o'))
                this.action_play(orderline);
            else if ($(event.target).hasClass('fa-stop-circle-o'))
                this.action_stop(orderline);
        },
        render_orderline: function(orderline) {
            var self = this;
            var el_node = this._super(orderline);

            this.$action_play_switch = $(el_node).find(".spt-checkin");
            this.$action_stop_switch = $(el_node).find(".spt-checkout");
            this.$line_info = $(el_node).find("li.info");
            this.$timer = $(el_node).find(".spt-timer");

            return el_node;
        },
    });
});;