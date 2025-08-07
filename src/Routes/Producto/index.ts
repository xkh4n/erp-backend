import { Router } from 'express';

const producto = Router();

import {setProducto, getAllProductos, getProductoByCategoria, getPruductoByIdCategoria, recibirProducto} from '../../Controllers/Producto';

producto.put('/producto/nuevo', setProducto);
producto.post('/producto/todos', getAllProductos);
producto.post('/producto/categoria', getProductoByCategoria);
producto.post('/producto/idcategoria', getPruductoByIdCategoria);
producto.post('/producto/recibir', recibirProducto);

export default producto;