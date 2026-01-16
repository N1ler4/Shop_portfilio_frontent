import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Divider,
  Tabs,
  Tab,
  Breadcrumbs,
  BreadcrumbItem,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Spinner,
  useDisclosure,
  useDraggable,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import useReviewStore from "../store/review";
import { ServiceCard } from "../components/service-card";
import * as Yup from "yup";
import { useLanguage } from "../context/LanguageContext";
import { Rating } from "../components/rating";
import useServiceStore from "../store/service";
import { Field, Form, Formik } from "formik";
import useAuthStore from "../store/auth";
import { TimePicker } from "antd";
import dayjs from "dayjs";

const weekDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;

// Интерфейсы для типизации
interface Service {
  is_liked?: boolean;
  id?: string;
  serv_name?: string;
  serv_price?: string;
  serv_desc?: string;
  serv_img?: string;
  serv_location?: string;
  serv_category?: number;
  user_img?: string;
  serv_company?: string;
  user_registrated_date?: string;
  serv_reviews?: Review[];
  similar_services?: Service[];
  avg_rating?: number;
  serv_tags?: string[];
  owner_id?: string;
  work_days?: any;
}

interface Review {
  id: string;
  full_name: string;
  user_img: string;
  rating?: any;
  content: string;
  created_at: string;
}

interface ParamTypes {
  id: any;
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
  };
  return new Date(dateString).toLocaleDateString("en-EN", options);
};

const UpdateServiceSchema = Yup.object().shape({
  serv_name: Yup.string().required("Service name is required"),
  serv_price: Yup.string().required("Price is required"),
  serv_desc: Yup.string().required("Description is required"),
  serv_location: Yup.string().required("Location is required"),
});

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<ParamTypes>() || { id: "" };
  const { t } = useLanguage();
  const { getServiceById, likeService, updateService, deleteService } =
    useServiceStore();
  const { postServiceRewiew } = useReviewStore();
  const { showProfile } = useAuthStore();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedTab, setSelectedTab] = React.useState("description");
  const [service, setService] = React.useState<Service | null>(null);
  const [date_registered, setDateRegistered] = React.useState<string>("");
  const [services, setServices] = React.useState<Service[]>([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [profile , setProfile] = useState<any>(null);

  const targetRef = React.useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const ReviewSchema = Yup.object().shape({
    content: Yup.string().required("Content is required"),
    rating: Yup.number()
      .min(0.5, "Minimum rating is 0.5")
      .max(5, "Maximum rating is 5")
      .required("Rating is required"),
  });


  const avgRating = service?.avg_rating || 0;

  const handlePostReview = async (reviewData: {
    content: string;
    rating: number;
  }) => {
    try {
      const newReviewResponse = await postServiceRewiew(id, reviewData);
      const newReview = newReviewResponse?.data as Review;
      if (newReview) {
        const updatedReviews = [newReview, ...(service?.serv_reviews || [])];
        const totalRatings = updatedReviews.reduce(
          (acc, review) => acc + (review.rating || 0),
          0
        );
        const newAvgRating = +(totalRatings / updatedReviews?.length).toFixed(
          1
        );
        setService(
          (prevService) =>
            ({
              ...prevService,
              serv_reviews: updatedReviews,
              avg_rating: newAvgRating,
            } as Service)
        );
      } else {
        console.error("Review posting failed");
      }
    } catch (error) {
      console.error("Error posting review:", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleLikeService = async () => {
    try {
      const response = await likeService(id);
      if (response) {
        setService(
          (prevService) =>
            ({
              ...prevService,
              is_liked: !prevService?.is_liked,
            } as Service)
        );
      } else {
        console.error("Unliked successfully");
      }
    } catch (error) {
      console.error("Error liking service:", error);
    }
  };

  const handleUpdateService = async (values: any) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("serv_name", values.serv_name);
      formData.append("serv_price", values.serv_price);
      formData.append("serv_desc", values.serv_desc);
      formData.append("serv_location", values.serv_location);

      if (values.serv_img instanceof File) {
        formData.append("serv_img", values.serv_img);
      }

      formData.append("work_days", JSON.stringify(values.work_days));

      const updatedService = await updateService(id, formData);
      if (updatedService && updatedService.data) {
        setService(updatedService.data);
      } else {
        console.error("Failed to update service");
      }
    } catch (error) {
      console.error("Error updating service:", error);
    } finally {
      setIsSubmitting(false);
      setIsUpdateModalOpen(false);
    }
  };

  const handleDeleteService = async () => {
    try {
      const response = await deleteService(id);
      if (response.status === 204) {
        window.location.href = "/local-services"; // Перенаправление после удаления
      } else {
        console.error("Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  useEffect(() => {
    const fetchService = async () => {
      setIsLoading(true);
      try {
        const response = await getServiceById(id);
        if (response && response.data) {
          setService(response.data);
          setDateRegistered(formatDate(response.data.user_registrated_date));
          setServices(response.data.similar_services || []);
          setUser(response.data.company);
        } else {
          setService(null);
          console.error("No data in response:", response);
        }
      } catch (error) {
        console.error("Error fetching service:", error);
        setService(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchService();
  }, [id, getServiceById]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await showProfile();
        setProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, [showProfile]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-default-600">Loading</p>
        </div>
      </motion.div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-16">
        <Icon
          icon="lucide:alert-circle"
          className="text-4xl text-danger mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold mb-2">{t("common.error")}</h2>
        <p className="text-default-600 mb-6">{t("services.serviceNotFound")}</p>
        <Button
          as={Link}
          to="/local-services"
          color="primary"
          startContent={<Icon icon="lucide:arrow-left" />}
        >
          {t("common.backToServices")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs className="mb-6">
        <BreadcrumbItem as={Link} to="/">
          {t("navigation.home")}
        </BreadcrumbItem>
        <BreadcrumbItem as={Link} to="/local-services">
          {t("navigation.services")}
        </BreadcrumbItem>
        <BreadcrumbItem>{service?.serv_name}</BreadcrumbItem>
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
                src={service?.serv_img}
                alt={service?.serv_name}
                className="w-full h-64 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h1 className="text-2xl font-bold text-white">
                  {service?.serv_name}
                </h1>
                <div className="flex items-center gap-2 text-white/90">
                  <Icon icon="lucide:map-pin" style={{ fontSize: 16 }} />
                  <span>{service?.serv_location}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Tabs
            aria-label="Service details"
            color="primary"
            className="mb-6"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
          >
            <Tab key="description" title={t("Description")}>
              <Card className="glass-card border-none">
                <CardBody className="p-6">
                  <h2 className="text-xl font-bold mb-4">
                    {t("About this service")}
                  </h2>
                  <p className="text-default-700 mb-6">{service?.serv_desc}</p>

                  <h3 className="text-lg font-semibold mb-3">
                    {t("What included")}
                  </h3>
                  <ul className="space-y-2 mb-6">
                    {service?.serv_tags?.map((tag: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Icon
                          icon="lucide:check"
                          className="text-primary mt-1"
                        />
                        <span>{tag}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2">
                      <Icon icon="lucide:check" className="text-primary mt-1" />
                      <span>Professional equipment and tools</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon icon="lucide:check" className="text-primary mt-1" />
                      <span>Satisfaction guarantee</span>
                    </li>
                  </ul>

                  <Divider className="my-6" />

                  <h3 className="text-lg font-semibold mb-3">Availability</h3>
                  {service.work_days && service?.work_days?.length > 0 && (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                        {service.work_days.map(({ day, time, status }, idx) => (
                          <div
                            key={day + idx}
                            className="border border-default-200 rounded-md p-3 text-center"
                          >
                            <div className="font-medium">{t(`${day}`)}</div>
                            <div className="text-default-500 text-sm">
                              {time && time.trim() !== "" ? time : t("closed")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardBody>
              </Card>
            </Tab>

            <Tab key="reviews" title="Reviews">
              <Card className="glass-card border-none">
                <CardBody className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{avgRating}</div>
                      <Rating value={avgRating} />
                      <div className="text-sm text-default-500 mt-1">
                        {service?.serv_reviews?.length || 0} reviews
                      </div>
                    </div>

                    <Divider orientation="vertical" />

                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const total = service?.serv_reviews?.length || 1;
                        const count =
                          service?.serv_reviews?.filter(
                            (r: Review) => r.rating === star
                          )?.length || 0;
                        const percent = Math.round((count / total) * 100);
                        return (
                          <div
                            key={star}
                            className="flex items-center gap-2 mb-1"
                          >
                            <span className="text-sm w-4">{star}</span>
                            <Icon
                              icon="lucide:star"
                              className="text-yellow-500"
                              style={{ fontSize: 14 }}
                            />
                            <div className="flex-1 h-2 bg-default-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    color="primary"
                    variant="flat"
                    className="mb-6"
                    onPress={() => setIsModalOpen(true)}
                    disabled={isSubmitting}
                  >
                    Write review
                  </Button>
                  <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                  >
                    <ModalContent>
                      <ModalHeader>Write a Review</ModalHeader>
                      <Formik
                        initialValues={{ content: "", rating: 5 }}
                        validationSchema={ReviewSchema}
                        onSubmit={async (values, { resetForm }) => {
                          setIsSubmitting(true);
                          await handlePostReview(values);
                          resetForm();
                          setIsSubmitting(false);
                        }}
                      >
                        {({ errors, touched }) => (
                          <Form>
                            <ModalBody className="space-y-4">
                              <Field
                                name="rating"
                                type="number"
                                min="0.5"
                                max="5"
                                step="0.5"
                                as={Input}
                                label="Rating (1-5)"
                                status={
                                  errors.rating && touched.rating
                                    ? "error"
                                    : "default"
                                }
                                errorMessage={
                                  errors.rating &&
                                  touched.rating &&
                                  errors.rating
                                }
                                disabled={isSubmitting}
                              />
                              <Field
                                name="content"
                                as={Textarea}
                                label="Your review"
                                placeholder="Tell us about your experience..."
                                status={
                                  errors.content && touched.content
                                    ? "error"
                                    : "default"
                                }
                                errorMessage={
                                  errors.content &&
                                  touched.content &&
                                  errors.content
                                }
                                disabled={isSubmitting}
                              />
                            </ModalBody>
                            <ModalFooter>
                              <Button
                                variant="light"
                                onClick={() => setIsModalOpen(false)}
                                disabled={isSubmitting}
                              >
                                Cancel
                              </Button>
                              <Button
                                color="primary"
                                type="submit"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "Submitting..." : "Submit"}
                              </Button>
                            </ModalFooter>
                          </Form>
                        )}
                      </Formik>
                    </ModalContent>
                  </Modal>

                  <Divider className="mb-6" />

                  <div className="space-y-6">
                    {service?.serv_reviews?.map((review: Review) => (
                      <div key={review.id} className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar src={review.user_img} className="w-10 h-10" />
                          <div>
                            <h4 className="font-semibold">
                              {review.full_name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Rating value={review.rating} size="sm" />
                              <span className="text-xs text-default-500">
                                • {formatDate(review.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-default-700">{review.content}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </Tab>

            <Tab key="faq" title="Faq">
              <Card className="glass-card border-none">
                <CardBody className="p-6">
                  <h2 className="text-xl font-bold mb-4">
                    {t("services.frequentlyAskedQuestions")}
                  </h2>

                  <div className="space-y-4">
                    <div className="border-b border-default-200 pb-4">
                      <h3 className="font-semibold mb-2">
                        How long does the service typically take?
                      </h3>
                      <p className="text-default-600">
                        Most services are completed within 2-3 hours depending
                        on the complexity and size of the job.
                      </p>
                    </div>
                    {/* Other FAQ items */}
                  </div>
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
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-primary">
                    {service?.serv_price}/hour
                  </h2>
                  <p className="text-default-500 text-sm">Per service</p>
                </div>
                <Button isIconOnly variant="light" aria-label="Share">
                  <Icon icon="lucide:share" />
                </Button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <Avatar src={user?.profile_image} className="w-12 h-12" />
                <div>
                  <h3 className="font-semibold">{user?.company_name}</h3>
                  <div className="flex items-center gap-1">
                    <Icon
                      icon="lucide:star"
                      className="text-yellow-500"
                      style={{ fontSize: 14 }}
                    />
                    <span className="text-sm">
                      {user?.rate} • Member since {date_registered}
                    </span>
                  </div>
                </div>
              </div>

              <Divider className="my-4" />

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-default-600">Response rate</span>
                  <span className="font-medium">98%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-600">Response time</span>
                  <span className="font-medium">~2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-600">Last active</span>
                  <span className="font-medium">Today</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  color="primary"
                  size="lg"
                  startContent={<Icon icon="lucide:calendar" />}
                >
                  Book now
                </Button>
                <Button
                  variant="flat"
                  color="primary"
                  size="lg"
                  startContent={<Icon icon="lucide:message-circle" />}
                >
                  Contact provider
                </Button>
                <Button
                  variant={service?.is_liked ? "solid" : "light"}
                  color={service?.is_liked ? "danger" : "primary"}
                  size="lg"
                  startContent={<Icon icon="lucide:heart" />}
                  onPress={handleLikeService}
                >
                  {service?.is_liked
                    ? "Delete from favorite"
                    : "Save to favorite"}
                </Button>
                {profile?.id === Number(service?.owner_id) && (
                  <>
                    <Button
                      variant="flat"
                      color="warning"
                      size="lg"
                      startContent={<Icon icon="lucide:edit" />}
                      onPress={() => setIsUpdateModalOpen(true)}
                    >
                      Update service
                    </Button>
                    <Button
                      variant="flat"
                      color="danger"
                      size="lg"
                      startContent={<Icon icon="lucide:trash" />}
                      onPress={onOpen}
                    >
                      Delete service
                    </Button>
                    <Modal
                      ref={targetRef}
                      isOpen={isOpen}
                      onOpenChange={onOpenChange}
                      as={Link}
                      to={`/local-services/`}
                    >
                      <ModalContent>
                        {(onClose) => (
                          <>
                            <ModalHeader
                              {...moveProps}
                              className="flex flex-col gap-1"
                            >
                              Delete service
                            </ModalHeader>
                            <ModalBody>
                              <p>
                                Are you sure you want to delete this service?
                                This action cannot be undone.
                              </p>
                            </ModalBody>
                            <ModalFooter>
                              <Button
                                color="danger"
                                variant="light"
                                onPress={onClose}
                              >
                                Close
                              </Button>
                              <Button
                                color="primary"
                                onPress={handleDeleteService}
                              >
                                Confirm
                              </Button>
                            </ModalFooter>
                          </>
                        )}
                      </ModalContent>
                    </Modal>
                  </>
                )}
              </div>
            </CardBody>
          </Card>

          <Modal
            isOpen={isUpdateModalOpen}
            onClose={() => {
              if (!isSubmitting) setIsUpdateModalOpen(false);
            }}
            className="max-w-xl max-h-[90vh] overflow-y-auto"
          >
            <ModalContent>
              <ModalHeader>Update Service</ModalHeader>
              <Formik
                initialValues={{
                  serv_name: service?.serv_name || "",
                  serv_price: service?.serv_price || "",
                  serv_desc: service?.serv_desc || "",
                  serv_location: service?.serv_location || "",
                  serv_img: service?.serv_img || "",
                  work_days:
                    service?.work_days?.length === 7
                      ? service?.work_days
                      : weekDays.map((day) => ({ day, time: "", status: "" })),
                }}
                validationSchema={UpdateServiceSchema}
                onSubmit={async (values, { resetForm }) => {
                  await handleUpdateService(values);
                  resetForm();
                }}
              >
                {({ values, errors, touched, setFieldValue }) => (
                  <Form>
                    <ModalBody className="space-y-4">
                      <Field
                        name="serv_name"
                        as={Input}
                        label="Service Name"
                        status={
                          errors.serv_name && touched.serv_name
                            ? "error"
                            : "default"
                        }
                        errorMessage={
                          errors.serv_name &&
                          touched.serv_name &&
                          errors.serv_name
                        }
                        disabled={isSubmitting}
                      />
                      <Field name="serv_img">
                        {({ field, form }: any) => (
                          <div>
                            <label htmlFor="serv_img">Service Image</label>
                            <input
                              id="serv_img"
                              type="file"
                              accept="image/*"
                              onChange={(event) => {
                                form.setFieldValue(
                                  "serv_img",
                                  event.currentTarget.files?.[0] || null
                                );
                              }}
                              disabled={isSubmitting}
                              className={
                                form.errors.serv_img && form.touched.serv_img
                                  ? "error-input"
                                  : "default-input"
                              }
                            />
                            {form.errors.serv_img && form.touched.serv_img && (
                              <div className="error-message">
                                {form.errors.serv_img}
                              </div>
                            )}
                          </div>
                        )}
                      </Field>
                      <Field
                        name="serv_price"
                        as={Input}
                        label="Price"
                        status={
                          errors.serv_price && touched.serv_price
                            ? "error"
                            : "default"
                        }
                        errorMessage={
                          errors.serv_price &&
                          touched.serv_price &&
                          errors.serv_price
                        }
                        disabled={isSubmitting}
                      />
                      <Field
                        name="serv_desc"
                        as={Textarea}
                        label="Description"
                        status={
                          errors.serv_desc && touched.serv_desc
                            ? "error"
                            : "default"
                        }
                        errorMessage={
                          errors.serv_desc &&
                          touched.serv_desc &&
                          errors.serv_desc
                        }
                        disabled={isSubmitting}
                      />
                      <Field
                        name="serv_location"
                        as={Input}
                        label="Location"
                        status={
                          errors.serv_location && touched.serv_location
                            ? "error"
                            : "default"
                        }
                        errorMessage={
                          errors.serv_location &&
                          touched.serv_location &&
                          errors.serv_location
                        }
                        disabled={isSubmitting}
                      />
                    </ModalBody>
                    <div className="p-8">
                      <h3 className="font-semibold mb-2">Work Days</h3>
                      {weekDays.map((day, index) => {
                        const rawTime = values.work_days[index]?.time;
                        const timeRange =
                          rawTime && rawTime.includes("-")
                            ? rawTime
                                .split("-")
                                .map((t: any) => dayjs(t, "HH:mm"))
                            : [];

                        return (
                          <div
                            key={day}
                            className="flex items-center gap-4 mb-4"
                          >
                            <label className="w-24">{t(`${day}`)}</label>
                            <TimePicker.RangePicker
                              getPopupContainer={(triggerNode) =>
                                triggerNode.parentNode as HTMLElement
                              }
                              format="HH:mm"
                              value={timeRange.length === 2 ? timeRange : null}
                              onChange={(range) => {
                                const formatted =
                                  range && range[0] && range[1]
                                    ? `${range[0].format(
                                        "HH:mm"
                                      )}-${range[1].format("HH:mm")}`
                                    : "";
                                setFieldValue(
                                  `work_days.${index}.time`,
                                  formatted
                                );
                              }}
                              allowClear
                            />
                          </div>
                        );
                      })}
                    </div>
                    <ModalFooter>
                      <Button
                        variant="light"
                        onClick={() => {
                          if (!isSubmitting) setIsUpdateModalOpen(false);
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        color="primary"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Updating..." : "Update"}
                      </Button>
                    </ModalFooter>
                  </Form>
                )}
              </Formik>
            </ModalContent>
          </Modal>

          <Card className="glass-card border-none">
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-2">Safety tips</h3>
              <ul className="text-default-600 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <Icon
                    icon="lucide:check-circle"
                    className="text-success mt-0.5"
                  />
                  <span>Meet in a public place for initial consultation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="lucide:check-circle"
                    className="text-success mt-0.5"
                  />
                  <span>Verify provider credentials before booking</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon
                    icon="lucide:check-circle"
                    className="text-success mt-0.5"
                  />
                  <span>Pay through our secure platform</span>
                </li>
              </ul>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Similar services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {services
            .filter((s) => s?.id !== service?.id)
            .map((service) => (
              <ServiceCard key={service?.id} service={service} />
            ))}
        </div>
      </div>
    </div>
  );
};
