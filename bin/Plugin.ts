import Utils from './Utils';


export default class Plugin {
    services: {[service: string]: Function} = {}

    async controller(pluginName: string, action: string, args: Array<string>){
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
            return await this.services[action](args);
        } else {
            Utils.error(`Ação ${action} não encontrada na classe ${pluginName}`);
        }
    }

    help(args: Array<string>){

    }
   
}