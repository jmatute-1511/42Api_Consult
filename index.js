const axios = require("axios");
const readlinesync = require("readline-sync")
const moment = require("moment")
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
    return(res.data[0]["id"])
}

const get_hours = async (access_token, id) =>{

    let res = await axios.get(`https://api.intra.42.fr/v2/users/${id}/locations_stats?begin_at=2022-08-12`,{
        headers:{
            "Authorization" : `Bearer ${access_token}`
        }
    })
    return (res.data)
}
const sum_hours = () =>{

}

const main = async() =>
{
    let intra_token = await get_token();
    let status = true;
    let it = 0;
    let time_now = moment().format('MMMM Do YYYY, h:mm:ss a');
    console.log(time_now)

    while(status)
    {
        //let question = readlinesync.question("42ApiConsult@->")
        let login = readlinesync.question("What is your login: ");
        if (login == "exit"){
            break
        }
        let id = await get_id(intra_token, login);
        let hours = await get_hours(intra_token, id);
        let hours_split = JSON.stringify(hours).split(",")
        while(it < hours_split.length)
        {
            console.log(hours_split[it])
            let slice = hours_split[it].slice(hours_split[it].indexOf(":") + 2, hours_split[it].indexOf("."))
            console.log();
            console.log(slice)
            it++;
        }
        //console.log(hours);
    }
}
main()