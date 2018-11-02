export interface IPGCommand {
    command: string;
    [prop: string]: any;
}

export class cwPGCommandParser {
    private static strip(s: string): string {
        const whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
        let pos = 0;
        while (pos < s.length && whitespace.indexOf(s.charAt(pos)) >= 0) {
            pos++;
        }
        return s.substring(pos, s.length - pos);
    }
    private static lexical(lexData: { str: string, token: string }): void {
        const whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
        let pos = 0;
        while (pos < lexData.str.length && whitespace.indexOf(lexData.str.charAt(pos)) >= 0) {
            pos++;
        }
        lexData.str = lexData.str.substring(pos, lexData.str.length - pos);
        pos = 0;
        while (pos < lexData.str.length && whitespace.indexOf(lexData.str.charAt(pos)) < 0) {
            pos++;
        }
        lexData.token = lexData.str.substring(0, pos);
        lexData.str = lexData.str.substring(pos, lexData.str.length - pos);
    }
    public static parse(command: string): IPGCommand {
        let s = cwPGCommandParser.strip(command);
        let result: IPGCommand = { command: '' };
        let lexData = {
            str: s,
            token: ''
        };
        cwPGCommandParser.lexical(lexData);
        result.command = lexData.token;
        while (true) {
            cwPGCommandParser.lexical(lexData);
            if (lexData.token === '') {
                break;
            }
            let arr = lexData.token.split('=');
            result[arr[0]] = arr.length == 1 ? true : arr[1];
        }
        return result;
    }
}