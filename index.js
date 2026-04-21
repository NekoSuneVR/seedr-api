const axios = require("axios");
const FormData = require("form-data");

module.exports = class Seedr {
  constructor() {
    this.token = null;
  }

  async login(username, password) {
    const data = new FormData();

    data.append("grant_type", "password");
    data.append("client_id", "seedr_chrome");
    data.append("type", "login");
    data.append("username", username);
    data.append("password", password);

    const res = await axios.post(
      "https://www.seedr.cc/oauth_test/token.php",
      data,
      { headers: data.getHeaders() }
    );

    this.token = res.data.access_token;
    this.rft = res.data.refresh_token;

    return this.token;
  }

  async addMagnet(magnet) {
    const data = new FormData();

    data.append("access_token", this.token);
    data.append("func", "add_torrent");
    data.append("torrent_magnet", magnet);

    const res = await axios.post(
      "https://www.seedr.cc/oauth_test/resource.php",
      data,
      { headers: data.getHeaders() }
    );

    return res.data;
  }

  // 🚀 FAST VERSION (FIXED)
  async getVideos() {
    const root = await axios.get(
      `https://www.seedr.cc/api/folder?access_token=${this.token}`
    );

    const folders = root.data.folders || [];

    const results = await Promise.all(
      folders.map(async (folder) => {
        const res = await axios.get(
          `https://www.seedr.cc/api/folder/${folder.id}?access_token=${this.token}`
        );

        return (res.data.files || [])
          .filter(f => f.play_video)
          .map(f => ({
            fid: folder.id,
            id: f.folder_file_id,
            name: f.name
          }));
      })
    );

    return results.flat();
  }

  // 🚀 FULL FILE LIST (FAST + CLEAN)
  async getFilesById(id = null) {
    const url = id
      ? `https://www.seedr.cc/api/folder/${id}?access_token=${this.token}`
      : `https://www.seedr.cc/api/folder?access_token=${this.token}`;

    const data = await axios.get(url);

    const d = data.data;

    const res = {
      parentId: d.parent !== -1 ? d.parent : null,
      name: d.name,
      folderSize: 0,
      totalStorage: d.space_max,
      usedStorage: d.space_used,
      type: d.type,
      files: [],
      activeTorrents: d.torrents
    };

    for (const folder of d.folders || []) {
      res.files.push({
        id: folder.id,
        type: "folder",
        name: folder.name,
        size: folder.size
      });

      if (folder.size) {
        res.folderSize += parseInt(folder.size);
      }
    }

    for (const file of d.files || []) {
      res.files.push({
        id: file.folder_file_id,
        type: "file",
        name: file.name,
        size: file.size
      });

      if (file.size) {
        res.folderSize += parseInt(file.size);
      }
    }

    return res;
  }

  async getFile(id) {
    const data = new FormData();

    data.append("access_token", this.token);
    data.append("func", "fetch_file");
    data.append("folder_file_id", id);

    const res = await axios.post(
      "https://www.seedr.cc/oauth_test/resource.php",
      data,
      { headers: data.getHeaders() }
    );

    return res.data;
  }

  async rename(id, newName) {
    const data = new FormData();

    data.append("access_token", this.token);
    data.append("func", "rename");
    data.append("rename_to", newName);
    data.append("file_id", id);

    const res = await axios.post(
      "https://www.seedr.cc/oauth_test/resource.php",
      data,
      { headers: data.getHeaders() }
    );

    return res.data;
  }

  async deleteFolder(id) {
    const data = new FormData();

    data.append("access_token", this.token);
    data.append("func", "delete");
    data.append(
      "delete_arr",
      JSON.stringify([{ type: "folder", id }])
    );

    const res = await axios.post(
      "https://www.seedr.cc/oauth_test/resource.php",
      data,
      { headers: data.getHeaders() }
    );

    return res.data;
  }

  async deleteFile(id) {
    const data = new FormData();

    data.append("access_token", this.token);
    data.append("func", "delete");
    data.append(
      "delete_arr",
      JSON.stringify([{ type: "file", id }])
    );

    const res = await axios.post(
      "https://www.seedr.cc/oauth_test/resource.php",
      data,
      { headers: data.getHeaders() }
    );

    return res.data;
  }
};
