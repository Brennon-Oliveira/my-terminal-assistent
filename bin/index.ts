import fs from "fs";
import Utils from "./Utils";
import Config from "./Config";
import { SETTINGS, SETTINGS_FOLDER } from "./Plugins/Consts";

(async function () {
    let utils = new Utils();
    let isDev = false;
    let isFirstProdTime = false;
    let plugins;
    if(!isDev){
        plugins = await utils.exec(`ls "${SETTINGS_FOLDER}/Plugins"`);
        if(!plugins.stdout.includes("No such file or directory")){
            plugins = await utils.exec("for i in $(ls -d "+SETTINGS_FOLDER+"/Plugins/*/); do echo ${i%%/}; done")
        } else {
            isFirstProdTime = true;
        }
    } else {
        plugins = await utils.exec(`ls "${process.cwd()}/bin/Plugins"`);
    }
    if (!fs.existsSync(SETTINGS) || isFirstProdTime) {
        utils.clear();
        utils.warning(`
        Por favor, antes de prosseguir, faça suas configurações básicas
        `);
        await new Config(utils).init([], true);
        utils.message(`
        Tudo pronto, agora podemos executar seus comandos da melhor forma
        `);
        process.exit(0);
    }
    const args = <Array<string>>process.argv.slice(2);
    args[0] = args[0] ? args[0].toLowerCase() : "";
    if (args[0] === "") {
        utils.clear();
        let plugins = await utils.exec("for i in $(ls -d ~/.myta/Plugins/*/); do echo ${i%%/}; done")
        let pluginList = plugins.stdout.split("\n").filter((plugin)=>{
            return !plugin.includes("Interface") && plugin != ""
        })
        
        let message = "";
        pluginList.forEach((plugin)=>{
            const _plugin = plugin.split("/")[plugin.split("/").length-1]
            let pluginName = _plugin.charAt(0).toLocaleLowerCase() + _plugin.slice(1);
            message += `\tmyta ${pluginName} [opções]\n`
        })
        utils.message(`
        O myta (My Terminal Assistent) é um assistente para o terminal, que ajuda a executar comandos no sistema operacional.
        Ele possui vários comandos, que podem ser executados de forma rápida e fácil.
        Para executar um comando, basta digitar:
            myta [comando] [opções]

        No myta, atualmente você pode executar os comandos abaixo:
        ${message}

        Para mais informações sobre um comando, digite:
            myta [comando] --help

        O myta foi feito para simplificar o uso do terminal, e ajudar você a executar comandos com mais facilidade.
        Muito mais virá com o passar do tempo.
        Obrigado por usar o myta!
        
                     _____ _____ 
           _____ _ _|_   _|  _  |
          |     | | | | | |     |
          |_|_|_|_  | |_| |__|__|
                |___|            
        `);
        process.exit(0);
    }
    if (args[0] === "config") {
        let config = new Config(utils);

        if (args.length > 1) {
            await config.controller(args.slice(1)[0], args.slice(2));
        } else {
            await config.help();
        }
        process.exit(0);
    }
    let Plugins = plugins.stdout.split("\n");
    if (Plugins.length > 0) {
        let dir = Plugins.find((plugin) =>{
            let pluginItems = plugin.split("/")
            return pluginItems[pluginItems.length-1].toLowerCase().includes(args[0])
        }
        )?.split("/");
        if (dir) {
            let command = dir[dir.length-1];
            let plugin: any;
            if(!isDev){
                plugin = await import(`${SETTINGS_FOLDER}/Plugins/${command}/${command}`);
            } else {
                plugin = await import(`./Plugins/${command}/${command}`);
            }
            if (args.length > 1){
                await new plugin.default().controller(
                    utils,
                    command,
                    args.slice(1)[0],
                    args.slice(2)
                );
            } else {
                await new plugin.default().help(utils);
            }
        } else {
            utils.error(`
            Comando ${args[0]} não encontrado
            `);
        }
    } else {
        utils.error(`
        Houve um erro ao carregar a lista de plugins
        `);
    }
    process.exit(0);
})();
