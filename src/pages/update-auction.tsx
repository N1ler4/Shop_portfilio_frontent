import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
  Divider,
  Tabs,
  Tab,
  Chip,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import useAuctionStore from "../store/auction";

interface ParamTypes {
  id?: string;
}

export const UpdateAuctionPage: React.FC = () => {
  const { id } = useParams<ParamTypes>();
  const { t } = useLanguage();
  const { getAuctionDetail, updateAuction, getAuctionCategory } = useAuctionStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [duration, setDuration] = useState("7");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [minBid, setMinBid] = useState("");
  const [allowAutoBid, setAllowAutoBid] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctionAndCategories = async () => {
      try {
        setLoading(true);
        // Fetch auction details
        const auction = await getAuctionDetail(id);
        if (auction) {
          setTitle(auction.auct_name || "");
          setDescription(auction.auct_desc || "");
          setStartingPrice(auction.auct_start_price || "");
          setReservePrice(auction.auct_reserv_price || "");
          setDuration(auction.auct_time_left ? String(Math.ceil(new Date(auction.end_time).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : "7");
          setCategory(auction.auct_category?.id || "");
          setCondition(auction.auct_product_status || "");
          setMinBid(auction.auct_minimum_bid || "");
          setAllowAutoBid(auction.allow_auto_bid !== false);
          setExistingImage(auction.auct_img || null);
        }

        // Fetch categories
        const categories = await getAuctionCategory();
        if (categories) {
          setCategories(categories.results);
        }
      } catch (error) {
        console.error("Failed to fetch auction or categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionAndCategories();
  }, [id, getAuctionDetail, getAuctionCategory]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setExistingImage(null); // Clear existing image when a new one is uploaded
    }
  };

  const removeImage = () => {
    setImage(null);
    setExistingImage(null);
  };

  const conditions = [
    { value: "new", label: t("filters.new") },
    { value: "used", label: t("filters.used") },
    { value: "refurbished", label: "Refurbished" },
    { value: "damaged", label: "Damaged" },
  ];

  const durations = [
    { value: 1, label: "1 " + t("auction.days") },
    { value: 3, label: "3 " + t("auction.days") },
    { value: 5, label: "5 " + t("auction.days") },
    { value: 7, label: "7 " + t("auction.days") },
    { value: 10, label: "10 " + t("auction.days") },
    { value: 14, label: "14 " + t("auction.days") },
    { value: 30, label: "30 " + t("auction.days") },
  ];

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("auct_name", title);
    formData.append("auct_desc", description);
    formData.append("auct_start_price", startingPrice);
    formData.append("auct_reserv_price", reservePrice || "");
    formData.append("duration", duration);
    formData.append("auct_category_id", category);
    formData.append("auct_product_status", condition);
    formData.append("auct_minimum_bid", minBid);
    if (image) formData.append("auct_img", image);

    try {
      const response = await updateAuction(id, formData);
      if (response) {
        window.location.href = `/auction/${id}`; 
      }
    } catch (error) {
      console.error("Error updating auction:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">{t("auction.updateAuction")}</h1>
        <p className="text-default-600 text-lg">{t("auction.updateAuctionSubtitle")}</p>
      </motion.div>

      <Card className="glass-card border-none mb-8">
        <CardHeader>
          <Tabs
            aria-label="Auction update tabs"
            selectedKey={activeTab}
            onSelectionChange={setActiveTab as any}
            color="primary"
            variant="underlined"
            classNames={{
              tabList: "gap-6",
              cursor: "w-full bg-primary-200",
              tab: "max-w-fit px-2 h-12",
            }}
          >
            <Tab
              key="details"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:clipboard" />
                  <span>{t("auction.auctionDetails")}</span>
                </div>
              }
            />
            <Tab
              key="images"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:image" />
                  <span>{t("auction.uploadImages")}</span>
                  <Chip size="sm" variant="flat" color="primary">{image || existingImage ? 1 : 0}</Chip>
                </div>
              }
            />
            <Tab
              key="preview"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:eye" />
                  <span>{t("auction.previewAuction")}</span>
                </div>
              }
              isDisabled={!title || !startingPrice || !category}
            />
          </Tabs>
        </CardHeader>
        <CardBody>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {activeTab === "details" && (
              <>
                <Input
                  label={t("auction.auctionTitle")}
                  placeholder={t("auction.auctionTitle")}
                  value={title}
                  onValueChange={setTitle}
                  variant="bordered"
                  isRequired
                />
                <Textarea
                  label={t("auction.auctionDescription")}
                  placeholder={t("auction.auctionDescription")}
                  value={description}
                  onValueChange={setDescription}
                  variant="bordered"
                  minRows={4}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t("auction.startingPrice")}
                    placeholder="0.00"
                    value={startingPrice}
                    onValueChange={setStartingPrice}
                    variant="bordered"
                    startContent={<span className="text-default-400">$</span>}
                    type="number"
                    isRequired
                  />
                  <Input
                    label={t("auction.reservePrice")}
                    placeholder="0.00 (optional)"
                    value={reservePrice}
                    onValueChange={setReservePrice}
                    variant="bordered"
                    startContent={<span className="text-default-400">$</span>}
                    type="number"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label={t("auction.category")}
                    placeholder={t("auction.category")}
                    selectedKeys={category ? [category] : []}
                    onChange={(e) => setCategory(e.target.value)}
                    variant="bordered"
                    isRequired
                  >
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} data-value={cat.auct_category_name}>
                        {cat.auct_category_name}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    label={t("auction.condition")}
                    placeholder={t("auction.condition")}
                    selectedKeys={condition ? [condition] : []}
                    onChange={(e) => setCondition(e.target.value)}
                    variant="bordered"
                  >
                    {conditions.map((cond) => (
                      <SelectItem key={cond.value} data-value={cond.value}>
                        {cond.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label={t("auction.auctionDuration")}
                    placeholder={t("auction.auctionDuration")}
                    selectedKeys={[duration]}
                    onChange={(e) => setDuration(e.target.value)}
                    variant="bordered"
                  >
                    {durations.map((dur) => (
                      <SelectItem key={dur.value} data-value={String(dur.value)}>
                        {dur.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    label={t("auction.bidIncrement")}
                    placeholder="1.00"
                    value={minBid}
                    onValueChange={setMinBid}
                    variant="bordered"
                    startContent={<span className="text-default-400">$</span>}
                    type="number"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{t("auction.allowAutoBid")}</h3>
                    <p className="text-default-500 text-sm">
                      Allow buyers to set maximum bids automatically
                    </p>
                  </div>
                  <Switch
                    isSelected={allowAutoBid}
                    onValueChange={setAllowAutoBid}
                    color="primary"
                  />
                </div>
                <Divider />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="flat"
                    color="default"
                    startContent={<Icon icon="lucide:save" />}
                  >
                    {t("auction.saveAsDraft")}
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => setActiveTab("images")}
                    endContent={<Icon icon="lucide:arrow-right" />}
                  >
                    {t("common.next")}
                  </Button>
                </div>
              </>
            )}
            {activeTab === "images" && (
              <>
                <div className="text-center p-8 border-2 border-dashed rounded-lg border-default-300 cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Icon icon="lucide:upload-cloud" className="text-4xl text-default-400 mx-auto mb-2" />
                    <h3 className="font-medium">{t("auction.uploadImages")}</h3>
                    <p className="text-default-500 text-sm">Drag and drop or click to upload</p>
                  </label>
                </div>
                {(image || existingImage) && (
                  <div className="relative group w-full max-w-xs mx-auto">
                    <img
                      src={image ? URL.createObjectURL(image) : existingImage || ""}
                      alt="Auction image"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        isIconOnly
                        color="danger"
                        variant="flat"
                        size="sm"
                        onPress={removeImage}
                      >
                        <Icon icon="lucide:trash-2" />
                      </Button>
                    </div>
                  </div>
                )}
                <Divider />
                <div className="flex justify-between gap-2">
                  <Button
                    variant="flat"
                    color="default"
                    startContent={<Icon icon="lucide:arrow-left" />}
                    onPress={() => setActiveTab("details")}
                  >
                    {t("common.back")}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="flat"
                      color="default"
                      startContent={<Icon icon="lucide:save" />}
                    >
                      {t("auction.saveAsDraft")}
                    </Button>
                    <Button
                      color="primary"
                      onPress={() => setActiveTab("preview")}
                      endContent={<Icon icon="lucide:arrow-right" />}
                      isDisabled={!title || !startingPrice || !category}
                    >
                      {t("auction.previewAuction")}
                    </Button>
                  </div>
                </div>
              </>
            )}
            {activeTab === "preview" && (
              <>
                <div className="bg-content2 p-6 rounded-lg">
                  <h2 className="text-2xl font-bold mb-2">{title}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    <div>
                      {(image || existingImage) ? (
                        <img
                          src={image ? URL.createObjectURL(image) : existingImage || ""}
                          alt={title}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-64 bg-default-100 rounded-lg flex items-center justify-center">
                          <Icon icon="lucide:image" className="text-4xl text-default-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <div className="text-sm text-default-500">{t("auction.startingPrice")}</div>
                          <div className="text-2xl font-bold text-primary">
                            ${parseFloat(startingPrice).toLocaleString()}
                          </div>
                        </div>
                        {reservePrice && (
                          <>
                            <Divider orientation="vertical" className="h-10" />
                            <div>
                              <div className="text-sm text-default-500">{t("auction.reservePrice")}</div>
                              <div className="text-xl font-bold">${parseFloat(reservePrice).toLocaleString()}</div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <Chip color="primary" variant="flat">
                          {categories.find((c) => c.id === category)?.auct_category_name || "No category"}
                        </Chip>
                        {condition && (
                          <Chip color="secondary" variant="flat">
                            {conditions.find((c) => c.value === condition)?.label}
                          </Chip>
                        )}
                        <Chip color="default" variant="flat">
                          {durations.find((d) => String(d.value) === duration)?.label}
                        </Chip>
                      </div>
                      <div className="mb-4">
                        <h3 className="font-medium mb-1">{t("auction.auctionDescription")}</h3>
                        <p className="text-default-600">{description || "No description provided."}</p>
                      </div>
                      <div className="flex gap-2 mt-6">
                        <Button
                          color="primary"
                          size="lg"
                          className="flex-1"
                          startContent={<Icon icon="lucide:check" />}
                          onPress={handleSubmit}
                        >
                          {t("auction.updateAuction")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <Divider />
                <div className="flex justify-between gap-2">
                  <Button
                    variant="flat"
                    color="default"
                    startContent={<Icon icon="lucide:arrow-left" />}
                    onPress={() => setActiveTab("images")}
                  >
                    {t("common.back")}
                  </Button>
                  <Button
                    color="primary"
                    startContent={<Icon icon="lucide:check" />}
                    onPress={handleSubmit}
                  >
                    {t("auction.updateAuction")}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </CardBody>
      </Card>
    </div>
  );
};