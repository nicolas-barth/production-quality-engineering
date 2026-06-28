export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  password: string;
}

export function generateUser(overrides?: Partial<UserData>): UserData {
  return {
    firstName: 'Test',
    lastName: 'Automation',
    email: `qa.test+${Date.now()}@example.com`,
    telephone: '+44 20 7946 0958',
    password: 'SecureP@ss123!',
    ...overrides,
  };
}

export function generateGuestEmail(): string {
  return `guest+${Date.now()}@example.com`;
}

/** Boundary test: password too short (should be rejected) */
export const USER_WITH_SHORT_PASSWORD: UserData = {
  ...generateUser(),
  password: 'a',
};

/** Boundary test: no password (should be rejected) */
export const USER_WITH_EMPTY_PASSWORD: UserData = {
  ...generateUser(),
  password: '',
};
