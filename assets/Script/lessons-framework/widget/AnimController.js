/*!
 * [widget]动画控件
 * by houzehang
 */
let WidgetBase = require('./../basement/WidgetBase');
let EnumCfg = require('./../config/EnumCfg');
let AnimUtil = require('./../util/AnimUtil');
let TouchUtil = require('./../util/TouchUtil');

cc.Class({
    extends: WidgetBase,

    properties: {
        //-- 自动播放
        playAuto: false,
        //-- 自动继续
        nextAuto: false,
        //-- 播放按钮
        btnPlay: cc.Node,

        //-- 播放时隐藏其他
        hideOthersWhenPlaying: true,

        animNodes: [cc.Node],
        AnimLoadPath: [cc.String],
        animNames: [cc.String],
        animLoopTimes: [cc.Integer],
        animTimeScale: [cc.Float],
        animNodeRelease: [cc.Boolean],//播放下一个动画是否释放上一个

        animBgNodes: [cc.Node],
        animBgLoadPath: [cc.String],
        animBgName: [cc.String],
        animBgRelease: [cc.Boolean],//播放下一个动画是否释放上一个bganim

        textureBgNodes: [cc.Node],
        textureBgLoadPath: [cc.String],
        textureBgRelease: [cc.Boolean],

        _curPlayIndex: -1,
    },

    onLoad() {
        this._super()
        //计算animNodeRelease
        this.animNodeRelease[0] = false;
        for (let i = 0, length = this.AnimLoadPath.length; i < length; ++i) {
            if (typeof this.animNodeRelease[i + 1] === 'undefined') {
                this.animNodeRelease[i + 1] = true;
                // let lastIndex = this.AnimLoadPath.lastIndexOf(this.AnimLoadPath[i]);
                // if (lastIndex === i) {
                //     this.animNodeRelease[i + 1] = true;
                // } else {
                //     this.animNodeRelease[i + 1] = false;
                // }
            }
        }
        console.log(this.animNodeRelease);
        //计算this.animBgRelease
        this.animBgRelease[0] = false;
        for (let i = 0; i < this.animBgLoadPath.length; ++i) {
            if (typeof this.animBgRelease[i + 1] === "undefined") {
                this.animBgRelease[i + 1] = true;
                // let lastIndex = this.animBgLoadPath.lastIndexOf(this.animBgLoadPath[i]);
                // if (lastIndex === i) {
                //     this.animBgRelease[i + 1] = true;
                // } else {
                //     this.animBgRelease[i + 1] = false;
                // }
            }
        }
        console.log(this.animBgRelease);
        //
        this.textureBgRelease[0] = false;
        for (let i = 0; i < this.textureBgLoadPath.length; ++i) {
            if (typeof this.textureBgRelease[i + 1] === "undefined") {
                this.textureBgRelease[i + 1] = true;
                //     let lastIndex = this.textureBgLoadPath.lastIndexOf(this.textureBgLoadPath[i]);
                //     if (lastIndex === i) {
                //         this.textureBgRelease[i + 1] = true;
                //     } else {
                //         this.textureBgRelease[i + 1] = false;
                //     }
            }
        }
        console.log(this.textureBgRelease)
        //加载第一个
        this.loadSpine(this.AnimLoadPath[0], this.animNodes[0], this.animNames[0]);
        this.loadSpine(this.animBgLoadPath[0], this.animBgNodes[0], this.animBgName[0]);
        this.loadTextre(this.textureBgLoadPath[0], this.textureBgNodes[0]);
        if (this.playAuto) {
            this._playFromBegain();
        }
        TouchUtil.addClickBtn(this.btnPlay, () => {
            if (this.btnPlay) this.btnPlay.active = false;
            this._playFromBegain();
        });
    },
    loadSpine(path, node, animName, callback = () => { }) {
        if (!node || !path || node.getComponent(sp.Skeleton)) {
            return;
        }
        cc.loader.loadRes(`Skeleton/${path}`, sp.SkeletonData, (err, res) => {
            console.log(`load  spine ${path}`)
            if (err) {
                console.error(`load err ${path}`)
                console.log(err)
                return;
            }
            if (node.getComponent(sp.Skeleton) || !cc.isValid(node)) {
                return;
            }
            let active = node.active;
            node.active = true;
            let sk = node.addComponent(sp.Skeleton);
            sk.skeletonData = res;
            sk.setAnimation(0, animName, false);
            sk.timeScale = 0;
            node.active = active;
            this.scheduleOnce(() => {
                callback();
            })
        })
    },
    loadTextre(path, node, callback = () => { }) {
        if (!node || !path || node.getComponent(cc.Sprite)) {
            return;
        }
        cc.loader.loadRes(`Texture/${path}`, cc.SpriteFrame, (err, res) => {
            console.log(`load  texture ${path}`)
            if (err) {
                console.error(`load err ${path}`)
                console.log(err)
                return;
            }
            if (!cc.isValid(node) || node.getComponent(cc.Sprite)) {
                return;
            }
            node.addComponent(cc.Sprite).spriteFrame = res;
            this.scheduleOnce(() => {
                callback();
            })
        })
    },
    releaseSpine(node, path) {
        if (!path) {
            return;
        }
        if (node && cc.isValid(node) && node.getComponent(sp.Skeleton)) {
            node.removeComponent(sp.Skeleton);
        }
        console.log(`release spine ${path}`)
        cc.loader.releaseRes(`Skeleton/${path}`, sp.SkeletonData);
    },
    releaseTexture(node, path) {
        if (!path) {
            return;
        }
        if (node && cc.isValid(node) && node.getComponent(cc.Sprite)) {
            node.removeComponent(cc.Sprite);
        }
        console.log(`release texture ${path}`)
        cc.loader.releaseRes(`Texture/${path}`, cc.SpriteFrame)
    },
    /**
     * 自动播放
     * @return {[type]} [description]
     */
    _playFromBegain() {
        this._curPlayIndex = 0;
        this.play()
    },

    events() {
        return {
            [EnumCfg.EEventName.ANIM_CONTROLLER_PLAY]: this.playByIndex,
            [EnumCfg.EEventName.ANIM_CONTROLLER_PAUSE]: this.pauseByIndex,
            [EnumCfg.EEventName.ANIM_CONTROLLER_RESUME]: this.resumeByIndex,
            [EnumCfg.EEventName.ANIM_CONTROLLER_REPLAY_CUR]: this.replayCur,
            [EnumCfg.EEventName.ANIM_CONTROLLER_REPLAY_ALL]: this.replayAll,
            [EnumCfg.EEventName.ANIM_CONTROLLER_NEXT_ONE]: this.nextOne,
            [EnumCfg.EEventName.ANIM_CONTROLLER_NEXT_GROUP]: this.nextGroup,
        }
    },

    playByIndex(compId = 0, index, callback = () => { }) {
        if (arguments.length == 1) {
            index = compId;
            compId = 0;
            callback = () => { }
        }
        if (arguments.length === 2) {
            if (typeof (index) === 'function') {
                callback = index;
                index = compId
                compId = 0;
            }
        }
        if (compId !== null && compId != this.compId) return;

        this._curPlayIndex = index;

        if (this.animNodes[this._curPlayIndex]) {
            this.play(false, callback);
            return this.animNodes[this._curPlayIndex];
        }
    },

    /**
     * 暂停
     */
    pauseByIndex(compId = 0, index) {
        if (arguments.length == 1) {
            index = compId;
            compId = 0;
        }
        if (compId !== null && compId != this.compId) return;

        AnimUtil.pause(this.animNodes[index]);
    },

    /**
     * 继续
     */
    resumeByIndex(compId = 0, index) {
        if (arguments.length == 1) {
            index = compId;
            compId = 0;
        }
        if (compId !== null && compId != this.compId) return;
        AnimUtil.resume(this.animNodes[index], this.animTimeScale[index]);
    },


    /**
     * 播放
     * @param  {Boolean} singlePlay [description]
     * @return {[type]}             [description]
     */
    play(singlePlay = false, callback = () => { }) {
        let animNode = this.animNodes[this._curPlayIndex];
        if (!animNode || !cc.isValid(animNode)) return;
        //判断加载动画
        let index = this._curPlayIndex;
        let loadAnimNode = false;
        let loadAnimBg = false;
        let loadTextureBg = false;
        if (!animNode.getComponent(sp.Skeleton)) {
            loadAnimNode = true;
            this.loadSpine(this.AnimLoadPath[this._curPlayIndex], animNode, this.animNames[this._curPlayIndex], () => {
                loadAnimNode = false;
                if (loadAnimNode || loadAnimBg || loadTextureBg || index !== this._curPlayIndex) {
                    return;
                }
                this.play(singlePlay, callback);
            });
        }
        if (this.animBgNodes[this._curPlayIndex] && !this.animBgNodes[this._curPlayIndex].getComponent(sp.Skeleton)) {
            loadAnimBg = true;
            this.loadSpine(this.animBgLoadPath[this._curPlayIndex], this.animBgNodes[this._curPlayIndex], this.animBgName[this._curPlayIndex], () => {
                loadAnimBg = false;
                if (loadAnimNode || loadAnimBg || loadTextureBg || index !== this._curPlayIndex) {
                    return;
                }
                this.play(singlePlay, callback);
            })
        }
        if (this.textureBgNodes[this._curPlayIndex] && !this.textureBgNodes[this._curPlayIndex].getComponent(cc.Sprite)) {
            loadTextureBg = true;
            this.loadTextre(this.textureBgLoadPath[this._curPlayIndex], this.textureBgNodes[this._curPlayIndex], () => {
                loadTextureBg = false;
                if (loadAnimNode || loadAnimBg || loadTextureBg || index !== this._curPlayIndex) {
                    return;
                }
                this.play(singlePlay, callback);
            })
        }
        if (loadAnimNode || loadAnimBg || loadTextureBg) {
            return;
        }
        if (this.animBgNodes[this._curPlayIndex]) {
            this.animBgNodes[this._curPlayIndex].active = true;
            AnimUtil.play(this.animBgNodes[this._curPlayIndex], this.animBgName[this._curPlayIndex], 1, () => { });
        }
        if (this.textureBgNodes[this._curPlayIndex]) {
            this.textureBgNodes[this._curPlayIndex].active = true;
        }
        //============= 1.隐藏其他动画节点 =============
        if (this.hideOthersWhenPlaying) {
            this.animNodes.map((animNode) => {
                if (animNode) animNode.active = false;
            });
        }
        // ============= 2.播放当前动画 =============
        animNode.active = true;
        let _prePlayIndex = this._curPlayIndex;
        let _nextAuto = !singlePlay && this.nextAuto;
        let completeCallBack = (track) => {
            if (this._curPlayIndex == _prePlayIndex) {
                // ============= 3.1.通知外部，播放完了某段动画 =============
                this.notice(EnumCfg.EEventName.ON_ANIM_CONTROLLER_COMPLETE, this._curPlayIndex);
                // ============= 3.2.播放完成后判断是否自动播放下一个 =============
                _nextAuto && this.nextOne(this.compId);
                callback(track, _prePlayIndex);
            }
        }
        let eventListener = (node, TrackEntry, event) => {
            this.notice(EnumCfg.EEventName.ON_ANIM_CONTROLLER_EVENT, node, TrackEntry, event)
        }
        let animationName = this.animNames[this._curPlayIndex];
        let loopTimes = this.animLoopTimes[this._curPlayIndex] || 1;
        let timeScale = typeof this.animTimeScale[this._curPlayIndex] === 'undefined' ? 1 : this.animTimeScale[this._curPlayIndex];
        AnimUtil.play(animNode, animationName, loopTimes, completeCallBack, timeScale, 0, eventListener);
        if (this.animNodeRelease[this._curPlayIndex]) {
            this.releaseSpine(this.animNodes[this._curPlayIndex - 1], this.AnimLoadPath[this._curPlayIndex - 1]);
        }
        if (this.animBgRelease[this._curPlayIndex]) {
            this.releaseSpine(this.animBgNodes[this._curPlayIndex - 1], this.animBgLoadPath[this._curPlayIndex - 1]);
        }
        if (this.textureBgRelease[this._curPlayIndex]) {
            this.releaseTexture(this.textureBgNodes[this._curPlayIndex - 1], this.textureBgLoadPath[this._curPlayIndex - 1]);
        }
        //预加载下一个
        this.loadSpine(this.AnimLoadPath[this._curPlayIndex + 1], this.animNodes[this._curPlayIndex + 1], this.animNames[this._curPlayIndex + 1]);
        this.loadSpine(this.animBgLoadPath[this._curPlayIndex + 1], this.animBgNodes[this._curPlayIndex + 1], this.animBgName[this._curPlayIndex + 1]);
        this.loadTextre(this.textureBgLoadPath[this._curPlayIndex + 1], this.textureBgNodes[this._curPlayIndex + 1]);
        // ============= 通知外部，开始播放某段动画 =============
        setTimeout(() => {
            this.notice(EnumCfg.EEventName.ON_ANIM_CONTROLLER_START, this._curPlayIndex);
        });
    },

    /**
     * 重播当前这段动画
     * @param  {Number} compId [description]
     * @return {[type]}        [description]
     */
    replayCur(compId = 0) {
        if (compId !== null && compId != this.compId) return;
        this._curPlayIndex = Math.min(this.animNodes.length - 1, this._curPlayIndex);
        this.play();
    },

    /**
     * 从头开始重播
     * @param  {Number} compId [description]
     * @return {[type]}        [description]
     */
    replayAll(compId = 0) {
        if (compId !== null && compId != this.compId) return;
        this._curPlayIndex = 0;
        this.play();
    },

    /**
     * 播放下一个动画
     * @param  {Number} compId [description]
     * @return {[type]}        [description]
     */
    nextOne(compId = 0) {
        if (compId !== null && compId != this.compId) return;
        this._curPlayIndex = this._curPlayIndex + 1;
        return this.play();
    },

    /**
     * 下一组（可以考虑分组）
     * @param  {Number} compId [description]
     * @return {[type]}        [description]
     */
    nextGroup(compId = 0) {
        if (compId !== null && compId != this.compId) return;
    },

    onDestroy() {
        this._super();
        for (let i = 0, length = this.AnimLoadPath.length; i < length; ++i) {
            this.releaseSpine(this.animNodes[i], this.AnimLoadPath[i]);
        }
        for (let i = 0, length = this.animBgLoadPath.length; i < length; ++i) {
            this.releaseSpine(this.animBgNodes[i], this.animBgLoadPath[i]);
        }
        for (let i = 0, length = this.textureBgLoadPath.length; i < length; ++i) {
            this.releaseTexture(this.textureBgNodes[i], this.textureBgLoadPath[i]);
        }
    }
});