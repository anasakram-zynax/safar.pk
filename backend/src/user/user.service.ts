import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from '@prisma/client';

interface CreateUserData {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
}

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {
                email: email.toLowerCase(),
            },
        });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: {
                id,
            },
        });
    }

    async createCustomer(data: CreateUserData) {
        return this.prisma.user.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email.toLowerCase(),
                passwordHash: data.passwordHash,

                // Public registration can ONLY create customers.
                role: UserRole.CUSTOMER,
            },
        });
    }
}