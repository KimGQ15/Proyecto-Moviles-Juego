import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route } from "react-router-dom";
//import Acelerometro from './components/Juego/Acelerometro';
import Home from "./components/Pantalla/Home";
import Juego from "./components/Juego/Juego";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/palettes/dark.system.css";
import "./theme/variables.css";
import Login from "./pages/Login";
import EnviarReto from "./components/Retos/EnviarReto";
import RetosRecibidos from "./components/Retos/RetosRecibidos";
import HistorialRetos from "./components/Retos/HistorialRetos";
import PuntuajeGlobal from "./components/MarcadorGlobal/PuntuajeGlobal";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/jugar">
          <Juego />
        </Route>
        <Route exact path="/enviar-reto" component={EnviarReto} />
        <Route exact path="/retos-recibidos" component={RetosRecibidos} />
        <Route exact path="/historial-retos" component={HistorialRetos} />
        <Route exact path="/puntuaje-global" component={PuntuajeGlobal} />
        <Route exact path="/login">
          <Login />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
