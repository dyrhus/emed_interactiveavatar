interface Demo {
  id: string;
  customerName: string;
  introScript: string;
  outroScript: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage
const demos = new Map<string, Demo>();

export const store = {
  createDemo: (data: Omit<Demo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = Date.now().toString();
    const demo: Demo = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    demos.set(id, demo);
    return demo;
  },

  getDemo: (id: string) => {
    return demos.get(id);
  },

  verifyPassword: (id: string, password: string) => {
    const demo = demos.get(id);
    return demo?.password === password;
  }
};
