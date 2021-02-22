/**
 * 音频操作
 * by houzehang
 */
let NoticeCenter = require('./../core/NoticeCenter');
let EnumCfg = require('./../config/EnumCfg');

let AudioUtil = {

	_audioTimeUpdateData_: [],
	_audioCallFuncHash_: {},
	_maxDurationHash_: {},
	_priority: [],
	/**
	 * 初始化
	 * @return {[type]} [description]
	 */
	init: () => {
		//-- 初始化条件
		let curScene = cc.director.getScene();
		if (!curScene || curScene.__bindAudioUtil__) return;

		//-- 初始化过程
		curScene.__bindAudioUtil__ = true;
		AudioUtil._audioTimeUpdateData_ = [];
		AudioUtil._audioCallFuncHash_ = {};
		AudioUtil._maxDurationHash_ = {};
		AudioUtil._priority = [];
		AudioUtil._playIng = null;
		curScene.on(("TIMEUPDATE"), (event) => {
			let url = event.detail.url;
			let curDuration = event.detail.time;
			let maxDuration = AudioUtil._maxDurationHash_[url];
			if (maxDuration && maxDuration <= curDuration && url) {
				if (AudioUtil._audioCallFuncHash_[url]) {
					AudioUtil._audioCallFuncHash_[url].call(AudioUtil);
					AudioUtil._audioCallFuncHash_[url] = null;
				}
				AudioUtil.stop();
			}
		});
	},

	/**
	 * 播放音频
	 * @param  {[type]} audio         [AudioClip]
	 * @param  {[type]} audioCallback [播放完成回调]
	 * @param  {[type]} maxDuration   [最大播放时长]
	 * @return {[type]}               [description]
	 */
	play: (audio, audioCallback, maxDuration, loop = false, priority = 0, volume) => {
		// console.log('MINGXI_DEBUG_LOG>>>>>>>>>play audio',audio, volume);
		priority = priority || 0;
		AudioUtil.init();
		if (!audio || AudioUtil._priority[AudioUtil._priority.length - 1] > priority) {
			return;
		}
		//-- 播放完成回调
		let _audioCallback = audioCallback;
		let _maxDuration = (maxDuration == undefined || maxDuration == null) ? undefined : (maxDuration * 1000);
		AudioUtil._priority.push(priority);
		if (_audioCallback) {
			AudioUtil._audioCallFuncHash_[audio] = () => {
				if (AudioUtil._audioCallFuncHash_[audio]) {
					AudioUtil._audioCallFuncHash_[audio] = null;
					_audioCallback && _audioCallback();
					_audioCallback = null;
					AudioUtil._priority[AudioUtil._priority.length] = -1000;
					for (let i = 0, len = AudioUtil._audioTimeUpdateData_.length; i < len; i++) {
						if (AudioUtil._audioTimeUpdateData_[i] &&
							AudioUtil._audioTimeUpdateData_[i].url == audio) {
							AudioUtil._audioTimeUpdateData_.splice(i, 1);
							break;
						}
					}
					
				}
			}
		}

		//-- 播放音频
		if (AudioUtil._isOnline()) {
			NoticeCenter.dispatchEvent(EnumCfg.EEventName.CONTEXT_PLAY_AUDIO, audio, AudioUtil._audioCallFuncHash_[audio], !!loop);
		} else {
			let audioId 
			if (volume == null || volume == undefined) {
				audioId = cc.audioEngine.play(audio, !!loop);
			} else {
				audioId = cc.audioEngine.play(audio, !!loop, volume.toFixed(1));
			}
			// console.log('MINGXI_DEBUG_LOG>>>>>>>>>play audio with volume', audio, volume);
			_audioCallback && cc.audioEngine.setFinishCallback(audioId, AudioUtil._audioCallFuncHash_[audio]);

			AudioUtil._audioTimeUpdateData_.push({
				audioId: audioId,
				url: audio,
			});
		}

		//-- 记录最大播放时长
		if (_maxDuration) {
			AudioUtil._maxDurationHash_[audio] = _maxDuration;
		}
	},

	stop: () => {
		AudioUtil._priority[AudioUtil._priority.length] = -1000;
		if (AudioUtil._isOnline()) {
			NoticeCenter.dispatchEvent(EnumCfg.EEventName.CONTEXT_STOP_AUDIO);
		} else {
			cc.audioEngine.stopAll();
		}
	},

	update: (dt) => {
		for (let i = 0, len = AudioUtil._audioTimeUpdateData_.length; i < AudioUtil._audioTimeUpdateData_.length; i++) {
			let obj = AudioUtil._audioTimeUpdateData_[i];
			if (cc.audioEngine.getState(obj.audioId) == cc.audioEngine.AudioState.ERROR) {
				AudioUtil._audioTimeUpdateData_.splice(i, 1);
				--i;
				break;
			}
			cc.director.getScene().emit(("TIMEUPDATE"), {
				time: cc.audioEngine.getCurrentTime(obj.audioId) * 1000,
				url: obj.url,
			})
		}
	},

	_isOnline: () => {
		return !!window.ONLINE && !window.RELEASE_MODE;
	},


}

module.exports = AudioUtil;