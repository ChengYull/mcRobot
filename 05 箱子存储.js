const admin_name = "C_y__"
const mineflayer = require('mineflayer');
const bot =mineflayer.createBot({
    username:"cunChu_bot",
    port:65328
})

bot.on('chat',(username,message) => {
    if(username != admin_name) return;
    message = message.split(' ');
    bot.chat("来了!");
    console.log(message);

    if(message[0] == "list"){
        getList(bot.inventory.items());
    }
    if(message[0] == "chest"){
        botChest();
    }
})

function getList(items){
    answer = "";
    for(item of items){
        answer = answer +' '+ `${item.name} * ${item.count}`;
    }
    bot.chat(answer);
}

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
        if(message[0] == "in" && message[1] == "all"){
            for (let item of bot.inventory.items()) {

                try {
                    itemId = bot.registry.itemsByName[item.name].id;
                    await chest.deposit(itemId, null, item.count);
                } catch (e) {
                    console.log(e);
                    bot.chat("存入物品 出错");
                }
                console.log(item.name + "->" + item.count);
            }
            chest.close();
            return;
        }
        if(message[0] == "out" && message[1] == "all"){
            for(let item of chest.containerItems()){
                let itemId = bot.registry.itemsByName[item.name].id;
                await chest.withdraw(itemId,null,item.count);
                console.log(item.name + "->" + item.count);
            }
            chest.close();
            return;
        }
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
            try {
                await chest.deposit(item_id, null, item_count)
                bot.chat(`OK 已存入${item_count}个${item_name}`);
            } catch (e) {
                bot.chat("存入物品出错了...")
            }
        }
        // 取出物品
        if(message[0] == "out"){
            try {
                await chest.withdraw(item_id,null,item_count)
                bot.chat(`OK 已取出${item_count}个${item_name}`);
            } catch (e) {
                bot.chat("取出物品出错了...")
            }

        }
    })
}