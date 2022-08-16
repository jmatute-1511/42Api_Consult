const axios = require("axios");
const moment = require("moment");
const readlinesync = require("readline-sync")
require("dotenv").config()

const sleep = (ms) =>{
    return new Promise(resolve => setTimeout(resolve, ms));
}

const req_to_api = async (string, access_token) =>{
    let res = await axios.get(`https://api.intra.42.fr/v2/${string}`,{
        headers:{
            "Authorization" : `Bearer ${access_token}`
        }
    })
    return(res.data)
}
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
const get_now_whitenova = ()=>{
    let first_time = moment("2022-07-29")
    let relative_time = moment(first_time).add(14, 'days')
    let time_now =moment()
    if (time_now > relative_time)
    {
        while (time_now > relative_time)
        {
            first_time.add(14, 'days')
            relative_time.add(14, 'days')
        }
    }
    let cut = first_time.format().slice(0,first_time.format().indexOf("T"));
    return(cut)

}

const get_hours = async (access_token, id, now_whitenova) =>{

    let timeofnova = [0, 0, 0];

    if (id != null){
        await sleep(550)
        let res = await req_to_api(`/users/${id}/locations_stats?begin_at=${now_whitenova}`, access_token)
        sum_hours(res, timeofnova)
        console.log(`Hours being logged in : ${timeofnova[0]} days and ${timeofnova[1]}:${timeofnova[2]} hours `)
    }
    else{
        console.log("Invalid login!")
    }
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

const get_events = async (access_token, id, now_whitenova) =>{
    
    let time_now = moment().format()
    let cut = time_now.slice(0,time_now.indexOf("T"))
    
    await sleep(550)
    let res = await req_to_api(`users/${id}/events_users?range[updated_at]=${now_whitenova},${cut}`,access_token)
    if (res.length == 0)
        console.log("You have not attended events")
    else{
        console.log(`Yo have attended ${res.length} events`)
    }
}
const get_corrections = async (access_token,id, now_whitenova) =>{
    
    let time_now = moment().format()
    let cut = time_now.slice(0, time_now.indexOf("T"))
    await sleep(550)
    let res = await req_to_api(`/users/${id}/scale_teams/as_corrector?range[created_at]=${now_whitenova},${cut}`, access_token)
    if (res.length == 0){
        console.log(`You have not made corrections in this cycle`)
    }
    else{
        console.log(`ou have made ${res.length} corrections`)
    }

}
const white_nova = async (intra_token, id)=>{
    let now_whitenova = get_now_whitenova();
    await get_hours(intra_token, id, now_whitenova)
    await get_events(intra_token, id, now_whitenova)
    await get_corrections(intra_token,id, now_whitenova)
}

const select_action = async (intra_token, question) =>{

    let compare = question.split(" ")
    let id = await get_id(intra_token, compare[1]);
    if (compare[0] == 'whitenova')
        await white_nova(intra_token, id)
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