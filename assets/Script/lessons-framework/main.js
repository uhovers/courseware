/**
 * 课件主脚本
 * by houzehang
 */

//-- 组件列表
const COMP_INFO = {
    ContextTransfer: false,
    ClickTimes: false,
    ArticleContrller: false,
    ClickAppear: false,
    AudioController: false,
    ClickDrag: false,
    ClickTimes: false,
    StageController: false,
    AnimController: false,
    SubtitleController: false,
};
//-- 必须绑定的组件
const FORCE_BIND_COMPS = ['ContextTransfer'];

const ZORDER_CFG = {
    TOP: 1000
};
//-- 枚举配置    
const EnumCfg = require('./config/EnumCfg');
//-- 设计分辨率
const DESIGNRESOLUTION_WIDTH = 1960,
    DESIGNRESOLUTION_HEIGHT = 1536,
    FITWIDTH = true,
    FITHEIGHT = false;
const DISPLAY_NAME_PREFIX = '━━━';

let canvas, canvasNode;

cc.__find = (name)=>{
    let scene = cc.director.getScene()
    let result = null
    if (scene) {
        let children = scene.children
        console.log('MINGXI_DEBUG_LOG>>>>>>>>>__find start',children.length);
        children.map((child)=>{
            if (child && child.name && /^lesson/.test(child.name)) {
                // Editor.log('MINGXI_DEBUG_LOG>>>>>>>>>find child ' + child.name)
                console.log('MINGXI_DEBUG_LOG>>>>>>>>>find child ',child.name);
                result = child
            }
        })
        if (result) {
            return result
        }
    }
    return cc.find(name)
}

let theProperties = {
    _: {
        get: function() {
            // this.autoBindLogicComponent();
            this.resetDesignResolution();
        }
    },
    BaseUI: {
        default: false,
        displayName: DISPLAY_NAME_PREFIX + "基础界面",
    },
    _bgframe: {
        default: null,
        type: cc.SpriteFrame
    },
    Background: {
        type: cc.SpriteFrame,
        displayName: "背景图片",
        visible() {
            return !!this.BaseUI;
        },
        get: function() {
            let _canvas = cc.find('Canvas');
            if (_canvas) {
                let background = _canvas.getChildByName('background');
                if (!background) {
                    this._bgframe = null
                } else {
                    let sprite = background.getComponent(cc.Sprite);
                    if (sprite) {
                        let bgframe = background.getComponent(cc.Sprite).spriteFrame;
                        if (this._bgframe != bgframe) {
                            this._bgframe = bgframe;
                        }
                    }
                };
            } else {
                return this._bgframe;
            }
        },
        set: function(bgframe) {
            this._bgframe = bgframe;

            let _canvas = cc.__find('Canvas');
            let sprite;
            let background = _canvas.getChildByName('background');
            if (background) {
                if (!bgframe) {
                    background.removeFromParent(true);
                    background = null;
                } else {
                    sprite = background.getComponent(cc.Sprite);
                }
            } else {
                background = new cc.Node();
                sprite = background.addComponent(cc.Sprite);
                background._name = 'background';
                _canvas.addChild(background, -1);
            }
            if (sprite) {
                sprite.spriteFrame = bgframe;
            }
            if (background) {
                let scale = DESIGNRESOLUTION_WIDTH / background.getContentSize().width;
                background.scaleX = background.scaleY = scale;
            }
        }
    },
    _titleFrame: {
        default: null,
        type: cc.SpriteFrame
    },
    Title: {
        type: cc.SpriteFrame,
        displayName: "标题图片",
        visible() {
            return !!this.BaseUI;
        },
        get: function() {
            let _canvas = cc.__find('Canvas');
            if (_canvas) {
                let title = _canvas.getChildByName('title');
                if (!title) {
                    this._titleFrame = null
                } else {
                    let sprite = title.getComponent(cc.Sprite);
                    if (sprite) {
                        let titleFrame = title.getComponent(cc.Sprite).spriteFrame;
                        if (this._titleFrame != titleFrame) {
                            this._titleFrame = titleFrame;
                        }
                    }
                };
            } else {
                return this._titleFrame;
            }
        },
        set: function(bgframe) {
            this._titleFrame = bgframe;

            let _canvas = cc.__find('Canvas');
            let sprite;
            let title = _canvas.getChildByName('title');
            if (title) {
                if (!bgframe) {
                    title.removeFromParent(true);
                } else {
                    sprite = title.getComponent(cc.Sprite);

                }
            } else {
                title = new cc.Node();
                sprite = title.addComponent(cc.Sprite);
                title._name = 'title';
                _canvas.addChild(title, 0);
            }
            if (sprite) {
                sprite.spriteFrame = bgframe;
            }
            title && this.updateTitlePosition();
        }
    },
    _titleMarginTop: 0,
    TitleMarginTop: {
        visible() {
            return !!this.BaseUI;
        },
        get: function() {
            return this._titleMarginTop;
        },
        set: function(val) {
            this._titleMarginTop = val;
            this.updateTitlePosition();
        },
        displayName: "标题距离顶部",
    },

    _magicBackFrame: {
        default: null,
        type: cc.SpriteFrame
    },
    MagicBack: {
        type: cc.SpriteFrame,
        displayName: "收回魔法图片",
        visible() {
            return !!this.BaseUI;
        },
        get: function() {
            let _canvas = cc.__find('Canvas');
            if (_canvas) {
                let magicRegain = _canvas.getChildByName('magicRegain');
                if (!magicRegain) {
                    this._magicBackFrame = null
                } else {
                    let sprite = magicRegain.getComponent(cc.Sprite);
                    if (sprite) {
                        let magicBackFrame = magicRegain.getComponent(cc.Sprite).spriteFrame;
                        if (this._magicBackFrame != magicBackFrame) {
                            this._magicBackFrame = magicBackFrame;
                        }
                    }
                };
            } else {
                return this._magicBackFrame;
            }
        },
        set: function(magicBackFrame) {
            this._magicBackFrame = magicBackFrame;

            let _canvas = cc.__find('Canvas');
            let sprite;
            let magicRegain = _canvas.getChildByName('magicRegain');
            if (magicRegain) {
                if (!magicBackFrame) {
                    magicRegain.removeFromParent(true);
                } else {
                    sprite = magicRegain.getComponent(cc.Sprite);

                }
            } else {
                magicRegain = new cc.Node();
                sprite = magicRegain.addComponent(cc.Sprite);
                magicRegain._name = 'magicRegain';
                _canvas.addChild(magicRegain, ZORDER_CFG.TOP);
            }
            if (sprite) {
                sprite.spriteFrame = magicBackFrame;
            }
        }
    },
    _titleMarginTop: 0,
    TitleMarginTop: {
        visible() {
            return !!this.BaseUI;
        },
        get: function() {
            return this._titleMarginTop;
        },
        set: function(val) {
            this._titleMarginTop = val;
            this.updateTitlePosition();
        },
        displayName: "标题距离顶部",
    },



    AutoBindLogicComponent: {
        default: true,
        visible() {
            return false;
        },
        displayName: DISPLAY_NAME_PREFIX + "逻辑脚本",
    },
    // ============= ContextTransfer =============
    ContextTransfer: {
        default: !!COMP_INFO.ContextTransfer,
        displayName: DISPLAY_NAME_PREFIX + "上下文",
    },
    ContextTransfer_secretNodes: {
        type: [cc.Node],
        default: [],
        visible() {
            return !!this.ContextTransfer;
        },
        displayName: "对学生隐藏",
    },
    ContextTransfer_mouseMoveListener:{
        default: false,
        visible() {
            return !!this.ContextTransfer;
        },
        displayName: "监听鼠标移动",
    },
    ContextTransfer_userUpdateListener:{
        default: true,
        visible() {
            return !!this.ContextTransfer;
        },
        displayName: "用户数据更新",
    },
    ContextTransfer_hideForTeacher: {
        type: [cc.Node],
        default: [],
        visible() {
            return !!this.ContextTransfer;
        },
        displayName: "对教师隐藏",
    },
    ContextTransfer_btnCloseMagic: {
        type: cc.Node,
        default: null,
        visible() {
            return false;
            // return !!this.ContextTransfer;
        },
        displayName: "收魔法棒",
    },
    ContextTransfer_watchingKeys: {
        type: [cc.Enum(EnumCfg.EWatchingKeys)],
        default: [],
        visible() {
            return !!this.ContextTransfer;
        },
        displayName: "按键监听",
    },

    // ============= ClickAppear =============
    ClickAppear: {
        default: !!COMP_INFO.ClickAppear,
        displayName: DISPLAY_NAME_PREFIX + "点击出现",
    },
    ClickAppear_curIndex: {
        default: 0,
        visible() {
            return !!this.ClickAppear;
        },
        displayName: "当前进度",
    },
    ClickAppear_appearingNodes: {
        type: [cc.Node],
        default: [],
        visible() {
            return !!this.ClickAppear;
        },
        displayName: "出现节点",
    },
    ClickAppear_disappearAt: {
        type: [cc.Integer],
        default: [],
        visible() {
            return !!this.ClickAppear;
        },
        displayName: "消失时机",
    },
    ClickAppear_withClickAudio: {
        default: true,
        visible() {
            return !!this.ClickAppear;
        },
        displayName: "点击音效",
    },
    ClickAppear_nodeType: {
        type: cc.Enum(EnumCfg.ENodeType),
        default: [],
        visible() {
            return !!this.ClickAppear;
        },
        displayName: "节点类型",
    },
    ClickAppear_appearStyle: {
        type: cc.Enum(EnumCfg.EAppaerStyle),
        default: EnumCfg.EAppaerStyle.INORDER,
        visible() {
            return !!this.ClickAppear;
        },
        displayName: "出现方式",
    },
    ClickAppear_isAllAready: {
        default: true,
        visible() {
            return !!this.ClickAppear;
        },
        displayName: "准备就绪",
    },

    // ============= 点击计数 =============
    ClickTimes: {
        default: !!COMP_INFO.ClickTimes,
        displayName: DISPLAY_NAME_PREFIX + "点击计数",
    },
    ClickTimes_countEnabled: {
        default: false,
        visible() {
            return !!this.ClickTimes;
        },
        displayName: "点击计数开关",
    },
    ClickTimes_touchPriority: {
        default: -1,
        visible() {
            return !!this.ClickTimes;
        },
        displayName: "点击优先级",
    },

    // ============= ClickDrag =============
    ClickDrag: {
        default: !!COMP_INFO.ClickDrag,
        displayName: DISPLAY_NAME_PREFIX + "点击拖拽",
    },
    ClickDrag_dragNodes: {
        type: [cc.Node],
        default: [],
        visible() {
            return !!this.ClickDrag;
        },
        displayName: "拖拽物品",
    },
    ClickDrag_seatNode: {
        type: [cc.Node],
        default: [],
        visible() {
            return !!this.ClickDrag;
        },
        displayName: "位置节点",
    },
    ClickDrag_dragChangeFrame: {
        type: [cc.SpriteFrame],
        default: [],
        visible() {
            return !!this.ClickDrag;
        },
        displayName: "图片frame",
    },
    ClickDrag_auxSeatNode: {
        type: [cc.Node],
        default: [],
        visible() {
            return !!this.ClickDrag;
        },
        displayName: "辅助拖中位置",
    },
    ClickDrag_withAudio: {
        default: false,
        visible() {
            return !!this.ClickDrag;
        },
        displayName: "附带音效",
    },
    ClickDrag_needUpdateProgress: {
        default: false,
        visible() {
            return !!this.ClickDrag;
        },
        displayName: "上传进度",
    },
    ClickDrag_hideSeatFinally: {
        default: false,
        visible() {
            return !!this.ClickDrag;
        },
        displayName: "拖完隐藏位置",
    },
    ClickDrag_needSeatExsit:{
        default: true,
        visible() {
            return !!this.ClickDrag;
        },
        displayName: "需要座位存在",
    },
    ClickDrag_showSeatFinally: {
        default: false,
        visible() {
            return !!this.ClickDrag;
        },
        displayName: "拖完显示位置",
    },
    ClickDrag_dragRules: {
        default: [],
        type: [cc.String],
        visible() {
            return !!this.ClickDrag;
        },
        displayName: "拖拽规则",
    },
    ClickDrag_isAllReady: {
        default: true,
        visible() {
            return !!this.ClickDrag;
        },
        displayName: "准备就绪",
    },
    ClickDrag_withOutDrag: {
        default: false,
        visible() {
            return !!this.ClickDrag;
        },
        displayName: "无需拖拽",
    },
    ClickDrag_sitDownStyle: {
        default: EnumCfg.ESitDownStyle.SITDOWN,
        type: cc.Enum(EnumCfg.ESitDownStyle),
        visible() {
            return !!this.ClickDrag;
        },
        displayName: "坐下方式",
    },
    ClickDrag_allowMultiRole: {
        default: false,
        visible() {
            return !!this.ClickDrag;
        },
        displayName: "可承载多个",
    },
    ClickDrag_calcProgressStyle: {
        default: EnumCfg.ECalcProgressStyle.SEAT_BASE,
        type: cc.Enum(EnumCfg.ECalcProgressStyle),
        visible() {
            return !!this.ClickDrag;
        },
        displayName: "进度计算标准",
    },

    // ============= 声音 =============
    AudioController: {
        default: !!COMP_INFO.AudioController,
        displayName: DISPLAY_NAME_PREFIX + "音频",
    },
    AudioController_clickAudio: {
        default: null,
        url: cc.AudioClip,
        visible() {
            return !!this.AudioController;
        },
        displayName: "点击音效",
    },
    AudioController_rightAudio: {
        default: null,
        url: cc.AudioClip,
        visible() {
            return !!this.AudioController;
        },
        displayName: "正确音效",
    },
    AudioController_wrongAudio: {
        default: null,
        url: cc.AudioClip,
        visible() {
            return !!this.AudioController;
        },
        displayName: "错误音效",
    },
    AudioController_magicAudio: {
        default: null,
        url: cc.AudioClip,
        visible() {
            return !!this.AudioController;
        },
        displayName: "魔法棒音效",
    },
    AudioController_bgMusic: {
        default: null,
        url: cc.AudioClip,
        visible() {
            return !!this.AudioController;
        },
        displayName: "背景音乐",
    },
    AudioController_customAudios: {
        default: [],
        type: [cc.AudioClip],
        visible() {
            return !!this.AudioController;
        },
        displayName: "自定义音乐列表",
    },
    AudioController_articleAudios: {
        default: [],
        type: [cc.AudioClip],
        visible() {
            return false; //-- 暂时没有用到
            // return !!this.AudioController;
        },
        displayName: "插图读音",
    },
    AudioController_subtitleAudios: {
        default: [],
        type: [cc.AudioClip],
        visible() {
            return !!this.AudioController;
        },
        displayName: "字幕读音",
    },
    AudioController_subtitleAudioDurations: {
        default: [],
        type: [cc.Float],
        visible() {
            return !!this.AudioController;
        },
        displayName: "字幕时长",
    },

    // ============= AnimController =============
    AnimController: {
        default: !!COMP_INFO.AnimController,
        displayName: DISPLAY_NAME_PREFIX + "动画",
    },

    AnimController_playAuto: {
        default: false,
        visible() {
            return !!this.AnimController;
        },
        displayName: "自动播放",
    },

    AnimController_nextAuto: {
        default: false,
        visible() {
            return !!this.AnimController;
        },
        displayName: "自动继续",
    },

    AnimController_hideOthersWhenPlaying: {
        default: true,
        visible() {
            return !!this.AnimController;
        },
        displayName: "播放时隐藏其它",
    },

    AnimController_btnPlay: {
        type: cc.Node,
        default: null,
        visible() {
            return !!this.AnimController;
        },
        displayName: "播放按钮",
    },

    AnimController_animNodes: {
        type: [cc.Node],
        default: [],
        visible() {
            return !!this.AnimController;
        },
        displayName: "动画节点",
    },
    AnimController_AnimLoadPath:{
        type:[cc.String],
        default: [],
        visible() {
            return !!this.AnimController;
        },
        displayName: "动态加载路径",
    },
    AnimController_animNames: {
        default: [],
        type: [cc.String],
        visible() {
            return !!this.AnimController;
        },
        displayName: "动画名称",
    },
    AnimController_animNodeRelease: {
        default: [],
        type: [cc.Boolean],
        visible() {
            return !!this.AnimController;
        },
        displayName: "动画释放",
    },
    AnimController_animLoopTimes: {
        type: [cc.Integer],
        default: [],
        visible() {
            return !!this.AnimController;
        },
        displayName: "循环次数",
    },

    AnimController_animTimeScale: {
        type: [cc.Float],
        default: [],
        visible() {
            return !!this.AnimController;
        },
        displayName: "时间缩放",
    },


    // ============= StageController =============
    StageController: {
        default: !!COMP_INFO.StageController,
        displayName: DISPLAY_NAME_PREFIX + "舞台控件",
    },

    StageController_stageNodes: {
        type: [cc.Node],
        default: [],
        visible() {
            return !!this.StageController;
        },
        displayName: "舞台节点",
    },

    StageController_curStageId: {
        default: 0,
        visible() {
            return !!this.StageController;
        },
        displayName: "当前舞台ID",
    },

    // ============= SubtitleController =============
    SubtitleController: {
        default: !!COMP_INFO.SubtitleController,
        displayName: DISPLAY_NAME_PREFIX + "普通字幕",
    },

    SubtitleController_subtitle: {
        type: cc.Prefab,
        default: null,
        visible() {
            return !!this.SubtitleController;
        },
        displayName: "字幕预制",
    },
    SubtitleController_bottom: {
        type: cc.Integer,
        default: 30,
        visible() {
            return !!this.SubtitleController;
        },
        displayName: "距离底部距离",
    },
    SubtitleController_subtitleHeight: {
        type: cc.Integer,
        default: 243,
        visible() {
            return !!this.SubtitleController;
        },
        displayName: "字幕白框高度",
    },

    SubtitleController_redSentences: {
        type: [cc.SpriteFrame],
        default: [],
        visible() {
            return !!this.SubtitleController;
        },
        displayName: "红字纹理",
    },

    SubtitleController_blackSentences: {
        type: [cc.SpriteFrame],
        default: [],
        visible() {
            return !!this.SubtitleController;
        },
        displayName: "黑字纹理",
    },

    SubtitleController_audioTimeLengthArr: {
        type: [cc.Float],
        default: [],
        visible() {
            return !!this.SubtitleController;
        },
        displayName: "字幕时长",
    },
    SubtitleController_autoHideFontOnEnd: {
        default: true,
        visible(){
            return !!this.SubtitleController;
        },
        displayName: "结束时自动隐藏"
    },

    // ============= ArticleContrller =============
    ArticleContrller: {
        default: !!COMP_INFO.ArticleContrller,
        displayName: DISPLAY_NAME_PREFIX + "滑动字幕",
    },
    ArticleContrller_container: {
        type: cc.Node,
        default: null,
        visible() {
            return !!this.ArticleContrller;
        },
        displayName: "字幕容器",
    },
    ArticleContrller_redSentences: {
        type: [cc.SpriteFrame],
        default: [],
        visible() {
            return !!this.ArticleContrller;
        },
        displayName: "红字纹理",
    },
    ArticleContrller_blackSentences: {
        type: [cc.SpriteFrame],
        default: [],
        visible() {
            return !!this.ArticleContrller;
        },
        displayName: "黑字纹理",
    },
    ArticleContrller_audioTimeLengthArr: {
        type: [cc.Float],
        default: [],
        visible() {
            return !!this.ArticleContrller;
        },
        displayName: "每行时长",
    },
    ArticleContrller_maxDisplayCount: {
        default: -1,
        visible() {
            return !!this.ArticleContrller;
        },
        displayName: "展示行数",
    },
    ArticleContrller_lineSpacing: {
        default: 0,
        visible() {
            return !!this.ArticleContrller;
        },
        displayName: "行间距",
    },
    ArticleContrller_alignStyle: {
        type: cc.Enum(EnumCfg.EETextAlignStyle),
        default: EnumCfg.EETextAlignStyle.LEFT,

        visible() {
            return !!this.ArticleContrller;
        },
        displayName: "对齐方式",
    },
    ArticleContrller_showAllAtBegin: {
        default: false,
        visible() {
            return !!this.ArticleContrller;
        },
        displayName: "开始前显示所有",
    },
    ArticleContrller_scorllDuration: {
        default: 1,
        visible() {
            return !!this.ArticleContrller;
        },
        displayName: "滚动一行耗时(-s)",
    },
    ArticleContrller_isIndependence: {
        default: false,
        visible() {
            return !!this.ArticleContrller;
        },
        displayName: "各句相互独立",
    },
}


//-- 使用属性
cc.Class({
    extends: cc.Component,

    autoBindLogicComponent() {
        let self = this;
        if (!this.AutoBindLogicComponent) return;
        if (!this._preCheckTime) {
            this._preCheckTime = Date.now();
        }
        if (Date.now() - this._preCheckTime > 1000) {
            this._preCheckTime = Date.now();
            let curScene = cc.director.getScene();
            if (curScene) {
                let _canvas = cc.__find('Canvas');
                let lessonId = /\d+$/.exec(curScene._name);
                let logicName = 'lesson' + lessonId;
                let comp = _canvas.getComponent(logicName);
                if (!comp) {
                    let path = require('path');
                    let fs = require('fs');
                    let searchPath = __dirname.substring(0, __dirname.indexOf('temp') - 1);

                    function fileDisplay(filePath) {
                        fs.readdir(filePath, function(err, files) {
                            if (err) {
                                Editor.log(err)
                            } else {
                                files.forEach(function(filename) {
                                    let filedir = path.join(filePath, filename);
                                    fs.stat(filedir, function(eror, stats) {
                                        if (eror) {
                                            // Editor.log('获取文件stats失败');
                                        } else {
                                            let isFile = stats.isFile();
                                            let isDir = stats.isDirectory();
                                            // if (isFile && ~filedir.indexOf(logicName + '.js') && !~filedir.indexOf(logicName + '.js.meta')) {
                                            //     // setTimeout(() => {
                                            //     //     self.addComp(logicName);
                                            //     // }, 500)
                                            // } else 
                                            if (isDir) {
                                                fileDisplay(filedir);
                                            }
                                        }
                                    })
                                });
                            }
                        });
                    }
                    fileDisplay(searchPath);
                }
            }
        }
    },

    updateTitlePosition() {
        let _canvas = cc.__find('Canvas');
        if (!_canvas) return;

        let title = _canvas.getChildByName('title');
        if (!title) return;

        let displayComp = title.getComponent('DisplayController') || title.addComponent('DisplayController');
        if (!displayComp) return;

        displayComp['top'] = this._titleMarginTop;


        let winVisibleSize = cc.view.getVisibleSize();
        let orgPos = title.getPosition();
        let finalX = orgPos.x,
            finalY = orgPos.y;

        finalY = DESIGNRESOLUTION_HEIGHT / 2 - this._titleMarginTop;
        title.anchorY = 1;
        title.setPosition(cc.p(finalX, finalY));
    },

    resetDesignResolution() {
        let _canvas = cc.__find('Canvas');
        if (!_canvas) return;
        canvas = _canvas;
        let canvasComp = _canvas.getComponent(cc.Canvas);
        if (!canvasComp) return;
        if (canvasComp.designResolution.width == DESIGNRESOLUTION_WIDTH && canvasComp.designResolution.height == DESIGNRESOLUTION_HEIGHT && canvasComp.fitWidth && !canvasComp.fitHeight) return;

        canvasComp.designResolution = cc.size(DESIGNRESOLUTION_WIDTH, DESIGNRESOLUTION_HEIGHT);
        canvasComp.fitWidth = true;
        canvasComp.fitHeight = false;

        Editor.log("DesignResolution Reseted [", '  CanvasWidth : ' + DESIGNRESOLUTION_WIDTH, '  CanvasHeight : ' + DESIGNRESOLUTION_HEIGHT, "  FitWidth : " + FITWIDTH, "  FitHeight : " + FITHEIGHT + ']');
    },

    _addComp(comp, config) {
        this._compsStoredMap = this._compsStoredMap || {}
        if (!comp) return;
        this._compsStoredMap[comp] = config;
        // Editor.log('addComp this._compsStoredMap = ', this._compsStoredMap);
    },

    addComp(comp, config) {
        let _component;
        // canvas = canvas || cc.__find('Canvas');
        canvas = cc.__find('Canvas');
        if (!canvas) return;
        _component = canvas.getComponent(comp) || canvas.addComponent(comp);
        // _component = canvas.addComponent(comp);
        if (!_component) return;

        config = config || {};
        for (let key in config) {
            _component[key] = config[key];
        }
        // Editor.log('addComp  + comp + ']');
    },

    _removeComp(comp) {
        this._compsStoredMap = this._compsStoredMap || {}
        if (!comp) return;
        delete this._compsStoredMap[comp];
        // Editor.log('removeComp this._compsStoredMap = ', this._compsStoredMap);
    },

    removeComp(comp) {
        canvas = canvas || cc.__find('Canvas');
        if (!canvas) return;
        canvas.removeComponent(comp);
        // Editor.log('removeComp  + comp + ']');
    },

    properties: theProperties,

    onLoad() {
        //-- 基础组件
        Object.keys(COMP_INFO).map((compName) => {
            if (this[compName] || ~FORCE_BIND_COMPS.indexOf(compName)) {
                this.addComp(compName, this.getCompData(compName));
            }
        })
    },

    getCompData(prifix) {
        if (!this.allKeys) this.allKeys = Object.keys(this);
        let result = {};
        prifix = prifix + '_';
        this.allKeys.map((key) => {
            if (~key.indexOf(prifix)) {
                let info = this[key];
                key = key.replace(prifix, '')
                result[key] = info;
            }
        });
        return result;
    },
});