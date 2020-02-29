import scipy.integrate as spi
import numpy as np
import matplotlib.pyplot as plt

def SIJR_result(N, I_0, D_0, R_0, J_0, mu, alpha, beta, gamma_1, gamma_2, delta_1, delta_2, T):

    S_0 = N - I_0 - R_0 - D_0 - J_0

    INI = (S_0, I_0, J_0, D_0, R_0)

    T_range = np.arange(0, T+1)

    def funcSIJR(initvalue, _):
        Y = np.zeros(5)
        X = initvalue

        # change of susceptible
        Y[0] = -beta * (X[1] + mu * X[2]) * X[0] / N
        # change of exposed
        Y[1] = beta * (X[1] + mu * X[2]) * X[0] / N - (alpha + gamma_1 + delta_1) * X[1]
        # change of infectious
        Y[2] = alpha * X[1] - (gamma_2 + delta_2) * X[2]
        # change of recovered
        Y[3] = delta_1 * X[1] + delta_2 * X[2]
        #
        Y[4] = gamma_1 * X[1] + gamma_2 * X[2]
        return Y

    RES = spi.odeint(funcSIJR, INI, T_range)
    return RES[:, 0].tolist(), RES[:, 1].tolist(), RES[:, 2].tolist(), RES[:, 3].tolist(), RES[:, 4].tolist()

############################# Example

# nb of population
N = 10000

#
mu = 0.1

#
alpha = 1 / 14

#
delta_2 = 0.0001
delta_1 = 0.05

# coefficient of infection
beta = 0.6

# coefficient of recovery
gamma_1 = 0.0001
gamma_2 = 1/40

# nb of infectious at the beginning
I_0 = 1

# nb of dead at the beginning
D_0 = 0

# nb of recovered at the beginning
R_0 = 0

# nb of Diagnosed at the beginning
J_0 = 0

# nb of susceptible at the beginning
S_0 = N - I_0 - R_0 - D_0 - J_0

# duration
T = 150

Susceptible, Infectious, Diagnosed, Dead, Recovered = SIJR_result(N, I_0, D_0, R_0, J_0, mu, alpha, beta, gamma_1, gamma_2, delta_1, delta_2, T)

# plt.plot(Susceptible, color='darkblue', label='Susceptible', marker='.')
# plt.plot(Infectious, color='orange', label='Infectious', marker='.')
# plt.plot(Diagnosed, color='red', label='Diagnosed', marker='.')
# plt.plot(Dead, color='black', label='Dead', marker='.')
# plt.plot(Recovered, color='green', label='Recovered', marker='.')
# plt.title('SIJR Model')
# plt.legend()
# plt.xlabel('Day')
# plt.ylabel('Number')
# plt.show()
