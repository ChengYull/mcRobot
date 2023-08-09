const admin_name = "C_y__"
const mineflayer = require('mineflayer')
const pathfinder = require('mineflayer-pathfinder')
const tool = require("mineflayer-tool");
const bot =mineflayer.createBot({
    username:"wakaung_bot2",
    port:58255
})


bot.loadPlugin(pathfinder.pathfinder)
bot.loadPlugin(tool.plugin)

bot.on('chat',(username,message) => {
    if(username != admin_name) return;
    message = message.split(' ');
    bot.chat("尼玛!");
    console.log(message);

    if(message[0] == "go"){
        botGo(message);
    }
})
bot.on('spawn',async (username,message) => {
    if(username != admin_name) return;
    message = message.split(' ');
    bot.chat("尼玛!");
    console.log(message);

    if(message[0] == "go"){
        botGo(message);
    }
    if(message[0] == "dig"){
        dig();
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
async function dig() {
    // 1、找到要挖的方块
    const blocks = bot.findBlocks({
        matching: 1,
        count: 32
    })
    console.log(blocks);
    // 2、具体挖掘过程
    for (const block of blocks) {
        try { // 走到方块处
            const goal_block = new pathfinder.goals.GoalBlock(block.x, block.y, block.z);
            await bot.pathfinder.goto(goal_block);

            // 准备好工具
            block_in_MC = bot.world.getBlock(block.x, block.y, block.z);
            await bot.tool.equipForBlock(block_in_MC);
            // 开始挖掘
            await bot.dig(block_in_MC)
        } catch (e) {
            continue;
        }

    }
}