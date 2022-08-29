import IUtils from './Interfaces/IUtils.interface';


export default class Plugin {
    services: {[service: string]: Function} = {};

    async controller(utils: IUtils, pluginName: string, action: string, args: Array<string>){
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
            await this.default(utils);
            const service = this.services[action].bind(this);
            return await service(utils, args);
        } else {
            utils.error(`Ação ${action} não encontrada na classe ${pluginName}`);
        }
    }

    async default(utils: IUtils){

    }

    help(utils: IUtils){

    }
   
}