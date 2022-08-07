#!/usr/bin/env node

import fs from "fs";
import Utils from "./Utils";
import Config from "./Config";
import { SETTINGS } from "./Consts";

(async function () {
    if (!fs.existsSync(SETTINGS)) {
        Utils.clear();
        Utils.warning(`
        Por favor, antes de prosseguir, faça suas configurações básicas
        `);
        await new Config().init([], true);
        Utils.message(`
        Tudo pronto, agora podemos executar seus comandos da melhor forma
        `);
    }
    const args = <Array<string>>process.argv.slice(2);
    args[0] = args[0] ? args[0].toLowerCase() : "";
    if (args[0] === "") {
        Utils.clear();
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
        
                     _____ _____ 
           _____ _ _|_   _|  _  |
          |     | | | | | |     |
          |_|_|_|_  | |_| |__|__|
                |___|            
        `);
        process.exit(0);
    }
    if (args[0] === "config") {
        let config = new Config();

        if (args.length > 1) {
            await config.controller(args.slice(1)[0], args.slice(2));
        } else {
            await config.help();
        }
        process.exit(0);
    }
    let plugins = await Utils.exec(`ls "${process.cwd()}/bin/Plugins"`);
    let Plugins = plugins.stdout.split("\n");
    if (Plugins.length > 0) {
        let command = Plugins.find((plugin) =>
            plugin.toLowerCase().includes(args[0])
        );
        if (command) {
            const plugin = await import(`./Plugins/${command}/${command}`);
            if (args.length > 1) {
                await new plugin.default().controller(
                    command,
                    args.slice(1)[0],
                    args.slice(2)
                );
            } else {
                await new plugin.default().help();
            }
        } else {
            Utils.error(`
            Comando ${args[0]} não encontrado
            `);
        }
    } else {
        Utils.error(`
        Houve um erro ao carregar a lista de plugins
        `);
    }
    process.exit(0);
})();
