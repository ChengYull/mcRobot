const admin_name = "C_y__"
const mineflayer = require('mineflayer')
const pathfinder = require('mineflayer-pathfinder')
const tool = require("mineflayer-tool");

const bot =mineflayer.createBot({
    username:"miner_bot",
    port:65328
})

var autoVersionForge= require('minecraft-protocol-forge').autoVersionForge;
autoVersionForge(bot._client,null);

bot.loadPlugin(pathfinder.pathfinder)
bot.loadPlugin(tool.plugin)

// 矿石种类
mine_type = {
    "钻石":['diamond_ore','diamond'],
    "铁":['iron_ore','raw_iron','iron_ingot'],
    "金":['gold_ore','gold_ore','gold_ingot'],
    "绿宝石":['emerald_ore','emerald'],
    "青金石":['lapis_ore','dye'],
    "红石":['redstone_ore','redstone']
}

bot.on('chat',(username,message) => {
    if(username != admin_name) return;
    message = message.split(' ');
    console.log(message);

    if(message[0] == "go"){
        botGo(message);
    }

    if(message[0] == "挖"){
        digControl(message);
    }

    if(message[0] == "chest"){
        botChest();
    }

    if(message[0] == "list"){
        bot.chat("我背包有：");
        getList(bot.inventory.items());
    }

    if(message[0] == "stop"){
        bot.chat("我停止了...")
        bot.stopDigging();
        bot.pathfinder.stop();
    }

    if(message[0] == "tp"){
        bot.chat("我来了...");
        bot.chat("/tp "+admin_name);
    }

    if(message[0] == "状态"){
        bot.chat("我来了...");
        bot.chat(`是否移动${bot.controlState}`);
    }
})

// 背包列表
function getList(items){
    answer = "";
    for(item of items){
        answer = answer +' '+ `${item.name} 有 ${item.count} 个`;
    }
    bot.chat(`背包总占用${items.length}格,还剩${36-items.length}格`)
    bot.chat(answer);
}

// 寻路模块
async function botGo(message) {
    // 找到玩家
    const admin_entity = bot.players[admin_name].entity;
    // 设定玩家为目标
    const goal_admin = new pathfinder.goals.GoalFollow(admin_entity, 1);

    switch (message[1]) {
        case "follow":
            // 跟随玩家
            await bot.pathfinder.setGoal(goal_admin, true)
            break;
        case "stop":
            // 停止移动
            bot.pathfinder.stop();
            break;
        case "block":
            if (message.length <= 4) {
                bot.chat("输入有误，请重新输入");
                return;
            }
            x = parseInt(message[2]);
            y = parseInt(message[3]);
            z = parseInt(message[4]);
            const goal_block = new pathfinder.goals.GoalBlock(x, y, z);
            try {
                await bot.pathfinder.setGoal(goal_block);
            } catch (e) {
                console.log(e[0]);
                bot.chat("出现问题，请重新输入");
                return;
            }
            break;

        default:
            // 移动到玩家位置
            await bot.pathfinder.setGoal(goal_admin, false);
    }
}

// 控制持续挖矿
function digControl(message){
    if(message[0] == '挖' && message[1] in mine_type && message.length == 3){
        try{
            // 要挖的矿与数量
            item_name = mine_type[message[1]][0];
            item_id = bot.registry.blocksByName[item_name].id;
            item_count = message[2];

        }catch (e){
            bot.chat("找不到此方块或物品！");
            return;
        }
        botDig(item_id,item_count);

    }else {
        bot.chat("指令有误~请重试")
    }

}
// 挖矿模块
async function botDig(item_id,item_count){
    bot.chat("开始挖矿...")
    // 1、找到要挖的方块
    const blocks = bot.findBlocks({
        matching: item_id,
        count: item_count,
        maxDistance:150
    })
    bot.chat(`找到${blocks.length}个方块`)
    console.log(blocks);
    // 2、具体挖掘过程

    for (const block of blocks) {
        try {
            // 走到方块处
            let goal_block;
            goal_block = new pathfinder.goals.GoalBlock(block.x, block.y, block.z);
            await bot.pathfinder.goto(goal_block);

            // 准备好工具
            let block_in_MC = bot.world.getBlock(block.x, block.y, block.z);
            await bot.tool.equipForBlock(block_in_MC);
            // 开始挖掘
            await bot.dig(block_in_MC);

            // 背包接近满员时开始丢弃杂物
            if (bot.inventory.items().length >= 30) {
                await dropThings();
            }

        } catch (e) {
            console.log("出现异常：" + e);
            continue;
        }
    }
    // 挖完了存储
    //await botChest_auto(item_chest,item_count);
    await storeAllItemsInChest();
    await bot.chat("本次挖矿完成")
    console.trace()
}
// 自动丢弃石头
async function dropThings() {
    items = bot.inventory.slots;
    for (item of items) {
        if (item.name == 'cobblestone' && item.count == 64) {
            await bot.tossStack(bot.inventory.slots[item.slot]);
            return;
        }
    }
}
// 定义一个函数，用于将背包中的除了镐子和铲子之外所有物品存入箱子
async function storeAllItemsInChest() {
    // 前往箱子处
    let goal_block = new pathfinder.goals.GoalBlock(-181, 85, -1);
    await bot.pathfinder.goto(goal_block);

    // 找到箱子
    const chestToOpen = bot.findBlock({
        matching: bot.registry.blocksByName["chest"].id,
        maxDistance: 6
    });
    if (!chestToOpen) {
        // 如果找不到箱子，则提示信息并退出函数
        bot.chat("找不到箱子！");
        return;
    }

    // 打开箱子
    const chest = await bot.openChest(chestToOpen);
    bot.chat("打开箱子了");
    // 遍历机器人背包中的所有物品
    for (const item of bot.inventory.items()) {
        // 排除镐子、铲子工具
        if(item.name.endsWith("pickaxe") || item.name.endsWith("shovel")){
            continue;
        }
        try {
            // 获取物品的 id
            const itemId = bot.registry.itemsByName[item.name].id;
            // 将物品存入箱子
            await chest.deposit(itemId, null, item.count);
        } catch (e) {
            // 如果存储过程中发生错误，则提示信息
            bot.chat("存入物品出错了...");
            return;
        }
    }

    // 关闭箱子
    chest.close();
    // 提示信息
    bot.chat("已将所有物品存入箱子！");
}
// 自动存储模块 参数是要存入的物品名和数量
async function botChest_auto(item_name,item_count){

    goal_block = new pathfinder.goals.GoalBlock(-181, 85, -1);
    await bot.pathfinder.goto(goal_block);

    // 找到箱子
    bot.chat("正在前往箱子的地方...");

    //await bot.waitForTicks(500);

    chestToOpen = bot.findBlock({
        matching: bot.registry.blocksByName['chest'].id,
        maxDistance: 6
    })

    if(!chestToOpen){
        bot.chat("找不到箱子");
        return;
    }

    // 打开箱子
    bot.chat("找到箱子了");
    const chest = await bot.openChest(chestToOpen);

    // 存入矿物
    // 要挖的矿与数量
    try{
        item_id = bot.registry.itemsByName[item_name].id;
    }catch(e){
        bot.chat(`找不到${item_name}`)
        return;
    }
    bot.chat("我要放东西进去了");
    try {
        await chest.deposit(item_id, null, item_count);
    } catch (e) {
        bot.chat("背包物品不足");
        chest.close();
        return;
    }
    bot.chat(`OK 已存入${item_count}个${item_name}`);

    chest.close();
}

// 手动存储
async function botChest(){
    // 找到箱子
    chestToOpen = bot.findBlock({
        matching: bot.registry.blocksByName['chest'].id,
        maxDistance: 6
    })

    if(!chestToOpen){
        bot.chat("找不到箱子");
        return;
    }

    // 打开箱子
    const chest = await bot.openChest(chestToOpen);
    getList(chest.containerItems());

    bot.on('chat',async(username,message) => {
        if(username == bot.username) return;
        message = message.split(' ');

        // 关闭箱子
        if(message[0] == "close"){
            chest.close();
            return;
        }
        // 展示物品
        if(message[0] == "show"){
            getList(chest.containerItems());
        }
        // 根据指令进行交互 in/out [item_name] [item_count]
        if(message.length == 1) return;
        item_name = message[1];
        item_count = parseInt(message[2]);
        try{
            item_id = bot.registry.itemsByName[item_name].id;
        }catch(e){
            bot.chat(`找不到${item_name}`)
            return;
        }
        // 放入物品
        if(message[0] == "in"){
            await chest.deposit(item_id,null,item_count)
            bot.chat(`OK 已存入${item_count}个${item_name}`);
        }
        // 取出物品
        if(message[0] == "out"){
            await chest.withdraw(item_id,null,item_count)
            bot.chat(`OK 已取出${item_count}个${item_name}`);
        }
    })
}

// 受到攻击反击

