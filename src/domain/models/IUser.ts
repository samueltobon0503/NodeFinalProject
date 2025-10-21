export interface IUser {
    name: string,
    lastName: string,
    email: string,
    password: string,
    userName: string,
    isAdmin: boolean,
    createdAt: Date
    active: boolean,
    failedAttempts?: number;
    lockUntil?: Date | null;
    verified: boolean;
    verificationToken?: string;
}
