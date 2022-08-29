import { Commands } from '../Decorators';
import IUtils from '../Interfaces/IUtils.interface';
import Plugin from '../Plugin';

@Commands([
    "add",
    "remove",
    "list",
    "update",
])
export default class Plugins extends Plugin {
    
    async add(utils: IUtils, args: Array<string>){
        let {flags, finalArgs} = utils.getFlags(args, {paramsFlag: ["r"]})
        
        if(finalArgs.length < 1){
            utils.error("Nome do plugin precisa ser informado", true);
        }

        let unavailablePlugin = "O plugin informado não existe na lista oficial";
        let pluginName = finalArgs[0].charAt(0).toUpperCase() + finalArgs[0].slice(1);
        let repository = "https://github.com/Brennon-Oliveira/myta-official-plugins.git";
        if(flags.r){
            const confirmExternalPlugin = await utils.question(
                "Esse plugin não será baixado do repositório oficial, tem certeza que deseja prosseguir?",
                ["s", "n"]
            )
            if(confirmExternalPlugin == "n"){
                utils.error("Processo de instalação do plugin cancelado!", true);
            }
            unavailablePlugin = "O plugin informado não foi encontrado";
            repository = flags.r as string;
        }
        await utils.exec(`git clone ${repository} ~/myta-plugins`);

        let pluginLs = await utils.exec(`ls ~/myta-plugins/${pluginName}`);
        
        let pluginAlreadyExists = await utils.exec(`ls ~/.myta/Plugins/${pluginName}`);

        if(pluginAlreadyExists.stdout != ""){
            utils.success(`O plugin ${pluginName} já está instalado!`)
            process.exit(0);
        }

        if(pluginLs.stdout != ""){
            await utils.exec(`sudo cp -r ~/myta-plugins/${pluginName} ~/.myta/Plugins/`)
            await utils.exec("sudo rm -rf ~/myta-plugins")
            utils.message(`Plugin "${pluginName}" adicionado com sucesso`)
        } else{
            utils.error(unavailablePlugin, true);
        }
    }

    async remove(utils: IUtils, args: Array<string>){
        let {flags, finalArgs} = utils.getFlags(args, {});
        
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

    async update(utils: IUtils, args: Array<string>){
        await this.remove(utils, args);
        await this.add(utils, args);
        utils.success("Plugin atualizado!");
    }
    
    async help(utils: IUtils) {
        utils.help("Plugins", [
            {
                name: "add {Plugin Name}",
                description: "Adiciona um novo plugin",
                flags: [
                    {
                        name: "r {Repository}",
                        description: "Importa o plugin de um repositório externo"
                    }
                ]
            },
            {
                name: "remove {Plugin Name}",
                description: "Remove o plugin escolhido"
            },
            {
                name: "update {Plugin Name}",
                description: "Atualiza um plugin instalado",
                flags: [
                    {
                        name: "r {Repository}",
                        description: "Busca atualização do plugin em um repositório externo"
                    }
                ]
            },
            {
                name: "list",
                description: "Lista todos os plugins instalados"
            }
        ])  
    }


}