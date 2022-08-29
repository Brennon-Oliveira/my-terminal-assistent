# MyTA (My Terminal Assistent)


## Download
Primeiro é necessário a instalação do [ts-node](https://github.com/TypeStrong/ts-node).
Caso possua o npm instalado, pode apenas executar `npm i -g ts-node`
Para verificar, execute `ts-node --version`.

* Para instalar o MyTA, basta baixar e instalar [MyTA](https://github.com/Brennon-Oliveira/my-terminal-assistent/releases/tag/Versions/latest) em sua última versão. Então já pode instalar o programa

Então pode rodar `sudo apt install ./seu_aquivo.deb`

Após instalar, execute `sudo ln -s $(which ts-node) /usr/share/myta/app/ts-node` para anexar o ts-node no programa.
Então execute `myta` para verificar o sucesso na instalação e preencher as configurações inciais.

## Plugins
Para conseguir manipular seus plugins, basta executar `myta plugins` para utiliazar o plugin padrão de gerenciamento de plugins, onde terá novas instruções para a utilização.

Caso receba o erro "Comando plugins não encontrado", ou nenhum plugin esteja sendo listado, execute `sudo cp -r /usr/share/myta/app/bin/Plugins ~/.myta`
