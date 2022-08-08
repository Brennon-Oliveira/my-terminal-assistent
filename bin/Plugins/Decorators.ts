
type Constructable<T> = new(...args: any[]) => T;


export function Commands<T extends Constructable<any>>(commands: Array<string>){
    return (constructor: T): T=>{
        return class extends constructor {
            services = commands.map((command: string)=>{
                let result: {[command: string]: string} = {};
                result[command] = constructor.prototype[command];
                return result;
            })
        }
    }
}
