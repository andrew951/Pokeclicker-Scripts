// ==UserScript==
// @name        [Pokeclicker] Auto Battle Frontier
// @namespace   Pokeclicker Scripts
// @match       https://www.pokeclicker.com/
// @grant       none
// @version     1.0
// @author      Ephenia
// @description Adds in stage resetting to the Battle Frontier that allows you to set a target stage and infinitely farm the Battle Frontier while being fully AFK. Also, gives the appropriate amount of Battle Points and Money without needing to fail and lose a stage.
// ==/UserScript==

var awaitFloorReset;
var existHTML = false;
var battleFrontFloor;
var bpImg = `<img src="assets/images/currency/battlePoint.svg" height="25px">`
var moneyImg = `<img src="assets/images/currency/money.svg" height="25px">`

function initBattleFrontier() {
    addGlobalStyle('#battle-front-cont { position:absolute;right:5px;top:5px;width:auto;height:41px; }');

    document.getElementById('middle-column').addEventListener('click', event => {
        if (BattleFrontierRunner.started() && existHTML) {
            //console.log("already started")
        }
        if (BattleFrontierRunner.started() && !existHTML) {
            existHTML = true;
            createHTML();
            floorReset();
            //console.log("starting")
        }
    });

    function floorReset() {
        awaitFloorReset = setInterval(function () {
            if (BattleFrontierRunner.started()) {
                if (BattleFrontierRunner.stage() > battleFrontFloor) {
                    battleReset();
                    BattleFrontierRunner.stage(1);
                }
            } else {
                existHTML = false;
                document.getElementById('battle-front-cont').remove();
                clearInterval(awaitFloorReset);
            }
        }, 50);
    }

    function createHTML() {
        var battleFront = document.getElementById('battleFrontierInformation').querySelector('div');
        var bfInput = document.createElement("div");
        bfInput.setAttribute("id", "battle-front-cont");
        bfInput.innerHTML = `<input id="battle-front-input" style="width: 125px;">`
        battleFront.before(bfInput)
        document.getElementById('battle-front-input').value = battleFrontFloor.toLocaleString('en-US');
        document.querySelector('#battle-front-input').addEventListener('input', event => {
            battleFrontFloor = +event.target.value.replace(/[A-Za-z!@#$%^&*()]/g, '').replace(/[,]/g, "");
            localStorage.setItem("battleFrontFloor", battleFrontFloor);
            event.target.value = battleFrontFloor.toLocaleString('en-US');
        });
    }

    function battleReset() {
        // Current stage - 1 as the player didn't beat the current stage
        var stageBeaten = BattleFrontierRunner.stage() - 1;
        if (stageBeaten > 0) {
            // Give Battle Points and Money based on how far the user got
            var battleMultiplier = Math.max(stageBeaten / 100, 1);
            var battlePointsEarned = Math.round(stageBeaten * battleMultiplier);
            var moneyEarned = stageBeaten * 100 * battleMultiplier;
            //notification popup
            Notifier.notify({
                title: 'Battle Frontier',
                message: `You managed to beat stage ` + stageBeaten + `.<br/>You received ` + bpImg + battlePointsEarned.toLocaleString() + ` BP<br>You recieved ` + moneyImg + moneyEarned.toLocaleString() + ` money.`,
                type: NotificationConstants.NotificationOption.success,
            });
            // Award battle points and money
            App.game.wallet.gainBattlePoints(battlePointsEarned);
            App.game.wallet.gainMoney(moneyEarned);
        }
    }
}


if (localStorage.getItem('battleFrontFloor') == null) {
    localStorage.setItem("battleFrontFloor", 0);
}
battleFrontFloor = +localStorage.getItem('battleFrontFloor');

function loadScript(){
    var oldInit = Preload.hideSplashScreen

    Preload.hideSplashScreen = function(){
        var result = oldInit.apply(this, arguments)
        initBattleFrontier()
        return result
    }
}

var scriptName = 'autobattlefrontier'

if (document.getElementById('scriptHandler') != undefined){
    var scriptElement = document.createElement('div')
    scriptElement.id = scriptName
    document.getElementById('scriptHandler').appendChild(scriptElement)
    if (localStorage.getItem(scriptName) != null){
        if (localStorage.getItem(scriptName) == 'true'){
            loadScript()
        }
    }
    else{
        localStorage.setItem(scriptName, 'true')
        loadScript()
    }
}
else{
    loadScript();
}

function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}