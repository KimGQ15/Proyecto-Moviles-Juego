import React from "react";
import { useIonRouter, IonContent, IonPage } from "@ionic/react";
import "./Home.css";
import { useAuth } from "../../context/AuthContext";
import { getAuth, signOut } from "firebase/auth";

const Home: React.FC = () => {
  const router = useIonRouter();
  const { user, loading } = useAuth();

  const navigateTo = (path: string) => {
    console.log(`Navegando a ${path}`);
    router.push(path);
  };

  const cerrarSesion = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      console.log("Sesión cerrada");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent fullscreen className="main-screen">
          <p style={{ textAlign: "center" }}>Cargando...</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen className="main-screen">
        {user ? (
          <div className="button-container">
            <button
              className="main-button"
              onClick={() => navigateTo("/jugar")}
            >
              Jugar
            </button>
            <button
              className="main-button"
              onClick={() => navigateTo("/enviar-reto")}
            >
              Retar Amigos
            </button>
            <button
              className="main-button"
              onClick={() => navigateTo("/retos-recibidos")}
            >
              Retos Recibidos
            </button>
            <button
              className="main-button"
              onClick={() => navigateTo("/historial-retos")}
            >
              Historial De Retos
            </button>
            <button
              className="main-button"
              onClick={() => navigateTo("/puntuaje-global")}
            >
              Top 5 Global
            </button>
            <button
              className="main-button"
              color="danger"
              onClick={async () => {
                await cerrarSesion();
                navigateTo("/login");
              }}
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <div className="button-container">
            <button
              className="main-button"
              onClick={() => navigateTo("/login")}
            >
              ¡Inicia Sesion!
            </button>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
