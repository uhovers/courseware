'use strict';
const fs = require('fs');
const path = require('path');

module.exports = {
    load () {
      // 当 package 被正确加载的时候执行
    },
  
    unload () {
      // 当 package 被正确卸载的时候执行
    },
  
    messages: {
        'say-hello' () {
            let a = path.resolve(__dirname, "..", "..", "assets", "resources","audio")
            let data = fs.readdirSync(a);
            let metaFile = [];
            data.forEach(e =>{
                if(e.indexOf(".meta") != -1){
                    metaFile.push(e);
                }
            })
            // 存入所有.meta文件,并排序
            this.sortFile(metaFile)
            // 把所有audio的uuid输出成可以使用的json格式的字符串
            let str = `[`;
            metaFile.forEach((file, index)=>{
                let __filePath = path.resolve(a, file);
                let filedata = JSON.parse(fs.readFileSync(__filePath, "utf8"))  
                if(index == metaFile.length -1){
                    str += String.raw`
    {
        "__uuid__" : "${filedata.uuid}"
    }`
                }else{
                    str += String.raw`
    {
        "__uuid__" : "${filedata.uuid}"
    },`
                }
            })
            str += `
]`;
            let savePath = path.resolve(__dirname, "..", "..", "assets", "audio.json");
            // 创建文件
            if(!fs.existsSync(savePath)){
                fs.open(savePath, "w", (err, fd)=>{
                    fs.close(fd, err=>{
                    })
                })
            }
            setTimeout(()=>{
                if(fs.existsSync(savePath)){
                    // 写入内容
                    fs.writeFileSync(savePath, str);
                    Editor.log("write finish")
                }else{
                    Editor.log("no file created.")
                }
            }, 2000)
        }   
    },

    sortFile(arr){
        let sub = (temp)=>{
            let tempNum = 0;
            temp.forEach((t, index)=>{
                t = t.replace(/[A-Za-z]+/g,'')
                t = t.match(/^[\d]+/)[0]
                tempNum += parseInt(t) * Math.pow(10, (temp.length - 1 - index) *3)
            })  
            return tempNum;
        }
        arr.sort((pre, next) => {
            let preNum = sub(pre.split("_"));
            let nextNum = sub(next.split("_"))
            return preNum - nextNum;
        })
    },
  };