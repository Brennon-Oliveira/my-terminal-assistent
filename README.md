# MyTA (My Terminal Assistent)


## Download
Primeiro é necessário a instalação do [ts-node](https://github.com/TypeStrong/ts-node)

* Para instalar o MyTA, basta baixar e instalar [MyTA 1.0.0](https://github.com/Brennon-Oliveira/my-terminal-assistent/raw/main/myta_1.0.0_all.deb). Então já pode instalar o programa

* Caso esteja usando wsl ou alguma distro remote, pode executar `wget "https://github.com/Brennon-Oliveira/my-terminal-assistent/raw/main/myta_1.0.0_all.deb" .`
Então pode rodar `sudo apt install ./seu_aquivo.deb`

Então execute `myta` para verificar o sucesso na instalação e preencher as configurações inciais.
Caso o programa apresente erro, execute `sudo ln -s $(which ts-node) /usr/share/myta/app/ts-node` e tente novamente.
