import React, { useState, useEffect } from "react";
import { Button, Card, CardBody, Chip, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Link as RouteLink } from "react-router-dom";
import { AuctionCard } from "../components/auction-card";
import { useLanguage } from "../context/LanguageContext";
import useAuctionStore from "../store/auction";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Функция для получения иконки категории на основе названия
const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  
  // Точное соответствие для ваших категорий
  switch (name) {
    case 'electronics':
      return 'lucide:smartphone';
    case 'furniture':
      return 'lucide:home';
    case 'clothing':
      return 'lucide:shirt';
    case 'vehicles':
      return 'lucide:car';
    case 'services':
      return 'lucide:settings';
    case 'realestate':
    case 'real estate':
      return 'lucide:building';
    case 'jobs':
      return 'lucide:briefcase';
    case 'agriculture':
      return 'lucide:wheat';
    case 'free':
      return 'lucide:gift';
    case 'business':
      return 'lucide:building-2';
    case 'kids':
      return 'lucide:baby';
    default:
      // Fallback для других возможных названий
      if (name.includes('electronic') || name.includes('электроника') || 
          name.includes('phone') || name.includes('телефон') ||
          name.includes('computer') || name.includes('компьютер')) {
        return 'lucide:smartphone';
      }
      
      if (name.includes('furniture') || name.includes('мебель') ||
          name.includes('home') || name.includes('дом')) {
        return 'lucide:home';
      }
      
      if (name.includes('cloth') || name.includes('одежда') ||
          name.includes('fashion') || name.includes('мода')) {
        return 'lucide:shirt';
      }
      
      if (name.includes('vehicle') || name.includes('car') || name.includes('авто') ||
          name.includes('transport') || name.includes('транспорт')) {
        return 'lucide:car';
      }
      
      if (name.includes('service') || name.includes('услуг')) {
        return 'lucide:settings';
      }
      
      if (name.includes('estate') || name.includes('недвижим') ||
          name.includes('property') || name.includes('собственность')) {
        return 'lucide:building';
      }
      
      if (name.includes('job') || name.includes('work') || name.includes('работ') ||
          name.includes('career') || name.includes('карьер')) {
        return 'lucide:briefcase';
      }
      
      if (name.includes('agricult') || name.includes('сельск') ||
          name.includes('farm') || name.includes('ферм')) {
        return 'lucide:wheat';
      }
      
      if (name.includes('free') || name.includes('бесплат') ||
          name.includes('даром') || name.includes('gift')) {
        return 'lucide:gift';
      }
      
      if (name.includes('business') || name.includes('бизнес') ||
          name.includes('company') || name.includes('компан')) {
        return 'lucide:building-2';
      }
      
      if (name.includes('kid') || name.includes('детск') ||
          name.includes('child') || name.includes('ребен')) {
        return 'lucide:baby';
      }
      
      // По умолчанию
      return 'lucide:box';
  }
};

export const AuctionPage: React.FC = () => {
  const { t } = useLanguage();
  const { getAuctions, getFeaturedAuctions, getAuctionCategory } =
    useAuctionStore();
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [category, setCategory] = useState([]);
  const [choosenCategory, setChoosenCategory] = useState<string | null>("All");

  // Carousel settings for featured auctions
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await getAuctions({
          page: currentPage,
          auct_category:
            choosenCategory !== "All" ? choosenCategory : undefined,
        });
        const auctionData = response?.results || [];
        setAuctions(auctionData);
        setFilteredAuctions(auctionData); // Server-side filtering
        setTotalPages(Math.ceil(response.count / 10));
        setNextPage(response.next);
        setPrevPage(response.previous);
      } catch (error) {
        console.error("Failed to fetch auctions:", error);
        setAuctions([]);
        setFilteredAuctions([]);
        setTotalPages(1);
        setNextPage(null);
        setPrevPage(null);
      }
    };
    fetchAuctions();
  }, [getAuctions, currentPage, choosenCategory]);

  useEffect(() => {
    const getFeaturedAuction = async () => {
      try {
        const response = await getFeaturedAuctions();
        const auctionData = response || [];
        setFeatured(auctionData);
      } catch (error) {
        console.error("Failed to fetch featured auctions:", error);
        setFeatured([]);
      }
    };
    getFeaturedAuction();
  }, [getFeaturedAuctions]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAuctionCategory();
        setCategory(response || []);
      } catch (error) {
        console.error("Failed to fetch auction categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const getTimeLeft = (auction: any) => {
    if (!auction.end_time) return null;
    const now = new Date();
    const endTime = new Date(auction.end_time);
    const diffTime = endTime.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              {t("auction.liveAuctions")}
            </h1>
            <p className="text-default-600 text-base sm:text-lg">
              {t("auction.auctionSubtitle")}
            </p>
          </div>
          <Button
            as={RouteLink}
            to="/create-auction"
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            size="md"
            className="w-full sm:w-auto"
          >
            {t("auction.createNewAuction")}
          </Button>
        </div>
      </motion.div>

      {category.length > 0 && (
        <div className="w-full mb-8">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setChoosenCategory("All")}
              className={`cursor-pointer ${
                choosenCategory === "All"
                  ? "category-tile-selected"
                  : "category-tile"
              }`}
            >
              <Card
                className={`h-full w-full border-none flex flex-col items-center justify-center py-3 px-2 ${
                  choosenCategory === "All"
                    ? "bg-primary/10 shadow-md"
                    : "glass-card"
                }`}
              >
                <Icon
                  icon="lucide:layout-grid"
                  className={`text-2xl mb-2 ${
                    choosenCategory === "All"
                      ? "text-primary"
                      : "text-default-600"
                  }`}
                />
                <span
                  className={`text-xs text-center font-medium ${
                    choosenCategory === "All"
                      ? "text-primary"
                      : "text-default-600"
                  }`}
                >
                  All
                </span>
              </Card>
            </motion.div>
            {category.map((cat, index) => (
              <motion.div
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setChoosenCategory(cat.id)}
                className={`cursor-pointer ${
                  choosenCategory === cat.id
                    ? "category-tile-selected"
                    : "category-tile"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card
                  className={`h-full w-full border-none flex flex-col items-center justify-center py-3 px-2 ${
                    choosenCategory === cat.id
                      ? "bg-primary/10 shadow-md"
                      : "glass-card"
                  }`}
                >
                  <Icon
                    icon={getCategoryIcon(cat.auct_category_name)}
                    className={`text-2xl mb-2 ${
                      choosenCategory === cat.id
                        ? "text-primary"
                        : "text-default-600"
                    }`}
                  />
                  <span
                    className={`text-xs text-center font-medium ${
                      choosenCategory === cat.id
                        ? "text-primary"
                        : "text-default-600"
                    }`}
                  >
                    {cat.auct_category_name}
                  </span>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {featured.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-12"
        >
          {featured.length === 1 ? (
            <Card className="glass-card border-none overflow-hidden">
              <CardBody className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-4 sm:p-8 flex flex-col justify-center">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">
                      Featured Auction
                    </h2>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">
                      {featured[0].auct_name}
                    </h3>
                    <p className="text-default-600 mb-4 sm:mb-6 text-sm sm:text-base line-clamp-3">
                      {featured[0].auct_desc}
                    </p>
                    <div className="flex items-center gap-4 mb-4 sm:mb-6">
                      <div>
                        <div className="text-xs sm:text-sm text-default-500">
                          Current bid
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-primary">
                          $
                          {featured[0].current_price ||
                            featured[0].auct_start_price}
                        </div>
                      </div>
                      <Divider orientation="vertical" />
                      <div>
                        <div className="text-xs sm:text-sm text-default-500">
                          Auction ends in
                        </div>
                        <div className="text-xl sm:text-2xl font-bold">
                          {getTimeLeft(featured[0])}d left
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-4">
                      <Button
                        color="primary"
                        endContent={<Icon icon="lucide:gavel" />}
                        size="sm"
                        className="flex-1 sm:flex-none"
                        as={RouteLink}
                        to={`/auction/${featured[0].id}`}
                      >
                        Place Bid
                      </Button>
                      <Button
                        variant="bordered"
                        color="primary"
                        startContent={<Icon icon="lucide:info" />}
                        size="sm"
                        className="flex-1 sm:flex-none"
                        as={RouteLink}
                        to={`/auction/${featured[0].id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                  <div className="relative h-48 sm:h-64 md:h-auto">
                    <img
                      src={
                        featured[0].auct_img ||
                        "https://img.heroui.chat/image/fashion?w=800&h=600&u=30"
                      }
                      alt={featured[0].auct_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary-500/20"></div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Slider {...carouselSettings}>
              {featured.map((auction) => (
                <div key={auction.id}>
                  <Card className="glass-card border-none overflow-hidden">
                    <CardBody className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-4 sm:p-8 flex flex-col justify-center">
                          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">
                            Featured Auction
                          </h2>
                          <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">
                            {auction.auct_name}
                          </h3>
                          <p className="text-default-600 mb-4 sm:mb-6 text-sm sm:text-base line-clamp-3">
                            {auction.auct_desc}
                          </p>
                          <div className="flex items-center gap-4 mb-4 sm:mb-6">
                            <div>
                              <div className="text-xs sm:text-sm text-default-500">
                                Current bid
                              </div>
                              <div className="text-xl sm:text-2xl font-bold text-primary">
                                $
                                {auction.current_price ||
                                  auction.auct_start_price}
                              </div>
                            </div>
                            <Divider orientation="vertical" />
                            <div>
                              <div className="text-xs sm:text-sm text-default-500">
                                Auction ends in
                              </div>
                              <div className="text-xl sm:text-2xl font-bold">
                                {getTimeLeft(auction)}d left
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:gap-4">
                            <Button
                              color="primary"
                              endContent={<Icon icon="lucide:gavel" />}
                              size="sm"
                              className="flex-1 sm:flex-none"
                              as={RouteLink}
                              to={`/auction/${auction.id}`}
                            >
                              Place Bid
                            </Button>
                            <Button
                              variant="bordered"
                              color="primary"
                              startContent={<Icon icon="lucide:info" />}
                              size="sm"
                              className="flex-1 sm:flex-none"
                              as={RouteLink}
                              to={`/auction/${auction.id}`}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 w-full">
                          <img
                            src={
                              auction.auct_img ||
                              "https://img.heroui.chat/image/fashion?w=800&h=600&u=30"
                            }
                            alt={auction.auct_name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary-500/20"></div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              ))}
            </Slider>
          )}
        </motion.div>
      )}

      <div className="mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">
            Ending Soon
          </h2>
          <Button
            variant="light"
            color="primary"
            endContent={<Icon icon="lucide:arrow-right" />}
            size="sm"
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {filteredAuctions
            .filter((auction) => {
              const daysLeft = getTimeLeft(auction);
              return daysLeft !== null && daysLeft <= 2 && daysLeft > 0;
            })
            .map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
        </div>
      </div>

      <div className="mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">
            Popular Auctions
          </h2>
          <Button
            variant="light"
            color="primary"
            endContent={<Icon icon="lucide:arrow-right" />}
            size="sm"
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {filteredAuctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <Button
            onClick={() => paginate(currentPage - 1)}
            disabled={!prevPage}
            variant="bordered"
            size="sm"
            className="mr-2"
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              onClick={() => paginate(page)}
              color={currentPage === page ? "primary" : "default"}
              size="sm"
              className="mx-1"
            >
              {page}
            </Button>
          ))}
          <Button
            onClick={() => paginate(currentPage + 1)}
            disabled={!nextPage}
            variant="bordered"
            size="sm"
            className="ml-2"
          >
            Next
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-12"
      >
        <Card className="glass-card border-none">
          <CardBody className="p-4 sm:p-8">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                Start Your Own Auction
              </h2>
              <p className="text-default-600 max-w-lg mx-auto text-sm sm:text-base">
                Have something valuable to sell? Create an auction and let
                buyers bid on your items.
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                as={RouteLink}
                to="/create-auction"
                color="primary"
                size="md"
                startContent={<Icon icon="lucide:plus" />}
                className="w-full sm:w-auto"
              >
                Create Auction
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};