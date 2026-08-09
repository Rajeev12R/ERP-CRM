import prisma from "../config/prisma.js";

export const createCustomer = async (req, res) => {
    try {
        const {
            name,
            mobile,
            email,
            businessName,
            gstNumber,
            type,
            status,
            address,
            followUpDate,
            notes
        } = req.body;

        if (!name || !mobile || !type || !address) {
            return res.status(400).json({
                success: false,
                message: "Name, mobile, type and address are required"
            });
        }

        const mobileRegex = /^[0-9]{10,15}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({ success: false, message: "Invalid mobile format" });
        }

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ success: false, message: "Invalid email format" });
            }
        }

        if (gstNumber) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstRegex.test(gstNumber)) {
                return res.status(400).json({ success: false, message: "Invalid GST format" });
            }
        }

        const allowedTypes = ["RETAIL", "WHOLESALE", "DISTRIBUTOR"];
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ success: false, message: "Invalid customer type" });
        }

        if (status) {
            const allowedStatuses = ["LEAD", "ACTIVE", "INACTIVE"];
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({ success: false, message: "Invalid customer status" });
            }
        }

        const customer = await prisma.customer.create({
            data: {
                name,
                mobile,
                email,
                businessName,
                gstNumber,
                type,
                status: status || "LEAD",
                address,
                followUpDate: followUpDate
                    ? new Date(followUpDate)
                    : null,
                notes
            }
        });

        return res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: customer
        });

    } catch (error) {
        console.error("Create Customer Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getCustomers = async (req, res) => {
    try {
        const {
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

        const skip = (pageNumber - 1) * limitNumber;

        const where = search ? 
        {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    mobile: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    email: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    businessName: {
                        contains: search,
                        mode: "insensitive"
                    }
                }
            ]
        }
        : {};

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                skip,
                take: limitNumber,
                orderBy: {
                    createdAt: "desc"
                }
            }),

            prisma.customer.count({
                where
            })
        ]);

        return res.status(200).json({
            success: true,
            data: customers,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                totalPages: Math.ceil(total / limitNumber)
            }
        });
        
    } catch (error) {
    console.error("Get Customers Error:", error);

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}
}

export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        const customerId = Number(id);

        if (!Number.isInteger(customerId) || customerId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID"
            });
        }
        const customer = await prisma.customer.findUnique({
            where: {
                id: customerId
            }
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: customer
        });
        
    } catch (error) {
        console.error("Get Customer Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const customerId = Number(id);

        if (!Number.isInteger(customerId) || customerId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID"
            });
        }

        const {
            name,
            mobile,
            email,
            businessName,
            gstNumber,
            type,
            status,
            address,
            followUpDate,
            notes
        } = req.body;

        const existingCustomer = await prisma.customer.findUnique({
            where: {
                id: customerId
            }
        });

        if (!existingCustomer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        if (mobile) {
            const mobileRegex = /^[0-9]{10,15}$/;
            if (!mobileRegex.test(mobile)) {
                return res.status(400).json({ success: false, message: "Invalid mobile format" });
            }
        }

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ success: false, message: "Invalid email format" });
            }
        }

        if (gstNumber) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstRegex.test(gstNumber)) {
                return res.status(400).json({ success: false, message: "Invalid GST format" });
            }
        }

        if (type) {
            const allowedTypes = ["RETAIL", "WHOLESALE", "DISTRIBUTOR"];
            if (!allowedTypes.includes(type)) {
                return res.status(400).json({ success: false, message: "Invalid customer type" });
            }
        }

        if (status) {
            const allowedStatuses = ["LEAD", "ACTIVE", "INACTIVE"];
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({ success: false, message: "Invalid customer status" });
            }
        }

        const customer = await prisma.customer.update({
            where: {
                id: customerId
            },
            data: {
                name,
                mobile,
                email,
                businessName,
                gstNumber,
                type,
                status,
                address,
                followUpDate: followUpDate
                    ? new Date(followUpDate)
                    : null,
                notes
            }
        });

        return res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: customer
        });

    } catch (error) {
        console.error("Update Customer Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const addFollowUp = async (req, res) => {
    try {
        const { id } = req.params;
        const { note, followUpAt } = req.body;

        const customerId = Number(id);

        if (!Number.isInteger(customerId) || customerId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID"
            });
        }

        if (!note) {
            return res.status(400).json({
                success: false,
                message: "Follow-up note is required"
            });
        }

        const customer = await prisma.customer.findUnique({
            where: {
                id: customerId
            }
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const followUp = await prisma.followUp.create({
            data: {
                customerId,
                createdBy: req.user.userId,
                note,
                followUpAt: followUpAt
                    ? new Date(followUpAt)
                    : new Date()
            }
        });

        return res.status(201).json({
            success: true,
            message: "Follow-up added successfully",
            data: followUp
        });

    } catch (error) {
        console.error("Add Follow-up Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};