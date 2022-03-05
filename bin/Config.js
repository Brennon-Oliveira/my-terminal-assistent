import Utils from "./Utils.js";
import fs from "fs"
import { SETTINGS, SETTINGS_FOLDER } from "./Consts.js";
const fsPromises = fs.promises;
const {message, clear, error, success, warning, question, translate, help} = Utils;

class Config {

    services = {
        "--help": this.help,
        "-h": this.help,
        "init": this.init,
        "info": this.info,
        "reset": this.reset
    }
    
    controller = async (action, args)=>{
        if(this.services[action]){
            return await this.services[action](args);
        } else {
            error(`Ação ${action} não encontrada na classe Config`);
        }
    }

    async init(args, firstCommand = false){
        if(!firstCommand){
            clear()
        }
        let isCorrect;
        let name;
        let email;
        let defaultBranchNameTemplate;
        let defaultCommitTemplate;
        let oldSettings;
        const settingAlreadyExists = fs.existsSync(SETTINGS)
        

        if(settingAlreadyExists){
            const settingsFile = await fsPromises.readFile(SETTINGS);
            oldSettings = JSON.parse(settingsFile)
        }

        
        do {
            if (isCorrect === false || settingAlreadyExists){
                message(`Reiniciando a configuração de usuários`);
            } else {
                message(`Iniciando a configuração de usuários`);
            }

            let nameQuestion = `Para iniciar, digite seu nome:`
            let emailQuestion = `Agora, digite seu email:`
            let defaultBranchNameTemplateQuestion = `Qual padrão de nome de branch você acha mais interessante para suas necessidades?` 
            let defaultCommitTemplateQuestion = `Qual padrão de mensagem de commits você acha mais interessante para suas necessidades?`
            if(oldSettings){
                nameQuestion+= ` (Atual: ${oldSettings.name})`
                emailQuestion+= ` (Atual: ${oldSettings.email})`
                defaultCommitTemplateQuestion+= ` (Atual: ${oldSettings.defaultCommitTemplate})`
                defaultBranchNameTemplateQuestion+= ` (Atual: ${oldSettings.defaultBranchNameTemplate})`
            }
            
            let validName = false
            do {
                name = await question(nameQuestion, true);
                if(name.trim() == ''){
                    if(oldSettings){
                        name = oldSettings.name;
                        validName = true
                    } else {
                        warning("Nomes vazios não são permitidos")
                        validName = false
                    }
                } else {
                    name = name.trim()
                    validName = true
                }
            } while(!validName)
            message(`Seja bem vindo, ${name}`);

            let validEmail = false;
            do {
                email = await question(emailQuestion, true);
                if(email.trim() == ''){
                    if(oldSettings){
                        email = oldSettings.email;
                        validEmail = true
                    } else {
                        warning("Por favor, preencha o email")
                        validEmail = false
                    }
                } else {
                    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                    if(emailPattern.test(email)){
                        email = email.trim()
                        validEmail = true
                    } else {
                        warning("Por favor, digite um email válido")
                        validEmail = false
                    }
                }
            } while(!validEmail)

             defaultBranchNameTemplate = await question(defaultBranchNameTemplateQuestion, ["{branch}", "{type}-{branch}"], true)
             defaultCommitTemplate = await question(defaultCommitTemplateQuestion, ["{branch} - {type}: {message}", "{type}: {branch} - {message}", "{type}: {message}"], true)
            
            let isCorrectInput = await question(`
            As informações obtidas foram:
                Name: ${name}
                Email: ${email}
                DefaultBranchNameTemplate: ${defaultBranchNameTemplate}
                DefaultCommitTemplate: ${defaultCommitTemplate}
            Está correto?
            `, ["S", "N"])

            isCorrect = isCorrectInput == "s" ? true : false
        } while (!isCorrect);

        let settings = {};

        if(oldSettings){
            settings = oldSettings
            settings.name = name;
            settings.email = email;
            settings.defaultBranchNameTemplate = defaultBranchNameTemplate;
            settings.defaultCommitTemplate = defaultCommitTemplate;
            success("Usuário atualizado com sucesso!")
        } else {
            settings = {
                name,
                email,
                defaultBranchNameTemplate,
                defaultCommitTemplate
            }
            success("Usuário configurado com sucesso!")
        }

        if(!fs.existsSync(SETTINGS_FOLDER)){
            fs.promises.mkdir(SETTINGS_FOLDER, { recursive: true })
        }

        await fsPromises.writeFile(SETTINGS, JSON.stringify(settings))
    } // Config.init

    async info(){
        if(fs.existsSync(SETTINGS)){
            const settingsFile = await fsPromises.readFile(SETTINGS);
            let oldSettings = JSON.parse(settingsFile)
            let messageText = `Informações do usuário atual:\n`
            let keys = Object.keys(oldSettings);
            keys.forEach(key => {
                let _key = key.charAt(0).toUpperCase() + key.slice(1);
                messageText += `\n\t${_key}: ${oldSettings[key]}`
            });
            messageText = translate(messageText)
            message(messageText)
        } else {
            warning(`
            Nenhum usuário configurado!
            Para configurar um usuário, digite:
                myta config init
            `)
        }
    } // Config.info

    async reset(){
        if(fs.existsSync(SETTINGS)){
            fs.rmSync(SETTINGS)
        }
        success(`
        Configurações resetadas com sucesso
        Por favor, atualize suas informações novamente digitando:
            myta config init
        `)
    }

    async help(){
        help("myta config", [
            {
                name: "init",
                description: "Inicia ou atualiza as configurações básicas do usuário",
            },
            {
                name: "info",
                description: "Apresenta os dados de configuração do usuário atual"
            },
            {
                name: "reset",
                description: "Reseta as configurações do usuário"
            }
        ])
    }
}

export default Config;