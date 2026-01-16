import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { ServiceCard } from "../components/service-card";
import useServiceStore from "../store/service";
import useAuth from "../helper/is_auth";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { TimePicker } from "antd";
import dayjs from "dayjs";

export const LocalServicesPage: React.FC = () => {
  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const [location, setLocation] = useState({
    region: "Все регионы",
    city: "Выберите город",
    district: "Выберите район",
  });
  const [selectedCategory, setSelectedCategory] = useState<number>(100000);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const { isLoggedIn } = useAuth();
  const { getServices, postService, getServiceCategories } = useServiceStore();
  const [services, setServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceCategoriesList, setServiceCategoriesList] = useState<
    { id: number; serv_category_name: string }[]
  >([]);

  const [workDays, setWorkDays] = useState(
    daysOfWeek.map((day) => ({ day, time: "", status: "" }))
  );

  useEffect(() => {
    const fetchServices = async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 100000)
        params.append("serv_category", selectedCategory.toString());
      if (searchQuery) params.append("search", searchQuery);
      params.append("page", currentPage.toString());
      params.append("limit", pageSize.toString());

      const response = await getServices(params.toString());

      if (response?.data) {
        setServices(response.data.results || []);
        setTotalItems(response.data.count || 0);
      } else {
        setServices([]);
        setTotalItems(0);
      }
    };
    fetchServices();
  }, [
    location,
    selectedCategory,
    searchQuery,
    getServices,
    currentPage,
    pageSize,
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const categories = await getServiceCategories();
        if (Array.isArray(categories?.data?.results)) {
          setServiceCategoriesList([
            { id: 100000, serv_category_name: "Все" },
            ...categories.data.results,
          ]);
        } else {
          setServiceCategoriesList([{ id: 100000, serv_category_name: "Все" }]);
        }
      } catch (error) {
        setServiceCategoriesList([{ id: 100000, serv_category_name: "Все" }]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const getDefaultCategoryForForm = () => {
    const realCategories = serviceCategoriesList.filter(
      (cat) => cat.id !== 100000
    );
    return realCategories.length > 0 ? realCategories[0].id : 1;
  };

  const validationSchema = Yup.object({
    serv_name: Yup.string().required("Обязательное поле").min(1).max(255),
    serv_price: Yup.string()
      .required("Обязательное поле")
      .matches(/^\d+(\.\d{1,2})?$/, "Введите корректную цену"),
    serv_desc: Yup.string().required("Обязательное поле").min(1),
    serv_img: Yup.mixed()
      .required("Обязательное поле")
      .test(
        "fileSize",
        "Файл слишком большой",
        (value) => value instanceof File && value.size <= 5 * 1024 * 1024
      )
      .test(
        "fileType",
        "Недопустимый формат файла",
        (value) =>
          value instanceof File &&
          ["image/jpeg", "image/png"].includes(value.type)
      ),
    serv_location: Yup.string().required("Обязательное поле").min(1).max(255),
    serv_category: Yup.number().required("Обязательное поле").min(1),
  });

  const handleSuggestService = async (values, { resetForm }) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null)
          formData.append(key, key === "serv_category" ? String(value) : value);
      });
      formData.append("work_days", JSON.stringify(workDays));
      const response = await postService(formData);
      if (response?.data && !response.error) {
        setServices((prev) => [...prev, response.data]);
        setIsModalOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error("Ошибка при отправке услуги:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);
  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Услуги</h1>
        <p className="text-default-600 text-base sm:text-lg">
          Найдите проверенных специалистов в вашем регионе
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 mb-4 lg:mb-0">
            <Card className="glass-card border-none mb-4 lg:mb-8 min-w-[280px] lg:min-w-0">
              <CardBody className="p-4">
                <h3 className="text-lg font-semibold mb-4 hidden lg:block">
                  Категории услуг
                </h3>
                {loadingCategories ? (
                  <div className="flex justify-center">
                    <Spinner size="sm" color="primary" />
                  </div>
                ) : (
                  <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                    {serviceCategoriesList.map((category) => (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id ? "solid" : "light"
                        }
                        color={
                          selectedCategory === category.id
                            ? "primary"
                            : "default"
                        }
                        className="justify-start whitespace-nowrap lg:whitespace-normal"
                        size="sm"
                        onPress={() => {
                          setSelectedCategory(category.id);
                        }}
                      >
                        {category.serv_category_name}
                      </Button>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-3 order-1 lg:order-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-6 sm:mb-8"
          >
            <Card className="glass-card border-none">
              <CardBody className="p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Поиск услуг"
                    placeholder="Сантехник, электрик, репетитор..."
                    startContent={
                      <Icon icon="lucide:search" className="text-default-400" />
                    }
                    size="lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">
                Популярные услуги{" "}
                {location.region !== "Все регионы"
                  ? `в ${location.region}`
                  : ""}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="light"
                  color="primary"
                  onPress={handlePreviousPage}
                  disabled={currentPage === 1}
                  startContent={<Icon icon="lucide:chevron-left" />}
                >
                  Previous
                </Button>
                <Button
                  variant="light"
                  color="primary"
                  onPress={handleNextPage}
                  disabled={currentPage === totalPages}
                  endContent={<Icon icon="lucide:chevron-right" />}
                >
                  Next
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
            <div className="mt-4 text-center">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 sm:mb-12"
          >
            <Card className="glass-card border-none overflow-hidden">
              <CardBody className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-4 sm:p-8 flex flex-col justify-center">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">
                      Вы специалист?
                    </h2>
                    <p className="text-default-600 mb-4 sm:mb-6 text-sm sm:text-base">
                      Присоединяйтесь к нашей платформе и находите клиентов в
                      вашем регионе. Получайте больше заказов и развивайте свой
                      бизнес с нашими инструментами.
                    </p>
                    <div className="flex flex-wrap gap-2 sm:gap-4">
                      {!isLoggedIn && (
                        <Button
                          color="primary"
                          endContent={<Icon icon="lucide:arrow-right" />}
                          size="sm"
                          className="flex-1 sm:flex-none"
                        >
                          Зарегистрироваться
                        </Button>
                      )}
                      <Button
                        variant="bordered"
                        color="primary"
                        startContent={<Icon icon="lucide:info" />}
                        size="sm"
                        className="flex-1 sm:flex-none"
                      >
                        Узнать больше
                      </Button>
                      <Button
                        variant="bordered"
                        color="primary"
                        startContent={<Icon icon="lucide:plus-circle" />}
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onPress={() => setIsModalOpen(true)}
                      >
                        Предложить услугу
                      </Button>
                    </div>
                  </div>
                  <div className="relative h-48 sm:h-64 md:h-auto">
                    <img
                      src="https://img.heroui.chat/image/places?w=800&h=600&u=40"
                      alt="Service Provider"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary-500/20"></div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="2xl"
        className="max-h-[90vh] overflow-y-auto"
      >
        <ModalContent>
          <ModalHeader>Предложить услугу</ModalHeader>
          <ModalBody>
            <Formik
              key={serviceCategoriesList.length}
              initialValues={{
                serv_name: "",
                serv_price: "",
                serv_desc: "",
                serv_img: null,
                serv_location: "",
                serv_category: getDefaultCategoryForForm(),
              }}
              validationSchema={validationSchema}
              onSubmit={handleSuggestService}
            >
              {({ setFieldValue }) => (
                <Form className="space-y-4">
                  <div>
                    <label
                      htmlFor="serv_name"
                      className="block text-sm font-medium mb-1"
                    >
                      Название услуги *
                    </label>
                    <Field
                      name="serv_name"
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Например: Сантехнические работы"
                    />
                    <ErrorMessage
                      name="serv_name"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="serv_price"
                      className="block text-sm font-medium mb-1"
                    >
                      Цена (в час $) *
                    </label>
                    <Field
                      name="serv_price"
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Например: 1000"
                    />
                    <ErrorMessage
                      name="serv_price"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="serv_desc"
                      className="block text-sm font-medium mb-1"
                    >
                      Описание *
                    </label>
                    <Field
                      name="serv_desc"
                      as="textarea"
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      placeholder="Подробное описание услуги..."
                    />
                    <ErrorMessage
                      name="serv_desc"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="serv_img"
                      className="block text-sm font-medium mb-1"
                    >
                      Изображение * (JPEG, PNG, макс. 5MB)
                    </label>
                    <input
                      name="serv_img"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        setFieldValue("serv_img", file);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="serv_img"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="serv_location"
                      className="block text-sm font-medium mb-1"
                    >
                      Местоположение *
                    </label>
                    <Field
                      name="serv_location"
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Например: Ташкент, Чиланзар"
                    />
                    <ErrorMessage
                      name="serv_location"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="serv_category" className="block mb-1">
                      Категория *
                    </label>
                    {loadingCategories ? (
                      <div className="flex justify-center">
                        <Spinner size="sm" color="primary" />
                      </div>
                    ) : (
                      <Field
                        name="serv_category"
                        as={Select}
                        className="w-full"
                        defaultSelectedKeys={[100000]}
                      >
                        {serviceCategoriesList.map((category) => (
                          <SelectItem
                            key={category.id}
                            data-value={category.id.toString()}
                          >
                            {category.serv_category_name}
                          </SelectItem>
                        ))}
                      </Field>
                    )}
                    <ErrorMessage
                      name="serv_category"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">
                      Рабочие дни и время
                    </label>
                    {workDays.map((wd, idx) => (
                      <div
                        key={wd.day}
                        className="flex items-center gap-3 mb-2"
                      >
                        <div style={{ width: 100 }}>
                          {wd.day.charAt(0).toUpperCase() + wd.day.slice(1)}
                        </div>

                        <TimePicker.RangePicker
                          format="HH:mm"
                          data-value={
                            wd.time.includes("-")
                              ? wd.time.split("-").map((t) => dayjs(t, "HH:mm"))
                              : null
                          }
                          onChange={(range) => {
                            const formatted =
                              range && range[0] && range[1]
                                ? `${range[0].format(
                                    "HH:mm"
                                  )}-${range[1].format("HH:mm")}`
                                : "";
                            const newWorkDays = [...workDays];
                            newWorkDays[idx].time = formatted;
                            setWorkDays(newWorkDays);
                          }}
                          getPopupContainer={(triggerNode) =>
                            triggerNode.parentNode
                          }
                          allowClear
                          minuteStep={5}
                        />

                        <select
                          className="p-2 border rounded"
                          value={wd.status}
                          onChange={(e) => {
                            const newWorkDays = [...workDays];
                            newWorkDays[idx].status = e.target.value;
                            setWorkDays(newWorkDays);
                          }}
                        >
                          <option value="">Открыт</option>
                          <option value="closed">Закрыт</option>
                        </select>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    color="primary"
                    isLoading={isSubmitting}
                    className="w-full"
                  >
                    Отправить
                  </Button>
                </Form>
              )}
            </Formik>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsModalOpen(false)}>
              Закрыть
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
