import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { products } from "../data/products";

export const FeaturedSection: React.FC = () => {
  const arProducts = products.filter(p => p.hasAR).slice(0, 5);
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % arProducts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [arProducts.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="mb-12"
    >
      <Card className="glass-card border-none overflow-hidden">
        <CardBody className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4">Discover AR-Enabled Products</h2>
              <p className="text-default-600 mb-6">
                Experience products in your space before you buy. Our AR technology 
                lets you visualize how items will look in your home.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  color="primary"
                  endContent={<Icon icon="lucide:arrow-right" />}
                >
                  Explore AR Products
                </Button>
                <Button 
                  variant="bordered"
                  color="primary"
                  startContent={<Icon icon="lucide:info" />}
                >
                  How It Works
                </Button>
              </div>
            </div>
            <div className="relative h-64 md:h-auto flex items-center justify-center">
              {arProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: i === index ? 1 : 0, scale: i === index ? 1 : 0.98 }}
                  transition={{ duration: 0.7 }}
                  style={{ position: i === index ? 'relative' : 'absolute', inset: 0, pointerEvents: i === index ? 'auto' : 'none' }}
                  className="w-full h-full flex flex-col justify-end rounded-xl overflow-hidden shadow-lg bg-black/10"
                >
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-cover absolute inset-0 z-0 transition-all duration-700" 
                  />
                  <div className="relative z-10 bg-black/50 p-6 rounded-b-xl flex flex-col gap-2">
                    <h3 className="text-xl font-bold text-white line-clamp-1">{product.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-primary">${product.price.toLocaleString()}</span>
                      <span className="text-white/80 text-sm flex items-center gap-1"><Icon icon='lucide:map-pin' />{product.location}</span>
                    </div>
                    <Button
                      as="a"
                      href={`/product/${product.id}`}
                      color="primary"
                      size="sm"
                      className="w-fit mt-2"
                      endContent={<Icon icon="lucide:arrow-right" />}
                    >
                      Подробнее
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};