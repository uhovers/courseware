"use strict";
const fs = require("fs");
const path = require("path");
const Q = require("q")
const manage = require("./Manage")
class ReplaceSameFile {
    constructor() {
        this.config_file_path = path.resolve(manage.origin, "..", "samefile.json");
        this.config = manage.readJsonFile(this.config_file_path);
        this.task_array = [];
        this.new_config = {};
    }
    replace() {
        return Q.Promise((resolve, reject) => {
            let __replace = () => {
                return Q.Promise((resolve, reject) => {
                    let obj = this.task_array.pop();
                    if (obj) {
                        let path_array = this.new_config[obj["old"]]
                        if (path_array) {
                            let buffer = fs.readFileSync(obj["path"]);
                            Editor.log("old path:" + manage.realPathToAssetDB(obj["path"]))
                            let __write = () => {
                                return Q.Promise((resolve, reject) => {
                                    let flile = path_array.pop();
                                    if (flile) {
                                        fs.writeFileSync(flile, buffer);
                                        let uuid = manage.getUUID(flile + ".meta")[1];
                                        this.config[uuid] = obj["new"];
                                        manage.writeJsonToFile(this.config_file_path, this.config)
                                        Editor.log("replace : " + manage.realPathToAssetDB(flile));
                                        Editor.assetdb.refresh(manage.realPathToAssetDB(flile), () => {
                                            __write(() => {
                                                resolve();
                                            }).done();
                                        });
                                    } else {
                                        resolve();
                                    }
                                })
                            }
                            __write(() => {
                                __replace().then(() => { resolve() }).done();
                            }).done();
                        } else {
                            __replace().then(() => { resolve() }).done();
                        }
                    } else {
                        resolve();
                    }
                })
            }
            __replace().then(() => {
                resolve();
            }).done();
        })
    }
    play(isReplace) {
        let __recursionDir = (dir) => {
            if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
                return;
            }
            else {
                let files = fs.readdirSync(dir);
                for (let i = 0, length = files.length; i < length; ++i) {
                    let file = path.resolve(dir, files[i]);
                    if (fs.statSync(file).isDirectory()) {
                        __recursionDir(file);
                    }
                    else {
                        if (file.match(/[.]jpg$|[.]png$/)) { //以 jpg png 结尾的图片
                            let uuid = manage.getUUID(file + ".meta")[1];
                            let md5 = manage.readFileMD5(file);
                            if (!isReplace) { // 不压缩 存入md5
                                this.config[uuid] = md5;
                            } else {
                                if (this.new_config[md5]) {
                                    this.new_config[md5].push(file);
                                } else {
                                    this.new_config[md5] = [file];
                                }
                                if (this.config[uuid] && this.config[uuid] != md5) {//发生改变
                                    this.task_array.push({ "old": this.config[uuid], "path": file, "new": md5 });
                                }
                                this.config[uuid] = md5;
                                manage.writeJsonToFile(this.config_file_path, this.config)
                            }
                        }
                    }
                }
            }
        }
        __recursionDir(path.resolve(manage.origin, "Texture"));
        Editor.log(this.task_array);
        Editor.log(this.new_config);
        this.replace().then(() => {
            manage.writeJsonToFile(this.config_file_path, this.config)
            manage.working = false
            Editor.log(" end ")
        }, () => {
            manage.working = false
            Editor.log(" err ")
        }).done();
    }
}
module.exports = new ReplaceSameFile();