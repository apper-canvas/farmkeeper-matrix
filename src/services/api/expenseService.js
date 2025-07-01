import mockExpenses from '@/services/mockData/expenses.json';

let expenses = [...mockExpenses];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const expenseService = {
  async getAll() {
    await delay(300);
    return [...expenses];
  },

  async getById(id) {
    await delay(200);
    const expense = expenses.find(e => e.Id === parseInt(id));
    if (!expense) throw new Error('Expense not found');
    return { ...expense };
  },

  async create(expenseData) {
    await delay(400);
    const newId = Math.max(...expenses.map(e => e.Id), 0) + 1;
    const newExpense = {
      Id: newId,
      ...expenseData
    };
    expenses.push(newExpense);
    return { ...newExpense };
  },

  async update(id, updates) {
    await delay(350);
    const index = expenses.findIndex(e => e.Id === parseInt(id));
    if (index === -1) throw new Error('Expense not found');
    
    expenses[index] = { ...expenses[index], ...updates };
    return { ...expenses[index] };
  },

  async delete(id) {
    await delay(250);
    const index = expenses.findIndex(e => e.Id === parseInt(id));
    if (index === -1) throw new Error('Expense not found');
    
    expenses.splice(index, 1);
    return true;
  }
};