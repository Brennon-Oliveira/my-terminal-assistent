# MyTA (My Terminal Assistent)


## Download
Primeiro é necessário a instalação do [ts-node](https://github.com/TypeStrong/ts-node).
Caso possua o npm instalado, pode apenas executar `npm i -g ts-node`
Para verificar, execute `ts-node --version`.

* Para instalar o MyTA, basta baixar e instalar [MyTA 1.0.0](https://download1319.mediafire.com/9ypeaogmgnwg/j9pg4mjwugcwkj6/myta_1.0.0_all.deb). Então já pode instalar o programa

* Caso esteja usando wsl ou alguma distro remote, pode executar `wget https://download1319.mediafire.com/9ypeaogmgnwg/j9pg4mjwugcwkj6/myta_1.0.0_all.deb .`
Então pode rodar `sudo apt install ./seu_aquivo.deb`

Então execute `myta` para verificar o sucesso na instalação e preencher as configurações inciais.
Caso o programa apresente erro, execute `sudo ln -s $(which ts-node) /usr/share/myta/app/ts-node` e tente novamente.

## Plugins
Para conseguir manipular seus plugins, basta executar `myta plugins` para utiliazar o plugin padrão de gerenciamento de plugins, onde terá novas instruções para a utilização.

Caso receba o erro "Comando plugins não encontrado", ou nenhum plugin esteja sendo listado, execute `sudo cp -r /usr/share/myta/app/bin/Plugins ~/.myta`
