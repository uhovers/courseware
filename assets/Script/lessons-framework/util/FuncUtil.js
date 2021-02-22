/**
 * 函数操作
 * by houzehang
 */

let FuncUtil = {
    loadPrefab(path, callback) {
        cc.loader.loadRes(path, cc.Prefab, (err, res) => {
            // console.log(`load  prefab ${path}`)
            if (err) {
                console.error(`load err ${path}`)
                console.log(err)
                return;
            }
            // console.log(res);
            let node = cc.instantiate(res);
            if (callback) callback(node);
        })
    },
}

module.exports = FuncUtil;