import { NotaData } from "../tipos";

type notaProps = NotaData & {
    eliminar: (id:number)=>void;
    editar:(nota:any)=>void;
};

export default function Nota({id,titulo,texto,color,minutosValidez,creada,eliminar,editar}: notaProps){
    return(
        <div className="nota" style ={{backgroundColor: color}}>
            <h2>{titulo}</h2>
            <p className="texto-nota">{texto}</p>

            <div className="botones-nota">
            <button onClick={()=> eliminar(id)}>
             Eliminar
            </button>
            
            <button
                onClick={() =>
                    editar({
                        id,
                        titulo,
                        texto,
                        color,
                        minutosValidez,
                        creada
                    })
                }
            >
                Editar
            </button>
            </div>

        </div>
  
    );
}