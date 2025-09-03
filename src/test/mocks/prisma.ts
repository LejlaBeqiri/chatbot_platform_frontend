const prisma = {
  chatbot: {
    findUnique: jest.fn(),
  },
  tenant: {
    findUnique: jest.fn(),
  },
};

export default prisma;
