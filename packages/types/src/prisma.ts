import { Prisma } from '@sbp/prisma';

export type User = Prisma.UserGetPayload<{}>;
export type NotificationSettings = Prisma.NotificationSettingsGetPayload<{}>;
