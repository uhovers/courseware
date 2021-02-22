"use strict";
const path = require('path');
const fs = require('fs');
const crypto = require("crypto")
const Q = require("q")
require('dotenv').config({ path: path.resolve(__dirname, "..", "..", "..", "..",".env") })
class Manage {
    constructor() {
        this._origin = path.resolve(__dirname, "..", "..", "assets");
        this._working = false;
    }
    get origin() {
        return this._origin;
    }
    set working(value) {
        this._working = value;
    }
    get working() {
        return this._working;
    }
    realPathToAssetDB(realPath) {
		let  re = new RegExp("\\\\","g");
        return realPath.replace(this.origin, "db://assets").replace(re,"/")
    }
    assetDBToRealPath(assetDBPath) {
        return assetDBPath.replace("db://assets", this.origin);
    }
    readFileMD5(filepath) {
        if (!fs.existsSync(filepath)) {
            return;
        }
        let buffer = fs.readFileSync(filepath);
        return crypto.createHash('md5').update(buffer).digest("base64");
    }
    writeJsonToFile(path, obj) {
        fs.writeFileSync(path, JSON.stringify(obj));
    }
    readJsonFile(filePath) {
        if (fs.existsSync(filePath)) {
            let data = fs.readFileSync(filePath).toString();
            if (data) {
                return JSON.parse(data);
            }
        }
        return {};
    }
    //path_ 内文件
    changeBindingUUID(path_ = [], oldUUID = [], newUUID = "", callBack) {
        let _path;
        let index = -1;
        let __changeBindingUUID = () => {
            ++index;
            _path = path_[index];
            if (!_path || !fs.existsSync(_path)) {
                callBack();
                return;
            } else {
                let change = false;
                let buffer = fs.readFileSync(_path);
                let __write = (objTemp) => {
                    if (!objTemp || typeof (objTemp) != "object") {
                        return objTemp;
                    }
                    Object.keys(objTemp).forEach(function (key) {
                        if (key == "__uuid__" || key == "uuid") {
                            if (oldUUID.indexOf(objTemp[key]) != -1 && objTemp[key] != newUUID) {
                                change = true;
                                objTemp[key] = newUUID;
                            }
                        }
                        else {
                            objTemp[key] = __write(objTemp[key]);
                        }
                    });
                    return objTemp;
                }
                let obj = __write(JSON.parse(buffer.toString()));
                if (change) {
                    fs.writeFileSync(_path, JSON.stringify(obj))
                    setTimeout(() => {
                        Editor.assetdb.refresh(this.realPathToAssetDB(_path), () => {
                            __changeBindingUUID();
                        })
                    }, 200)
                } else {
                    __changeBindingUUID();
                }
            }
        }
        __changeBindingUUID();
    }
    getUUID(path) {
        if (!fs.existsSync(path)) {
            return [];
        }
        let buffer = fs.readFileSync(path);
        let UUID = [];
        let __getUUID = (objTemp) => {
            if (!objTemp || typeof (objTemp) != "object") {
                return;
            }
            Object.keys(objTemp).forEach(function (key) {
                if (key == "__uuid__" || key == "uuid") {
                    if (!~UUID.indexOf(objTemp[key])) {
                        UUID.push(objTemp[key]);
                    }
                }
                else {
                    __getUUID(objTemp[key]);
                }
            });
        };
        __getUUID(JSON.parse(buffer.toString()));
        return UUID;
    }
    //拼接路径出现不存在文件夹
    fixpPath(pre, path_array, callBack) { 
        //不存在的文件夹需要创建
        let path_temp = pre;
        let index = -1;
        let __fix_path = () => {
            return Q.Promise((resolve, reject) => {
                ++index;
                let path_ = path_array[index];
                if (path_) {
                    path_temp = path.resolve(path_temp, path_)
                    if (!fs.existsSync(path_temp)) {
                        Editor.assetdb.create(this.realPathToAssetDB(path_temp), undefined, () => {
                            setTimeout(()=>{
                                __fix_path().then(() => {
                                    resolve();
                                });
                            },200)
                        });

                    } else {
                        __fix_path().then(() => {
                            resolve();
                        }).then();
                    }
                } else {
                    resolve()
                }
            })
        }
        __fix_path().then(() => { // 移动文件                                    
            callBack();
        }).done();
    }
}
module.exports = new Manage();