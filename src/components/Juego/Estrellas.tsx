import { useEffect, useRef } from "react";

const Tamaño_Estrella = 24;
const Tamaño_Estrella_Morada = 32;
const Duracion_Estrella = 8000; // 8 segundos 
const Maximo_Estrellas_Amarillas = 3; 

type Estrella = {
  id: number;
  x: number;
  y: number;
  tipo: "amarilla" | "morada";
};


type Props = {
  stars: Estrella[];
  setStars: React.Dispatch<React.SetStateAction<Estrella[]>>; // Función para actualizar las estrellas
  gameOver: boolean; // Estado del juego 
};

let idGlobal = 0; // ID único para cada estrella

const Estrellas = ({ stars, setStars, gameOver }: Props) => {
  
  const estrellasRef = useRef<Estrella[]>([]);         // Copia en tiempo real de las estrellas activas
  const totalAmarillasRef = useRef(0);                 
  const ultimoMorado = useRef(0);                      

  // Sincroniza el ref interno con el estado real de las estrellas
  useEffect(() => {
    estrellasRef.current = stars;
  }, [stars]);

  
  useEffect(() => {
    if (gameOver) return; 

    //  genera estrellas amarillas cada 2 segundos
    const intervaloAmarillas = setInterval(() => {
      const cantidadActualAmarillas = estrellasRef.current.filter((e) => e.tipo === "amarilla").length;

      // Solo genera nueva estrella si hay menos del máximo permitido
      if (cantidadActualAmarillas >= Maximo_Estrellas_Amarillas) return;

      // Crea una nueva estrella amarilla en una posición aleatoria
      const id = idGlobal++;
      const x = Math.random() * (window.innerWidth - Tamaño_Estrella);
      const y = Math.random() * (window.innerHeight - Tamaño_Estrella);
      const nuevaEstrella: Estrella = { id, x, y, tipo: "amarilla" };

      setStars((prev) => {
        const actualizadas = [...prev, nuevaEstrella];
        estrellasRef.current = actualizadas;
        return actualizadas;
      });

      totalAmarillasRef.current += 1; // Acumula cuántas amarillas han aparecido desde el inicio

      
      if (
        totalAmarillasRef.current % 15 === 0 &&
        totalAmarillasRef.current !== ultimoMorado.current // Evita repetir en el mismo múltiplo
      ) {
        ultimoMorado.current = totalAmarillasRef.current;
        crearEstrellaMorada(); 
      }

     
      setTimeout(() => {
        setStars((prev) => {
          const filtradas = prev.filter((estrella) => estrella.id !== id);
          estrellasRef.current = filtradas;
          return filtradas;
        });
      }, Duracion_Estrella);
    }, 2000); 

    return () => clearInterval(intervaloAmarillas);
  }, [gameOver, setStars]);

  // Función auxiliar para crear una estrella morada
  const crearEstrellaMorada = () => {
    const id = idGlobal++;
    const x = Math.random() * (window.innerWidth - Tamaño_Estrella_Morada);
    const y = Math.random() * (window.innerHeight - Tamaño_Estrella_Morada);

    const nuevaEstrella: Estrella = { id, x, y, tipo: "morada" };

    setStars((prev) => {
      const actualizadas = [...prev, nuevaEstrella];
      estrellasRef.current = actualizadas;
      return actualizadas;
    });

    // También se elimina tras cierto tiempo
    setTimeout(() => {
      setStars((prev) => {
        const filtradas = prev.filter((estrella) => estrella.id !== id);
        estrellasRef.current = filtradas;
        return filtradas;
      });
    }, Duracion_Estrella);
  };

  // Renderiza todas las estrellas activas
  return (
    <>
      {stars.map((estrella) => (
        <div
          key={estrella.id}
          style={{
            position: "absolute",
            top: estrella.y,
            left: estrella.x,
            fontSize: estrella.tipo === "morada" ? Tamaño_Estrella_Morada : Tamaño_Estrella,
            zIndex: 10,
            transition: "opacity 0.3s ease-in-out",
            color: estrella.tipo === "amarilla" ? "gold" : "violet",
            textShadow:
              estrella.tipo === "amarilla"
                ? "0 0 10px gold"
                : "0 0 10px violet",
            userSelect: "none",
          }}
        >
          ⭐
        </div>
      ))}
    </>
  );
};

export default Estrellas;
