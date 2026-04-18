const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../db.json');

class Collection {
  constructor(name) {
    this.name = name;
  }

  _read() {
    if (!fs.existsSync(DB_PATH)) return { [this.name]: [] };
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const data = JSON.parse(raw || '{}');
    if (!data[this.name]) data[this.name] = [];
    return data;
  }

  _write(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }

  async find(query = {}) {
    const data = this._read();
    let results = data[this.name] || [];
    
    // Simple filter
    Object.keys(query).forEach(key => {
      results = results.filter(item => item[key] === query[key]);
    });
    
    return results;
  }

  async findOne(query) {
    const results = await this.find(query);
    return results[0] || null;
  }

  async findById(id) {
    const results = await this.find({ _id: id });
    return results[0] || null;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const data = this._read();
    const index = data[this.name].findIndex(item => item._id === id);
    if (index === -1) return null;
    
    const updatedItem = { ...data[this.name][index], ...(update.$set || update) };
    data[this.name][index] = updatedItem;
    this._write(data);
    return updatedItem;
  }

  async findByIdAndDelete(id) {
    const data = this._read();
    data[this.name] = data[this.name].filter(item => item._id !== id);
    this._write(data);
    return true;
  }

  async findOneAndDelete(query) {
    const data = this._read();
    const item = await this.findOne(query);
    if (!item) return null;
    data[this.name] = data[this.name].filter(i => i._id !== item._id);
    this._write(data);
    return item;
  }

  // Returns a constructor-like function
  getModel() {
    const self = this;
    const Model = function(data) {
      Object.assign(this, data);
      if (!this._id) this._id = Math.random().toString(36).substr(2, 9);
      
      this.save = async function() {
        const fullData = self._read();
        const index = fullData[self.name].findIndex(i => i._id === this._id);
        const dataToSave = { ...this };
        delete dataToSave.save; // Don't save the function
        
        if (index !== -1) {
          fullData[self.name][index] = dataToSave;
        } else {
          fullData[self.name].push(dataToSave);
        }
        self._write(fullData);
        return this;
      };
    };

    // Attach static methods
    Model.find = this.find.bind(this);
    Model.findOne = this.findOne.bind(this);
    Model.findById = this.findById.bind(this);
    Model.findByIdAndUpdate = this.findByIdAndUpdate.bind(this);
    Model.findByIdAndDelete = this.findByIdAndDelete.bind(this);
    Model.findOneAndDelete = this.findOneAndDelete.bind(this);
    
    return Model;
  }
}

const dbEngine = {
  users: new Collection('users').getModel(),
  profiles: new Collection('profiles').getModel(),
  documents: new Collection('documents').getModel(),
  departments: new Collection('departments').getModel()
};

module.exports = dbEngine;
