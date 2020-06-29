/* Copyright 2019 GTICA.com,.ve - Ing. Henry Vivas
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define('pos_service_time.popups', function(require) {
        "use strict";

        var gui=require('point_of_sale.gui');
        var popup_widget=require("point_of_sale.popups");

        var TimeServicePopup=popup_widget.extend( {
                template:'TimeServicePopup'
            }

        ); gui.define_popup( {
                name:'time_service_popup', widget:TimeServicePopup
            }

        );
    }
);