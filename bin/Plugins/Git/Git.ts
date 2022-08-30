import { Commands } from "../Decorators";
import IUtils from "../Interfaces/IUtils.interface";
import Plugin from "../Plugin";
import fs from 'fs';
import { SETTINGS_FOLDER } from '../Consts';
import ICommitFiles from "./interfaces/ICommitFiles.interface";

@Commands([
    "pull",
    "commit",
    "configurate"
])
export default class Git extends Plugin{

    private gitSettings: string = SETTINGS_FOLDER + "/gitSettings.json";

    async default(utils: IUtils){
        if(!fs.existsSync(this.gitSettings)){
            utils.clear();
            utils.warning("Primeiro vamos configurar seu myta git");
            await this.configurate(utils);
        }
    }

    public async configurate(utils: IUtils){
        let gitSettings: {[key: string]: unknown} | undefined;
        if(fs.existsSync(this.gitSettings)){
            gitSettings = JSON.parse(fs.readFileSync(this.gitSettings).toString());
        }
        let finalEmail: string = "";
        let finalName: string = "";
        const settings = await utils.getSettings();
        const typesOfPatterns = [
            "{message}",
            "{type}: {message}",
            "{branch} - {type}: {message}",
        ];
        let defaultCommitTemplate = gitSettings? gitSettings["defaultCommitTemplate"] : "";
        if(
            defaultCommitTemplate &&
            typeof defaultCommitTemplate === "string"
        ){
            typesOfPatterns.push(defaultCommitTemplate)
        } 
        utils.message("Vamos iniciar a configuação do seu git");
        let patternChoose = await utils.question(
            "Primeiro, qual pattern de commit deseja utilizar?",
            [
                ...typesOfPatterns,      
                "Criar pattern personalizado"
            ],
            true
        )
        if(!typesOfPatterns.includes(patternChoose)){
            patternChoose = await utils.question(`
                Para criar seu pattern personalizado, digite o padrão de commit que deseja.
                "Os valores de 'mensagem', 'branch' e 'tipo' serão inseridos nas posições demarcadas com:
                    {message}: Mensagem de commit
                    {branch}: Branch do commit
                    {type}: Tipo de commit`
            );
        }
        const emailInGit = (await utils.exec("git config --global user.email"))
        .stdout.replace(/\n/g, "");
        const nameInGit = (await utils.exec("git config --global user.name"))
        .stdout.replace(/\n/g, "");

        if(emailInGit != settings['email']){
            finalEmail = await utils.question(
                "O email do git config e do myta config divergiram, qual escolher?",
                [
                    `Git: ${emailInGit}`,
                    `Myta: ${settings['email']}`,
                    "Inserir outro"
                ],
                true
            );
            if(finalEmail == "Inserir outro"){
                finalEmail = await utils.question("Qual nome gostaria de usar?");
            } else {
                finalEmail = finalEmail.split(": ")[1];
            }
            await utils.exec(`git config --global user.email "${finalEmail}"`);
        } else {
            finalEmail = emailInGit;
        }

        if(nameInGit != settings['name']){
            finalName = await utils.question(
                "O nome de usuário do git config e do myta config divergiram, qual escolher?",
                [
                    `Git: ${nameInGit}`,
                    `Myta: ${settings['email']}`,
                    "Inserir outro"
                ],
                true
            );
            if(finalName == "Inserir outro"){
                finalName = await utils.question("Qual nome gostaria de usar?");
            } else {
                finalName = finalName.split(": ")[1];
            }
            await utils.exec(`git config --global user.name "${finalName}"`);
        } else {
            finalName = nameInGit
        }
        
        const finalGitSettings = {
            "defaultCommitTemplate": patternChoose,
            "name": finalName,
            "email": finalEmail
        }

        fs.writeFileSync(this.gitSettings, JSON.stringify(finalGitSettings));
    }

    async pull(utils: IUtils, args:Array<string>) {
        let {flags} = utils.getFlags(args, {boolFlags: ["s"]})

        let updateSuccess = false;

        let pullResponse = await utils.exec("git pull --rebase");

        if (pullResponse.stderr) {
            let stderr = pullResponse.stderr;
            if (stderr.includes("You have unstaged changes")) {
                utils.error(
                    `
                Você possuí alterações não commitadas.
                `,
                    false
                );
                let howProgress = flags.s ?  "Git stash" : await utils.question(
                    "Como deseja prosseguir:",
                    ["Git stash", "Sair"],
                    true
                )
                if (howProgress === "Git stash") {
                    await utils.exec("git stash")
                    pullResponse = await utils.exec("git pull --rebase")
                    await utils.exec("git stash apply")
                    updateSuccess = true
                } else {
                    process.exit(0);
                }
            }
        } if (pullResponse.stdout) {
            updateSuccess = true
        }
        if(updateSuccess){
            let stdout = pullResponse.stdout;
            if (stdout.includes("Already up to date")){
                utils.success(`
                Branch já atualizada
                `)
            } else if (stdout.includes("up to date")) {
                utils.success(`
                Sua branch foi atualizada com sucesso\n
                ${stdout}`);
            }
        }
    }

    async commit(utils: IUtils, args: Array<string>) {
        let { finalArgs, flags } = utils.getFlags(
            args,
            {
                boolFlags:["a", "p", "u"],
                paramsFlag:["b", "t", "m"]
            }
        );
        let settings = await utils.getSettings();

        let filesStatus = await this.getStatus(utils);

        let branchs = await utils.exec("git branch");
        let branch =
            branchs.stdout
                .substring(branchs.stdout.indexOf("*"))
                ?.split(" ")[1]
                ?.trim() || "master";

        if (flags.u) {
            utils.message("Atualizando na branch " + branch)
            await utils.exec("git stash");
            await utils.exec("git pull");
            await utils.exec("git stash apply");
        }

        if (flags.b) {
            const {stdout, stderr} = await utils.exec(`git checkout -b ${flags.b}`);
            if(stderr){
                utils.message(`Acessando branch ${flags.b}`)
                await utils.exec("git stash");
                await utils.exec(`git checkout ${flags.b}`)
                await utils.exec("git stash apply");
            } else {
                utils.message(`Criando branch ${flags.b}`)
            }
            branch = <string>flags.b;
        }

        if (flags.a) {
            utils.message("Adicionando todos os arquivos")
            await utils.exec("git add .");
        } else {
            let addCommand = "git add";
            filesStatus.filesReadyToCommit.forEach(file=>{addCommand+= ` ${file}`})
            await utils.exec(addCommand);
        }

        let commitMessage = "Commit sem mensagem";

        if (flags.m) {
            commitMessage = <string> flags.m;
        }

        let type = "NotDefined";
        if (flags.t) {
            type = <string>flags.t;
        }

        if(fs.existsSync(this.gitSettings)){
            let gitSettings = JSON.parse(fs.readFileSync(this.gitSettings).toString());
            commitMessage = utils.useTemplate(gitSettings["defaultCommitTemplate"], {
                branch: branch,
                message: commitMessage,
                type: type,
            });
        }

        let commit = await utils.exec(`git commit -m "${commitMessage}"`);

        if (commit.stderr) {
            utils.error("Houve um erro ao realizar o commit");
        } else if (commit.stdout) {
            if (commit.stdout.includes("nothing to commit")) {
                utils.warning("Você não possuí alterações para commitar");
            } else if (
                commit.stdout.includes(
                    "nenhuma modificação adicionada à submissão"
                )
            ) {
                utils.warning(`
                Você possuí alterações não adicionadas
                Adicione os arquivos na fila (listando com "git status")
                Ou tente novamente utilizando a flag "-a" para realizar "git add ."
                `);
            } else {
                if (flags.p) {
                    let pushed = await utils.exec(
                        `git push --set-upstream origin ${branch}`
                    );
                    if (
                        pushed.stdout ||
                        pushed.stderr.includes("To github.com")
                    ) {
                        utils.success(`
                        Commit realizado com sucesso:
                            ${commit.stdout}
                        
                        E push realizado com sucesso
                            ${pushed.stdout}
                        `);
                    } else {
                        utils.error(`
                        Commit realizado com sucesso:
                            ${commit.stdout}
                        Mas falha ao realizar o "git push":
                            ${pushed.stderr}
                        `);
                    }
                } else {
                    utils.success(`
                    Commit realizado com sucesso:
                        ${commit.stdout}
                    `);
                }
            }
        }
    }

    async help(utils: IUtils) {
        utils.help("myta git", [
            {
                name: "configurate",
                description: "Inicia processo de configuração do git"
            },
            {
                name: "pull",
                description: "Realiza git pull --rebase",
            },
            {
                name: "commit",
                description: "Realiza commit das alterações atuais",
                flags: [
                    {
                        name: "-b {nome da branch}",
                        description:
                            "Cria uma nova branch para a realizar o commit",
                    },
                    {
                        name: "-t {tipo}",
                        description:
                            "Define o tipo do commit. Padrões conhecios: bugfix (fix), feature (feat), hotfix, release, etc",
                    },
                    {
                        name: '-m "{mensagem de commit}"',
                        description: "Define a mensagem do commit",
                    },
                    {
                        name: "-a",
                        description:
                            'Realiza "git add ." antes de realizar o commit',
                    },
                    {
                        name: "-p",
                        description:
                            'Realiza "git push" após de realizar o commit',
                    },
                    {
                        name: "-u",
                        description:
                            'Realiza "git pull" antes de realizar o commit',
                    },
                ],
            },
        ]);
    }

    async getStatus(utils: IUtils): Promise<ICommitFiles>{
        let filesToCommit: ICommitFiles = {
            changesNotAdded: [],
            newFileNotAdded: [],
            filesReadyToCommit: []
        };
        const NEW_FILE_NOT_ADDED = "Untracked files:";
        const CHANGES_NOT_ADDED = "Changes not staged for commit:";
        const FILES_READY_TO_COMMIT = "Changes to be committed:";

        let gitStatusResult = await utils.exec("git status");

        if(gitStatusResult.stdout.includes(NEW_FILE_NOT_ADDED)){
            let newFileNotAdded = this.breakFiles(gitStatusResult.stdout, NEW_FILE_NOT_ADDED);
            filesToCommit.newFileNotAdded.push(...newFileNotAdded);
        }

        if(gitStatusResult.stdout.includes(CHANGES_NOT_ADDED)) {
            let changesNotAdded = this.breakFiles(gitStatusResult.stdout, CHANGES_NOT_ADDED);
            filesToCommit.changesNotAdded.push(...changesNotAdded);
        }

        if(gitStatusResult.stdout.includes(FILES_READY_TO_COMMIT)){
            let filesReadyToCommit = this.breakFiles(gitStatusResult.stdout, FILES_READY_TO_COMMIT);
            filesToCommit.filesReadyToCommit.push(...filesReadyToCommit);
        }

        return filesToCommit
    }

    breakFiles(originalString: string, splitString: string): Array<string>{
        const REMOVE_PARENTHESES = /\((.*?)\)/g;
        let noFmtFiles = originalString.split(splitString)[1];
        noFmtFiles = noFmtFiles.split(":\n")[0].replace(REMOVE_PARENTHESES, "");
        
        let files = noFmtFiles.trim().split("\n");
        let finalFiles: Array<string> = [];
        if(noFmtFiles.includes(":")){
            for(let file of files){
                if(file == ""){
                    break
                }
                if(file.includes(":")){
                    finalFiles.push(file.split(":")[1].trim())
                    continue;
                }
                finalFiles.push(file.trim());
            }
        } else {
           finalFiles = files.map((file: string)=>file.trim())
        }
        return finalFiles
    }
}
