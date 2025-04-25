import { Router } from 'express';

const depto = Router();

import { setDepartamento } from '../../Controllers/Departamento';

depto.put('/depto/nuevo', setDepartamento);

export default depto;