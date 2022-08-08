
import readLine from 'readline';
import { exec, ExecException } from 'child_process';
const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});
import colors from "colors/safe.js";
import TranslatedWords from './TranslatedWord';
import fs from "fs"
const fsPromises = fs.promises;
import { SETTINGS, LOCAL_STORAGE } from "./Consts";
import IUtils, { flags } from './Plugins/Interfaces/IUtils.interface';

class Utils extends IUtils {
    async question(
        receiveQuestion: string,
        options: Array<string> = [],
        multline: boolean = false
    ): Promise<string>{
        return await new Promise(async (resolve, reject) => {
            try {
                if (options && options.length > 0) {
                    let validResponse;
                    let finalResponse = "";
                    do {
                        if (multline) {
                            let message = `${receiveQuestion}\n`;
                            let indexes: Array<string> = [];
                            options.forEach((option, index)=>{
                                message += `${index+1} - ${option}\n`;
                                indexes.push((index + 1).toString());
                            })
                            let userChoose = await this.question(message);
                            if(indexes.includes(userChoose)) {
                                validResponse = true;
                                finalResponse = options[parseInt(userChoose) - 1];
                            } else {
                                validResponse = false;
                                await this.warning(
                                    "O valor de entrada é inválido\nPor favor, selecione um dos valores válidos"
                                );
                            }
                        } else {
                            let lines = this.tabRemove(receiveQuestion);
                            receiveQuestion = lines.join("\n")
                            finalResponse = await this.question(
                                `${receiveQuestion}: (${options.join(" - ")})`
                            );
                            const formattedOptions = options.map((option) =>
                                option.toLowerCase()
                            );
                            if (formattedOptions.includes(finalResponse.toLowerCase())) {
                                validResponse = true;
                            } else {
                                validResponse = false;
                                await this.warning(
                                    "O valor de entrada é inválido\nPor favor, selecione um dos valores válidos"
                                );
                            }
                        }
                    } while (!validResponse);
                    return resolve(finalResponse);
                } else {
                    receiveQuestion = this.translate(receiveQuestion);
                    console.log(colors.cyan("----------------------------------"));
                    let lines = this.tabRemove(receiveQuestion);
                    lines.forEach(line => {
                        console.log(colors.cyan(`   ${line}`))
                    })
                    rl.question(``, (response) => {
                        console.log(colors.cyan("----------------------------------"));
                        return resolve(response);
                    });
                }
            } catch(e){
                console.log(e)
                process.exit(0)
            }
        });
    }

    async exec(command: string): Promise<{
        stdout: string;
        stderr: string;
        error: ExecException | null;
    }>{
        return await new Promise((resolve, reject)=>{
            try{
                exec(command, (error, stdout, stderr)=>{
                    resolve({stdout, stderr, error})
                })
            } catch(err){
                reject(err)
            }
        })
    }
    
    async message(message: string){
        let lines = this.tabRemove(message);

        console.log(colors.cyan(`Mensagem -------------------------\n`))
        lines.forEach(line => {
            console.log(colors.cyan(`   ${line}`))
        })
        console.log(colors.cyan(`\n----------------------------------`))
    }
    
    async error(message: string, exit = true){
        let lines = this.tabRemove(message);

        console.log(colors.red("Erro -----------------------------\n"))
        lines.forEach(line => {
            console.log(colors.red(`   ${line}`))
        })
        console.log(colors.red("\n----------------------------------"))
        if(exit){
            process.exit(1);
        }
    }

    async success(message: string){
        let lines = this.tabRemove(message);

        console.log(colors.green("Sucesso --------------------------\n"))
        lines.forEach(line => {
            console.log(colors.green(`   ${line}`))
        })
        console.log(colors.green("\n---------------------------------"))
    }

    async warning(message: string){
        let lines = this.tabRemove(message);

        console.log(colors.yellow("Aviso ---------------------------\n"))
        lines.forEach(line => {
            console.log(colors.yellow(`   ${line}`))
        })
        console.log(colors.yellow("\n----------------------------------"))
    }

    tabRemove(message: string): Array<string>{
        message = message.trim()
        let lines = message.split("\n")

        // Array.from(message.split("\n")[4]).forEach(char => {
        //     if(char == ' '){
        //         console.log(char)
        //     }
        // });

        let minSpaceCount = 0;

        lines.forEach(line => {
            let currentSpaceCount = 0;
            for(let char of Array.from(line)){
                if(char == ' '){
                    currentSpaceCount++;
                } else {
                    break;
                }
            }
            if(!minSpaceCount || currentSpaceCount < minSpaceCount){
                minSpaceCount = currentSpaceCount;
            }
        })

        for(let line in lines){
            // remove spaces from the beginning of the line if is not a character
            let lineText = Array.from(lines[line]);
            let charsToRemove = 0;
            for(let char of lineText){
                if(char == ' ' && charsToRemove < minSpaceCount){
                    charsToRemove++;
                } else {
                    break
                }
            }
            if(charsToRemove > 0){
                lineText.splice(0, charsToRemove);
            }
            lines[line] = lineText.join('');
        }
        return lines
    }

    translate(text: string): string{
        let words = Object.keys(TranslatedWords);
        words = words.sort((a, b)=>{
            return b.length - a.length
        })
        words.forEach(word=>{
            let reg = new RegExp(word, "g");
            text = text.replace(reg, TranslatedWords[word])
        })
        return text;
    }

    getFlags(
        args: Array<string>,
        {boolFlags= [], paramsFlag = []} : {
            boolFlags?: Array<string>;
            paramsFlag?: Array<string>;
        }
    ): {flags: flags, finalArgs: Array<string>}{
        let nextIsAParamOf = '';
        let nextIsAParam = false;
        let flags: flags = {};
        let finalArgs = [];
        for(let arg of args){
            if(nextIsAParam){
                nextIsAParam = false;
                flags[nextIsAParamOf] = arg
            } else if(arg.includes("-")){
                if(arg.includes("--")){
                    arg = arg.substring(2);
                } else {
                    arg = arg.substring(1);
                }
                Array.from(arg).forEach((charArg: string)=>{
                    if(boolFlags.includes(charArg)){
                        flags[charArg] = true
                    } else if(paramsFlag){
                        nextIsAParam = true;
                        nextIsAParamOf = charArg                        
                    }
                })
            } else {
                finalArgs.push(arg)
            }
        }
        return {flags, finalArgs};
    }

    help(parent: string, commands: Array<{
        name: string;
        description: string;
        flags?: Array<{
            name: string;
            description: string;
        }>;
    }>){
        let message = colors.bold(parent);
        commands.forEach(command=>{
            message+=`\n\n\t${colors.bold(command.name)} : ${colors.italic(command.description)}`
            if(command.flags && command.flags.length > 0){
                command.flags.forEach(flag=>{
                    message+=`\n\t\t${colors.bold(flag.name)}: ${colors.italic(flag.description)}`
                })
            }
        })
        message += `\n\n\n\t ${colors.bold("-h ou --help")} : Exibe lista e descrição dos comandos`
        this.message(message)
    }

    async delay(delay = 500){
        return await new Promise((resolve, reject)=>{
            setTimeout(resolve, delay)
        })
    }

    useTemplate(template: string, values: {[keys: string]: string}): string{
        let keys = Object.keys(values);
        keys = keys.sort((a, b)=>{
            return b.length - a.length
        })
        keys.forEach(key=>{
            let reg = new RegExp(`{${key}}`, "g");
            template = template.replace(reg, values[key])
        })
        return template
    }

    async getSettings(): Promise<{[keys: string]: string}>{
        const settingsFile = <unknown> await fsPromises.readFile(SETTINGS);
        let settings = JSON.parse(<string>settingsFile)
        return settings
    }

    clear(){
        process.stdout.write('\x1Bc');
    }
    
    async getLocalStorage(key: string): Promise<Object>{
        const localStorageData = <unknown>await fsPromises.readFile(LOCAL_STORAGE);
        const localStorage = JSON.parse(<string>localStorageData)[key];

        return localStorage;
    }

    async setLocalStorage(key: string, value: string){
        const localStorageData = <unknown>await fsPromises.readFile(LOCAL_STORAGE);
        let localStorageObj = JSON.parse(<string>localStorageData);
        localStorageObj[key] = value;
        
        await fsPromises.writeFile(LOCAL_STORAGE, JSON.stringify(localStorageObj))
    }
}

export default Utils;