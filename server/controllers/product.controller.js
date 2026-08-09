import prisma from "../config/prisma.js";

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            sku,
            category,
            unitPrice,
            minStockAlert,
            location
        } = req.body;

        if (
            !name ||
            !sku ||
            !category ||
            unitPrice === undefined ||
            !location
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, SKU, category, unit price and location are required"
            });
        }

        if (Number(unitPrice) < 0) {
            return res.status(400).json({
                success: false,
                message: "Unit price cannot be negative"
            });
        }

        if (minStockAlert !== undefined && Number(minStockAlert) < 0) {
            return res.status(400).json({
                success: false,
                message: "Minimum stock alert cannot be negative"
            });
        }

        const existingProduct = await prisma.product.findUnique({
            where: {
                sku
            }
        });

        if (existingProduct) {
            return res.status(409).json({
                success: false,
                message: "Product with this SKU already exists"
            });
        }

        const product = await prisma.product.create({
            data: {
                name,
                sku,
                category,
                unitPrice: Number(unitPrice),
                currentStock: 0,
                minStockAlert: minStockAlert !== undefined
                    ? Number(minStockAlert)
                    : 0,
                location
            }
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });

    } catch (error) {
        console.error("Create Product Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const {
            search = "",
            category,
            page = 1,
            limit = 10
        } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (
            !Number.isInteger(pageNumber) ||
            pageNumber < 1 ||
            !Number.isInteger(limitNumber) ||
            limitNumber < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Page and limit must be positive numbers"
            });
        }

        const skip = (pageNumber - 1) * limitNumber;

        const where = {
            ...(search
                ? {
                      OR: [
                          {
                              name: {
                                  contains: search,
                                  mode: "insensitive"
                              }
                          },
                          {
                              sku: {
                                  contains: search,
                                  mode: "insensitive"
                              }
                          },
                          {
                              category: {
                                  contains: search,
                                  mode: "insensitive"
                              }
                          }
                      ]
                  }
                : {}),

            ...(category
                ? {
                      category: {
                          equals: category,
                          mode: "insensitive"
                      }
                  }
                : {})
        };

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limitNumber,
                orderBy: {
                    createdAt: "desc"
                }
            }),

            prisma.product.count({
                where
            })
        ]);

        return res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                totalPages: Math.ceil(total / limitNumber)
            }
        });

    } catch (error) {
        console.error("Get Products Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const productId = Number(req.params.id);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await prisma.product.findUnique({
            where: {
                id: productId
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error("Get Product Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const productId = Number(req.params.id);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const {
            name,
            sku,
            category,
            unitPrice,
            minStockAlert,
            location
        } = req.body;

        const existingProduct = await prisma.product.findUnique({
            where: {
                id: productId
            }
        });

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (unitPrice !== undefined && Number(unitPrice) < 0) {
            return res.status(400).json({
                success: false,
                message: "Unit price cannot be negative"
            });
        }

        if (minStockAlert !== undefined && Number(minStockAlert) < 0) {
            return res.status(400).json({
                success: false,
                message: "Minimum stock alert cannot be negative"
            });
        }

        if (sku && sku !== existingProduct.sku) {
            const skuExists = await prisma.product.findUnique({
                where: {
                    sku
                }
            });

            if (skuExists) {
                return res.status(409).json({
                    success: false,
                    message: "Product with this SKU already exists"
                });
            }
        }

        const product = await prisma.product.update({
            where: {
                id: productId
            },
            data: {
                name,
                sku,
                category,
                unitPrice: unitPrice !== undefined
                    ? Number(unitPrice)
                    : undefined,
                minStockAlert: minStockAlert !== undefined
                    ? Number(minStockAlert)
                    : undefined,
                location
            }
        });

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });

    } catch (error) {
        console.error("Update Product Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};