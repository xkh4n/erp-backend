/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Views Controllers:');
logger.level = 'all';

/* MODELS */
import Vistas from '../../Models/vistasModel';
import Proceso from '../../Models/procesoModel';
import Servicio from '../../Models/serviciosModel';
import Departamento from '../../Models/departamentoModel';
import SubGerencia from '../../Models/subgerenciaModel';
import Gerencia from '../../Models/gerenciaModel';

/* ERRORS */
import { CustomError, createServerError, createValidationError, createConflictError, createNotFoundError } from '../../Library/Errors';
import { IsCodVista, IsId, IsNumero } from '../../Library/Validations';
import { IDepartamento, IGerencia, IServicio, ISubGerencia, IProceso, IVistas } from '../../Interfaces';

/* LIBRARYS */
import Capitalize from '../../Library/Utils/Capitalize';

const setVistas = async (req: any, res: any) => {
    /*
    proc000110281312
    caracter desde 9 a 10= servicio
    caracter desde 11 a 12= departamento
    caracter desde 13 a 14= subgerencia
    caracter desde 15 a 16= gerencia
    La ruta es la siguiente:
    /proceso + servicio + departamento + subgerencia + gerencia
    Siendo:
    Gerencia: 2 dígitos
    SubGerencia: 2 dígitos
    Departamento: 2 dígitos
    Servicio: 2 dígitos
    Proceso: 8 dígitos
    */
    try {
        let arrayGerencias: any = [];
        let arraySubGerencia: any = [];
        let arrayDepartamento: any = [];
        let arrayServicio: any = [];
        let arrayProceso: any = [];
        let gerencia: IGerencia;
        let subgerencia: ISubGerencia;
        let departamento: IDepartamento;
        let servicio: IServicio;
        let proceso: IProceso;
        const { label, link, submenu } = req.body;
        if(!link){
            throw createValidationError('El link es requerido',"vacío");
        }
        const linkGerencia = link.substring(14, 16);
        logger.info("El código de Gerencia es: "+linkGerencia);
        if(parseInt(linkGerencia) >= 10){
            gerencia = await Gerencia.findOne({codigo: parseInt(linkGerencia)});
            if(!gerencia){
                throw createValidationError('La Gerencia no existe',"vacío");
            }
            // Si el arrayGerencias no contiene el linkGerencia, lo agregamos
            if(!arrayGerencias.includes(linkGerencia)){
                arrayGerencias.push(linkGerencia);
            }
            logger.error(gerencia);
        }else{
            gerencia = {
                codigo: 0,
                nombre: "Gerencia",
                descripcion: "Gerencia",
                estado: true
            }
        }
        const linkSubGerencia = link.substring(12, 14);
        if(parseInt(linkSubGerencia) >= 10){
            subgerencia = await SubGerencia.findOne( {codigo: parseInt(linkSubGerencia)});
            if(!subgerencia){
                throw createValidationError('La SubGerencia no existe',"vacío");
            }
            // Si el arraySubGerencia no contiene el linkSubGerencia, lo agregamos
            if(!arraySubGerencia.includes(linkSubGerencia)){
                arraySubGerencia.push(linkSubGerencia);
            }
            logger.trace(subgerencia);
        }
        const linkDepartamento = link.substring(10, 12);
        if(parseInt(linkDepartamento) >= 10){
            departamento = await Departamento.findOne({codigo: parseInt(linkDepartamento)});
            if(!departamento){
                throw createValidationError('El Departamento no existe',"vacío");
            }
            // Si el arrayDepartamento no contiene el linkDepartamento, lo agregamos
            if(!arrayDepartamento.includes(linkDepartamento)){
                arrayDepartamento.push(linkDepartamento);
            }
            logger.warn(departamento);
        }
        const linkServicio = link.substring(8,10);
        if(parseInt(linkServicio) >= 10){
            servicio = await Servicio.findOne({codigo: parseInt(linkServicio)});
            if(!servicio){
                throw createValidationError('El Servicio no existe',"vacío");
            }
            // Si el arrayServicio no contiene el linkServicio, lo agregamos
            if(!arrayServicio.includes(linkServicio)){
                arrayServicio.push(linkServicio);
            }
            logger.info(servicio);
        }else{
            servicio = {
                codigo: 0,
                nombre: "Servicio",
                descripcion: "Servicio",
                estado: true,
                departamento: ''
            }
        }
        const linkProceso = link.substring(4, 8);
        if(parseInt(linkProceso) >= 1){
            proceso = await Proceso.findOne({codigo: link.substring(0, 8).toUpperCase()});
            if(!proceso){
                throw createValidationError('El Proceso no existe',"vacío");
            }
            // Si el arrayProceso no contiene el linkProceso, lo agregamos
            if(!arrayProceso.includes(linkProceso)){
                arrayProceso.push(linkProceso);
            }
            logger.fatal(proceso);
        }
        const respuesta = {
            "Gerencia":gerencia.nombre,
            "SubGerencia":subgerencia.nombre,
            "Departamento":departamento.nombre,
            "Servicio":servicio.nombre,
            "Proceso":proceso.nombre
        }
        res.status(200).json(respuesta);
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }else{
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const crearVistas = async (req: any, res: any) => {
    try {
        /*
            {
                "departamento": "13",
                "gerencia": "68653939d8a4d80539557175",
                "pantalla": "CREAR PROVEEDOR",
                "proceso": "686550b32bbc71331e074933",
                "servicio": "17",
                "subgerencia": "68653b262bbc71331e0748b6"
            }
        */
        const promise: Promise<IVistas>[] = [];
        const {departamento, gerencia, pantalla, proceso, servicio, subgerencia } = req.body;

        //Validacion de campos recibidos
        if (!departamento || !gerencia || !pantalla || !proceso || !servicio || !subgerencia) {
            throw createValidationError('Faltan campos requeridos', 'vacío');
        }
        if (!IsId(gerencia)) {
            throw createValidationError('El ID de Gerencia no es válido', gerencia);
        }
        if (!IsId(subgerencia)) {
            throw createValidationError('El ID de SubGerencia no es válido', subgerencia);
        }
        if(!IsId(proceso)){
            throw createValidationError('El ID de Proceso no es válido', proceso);
        }
        
        // Validar y convertir servicio a número
        if(!servicio || !IsNumero(servicio)){
            throw createValidationError('El Servicio no es válido o está vacío', servicio);
        }
        const servicioNum = parseInt(servicio, 10);
        if(isNaN(servicioNum) || servicioNum <= 0){
            throw createValidationError('El Servicio debe ser un número positivo', servicio);
        }
        
        // Validar y convertir departamento a número  
        if(!departamento || !IsNumero(departamento)){
            throw createValidationError('El Departamento no es válido o está vacío', departamento);
        }
        const departamentoNum = parseInt(departamento, 10);
        if(isNaN(departamentoNum) || departamentoNum <= 0){
            throw createValidationError('El Departamento debe ser un número positivo', departamento);
        }

        //Validación de la Existencia de los datos
        const gerenciaExiste = await Gerencia.findById(gerencia);
        if(!gerenciaExiste){
            throw createValidationError('La Gerencia no existe',gerencia);
        }
        const subgerenciaExiste = await SubGerencia.findById(subgerencia);
        if(!subgerenciaExiste){
            throw createValidationError('La SubGerencia no existe',subgerencia);
        }
        const departamentoExiste = await Departamento.findOne({codigo: departamentoNum});
        if(!departamentoExiste){
            throw createValidationError('El Departamento no existe', departamentoNum.toString());
        }
        const servicioExiste = await Servicio.findOne({codigo: servicioNum});
        if(!servicioExiste){
            throw createValidationError('El Servicio no existe', servicioNum.toString());
        }
        const procesoExiste = await Proceso.findById(proceso);
        if(!procesoExiste){
            throw createValidationError('El Proceso no existe',proceso);
        }

        //Creacion del código de la vista
        
        const existeProceso = await Proceso.findOne({nombre: Capitalize(pantalla)});
        if (existeProceso) {
            throw createConflictError('Ya existe un Proceso con ese nombre', Capitalize(pantalla));
        }
        
       const newCodigoProceso = procesoExiste.codigo + servicioExiste.codigo.toString() + departamentoExiste.codigo.toString() + subgerenciaExiste.codigo.toString() + gerenciaExiste.codigo.toString();
       logger.info("El nuevo código de Proceso es: " + newCodigoProceso);
        if(!IsCodVista(newCodigoProceso)){
            throw createValidationError('El código del Proceso no es válido', newCodigoProceso);
        }
        const vistaExiste = await Vistas.findOne({codVista: newCodigoProceso});
        if(vistaExiste){
            throw createConflictError('Ya existe una Vista con ese código', newCodigoProceso);
        }
        /*
            {
                "proceso": procesoExiste.codigo;
                "label": procesoExiste.nombre;
                "link": /newCodigoProceso;
                "title": procesoExiste.nombre;
                "codigo": newCodigoProceso;
                "descripcion": procesoExiste.descripcion;
                "estado": true;
            }
        */
        const vista = new Vistas({
            proceso: procesoExiste.codigo,
            label: Capitalize(procesoExiste.nombre),
            link: `/${newCodigoProceso}`,
            title: Capitalize(procesoExiste.nombre),
            codVista: newCodigoProceso,
            descripcion: Capitalize(procesoExiste.descripcion),
            estado: true,
            vistas: []
        })
        try {
            await vista.save();
            promise.push(Promise.resolve(vista));
        } catch (err) {
            if (err.code === 11000) {
                throw createConflictError('Ya existe una Vista con ese código', newCodigoProceso);
            }
            throw createServerError('Sucedió un error Inesperado al guardar la Vista', newCodigoProceso);
        }
            
        const vistas = await Promise.all(promise);
        res.status(201).json({
            codigo: 201,
            data: vistas
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }else{
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const getVistas = async (req: any, res: any) => {
    try {
        const vistas = await Vistas.find();
        if(!vistas){
            throw createValidationError('No existen Vistas',"vacío");
        }
        res.status(200).json({
            codigo: 200,
            data: vistas
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }else{
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

const deleteVistas = async (req: any, res: any) => {
    try {
        const { id } = req.body;
        if (!IsId(id)) {
            throw createValidationError('El ID no es válido: ', id);
        }
        const vistas = await Vistas.findByIdAndDelete(id);
        if(!vistas){
            throw createNotFoundError('No existe una Vista con ese ID', id);
        }
        res.status(200).json({
            codigo: 200,
            data: vistas
        });
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) {
            res.status(error.code).json(error.toJSON());
        }else{
            const serverError = createServerError('Sucedió un error Inesperado');
            res.status(serverError.code).json(serverError.toJSON());
        }
    }
}

export{
    setVistas,
    crearVistas,
    getVistas,
    deleteVistas
}