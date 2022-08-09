import IUtils from './Interfaces/IUtils.interface';


export default class Plugin {
    services: {[service: string]: Function} = {};

    async controller(utils: IUtils, pluginName: string, action: string, args: Array<string>){
        console.log(args)
        let curServices: {[service: string]: Function} = {} 
        this.services.forEach((service: {[service: string]: Function})=>{
            let keys = Object.keys(service)
            keys.forEach((key)=>{
                curServices[key] = service[key]
            })
        })
        this.services = {
            ...curServices,
            "--help": this.help,
            "-h": this.help
        }
        if(this.services[action]){
            return await this.services[action](utils, args);
        } else {
            utils.error(`Ação ${action} não encontrada na classe ${pluginName}`);
        }
    }

    help(utils: IUtils){

    }
   
}