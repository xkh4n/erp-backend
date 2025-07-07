import { Router } from 'express';

const producto = Router();

import {setProducto, getAllProductos, getProductoByCategoria, getPruductoByIdCategoria} from '../../Controllers/Producto';

producto.put('/producto/nuevo', setProducto);
producto.post('/producto/todos', getAllProductos);
producto.post('/producto/categoria', getProductoByCategoria);
producto.post('/producto/idcategoria', getPruductoByIdCategoria);

export default producto;