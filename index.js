const axios = require("axios");
const moment = require("moment");
const readlinesync = require("readline-sync")
require("dotenv").config()


const get_token = async () =>{

    let res = await axios.post("https://api.intra.42.fr/oauth/token", {
        grant_type: "client_credentials",
        client_id: process.env.INTRA_UID,
        client_secret: process.env.INTRA_SECRET
    });
    return(res.data.access_token)
}

const get_id = async (access_token, login)=>{
   let res = await axios.get(`https://api.intra.42.fr/v2/users?filter[login]=${login}`,{
        headers:{
            "Authorization" : `Bearer ${access_token}`
        }
    })
    if (res.data[0] != null)
        return(res.data[0]["id"])
    return(null)
}

const get_hours = async (access_token, id) =>{

    let first_time = moment("2022-07-29")
    let relative_time = moment(first_time).add(14, 'days')
    let time_now =moment()
    let timeofnova = [0, 0, 0] 
    if (time_now > relative_time)
    {
        while (time_now > relative_time)
        {
            first_time.add(14, 'days')
            relative_time.add(14, 'days')
        }
    }
    let cut = first_time.format().slice(0,first_time.format().indexOf("T"));
    if (id != null){
        let res = await axios.get(`https://api.intra.42.fr/v2/users/${id}/locations_stats?begin_at=${cut}`,{
            headers:{
                "Authorization" : `Bearer ${access_token}`
            }
         })  
        sum_hours(res.data, timeofnova)
        console.log(`Horas de log : ${timeofnova[0]} days ${timeofnova[1]}:${timeofnova[2]}`)
    }
    else{
        console.log("Invalid login!")
    }
}
const get_events = async (intra_token, id) =>{
    let res = await axios.get()

}
const sum_hours = (my_hours, timeofnova) =>{

    let it = 0;
    let hours_split= JSON.stringify(my_hours).split(",")
    while(it < hours_split.length)
    {
        cut  = hours_split[it].slice(hours_split[it].indexOf(":") + 2, hours_split[it].indexOf("."))
        timeofnova[1] += parseInt(cut.slice(0,2), 10);
        timeofnova[2] += parseInt(cut.slice(3,5), 10);
        if(timeofnova[2] >= 60){
            timeofnova[2] -= 60;
            timeofnova[1]++;
            if(timeofnova[1] >= 24){
                timeofnova[1] -= 24;
                timeofnova[0] += 1
            }
        }
        it++;
    }
    return(timeofnova)
}
const white_nova = async (intra_token, login)=>{

    let id = await get_id(intra_token, login);
    await get_hours(intra_token, id);
    
}

const select_action = async (intra_token, question) =>{

    let compare = question.split(" ")
    if (compare[0] == 'whitenova')
        await white_nova(intra_token, compare[1])
}

const main = async() =>
{
    let intra_token = await get_token();
    let status = true;
    
    while(status)
    {
        let question = readlinesync.question("42ApiConsult@->");
        await select_action(intra_token, question);
    }
}
main()