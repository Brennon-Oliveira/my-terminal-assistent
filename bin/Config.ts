import Utils from "./Utils";
import fs from "fs"
import { SETTINGS, SETTINGS_FOLDER, LOCAL_STORAGE } from "./Consts";
import IUtils from "./Plugins/Interfaces/IUtils.interface";
const fsPromises = fs.promises;
// const {message, clear, error, success, warning, question, translate, help} = new Utils();

class Config {

    services: {[service: string]: Function} = {
        "--help": this.help,
        "-h": this.help,
        "init": this.init,
        "info": this.info,
        "reset": this.reset
    }

    utils: IUtils

    constructor(utils: IUtils){
        this.utils = utils
    }
    
    controller = async (action: string, args: Array<string>)=>{
        if(this.services[action]){
            return await this.services[action](args);
        } else {
            this.utils.error(`Ação ${action} não encontrada na classe Config`);
        }
    }

    async init(args: Array<string>, firstCommand = false){
        if(!firstCommand){
            this.utils.clear()
        }
        let isCorrect;
        let name;
        let email;
        let defaultBranchNameTemplate;
        let defaultCommitTemplate;
        let oldSettings;
        const settingAlreadyExists = fs.existsSync(SETTINGS)
        

        if(settingAlreadyExists){
            const settingsFile = <unknown>await fsPromises.readFile(SETTINGS);
            oldSettings = JSON.parse(<string>settingsFile)
        }

        
        do {
            if (isCorrect === false || settingAlreadyExists){
                this.utils.message(`Reiniciando a configuração de usuários`);
            } else {
                this.utils.message(`Iniciando a configuração de usuários`);
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
                name = await this.utils.question(nameQuestion);
                if(name.trim() == ''){
                    if(oldSettings){
                        name = oldSettings.name;
                        validName = true
                    } else {
                        this.utils.warning("Nomes vazios não são permitidos")
                        validName = false
                    }
                } else {
                    name = name.trim()
                    validName = true
                }
            } while(!validName)
            this.utils.message(`Seja bem vindo, ${name}`);

            let validEmail = false;
            do {
                email = await this.utils.question(emailQuestion);
                if(email.trim() == ''){
                    if(oldSettings){
                        email = oldSettings.email;
                        validEmail = true
                    } else {
                        this.utils.warning("Por favor, preencha o email")
                        validEmail = false
                    }
                } else {
                    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                    if(emailPattern.test(email)){
                        email = email.trim()
                        validEmail = true
                    } else {
                        this.utils.warning("Por favor, digite um email válido")
                        validEmail = false
                    }
                }
            } while(!validEmail)

             defaultBranchNameTemplate = await this.utils.question(defaultBranchNameTemplateQuestion, ["{branch}", "{type}-{branch}"], true)
             defaultCommitTemplate = await this.utils.question(defaultCommitTemplateQuestion, ["{branch} - {type}: {message}", "{type}: {branch} - {message}", "{type}: {message}"], true)
            
            let isCorrectInput = await this.utils.question(`
            As informações obtidas foram:
                Name: ${name}
                Email: ${email}
                DefaultBranchNameTemplate: ${defaultBranchNameTemplate}
                DefaultCommitTemplate: ${defaultCommitTemplate}
            Está correto?
            `, ["S", "N"])

            isCorrect = isCorrectInput == "s" ? true : false
        } while (!isCorrect);

        let settings: {[setting: string]: string} = {};

        if(oldSettings){
            settings = oldSettings
            settings.name = name;
            settings.email = email;
            settings.defaultBranchNameTemplate = defaultBranchNameTemplate;
            settings.defaultCommitTemplate = defaultCommitTemplate;
            this.utils.success("Usuário atualizado com sucesso!")
        } else {
            settings = {
                name,
                email,
                defaultBranchNameTemplate,
                defaultCommitTemplate
            }
            this.utils.success("Usuário configurado com sucesso!")
        }

        if(!fs.existsSync(SETTINGS_FOLDER)){
            fs.promises.mkdir(SETTINGS_FOLDER, { recursive: true })
        }

        if(!fs.existsSync(LOCAL_STORAGE)){
            await fsPromises.writeFile(LOCAL_STORAGE, JSON.stringify({}))
        }

        let plugin = await this.utils.exec(`sudo ls "/usr/share/myta/Plugins"`);
        if(plugin.stderr.includes("No such file or directory")){
            await this.utils.exec("sudo mkdir -p /usr/share/myta/Plugins");
            await this.utils.exec("sudo cp -r ./bin/Plugins/* /usr/share/myta/Plugins/");
        }

        await fsPromises.writeFile(SETTINGS, JSON.stringify(settings))
    } // Config.init

    async info(){
        if(fs.existsSync(SETTINGS)){
            const settingsFile = <unknown>await fsPromises.readFile(SETTINGS);
            let oldSettings = JSON.parse(<string>settingsFile)
            let messageText = `Informações do usuário atual:\n`
            let keys = Object.keys(oldSettings);
            keys.forEach(key => {
                let _key = key.charAt(0).toUpperCase() + key.slice(1);
                messageText += `\n\t${_key}: ${oldSettings[key]}`
            });
            messageText = this.utils.translate(messageText)
            this.utils.message(messageText)
        } else {
            this.utils.warning(`
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
        this.utils.success(`
        Configurações resetadas com sucesso
        Por favor, atualize suas informações novamente digitando:
            myta config init
        `)
    }

    async help(){
        this.utils.help("myta config", [
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
