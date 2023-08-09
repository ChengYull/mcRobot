const mineflayer = require('mineflayer')
const bot =mineflayer.createBot({
    username:"first_bot",
    port:58255
})

function sayHi(){
    bot.chat('Hi')
}

bot.once('spawn',sayHi)

