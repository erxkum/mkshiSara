//=============================================================================
// NYA_MillSecTimer.js
//=============================================================================
 
/*:
 * @plugindesc v1.2.1 ミリ秒に変更するタイマー関係のプラグイン
 * @author にゃたま
 *
 * @param FontFace
 * @desc タイマー文字列のフォント名です(指定する場合のみ)
 * fontsフォルダに入れて下さい。「.ttf」以外のフォント名のみ
 *
 * @param FontSize
 * @desc フォントサイズ
 * Default: 52
 * @default 52
 *
 * @param FontColor
 * @desc フォント色
 * 例（黒:#000000 白:#ffffff 赤:#ff0000）
 * Default: #ffffff
 * @default  #ffffff
 *
 * @param Width
 * @desc 横幅
 * Default: 136
 * @default 136
 *
 * @param Height
 * @desc 縦幅
 * Default: 68
 * @default 68
 *
 * @param Position X
 * @desc X位置
 * Default: Graphics.width - this.bitmap.width - 10
 * @default Graphics.width - this.bitmap.width - 10

 * @param Position Y
 * @desc Y位置
 * Default: 0
 * @default 0
 *
 * @help
 * 概要:
 * ツクール標準のカウントダウンタイマーの表示をミリ秒表示に変えるプラグインです。
 *
 *
 * プラグインコマンド:
 *   NYA_MillSecTimer add 10          # タイマーを指定秒数増加させる
 *   NYA_MillSecTimer sub 10          # タイマーを指定秒数減少させる
 *   NYA_MillSecTimer pause           # タイマーを一時停止させる
 *   NYA_MillSecTimer resume          # タイマーを再開させる
 *   NYA_MillSecTimer posSet 340 250  # タイマーの表示位置を変更する(x位置,y位置)
 *   NYA_MillSecTimer posSet          # 引数がないとリセットになります
 *   NYA_MillSecTimer color #ffffff   # フォントの色を設定します
 *   NYA_MillSecTimer colorReset      # フォントの色をリセットします
 *   NYA_MillSecTimer posReset        # タイマーの位置をリセットします
 *   NYA_MillSecTimer hide            # タイマーを非表示にします
 *   NYA_MillSecTimer show            # タイマーを表示します
 * 
 * ※このプラグインでは、以下を書き換えていますので、本体アップデートや競合に注意してください。
 *    Sprite_Timer.prototype.createBitmap
 *    Sprite_Timer.prototype.updateBitmap
 *    Sprite_Timer.prototype.updatePosition
 *    Sprite_Timer.prototype.timerText
 *    Sprite_Timer.prototype.redraw
 *    Game_Timer.prototype.start
 *    Game_Timer.prototype.update
 *    Game_Interpreter.prototype.command111
 *    
 *
 * プラグインコマンド:
 *   ありません
 * 
 * 
 * ライセンス:
 * このプラグインは以下のライセンスのもと、使用することができます。 
 *   Copyright (c) 2016 nyatama
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */
 
(function() {
    var getParamString = function(paramNames) {
        var value = getParamOther(paramNames);
        return value == null ? '' : value;
    };
    
    var getParamNumber = function(paramNames, min, max) {
        var value = getParamOther(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value, 10) || 0).clamp(min, max);
    };
    
     var getParamOther = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };
    
    var pluginName = 'NYA_MillSecTimer';
    var parameters = PluginManager.parameters(pluginName);
    var fontFace = getParamString(['FontFace']);
    var fontColor = String(parameters['FontColor'] || '#ffffff');
    var fontSize = Number(parameters['FontSize'] || 52);
    var width = Number(parameters['Width'] || 136);
    var height = Number(parameters['Height'] || 68);
    var posX = String(parameters['Position X'] || 'Graphics.width - this.bitmap.width - 10');
    var posY = String(parameters['Position Y']) || '0';
    var posTimerX = posX;
    var posTimerY = posY;
    var timerColor = fontColor;
    var _hideTimer = false;
    var _timerPause = false;

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'NYA_MillSecTimer') {

            switch (args[0]) {
            case 'add':
                $gameTimer.addFrames(eval(args[1]));
                break;
            case 'sub':
                $gameTimer.subFrames(eval(args[1]));
                break;
            case 'pause':
                $gameTimer.pause();
                break;
            case 'resume':
                $gameTimer.resume();
                break;
            case 'posSet':
                posTimerX = args[1] != null ? Number(args[1]) : posX;
                posTimerY = args[2] != null ? Number(args[2]) : posY;
                break;
            case 'posReset':
                posTimerX = posX;
                posTimerY = posY;
                break;
            case 'colorSet':
                timerColor = args[1];
                break;
            case 'colorReset':
                timerColor = fontColor;
                break;
            case 'hide':
                _hideTimer = true;
                break;
            case 'show':
                _hideTimer = false;
                break;
            }
        }
    };
    
    // _Sprite_Timer_createBitmap override
    var _Sprite_Timer_createBitmap = Sprite_Timer.prototype.createBitmap;
    Sprite_Timer.prototype.createBitmap = function() {
        _Sprite_Timer_createBitmap.call(this);
        this.bitmap = new Bitmap(width, height);
        this.bitmap.textColor = fontColor;
        this.bitmap.fontSize = fontSize;
        if (fontFace) {
            Graphics.loadFont(fontFace, 'fonts/' + fontFace + '.ttf');
            this.bitmap.fontFace = fontFace;
        }
        
    };
    
    // _Sprite_Timer_updateBitmap override
    var _Sprite_Timer_updateBitmap = Sprite_Timer.prototype.updateBitmap;
    Sprite_Timer.prototype.updateBitmap = function() {
        _Sprite_Timer_updateBitmap.call(this);
        if (this._millseconds !== $gameTimer.millseconds()) {
            this._seconds = $gameTimer.seconds();
            this._millseconds = $gameTimer.millseconds();
            this.redraw();
        }
        if(_hideTimer){
            this.opacity = 0;
        }else{
            this.opacity = 255;
        }
        this.bitmap.textColor = timerColor;
    }
    
    // _Sprite_Timer_updatePosition override
    var _Sprite_Timer_updatePosition = Sprite_Timer.prototype.updatePosition;
    Sprite_Timer.prototype.updatePosition = function() {
        _Sprite_Timer_updatePosition.call(this);
        
        this.x = eval(posTimerX);
        this.y = eval(posTimerY);
    };
    
    // _Sprite_Timer_timerText override
    var _Sprite_Timer_timerText = Sprite_Timer.prototype.timerText;
    Sprite_Timer.prototype.timerText = function() {
        _Sprite_Timer_timerText.call(this);
        var min = Math.floor(this._seconds / 60) % 60;
        var sec = this._seconds % 60;
        var millsec = this._millseconds % 60; 
        return min.padZero(2) + ':' + sec.padZero(2) + ':' + millsec.padZero(2);
    }
    
    // _Sprite_Timer_redraw override
    var _Sprite_Timer_redraw = Sprite_Timer.prototype.redraw;
    Sprite_Timer.prototype.redraw = function() {
        _Sprite_Timer_redraw.call(this);
        
    };
    
    //=================================
    // Game_Timer (プラグインスクリプト用)
    //=================================
    
    // override
    var _Game_Timer_start = Game_Timer.prototype.start;
    Game_Timer.prototype.start = function(count) {
        _Game_Timer_start.call(this, count);
        _timerPause = false;
    };

    // override
    var _Game_Timer_update = Game_Timer.prototype.update;
    Game_Timer.prototype.update = function(sceneActive) {
        if (!_timerPause) {
            _Game_Timer_update.call(this, sceneActive);
        }
    };
    
    // Game_Timer に millseconds を追加
    Game_Timer.prototype.millseconds = function() {
        return Math.floor(this._frames);
    };
    
    // Game_Timer に addFrames を追加
    Game_Timer.prototype.addFrames = function(second) {
        this._frames += second * 60;
    };

    // Game_Timer に subFrames を追加
    Game_Timer.prototype.subFrames = function(second) {
        this._frames -= second * 60;
        if (this._frames < 0) {
            this._frames = 0;
        }
    };

    // Game_Timer に pause を追加
    Game_Timer.prototype.pause = function() {
        _timerPause = true;
    };

    // Game_Timer に resume を追加
    Game_Timer.prototype.resume = function() {
        _timerPause = false;
    };


})();


    
// Conditional Branch
Game_Interpreter.prototype.command111 = function() {
    var result = false;
    switch (this._params[0]) {
        case 0:  // Switch
            result = ($gameSwitches.value(this._params[1]) === (this._params[2] === 0));
            break;
        case 1:  // Variable
            var value1 = $gameVariables.value(this._params[1]);
            var value2;
            if (this._params[2] === 0) {
                value2 = this._params[3];
            } else {
                value2 = $gameVariables.value(this._params[3]);
            }
            switch (this._params[4]) {
                case 0:  // Equal to
                    result = (value1 === value2);
                    break;
                case 1:  // Greater than or Equal to
                    result = (value1 >= value2);
                    break;
                case 2:  // Less than or Equal to
                    result = (value1 <= value2);
                    break;
                case 3:  // Greater than
                    result = (value1 > value2);
                    break;
                case 4:  // Less than
                    result = (value1 < value2);
                    break;
                case 5:  // Not Equal to
                    result = (value1 !== value2);
                    break;
            }
            break;
        case 2:  // Self Switch
            if (this._eventId > 0) {
                var key = [this._mapId, this._eventId, this._params[1]];
                result = ($gameSelfSwitches.value(key) === (this._params[2] === 0));
            }
            break;
        case 3:  // Timer
            if ($gameTimer.isWorking()) {
                if (this._params[2] === 0) {
                    // >=が選択されている場合
                    result = ($gameTimer.millseconds() >= this._params[1] * 60);
                } else {
                    // <=が選択されている場合
                    result = ($gameTimer.millseconds() <= this._params[1] * 60);
                }
            }
            break;
        case 4:  // Actor
            var actor = $gameActors.actor(this._params[1]);
            if (actor) {
                var n = this._params[3];
                switch (this._params[2]) {
                    case 0:  // In the Party
                        result = $gameParty.members().contains(actor);
                        break;
                    case 1:  // Name
                        result = (actor.name() === n);
                        break;
                    case 2:  // Class
                        result = actor.isClass($dataClasses[n]);
                        break;
                    case 3:  // Skill
                        result = actor.hasSkill(n);
                        break;
                    case 4:  // Weapon
                        result = actor.hasWeapon($dataWeapons[n]);
                        break;
                    case 5:  // Armor
                        result = actor.hasArmor($dataArmors[n]);
                        break;
                    case 6:  // State
                        result = actor.isStateAffected(n);
                        break;
                }
            }
            break;
        case 5:  // Enemy
            var enemy = $gameTroop.members()[this._params[1]];
            if (enemy) {
                switch (this._params[2]) {
                    case 0:  // Appeared
                        result = enemy.isAlive();
                        break;
                    case 1:  // State
                        result = enemy.isStateAffected(this._params[3]);
                        break;
                }
            }
            break;
        case 6:  // Character
            var character = this.character(this._params[1]);
            if (character) {
                result = (character.direction() === this._params[2]);
            }
            break;
        case 7:  // Gold
            switch (this._params[2]) {
                case 0:  // Greater than or equal to
                    result = ($gameParty.gold() >= this._params[1]);
                    break;
                case 1:  // Less than or equal to
                    result = ($gameParty.gold() <= this._params[1]);
                    break;
                case 2:  // Less than
                    result = ($gameParty.gold() < this._params[1]);
                    break;
            }
            break;
        case 8:  // Item
            result = $gameParty.hasItem($dataItems[this._params[1]]);
            break;
        case 9:  // Weapon
            result = $gameParty.hasItem($dataWeapons[this._params[1]], this._params[2]);
            break;
        case 10:  // Armor
            result = $gameParty.hasItem($dataArmors[this._params[1]], this._params[2]);
            break;
        case 11:  // Button
            result = Input.isPressed(this._params[1]);
            break;
        case 12:  // Script
            result = !!eval(this._params[1]);
            break;
        case 13:  // Vehicle
            result = ($gamePlayer.vehicle() === $gameMap.vehicle(this._params[1]));
            break;
    }
    this._branch[this._indent] = result;
    if (this._branch[this._indent] === false) {
        this.skipBranch();
    }
    return true;
};
