/**
 * 打印操作
 * by houzehang
 */

let ON_OFF_LOG = !window.ONLINE;

// console.log = (function(oriLogFunc) {
//     return function() {
//         ON_OFF_LOG && oriLogFunc.call(console, ...arguments);
//     }
// })(console.log);

class LogUtil {
	log(...args) {
		if (!ON_OFF_LOG) return;
		console.log(...args);
	}
}

module.exports = new LogUtil;