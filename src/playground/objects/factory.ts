import * as playground from '../playground';
import * as label from './label';

export function installFactories (pg: playground.cwPlayground) {
    pg.addFactory (new label.cwPGLabelFactory('Label'));
}