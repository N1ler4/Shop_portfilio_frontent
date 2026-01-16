import React, { useState, useEffect } from "react";
import { Link as RouteLink } from "react-router-dom";
import { Card, CardBody, CardFooter, Button, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export interface Auction {
  id?: any;
  auct_name: string;
  current_price: string;
  auct_time_left: string;
  auct_bids: any[];
  auct_img: string;
  end_time: string;
  auct_start_price: string;
  auct_reserv_price: string;
  auct_product_status: string;
  seller: string;
  auct_desc: string;
  auct_category: any;
  auct_detail: any;
  auct_minimum_bid: string;
  seller_company: string; // Добавлено
  seller_img: string; // Добавлено
  seller_id: any
}

interface AuctionCardProps {
  auction: Auction;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Обновление оставшегося времени
  useEffect(() => {
    if (!auction.end_time) return;

    const end = new Date(auction.end_time).getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Auction Ended");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 60000); // Обновление каждую минуту
    return () => clearInterval(timer);
  }, [auction.end_time]);

  // Вычисление timePercentage на основе end_time
  const calculateTimePercentage = () => {
    const end = new Date(auction.end_time).getTime();
    const start = new Date(new Date(auction.end_time).getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    const now = new Date().getTime();
    const total = end - start;
    const remaining = end - now;
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card
        className="glass-card product-card transition-all duration-300 h-full"
        isPressable
        as={RouteLink}
        to={`/auction/${auction.id}`}
      >
        <CardBody className="p-0 overflow-hidden">
          <div className="relative">
            <img
              src={auction.auct_img || "https://via.placeholder.com/150"}
              alt={auction.auct_name || "Untitled"}
              className="w-full h-32 sm:h-48 object-cover"
            />
            <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium">
              {timeLeft || "N/A"}
            </div>
          </div>
          <div className="p-2 sm:p-4">
            <h3 className="text-sm sm:text-lg font-semibold line-clamp-1">
              {auction.auct_name || "Untitled"}
            </h3>
            <div className="mt-1 sm:mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs sm:text-sm text-default-500">Current Bid</span>
                <span className="text-xs sm:text-sm text-default-500">
                  {auction.auct_bids?.length || 0} bids
                </span>
              </div>
              <p className="text-base sm:text-xl font-bold text-primary">
                ${parseFloat(auction.current_price || "0").toLocaleString()}
              </p>
            </div>
            <div className="mt-2 sm:mt-3">
              <Progress
                size="sm"
                value={calculateTimePercentage()}
                color={calculateTimePercentage() < 20 ? "danger" : "primary"}
                className="mt-1"
              />
            </div>
          </div>
        </CardBody>
        <CardFooter className="flex justify-between p-2 sm:p-4">
          <Button
            size="sm"
            variant="flat"
            color="primary"
            isIconOnly
            className="sm:hidden"
          >
            <Icon icon="lucide:eye" data-size={16} />
          </Button>
          <Button
            size="sm"
            variant="flat"
            color="primary"
            startContent={<Icon icon="lucide:eye" />}
            className="text-sm hidden sm:flex"
          >
            Watch
          </Button>
          <Button
            size="sm"
            color="primary"
            isIconOnly
            className="sm:hidden"
          >
            <Icon icon="lucide:gavel" data-size={16} />
          </Button>
          <Button
            size="sm"
            color="primary"
            endContent={<Icon icon="lucide:gavel" />}
            className="text-sm hidden sm:flex"
          >
            Place Bid
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

