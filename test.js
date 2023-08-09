
// 矿石种类
mine_type = {
    "钻石":['diamond_ore','diamond'],
    "铁":['iron_ore','raw_iron','iron_ingot']

}
console.log(mine_type["钻石"][0])
console.log(mine_type["铁"][1])
console.log(mine_type)

if("钻石" in mine_type){
    console.log("在里面")
}
str = "diamond_pickaxe"
str1 = "diamond_shovel"


console.log(str.endsWith("pickaxe"))
