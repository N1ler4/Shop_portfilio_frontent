import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link as RouteLink } from "react-router-dom";
import {
  Button, Card, CardBody, Chip, Divider, Tabs, Tab, Breadcrumbs, BreadcrumbItem,
  Avatar, Progress, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Spinner, Textarea,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import useAuctionStore from "../store/auction";
import { AuctionCard, Auction } from "../components/auction-card";
import useAuth from "../helper/is_auth";
import { message } from "antd";
import useAuthStore from "../store/auth";
import ConfirmModal from "../components/confirm-modal";
import useChatStore from "../store/message";

interface Bid {
  user?: { full_name?: string; profile_image?: string };
  bidder?: { full_name?: string; profile_image?: string };
  bid_amount?: string;
  bid_time?: string;
}

interface Profile {
  user_id: number;
  firstName?: string;
  registered_at?: string;
  rating?: any;
  reviews_count?: number;
  total_sales?: number;
}

const RequestModal: React.FC<{
  isOpen: boolean;
  onOpenChange: () => void;
  msg: string;
  setMsg: (v: string) => void;
  onSend: () => void;
  t: (key: string) => string;
}> = ({ isOpen, onOpenChange, msg, setMsg, onSend, t }) => (
  <Modal isOpen={isOpen} onOpenChange={() => {
    onOpenChange();
    setMsg("");
  }}>
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader>Отправить сообщение</ModalHeader>
          <ModalBody>
            <Textarea
              placeholder="Ваше сообщение продавцу..."
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              minRows={4}
              maxRows={8}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={() => {
              onClose();
              setMsg("");
            }}>
              {t("common.cancel")}
            </Button>
            <Button 
              color="primary" 
              onPress={onSend}
              isDisabled={!msg.trim()}
            >
              Отправить
            </Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
);

export const AuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { t } = useLanguage();
  const { getAuctionDetail, deleteAuction, postBidAuction } = useAuctionStore();
  const { isLoggedIn } = useAuth();
  const { showUserStats } = useAuthStore();
  const { getConversations, sendMessage, createChat } = useChatStore();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [similarAuctions, setSimilarAuctions] = useState<Auction[]>([]);
  const [selectedTab, setSelectedTab] = useState("details");
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [modalOrder, setModalOrder] = useState<Auction | null>(null);
  const [requestMsg, setRequestMsg] = useState("");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [seller , setSeller] = useState<any>(null);

  const { isOpen: isBidOpen, onOpen: onBidOpen, onOpenChange: onBidOpenChange } = useDisclosure();
  const { isOpen: isRequestOpen, onOpen: onRequestOpen, onOpenChange: onRequestOpenChange } = useDisclosure();

  const formatDate = (date: string): string => 
    new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long" });

  const formatBidTime = (bidTime: string): string => {
    const bidDate = new Date(bidTime);
    const diffMs = Date.now() - bidDate.getTime();
    const seconds = Math.floor(diffMs / 1000);
    
    if (seconds < 60) return "только что";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} мин назад`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;
    const days = Math.floor(hours / 24);
    if (days === 1) return `Вчера в ${bidDate.getHours()}:${bidDate.getMinutes().toString().padStart(2, "0")}`;
    if (days < 7) return `${days} дн назад`;
    return bidDate.toLocaleDateString("ru-RU");
  };

  const mapAuctionData = (data: any): Auction => ({
    id: data.id,
    auct_name: data.auct_name,
    current_price: data.current_price,
    auct_time_left: data.auct_time_left,
    auct_bids: data.bids || [],
    auct_img: data.auct_img,
    end_time: data.end_time,
    auct_start_price: data.auct_start_price,
    auct_reserv_price: data.auct_reserv_price,
    auct_product_status: data.auct_product_status,
    seller: data.seller,
    auct_desc: data.auct_desc,
    auct_category: data?.auct_category?.auct_category_name,
    auct_detail: data?.auct_detail,
    auct_minimum_bid: data?.auct_minimum_bid || "50",
    seller_company: data.seller_company || "Unknown",
    seller_img: data.seller_img,
    seller_id: data.seller_id || null,
  });

  const minimumBid = useMemo(() => {
    const current = parseFloat(auction?.current_price || "0");
    const minStep = parseFloat(auction?.auct_minimum_bid || "50");
    return current + minStep;
  }, [auction]);

  const bidHistory = useMemo(() => {
    if (profile?.user_id == auction?.seller_id) {
      return [];
    }
    return auction?.auct_bids
      ?.map((bid: Bid, index: number) => ({
        user: bid.user?.full_name || bid.bidder?.full_name || `User ${index + 1}`,
        amount: parseFloat(bid.bid_amount || auction.current_price || "0"),
        time: bid.bid_time ? formatBidTime(bid.bid_time) : "нет данных",
        img: bid.user?.profile_image || bid.bidder?.profile_image ,
      }))
      .sort((a, b) => b.amount - a.amount) || [];
  }, [auction, profile?.user_id]);

  const calculateTimePercentage = () => {
    if (!auction?.end_time) return 0;
    const end = new Date(auction.end_time).getTime();
    const start = end - 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const total = end - start;
    const remaining = end - now;
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!showUserStats) return;
        const profileData = await showUserStats();
        setProfile(profileData.data);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchProfile();
  }, [showUserStats]);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        setLoading(true);
        const response = await getAuctionDetail(id!);
        setAuction(mapAuctionData(response));
        setSimilarAuctions((response.similar_auction || []).map(mapAuctionData));
        setSeller(response.seller || null);
      } catch (error) {
        console.error("Failed to fetch auction details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id, getAuctionDetail]);

  useEffect(() => {
    if (!auction?.end_time) return;
    const end = new Date(auction.end_time).getTime();
    
    const updateTimer = () => {
      const diff = end - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [auction?.end_time]);

  const handleSendRequest = async () => {
    if (!modalOrder || !requestMsg.trim() || !profile?.user_id) {
      message.error("Please enter a message.");
      return;
    }

    try {
      const sellerId = modalOrder.seller_id;
      if (!sellerId) {
        message.error("Invalid seller ID.");
        return;
      }

      const conversations = await getConversations();
      const existingChat = conversations?.find((chat: any) => chat.companion_id == sellerId);

      const chatId = existingChat?.id || (await createChat(sellerId))?.id;
      if (!chatId) throw new Error("Failed to create chat");

      await sendMessage(chatId, requestMsg);

      onRequestOpenChange();
      setRequestMsg("");
      setModalOrder(null);
      message.success("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
      message.error("Failed to send message. Please try again.");
    }
  };

  const handleBidSubmit = async () => {
    if (!isLoggedIn) {
      message.warning("Please log in to place a bid.");
      return;
    }

    if (profile?.user_id == auction?.seller_id) {
      message.warning("You cannot bid on your own auction.");
      return;
    }

    try {
      await postBidAuction({
        bidder: profile!.user_id,
        auction: auction!.id,
        bid_amount: bidAmount,
      });
      message.success("Bid placed successfully!");
      onBidOpenChange();
      setBidAmount("");
      const response = await getAuctionDetail(id!);
      setAuction(mapAuctionData(response));
    } catch (error) {
      console.error("Failed to place bid:", error);
      message.error("Failed to place bid. Please try again.");
    }
  };

  const handleDelete = () => {
    setIsConfirmOpen(false);
    deleteAuction(auction!.id)
      .then(() => {
        message.success("Auction deleted successfully.");
        window.location.href = "/auctions";
      })
      .catch((error) => {
        console.error("Failed to delete auction:", error);
        message.error("Failed to delete auction.");
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="text-center py-16">
        <Icon icon="lucide:alert-circle" className="text-4xl text-danger mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t("common.error")}</h2>
        <p className="text-default-600 mb-6">Auction Not Found</p>
        <Button as={RouteLink} to="/auctions" color="primary" startContent={<Icon icon="lucide:arrow-left" />}>
          {t("common.backToAuctions")}
        </Button>
      </div>
    );
  }

  const InfoItem = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <div className="flex items-center gap-2">
      <Icon icon={icon} className="text-default-500" />
      <span className="text-default-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="bg-content1 p-2 rounded-lg">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-default-500">{t(`auction.${label}`)}</div>
    </div>
  );

  return (
    <div>
      <Breadcrumbs className="mb-6">
        <BreadcrumbItem as={RouteLink} to="/">{t("navigation.home")}</BreadcrumbItem>
        <BreadcrumbItem as={RouteLink} to="/auctions">{t("navigation.auctions")}</BreadcrumbItem>
        <BreadcrumbItem>{auction.auct_name}</BreadcrumbItem>
      </Breadcrumbs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card border-none overflow-hidden mb-6">
            <CardBody className="p-0 relative">
              <img
                src={auction.auct_img}
                alt={auction.auct_name}
                className="w-full h-64 md:h-96 object-cover"
              />
            </CardBody>
          </Card>

          <Tabs
            color="primary"
            className="mb-6"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
          >
            <Tab key="details" title="Details">
              <Card className="glass-card border-none">
                <CardBody className="p-6">
                  <h2 className="text-xl font-bold mb-4">Item Description</h2>
                  <p className="text-default-700 mb-6">{auction.auct_desc || "No description provided."}</p>

                  <h3 className="text-lg font-semibold mb-3">Item Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <InfoItem icon="" label="Condition" value={auction.auct_product_status || "N/A"} />
                    <InfoItem icon="" label="Category" value={auction.auct_category || "N/A"} />
                    <InfoItem icon="" label="Start Price" value={`$${parseFloat(auction.auct_start_price || "0").toLocaleString()}`} />
                    <InfoItem icon="" label="Reserve Price" value={`$${parseFloat(auction.auct_reserv_price || "0").toLocaleString()}`} />
                    <InfoItem icon="" label="Seller" value={auction.seller_company} />
                    <InfoItem icon="" label="Minimum Bid" value={`$${parseFloat(auction.auct_minimum_bid || "50").toLocaleString()}`} />
                  </div>

                  <Divider className="my-6" />

                  <h3 className="text-lg font-semibold mb-3">Auction Terms</h3>
                  <ul className="space-y-2 mb-6">
                    {[
                      `Minimum bid increment: $${parseFloat(auction.auct_minimum_bid || "50").toLocaleString()}`,
                      "Buyer's premium: 10%",
                      "Payment due within 48 hours of auction close",
                      "Shipping costs are the responsibility of the buyer"
                    ].map((term, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Icon icon="lucide:check" className="text-primary mt-1" />
                        <span>{term}</span>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </Tab>

            <Tab key="bids" title="Bid History">
              <Card className="glass-card border-none">
                <CardBody className="p-6">
                  <h2 className="text-xl font-bold mb-4">Bid History</h2>
                  <div className="space-y-4">
                    {bidHistory.length ? (
                      bidHistory.map((bid, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-default-100 last:border-b-0">
                          <div className="flex items-center gap-3">
                            <Avatar src={bid.img} className="w-8 h-8" />
                            <div>
                              <p className="font-medium">{bid.user}</p>
                              <p className="text-xs text-default-500">{bid.time}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${index === 0 ? "text-primary" : "text-default-600"}`}>
                              ${bid.amount.toLocaleString()}
                            </p>
                            {index === 0 && (
                              <p className="text-xs text-primary font-medium">Current highest bid</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-default-600">No bids yet.</p>
                    )}
                  </div>

                  <div className="mt-6 bg-default-50 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Icon icon="lucide:info" className="text-primary mt-1" />
                      <div>
                        <h4 className="text-sm font-medium">Bid Information</h4>
                        <ul className="text-xs text-default-600 list-disc pl-4 mt-1 space-y-1">
                          <li>Minimum bid increment is ${parseFloat(auction.auct_minimum_bid || "50").toLocaleString()}</li>
                          <li>All bids are binding and cannot be retracted</li>
                          <li>The auction will be extended by 5 minutes if a bid is placed in the last 5 minutes</li>
                          <li>You will be notified if you are outbid</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Tab>

            <Tab key="seller" title="Seller Info">
              <Card className="glass-card border-none">
                <CardBody className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar src={auction.seller_img} className="w-16 h-16" />
                    <div>
                      <h2 className="text-xl font-bold">{auction.seller_company}</h2>
                      <div className="flex items-center gap-1">
                        <Icon icon="lucide:star" className="text-yellow-500" />
                        <span>{profile?.rating} ({profile?.reviews_count} reviews)</span>
                      </div>
                      <p className="text-default-500 text-sm">
                        Member since {formatDate(profile?.registered_at || new Date().toISOString())}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {[
                      ["Auctions completed", `${profile?.total_sales || 0}`],
                      ["Response rate", "98%"],
                      ["Shipping on time", "99%"]
                    ].map(([label, value], i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-default-600">{label}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>

                  <Divider className="my-6" />

                  <h3 className="text-lg font-semibold mb-3">Seller Description</h3>
                  <p className="text-default-700 mb-6">
                    "{auction.seller_company}" specializes in rare and unique items. All items are authenticated and come with a certificate of authenticity.
                  </p>

                  <Button
                    variant="flat"
                    color="primary"
                    startContent={<Icon icon="lucide:message-circle" />}
                    onPress={() => {
                      setModalOrder(auction);
                      setRequestMsg("");
                      onRequestOpen();
                    }}
                  >
                    Contact Seller
                  </Button>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </motion.div>

        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card border-none mb-6 sticky top-4">
            <CardBody className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-2xl font-bold">{auction.auct_name}</h1>
                <Button isIconOnly variant="light"><Icon icon="lucide:share" /></Button>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <Chip color="primary" variant="flat">Auction</Chip>
                <span className="text-xs text-default-500">•</span>
                <span className="text-default-500 text-sm">{auction.auct_bids?.length || 0} bids</span>
              </div>

              <div className="bg-default-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-default-600">Current cost</span>
                  <span className="text-2xl font-bold text-primary">
                    ${parseFloat(auction.current_price || "0").toLocaleString()}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-default-600">Time Left</span>
                    <span className="text-default-600">{Math.round(calculateTimePercentage())}% Completed</span>
                  </div>
                  <Progress
                    size="sm"
                    value={calculateTimePercentage()}
                    color={calculateTimePercentage() < 20 ? "danger" : "primary"}
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 text-center mb-4">
                  {[
                    [timeLeft.days, "days"],
                    [timeLeft.hours, "hours"],
                    [timeLeft.minutes, "minutes"],
                    [timeLeft.seconds, "seconds"]
                  ].map(([value, label], i) => (
                    <TimeBox key={i} value={value as number} label={label as string} />
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    color="primary"
                    size="lg"
                    startContent={<Icon icon="lucide:gavel" />}
                    onPress={isLoggedIn ? onBidOpen : () => message.warning("Please log in to bid.")}
                  >
                    {t("auction.placeBid")}
                  </Button>
                  <Button variant="flat" color="primary" size="lg" startContent={<Icon icon="lucide:bell" />}>
                    {t("auction.watchAuction")}
                  </Button>
                  
                  {profile?.user_id == auction.seller_id && (
                    <>
                      <Button
                        color="warning"
                        size="lg"
                        startContent={<Icon icon="lucide:edit" />}
                        onPress={() => (window.location.href = `/update-auction/${auction.id}`)}
                      >
                        Update
                      </Button>
                      <Button
                        color="danger"
                        size="lg"
                        startContent={<Icon icon="lucide:trash" />}
                        onPress={() => setIsConfirmOpen(true)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Divider className="my-4" />

              <div className="flex items-center gap-3 mb-6">
                <Avatar src={auction.seller_img} className="w-10 h-10" />
                <div>
                  <h3 className="font-semibold">{seller?.company_name}</h3>
                  <div className="flex items-center gap-1">
                    <Icon icon="lucide:star" className="text-yellow-500" />
                    <span className="text-sm">{seller?.rate} ({seller?.reviews_count} reviews)</span>
                  </div>
                </div>
              </div>

              <Button variant="light" size="sm" startContent={<Icon icon="lucide:flag" />} className="w-full">
                Report Listing
              </Button>
            </CardBody>
          </Card>

          <Card className="glass-card border-none">
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-2">Safety Tips</h3>
              <ul className="text-default-600 text-sm space-y-2">
                {[
                  "Research the item and seller before bidding",
                  "Only bid what you're willing to pay",
                  "Use our secure payment system"
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Icon icon="lucide:check-circle" className="text-success mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Similar Auctions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {similarAuctions.slice(0, 4).map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
          {similarAuctions.length === 0 && (
            <p className="text-default-600 col-span-full text-center">No similar auctions found.</p>
          )}
        </div>
      </div>

      <Modal isOpen={isBidOpen} onOpenChange={onBidOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{t("auction.placeBid")}</ModalHeader>
              <ModalBody>
                <p className="text-default-600 mb-4">
                  Current cost: <span className="font-bold text-primary">${parseFloat(auction.current_price || "0").toLocaleString()}</span>
                </p>
                <p className="text-default-600 mb-4">
                  Minimum bid: <span className="font-bold">${minimumBid.toLocaleString()}</span>
                </p>
                <Input
                  type="number"
                  label="Your bid amount ($)"
                  placeholder={minimumBid.toString()}
                  value={bidAmount}
                  onValueChange={setBidAmount}
                  startContent={<span className="text-default-400">$</span>}
                  min={minimumBid}
                  step={parseFloat(auction.auct_minimum_bid || "50")}
                />
                <div className="bg-default-50 p-3 rounded-lg mt-4">
                  <div className="flex items-start gap-2">
                    <Icon icon="lucide:info" className="text-primary mt-1" />
                    <div className="text-xs text-default-600">
                      By placing a bid, you agree to the auction terms and conditions. All bids are binding and cannot be retracted.
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>{t("common.cancel")}</Button>
                <Button
                  color="primary"
                  onPress={handleBidSubmit}
                  isDisabled={!bidAmount || parseFloat(bidAmount) < minimumBid}
                >
                  {t("auction.confirmBid")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {isRequestOpen && modalOrder && (
        <RequestModal
          isOpen={isRequestOpen}
          onOpenChange={onRequestOpenChange}
          msg={requestMsg}
          setMsg={setRequestMsg}
          onSend={handleSendRequest}
          t={t}
        />
      )}

      <ConfirmModal
        isConfirmOpen={isConfirmOpen}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};