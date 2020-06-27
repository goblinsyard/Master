# -*- coding: utf-8 -*-
# Copyright 2019 GTICA C.A. - Ing Henry Vivas

{
    'name': 'POS Service per Time',
    'summary': 'Time Chek-in and check-out, Service payment per hour, minutes',
    'version': '12.0.1.0.0',
    'category': 'Point of Sale',
    'author': 'GTICA C.A',
    'support': 'controlwebmanager@gmail.com',
    'license': 'OPL-1',
    'website': 'https://gtica.online/',
    'sequence': 150,
    'price': 21.99,
    'currency': 'EUR',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'templates/assets.xml',
        'views/pos_service_time_view.xml',
    ],
    'icon': 'static/src/img/icon.png',
    'images': ['static/description/main_screenshot.gif'],
    'qweb': [
        'static/src/xml/pos.xml'
    ],
    'application': False,
    'installable': True,
}
