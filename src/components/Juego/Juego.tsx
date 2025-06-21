import { useEffect, useState, useRef } from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonModal,
  IonInput,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonText,
  IonAlert,
} from "@ionic/react";

import { useHistory, useLocation } from "react-router-dom";
import Acelerometro from "./Acelerometro";
import Estrellas from "./Estrellas";
import GameLogic from "./Logica";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { enviarNotificacionPush } from "../../service/notification";
import { registrarPuntajeGlobal } from "../../service/RegistrarPuntajeService";

const Juego = () => {
  const history = useHistory();

  // `retoId` viene como parámetro desde otra vista (si se trata de un reto)
  const location = useLocation<{ retoId?: string }>();
  const retoId = location.state?.retoId ?? null;

  const { user } = useAuth(); 

  const BALL_SIZE = 40;
  const STAR_SIZE_AMARILLA = 30;
  const STAR_SIZE_MORADA = 40;
  const INITIAL_TIME = 10;

  // Estado de la posición de la bola
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - BALL_SIZE / 2,
    y: window.innerHeight / 2 - BALL_SIZE / 2,
  });

  // Estado de las estrellas en pantalla
  const [stars, setStars] = useState<
    { id: number; x: number; y: number; tipo: "amarilla" | "morada" }[]
  >([]);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [nombreRegistro, setNombreRegistro] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const scoreRef = useRef(0);

  const startGame = () => {
    // Limpiar cualquier timer previo
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Reiniciar estados
    setGameOver(false);
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setStars([]);
    setPosition({
      x: window.innerWidth / 2 - BALL_SIZE / 2,
      y: window.innerHeight / 2 - BALL_SIZE / 2,
    });

    // Iniciar nuevo temporizador
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRegistroPuntaje = async () => {
    if (!user || !nombreRegistro.trim()) {
      setShowRegistroModal(false);
      return;
    }

    try {
      await registrarPuntajeGlobal({
        uid: user.uid,
        puntaje: score,
        nombre: nombreRegistro.trim(),
      });
    } catch (error) {
      console.error("Error al registrar puntaje:", error);
    }

    setShowRegistroModal(false);
  };

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

    if (retoId) {
      try {
        const db = getFirestore();
        const retoRef = doc(db, "retos", retoId);

        await updateDoc(retoRef, {
          puntajeReceptor: score, // Guarda el puntaje obtenido
          estado: "finalizado",
        });

        const retoDoc = await getDoc(retoRef);
        const emisorUid = retoDoc.data()?.emisorUid;

        if (emisorUid) {
          const emisorDoc = await getDoc(doc(db, "usuarios", emisorUid));
          const token = emisorDoc.data()?.tokenDispositivo;

          if (token) {
            await enviarNotificacionPush({
              token,
              title: "¡Reto aceptado!",
              body: `${
                user.displayName || "Tu amigo"
              } jugó y obtuvo ${score} puntos.`,
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
  };

  const handleGoHome = () => {
    finalizarJuego();
  };

  // Efecto inicial: arranca el temporizador del juego
  useEffect(() => {
    startGame();
  }, []);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
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

            <IonButton onClick={startGame}>Volver a jugar</IonButton>
            <IonButton onClick={() => setShowRegistroModal(true)}>
              Registrar puntaje
            </IonButton>
            <IonButton
              onClick={() => {
                history.push({
                  pathname: "/enviar-reto",
                  state: { puntaje: score },
                });
              }}
            >
              Retar Amigos
            </IonButton>

            <IonButton onClick={() => setShowAlert(true)}>Opciones</IonButton>
            <IonButton onClick={handleGoHome}>Salir</IonButton>
          </div>
        )}

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="¿ Que deseas hacer?"
          message="Puedes ver el historial de retos o salir del juego."
          buttons={[
            {
              text: "Cancelar",
              role: "cancel",
            },
            {
              text: "Ver historial",
              handler: () => {
                finalizarJuego();
                history.push("/historial-retos");
              },
            },
            {
              text: "Salir del juego",
              handler: () => {
                resetGame();
                history.push("/");
              },
            },
          ]}
        />

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

        <IonModal isOpen={showRegistroModal} backdropDismiss={false}>
          <IonContent className="main-screen">
            <div className="button-container" style={{ padding: "20px" }}>
              <h1
                style={{
                  color: "white",
                  textAlign: "center",
                  marginBottom: "30px",
                  fontSize: "1.5rem",
                }}
              >
                Registrar Puntaje Global
              </h1>

              <div
                style={{
                  width: "100%",
                  marginBottom: "30px",
                  background: "rgba(124, 73, 122, 0.7)",
                  borderRadius: "30px",
                  padding: "15px 20px",
                }}
              >
                <IonInput
                  placeholder="Ingresa tu nombre"
                  value={nombreRegistro}
                  onIonInput={(e) =>
                    setNombreRegistro(e.detail.value as string)
                  }
                  style={{
                    "--color": "white",
                    "--placeholder-color": "rgba(255, 255, 255, 0.7)",
                    "--padding-start": "10px",
                    width: "100%",
                  }}
                ></IonInput>
              </div>

              <button
                className="main-button"
                onClick={handleRegistroPuntaje}
                disabled={!nombreRegistro.trim()}
                style={{
                  width: "100%",
                  opacity: !nombreRegistro.trim() ? 0.7 : 1,
                  color: "black",
                }}
              >
                Registrar
              </button>

              <button
                className="main-button"
                onClick={() => setShowRegistroModal(false)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "2px solid rgb(124, 73, 122)",
                  color: "white",
                }}
              >
                Cancelar
              </button>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Juego;
