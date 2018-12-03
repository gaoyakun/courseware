import * as playground from '../playground';
import * as select from './select';
import * as swap from './swap';
import * as create from './create';
import * as connect from './connect';
import * as handwriting from './handwriting';

export function installTools (pg: playground.cwPlayground) {
    pg.addTool (new select.cwPGSelectTool(pg));
    pg.addTool (new swap.cwPGSwapTool(pg));
    pg.addTool (new create.cwPGCreateTool(pg));
    pg.addTool (new connect.cwPGConnectTool(pg));
    pg.addTool (new handwriting.cwPGHandWritingTool(pg));
}
