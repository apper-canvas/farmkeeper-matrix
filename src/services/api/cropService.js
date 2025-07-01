import mockCrops from '@/services/mockData/crops.json';

let crops = [...mockCrops];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const cropService = {
  async getAll() {
    await delay(300);
    return [...crops];
  },

  async getById(id) {
    await delay(200);
    const crop = crops.find(c => c.Id === parseInt(id));
    if (!crop) throw new Error('Crop not found');
    return { ...crop };
  },

  async create(cropData) {
    await delay(400);
    const newId = Math.max(...crops.map(c => c.Id), 0) + 1;
    const newCrop = {
      Id: newId,
      ...cropData
    };
    crops.push(newCrop);
    return { ...newCrop };
  },

  async update(id, updates) {
    await delay(350);
    const index = crops.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error('Crop not found');
    
    crops[index] = { ...crops[index], ...updates };
    return { ...crops[index] };
  },

  async delete(id) {
    await delay(250);
    const index = crops.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error('Crop not found');
    
    crops.splice(index, 1);
    return true;
  }
};