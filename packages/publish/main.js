"use strict";
const os = require("os")
const path = require('path');
const fileManage = require("./FileManage");
const manage = require("./Manage")
const replaceSameFile = require("./ReplaceSameFile")
const fs = require('fs');
const Q = require("q")
const tinify = require("tinify");
const compressTexture = require("./CompressTexture");
require('dotenv').config({ path: path.resolve(__dirname, "..", "..", "..", "..", ".env") })
const child_process = require('child_process');
const compile = require(path.resolve(__dirname, "..", "..", "..", "..", "link"))
function onBeforeBuildFinish(options, callback) {
    //压缩 ui 下 的 合图
    Editor.log("Please waiting compress Texture");
    // compressTexture.play(true, path.resolve(manage.origin, "..", "build", "web-mobile", "res", "raw-assets", "Texture", "ui"), false, () => {
    Editor.log("compress Texture is End ");

    if (os.platform() == "win32") {
        let _fromRes = path.resolve(options.dest, "res"),
            _fromSrc = path.resolve(options.dest, "src"),
            _to = path.resolve(process.env.PUBLISH, options.projectName)
        child_process.exec(`rmdir /s/q ` + _to, function () {
            Editor.log('rmdir over')
            child_process.exec(`mkdir ` + _to, function () {
                child_process.exec(`mkdir ` + _to + `\\res`, function () {
                    child_process.exec(`mkdir ` + _to + `\\src`, function () {
                        child_process.exec(`xcopy /e ` + _fromRes + ` ` + _to + `\\res`, function () {
                            Editor.log('copy res over')
                            child_process.exec(`xcopy /e ` + _fromSrc + ` ` + _to + `\\src`, function () {
                                Editor.log('copy src over')
                                Editor.log('start compile')
                                setTimeout(() => {
                                    compile(process.env.PUBLISH);
                                }, 1000)
                            });
                        });
                    });
                });
            });
        });
    } else {
        let _fromRes = path.resolve(options.dest, "res"),
            _fromSrc = path.resolve(options.dest, "src"),
            _to = path.resolve(process.env.PUBLISH, options.projectName)
        let spawn = child_process.spawn('rm', ['-r', _to])
        spawn.on("close", () => {
            let spawn = child_process.spawn('mkdir', [_to])
            spawn.on("close", () => {
                child_process.spawn('cp', ['-r', _fromRes, _to])
                Editor.log('copy res dir', _fromRes, _to)
                child_process.spawn('cp', ['-r', _fromSrc, _to])
                Editor.log('compile src', _fromSrc, _to)
                setTimeout(() => {
                    compile(process.env.PUBLISH)
                }, 1000)
            })
        })
    }

    callback()
    // })
}
module.exports = {
    load() {
        Editor.Builder.on('build-finished', onBeforeBuildFinish);
    },

    unload() {
        Editor.Builder.removeListener('build-finished', onBeforeBuildFinish);
    },
    messages: {
        "FileManage"() {
            if (manage.working) {
                Editor.log("waiting work end");
                return;
            }
            manage.working = true;
            Editor.log("FileManage start");
            fileManage.play();

        },
        "WriteSameFile"() {
            if (manage.working) {
                Editor.log("waiting work end");
                return;
            }
            manage.working = true;
            replaceSameFile.play(true);
        },
        "NoWriteSameFile"() {
            if (manage.working) {
                Editor.log("waiting work end");
                return;
            }
            manage.working = true;
            replaceSameFile.play(false);
        },
        'compress'() {
            if (manage.working) {
                Editor.log("waiting work end");
                return;
            }
            manage.working = true;
            Editor.log("compress star");
            compressTexture.play(true, path.resolve(manage.origin, "Texture"), true)

        },
        'compressSkeleton'() {
            if (manage.working) {
                Editor.log("waiting work end");
                return;
            }
            manage.working = true;
            Editor.log("compress star");
            compressTexture.play(true, path.resolve(manage.origin, "Skeleton"), true)
        },
        'compressResourcesSkeleton'() {
            if (manage.working) {
                Editor.log("waiting work end");
                return;
            }
            manage.working = true;
            Editor.log("compress star");
            compressTexture.play(true, path.resolve(manage.origin, "resources", "Skeleton"), true)
        },
        'compressResourcesTexture'() {
            if (manage.working) {
                Editor.log("waiting work end");
                return;
            }
            manage.working = true;
            Editor.log("compress star");
            compressTexture.play(true, path.resolve(manage.origin, "resources", "Texture"), true)
        },
        'unwantedCompressTexure'() {
            if (manage.working) {
                Editor.log("waiting work end");
                return;
            }
            manage.working = true;
            Editor.log("texture unwanted compress");
            compressTexture.play(false, path.resolve(manage.origin, "Texture"), true)
        },
        'unwantedCompressResourcesSkeleton'() {
            if (manage.working) {
                Editor.log("waiting work end");
                return;
            }
            manage.working = true;
            Editor.log("compress star");
            compressTexture.play(false, path.resolve(manage.origin, "resources", "Skeleton"), true)
        },
        'unwantedCompressSkeleton'() {
            if (manage.working) {
                Editor.log("waiting work end");
                return;
            }
            manage.working = true;
            Editor.log("compress star");
            compressTexture.play(false, path.resolve(manage.origin, "Skeleton"), true)
        },
        "Test"() {
            Editor.log(os.platform())
            if (os.platform() == "win32") {
                Editor.log("true");
            }
        }
    }
};