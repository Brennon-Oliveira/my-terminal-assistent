import { Commands } from "../Decorators";
import Plugin from "../Plugin";

@Commands([
    "pull",
    "commit"
])
export default class Git extends Plugin{

    async pull(args:Array<string>) {
        let {flags} = this.utils.getFlags(args, {boolFlags: ["s"]})

        let updateSuccess = false;

        let pullResponse = await this.utils.exec("git pull --rebase");

        if (pullResponse.stderr) {
            let stderr = pullResponse.stderr;
            if (stderr.includes("You have unstaged changes")) {
                this.utils.error(
                    `
                Você possuí alterações não commitadas.
                `,
                    false
                );
                let howProgress = flags.s ?  "Git stash" : await this.utils.question(
                    "Como deseja prosseguir:",
                    ["Git stash", "Sair"],
                    true
                )
                if (howProgress === "Git stash") {
                    await this.utils.exec("git stash")
                    pullResponse = await this.utils.exec("git pull --rebase")
                    await this.utils.exec("git stash apply")
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
                this.utils.success(`
                Branch já atualizada
                `)
            } else if (stdout.includes("up to date")) {
                this.utils.success(`
                Sua branch foi atualizada com sucesso\n
                ${stdout}`);
            }
        }
    }

    async commit(args: Array<string>) {
        let { finalArgs, flags } = this.utils.getFlags(
            args,
            {
                boolFlags:["a", "p", "u"],
                paramsFlag:["b", "t", "m"]
            }
        );
        let settings = await this.utils.getSettings();

        let branchs = await this.utils.exec("git branch");
        let branch =
            branchs.stdout
                .substring(branchs.stdout.indexOf("*"))
                ?.split(" ")[1]
                ?.trim() || "master";

        if (flags.u) {
            this.utils.message("Atualizando na branch " + branch)
            await this.utils.exec("git stash");
            await this.utils.exec("git pull");
            await this.utils.exec("git stash apply");
        }

        if (flags.b) {
            const {stdout, stderr} = await this.utils.exec(`git checkout -b ${flags.b}`);
            if(stderr){
                this.utils.message(`Acessando branch ${flags.b}`)
                await this.utils.exec("git stash");
                await this.utils.exec(`git checkout ${flags.b}`)
                await this.utils.exec("git stash apply");
            } else {
                this.utils.message(`Criando branch ${flags.b}`)
            }
            branch = <string>flags.b;
        }

        if (flags.a) {
            this.utils.message("Adicionando todos os arquivos")
            await this.utils.exec("git add .");
        }

        let commitMessage = "Commit sem mensagem";

        if (flags.m) {
            commitMessage = <string> flags.m;
        }

        let type = "NotDefined";
        if (flags.t) {
            type = <string>flags.t;
        }

        commitMessage = this.utils.useTemplate(settings["defaultCommitTemplate"], {
            branch: branch,
            message: commitMessage,
            type: type,
        });

        let commit = await this.utils.exec(`git commit -m "${commitMessage}"`);

        if (commit.stderr) {
            this.utils.error("Houve um erro ao realizar o commit");
        } else if (commit.stdout) {
            if (commit.stdout.includes("nothing to commit")) {
                this.utils.warning("Você não possuí alterações para commitar");
            } else if (
                commit.stdout.includes(
                    "nenhuma modificação adicionada à submissão"
                )
            ) {
                this.utils.warning(`
                Você possuí alterações não adicionadas
                Adicione os arquivos na fila (listando com "git status")
                Ou tente novamente utilizando a flag "-a" para realizar "git add ."
                `);
            } else {
                if (flags.p) {
                    let pushed = await this.utils.exec(
                        `git push --set-upstream origin ${branch}`
                    );
                    if (
                        pushed.stdout ||
                        pushed.stderr.includes("To github.com")
                    ) {
                        this.utils.success(`
                        Commit realizado com sucesso:
                            ${commit.stdout}
                        
                        E push realizado com sucesso
                            ${pushed.stdout}
                        `);
                    } else {
                        this.utils.error(`
                        Commit realizado com sucesso:
                            ${commit.stdout}
                        Mas falha ao realizar o "git push":
                            ${pushed.stderr}
                        `);
                    }
                } else {
                    this.utils.success(`
                    Commit realizado com sucesso:
                        ${commit.stdout}
                    `);
                }
            }
        }
    }

    async help() {
        this.utils.help("myta git", [
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
}
