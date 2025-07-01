import mockFarms from '@/services/mockData/farms.json';

let farms = [...mockFarms];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const farmService = {
  async getAll() {
    await delay(300);
    return [...farms];
  },

  async getById(id) {
    await delay(200);
    const farm = farms.find(f => f.Id === parseInt(id));
    if (!farm) throw new Error('Farm not found');
    return { ...farm };
  },

  async create(farmData) {
    await delay(400);
    const newId = Math.max(...farms.map(f => f.Id), 0) + 1;
    const newFarm = {
      Id: newId,
      ...farmData,
      createdAt: farmData.createdAt || new Date().toISOString()
    };
    farms.push(newFarm);
    return { ...newFarm };
  },

  async update(id, updates) {
    await delay(350);
    const index = farms.findIndex(f => f.Id === parseInt(id));
    if (index === -1) throw new Error('Farm not found');
    
    farms[index] = { ...farms[index], ...updates };
    return { ...farms[index] };
  },

  async delete(id) {
    await delay(250);
    const index = farms.findIndex(f => f.Id === parseInt(id));
    if (index === -1) throw new Error('Farm not found');
    
    farms.splice(index, 1);
    return true;
  }
};