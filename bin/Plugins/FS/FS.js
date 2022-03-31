export default class FS {

    services = {
        "--help": this.help,
        "-h": this.help,
    }
    

    controller = async (action, args)=>{
        if(this.services[action]){
            return await this.services[action](args);
        } else {
            error(`Ação ${action} não encontrada na classe FS`);
        }
    }





    async help(){
        help("myta git", [
            {
                name: "pull",
                description: "Realiza git pull --rebase",
            },
        ])
    }
}