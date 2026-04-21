const axios = require("axios");
const fs = require("fs");

module.exports = class Seedr {
  constructor(email, password) {
    this.email = email;
    this.password = password;

    this.auth = {
      auth: {
        username: email,
        password: password
      }
    };
  }

  // =========================
  // USER
  // =========================
  async getUser() {
    const res = await axios.get(
      "https://www.seedr.cc/rest/user",
      this.auth
    );

    return res.data;
  }

  // =========================
  // FOLDERS
  // =========================
  async getRootFolder() {
    const res = await axios.get(
      "https://www.seedr.cc/rest/folder",
      this.auth
    );

    return res.data;
  }

  async getFolder(id) {
    const res = await axios.get(
      `https://www.seedr.cc/rest/folder/${id}`,
      this.auth
    );

    return res.data;
  }

  async downloadFolderZip(id, outputPath) {
    const res = await axios.get(
      `https://www.seedr.cc/rest/folder/${id}/download`,
      {
        ...this.auth,
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
      this.auth
    );

    return res.data;
  }

  async renameFolder(id, name) {
    const res = await axios.post(
      `https://www.seedr.cc/rest/folder/${id}/rename`,
      new URLSearchParams({ rename_to: name }),
      this.auth
    );

    return res.data;
  }

  async deleteFolder(id) {
    const res = await axios.delete(
      `https://www.seedr.cc/rest/folder/${id}`,
      this.auth
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
        ...this.auth,
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
      this.auth
    );

    return res.data;
  }

  async getFileImage(fileId) {
    const res = await axios.get(
      `https://www.seedr.cc/rest/file/${fileId}/image`,
      {
        ...this.auth,
        responseType: "stream"
      }
    );

    return res.data;
  }

  async getThumbnail(fileId, outputPath) {
    const res = await axios.get(
      `https://www.seedr.cc/rest/file/${fileId}/thumbnail`,
      {
        ...this.auth,
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
      this.auth
    );

    return res.data;
  }

  async deleteFile(id) {
    const res = await axios.delete(
      `https://www.seedr.cc/rest/file/${id}`,
      this.auth
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
      this.auth
    );

    return res.data;
  }

  async addURL(url) {
    const res = await axios.post(
      "https://www.seedr.cc/rest/transfer/url",
      new URLSearchParams({ url }),
      this.auth
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
        ...this.auth,
        headers: form.getHeaders()
      }
    );

    return res.data;
  }

  async getTransfer(id) {
    const res = await axios.get(
      `https://www.seedr.cc/rest/transfer/${id}`,
      this.auth
    );

    return res.data;
  }

  async deleteTransfer(id) {
    const res = await axios.delete(
      `https://www.seedr.cc/rest/transfer/${id}`,
      this.auth
    );

    return res.data;
  }
};
