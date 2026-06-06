export type User = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    [key: string]: unknown;
};

export type AccountUser = User & {
    email_verified_at: string | null;
    has_password: boolean;
    is_sso_only: boolean;
    social_provider: string | null;
};

export type Auth = {
    user: User | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
