import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Pages
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, ...props }: any) {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component {...props} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/">
        <ProtectedRoute component={Dashboard} filterType="all" />
      </Route>
      <Route path="/pending">
        <ProtectedRoute component={Dashboard} filterType="pending" />
      </Route>
      <Route path="/completed">
        <ProtectedRoute component={Dashboard} filterType="completed" />
      </Route>
      <Route path="/high-priority">
        <ProtectedRoute component={Dashboard} filterType="high-priority" />
      </Route>
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
