import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonText,
  IonLoading,
} from "@ionic/react";
import { auth, messaging } from "../config/firebaseConfig";
import { getToken as getWebToken } from "firebase/messaging";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import "./LoginService.css";

const vapidKey =
  "BAffDkGrxLFl2QWIWxfnh4MaTZmqnYgmrM-ddelh37V_dkLlyfmExc6e5yzL252bUHTsuqSLSNSRsMAwyTIRL_s";

const LoginService: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const guardarTokenDispositivo = async (uid: string, email: string) => {
    try {
      let token: string | undefined;

      if (Capacitor.isNativePlatform()) {
        // Para app móvil con Capacitor
        const permissionResult = await FirebaseMessaging.requestPermissions();
        if (permissionResult.receive === "granted") {
          const tokenResult = await FirebaseMessaging.getToken();
          token = tokenResult.token;
        }
      } else {
        // Para web
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          token = await getWebToken(messaging, { vapidKey });
        }
      }

      const db = getFirestore();
      const userDocRef = doc(db, "usuarios", uid);

      // Datos para actualizar
      const userData: any = {
        correo: email,
        fechaRegistro: new Date().toISOString(),
      };

      if (token) {
        userData.tokenDispositivo = token;
        console.log("Token obtenido:", token);
      } else {
        console.warn("No se obtuvo token de notificaciones");
      }

      await setDoc(userDocRef, userData, { merge: true });
      console.log("Usuario registrado o actualizado en Firestore");

    } catch (e) {
      console.error("Error guardando datos del usuario:", e);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await guardarTokenDispositivo(userCredential.user.uid, email);
      history.replace("/");
    } catch (e: any) {
      setError(e.message);
    }

    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await guardarTokenDispositivo(userCredential.user.uid, email);
      history.replace("/");
    } catch (e: any) {
      setError(e.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <IonItem lines="none">
          <IonLabel position="floating">Email</IonLabel>
          <IonInput
            type="email"
            value={email}
            onIonChange={(e) => setEmail(e.detail.value ?? "")}
            required
          />
        </IonItem>
        <IonItem lines="none">
          <IonLabel position="floating">Password</IonLabel>
          <IonInput
            type="password"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value ?? "")}
            required
          />
        </IonItem>
        {error && <IonText color="danger">{error}</IonText>}
        <IonButton
          expand="block"
          type="submit"
          disabled={!email || !password}
          className="main-button"
        >
          Iniciar Sesión
        </IonButton>
      </form>
      <IonButton
        expand="block"
        color="primary"
        onClick={handleRegister}
        disabled={!email || !password}
        className="main-button"
        style={{ marginTop: "1rem" }}
      >
        Registrar
      </IonButton>
      <IonLoading isOpen={loading} message="Procesando..." />
    </div>
  );
};

export default LoginService;
