const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

module.exports = class Seedr {
  constructor(email, password) {
    this.email = email;
    this.password = password;
    this.token = null;
  }

  // =========================
  // LOGIN (OAuth TOKEN)
  // =========================
  async login() {
    const form = new FormData();
    form.append("grant_type", "password");
    form.append("client_id", "seedr_chrome");
    form.append("type", "login");
    form.append("username", this.email);
    form.append("password", this.password);

    const res = await axios.post(
      "https://www.seedr.cc/oauth_test/token.php",
      form,
      { headers: form.getHeaders() }
    );

    if (!res.data?.access_token) {
      throw new Error("Login failed - no token received");
    }

    this.token = res.data.access_token;

    console.log("🔑 Logged in, token acquired");
    return this.token;
  }

  // =========================
  // AUTH HEADER
  // =========================
  get headers() {
    if (!this.token) throw new Error("Not logged in");
    return {
      Authorization: `Bearer ${this.token}`
    };
  }

  // =========================
  // USER
  // =========================
  async getUser() {
    const res = await axios.get(
      "https://www.seedr.cc/rest/user",
      { headers: this.headers }
    );
    return res.data;
  }

  // =========================
  // FOLDERS
  // =========================
  async getRootFolder() {
    const res = await axios.get(
      "https://www.seedr.cc/rest/folder",
      { headers: this.headers }
    );
    return res.data;
  }

  async getFolder(id) {
    const res = await axios.get(
      `https://www.seedr.cc/rest/folder/${id}`,
      { headers: this.headers }
    );
    return res.data;
  }

  async downloadFolderZip(id, outputPath) {
    const res = await axios.get(
      `https://www.seedr.cc/rest/folder/${id}/download`,
      {
        headers: this.headers,
        responseType: "stream"
      }
    );

    const writer = fs.createWriteStream(outputPath);
    res.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  }

  async createFolder(path) {
    const res = await axios.post(
      "https://www.seedr.cc/rest/folder",
      new URLSearchParams({ path }),
      { headers: this.headers }
    );
    return res.data;
  }

  async renameFolder(id, name) {
    const res = await axios.post(
      `https://www.seedr.cc/rest/folder/${id}/rename`,
      new URLSearchParams({ rename_to: name }),
      { headers: this.headers }
    );
    return res.data;
  }

  async deleteFolder(id) {
    const res = await axios.delete(
      `https://www.seedr.cc/rest/folder/${id}`,
      { headers: this.headers }
    );
    return res.data;
  }

  // =========================
  // FILES
  // =========================
  async downloadFile(fileId, outputPath) {
    const res = await axios.get(
      `https://www.seedr.cc/rest/file/${fileId}`,
      {
        headers: this.headers,
        responseType: "stream"
      }
    );

    const writer = fs.createWriteStream(outputPath);
    res.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  }

  async getFileHLS(fileId) {
    const res = await axios.get(
      `https://www.seedr.cc/rest/file/${fileId}/hls`,
      { headers: this.headers }
    );
    return res.data;
  }

  async getFileImage(fileId, outputPath) {
    const res = await axios.get(
      `https://www.seedr.cc/rest/file/${fileId}/image`,
      {
        headers: this.headers,
        responseType: "stream"
      }
    );

    const writer = fs.createWriteStream(outputPath);
    res.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  }

  async getThumbnail(fileId, outputPath) {
    const res = await axios.get(
      `https://www.seedr.cc/rest/file/${fileId}/thumbnail`,
      {
        headers: this.headers,
        responseType: "stream"
      }
    );

    const writer = fs.createWriteStream(outputPath);
    res.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  }

  async renameFile(id, name) {
    const res = await axios.post(
      `https://www.seedr.cc/rest/file/${id}/rename`,
      new URLSearchParams({ rename_to: name }),
      { headers: this.headers }
    );
    return res.data;
  }

  async deleteFile(id) {
    const res = await axios.delete(
      `https://www.seedr.cc/rest/file/${id}`,
      { headers: this.headers }
    );
    return res.data;
  }

  // =========================
  // TRANSFERS
  // =========================
  async addMagnet(magnet) {
    const res = await axios.post(
      "https://www.seedr.cc/rest/transfer/magnet",
      new URLSearchParams({ magnet }),
      { headers: this.headers }
    );
    return res.data;
  }

  async addURL(url) {
    const res = await axios.post(
      "https://www.seedr.cc/rest/transfer/url",
      new URLSearchParams({ url }),
      { headers: this.headers }
    );
    return res.data;
  }

  async addFile(filePath) {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const res = await axios.post(
      "https://www.seedr.cc/rest/transfer/file",
      form,
      {
        headers: {
          ...this.headers,
          ...form.getHeaders()
        }
      }
    );

    return res.data;
  }

  async getTransfer(id) {
    const res = await axios.get(
      `https://www.seedr.cc/rest/transfer/${id}`,
      { headers: this.headers }
    );
    return res.data;
  }

  async deleteTransfer(id) {
    const res = await axios.delete(
      `https://www.seedr.cc/rest/transfer/${id}`,
      { headers: this.headers }
    );
    return res.data;
  }
};
