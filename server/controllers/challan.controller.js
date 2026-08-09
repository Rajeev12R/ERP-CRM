import prisma from "../config/prisma.js";

export const createChallan = async (req, res) => {
    try {
        const { customerId, items } = req.body;

        const customer = await prisma.customer.findUnique({
            where: {
                id: Number(customerId)
            }
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one product is required"
            });
        }

        // Validate quantities
        for (const item of items) {
            if (
                !Number.isInteger(Number(item.productId)) ||
                Number(item.productId) <= 0 ||
                !Number.isInteger(Number(item.quantity)) ||
                Number(item.quantity) <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Each product must have a valid productId and quantity"
                });
            }
        }

        const productIds = items.map(
            item => Number(item.productId)
        );

        // Prevent duplicate products in one challan
        if (new Set(productIds).size !== productIds.length) {
            return res.status(400).json({
                success: false,
                message: "A product cannot appear more than once in a challan"
            });
        }

        const products = await prisma.product.findMany({
            where: {
                id: {
                    in: productIds
                }
            }
        });

        if (products.length !== productIds.length) {
            return res.status(404).json({
                success: false,
                message: "One or more products not found"
            });
        }

        // Generate challan number
        const challanNo = `SC-${Date.now()}`;

        const challanItems = items.map(item => {
            const product = products.find(
                p => p.id === Number(item.productId)
            );

            return {
                productId: product.id,
                quantity: Number(item.quantity),

                // Snapshot data
                productName: product.name,
                sku: product.sku,
                unitPrice: product.unitPrice
            };
        });

        const totalQty = challanItems.reduce(
            (total, item) => total + item.quantity,
            0
        );

        const challan = await prisma.salesChallan.create({
            data: {
                challanNo,
                customerId: Number(customerId),
                createdBy: req.user.userId,
                status: "DRAFT",
                totalQty,
                items: {
                    create: challanItems
                }
            },
            include: {
                customer: true,
                items: true
            }
        });

        return res.status(201).json({
            success: true,
            message: "Sales challan created successfully",
            data: challan
        });

    } catch (error) {
        console.error("Create Challan Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getChallans = async (req, res) => {
    try {
        const {
            status,
            customerId,
            search = "",
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

        // Filter by status
        if (status) {
            const allowedStatuses = [
                "DRAFT",
                "CONFIRMED",
                "CANCELLED"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid challan status"
                });
            }

            where.status = status;
        }

        // Filter by customer
        if (customerId) {
            const id = Number(customerId);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid customer ID"
                });
            }

            where.customerId = id;
        }

        if (search) {
            where.OR = [
                {
                    challanNo: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    customer: {
                        name: {
                            contains: search,
                            mode: "insensitive"
                        }
                    }
                }
            ];
        }

        const skip = (pageNumber - 1) * limitNumber;

        const [challans, total] = await Promise.all([
            prisma.salesChallan.findMany({
                where,
                skip,
                take: limitNumber,

                orderBy: {
                    createdAt: "desc"
                },

                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            mobile: true,
                            businessName: true
                        }
                    },

                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        }
                    },

                    items: true
                }
            }),

            prisma.salesChallan.count({
                where
            })
        ]);

        return res.status(200).json({
            success: true,
            data: challans,

            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                totalPages: Math.ceil(total / limitNumber)
            }
        });

    } catch (error) {
        console.error("Get Challans Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getChallanById = async (req, res) => {
    try {
        const challanId = Number(req.params.id);

        if (!Number.isInteger(challanId) || challanId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid challan ID"
            });
        }

        const challan = await prisma.salesChallan.findUnique({
            where: {
                id: challanId
            },

            include: {
                customer: true,

                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },

                items: true
            }
        });

        if (!challan) {
            return res.status(404).json({
                success: false,
                message: "Challan not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: challan
        });

    } catch (error) {
        console.error("Get Challan Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const confirmChallan = async (req, res) => {
    try {
        const challanId = Number(req.params.id);

        if (!Number.isInteger(challanId) || challanId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid challan ID"
            });
        }

        const result = await prisma.$transaction(async (tx) => {

            // Get challan
            const challan = await tx.salesChallan.findUnique({
                where: {
                    id: challanId
                },

                include: {
                    items: true
                }
            });

            if (!challan) {
                throw new Error("CHALLAN_NOT_FOUND");
            }

            // Only drafts can be confirmed
            if (challan.status !== "DRAFT") {
                throw new Error("CHALLAN_NOT_DRAFT");
            }

            // Process every product
            for (const item of challan.items) {

                /*
                 * Atomic stock check + deduction.
                 *
                 * The update happens only when:
                 *
                 * currentStock >= requested quantity
                 */
                const updated = await tx.product.updateMany({
                    where: {
                        id: item.productId,
                        currentStock: {
                            gte: item.quantity
                        }
                    },

                    data: {
                        currentStock: {
                            decrement: item.quantity
                        }
                    }
                });

                // No row updated = product doesn't have enough stock
                if (updated.count === 0) {
                    throw new Error(
                        `INSUFFICIENT_STOCK:${item.productId}:${item.quantity}`
                    );
                }

                // Create stock movement
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        quantity: item.quantity,
                        type: "OUT",
                        reason: `Sales Challan ${challan.challanNo}`,
                        createdBy: req.user.userId
                    }
                });
            }

            // Mark challan confirmed
            const confirmedChallan = await tx.salesChallan.update({
                where: {
                    id: challanId
                },

                data: {
                    status: "CONFIRMED"
                },

                include: {
                    customer: true,
                    items: true
                }
            });

            return confirmedChallan;
        }, {
            maxWait: 5000,
            timeout: 10000
        });

        return res.status(200).json({
            success: true,
            message: "Sales challan confirmed successfully",
            data: result
        });

    } catch (error) {

        console.error("Confirm Challan Error:", error);

        if (error.message === "CHALLAN_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Challan not found"
            });
        }

        if (error.message === "CHALLAN_NOT_DRAFT") {
            return res.status(400).json({
                success: false,
                message: "Only draft challans can be confirmed"
            });
        }

        if (error.message.startsWith("INSUFFICIENT_STOCK:")) {

            const [, productId, quantity] =
                error.message.split(":");

            return res.status(400).json({
                success: false,
                message: "Insufficient stock",
                data: {
                    productId: Number(productId),
                    requestedQuantity: Number(quantity)
                }
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const cancelChallan = async (req, res) => {
    try {
        const challanId = Number(req.params.id);

        if (!Number.isInteger(challanId) || challanId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid challan ID"
            });
        }

        const challan = await prisma.salesChallan.findUnique({
            where: {
                id: challanId
            }
        });

        if (!challan) {
            return res.status(404).json({
                success: false,
                message: "Challan not found"
            });
        }

        if (challan.status !== "DRAFT") {
            return res.status(400).json({
                success: false,
                message: "Only draft challans can be cancelled"
            });
        }

        const cancelledChallan = await prisma.salesChallan.update({
            where: {
                id: challanId
            },

            data: {
                status: "CANCELLED"
            },

            include: {
                customer: true,
                items: true
            }
        });

        return res.status(200).json({
            success: true,
            message: "Sales challan cancelled successfully",
            data: cancelledChallan
        });

    } catch (error) {
        console.error("Cancel Challan Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};