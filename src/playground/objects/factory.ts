import * as playground from '../playground';
import * as label from './label';
import * as arrow from './arrow';
import * as freedraw from './freedraw';

export function installFactories (pg: playground.cwPlayground) {
    pg.addFactory (new label.cwPGLabelFactory('Label'));
    pg.addFactory (new arrow.cwPGArrowFactory('Arrow'));
    pg.addFactory (new freedraw.cwPGFreeDrawFactory('FreeDraw'));
}