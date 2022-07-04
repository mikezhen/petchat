const gender = ['Male', 'Female'] as const;

export type Gender = typeof gender[number];
