import mockTasks from '@/services/mockData/tasks.json';

let tasks = [...mockTasks];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const taskService = {
  async getAll() {
    await delay(300);
    return [...tasks];
  },

  async getById(id) {
    await delay(200);
    const task = tasks.find(t => t.Id === parseInt(id));
    if (!task) throw new Error('Task not found');
    return { ...task };
  },

  async create(taskData) {
    await delay(400);
    const newId = Math.max(...tasks.map(t => t.Id), 0) + 1;
    const newTask = {
      Id: newId,
      ...taskData
    };
    tasks.push(newTask);
    return { ...newTask };
  },

  async update(id, updates) {
    await delay(350);
    const index = tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Task not found');
    
    tasks[index] = { ...tasks[index], ...updates };
    return { ...tasks[index] };
  },

  async delete(id) {
    await delay(250);
    const index = tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Task not found');
    
    tasks.splice(index, 1);
    return true;
  }
};