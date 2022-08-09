# MyTA (My Terminal Assistent)


## Download
Primeiro é necessário a instalação do [ts-node](https://github.com/TypeStrong/ts-node).
Caso possua o npm instalado, pode apenas executar `npm i -g ts-node`
Para verificar, execute `ts-node`.

* Para instalar o MyTA, basta baixar e instalar [MyTA 1.0.0](https://drive.google.com/file/d/1cDZvwTa9bAiqbuzwabJYzYgvwiQ-Nnsa/view?usp=sharing). Então já pode instalar o programa

* Caso esteja usando wsl ou alguma distro remote, pode executar `wget "https://drive.google.com/file/d/1cDZvwTa9bAiqbuzwabJYzYgvwiQ-Nnsa/view?usp=sharing" .`
Então pode rodar `sudo apt install ./seu_aquivo.deb`

Então execute `myta` para verificar o sucesso na instalação e preencher as configurações inciais.
Caso o programa apresente erro, execute `sudo ln -s $(which ts-node) /usr/share/myta/app/ts-node` e tente novamente.
