import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/navbar";
import { HomePage } from "./pages/home";
import { ProductPage } from "./pages/product";
import { AuctionPage } from "./pages/auction";
import { AuctionDetailPage } from "./pages/auction-detail";
import { LocalServicesPage } from "./pages/local-services";
import { ServiceDetailPage } from "./pages/service-detail";
import { CreateAuctionPage } from "./pages/create-auction";
import { CreateListingPage } from "./pages/create-listing";
import { CreateListingDemoPage } from "./pages/create-listing-demo";
import { ProfilePage } from "./pages/profile";
import { MessagesPage } from "./pages/messages";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { LocationProvider } from "./context/LocationContext";
import { VRProvider } from "./context/VRContext";
import { VROverlay } from "./components/vr-overlay";
import VerticalPage from "./pages/vertical";
import { useDisclosure } from "@heroui/react";
import { CreateListingButton } from "./components/create-listing-button";
import FMPage from './pages/fm';
import { UpdateAuctionPage } from "./pages/update-auction";

function AppContent() {
  const location = useLocation();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    updateMobile(); // Check on load
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 3) {
        onOpen();
      }
    };
    document.addEventListener('touchstart', handleTouchStart);
    return () => document.removeEventListener('touchstart', handleTouchStart);
  }, [onOpen]);

  const hideNavbar = isMobile && location.pathname === "/vertical";

  return (
    <div className="min-h-screen">
      {!hideNavbar && <Navbar />}
      <main className="container mx-auto px-4 py-8 pb-20 sm:pb-8">
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/product/:id" component={ProductPage} />
          <Route exact path="/auctions" component={AuctionPage} />
          <Route path="/auction/:id" component={AuctionDetailPage} />
          <Route exact path="/local-services" component={LocalServicesPage} />
          <Route path="/service/:id" component={ServiceDetailPage} />
          <Route path="/create-auction" component={CreateAuctionPage} />
          <Route path="/update-auction/:id" component={UpdateAuctionPage} />
          <Route path="/create-listing" component={CreateListingPage} />
          <Route path="/create-listing-demo" component={CreateListingDemoPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/messages" component={MessagesPage} />
          <Route path="/vertical" component={VerticalPage} />
          <Route path="/fm" component={FMPage} />
        </Switch>
        <Route exact path="/">
          <CreateListingButton />
        </Route>
      </main>
      <VROverlay />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <LocationProvider>
          <VRProvider>
            <Router>
              <AppContent />
            </Router>
          </VRProvider>
        </LocationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
