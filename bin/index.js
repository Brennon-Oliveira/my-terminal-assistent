#!/usr/bin/env node

import fs from "fs"
import Utils from "./Utils.js";
// import Git from './Git.js';
import Config from "./Config.js";
import { SETTINGS } from "./Consts.js";

(async function (){
    if(!fs.existsSync(SETTINGS)){
        Utils.clear()
        Utils.warning(`
        Por favor, antes de prosseguir, faça sus configurações básicas
        `)
        await new Config().init([], true)
        Utils.message(`
        Tudo pronto, agora podemos executar seus comandos da melhor forma
        `)
    }
    const args = process.argv.slice(2);
    args[0] = args[0] ? args[0].toLowerCase() : undefined;
    if(!args[0]){
        Utils.clear()
        Utils.message(`
        O myta (My Terminal Assistent) é um assistente para o terminal, que ajuda a executar comandos no sistema operacional.
        Ele possui vários comandos, que podem ser executados de forma rápida e fácil.
        Para executar um comando, basta digitar:
            myta [comando] [opções]

        No myta, atualmente você pode executar os comandos abaixo:
            myta git [opções]
            myta config [opções]

        Para mais informações sobre um comando, digite:
            myta [comando] --help

        O myta foi feito para simplificar o uso do terminal, e ajudar você a executar comandos com mais facilidade.
        Muito mais virá com o passar do tempo.
        Obrigado por usar o myta!
        `)
        process.exit(0)
    }
    if(args[0] === "config"){
        let config = await new Config()
        
        if(args.length > 1){
            await config.controller(args.slice(1)[0], args.slice(2))
        } else {
            await config.help()
        }
        process.exit(0)
    }
    let Plugins = await Utils.exec(`ls "${process.cwd()}/bin/Plugins"`)
    Plugins = Plugins.stdout.split("\n").filter(plugin => plugin.includes(".js"))
    Plugins = Plugins.map(plugin => plugin.replace(".js", ""))
    if(Plugins.length > 0){
        let command = Plugins.find(plugin => plugin.toLowerCase().includes(args[0]))
        if(command){
            const plugin = await import(`./Plugins/${command}.js`)
            if(args.length > 1){
                await new plugin.default().controller(args.slice(1)[0], args.slice(2))
            } else {
                await new plugin.default().help()
            }
        } else {
            Utils.error(`
            Comando ${args[0]} não encontrado
            `)
        }
    } else {
        Utils.error(`
        Houve um erro ao carregar a lista de plugins
        `)
    }
    process.exit(0)
})()