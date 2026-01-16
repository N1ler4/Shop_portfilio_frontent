import React, { useEffect, useState } from "react";
import { Link as RouteLink, useHistory } from "react-router-dom";
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Badge,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { LoginModal } from "./auth/login-modal";
import { RegisterModal } from "./auth/register-modal";
import { ThemeSwitcher } from "./theme-switcher";
import { LanguageSelector } from "./language-selector";
import { VRModeToggle } from "./vr-mode-toggle";
import { VerticalModeToggle } from "./vertical-mode-toggle";
import { useLanguage } from "../context/LanguageContext";
import { useVRMode } from "../context/VRContext";
import { useLocation } from "../context/LocationContext";
import useAuth from "../helper/is_auth";
import useAuthStore from "../store/auth";
import { removeToken } from "../helper/auth-helper";
import useChatStore from "../store/message";
import { use } from "framer-motion/client";
import GlobalSearch from "./search-modal";

export const Navbar: React.FC = () => {
  const [user, setUser] = React.useState<any>(null);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const history = useHistory();

  const { t } = useLanguage();
  const { isVRMode } = useVRMode();
  const { location, isLocationConfirmed, resetLocationConfirmation } =
    useLocation();
  const {
    isOpen: isLoginOpen,
    onOpen: onLoginOpen,
    onOpenChange: onLoginOpenChange,
  } = useDisclosure();
  const {
    isOpen: isRegisterOpen,
    onOpen: onRegisterOpen,
    onOpenChange: onRegisterOpenChange,
  } = useDisclosure();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { isLoggedIn } = useAuth();
  const { showProfile } = useAuthStore();
  const { getUnreadCount } = useChatStore();
  const [unReadCount, setUnReadCount] = React.useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadCount();
        setUnReadCount(count?.unread_count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };
    if (isLoggedIn) {
      fetchUnreadCount();
    }
  }, [isLoggedIn, getUnreadCount]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await showProfile();
        if (response) {
          setUser(response);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, [showProfile]);

  const firstNameInitial = user?.full_name?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <HeroNavbar
        maxWidth="2xl"
        className="glass-card "
        isBlurred={false}
        isBordered={false}
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarContent className="lg:hidden" justify="start">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          />
        </NavbarContent>

        <NavbarBrand>
          <RouteLink
            to="/"
            className="flex items-center gap-2 text-sm md:text-base"
          >
            <Icon
              icon="lucide:layout-grid"
              className="text-primary text-xl md:text-2xl"
            />
            <p className="font-bold text-inherit text-sm md:text-base">OUR</p>
          </RouteLink>
        </NavbarBrand>

        <NavbarContent
          className="hidden lg:flex gap-4 md:gap-6 lg:gap-8"
          justify="center"
        >
          {isLocationConfirmed && (
            <NavbarItem>
              <Button
                variant="light"
                startContent={<Icon icon="lucide:map-pin" />}
                className="text-default-600 text-xs md:text-sm"
                onPress={resetLocationConfirmation}
              >
                {location.city !== "Выберите город"
                  ? location.city
                  : location.region}
              </Button>
            </NavbarItem>
          )}
          <NavbarItem>
            <Link
              as={RouteLink}
              to="/"
              color="foreground"
              className="text-xs md:text-sm"
            >
              {t("navigation.home")}
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              as={RouteLink}
              to="/auctions"
              color="foreground"
              className="text-xs md:text-sm"
            >
              {t("navigation.auctions")}
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              as={RouteLink}
              to="/local-services"
              color="foreground"
              className="text-xs md:text-sm"
            >
              {t("navigation.services")}
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              as={RouteLink}
              to="/fm"
              color="primary"
              className="font-semibold flex items-center gap-1 text-xs md:text-sm"
            >
              <Icon
                icon="lucide:zap"
                className="text-primary text-base md:text-lg"
              />{" "}
              FM
            </Link>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent justify="end" className="gap-1 md:gap-2 lg:gap-3">
          <NavbarItem className="md:flex">
            <Button
              isIconOnly
              variant="light"
              onPress={() => setIsGlobalSearchOpen(true)}
              aria-label="Search"
            >
              <Icon icon="lucide:search" className="text-lg md:text-xl" />
            </Button>
          </NavbarItem>
          <NavbarItem>
            <VerticalModeToggle />
          </NavbarItem>
          <NavbarItem className="hidden md:flex">
            <VRModeToggle />
          </NavbarItem>
          <NavbarItem className="hidden md:flex">
            <ThemeSwitcher />
          </NavbarItem>
          <NavbarItem className="hidden md:flex">
            <LanguageSelector />
          </NavbarItem>
          <NavbarItem className="md:flex">
            {unReadCount > 0 ? (
              <Badge content={unReadCount} color="danger" shape="circle">
                <Button
                  isIconOnly
                  variant="light"
                  aria-label="Messages"
                  as={RouteLink}
                  to="/messages"
                >
                  <Icon
                    icon="lucide:message-circle"
                    className="text-lg md:text-xl"
                  />
                </Button>
              </Badge>
            ) : (
              <Button
                isIconOnly
                variant="light"
                aria-label="Messages"
                as={RouteLink}
                to="/messages"
              >
                <Icon
                  icon="lucide:message-circle"
                  className="text-lg md:text-xl"
                />
              </Button>
            )}
          </NavbarItem>

          <NavbarItem>
            {!isLoggedIn ? (
              <>
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<Icon icon="lucide:user" />}
                  onPress={onLoginOpen}
                  className="hidden md:flex text-xs md:text-sm"
                >
                  {t("common.login")}
                </Button>
                <Button
                  isIconOnly
                  color="primary"
                  variant="flat"
                  onPress={onLoginOpen}
                  className="md:hidden"
                >
                  <Icon icon="lucide:user" className="text-lg" />
                </Button>
              </>
            ) : (
              <NavbarItem className="ml-2 md:ml-4">
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      color="primary"
                      variant="flat"
                      aria-label="User Menu"
                    >
                      {firstNameInitial}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="User Actions">
                    <DropdownItem
                      key="profile"
                      onPress={() => history.push("/profile")}
                    >
                      {t("navigation.profile")}
                    </DropdownItem>
                    <DropdownItem
                      key="logout"
                      onPress={() => {
                        removeToken();
                        window.location.reload();
                      }}
                    >
                      {t("common.logout")}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </NavbarItem>
            )}
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu className={`pt-4 md:pt-6 ${isVRMode ? "vr-enabled" : ""}`}>
          <NavbarMenuItem>
            <Link
              as={RouteLink}
              to="/"
              color="foreground"
              className="w-full py-1 md:py-2 text-sm md:text-base"   
              onPress={() => setIsMenuOpen(false)}
            >
              {t("navigation.home")}
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              as={RouteLink}
              to="/auctions"
              color="foreground"
              className="w-full py-1 md:py-2 text-sm md:text-base"
              onPress={() => setIsMenuOpen(false)}
            >
              {t("navigation.auctions")}
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              as={RouteLink}
              to="/local-services"
              color="foreground"
              className="w-full py-1 md:py-2 text-sm md:text-base"
              onPress={() => setIsMenuOpen(false)}
            >
              {t("navigation.services")}
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              as={RouteLink}
              to="/fm"
              color="foreground"
              className="w-full py-1 md:py-2 text-sm md:text-base"
              onPress={() => setIsMenuOpen(false)}
            >
              <Icon
                icon="lucide:zap"
                className="text-primary text-base md:text-lg"
              />{" "}
              FM
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            {isLoggedIn ? (
              <>
                <Link
                  as={RouteLink}
                  to="/profile"
                  color="foreground"
                  className="w-full py-1 md:py-2 text-sm md:text-base"
                  onPress={() => setIsMenuOpen(false)}
                >
                  {t("navigation.profile")}
                </Link>
              </>
            ) : (
              <Button
                color="primary"
                variant="flat"
                onPress={onLoginOpen}
                className="w-full mt-2 text-sm md:text-base"
              >
                {t("common.login")}
              </Button>
            )}
          </NavbarMenuItem>
          <NavbarMenuItem className="mt-2 md:mt-4 flex gap-2 md:gap-4">
            <ThemeSwitcher />
            <VRModeToggle />
            <LanguageSelector />
          </NavbarMenuItem>
        </NavbarMenu>
      </HeroNavbar>

      <LoginModal
        isOpen={isLoginOpen}
        onOpenChange={onLoginOpenChange}
        onRegisterClick={() => {
          onLoginOpenChange();
          setTimeout(() => onRegisterOpen(), 100);
        }}
      />
      <GlobalSearch
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onOpenChange={onRegisterOpenChange}
        onLoginClick={() => {
          onRegisterOpenChange();
          setTimeout(() => onLoginOpen(), 100);
        }}
      />
    </>
  );
};
