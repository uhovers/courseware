"use strict";
const fs = require("fs");
const path = require("path");
const Q = require("q")
const manage = require("./Manage")
class FileManage {
    constructor() {
        this._scene_path = path.resolve(manage.origin, "Scene");
    }
    iniSceneConfig() {
        this.scene = this.getScene();
        this.scene_uuid = [];
        for (let i = 0, scene; scene = this.scene[i]; ++i) {
            let obj = {};
            obj.scene = scene;
            obj.uuid = manage.getUUID(path.resolve(this._scene_path, scene));
            this.scene_uuid.push(obj);
        }
    }
    getScene() {
        //读取目录
        let files = fs.readdirSync(this._scene_path);
        //取出scene内所有fire
        let scene = [];
        for (let i = 0, length = files.length; i < length; ++i) {
            if (files[i].match(/[.]fire$/)) {
                scene.push(files[i]);
            }
        }
        //排序算法
        let parse = (str) => {
            let result = str.match(/((\d+)-)?(\d+)\.fire/);
            if (!result)
                return 0;
            if (result[2]) {
                return parseInt(result[2]) * 1000 + parseInt(result[3]) - 0;
            }
            else {
                return parseInt(result[3]) * 1000;
            }
        };
        //排序
        scene.sort((pre, next) => {
            return parse(pre) > parse(next) ? 1 : -1;
        });
        return scene;
    }
    sceneManage() { // scene 排序重命名
        return Q.Promise((resolve, reject) => {
            let scene = this.getScene();
            this.scene = scene;
            let index = -1;
            let __rename = () => {
                ++index;
                if (scene.length <= index) {
                    resolve();
                } else if (scene[index] == "lesson" + (index + 1) + ".fire") { // 名字不需要更改
                    __rename();
                } else {
                    let new_name = "lesson" + (index + 1) + ".fire";
                    let index_temp = scene.indexOf(new_name);
                    if (index_temp != -1) { // 已经存在新名字文件了 文件取个临时名字
                        let times = 1;
                        let name_temp = "temp_1_" + times + ".fire";
                        while (scene.indexOf(name_temp) != -1) {
                            ++times
                            name_temp = "temp_1_2_" + times + ".fire";
                        }
                        Editor.assetdb.move(manage.realPathToAssetDB(path.resolve(this._scene_path, scene[index_temp])), manage.realPathToAssetDB(path.resolve(this._scene_path, name_temp)), (err) => {
                            if (err) {
                                Editor.error("move error");
                                reject();
                            } else {
                                scene[index_temp] = name_temp;
                                --index;
                                __rename();
                            }
                        });
                    } else {
                        Editor.assetdb.move(manage.realPathToAssetDB(path.resolve(this._scene_path, scene[index])), manage.realPathToAssetDB(path.resolve(this._scene_path, new_name)), (err) => {
                            if (err) {
                                Editor.error("move error");
                                reject();
                                return;
                            } else {
                                scene[index] = new_name;
                            }
                            __rename();
                        });
                    }
                }
            }
            __rename();
        })
    }
    //通过uuid 获取scene
    getBindSceneByUUID(uuid) {
        let scene = [];
        for (let i = 0; i < this.scene_uuid.length; ++i) {
            let index = this.scene_uuid[i].uuid.indexOf(uuid);
            if (index != -1) {
                scene.push(this.scene_uuid[i].scene);
            }
        }
        return scene;
    }
    textureManager(ignoredir = []) {
        return Q.Promise((resolve, reject) => {
            //初始化scene 配置文件
            this.iniSceneConfig();
            //移动图片
            let __moveTexture = (pre, next = []) => {
                return Q.Promise((resolve, reject) => {
                    let dir = pre;
                    for (let i = 0; i < next.length; ++i) {
                        dir = path.resolve(dir, next[i]);
                    }
                    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
                        resolve();
                        return;
                    }
                    let files = fs.readdirSync(dir);
                    //文件移动完成 再移动文件夹下文件
                    files.sort((pre, next) => {
                        return fs.existsSync(path.resolve(dir, pre)) && fs.statSync(path.resolve(dir, pre)).isDirectory();
                    });
                    let index = -1; //文件下标                  
                    let move = () => {
                        ++index;
                        if (index >= files.length) { //文件遍历完
                            let files = fs.readdirSync(dir);
                            let length = 0;
                            for (let i = 0; i < files.length; ++i) {
                                if (files[i].match(/[.]pac$|[.]meta$/)) {
                                    ++length;
                                }
                            }
                            if (files.length <= length) { //删除空文件
                                let delete_file = () => {
                                    return Q.Promise((resolve, reject) => {
                                        for (let i = 0; i < files.length; ++i) {
                                            files[i] = manage.realPathToAssetDB(path.resolve(dir, files[i]));
                                            if (files[i].match(/[.]meta$/)) {
                                                files.splice(i, 1);
                                                --i;
                                            }
                                        }
                                        Editor.log("delete ", files)
                                        Editor.assetdb.delete(files, (err) => {
                                            if (err) {
                                                reject();
                                            } else {
                                                resolve();
                                            }
                                        })
                                    })
                                }
                                delete_file().then(() => {
                                    Editor.log("delete2 : ", dir);
                                    Editor.assetdb.delete([manage.realPathToAssetDB(dir)], (err) => {
                                        if (err) {
                                            reject();
                                        } else {
                                            resolve();
                                        }
                                    })
                                }).done()
                            } else {
                                resolve();
                            }
                            return;
                        }
                        let filename = files[index]
                        let filepath = path.resolve(dir, filename);
                        //文件存在 以jpg png 结尾                    
                        if (fs.existsSync(filepath) && filepath.match(/[.]jpg$|[.]png$/)) {
                            let uuid = manage.getUUID(filepath + ".meta")[1];
                            let scene = this.getBindSceneByUUID(uuid);
                            //拼接路径 
                            let pre_name = next[0] || ""; //保留第一个文件夹名
                            let tail_name = next[next.length - 1] || ""; //保留最后一个文件夹名
                            if ((pre_name.length >= 6 && pre_name.substring(0, 6) == "lesson")  //去掉 lesson share nouse 开头的 文件夹
                                || pre_name == "share"
                                || pre_name == "nouse"
                            ) {
                                pre_name = "";
                            }
                            if ((tail_name.length >= 6 && tail_name.substring(0, 6) == "lesson")
                                || tail_name == "share"
                                || tail_name == "nouse"
                            ) {
                                tail_name = "";
                            }
                            let path_array = [];
                            path_array.push(pre_name);
                            if (scene.length == 1) {
                                path_array.push(scene[0].replace(".fire", ""));
                            } else if (scene.length > 1) {
                                path_array.push("share");
                            } else {
                                path_array.push("nouse");
                            }
                            path_array.push(tail_name);
                            //新文件夹名 去重
                            for (let i = 0; i < path_array.length; ++i) {
                                if (path_array.indexOf(path_array[i]) != i || path_array[i] == "") {
                                    path_array.splice(i, 1);
                                    --i;
                                }
                            }
                            //新旧路径
                            let path_temp = pre;
                            for (let i = 0; i < path_array.length; ++i) {
                                path_temp = path.resolve(path_temp, path_array[i]);
                            }
                            let newPath = path.resolve(path_temp, filename);
                            if (filepath != newPath) { //新旧路径不同  移动文件
                                let num = -1;
                                let mid_re = "";
                                while (fs.existsSync(newPath)) {
                                    ++num;
                                    mid_re = "re" + num;
                                    newPath = path.resolve(path_temp, mid_re, filename);
                                }
                                if (mid_re != "") {
                                    path_array.push(mid_re);
                                }
                                manage.fixpPath(pre, path_array, () => {
                                    newPath = manage.realPathToAssetDB(newPath);
                                    filepath = manage.realPathToAssetDB(filepath);
                                    Editor.assetdb.move(filepath, newPath, (err) => {
                                        if (err) {
                                            Editor.log("move err :" + filepath + " to " + newPath);
                                            reject();
                                        } else {
                                            setTimeout(() => {
                                                move();
                                            }, 50)
                                        }
                                    })
                                })
                            } else {
                                move();
                            }
                        } else if (fs.existsSync(filepath) && fs.statSync(filepath).isDirectory() && ignoredir.indexOf(filename) == -1) { //文件夹                         
                            let new_next = next.concat();
                            new_next.push(filename);
                            __moveTexture(pre, new_next).then(() => {
                                move();
                            }).done()
                        } else {
                            move();
                        }
                    }
                    move();
                })
            }
            __moveTexture(path.resolve(manage.origin, "Texture"), []).then(() => {
                Editor.log(" move end");
                resolve();
            }, () => {
            }).done();
        })
    };
    //获取所有图片 md5 以及对应 多个 uuid
    getAllTextureMD5UUID(pre) {
        let md5_uuid_ = [{}, {}, {}]; // 0 普通 1 share  2 notshare
        let __getTextureMD5UUID = (pre, next = [], md5_index = 0) => {
            let dir = pre;
            for (let i = 0; i < next.length; ++i) {
                dir = path.resolve(dir, next[i]);
            }

            if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
                return;
            }
            let md5_uuid = md5_uuid_[md5_index];

            let files = fs.readdirSync(dir);
            let filepath = "";
            let md5 = "";
            let uuid = "";
            for (let i = 0; i < files.length; ++i) {
                filepath = path.resolve(dir, files[i]);
                if (fs.existsSync(filepath) && filepath.match(/[.]jpg$|[.]png$/)) {
                    md5 = manage.readFileMD5(filepath);
                    uuid = manage.getUUID(filepath + ".meta")[1];
                    if (md5_uuid[md5]) {
                        md5_uuid[md5].push(uuid)
                    } else {
                        md5_uuid[md5] = [uuid]
                    }
                } else if (fs.existsSync(filepath) && fs.statSync(filepath).isDirectory()) {
                    let new_next = next.concat();
                    new_next.push(files[i]);
                    let md5_index_new = md5_index;
                    if (files[i] == "share") {
                        md5_index_new = Math.max(md5_index_new, 1);
                    } else if (files[i] == "notshare") {
                        md5_index_new = Math.max(md5_index_new, 2);
                    }
                    __getTextureMD5UUID(pre, new_next, md5_index_new);
                }
            }
        }
        __getTextureMD5UUID(pre, [], 0);
        return md5_uuid_;
    }
    fixShareAsset() {
        return Q.Promise((resolve, reject) => {
            this.iniSceneConfig();
            let md5_uuid = this.getAllTextureMD5UUID(path.resolve(manage.origin, "Texture"));
            //去掉 share 内自身重复的
            let remove_link_repeat_share = (callback) => {
                let key = [];
                for (let md5 in md5_uuid[1]) {
                    key.push(md5);
                }
                let index = -1;
                let __remove_link_repeat_share = () => {
                    ++index;
                    let md5 = key[index];
                    if (!md5) {
                        callback();
                        return;
                    }
                    if (md5_uuid[1][md5].length > 1) {
                        let scene = []
                        for (let i = 1, uuid; uuid = md5_uuid[1][md5][i]; ++i) {
                            scene = scene.concat(this.getBindSceneByUUID(uuid));
                        }
                        scene = scene.map((item) => {
                            return path.resolve(manage.origin, "Scene", item);
                        })
                        manage.changeBindingUUID(scene, md5_uuid[1][md5], md5_uuid[1][md5][0], () => {
                            __remove_link_repeat_share();
                        })
                    } else {
                        __remove_link_repeat_share();
                    }
                }
                __remove_link_repeat_share();
            }
            //去掉 各lesson 中 share 中有的  
            let remove_link_repeat_lesson = (callback) => {
                let key = [];
                for (let md5 in md5_uuid[0]) {
                    key.push(md5);
                }
                let index = -1;
                let __remove_link_repeat_lesson = () => {
                    ++index;
                    let md5 = key[index];
                    if (!md5) {
                        callback();
                        return;
                    }
                    if (md5_uuid[1][md5]) {
                        let scene = []
                        for (let i = 0, uuid; uuid = md5_uuid[0][md5][i]; ++i) {
                            scene = scene.concat(this.getBindSceneByUUID(uuid));
                        }
                        scene = scene.map((item) => {
                            return path.resolve(manage.origin, "Scene", item);
                        })
                        manage.changeBindingUUID(scene, md5_uuid[0][md5], md5_uuid[1][md5][0], () => {
                            __remove_link_repeat_lesson();
                        })
                    } else {
                        __remove_link_repeat_lesson();
                    }
                }
                __remove_link_repeat_lesson();
            }
            //去除 not_share 中重复的 直接删除
            let remove_repeat_notshare = (callback) => {
                let key = [];
                for (let md5 in md5_uuid[2]) {
                    key.push(md5);
                }
                let index = -1;
                let __remove_repeat_notshare = () => {
                    ++index;
                    let md5 = key[index];
                    if (!md5) {
                        callback();
                        return;
                    }
                    if (md5_uuid[2][md5].length > 1) {
                        let scene = []
                        for (let i = 1, uuid; uuid = md5_uuid[2][md5][i]; ++i) {
                            scene = scene.concat(this.getBindSceneByUUID(uuid));
                        }
                        scene = scene.map((item) => {
                            return path.resolve(manage.origin, "Scene", item);
                        })
                        manage.changeBindingUUID(scene, md5_uuid[2][md5], md5_uuid[2][md5][0], () => {
                            let delete_path = [];
                            for (let i = 1, uuid; uuid = md5_uuid[2][md5][i]; ++i) {
                                let path = Editor.assetdb.uuidToUrl(uuid);
                                let index = path.lastIndexOf("/");
                                path = path.substring(0, index);
                                delete_path.push(manage.realPathToAssetDB(path));
                            }
                            if (delete_path.length > 0) {
                                Editor.assetdb.delete(delete_path, () => {
                                    __remove_repeat_notshare();
                                })
                            } else {
                                __remove_repeat_notshare();
                            }

                        })
                    } else {
                        __remove_repeat_notshare();
                    }
                }
                __remove_repeat_notshare()

            }
            let copy_not_share_file = (dir, midfold, file, olduuid, data, scenes, callback) => {
                let num = 0;
                let index = -1;
                let __copy_not_share_file = () => {
                    ++index;
                    let scene = scenes[index];
                    if (!scene) {
                        callback();
                        return;
                    }
                    let file_path = "";
                    if (midfold) {
                        file_path = dir + "/" + scene.replace(".fire", "") + "/" + midfold + "/" + file;
                    } else {
                        file_path = dir + "/" + scene.replace(".fire", "") + "/" + file;
                    }
                    manage.fixpPath(manage.assetDBToRealPath(dir), [scene.replace(".fire", ""), midfold], () => {
                        while (Editor.assetdb.exists(file_path)) {
                            ++num;
                            let filetemp = "copy_" + num + file;
                            if (midfold) {
                                file_path = dir + "/" + scene.replace(".fire", "") + "/" + midfold + "/" + filetemp;
                            } else {
                                file_path = dir + "/" + scene.replace(".fire", "") + "/" + filetemp;
                            }
                        }
                        fs.writeFileSync(manage.assetDBToRealPath(manage.assetDBToRealPath(file_path)), data);
                        Editor.assetdb.refresh(file_path, () => {
                            manage.changeBindingUUID([path.resolve(manage.origin, "Scene", scene)], [olduuid], manage.getUUID(manage.assetDBToRealPath(file_path + ".meta"))[1], () => {
                                __copy_not_share_file();
                            })
                        });
                    })
                }
                __copy_not_share_file();
            }
            let fix_notshare = (callback) => {
                let key = [];
                for (let md5 in md5_uuid[2]) {
                    key.push(md5);
                }
                let index = -1;
                let __fix_notshare = () => {
                    ++index;
                    let md5 = key[index];
                    if (!md5) {
                        callback();
                        return;
                    }
                    let path_file = Editor.assetdb.uuidToUrl(md5_uuid[2][md5][0]);
                    path_file = path_file.substring(0, path_file.lastIndexOf("/"));
                    let filename = path_file.substring(path_file.lastIndexOf("/") + 1, path_file.length);
                    let dir = path_file.substring(0, path_file.lastIndexOf("/notshare"));
                    let temp_mid = path_file.replace(dir + "/notshare" + "/", "");//.replace("/" + filename, "");
                    temp_mid = temp_mid.substring(0, temp_mid.lastIndexOf("/"));
                    copy_not_share_file(dir, temp_mid, filename, md5_uuid[2][md5][0], fs.readFileSync(manage.assetDBToRealPath(path_file)), this.getBindSceneByUUID(md5_uuid[2][md5][0]), () => {
                        Editor.log("end")
                        __fix_notshare();
                    });
                }
                __fix_notshare();
            }
            remove_link_repeat_share(() => {
                remove_link_repeat_lesson(() => {
                    remove_repeat_notshare(() => {
                        fix_notshare(() => {
                            resolve();
                        });
                    })
                });
            });
            resolve();
        })
    }
    play() {
        this.sceneManage().then(() => {
            Editor.log("rename scene end")
            //文件移动
            this.textureManager(["notshare", "share"]).then(() => {
                //文件 是否 共用 
                this.fixShareAsset().then(() => {
                    //再移动一次
                    this.textureManager(["notshare"]).then(() => {
                        manage.working = false;
                        Editor.log("Texture Manage End");
                    })
                }, () => {
                    Editor.log("Texture Manage err ");
                }).done()
            }, () => {

            }).done();
        }, () => {
            Editor.log("scene manage err ");
            manage.working = false;
        }).done();
    }
}
module.exports = new FileManage();