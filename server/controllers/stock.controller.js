import prisma from "../config/prisma.js";

export const stockIn = async (req, res) => {
    try {
        const { productId, quantity, reason } = req.body;

        const id = Number(productId);
        const qty = Number(quantity);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (!Number.isInteger(qty) || qty <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Reason is required"
            });
        }

        const product = await prisma.product.findUnique({
            where: {
                id
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const result = await prisma.$transaction(async (tx) => {

            const updatedProduct = await tx.product.update({
                where: {
                    id
                },
                data: {
                    currentStock: {
                        increment: qty
                    }
                }
            });

            const movement = await tx.stockMovement.create({
                data: {
                    productId: id,
                    quantity: qty,
                    type: "IN",
                    reason,
                    createdBy: req.user.userId
                }
            });

            return {
                updatedProduct,
                movement
            };
        });

        return res.status(201).json({
            success: true,
            message: "Stock added successfully",
            data: result
        });

    } catch (error) {
        console.error("Stock IN Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const stockOut = async (req, res) => {
    try {
        const { productId, quantity, reason } = req.body;

        const id = Number(productId);
        const qty = Number(quantity);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (!Number.isInteger(qty) || qty <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Reason is required"
            });
        }

        const product = await prisma.product.findUnique({
            where: {
                id
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.currentStock < qty) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock",
                data: {
                    availableStock: product.currentStock,
                    requestedQuantity: qty
                }
            });
        }

        const result = await prisma.$transaction(async (tx) => {

            const updatedProduct = await tx.product.update({
                where: {
                    id
                },
                data: {
                    currentStock: {
                        decrement: qty
                    }
                }
            });

            const movement = await tx.stockMovement.create({
                data: {
                    productId: id,
                    quantity: qty,
                    type: "OUT",
                    reason,
                    createdBy: req.user.userId
                }
            });

            return {
                updatedProduct,
                movement
            };
        });

        return res.status(201).json({
            success: true,
            message: "Stock removed successfully",
            data: result
        });

    } catch (error) {
        console.error("Stock OUT Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getStockMovements = async (req, res) => {
    try {
        const {
            productId,
            search = "",
            type,
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

        const where = {};

        if (productId) {
            const id = Number(productId);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID"
                });
            }

            where.productId = id;
        }

        if (type) {
            if (!["IN", "OUT"].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: "Type must be IN or OUT"
                });
            }

            where.type = type;
        }

        if (search) {
            where.product = {
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
                    }
                ]
            };
        }

        const skip = (pageNumber - 1) * limitNumber;

        const [movements, total] = await Promise.all([
            prisma.stockMovement.findMany({
                where,
                skip,
                take: limitNumber,
                orderBy: {
                    createdAt: "desc"
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            sku: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        }
                    }
                }
            }),

            prisma.stockMovement.count({
                where
            })
        ]);

        return res.status(200).json({
            success: true,
            data: movements,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                totalPages: Math.ceil(total / limitNumber)
            }
        });

    } catch (error) {
        console.error("Get Stock Movements Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getLowStockProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                minStockAlert: {
                    gt: 0
                }
            },
            orderBy: {
                currentStock: "asc"
            }
        });

        const lowStockProducts = products.filter(
            product => product.currentStock <= product.minStockAlert
        );

        return res.status(200).json({
            success: true,
            data: lowStockProducts
        });

    } catch (error) {
        console.error("Get Low Stock Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};