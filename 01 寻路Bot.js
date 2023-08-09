const admin_name = "C_y__"
const mineflayer = require('mineflayer')
const pathfinder = require('mineflayer-pathfinder')
const bot =mineflayer.createBot({
    username:"miner_bot",
    port:58255
})


bot.loadPlugin(pathfinder.pathfinder)

bot.on('chat',(username,message) => {
    if(username != admin_name) return;
    message = message.split(' ');
    bot.chat("尼玛!");
    console.log(message);

    if(message[0] == "go"){
        botGo(message);
    }
})

function botGo(message){
    // 找到玩家
    const admin_entity = bot.players[admin_name].entity;
    // 设定玩家为目标
    const goal_admin = new pathfinder.goals.GoalFollow(admin_entity,1);

    switch (message[1]){
        case "follow":
            // 跟随玩家
            bot.pathfinder.setGoal(goal_admin, true)
            break;
        case "stop":
            // 停止移动
            bot.pathfinder.stop();
            break;
        case "block":
            if(message.length <= 4){
                bot.chat("输入有误，请重新输入");
                return;
            }
            x = parseInt(message[2]);
            y = parseInt(message[3]);
            z = parseInt(message[4]);
            const goal_block = new pathfinder.goals.GoalBlock(x, y, z);
            try {
                bot.pathfinder.setGoal(goal_block);
            } catch (e){
                console.log(e[0]);
                bot.chat("出现问题，请重新输入");
                return;
            }
            break;

        default:
            // 移动到玩家位置
            bot.pathfinder.setGoal(goal_admin,false);
    }
}