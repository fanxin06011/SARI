import scipy.integrate as spi
import numpy as np

############## input ####################
# N: nb of population
# I_0: nb of infectious at the beginning
# E_0: nb of exposed at the beginning
# R_0: nb of recovered at the beginning
# beta: coefficient of infection
# gamma: coefficient of recovery
# Te: time from exposed to infectious
# T: duration


############# output #####################
# nb of Susceptible, Exposed, Infectious and Recovered each day from day 0 to day T


def SEIR_result(N, I_0, E_0, R_0, beta, gamma, Te, T):

    # nb of susceptible at the beginning
    S_0 = N - I_0 - R_0 - E_0

    # init value
    INI = (S_0, E_0, I_0, R_0)

    # time range
    T_range = np.arange(0, T+1)

    def funcSEIR(initvalue, _):
        Y = np.zeros(4)
        X = initvalue

        # change of susceptible
        Y[0] = -(beta * X[0] * X[2]) / N
        # change of exposed
        Y[1] = (beta * X[0] * X[2]) / N - X[1] / Te
        # change of infectious
        Y[2] = X[1] / Te - gamma * X[2]
        # change of recovered
        Y[3] = gamma * X[2]
        return Y

    RES = spi.odeint(funcSEIR, INI, T_range)
    return RES[:, 0].tolist(), RES[:, 1].tolist(), RES[:, 2].tolist(), RES[:, 3].tolist()


############## Example ###################3
# nb of population
N = 10000

# coefficient of infection
beta = 0.6

# coefficient of recovery
gamma = 0.1

# time from exposed to infectious
Te = 14

# nb of infectious at the beginning
I_0 = 1

# nb of exposed at the beginning
E_0 = 0

# nb of recovered at the beginning
R_0 = 0

# duration
T = 150

Susceptible, Exposed, Infectious, Recovered = SEIR_result(N, I_0, E_0, R_0, beta, gamma, Te, T)


