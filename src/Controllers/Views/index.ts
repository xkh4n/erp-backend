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
import { CustomError, createServerError, createValidationError, createConflictError } from '../../Library/Errors';
import { IsProceso } from '../../Library/Validations';
import { IDepartamento, IGerencia, IServicio, ISubGerencia, IProceso, IVistas } from '../../Interfaces';

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
            "gerencia": "6812104e646c4119dca299ab",
            "subgerencia": "68121065646c4119dca299c7",
            "departamento": "6812135fbd6d9f1830290512",
            "servicio": "681bcfccf2d779289ad88b6e",
            "proceso": "681bd63c8d36cfb08e0b9e79",
            "pantalla":"Crear Cuenta"
        */
        const promise: Promise<IVistas>[] = [];
        const {gerencia, subgerencia, departamento, servicio, proceso, pantalla } = req.body;
        const gerenciaExiste = await Gerencia.findById(gerencia);
        if(!gerenciaExiste){
            throw createValidationError('La Gerencia no existe',gerencia);
        }
        const subgerenciaExiste = await SubGerencia.findById(subgerencia);
        if(!subgerenciaExiste){
            throw createValidationError('La SubGerencia no existe',subgerencia);
        }
        const departamentoExiste = await Departamento.findById(departamento);
        if(!departamentoExiste){
            throw createValidationError('El Departamento no existe',departamento);
        }
        const servicioExiste = await Servicio.findById(servicio);
        if(!servicioExiste){
            throw createValidationError('El Servicio no existe',servicio);
        }
        const procesoExiste = await Proceso.findById(proceso);
        if(!procesoExiste){
            throw createValidationError('El Proceso no existe',proceso);
        }
        //proceso + servicio + departamento + subgerencia + gerencia
        /*
            proceso: string;
            label: string;
            link: string;
            title: string;
            vistas?: IVistas[];
        */
        const codVista = procesoExiste.codigo + servicioExiste.codigo.toString() + departamentoExiste.codigo.toString() + subgerenciaExiste.codigo.toString() + gerenciaExiste.codigo.toString();
        const vistaExiste = await Vistas.findOne({codVista});
        if(vistaExiste){
            throw createValidationError('La Vista ya existe',codVista);
        }
        const vista = new Vistas({
            proceso: procesoExiste._id,
            label: pantalla,
            link: `/${codVista}`,
            title: pantalla
        })
        try {
            await vista.save();
            promise.push(Promise.resolve(vista));
        } catch (err) {
            if (err.code === 11000) {
                throw createConflictError('Ya existe una Servicio con ese código', codVista);
            }
            throw createServerError('Sucedió un error Inesperado al guardar el Servicio', codVista);
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
export{
    setVistas,
    crearVistas,
    getVistas,
}