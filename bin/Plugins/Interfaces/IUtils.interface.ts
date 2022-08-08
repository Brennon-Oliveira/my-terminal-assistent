import { ExecException } from 'child_process';

export type flags = {[key: string]: string | boolean}

export default abstract class IUtils {
    public abstract question(
        receiveQuestion: string,
        options?: Array<string>,
        multline?: boolean
    ): Promise<string>;
    public abstract exec(command: string): Promise<{
        stdout: string;
        stderr: string;
        error: ExecException | null;
    }>;
    public abstract message (message: string):void;
    public abstract error (message: string, exit?: boolean): void | never
    public abstract success (message: string):void;
    public abstract warning (message: string):void;
    public abstract tabRemove(message: string): Array<string>;
    public abstract translate(text: string): string;
    public abstract getFlags(
        args: Array<string>,
        {boolFlags, paramsFlag} : {
            boolFlags?: Array<string>;
            paramsFlag?: Array<string>;
        }
    ): {flags: flags, finalArgs: Array<string>};
    public abstract help (parent: string, commands: Array<{
        name: string;
        description: string;
        flags?: Array<{
            name: string;
            description: string;
        }>;
    }>):void;
    public abstract delay(delay?: number): void;
    public abstract useTemplate(template: string, values: {[keys: string]: string}):string;
    public abstract getSettings():Promise<{[keys: string]: string}>;
    public abstract clear():void;
    public abstract getLocalStorage(key: string):Promise<Object>;
    public abstract setLocalStorage(key: string, value: string):void;
}