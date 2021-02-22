/*!
 * [operation]点击计数
 * by houzhenag
 */
let WidgetBase = require('./../basement/WidgetBase');
let EnumCfg = require('./../config/EnumCfg');
let TouchUtil = require('./../util/TouchUtil');

cc.Class({
	extends: WidgetBase,

	properties: {
		//-- tag
		targetId: {
			default: 'target_1',
		},
		//-- 有效点击次数统计
		_validClickCount: 0,
		//-- 点击计数开关
		countEnabled: false,
		//-- 优先级
		touchPriority: -1,
		swallTouch:false,
	},

	onLoad() {
		this._super();
	},

	start() {
		TouchUtil.addClickBtn(this.node, () => {
			if (!this.countEnabled) {
				this.notice(EnumCfg.EEventName.ON_CLICK);
			} else {
				this.notice(EnumCfg.EEventName.ON_CLICK_TIMES_UP_TO, ++this._validClickCount);
			}
			return (this.countEnabled&&this.swallTouch)||!!this.node && this.node._name != 'Canvas' && this.touchPriority != -1;
		}, this.touchPriority);
	},

	events() {
		return {
			[EnumCfg.EEventName.CLICK_TIMES_SET_CLICK_COUNT_ENABLED]: this.setCountEnabled,
			[EnumCfg.EEventName.CLICK_TIMES_RESET]: this.resetClickCount,
			[EnumCfg.EEventName.CLICK_TIMES_REJECT]: this.rejectClickCount,
		}
	},


	/**
	 * 重置计数
	 * @return {[type]} [description]
	 */
	resetClickCount() {
		this._validClickCount = 0;
	},

	/**
	 * 撤回计数
	 * @return {[type]} [description]
	 */
	rejectClickCount() {
		this._validClickCount--;
	},

	/**
	 * 是否继续统计点击次数的开关
	 * @param {Number} compId       [description]
	 * @param {[type]} target       [description]
	 * @param {[type]} countEnabled [description]
	 */
	setCountEnabled(compId = 0, target, countEnabled) {
		if (arguments.length == 2) {
			countEnabled = target;
			target = compId;
			compId = 0;
		}
		if (compId !== null && compId != this.compId) return;

		setTimeout(() => {
			if (target == this.targetId || target == this.node || target == null) {
				this.countEnabled = !!countEnabled;
			}
		});
	},

	onDestroy() {
		this._super();
	}
});