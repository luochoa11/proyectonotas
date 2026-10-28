"use client";
import { use, useState, useEffect, useRef } from "react";
import Nota from "./components/Nota"

import { NotaData } from "./tipos";

export default function Home() {

  const [notas, setNotas] = useState<NotaData[]>([]);

  const [titulo, setTitulo] = useState(""); //esto sigue siendo necesario?
  const [texto, setTexto] = useState("");
  const [color, setColor] = useState("#fff59d");
  const [minutosValidez, setMinutosValidez] = useState(5);
  //const primeraCarga = useRef(true);
  const [editando, setEditando] = useState<number | null>(null);
  const notificadas = useRef<number[]>([]);

  // cargar notas desde el backend
  useEffect(() => {
    async function cargarNotas() {
      const respuesta = await fetch("http://localhost:3001/notas");
      const datos = await respuesta.json();

      setNotas(datos);
    }
    cargarNotas();
  }, []);



  // //guardar
  // useEffect(() => {

  // if(primeraCarga.current){
  //   primeraCarga.current=false;
  //   return;
  // }

  //   localStorage.setItem("notas",JSON.stringify(notas));
  // },[notas]); //cambia cada vez que notas cambia

  useEffect(() => {
    const intervalo = setInterval(() => {

      notas.forEach((nota) => {
        const vencimiento = nota.creada + nota.minutosValidez * 60 * 1000

        if (Date.now() >= vencimiento && !notificadas.current.includes(nota.id)) {
          new Notification("Nota vencida", {
            body: nota.titulo
          });

          notificadas.current.push(nota.id);
        }
      });

    }, 1000)

    return () => {
      clearInterval(intervalo);
    }
  }, [notas]);


  async function crearNota() {
    const respuesta = await fetch("http://localhost:3001/notas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        titulo: titulo,
        texto: texto,
        color: color,
        minutosValidez: minutosValidez
      })
    });

    if (!respuesta.ok) {
      alert("No se pudo crear la nota");
      return;
    }

    const nuevaNota: NotaData = await respuesta.json();

    setNotas((notasActuales) => [...notasActuales, nuevaNota]);

    setTitulo("");
    setTexto("");
    setColor("#fff59d");
    setMinutosValidez(5);
  }

  async function eliminarNota(id: number) {
    const respuesta = await fetch(
      `http://localhost:3001/notas/${id}`,
      {
        method: "DELETE"
      }
    );

    if (!respuesta.ok) {
      alert("No se pudo eliminar la nota");
      return;
    }

    setNotas((notasActuales) =>
      notasActuales.filter((nota) => nota.id !== id)
    );
  }

  function editarNota(nota: NotaData) {
    setTitulo(nota.titulo);
    setTexto(nota.texto);
    setColor(nota.color);
    setMinutosValidez(nota.minutosValidez);
    setEditando(nota.id);
  }

  async function guardarCambios() {
    if (editando === null) return;

    const respuesta = await fetch(
      `http://localhost:3001/notas/${editando}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          titulo: titulo,
          texto: texto,
          color: color,
          minutosValidez: minutosValidez
        })
      }
    );

    if (!respuesta.ok) {
      alert("No se pudieron guardar los cambios");
      return;
    }

    const notaActualizada: NotaData = await respuesta.json();

    setNotas((notasActuales) =>
      notasActuales.map((nota) =>
        nota.id === notaActualizada.id ? notaActualizada : nota
      )
    );

    setEditando(null);
    setTitulo("");
    setTexto("");
    setColor("#fff59d");
    setMinutosValidez(5);
  }

  return (
    <main>
      <div className="formulario">


        <h1>mis notas :D</h1>

        <input
          type="text"
          placeholder="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <textarea
          placeholder="Texto de la nota"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />



        <div className="opciones">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />

          <input
            type="number"
            min="1"
            value={minutosValidez}
            onChange={(e) => setMinutosValidez(Number(e.target.value))}
          />
        </div>

        <div className="botones-formulario">
          <button onClick={editando === null ? crearNota : guardarCambios}>
            {editando === null ? "Crear nota" : "Guardar cambios"}
          </button>
          <button onClick={() => Notification.requestPermission()}>
            Activar notificaciones
          </button>
        </div>

      </div>

      <div className="tablero">
        {notas.map((nota) => (
          <Nota
            key={nota.id}
            id={nota.id}
            titulo={nota.titulo}
            texto={nota.texto}
            color={nota.color}
            minutosValidez={nota.minutosValidez}
            creada={nota.creada}
            eliminar={eliminarNota}
            editar={editarNota}

          />
        ))}
      </div>
    </main>
  );



}