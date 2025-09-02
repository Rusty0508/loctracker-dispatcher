import axios from 'axios';

export class LocTrackerService {
  constructor(apiUrl, username, password) {
    this.apiUrl = apiUrl;
    this.username = username;
    this.password = password;
    
    this.axios = axios.create({
      baseURL: apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      }
    });
  }

  buildUrl(path) {
    return `/${this.username}/${path}${path.includes('?') ? '&' : '?'}password=${encodeURIComponent(this.password)}`;
  }

  async request(method, path, data = null) {
    try {
      const url = this.buildUrl(path);
      const response = await this.axios.request({
        method,
        url,
        data: data ? { ...data, password: this.password } : null
      });

      if (response.data.errorCode) {
        throw new Error(`API Error ${response.data.errorCode}: ${response.data.errorDescription}`);
      }

      return response.data;
    } catch (error) {
      if (error.response?.data?.errorDescription) {
        throw new Error(error.response.data.errorDescription);
      }
      throw error;
    }
  }

  // Основные методы API
  async getDevices() {
    const result = await this.request('GET', 'devices');
    return result.devices || result;
  }

  async getPositions() {
    const result = await this.request('GET', 'positions');
    return result.positions || result;
  }

  async getActivities(latestRecordId = -1, devices = null, types = null) {
    let path = `activities?latestRecordId=${latestRecordId}`;
    if (devices) path += `&devices=${devices.join(';')}`;
    if (types) path += `&types=${types.join(';')}`;
    
    const result = await this.request('GET', path);
    return result.activities || result;
  }

  async getDeviceTasks(deviceNumber) {
    const result = await this.request('GET', `tasks/${deviceNumber}/trip`);
    return result.tasks || result;
  }

  async getActiveTask(deviceNumber) {
    const result = await this.request('GET', `tasks/${deviceNumber}/active`);
    return result.task || result;
  }

  async addTask(deviceNumber, task) {
    return await this.request('POST', `tasks/${deviceNumber}/last`, task);
  }

  async deletePendingTasks(deviceNumber) {
    return await this.request('DELETE', `tasks/${deviceNumber}/pending`);
  }

  async sendMessage(deviceNumber, message) {
    return await this.request('POST', `messages/${deviceNumber}`, { message });
  }

  async getPeriodSummary(deviceNumber, from, to) {
    const fromMs = typeof from === 'string' ? new Date(from).getTime() : from;
    const toMs = typeof to === 'string' ? new Date(to).getTime() : to;
    
    const result = await this.request('GET', `reports/period-summary/${deviceNumber}?from=${fromMs}&to=${toMs}`);
    return result.summary || result;
  }

  async getFleetState() {
    const result = await this.request('GET', 'fleet/state');
    return result.state || result;
  }

  async getDeviceGroups() {
    const result = await this.request('GET', 'devices/groups');
    return result.groups || result;
  }
}