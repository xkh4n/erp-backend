import { Router } from 'express';

const producto = Router();

import {setProducto} from '../../Controllers/Producto';

producto.put('/producto/nuevo', setProducto);

export default producto;