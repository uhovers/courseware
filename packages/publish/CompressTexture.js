"use strict";
const manage = require("./Manage")
const Q = require("q")
const tinify = require("tinify");
const fs = require("fs");
const path = require("path");
const imagesize = require("image-size")
class CompressTexture {
    constructor() {
        this.task_count = 5; //每次同时压缩数

        this.task_array = [];//需要压缩的图片
        this.num_key = ""; //tinify 数量key值
        //读取文件信息
        this.config_compress_filepath = path.resolve(manage.origin, "..", "cct.json");
        this.config_compress = manage.readJsonFile(this.config_compress_filepath);
        //读取tinify 配置
        this.config_tinify_filepath = path.resolve(manage.origin, "..", "..","..", ".tinify");
        this.config_tinify = manage.readJsonFile(this.config_tinify_filepath);
    }
    compress() {
        return Q.Promise((resolve, reject) => {
            let index = 1;
            let month = new Date().getMonth();
            let new_month = month + "" != this.config_tinify["month"];
            let key = "key" + index;
            this.key = ""
            while (this.config_tinify[key]) {
                this.config_tinify[key + "num"] = new_month ? 500 : this.config_tinify[key + "num"];
                if (!this.config_tinify[key + "num"] && this.config_tinify[key + "num"] != 0) {
                    this.config_tinify[key + "num"] = 500;
                }
                if (this.config_tinify[key + "num"] > this.task_array.length && this.key == "") {
                    this.key = key;
                }
                ++index;
                key = "key" + index;
            }
            this.config_tinify["month"] = month;
            let task = 0;
            let __compress = () => {
                let obj = this.task_array.pop();
                if (obj && fs.existsSync(obj["path"][0])) {
                    ++task;
                    let buffer = fs.readFileSync(obj["path"][0]);
                    let source = tinify.fromBuffer(buffer);
                    Editor.log("please waiting compress: " + manage.realPathToAssetDB(obj["path"][0]));
                    let start_size = fs.statSync(obj["path"][0]).size;
                    source.preserve("copyright", "creation").toFile(obj["path"][0], (err) => {
                        --this.config_tinify[this.key + "num"];
                        manage.writeJsonToFile(this.config_tinify_filepath, this.config_tinify);
                        if (!err) {
                            let nowsize = fs.statSync(obj["path"][0]).size
                            let md5 = manage.readFileMD5(obj["path"][0]);
                            //记录md5
                            this.config_compress[md5] = "1";
                            if (this.remember) {
                                manage.writeJsonToFile(this.config_compress_filepath, this.config_compress);
                            }
                            //log 信息
                            Editor.log(manage.realPathToAssetDB(obj["path"][0]));
                            Editor.log(start_size / 1024 / 1024 + " - " + nowsize / 1024 / 1024 + " " + ((start_size - nowsize) / start_size * 100) + "%");
                            if (this.remember) {
                                Editor.assetdb.refresh(manage.realPathToAssetDB(obj["path"][0]));
                            }
                            let buffer = fs.readFileSync(obj["path"][0]);
                            for (let i = 1; i < obj["path"].length; ++i) {
                                fs.writeFileSync(obj["path"][i], buffer);
                                if (this.remember) {
                                    Editor.assetdb.refresh(manage.realPathToAssetDB(obj["path"][i]));
                                }
                                Editor.log("write compress: " + manage.realPathToAssetDB(obj["path"][i]))
                            }
                        } else {
                            Editor.log(manage.realPathToAssetDB(obj["path"][0]) + "compress is err: " + err);
                        }
                        --task;
                        Editor.log("task_array left: " + this.task_array.length + " task " + task);
                        __compress();
                    })
                } else {
                    if (task == 0 && this.task_array.length == 0) {
                        resolve();
                    }
                }
            }
            tinify.key = this.config_tinify[this.key];
            tinify.validate((err) => {
                if (err) {
                    Editor.log("key is something wrong");
                    reject();
                    return;
                } else {
                    for (let i = 0; i < this.task_count; ++i) {
                        __compress();
                    }
                }
            });
        })
    }
    play(iscompress, dir, remember, callback) {
        this.remember = remember;
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
                            if (!iscompress) { // 不压缩 存入md5
                                this.config_compress[md5] = "1";
                            } else {
                                //需要压缩
                                if (!this.config_compress[md5]) { // md5 属于未压缩
                                    let i = 0;
                                    for (; i < this.task_array.length; ++i) {
                                        if (this.task_array[i]["md5"] == md5) {
                                            this.task_array[i]["uuid"].push(uuid);
                                            this.task_array[i]["path"].push(file);
                                            break;
                                        }
                                    }
                                    if (i >= this.task_array.length) {
                                        this.task_array.push({
                                            "md5": md5,
                                            "uuid": [uuid],
                                            "path": [file]
                                        })
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        //压缩图片
        __recursionDir(dir);
        //压缩
        this.compress().then(() => {
            manage.working = false;
            //记录md5
            this.config_tinify[this.key + "num"] = tinify.compressionCount ? 500 - tinify.compressionCount : this.config_tinify[this.key + "num"];
            manage.writeJsonToFile(this.config_tinify_filepath, this.config_tinify);
            if (remember) {
                manage.writeJsonToFile(this.config_compress_filepath, this.config_compress);
            }
            Editor.log("compres end");
            if (typeof (callback) == "function") {
                callback();
            }
        }, () => {
            manage.working = false;
            Editor.log("compress err")
        }).done()
    }
}
module.exports = new CompressTexture();
