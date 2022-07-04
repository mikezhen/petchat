const mass = ['lb', 'kg'] as const;

export type MassUnit = typeof mass[number];
