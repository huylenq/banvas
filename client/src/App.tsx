import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import DrawingApp from "@/pages/DrawingApp";
import { useEffect } from "react";

// Component to handle TLDraw's automatic redirects
function UrlHandler() {
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    // If the URL contains initialPath or other TLDraw params, redirect to clean URL
    if (location.includes('initialPath=') || location.includes('id=')) {
      setLocation('/');
    }
  }, [location, setLocation]);
  
  return null;
}

function Router() {
  return (
    <>
      <UrlHandler />
      <Switch>
        <Route path="/" component={DrawingApp} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
