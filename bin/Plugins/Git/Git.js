import Utils from "../../Utils.js";
const {
    help,
    exec,
    error,
    warning,
    message,
    success,
    getFlags,
    getSettings,
    useTemplate,
    question,
} = Utils;

export default class Git {
    services = {
        "--help": this.help,
        "-h": this.help,
        pull: this.pull,
        commit: this.commit,
    };

    controller = async (action, args) => {
        if (this.services[action]) {
            return await this.services[action](args);
        } else {
            error(`Ação ${action} não encontrada na classe Git`);
        }
    };

    async pull(args) {
        let pullResponse = await exec("git pull --rebase");

        if (pullResponse.stderr) {
            let stderr = pullResponse.stderr;
            if (stderr.includes("You have unstaged changes")) {
                error(
                    `
                Você possuí alterações não commitadas.
                `,
                    false
                );
                let howProgress = await question(
                    "Como deseja prosseguir:",
                    ["Git stash", "Git commit", "Sair"],
                    true
                );
                if (howProgress === "Git stash") {
                    // await exec("git stash")
                    warning(`
                    Função ainda não implementada
                    Caso acredite ser um erro, por favor informe a equipe de desenvolvimento
                    `);
                    process.exit(0);
                } else if (howProgress === "Git commit") {
                    warning(`
                    Função ainda não implementada
                    Caso acredite ser um erro, por favor informe a equipe de desenvolvimento
                    `);
                    process.exit(0);
                } else {
                    process.exit(0);
                }
            }
        } else if (pullResponse.stdout) {
            let stdout = pullResponse.stdout;
            if (stdout.includes("up to date")) {
                success(`
                Sua branch foi atualizada com sucesso
                `);
            }
        }
    }

    async commit(args) {
        let { finalArgs, flags } = getFlags(
            args,
            ["a", "p", "u"],
            ["b", "t", "m"]
        );
        let settings = await getSettings();

        let branchs = await exec("git branch");
        let branch =
            branchs.stdout
                .substring(branchs.stdout.indexOf("*"))
                ?.split(" ")[1]
                ?.trim() || "master";

        if (flags.u) {
            await exec("git stash");
            await exec("git pull");
            await exec("git stash apply");
        }

        if (flags.b) {
            await exec(`git checkout -b ${flags.b}`);
            branch = flags.b;
        }

        if (flags.a) {
            await exec("git add .");
        }

        let commitMessage = "Commit sem mensagem";

        if (flags.m) {
            commitMessage = flags.m;
        }

        let type = "NotDefined";
        if (flags.t) {
            type = flags.t;
        }

        commitMessage = useTemplate(settings.defaultCommitTemplate, {
            branch: branch,
            message: commitMessage,
            type: type,
        });

        let commit = await exec(`git commit -m "${commitMessage}"`);

        if (commit.stderr) {
            error("Houve um erro ao realizar o commit");
        } else if (commit.stdout) {
            if (commit.stdout.includes("nothing to commit")) {
                warning("Você não possuí alterações para commitar");
            } else if (
                commit.stdout.includes(
                    "nenhuma modificação adicionada à submissão"
                )
            ) {
                warning(`
                Você possuí alterações não adicionadas
                Adicione os arquivos na fila (listando com "git status")
                Ou tente novamente utilizando a flag "-a" para realizar "git add ."
                `);
            } else {
                if (flags.p) {
                    let pushed = await exec(
                        `git push --set-upstream origin ${branch}`
                    );
                    if (
                        pushed.stdout ||
                        pushed.stderr.includes("To github.com")
                    ) {
                        success(`
                        Commit realizado com sucesso:
                            ${commit.stdout}
                        
                        E push realizado com sucesso
                            ${pushed.stdout}
                        `);
                    } else {
                        error(`
                        Commit realizado com sucesso:
                            ${commit.stdout}
                        Mas falha ao realizar o "git push":
                            ${pushed.stderr}
                        `);
                    }
                } else {
                    success(`
                    Commit realizado com sucesso:
                        ${commit.stdout}
                    `);
                }
            }
        }
    }

    async help() {
        help("myta git", [
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
