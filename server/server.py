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
from SIR import SIR_result
from SIJR import SIJR_result

define("port", default=8663, help="run on the given port", type=int)
# the path to server html, js, css files
client_file_root_path = os.path.join(os.path.split(__file__)[0], '../client')
client_file_root_path = os.path.abspath(client_file_root_path)


def list_add(a, b):
    c = []
    for i in range(len(a)):
        c.append(a[i] + b[i])
    return c


class SEIR(tornado.web.RequestHandler):
    def get(self):
        models = json.loads(self.get_argument('data'))
        print(models)
        rsp = []
        for model in models:
            # type = json.loads(self.get_argument('type'))
            # params = json.loads(self.get_argument('params'))
            print(model)
            type = model['type']
            params = model['params']
            print(type, params)
            evt_unpacked={}

            if type == 0:
                # coefficient of infection
                beta = params['infectRate']
                # coefficient of recovery
                gamma = params['recoverRate']
                # nb of infectious at the beginning
                I_0 = params['initInfectedNum']
                # nb of recovered at the beginning
                R_0 = params['initRecoverNum']
                S_0 = params['initSusceptibleNum']
                N = S_0 + I_0 + R_0
                # duration
                T = params['duration']
                Susceptible, Infectious, Recovered = SIR_result(N, I_0, R_0, beta, gamma, T)
                evt_unpacked = {'Unknown': Susceptible, 'Infectious': Infectious,
                                'Recovered': Recovered}
            elif type==1:
                # coefficient of infection
                beta = params['infectRate']
                # coefficient of recovery
                gamma = params['recoverRate']
                # coefficient from exposed to infectious
                sigma = params['sigma']
                # nb of infectious at the beginning
                I_0 = params['initInfectedNum']
                # nb of exposed at the beginning
                E_0 = params['initIncubatedNum']
                # nb of recovered at the beginning
                R_0 = params['initRecoverNum']
                S_0 = params['initSusceptibleNum']
                # nb of population
                N = S_0 + I_0 + E_0 + R_0
                # duration
                T = params['duration']
                Susceptible, Exposed, Infectious, Recovered = SEIR_result(N, I_0, E_0, R_0, beta, gamma, sigma, T)
                evt_unpacked = {'Unknown': list_add(Susceptible, Exposed), 'Infectious': Infectious,
                                'Recovered': Recovered}
            else:
                # coefficient of infection
                beta = params['infectRate']
                # coefficient of recovery
                gamma = params['recoverRate']
                # coefficient from exposed to infectious
                sigma = params['sigma']
                mu = params['mu']
                gamma_1 = params['gamma_1']
                gamma_2 = params['gamma_2']
                delta_1 = params['delta_1']
                delta_2 = params['delta_2']

                # nb of infectious at the beginning
                I_0 = params['initInfectedNum']
                # nb of recovered at the beginning
                R_0 = params['initRecoverNum']
                S_0 = params['initSusceptibleNum']
                J_0 = params['initConfirmNum']
                D_0 = params['initDeadNum']
                N = S_0 + I_0 + R_0 + J_0 + D_0
                # duration
                T = params['duration']
                Susceptible, Infectious, Diagnosed, Dead, Recovered = SIJR_result(N, I_0, D_0, R_0, J_0, mu, sigma, beta,
                                                                                  gamma_1, gamma_2, delta_1, delta_2, T)
                evt_unpacked = {'Unknown': list_add(Susceptible, Infectious), 'Infectious': Diagnosed, 'Recovered': list_add(Dead, Recovered)}
            rsp.append(evt_unpacked)

        # evt = json.dumps(evt_unpacked)
        evt = json.dumps(rsp)
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
