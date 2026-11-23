import { Route, Switch } from "wouter";
import { Provider } from "./components/provider";
import { Layout } from "./components/layout";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";
import Dashboard from "./pages/dashboard";
import Buildings from "./pages/buildings";
import MapPage from "./pages/map";
import Streets from "./pages/streets";
import Families from "./pages/families";
import Members from "./pages/members";
import Plates from "./pages/plates";
import Reports from "./pages/reports";
import UsersPage from "./pages/users";
import SettingsPage from "./pages/settings";

function App() {
  return (
    <Provider>
      <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/batiments" component={Buildings} />
          <Route path="/carte" component={MapPage} />
          <Route path="/rues" component={Streets} />
          <Route path="/familles" component={Families} />
          <Route path="/membres" component={Members} />
          <Route path="/plaques" component={Plates} />
          <Route path="/rapports" component={Reports} />
          <Route path="/utilisateurs" component={UsersPage} />
          <Route path="/parametres" component={SettingsPage} />
          <Route component={Dashboard} />
        </Switch>
      </Layout>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
