import { useEffect, useState } from "react";
import { IonPage, IonContent, IonButton } from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import Acelerometro from "./Acelerometro";
import Estrellas from "./Estrellas";
import GameLogic from "./Logica";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { enviarNotificacionPush } from "../../service/notification";

const Juego = () => {
  const history = useHistory();

  // `retoId` viene como parámetro desde otra vista (si se trata de un reto)
  const location = useLocation<{ retoId?: string }>();
  const retoId = location.state?.retoId ?? null;

  const { user } = useAuth(); 

  const BALL_SIZE = 40;
  const STAR_SIZE_AMARILLA = 30;
  const STAR_SIZE_MORADA = 40;
  const INITIAL_TIME = 60; 

  // Estado de la posición de la bola
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - BALL_SIZE / 2,
    y: window.innerHeight / 2 - BALL_SIZE / 2,
  });

  // Estado de las estrellas en pantalla
  const [stars, setStars] = useState<
    { id: number; x: number; y: number; tipo: "amarilla" | "morada" }[]
  >([]);

  const [score, setScore] = useState(0);         // Puntaje actual
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME); 
  const [gameOver, setGameOver] = useState(false);        

  // Función para reiniciar el estado del juego
  const resetGame = () => {
    setPosition({
      x: window.innerWidth / 2 - BALL_SIZE / 2,
      y: window.innerHeight / 2 - BALL_SIZE / 2,
    });
    setStars([]);
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setGameOver(false);
  };

  // Cuando se recoge una estrella
  const handleStarCollected = (id: number, puntos: number) => {
    setStars((prevStars) => prevStars.filter((s) => s.id !== id)); // Eliminar estrella
    setScore((prev) => prev + puntos); // Sumar puntos
  };

  // Lógica para finalizar el juego (ya sea por tiempo o por salir)
  const finalizarJuego = async () => {
    if (!user) return;

    // Si se jugó un reto, se actualiza en Firestore
    if (retoId) {
      try {
        const db = getFirestore();
        const retoRef = doc(db, "retos", retoId);

        await updateDoc(retoRef, {
          puntajeReceptor: score, // Guarda el puntaje obtenido
          estado: "finalizado",
        });

        // Notificar al emisor del reto que se jugó
        const retoDoc = await getDoc(retoRef);
        const emisorUid = retoDoc.data()?.emisorUid;

        if (emisorUid) {
          const emisorDoc = await getDoc(doc(db, "usuarios", emisorUid));
          const token = emisorDoc.data()?.tokenDispositivo;

          if (token) {
            await enviarNotificacionPush({
              token,
              title: "¡Reto aceptado!",
              body: `${user.displayName || "Tu amigo"} jugó y obtuvo ${score} puntos.`,
              data: {
                tipo: "resultadoReto",
                retoId,
              },
            });
          }
        }
      } catch (error) {
        console.error("Error al guardar resultado del reto:", error);
      }
    }

    resetGame(); 
    history.push("/historial-retos"); 
  };

  const handleGoHome = () => {
    finalizarJuego();
  };

  // Efecto inicial: arranca el temporizador del juego
  useEffect(() => {
    resetGame(); // Reinicia estado al entrar

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer); 
          setGameOver(true);    
          return 0;
        }
        return prev - 1;
      });
    }, 1000); 

    return () => {
      clearInterval(timer);
      resetGame();
    };
  }, []);

  return (
    <IonPage>
      <IonContent fullscreen>
        {/* HUD de tiempo y puntaje */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 30,
            color: "white",
            fontSize: 24,
          }}
        >
          ⏱ {timeLeft}s | ⭐ {score}
        </div>

        {/* Pantalla final cuando termina el juego */}
        {gameOver && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.8)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 100,
              gap: "20px",
            }}
          >
            <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>
              🎉 ¡Tiempo terminado!
            </h1>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "30px" }}>
              Tu puntaje: {score}
            </h2>

            <IonButton onClick={handleGoHome}>Salir</IonButton>
          </div>
        )}

        {/* Estrellas en pantalla */}
        <Estrellas stars={stars} setStars={setStars} gameOver={gameOver} />

        {/* Bola controlada por acelerómetro */}
        <Acelerometro
          position={position}
          setPosition={setPosition}
          ballSize={BALL_SIZE}
        />

        {/* Lógica de colisión y puntuación */}
        <GameLogic
          ballPosition={position}
          stars={stars}
          onStarCollected={handleStarCollected}
          ballRadius={BALL_SIZE / 2}
          starSizeAmarilla={STAR_SIZE_AMARILLA}
          starSizeMorada={STAR_SIZE_MORADA}
        />
      </IonContent>
    </IonPage>
  );
};

export default Juego;
