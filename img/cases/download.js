const cases = require("../../config/case.json")

const init = async()=>
{
    for(let i of cases)
    {
        console.log(`wget ${i.img_url}`)
    }
}

init()