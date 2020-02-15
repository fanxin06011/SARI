#! /usr/bin/python
# -*- coding:utf-8 -*-

import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
from tornado.options import define, options
import json
import os

from SEIR import SEIR_result

define("port", default=8663, help="run on the given port", type=int)
# the path to server html, js, css files
client_file_root_path = os.path.join(os.path.split(__file__)[0], '../client')
client_file_root_path = os.path.abspath(client_file_root_path)


class SEIR(tornado.web.RequestHandler):
    def get(self):
        params = json.loads(self.get_argument('params'))
        print(params)
        # nb of population
        N = params['peopleNum']
        # coefficient of infection
        beta = params['infectRate']
        # coefficient of recovery
        gamma = params['recoverRate']
        # time from exposed to infectious
        Te = params['incubateTime']
        # nb of infectious at the beginning
        I_0 = params['initInfectedNum']
        # nb of exposed at the beginning
        E_0 = params['initIncubatedNum']
        # nb of recovered at the beginning
        R_0 = params['initRecoverNum']
        # duration
        T = params['duration']
        Susceptible, Exposed, Infectious, Recovered = SEIR_result(N, I_0, E_0, R_0, beta, gamma, Te, T)
        evt_unpacked = {'Susceptible': Susceptible,'Exposed':Exposed,'Infectious':Infectious,'Recovered':Recovered}
        evt = json.dumps(evt_unpacked)
        self.write(evt)


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r'/SEIR', SEIR),

            (r'/(.*)', tornado.web.StaticFileHandler, {'path': client_file_root_path, 'default_filename': 'index.html'})
            # fetch client files
        ]

        settings = {
            'static_path': 'static',
            'debug': True
        }

        tornado.web.Application.__init__(self, handlers, **settings)


if __name__ == '__main__':
    tornado.options.parse_command_line()
    print('server running at 127.0.0.1:%d ...' % (tornado.options.options.port))

    app = Application()
    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
