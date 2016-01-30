game.MainScreen = me.ScreenObject.extend({

    init: function () {
        this.font = new me.Font("Verdana", 12, "#fff", "center");
    },

    onResetEvent: function () {
        // Connect to server and set global reference to the socket that's connected
        if (me.game.HASH.debug === true) {
            console.log("gameStarted")
        }

        me.levelDirector.loadLevel("area01");

        setTimeout(function() {

            if (me.game.HASH.debug === true) {
                console.log("player init.");
            }

            Object.keys(game.data.lobbyPlayers).forEach(function (id) {

                var playerInfo = game.data.lobbyPlayers[id];
                if (me.game.HASH.debug === true) {
                    console.log("player added " + playerInfo.id)
                }
                var player = me.pool.pull("mainPlayer", playerInfo.x, playerInfo.y, playerInfo.id, playerInfo.spriteIndex);
                me.game.world.addChild(player);
                game.data.players[playerInfo.id] = player;
                if (game.data.clientId === playerInfo.id.substring(2)) {
                    if (me.game.HASH.debug === true) {
                        console.log("localPlayer added for " + game.data.clientId);
                    }
                    game.data.localPlayer = player;
                }


            });

            game.data.lobbyPlayers = {};
        }, 500);


        global.network.socket.on("refreshPlayer", function (infos) {
            var player = game.functions.playerById(infos.id);

            if (me.game.HASH.debug === true) {
                console.log("refreshPlayer " + player.playerId + "@" + infos.x + "," + infos.y);
            }

            if (player) {
                player.refresh(infos);
            }
        });

        global.network.socket.on("scoreUpdate", function (score) {
            game.data.score = score.gauge;
            game.data.time = score.time;
        });

        global.network.socket.on("spy", function () {
            game.data.localSpy = true;
        });

        global.network.socket.on("removePlayer", function (playerId) {
            var player = game.functions.playerById(playerId);
            me.game.world.removeChild(player);
            game.data.players[playerId] = null;
        });

         global.network.socket.on("victory",function(playerId){
            game.data.victory = true; 
            game.data.ended = true;
        });

          global.network.socket.on("defeat",function(playerId){
            game.data.defeat = true;
            game.data.ended = true;
        });

         me.levelDirector.loadLevel("area01");


        me.input.bindKey(me.input.KEY.LEFT, "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP, "up");
        me.input.bindKey(me.input.KEY.DOWN, "down");
        me.input.bindKey(me.input.KEY.X, "dance");
        me.input.bindKey(me.input.KEY.W, "mark");


        var player = me.pool.pull("networkPlayer");
        me.game.world.addChild(player);

        this.HUD = new game.HUD.Container();
        me.game.world.addChild(this.HUD);

    }

});
