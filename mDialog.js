/**
 * $.mDialog
 * version: 0.1
 * @requires jQuery or zepto
 */
(function($) {
    var $uiMask,
        $uiTips,
        _uiTipsTimer = null,
        _allDialog = {};

    $.mDialog = {
        /**
         * 锁住屏幕
         * $.ui.lock({
         *      opacity:0.5,
         *      clickFn:function(){
         *
         *      }
         * })
         */
        lock: function(opt) {
            opt = $.extend({
                opacity: 0.5
            }, opt);
            if (!$uiMask) {
                $uiMask = $('<div id="uiMask" class="ui-mask"></div>');
                $uiMask.appendTo("body");
            }
            if ($.isFunction(opt.clickFn)) {
                $uiMask.bind("click", opt.clickFn);
            }
            $uiMask.css({
                "opacity": opt.opacity,
                display: "block"
            });
        },
        /**
         * 解锁屏幕
         */
        unLock: function() {
            if ($uiMask) {
                $uiMask.hide();
                $uiMask.unbind();
            }
        },
        getDialog: function(dialogId) {
            return _allDialog[dialogId];
        },
        closeDialog: function(dialogId) {
            var dialogObj = this.getDialog(dialogId);
            if (!dialogObj) {
                return;
            }
            if (dialogObj.opt.lock) {
                this.unLock();
            }
            dialogObj.$dialog.remove();
        },
        /*
         * opt= {
         * id:"id必填"
         * title: "",
         * content: "",
         * width: 200,
         * height: "auto",
         * lock: true,
         * ok: true,
         * cancel: true,
         * close: true,
         * button: ""
         * onInit: function(dialog) {}
         * }
         */
        dialog: function(opt) {
            var that = this;
            if (!opt.id) {
                throw Error("id必填");
                return;
            }
            opt = $.extend({
                dialogId: "uiDialog-" + opt.id,
                title: "",
                content: "",
                width: 200,
                height: "auto",
                lock: true,
                ok: true,
                cancel: true,
                close: true,
                button:"",
                onInit: function() {}
            }, opt);            

            var tmplArr = [];
            tmplArr.push('<div id="' + opt.dialogId + '" class="ui-dialog">');
            tmplArr.push('<div class="ui-dialog-header"><div class="ui-dialog-title">' + opt.title + '</div>');
            if (opt.close) {
                tmplArr.push('<a href="javascript:;" class="ui-dialog-close" title="关闭"></a>');
            }
            tmplArr.push('</div><div class="ui-dialog-content">' + opt.content + '</div><div class="ui-dialog-footer">');
            if (opt.ok) {
                tmplArr.push('<input type="button" class="ui-dialog-button ui-dialog-ok" value="确定" />');
            }
            if (opt.cancel) {
                tmplArr.push('<input type="button" class="ui-dialog-button ui-dialog-cancel" value="取消" />');
            }
            if (opt.button) {
                tmplArr.push(opt.button);
            }
            tmplArr.push('</div></div>');

            var $dialog = $("#" + opt.dialogId);
            if (!$dialog.length > 0) {
                this.closeDialog(opt.id);
            }
            $dialog = $(tmplArr.join(""));
            $dialog.appendTo("body");

            _allDialog[opt.id] = {
                opt: opt,
                $dialog: $dialog
            };

            function bindFn(fn) {
                if (fn === true) {
                    return function() {
                        that.closeDialog(opt.id);
                    }
                } else if ($.isFunction(fn)) {
                    var tmpfn = fn;
                    return function() {
                        if (tmpfn.call(_allDialog[opt.id]) !== false) {
                            that.closeDialog(opt.id);
                        }
                    }
                }
                return null;
            }

            $(".ui-dialog-ok", $dialog).bind("click", bindFn(opt.ok));
            $(".ui-dialog-cancel", $dialog).bind("click", bindFn(opt.cancel));
            $(".ui-dialog-close", $dialog).bind("click", bindFn(opt.close));
            if (opt.lock) {
                this.lock();
            }            
            
            $dialog.css({
                display:"block",                
                width: opt.width,
                height: opt.height,
                left: opt.left,
                top: opt.top
            });

            var ml = -$dialog.width()/2;
            var mt = -$dialog.height()/2;
            $dialog.css({
                marginLeft:ml,
                marginTop:mt
            });


            if ($.isFunction(opt.onInit)) {
                opt.onInit.call(_allDialog[opt.id]);
            }
        },
        alert: function(msg, fn, title) {
            this.dialog({
                id: "alert",
                title: title || "提示",
                lock: true,
                content: msg.toString(),
                ok: fn,
                cancel: false
            });
        },
        confirm: function(msg, ok, cancel, title) {
            this.dialog({
                id: 'confirm',
                title: '确认提示',
                lock: true,
                content: msg.toString(),
                ok: ok,
                cancel: cancel
            });
        },
        prompt: function(title, defaultVal, fn) {
            var selector = "input[name=ui-dialog-prompt]";
            this.dialog({
                id: 'prompt',
                title: title,
                lock: true,
                content: '<input class="ui-dialog-input" name="ui-dialog-prompt" type="text" value="" />',
                ok: function() {
                    var val = this.$dialog.find(selector).val();
                    if ($.isFunction(fn)) {
                        fn(val);
                    }
                },
                cancel: true,
                onInit: function() {
                    this.$dialog.find(selector).val(defaultVal);
                }
            });
        },
        /**
         * type = |text|loading|info|error|succeed|
         */
        tips: function(msg, type, time) {
            var that = this;
            if (!$uiTips) {
                $uiTips = $('<div id="uiTips" class="ui-tips"><span class="ui-tips-i"><span class="ui-tips-icon"></span><span class="ui-tips-text"></span></span></div>');
                $uiTips.appendTo("body");
                $uiTips.bind("click", function() {
                    that.closeTips();
                });
            }
            $uiTips.attr("class", "ui-tips ui-tips-" + type);
            $(".ui-tips-text", $uiTips).html(msg);
            $uiTips.show();
            clearTimeout(_uiTipsTimer);
            if (!isNaN(time)) {
                _uiTipsTimer = setTimeout(function() {
                    that.closeTips();
                }, time * 1000);
            }
        },
        closeTips: function() {
            if ($uiTips) {
                $uiTips.hide();
                $(".text", $uiTips).empty();
            }
        }
    };

}($));
