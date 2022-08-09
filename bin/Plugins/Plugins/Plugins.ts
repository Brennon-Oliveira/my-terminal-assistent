import { Commands } from '../Decorators';
import IUtils from '../Interfaces/IUtils.interface';
import Plugin from '../Plugin';

@Commands([
    "add",
    "remove",
    "list"
])
export default class Plugins extends Plugin {
    
    async add(utils: IUtils, args: Array<string>){
        let {flags, finalArgs} = utils.getFlags(args, {paramsFlag: ["r","f"]})
        
        if(finalArgs.length < 1){
            utils.error("Nome do plugin precisa ser informado", true);
        }

        let pluginName = finalArgs[0].charAt(0).toUpperCase() + finalArgs[0].slice(1);
        await utils.exec("git clone https://github.com/Brennon-Oliveira/myta-official-plugins.git ~/myta-plugins");

        let pluginLs = await utils.exec(`ls ~/myta-plugins/${pluginName}`);
        
        let pluginAlreadyExists = await utils.exec(`ls ~/.myta/Plugins/${pluginName}`);

        if(pluginAlreadyExists.stdout != ""){
            utils.success(`O plugin ${pluginName} já está instalado!`)
            process.exit(0);
        }

        if(pluginLs.stdout != ""){
            await utils.exec(`sudo cp -r ~/myta-plugins/${pluginName} ~/.myta/Plugins/`)
            await utils.exec("rm -rf ~/myta-plugins")
            utils.message(`Plugin "${pluginName}" adicionado com sucesso`)
        } else{
            utils.error("O plugin informado não existe na lista oficial", true);
        }
    }

    async remove(utils: IUtils, args: Array<string>){
        let {flags, finalArgs} = utils.getFlags(args, {paramsFlag: ["r","f"]})
        
        if(finalArgs.length < 1){
            utils.error("Nome do plugin precisa ser informado", true);
        }

        let pluginName = finalArgs[0].charAt(0).toUpperCase() + finalArgs[0].slice(1);
        let pluginLs = await utils.exec(`ls ~/.myta/Plugins/${pluginName}`);

        if(pluginLs.stdout != ""){
            await utils.exec(`sudo rm -rf ~/.myta/Plugins/${pluginName}`)
            utils.success(`Plugin ${pluginName} removido com sucesso!`)
        } else{
            utils.error("O plugin informado não existe", true);
        }
    }

    async list(utils: IUtils, args: Array<string>){
        
        let plugins = await utils.exec("for i in $(ls -d ~/.myta/Plugins/*/); do echo ${i%%/}; done")
        let pluginList = plugins.stdout.split("\n").filter((plugin)=>{
            return !plugin.includes("Interface") && plugin != ""
        })
        
        let message = "Os plugins instalados atualmente são:\n\n";
        pluginList.forEach((plugin)=>{
            const _plugin = plugin.split("/")
            message += `\t${_plugin[_plugin.length-1]}\n`
        })
        utils.success(message)
    }

    async help(utils: IUtils) {
        utils.help("Plugins", [
            {
                name: "add {Plugin Name}",
                description: "Adiciona um novo plugin"
            },
            {
                name: "remove {Plugin Name}",
                description: "Remove o plugin escolhido"
            },
            {
                name: "list",
                description: "Lista todos os plugins instalados"
            }
        ])  
    }

}