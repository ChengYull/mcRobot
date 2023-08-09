// 引入 mineflayer 库
const mineflayer = require('mineflayer');

// 创建机器人实例
const bot = mineflayer.createBot({
    username: "ChatGPT",
    port: 65328
});
bot.on('chat',(username,message) => {
    message = message.split(' ');
    if(username == bot.username) return;
    console.log(message);

    if(message[0] == "in"){
        storeAllItemsInChest();
    }
})

// 定义一个函数，用于将背包中的所有物品存入箱子
async function storeAllItemsInChest() {
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