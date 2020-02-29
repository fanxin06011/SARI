import scipy.integrate as spi
import numpy as np


############## input ####################
# N: nb of population
# I_0: nb of infectious at the beginning
# R_0: nb of recovered at the beginning
# beta: coefficient of infection
# gamma: coefficient of recovery
# T: duration


############# output #####################
# nb of Susceptible, Infectious and Recovered each day from day 0 to day T


def SIR_result(N, I_0, R_0, beta, gamma, T):
    # nb of susceptible at the beginning
    S_0 = N - I_0 - R_0

    # init value
    INI = (S_0, I_0, R_0)

    # time range
    T_range = np.arange(0, T + 1)

    def funcSIR(initvalue, _):
        Y = np.zeros(3)
        X = initvalue

        # change of susceptible
        Y[0] = -(beta * X[0] * X[1]) / N
        # change of infectious
        Y[1] = (beta * X[0] * X[1]) / N - gamma * X[1]
        # change of recovered
        Y[2] = gamma * X[1]

        return Y

    RES = spi.odeint(funcSIR, INI, T_range)

    return RES[:, 0].tolist(), RES[:, 1].tolist(), RES[:, 2].tolist()


############## Example ###################
# nb of population
N = 10000

# probability of infection
beta = 0.6

# coeff of recovery
gamma = 0.1

# nb of infectious at the beginning
I_0 = 1

# nb of recovered at the beginning
R_0 = 0

# duration
T = 150

Susceptible, Infectious, Recovered = SIR_result(N, I_0, R_0, beta, gamma, T)




